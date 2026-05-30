import { useState } from 'react';
import { useStudents } from '../hooks/useStudents';
import { ClipboardList, BrainCircuit, Activity, CheckCircle, AlertTriangle } from 'lucide-react';

export default function AunakDiagnostics({ lang = 'ar' }) {
  const { students } = useStudents(lang);
  const [activeScale, setActiveScale] = useState('CARS-2');

  const t = {
    ar: {
      title: 'مقاييس التشخيص والتقييم',
      subtitle: 'إدارة مقاييس (CARS-2, GARS-3, VB-MAPP) وتقرير نقطة الصفر الذكي',
      selectedStudent: 'الطالب المحدد للتقييم:',
      loading: 'جاري التحميل...',
      scaleTitle: 'مقياس',
      inProgress: 'قيد التقييم',
      rawData: 'البيانات الخام (Raw Data)',
      rawPlaceholder: 'أدخل البيانات الأولية للمقياس هنا...',
      finalScore: 'النتيجة النهائية (Final Score)',
      points: 'درجة',
      saveScore: 'حفظ نتيجة المقياس',
      zeroReport: 'تقرير نقطة الصفر (AI Zero-Point Report)',
      generateReport: 'توليد التشخيص العام',
      zeroReportBody: 'بناءً على مقاييس (CARS-2) المدمجة مع بيانات (تتبع العين) اللحظية، يُظهر الطالب طيف توحد من المستوى الثاني مع تشتت بصري عالٍ. يوصى ببدء خطة التدخل السلوكي الفردية بالتركيز على "التواصل البصري" كهدف أولي قبل الانتقال للمهارات اللفظية.',
    },
    en: {
      title: 'Diagnostics & Assessment Scales',
      subtitle: 'Manage CARS-2, GARS-3, VB-MAPP scales and AI zero-point report',
      selectedStudent: 'Selected student for assessment:',
      loading: 'Loading...',
      scaleTitle: 'Scale',
      inProgress: 'In Progress',
      rawData: 'Raw Data',
      rawPlaceholder: 'Enter initial scale data here...',
      finalScore: 'Final Score',
      points: 'points',
      saveScore: 'Save Scale Result',
      zeroReport: 'AI Zero-Point Report',
      generateReport: 'Generate General Diagnosis',
      zeroReportBody: 'Based on CARS-2 integrated with live eye-tracking data, the student shows Level 2 autism spectrum with high visual distractibility. Recommend starting individual behavioral intervention focused on eye contact before verbal skills.',
    },
  };

  const copy = t[lang] ?? t.ar;

  return (
    <div className="p-6 md:p-10 min-h-screen bg-[#050508] text-slate-200 font-sans" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <header className="mb-8 border-b border-slate-800 pb-6 flex justify-between items-center">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-fuchsia-400 flex items-center gap-3">
            <ClipboardList className="w-10 h-10" /> {copy.title}
          </h2>
          <p className="text-slate-400 mt-2 text-lg font-mono">{copy.subtitle}</p>
        </div>
      </header>

      <div className="grid lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800">
            <h3 className="text-sm text-slate-500 mb-2 font-bold">{copy.selectedStudent}</h3>
            <p className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-400" /> {students?.[0]?.name || copy.loading}
            </p>
          </div>
          
          <nav className="space-y-2">
            {['CARS-2', 'GARS-3', 'VB-MAPP'].map(scale => (
              <button 
                key={scale}
                type="button"
                onClick={() => setActiveScale(scale)}
                className={`w-full flex items-center justify-between p-4 rounded-xl border font-bold transition-all ${activeScale === scale ? 'bg-fuchsia-500/10 border-fuchsia-500/50 text-fuchsia-300 shadow-lg' : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:bg-slate-800'}`}
              >
                {scale}
                {activeScale === scale && <Activity className="w-4 h-4" />}
              </button>
            ))}
          </nav>
        </div>

        <div className="lg:col-span-3 space-y-6">
           <div className="bg-slate-900/60 p-8 rounded-3xl border border-slate-800 shadow-xl">
              <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
                 <h3 className="text-2xl font-bold text-slate-100">{copy.scaleTitle} {activeScale}</h3>
                 <span className="px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-lg text-xs font-mono font-bold">{copy.inProgress}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-6 mb-6">
                 <div>
                    <label className="text-sm text-slate-400 mb-2 block font-bold">{copy.rawData}</label>
                    <textarea className="w-full h-32 bg-slate-950 border border-slate-700 rounded-xl p-4 text-slate-300 focus:border-fuchsia-500 outline-none font-mono text-sm" placeholder={copy.rawPlaceholder}></textarea>
                 </div>
                 <div className="space-y-4">
                    <div className="p-4 bg-slate-950 rounded-xl border border-slate-700">
                       <p className="text-xs text-slate-500 mb-1 font-mono">{copy.finalScore}</p>
                       <div className="flex items-center gap-3">
                         <input type="number" className="w-24 bg-slate-900 border border-slate-600 rounded-lg p-2 text-xl font-bold text-white text-center outline-none focus:border-fuchsia-500" placeholder="0" />
                         <span className="text-sm text-slate-400">{copy.points}</span>
                       </div>
                    </div>
                    <button type="button" className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-all border border-slate-600">
                       {copy.saveScore}
                    </button>
                 </div>
              </div>
           </div>

           <div className="bg-fuchsia-900/10 p-8 rounded-3xl border border-fuchsia-500/20 shadow-[0_0_30px_rgba(217,70,239,0.05)]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-fuchsia-300 flex items-center gap-2"><BrainCircuit className="w-6 h-6" /> {copy.zeroReport}</h3>
                <button type="button" className="px-4 py-2 bg-fuchsia-600 hover:bg-fuchsia-500 text-white rounded-lg text-sm font-bold transition-all shadow-lg">{copy.generateReport}</button>
              </div>
              <p className="text-md text-fuchsia-200/80 leading-relaxed bg-fuchsia-950/50 p-5 rounded-xl border border-fuchsia-500/30 flex gap-4 items-start">
                 <AlertTriangle className="w-6 h-6 text-fuchsia-400 shrink-0 mt-1" />
                 {copy.zeroReportBody}
              </p>
           </div>
        </div>
      </div>
    </div>
  );
}
