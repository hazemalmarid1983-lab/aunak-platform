import { useEffect } from 'react';
import { useStudents } from '../hooks/useStudents';
import { parseHarmonyScore } from '../lib/airtable';
import { EYE_MAP_CELL_COUNT, EYE_MAP_COLS } from '../lib/airtableMappers';
import { Activity, RefreshCw, AlertCircle, UserCheck, Lock, Eye } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { isActiveB2B } from '../lib/plans';
import { startProcessingHum } from '../lib/sovereignAudio';
import { LUX } from '../lib/luxTheme.js';

function hasEyeMapData(student) {
  const map = student?.eyeMapData;
  return Array.isArray(map) && map.length > 0 && map.some((v) => v > 0);
}

function EyeTrackingGrid({ student, emptyLabel }) {
  const hasSession = hasEyeMapData(student);
  const cells = hasSession ? student.eyeMapData.slice(0, EYE_MAP_CELL_COUNT) : null;

  return (
    <div>
      <div
        className="grid gap-1"
        style={{ gridTemplateColumns: `repeat(${EYE_MAP_COLS}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: EYE_MAP_CELL_COUNT }, (_, i) => {
          const intensity = cells?.[i] ?? 0;
          if (!hasSession || !cells) {
            return <span key={i} className={`aspect-square ${LUX.eyeMapCellEmpty}`} />;
          }
          return (
            <span
              key={i}
              className={`aspect-square ${LUX.eyeMapCellActive}`}
              style={{ opacity: 0.25 + intensity * 0.75 }}
            />
          );
        })}
      </div>
      {!hasSession && (
        <p className="text-[10px] text-slate-500 font-mono mt-2 text-center">{emptyLabel}</p>
      )}
    </div>
  );
}

export default function AunakLiveDashboard({ lang = 'ar' }) {
  const { students, loading, refetch, error } = useStudents(lang);
  const { user } = useAuth();
  // Value Lock: درجة التناغم وخرائط تتبع العين حصرية لباقة B2B النشطة فأعلى.
  const b2bUnlocked = isActiveB2B(user?.plan);
  const list = Array.isArray(students) ? students : [];

  // Data Processing Hum — يعمل طوال بقاء الـ AI Terminal مفتوحاً (حتى في الخلفية).
  useEffect(() => {
    const hum = startProcessingHum();
    return () => hum.stop();
  }, []);


  const t = {
    ar: {
      title: 'لوحة المتابعة التربوية والتأهيلية الحية',
      subtitle: 'بيانات حقيقية متزامنة لحظياً من Airtable',
      syncing: 'جاري المزامنة...',
      refresh: 'تحديث البيانات',
      loading: 'جاري سحب بيانات الأطفال من الخادم السيادي (Airtable)...',
      noStudents: 'لم يتم العثور على أطفال!',
      noStudentsHint: 'تأكد من VITE_USE_AIRTABLE_PROXY=true و AIRTABLE_API_KEY على السيرفر (Vercel)، وأن جدول الطلاب يحتوي على سجلات.',
      noName: 'بدون اسم',
      code: 'كود',
      diagnosis: 'التشخيص الطبي',
      unspecified: 'غير محدد',
      harmony: 'درجة التناغم (Harmony)',
      pending: 'قيد التقييم',
      eyeMap: 'خريطة تتبع العين',
      eyeMapEmpty: 'لم يُجرَ اختبار بصري بعد',
      exclusive: 'ميزة حصرية للمراكز المعتمدة',
    },
    en: {
      title: 'Live Educational & Rehabilitative Dashboard',
      subtitle: 'Real-time data synced from Airtable',
      syncing: 'Syncing...',
      refresh: 'Refresh Data',
      loading: 'Fetching student records from Airtable...',
      noStudents: 'No students found!',
      noStudentsHint: 'Ensure VITE_USE_AIRTABLE_PROXY=true and AIRTABLE_API_KEY on the server (Vercel), and that the students table has records.',
      noName: 'Unnamed',
      code: 'Code',
      diagnosis: 'Medical Diagnosis',
      unspecified: 'Unspecified',
      harmony: 'Harmony Score',
      pending: 'Pending assessment',
      eyeMap: 'Eye-Tracking Map',
      eyeMapEmpty: 'No eye-tracking session yet',
      exclusive: 'Exclusive to certified centers',
    },
  };

  const copy = t[lang] ?? t.ar;

  return (
    <div className="p-6 md:p-10 min-h-screen text-slate-200" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <header className="mb-8 border-b border-[#c9a962]/15 pb-6 flex justify-between items-center">
        <div>
          <h2 className={`${LUX.titleGradient} flex items-center gap-3`}>
            <Activity className="w-8 h-8" /> {copy.title}
          </h2>
          <p className="text-slate-400 mt-2 font-mono">{copy.subtitle}</p>
        </div>
        <button
          type="button"
          onClick={refetch}
          className="flex items-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-400/30 px-5 py-2.5 rounded-xl font-bold transition-all"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          {loading ? copy.syncing : copy.refresh}
        </button>
      </header>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-20 text-slate-400 animate-pulse text-lg font-mono">
          {copy.loading}
        </div>
      ) : list.length === 0 ? (
        <div className="text-center py-20 text-rose-400 flex flex-col items-center gap-4 bg-rose-500/5 rounded-3xl border border-rose-500/20">
          <AlertCircle className="w-16 h-16 animate-bounce" />
          <p className="text-lg font-bold">{copy.noStudents}</p>
          <p className="text-sm text-rose-300 max-w-md">{copy.noStudentsHint}</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {list.map((student) => {
            const harmony = parseHarmonyScore(student.harmonyScore);
            const harmonyClass =
              harmony == null || harmony === 0
                ? LUX.harmonyPending
                : harmony > 80
                  ? 'text-emerald-400'
                  : harmony > 50
                    ? 'text-[#d4af37]'
                    : 'text-rose-400';

            return (
              <div
                key={student.id}
                className="bg-[#12121a]/70 backdrop-blur-xl border border-[#c9a962]/15 shadow-[0_0_48px_rgba(201,169,98,0.1)] p-6 rounded-3xl hover:border-emerald-400/50 transition-all relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 w-2 h-full bg-emerald-500/20 group-hover:bg-emerald-500 transition-colors" />
                <div className="flex items-center gap-4 mb-6 pb-4 border-b border-[#c9a962]/15">
                  <div className="w-12 h-12 rounded-full bg-[#12121a]/70 flex items-center justify-center border border-white/[0.08]">
                    <UserCheck className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[#e8c872]">{student.name || copy.noName}</h3>
                    <p className="text-xs text-slate-500 font-mono mt-1">
                      {copy.code}: <span className="text-[#d4af37]">{student.studentCode || 'N/A'}</span>
                    </p>
                  </div>
                </div>

                <div className="space-y-4 text-sm text-slate-300">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">{copy.diagnosis}:</span>
                    <span className="font-semibold">{student.diagnosis || copy.unspecified}</span>
                  </div>
                  <div className="relative bg-[#0d0d10]/90 p-3 rounded-xl border border-[#c9a962]/15">
                    <div className={`flex justify-between items-center ${b2bUnlocked ? '' : 'blur-[7px] select-none pointer-events-none'}`}>
                      <span className="text-slate-400">{copy.harmony}:</span>
                      <span className={`text-xl font-black ${harmonyClass}`}>
                        {harmony != null && harmony > 0
                          ? `${harmony}%`
                          : copy.pending}
                      </span>
                    </div>
                    {!b2bUnlocked && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="px-3 py-1 rounded-full bg-[#0d0d10]/90/85 border border-amber-500/40 text-[#e8c872] text-[10px] font-bold flex items-center gap-1.5">
                          <Lock className="w-3 h-3" /> {copy.exclusive}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="relative bg-[#0d0d10]/90 p-3 rounded-xl border border-[#c9a962]/15">
                    <div className={b2bUnlocked ? '' : 'blur-[7px] select-none pointer-events-none'}>
                      <p className="text-xs text-slate-500 mb-2 flex items-center gap-1.5">
                        <Eye className="w-3.5 h-3.5 text-emerald-400" /> {copy.eyeMap}
                      </p>
                      <EyeTrackingGrid
                        student={student}
                        emptyLabel={copy.eyeMapEmpty}
                      />
                    </div>
                    {!b2bUnlocked && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="px-3 py-1 rounded-full bg-[#0d0d10]/90/85 border border-amber-500/40 text-[#e8c872] text-[10px] font-bold flex items-center gap-1.5">
                          <Lock className="w-3 h-3" /> {copy.exclusive}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
