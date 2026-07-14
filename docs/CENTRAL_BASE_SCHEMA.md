# Aunak — Central Multi-Center Base

**Base ID:** `appcjitgWsbvIebwf`  
**Share (view):** https://airtable.com/appcjitgWsbvIebwf/shrUijzA7Q39vPj10  
**Bootstrap:** `node scripts/bootstrap-central-base.mjs --apply`  
**Env dump:** `docs/CENTRAL_BASE_ENV.generated.txt`

> Legacy crowded base `appaGfKj4vYhMw0cb` is archive-only. Do not add new product tables there.

## Design rules

- Column names: **lowercase snake_case English only** (no `|` Arabic in field names).
- **Arabic appears in Airtable via field Description** (and table description) — apply with `node scripts/apply-airtable-ar-descriptions.mjs --apply`. Source: `src/lib/airtableFieldDescriptionsAr.js`.
- App UI defaults to **Arabic RTL** (`src/lib/locale.js`, `index.html` `lang=ar dir=rtl`).
- Every operational row carries `center_code` (and usually `center_record_id`).
- **Private centers** → `shift_model = dual` → shifts `morning` + `evening`.
- **Government centers** → `shift_model = single` → shift `day` only.
- Specialties are professional SPED/allied-health codes (not commercial labels).

## Tables

| Table | ID | Purpose |
|-------|-----|---------|
| Centers | `tblm1ayaXTG0vdm7d` | Registry of all centers + shift model |
| Specialists | `tblqTYEHCPBO23DBa` | Teachers / therapists per center |
| Students | `tblTidBPaVM4cf3O9` | Beneficiaries + IEP + tokens + assessment |
| Access Control | `tblsGNIKRfTpMZ8Kn` | Login roles scoped by center |
| Daily Sessions | `tblnNGiaKccMSpizT` | Sealed session documentation |
| Session Periods | `tblkuCfFaopSsOKOG` | Daily period timetable per specialty |
| Attendance Ledger | `tbl1oGzt0E5jYNA5e` | Sealed daily attendance |
| Goal Evidence | `tblnZC5LIbRWze6T9` | Sealed IEP / therapy evidence |
| Attendance Corrections | `tblpxTavOza4SAjlH` | Correction requests (original seal kept) |

## Specialty values (`specialty`)

| Value | AR |
|-------|----|
| `special_education` | تربية خاصة |
| `speech_language` | نطق ولغة |
| `occupational_therapy` | علاج وظيفي |
| `physiotherapy` | علاج طبيعي |
| `psychology` | نفسي |
| `social_work` | خدمة اجتماعية |
| `early_intervention` | تدخل مبكر |

## Duty shift values (`duty_shift` / `assigned_shift`)

| Value | When |
|-------|------|
| `morning` | Private morning block |
| `evening` | Private evening block |
| `day` | Government single shift |

## Seeded demo centers

- `PRIV-DEMO-01` — private, dual (07:30–12:30 / 15:00–19:00)
- `GOV-DEMO-01` — government, single day (07:30–13:30)

## Next for app / Vercel

Set the same keys as in `docs/CENTRAL_BASE_ENV.generated.txt` on Vercel Production before cutting over live traffic.
