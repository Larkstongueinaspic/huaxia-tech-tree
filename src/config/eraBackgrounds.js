// ============================================================
// eraBackgrounds.js
// 年代背景图与切换动画配置
//
// 调整入口：
//   - ERA_BACKGROUND_SETTINGS.opacity：整体背景透明度
//   - ERA_BACKGROUND_SETTINGS.transition.effect：fade/smooth/wipe/cover
//   - ERA_BACKGROUND_SETTINGS.transition.durationMs：切换动画时长
//   - ERA_BACKGROUND_SETTINGS.switchTriggerX：触发切换的 SVG X 坐标，600 为视口中心
//   - ERA_BACKGROUNDS_BY_NAME[时代].image：替换具体图片路径或远程 URL
// ============================================================

// 切换效果后选项：
export const ERA_BACKGROUND_TRANSITIONS = {
  FADE: "fade",                 // 淡入淡出
  SMOOTH: "smooth",             // 平滑过渡
  WIPE: "wipe",                 // 擦除式（不好看）
  COVER: "cover",               // 覆盖式切换
};

export const ERA_BACKGROUND_SETTINGS = {
  opacity: 0.7,
  switchTriggerX: 600,
  transition: {
    effect: ERA_BACKGROUND_TRANSITIONS.FADE,
    durationMs: 2000,
    easing: "cubic-bezier(0.22, 1, 0.36, 1)",
  },
  overlay:
    "linear-gradient(90deg, rgba(247,243,237,0.56), rgba(247,243,237,0.24) 42%, rgba(247,243,237,0.6)), linear-gradient(180deg, rgba(255,252,245,0.36), rgba(235,229,216,0.5))",
  fallbackImage: "/images/backgrounds/bg_scroll_1.jpg",
  fallbackPosition: "center center",
};

