import { useStudents } from '../hooks/useStudents';
import { FileText, BrainCircuit, ShieldCheck, Lock } from 'lucide-react';

export default function AunakSessionRegistry({ lang = 'ar' }) {
  const { students } = useStudents(lang);

  const t = {
    ar: {
      title: 'سجل الجلسات الذكي',
      subtitle: 'القلب النابض للمنصة - إدارة 66 حقل بيانات سريرية ومالية مع التشفير السيادي',
      liveSession: 'الجلسة السريرية الحية',
      liveRec: '● LIVE REC',
      beneficiary: 'الطالب المستفيد',
      connecting: 'جاري الاتصال بـ Airtable...',
      startTime: 'وقت البدء التلقائي',
      notesLabel: 'ملاحظات الجلسة السريرية (نص حر)',
      notesPlaceholder: 'قم بتوثيق أحداث الجلسة، الاستجابات، وأي تغيرات سلوكية هنا...',
      aiReport: 'التقرير المختصر بالذكاء الاصطناعي',
      aiReportBody: 'بناءً على المعطيات السريرية اللحظية ومؤشر (درجة التناغم)، أظهر الطالب تفاعلاً عالياً مع المحفزات البصرية. لم يتم تسجيل أي تجاوز لحدود الخطر (Crisis Score)، ولم يُرصد شرود ذهني يكسر (حياد النظرة). يُنصح بتصعيد الأهداف الأكاديمية للمستوى التالي في الجلسة القادمة.',
      security: 'بروتوكولات الأمان السيادية',
      attachmentEncryption: 'تشفير المرفقات',
      mirrorSync: 'قاعدة النسخ المرآتي',
      hiddenFields: 'الحقول المالية والمخفية',
      stealthMode: 'تم تفعيل "وضع التخفي"\nالبيانات محجوبة عن الأخصائي',
      sessionFee: 'مستحقات الجلسة',
      paymentStatus: 'حالة الدفع',
      paid: 'مكتمل',
      encryptButton: 'تشفير واعتماد الجلسة',
    },
    en: {
      title: 'Smart Session Registry',
      subtitle: 'Platform core — 66 clinical and financial fields with sovereign encryption',
      liveSession: 'Live Clinical Session',
      liveRec: '● LIVE REC',
      beneficiary: 'Beneficiary Student',
      connecting: 'Connecting to Airtable...',
      startTime: 'Auto Start Time',
      notesLabel: 'Clinical Session Notes (free text)',
      notesPlaceholder: 'Document session events, responses, and behavioral changes here...',
      aiReport: 'AI Executive Summary',
      aiReportBody: 'Based on live clinical data and the Harmony Score, the student showed high engagement with visual stimuli. No crisis threshold breach was recorded and no gaze drift beyond neutral was detected. Recommend escalating academic goals in the next session.',
      security: 'Sovereign Security Protocols',
      attachmentEncryption: 'Attachment Encryption',
      mirrorSync: 'Mirror Sync Rule',
      hiddenFields: 'Financial & Hidden Fields',
      stealthMode: 'Stealth mode active\nData hidden from specialist',
      sessionFee: 'Session Fee',
      paymentStatus: 'Payment Status',
      paid: 'Completed',
      encryptButton: 'Encrypt & Approve Session',
    },
  };

  const copy = t[lang] ?? t.ar;

  return (
    <div className="p-6 md:p-10 min-h-screen bg-[#050508] text-slate-200 font-sans" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <header className="mb-8 border-b border-slate-800 pb-6">
        <h2 className="text-3xl md:text-4xl font-bold text-indigo-400 flex items-center gap-3">
          <FileText className="w-10 h-10" /> {copy.title}
        </h2>
        <p className="text-slate-400 mt-2 text-lg font-mono">{copy.subtitle}</p>
      </header>

      <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
        <div className="lg:col-span-2 space-y-6">
           <div className="bg-slate-900/60 p-8 rounded-3xl border border-slate-800 shadow-xl">
              <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
                 <h3 className="text-xl font-bold text-slate-100">{copy.liveSession}</h3>
                 <span className="px-3 py-1 bg-rose-500/10 text-rose-400 border border-rose-500/30 rounded-lg text-xs font-mono animate-pulse font-bold">{copy.liveRec}</span>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-6">
                 <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                    <p className="text-xs text-slate-500 mb-1 font-mono">{copy.beneficiary}</p>
                    <p className="font-bold text-slate-200 text-lg">{students?.[0]?.name || copy.connecting}</p>
                 </div>
                 <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                    <p className="text-xs text-slate-500 mb-1 font-mono">{copy.startTime}</p>
                    <p className="font-mono text-emerald-400 text-lg">09:00 AM</p>
                 </div>
              </div>
              <div className="space-y-4">
                 <div>
                    <label className="text-sm text-slate-400 mb-2 block font-bold">{copy.notesLabel}</label>
                    <textarea className="w-full h-32 bg-slate-950 border border-slate-800 rounded-xl p-4 text-slate-300 focus:border-indigo-500 outline-none" placeholder={copy.notesPlaceholder}></textarea>
                 </div>
              </div>
           </div>

           <div className="bg-indigo-900/10 p-8 rounded-3xl border border-indigo-500/20 shadow-[0_0_30px_rgba(99,102,241,0.05)]">
              <h3 className="text-xl font-bold text-indigo-300 mb-4 flex items-center gap-2"><BrainCircuit className="w-6 h-6" /> {copy.aiReport}</h3>
              <p className="text-md text-indigo-200/80 leading-relaxed bg-indigo-950/50 p-5 rounded-xl border border-indigo-500/30">
                 {copy.aiReportBody}
              </p>
           </div>
        </div>

        <div className="space-y-6">
           <div className="bg-slate-900/60 p-6 rounded-3xl border border-slate-800">
              <h3 className="text-md font-bold text-slate-300 mb-5 flex items-center gap-2 border-b border-slate-800 pb-3"><ShieldCheck className="w-5 h-5 text-emerald-400" /> {copy.security}</h3>
              <div className="space-y-3">
                 <div className="flex justify-between items-center p-4 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="text-sm text-slate-400">{copy.attachmentEncryption}</span>
                    <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">AES-256 SECURED</span>
                 </div>
                 <div className="flex justify-between items-center p-4 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="text-sm text-slate-400">{copy.mirrorSync}</span>
                    <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-2 py-1 rounded">SYNC ACTIVE</span>
                 </div>
              </div>
           </div>

           <div className="bg-slate-900/60 p-6 rounded-3xl border border-slate-800">
              <h3 className="text-md font-bold text-slate-300 mb-5 flex items-center gap-2 border-b border-slate-800 pb-3"><Lock className="w-5 h-5 text-amber-400" /> {copy.hiddenFields}</h3>
              <div className="p-5 bg-slate-950 rounded-xl border border-slate-800 relative overflow-hidden group cursor-not-allowed">
                 <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm flex flex-col items-center justify-center z-10 border border-slate-700 rounded-xl transition-all duration-300">
                    <Lock className="w-6 h-6 text-slate-500 mb-2" />
                    <span className="text-xs font-bold text-slate-400 text-center px-4 whitespace-pre-line">{copy.stealthMode}</span>
                 </div>
                 <div className="space-y-3 opacity-20">
                    <div className="flex justify-between text-sm">
                       <span className="text-slate-500">{copy.sessionFee}</span>
                       <span className="font-mono text-amber-400">$120</span>
                    </div>
                    <div className="flex justify-between text-sm">
                       <span className="text-slate-500">{copy.paymentStatus}</span>
                       <span className="font-mono text-emerald-400">{copy.paid}</span>
                    </div>
                 </div>
              </div>
           </div>

           <button type="button" className="w-full py-4 mt-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold text-lg transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)]">
              {copy.encryptButton}
           </button>
        </div>
      </div>
    </div>
  );
}
