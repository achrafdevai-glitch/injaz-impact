import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { WILAYAS } from "@/lib/data";
import { supabase } from "@/integrations/supabase/client";
import { reviewIdCard, type CardReview } from "@/lib/idcard.functions";

export const Route = createFileRoute("/register")({
  head: () => ({ meta: [
    { title: "التسجيل — إنجاز" },
    { name: "description", content: "سجّل كمتطوع في إنجاز وحدد ولايتك وأيام فراغك." },
    { property: "og:title", content: "التسجيل — إنجاز" },
    { property: "og:description", content: "انضم إلى المتطوعين في الجزائر." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: Register,
});

const DAYS = ["السبت", "الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"];
const inp = "h-11 w-full rounded-xl border border-input bg-card px-3 text-sm";
const EMPTY = { first_name: "", last_name: "", phone: "", gender: "", education: "", work_type: "", wilaya: "", commune: "" };

function F({ l, children }: { l: string; children: ReactNode }) {
  return <label className="block space-y-1.5"><span className="text-sm font-semibold">{l}</span>{children}</label>;
}
function Sel({ v, on, opts }: { v: string; on: (v: string) => void; opts: [string, string][] }) {
  return <select required className={inp} value={v} onChange={(e) => on(e.target.value)}><option value="" disabled>اختر</option>{opts.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>;
}
const o = (a: string[]): [string, string][] => a.map((x) => [x, x]);

function toDataUrl(f: File): Promise<string> {
  return new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => {
      const k = Math.min(1, 1600 / Math.max(img.width, img.height));
      const c = document.createElement("canvas"); c.width = img.width * k; c.height = img.height * k;
      c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
      res(c.toDataURL("image/jpeg", 0.85));
    };
    img.onerror = rej; img.src = URL.createObjectURL(f);
  });
}

function Register() {
  const nav = useNavigate();
  const review = useServerFn(reviewIdCard);
  const [uid, setUid] = useState<string | null | undefined>(undefined);
  const [f, setF] = useState(EMPTY);
  const [days, setDays] = useState<string[]>([]);
  const [card, setCard] = useState<string | null>(null);
  const [rev, setRev] = useState<CardReview | null>(null);
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof EMPTY) => (v: string) => { setF((p) => ({ ...p, [k]: v })); setRev(null); };

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      const id = data.user?.id ?? null; setUid(id);
      if (!id) return;
      const { data: r } = await supabase.from("volunteer_registrations").select("*").eq("user_id", id).maybeSingle();
      if (r) { setF({ first_name: r.first_name, last_name: r.last_name, phone: r.phone, gender: r.gender, education: r.education, work_type: r.work_type, wilaya: String(r.wilaya), commune: r.commune }); setDays(r.free_days); }
    });
  }, []);

  if (uid === undefined) return <main className="p-10 text-center text-muted-foreground">...</main>;
  if (!uid) return (
    <main className="mx-auto max-w-[420px] px-6 py-20 text-center">
      <h1 className="mb-3 text-xl font-bold">سجّل الدخول أولاً</h1>
      <p className="mb-6 text-sm text-muted-foreground">نحتاج حساباً لحفظ بياناتك وصورة بطاقتك بأمان.</p>
      <Button asChild className="h-12 w-full rounded-full"><Link to="/auth">تسجيل الدخول / إنشاء حساب</Link></Button>
    </main>
  );

  const check = async () => {
    if (!card) return void toast.error("يرجى إرفاق صورة البطاقة الوطنية");
    if (!days.length) return void toast.error("اختر يوماً واحداً على الأقل");
    setBusy(true);
    const r = await review({ data: { image: card, form: { ...f, free_days: days.join("، ") } } });
    setBusy(false);
    if (r.error) return void toast.error(r.error);
    setRev(r);
  };

  const save = async () => {
    if (!rev || !card) return;
    setBusy(true);
    const path = `${uid}/id-card.jpg`;
    const blob = await (await fetch(card)).blob();
    const up = await supabase.storage.from("id-cards").upload(path, blob, { upsert: true, contentType: "image/jpeg" });
    if (up.error) { setBusy(false); return void toast.error("تعذر رفع الصورة"); }
    const { error } = await supabase.from("volunteer_registrations").upsert({
      user_id: uid, ...f, wilaya: Number(f.wilaya), free_days: days, id_card_path: path, ai_review: rev,
    }, { onConflict: "user_id" });
    setBusy(false);
    if (error) return void toast.error("تعذر حفظ البيانات");
    localStorage.setItem("injaz-onboarded", "1");
    toast.success("تم حفظ تسجيلك بنجاح");
    nav({ to: "/" });
  };

  return (
    <main className="mx-auto max-w-[520px] px-5 py-8 pb-16">
      <h1 className="mb-1 text-2xl font-extrabold">تسجيل المتطوع</h1>
      <p className="mb-6 text-sm text-muted-foreground">املأ معلوماتك، ثم نفحصها مع صورة البطاقة قبل الحفظ.</p>
      <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); void check(); }}>
        <div className="grid grid-cols-2 gap-3">
          <F l="الاسم"><input required className={inp} value={f.first_name} onChange={(e) => set("first_name")(e.target.value)} /></F>
          <F l="اللقب"><input required className={inp} value={f.last_name} onChange={(e) => set("last_name")(e.target.value)} /></F>
        </div>
        <F l="رقم الهاتف"><input required type="tel" dir="ltr" pattern="0[5-7][0-9]{8}" placeholder="0550123456" className={inp} value={f.phone} onChange={(e) => set("phone")(e.target.value)} /></F>
        <F l="الجنس"><Sel v={f.gender} on={set("gender")} opts={o(["ذكر", "أنثى"])} /></F>
        <F l="المستوى التعليمي"><Sel v={f.education} on={set("education")} opts={o(["ابتدائي", "متوسط", "ثانوي", "جامعي", "دراسات عليا"])} /></F>
        <F l="صورة البطاقة الوطنية">
          <input type="file" accept="image/*" className={inp + " pt-2"} onChange={async (e) => { const x = e.target.files?.[0]; setRev(null); setCard(x ? await toDataUrl(x) : null); }} />
          {card && <img src={card} alt="البطاقة الوطنية" className="mt-2 h-36 w-full rounded-xl object-cover" />}
        </F>
        <F l="طبيعة العمل"><Sel v={f.work_type} on={set("work_type")} opts={o(["طالب", "موظف", "عمل حر", "بدون عمل", "متقاعد"])} /></F>
        <div className="space-y-1.5"><span className="text-sm font-semibold">أيام الفراغ</span>
          <div className="flex flex-wrap gap-2">{DAYS.map((d) => { const on = days.includes(d); return <button type="button" key={d} onClick={() => { setRev(null); setDays(on ? days.filter((x) => x !== d) : [...days, d]); }} className={`rounded-full px-3 py-1.5 text-sm ${on ? "bg-primary text-primary-foreground" : "border border-input bg-card"}`}>{d}</button>; })}</div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <F l="الولاية"><Sel v={f.wilaya} on={set("wilaya")} opts={WILAYAS.map((w) => [String(w[0]), `${String(w[0]).padStart(2, "0")} - ${w[1]}`])} /></F>
          <F l="البلدية"><input required className={inp} value={f.commune} onChange={(e) => set("commune")(e.target.value)} /></F>
        </div>
        {!rev && <Button disabled={busy} type="submit" className="h-12 w-full rounded-full">{busy ? "جارٍ الفحص..." : "فحص البيانات والبطاقة"}</Button>}
      </form>

      {rev && (
        <section className="glass mt-6 space-y-3 rounded-3xl p-4 text-sm">
          <h2 className="font-bold">نتيجة المراجعة</h2>
          {!rev.readable && <p className="text-destructive">الصورة غير واضحة أو ليست بطاقة هوية. أعد التصوير.</p>}
          <dl className="grid grid-cols-2 gap-2">
            {([["الاسم في البطاقة", rev.extracted.first_name], ["اللقب في البطاقة", rev.extracted.last_name], ["تاريخ الميلاد", rev.extracted.birth_date], ["رقم البطاقة", rev.extracted.card_number]] as const).map(([l, v]) => (
              <div key={l} className="rounded-xl bg-muted p-2"><dt className="text-xs text-muted-foreground">{l}</dt><dd className="font-semibold">{v || "—"}</dd></div>
            ))}
          </dl>
          {rev.missing.length > 0 && <p className="text-destructive">ناقص: {rev.missing.join("، ")}</p>}
          {rev.mismatches.length > 0 && <ul className="list-disc ps-5 text-gold">{rev.mismatches.map((m) => <li key={m}>{m}</li>)}</ul>}
          {rev.complete && !rev.mismatches.length && <p className="text-emerald">البيانات مكتملة ومتطابقة ✓</p>}
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1 rounded-full" onClick={() => setRev(null)}>تعديل</Button>
            <Button disabled={busy || !rev.readable} className="flex-1 rounded-full" onClick={save}>{busy ? "جارٍ الحفظ..." : "تأكيد وحفظ"}</Button>
          </div>
        </section>
      )}
    </main>
  );
}
