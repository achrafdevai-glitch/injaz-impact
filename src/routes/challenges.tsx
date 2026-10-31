import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Search } from "lucide-react";
import { Screen, TopBar, Pill } from "@/components/Screen";
import { ChallengeCard, ChallengeSheet } from "@/components/ChallengeSheet";
import { CHALLENGES, CATEGORIES, type Challenge, type Category } from "@/lib/data";
import { useI18n } from "@/lib/i18n";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/challenges")({
  head: () => ({
    meta: [
      { title: "التحديات — إنجاز" },
      { name: "description", content: "تصفح تحديات التطوع في كل ولايات الجزائر وانضم إليها." },
      { property: "og:title", content: "تحديات التطوع — إنجاز" },
      { property: "og:description", content: "انضم إلى تحديات تطوعية واكسب نقاط الخبرة والأوسمة." },
    ],
  }),
  component: Challenges,
});

function Challenges() {
  const { t } = useI18n();
  const { s } = useStore();
  const [tab, setTab] = useState<"all" | "mine">("all");
  const [cat, setCat] = useState<Category | "all">("all");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<Challenge | null>(null);
  const list = CHALLENGES.filter(
    (c) =>
      (cat === "all" || c.category === cat) &&
      (tab === "all" || s.joined.includes(c.id)) &&
      (!q || c.title.includes(q)),
  );

  return (
    <Screen>
      <TopBar title={t("challenges")} />
      <div className="mx-auto flex w-fit rounded-full bg-forest p-1 shadow-soft">
        {(["all", "mine"] as const).map((k) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className={`press rounded-full px-6 py-2 text-sm font-bold transition-colors ${tab === k ? "bg-gold text-ink" : "text-on-dark/80"}`}
          >
            {k === "all" ? t("all") : t("joined")}
          </button>
        ))}
      </div>
      <label className="glass mt-5 flex items-center gap-2 rounded-full px-4 py-3">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ابحث عن تحدٍّ..." className="w-full bg-transparent text-sm outline-none" />
      </label>
      <div className="no-scrollbar -mx-5 mt-4 flex gap-2 overflow-x-auto px-5">
        <Pill active={cat === "all"} onClick={() => setCat("all")}>{t("all")}</Pill>
        {CATEGORIES.map((c) => (
          <Pill key={c.id} active={cat === c.id} onClick={() => setCat(c.id)}>{c.emoji} {t(c.id)}</Pill>
        ))}
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {list.map((c) => <ChallengeCard key={c.id} c={c} onOpen={() => setOpen(c)} />)}
        {!list.length && <p className="py-10 text-center text-sm text-muted-foreground">—</p>}
      </div>
      <ChallengeSheet c={open} onClose={() => setOpen(null)} />
    </Screen>
  );
}
