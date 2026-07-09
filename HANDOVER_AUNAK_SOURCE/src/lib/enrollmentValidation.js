/**
 * Strict sovereign enrollment validation — step 1 gate (100% before assessment).
 */

import { getCountryByIso, formatPhoneDisplay, formatPhoneE164, getCountryOptions, DEFAULT_COUNTRY_ISO } from './countryDialCodes';
import { isValidDiagnosis } from './diagnosisOptions';

export const ENROLLMENT_AGE_MIN = 2;
export const ENROLLMENT_AGE_MAX = 18;

const NAME_GIBBERISH = /^(test|fake|dummy|asdf|qwerty|abc|xyz|none|na|null|undefined|طفل|اسم|ولد|بنت|student|child)$/i;
const NAME_PART_MIN = 2;
const NAME_PART_MAX = 40;

function msg(lang, ar, en) {
  return lang === 'en' ? en : ar;
}

/** At least two name parts (first + family), letters only, no gibberish. */
export function validateStudentName(raw, lang = 'ar') {
  const trimmed = String(raw ?? '')
    .trim()
    .replace(/\s+/g, ' ');

  if (!trimmed) {
    return {
      ok: false,
      code: 'NAME_EMPTY',
      message: msg(lang, 'أدخل اسم الطالب كاملاً', 'Enter the student full name'),
    };
  }

  if (trimmed.length < 5) {
    return {
      ok: false,
      code: 'NAME_TOO_SHORT',
      message: msg(
        lang,
        'الاسم قصير جداً — أدخل الاسم الأول واللقب',
        'Name too short — enter first and last name'
      ),
    };
  }

  if (!/^[\p{L}][\p{L}\s'-]*[\p{L}]$/u.test(trimmed) && !/^[\p{L}]{2,}$/u.test(trimmed)) {
    return {
      ok: false,
      code: 'NAME_FORMAT',
      message: msg(
        lang,
        'الاسم يجب أن يحتوي على حروف فقط (بدون أرقام أو رموز)',
        'Name must contain letters only (no numbers or symbols)'
      ),
    };
  }

  if (/[\d#@$%^&*()+=[\]{}|\\/<>~`"]/.test(trimmed)) {
    return {
      ok: false,
      code: 'NAME_SYMBOLS',
      message: msg(
        lang,
        'يُمنع استخدام الرموز أو الأرقام في اسم الطالب',
        'Numbers and symbols are not allowed in the student name'
      ),
    };
  }

  const parts = trimmed.split(/\s+/).filter(Boolean);
  const validParts = parts.filter((p) => {
    const clean = p.replace(/[-']/g, '');
    return clean.length >= NAME_PART_MIN && clean.length <= NAME_PART_MAX && /^[\p{L}]+$/u.test(clean);
  });

  if (validParts.length < 2) {
    return {
      ok: false,
      code: 'NAME_TWO_PARTS',
      message: msg(
        lang,
        'يجب إدخال اسمين على الأقل: الاسم الأول + اللقب (مثل: محمد علي)',
        'Enter at least two names: first name + family name (e.g. Mohamed Ali)'
      ),
    };
  }

  for (const part of validParts) {
    const core = part.replace(/[-']/g, '');
    if (NAME_GIBBERISH.test(core)) {
      return {
        ok: false,
        code: 'NAME_GIBBERISH',
        message: msg(
          lang,
          'الاسم المدخل غير مقبول — استخدم الاسم الحقيقي للطفل',
          'Invalid name — use the child real name'
        ),
      };
    }
    if (/^(.)\1{2,}$/u.test(core)) {
      return {
        ok: false,
        code: 'NAME_REPEAT',
        message: msg(
          lang,
          'الاسم يبدو عشوائياً — أدخل اسماً حقيقياً',
          'Name appears random — enter a real name'
        ),
      };
    }
  }

  return { ok: true, normalized: validParts.join(' ') };
}

/** Platform eligibility: 2–18 years inclusive. */
export function validateEnrollmentAge(raw, lang = 'ar') {
  const s = String(raw ?? '').trim();
  if (!s) {
    return {
      ok: false,
      code: 'AGE_EMPTY',
      message: msg(lang, 'أدخل عمر الطفل', 'Enter the child age'),
    };
  }

  if (!/^\d{1,2}$/.test(s)) {
    return {
      ok: false,
      code: 'AGE_FORMAT',
      message: msg(lang, 'العمر يجب أن يكون رقماً صحيحاً', 'Age must be a whole number'),
    };
  }

  const n = Number(s);
  if (!Number.isInteger(n)) {
    return {
      ok: false,
      code: 'AGE_FORMAT',
      message: msg(lang, 'العمر يجب أن يكون رقماً صحيحاً', 'Age must be a whole number'),
    };
  }

  if (n < ENROLLMENT_AGE_MIN || n > ENROLLMENT_AGE_MAX) {
    return {
      ok: false,
      code: 'AGE_RANGE',
      message: msg(
        lang,
        `العمر يجب أن يكون بين ${ENROLLMENT_AGE_MIN} و ${ENROLLMENT_AGE_MAX} سنة — النطاق التأهيلي للمنصة`,
        `Age must be between ${ENROLLMENT_AGE_MIN} and ${ENROLLMENT_AGE_MAX} — platform eligibility range`
      ),
    };
  }

  return { ok: true, value: n };
}

export function validateDiagnosis(raw, lang = 'ar') {
  const key = String(raw ?? '').trim();
  if (!key) {
    return {
      ok: false,
      code: 'DIAGNOSIS_EMPTY',
      message: msg(lang, 'اختر التشخيص من القائمة', 'Select a diagnosis from the list'),
    };
  }
  if (!isValidDiagnosis(key)) {
    return {
      ok: false,
      code: 'DIAGNOSIS_INVALID',
      message: msg(lang, 'التشخيص المختار غير صالح', 'Selected diagnosis is invalid'),
    };
  }
  return { ok: true, value: key };
}

function isAllSameDigit(digits) {
  return /^(\d)\1+$/.test(digits);
}

function isTrivialSequence(digits) {
  if (digits.length < 6) return false;
  const seqs = ['0123456789', '1234567890', '9876543210', '0987654321'];
  return seqs.some((s) => s.includes(digits) || digits.includes(s.slice(0, digits.length)));
}

function isMonotonicRun(digits) {
  if (digits.length < 6) return false;
  let asc = true;
  let desc = true;
  for (let i = 1; i < digits.length; i += 1) {
    const a = Number(digits[i - 1]);
    const b = Number(digits[i]);
    if (b !== a + 1) asc = false;
    if (b !== a - 1) desc = false;
  }
  return asc || desc;
}

/** Country-aware mobile — national number + ISO country. */
export function validateParentPhone(nationalRaw, countryIso, lang = 'ar') {
  const country = getCountryByIso(countryIso);
  let national = String(nationalRaw ?? '').replace(/\D/g, '');
  if (national.startsWith('0')) national = national.slice(1);

  if (!national) {
    return {
      ok: false,
      code: 'PHONE_EMPTY',
      message: msg(lang, 'أدخل رقم هاتف ولي الأمر', 'Enter guardian phone number'),
    };
  }

  if (isAllSameDigit(national) || isTrivialSequence(national) || isMonotonicRun(national)) {
    return {
      ok: false,
      code: 'PHONE_FAKE',
      message: msg(
        lang,
        'رقم الهاتف غير واقعي — أدخل رقم جوال فعّال',
        'Phone number looks invalid — enter a real mobile number'
      ),
    };
  }

  const lenOk =
    national.length === country.nationalLength ||
    (country.nationalLength >= 8 && national.length >= country.nationalLength - 1 && national.length <= country.nationalLength + 1);

  if (!lenOk) {
    return {
      ok: false,
      code: 'PHONE_LENGTH',
      message: msg(
        lang,
        `رقم الجوال في ${country.ar} عادة ${country.nationalLength} أرقام (بدون كود الدولة)`,
        `Mobile in ${country.en} is typically ${country.nationalLength} digits (without country code)`
      ),
    };
  }

  if (country.mobileStarts?.length && !country.mobileStarts.some((p) => national.startsWith(p))) {
    return {
      ok: false,
      code: 'PHONE_FORMAT',
      message: msg(
        lang,
        'صيغة رقم الجوال غير صحيحة لهذا البلد',
        'Mobile number format is invalid for this country'
      ),
    };
  }

  const e164 = formatPhoneE164(countryIso, national);
  return {
    ok: true,
    normalized: e164,
    display: formatPhoneDisplay(countryIso, national),
    countryCode: country.dial,
    national,
  };
}

/** Full step-1 validation — all fields must pass. */
export function validateEnrollmentStep1({
  name,
  age,
  parentPhone,
  countryIso,
  diagnosis,
  lang = 'ar',
}) {
  const errors = {};
  const nameResult = validateStudentName(name, lang);
  const ageResult = validateEnrollmentAge(age, lang);
  const phoneResult = validateParentPhone(parentPhone, countryIso, lang);
  const diagnosisResult = validateDiagnosis(diagnosis, lang);

  if (!nameResult.ok) errors.name = nameResult.message;
  if (!ageResult.ok) errors.age = ageResult.message;
  if (!phoneResult.ok) errors.phone = phoneResult.message;
  if (!diagnosisResult.ok) errors.diagnosis = diagnosisResult.message;

  const ok = nameResult.ok && ageResult.ok && phoneResult.ok && diagnosisResult.ok;

  return {
    ok,
    errors,
    normalized: ok
      ? {
          name: nameResult.normalized,
          age: ageResult.value,
          parentPhone: phoneResult.display,
          parentPhoneE164: phoneResult.normalized,
          parentCountryCode: phoneResult.countryCode,
          diagnosis: diagnosisResult.value,
        }
      : null,
    firstError: errors.name || errors.age || errors.phone || errors.diagnosis || null,
  };
}
