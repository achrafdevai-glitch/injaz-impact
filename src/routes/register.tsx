import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { WILAYAS } from "@/lib/data";

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

function F({ l, children }: { l: string; children: ReactNode }) {
  return <label className="block space-y-1.5"><span className="text-sm font-semibold">{l}</span>{children}</label>;
}

function Register() {
  const nav = useNavigate();
  const [days, setDays] = useState<string[]>([]);
  const [card, setCard] = useState<string | null>(null);
  return (
    <main className="mx-auto max-w-[520px] px-5 py-8">
      <h1 className="mb-1 text-2xl font-extrabold">إنشاء حساب متطوع</h1>
      <p className="mb-6 text-sm text-muted-foreground">املأ معلوماتك للانضمام إلى إنجاز</p>
      <form className="space-y-4" onSubmit={(e) => {
        e.preventDefault();
        if (!card) return toast.error("يرجى إرفاق صورة البطاقة الوطنية");
        if (!days.length) return toast.error("اختر يوماً واحداً على الأقل");
        localStorage.setItem("injaz-onboarded", "1");
        toast.success("تم التسجيل بنجاح");
        nav({ to: "/" });
      }}>
        <div className="grid grid-cols-2 gap-3">
          <F l="الاسم"><input required className={inp} /></F>
          <F l="اللقب"><input required className={inp} /></F>
        </div>
        <F l="رقم الهاتف"><input required type="tel" dir="ltr" pattern="0[5-7][0-9]{8}" placeholder="0550123456" className={inp} /></F>
        <F l="الجنس"><select required className={inp} defaultValue=""><option value="" disabled>اختر</option><option>ذكر</option><option>أنثى</option></select></F>
        <F l="المستوى التعليمي"><select required className={inp} defaultValue=""><option value="" disabled>اختر</option><option>ابتدائي</option><option>متوسط</option><option>ثانوي</option><option>جامعي</option><option>دراسات عليا</option></select></F>
        <F l="صورة البطاقة الوطنية">
          <input type="file" accept="image/*" className={inp + " pt-2"} onChange={(e) => { const f = e.target.files?.[0]; setCard(f ? URL.createObjectURL(f) : null); }} />
          {card && <img src={card} alt="البطاقة الوطنية" className="mt-2 h-32 w-full rounded-xl object-cover" />}
        </F>
        <F l="طبيعة العمل"><select required className={inp} defaultValue=""><option value="" disabled>اختر</option><option>طالب</option><option>موظف</option><option>عمل حر</option><option>بدون عمل</option><option>متقاعد</option></select></F>
        <div className="space-y-1.5"><span className="text-sm font-semibold">أيام الفراغ</span>
          <div className="flex flex-wrap gap-2">{DAYS.map((d) => { const on = days.includes(d); return <button type="button" key={d} onClick={() => setDays(on ? days.filter((x) => x !== d) : [...days, d])} className={`rounded-full px-3 py-1.5 text-sm ${on ? "bg-primary text-primary-foreground" : "border border-input bg-card"}`}>{d}</button>; })}</div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <F l="الولاية"><select required className={inp} defaultValue=""><option value="" disabled>اختر</option>{WILAYAS.map((w) => <option key={w[0]} value={w[0]}>{String(w[0]).padStart(2, "0")} - {w[1]}</option>)}</select></F>
          <F l="البلدية"><input required className={inp} /></F>
        </div>
        <Button type="submit" className="h-12 w-full rounded-full">تسجيل</Button>
      </form>
    </main>
  );
}
