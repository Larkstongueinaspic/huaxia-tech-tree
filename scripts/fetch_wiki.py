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
    # ===== 原有核心页面 =====
    "zh": "https://zh.wikipedia.org/wiki/%E4%B8%AD%E5%9C%8B%E7%99%BC%E6%98%8E",
    "zh_preshi": "https://zh.wikipedia.org/wiki/%E4%B8%AD%E5%9B%BD%E5%8F%B2%E5%89%8D%E5%8F%91%E6%98%8E%E5%88%97%E8%A1%A8",
    "zh_xianqin": "https://zh.wikipedia.org/wiki/%E4%B8%AD%E5%9B%BD%E5%85%88%E7%A7%A6%E5%8F%91%E6%98%8E%E5%88%97%E8%A1%A8",
    "zh_kexueshi": "https://zh.wikipedia.org/wiki/%E4%B8%AD%E5%9B%BD%E7%A7%91%E5%AD%A6%E5%8F%B2",
    "zh_nongye": "https://zh.wikipedia.org/wiki/%E4%B8%AD%E5%9B%BD%E5%86%9C%E4%B8%9A%E5%8F%B2",
    "zh_yixue": "https://zh.wikipedia.org/wiki/%E4%B8%AD%E5%9B%BD%E5%8C%BB%E5%AD%A6%E5%8F%B2",
    "zh_math": "https://zh.wikipedia.org/wiki/%E4%B8%AD%E5%9B%BD%E6%95%B0%E5%AD%A6%E5%8F%B2",
    "zh_tianwen": "https://zh.wikipedia.org/wiki/%E4%B8%AD%E5%9B%BD%E5%A4%A9%E6%96%87%E5%AD%A6%E5%8F%B2",

    # ===== 一、农业与水利 =====
    "lou_che": "https://zh.wikipedia.org/wiki/%E8%80%8F%E8%BD%A6",
    "yao_ma": "https://zh.wikipedia.org/wiki/%E7%A7%8A%E9%A9%AC",
    "shen_geng": "https://zh.wikipedia.org/wiki/%E6%B7%B1%E8%80%96",
    "lun_zuo": "https://zh.wikipedia.org/wiki/%E8%BD%AE%E4%BD%9C",
    "lv_fei": "https://zh.wikipedia.org/wiki/%E7%BB%BF%E8%82%A0",
    "jing_geng": "https://zh.wikipedia.org/wiki/%E7%B2%BE%E8%99%8B%E7%BB%9F%E4%BD%9C",
    "longu_shui": "https://zh.wikipedia.org/wiki/%E9%BE%99%E9%AA%A8%E6%B0%B4%E8%BD%A6",
    "jiaota_shui": "https://zh.wikipedia.org/wiki/%E8%84%9A%E8%B6%9A%E6%B0%B4%E8%BD%A6",
    "niuzhuan_fanche": "https://zh.wikipedia.org/wiki/%E7%89%9B%E8%BD%AC%E7%BF%BB%E8%BD%A6",
    "feng_che": "https://zh.wikipedia.org/wiki/%E9%A3%8E%E8%BD%A6",
    "tiantian": "https://zh.wikipedia.org/wiki/%E6%A2%AF%E7%94%B0",
    "dujiangyan": "https://zh.wikipedia.org/wiki/%E9%83%BD%E6%B1%9F%E5%A0%B0",
    "kanerjing": "https://zh.wikipedia.org/wiki/%E5%9D%8E%E5%85%92%E4%BA%95",
    "shui_pai": "https://zh.wikipedia.org/wiki/%E6%B0%B4%E6%8E%92",

    # ===== 二、机械与工程技术 =====
    "dizhongyi": "https://zh.wikipedia.org/wiki/%E5%9C%B0%E5%8A%A8%E4%BB%AA",
    "huntianyi": "https://zh.wikipedia.org/wiki/%E6%B5%91%E5%A4%A9%E4%BB%AA",
    "shuiy_xiangtai": "https://zh.wikipedia.org/wiki/%E6%B0%B4%E8%BF%90%E4%BB%AA%E8%B1%A1%E5%8F%B0",
    "zhinanche": "https://zh.wikipedia.org/wiki/%E6%8C%87%E5%8D%97%E8%BD%A6",
    "lian_nu": "https://zh.wikipedia.org/wiki/%E8%BF%9E%E5%BC%93",
    "nu_ji": "https://zh.wikipedia.org/wiki/%E5%BC%93%E6%9C%BA",
    "muniuliu": "https://zh.wikipedia.org/wiki/%E6%9C%A8%E7%89%9B%E6%B5%81%E9%A9%AC",
    "hua_lun": "https://zh.wikipedia.org/wiki/%E6%BB%9A%E8%BD%AE",
    "lianza_chuan": "https://zh.wikipedia.org/wiki/%E9%93%8C%E9%93%9C%E4%BC%A0%E5%8A%A8",
    "chilin_chuan": "https://zh.wikipedia.org/wiki/%E9%BD%8F%E8%BD%AE%E4%BC%A0%E5%8A%A8",
    "dulun_che": "https://zh.wikipedia.org/wiki/%E7%8B%AD%E8%BD%A6",
    "shuili_mo": "https://zh.wikipedia.org/wiki/%E6%B0%B4%E7%A3%A8",
    "fengli_mo": "https://zh.wikipedia.org/wiki/%E9%A3%8E%E9%81%8B%E9%BA%BB",

    # ===== 三、建筑与土木工程 =====
    "gong_qiao": "https://zh.wikipedia.org/wiki/%E6%8B%B3%E6%A1%A5",
    "zhaozhou_qiao": "https://zh.wikipedia.org/wiki/%E8%B5%B0%E5%B7%9E%E6%A1%A5",
    "suanmao": "https://zh.wikipedia.org/wiki/%E6%A6%94%E5%8C%8D",
    "dougong": "https://zh.wikipedia.org/wiki/%E6%96%97%E5%8A%A8",
    "cheng_qiang": "https://zh.wikipedia.org/wiki/%E5%9F%8E%E5%9F%8E",
    "gongdian": "https://zh.wikipedia.org/wiki/%E5%AE%AE%E6%94%BE",
    "sihuayuan": "https://zh.wikipedia.org/wiki/%E5%9B%9B%E5%90%88%E9%99%A2",
    "fengshui": "https://zh.wikipedia.org/wiki/%E9%A3%8E%E6%B0%B4",
    "mu_jiegou": "https://zh.wikipedia.org/wiki/%E6%9C%A8%E7%BB%93%E6%9E%84",
    "wanlichang": "https://zh.wikipedia.org/wiki/%E4%B8%87%E9%95%BF%E5%A4%A7%E5%90%88%E5%9F%8E",
    "jinghang_dahaihe": "https://zh.wikipedia.org/wiki/%E4%BA%AC%E6%96%B0%E5%A4%A7%E8%BF%90%E6%B2%B3",
    "zhan_dao": "https://zh.wikipedia.org/wiki/%E8%B5%8B%E9%81%93",
    "shiban_lu": "https://zh.wikipedia.org/wiki/%E7%9F%B3%E6%9D%BF%E9%80%81",

    # ===== 四、冶金、化学与材料 =====
    "huo_yao": "https://zh.wikipedia.org/wiki/%E7%81%AB%E8%8D%AF",
    "huoyao_peifang": "https://zh.wikipedia.org/wiki/%E7%81%AB%E8%8D%AF%E9%85%8D%E6%96%B9",
    "liuhuang": "https://zh.wikipedia.org/wiki/%E7%A1%99%E9%BB%84",
    "yanjing": "https://zh.wikipedia.org/wiki/%E7%9B%9E%E4%95%95",
    "tianranqi": "https://zh.wikipedia.org/wiki/%E5%A4%A9%E7%84%B6%E6%B0%94",
    "qing_tong": "https://zh.wikipedia.org/wiki/%E9%9D%92%E9%93%9C",
    "tie_qi": "https://zh.wikipedia.org/wiki/%E9%93%9C%E5%99%A8",
    "sheng_tie": "https://zh.wikipedia.org/wiki/%E7%94%9F%E9%93%9C",
    "chao_gang": "https://zh.wikipedia.org/wiki/%E7%82%92%E9%92%A2",
    "ci_qi": "https://zh.wikipedia.org/wiki/%E7%93%A6%E5%99%A8",
    "ci_pa": "https://zh.wikipedia.org/wiki/%E9%99%B4%E5%99%A8",
    "you_liao": "https://zh.wikipedia.org/wiki/%E9%87%89%E6%96%99",
    "qi_qi": "https://zh.wikipedia.org/wiki/%E6%BC%82%E5%99%A8",
    "mo_yi": "https://zh.wikipedia.org/wiki/%E5%A2%A8",

    # ===== 五、纺织与轻工业 =====
    "si_chou": "https://zh.wikipedia.org/wiki/%E7%BB%87%E7%BA%A6",
    "saosiji": "https://zh.wikipedia.org/wiki/%E7%BB%9A%E4%B8%9D%E6%9C%BA",
    "taihua_ji": "https://zh.wikipedia.org/wiki/%E6%8F%90%E8%8A%B1%E6%9C%BA",
    "jiaota_zhi": "https://zh.wikipedia.org/wiki/%E8%84%9A%E8%B6%99%E7%BB%87%E6%9C%BA",
    "mianfang": "https://zh.wikipedia.org/wiki/%E6%A3%89%E7%BA%AF",
    "yin_ran": "https://zh.wikipedia.org/wiki/%E5%8D%B0%E6%9F%93",
    "zha_ran": "https://zh.wikipedia.org/wiki/%E6%89%92%E6%9F%93",
    "ci_xiu": "https://zh.wikipedia.org/wiki/%E5%88%9D%E7%B9%8A",
    "tihuaka": "https://zh.wikipedia.org/wiki/%E6%8F%90%E8%8A%B1%E5%8D%A1",

    # ===== 六、航海与交通 =====
    "zhinanzhen": "https://zh.wikipedia.org/wiki/%E6%8C%87%E5%8D%97%E9%92%88",
    "luo_pan": "https://zh.wikipedia.org/wiki/%E7%BD%97%E7%9B%98",
    "duo": "https://zh.wikipedia.org/wiki/%E8%88%8F",
    "shuomi_gc": "https://zh.wikipedia.org/wiki/%E6%B0%B4%E5%AF%86%E8%88%8D%E8%89%87",
    "lou_chuan": "https://zh.wikipedia.org/wiki/%E6%A5%BC%E8%88%AA",
    "fu_chuan": "https://zh.wikipedia.org/wiki/%E7%A6%8F%E8%88%AA",
    "sha_chuan": "https://zh.wikipedia.org/wiki/%E6%B2%99%E8%88%AA",
    "che_chuan": "https://zh.wikipedia.org/wiki/%E8%BD%A6%E8%88%AA",
    "yizhan": "https://zh.wikipedia.org/wiki/%E9%9B%86%E9%A9%B4",

    # ===== 七、军事技术 =====
    "huojian": "https://zh.wikipedia.org/wiki/%E7%81%AB%E7%AE%AD",
    "huoqiang": "https://zh.wikipedia.org/wiki/%E7%81%AB%E9%92%88",
    "huopao": "https://zh.wikipedia.org/wiki/%E7%81%AB%E7%82%94",
    "huitongpao": "https://zh.wikipedia.org/wiki/%E8%99%8E%E8%B9%9F%E7%82%94",
    "duofa_huo": "https://zh.wikipedia.org/wiki/%E5%A4%9A%E5%8F%91%E7%81%AB%E7%AE%AD",
    "shenhuo_feiya": "https://zh.wikipedia.org/wiki/%E7%A5%9E%E7%81%AB%E9%A3%9E%E9%B8%9F",
    "toushi_ji": "https://zh.wikipedia.org/wiki/%E6%8A%95%E7%9F%B3%E6%9C%BA",
    "zhan_che": "https://zh.wikipedia.org/wiki/%E6%88%98%E8%BD%A6",

    # ===== 八、信息传播与制度 =====
    "zaozhi": "https://zh.wikipedia.org/wiki/%E9%80%A0%E7%9A%84%E6%9C%AF",
    "diaoban_yinshua": "https://zh.wikipedia.org/wiki/%E9%9B%95%E7%89%88%E5%8D%B0%E5%88%B7",
    "huozi_yinshua": "https://zh.wikipedia.org/wiki/%E6%B4%BB%E5%AD%97%E5%8D%B0%E5%88%B7",
    "kaoshi": "https://zh.wikipedia.org/wiki/%E7%A7%91%E8%80%8F%E5%88%B6%E5%BA%A6",
    "yin_zhang": "https://zh.wikipedia.org/wiki/%E5%8D%B0%E7%AB%A0",
    "huji_zhidu": "https://zh.wikipedia.org/wiki/%E6%88%B7%E7%B1%BB%E5%88%B6%E5%BA%A6",
    "bingfu": "https://zh.wikipedia.org/wiki/%E5%85%B5%E7%AC%A6",
    "ditu": "https://zh.wikipedia.org/wiki/%E5%9C%B0%E5%9B%BE",

    # ===== 九、数学与计算 =====
    "shijinweizhi": "https://zh.wikipedia.org/wiki/%E5%8D%81%E4%BD%8D%E5%88%B6%E5%88%B6",
    "suanchou": "https://zh.wikipedia.org/wiki/%E7%AE%97%E7%AD%9F",
    "suanpan": "https://zh.wikipedia.org/wiki/%E7%AE%97%E7%9B%盘",
    "jiuzhang_suan": "https://zh.wikipedia.org/wiki/%E4%B9%9D%E7%AB%A0%E7%AE%97%E6%9C%AF",
    "fu_shù": "https://zh.wikipedia.org/wiki/%E8%B4%9F%E6%95%B0",
    "kaifang": "https://zh.wikipedia.org/wiki/%E5%BC%80%E6%96%B9",
    "gelunshu": "https://zh.wikipedia.org/wiki/%E5%89%B2%E5%9C%86%E6%9C%AF",

    # ===== 十、天文与时间系统 =====
    "ganzhi": "https://zh.wikipedia.org/wiki/%E5%B9%B2%E6%94%AF",
    "ershijie_jieqi": "https://zh.wikipedia.org/wiki/%E4%BA%8C%E5%8D%81%E8%8A%82%E6%B0%B4",
    "taichu_li": "https://zh.wikipedia.org/wiki/%E5%A4%AA%E5%88%9D%E5%8E%86",
    "shoushi_li": "https://zh.wikipedia.org/wiki/%E6%8E%88%E6%97%B6%E5%8E%86",
    "riglou": "https://zh.wikipedia.org/wiki/%E6%97%A5%E6%99%89",
    "lou_ke": "https://zh.wikipedia.org/wiki/%E6%BC%8F%E5%88%B7",
    "xing_tu": "https://zh.wikipedia.org/wiki/%E6%98%9F%E5%9B%BE",
    "chidao_zuobiao": "https://zh.wikipedia.org/wiki/%E8%BD%A5%E9%81%93%E5%9D%90%E6%A0%87",

    # ===== 十一、医学与生命科学 =====
    "zhenjiu": "https://zh.wikipedia.org/wiki/%E9%92%88%E7%81%8C",
    "jingluo": "https://zh.wikipedia.org/wiki/%E7%BB%8F%E7%BB%9C",
    "mafei_san": "https://zh.wikipedia.org/wiki/%E9%BA%BB%E6%B5%91%E6%95%A3",
    "shanghan_lun": "https://zh.wikipedia.org/wiki/%E4%BC%91%E5%AE%AB%E9%9A%94%E8%AE%BA",
    "bencao_gumu": "https://zh.wikipedia.org/wiki/%E6%9C%AC%E8%8D%AF%E7%BA%B3%E7%9B%AE",
    "qie_mai": "https://zh.wikipedia.org/wiki/%E5%88%87%E8%84%89",
    "waike_fenghe": "https://zh.wikipedia.org/wiki/%E5%A4%96%E7%A7%91%E7%BB%B3%E5%90%88",

    # ===== 十二、日常生活与消费技术 =====
    "youdeng": "https://zh.wikipedia.org/wiki/%E6%B2%B9%E7%81%AF",
    "huozhe": "https://zh.wikipedia.org/wiki/%E7%81%AB%E6%8A%98%E5%AD%90",
    "xianglu": "https://zh.wikipedia.org/wiki/%E9%A6%99%E7%82%89",
    "bingjian": "https://zh.wikipedia.org/wiki/%E5%86%B0%E7%AE%8F",
    "niangjiu": "https://zh.wikipedia.org/wiki/%E9%85%BF%E9%81%93",
    "doufu": "https://zh.wikipedia.org/wiki/%E8%B1%86%E8%85%90",
    "jiangyou": "https://zh.wikipedia.org/wiki/%E9%85%AF%E6%B2%B9",
    "huoguo": "https://zh.wikipedia.org/wiki/%E7%81%AB%E9%94%85",
    "shi_mo": "https://zh.wikipedia.org/wiki/%E7%9F%B3%E7%A3%A8",
    "jingsheng_huaban": "https://zh.wikipedia.org/wiki/%E4%BA%95%E8%BC%9A%E6%BB%9A%E8%BD%AE",

    # ===== 十三、文化娱乐与工艺 =====
    "yuanlin": "https://zh.wikipedia.org/wiki/%E8%8B%8F%E5%B7%9E%E5%9B%AD%E5%9B%AD",
    "xiangqi": "https://zh.wikipedia.org/wiki/%E8%B1%8C%E6%A3%8B",
    "weiqi": "https://zh.wikipedia.org/wiki/%E5%9B%B4%E5%93%88",
    "piying_xi": "https://zh.wikipedia.org/wiki/%E7%9A%AE%E5%BD%B1%E6%88%8F",
    "fengzheng": "https://zh.wikipedia.org/wiki/%E9%9B%86%E8%9D%9C",
    "baozhu": "https://zh.wikipedia.org/wiki/%E7%88%9D%E7%93%A2",
    "denglong": "https://zh.wikipedia.org/wiki/%E7%81%AF%E7%81%AD",
    "shanzi": "https://zh.wikipedia.org/wiki/%E6%89%AD%E5%AD%90",
    "yuqi": "https://zh.wikipedia.org/wiki/%E7%8E%89%E5%99%A8",

    # ===== 补充未收录条目 =====
    # 一、农业与水利
    "lou_che2": "https://zh.wikipedia.org/wiki/%E8%80%8F%E8%BD%A6",
    "yao_ma2": "https://zh.wikipedia.org/wiki/%E7%A7%8A%E9%A9%AC",
    "shengeng2": "https://zh.wikipedia.org/wiki/%E6%B7%B1%E8%80%96",
    "lv_fei2": "https://zh.wikipedia.org/wiki/%E7%BB%BF%E8%82%A0",
    "jinggeng": "https://zh.wikipedia.org/wiki/%E7%B2%BE%E8%99%8B%E7%BB%9F%E4%BD%9C",
    "fanche": "https://zh.wikipedia.org/wiki/%E7%BF%BB%E8%BD%A6",
    "jiaota_shui2": "https://zh.wikipedia.org/wiki/%E8%84%9A%E8%B6%9A%E6%B0%B4%E8%BD%A6",
    "niuzhuan_fanche2": "https://zh.wikipedia.org/wiki/%E7%89%9B%E8%BD%AC%E7%BF%BB%E8%BD%A6",
    # 二、机械
    "dizhongyi2": "https://zh.wikipedia.org/wiki/%E5%9C%B0%E5%8A%A8%E4%BB%AA",
    "huntianyi2": "https://zh.wikipedia.org/wiki/%E6%B5%91%E5%A4%A9%E4%BB%AA",
    "dulun_che2": "https://zh.wikipedia.org/wiki/%E7%8B%AD%E8%BD%A6",
    # 三、建筑
    "zhaozhou_qiao2": "https://zh.wikipedia.org/wiki/%E8%B5%B0%E5%B7%9E%E6%A1%A5",
    "gong_qiao2": "https://zh.wikipedia.org/wiki/%E6%8B%B3%E6%A1%A5",
    "suanmao2": "https://zh.wikipedia.org/wiki/%E6%A6%94%E5%8C%8D",
    "dougong2": "https://zh.wikipedia.org/wiki/%E6%96%97%E5%8A%A8",
    "cheng_qiang2": "https://zh.wikipedia.org/wiki/%E5%9F%8E%E5%9F%8E",
    "gongdian2": "https://zh.wikipedia.org/wiki/%E5%AE%AE%E6%94%BE",
    "sihuayuan2": "https://zh.wikipedia.org/wiki/%E5%9B%9B%E5%90%88%E9%99%A2",
    "wanlichang2": "https://zh.wikipedia.org/wiki/%E4%B8%87%E9%95%BF%E5%A4%A7%E5%90%88%E5%9F%8E",
    "jinghang_dahaihe2": "https://zh.wikipedia.org/wiki/%E4%BA%AC%E6%96%B0%E5%A4%A7%E8%BF%90%E6%B2%B3",
    "zhandao2": "https://zh.wikipedia.org/wiki/%E8%B5%8B%E9%81%93",
    "shibanlu2": "https://zh.wikipedia.org/wiki/%E7%9F%B3%E6%9D%BF%E9%80%81",
    # 四、冶金
    "qing_tong2": "https://zh.wikipedia.org/wiki/%E9%9D%92%E9%93%9C",
    "tianranqi2": "https://zh.wikipedia.org/wiki/%E5%A4%A9%E7%84%B6%E6%B0%94",
    "sheng_tie2": "https://zh.wikipedia.org/wiki/%E7%94%9F%E9%93%9C",
    # 五、纺织
    "zhi_ji": "https://zh.wikipedia.org/wiki/%E7%BB%87%E6%9C%BA",
    "mianfang2": "https://zh.wikipedia.org/wiki/%E6%A3%89%E7%BA%AF",
    # 六、航海
    "fu_chuan2": "https://zh.wikipedia.org/wiki/%E7%A6%8F%E8%88%AA",
    "sha_chuan2": "https://zh.wikipedia.org/wiki/%E6%B2%99%E8%88%AA",
    "che_chuan2": "https://zh.wikipedia.org/wiki/%E8%BD%A6%E8%88%AA",
    # 七、军事
    "huopao2": "https://zh.wikipedia.org/wiki/%E7%81%AB%E7%82%94",
    "huitongpao2": "https://zh.wikipedia.org/wiki/%E8%99%8E%E8%B9%9F%E7%82%94",
    "zhanche2": "https://zh.wikipedia.org/wiki/%E6%88%98%E8%BD%A6",
    # 八、信息
    "shufa": "https://zh.wikipedia.org/wiki/%E4%B9%A6%E6%B3%95",
    "zhuan_ke": "https://zh.wikipedia.org/wiki/%E5%8D%B0%E7%AB%A0",
    "zhibi": "https://zh.wikipedia.org/wiki/%E7%BA%B3%E5%B9%A3",
    # 九、数学
    "shijinweizhi2": "https://zh.wikipedia.org/wiki/%E5%8D%81%E4%BD%8D%E5%88%B6%E5%88%B6",
    "gelunshu2": "https://zh.wikipedia.org/wiki/%E5%89%B2%E5%9C%86%E6%9C%AF",
    # 十、天文
    "taichuli2": "https://zh.wikipedia.org/wiki/%E5%A4%AA%E5%88%9D%E5%8E%86",
    "shoushili2": "https://zh.wikipedia.org/wiki/%E6%8E%88%E6%97%B6%E5%8E%86",
    # 十二、日常
    "youdeng2": "https://zh.wikipedia.org/wiki/%E6%B2%B9%E7%81%AF",
    "huozhe2": "https://zh.wikipedia.org/wiki/%E7%81%AB%E6%8A%98%E5%AD%90",
    "niangjiu2": "https://zh.wikipedia.org/wiki/%E9%85%BF%E9%81%93",
    "huoguo2": "https://zh.wikipedia.org/wiki/%E7%81%AB%E9%94%85",
    # 十三、文化
    "tong_jing": "https://zh.wikipedia.org/wiki/%E9%93%9C%E9%95%87",
    "yuqi2": "https://zh.wikipedia.org/wiki/%E7%8E%89%E5%99%A8",
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
