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
    if (typeof v === "number" && Number.isFinite(v)) return String(v);
  }
  return null;
}

function isRecordId(value) {
  if (value == null) return false;
  return String(value)
    .split(",")
    .every((part) => /^rec[a-zA-Z0-9]{10,}$/.test(part.trim()));
}

function pickDisplay(fields, ...keys) {
  const value = pick(fields, ...keys);
  if (value == null || value === "" || isRecordId(value)) return null;
  return value;
}

function pickLinkedId(fields, ...keys) {
  const raw = pick(fields, ...keys);
  if (raw == null || raw === "") return null;
  const first = String(raw).split(",")[0]?.trim();
  return first && /^rec[a-zA-Z0-9]{10,}$/.test(first) ? first : null;
}

function pickBoolean(fields, ...keys) {
  const raw = pick(fields, ...keys);
  if (raw == null) return false;
  return String(raw).toLowerCase() === "true" || raw === "1";
}

export function mapScientificItem(record, lang = "ar") {
  const f = record?.fields ?? {};
  return {
    id: record.id,
    title:
      pickLocalized(f, lang, ["البند العلمي", "العنوان", "البند", "اسم البند"], ["Title", "Name", "Scientific Item"]) ||
      firstTitle(f) ||
      (lang === "en" ? "Untitled item" : "بند بدون عنوان"),
    category:
      pickLocalized(f, lang, ["المجال", "التصنيف", "المجال العلمي"], ["Category", "Domain"]) ||
      (lang === "en" ? "Uncategorized" : "غير مصنف"),
    weight: pickNumber(f, "الوزن النسبي", "الوزن", "Weight", "AI Weight") ?? 0.5,
    usage: pickNumber(f, "الاستخدام", "Usage", "IEP Usage", "عدد الاستخدام") ?? 0,
    fields: f,
  };
}

export function mapSpecialist(record, lang = "ar") {
  const f = record?.fields ?? {};
  const specialty =
    pickLocalized(f, lang, ["نوع التخصص", "التخصص", "المسمى"], ["Specialty", "Specialty Type"]) || "—";
  return {
    id: record.id,
    name:
      pickLocalized(f, lang, ["الاسم", "اسم الأخصائي", "User Name"], ["Name"]) ||
      (specialty !== "—" ? specialty : null) ||
      firstTitle(f) ||
      (lang === "en" ? "Specialist" : "أخصائي"),
    specialty,
    email: pick(f, "البريد", "Email", "البريد الإلكتروني", "User Email") || "",
    phone: pick(f, "الهاتف", "Phone", "رقم الهاتف") || "",
    status:
      pickLocalized(f, lang, ["الحالة", "Access Level"], ["Status"]) ||
      (lang === "en" ? "Unspecified" : "غير محدد"),
    cases: pickNumber(f, "الحالات", "Cases", "الحالات النشطة") ?? 0,
    rating: pickNumber(f, "التقييم", "Rating", "تقييم الأداء") ?? null,
    fields: f,
  };
}

export function mapAbcPlan(record, lang = "ar") {
  const f = record?.fields ?? {};
  const caseId = pickNumber(f, "مُعرف الحالة", "Case ID", "معرف الحالة");
  const crisisScore = pickNumber(f, "Crisis Score", "crisis score");
  const riskLabel = pickLocalized(f, lang, ["تقييم مستوى الخطر (ذكي)", "الشدة"], ["Risk Score", "Intensity"]);
  return {
    id: record.id,
    title:
      pickLocalized(f, lang, ["العنوان", "اسم الخطة"], ["Title", "Plan"]) ||
      (caseId != null
        ? lang === "en"
          ? `Case #${caseId}`
          : `حالة #${caseId}`
        : null) ||
      firstTitle(f) ||
      (lang === "en" ? "Intervention plan" : "خطة تدخل"),
    behavior:
      pickLocalized(f, lang, ["السلوك", "السلوك المستهدف"], ["Behavior", "Target Behavior"]) ||
      (crisisScore != null
        ? lang === "en"
          ? `Crisis score: ${crisisScore}`
          : `درجة الأزمة: ${crisisScore}`
        : "—"),
    status:
      pickLocalized(f, lang, ["الحالة"], ["Status"]) ||
      (riskLabel != null && riskLabel !== ""
        ? String(riskLabel)
        : lang === "en"
          ? "Unspecified"
          : "غير محدد"),
    intensity:
      pickLocalized(f, lang, ["الشدة", "التغير"], ["Intensity", "Change"]) ||
      (crisisScore != null ? String(crisisScore) : "—"),
    fields: f,
  };
}

