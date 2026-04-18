import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./HuaxiaScrollExperience.module.css";
import {
  ERA_BACKGROUNDS_BY_NAME,
  ERA_BACKGROUND_SETTINGS,
} from "../../config/eraBackgrounds";

const CATEGORY_TONE = {
  craft: { name: "工艺", tone: "#8A5F32", seal: "匠" },
  metallurgy: { name: "冶金", tone: "#6F4A2A", seal: "金" },
  culture: { name: "文教", tone: "#405A55", seal: "文" },
  science: { name: "格物", tone: "#355C63", seal: "理" },
  medicine: { name: "医药", tone: "#4D6B50", seal: "医" },
  engineering: { name: "营造", tone: "#7B5739", seal: "工" },
  military: { name: "军器", tone: "#7B2E2E", seal: "兵" },
  navigation: { name: "舟舆", tone: "#2F5B62", seal: "航" },
  textile: { name: "织造", tone: "#8D5D56", seal: "织" },
  trade: { name: "互市", tone: "#72572B", seal: "市" },
  agriculture: { name: "农政", tone: "#5F6F3A", seal: "耕" },
  math: { name: "算学", tone: "#514F64", seal: "算" },
};

const ERA_THEMES = {
  "新石器": "取土为器，磨石成形，先民开始以双手改写自然。",
  "黄帝时期": "衣被天下的传说在此萌芽，丝与医共同进入文明记忆。",
  "夏朝": "青铜初兴，礼器与权力一同铸入火光。",
  "商朝": "甲骨有辞，文字使祭祀、政治与历史开始被保存。",
  "周朝": "礼乐成制，器物与制度共同构成文明秩序。",
  "春秋": "铁器入田，诸侯竞逐中孕育生产力的跃迁。",
  "战国": "百家争鸣，农具、兵器与方术在变法中并进。",
  "秦朝": "车同轨，书同文，工程与治理压缩成统一的尺度。",
  "西汉": "凿空西域，纸、丝、历法和道路把世界接入中原。",
  "东汉": "知识落于纸上，观天测地之器体现实证精神。",
  "三国": "乱世促成军工、水利与稻作技术的快速流动。",
  "两晋": "士人书写山水，工艺与医药在迁徙中延续。",
  "南北朝": "南北交汇，佛寺、农书与本草塑造新的技术网络。",
  "隋朝": "大运河贯通南北，帝国重新组织人力、粮食与交通。",
  "唐朝": "万国来朝，印刷、药物、织造与航路进入盛世节奏。",
  "五代十国": "山河分裂而技艺未断，地方工匠保存火种。",
  "宋朝": "市井繁盛，火药、活字、瓷器与航海迎来密集突破。",
  "元朝": "欧亚贯通，天文、农政与交通在更大尺度上流转。",
  "明朝": "海路远行，营造、医药、瓷业与百科式知识成熟。",
  "清朝": "传统技艺精细化，西学东渐带来新的观察方式。",
  "近代": "机器、铁路与新式教育打开古今交汇的门缝。",
  "现代": "古老技艺进入现代体系，文明记忆转化为新的创造力。",
};

const ERA_ALIASES = {
  "上古": "新石器",
  "汉朝": "西汉",
  "秦汉": "东汉",
  "隋唐": "唐朝",
  "北宋": "宋朝",
  "南宋": "宋朝",
};

function normalizeCategories(categories) {
  if (!Array.isArray(categories)) return categories || {};

  return categories.reduce((acc, item) => {
    const fallback = CATEGORY_TONE[item.code] || {};
    acc[item.code] = {
      ...item,
      label: item.name || fallback.name || item.code,
      color: fallback.tone || "#6F4A2A",
      seal: fallback.seal || "技",
    };
    return acc;
  }, {});
}

function formatYear(year) {
  if (typeof year !== "number") return "纪年未详";
  if (year < 0) return `公元前 ${Math.abs(year)} 年`;
  return `公元 ${year} 年`;
}

function formatRange(start, end) {
  return `${formatYear(start).replace(" 年", "")} - ${formatYear(end).replace(" 年", "")}`;
}

