#!/usr/bin/env python3
"""
edge_pipeline_utils.py

连边流程共享工具：
1. 候选边打分
2. 术语提取
3. 后处理（合法性、去环、传递约简）
"""

from __future__ import annotations

import json
import math
import re
from collections import defaultdict, deque
from pathlib import Path


MAX_OUT_EDGES = 3
MAX_CANDIDATES_PER_NODE = 8

# 方向定义：source -> target，source 是 target 的前驱/基础
CROSS_CATEGORY_ALLOWLIST = {
    "metallurgy": {"military", "engineering", "agriculture", "craft"},
    "agriculture": {"engineering", "textile", "trade"},
    "craft": {"culture", "trade", "textile", "military"},
    "science": {"engineering", "navigation", "medicine"},
    "math": {"science", "engineering"},
    "textile": {"trade", "craft"},
    "navigation": {"trade", "engineering"},
    "military": {"science", "engineering"},
    "culture": {"craft"},
}

GENERIC_STOP_TERMS = {
    "中国",
    "中国古代",
    "古代",
    "古代中",
    "古代中国",
    "发明",
    "技术",
    "重要",
    "历史",
    "发展",
    "推动",
    "促进",
    "体现",
    "提高",
    "应用",
    "时期",
    "工匠",
    "汉朝",
    "唐朝",
    "宋朝",
    "明朝",
    "清朝",
    "中国古",
    "代重",
    "术发",
    "发明",
    "重要发",
    "推动古",
    "代中",
    "古代技",
    "用于",
    "利用",
    "发明之",
    "古代发",
    "中国传",
    "中国古代",
    "世界首",
    "之一",
}

GENERIC_STOP_SUBSTRINGS = {
    "中国",
    "古代",
    "发明",
    "技术",
    "发展",
    "推动",
    "促进",
    "体现",
    "记载",
    "应用",
    "时期",
    "工匠",
    "历史",
    "重要",
    "早期",
    "用于",
    "利用",
    "世界",
    "成熟",
    "传播",
    "文化",
    "效率",
    "影响",
    "提升",
    "改进",
    "设计",
    "关键",
    "最早",
    "起源",
    "唐代",
    "宋代",
    "元朝",
    "明朝",
    "清朝",
    "汉朝",
    "东汉",
    "西汉",
    "三国",
    "战国",
    "北宋",
    "南宋",
}

CHINESE_RE = re.compile(r"[\u4e00-\u9fff]{2,}")
ENGLISH_RE = re.compile(r"[A-Za-z]{3,}")


def load_json(path: Path):
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def save_json(path: Path, data):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def allowed_relation(source_cat: str, target_cat: str) -> str | None:
    if source_cat == target_cat:
        return "same_category"
    if target_cat in CROSS_CATEGORY_ALLOWLIST.get(source_cat, set()):
        return "cross_category"
    return None


def year_score(gap: int) -> float:
    if gap < 0:
        return -999.0
    if gap == 0:
        return 1.4
    if gap <= 100:
        return 1.25
    if gap <= 300:
        return 1.1
    if gap <= 700:
        return 0.85
    if gap <= 1500:
        return 0.6
    if gap <= 3000:
        return 0.35
    return 0.15


def _extract_chinese_ngrams(text: str, min_n: int = 2, max_n: int = 4) -> set[str]:
    normalized_text = text or ""
    for marker in sorted(GENERIC_STOP_SUBSTRINGS, key=len, reverse=True):
        normalized_text = normalized_text.replace(marker, " ")

    results = set()
    for seq in CHINESE_RE.findall(normalized_text):
        seq = seq[:24]
        for n in range(min_n, min(max_n, len(seq)) + 1):
            for i in range(len(seq) - n + 1):
                term = seq[i : i + n]
                if term in GENERIC_STOP_TERMS:
                    continue
                if any(marker in term for marker in GENERIC_STOP_SUBSTRINGS):
                    continue
                results.add(term)
    return results


def _extract_english_terms(text: str) -> set[str]:
    return {
        token.lower()
        for token in ENGLISH_RE.findall(text or "")
        if token.lower() not in {"ancient", "chinese", "technology", "system", "dynasty"}
    }


def extract_focus_terms(node: dict) -> set[str]:
    name = node.get("name", "")
    en = node.get("en", "")
    sig = node.get("sig", "")

    terms = set()
    terms.update(_extract_chinese_ngrams(name, 2, 4))
    terms.update(_extract_chinese_ngrams(sig, 2, 4))
    terms.update(_extract_english_terms(en))
    return terms


def overlap_terms(source: dict, target: dict) -> list[str]:
    shared = extract_focus_terms(source) & extract_focus_terms(target)
    return sorted(shared, key=lambda item: (-len(item), item))[:6]


