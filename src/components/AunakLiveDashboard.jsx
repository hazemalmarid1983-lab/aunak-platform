import { useStudents } from '../hooks/useStudents';
import { parseHarmonyScore } from '../lib/airtable';
import { Activity, RefreshCw, AlertCircle, UserCheck } from 'lucide-react';

export default function AunakLiveDashboard({ lang = 'ar' }) {
  const { students, loading, refetch, error } = useStudents(lang);
  const list = Array.isArray(students) ? students : [];

  const t = {
    ar: {
      title: 'لوحة المتابعة التربوية والتأهيلية الحية',
      subtitle: 'بيانات حقيقية متزامنة لحظياً من Airtable',
      syncing: 'جاري المزامنة...',
      refresh: 'تحديث البيانات',
      loading: 'جاري سحب بيانات الأطفال من الخادم السيادي (Airtable)...',
      noStudents: 'لم يتم العثور على أطفال!',
      noStudentsHint: 'تأكد من إدخال التوكن في src/lib/airtable.js (HARDCODED_API_KEY) أو في .env.local، وأن الجدول tblzYmBGmCxx2vdcr يحتوي على بيانات.',
      noName: 'بدون اسم',
      code: 'كود',
      diagnosis: 'التشخيص الطبي',
      unspecified: 'غير محدد',
      harmony: 'درجة التناغم (Harmony)',
      pending: 'قيد التقييم',
    },
    en: {
      title: 'Live Educational & Rehabilitative Dashboard',
      subtitle: 'Real-time data synced from Airtable',
      syncing: 'Syncing...',
      refresh: 'Refresh Data',
      loading: 'Fetching student records from Airtable...',
      noStudents: 'No students found!',
      noStudentsHint: 'Set your token in src/lib/airtable.js (HARDCODED_API_KEY) or .env.local, and ensure table tblzYmBGmCxx2vdcr has records.',
      noName: 'Unnamed',
      code: 'Code',
      diagnosis: 'Medical Diagnosis',
      unspecified: 'Unspecified',
      harmony: 'Harmony Score',
      pending: 'Pending assessment',
    },
  };

  const copy = t[lang] ?? t.ar;

  return (
    <div className="p-6 md:p-10 min-h-screen text-slate-200" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <header className="mb-8 border-b border-slate-800 pb-6 flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-cyan-400 flex items-center gap-3">
            <Activity className="w-8 h-8" /> {copy.title}
          </h2>
          <p className="text-slate-400 mt-2 font-mono">{copy.subtitle}</p>
        </div>
        <button
          type="button"
          onClick={refetch}
          className="flex items-center gap-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 px-5 py-2.5 rounded-xl font-bold transition-all"
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
              harmony != null && harmony > 80
                ? 'text-emerald-400'
                : harmony != null && harmony > 50
                  ? 'text-amber-400'
                  : 'text-rose-400';

            return (
              <div
                key={student.id}
                className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl shadow-xl hover:border-cyan-500/50 hover:bg-slate-800 transition-all relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 w-2 h-full bg-cyan-500/20 group-hover:bg-cyan-500 transition-colors" />
                <div className="flex items-center gap-4 mb-6 pb-4 border-b border-slate-800">
                  <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
                    <UserCheck className="w-6 h-6 text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-100">{student.name || copy.noName}</h3>
                    <p className="text-xs text-slate-500 font-mono mt-1">
                      {copy.code}: <span className="text-amber-400">{student.studentCode || 'N/A'}</span>
                    </p>
                  </div>
                </div>

                <div className="space-y-4 text-sm text-slate-300">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">{copy.diagnosis}:</span>
                    <span className="font-semibold">{student.diagnosis || copy.unspecified}</span>
                  </div>
                  <div className="flex justify-between items-center bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400">{copy.harmony}:</span>
                    <span className={`text-xl font-black ${harmonyClass}`}>
                      {harmony != null ? `${harmony}%` : student.harmonyScore ? String(student.harmonyScore) : copy.pending}
                    </span>
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
