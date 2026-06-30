import { useCallback, useEffect, useMemo, useState } from 'react';
import { ExternalLink, Loader2, LogOut, Save, Target, Users } from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { updateStudentRecord } from '../../lib/airtable';
import { STUDENT as SF } from '../../lib/airtableFields';
import { TAWASUL_COPY } from '../../lib/tawasulConfig';
import PlatformLogo from '../PlatformLogo';
import TawasulMirrorPanel from './TawasulMirrorPanel';

function childUrl(token) {
  if (typeof window === 'undefined' || !token) return '';
  const base = window.location.origin.replace(/\/$/, '');
  return `${base}/child?token=${encodeURIComponent(token)}`;
}

function readApiError(data, status) {
  const err = data?.error ?? data?.message;
  if (typeof err === 'string') return err;
  if (err && typeof err === 'object') {
    return err.message || err.error || err.hint || JSON.stringify(err);
  }
  return `CASELOAD_${status}`;
}

/** Normalize caseload rows from /api/tawasul/caseload (mapped or raw Airtable fields). */
function normalizeCaseloadStudent(row) {
  if (!row || typeof row !== 'object') return null;
  const fields = row.fields && typeof row.fields === 'object' ? row.fields : {};
  const name =
    (typeof row.name === 'string' ? row.name : null) ||
    fields.Name ||
    fields.student_name ||
    fields.name ||
    'طالب';
  const childInteractiveToken =
    row.childInteractiveToken ||
    fields.child_interactive_token ||
    null;
  const programmedGoal =
    row.programmedGoal ||
    fields.programmed_goal ||
    '';
  return {
    ...row,
    id: row.id,
    name: String(name).trim() || 'طالب',
    childInteractiveToken: childInteractiveToken ? String(childInteractiveToken).trim() : null,
    programmedGoal: String(programmedGoal),
    fields,
  };
}

function extractCaseloadList(data) {
  const raw = data?.students ?? data?.records;
  if (Array.isArray(raw)) return raw.map(normalizeCaseloadStudent).filter(Boolean);
  if (raw && typeof raw === 'object' && raw.id) return [normalizeCaseloadStudent(raw)].filter(Boolean);
  return [];
}

function studentLabel(student) {
  return student?.name || student?.fields?.Name || student?.fields?.student_name || '—';
}

function studentChildToken(student) {
  return (
    student?.childInteractiveToken ||
    student?.fields?.child_interactive_token ||
    null
  );
}

export default function TawasulHub({ lang = 'ar' }) {
  const { user, logout } = useAuth();
  const copy = TAWASUL_COPY[lang] ?? TAWASUL_COPY.ar;
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [goalDraft, setGoalDraft] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/tawasul/caseload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          specialistRecordId: user?.specialistRecordId,
          specialistToken: user?.specialistToken,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(readApiError(data, res.status));
      const caseload = extractCaseloadList(data);
      setStudents(caseload);
      setSelectedId((prev) => prev ?? caseload[0]?.id ?? null);
    } catch (e) {
      const msg = e instanceof Error ? e.message : typeof e === 'string' ? e : readApiError(e, 'ERR');
      setError(msg || 'Failed to load');
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }, [user?.specialistRecordId, user?.specialistToken]);

  useEffect(() => {
    load();
  }, [load]);

  const selected = useMemo(
    () => students.find((s) => s.id === selectedId) ?? students[0] ?? null,
    [students, selectedId]
  );

  useEffect(() => {
    if (selected) setGoalDraft(selected.programmedGoal ?? '');
  }, [selected?.id, selected?.programmedGoal]);

  const saveGoal = async () => {
    if (!selected?.id || saving) return;
    setSaving(true);
    setError('');
    try {
      await updateStudentRecord(selected.id, { [SF.programmed_goal]: goalDraft.trim() });
      setStudents((prev) =>
        prev.map((s) => (s.id === selected.id ? { ...s, programmedGoal: goalDraft.trim() } : s))
      );
    } catch (e) {
      setError(e?.message ?? 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-slate-100" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <header className="border-b border-cyan-500/15 bg-[#12121a]/80 backdrop-blur-md px-4 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <PlatformLogo lang={lang} className="h-8 w-auto" />
          <div>
            <h1 className="text-lg font-black text-cyan-300">{copy.platform}</h1>
            <p className="text-xs text-slate-500">{user?.name ?? copy.myCases}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={logout}
          className="flex items-center gap-2 px-3 py-2 rounded-lg border border-white/10 text-xs text-slate-400 hover:text-white"
        >
          <LogOut className="w-4 h-4" />
          {copy.logout}
        </button>
      </header>

      <main className="max-w-5xl mx-auto p-4 grid gap-4 md:grid-cols-[280px_1fr]">
        <section className="rounded-2xl border border-white/10 bg-[#12121a]/60 p-4">
          <div className="flex items-center gap-2 mb-4 text-sm font-bold text-slate-300">
            <Users className="w-4 h-4 text-cyan-400" />
            {copy.myCases} ({students.length}/5)
          </div>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
            </div>
          ) : students.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-6">{typeof error === 'string' ? error : '—'}</p>
          ) : (
            <ul className="space-y-2">
              {students.map((s) => (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(s.id)}
                    className={`w-full text-start px-3 py-2 rounded-xl text-sm font-bold transition-colors ${
                      selected?.id === s.id
                        ? 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-200'
                        : 'bg-white/5 border border-transparent text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    {studentLabel(s)}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-white/10 bg-[#12121a]/60 p-5 space-y-4">
          {!selected ? (
            <p className="text-sm text-slate-500 text-center py-12">—</p>
          ) : (
            <>
              <h2 className="text-xl font-black text-white">{studentLabel(selected)}</h2>

              {studentChildToken(selected) && (
                <div className="rounded-xl bg-black/30 border border-white/10 p-3 space-y-2">
                  <p className="text-xs font-bold text-slate-400">{copy.childLink}</p>
                  <code className="block text-xs text-emerald-400 break-all">{studentChildToken(selected)}</code>
                  <a
                    href={childUrl(studentChildToken(selected))}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-cyan-400 hover:underline"
                  >
                    <ExternalLink className="w-3 h-3" />
                    /child?token=…
                  </a>
                </div>
              )}

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-bold text-slate-300">
                  <Target className="w-4 h-4 text-amber-400" />
                  {copy.dailyGoal}
                </label>
                <textarea
                  value={goalDraft}
                  onChange={(e) => setGoalDraft(e.target.value)}
                  rows={4}
                  className="w-full rounded-xl border border-white/10 bg-black/30 p-3 text-sm text-white focus:border-cyan-500/40 focus:outline-none resize-none"
                  placeholder={lang === 'en' ? 'Programmed goal for child home screen…' : 'الهدف الإجرائي اليومي يظهر في واجهة الطفل…'}
                />
                <button
                  type="button"
                  onClick={saveGoal}
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-200 text-sm font-bold disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {copy.saveGoal}
                </button>
              </div>

              <TawasulMirrorPanel
                lang={lang}
                student={selected}
                goalDraft={goalDraft}
                onGoalSynced={(goal) => {
                  setStudents((prev) =>
                    prev.map((s) => (s.id === selected.id ? { ...s, programmedGoal: goal } : s))
                  );
                  setGoalDraft(goal);
                }}
              />

              {error && <p className="text-xs text-rose-400">{error}</p>}
            </>
          )}
        </section>
      </main>
    </div>
  );
}
