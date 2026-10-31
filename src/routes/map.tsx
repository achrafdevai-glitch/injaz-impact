import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { Flag, Users, MapPinned, SlidersHorizontal, Sparkles, LocateFixed, Plus, Minus } from "lucide-react";
import { ALGERIA_OUTLINE, CATEGORIES, CHALLENGES, WILAYAS, wilayaName, type Category, type Challenge } from "@/lib/data";
import { ChallengeSheet } from "@/components/ChallengeSheet";
import { useI18n } from "@/lib/i18n";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/map")({
  head: () => ({
    meta: [
      { title: "خريطة الأثر — إنجاز" },
      { name: "description", content: "خريطة تفاعلية للجزائر بـ58 ولاية تعرض المبادرات التطوعية النشطة." },
      { property: "og:title", content: "خريطة الأثر — إنجاز" },
      { property: "og:description", content: "اكتشف المبادرات التطوعية في ولايتك." },
    ],
  }),
  component: ImpactMap,
});

const VB_W = 1000;
const VB_H = 1030;
const px = (lng: number) => ((lng + 9) / 21) * VB_W;
const py = (lat: number) => ((37.5 - lat) / 19) * VB_H;

const CAT_COLOR: Record<Category, string> = {
  env: "var(--emerald)",
  edu: "oklch(0.62 0.15 250)",
  health: "oklch(0.62 0.2 20)",
  social: "var(--gold)",
  culture: "oklch(0.6 0.18 310)",
};

