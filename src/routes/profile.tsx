import { createFileRoute, Link } from "@tanstack/react-router";
import { BadgeCheck, Settings, Gift, Star, Play, Sparkles, ShieldCheck } from "lucide-react";
import { Screen } from "@/components/Screen";
import { BADGES, CHALLENGES, levelFromXp, tierFromXp, wilayaName } from "@/lib/data";
import { useI18n } from "@/lib/i18n";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "حسابي — إنجاز" },
      { name: "description", content: "ملفك التطوعي: المستوى، الترتيب، الساعات، الأوسمة والأثر المجتمعي." },
      { property: "og:title", content: "ملفي التطوعي — إنجاز" },
      { property: "og:description", content: "تابع تقدمك وأوسمتك في إنجاز." },
    ],
  }),
  component: Profile,
});

function Profile() {
  const { t, lang } = useI18n();
  const { s } = useStore();
  const lv = levelFromXp(s.xp);
  const { tier, next } = tierFromXp(s.xp);
  const done = s.submissions.filter((x) => x.status === "approved").length;
  const impactPeople = done * 37 + s.hours * 3;

  return (
    <Screen>
      {/* Dark glass header card */}
      <section className="animate-rise relative overflow-hidden rounded-[34px] bg-night p-5 text-on-dark shadow-float">
        <div className="absolute -top-16 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-emerald/30 blur-3xl" />
        <div className="relative grid grid-cols-[1fr_auto_1fr] items-center">
          <div className="text-center">
            <p className="font-display text-2xl font-bold">{s.hours}</p>
            <p className="text-[11px] opacity-60">{t("volunteerHours")}</p>
          </div>
          <div className="relative grid h-28 w-28 place-items-center rounded-full border-2 border-on-dark/70 p-1">
            <div className="bg-hero grid h-full w-full place-items-center rounded-full font-display text-4xl font-black">{s.name[0]}</div>
            <span className="absolute -bottom-1 rounded-full bg-gold px-2 py-0.5 text-[10px] font-black text-ink">{t("level")} {lv.level}</span>
          </div>
          <div className="text-center">
            <p className="font-display text-2xl font-bold">{done}</p>
            <p className="text-[11px] opacity-60">{t("completed")}</p>
          </div>
        </div>
        <h1 className="relative mt-4 flex items-center justify-center gap-1.5 text-lg font-bold">
          {s.name} <BadgeCheck className="h-5 w-5 text-emerald" />
        </h1>
        <p className="relative mt-1 text-center text-xs opacity-60">
          متطوع {tier.name} | {wilayaName(s.wilaya, lang)} | {t("rank")} #128
        </p>
        <div className="relative mt-4 grid grid-cols-2 gap-3">
          <Link to="/settings" className="press flex items-center justify-center gap-2 rounded-full border border-on-dark/70 py-2.5 text-sm font-semibold">
            <Settings className="h-4 w-4" /> {t("settings")}
          </Link>
          <Link to="/rewards" className="press flex items-center justify-center gap-2 rounded-full border border-on-dark/70 py-2.5 text-sm font-semibold">
            <Gift className="h-4 w-4" /> {t("rewards")}
          </Link>
        </div>
      </section>

      {/* Bento glass cards */}
      <section className="mt-3 grid grid-cols-2 gap-3">
        <div className="glass flex flex-col items-center rounded-[28px] p-4 text-center">
          <div className="bg-hero grid h-12 w-12 place-items-center rounded-full font-bold text-on-dark">{lv.level}</div>
          <p className="mt-2 text-xs font-bold">{t("level")} {lv.level} · {tier.name}</p>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-emerald" style={{ width: `${lv.progress * 100}%` }} />
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground">{lv.toNext} {t("xpToNext")}</p>
          <Link to="/challenges" className="press mt-3 w-full rounded-full bg-night py-2.5 text-xs font-bold text-on-dark">{t("challenges")}</Link>
        </div>
        <div className="relative grid place-items-center overflow-hidden rounded-[28px] bg-gradient-to-b from-muted to-card p-4 shadow-soft">
          <Star className="h-20 w-20 fill-gold/80 text-gold drop-shadow-xl" strokeWidth={1} />
          <span className="mt-2 flex items-center gap-1 rounded-full bg-night/80 px-2.5 py-1 text-[11px] font-bold text-on-dark">
            <Play className="h-3 w-3" /> {s.xp.toLocaleString()} XP
          </span>
        </div>
        <Link to="/rewards" className="press glass col-span-2 grid grid-cols-[1fr_auto] items-center gap-3 rounded-[28px] p-4">
          <div className="min-w-0">
            <p className="flex items-center gap-1 text-[11px] text-muted-foreground"><Sparkles className="h-3.5 w-3.5" /> {t("impact")}</p>
            <p className="mt-1 text-base font-bold">{impactPeople.toLocaleString()} مستفيد من أثرك</p>
            <p className="mt-1 text-xs text-muted-foreground">{next ? `${next.min - s.xp} XP للوصول إلى ${next.name}` : "أعلى فئة"}</p>
          </div>
          <div className="bg-hero grid h-20 w-24 place-items-center rounded-2xl text-3xl shadow-float">🌍</div>
        </Link>
      </section>

      <h2 className="mt-6 text-lg font-extrabold">{t("badges")}</h2>
      <div className="mt-3 grid grid-cols-3 gap-3">
        {BADGES.map((b) => {
          const got = done >= b.need;
          return (
            <div key={b.id} className={`glass rounded-3xl p-3 text-center ${got ? "" : "opacity-40 grayscale"}`}>
              <div className="text-3xl">{b.emoji}</div>
              <p className="mt-1 text-[11px] font-bold leading-tight">{b.name}</p>
            </div>
          );
        })}
      </div>

      <h2 className="mt-6 text-lg font-extrabold">سجل المساهمات</h2>
      <ul className="mt-3 space-y-2">
        {s.submissions.map((x) => {
          const c = CHALLENGES.find((y) => y.id === x.challengeId)!;
          return (
            <li key={x.id} className="glass flex items-center justify-between gap-3 rounded-2xl p-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-bold">{c.title}</p>
                <p className="truncate text-[11px] text-muted-foreground">{x.note}</p>
              </div>
              <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ${x.status === "approved" ? "bg-mint text-forest" : x.status === "pending" ? "bg-gold/20 text-gold" : "bg-destructive/15 text-destructive"}`}>
                {t(x.status)}
              </span>
            </li>
          );
        })}
      </ul>
      <Link to="/admin" className="press glass mt-4 flex items-center justify-center gap-2 rounded-full py-3 text-sm font-bold">
        <ShieldCheck className="h-4 w-4" /> {t("admin")}
      </Link>
    </Screen>
  );
}
