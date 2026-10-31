import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";

export function Screen({ children, className }: { children: ReactNode; className?: string }) {
  return <main className={cn("mx-auto w-full max-w-[560px] px-5 pb-36 pt-[max(20px,env(safe-area-inset-top))]", className)}>{children}</main>;
}

export function TopBar({ title, back, right }: { title: string; back?: "/profile" | "/"; right?: ReactNode }) {
  const { t, lang } = useI18n();
  return (
    <header className="mb-5 grid grid-cols-[48px_minmax(0,1fr)_48px] items-center">
      {back ? (
        <Link to={back} aria-label={t("back")} className="press glass grid h-11 w-11 place-items-center rounded-full">
          <ChevronRight className={cn("h-5 w-5", lang !== "ar" && "rotate-180")} />
        </Link>
      ) : (
        <span />
      )}
      <h1 className="truncate text-center text-lg font-bold">{title}</h1>
      <div className="flex justify-end">{right}</div>
    </header>
  );
}

export function Pill({ active, children, onClick }: { active?: boolean; children: ReactNode; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "press shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors",
        active ? "bg-primary text-primary-foreground shadow-soft" : "glass text-foreground/80",
      )}
    >
      {children}
    </button>
  );
}
