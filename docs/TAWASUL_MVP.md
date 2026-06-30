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

## 2. Airtable base (live — `app3vCT2j2JepNVZa`)

| Table | ID |
|-------|-----|
| Specialists | `tblhVAdIeUmqDQTmi` |
| Students | `tbliBfCKXNyVtWJiO` |
| Daily Sessions | `tbl8su5soBPDeGb6Z` |

**Note:** UI field `Name` maps to `student_name` / `specialist_name` in code via fallback.

Extend sovereignty columns (mirror + assessment):

```bash
node scripts/tawasul-extend-schema.mjs
```

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
| `mirror_command` | Single line text | Ghost Mirror: `echo_goal`, `drop_star`, `calm_pulse` |
| `mirror_payload` | Single line text | mirror nonce / payload |
| `initial_assessment_score` | Number | AppSheet assessment |
| `comprehensive_assessment_status` | Single select | `not_started`, `in_progress`, `completed` |

### tblDailySessions (Tawasul live schema)

| Field | Type | Notes |
|-------|------|-------|
| `Session Date` | Date | |
| `Session Notes` | Long text | includes `AUN-4611 · Island World` marker |
| `student` | Link → Students | |
| `Daily Goal Achieved` | Checkbox | set on seal |
| `Session Duration (min)` | Number | derived from interactions |

Child play (`/child?token=…`) triggers `POST /api/session/child-seal` after **5 interactions** → one sealed row per student per day (`tawasulSessionSeal.js` on Tawasul base).

---

## 8. Sovereignty engines (Tawasul full lab)

| Engine | Route / file | Behavior |
|--------|----------------|----------|
| Zero Entry assessment | `POST /api/tawasul/assessment-sync` | AppSheet → auto `programmed_goal` from score |
| Ghost Mirror | `POST /api/tawasul/mirror` + `TawasulMirrorPanel` | Specialist echoes goal, drops stars, calm pulse → child polls Airtable every 3.5s |
| Idle gaze (5s) | `useTawasulIdleGaze` | Play tab idle → typewriter audio cue |
| Hybrid Awni | `ChildAwniCompanion` | Speaks when calm; silent + calm body on meltdown risk |
| Sovereign Island UI | `tawasulChildTheme.js` | Matte black · gold · emerald neon child shell |
| Session seal | `api/session/child-seal.js` | Routes to Tawasul schema when `VITE_TAWASUL_MVP=true` |

**Excluded (by design):** biometric login, sovereign access control, deep admin, payment activation gate.

**AppSheet webhook:** point automation to `https://<preview>/api/tawasul/assessment-sync` with body `{ "recordId": "rec…", "fields": { "initial_assessment_score": 72, "comprehensive_assessment_status": "completed" } }`.

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

Sealed rows in **Daily Sessions** (`Session Notes` contains island marker) are the billing source of truth. Count rows per `student` link / `Session Date` — not manual notes in Students.

---

## URLs (after deploy)

| Role | URL |
|------|-----|
| Specialist | `https://<tawasul-preview>/tawasul` → token gate (also `/` when `VITE_TAWASUL_MVP=true`) |
| Child | `https://<tawasul-preview>/child?token=AUN-CHD-…` |

Main production `https://aunak.vercel.app` remains on `main` unchanged.
