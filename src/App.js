import { useState, useCallback, useEffect, useRef } from "react";

/* ══════════════════════════════════════════════════════════════════
   DATA  —  20 Chinese Inventions as a DAG
══════════════════════════════════════════════════════════════════ */

const NODES = [
  { id:"pottery",    name:"陶器",     en:"Pottery",        era:"新石器", year:-7000, layer:0, cat:"craft",
    inv:"先民", desc:"中国陶器制作历史逾9000年，仰韶文化彩陶是人类早期艺术与工艺的巅峰之作，象征着先民改造自然的开端。", sig:"工艺文明之源，人类改造材料的先河" },
  { id:"silk",       name:"蚕丝纺织", en:"Silk Weaving",    era:"黄帝时期",year:-2700, layer:0, cat:"textile",
    inv:"嫘祖", desc:"嫘祖教民养蚕缫丝，中国以丝国闻名天下，丝绸成为东西方文明交流最珍贵、最重要的商品。", sig:"奠定丝绸之路物质基础，东西方文明交流的桥梁" },
  { id:"bronze",     name:"青铜冶炼", en:"Bronze Casting",  era:"夏朝",   year:-2000, layer:0, cat:"metallurgy",
    inv:"先民", desc:"司母戊鼎重832公斤，代表中国青铜工艺达到古代世界顶峰，礼器制度彰显文明秩序。", sig:"进入文明时代的标志，金属工艺的奠基之作" },
  { id:"writing",    name:"甲骨文",   en:"Oracle Script",   era:"商朝",   year:-1300, layer:0, cat:"culture",
    inv:"先民", desc:"商代甲骨文是中国最早的成熟文字系统，共发现约4500个单字，奠定汉字三千年传承。", sig:"中华文明传承的根本，文字是文明之母" },
  { id:"castiron",   name:"铸铁技术", en:"Cast Iron",       era:"春秋",   year:-500,  layer:1, cat:"metallurgy",
    inv:"工匠", desc:"中国比西方早1500年掌握铸铁技术，铁制农具大量普及，极大推动生产力革命。", sig:"农业革命的技术基础，大型工程建设的前提" },
  { id:"compass",    name:"指南针",   en:"Compass",         era:"战国",   year:-300,  layer:1, cat:"navigation",
    inv:"黄帝（传说）", desc:"司南是世界最早的指向工具，北宋时演变为水罗盘用于远洋航海，由此改变了世界格局。", sig:"四大发明之一，开创人类远洋航行的可能" },
  { id:"tcm",        name:"中医体系", en:"TCM",             era:"战国",   year:-400,  layer:1, cat:"medicine",
    inv:"扁鹊·岐伯", desc:"《黄帝内经》系统建立阴阳五行、脏腑经络理论，形成完整独特的东方生命科学体系。", sig:"守护中华民族数千年健康，东方医学的根基" },
  { id:"abacus",     name:"算盘",     en:"Abacus",          era:"汉朝",   year:200,   layer:1, cat:"math",
    inv:"先民", desc:"珠算被誉为世界最古老的计算机，2013年列入UNESCO非物质文化遗产，是数学智慧的结晶。", sig:"计算工具之祖，推动商业与科学计算发展" },
  { id:"gunpowder",  name:"火药",     en:"Gunpowder",       era:"唐朝",   year:850,   layer:1, cat:"military",
    inv:"炼丹家", desc:"道士炼丹时无意发现火药，从此彻底改变了人类战争史和工程建设史，威力震慑天下。", sig:"四大发明之一，深刻改变世界军事格局" },
  { id:"steel",      name:"百炼成钢", en:"Steel Making",    era:"汉朝",   year:-100,  layer:2, cat:"metallurgy",
    inv:"工匠", desc:"中国灌钢法比欧洲早1400年，炒钢与灌钢技术是古代冶金两大革命，百炼成钢成为精神象征。", sig:"提升工具与武器质量，推动整体技术文明进步" },
  { id:"acupuncture",name:"针灸术",   en:"Acupuncture",     era:"秦汉",   year:-100,  layer:2, cat:"medicine",
    inv:"华佗·扁鹊", desc:"针灸通过经络穴位调节人体气血，已传播至全球180多个国家，2010年列入UNESCO非遗。", sig:"为全人类贡献独特绿色医疗，中华文明智慧" },
  { id:"astronomy",  name:"天文历法", en:"Astronomy",       era:"汉朝",   year:100,   layer:2, cat:"science",
    inv:"落下闳", desc:"《太初历》精确计算365.25天/年，落下闳将天文发展为严密科学，引领亚洲农耕文明千年。", sig:"指导农业生产，推动科学与工程事业发展" },
  { id:"paper",      name:"造纸术",   en:"Papermaking",     era:"东汉",   year:105,   layer:2, cat:"culture",
    inv:"蔡伦", desc:"蔡伦用树皮、麻头改进造纸术，廉价纸张让知识不再是贵族专利，开创崭新文明时代。", sig:"四大发明之一，人类知识传播的根本革命" },
  { id:"canal",      name:"大运河",   en:"Grand Canal",     era:"隋朝",   year:605,   layer:3, cat:"engineering",
    inv:"隋炀帝", desc:"京杭大运河全长1794公里，是世界最长人工运河，综合运用冶金、天文、水利等多项技术。", sig:"沟通南北经济命脉，多技术融合的集大成者" },
  { id:"porcelain",  name:"瓷器",     en:"Porcelain",       era:"隋唐",   year:600,   layer:3, cat:"craft",
    inv:"工匠", desc:"英语China既指中国也指瓷器，中国瓷器技艺代表了东方工艺文明极致成就，闻名于世界。", sig:"成为中华文化的世界名片，东方美学象征" },
  { id:"silkroad",   name:"丝绸之路", en:"Silk Road",       era:"西汉",   year:-130,  layer:3, cat:"trade",
    inv:"张骞", desc:"张骞凿空西域，建立绵延7000公里的丝绸之路，是古代最伟大的文明交流与贸易大动脉。", sig:"推动古代全球化，东西方文明交流互鉴的纽带" },
  { id:"seismograph",name:"候风地动仪",en:"Seismograph",    era:"东汉",   year:132,   layer:3, cat:"science",
    inv:"张衡", desc:"张衡发明世界第一台地震监测仪器，铜龙铜蟾精妙设计，比欧洲类似仪器早1700年。", sig:"世界最早地震仪，东方科学实证精神的体现" },
  { id:"printing",   name:"雕版印刷", en:"Block Printing",  era:"唐朝",   year:868,   layer:3, cat:"culture",
    inv:"民间工匠", desc:"唐代《金刚经》是世界现存最早有明确日期的印刷品，图文并茂，标志知识传播新纪元。", sig:"信息传播革命，极大加速了人类文明进程" },
  { id:"movtype",    name:"活字印刷", en:"Movable Type",    era:"北宋",   year:1040,  layer:4, cat:"culture",
    inv:"毕昇", desc:"毕昇发明泥活字印刷术，比古腾堡早400年，将印刷从工艺提升为可编程的信息处理技术。", sig:"四大发明之一，现代出版业与信息技术的先驱" },
  { id:"rocket",     name:"火箭",     en:"Rocket",          era:"南宋",   year:1232,  layer:4, cat:"military",
    inv:"军事工匠", desc:"南宋火箭利用火药反冲力飞行，是人类最早的火箭技术，为近现代航天技术奠定了远古基础。", sig:"航天技术之远祖，人类探索宇宙征途的起点" },
]

