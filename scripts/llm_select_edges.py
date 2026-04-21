#!/usr/bin/env python3
"""
llm_select_edges.py

第二阶段：从候选边中选出最终 outEdges。

支持三种模式：
  - heuristic: 只用启发式打分筛选
  - llm: 只用 LLM 裁决
  - hybrid: 优先 LLM，失败时退回 heuristic
"""

from __future__ import annotations

import argparse
import json
import os
import re
import time
from pathlib import Path

try:
    from tqdm import tqdm
except ImportError:  # pragma: no cover - optional at runtime
    def tqdm(iterable, **kwargs):
        return iterable

try:
    import openai
except ImportError:  # pragma: no cover - optional at runtime
    openai = None

from edge_pipeline_utils import (
    MAX_OUT_EDGES,
    apply_edges_to_nodes,
    build_candidate_lookup,
    cap_out_edges,
    load_json,
    normalize_edges,
    remove_cycles,
    save_json,
    summarize_edges,
    transitive_reduction,
)


SCRIPT_DIR = Path(__file__).parent
OUTPUT_DIR = SCRIPT_DIR / "output"
DEFAULT_NODES_FILE = OUTPUT_DIR / "final_nodes_examined.json"
DEFAULT_CANDIDATES_FILE = OUTPUT_DIR / "edge_candidates.json"
DEFAULT_SELECTION_FILE = OUTPUT_DIR / "edge_selections.json"
DEFAULT_FINAL_FILE = OUTPUT_DIR / "final_nodes_with_edges.json"
DEFAULT_REPORT_FILE = OUTPUT_DIR / "edge_selection_report.json"

BASE_URL = os.getenv("OPENAI_BASE_URL", "https://api.deepseek.com")
API_KEY = "sk-36e7e3720a8643c8a55a72f85801241e"
MODEL = os.getenv("LLM_MODEL", "deepseek-chat")
REQUEST_INTERVAL_SECONDS = float(os.getenv("LLM_REQUEST_INTERVAL", "1.0"))
SAVE_EVERY_N_ITEMS = 10

SYSTEM_PROMPT = """You are a graph curation assistant for the history of Chinese science and technology.
You must choose direct successor nodes for one source node from a prefiltered candidate list.

Graph direction:
- source -> target
- This means the source is an earlier foundation, direct precursor, enabling technique, or immediate ancestor of the target.

Selection rules:
1. Only choose from the provided candidate list.
2. A target must be a plausible direct successor, not merely a related or distant descendant topic.
3. Prefer immediate steps over remote descendants.
4. Same-category successors are usually stronger than cross-category successors.
5. Cross-category links are allowed only when dependency is concrete and historically plausible.
6. You may return 0, 1, 2, or 3 targets. Fewer is better than over-linking.
7. Do not force exactly 3 results.

You must return only a JSON object with exactly these keys:
{"source_id":"...", "selected_ids":["id1","id2"]}
"""


def parse_args():
    parser = argparse.ArgumentParser(description="从候选边中筛选最终 outEdges")
    parser.add_argument("--nodes", type=Path, default=DEFAULT_NODES_FILE)
    parser.add_argument("--candidates", type=Path, default=DEFAULT_CANDIDATES_FILE)
    parser.add_argument("--selection-output", type=Path, default=DEFAULT_SELECTION_FILE)
    parser.add_argument("--final-output", type=Path, default=DEFAULT_FINAL_FILE)
    parser.add_argument("--report-output", type=Path, default=DEFAULT_REPORT_FILE)
    parser.add_argument(
        "--mode",
        choices=["heuristic", "llm", "hybrid"],
        default="hybrid",
        help="筛选模式",
    )
    parser.add_argument(
        "--limit",
        type=int,
        default=None,
        help="仅处理前 N 个 source，方便测试",
    )
    return parser.parse_args()


def heuristic_select(group: dict, max_out_edges: int = MAX_OUT_EDGES) -> list[str]:
    candidates = group["candidates"]
    same = [item for item in candidates if item["relation_type"] == "same_category"]
    cross = [item for item in candidates if item["relation_type"] != "same_category"]

    selected = []

    for index, item in enumerate(same):
        has_semantic_signal = item["shared_terms_count"] > 0 or item["mention_bonus"] > 0
        if has_semantic_signal and item["score"] >= 4.0:
            selected.append(item["id"])
        elif index == 0 and item["score"] >= 4.8:
            selected.append(item["id"])
        if len(selected) >= 2:
            break

    for item in cross:
        if item["score"] >= 4.4 and (item["shared_terms_count"] >= 1 or item["mention_bonus"] > 0):
            selected.append(item["id"])
            break

    if not selected and candidates:
        top = candidates[0]
        if top["score"] >= 5.2 and (top["shared_terms_count"] > 0 or top["mention_bonus"] > 0):
            selected.append(top["id"])

    deduped = []
    seen = set()
    for target_id in selected:
        if target_id in seen:
            continue
        deduped.append(target_id)
        seen.add(target_id)

    return deduped[:max_out_edges]


