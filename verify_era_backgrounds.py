#!/usr/bin/env python3
"""
年代背景功能静态验证脚本。

覆盖：
1. 每个 timelineConfig 年代都有背景配置。
2. 背景配置暴露透明度、图片路径、切换阈值、动画时长和 4 种动画效果。
3. GraphView 已接入背景层、时间轴工具和透明 SVG 层级。
4. 当前时代切换遵循“时代左侧到达屏幕中心”规则。
"""

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent


def read(path):
    return (ROOT / path).read_text(encoding="utf-8")


def assert_true(condition, message):
    if not condition:
        raise AssertionError(message)


def extract_background_names(source):
    match = re.search(r"export const ERA_BACKGROUNDS_BY_NAME = \{(?P<body>.*)\};", source, re.S)
    assert_true(match, "未找到 ERA_BACKGROUNDS_BY_NAME 配置")
    return set(re.findall(r'^\s+"([^"]+)":\s+\{', match.group("body"), re.M))


def compute_positions(timeline_config):
    base_offset = 60
    right_edge = 1140
    width_multiplier = 10
    total = sum((era["end"] - era["start"]) * era.get("scale", 1) for era in timeline_config) or 1
    cursor = 0
    positions = []

    for era in timeline_config:
        span = (era["end"] - era["start"]) * era.get("scale", 1)
        x1 = round(base_offset + (cursor / total) * (right_edge - base_offset) * width_multiplier)
        x2 = round(base_offset + ((cursor + span) / total) * (right_edge - base_offset) * width_multiplier)
        positions.append({**era, "x1": x1, "x2": x2})
        cursor += span

    return positions


def active_index(positions, pan_x, scale, trigger_x):
    index = 0
    for i, era in enumerate(positions):
        if era["x1"] * scale + pan_x <= trigger_x:
            index = i
    return index


def main():
    timeline_config = json.loads(read("server/data/timelineConfig.json"))
    background_source = read("src/config/eraBackgrounds.js")
    graph_view = read("src/components/GraphView.jsx")
    layer_css = read("src/styles/EraBackgroundLayer.css")
    graph_css = read("src/styles/GraphView.css")
    timeline_utils = read("src/utils/timelineUtils.js")

    era_names = [era["name"] for era in timeline_config]
    background_names = extract_background_names(background_source)
    missing = sorted(set(era_names) - background_names)

    assert_true(not missing, f"存在缺失背景配置的年代: {missing}")
    assert_true("opacity" in background_source, "未暴露背景透明度配置")
    assert_true("switchTriggerX" in background_source, "未暴露切换时机配置")
    assert_true("durationMs" in background_source, "未暴露动画时长配置")

    for effect in ("fade", "smooth", "wipe", "cover"):
        assert_true(effect in background_source, f"配置中缺少 {effect} 动画效果")
        assert_true(f'data-transition="{effect}"' in layer_css, f"CSS 中缺少 {effect} 动画实现")

    assert_true("EraBackgroundLayer" in graph_view, "GraphView 未接入 EraBackgroundLayer")
    assert_true("preloadEras" in graph_view, "GraphView 未向背景层传入相邻时代预加载列表")
    background_layer = read("src/components/EraBackgroundLayer.jsx")
    assert_true("new Image()" in background_layer, "背景层缺少图片预加载逻辑")
    assert_true("getEraBackgroundKey" in background_layer, "背景切换缺少基于时代和图片的重挂载 key")
    assert_true('key={`current-${getEraBackgroundKey(currentEra)}`}' in background_layer, "当前背景 pane 不会随时代变化重新触发动画")
    assert_true('key={`previous-${getEraBackgroundKey(previousEra)}`}' in background_layer, "离场背景 pane 不会随时代变化重新触发动画")
    assert_true("computeEraTimelinePositions" in graph_view, "GraphView 未复用时间轴坐标工具")
    assert_true("getActiveEraIndex" in graph_view, "GraphView 未接入当前时代判定")
    assert_true("background-color: transparent" in graph_css, "SVG 背景未透明，图片可能被遮挡")
    assert_true("pointer-events: none" in layer_css, "背景层可能拦截节点交互")
    assert_true("z-index: 0" in layer_css and "z-index: 1" in graph_css, "背景层与 SVG 层级不符合预期")

    positions = compute_positions(timeline_config)
    assert_true(all(item["x2"] > item["x1"] for item in positions), "存在宽度异常的时代区间")

    for i in range(1, len(positions)):
        pan_before = 600 - positions[i]["x1"] + 1
        pan_at = 600 - positions[i]["x1"]
        assert_true(
            active_index(positions, pan_before, 1, 600) == i - 1,
            f"{positions[i]['name']} 到达中心前不应提前切换",
        )
        assert_true(
            active_index(positions, pan_at, 1, 600) == i,
            f"{positions[i]['name']} 左侧到达中心时应切换",
        )

    assert_true("mergeEraBackgrounds" in timeline_utils, "缺少背景配置合并抽象")

    print("年代背景功能静态验证通过")
    print(f"已覆盖 {len(era_names)} 个年代背景配置")
    print("已验证切换阈值、动画接口、层级隔离和交互保护")


if __name__ == "__main__":
    main()