export const ERA_BACKGROUNDS_BY_NAME = {
  "新石器": {
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Yangshao_Painted_Pottery.jpg/1920px-Yangshao_Painted_Pottery.jpg",
    position: "center center",
    credit: "Yangshao Painted Pottery",
    source: "https://commons.wikimedia.org/wiki/File:Yangshao_Painted_Pottery.jpg",
  },
  "黄帝时期": {
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bf/Chinese_woodcut%2C_Famous_medical_figures%3B_The_Yellow_Emperor_Wellcome_L0039314.jpg/1920px-Chinese_woodcut%2C_Famous_medical_figures%3B_The_Yellow_Emperor_Wellcome_L0039314.jpg",
    position: "center 30%",
    credit: "The Yellow Emperor, Wellcome Collection woodcut",
    source:
      "https://commons.wikimedia.org/wiki/File:Chinese_woodcut,_Famous_medical_figures;_The_Yellow_Emperor_Wellcome_L0039314.jpg",
  },
  "夏朝": {
    image:
      "https://upload.wikimedia.org/wikipedia/commons/9/9f/CMOC_Treasures_of_Ancient_China_exhibit_-_bronze_jue.jpg",
    position: "center center",
    credit: "Erlitou culture bronze jue",
    source:
      "https://commons.wikimedia.org/wiki/File:CMOC_Treasures_of_Ancient_China_exhibit_-_bronze_jue.jpg",
  },
  "商朝": {
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Bronze_Tripod_Wine_Vessel_%28Jia%29_Shang_dynasty_12th_century_BCE_China.jpg/1920px-Bronze_Tripod_Wine_Vessel_%28Jia%29_Shang_dynasty_12th_century_BCE_China.jpg",
    position: "center 45%",
    credit: "Shang dynasty bronze tripod wine vessel",
    source:
      "https://commons.wikimedia.org/wiki/File:Bronze_Tripod_Wine_Vessel_(Jia)_Shang_dynasty_12th_century_BCE_China.jpg",
  },
  "周朝": {
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d6/Early_Western_Zhou_Bronze_Jiao_Wine_Vessel.jpg/1920px-Early_Western_Zhou_Bronze_Jiao_Wine_Vessel.jpg",
    position: "center center",
    credit: "Early Western Zhou bronze jiao wine vessel",
    source: "https://commons.wikimedia.org/wiki/File:Early_Western_Zhou_Bronze_Jiao_Wine_Vessel.jpg",
  },
  "春秋": {
    image:
      "https://upload.wikimedia.org/wikipedia/commons/2/2a/20241025_Bronze_Duo%2C_Spring_and_Autumn_Period.jpg",
    position: "center center",
    credit: "Spring and Autumn period bronze duo",
    source: "https://commons.wikimedia.org/wiki/File:20241025_Bronze_Duo,_Spring_and_Autumn_Period.jpg",
  },
  "战国": {
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Cup%2C_Warring_States_period%2C_lacquered_wood%2C_Honolulu_Museum_of_Art.JPG/1920px-Cup%2C_Warring_States_period%2C_lacquered_wood%2C_Honolulu_Museum_of_Art.JPG",
    position: "center center",
    credit: "Warring States lacquered wood cup",
    source:
      "https://commons.wikimedia.org/wiki/File:Cup,_Warring_States_period,_lacquered_wood,_Honolulu_Museum_of_Art.JPG",
  },
  "秦朝": {
    image: "https://upload.wikimedia.org/wikipedia/commons/4/43/Qin_Shihuang_Terracotta_Army%2C_Pit_1.jpg",
    position: "center center",
    credit: "Qin Shihuang Terracotta Army, Pit 1",
    source: "https://commons.wikimedia.org/wiki/File:Qin_Shihuang_Terracotta_Army,_Pit_1.jpg",
  },
  "西汉": {
    image: "https://upload.wikimedia.org/wikipedia/commons/2/2b/Mawangdui_silk_banner_from_tomb_no1.jpg",
    position: "center 35%",
    credit: "Mawangdui silk banner",
    source: "https://commons.wikimedia.org/wiki/File:Mawangdui_silk_banner_from_tomb_no1.jpg",
  },
  "东汉": {
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/Eastern_Han_Pottery_Tower_-_2a.jpg/1920px-Eastern_Han_Pottery_Tower_-_2a.jpg",
    position: "center center",
    credit: "Eastern Han pottery tower",
    source: "https://commons.wikimedia.org/wiki/File:Eastern_Han_Pottery_Tower_-_2a.jpg",
  },
  "三国": {
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/Eastern_Han-Three_Kingdoms_Battle_Painting_a.jpg/1920px-Eastern_Han-Three_Kingdoms_Battle_Painting_a.jpg",
    position: "center center",
    credit: "Eastern Han to Three Kingdoms battle painting",
    source: "https://commons.wikimedia.org/wiki/File:Eastern_Han-Three_Kingdoms_Battle_Painting_a.jpg",
  },
  "两晋": {
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/The_Calligraphy_Model_Sunny_after_Snow_by_Wang_Xizhi.jpg/1920px-The_Calligraphy_Model_Sunny_after_Snow_by_Wang_Xizhi.jpg",
    position: "center center",
    credit: "Wang Xizhi calligraphy model",
    source: "https://commons.wikimedia.org/wiki/File:The_Calligraphy_Model_Sunny_after_Snow_by_Wang_Xizhi.jpg",
  },
  "南北朝": {
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Ancient_Buddhist_Grottoes_at_Longmen-_Lianhua_%28Lotus_Flower%29_Grotto%2C_Main_Buddhist_Statue%2C_Northern_Wei.jpg/1920px-Ancient_Buddhist_Grottoes_at_Longmen-_Lianhua_%28Lotus_Flower%29_Grotto%2C_Main_Buddhist_Statue%2C_Northern_Wei.jpg",
    position: "center center",
    credit: "Northern Wei Longmen Grottoes",
    source:
      "https://commons.wikimedia.org/wiki/File:Ancient_Buddhist_Grottoes_at_Longmen-_Lianhua_(Lotus_Flower)_Grotto,_Main_Buddhist_Statue,_Northern_Wei.jpg",
  },
  "隋朝": {
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Amitabha_Buddha%2C_Pingdingzhou%2C_Shanxi_Province%2C_China%2C_Northern_Qi_or_Sui_Dynasty%2C_c._575-590_AD%2C_marble_-_Royal_Ontario_Museum_-_DSC09819.JPG/1920px-Amitabha_Buddha%2C_Pingdingzhou%2C_Shanxi_Province%2C_China%2C_Northern_Qi_or_Sui_Dynasty%2C_c._575-590_AD%2C_marble_-_Royal_Ontario_Museum_-_DSC09819.JPG",
    position: "center 35%",
    credit: "Northern Qi or Sui dynasty Amitabha Buddha",
    source:
      "https://commons.wikimedia.org/wiki/File:Amitabha_Buddha,_Pingdingzhou,_Shanxi_Province,_China,_Northern_Qi_or_Sui_Dynasty,_c._575-590_AD,_marble_-_Royal_Ontario_Museum_-_DSC09819.JPG",
  },
  "唐朝": {
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/Lokapala_Tang_dynasty_00.jpg/1920px-Lokapala_Tang_dynasty_00.jpg",
    position: "center 30%",
    credit: "Tang dynasty Lokapala figure",
    source: "https://commons.wikimedia.org/wiki/File:Lokapala_Tang_dynasty_00.jpg",
  },
  "五代十国": {
    image:
      "https://upload.wikimedia.org/wikipedia/commons/f/fa/Bodhisattva_Akashagarbha._Five_Dynasties._Mural._Guimet_Museum_MA_5020.jpg",
    position: "center center",
    credit: "Five Dynasties mural, Bodhisattva Akashagarbha",
    source:
      "https://commons.wikimedia.org/wiki/File:Bodhisattva_Akashagarbha._Five_Dynasties._Mural._Guimet_Museum_MA_5020.jpg",
  },
  "宋朝": {
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/3/32/Along_the_River_7-119-3.jpg/1920px-Along_the_River_7-119-3.jpg",
    position: "center center",
    credit: "Along the River During the Qingming Festival detail",
    source: "https://commons.wikimedia.org/wiki/File:Along_the_River_7-119-3.jpg",
  },
  "元朝": {
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/6_Zhao_Mengfu_Water_Village%2C_dated_1302_%2824.9_x_120.5_cm%29%3B_Palace_Museum.jpg/1920px-6_Zhao_Mengfu_Water_Village%2C_dated_1302_%2824.9_x_120.5_cm%29%3B_Palace_Museum.jpg",
    position: "center center",
    credit: "Zhao Mengfu, Water Village",
    source:
      "https://commons.wikimedia.org/wiki/File:6_Zhao_Mengfu_Water_Village,_dated_1302_(24.9_x_120.5_cm);_Palace_Museum.jpg",
  },
  "明朝": {
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Kraak_porcelain_dish_-_Ming_dynasty_-_Guimet_museum_-_Accesion_number_MA_4801.jpg/1920px-Kraak_porcelain_dish_-_Ming_dynasty_-_Guimet_museum_-_Accesion_number_MA_4801.jpg",
    position: "center center",
    credit: "Ming dynasty Kraak porcelain dish",
    source:
      "https://commons.wikimedia.org/wiki/File:Kraak_porcelain_dish_-_Ming_dynasty_-_Guimet_museum_-_Accesion_number_MA_4801.jpg",
  },
  "清朝": {
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/An_oil_painting_showing_a_Cantonese_woman_in_late_Qing_Dynasty_holding_a_tobbaco_oil_diffuser.jpg/1920px-An_oil_painting_showing_a_Cantonese_woman_in_late_Qing_Dynasty_holding_a_tobbaco_oil_diffuser.jpg",
    position: "center 30%",
    credit: "Late Qing Cantonese woman oil painting",
    source:
      "https://commons.wikimedia.org/wiki/File:An_oil_painting_showing_a_Cantonese_woman_in_late_Qing_Dynasty_holding_a_tobbaco_oil_diffuser.jpg",
  },
  "近代": {
    image: "https://upload.wikimedia.org/wikipedia/commons/c/c5/Nanjing_Road%2C_Shanghai%2C_in_Late_Qing.jpg",
    position: "center center",
    credit: "Nanjing Road, Shanghai, late Qing",
    source: "https://commons.wikimedia.org/wiki/File:Nanjing_Road,_Shanghai,_in_Late_Qing.jpg",
  },
  "现代": {
    image: "https://upload.wikimedia.org/wikipedia/commons/b/b0/Native_Bazaars%2C_Nankin_Road%2C_Shanghai_China.png",
    position: "center center",
    credit: "Nankin Road, Shanghai",
    source: "https://commons.wikimedia.org/wiki/File:Native_Bazaars,_Nankin_Road,_Shanghai_China.png",
  },
};
