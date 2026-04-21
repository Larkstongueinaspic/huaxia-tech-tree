#!/usr/bin/env python3
"""
build_edge_candidates.py

第一阶段：基于年份、分类和语义重合，为每个节点构建后继候选。
输出文件供 LLM 第二阶段裁决。
"""

from __future__ import annotations

import argparse
from pathlib import Path

from edge_pipeline_utils import (
    MAX_CANDIDATES_PER_NODE,
    build_candidate_groups,
    load_json,
    save_json,
)


SCRIPT_DIR = Path(__file__).parent
OUTPUT_DIR = SCRIPT_DIR / "output"
DEFAULT_INPUT_FILE = OUTPUT_DIR / "final_nodes_examined.json"
DEFAULT_OUTPUT_FILE = OUTPUT_DIR / "edge_candidates.json"


def parse_args():
    parser = argparse.ArgumentParser(description="为节点生成后继候选")
    parser.add_argument("--input", type=Path, default=DEFAULT_INPUT_FILE)
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT_FILE)
    parser.add_argument(
        "--max-candidates",
        type=int,
        default=MAX_CANDIDATES_PER_NODE,
        help="每个节点最多保留多少候选",
    )
    return parser.parse_args()


def main():
    args = parse_args()
    nodes = load_json(args.input)
    candidate_groups = build_candidate_groups(nodes, max_candidates=args.max_candidates)

    candidate_counts = [len(group["candidates"]) for group in candidate_groups]
    payload = {
        "meta": {
            "input_file": str(args.input),
            "node_count": len(nodes),
            "max_candidates_per_node": args.max_candidates,
            "avg_candidates_per_node": round(sum(candidate_counts) / len(candidate_counts), 4)
            if candidate_counts
            else 0,
            "nodes_without_candidates": sum(1 for count in candidate_counts if count == 0),
        },
        "items": candidate_groups,
    }

    save_json(args.output, payload)
    print(f"已保存: {args.output}")
    print(payload["meta"])


if __name__ == "__main__":
    main()
