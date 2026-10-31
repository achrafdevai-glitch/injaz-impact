export type Category = "env" | "edu" | "health" | "social" | "culture";

export const CATEGORIES: { id: Category; emoji: string }[] = [
  { id: "env", emoji: "🌱" },
  { id: "edu", emoji: "📚" },
  { id: "health", emoji: "🩺" },
  { id: "social", emoji: "🤝" },
  { id: "culture", emoji: "🎭" },
];

// 58 wilayas: [code, Arabic name, French name, lat, lng]
export const WILAYAS: [number, string, string, number, number][] = [
  [1, "أدرار", "Adrar", 27.87, -0.29], [2, "الشلف", "Chlef", 36.16, 1.33],
  [3, "الأغواط", "Laghouat", 33.8, 2.88], [4, "أم البواقي", "Oum El Bouaghi", 35.87, 7.11],
  [5, "باتنة", "Batna", 35.56, 6.17], [6, "بجاية", "Béjaïa", 36.75, 5.06],
  [7, "بسكرة", "Biskra", 34.85, 5.73], [8, "بشار", "Béchar", 31.62, -2.22],
  [9, "البليدة", "Blida", 36.47, 2.83], [10, "البويرة", "Bouira", 36.37, 3.9],
  [11, "تمنراست", "Tamanrasset", 22.79, 5.52], [12, "تبسة", "Tébessa", 35.4, 8.12],
  [13, "تلمسان", "Tlemcen", 34.88, -1.31], [14, "تيارت", "Tiaret", 35.37, 1.32],
  [15, "تيزي وزو", "Tizi Ouzou", 36.71, 4.05], [16, "الجزائر", "Alger", 36.75, 3.06],
  [17, "الجلفة", "Djelfa", 34.67, 3.26], [18, "جيجل", "Jijel", 36.82, 5.77],
  [19, "سطيف", "Sétif", 36.19, 5.41], [20, "سعيدة", "Saïda", 34.83, 0.15],
  [21, "سكيكدة", "Skikda", 36.88, 6.91], [22, "سيدي بلعباس", "Sidi Bel Abbès", 35.19, -0.63],
  [23, "عنابة", "Annaba", 36.9, 7.77], [24, "قالمة", "Guelma", 36.46, 7.43],
  [25, "قسنطينة", "Constantine", 36.36, 6.61], [26, "المدية", "Médéa", 36.26, 2.75],
  [27, "مستغانم", "Mostaganem", 35.93, 0.09], [28, "المسيلة", "M'Sila", 35.7, 4.54],
  [29, "معسكر", "Mascara", 35.4, 0.14], [30, "ورقلة", "Ouargla", 31.95, 5.33],
  [31, "وهران", "Oran", 35.7, -0.63], [32, "البيض", "El Bayadh", 33.68, 1.02],
  [33, "إليزي", "Illizi", 26.5, 8.48], [34, "برج بوعريريج", "Bordj Bou Arréridj", 36.07, 4.76],
  [35, "بومرداس", "Boumerdès", 36.76, 3.48], [36, "الطارف", "El Tarf", 36.77, 8.31],
  [37, "تندوف", "Tindouf", 27.67, -8.15], [38, "تيسمسيلت", "Tissemsilt", 35.6, 1.81],
  [39, "الوادي", "El Oued", 33.37, 6.86], [40, "خنشلة", "Khenchela", 35.43, 7.14],
  [41, "سوق أهراس", "Souk Ahras", 36.29, 7.95], [42, "تيبازة", "Tipaza", 36.59, 2.45],
  [43, "ميلة", "Mila", 36.45, 6.26], [44, "عين الدفلى", "Aïn Defla", 36.26, 1.97],
  [45, "النعامة", "Naâma", 33.27, -0.31], [46, "عين تموشنت", "Aïn Témouchent", 35.3, -1.14],
  [47, "غرداية", "Ghardaïa", 32.49, 3.67], [48, "غليزان", "Relizane", 35.74, 0.56],
  [49, "تيميمون", "Timimoun", 29.26, 0.24], [50, "برج باجي مختار", "Bordj Badji Mokhtar", 21.33, 0.95],
  [51, "أولاد جلال", "Ouled Djellal", 34.42, 5.07], [52, "بني عباس", "Béni Abbès", 30.13, -2.17],
  [53, "عين صالح", "In Salah", 27.2, 2.48], [54, "عين قزام", "In Guezzam", 19.57, 5.77],
  [55, "تقرت", "Touggourt", 33.1, 6.06], [56, "جانت", "Djanet", 24.55, 9.48],
  [57, "المغير", "El M'Ghair", 33.95, 5.92], [58, "المنيعة", "El Meniaa", 30.58, 2.88],
];

