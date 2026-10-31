import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Check, X } from "lucide-react";
import { Screen, TopBar } from "@/components/Screen";
import { CHALLENGES, wilayaName } from "@/lib/data";
import { useI18n } from "@/lib/i18n";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "لوحة الإشراف — إنجاز" },
      { name: "description", content: "مراجعة إثباتات الأثر والموافقة على مساهمات المتطوعين." },
      { property: "og:title", content: "لوحة الإشراف — إنجاز" },
      { property: "og:description", content: "مراجعة إثباتات التطوع." },
    ],
  }),
  component: Admin,
});

function Admin() {
  const { t, lang } = useI18n();
  const { s, review } = useStore();
  const [tab, setTab] = useState<"proofs" | "challenges">("proofs");
  const pending = s.submissions.filter((x) => x.status === "pending");
  const reviewed = s.submissions.filter((x) => x.status !== "pending");

  return (
    <Screen>
      <TopBar title={t("admin")} back="/profile" />
      <section className="grid grid-cols-3 gap-3">
        {[[pending.length, t("pending")], [reviewed.length, t("approved")], [CHALLENGES.length, t("challenges")]].map(([v, l]) => (
          <div key={l as string} className="glass rounded-3xl p-3 text-center">
            <p className="font-display text-2xl font-extrabold text-forest dark:text-mint">{v}</p>
            <p className="text-[11px] text-muted-foreground">{l}</p>
          </div>
        ))}
      </section>
      <div className="mx-auto mt-5 flex w-fit rounded-full bg-forest p-1">
        {(["proofs", "challenges"] as const).map((k) => (
          <button key={k} onClick={() => setTab(k)} className={`press rounded-full px-5 py-2 text-sm font-bold ${tab === k ? "bg-gold text-ink" : "text-on-dark/80"}`}>
            {k === "proofs" ? "إثباتات الأثر" : t("challenges")}
          </button>
        ))}
      </div>

      {tab === "proofs" ? (
        <ul className="mt-4 space-y-3">
          {!pending.length && <p className="py-10 text-center text-sm text-muted-foreground">{t("noPending")}</p>}
          {pending.map((x) => {
            const c = CHALLENGES.find((y) => y.id === x.challengeId)!;
            return (
              <li key={x.id} className="glass animate-rise rounded-3xl p-4">
                <p className="text-sm font-bold">{c.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">{s.name} · {wilayaName(c.wilaya, lang)} · +{c.xp} XP / +{c.points} {t("points")}</p>
                <p className="mt-3 rounded-2xl bg-muted p-3 text-sm">"{x.note}"</p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button onClick={() => { review(x.id, false); toast(t("rejected")); }} className="press flex items-center justify-center gap-1 rounded-full bg-destructive/10 py-2.5 text-sm font-bold text-destructive"><X className="h-4 w-4" /> {t("reject")}</button>
                  <button onClick={() => { review(x.id, true); toast.success(`${t("approved")} +${c.xp} XP`); }} className="press flex items-center justify-center gap-1 rounded-full bg-emerald py-2.5 text-sm font-bold text-primary-foreground"><Check className="h-4 w-4" /> {t("approve")}</button>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <ul className="mt-4 space-y-2">
          {CHALLENGES.map((c) => (
            <li key={c.id} className="glass flex items-center justify-between gap-3 rounded-2xl p-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-bold">{c.title}</p>
                <p className="text-[11px] text-muted-foreground">{wilayaName(c.wilaya, lang)} · {c.participants}/{c.goal}</p>
              </div>
              <span className="shrink-0 rounded-full bg-mint px-2.5 py-1 text-[11px] font-bold text-forest">{t("active")}</span>
            </li>
          ))}
        </ul>
      )}
    </Screen>
  );
}
