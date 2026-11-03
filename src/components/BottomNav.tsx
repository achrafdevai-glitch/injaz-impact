import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Flag, MapPinned, Trophy, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useI18n, type TKey } from "@/lib/i18n";

const ITEMS: { to: "/" | "/challenges" | "/map" | "/leaderboard" | "/profile"; key: TKey; Icon: typeof Home }[] = [
  { to: "/", key: "home", Icon: Home },
  { to: "/challenges", key: "challenges", Icon: Flag },
  { to: "/map", key: "map", Icon: MapPinned },
  { to: "/leaderboard", key: "leaders", Icon: Trophy },
  { to: "/profile", key: "profile", Icon: User },
];

const H = 68;

function barPath(W: number, cx: number) {
  const R = 30;
  const n = 46; // half notch width
  return `M ${R} 0 L ${cx - n} 0 C ${cx - 26} 0 ${cx - 32} 40 ${cx} 40 C ${cx + 32} 40 ${cx + 26} 0 ${cx + n} 0 L ${W - R} 0 A ${R} ${R} 0 0 1 ${W} ${R} L ${W} ${H - R} A ${R} ${R} 0 0 1 ${W - R} ${H} L ${R} ${H} A ${R} ${R} 0 0 1 0 ${H - R} L 0 ${R} A ${R} ${R} 0 0 1 ${R} 0 Z`;
}

export function BottomNav() {
  const { t, lang } = useI18n();
  const path0 = useRouterState({ select: (s) => s.location.pathname });
  if (path0 === "/onboarding" || path0 === "/register" || path0 === "/auth") return null;
  return <Bar t={t} lang={lang} />;
}

function Bar({ t, lang }: { t: ReturnType<typeof useI18n>["t"]; lang: string }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const ref = useRef<HTMLDivElement>(null);
  const [W, setW] = useState(380);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setW(el.clientWidth));
    ro.observe(el);
    setW(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  const activeIdx = Math.max(
    0,
    ITEMS.findIndex((i) => (i.to === "/" ? path === "/" : path.startsWith(i.to))),
  );
  const slot = W / ITEMS.length;
  const visualIdx = lang === "ar" ? ITEMS.length - 1 - activeIdx : activeIdx;
  const cx = slot * visualIdx + slot / 2;
  const d = barPath(W, cx);

  return (
    <nav
      aria-label="التنقل الرئيسي"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center px-4 pb-[max(14px,env(safe-area-inset-bottom))]"
    >
      <div ref={ref} dir="ltr" className="pointer-events-auto relative w-full max-w-[440px]" style={{ height: H + 26 }}>
        {/* carved glass bar */}
        <div className="absolute inset-x-0 bottom-0 shadow-float" style={{ height: H, borderRadius: 30 }}>
          <div
            className="nav-path absolute inset-0 backdrop-blur-2xl"
            style={{ clipPath: `path('${d}')`, background: "var(--nav-bar)" }}
          />
          <svg className="pointer-events-none absolute inset-0" width={W} height={H}>
            <path className="nav-path" d={d} fill="none" stroke="var(--nav-outline)" strokeWidth="1" />
          </svg>
          <span
            aria-hidden="true"
            className="absolute grid h-[52px] w-[52px] place-items-center rounded-full bg-emerald text-primary-foreground shadow-float transition-[left] duration-300"
            style={{ left: cx - 26, top: -24 }}
          >
            {(() => { const A = ITEMS[activeIdx]!.Icon; return <A className="h-[22px] w-[22px]" strokeWidth={2.2} />; })()}
          </span>
          <ul className="relative flex h-full">
            {ITEMS.map((it, i) => {
              const isActive = i === activeIdx;
              return (
                <li key={it.to} className="flex-1" style={{ order: lang === "ar" ? ITEMS.length - i : i }}>
                  <Link
                    to={it.to}
                    aria-label={t(it.key)}
                    aria-current={isActive ? "page" : undefined}
                    className="press flex h-full flex-col items-center justify-center gap-1 text-on-dark/60"
                  >
                    <it.Icon className={`h-[22px] w-[22px] transition-[color,transform] duration-300 motion-reduce:transition-none ${isActive ? "opacity-0" : ""}`} strokeWidth={isActive ? 2.2 : 1.7} />
                    <span
                      dir={lang === "ar" ? "rtl" : "ltr"}
                      className={`text-[10.5px] font-semibold leading-none transition-colors ${isActive ? "text-on-dark" : ""}`}
                    >
                      {t(it.key)}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </nav>
  );
}
