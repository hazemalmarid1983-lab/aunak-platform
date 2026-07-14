import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
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
import { buildGovernanceAlertFeed } from '../lib/governanceAnomalies';
import { listAllSealedAttendance } from '../lib/attendanceLedger';
import { hydrateAttendanceFromCloud } from '../lib/attendanceLedger';
import { hydrateGoalsFromCloud } from '../lib/iepGoalAssignment';
import { governanceCloudReady } from '../lib/governanceCloud';
import {
  RiskBadge,
  StatusBadge,
  SovereignTable,
  SovereignTableShell,
  SovereignTd,
  SovereignTh,
  SovereignThead,
  SovereignTr,
  TableEmptyState,
  TruncateTooltip,
  ST,
} from './ui/SovereignTable';

export default function AunakMinistryDashboard({ lang = 'ar', user, onLogout }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [students, setStudents] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [lastSync, setLastSync] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [cloudHint, setCloudHint] = useState('');

  const copy =
    lang === 'ar'
      ? {
          title: 'لوحة رقابة الوزارة',
          subtitle: 'قراءة فقط · بيانات مرمّزة للمستفيد · CHD-XXXX',
          liveFeed: 'آخر الجلسات الموثّقة',
          activeSessions: 'جلسات نشطة',
          avgHarmony: 'متوسط مؤشر المتابعة',
          compliance: 'نسبة الجلسات الموثّقة',
          studentList: 'سجل المستفيدين المرمّز',
          code: 'الرمز',
          focus: 'التركيز',
          harmony: 'المتابعة',
          risk: 'مستوى الملاحظة',
          status: 'الحالة',
          refresh: 'تحديث',
          loading: 'جاري تحميل بيانات الرقابة…',
          readOnly: 'وضع القراءة فقط — لا تعديل · لا بيانات شخصية ظاهرة',
          sealed: 'موثّقة',
          open: 'غير موثّقة',
          noStudents: 'لا توجد سجلات لعرضها حالياً',
          noSessions: 'لا توجد جلسات لعرضها حالياً',
          auditor: 'عضو لجنة الرقابة',
          logout: 'خروج',
          alerts: 'تنبيهات الرقابة (حضور · أهداف بلا دليل تحقق)',
          noAlerts: 'لا تنبيهات حالياً',
          sealedDays: 'أيام حضور موثّقة',
          cloudOn: 'مزامنة سجلات التربية الخاصة مفعّلة',
          cloudOff: 'جداول المزامنة غير مربوطة — نفّذ سكربت المزامنة',
        }
      : {
          title: 'Ministry Oversight Dashboard',
          subtitle: 'Read-only · Pseudonymized beneficiaries · CHD-XXXX',
          liveFeed: 'Latest certified sessions',
          activeSessions: 'Active sessions',
          avgHarmony: 'Avg follow-up index',
          compliance: 'Certified session rate',
          studentList: 'Pseudonymized beneficiary register',
          code: 'Code',
          focus: 'Focus',
          harmony: 'Follow-up',
          risk: 'Review flag',
          status: 'Status',
          refresh: 'Refresh',
          loading: 'Loading oversight data…',
          readOnly: 'Read-only — no edits · no visible personal data',
          sealed: 'Certified',
          open: 'Uncertified',
          noStudents: 'No records available to display',
          noSessions: 'No sessions available to display',
          auditor: 'Review committee member',
          logout: 'Logout',
          alerts: 'Oversight alerts (attendance · goals without verification)',
          noAlerts: 'No alerts right now',
          sealedDays: 'Certified attendance days',
          cloudOn: 'Special education record sync enabled',
          cloudOff: 'Sync tables not linked — run the sync schema script',
        };

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const ready = governanceCloudReady();
      setCloudHint(ready.attendance ? 'on' : 'off');
      await hydrateAttendanceFromCloud();
      const [studentRows, sessionRows] = await Promise.all([
        fetchStudents(),
        fetchAirtableRecords(AIRTABLE_TABLES.dailySessions).catch(() => []),
      ]);
      const mappedStudents = (Array.isArray(studentRows) ? studentRows : []).map((row) =>
        mapStudentToB2GView(row)
      );
      // Hydrate goals for anomaly scan (uses raw rows before anonymize strip of goals JSON)
      for (const row of Array.isArray(studentRows) ? studentRows.slice(0, 40) : []) {
        await hydrateGoalsFromCloud(row).catch(() => {});
      }
      setStudents(mappedStudents);
      setSessions(
        (Array.isArray(sessionRows) ? sessionRows : []).map((row) => mapSessionToB2GView(row))
      );
      setAlerts(buildGovernanceAlertFeed({ attendanceRows: listAllSealedAttendance() }));
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
            {' · '}
            {cloudHint === 'on' ? copy.cloudOn : copy.cloudOff}
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
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              {copy.alerts}
            </h2>
            <p className="text-[10px] font-mono text-slate-500 mb-3">
              {copy.sealedDays}: {listAllSealedAttendance().length}
            </p>
            {!alerts.length ? (
              <p className={`text-sm ${LUX.muted}`}>{copy.noAlerts}</p>
            ) : (
              <ul className="space-y-2">
                {alerts.slice(0, 12).map((a) => (
                  <li
                    key={a.id}
                    className={`text-xs rounded-xl border px-3 py-2.5 ${
                      a.severity === 'high'
                        ? 'border-rose-500/35 bg-rose-950/30 text-rose-100'
                        : a.severity === 'medium'
                          ? 'border-amber-500/35 bg-amber-950/25 text-amber-100'
                          : 'border-slate-500/30 bg-white/[0.03] text-slate-300'
                    }`}
                  >
                    <span className="font-mono text-[10px] opacity-70">{a.code}</span>
                    <p className="mt-1">{lang === 'ar' ? a.ar : a.en}</p>
                  </li>
                ))}
              </ul>
            )}
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
            ) : !recentSessions.length ? (
              <TableEmptyState lang={lang} message={copy.noSessions} />
            ) : (
              <ul className="space-y-2">
                {recentSessions.map((s, i) => (
                  <li
                    key={s.id}
                    className={`${ST.listRow} ${i % 2 === 1 ? ST.listRowAlt : ''} text-xs font-mono flex-wrap gap-3`}
                  >
                    <span className="text-neutral-400">{s.sessionDate}</span>
                    <StatusBadge
                      variant={s.sealed ? 'sealed' : 'open'}
                      label={s.sealed ? copy.sealed : copy.open}
                    />
                    <TruncateTooltip text={s.notes || '—'} muted maxWidthClass="max-w-[14rem]" />
                  </li>
                ))}
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
              <SovereignTableShell>
                <SovereignTable className="font-mono">
                  <SovereignThead>
                    <tr>
                      <SovereignTh>{copy.code}</SovereignTh>
                      <SovereignTh>{copy.focus}</SovereignTh>
                      <SovereignTh>{copy.harmony}</SovereignTh>
                      <SovereignTh>{copy.risk}</SovereignTh>
                      <SovereignTh>{copy.status}</SovereignTh>
                    </tr>
                  </SovereignThead>
                  <tbody>
                    {students.map((s, i) => (
                      <SovereignTr key={s.id} index={i}>
                        <SovereignTd className="text-amber-400/90 font-bold">
                          <TruncateTooltip text={s.b2gCode} maxWidthClass="max-w-[10rem]" />
                        </SovereignTd>
                        <SovereignTd className="text-emerald-300">
                          {s.focusLevel != null ? s.focusLevel : '—'}
                        </SovereignTd>
                        <SovereignTd className="text-emerald-300">
                          {s.harmonyScore != null ? s.harmonyScore : '—'}
                        </SovereignTd>
                        <SovereignTd>
                          <RiskBadge score={s.riskScore} />
                        </SovereignTd>
                        <SovereignTd muted>
                          {s.isLiveSession ? (
                            <StatusBadge variant="live" label="● live" className="animate-pulse" />
                          ) : (
                            <StatusBadge status={s.status} />
                          )}
                        </SovereignTd>
                      </SovereignTr>
                    ))}
                  </tbody>
                </SovereignTable>
              </SovereignTableShell>
            ) : (
              <TableEmptyState lang={lang} message={copy.noStudents} />
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