function buildEraSections(nodes, timelineConfig, categories) {
  const grouped = new Map();
  nodes.forEach((node) => {
    const eraName = ERA_ALIASES[node.era] || node.era;
    if (!grouped.has(eraName)) grouped.set(eraName, []);
    grouped.get(eraName).push(node);
  });

  return timelineConfig
    .map((era) => {
      const eraNodes = (grouped.get(era.name) || []).sort((a, b) => a.year - b.year);
      const categoryNames = Array.from(new Set(eraNodes.map((node) => categories[node.cat]?.label || node.cat)));
      const representative = eraNodes.reduce((best, node) => {
        if (!best) return node;
        return (node.outEdges?.length || 0) > (best.outEdges?.length || 0) ? node : best;
      }, null);

      return {
        ...era,
        nodes: eraNodes,
        theme: ERA_THEMES[era.name] || "一段文明缓缓展开，器物与制度留下可追溯的纹理。",
        categories: categoryNames,
        representative,
        background: ERA_BACKGROUNDS_BY_NAME[era.name] || {
          image: ERA_BACKGROUND_SETTINGS.fallbackImage,
          position: ERA_BACKGROUND_SETTINGS.fallbackPosition,
        },
      };
    })
    .filter((era) => era.nodes.length > 0);
}

function useRevealOnScroll(rootRef) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(styles.visible);
          }
        });
      },
      { root, threshold: 0.25 }
    );

    const items = root.querySelectorAll("[data-reveal]");
    items.forEach((item) => observer.observe(item));

    return () => observer.disconnect();
  }, [rootRef]);
}

function ScrollContainer({ children, activeEraName, onSearch, scrollRef }) {
  const publicPath = process.env.PUBLIC_URL || "";
  const handleWheel = (event) => {
    if (!scrollRef.current || Math.abs(event.deltaY) < Math.abs(event.deltaX)) return;
    event.preventDefault();
    scrollRef.current.scrollLeft += event.deltaY;
  };

  return (
    <main
      className={styles.scrollStage}
      style={{
        "--calligraphy-image": `url("${publicPath}/images/backgrounds/bg_calligraphy.jpg")`,
        "--scroll-paper-image": `url("${publicPath}/images/backgrounds/bg_scroll_1.jpg")`,
      }}
    >
      <div className={styles.stageBackdrop} aria-hidden="true" />
      <header className={styles.manuscriptHeader}>
        <div>
          <p className={styles.kicker}>华夏文明科技树</p>
          <h1>一卷文明技术长图</h1>
        </div>
        <div className={styles.headerActions}>
          <span>{activeEraName}</span>
          <button type="button" data-scroll-search onClick={onSearch}>检索技艺</button>
        </div>
      </header>
      <section
        ref={scrollRef}
        className={styles.scrollViewport}
        onWheel={handleWheel}
        aria-label="横向历史卷轴"
      >
        {children}
      </section>
    </main>
  );
}

function Timeline({ eras, activeEraName, onEraSelect }) {
  return (
    <nav className={styles.timeline} aria-label="时代索引">
      <span className={styles.timelineStart}>卷首</span>
      {eras.map((era) => (
        <button
          type="button"
          key={era.name}
          className={`${styles.timelineItem} ${activeEraName === era.name ? styles.timelineItemActive : ""}`}
          onClick={() => onEraSelect(era.name)}
        >
          <span>{era.name}</span>
        </button>
      ))}
      <span className={styles.timelineEnd}>未竟</span>
    </nav>
  );
}

function TechNode({ node, category, isSelected, onSelect }) {
  return (
    <button
      type="button"
      className={`${styles.techNode} ${isSelected ? styles.techNodeSelected : ""}`}
      style={{ "--node-tone": category.color }}
      onClick={() => onSelect(node.id)}
      data-reveal
    >
      <span className={styles.techSeal}>{category.seal}</span>
      <span className={styles.techName}>{node.name}</span>
      <span className={styles.techMeta}>{formatYear(node.year)} · {category.label}</span>
      <span className={styles.techLine}>{node.sig || node.desc}</span>
    </button>
  );
}

