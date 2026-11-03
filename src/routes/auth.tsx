import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [
    { title: "تسجيل الدخول — إنجاز" },
    { name: "description", content: "ادخل إلى حسابك في إنجاز أو أنشئ حساباً جديداً." },
    { property: "og:title", content: "تسجيل الدخول — إنجاز" },
    { property: "og:description", content: "حسابك التطوعي في إنجاز." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: AuthPage,
});

const inp = "h-11 w-full rounded-xl border border-input bg-card px-3 text-sm";

function AuthPage() {
  const nav = useNavigate();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true);
    const { data, error } = mode === "in"
      ? await supabase.auth.signInWithPassword({ email, password: pw })
      : await supabase.auth.signUp({ email, password: pw, options: { emailRedirectTo: window.location.origin + "/register" } });
    setBusy(false);
    if (error) return void toast.error(error.message);
    localStorage.setItem("injaz-onboarded", "1");
    if (!data.session) return void toast.success("تحقق من بريدك الإلكتروني لتأكيد الحساب");
    nav({ to: "/register" });
  };
  const google = async () => {
    localStorage.setItem("injaz-onboarded", "1");
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (r.error) return void toast.error("تعذر الدخول عبر Google");
    if (!r.redirected) nav({ to: "/register" });
  };
  return (
    <main className="mx-auto flex min-h-screen max-w-[420px] flex-col justify-center px-6 py-10">
      <img src="/logo.png" alt="إنجاز" className="mx-auto mb-4 h-20 w-20 rounded-2xl" />
      <h1 className="mb-6 text-center text-2xl font-extrabold">{mode === "in" ? "تسجيل الدخول" : "إنشاء حساب"}</h1>
      <form onSubmit={submit} className="space-y-3">
        <input required type="email" dir="ltr" placeholder="البريد الإلكتروني" value={email} onChange={(e) => setEmail(e.target.value)} className={inp} />
        <input required type="password" minLength={6} dir="ltr" placeholder="كلمة المرور" value={pw} onChange={(e) => setPw(e.target.value)} className={inp} />
        <Button disabled={busy} type="submit" className="h-12 w-full rounded-full">{mode === "in" ? "دخول" : "إنشاء الحساب"}</Button>
      </form>
      <Button variant="outline" onClick={google} className="mt-3 h-12 w-full rounded-full">المتابعة عبر Google</Button>
      <button onClick={() => setMode(mode === "in" ? "up" : "in")} className="mt-5 text-sm text-muted-foreground">
        {mode === "in" ? "ليس لديك حساب؟ أنشئ حساباً" : "لديك حساب؟ سجّل الدخول"}
      </button>
    </main>
  );
}