function ImpactMap() {
  const { t, lang } = useI18n();
  const { s } = useStore();
  const [cat, setCat] = useState<Category | "all">("all");
  const [sel, setSel] = useState<number | null>(16);
  const [open, setOpen] = useState<Challenge | null>(null);
  const [view, setView] = useState({ k: 0.62, x: 0, y: -70 });
  const drag = useRef<{ x: number; y: number; vx: number; vy: number } | null>(null);

  const outline = useMemo(() => ALGERIA_OUTLINE.map(([lng, lat]) => `${px(lng)},${py(lat)}`).join(" "), []);
  const shown = CHALLENGES.filter((c) => cat === "all" || c.category === cat);
  const byW = new Map<number, Challenge[]>();
  shown.forEach((c) => byW.set(c.wilaya, [...(byW.get(c.wilaya) ?? []), c]));
  const selW = WILAYAS.find((w) => w[0] === sel);
  const selList = sel ? byW.get(sel) ?? [] : [];
  const home = WILAYAS.find((w) => w[0] === s.wilaya)!;

  const zoom = (f: number) => setView((v) => ({ ...v, k: Math.min(5, Math.max(0.5, v.k * f)) }));

  return (
    <div className="fixed inset-0 overflow-hidden bg-[radial-gradient(circle_at_50%_30%,var(--mint),var(--background))] dark:bg-night">
      {/* map canvas */}
      <div
        className="absolute inset-0 touch-none"
        onPointerDown={(e) => {
          (e.target as Element).setPointerCapture?.(e.pointerId);
          drag.current = { x: e.clientX, y: e.clientY, vx: view.x, vy: view.y };
        }}
        onPointerMove={(e) => {
          const d = drag.current;
          if (d) setView((v) => ({ ...v, x: d.vx + (e.clientX - d.x), y: d.vy + (e.clientY - d.y) }));
        }}
        onPointerUp={() => (drag.current = null)}
      >
        <svg
          viewBox={`0 0 ${VB_W} ${VB_H}`}
          className="absolute left-1/2 top-1/2 h-[78vh] w-auto max-w-none"
          style={{ transform: `translate(calc(-50% + ${view.x}px), calc(-50% + ${view.y}px)) scale(${view.k})`, transition: drag.current ? "none" : "transform .35s ease" }}
        >
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M40 0H0V40" fill="none" stroke="var(--forest)" strokeOpacity="0.07" />
            </pattern>
            <linearGradient id="land" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="var(--card)" />
              <stop offset="1" stopColor="var(--mint)" stopOpacity="0.6" />
            </linearGradient>
          </defs>
          <rect x="-500" y="-500" width="2000" height="2000" fill="url(#grid)" />
          <polygon points={outline} fill="url(#land)" stroke="var(--forest)" strokeOpacity="0.35" strokeWidth="3" strokeLinejoin="round" />
          {/* route-like impact line from home wilaya to selected */}
          {selW && (
            <path
              d={`M${px(home[4])},${py(home[3])} Q ${(px(home[4]) + px(selW[4])) / 2},${Math.min(py(home[3]), py(selW[3])) - 80} ${px(selW[4])},${py(selW[3])}`}
              fill="none" stroke="var(--emerald)" strokeWidth="5" strokeLinecap="round" strokeDasharray="2 10"
            />
          )}
          {WILAYAS.map(([code, , , lat, lng]) => {
            const items = byW.get(code);
            const x = px(lng), y = py(lat);
            const isSel = code === sel;
            return (
              <g key={code} onPointerDown={(e) => e.stopPropagation()} onClick={() => setSel(code)} className="cursor-pointer">
                {items ? (
                  <>
                    <circle cx={x} cy={y} r={isSel ? 44 : 34} fill={CAT_COLOR[items[0]!.category]} opacity="0.12" />
                    <circle cx={x} cy={y} r={isSel ? 30 : 22} fill={CAT_COLOR[items[0]!.category]} opacity="0.25" className="animate-pulse" />
                    <circle cx={x} cy={y} r={isSel ? 16 : 12} fill={CAT_COLOR[items[0]!.category]} stroke="var(--card)" strokeWidth="4" />
                    <text x={x} y={y + 5} textAnchor="middle" fontSize="13" fontWeight="800" fill="var(--card)">{items.length}</text>
                  </>
                ) : (
                  <circle cx={x} cy={y} r={isSel ? 12 : 7} fill="var(--forest)" opacity={isSel ? 0.9 : 0.35} />
                )}
              </g>
            );
          })}
          {/* user location */}
          <circle cx={px(home[4])} cy={py(home[3])} r="16" fill="oklch(0.6 0.17 250)" opacity="0.25" />
          <circle cx={px(home[4])} cy={py(home[3])} r="8" fill="oklch(0.6 0.17 250)" stroke="var(--card)" strokeWidth="3" />
        </svg>
      </div>

      {/* top floating stat pills */}
      <div className="absolute inset-x-0 top-0 z-20 mx-auto flex max-w-[560px] gap-2 px-3 pt-[max(14px,env(safe-area-inset-top))]">
        {[
          { Icon: Flag, l: t("active"), v: shown.length, c: "text-gold" },
          { Icon: Users, l: t("participants"), v: shown.reduce((a, c) => a + c.participants, 0), c: "text-emerald" },
          { Icon: MapPinned, l: t("wilaya"), v: `${byW.size}/58`, c: "text-forest dark:text-mint" },
        ].map(({ Icon, l, v, c }) => (
          <div key={l} className="glass flex min-w-0 flex-1 items-center gap-2 rounded-full p-1.5 pe-3">
            <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full border-2 border-current bg-card ${c}`}><Icon className="h-4 w-4" /></span>
            <div className="min-w-0 leading-tight">
              <p className={`truncate text-[11px] font-bold ${c}`}>{l}</p>
              <p className="text-sm font-extrabold">{v}</p>
            </div>
          </div>
        ))}
      </div>

      {/* category filter strip */}
      <div className="no-scrollbar absolute inset-x-0 top-[calc(max(14px,env(safe-area-inset-top))+62px)] z-20 mx-auto flex max-w-[560px] gap-2 overflow-x-auto px-3">
        {[{ id: "all" as const, emoji: "✨" }, ...CATEGORIES].map((c) => (
          <button
            key={c.id}
            onClick={() => setCat(c.id)}
            className={`press shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold ${cat === c.id ? "bg-forest text-on-dark shadow-soft" : "glass"}`}
          >
            {c.emoji} {t(c.id)}
          </button>
        ))}
      </div>

      {/* zoom controls */}
      <div className="absolute end-3 top-1/3 z-20 flex flex-col gap-2">
        <button aria-label="تكبير" onClick={() => zoom(1.3)} className="press glass grid h-11 w-11 place-items-center rounded-full"><Plus className="h-5 w-5" /></button>
        <button aria-label="تصغير" onClick={() => zoom(1 / 1.3)} className="press glass grid h-11 w-11 place-items-center rounded-full"><Minus className="h-5 w-5" /></button>
      </div>

      {/* bottom sheet overlay */}
      <div className="absolute inset-x-0 bottom-[112px] z-20 mx-auto max-w-[560px] px-3">
        {selW && (
          <div className="glass animate-rise mb-3 rounded-[28px] p-4">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-muted-foreground">{t("wilaya")} {String(selW[0]).padStart(2, "0")}</p>
                <h2 className="truncate text-lg font-extrabold">{wilayaName(selW[0], lang)}</h2>
              </div>
              <span className="rounded-full bg-hero px-3 py-1.5 text-sm font-extrabold text-on-dark">{selList.length} {t("initiatives")}</span>
            </div>
            <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto">
              {selList.length ? (
                selList.map((c) => (
                  <button key={c.id} onClick={() => setOpen(c)} className="press shrink-0 rounded-2xl bg-card px-3 py-2 text-start shadow-soft">
                    <p className="max-w-52 truncate text-sm font-bold">{c.title}</p>
                    <p className="text-[11px] font-bold text-gold">+{c.xp} XP · {c.daysLeft} {t("daysLeft")}</p>
                  </button>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">لا توجد مبادرات بعد — كن أول من يطلق واحدة!</p>
              )}
            </div>
          </div>
        )}
        <div className="flex items-center justify-between gap-2">
          <button aria-label="فلاتر" onClick={() => setCat("all")} className="press glass grid h-12 w-12 place-items-center rounded-full"><SlidersHorizontal className="h-5 w-5" /></button>
          <button onClick={() => setSel(s.wilaya)} className="press glass h-12 flex-1 rounded-full text-sm font-bold">{t("nearby")}</button>
          <button
            aria-label="مبادرة عشوائية"
            onClick={() => { const c = shown[Math.floor(Math.random() * shown.length)]; if (c) { setSel(c.wilaya); setOpen(c); } }}
            className="press grid h-16 w-16 shrink-0 place-items-center rounded-full bg-emerald text-on-dark shadow-float ring-4 ring-emerald/25"
          >
            <Sparkles className="h-7 w-7" />
          </button>
          <button onClick={() => setView({ k: 0.62, x: 0, y: -70 })} className="press glass h-12 flex-1 rounded-full text-sm font-bold">{t("national")}</button>
          <button aria-label="موقعي" onClick={() => { setSel(s.wilaya); setView({ k: 2.2, x: 20, y: 330 }); }} className="press glass grid h-12 w-12 place-items-center rounded-full"><LocateFixed className="h-5 w-5" /></button>
        </div>
      </div>
      <ChallengeSheet c={open} onClose={() => setOpen(null)} />
    </div>
  );
}
