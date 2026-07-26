import { useCallback, useEffect, useMemo, useState } from 'react';
import { CalendarClock, Coffee, Loader2, Lock, Save, Filter } from 'lucide-react';
import { useAuth, ROLES, isMinistrySupervisor, isSovereignOwner } from '../lib/auth';
import { useStudents } from '../hooks/useStudents';
import { useAirtableData } from '../hooks/useAirtableData';
import { AIRTABLE_TABLES } from '../lib/airtableTables';
import { mapSpecialist } from '../lib/airtableMappers';
import { DUTY_SHIFT } from '../lib/airtableFields';
import { LUX } from '../lib/luxTheme';
import {
  SCHEDULER_WEEKDAYS,
  SPECIALTY_OPTIONS,
  assignCell,
  buildShiftSlots,
  canEditSmartSchedule,
  cellKey,
  normalizeSpecialty,
  readWeeklyTemplate,
  specialtyLabel,
  writeWeeklyTemplate,
} from '../lib/smartScheduler';

function specialistSpecialty(spec) {
  return normalizeSpecialty(spec?.specialty ?? spec?.fields?.specialty);
}

export default function AunakSmartScheduler({ lang = 'ar' }) {
  const { user } = useAuth();
  const role = user?.role;
  const canEdit =
    canEditSmartSchedule(user, role) ||
    isSovereignOwner(user) ||
    isMinistrySupervisor(user) ||
    role === ROLES.ADMIN;

  const { students, loading: studentsLoading } = useStudents(lang);
  const { records: specialists, loading: specsLoading } = useAirtableData(
    AIRTABLE_TABLES.specialists,
    { mapRecord: mapSpecialist, lang }
  );

  const [specialty, setSpecialty] = useState(SPECIALTY_OPTIONS[0].value);
  const [dutyShift, setDutyShift] = useState(DUTY_SHIFT.morning);
  const [weekday, setWeekday] = useState(0);
  const [cells, setCells] = useState(() => readWeeklyTemplate().cells);
  const [savedAt, setSavedAt] = useState(null);
  const [dirty, setDirty] = useState(false);

  const slots = useMemo(() => buildShiftSlots(dutyShift), [dutyShift]);
  const sessionSlots = useMemo(() => slots.filter((s) => s.kind === 'session'), [slots]);

  const visibleSpecialists = useMemo(() => {
    const list = (specialists || []).filter((s) => {
      const sp = specialistSpecialty(s);
      return !specialty || sp === specialty || !sp || sp === '—';
    });
    if (role === ROLES.SPECIALIST) {
      const mine =
        list.filter(
          (s) =>
            s.id === user?.specialistRecordId ||
            s.id === user?.recordId ||
            String(s.email || '').toLowerCase() === String(user?.email || '').toLowerCase()
        ) || [];
      return mine.length ? mine : list.slice(0, 1);
    }
    return list;
  }, [specialists, specialty, role, user]);

  const studentOptions = useMemo(
    () =>
      (students || []).map((s) => ({
        id: s.id,
        name: s.name || '—',
      })),
    [students]
  );

  const copy =
    lang === 'en'
      ? {
          title: 'Smart Monthly Scheduler',
          subtitle: 'Recurring Sun–Thu weekly template for the whole month',
          specialty: 'Specialty',
          shift: 'Duty shift',
          morning: 'Morning (06:00–13:00)',
          evening: 'Evening (16:00–20:00)',
          weekday: 'Weekday',
          save: 'Save weekly template',
          saved: 'Template saved — applies to every matching weekday this month',
          readOnly: 'Specialist view — your column only (read-only assignment)',
          editHint: 'Center admin / ministry supervisor can assign beneficiaries to each slot',
          noSpecs: 'No specialists for this specialty',
          loading: 'Loading schedule…',
          breakfast: 'Breakfast break',
          unassigned: '— Unassigned —',
        }
      : {
          title: 'الجدول الشهري الذكي',
          subtitle: 'نموذج أسبوعي متكرر (الأحد–الخميس) ينطبق على كامل الشهر',
          specialty: 'التخصص',
          shift: 'فترة الدوام',
          morning: 'صباحي (6:00 – 1:00)',
          evening: 'مسائي (4:00 – 8:00)',
          weekday: 'يوم الأسبوع',
          save: 'حفظ النموذج الأسبوعي',
          saved: 'تم الحفظ — يُطبَّق على كل الأيام المطابقة خلال الشهر',
          readOnly: 'عرض الأخصائي — عمودك فقط (تعيين للمشرفين)',
          editHint: 'مدير المركز / مشرف الوزارة يمكنه إسناد مستفيد لكل مربع',
          noSpecs: 'لا يوجد أخصائيون لهذا التخصص',
          loading: 'جاري تحميل الجدول…',
          breakfast: 'بريك فطور',
          unassigned: '— بدون إسناد —',
        };

  const setAssignment = useCallback(
    (specialistId, periodNumber, studentId) => {
      if (!canEdit) return;
      const key = cellKey({ weekday, dutyShift, periodNumber, specialistId });
      const student = studentOptions.find((s) => s.id === studentId);
      setCells((prev) => {
        const next = assignCell(prev, key, student ? { studentId: student.id, studentName: student.name } : null);
        return next;
      });
      setDirty(true);
      setSavedAt(null);
    },
    [canEdit, weekday, dutyShift, studentOptions]
  );

  const saveTemplate = () => {
    writeWeeklyTemplate(cells);
    setDirty(false);
    setSavedAt(new Date().toISOString());
  };

  useEffect(() => {
    const stored = readWeeklyTemplate();
    setCells(stored.cells);
  }, []);

  const loading = studentsLoading || specsLoading;

  return (
    <div dir={lang === 'ar' ? 'rtl' : 'ltr'} className={`${LUX.page} p-4 md:p-8`}>
      <header className={`${LUX.headerBar} rounded-2xl mb-6`}>
        <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
          <div className="flex items-center gap-3">
            <CalendarClock className="w-8 h-8 text-[#e8c872]" />
            <div>
              <h1 className={LUX.titleGradient}>{copy.title}</h1>
              <p className={LUX.subtitle}>{copy.subtitle}</p>
            </div>
          </div>
          {canEdit ? (
            <button type="button" onClick={saveTemplate} disabled={!dirty} className={LUX.btnGold}>
              <Save className="w-4 h-4 inline me-2" />
              {copy.save}
            </button>
          ) : (
            <span className={LUX.emeraldBadge}>
              <Lock className="w-3.5 h-3.5" />
              {copy.readOnly}
            </span>
          )}
        </div>
      </header>

      <section className={`${LUX.glassCard} mb-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-4`}>
        <label className="block space-y-1.5">
          <span className="text-xs text-slate-500 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> {copy.specialty}
          </span>
          <select
            value={specialty}
            onChange={(e) => setSpecialty(e.target.value)}
            className={LUX.input}
          >
            {SPECIALTY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {lang === 'en' ? o.en : o.ar}
              </option>
            ))}
          </select>
        </label>

        <label className="block space-y-1.5">
          <span className="text-xs text-slate-500">{copy.shift}</span>
          <select
            value={dutyShift}
            onChange={(e) => setDutyShift(e.target.value)}
            className={LUX.input}
          >
            <option value={DUTY_SHIFT.morning}>{copy.morning}</option>
            <option value={DUTY_SHIFT.evening}>{copy.evening}</option>
          </select>
        </label>

        <label className="block space-y-1.5 sm:col-span-2">
          <span className="text-xs text-slate-500">{copy.weekday}</span>
          <div className="flex flex-wrap gap-2">
            {SCHEDULER_WEEKDAYS.map((d) => (
              <button
                key={d.key}
                type="button"
                onClick={() => setWeekday(d.key)}
                className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                  weekday === d.key
                    ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-200'
                    : 'bg-[#0d0d10]/80 border-white/[0.08] text-slate-400'
                }`}
              >
                {lang === 'en' ? d.en : d.ar}
              </button>
            ))}
          </div>
        </label>
      </section>

      <p className="text-xs text-slate-500 mb-3">
        {canEdit ? copy.editHint : copy.readOnly} · {specialtyLabel(specialty, lang)}
      </p>
      {savedAt && <p className="text-xs text-emerald-400 font-mono mb-3">{copy.saved}</p>}

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-400" aria-label={copy.loading} />
        </div>
      ) : visibleSpecialists.length === 0 ? (
        <div className={`${LUX.glassCard} text-center py-12 text-slate-500`}>{copy.noSpecs}</div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-[#c9a962]/20">
          <table className="min-w-full text-sm border-collapse">
            <thead>
              <tr className="bg-[#0d0d10]/95">
                <th className="sticky start-0 z-10 bg-[#0d0d10] px-3 py-3 text-start text-[10px] uppercase tracking-wider text-amber-500/80 border-b border-slate-800">
                  الوقت
                </th>
                {visibleSpecialists.map((spec) => (
                  <th
                    key={spec.id}
                    className="px-3 py-3 text-start text-xs font-bold text-[#e8c872] border-b border-slate-800 min-w-[10rem]"
                  >
                    {spec.name}
                    <span className="block text-[10px] font-mono text-slate-500 font-normal">
                      {specialtyLabel(specialistSpecialty(spec), lang)}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {slots.map((slot) => {
                if (slot.kind === 'break') {
                  return (
                    <tr key={`break-${slot.start}`} className="bg-amber-500/5">
                      <td
                        colSpan={visibleSpecialists.length + 1}
                        className="px-3 py-2 text-center text-xs font-bold text-amber-200 border-b border-amber-500/20"
                      >
                        <Coffee className="w-3.5 h-3.5 inline me-2" />
                        {slot.label || copy.breakfast}
                      </td>
                    </tr>
                  );
                }

                return (
                  <tr key={`${slot.periodNumber}-${slot.start}`} className="border-b border-slate-800/60 hover:bg-neutral-900/50">
                    <td className="sticky start-0 z-10 bg-[#0a0a0c] px-3 py-2 font-mono text-[11px] text-emerald-300 whitespace-nowrap">
                      <span className="text-slate-500 me-1">#{slot.periodNumber}</span>
                      {slot.label}
                    </td>
                    {visibleSpecialists.map((spec) => {
                      const key = cellKey({
                        weekday,
                        dutyShift,
                        periodNumber: slot.periodNumber,
                        specialistId: spec.id,
                      });
                      const cell = cells[key];
                      return (
                        <td key={spec.id} className="px-2 py-1.5 align-middle">
                          {canEdit ? (
                            <select
                              value={cell?.studentId || ''}
                              onChange={(e) => setAssignment(spec.id, slot.periodNumber, e.target.value)}
                              className="w-full min-w-[9rem] px-2 py-1.5 rounded-lg bg-[#0d0d10] border border-white/[0.08] text-xs text-slate-200"
                            >
                              <option value="">{copy.unassigned}</option>
                              {studentOptions.map((st) => (
                                <option key={st.id} value={st.id}>
                                  {slot.periodNumber}-{st.name}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <span className="block px-2 py-1.5 rounded-lg bg-[#12121a]/80 border border-white/[0.06] text-xs text-slate-300">
                              {cell?.studentName
                                ? `${slot.periodNumber}-${cell.studentName}`
                                : copy.unassigned}
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p className="text-[10px] text-slate-600 px-3 py-2 font-mono">
            {dutyShift === DUTY_SHIFT.morning
              ? `${sessionSlots.length} جلسة صباحية · بريك بعد الثالثة`
              : `${sessionSlots.length} جلسة مسائية متواصلة`}
          </p>
        </div>
      )}
    </div>
  );
}
