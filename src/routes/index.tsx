import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Bell, Search, Flag, Gift, MapPinned, ShieldCheck, ArrowUpLeft } from "lucide-react";
import { Screen, Pill } from "@/components/Screen";
import { ChallengeCard, ChallengeSheet } from "@/components/ChallengeSheet";
import { CHALLENGES, CATEGORIES, levelFromXp, type Challenge, type Category } from "@/lib/data";
import { useI18n } from "@/lib/i18n";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "إنجاز — خطوة منك... أثر في مجتمعك" },
      { name: "description", content: "منصة التطوع الجزائرية: تحديات، خريطة أثر لـ58 ولاية، نقاط ومكافآت." },
      { property: "og:title", content: "إنجاز — منصة التطوع الجزائرية" },
      { property: "og:description", content: "خطوة منك... أثر في مجتمعك" },
    ],
  }),
  component: Home,
});

function Home() {
  const { t } = useI18n();
  const { s } = useStore();
  const [cat, setCat] = useState<Category | "all">("all");
  const [open, setOpen] = useState<Challenge | null>(null);
  const lv = levelFromXp(s.xp);
  const done = s.submissions.filter((x) => x.status === "approved").length;
  const list = CHALLENGES.filter((c) => cat === "all" || c.category === cat).slice(0, 4);

  return (
    <Screen>
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="إنجاز" className="h-12 w-12 rounded-2xl shadow-soft" />
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">INJAZ</p>
            <p className="font-display text-lg font-extrabold leading-tight">إنجاز</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link to="/challenges" aria-label="بحث" className="press glass grid h-11 w-11 place-items-center rounded-full"><Search className="h-5 w-5" /></Link>
          <button aria-label="الإشعارات" className="press glass relative grid h-11 w-11 place-items-center rounded-full">
            <Bell className="h-5 w-5" />
            <span className="absolute end-2.5 top-2.5 h-2 w-2 rounded-full bg-gold" />
          </button>
        </div>
      </header>

      <h1 className="mt-6 font-display text-3xl font-extrabold">{t("hello")} {s.name}!</h1>
      <p className="mt-1 text-sm text-muted-foreground">{t("slogan")}</p>

      {/* Impact balance hero card */}
      <section className="bg-hero animate-rise relative mt-5 overflow-hidden rounded-[30px] p-5 text-on-dark shadow-float">
        <div className="absolute -end-10 -top-10 h-40 w-40 rounded-full bg-emerald/40 blur-3xl" />
        <div className="relative flex items-center justify-center gap-2 text-sm opacity-90">
          {t("impactBalance")}
          <span className="rounded-full bg-gold/90 px-2 py-0.5 text-[11px] font-bold text-ink">{t("level")} {lv.level}</span>
        </div>
        <p className="relative mt-2 text-center font-display text-5xl font-black tracking-tight">{s.points.toLocaleString()}</p>
        <p className="relative text-center text-xs opacity-75">{t("points")} · {s.xp.toLocaleString()} XP</p>
        <div className="relative mt-5 grid grid-cols-4 gap-2">
          {[
            { to: "/challenges" as const, Icon: Flag, l: t("challenges") },
            { to: "/rewards" as const, Icon: Gift, l: t("rewards") },
            { to: "/map" as const, Icon: MapPinned, l: t("map") },
            { to: "/admin" as const, Icon: ShieldCheck, l: t("admin") },
          ].map(({ to, Icon, l }) => (
            <Link key={to} to={to} className="press glass-dark flex flex-col items-center gap-1.5 rounded-2xl py-3">
              <span className="grid h-9 w-9 place-items-center rounded-full border border-on-dark/25"><Icon className="h-4 w-4" /></span>
              <span className="truncate px-1 text-[11px] font-semibold">{l}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* metrics */}
      <section className="mt-4 grid grid-cols-3 gap-3">
        {[
          [s.hours, t("volunteerHours")],
          [done, t("completed")],
          ["#128", t("rank")],
        ].map(([v, l]) => (
          <div key={l as string} className="glass rounded-3xl p-3 text-center">
            <p className="font-display text-2xl font-extrabold text-forest dark:text-mint">{v}</p>
            <p className="mt-0.5 text-[11px] leading-tight text-muted-foreground">{l}</p>
          </div>
        ))}
      </section>

      <div className="mt-7 flex items-center justify-between">
        <h2 className="text-lg font-extrabold">{t("featured")}</h2>
        <Link to="/challenges" className="flex items-center gap-1 text-sm font-semibold text-emerald">{t("seeAll")} <ArrowUpLeft className="h-4 w-4" /></Link>
      </div>
      <div className="no-scrollbar -mx-5 mt-3 flex gap-2 overflow-x-auto px-5">
        <Pill active={cat === "all"} onClick={() => setCat("all")}>{t("all")}</Pill>
        {CATEGORIES.map((c) => (
          <Pill key={c.id} active={cat === c.id} onClick={() => setCat(c.id)}>{c.emoji} {t(c.id)}</Pill>
        ))}
      </div>
      <div className="mt-4 space-y-3">
        {list.map((c) => <ChallengeCard key={c.id} c={c} onOpen={() => setOpen(c)} />)}
      </div>
      <ChallengeSheet c={open} onClose={() => setOpen(null)} />
    </Screen>
  );
}
