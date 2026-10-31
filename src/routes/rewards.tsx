import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Rocket, Hourglass } from "lucide-react";
import { Screen, TopBar } from "@/components/Screen";
import { REWARDS, tierFromXp } from "@/lib/data";
import { useI18n } from "@/lib/i18n";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/rewards")({
  head: () => ({
    meta: [
      { title: "المكافآت — إنجاز" },
      { name: "description", content: "استبدل نقاطك التطوعية بمكافآت من شركاء إنجاز." },
      { property: "og:title", content: "مكافآت إنجاز" },
      { property: "og:description", content: "نقاطك التطوعية تتحول إلى مكافآت حقيقية." },
    ],
  }),
  component: Rewards,
});

function GoldBadge() {
  return (
    <svg viewBox="0 0 120 140" className="h-32 w-28 drop-shadow-[0_10px_30px_oklch(0.78_0.16_72/0.45)]" aria-hidden>
      <path d="M38 88 L24 130 L42 120 L52 136 L60 96Z" fill="oklch(0.6 0.15 45)" />
      <path d="M82 88 L96 130 L78 120 L68 136 L60 96Z" fill="oklch(0.55 0.15 40)" />
      <path d="M60 6 L104 30 L104 80 L60 104 L16 80 L16 30Z" fill="oklch(0.82 0.16 85)" />
      <path d="M60 18 L94 37 L94 74 L60 93 L26 74 L26 37Z" fill="oklch(0.74 0.16 72)" />
      <path d="M60 34 L66 50 L83 50 L69 60 L74 77 L60 67 L46 77 L51 60 L37 50 L54 50Z" fill="oklch(0.88 0.14 90)" />
    </svg>
  );
}

function Rewards() {
  const { t } = useI18n();
  const { s, redeem } = useStore();
  const [tab, setTab] = useState<"earn" | "use" | "perks">("use");
  const { tier, next } = tierFromXp(s.xp);
  const pct = next ? (s.xp - tier.min) / (next.min - tier.min) : 1;

  return (
    <div className="min-h-screen bg-night text-on-dark">
      <Screen>
        <TopBar title={t("rewards")} back="/profile" />
        <section className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
          <div className="min-w-0">
            <h1 className="font-display text-5xl font-black text-gold">{tier.name}</h1>
            <p className="mt-2 text-lg">{s.points.toLocaleString()} {t("points")} متاحة</p>
            <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-on-dark/15">
              <div className="h-full rounded-full bg-gradient-to-l from-gold to-gold/50" style={{ width: `${pct * 100}%` }} />
            </div>
            <p className="mt-2 text-sm opacity-70">{next ? `${next.min - s.xp} XP للوصول إلى ${next.name}` : "أعلى فئة"}</p>
          </div>
          <GoldBadge />
        </section>

        <div className="mt-6 grid grid-cols-3 border-b border-on-dark/15 text-center">
          {(["earn", "use", "perks"] as const).map((k) => (
            <button key={k} onClick={() => setTab(k)} className={`relative py-3 text-base font-semibold ${tab === k ? "text-gold" : "opacity-70"}`}>
              {t(k)}
              {tab === k && <span className="absolute inset-x-1/3 bottom-0 h-1 rounded-t-full bg-gold" />}
            </button>
          ))}
        </div>

        {tab === "use" && (
          <div className="mt-5 grid grid-cols-2 gap-3">
            {REWARDS.map((r) => {
              const owned = s.redeemed.includes(r.id);
              return (
                <div key={r.id} className="glass-dark flex flex-col rounded-3xl p-4">
                  <div className="text-4xl">{r.emoji}</div>
                  <p className="mt-2 text-sm font-bold leading-snug">{r.title}</p>
                  <p className="text-[11px] opacity-60">{r.partner}</p>
                  <button
                    disabled={owned}
                    onClick={() => (redeem(r.id, r.cost) ? toast.success(t("redeemed")) : toast.error(t("notEnough")))}
                    className="press mt-auto rounded-full border border-on-dark/60 py-2 text-xs font-bold disabled:border-gold disabled:text-gold"
                    style={{ marginTop: 12 }}
                  >
                    {owned ? `✓ ${t("redeemed")}` : `${t("redeem")} · ${r.cost}`}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {tab === "earn" && (
          <div className="mt-5 space-y-4">
            <div className="relative overflow-hidden rounded-3xl bg-ink p-5">
              <div className="absolute -end-6 top-4 h-28 w-28 rotate-12 rounded-3xl bg-gradient-to-br from-emerald via-gold to-destructive opacity-80 blur-[2px]" />
              <p className="relative max-w-[60%] text-2xl font-bold leading-snug">نقاط مضاعفة ×2 لمبادرات البيئة هذا الأسبوع</p>
              <a href="/challenges" className="press relative mt-4 inline-block rounded-full border border-on-dark px-5 py-2 text-sm font-semibold">اكتشف</a>
            </div>
            <h2 className="text-xl font-bold">تعزيز النقاط</h2>
            <p className="-mt-3 text-sm opacity-60">يُطبَّق أعلى معدل كسب تلقائياً</p>
            {[
              ["×3 نقاط لمدة 3 أيام", "التبرع بالدم في قسنطينة", "3"],
              ["×1.5 نقاط", "التحديات الجماعية لأكثر من 100 مشارك", "7"],
            ].map(([a, b, d]) => (
              <div key={a} className="rounded-3xl border border-on-dark/20 p-5">
                <p className="flex items-center gap-1.5 text-sm text-emerald"><Rocket className="h-4 w-4" /> مُعزَّز</p>
                <p className="mt-2 text-xl font-bold">{a}</p>
                <p className="mt-1 text-sm opacity-70">{b}</p>
                <p className="mt-3 flex items-center gap-1 text-sm"><Hourglass className="h-4 w-4" /> ينتهي خلال {d} أيام</p>
              </div>
            ))}
          </div>
        )}

        {tab === "perks" && (
          <ul className="mt-5 space-y-3">
            {["أولوية التسجيل في القوافل الكبرى", "شهادة تطوع رقمية موثقة", "دعوات لفعاليات الشركاء", "شارة ذهبية على ملفك"].map((p) => (
              <li key={p} className="glass-dark rounded-2xl p-4 text-sm font-semibold">✦ {p}</li>
            ))}
          </ul>
        )}
      </Screen>
    </div>
  );
}
