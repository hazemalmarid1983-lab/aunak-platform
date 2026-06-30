# Tawasul MVP — منصة تواصل (Isolated Sandbox)

> **Branch:** `Tawasul_MVP` · **Main branch:** frozen standby · **Flag:** `VITE_TAWASUL_MVP=true`

Independent MVP for remote specialist–child communication. No merge into `main` until sovereign sign-off.

---

## 1. Git & Vercel (Preview subdomain)

```bash
git checkout Tawasul_MVP
git push -u origin Tawasul_MVP
```

**Vercel**

1. Project → Settings → Git → Production Branch stays **`main`** (standby).
2. Enable **Preview Deployments** for branch `Tawasul_MVP`.
3. Settings → Environment Variables → scope **Preview** + branch filter `Tawasul_MVP`:

| Variable | Value |
|----------|--------|
| `VITE_TAWASUL_MVP` | `true` |
| `VITE_AIRTABLE_BASE_ID` | *(new free base ID)* |
| `VITE_AIRTABLE_PAT` | Personal access token |
| `AIRTABLE_API_KEY` | Same PAT (server routes) |
| `AIRTABLE_BASE_ID` | Same base ID |
| `VITE_AIRTABLE_STUDENTS_TABLE_ID` | `tbl…` from URL |
| `VITE_AIRTABLE_SPECIALISTS_TABLE_ID` | `tbl…` |
| `VITE_AIRTABLE_DAILY_SESSIONS_TABLE_ID` | `tbl…` |
| `AIRTABLE_DAILY_SESSIONS_TABLE_ID` | Same sessions table |

4. Optional: Domains → assign preview alias e.g. `tawasul.aunak.vercel.app` to latest `Tawasul_MVP` deployment.

**Local dev**

```bash
# .env.local on this branch only
VITE_TAWASUL_MVP=true
VITE_AIRTABLE_BASE_ID=appXXXXXXXXXXXXXX
# … table IDs …
npm run dev
```

---

## 2. Airtable base (free, separate from `appaGfKj4vYhMw0cb`)

Create a **new** base with three tables only.

### tblSpecialists

| Field | Type | Notes |
|-------|------|-------|
| `specialist_name` | Single line text | e.g. حازم |
| `specialist_tutor_token` | Single line text | `AUN-SPC-{32hex}` |
| `professional_email` | Email | optional |
| `status` | Single select | `active` |

**Seed:** exactly **2 rows** (حازم + الأخصائي 2).

### tblStudents (max 10 rows)

| Field | Type | Notes |
|-------|------|-------|
| `student_name` | Single line text | |
| `student_id` | Single line text | |
| `age` | Number | |
| `status` | Single select | `active` |
| `assigned_specialist` | **Link → Specialists** | Permy isolation (5 per specialist) |
| `child_interactive_token` | Single line text | `AUN-CHD-…` |
| `specialist_tutor_token` | Single line text | copy of owning specialist token |
| `programmed_goal` | Long text | shown on child **Home** tab |
| `initial_assessment_score` | Number | AppSheet assessment |
| `comprehensive_assessment_status` | Single select | `not_started`, `in_progress`, `completed` |

### tblDailySessions (auto-sealed island claims)

| Field | Type | Notes |
|-------|------|-------|
| `session_date` | Date | |
| `specialist_name` | Single line text | from student link / default |
| `student_name` | Single line text | |
| `notes` | Long text | includes `AUN-4611 · Island World` |
| `claim_status` | Single select | `Sealed` |
| `sealed_at` | Date and time | |
| `session_fee` | Number | accounting hook |
| `immutable_hash` | Single line text | |

Child play (`/child?token=…`) triggers `POST /api/session/child-seal` after 5 interactions → one sealed row per student per day (existing `childSessionSeal.js`).

---

## 3. Seed script

After creating tables and copying table IDs into `.env.local`:

```bash
node scripts/tawasul-seed.mjs
```

Outputs specialist tokens, child tokens, and record IDs for QA.

---

## 4. Specialist isolation (Permy filter)

- Login: `specialist_tutor_token` from **Specialists** table (not Access Control).
- Caseload: students where `assigned_specialist` links to specialist `recordId` (max 5).
- Fallback: match `students.specialist_tutor_token` during migration.

Code: `src/lib/specialistIsolation.js`, `src/lib/tawasulAuth.js`.

---

## 5. Child UI (`ChildInteractiveShell`)

Route: `/child?token=AUN-CHD-…`

Bottom nav:

| Tab | AR | Content |
|-----|-----|---------|
| home | الرئيسية | `programmed_goal` from specialist panel |
| play | العب | Island play + session seal |
| calm | هدوء | Breathing exercise |
| stars | نجومي | Session star counter |

---

## 6. AppSheet comprehensive assessment

1. Duplicate current assessment AppSheet app.
2. Point data destination to **new base** → `tblStudents`.
3. Map columns: `student_name`, `initial_assessment_score`, `comprehensive_assessment_status`.
4. Do **not** point AppSheet at production base `appaGfKj4vYhMw0cb`.

---

## 7. Accounting note (daily sessions)

Sealed rows in `tblDailySessions` are the single source of truth for island engagement billing. Reconcile specialist payouts against **count of `claim_status = Sealed`** per `specialist_name` / date — not against manual session notes in Students.

---

## URLs (after deploy)

| Role | URL |
|------|-----|
| Specialist | `https://<tawasul-preview>/` → token gate |
| Child | `https://<tawasul-preview>/child?token=AUN-CHD-…` |

Main production `https://aunak.vercel.app` remains on `main` unchanged.
