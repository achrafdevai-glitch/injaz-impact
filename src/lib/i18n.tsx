import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "ar" | "fr" | "en";

const dict = {
  ar: {
    home: "الرئيسية", challenges: "التحديات", map: "خريطة الأثر", leaders: "المتصدرون", profile: "حسابي",
    hello: "مرحباً", slogan: "خطوة منك... أثر في مجتمعك", impactBalance: "رصيد الأثر", points: "نقطة",
    hours: "ساعة", initiatives: "مبادرة", join: "انضم", joined: "منضم", submitProof: "أرسل الإثبات",
    pending: "قيد المراجعة", approved: "مقبول", rejected: "مرفوض", rewards: "المكافآت", settings: "الإعدادات",
    admin: "لوحة الإشراف", language: "اللغة", all: "الكل", env: "بيئة", edu: "تعليم", health: "صحة",
    social: "تضامن", culture: "ثقافة", level: "المستوى", rank: "الترتيب الوطني", badges: "الأوسمة",
    national: "وطني", wilaya: "الولاية", daysLeft: "يوم متبقي", participants: "مشارك", redeem: "استبدل",
    earn: "اكسب", use: "استخدم", perks: "امتيازات", featured: "تحديات مميزة", seeAll: "عرض الكل",
    active: "نشطة", nearby: "قريبة", darkMode: "الوضع الليلي", install: "تثبيت التطبيق",
    approve: "قبول", reject: "رفض", noPending: "لا توجد طلبات معلقة", back: "رجوع",
    volunteerHours: "ساعات التطوع", completed: "مبادرات منجزة", impact: "الأثر المجتمعي",
    xpToNext: "نقطة خبرة للمستوى التالي", notEnough: "نقاطك غير كافية", redeemed: "تم الاستبدال",
    reset: "إعادة تعيين البيانات", about: "حول إنجاز", activeInWilayas: "ولاية نشطة",
  },
  fr: {
    home: "Accueil", challenges: "Défis", map: "Carte d'impact", leaders: "Classement", profile: "Profil",
    hello: "Bonjour", slogan: "Un pas de vous... un impact pour tous", impactBalance: "Solde d'impact", points: "pts",
    hours: "h", initiatives: "initiatives", join: "Rejoindre", joined: "Inscrit", submitProof: "Envoyer la preuve",
    pending: "En révision", approved: "Validé", rejected: "Refusé", rewards: "Récompenses", settings: "Paramètres",
    admin: "Modération", language: "Langue", all: "Tous", env: "Environnement", edu: "Éducation", health: "Santé",
    social: "Solidarité", culture: "Culture", level: "Niveau", rank: "Rang national", badges: "Badges",
    national: "National", wilaya: "Wilaya", daysLeft: "jours restants", participants: "participants", redeem: "Échanger",
    earn: "Gagner", use: "Utiliser", perks: "Avantages", featured: "Défis à la une", seeAll: "Tout voir",
    active: "Actifs", nearby: "Proches", darkMode: "Mode sombre", install: "Installer l'app",
    approve: "Valider", reject: "Refuser", noPending: "Aucune demande en attente", back: "Retour",
    volunteerHours: "Heures de bénévolat", completed: "Initiatives réalisées", impact: "Impact communautaire",
    xpToNext: "XP pour le niveau suivant", notEnough: "Points insuffisants", redeemed: "Échangé",
    reset: "Réinitialiser les données", about: "À propos d'INJAZ", activeInWilayas: "wilayas actives",
  },
  en: {
    home: "Home", challenges: "Challenges", map: "Impact Map", leaders: "Leaders", profile: "Profile",
    hello: "Hello", slogan: "One step from you... impact for your community", impactBalance: "Impact balance", points: "pts",
    hours: "h", initiatives: "initiatives", join: "Join", joined: "Joined", submitProof: "Submit proof",
    pending: "Under review", approved: "Approved", rejected: "Rejected", rewards: "Rewards", settings: "Settings",
    admin: "Moderation", language: "Language", all: "All", env: "Environment", edu: "Education", health: "Health",
    social: "Solidarity", culture: "Culture", level: "Level", rank: "National rank", badges: "Badges",
    national: "National", wilaya: "Wilaya", daysLeft: "days left", participants: "participants", redeem: "Redeem",
    earn: "Earn", use: "Use", perks: "Perks", featured: "Featured challenges", seeAll: "See all",
    active: "Active", nearby: "Nearby", darkMode: "Dark mode", install: "Install app",
    approve: "Approve", reject: "Reject", noPending: "No pending requests", back: "Back",
    volunteerHours: "Volunteer hours", completed: "Completed initiatives", impact: "Community impact",
    xpToNext: "XP to next level", notEnough: "Not enough points", redeemed: "Redeemed",
    reset: "Reset data", about: "About INJAZ", activeInWilayas: "active wilayas",
  },
} as const;

export type TKey = keyof typeof dict.ar;

const Ctx = createContext<{ lang: Lang; setLang: (l: Lang) => void; t: (k: TKey) => string }>({
  lang: "ar",
  setLang: () => {},
  t: (k) => dict.ar[k],
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("ar");
  useEffect(() => {
    const saved = localStorage.getItem("injaz-lang") as Lang | null;
    if (saved && saved in dict) setLangState(saved);
  }, []);
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  }, [lang]);
  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem("injaz-lang", l);
  };
  return <Ctx.Provider value={{ lang, setLang, t: (k) => dict[lang][k] }}>{children}</Ctx.Provider>;
}

export const useI18n = () => useContext(Ctx);
