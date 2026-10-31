import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Crown } from "lucide-react";
import { Screen, TopBar } from "@/components/Screen";
import { LEADERS, wilayaName } from "@/lib/data";
import { useI18n } from "@/lib/i18n";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/leaderboard")({
  head: () => ({
    meta: [
      { title: "المتصدرون — إنجاز" },
      { name: "description", content: "ترتيب المتطوعين الأكثر أثراً وطنياً وعلى مستوى الولايات." },
      { property: "og:title", content: "لوحة المتصدرين — إنجاز" },
      { property: "og:description", content: "تنافس مع متطوعي الجزائر واصعد في الترتيب." },
    ],
  }),
  component: Leaderboard,
});

function Leaderboard() {
  const { t, lang } = useI18n();
  const { s } = useStore();
  const [scope, setScope] = useState<"national" | "wilaya">("national");
  const me = { name: s.name + " (أنت)", wilaya: s.wilaya, xp: s.xp, me: true };
  const pool = [...LEADERS.map((l) => ({ ...l, me: false })), me]
    .filter((l) => scope === "national" || l.wilaya === s.wilaya)
    .sort((a, b) => b.xp - a.xp);
  const top = pool.slice(0, 3);
  const podium = [top[1], top[0], top[2]];

  return (
    <Screen>
      <TopBar title={t("leaders")} />
      <div className="mx-auto flex w-fit rounded-full bg-forest p-1 shadow-soft">
        {(["national", "wilaya"] as const).map((k) => (
          <button key={k} onClick={() => setScope(k)} className={`press rounded-full px-6 py-2 text-sm font-bold ${scope === k ? "bg-gold text-ink" : "text-on-dark/80"}`}>
            {k === "national" ? t("national") : `${t("wilaya")} ${wilayaName(s.wilaya, lang)}`}
          </button>
        ))}
      </div>

      <section className="bg-hero mt-6 flex items-end justify-center gap-3 rounded-[30px] px-4 pb-5 pt-8 text-on-dark shadow-float">
        {podium.map((p, i) =>
          p ? (
            <div key={p.name} className="flex flex-1 flex-col items-center">
              {i === 1 && <Crown className="mb-1 h-6 w-6 text-gold" />}
              <div className={`grid place-items-center rounded-full border-2 border-gold/80 bg-on-dark/15 font-extrabold ${i === 1 ? "h-20 w-20 text-2xl" : "h-14 w-14 text-lg"}`}>
                {p.name[0]}
              </div>
              <p className="mt-2 w-full truncate text-center text-xs font-bold">{p.name}</p>
              <p className="text-[11px] opacity-75">{p.xp.toLocaleString()} XP</p>
              <div className={`glass-dark mt-2 grid w-full place-items-center rounded-t-2xl font-display text-xl font-black ${i === 1 ? "h-20" : i === 0 ? "h-14" : "h-10"}`}>
                {i === 1 ? 1 : i === 0 ? 2 : 3}
              </div>
            </div>
          ) : <div key={i} className="flex-1" />,
        )}
      </section>

      <ol className="mt-5 space-y-2">
        {pool.slice(3).map((p, i) => (
          <li key={p.name} className={`glass flex items-center gap-3 rounded-2xl p-3 ${p.me ? "ring-2 ring-emerald" : ""}`}>
            <span className="w-6 text-center font-display font-black text-muted-foreground">{i + 4}</span>
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-mint font-bold text-forest">{p.name[0]}</span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold">{p.name}</p>
              <p className="text-[11px] text-muted-foreground">{wilayaName(p.wilaya, lang)}</p>
            </div>
            <span className="text-sm font-extrabold text-emerald">{p.xp.toLocaleString()}</span>
          </li>
        ))}
      </ol>
    </Screen>
  );
}