function EraCard({ era, categories, selectedId, onSelect, eraRef }) {
  const featured = era.representative;

  return (
    <article
      ref={eraRef}
      className={styles.eraPanel}
      style={{
        "--era-image": `url("${era.background.image}")`,
        "--era-position": era.background.position || "center center",
      }}
      data-era={era.name}
    >
      <div className={styles.eraPaper} data-reveal>
        <div className={styles.eraHeading}>
          <span className={styles.eraRange}>{formatRange(era.start, era.end)}</span>
          <h2>{era.name}</h2>
        </div>
        <p className={styles.eraTheme}>{era.theme}</p>
        {featured && (
          <p className={styles.eraAnnotation}>
            此段以「{featured.name}」为要津：{featured.desc}
          </p>
        )}
        <div className={styles.eraTags}>
          {era.categories.slice(0, 5).map((name) => (
            <span key={name}>{name}</span>
          ))}
        </div>
      </div>

      <div className={styles.nodeRiver}>
        {era.nodes.map((node) => (
          <TechNode
            key={node.id}
            node={node}
            category={categories[node.cat] || { label: node.cat, color: "#6F4A2A", seal: "技" }}
            isSelected={selectedId === node.id}
            onSelect={onSelect}
          />
        ))}
      </div>
    </article>
  );
}

function AnnotationPanel({ node, categories, relatedNodes, onSelect, onClose }) {
  if (!node) {
    return (
      <aside className={styles.annotationPanel}>
        <p className={styles.annotationKicker}>卷旁笺注</p>
        <h2>择一技艺，读其来路</h2>
        <p>
          点击卷轴中的科技点，可见发明缘起、文明意义与后续传承。这里不再呈现字段表，而以注疏方式讲述技术如何进入历史。
        </p>
      </aside>
    );
  }

  const category = categories[node.cat] || { label: node.cat, color: "#6F4A2A" };

  return (
    <aside className={styles.annotationPanel} style={{ "--annotation-tone": category.color }}>
      <button type="button" className={styles.closeAnnotation} onClick={onClose}>收起</button>
      <p className={styles.annotationKicker}>{formatYear(node.year)} · {node.era} · {category.label}</p>
      <h2>{node.name}</h2>
      <p className={styles.annotationLead}>{node.sig}</p>
      <p>{node.desc}</p>
      <dl className={styles.annotationFacts}>
        <div>
          <dt>传述者</dt>
          <dd>{node.inv || "未详"}</dd>
        </div>
        <div>
          <dt>文明脉络</dt>
          <dd>{relatedNodes.length ? `延展至 ${relatedNodes.map((item) => item.name).join("、")}` : "此支暂止，余韵仍在器物与制度之中。"}</dd>
        </div>
      </dl>
      {relatedNodes.length > 0 && (
        <div className={styles.relatedNodes}>
          {relatedNodes.slice(0, 5).map((item) => (
            <button type="button" key={item.id} onClick={() => onSelect(item.id)}>
              {item.name}
            </button>
          ))}
        </div>
      )}
    </aside>
  );
}