const EDGES = [
  {from:"pottery",    to:"porcelain"},
  {from:"silk",       to:"silkroad"},
  {from:"silk",       to:"porcelain"},
  {from:"bronze",     to:"castiron"},
  {from:"castiron",   to:"steel"},
  {from:"castiron",   to:"canal"},
  {from:"steel",      to:"canal"},
  {from:"steel",      to:"rocket"},
  {from:"writing",    to:"paper"},
  {from:"paper",      to:"printing"},
  {from:"printing",   to:"movtype"},
  {from:"compass",    to:"silkroad"},
  {from:"gunpowder",  to:"rocket"},
  {from:"tcm",        to:"acupuncture"},
  {from:"abacus",     to:"astronomy"},
  {from:"astronomy",  to:"seismograph"},
  {from:"astronomy",  to:"silkroad"},
  {from:"astronomy",  to:"canal"},
]

// Positions in SVG viewBox "0 0 920 580"
const POS = {
  pottery:     {x:90,  y:68},  silk:        {x:280, y:68},
  bronze:      {x:560, y:68},  writing:     {x:780, y:68},
  castiron:    {x:90,  y:188}, compass:     {x:275, y:188},
  tcm:         {x:455, y:188}, abacus:      {x:635, y:188},
  gunpowder:   {x:800, y:188},
  steel:       {x:90,  y:308}, acupuncture: {x:290, y:308},
  astronomy:   {x:490, y:308}, paper:       {x:700, y:308},
  canal:       {x:90,  y:424}, porcelain:   {x:280, y:424},
  silkroad:    {x:460, y:424}, seismograph: {x:640, y:424},
  printing:    {x:810, y:424},
  movtype:     {x:560, y:530}, rocket:      {x:760, y:530},
}

