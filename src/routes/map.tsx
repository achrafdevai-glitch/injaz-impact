import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Flag, Users, MapPinned, SlidersHorizontal, Sparkles, LocateFixed, Plus, Minus, ArrowUp, Navigation } from "lucide-react";
import { ALGERIA_OUTLINE, CATEGORIES, CHALLENGES, WILAYAS, wilayaName, type Category, type Challenge } from "@/lib/data";
import { ChallengeSheet } from "@/components/ChallengeSheet";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import walkImage from "@/assets/algiers-walk.jpg";

export const Route = createFileRoute("/map")({
  head: () => ({ meta: [
    { title: "خريطة الأثر — إنجاز" },
    { name: "description", content: "خريطة تفاعلية للجزائر بـ58 ولاية تعرض المبادرات التطوعية النشطة." },
    { property: "og:title", content: "خريطة الأثر — إنجاز" },
    { property: "og:description", content: "اكتشف المبادرات التطوعية في ولايتك." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: ImpactMap,
});
const px = (lng: number) => ((lng + 9) / 21) * 1000;
const py = (lat: number) => ((37.5 - lat) / 19) * 1030;
const INITIAL_VIEW = { k: 1, x: 0, y: 0 };
const CAT_COLOR: Record<Category, string> = { env: "var(--emerald)", edu: "var(--map-education)", health: "var(--destructive)", social: "var(--gold)", culture: "var(--map-culture)" };

function ImpactMap() {
  const { t, lang } = useI18n();
  const { s } = useStore();
  const [cat, setCat] = useState<Category | "all">("all");
  const [sel, setSel] = useState<number | null>(16);
  const [open, setOpen] = useState<Challenge | null>(null);
  const [filters, setFilters] = useState(false);
  const [view, setView] = useState(INITIAL_VIEW);
  const drag = useRef<{ x: number; y: number; vx: number; vy: number; moved: boolean } | null>(null);
  const outline = useMemo(() => ALGERIA_OUTLINE.map(([lng, lat]) => `${px(lng)},${py(lat)}`).join(" "), []);
  const shown = CHALLENGES.filter((c) => cat === "all" || c.category === cat);
  const byW = new Map<number, Challenge[]>();
  shown.forEach((c) => byW.set(c.wilaya, [...(byW.get(c.wilaya) ?? []), c]));
  const selW = WILAYAS.find((w) => w[0] === sel);
  const selList = sel ? byW.get(sel) ?? [] : [];
  const home = WILAYAS.find((w) => w[0] === s.wilaya) ?? WILAYAS[0];
  const [photo, setPhoto] = useState<string>(walkImage);
  useEffect(() => { setPhoto(selW ? `/wilayas/${String(selW[0]).padStart(2, "0")}.jpg` : walkImage); }, [selW]);
  const zoom = (f: number) => setView((v) => ({ ...v, k: Math.min(5, Math.max(0.5, v.k * f)) }));
  const locate = () => {
    setSel(s.wilaya);
    if (home) setView({ k: 2, x: (500 - px(home[4])) * 0.45, y: (515 - py(home[3])) * 0.45 });
  };
  const discover = () => { const c = shown[Math.floor(Math.random() * shown.length)]; if (c) { setSel(c.wilaya); setOpen(c); } };

  return (
    <main className="map-screen">
      <div className="map-experience">
        <img className="map-street" src={photo} alt={selW ? wilayaName(selW[0], lang) : ""} onError={() => setPhoto("/wilayas/fallback.jpg")} width={768} height={1344} />
        <div className="map-street-shade" />
        <header className="map-heading"><span>إنجاز</span><h1>{t("map")}</h1><span className="map-heading-dot" /></header>
        <div className="map-statistics">
          {[
            { Icon: Flag, l: t("active"), v: shown.length, c: "text-gold" },
            { Icon: Users, l: t("participants"), v: shown.reduce((a, c) => a + c.participants, 0), c: "text-map-education" },
            { Icon: MapPinned, l: t("wilaya"), v: `${byW.size}/58`, c: "text-emerald" },
          ].map(({ Icon, l, v, c }) => <div key={l} className="map-stat"><span className={`map-stat-icon ${c}`}><Icon size={19} /></span><div><p>{l}</p><strong>{v}</strong></div></div>)}
        </div>

        <div className="map-ar-route" aria-hidden="true"><div className="map-ar-ribbon" />{[0,1,2,3,4,5,6].map((i) => <span key={i} className={`map-ar-arrow map-ar-arrow-${i}`} />)}</div>
        {selW && <div className="map-direction-card"><span className="map-direction-icon"><ArrowUp size={21} /></span><div><strong>{wilayaName(selW[0], lang)}</strong><p>{selList.length} {t("initiatives")}</p></div></div>}
        <div className="map-zoom"><Button variant="ghost" size="icon" className="map-glass-control" aria-label="تكبير" onClick={() => zoom(1.3)}><Plus /></Button><Button variant="ghost" size="icon" className="map-glass-control" aria-label="تصغير" onClick={() => zoom(1/1.3)}><Minus /></Button></div>

        <section className="map-lower">
          <div className="map-arc-edge" />
          <div className="map-national-badge"><Navigation size={22}/><strong>{selW ? String(selW[0]).padStart(2,"0") : "58"}</strong><span>{t("wilaya")}</span></div>
          <div className="map-compass" aria-hidden="true"><span>N</span><Navigation size={20}/><span>S</span></div>
          <div className="map-canvas" onWheel={(e) => zoom(e.deltaY < 0 ? 1.08 : 1/1.08)}
            onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); drag.current = { x:e.clientX,y:e.clientY,vx:view.x,vy:view.y,moved:false }; }}
            onPointerMove={(e) => { const d=drag.current; if(d) { d.moved ||= Math.abs(e.clientX-d.x)+Math.abs(e.clientY-d.y)>4; setView((v)=>({...v,x:d.vx+e.clientX-d.x,y:d.vy+e.clientY-d.y})); } }}
            onPointerUp={() => { drag.current=null; }} onPointerCancel={() => { drag.current=null; }}>
            <svg viewBox="-80 -60 1160 1150" className="map-algeria" role="group" aria-label="الجزائر — 58 ولاية" style={{ transform:`translate(${view.x}px,${view.y}px) scale(${view.k})` }}>
              <defs><pattern id="map-grid" width="62" height="62" patternUnits="userSpaceOnUse"><path d="M62 0H0V62" fill="none" stroke="var(--map-grid)" strokeWidth="3"/><path d="M0 25H62M25 0V62" fill="none" stroke="var(--map-grid)" strokeWidth="1"/></pattern></defs>
              <rect x="-1500" y="-1500" width="4000" height="4000" fill="var(--map-land)"/>
              <rect x="-1500" y="-1500" width="4000" height="4000" fill="url(#map-grid)"/>
              <polygon points={outline} fill="var(--map-country)" stroke="var(--forest)" strokeOpacity="0.5" strokeWidth="4" strokeLinejoin="round"/>
              {home && selW && <path d={`M${px(home[4])},${py(home[3])} Q${(px(home[4])+px(selW[4]))/2},${Math.min(py(home[3]),py(selW[3]))-100} ${px(selW[4])},${py(selW[3])}`} fill="none" stroke="var(--emerald)" strokeWidth="10" strokeLinecap="round"/>}
              {WILAYAS.map(([code,,,lat,lng])=>{
                const items=byW.get(code); const first=items?.[0]; const x=px(lng),y=py(lat),active=code===sel;
                return <g key={code} role="button" tabIndex={0} aria-label={`${wilayaName(code,lang)} — ${items?.length ?? 0} ${t("initiatives")}`} aria-pressed={active} onPointerDown={(e)=>e.stopPropagation()} onClick={()=>setSel(code)} onKeyDown={(e)=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();setSel(code);}}} className="map-marker">
                  <circle cx={x} cy={y} r="24" fill="transparent"/>
                  {first ? <><circle cx={x} cy={y} r={active?34:26} fill={CAT_COLOR[first.category]} opacity="0.18"/><circle cx={x} cy={y} r={active?20:16} fill={CAT_COLOR[first.category]} stroke="var(--map-paper)" strokeWidth="4"/><text x={x} y={y+5} textAnchor="middle" fontSize="15" fontWeight="800" fill="var(--map-paper)">{items?.length}</text></> : <circle cx={x} cy={y} r={active?13:7} fill="var(--forest)" opacity={active?1:0.5}/>}
                  {active && <text x={x} y={y-42} textAnchor="middle" fontSize="25" fontWeight="800" fill="var(--ink)">{wilayaName(code,lang)}</text>}
                </g>;
              })}
              {home && <><circle cx={px(home[4])} cy={py(home[3])} r="18" fill="var(--map-education)" opacity="0.2"/><circle cx={px(home[4])} cy={py(home[3])} r="8" fill="var(--map-education)" stroke="var(--map-paper)" strokeWidth="3"/></>}
            </svg>
          </div>
          <div className="map-initiative-list no-scrollbar">{selList.length ? selList.map((c)=><Button variant="ghost" key={c.id} className="map-initiative" onClick={()=>setOpen(c)}><Flag size={14}/><span>{c.title}</span><strong>+{c.xp} XP</strong></Button>) : <span className="map-empty">{lang==="ar"?"لا توجد مبادرات بعد":lang==="fr"?"Aucune initiative":"No initiatives yet"}</span>}</div>
          {filters && <div className="map-filters no-scrollbar">{[{id:"all" as const,emoji:"✨"},...CATEGORIES].map((c)=><Button key={c.id} variant="ghost" className={`map-filter ${cat===c.id?"map-filter-active":""}`} onClick={()=>setCat(c.id)}>{c.emoji} {t(c.id)}</Button>)}</div>}
          <div className="map-bottom-controls"><Button variant="ghost" size="icon" className="map-glass-control" aria-label="فلاتر" aria-expanded={filters} onClick={()=>setFilters(!filters)}><SlidersHorizontal/></Button><Button variant="ghost" className="map-glass-control map-text-control" onClick={locate}>{t("nearby")}</Button><Button variant="ghost" className="map-center-control" aria-label="مبادرة عشوائية" onClick={discover}><Sparkles/></Button><Button variant="ghost" className="map-glass-control map-text-control" onClick={()=>{setView(INITIAL_VIEW);setSel(null);}}>{t("national")}</Button><Button variant="ghost" size="icon" className="map-glass-control" aria-label="موقعي" onClick={locate}><LocateFixed/></Button></div>
        </section>
      </div>
      <ChallengeSheet c={open} onClose={()=>setOpen(null)}/>
    </main>
  );
}