function SearchSheet({ open, nodes, categories, onSelect, onClose }) {
  const [query, setQuery] = useState("");
  const results = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return nodes.slice(0, 12);
    return nodes
      .filter((node) => {
        return [node.name, node.en, node.era, node.desc, node.sig, node.inv]
          .filter(Boolean)
          .some((text) => text.toLowerCase().includes(keyword));
      })
      .slice(0, 20);
  }, [nodes, query]);

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  if (!open) return null;

  return (
    <div className={styles.searchLayer} role="dialog" aria-modal="true">
      <button type="button" className={styles.searchVeil} onClick={onClose} aria-label="关闭检索" />
      <section className={styles.searchSheet}>
        <div className={styles.searchHead}>
          <div>
            <p className={styles.annotationKicker}>技艺检索</p>
            <h2>从卷中寻一处发明</h2>
          </div>
          <button type="button" onClick={onClose}>合卷</button>
        </div>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="输入造纸、宋朝、冶金、蔡伦..."
          autoFocus
        />
        <div className={styles.searchResults}>
          {results.map((node) => {
            const category = categories[node.cat] || { label: node.cat };
            return (
              <button type="button" key={node.id} onClick={() => onSelect(node.id)}>
                <strong>{node.name}</strong>
                <span>{node.era} · {formatYear(node.year)} · {category.label}</span>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}

export function HuaxiaScrollExperience({ NODES, CAT, ADJ, NMAP, timelineConfig }) {
  const categories = useMemo(() => normalizeCategories(CAT), [CAT]);
  const eras = useMemo(
    () => buildEraSections(NODES, timelineConfig, categories),
    [NODES, timelineConfig, categories]
  );
  const [activeEraName, setActiveEraName] = useState(eras[0]?.name || "");
  const [selectedId, setSelectedId] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const scrollRef = useRef(null);
  const eraRefs = useRef({});

  useRevealOnScroll(scrollRef);

  useEffect(() => {
    if (!eras.length) return;
    setActiveEraName((current) => current || eras[0].name);
  }, [eras]);

  useEffect(() => {
    const root = scrollRef.current;
    if (!root) return undefined;

    const handleScroll = () => {
      const rootRect = root.getBoundingClientRect();
      const anchor = rootRect.left + rootRect.width * 0.42;
      let nextEra = activeEraName;
      let bestDistance = Number.POSITIVE_INFINITY;

      eras.forEach((era) => {
        const element = eraRefs.current[era.name];
        if (!element) return;
        const rect = element.getBoundingClientRect();
        const distance = Math.abs(rect.left + rect.width * 0.25 - anchor);
        if (distance < bestDistance) {
          bestDistance = distance;
          nextEra = era.name;
        }
      });

      if (nextEra !== activeEraName) setActiveEraName(nextEra);
    };

    root.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => root.removeEventListener("scroll", handleScroll);
  }, [activeEraName, eras]);

  const selectedNode = selectedId ? NMAP[selectedId] : null;
  const relatedNodes = selectedNode
    ? (ADJ[selectedNode.id] || []).map((id) => NMAP[id]).filter(Boolean)
    : [];

  const scrollToEra = (eraName) => {
    eraRefs.current[eraName]?.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
  };

  const selectNode = (id) => {
    setSelectedId(id);
    setSearchOpen(false);
    const node = NMAP[id];
    if (node) {
      window.setTimeout(() => scrollToEra(node.era), 20);
    }
  };

  return (
    <div className={styles.experienceShell}>
      <ScrollContainer
        activeEraName={activeEraName}
        onSearch={() => setSearchOpen(true)}
        scrollRef={scrollRef}
      >
        <div className={styles.scrollRoll} aria-hidden="true" />
        <div className={styles.eraTrack}>
          <section className={styles.openingPanel}>
            <div className={styles.openingMark}>夏</div>
            <p>展开一卷纸，沿时间之水而行。</p>
            <h2>器物、制度与知识，在此相互生长。</h2>
          </section>
          {eras.map((era) => (
            <EraCard
              key={era.name}
              era={era}
              categories={categories}
              selectedId={selectedId}
              onSelect={selectNode}
              eraRef={(node) => {
                eraRefs.current[era.name] = node;
              }}
            />
          ))}
          <section className={styles.closingPanel}>
            <p>卷末未尽</p>
            <h2>文明不是终点，而是下一次发明的来处。</h2>
          </section>
        </div>
      </ScrollContainer>

      <Timeline eras={eras} activeEraName={activeEraName} onEraSelect={scrollToEra} />

      <AnnotationPanel
        node={selectedNode}
        categories={categories}
        relatedNodes={relatedNodes}
        onSelect={selectNode}
        onClose={() => setSelectedId("")}
      />

      <SearchSheet
        open={searchOpen}
        nodes={NODES}
        categories={categories}
        onSelect={selectNode}
        onClose={() => setSearchOpen(false)}
      />
    </div>
  );
}