def semantic_score(shared_terms: list[str]) -> float:
    score = 0.0
    for term in shared_terms[:5]:
        score += min(len(term), 4) * 0.35
    return min(score, 2.6)


def direct_mention_bonus(source: dict, target: dict) -> float:
    source_name = source.get("name", "")
    target_name = target.get("name", "")
    source_text = f"{source.get('sig', '')} {source.get('desc', '')}"
    target_text = f"{target.get('sig', '')} {target.get('desc', '')}"

    bonus = 0.0
    if source_name and source_name in target_text:
        bonus += 0.8
    if target_name and target_name in source_text:
        bonus += 0.8
    return min(bonus, 1.2)


def allow_semantic_exception(source: dict, target: dict, shared_terms: list[str], gap: int) -> bool:
    if gap > 1500:
        return False
    if len(shared_terms) >= 3:
        return True
    if len(shared_terms) >= 2 and direct_mention_bonus(source, target) > 0:
        return True
    return False


def score_pair(source: dict, target: dict) -> dict | None:
    if source["id"] == target["id"]:
        return None

    gap = target["year"] - source["year"]
    if gap < 0:
        return None

    relation_type = allowed_relation(source["cat"], target["cat"])
    shared = overlap_terms(source, target)
    mention = direct_mention_bonus(source, target)

    if relation_type is None:
        if allow_semantic_exception(source, target, shared, gap):
            relation_type = "semantic_exception"
        else:
            return None

    relation_bonus = {
        "same_category": 2.8,
        "cross_category": 1.1,
        "semantic_exception": 0.75,
    }[relation_type]

    time_component = year_score(gap)
    semantic_component = semantic_score(shared)

    score = relation_bonus + time_component + semantic_component + mention

    if relation_type != "same_category" and gap > 2000:
        score -= 0.25

    if relation_type == "semantic_exception" and score < 3.0:
        return None

    reasons = []
    if relation_type == "same_category":
        reasons.append("same category")
    elif relation_type == "cross_category":
        reasons.append(f"allowed cross-category {source['cat']} -> {target['cat']}")
    else:
        reasons.append("semantic exception")

    reasons.append(f"year gap {gap}")
    if shared:
        reasons.append("shared terms: " + ", ".join(shared[:4]))
    if mention > 0:
        reasons.append("direct mention bonus")

    return {
        "id": target["id"],
        "name": target["name"],
        "year": target["year"],
        "cat": target["cat"],
        "sig": target.get("sig", ""),
        "score": round(score, 4),
        "year_gap": gap,
        "relation_type": relation_type,
        "shared_terms": shared,
        "shared_terms_count": len(shared),
        "time_score": round(time_component, 4),
        "semantic_score": round(semantic_component, 4),
        "mention_bonus": round(mention, 4),
        "reasons": reasons,
    }


def build_candidate_groups(nodes: list[dict], max_candidates: int = MAX_CANDIDATES_PER_NODE) -> list[dict]:
    groups = []
    by_category = defaultdict(list)
    for node in nodes:
        by_category[node["cat"]].append(node)
    for items in by_category.values():
        items.sort(key=lambda item: (item["year"], item["id"]))

    for source in nodes:
        scored = []
        same_cat_future_ids = [
            node["id"]
            for node in by_category[source["cat"]]
            if node["id"] != source["id"] and node["year"] >= source["year"]
        ]
        same_cat_rank = {target_id: rank for rank, target_id in enumerate(same_cat_future_ids)}

        for target in nodes:
            candidate = score_pair(source, target)
            if candidate is None:
                continue
            if candidate["relation_type"] == "same_category":
                no_semantic_signal = (
                    candidate["shared_terms_count"] == 0 and candidate["mention_bonus"] == 0
                )
                if no_semantic_signal and same_cat_rank.get(candidate["id"], 999) > 1:
                    continue
            else:
                no_cross_signal = (
                    candidate["shared_terms_count"] == 0 and candidate["mention_bonus"] == 0
                )
                if no_cross_signal:
                    continue
            scored.append(candidate)

        scored.sort(key=lambda item: (-item["score"], item["year_gap"], item["year"], item["id"]))

        same = [item for item in scored if item["relation_type"] == "same_category"][:4]
        cross = [item for item in scored if item["relation_type"] != "same_category"][:3]

        merged = same + cross
        seen = set()
        deduped = []
        for item in merged + scored:
            if item["id"] in seen:
                continue
            if item["score"] < 2.45:
                continue
            deduped.append(item)
            seen.add(item["id"])
            if len(deduped) >= max_candidates:
                break

        groups.append(
            {
                "source": {
                    "id": source["id"],
                    "name": source["name"],
                    "year": source["year"],
                    "cat": source["cat"],
                    "sig": source.get("sig", ""),
                },
                "candidates": deduped,
            }
        )
    return groups