const CAT = {
  craft:       {color:"#d4691e", label:"工艺"},
  textile:     {color:"#e05555", label:"纺织"},
  metallurgy:  {color:"#9aa5b1", label:"冶金"},
  culture:     {color:"#4a90d9", label:"文化"},
  navigation:  {color:"#1abc9c", label:"航海"},
  medicine:    {color:"#2ecc71", label:"医学"},
  math:        {color:"#9b59b6", label:"数学"},
  military:    {color:"#e74c3c", label:"军事"},
  science:     {color:"#00bcd4", label:"科学"},
  trade:       {color:"#f39c12", label:"贸易"},
  engineering: {color:"#8d6e63", label:"工程"},
}

/* ── Build ADJ / RADJ hash maps ── */
const ADJ  = Object.fromEntries(NODES.map(n=>[n.id,[]]))
const RADJ = Object.fromEntries(NODES.map(n=>[n.id,[]]))
EDGES.forEach(e=>{ ADJ[e.from].push(e.to); RADJ[e.to].push(e.from) })
const NMAP = Object.fromEntries(NODES.map(n=>[n.id,n]))

/* ── BFS: O(V+E)  uses Queue (FIFO) ── */
function bfsFrom(start) {
  const steps=[]; const vis=new Set([start]); const q=[start]
  while(q.length){
    const cur=q.shift(); const snap=new Set(vis)
    const fresh=ADJ[cur].filter(n=>!vis.has(n))
    fresh.forEach(n=>{vis.add(n);q.push(n)})
    steps.push({cur,queue:[...q],visited:snap,fresh,ds:"queue"})
  }
  return steps
}

/* ── DFS: O(V+E)  uses Stack (LIFO) ── */
function dfsFrom(start) {
  const steps=[]; const vis=new Set(); const stk=[start]
  while(stk.length){
    const cur=stk.pop(); if(vis.has(cur)) continue
    vis.add(cur); const snap=new Set(vis)
    const fresh=[...ADJ[cur]].reverse().filter(n=>!vis.has(n))
    fresh.forEach(n=>stk.push(n))
    steps.push({cur,stack:[...stk],visited:snap,fresh,ds:"stack"})
  }
  return steps
}

