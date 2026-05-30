import { getField, parseHarmonyScore } from "./airtable";

function pick(fields, ...keys) {
  if (!fields) return null;
  for (const key of keys) {
    const v = getField(fields, key, key);
    if (v != null && v !== "") return v;
  }
  const lowerKeys = keys.map((k) => k.toLowerCase());
  const found = Object.keys(fields).find((k) =>
    lowerKeys.some((lk) => k.toLowerCase().includes(lk.toLowerCase()))
  );
  return found ? getField(fields, found, found) : null;
}

function pickLocalized(fields, lang, arKeys, enKeys) {
  const keys = lang === "en" ? [...enKeys, ...arKeys] : [...arKeys, ...enKeys];
  return pick(fields, ...keys);
}

function pickNumber(fields, ...keys) {
  const raw = pick(fields, ...keys);
  if (raw == null) return null;
  const n = Number(String(raw).replace(/%/g, "").trim());
  return Number.isFinite(n) ? n : null;
}

function firstTitle(fields) {
  const skip = new Set(["id", "created", "modified"]);
  for (const [k, v] of Object.entries(fields || {})) {
    if (skip.has(k.toLowerCase())) continue;
    if (typeof v === "string" && v.trim().length > 2) return v.trim();
  }
  return null;
}

export function mapScientificItem(record, lang = "ar") {
  const f = record?.fields ?? {};
  return {
    id: record.id,
    title:
      pickLocalized(f, lang, ["العنوان", "البند", "اسم البند"], ["Title", "Name"]) ||
      firstTitle(f) ||
      (lang === "en" ? "Untitled item" : "بند بدون عنوان"),
    category:
      pickLocalized(f, lang, ["التصنيف", "المجال", "المجال العلمي"], ["Category"]) ||
      (lang === "en" ? "Uncategorized" : "غير مصنف"),
    weight: pickNumber(f, "الوزن", "Weight", "الوزن النسبي", "AI Weight") ?? 0.5,
    usage: pickNumber(f, "الاستخدام", "Usage", "IEP Usage", "عدد الاستخدام") ?? 0,
    fields: f,
  };
}

export function mapSpecialist(record, lang = "ar") {
  const f = record?.fields ?? {};
  return {
    id: record.id,
    name:
      pickLocalized(f, lang, ["الاسم", "اسم الأخصائي"], ["Name"]) ||
      firstTitle(f) ||
      (lang === "en" ? "Specialist" : "أخصائي"),
    specialty: pickLocalized(f, lang, ["التخصص", "المسمى"], ["Specialty"]) || "—",
    email: pick(f, "البريد", "Email", "البريد الإلكتروني") || "",
    phone: pick(f, "الهاتف", "Phone", "رقم الهاتف") || "",
    status:
      pickLocalized(f, lang, ["الحالة"], ["Status"]) ||
      (lang === "en" ? "Unspecified" : "غير محدد"),
    cases: pickNumber(f, "الحالات", "Cases", "الحالات النشطة") ?? 0,
    rating: pickNumber(f, "التقييم", "Rating", "تقييم الأداء") ?? null,
    fields: f,
  };
}

export function mapAbcPlan(record, lang = "ar") {
  const f = record?.fields ?? {};
  return {
    id: record.id,
    title:
      pickLocalized(f, lang, ["العنوان", "اسم الخطة"], ["Title", "Plan"]) ||
      firstTitle(f) ||
      (lang === "en" ? "Intervention plan" : "خطة تدخل"),
    behavior:
      pickLocalized(f, lang, ["السلوك", "السلوك المستهدف"], ["Behavior", "Target Behavior"]) || "—",
    status:
      pickLocalized(f, lang, ["الحالة"], ["Status"]) ||
      (lang === "en" ? "Unspecified" : "غير محدد"),
    intensity:
      pickLocalized(f, lang, ["الشدة", "التغير"], ["Intensity", "Change"]) || "—",
    fields: f,
  };
}

