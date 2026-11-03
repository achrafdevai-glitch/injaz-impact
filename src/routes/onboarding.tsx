import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/onboarding")({
  head: () => ({ meta: [
    { title: "مرحباً بك في إنجاز" },
    { name: "description", content: "تعرّف على إنجاز: تطوع، اكسب النقاط، واترك أثراً في ولايتك." },
    { property: "og:title", content: "مرحباً بك في إنجاز" },
    { property: "og:description", content: "ابدأ رحلتك التطوعية في الجزائر." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: Onboarding,
});

const SLIDES = [
  { e: "🌱", t: "خطوة منك... أثر في مجتمعك", d: "اكتشف مبادرات تطوعية قريبة منك في كل ولايات الجزائر." },
  { e: "🗺️", t: "خريطة الأثر", d: "تصفح 58 ولاية واختر التحدي الذي يناسبك." },
  { e: "🏆", t: "اكسب وارتقِ", d: "اجمع النقاط والشارات واستبدلها بمكافآت حقيقية." },
];

function Onboarding() {
  const [i, setI] = useState(0);
  const last = i === SLIDES.length - 1;
  const done = () => localStorage.setItem("injaz-onboarded", "1");
  const sl = SLIDES[i]!;
  return (
    <main className="mx-auto flex min-h-screen max-w-[480px] flex-col items-center justify-between px-6 py-10 text-center">
      <img src="/logo.png" alt="إنجاز" className="h-20 w-20 rounded-2xl" />
      <div key={i} className="animate-in fade-in">
        <div className="mb-6 text-7xl">{sl.e}</div>
        <h1 className="mb-3 text-2xl font-extrabold">{sl.t}</h1>
        <p className="text-muted-foreground">{sl.d}</p>
      </div>
      <div className="w-full space-y-4">
        <div className="flex justify-center gap-2">{SLIDES.map((_, j) => <span key={j} className={`h-2 rounded-full transition-all ${j === i ? "w-6 bg-primary" : "w-2 bg-muted"}`} />)}</div>
        {last ? (
          <Button asChild className="h-12 w-full rounded-full"><Link to="/auth" onClick={done}>إنشاء حساب</Link></Button>
        ) : (
          <Button className="h-12 w-full rounded-full" onClick={() => setI(i + 1)}>التالي</Button>
        )}
        <Link to="/" onClick={done} className="block text-sm text-muted-foreground">تخطي</Link>
      </div>
    </main>
  );
}