export function mapMedia(record, lang = "ar") {
  const f = record?.fields ?? {};
  const category =
    pickLocalized(
      f,
      lang,
      ["التصنيف", "Educational Skill Category", "المجال"],
      ["Category", "Skill Category"]
    ) || (lang === "en" ? "General" : "عام");
  const enc = pick(f, "مشفر", "Encrypted", "AES");
  return {
    id: record.id,
    title:
      pickLocalized(
        f,
        lang,
        ["العنوان", "Media Description (AI Summary)", "Recommended Engagement Actions", "اسم المقطع"],
        ["Title", "Media Description"]
      ) ||
      (category !== "—" && category !== "General" && category !== "عام" ? category : null) ||
      firstTitle(f) ||
      (lang === "en" ? "Clip" : "مقطع"),
    category,
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
      pickLocalized(
        f,
        lang,
        ["نوع النمط الصوتي", "النمط", "النمط الصوتي", "العنوان"],
        ["Name", "Pattern", "Pattern Type"]
      ) ||
      firstTitle(f) ||
      (lang === "en" ? "Audio pattern" : "نمط صوتي"),
    desc:
      pickLocalized(f, lang, ["الملاحظات الإبداعية (ذكية)", "الوصف"], ["Description", "Creative Notes"]) || "",
    score:
      pickNumber(f, "Score", "مؤشر التفاعل الذكي", "الدرجة", "مؤشر التفاعل", "Interaction") ?? 0,
    au: pickDisplay(f, "Face AU", "AU", "AUs", "تعابير الوجه") || "—",
    linkedEmotionId: pickLinkedId(f, "الرصد العاطفي اللحظي", "Emotional Monitoring"),
    fields: f,
  };
}

export function mapResource(record, lang = "ar") {
  const f = record?.fields ?? {};
  const type =
    pickLocalized(f, lang, ["النوع", "Resource Type", "التصنيف"], ["Type"]) ||
    (lang === "en" ? "General" : "عام");
  return {
    id: record.id,
    title:
      pickLocalized(
        f,
        lang,
        ["العنوان", "اسم المورد", "Resource Short Summary (AI)", "Family Need Assessment (AI)"],
        ["Title", "Resource Name", "Summary"]
      ) ||
      (type !== "—" && type !== "General" && type !== "عام"
        ? lang === "en"
          ? `${type} resource`
          : `مورد ${type}`
        : null) ||
      firstTitle(f) ||
      (lang === "en" ? "Resource" : "مورد"),
    type,
    audience: pickLocalized(f, lang, ["الجمهور", "المستهدف", "Family Need Assessment (AI)"], ["Audience"]) || "—",
    downloads: pickNumber(f, "التنزيلات", "Downloads") ?? 0,
    rating: pickNumber(f, "Rating", "التقييم") ?? null,
    summary:
      pickLocalized(
        f,
        lang,
        ["الملخص", "Resource Short Summary (AI)", "الوصف"],
        ["Summary", "Description"]
      ) || "",
    fields: f,
  };
}

export function mapAccessUser(record, lang = "ar") {
  const f = record?.fields ?? {};
  return {
    id: record.id,
    name:
      pickLocalized(f, lang, ["User Name", "الاسم", "المستخدم"], ["Name"]) ||
      firstTitle(f) ||
      (lang === "en" ? "User" : "مستخدم"),
    role:
      pickLocalized(f, lang, ["Access Level", "الدور", "الصلاحية"], ["Role"]) || "—",
    email: pick(f, "User Email", "البريد", "Email") || "",
    access:
      pickLocalized(f, lang, ["Permissions", "الصلاحيات", "Access Areas (AI-Controlled)", "الوصول"], [
        "Access",
      ]) || "—",
    lastLogin: pick(f, "آخر دخول", "Last Login", "Last Login At") || "—",
    fields: f,
  };
}

export function mapLearningRecord(record, lang = "ar") {
  const f = record?.fields ?? {};
  return {
    id: record.id,
    label:
      pickLocalized(f, lang, ["اسم الحالة", "العنوان", "الطالب"], ["Title", "Student", "Case Name"]) ||
      firstTitle(f) ||
      (lang === "en" ? "Learning session" : "جلسة تعليمية"),
    tStatic: pickNumber(f, "T-Static", "T Static", "ثواني الشرود") ?? null,
    focusLevel:
      pickNumber(
        f,
        "Focus",
        "Focus Level",
        "مستوى التركيز",
        "Eye_Movement_Radius",
        "تقييم التقدم الأكاديمي (AI)"
      ) ?? null,
    notes:
      pickLocalized(f, lang, ["توصية التدخل (AI)", "ملاحظات"], ["Notes", "Notes AI", "Intervention"]) ||
      "",
    fields: f,
  };
}

export function mapEmotionSignal(record, lang = "ar") {
  const f = record?.fields ?? {};
  const linkedPatternId = pickLinkedId(f, "النمط الصوتي", "Sound Pattern", "Melody Pattern");
  const preferredPattern = pickBoolean(f, "مؤشر النمط المفضل", "Preferred Pattern");
  const label =
    pickDisplay(
      f,
      "تحليل مزاج الطفل (AI Mood Insight)",
      "العاطفة",
      "الحالة",
      "شرح علمي تفصيلي (Intelligence Insight)"
    ) ||
    (preferredPattern
      ? lang === "en"
        ? "Preferred pattern active"
        : "نمط مفضل نشط"
      : null) ||
    (lang === "en" ? "Emotional monitoring active" : "رصد عاطفي نشط");
  const id = String(label).toLowerCase().replace(/\s+/g, "_").slice(0, 32) || record.id;
  return {
    id: record.id,
    emotionId: id,
    label,
    linkedPatternId,
    preferredPattern,
    score:
      pickNumber(f, "Score", "الدرجة", "Confidence", "النسبة", "Accessibility Score (AI)") ?? 50,
    note:
      pickDisplay(f, "شرح علمي تفصيلي (Intelligence Insight)", "ملاحظة", "Note", "Notes", "AI Note") ||
      "",
    fields: f,
  };
}

export { parseHarmonyScore };
