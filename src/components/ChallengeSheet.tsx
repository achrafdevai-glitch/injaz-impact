import { useState } from "react";
import { toast } from "sonner";
import { Clock, MapPin, Users, Zap } from "lucide-react";
import { Drawer, DrawerContent, DrawerTitle, DrawerDescription } from "@/components/ui/drawer";
import { CATEGORIES, wilayaName, type Challenge } from "@/lib/data";
import { useI18n } from "@/lib/i18n";
import { useStore } from "@/lib/store";

export function CategoryChip({ c }: { c: Challenge["category"] }) {
  const { t } = useI18n();
  const cat = CATEGORIES.find((x) => x.id === c)!;
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-mint px-2.5 py-1 text-[11px] font-bold text-forest">
      {cat.emoji} {t(c)}
    </span>
  );
}

export function ChallengeCard({ c, onOpen }: { c: Challenge; onOpen: () => void }) {
  const { t, lang } = useI18n();
  const { s } = useStore();
  const joined = s.joined.includes(c.id);
  return (
    <button onClick={onOpen} className="press glass animate-rise w-full rounded-3xl p-4 text-start">
      <div className="flex items-center justify-between gap-2">
        <CategoryChip c={c.category} />
        <span className="text-xs font-bold text-gold">+{c.xp} XP</span>
      </div>
      <h3 className="mt-3 text-base font-bold leading-snug">{c.title}</h3>
      <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
        <MapPin className="h-3.5 w-3.5" /> {wilayaName(c.wilaya, lang)} · {c.daysLeft} {t("daysLeft")}
      </p>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-emerald" style={{ width: `${(c.participants / c.goal) * 100}%` }} />
      </div>
      <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
        <span>{c.participants}/{c.goal} {t("participants")}</span>
        {joined && <span className="font-bold text-emerald">✓ {t("joined")}</span>}
      </div>
    </button>
  );
}

export function ChallengeSheet({ c, onClose }: { c: Challenge | null; onClose: () => void }) {
  const { t, lang } = useI18n();
  const { s, join, submit } = useStore();
  const [note, setNote] = useState("");
  const joined = c ? s.joined.includes(c.id) : false;
  const sub = c ? s.submissions.find((x) => x.challengeId === c.id) : undefined;

  return (
    <Drawer open={!!c} onOpenChange={(o) => !o && onClose()}>
      <DrawerContent className="mx-auto max-w-[560px] rounded-t-[32px] border-0 bg-card pb-8">
        {c && (
          <div className="px-6 pt-2" dir={lang === "ar" ? "rtl" : "ltr"}>
            <CategoryChip c={c.category} />
            <DrawerTitle className="mt-3 text-xl font-extrabold">{c.title}</DrawerTitle>
            <DrawerDescription className="mt-2 text-sm text-muted-foreground">{c.desc}</DrawerDescription>
            <div className="mt-5 grid grid-cols-4 gap-2 text-center">
              {[
                [Zap, `+${c.xp}`, "XP"],
                [Clock, c.hours, t("hours")],
                [Users, c.participants, t("participants")],
                [MapPin, c.wilaya, wilayaName(c.wilaya, lang)],
              ].map(([Icon, v, l], i) => {
                const I = Icon as typeof Zap;
                return (
                  <div key={i} className="rounded-2xl bg-mint/60 p-2.5 dark:bg-secondary">
                    <I className="mx-auto h-4 w-4 text-forest dark:text-mint" />
                    <div className="mt-1 text-sm font-extrabold">{v as string}</div>
                    <div className="truncate text-[10px] text-muted-foreground">{l as string}</div>
                  </div>
                );
              })}
            </div>
            {!joined ? (
              <button
                onClick={() => {
                  join(c.id);
                  toast.success(`${t("joined")} ✓`);
                }}
                className="press mt-6 w-full rounded-full bg-primary py-4 text-base font-bold text-primary-foreground shadow-soft"
              >
                {t("join")}
              </button>
            ) : sub ? (
              <div className="mt-6 rounded-2xl bg-muted p-4 text-center text-sm font-bold">
                {sub.status === "pending" ? `⏳ ${t("pending")}` : sub.status === "approved" ? `✅ ${t("approved")}` : `❌ ${t("rejected")}`}
              </div>
            ) : (
              <div className="mt-6 space-y-3">
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="صف ما أنجزته (مثال: جمعنا 40 كيس نفايات)"
                  className="min-h-24 w-full rounded-2xl border border-input bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
                <button
                  disabled={note.trim().length < 5}
                  onClick={() => {
                    submit(c.id, note.trim());
                    setNote("");
                    toast.success(t("pending"));
                  }}
                  className="press w-full rounded-full bg-emerald py-4 text-base font-bold text-primary-foreground disabled:opacity-40"
                >
                  {t("submitProof")}
                </button>
              </div>
            )}
          </div>
        )}
      </DrawerContent>
    </Drawer>
  );
}