def parse_json_object(text: str) -> dict:
    match = re.search(r"\{[\s\S]*\}", text)
    if not match:
        raise ValueError("模型返回中未找到 JSON 对象")
    return json.loads(match.group())


def llm_select_group(client, group: dict) -> list[str]:
    source = group["source"]
    payload = {
        "source": source,
        "candidates": [
            {
                "id": item["id"],
                "name": item["name"],
                "year": item["year"],
                "cat": item["cat"],
                "sig": item["sig"],
                "year_gap": item["year_gap"],
                "relation_type": item["relation_type"],
                "shared_terms": item["shared_terms"],
                "candidate_score": item["score"],
                "candidate_reasons": item["reasons"],
            }
            for item in group["candidates"]
        ],
    }

    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": json.dumps(payload, ensure_ascii=False, indent=2)},
        ],
        response_format={"type": "json_object"},
        temperature=0.2,
        max_tokens=300,
    )

    model_reply = response.choices[0].message.content.strip()
    parsed = parse_json_object(model_reply)
    selected_ids = parsed.get("selected_ids", [])
    if not isinstance(selected_ids, list):
        raise ValueError("selected_ids 不是数组")

    allowed_ids = {item["id"] for item in group["candidates"]}
    cleaned = [target_id for target_id in selected_ids if target_id in allowed_ids]
    return cleaned[:MAX_OUT_EDGES]


def finalize_outputs(
    nodes: list[dict],
    candidate_payload: dict,
    selections: list[dict],
    selection_output: Path,
    final_output: Path,
    report_output: Path,
):
    candidate_lookup = build_candidate_lookup(candidate_payload["items"])
    selection_map = {item["source_id"]: item["selected_ids"] for item in selections}

    normalized = normalize_edges(nodes, selection_map, candidate_lookup)
    acyclic = remove_cycles(normalized, candidate_lookup)
    reduced = transitive_reduction(acyclic)
    capped = cap_out_edges(reduced, candidate_lookup, MAX_OUT_EDGES)

    final_nodes = apply_edges_to_nodes(nodes, capped)
    report = summarize_edges(nodes, capped)
    report["selection_count"] = len(selections)
    report["llm_count"] = sum(1 for item in selections if item["method"] == "llm")
    report["heuristic_count"] = sum(1 for item in selections if item["method"] == "heuristic")
    report["selection_output"] = str(selection_output)
    report["final_output"] = str(final_output)

    save_json(selection_output, {"meta": report, "items": selections})
    save_json(final_output, final_nodes)
    save_json(report_output, report)

    return report


def main():
    args = parse_args()
    nodes = load_json(args.nodes)
    candidate_payload = load_json(args.candidates)
    groups = candidate_payload["items"]
    if args.limit is not None:
        groups = groups[: args.limit]

    client = None
    if args.mode in {"llm", "hybrid"} and API_KEY:
        if openai is None:
            raise RuntimeError("未安装 openai，无法使用 llm/hybrid 模式")
        client = openai.OpenAI(api_key=API_KEY, base_url=BASE_URL)
    elif args.mode == "llm" and not API_KEY:
        raise RuntimeError("llm 模式需要设置 DEEPSEEK_API_KEY 或 OPENAI_API_KEY")

    selections = []

    for idx, group in enumerate(tqdm(groups), start=1):
        method = "heuristic"
        selected_ids = []

        if args.mode in {"llm", "hybrid"} and client and group["candidates"]:
            try:
                selected_ids = llm_select_group(client, group)
                method = "llm"
            except Exception as exc:
                if args.mode == "llm":
                    raise
                print(f"LLM 失败，退回启发式: {group['source']['name']} -> {exc}")
                selected_ids = heuristic_select(group)
                method = "heuristic"
        else:
            selected_ids = heuristic_select(group)
            method = "heuristic"

        selections.append(
            {
                "source_id": group["source"]["id"],
                "source_name": group["source"]["name"],
                "selected_ids": selected_ids,
                "method": method,
            }
        )

        if idx % SAVE_EVERY_N_ITEMS == 0:
            report = finalize_outputs(
                nodes=nodes,
                candidate_payload=candidate_payload,
                selections=selections,
                selection_output=args.selection_output,
                final_output=args.final_output,
                report_output=args.report_output,
            )
            print(f"已保存中间结果: {report}")

        if method == "llm":
            time.sleep(REQUEST_INTERVAL_SECONDS)

    report = finalize_outputs(
        nodes=nodes,
        candidate_payload=candidate_payload,
        selections=selections,
        selection_output=args.selection_output,
        final_output=args.final_output,
        report_output=args.report_output,
    )
    print("最终报告:")
    print(json.dumps(report, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