def build_candidate_lookup(candidate_groups: list[dict]) -> dict[str, dict[str, dict]]:
    lookup: dict[str, dict[str, dict]] = {}
    for group in candidate_groups:
        lookup[group["source"]["id"]] = {
            candidate["id"]: candidate for candidate in group["candidates"]
        }
    return lookup


def reachable(adjacency: dict[str, list[str]], start: str, goal: str) -> bool:
    if start == goal:
        return True
    visited = {start}
    queue = deque([start])
    while queue:
        node = queue.popleft()
        for nxt in adjacency.get(node, []):
            if nxt == goal:
                return True
            if nxt in visited:
                continue
            visited.add(nxt)
            queue.append(nxt)
    return False


def normalize_edges(
    nodes: list[dict],
    edges_by_source: dict[str, list[str]],
    candidate_lookup: dict[str, dict[str, dict]],
) -> dict[str, list[str]]:
    by_id = {node["id"]: node for node in nodes}
    normalized = defaultdict(list)

    for source_id, targets in edges_by_source.items():
        if source_id not in by_id:
            continue
        source = by_id[source_id]
        seen = set()
        for target_id in targets:
            if target_id in seen or target_id == source_id or target_id not in by_id:
                continue
            target = by_id[target_id]
            if target["year"] < source["year"]:
                continue
            seen.add(target_id)
            normalized[source_id].append(target_id)

    # 按候选分数和年份排序，保证后续去环/裁剪稳定
    for source_id, targets in normalized.items():
        targets.sort(
            key=lambda target_id: (
                -candidate_lookup.get(source_id, {}).get(target_id, {}).get("score", 0.0),
                by_id[target_id]["year"] - by_id[source_id]["year"],
                target_id,
            )
        )

    return dict(normalized)


def remove_cycles(
    edges_by_source: dict[str, list[str]],
    candidate_lookup: dict[str, dict[str, dict]],
) -> dict[str, list[str]]:
    adjacency: dict[str, list[str]] = defaultdict(list)

    weighted_edges = []
    for source_id, targets in edges_by_source.items():
        for target_id in targets:
            score = candidate_lookup.get(source_id, {}).get(target_id, {}).get("score", 0.0)
            gap = candidate_lookup.get(source_id, {}).get(target_id, {}).get("year_gap", 999999)
            weighted_edges.append((source_id, target_id, score, gap))

    weighted_edges.sort(key=lambda item: (-item[2], item[3], item[0], item[1]))

    for source_id, target_id, _, _ in weighted_edges:
        if reachable(adjacency, target_id, source_id):
            continue
        adjacency[source_id].append(target_id)

    return dict(adjacency)


def transitive_reduction(adjacency: dict[str, list[str]]) -> dict[str, list[str]]:
    reduced = {source: list(targets) for source, targets in adjacency.items()}

    def reachable_without_edge(source: str, goal: str, blocked_target: str) -> bool:
        visited = {source}
        queue = deque([source])
        while queue:
            node = queue.popleft()
            for nxt in reduced.get(node, []):
                if node == source and nxt == blocked_target:
                    continue
                if nxt == goal:
                    return True
                if nxt in visited:
                    continue
                visited.add(nxt)
                queue.append(nxt)
        return False

    for source, targets in list(reduced.items()):
        filtered = []
        for target in targets:
            if reachable_without_edge(source, target, target):
                continue
            filtered.append(target)
        reduced[source] = filtered

    return reduced


def cap_out_edges(
    adjacency: dict[str, list[str]],
    candidate_lookup: dict[str, dict[str, dict]],
    max_out_edges: int = MAX_OUT_EDGES,
) -> dict[str, list[str]]:
    capped = {}
    for source_id, targets in adjacency.items():
        ordered = sorted(
            targets,
            key=lambda target_id: (
                -candidate_lookup.get(source_id, {}).get(target_id, {}).get("score", 0.0),
                candidate_lookup.get(source_id, {}).get(target_id, {}).get("year_gap", 999999),
                target_id,
            ),
        )
        capped[source_id] = ordered[:max_out_edges]
    return capped


def apply_edges_to_nodes(nodes: list[dict], edges_by_source: dict[str, list[str]]) -> list[dict]:
    applied = []
    for node in nodes:
        clone = dict(node)
        clone["outEdges"] = edges_by_source.get(node["id"], [])
        applied.append(clone)
    return applied


def summarize_edges(nodes: list[dict], edges_by_source: dict[str, list[str]]) -> dict:
    count = sum(len(targets) for targets in edges_by_source.values())
    zero_out = sum(1 for node in nodes if not edges_by_source.get(node["id"]))
    return {
        "node_count": len(nodes),
        "edge_count": count,
        "zero_out_degree_nodes": zero_out,
        "avg_out_degree": round(count / len(nodes), 4) if nodes else 0,
        "max_out_degree": max((len(targets) for targets in edges_by_source.values()), default=0),
    }