// Approximate national border (lng, lat)
export const ALGERIA_OUTLINE: [number, number][] = [
  [8.6, 36.9], [8.2, 36.4], [8.4, 35.2], [7.5, 34.1], [7.8, 33.2], [9.1, 32.1], [9.5, 30.2],
  [9.9, 29.0], [9.8, 27.9], [9.4, 26.4], [10.0, 25.3], [11.9, 24.0], [11.6, 23.4], [7.5, 20.9],
  [5.8, 19.4], [4.2, 19.2], [3.2, 19.1], [3.1, 19.7], [1.8, 20.6], [1.1, 21.0], [-4.8, 25.0],
  [-8.7, 27.3], [-8.7, 28.7], [-7.1, 29.6], [-5.3, 30.0], [-3.7, 30.9], [-3.6, 31.6], [-1.2, 32.1],
  [-1.2, 32.7], [-1.7, 33.3], [-1.8, 34.6], [-2.2, 35.1], [-1.2, 35.7], [0.0, 35.9], [1.5, 36.6],
  [3.2, 36.8], [5.3, 36.7], [7.0, 37.0], [8.6, 36.9],
];

export type Challenge = {
  id: string;
  title: string;
  desc: string;
  category: Category;
  wilaya: number;
  xp: number;
  points: number;
  hours: number;
  participants: number;
  goal: number;
  daysLeft: number;
};

export const CHALLENGES: Challenge[] = [
  { id: "c1", title: "تنظيف شاطئ سيدي فرج", desc: "حملة جماعية لجمع البلاستيك وتنظيف الشاطئ صباح الجمعة.", category: "env", wilaya: 16, xp: 250, points: 120, hours: 4, participants: 86, goal: 120, daysLeft: 3 },
  { id: "c2", title: "غرس 1000 شجرة في الأطلس", desc: "مبادرة تشجير بالتعاون مع محافظة الغابات.", category: "env", wilaya: 9, xp: 400, points: 200, hours: 6, participants: 214, goal: 300, daysLeft: 9 },
  { id: "c3", title: "دروس دعم لتلاميذ البكالوريا", desc: "ساعات تطوعية لتدريس الرياضيات والفيزياء.", category: "edu", wilaya: 31, xp: 300, points: 150, hours: 8, participants: 42, goal: 60, daysLeft: 14 },
  { id: "c4", title: "حملة تبرع بالدم", desc: "بالتنسيق مع مستشفى ابن باديس الجامعي.", category: "health", wilaya: 25, xp: 350, points: 180, hours: 2, participants: 133, goal: 200, daysLeft: 5 },
  { id: "c5", title: "قفة رمضان للعائلات", desc: "تجهيز وتوزيع قفف غذائية للعائلات المعوزة.", category: "social", wilaya: 19, xp: 280, points: 140, hours: 5, participants: 97, goal: 150, daysLeft: 20 },
  { id: "c6", title: "ترميم قصر غرداية", desc: "ورشة تطوعية للحفاظ على التراث المعماري المزابي.", category: "culture", wilaya: 47, xp: 450, points: 220, hours: 10, participants: 28, goal: 40, daysLeft: 30 },
  { id: "c7", title: "واحة خضراء في ورقلة", desc: "سقي وتنظيف واحات النخيل.", category: "env", wilaya: 30, xp: 320, points: 160, hours: 6, participants: 51, goal: 80, daysLeft: 12 },
  { id: "c8", title: "قافلة طبية للهقار", desc: "مرافقة الأطباء في قافلة للمناطق النائية.", category: "health", wilaya: 11, xp: 600, points: 300, hours: 24, participants: 17, goal: 25, daysLeft: 18 },
  { id: "c9", title: "مكتبة الحي", desc: "جمع الكتب وإنشاء مكتبة مفتوحة للأطفال.", category: "edu", wilaya: 23, xp: 220, points: 110, hours: 3, participants: 64, goal: 100, daysLeft: 7 },
  { id: "c10", title: "مرافقة كبار السن", desc: "زيارات أسبوعية لدار العجزة.", category: "social", wilaya: 13, xp: 260, points: 130, hours: 4, participants: 38, goal: 50, daysLeft: 10 },
  { id: "c11", title: "مهرجان المسرح المدرسي", desc: "تنظيم فعاليات ثقافية للتلاميذ.", category: "culture", wilaya: 6, xp: 240, points: 120, hours: 5, participants: 45, goal: 70, daysLeft: 16 },
  { id: "c12", title: "تنظيف وادي الحراش", desc: "حملة كبرى لإزالة النفايات من ضفاف الوادي.", category: "env", wilaya: 35, xp: 380, points: 190, hours: 5, participants: 156, goal: 250, daysLeft: 4 },
];

