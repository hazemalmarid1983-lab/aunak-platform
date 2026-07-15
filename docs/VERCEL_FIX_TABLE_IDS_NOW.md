# Vercel — القيم الصحيحة فقط (انسخ حرفياً)

> المشكلة الحالية: كثير من المتغيرات أخذت رقم جدول Access Control أو رابط View.
> صحّح كل قيمة لتطابق الجدول الصحيح، ثم Redeploy من **main** (آخر commit).

## احذف أو صحّح

| المتغير | القيمة الصحيحة فقط |
|---------|---------------------|
| `AIRTABLE_BASE_ID` | `appcjitgWsbvIebwf` |
| `VITE_AIRTABLE_BASE_ID` | `appcjitgWsbvIebwf` |
| `AIRTABLE_API_KEY` | الـ PAT (بدون VITE_) |
| `VITE_USE_AIRTABLE_PROXY` | `true` |
| `VITE_AIRTABLE_CENTERS_TABLE_ID` | `tblm1ayaXTG0vdm7d` |
| `AIRTABLE_CENTERS_TABLE_ID` | `tblm1ayaXTG0vdm7d` |
| `VITE_AIRTABLE_STUDENTS_TABLE_ID` | `tblTidBPaVM4cf3O9` |
| `AIRTABLE_STUDENTS_TABLE_ID` | `tblTidBPaVM4cf3O9` |
| `VITE_AIRTABLE_SPECIALISTS_TABLE_ID` | `tblqTYEHCPBO23DBa` |
| `AIRTABLE_SPECIALISTS_TABLE_ID` | `tblqTYEHCPBO23DBa` |
| `VITE_AIRTABLE_ACCESS_TABLE_ID` | `tblsGNIKRfTpMZ8Kn` |
| `VITE_AIRTABLE_ACCESS_CONTROL_TABLE_ID` | `tblsGNIKRfTpMZ8Kn` |
| `AIRTABLE_ACCESS_CONTROL_TABLE_ID` | `tblsGNIKRfTpMZ8Kn` |
| `VITE_AIRTABLE_DAILY_SESSIONS_TABLE_ID` | `tblnNGiaKccMSpizT` |
| `AIRTABLE_DAILY_SESSIONS_TABLE_ID` | `tblnNGiaKccMSpizT` |
| `VITE_AIRTABLE_SESSION_PERIODS_TABLE_ID` | `tblkuCfFaopSsOKOG` |
| `AIRTABLE_SESSION_PERIODS_TABLE_ID` | `tblkuCfFaopSsOKOG` |
| `VITE_AIRTABLE_ATTENDANCE_TABLE_ID` | `tbl1oGzt0E5jYNA5e` |
| `AIRTABLE_ATTENDANCE_TABLE_ID` | `tbl1oGzt0E5jYNA5e` |
| `VITE_AIRTABLE_GOAL_EVIDENCE_TABLE_ID` | `tblnZC5LIbRWze6T9` |
| `AIRTABLE_GOAL_EVIDENCE_TABLE_ID` | `tblnZC5LIbRWze6T9` |
| `VITE_AIRTABLE_ATTENDANCE_CORRECTIONS_TABLE_ID` | `tblpxTavOza4SAjlH` |
| `AIRTABLE_ATTENDANCE_CORRECTIONS_TABLE_ID` | `tblpxTavOza4SAjlH` |

## احذف هذه إن وُجدت

- `VITE_AIRTABLE_PAT` (خطر أمني)
- أي قيمة فيها `/viw` أو `?blocks=hide`
- `VITE_AIRTABLE_ATTENDANCE_LEDGER_TABLE_ID` إن كان الاسم هكذا — استخدم `VITE_AIRTABLE_ATTENDANCE_TABLE_ID` بدلها

## بعد التصحيح

1. Deployments → Redeploy لأحدث commit على **main** (مو `625d546`)
2. افتح https://aunak.vercel.app
3. Ctrl+Shift+R
4. ادخل: `hazem141092245`
