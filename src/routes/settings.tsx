import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Globe, Moon, Download, RotateCcw, ShieldCheck, Info } from "lucide-react";
import { Screen, TopBar } from "@/components/Screen";
import { Switch } from "@/components/ui/switch";
import { useI18n, type Lang } from "@/lib/i18n";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "الإعدادات — إنجاز" },
      { name: "description", content: "إعدادات إنجاز: اللغة، الوضع الليلي، وتثبيت التطبيق." },
      { property: "og:title", content: "الإعدادات — إنجاز" },
      { property: "og:description", content: "خصص تجربتك في إنجاز." },
    ],
  }),
  component: SettingsPage,
});

type BIPEvent = Event & { prompt: () => Promise<void> };

function SettingsPage() {
  const { t, lang, setLang } = useI18n();
  const { s, setDark, reset } = useStore();
  const [bip, setBip] = useState<BIPEvent | null>(null);
  useEffect(() => {
    const h = (e: Event) => { e.preventDefault(); setBip(e as BIPEvent); };
    window.addEventListener("beforeinstallprompt", h);
    return () => window.removeEventListener("beforeinstallprompt", h);
  }, []);

  const langs: [Lang, string][] = [["ar", "العربية"], ["fr", "Français"], ["en", "English"]];

  return (
    <Screen>
      <TopBar title={t("settings")} back="/profile" />
      <section className="glass rounded-3xl p-4">
        <p className="flex items-center gap-2 text-sm font-bold"><Globe className="h-4 w-4 text-emerald" /> {t("language")}</p>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {langs.map(([k, l]) => (
            <button key={k} onClick={() => setLang(k)} className={`press rounded-2xl py-3 text-sm font-bold ${lang === k ? "bg-primary text-primary-foreground" : "bg-muted"}`}>{l}</button>
          ))}
        </div>
      </section>
      <section className="glass mt-3 divide-y divide-border rounded-3xl">
        <div className="flex items-center justify-between p-4">
          <span className="flex items-center gap-2 text-sm font-bold"><Moon className="h-4 w-4 text-emerald" /> {t("darkMode")}</span>
          <Switch checked={s.dark} onCheckedChange={setDark} />
        </div>
        <button
          onClick={async () => {
            if (bip) { await bip.prompt(); setBip(null); }
            else toast("على iPhone: شارك ← إضافة إلى الشاشة الرئيسية. يعمل التثبيت في النسخة المنشورة.");
          }}
          className="press flex w-full items-center gap-2 p-4 text-sm font-bold"
        >
          <Download className="h-4 w-4 text-emerald" /> {t("install")}
        </button>
        <Link to="/admin" className="press flex items-center gap-2 p-4 text-sm font-bold"><ShieldCheck className="h-4 w-4 text-emerald" /> {t("admin")}</Link>
        <button onClick={() => { reset(); toast.success("✓"); }} className="press flex w-full items-center gap-2 p-4 text-sm font-bold text-destructive">
          <RotateCcw className="h-4 w-4" /> {t("reset")}
        </button>
      </section>
      <section className="glass mt-3 flex items-center gap-3 rounded-3xl p-4">
        <img src="/logo.png" alt="" className="h-14 w-14 rounded-2xl" />
        <div className="min-w-0">
          <p className="flex items-center gap-1 text-sm font-bold"><Info className="h-4 w-4" /> {t("about")}</p>
          <p className="text-xs text-muted-foreground">إنجاز الأثر · v1.0 — {t("slogan")}</p>
        </div>
      </section>
    </Screen>
  );
}
