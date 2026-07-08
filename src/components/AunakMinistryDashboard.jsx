import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Activity,
  BarChart3,
  Eye,
  Loader2,
  Lock,
  LogOut,
  RefreshCw,
  ShieldCheck,
  Users,
} from 'lucide-react';
import PlatformLogo from './PlatformLogo';
import { fetchAirtableRecords, fetchStudents } from '../lib/airtable';
import { AIRTABLE_TABLES } from '../lib/airtableTables';
import { LUX } from '../lib/luxTheme';
import {
  computeCompliancePercent,
  mapSessionToB2GView,
  mapStudentToB2GView,
} from '../lib/b2gAnonymization';

function riskTone(score) {
  if (score >= 70) return 'text-rose-400 bg-rose-500/10 border-rose-400/30';
  if (score >= 40) return 'text-amber-300 bg-amber-500/10 border-amber-400/30';
  return 'text-emerald-300 bg-emerald-500/10 border-emerald-400/30';
}

export default function AunakMinistryDashboard({ lang = 'ar', user, onLogout }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [students, setStudents] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [lastSync, setLastSync] = useState(null);

  const copy =
    lang === 'ar'
      ? {
          title: 'لوحة التدقيق الحي — B2G',
          subtitle: 'قراءة فقط · بيانات مُقنّعة · CHD-XXXX',
          liveFeed: 'البث الحي للجلسات',
          activeSessions: 'جلسات نشطة',
          avgHarmony: 'متوسط التناغم',
          compliance: 'نسبة الامتثال (جلسات مقفلة)',
          studentList: 'سجل الطلاب المُقنّع',
          code: 'الرمز',
          focus: 'التركيز',
          harmony: 'التناغم',
          risk: 'مخاطر',
          status: 'الحالة',
          refresh: 'تحديث',
          loading: 'جاري تحميل البيانات المُقنّعة…',
          readOnly: 'وضع القراءة فقط — لا تعديل · لا محادثة · لا بيانات شخصية',
          sealed: 'مقفلة',
          open: 'مفتوحة',
          noStudents: 'لا توجد سجلات طلاب متاحة للتدقيق.',
          auditor: 'مفتش الوزارة',
          logout: 'خروج',
        }
      : {
          title: 'Live Audit Dashboard — B2G',
          subtitle: 'Read-only · Anonymized · CHD-XXXX',
          liveFeed: 'Live session feed',
          activeSessions: 'Active sessions',
          avgHarmony: 'Avg harmony',
          compliance: 'Compliance (sealed sessions)',
          studentList: 'Anonymized student registry',
          code: 'Code',
          focus: 'Focus',
          harmony: 'Harmony',
          risk: 'Risk',
          status: 'Status',
          refresh: 'Refresh',
          loading: 'Loading anonymized audit data…',
          readOnly: 'Read-only — no edits · no chat · no PII',
          sealed: 'Sealed',
          open: 'Open',
          noStudents: 'No student records available for audit.',
          auditor: 'Ministry auditor',
          logout: 'Logout',
        };

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [studentRows, sessionRows] = await Promise.all([
        fetchStudents(),
        fetchAirtableRecords(AIRTABLE_TABLES.dailySessions).catch(() => []),
      ]);
      setStudents(
        (Array.isArray(studentRows) ? studentRows : []).map((row) => mapStudentToB2GView(row))
      );
      setSessions(
        (Array.isArray(sessionRows) ? sessionRows : []).map((row) => mapSessionToB2GView(row))
      );
      setLastSync(new Date());
    } catch (e) {
      setError(e?.message ?? 'B2G_LOAD_FAILED');
      setStudents([]);
      setSessions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(load, 45000);
    return () => clearInterval(id);
  }, [load]);

  const activeCount = useMemo(
    () => students.filter((s) => s.isLiveSession).length,
    [students]
  );

  const avgHarmony = useMemo(() => {
    const vals = students.map((s) => s.harmonyScore).filter((n) => n != null);
    if (!vals.length) return null;
    return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
  }, [students]);

  const compliancePct = useMemo(() => computeCompliancePercent(sessions), [sessions]);

  const recentSessions = useMemo(
    () =>
      [...sessions]
        .sort((a, b) => String(b.sessionDate).localeCompare(String(a.sessionDate)))
        .slice(0, 8),
    [sessions]
  );

  return (
    <div dir={lang === 'ar' ? 'rtl' : 'ltr'} className={LUX.pageWrap}>
      <div className={LUX.pageWrapGradient} aria-hidden />
      <div className="relative z-10 min-h-screen flex flex-col">
        <header className="border-b border-[#c9a962]/20 bg-[#12121a]/80 backdrop-blur-xl px-6 py-5">
          <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <PlatformLogo lang={lang} className="h-9 w-auto" />
              <div>
                <h1 className={LUX.titleGradient}>{copy.title}</h1>
                <p className={`text-xs font-mono ${LUX.muted}`}>{copy.subtitle}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={LUX.emeraldBadge}>
                <ShieldCheck className="w-3.5 h-3.5" />
                {copy.auditor}
              </span>
              <button
                type="button"
                onClick={load}
                disabled={loading}
                className={`${LUX.btnGhost} flex items-center gap-2 text-xs`}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                {copy.refresh}
              </button>
              {onLogout && (
                <button type="button" onClick={onLogout} className={`${LUX.btnGhost} flex items-center gap-2 text-xs`}>
                  <LogOut className="w-4 h-4" />
                  {copy.logout}
                </button>
              )}
            </div>
          </div>
          <p className="max-w-6xl mx-auto mt-3 text-[11px] font-mono text-emerald-400/80 flex items-center gap-2">
            <Lock className="w-3.5 h-3.5" />
            {copy.readOnly}
            {user?.name ? ` · ${user.name}` : ''}
          </p>
        </header>

        <main className="flex-1 max-w-6xl mx-auto w-full p-6 space-y-6">
          {error && <div className={LUX.errorRose}>{error}</div>}

          <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className={`${LUX.glassCard} border-emerald-400/20`}>
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-5 h-5 text-emerald-400" />
                <span className="text-xs font-bold text-slate-400">{copy.activeSessions}</span>
              </div>
              <p className="text-3xl font-black text-emerald-300 font-mono">{activeCount}</p>
            </div>
            <div className={`${LUX.glassCard} border-[#c9a962]/25`}>
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="w-5 h-5 text-[#e8c872]" />
                <span className="text-xs font-bold text-slate-400">{copy.avgHarmony}</span>
              </div>
              <p className="text-3xl font-black text-[#e8c872] font-mono">
                {avgHarmony != null ? avgHarmony : '—'}
              </p>
            </div>
            <div className={`${LUX.glassCard} border-[#c9a962]/25`}>
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck className="w-5 h-5 text-[#e8c872]" />
                <span className="text-xs font-bold text-slate-400">{copy.compliance}</span>
              </div>
              <p className="text-3xl font-black text-[#e8c872] font-mono">{compliancePct}%</p>
            </div>
          </section>

          <section className={`${LUX.glassCard}`}>
            <h2 className={`${LUX.headingGold} mb-4 flex items-center gap-2`}>
              <Eye className="w-5 h-5" />
              {copy.liveFeed}
            </h2>
            {loading && !recentSessions.length ? (
              <p className={`text-sm ${LUX.muted} flex items-center gap-2`}>
                <Loader2 className="w-4 h-4 animate-spin" />
                {copy.loading}
              </p>
            ) : (
              <ul className="space-y-2">
                {recentSessions.map((s) => (
                  <li
                    key={s.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/[0.06] bg-[#0d0d10]/60 px-4 py-3 text-xs font-mono"
                  >
                    <span className="text-slate-400">{s.sessionDate}</span>
                    <span
                      className={
                        s.sealed
                          ? 'text-emerald-400 border border-emerald-400/30 px-2 py-0.5 rounded-full'
                          : 'text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded-full'
                      }
                    >
                      {s.sealed ? copy.sealed : copy.open}
                    </span>
                    <span className="text-slate-500 truncate max-w-[12rem]">{s.notes || '—'}</span>
                  </li>
                ))}
                {!recentSessions.length && (
                  <li className={`text-sm ${LUX.muted}`}>—</li>
                )}
              </ul>
            )}
            {lastSync && (
              <p className={`mt-3 text-[10px] ${LUX.muted}`}>
                Sync: {lastSync.toLocaleTimeString(lang === 'ar' ? 'ar-SA' : 'en-US')}
              </p>
            )}
          </section>

          <section className={`${LUX.glassCard}`}>
            <h2 className={`${LUX.headingGold} mb-4 flex items-center gap-2`}>
              <Users className="w-5 h-5" />
              {copy.studentList}
            </h2>
            {loading && !students.length ? (
              <p className={`text-sm ${LUX.muted} flex items-center gap-2`}>
                <Loader2 className="w-4 h-4 animate-spin" />
                {copy.loading}
              </p>
            ) : students.length ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm font-mono">
                  <thead>
                    <tr className="text-slate-500 text-xs border-b border-white/[0.06]">
                      <th className="text-start py-2 pe-4">{copy.code}</th>
                      <th className="text-start py-2 pe-4">{copy.focus}</th>
                      <th className="text-start py-2 pe-4">{copy.harmony}</th>
                      <th className="text-start py-2 pe-4">{copy.risk}</th>
                      <th className="text-start py-2">{copy.status}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((s) => (
                      <tr key={s.id} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                        <td className="py-3 pe-4 text-[#e8c872] font-bold">{s.b2gCode}</td>
                        <td className="py-3 pe-4 text-emerald-300">
                          {s.focusLevel != null ? s.focusLevel : '—'}
                        </td>
                        <td className="py-3 pe-4 text-emerald-300">
                          {s.harmonyScore != null ? s.harmonyScore : '—'}
                        </td>
                        <td className="py-3 pe-4">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full border text-xs ${riskTone(s.riskScore)}`}
                          >
                            {s.riskScore}
                          </span>
                        </td>
                        <td className="py-3 text-slate-400">
                          {s.isLiveSession ? (
                            <span className="text-emerald-400 animate-pulse">● live</span>
                          ) : (
                            String(s.status)
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className={`text-sm ${LUX.muted}`}>{copy.noStudents}</p>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
