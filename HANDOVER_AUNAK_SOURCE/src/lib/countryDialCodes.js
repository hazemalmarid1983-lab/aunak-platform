/**
 * Country dial codes for enrollment — add countries here for stats / marketing geo.
 */

export const COUNTRY_DIAL_CODES = [
  { iso: 'SA', flag: '🇸🇦', dial: '966', ar: 'السعودية', en: 'Saudi Arabia', nationalLength: 9, mobileStarts: ['5'] },
  { iso: 'AE', flag: '🇦🇪', dial: '971', ar: 'الإمارات', en: 'UAE', nationalLength: 9, mobileStarts: ['5'] },
  { iso: 'OM', flag: '🇴🇲', dial: '968', ar: 'عُمان', en: 'Oman', nationalLength: 8, mobileStarts: ['7', '9'] },
  { iso: 'KW', flag: '🇰🇼', dial: '965', ar: 'الكويت', en: 'Kuwait', nationalLength: 8, mobileStarts: ['5', '6', '9'] },
  { iso: 'QA', flag: '🇶🇦', dial: '974', ar: 'قطر', en: 'Qatar', nationalLength: 8, mobileStarts: ['3', '5', '6', '7'] },
  { iso: 'BH', flag: '🇧🇭', dial: '973', ar: 'البحرين', en: 'Bahrain', nationalLength: 8, mobileStarts: ['3'] },
  { iso: 'EG', flag: '🇪🇬', dial: '20', ar: 'مصر', en: 'Egypt', nationalLength: 10, mobileStarts: ['1'] },
  { iso: 'JO', flag: '🇯🇴', dial: '962', ar: 'الأردن', en: 'Jordan', nationalLength: 9, mobileStarts: ['7'] },
  { iso: 'LB', flag: '🇱🇧', dial: '961', ar: 'لبنان', en: 'Lebanon', nationalLength: 8, mobileStarts: ['3', '7'] },
  { iso: 'IQ', flag: '🇮🇶', dial: '964', ar: 'العراق', en: 'Iraq', nationalLength: 10, mobileStarts: ['7'] },
  { iso: 'YE', flag: '🇾🇪', dial: '967', ar: 'اليمن', en: 'Yemen', nationalLength: 9, mobileStarts: ['7'] },
  { iso: 'PS', flag: '🇵🇸', dial: '970', ar: 'فلسطين', en: 'Palestine', nationalLength: 9, mobileStarts: ['5'] },
  { iso: 'MA', flag: '🇲🇦', dial: '212', ar: 'المغرب', en: 'Morocco', nationalLength: 9, mobileStarts: ['6', '7'] },
  { iso: 'DZ', flag: '🇩🇿', dial: '213', ar: 'الجزائر', en: 'Algeria', nationalLength: 9, mobileStarts: ['5', '6', '7'] },
  { iso: 'TN', flag: '🇹🇳', dial: '216', ar: 'تونس', en: 'Tunisia', nationalLength: 8, mobileStarts: ['2', '4', '5', '9'] },
];

export const DEFAULT_COUNTRY_ISO = 'SA';

export function getCountryByIso(iso) {
  return COUNTRY_DIAL_CODES.find((c) => c.iso === iso) ?? COUNTRY_DIAL_CODES[0];
}

export function getCountryOptions(lang = 'ar') {
  return COUNTRY_DIAL_CODES.map((c) => ({
    ...c,
    label: `${c.flag} +${c.dial} ${lang === 'en' ? c.en : c.ar}`,
  }));
}

/** Strip leading 0 from national input; return E.164 digits without + */
export function formatPhoneE164(countryIso, nationalRaw) {
  const country = getCountryByIso(countryIso);
  let national = String(nationalRaw ?? '').replace(/\D/g, '');
  if (national.startsWith('0')) national = national.slice(1);
  return `${country.dial}${national}`;
}

export function formatPhoneDisplay(countryIso, nationalRaw) {
  const e164 = formatPhoneE164(countryIso, nationalRaw);
  return `+${e164}`;
}