export const LEADERS = [
  { name: "أمينة بن علي", wilaya: 16, xp: 18450 },
  { name: "يوسف حداد", wilaya: 31, xp: 17220 },
  { name: "سارة مزيان", wilaya: 25, xp: 16080 },
  { name: "رياض بوزيد", wilaya: 19, xp: 14510 },
  { name: "نور الهدى قاسمي", wilaya: 9, xp: 13990 },
  { name: "إلياس عمراني", wilaya: 23, xp: 12740 },
  { name: "مريم بلقاسم", wilaya: 16, xp: 11860 },
  { name: "كريم سعيدي", wilaya: 30, xp: 10420 },
  { name: "ليلى زروقي", wilaya: 13, xp: 9870 },
  { name: "عبد الرحمن طالبي", wilaya: 47, xp: 9120 },
];

export const BADGES = [
  { id: "first", emoji: "🌟", name: "الخطوة الأولى", need: 1 },
  { id: "green", emoji: "🌳", name: "حارس البيئة", need: 3 },
  { id: "heart", emoji: "❤️", name: "قلب كبير", need: 5 },
  { id: "teacher", emoji: "🎓", name: "المعلم", need: 7 },
  { id: "hero", emoji: "🦸", name: "بطل الولاية", need: 10 },
  { id: "legend", emoji: "🏆", name: "أسطورة إنجاز", need: 20 },
];

export const REWARDS = [
  { id: "r1", title: "قسيمة مكتبة 1000 دج", cost: 400, emoji: "📖", partner: "مكتبة العالم الثالث" },
  { id: "r2", title: "تذكرة سينما مزدوجة", cost: 300, emoji: "🎬", partner: "Cinémathèque" },
  { id: "r3", title: "شهادة تطوع معتمدة", cost: 600, emoji: "📜", partner: "وزارة الشباب" },
  { id: "r4", title: "قميص إنجاز الرسمي", cost: 500, emoji: "👕", partner: "INJAZ" },
  { id: "r5", title: "اشتراك رياضي شهري", cost: 900, emoji: "🏋️", partner: "Fitness DZ" },
  { id: "r6", title: "دورة تكوينية مجانية", cost: 1200, emoji: "💻", partner: "Algeria Tech Hub" },
];

export const TIERS = [
  { name: "برونزي", min: 0 },
  { name: "فضي", min: 1500 },
  { name: "ذهبي", min: 4000 },
  { name: "بلاتيني", min: 9000 },
];

export function levelFromXp(xp: number) {
  const level = Math.floor(Math.sqrt(xp / 100)) + 1;
  const cur = (level - 1) ** 2 * 100;
  const next = level ** 2 * 100;
  return { level, progress: (xp - cur) / (next - cur), toNext: next - xp };
}

export function tierFromXp(xp: number) {
  let idx = 0;
  TIERS.forEach((t, i) => xp >= t.min && (idx = i));
  return { tier: TIERS[idx], next: TIERS[idx + 1] };
}

export function wilayaName(code: number, lang: string) {
  const w = WILAYAS.find((x) => x[0] === code);
  if (!w) return "";
  return lang === "ar" ? w[1] : w[2];
}
