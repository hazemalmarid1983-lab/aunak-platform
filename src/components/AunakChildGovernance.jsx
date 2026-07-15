import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Camera,
  CheckCircle2,
  ClipboardCheck,
  Loader2,
  Lock,
  ShieldCheck,
  Target,
  UserCheck,
} from 'lucide-react';
import { useStudents } from '../hooks/useStudents';
import { useAuth } from '../lib/auth';
import { LUX } from '../lib/luxTheme';
import {
  ATTENDANCE_STATUS,
  getSealedAttendance,
  listAttendanceForStudent,
  monthAttendanceSummary,
  requestAttendanceCorrection,
  sealAttendanceDay,
} from '../lib/attendanceLedger';
import {
  normalizeSeverity,
  SEVERITY,
} from '../lib/goalBank';
import GoalBankPicker from './GoalBankPicker';
import {
  assignBankGoals,
  getStudentGoalPlan,
  hydrateGoalsFromCloud,
  listGoalEvidence,
  listPendingCustomGoals,
  sealGoalEvidence,
  submitCustomGoal,
} from '../lib/iepGoalAssignment';
import { hydrateAttendanceFromCloud } from '../lib/attendanceLedger';
import { governanceCloudReady } from '../lib/governanceCloud';
import { updateStudentRecord, getField } from '../lib/airtable';
import { STUDENT as SF } from '../lib/airtableFields';

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export default function AunakChildGovernance({ lang = 'ar' }) {
  const { students } = useStudents(lang);
  const { user } = useAuth();
  const activeId = user?.activeStudentId ?? user?.childId ?? null;
  const student = useMemo(
    () => (students || []).find((s) => s.id === activeId) ?? students?.[0] ?? null,
    [students, activeId]
  );

  const [tab, setTab] = useState('attendance');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [severity, setSeverity] = useState(SEVERITY.moderate.id);
  const [selectedGoalIds, setSelectedGoalIds] = useState([]);
  const [customGoal, setCustomGoal] = useState('');
  const [evidenceGoalId, setEvidenceGoalId] = useState('');
  const [evidenceNote, setEvidenceNote] = useState('');
  const [evidencePct, setEvidencePct] = useState('70');
  const [photoDataUrl, setPhotoDataUrl] = useState(null);
  const [corrReason, setCorrReason] = useState('');
  const [corrStatus, setCorrStatus] = useState(ATTENDANCE_STATUS.ABSENT);
  const [tick, setTick] = useState(0);
  const [syncState, setSyncState] = useState('idle');
  const cloudReady = governanceCloudReady();

  const refresh = () => setTick((n) => n + 1);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setSyncState('syncing');
      await hydrateAttendanceFromCloud();
      if (student) await hydrateGoalsFromCloud(student);
      if (!cancelled) {
        setSyncState(
          cloudReady.attendance || cloudReady.evidence ? 'cloud' : 'local'
        );
        refresh();
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [student?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const ar = lang !== 'en';
  const copy = ar
    ? {
        title: 'متابعة التربية الخاصة — الحضور والأهداف الفردية',
        subtitle: 'توثيق يومي معتمد · بنك أهداف الخطة الفردية · دليل تحقق للجان الرقابة',
        syncCloud: 'المزامنة مع قاعدة البيانات المركزية مفعّلة',
        syncLocal: 'وضع محلي — فعّل جداول المزامنة المركزية',
        syncing: 'جاري مزامنة السجلات…',
        cloudOk: '· وُثّق مركزياً',
        cloudFail: '· حُفظ على الجهاز (تعذّرت المزامنة المركزية)',
        noStudent: 'اختر مستفيداً نشطاً من لوحة المتابعة أولاً',
        attendance: 'سجل الحضور المعتمد',
        goals: 'بنك أهداف الخطة الفردية',
        evidence: 'دليل تحقق الهدف',
        present: 'حضور',
        absent: 'غياب',
        excused: 'غياب بعذر',
        sealToday: 'توثيق حضور اليوم',
        sealedLock: 'موثّق — لا يُعدَّل بأثر رجعي',
        biometric: 'تم التحقق من الحضور بالبصمة',
        correction: 'طلب تصحيح (لا يمحو التوثيق الأصلي)',
        submitCorr: 'إرسال طلب التصحيح للمشرف',
        month: 'ملخص الشهر',
        suggest: 'مقترحات أهداف مناسبة للمعلم',
        saveGoals: 'اعتماد أهداف الخطة الفردية',
        custom: 'لم تجد هدفاً مناسباً؟ أضف هدفاً إضافياً (بانتظار اعتماد المشرف)',
        submitCustom: 'رفع للاعتماد',
        note: 'ملاحظة صفية / دليل تحقق (إلزامي)',
        pct: 'نسبة الإنجاز التقديرية %',
        photo: 'مرفق صورة كدليل (اختياري)',
        sealEvidence: 'توثيق تحقق الهدف',
        severity: 'مستوى الاحتياج للدعم',
        ageBand: 'المرحلة العمرية',
        selected: 'الأهداف المعتمدة',
        pending: 'بانتظار اعتماد المشرف',
        history: 'سجل أدلة التحقق',
        maxGoals: 'بحد أقصى 6 أهداف للخطة النشطة',
      }
    : {
        title: 'Special Education Follow-up — Attendance & IEP Goals',
        subtitle: 'Daily certified record · IEP goal bank · Verification evidence for review committees',
        syncCloud: 'Central database sync is active',
        syncLocal: 'Local mode — enable central sync tables',
        syncing: 'Syncing records…',
        cloudOk: '· synced centrally',
        cloudFail: '· saved on device (central sync failed)',
        noStudent: 'Select an active beneficiary from the follow-up board first',
        attendance: 'Certified attendance register',
        goals: 'IEP goal bank',
        evidence: 'Goal verification evidence',
        present: 'Present',
        absent: 'Absent',
        excused: 'Excused absence',
        sealToday: 'Certify today’s attendance',
        sealedLock: 'Certified — no retroactive edit',
        biometric: 'Biometric attendance verified',
        correction: 'Correction request (does not erase original record)',
        submitCorr: 'Submit correction to supervisor',
        month: 'Month summary',
        suggest: 'Suggested goals for the teacher',
        saveGoals: 'Approve IEP goals',
        custom: 'Nothing fits? Add an extra goal (pending supervisor approval)',
        submitCustom: 'Submit for approval',
        note: 'Classroom note / verification evidence (required)',
        pct: 'Estimated mastery %',
        photo: 'Photo evidence (optional)',
        sealEvidence: 'Certify goal verification',
        severity: 'Support-need level',
        ageBand: 'Age stage',
        selected: 'Approved goals',
        pending: 'Pending supervisor approval',
        history: 'Verification evidence log',
        maxGoals: 'Up to 6 goals on the active plan',
      };

  const age = student ? Number(getField(student, SF.age) ?? student.age) : null;
  const sealedToday = student ? getSealedAttendance(student.id, todayIso()) : null;
  const month = student ? monthAttendanceSummary(student.id, todayIso().slice(0, 7)) : null;
  const plan = student ? getStudentGoalPlan(student.id) : null;
  const evidence = student ? listGoalEvidence(student.id) : [];
  const pendingCustom = student ? listPendingCustomGoals(student.id) : [];

  useEffect(() => {
    if (!plan?.goals?.length) return;
    setSelectedGoalIds(plan.goals.map((g) => g.goalId));
    if (!evidenceGoalId && plan.goals[0]) setEvidenceGoalId(plan.goals[0].goalId);
  }, [student?.id, tick]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleGoal = (id) => {
    setSelectedGoalIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.length >= 6 ? prev : [...prev, id]
    );
  };

  const applySuggestions = (ids) => {
    setSelectedGoalIds([...new Set(ids)].slice(0, 6));
  };

  const flash = (ok, text) => {
    setErr(ok ? '' : text);
    setMsg(ok ? text : '');
  };

  const doSealAttendance = async (status) => {
    if (!student) return;
    setBusy(true);
    try {
      const biometricVerified = Boolean(
        getField(student, SF.biometric_attendance_verified) ?? student.biometricAttendanceVerified
      );
      const res = await sealAttendanceDay({
        studentId: student.id,
        studentName: student.name,
        status,
        recordedBy: user?.email || user?.name || '',
        biometricVerified,
      });
      if (!res.ok) {
        flash(false, res.error === 'ALREADY_SEALED' ? copy.sealedLock : res.error);
        return;
      }
      flash(
        true,
        (ar ? 'تم توثيق حضور اليوم' : 'Today’s attendance certified') +
          (res.cloudSynced ? copy.cloudOk : res.cloudError ? copy.cloudFail : '')
      );
      refresh();
    } finally {
      setBusy(false);
    }
  };

  const doCorrection = async () => {
    if (!student || !sealedToday) return;
    setBusy(true);
    try {
      const res = await requestAttendanceCorrection({
        studentId: student.id,
        date: todayIso(),
        requestedStatus: corrStatus,
        reason: corrReason,
        requestedBy: user?.email || user?.name || '',
      });
      if (!res.ok) {
        flash(false, res.error);
        return;
      }
      flash(
        true,
        (ar
          ? 'طُلب التصحيح — التوثيق الأصلي محفوظ للجنة الرقابة'
          : 'Correction filed — original record kept for the review committee') +
          (res.cloudSynced ? copy.cloudOk : res.cloudError ? copy.cloudFail : '')
      );
      setCorrReason('');
      refresh();
    } finally {
      setBusy(false);
    }
  };

  const saveGoals = async () => {
    if (!student) return;
    setBusy(true);
    try {
      const res = await assignBankGoals({
        studentId: student.id,
        goalIds: selectedGoalIds,
        teacherId: user?.email || '',
        teacherName: user?.name || '',
        severity,
      });
      if (!res.ok) {
        flash(false, res.error);
        return;
      }
      const primary = res.plan.goals[0];
      if (primary?.labelAr) {
        try {
          await updateStudentRecord(student.id, { [SF.programmed_goal]: primary.labelAr });
        } catch {
          /* offline ok */
        }
      }
      flash(
        true,
        (ar ? 'اعتُمدت أهداف الخطة الفردية' : 'IEP goals approved') +
          (res.cloudSynced ? copy.cloudOk : res.cloudError ? copy.cloudFail : '')
      );
      refresh();
    } finally {
      setBusy(false);
    }
  };

  const doCustom = async () => {
    if (!student) return;
    const res = await submitCustomGoal({
      studentId: student.id,
      textAr: customGoal,
      teacherId: user?.email || '',
    });
    if (!res.ok) {
      flash(false, res.error);
      return;
    }
    setCustomGoal('');
    flash(
      true,
      (ar ? 'رُفع الهدف الإضافي لاعتماد المشرف' : 'Additional goal submitted for supervisor approval') +
        (res.cloudSynced ? copy.cloudOk : res.cloudError ? copy.cloudFail : '')
    );
    refresh();
  };

  const onPhoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhotoDataUrl(String(reader.result || ''));
    reader.readAsDataURL(file);
  };

  const doEvidence = async () => {
    if (!student) return;
    setBusy(true);
    try {
      const res = await sealGoalEvidence({
        studentId: student.id,
        goalId: evidenceGoalId,
        note: evidenceNote,
        successPercent: evidencePct,
        photoDataUrl,
        teacherId: user?.email || '',
      });
      if (!res.ok) {
        flash(
          false,
          res.error === 'NOTE_REQUIRED'
            ? ar
              ? 'الملاحظة الصفية إلزامية (١٢ حرفاً على الأقل)'
              : 'Classroom verification note required (min 12 chars)'
            : res.error
        );
        return;
      }
      setEvidenceNote('');
      setPhotoDataUrl(null);
      flash(
        true,
        (ar ? 'وُثّق تحقق الهدف' : 'Goal verification certified') +
          (res.cloudSynced ? copy.cloudOk : res.cloudError ? copy.cloudFail : '')
      );
      refresh();
    } finally {
      setBusy(false);
    }
  };

  if (!student) {
    return (
      <div className={`${LUX.card} p-8 text-center text-slate-400`}>
        <ClipboardCheck className="w-10 h-10 mx-auto mb-3 text-[#c9a962]/70" />
        <p>{copy.noStudent}</p>
      </div>
    );
  }

  const tabs = [
    { id: 'attendance', label: copy.attendance, icon: UserCheck },
    { id: 'goals', label: copy.goals, icon: Target },
    { id: 'evidence', label: copy.evidence, icon: ShieldCheck },
  ];

  return (
    <div className="space-y-6" dir={ar ? 'rtl' : 'ltr'} key={tick}>
      <header className="space-y-1">
        <h2 className="text-xl font-bold text-[#e8c872] flex items-center gap-2">
          <ClipboardCheck className="w-5 h-5" /> {copy.title}
        </h2>
        <p className="text-xs text-slate-400">{copy.subtitle}</p>
        <p className="text-[10px] font-mono text-slate-500">
          {syncState === 'syncing'
            ? copy.syncing
            : syncState === 'cloud'
              ? copy.syncCloud
              : copy.syncLocal}
        </p>
        <p className="text-sm text-slate-300 font-medium">{student.name}</p>
      </header>

      {(msg || err) && (
        <div
          className={`text-sm rounded-xl px-4 py-3 border ${
            err
              ? 'bg-rose-950/40 border-rose-500/30 text-rose-200'
              : 'bg-emerald-950/40 border-emerald-500/30 text-emerald-200'
          }`}
        >
          {err || msg}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold border transition-colors ${
              tab === id
                ? 'bg-[#c9a962]/15 border-[#c9a962]/50 text-[#e8c872]'
                : 'bg-white/[0.03] border-white/10 text-slate-400 hover:border-white/20'
            }`}
          >
            <Icon className="w-3.5 h-3.5" /> {label}
          </button>
        ))}
      </div>

      {tab === 'attendance' && (
        <section className={`${LUX.card} p-5 space-y-4`}>
          {sealedToday ? (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/25">
              <Lock className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-emerald-200 text-sm">{copy.sealedLock}</p>
                <p className="text-xs text-slate-400 mt-1 font-mono">
                  {sealedToday.status} · {sealedToday.sealedAt?.slice(0, 19)?.replace('T', ' ')} · hash{' '}
                  {sealedToday.immutableHash?.slice(0, 12)}…
                </p>
                {sealedToday.biometricVerified && (
                  <p className="text-[10px] text-cyan-400 mt-1">{copy.biometric}</p>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {[
                [ATTENDANCE_STATUS.PRESENT, copy.present, 'emerald'],
                [ATTENDANCE_STATUS.ABSENT, copy.absent, 'rose'],
                [ATTENDANCE_STATUS.EXCUSED, copy.excused, 'amber'],
              ].map(([status, label, color]) => (
                <button
                  key={status}
                  type="button"
                  disabled={busy}
                  onClick={() => doSealAttendance(status)}
                  className={`px-4 py-3 rounded-xl text-sm font-bold border disabled:opacity-50 bg-${color}-500/10 border-${color}-400/30 text-${color}-200 hover:bg-${color}-500/20`}
                  style={{
                    background:
                      status === ATTENDANCE_STATUS.PRESENT
                        ? 'rgba(16,185,129,0.12)'
                        : status === ATTENDANCE_STATUS.ABSENT
                          ? 'rgba(244,63,94,0.12)'
                          : 'rgba(245,158,11,0.12)',
                    borderColor:
                      status === ATTENDANCE_STATUS.PRESENT
                        ? 'rgba(52,211,153,0.35)'
                        : status === ATTENDANCE_STATUS.ABSENT
                          ? 'rgba(251,113,133,0.35)'
                          : 'rgba(251,191,36,0.35)',
                    color:
                      status === ATTENDANCE_STATUS.PRESENT
                        ? '#a7f3d0'
                        : status === ATTENDANCE_STATUS.ABSENT
                          ? '#fecdd3'
                          : '#fde68a',
                  }}
                >
                  {busy ? <Loader2 className="w-4 h-4 animate-spin inline" /> : null} {copy.sealToday}: {label}
                </button>
              ))}
            </div>
          )}

          {month && (
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-xl bg-white/[0.03] border border-white/10 p-3">
                <p className="text-2xl font-mono text-emerald-300">{month.present}</p>
                <p className="text-[10px] text-slate-500">{copy.present}</p>
              </div>
              <div className="rounded-xl bg-white/[0.03] border border-white/10 p-3">
                <p className="text-2xl font-mono text-rose-300">{month.absent}</p>
                <p className="text-[10px] text-slate-500">{copy.absent}</p>
              </div>
              <div className="rounded-xl bg-white/[0.03] border border-white/10 p-3">
                <p className="text-2xl font-mono text-amber-300">{month.excused}</p>
                <p className="text-[10px] text-slate-500">{copy.excused}</p>
              </div>
            </div>
          )}

          {sealedToday && (
            <div className="space-y-2 border-t border-white/10 pt-4">
              <p className="text-xs text-slate-400 flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> {copy.correction}
              </p>
              <select
                value={corrStatus}
                onChange={(e) => setCorrStatus(e.target.value)}
                className="w-full rounded-xl bg-[#0d0d10] border border-white/10 px-3 py-2 text-sm text-slate-200"
              >
                <option value={ATTENDANCE_STATUS.PRESENT}>{copy.present}</option>
                <option value={ATTENDANCE_STATUS.ABSENT}>{copy.absent}</option>
                <option value={ATTENDANCE_STATUS.EXCUSED}>{copy.excused}</option>
              </select>
              <textarea
                value={corrReason}
                onChange={(e) => setCorrReason(e.target.value)}
                rows={2}
                placeholder={ar ? 'سبب طلب التصحيح (إلزامي للجنة الرقابة)' : 'Reason (required for review committee)'}
                className="w-full rounded-xl bg-[#0d0d10] border border-white/10 px-3 py-2 text-sm text-slate-200"
              />
              <button type="button" onClick={doCorrection} className={`${LUX.btnGold} text-xs px-4 py-2 rounded-xl`}>
                {copy.submitCorr}
              </button>
            </div>
          )}

          <ul className="text-[11px] font-mono text-slate-500 space-y-1 max-h-40 overflow-auto">
            {listAttendanceForStudent(student.id)
              .slice(-14)
              .reverse()
              .map((r) => (
                <li key={r.id}>
                  {r.date} · {r.status} · {r.immutableHash?.slice(0, 8)}
                </li>
              ))}
          </ul>
        </section>
      )}

      {tab === 'goals' && (
        <section className="space-y-4">
          <GoalBankPicker
            lang={lang}
            age={age}
            severity={severity}
            onSeverityChange={(id) => setSeverity(normalizeSeverity(id))}
            selectedIds={selectedGoalIds}
            onToggle={toggleGoal}
            onApplySuggestions={applySuggestions}
          />

          <div className={`${LUX.card} p-4 space-y-3`}>
            <p className="text-xs text-slate-500">{copy.maxGoals}</p>
            <button
              type="button"
              disabled={busy || !selectedGoalIds.length}
              onClick={saveGoals}
              className={`${LUX.btnEmerald} w-full sm:w-auto px-5 py-2.5 rounded-xl text-sm font-bold disabled:opacity-40`}
            >
              {busy ? <Loader2 className="w-4 h-4 animate-spin inline" /> : <CheckCircle2 className="w-4 h-4 inline" />}{' '}
              {copy.saveGoals}
            </button>

            <div className="border-t border-white/10 pt-4 space-y-2">
              <p className="text-xs text-slate-400">{copy.custom}</p>
              <textarea
                value={customGoal}
                onChange={(e) => setCustomGoal(e.target.value)}
                rows={2}
                className="w-full rounded-xl bg-[#0d0d10] border border-white/10 px-3 py-2 text-sm"
                placeholder={
                  ar
                    ? 'اكتب الهدف بصياغة سلوكية قابلة للقياس…'
                    : 'Write a measurable behavioral goal…'
                }
              />
              <button type="button" onClick={doCustom} className={`${LUX.btnGold} text-xs px-4 py-2 rounded-xl`}>
                {copy.submitCustom}
              </button>
              {pendingCustom.length > 0 && (
                <ul className="text-xs text-amber-200/80 space-y-1">
                  {pendingCustom.map((c) => (
                    <li key={c.id}>
                      {copy.pending}: {c.textAr}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </section>
      )}

      {tab === 'evidence' && (
        <section className={`${LUX.card} p-5 space-y-4`}>
          <label className="block text-xs text-slate-400 space-y-1">
            <span>{copy.goals}</span>
            <select
              value={evidenceGoalId}
              onChange={(e) => setEvidenceGoalId(e.target.value)}
              className="w-full rounded-xl bg-[#0d0d10] border border-white/10 px-3 py-2 text-sm text-slate-200"
            >
              {(plan?.goals || []).map((g) => (
                <option key={g.goalId} value={g.goalId}>
                  {ar ? g.labelAr : g.labelEn || g.labelAr}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-xs text-slate-400 space-y-1">
            <span>{copy.note}</span>
            <textarea
              value={evidenceNote}
              onChange={(e) => setEvidenceNote(e.target.value)}
              rows={3}
              className="w-full rounded-xl bg-[#0d0d10] border border-white/10 px-3 py-2 text-sm"
            />
          </label>
          <label className="block text-xs text-slate-400 space-y-1">
            <span>{copy.pct}</span>
            <input
              type="number"
              min={0}
              max={100}
              value={evidencePct}
              onChange={(e) => setEvidencePct(e.target.value)}
              className="w-32 rounded-xl bg-[#0d0d10] border border-white/10 px-3 py-2 text-sm"
            />
          </label>
          <label className="inline-flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
            <Camera className="w-4 h-4" /> {copy.photo}
            <input type="file" accept="image/*" onChange={onPhoto} className="text-xs" />
          </label>
          {photoDataUrl && <p className="text-[10px] text-emerald-400">{ar ? 'تم إرفاق صورة كدليل' : 'Photo evidence attached'}</p>}
          <button
            type="button"
            disabled={busy || !evidenceGoalId}
            onClick={doEvidence}
            className={`${LUX.btnEmerald} px-4 py-2 rounded-xl text-sm font-bold disabled:opacity-40`}
          >
            {busy ? <Loader2 className="w-4 h-4 animate-spin inline" /> : <Lock className="w-4 h-4 inline" />}{' '}
            {copy.sealEvidence}
          </button>

          <div>
            <p className="text-xs font-bold text-slate-400 mb-2">{copy.history}</p>
            <ul className="space-y-2 max-h-56 overflow-auto">
              {evidence.map((e) => (
                <li key={e.id} className="text-xs rounded-lg border border-white/10 p-3 bg-white/[0.02]">
                  <p className="text-[#e8c872] font-mono">
                    {e.date} · {e.successPercent != null ? `${e.successPercent}%` : '—'}
                    {e.hasPhoto ? ' · 📷' : ''}
                  </p>
                  <p className="text-slate-300 mt-1">{e.note}</p>
                  <p className="text-[10px] text-slate-600 mt-1">{e.labelAr}</p>
                </li>
              ))}
              {!evidence.length && (
                <li className="text-slate-500 text-xs">{ar ? 'لا أدلة تحقق موثّقة بعد' : 'No certified verification evidence yet'}</li>
              )}
            </ul>
          </div>
        </section>
      )}
    </div>
  );
}
