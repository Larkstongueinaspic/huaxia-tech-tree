#!/usr/bin/env python3
"""
infer_edges.py — 基于年代+分类推断 outEdges（前置依赖关系）
规则:
  1. 同分类内: 年代早的 → 年代晚的（500年窗口）
  2. 跨分类依赖: 特定分类间存在技术传承
  3. 根节点保护: year < -2000 的节点不设置 outEdges
输出: output/wiki_with_edges.json
"""

import json
from pathlib import Path

OUTPUT_DIR = Path(__file__).parent / "output"

TIME_WINDOW = 500
ROOT_CUTOFF_YEAR = -2000

CROSS_DEPS = {
    "metallurgy": ["military", "engineering"],
    "agriculture": ["trade"],
    "craft": ["trade"],
    "science": ["engineering"],
    "textile": ["trade"],
    "culture": ["science"],
    "metallurgy_craft": ["craft"],
    "agriculture_craft": ["craft"],
}

CATEGORY_IMPORTANCE = {
    "agriculture": 1,
    "craft": 2,
    "metallurgy": 3,
    "textile": 4,
    "culture": 5,
    "science": 6,
    "math": 6,
    "medicine": 7,
    "engineering": 8,
    "military": 8,
    "navigation": 9,
    "trade": 10,
}


def load_parsed() -> list:
    parsed_file = OUTPUT_DIR / "wiki_parsed.json"
    if not parsed_file.exists():
        raise FileNotFoundError(f"未找到 {parsed_file}，请先运行 parse_wiki.py")
    with open(parsed_file, "r", encoding="utf-8") as f:
        return json.load(f)


def has_year(entry: dict) -> bool:
    return entry.get("year") is not None


def infer_same_category(entries: list) -> dict:
    """同分类内按时间序列推断"""
    edges = {e["id"]: [] for e in entries}

    categories = {}
    for e in entries:
        cat = e.get("cat", "unknown")
        if cat not in categories:
            categories[cat] = []
        categories[cat].append(e)

    for cat, cat_entries in categories.items():
        valid = [e for e in cat_entries if has_year(e)]
        valid.sort(key=lambda x: x["year"])

        for i, entry in enumerate(valid):
            if entry["year"] < ROOT_CUTOFF_YEAR:
                continue

            for j in range(i - 1, -1, -1):
                candidate = valid[j]
                if entry["year"] - candidate["year"] <= TIME_WINDOW:
                    edges[entry["id"]].append(candidate["id"])
                else:
                    break

    return edges


def infer_cross_category(entries: list) -> dict:
    """跨分类依赖推断"""
    edges = {e["id"]: [] for e in entries}

    entry_map = {e["id"]: e for e in entries}
    valid_entries = [e for e in entries if has_year(e)]

    for entry in valid_entries:
        if entry["year"] < ROOT_CUTOFF_YEAR:
            continue

        target_cat = entry["cat"]

        for source_cat, target_cats in CROSS_DEPS.items():
            if "_" in source_cat:
                continue
            if target_cat in target_cats:
                for candidate in valid_entries:
                    if candidate["cat"] == source_cat:
                        if 0 < entry["year"] - candidate["year"] <= TIME_WINDOW:
                            if candidate["id"] != entry["id"]:
                                edges[entry["id"]].append(candidate["id"])

    return edges


def merge_and_dedup(same_cat: dict, cross_cat: dict) -> dict:
    merged = {}
    for eid in set(list(same_cat.keys()) + list(cross_cat.keys())):
        combined = list(set(same_cat.get(eid, []) + cross_cat.get(eid, [])))
        merged[eid] = combined
    return merged


def limit_edges(edges: dict, max_per_node: int = 4) -> dict:
    """限制每个节点的 outEdges 数量，防止过度连接"""
    for eid in edges:
        if eid in edges[eid]:
            edges[eid] = [e for e in edges[eid] if e != eid]
        if len(edges[eid]) > max_per_node:
            edges[eid] = edges[eid][:max_per_node]
    return edges


def main():
    print("=== 步骤 3/4: 推断连线关系 ===")

    entries = load_parsed()
    print(f"  加载 {len(entries)} 个条目")

    valid_entries = [e for e in entries if has_year(e)]
    print(f"  其中 {len(valid_entries)} 条有年份数据")

    same_cat_edges = infer_same_category(entries)
    same_count = sum(len(v) for v in same_cat_edges.values())
    print(f"  同分类推断: {same_count} 条连线")

    cross_cat_edges = infer_cross_category(entries)
    cross_count = sum(len(v) for v in cross_cat_edges.values())
    print(f"  跨分类推断: {cross_count} 条连线")

    merged = merge_and_dedup(same_cat_edges, cross_cat_edges)
    merged = limit_edges(merged)

    total = sum(len(v) for v in merged.values())
    print(f"  合并后: {total} 条连线")

    for entry in entries:
        entry["outEdges"] = merged.get(entry["id"], [])
        entry["edge_confidence"] = "inferred" if entry.get("outEdges") else "none"

    output_file = OUTPUT_DIR / "wiki_with_edges.json"
    output_file.write_text(
        json.dumps(entries, ensure_ascii=False, indent=2),
        encoding="utf-8"
    )
    print(f"\n  已保存: {output_file}")

    no_edges = [e for e in entries if not e.get("outEdges")]
    print(f"  无连线的节点: {len(no_edges)} 条")
    return True


if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