/* ══════════════════════════════════════════════════════════════════
   COMPONENT
══════════════════════════════════════════════════════════════════ */
export default function HuaxiaTechTree() {
  const [sel,     setSel]     = useState(null)
  const [mode,    setMode]    = useState("explore")
  const [steps,   setSteps]   = useState([])
  const [si,      setSi]      = useState(0)
  const [playing, setPlaying] = useState(false)
  const [tab,     setTab]     = useState("graph")
  const timerRef = useRef(null)

  const step = steps[si] ?? null

  const nState = (id) => {
    if(!step) return "idle"
    if(step.cur===id)                           return "current"
    if(step.visited.has(id))                    return "visited"
    if(mode==="bfs" && step.queue?.includes(id)) return "queued"
    if(mode==="dfs" && step.stack?.includes(id)) return "stacked"
    return "idle"
  }
  const eState = (f,t) => {
    if(!step) return "idle"
    if(step.cur===f && step.fresh?.includes(t)) return "active"
    if(step.visited.has(f)&&step.visited.has(t)) return "done"
    return "idle"
  }

  const onNode = useCallback((id)=>{
    setSel(id)
    if(mode!=="explore"){
      const s=mode==="bfs"?bfsFrom(id):dfsFrom(id)
      setSteps(s); setSi(0); setPlaying(false)
    }
  },[mode])

  useEffect(()=>{
    if(playing){
      timerRef.current=setInterval(()=>setSi(i=>{
        if(i>=steps.length-1){setPlaying(false);return i}
        return i+1
      }),900)
    } else clearInterval(timerRef.current)
    return ()=>clearInterval(timerRef.current)
  },[playing,steps.length])

  const selD = sel?NMAP[sel]:null
  const R = 28

  const edgePath = (f,t)=>{
    const a=POS[f],b=POS[t]; if(!a||!b) return ""
    const mid=(a.y+b.y)/2
    return `M ${a.x} ${a.y+R+1} C ${a.x} ${mid}, ${b.x} ${mid}, ${b.x} ${b.y-R-1}`
  }

  /* ── Buttons helper ── */
  const Btn = ({active,col,children,onClick,style={}})=>(
    <button onClick={onClick} style={{
      padding:"5px 12px", fontSize:11.5, cursor:"pointer",
      background:active?`rgba(${col},.18)`:"transparent",
      color:active?`rgb(${col})`:"#3a2e20",
      border:`1px solid rgba(${col},${active?.45:.12})`,
      borderRadius:4, transition:"all .2s", fontFamily:"inherit", ...style
    }}>{children}</button>
  )

  const modeColor = mode==="bfs"?"74,144,217":mode==="dfs"?"46,204,113":"200,160,69"

  return (
    <div style={{
      width:"100vw",height:"100vh",background:"#080a0f",
      color:"#e8dcc8",display:"flex",flexDirection:"column",
      overflow:"hidden",fontFamily:'"Noto Sans SC",sans-serif',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=ZCOOL+XiaoWei&family=Noto+Serif+SC:wght@400;700&family=Noto+Sans+SC:wght@300;400&family=JetBrains+Mono:wght@400&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:#0a0c12}::-webkit-scrollbar-thumb{background:#c8a045;border-radius:2px}
        button{cursor:pointer;border:none;font-family:inherit}
        @keyframes pulse{0%,100%{opacity:.07}50%{opacity:.02}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:none}}
      `}</style>

      {/* ══ HEADER ══ */}
      <header style={{
        display:"flex",alignItems:"center",justifyContent:"space-between",
        padding:"8px 20px",background:"rgba(8,7,4,.98)",
        borderBottom:"1px solid rgba(200,160,69,.2)",flexShrink:0,gap:10,
      }}>
        <div style={{display:"flex",alignItems:"baseline",gap:12}}>
          <h1 style={{
            fontFamily:'"ZCOOL XiaoWei",serif',fontSize:26,letterSpacing:5,
            background:"linear-gradient(135deg,#f5d789,#c8a045,#8b6914)",
            WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",
          }}>华夏科技树</h1>
          <span style={{fontSize:10,color:"#3a2e18",letterSpacing:3}}>CHINA TECHNOLOGY DAG</span>
        </div>

        <div style={{display:"flex",gap:6}}>
          <Btn active={mode==="explore"} col="200,160,69" onClick={()=>{setMode("explore");setSteps([]);setSi(0);setPlaying(false)}}>🗺 探索</Btn>
          <Btn active={mode==="bfs"}     col="74,144,217" onClick={()=>{setMode("bfs");setSteps([]);setSi(0);setPlaying(false)}}>⬛ BFS 广度优先</Btn>
          <Btn active={mode==="dfs"}     col="46,204,113" onClick={()=>{setMode("dfs");setSteps([]);setSi(0);setPlaying(false)}}>🔺 DFS 深度优先</Btn>
        </div>

        <div style={{display:"flex",gap:6}}>
          <Btn active={tab==="graph"}   col="200,160,69" onClick={()=>setTab("graph")}>知识图谱</Btn>
          <Btn active={tab==="adjlist"} col="74,144,217" onClick={()=>setTab("adjlist")}>邻接表</Btn>
        </div>
      </header>

      {/* ══ BODY ══ */}
      <div style={{flex:1,display:"flex",overflow:"hidden"}}>

        {/* LEFT */}
        <aside style={{
          width:172,flexShrink:0,display:"flex",flexDirection:"column",
          background:"rgba(8,6,4,.88)",borderRight:"1px solid rgba(200,160,69,.1)",
          padding:"14px 12px",gap:9,overflow:"auto",
        }}>
          <Sec title="节点类别">
            {Object.entries(CAT).map(([k,{color,label}])=>(
              <div key={k} style={{display:"flex",alignItems:"center",gap:7,marginBottom:4}}>
                <div style={{width:7,height:7,borderRadius:"50%",background:color,boxShadow:`0 0 5px ${color}80`}}/>
                <span style={{fontSize:11,color:"#7a6050"}}>{label}</span>
              </div>
            ))}
          </Sec>

          <Sec title="遍历图例">
            {[["#ff4136","当前节点"],["#c8a045","已访问"],["#4a90d9","队列 BFS"],["#2ecc71","栈 DFS"]].map(([c,l])=>(
              <div key={l} style={{display:"flex",alignItems:"center",gap:7,marginBottom:4}}>
                <div style={{width:7,height:7,borderRadius:"50%",background:c}}/>
                <span style={{fontSize:10,color:"#7a6050"}}>{l}</span>
              </div>
            ))}
          </Sec>

          <Sec title="图结构统计">
            <Mono>|V| = {NODES.length} 节点{"\n"}|E| = {EDGES.length} 有向边{"\n"}类型: DAG{"\n"}存储: 邻接表</Mono>
          </Sec>

          <Sec title="复杂度">
            <Mono color="#5a7040">BFS/DFS: O(V+E){"\n"}邻接表: O(V+E)</Mono>
          </Sec>

          {mode!=="explore" && (
            <Sec title="步骤控制">
              {steps.length===0 ? (
                <div style={{fontSize:10,color:"#3a2e20",lineHeight:1.8,fontStyle:"italic"}}>
                  点击节点<br/>开始{mode==="bfs"?"广度":"深度"}优先遍历
                </div>
              ) : (
                <>
                  <div style={{display:"flex",gap:4,marginBottom:6}}>
                    {[["◀",()=>setSi(Math.max(0,si-1))],[playing?"⏸":"▶",()=>setPlaying(p=>!p)],["▶",()=>setSi(Math.min(steps.length-1,si+1))]].map(([icon,fn],i)=>(
                      <button key={i} onClick={fn} style={{
                        flex:1,padding:"5px 0",fontSize:12,
                        background:"rgba(200,160,69,.1)",color:"#c8a045",
                        border:"1px solid rgba(200,160,69,.3)",borderRadius:3,
                      }}>{icon}</button>
                    ))}
                  </div>
                  <div style={{fontSize:10,color:"#3a2e20",textAlign:"center",marginBottom:6}}>
                    步骤 {si+1} / {steps.length}
                  </div>
                  <button onClick={()=>{setSteps([]);setSi(0);setPlaying(false)}} style={{
                    width:"100%",padding:"4px",fontSize:10,background:"transparent",
                    color:"#3a2e20",border:"1px solid rgba(200,160,69,.1)",borderRadius:3,
                  }}>重置</button>
                </>
              )}
            </Sec>
          )}
        </aside>

        {/* CENTER */}
        <main style={{flex:1,overflow:"hidden",position:"relative",background:"#06080d"}}>
          {tab==="graph" ? (
            <svg viewBox="0 0 920 580" style={{width:"100%",height:"100%"}} xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="45" height="45" patternUnits="userSpaceOnUse">
                  <path d="M 45 0 L 0 0 0 45" fill="none" stroke="rgba(200,160,69,.04)" strokeWidth=".6"/>
                </pattern>
                {[["a0","rgba(200,160,69,.2)"],["aD","rgba(200,160,69,.7)"],["aA","#ff4136"]].map(([id,fill])=>(
                  <marker key={id} id={id} markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                    <path d="M0,0 L0,6 L6,3z" fill={fill}/>
                  </marker>
                ))}
              </defs>
              <rect width="920" height="580" fill="url(#grid)"/>

              {/* Era lines */}
              {[["先秦以前",68],["春秋汉代",188],["两汉时期",308],["隋唐时期",424],["宋朝以降",530]].map(([l,y],i)=>(
                <g key={i}>
                  <line x1="12" y1={y} x2="910" y2={y} stroke="rgba(200,160,69,.04)" strokeWidth=".8" strokeDasharray="3,7"/>
                  <text x="908" y={y-6} textAnchor="end" fontSize="10" fill="rgba(200,160,69,.17)"
                    fontFamily='"Noto Serif SC"' letterSpacing="2">{l}</text>
                </g>
              ))}

              {/* Edges */}
              {EDGES.map((e,i)=>{
                const st=eState(e.from,e.to)
                const [clr,sw,mk]=st==="active"?["#ff4136",2.5,"aA"]:st==="done"?["rgba(200,160,69,.6)",1.5,"aD"]:["rgba(200,160,69,.14)",1,"a0"]
                return <path key={i} d={edgePath(e.from,e.to)} fill="none" stroke={clr} strokeWidth={sw}
                  markerEnd={`url(#${mk})`} style={{transition:"stroke .35s,stroke-width .35s"}}/>
              })}

              {/* Nodes */}
              {NODES.map(node=>{
                const p=POS[node.id]; const st=nState(node.id)
                const cc=CAT[node.cat]?.color??"#c8a045"
                const rc=st==="current"?"#ff4136":st==="visited"?"#c8a045":st==="queued"?"#4a90d9":st==="stacked"?"#2ecc71":cc
                const rw=st!=="idle"?2.5:1.5; const isSel=sel===node.id
                const nm=node.name; const nl=nm.length
                return (
                  <g key={node.id} transform={`translate(${p.x},${p.y})`} onClick={()=>onNode(node.id)} style={{cursor:"pointer"}}>
                    {st==="current"&&<circle r={R+14} fill="#ff4136" opacity=".06">
                      <animate attributeName="r" values={`${R+10};${R+20};${R+10}`} dur=".9s" repeatCount="indefinite"/>
                      <animate attributeName="opacity" values="0.07;0.02;0.07" dur=".9s" repeatCount="indefinite"/>
                    </circle>}
                    {(st!=="idle"||isSel)&&<circle r={R+7} fill={isSel&&st==="idle"?"#c8a045":rc} opacity=".1"/>}
                    <circle r={R} fill="#0b0d14"/>
                    <circle r={R} fill="none" stroke={rc} strokeWidth={rw} style={{transition:"stroke .3s"}}/>
                    <circle r={4} fill={cc} opacity=".85"/>
                    {nl<=3&&<text y="3" textAnchor="middle" fontSize="11" fill="#e8dcc8" fontFamily='"Noto Serif SC"' fontWeight="700">{nm}</text>}
                    {nl===4&&<text y="3" textAnchor="middle" fontSize="9.5" fill="#e8dcc8" fontFamily='"Noto Serif SC"' fontWeight="700">{nm}</text>}
                    {nl>4&&<>
                      <text y="-6" textAnchor="middle" fontSize="9" fill="#e8dcc8" fontFamily='"Noto Serif SC"' fontWeight="700">{nm.slice(0,4)}</text>
                      <text y="5"  textAnchor="middle" fontSize="9" fill="#e8dcc8" fontFamily='"Noto Serif SC"' fontWeight="700">{nm.slice(4)}</text>
                    </>}
                    <text y={R+13} textAnchor="middle" fontSize="8" fill="rgba(200,160,69,.38)" fontFamily='"JetBrains Mono"'>
                      {node.year<0?`${Math.abs(node.year)}BC`:`${node.year}AD`}
                    </text>
                  </g>
                )
              })}
            </svg>
          ) : (
            /* Adjacency List View */
            <div style={{padding:"20px 24px",overflow:"auto",height:"100%",fontFamily:'"JetBrains Mono",monospace'}}>
              <div style={{fontSize:10.5,color:"#2e2518",letterSpacing:2,marginBottom:14,borderBottom:"1px solid rgba(200,160,69,.08)",paddingBottom:10}}>
                邻接表 · HashMap&lt;String, List&lt;String&gt;&gt;  —  空间复杂度 O(V+E)
              </div>
              {NODES.map(node=>{
                const nbrs=ADJ[node.id]; const isCur=step?.cur===node.id; const isVis=step?.visited?.has(node.id)
                return (
                  <div key={node.id} onClick={()=>onNode(node.id)} style={{
                    display:"flex",alignItems:"flex-start",gap:14,
                    padding:"6px 10px",marginBottom:3,borderRadius:5,cursor:"pointer",
                    background:isCur?"rgba(255,65,54,.08)":isVis?"rgba(200,160,69,.05)":"transparent",
                    borderLeft:`2.5px solid ${isCur?"#ff4136":isVis?"rgba(200,160,69,.4)":"transparent"}`,
                    transition:"all .3s",
                  }}>
                    <span style={{color:CAT[node.cat]?.color,minWidth:110,fontSize:11}}>{node.id}</span>
                    <span style={{color:"rgba(200,160,69,.25)"}}>→</span>
                    <span style={{fontSize:11}}>
                      <span style={{color:"rgba(200,160,69,.2)"}}>[</span>
                      {nbrs.length===0
                        ? <span style={{color:"rgba(200,160,69,.15)"}}> ∅ </span>
                        : nbrs.map((n,i)=>(
                          <span key={n}>
                            <span style={{color:step?.fresh?.includes(n)?"#ff4136":step?.visited?.has(n)?"#c8a045":"#5a8ab8"}}>{n}</span>
                            {i<nbrs.length-1&&<span style={{color:"rgba(200,160,69,.2)"}}>, </span>}
                          </span>
                        ))
                      }
                      <span style={{color:"rgba(200,160,69,.2)"}}> ]</span>
                    </span>
                    <span style={{marginLeft:"auto",color:"rgba(200,160,69,.18)",fontSize:10}}>{node.name}</span>
                  </div>
                )
              })}
            </div>
          )}

          {mode!=="explore"&&steps.length===0&&(
            <div style={{
              position:"absolute",bottom:16,left:"50%",transform:"translateX(-50%)",
              background:"rgba(8,6,4,.95)",border:`1px solid rgba(${modeColor},.35)`,
              padding:"8px 18px",borderRadius:6,fontSize:12,color:`rgb(${modeColor})`,
              pointerEvents:"none",letterSpacing:1,
            }}>
              {mode==="bfs"?"⬛ 点击任意节点，开始广度优先搜索 BFS":"🔺 点击任意节点，开始深度优先搜索 DFS"}
            </div>
          )}
        </main>

        {/* RIGHT: Detail panel */}
        <aside style={{
          width:228,flexShrink:0,background:"rgba(8,6,4,.94)",
          borderLeft:"1px solid rgba(200,160,69,.1)",
          padding:16,display:"flex",flexDirection:"column",gap:11,overflow:"auto",
        }}>
          {selD ? (
            <div style={{animation:"fadeIn .3s ease"}}>
              <div style={{borderBottom:"1px solid rgba(200,160,69,.15)",paddingBottom:12,marginBottom:12}}>
                <div style={{fontFamily:'"ZCOOL XiaoWei",serif',fontSize:24,letterSpacing:2,color:CAT[selD.cat]?.color??"#c8a045",marginBottom:3}}>{selD.name}</div>
                <div style={{fontSize:10,color:"rgba(200,160,69,.35)",letterSpacing:3}}>{selD.en}</div>
              </div>
              <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:11}}>
                {[[selD.era,"rgba(200,160,69,.08)","rgba(200,160,69,.25)","#c8a045"],
                  [selD.year<0?`${Math.abs(selD.year)} BC`:`${selD.year} AD`,"rgba(200,160,69,.04)","rgba(200,160,69,.12)","#7a6040"],
                  [CAT[selD.cat]?.label,`${CAT[selD.cat]?.color}18`,`${CAT[selD.cat]?.color}40`,CAT[selD.cat]?.color]
                ].map(([txt,bg,border,col],i)=>(
                  <span key={i} style={{padding:"3px 8px",background:bg,border:`1px solid ${border}`,borderRadius:3,fontSize:10.5,color:col,fontFamily:i===1?'"JetBrains Mono"':"inherit"}}>{txt}</span>
                ))}
              </div>
              <div style={{marginBottom:10}}>
                <div style={{fontSize:9,color:"#2e2518",letterSpacing:2,marginBottom:3}}>发明者</div>
                <div style={{fontSize:12,color:"#8a7050"}}>{selD.inv}</div>
              </div>
              <div style={{marginBottom:11}}>
                <div style={{fontSize:9,color:"#2e2518",letterSpacing:2,marginBottom:4}}>简介</div>
                <div style={{fontSize:10.5,color:"#6a5840",lineHeight:1.85}}>{selD.desc}</div>
              </div>
              <div style={{background:"rgba(200,160,69,.04)",borderLeft:"2px solid rgba(200,160,69,.4)",padding:"8px 10px",borderRadius:"0 4px 4px 0",marginBottom:12}}>
                <div style={{fontSize:9,color:"#2e2518",letterSpacing:2,marginBottom:3}}>历史意义</div>
                <div style={{fontSize:11,color:"#c8a045",lineHeight:1.75}}>{selD.sig}</div>
              </div>
              <div>
                <div style={{fontSize:9,color:"#2e2518",letterSpacing:2,marginBottom:6}}>图关系 Graph Relations</div>
                <div style={{fontFamily:'"JetBrains Mono"',fontSize:10,color:"#3a2e20",marginBottom:7,display:"flex",gap:14}}>
                  <span>in-deg: <span style={{color:"#4a90d9"}}>{RADJ[selD.id].length}</span></span>
                  <span>out-deg: <span style={{color:"#c8a045"}}>{ADJ[selD.id].length}</span></span>
                </div>
                {RADJ[selD.id].length>0&&<div style={{marginBottom:7}}>
                  <div style={{fontSize:9,color:"rgba(74,144,217,.55)",marginBottom:4}}>前驱节点 ←</div>
                  <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
                    {RADJ[selD.id].map(id=><span key={id} onClick={()=>onNode(id)} style={{padding:"2px 6px",background:"rgba(74,144,217,.08)",border:"1px solid rgba(74,144,217,.28)",borderRadius:3,fontSize:10,color:"#4a90d9",cursor:"pointer"}}>{NMAP[id]?.name}</span>)}
                  </div>
                </div>}
                {ADJ[selD.id].length>0&&<div>
                  <div style={{fontSize:9,color:"rgba(200,160,69,.55)",marginBottom:4}}>后继节点 →</div>
                  <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
                    {ADJ[selD.id].map(id=><span key={id} onClick={()=>onNode(id)} style={{padding:"2px 6px",background:"rgba(200,160,69,.08)",border:"1px solid rgba(200,160,69,.28)",borderRadius:3,fontSize:10,color:"#c8a045",cursor:"pointer"}}>{NMAP[id]?.name}</span>)}
                  </div>
                </div>}
              </div>
            </div>
          ) : (
            <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:14,color:"#1e1810"}}>
              <svg width="56" height="56" viewBox="0 0 56 56">
                <polygon points="28,4 52,18 52,38 28,52 4,38 4,18" fill="none" stroke="rgba(200,160,69,.12)" strokeWidth="1.2"/>
                <circle cx="28" cy="28" r="5" fill="none" stroke="rgba(200,160,69,.18)" strokeWidth="1"/>
              </svg>
              <div style={{fontSize:12,textAlign:"center",lineHeight:2,letterSpacing:1}}>点击图中节点<br/>查看发明详情</div>
              <div style={{fontSize:10,color:"#1a1410",textAlign:"center",lineHeight:1.8}}>
                {mode==="explore"&&"探索模式：自由浏览图谱"}
                {mode==="bfs"&&"BFS：点击起始节点"}
                {mode==="dfs"&&"DFS：点击起始节点"}
              </div>
            </div>
          )}
        </aside>
      </div>

      {/* ══ BOTTOM: DS VISUALIZER ══ */}
      {step&&mode!=="explore"&&(
        <div style={{
          background:"rgba(5,6,10,.97)",borderTop:"1px solid rgba(200,160,69,.1)",
          padding:"8px 20px",display:"flex",gap:16,alignItems:"center",
          flexShrink:0,minHeight:66,
        }}>
          <div style={{fontSize:10,color:"#2a2018",letterSpacing:2,minWidth:68,flexShrink:0}}>
            {mode==="bfs"
              ?<><span style={{color:"#4a90d9",fontSize:11}}>Queue</span><br/><span style={{fontSize:9}}>FIFO 队列</span></>
              :<><span style={{color:"#2ecc71",fontSize:11}}>Stack</span><br/><span style={{fontSize:9}}>LIFO 栈</span></>
            }
          </div>
          <div style={{display:"flex",gap:5,flex:1,overflow:"auto",alignItems:"center",paddingBottom:2}}>
            {(()=>{
              const items=mode==="bfs"?step.queue:[...(step.stack??[])].reverse()
              const col=mode==="bfs"?"#4a90d9":"#2ecc71"
              if(!items||!items.length) return <span style={{fontSize:11,color:"rgba(200,160,69,.2)",fontFamily:'"JetBrains Mono"'}}>[ empty ]</span>
              return items.map((id,i)=>(
                <div key={`${id}-${i}`} style={{
                  display:"flex",flexDirection:"column",alignItems:"center",gap:1,
                  padding:"4px 9px",borderRadius:4,flexShrink:0,
                  background:`${col}12`,border:`1px solid ${i===0?col+"85":col+"22"}`,
                }}>
                  <span style={{fontSize:11,color:col,fontFamily:'"Noto Sans SC"',letterSpacing:1}}>{NMAP[id]?.name}</span>
                  {i===0&&<span style={{fontSize:8,color:`${col}60`}}>{mode==="bfs"?"front":"top"}</span>}
                </div>
              ))
            })()}
          </div>
          <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",minWidth:104,flexShrink:0}}>
            <div style={{fontSize:9,color:"#2a2018",letterSpacing:2,marginBottom:2}}>正在访问</div>
            <div style={{fontSize:15,fontFamily:'"ZCOOL XiaoWei",serif',letterSpacing:2,color:"#ff4136",textShadow:"0 0 10px #ff413670"}}>{NMAP[step.cur]?.name}</div>
            <div style={{fontSize:9,color:"rgba(255,65,54,.4)",fontFamily:'"JetBrains Mono"'}}>{NMAP[step.cur]?.era}</div>
          </div>
          <div style={{borderLeft:"1px solid rgba(200,160,69,.08)",paddingLeft:14,flexShrink:0,textAlign:"center"}}>
            <div style={{fontSize:22,fontFamily:'"ZCOOL XiaoWei",serif',color:"#c8a045",lineHeight:1}}>{step.visited.size}</div>
            <div style={{fontSize:9,color:"#2a2018",letterSpacing:1}}>已访问</div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Helper micro-components ── */
function Sec({title,children}){
  return (
    <div style={{borderTop:"1px solid rgba(200,160,69,.08)",paddingTop:9}}>
      <div style={{fontSize:9.5,color:"#3a2e18",letterSpacing:2,marginBottom:6}}>{title}</div>
      {children}
    </div>
  )
}
function Mono({children,color="#5a4830"}){
  return <div style={{fontFamily:'"JetBrains Mono"',fontSize:10,color,lineHeight:2,whiteSpace:"pre"}}>{children}</div>
}
