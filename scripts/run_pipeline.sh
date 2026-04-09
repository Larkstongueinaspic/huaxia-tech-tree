#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

echo "=========================================="
echo " 华夏科技树数据重写流水线"
echo "=========================================="
echo ""

echo "[1/3] 爬取维基百科..."
python3 fetch_wiki.py
echo ""

echo "[2/3] 解析 HTML..."
python3 parse_wiki.py
echo ""

echo "[3/3] 验证并导出..."
python3 validate_and_export.py
echo ""

echo "=========================================="
echo " 流水线完成"
echo "=========================================="
echo ""
echo "审核文件: output/final_nodes.csv"
echo "导入文件: output/final_nodes.json"
echo "验证报告: output/validation_report.txt"
echo ""
echo "审核无误后，将 final_nodes.json 复制到 server/data/nodes.json"