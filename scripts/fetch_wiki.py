#!/usr/bin/env python3
"""
fetch_wiki.py — 爬取维基百科"中国发明列表"页面（中英文双语）
输出原始 HTML 到 output/ 目录，避免重复请求
"""

import os
import time
import requests
from pathlib import Path

OUTPUT_DIR = Path(__file__).parent / "output"
OUTPUT_DIR.mkdir(exist_ok=True)

URLS = {
    "zh": "https://zh.wikipedia.org/wiki/%E4%B8%AD%E5%9C%8B%E7%99%BC%E6%98%8E",
    "en": "https://en.wikipedia.org/wiki/Chinese_inventions",
    "zh_preshi": "https://zh.wikipedia.org/wiki/%E4%B8%AD%E5%9B%BD%E5%8F%B2%E5%89%8D%E5%8F%91%E6%98%8E%E5%88%97%E8%A1%A8",
    "zh_xianqin": "https://zh.wikipedia.org/wiki/%E4%B8%AD%E5%9B%BD%E5%85%88%E7%A7%A6%E5%8F%91%E6%98%8E%E5%88%97%E8%A1%A8",
    "zh_kexueshi": "https://zh.wikipedia.org/wiki/%E4%B8%AD%E5%9B%BD%E7%A7%91%E5%AD%A6%E5%8F%B2",
    "zh_nongye": "https://zh.wikipedia.org/wiki/%E4%B8%AD%E5%9B%BD%E5%86%9C%E4%B8%9A%E5%8F%B2",
    "zh_yixue": "https://zh.wikipedia.org/wiki/%E4%B8%AD%E5%9B%BD%E5%8C%BB%E5%AD%A6%E5%8F%B2",
    "zh_taoci": "https://zh.wikipedia.org/wiki/%E4%B8%AD%E5%9B%BD%E9%99%B6%E5%99%A8",
    "zh_math": "https://zh.wikipedia.org/wiki/%E4%B8%AD%E5%9B%BD%E6%95%B0%E5%AD%A6%E5%8F%B2",
    "zh_tianwen": "https://zh.wikipedia.org/wiki/%E4%B8%AD%E5%9B%BD%E5%A4%A9%E6%96%87%E5%AD%A6%E5%8F%B2",
    "zh_quyuanli": "https://zh.wikipedia.org/wiki/%E6%9B%B2%E8%BE%95%E7%8A%81",
    "zh_zhiyuanli": "https://zh.wikipedia.org/wiki/%E7%9B%B4%E8%BE%95%E7%8A%81",
    "zh_kanerjing": "https://zh.wikipedia.org/wiki/%E5%9D%8E%E5%85%92%E4%BA%95",
    "zh_tongche": "https://zh.wikipedia.org/wiki/%E7%AD%92%E8%BD%A6",
    "zh_dujiangyan": "https://zh.wikipedia.org/wiki/%E9%83%BD%E6%B1%9F%E5%A0%B0",
    "zh_nongye_nianbiao": "https://zh.wikipedia.org/wiki/%E4%B8%AD%E5%9C%8B%E8%BE%B2%E6%A5%AD%E7%A7%91%E6%8A%80%E5%8F%B2%E5%B9%B4%E8%A1%A8",
    "zh_dongjit": "https://zh.wikipedia.org/wiki/%E5%80%99%E9%A2%A8%E5%9C%B0%E5%8B%95%E5%84%80",
    "zh_huntianyi": "https://zh.wikipedia.org/wiki/%E6%B5%91%E8%B1%A1",
    "zh_shuimoyixiangtai": "https://zh.wikipedia.org/wiki/%E6%B0%B4%E9%81%8B%E5%84%80%E8%B1%A1%E5%8F%B0",
    "zh_zhinanche": "https://zh.wikipedia.org/wiki/%E6%8C%87%E5%8D%97%E8%BD%A6",
    "zh_nuji": "https://zh.wikipedia.org/wiki/%E5%BC%93%E6%9C%BA",
    "zh_muniuliuma": "https://zh.wikipedia.org/wiki/%E6%9C%A8%E7%89%9B%E6%B5%81%E9%A9%AC",
}

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
}

MAX_RETRIES = 3
RETRY_DELAY = 5


def fetch_url(url: str, lang: str) -> str:
    output_file = OUTPUT_DIR / f"wiki_{lang}_raw.html"

    if output_file.exists():
        print(f"  [{lang}] 已存在缓存: {output_file}")
        return output_file.read_text(encoding="utf-8")

    for attempt in range(MAX_RETRIES):
        try:
            print(f"  [{lang}] 正在请求: {url}")
            resp = requests.get(url, headers=HEADERS, timeout=30)
            resp.raise_for_status()
            output_file.write_text(resp.text, encoding="utf-8")
            print(f"  [{lang}] 成功，已保存: {output_file} ({len(resp.text)} 字节)")
            return resp.text
        except requests.RequestException as e:
            print(f"  [{lang}] 请求失败 (尝试 {attempt+1}/{MAX_RETRIES}): {e}")
            if attempt < MAX_RETRIES - 1:
                time.sleep(RETRY_DELAY)
    raise RuntimeError(f"[{lang}] 请求失败，已重试 {MAX_RETRIES} 次")


def main():
    print("=== 步骤 1/4: 爬取维基百科 ===")
    for lang, url in URLS.items():
        try:
            fetch_url(url, lang)
        except RuntimeError as e:
            print(f"  警告: {e}")
            print(f"  将仅使用已有缓存或跳过该语言版本")

    cached = [f.name for f in OUTPUT_DIR.glob("wiki_*_raw.html")]
    if not cached:
        print("  错误: 未获取到任何页面，请检查网络连接")
        return False

    print(f"\n  已获取: {', '.join(cached)}")
    return True


if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
