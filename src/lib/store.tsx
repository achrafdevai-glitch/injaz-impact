import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { CHALLENGES } from "./data";

export type Submission = {
  id: string;
  challengeId: string;
  note: string;
  status: "pending" | "approved" | "rejected";
  at: number;
};

export type AppState = {
  name: string;
  wilaya: number;
  xp: number;
  points: number;
  hours: number;
  joined: string[];
  submissions: Submission[];
  redeemed: string[];
  dark: boolean;
};

export const INITIAL: AppState = {
  name: "لعيد",
  wilaya: 16,
  xp: 3200,
  points: 850,
  hours: 46,
  joined: ["c1", "c4"],
  submissions: [
    { id: "s0", challengeId: "c2", note: "غرست 12 شجرة مع فريق الحي", status: "approved", at: Date.now() - 864e5 * 6 },
    { id: "s1", challengeId: "c5", note: "وزعنا 30 قفة في حي عين أرنات", status: "approved", at: Date.now() - 864e5 * 3 },
    { id: "s2", challengeId: "c9", note: "جمعت 45 كتاباً للمكتبة", status: "approved", at: Date.now() - 864e5 * 2 },
    { id: "s3", challengeId: "c4", note: "تبرعت بالدم اليوم في المستشفى", status: "pending", at: Date.now() - 36e5 },
  ],
  redeemed: [],
  dark: false,
};

/** Approving a proof credits the challenge's XP, points and hours exactly once. */
export function applyReview(s: AppState, id: string, ok: boolean): AppState {
  const sub = s.submissions.find((x) => x.id === id);
  if (!sub || sub.status !== "pending") return s;
  const c = CHALLENGES.find((x) => x.id === sub.challengeId)!;
  return {
    ...s,
    submissions: s.submissions.map((x) => (x.id === id ? { ...x, status: ok ? "approved" : "rejected" } : x)),
    xp: s.xp + (ok ? c.xp : 0),
    points: s.points + (ok ? c.points : 0),
    hours: s.hours + (ok ? c.hours : 0),
  };
}

/** Redeeming deducts cost; refused when points are insufficient. */
export function applyRedeem(s: AppState, rewardId: string, cost: number): AppState | null {
  if (s.points < cost) return null;
  return { ...s, points: s.points - cost, redeemed: [...s.redeemed, rewardId] };
}

type Ctx = {
  s: AppState;
  join: (id: string) => void;
  submit: (challengeId: string, note: string) => void;
  review: (id: string, ok: boolean) => void;
  redeem: (id: string, cost: number) => boolean;
  setDark: (d: boolean) => void;
  reset: () => void;
};

const C = createContext<Ctx>(null as unknown as Ctx);
const KEY = "injaz-state-v1";

export function StoreProvider({ children }: { children: ReactNode }) {
  const [s, set] = useState<AppState>(INITIAL);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) set({ ...INITIAL, ...JSON.parse(raw) });
    } catch {}
    setLoaded(true);
  }, []);
  useEffect(() => {
    if (loaded) localStorage.setItem(KEY, JSON.stringify(s));
    document.documentElement.classList.toggle("dark", s.dark);
  }, [s, loaded]);

  const value: Ctx = {
    s,
    join: (id) => set((p) => (p.joined.includes(id) ? p : { ...p, joined: [...p.joined, id] })),
    submit: (challengeId, note) =>
      set((p) => ({
        ...p,
        submissions: [{ id: "s" + Date.now(), challengeId, note, status: "pending", at: Date.now() }, ...p.submissions],
      })),
    review: (id, ok) => set((p) => applyReview(p, id, ok)),
    redeem: (id, cost) => {
      const next = applyRedeem(s, id, cost);
      if (!next) return false;
      set(next);
      return true;
    },
    setDark: (dark) => set((p) => ({ ...p, dark })),
    reset: () => set(INITIAL),
  };
  return <C.Provider value={value}>{children}</C.Provider>;
}

export const useStore = () => useContext(C);
