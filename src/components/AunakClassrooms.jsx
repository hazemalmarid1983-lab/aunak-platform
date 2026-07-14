import { useState, useEffect, useMemo } from 'react';
import { useStudents } from '../hooks/useStudents';
import { STUDENT_CLASS_FIELD } from '../hooks/useStudents';
import { BookOpen, Users, BrainCircuit, School, Activity, Loader2 } from 'lucide-react';
import { AirtableEmpty, AirtableErrorBanner } from './AirtableStatus';
import { LUX } from '../lib/luxTheme.js';

const UNASSIGNED_KEY = '__unassigned__';

export default function AunakClassrooms({ lang = 'ar' }) {
  const { students, loading, error } = useStudents(lang);
  const [activeClassKey, setActiveClassKey] = useState(null);

  const t = {
    ar: {
      title: 'إدارة الفصول الدراسية',
      subtitle: 'تصفية المستفيدين حسب الفصل المُسند في Airtable',
      distributing: 'المستفيد قيد التوزيع:',
      loading: 'جاري التحميل...',
      roomList: 'قائمة الفصول',
      addRoom: '+ إضافة فصل جديد',
      roomDetails: 'تفاصيل الفصل المحدد',
      schedule: 'الجدول: 08:00 ص - 01:00 م',
      specialist: 'المعالج السلوكي المسؤول',
      capacity: 'طاقة الفصل الاستيعابية',
      enrolled: 'المستفيدون المسجلون',
      unassignedRoom: 'غير مُسند لفصل',
      noDiagnosis: '—',
      noStudentsInClass: 'لا يوجد مستفيدون مسجلون في هذا الفصل.',
      noClassrooms: 'لا توجد فصول — عيّن حقل «الفصل الدراسي» للمستفيدين في Airtable.',
      aiTitle: 'توزيع المستفيدين الذكي (AI Smart Distribution)',
      aiBody: (className, count) =>
        `يضم "${className}" ${count} مستفيد/ة حالياً وفق حقل «${STUDENT_CLASS_FIELD}» في سجل المستفيدين. راجع التوافق الحسي والأكاديمي قبل إضافة مستفيدين جدد.`,
      fieldMapping: `حقل Airtable: ${STUDENT_CLASS_FIELD} (أو Assigned Class / Class / Classroom)`,
      active: 'نشط',
    },
    en: {
      title: 'Classroom Management',
      subtitle: 'Filter beneficiaries by assigned class from Airtable',
      distributing: 'Beneficiary being placed:',
      loading: 'Loading...',
      roomList: 'Classroom List',
      addRoom: '+ Add New Classroom',
      roomDetails: 'Selected Classroom Details',
      schedule: 'Schedule: 08:00 AM - 01:00 PM',
      specialist: 'Assigned Behavior Therapist',
      capacity: 'Room Capacity',
      enrolled: 'Enrolled Beneficiaries',
      unassignedRoom: 'Unassigned',
      noDiagnosis: '—',
      noStudentsInClass: 'No beneficiaries enrolled in this classroom.',
      noClassrooms: 'No classrooms found — assign the class field for beneficiaries in Airtable.',
      aiTitle: 'AI Smart Distribution',
      aiBody: (className, count) =>
        `"${className}" currently has ${count} beneficiary(ies) based on the registry class field. Review sensory and academic fit before adding new beneficiaries.`,
      fieldMapping: `Airtable field: Assigned Class (or ${STUDENT_CLASS_FIELD} / Class / Classroom)`,
      active: 'Active',
    },
  };

  const copy = t[lang] ?? t.ar;

  const classrooms = useMemo(() => {
    const grouped = new Map();

    for (const student of students) {
      const className = student.assignedClass?.trim() || copy.unassignedRoom;
      const key = student.assignedClass?.trim() ? student.assignedClass.trim() : UNASSIGNED_KEY;

      if (!grouped.has(key)) {
        grouped.set(key, {
          key,
          name: className,
          students: [],
        });
      }
      grouped.get(key).students.push(student);
    }

    return [...grouped.values()].sort((a, b) => {
      if (a.key === UNASSIGNED_KEY) return 1;
      if (b.key === UNASSIGNED_KEY) return -1;
      return a.name.localeCompare(b.name, lang === 'ar' ? 'ar' : 'en');
    });
  }, [students, copy.unassignedRoom, lang]);

  useEffect(() => {
    if (classrooms.length === 0) {
      setActiveClassKey(null);
      return;
    }
    setActiveClassKey((prev) =>
      prev && classrooms.some((room) => room.key === prev) ? prev : classrooms[0].key
    );
  }, [classrooms]);

  const activeRoom = classrooms.find((room) => room.key === activeClassKey) ?? null;
  const enrolledStudents = activeRoom?.students ?? [];
  const capacityMax = 6;
  const capacityUsed = enrolledStudents.length;
  const capacityPercent = Math.min(100, Math.round((capacityUsed / capacityMax) * 100));

  return (
    <div className="p-6 md:p-10 min-h-screen bg-[#0a0a0c] text-slate-200 font-sans" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <header className="mb-8 border-b border-[#c9a962]/15 pb-6 flex justify-between items-center">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-blue-400 flex items-center gap-3">
            <School className="w-10 h-10" /> {copy.title}
          </h2>
          <p className="text-slate-400 mt-2 text-lg font-mono">{copy.subtitle}</p>
          <p className="text-xs text-blue-400/70 font-mono mt-2">{copy.fieldMapping}</p>
        </div>
      </header>

      <AirtableErrorBanner error={error} />

      <div className="grid lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-[#12121a]/70 backdrop-blur-xl border border-[#c9a962]/15 shadow-[0_0_48px_rgba(201,169,98,0.1)] p-5 rounded-2xl border border-[#c9a962]/15 mb-4">
            <h3 className="text-sm text-slate-500 mb-2 font-bold">{copy.distributing}</h3>
            <p className="text-xl font-bold text-slate-300 flex items-center gap-2">
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-blue-400" /> {copy.loading}
                </>
              ) : (
                students?.[0]?.name || copy.noDiagnosis
              )}
            </p>
          </div>

          <h3 className="text-lg font-bold text-slate-300 mb-2 border-b border-[#c9a962]/15 pb-2">{copy.roomList}</h3>
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-8 text-slate-500 text-sm">
              <Loader2 className="w-4 h-4 animate-spin" /> {copy.loading}
            </div>
          ) : classrooms.length === 0 ? (
            <AirtableEmpty lang={lang} message={copy.noClassrooms} />
          ) : (
            <div className="space-y-3">
              {classrooms.map((room) => (
                <button
                  key={room.key}
                  type="button"
                  onClick={() => setActiveClassKey(room.key)}
                  className={`w-full ${lang === 'ar' ? 'text-right' : 'text-left'} p-4 rounded-xl border transition-all ${
                    activeClassKey === room.key
                      ? 'bg-blue-500/10 border-blue-500/50 text-blue-300 shadow-lg'
                      : 'bg-[#12121a]/70 backdrop-blur-xl border border-[#c9a962]/15 shadow-[0_0_48px_rgba(201,169,98,0.1)] border-[#c9a962]/15 text-slate-400 hover:bg-[#12121a]/70'
                  }`}
                >
                  <h4 className="font-bold text-sm mb-1 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 shrink-0" /> {room.name}
                  </h4>
                  <div className="flex justify-between items-center text-xs mt-2">
                    <span className="text-slate-500 flex items-center gap-1">
                      <Users className="w-3 h-3" /> {room.students.length}
                    </span>
                    <span className="text-emerald-400">{copy.active}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
          <button
            type="button"
            className="w-full py-3 mt-2 bg-[#12121a]/70 hover:bg-[#12121a]/90 text-white rounded-xl font-bold transition-all border border-slate-600 border-dashed"
          >
            {copy.addRoom}
          </button>
        </div>

        <div className="lg:col-span-3 space-y-6">
          <div className="bg-[#12121a]/70 backdrop-blur-xl border border-[#c9a962]/15 shadow-[0_0_48px_rgba(201,169,98,0.1)] p-8 rounded-3xl border border-[#c9a962]/15 shadow-xl">
            <div className="flex justify-between items-center mb-6 border-b border-[#c9a962]/15 pb-4">
              <h3 className="text-2xl font-bold text-slate-300 flex items-center gap-2">{copy.roomDetails}</h3>
              <span className="px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/30 rounded-lg text-xs font-mono font-bold">
                {copy.schedule}
              </span>
            </div>

            {activeRoom ? (
              <>
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div className="p-4 bg-[#0d0d10]/90 rounded-xl border border-[#c9a962]/15">
                    <p className="text-sm text-slate-500 mb-2 font-bold">{copy.specialist}</p>
                    <p className="text-lg text-slate-200 font-semibold">{activeRoom.name}</p>
                  </div>
                  <div className="p-4 bg-[#0d0d10]/90 rounded-xl border border-[#c9a962]/15">
                    <p className="text-sm text-slate-500 mb-2 font-bold">{copy.capacity}</p>
                    <div className="w-full bg-[#12121a]/70 rounded-full h-2.5 mb-1 mt-3">
                      <div className="bg-blue-400 h-2.5 rounded-full transition-all" style={{ width: `${capacityPercent}%` }} />
                    </div>
                    <p className="text-xs text-slate-400 font-mono">
                      {capacityUsed}/{capacityMax}
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-[#0d0d10]/90 rounded-xl border border-[#c9a962]/15">
                  <h4 className="text-slate-300 font-bold mb-3 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-400" /> {copy.enrolled}
                  </h4>
                  {enrolledStudents.length === 0 ? (
                    <p className="text-sm text-slate-500 py-4">{copy.noStudentsInClass}</p>
                  ) : (
                    <div className="space-y-2">
                      {enrolledStudents.map((student) => (
                        <div
                          key={student.id}
                          className="flex items-center gap-3 p-3 rounded-lg border border-[#c9a962]/15 bg-[#12121a]/70 backdrop-blur-xl border border-[#c9a962]/15 shadow-[0_0_48px_rgba(201,169,98,0.1)]"
                        >
                          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs text-white shrink-0">
                            {(student.name || '?').charAt(0)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className="text-sm text-slate-300 font-semibold block truncate">{student.name}</span>
                            {student.diagnosis && (
                              <span className="text-xs text-slate-500">{student.diagnosis}</span>
                            )}
                          </div>
                          {student.studentCode && (
                            <span className="text-[10px] font-mono text-slate-500 shrink-0">{student.studentCode}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : (
              !loading && <AirtableEmpty lang={lang} message={copy.noClassrooms} />
            )}
          </div>

          {activeRoom && (
            <div className="bg-blue-900/10 p-8 rounded-3xl border border-blue-500/20 shadow-[0_0_30px_rgba(59,130,246,0.05)]">
              <h3 className="text-xl font-bold text-blue-300 mb-4 flex items-center gap-2">
                <BrainCircuit className="w-6 h-6" /> {copy.aiTitle}
              </h3>
              <p className="text-md text-blue-200/80 leading-relaxed bg-blue-950/50 p-5 rounded-xl border border-blue-500/30">
                {copy.aiBody(activeRoom.name, enrolledStudents.length)}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