export function mapMedia(record, lang = "ar") {
  const f = record?.fields ?? {};
  const enc = pick(f, "مشفر", "Encrypted", "AES");
  return {
    id: record.id,
    title:
      pickLocalized(f, lang, ["العنوان", "اسم المقطع"], ["Title"]) ||
      firstTitle(f) ||
      (lang === "en" ? "Clip" : "مقطع"),
    category:
      pickLocalized(f, lang, ["التصنيف", "المجال"], ["Category"]) ||
      (lang === "en" ? "General" : "عام"),
    duration: pick(f, "المدة", "Duration", "Length") || "—",
    encrypted: enc == null ? true : String(enc).toLowerCase() !== "false" && enc !== "0",
    fields: f,
  };
}

export function mapMelodyPattern(record, lang = "ar") {
  const f = record?.fields ?? {};
  return {
    id: record.id,
    patternId: pick(f, "المعرف", "ID", "Pattern ID") || record.id,
    name:
      pickLocalized(f, lang, ["النمط", "العنوان"], ["Name", "Pattern"]) ||
      firstTitle(f) ||
      (lang === "en" ? "Audio pattern" : "نمط صوتي"),
    desc: pickLocalized(f, lang, ["الوصف"], ["Description", "Desc"]) || "",
    score: pickNumber(f, "الدرجة", "Score", "مؤشر التفاعل", "Interaction") ?? 0,
    au: pick(f, "Face AU", "AU", "AUs", "تعابير الوجه") || "—",
    fields: f,
  };
}

export function mapResource(record, lang = "ar") {
  const f = record?.fields ?? {};
  return {
    id: record.id,
    title:
      pickLocalized(f, lang, ["العنوان", "اسم المورد"], ["Title"]) ||
      firstTitle(f) ||
      (lang === "en" ? "Resource" : "مورد"),
    type:
      pickLocalized(f, lang, ["النوع", "التصنيف"], ["Type"]) ||
      (lang === "en" ? "General" : "عام"),
    audience: pickLocalized(f, lang, ["الجمهور", "المستهدف"], ["Audience"]) || "—",
    downloads: pickNumber(f, "التنزيلات", "Downloads") ?? 0,
    rating: pickNumber(f, "التقييم", "Rating") ?? null,
    summary: pickLocalized(f, lang, ["الملخص", "الوصف"], ["Summary", "Description"]) || "",
    fields: f,
  };
}

export function mapAccessUser(record, lang = "ar") {
  const f = record?.fields ?? {};
  return {
    id: record.id,
    name:
      pickLocalized(f, lang, ["الاسم", "المستخدم"], ["Name"]) ||
      firstTitle(f) ||
      (lang === "en" ? "User" : "مستخدم"),
    role: pickLocalized(f, lang, ["الدور", "الصلاحية"], ["Role"]) || "—",
    email: pick(f, "البريد", "Email") || "",
    access: pickLocalized(f, lang, ["الوصول", "الصلاحيات"], ["Access", "Permissions"]) || "—",
    lastLogin: pick(f, "آخر دخول", "Last Login", "Last Login At") || "—",
    fields: f,
  };
}

export function mapLearningRecord(record, lang = "ar") {
  const f = record?.fields ?? {};
  return {
    id: record.id,
    label:
      pickLocalized(f, lang, ["العنوان", "الطالب"], ["Title", "Student"]) ||
      firstTitle(f) ||
      (lang === "en" ? "Learning session" : "جلسة تعليمية"),
    tStatic: pickNumber(f, "T-Static", "T Static", "ثواني الشرود") ?? null,
    focusLevel: pickNumber(f, "Focus", "Focus Level", "مستوى التركيز") ?? null,
    notes: pickLocalized(f, lang, ["ملاحظات"], ["Notes", "Notes AI"]) || "",
    fields: f,
  };
}

export function mapEmotionSignal(record, lang = "ar") {
  const f = record?.fields ?? {};
  const label =
    pickLocalized(f, lang, ["العاطفة", "الحالة"], ["Emotion", "Label"]) ||
    firstTitle(f) ||
    "neutral";
  const id = String(label).toLowerCase().replace(/\s+/g, "_").slice(0, 32) || record.id;
  return {
    id: record.id,
    emotionId: id,
    label,
    score: pickNumber(f, "الدرجة", "Score", "Confidence", "النسبة") ?? 50,
    note: pickLocalized(f, lang, ["ملاحظة"], ["Note", "Notes", "AI Note"]) || "",
    fields: f,
  };
}

export { parseHarmonyScore };
