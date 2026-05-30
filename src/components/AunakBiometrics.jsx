import { useState } from 'react';
import { ScanFace, Fingerprint, Activity, ShieldCheck, CheckCircle2 } from 'lucide-react';
import PlatformLogo from './PlatformLogo';

export default function AunakBiometrics({ lang = 'ar' }) {
  const [scanState, setScanState] = useState('idle');
  const [moodHistory, setMoodHistory] = useState([]);

  const t = {
    ar: {
      title: 'نظام البصمة الحيوية',
      subtitle: 'التعرف البيومتري واسترجاع الذاكرة المزاجية',
      encrypted: 'اتصال مشفر (AES-256)',
      cameraActive: 'كاميرا الذكاء الاصطناعي نشطة',
      waiting: 'بانتظار جلوس الطفل',
      waitingHint: 'يرجى توجيه وجه الطفل نحو الكاميرا لبدء التعرف',
      startScan: 'بدء المسح البيومتري',
      scanning: 'جاري تعريف معالم الوجه...',
      matching: 'مطابقة المعرف عبر 16 قاعدة بيانات...',
      success: 'تم التعرف بنجاح',
      studentId: 'هوية الطالب',
      studentSample: 'عبدالله - المستوى 1 ASD',
      childCode: 'كود الطفل',
      moodHistory: 'استرجاع آخر 5 حالات مزاجية',
      engagement: 'التفاعل',
      aiTip: 'توصية الذكاء الاصطناعي:',
      aiBody: 'بناءً على القراءات، يُنصح بالبدء بجلسة "النمط الهادئ".',
      scanPrompt: 'قم بتفعيل الماسح البيومتري لاسترجاع بيانات الطفل',
      moods: [
        { id: 1, mood: 'مبتسم ومتفاعل 😊', date: 'اليوم - 09:00 صباحاً', score: 95 },
        { id: 2, mood: 'هادئ ومسترخي 😌', date: 'أمس - 10:30 ص', score: 80 },
        { id: 3, mood: 'متوتر / انزعاج حسي 😟', date: 'منذ يومين - 11:15 ص', score: 40 },
        { id: 4, mood: 'متحمس ونشط 🤩', date: 'منذ 3 أيام - 09:20 ص', score: 88 },
        { id: 5, mood: 'معتدل 😌', date: 'منذ 4 أيام - 12:00 م', score: 75 },
      ],
    },
    en: {
      title: 'Biometric ID System',
      subtitle: 'Biometric recognition and mood memory retrieval',
      encrypted: 'Encrypted connection (AES-256)',
      cameraActive: 'AI camera active',
      waiting: 'Waiting for child to sit',
      waitingHint: 'Please direct the child\'s face toward the camera to begin recognition',
      startScan: 'Start Biometric Scan',
      scanning: 'Mapping facial landmarks...',
      matching: 'Matching ID across 16 databases...',
      success: 'Recognition successful',
      studentId: 'Student Identity',
      studentSample: 'Abdullah — Level 1 ASD',
      childCode: 'Child Code',
      moodHistory: 'Retrieve Last 5 Mood States',
      engagement: 'Engagement',
      aiTip: 'AI Recommendation:',
      aiBody: 'Based on readings, start with a "Calm Pattern" session.',
      scanPrompt: 'Activate the biometric scanner to retrieve child data',
      moods: [
        { id: 1, mood: 'Smiling & engaged 😊', date: 'Today — 09:00 AM', score: 95 },
        { id: 2, mood: 'Calm & relaxed 😌', date: 'Yesterday — 10:30 AM', score: 80 },
        { id: 3, mood: 'Anxious / sensory distress 😟', date: '2 days ago — 11:15 AM', score: 40 },
        { id: 4, mood: 'Excited & active 🤩', date: '3 days ago — 09:20 AM', score: 88 },
        { id: 5, mood: 'Moderate 😌', date: '4 days ago — 12:00 PM', score: 75 },
      ],
    },
  };

  const copy = t[lang] ?? t.ar;

  const startScan = () => {
    setScanState('scanning');
    setTimeout(() => {
      setScanState('success');
      setMoodHistory(copy.moods);
    }, 3500);
  };

  return (
    <div dir={lang === 'ar' ? 'rtl' : 'ltr'} className="min-h-screen bg-[#050508] text-slate-100 p-4 md:p-8 font-sans">
      <header className="max-w-6xl mx-auto mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div className="flex items-center gap-4">
          <PlatformLogo lang={lang} className="w-16 h-20 rounded-2xl shadow-[0_0_30px_-10px_rgba(34,211,238,0.4)]" />
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-l from-amber-400 to-cyan-400 bg-clip-text text-transparent">{copy.title}</h1>
            <p className="text-sm text-slate-400 mt-1">{copy.subtitle}</p>
          </div>
        </div>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm font-medium">
          <ShieldCheck className="w-4 h-4" /> {copy.encrypted}
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        </div>
      </header>

      <main className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-6">
        <section className="bg-slate-900/60 backdrop-blur border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" /> {copy.cameraActive}
            </div>
            <div className="text-xs text-slate-500 font-mono">CAM - 01 · 1080p</div>
          </div>

          <div className="relative aspect-square w-full rounded-xl overflow-hidden border border-slate-800 bg-slate-950 flex items-center justify-center">
            <span className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-cyan-400/70" />
            <span className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-cyan-400/70" />
            <span className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-cyan-400/70" />
            <span className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-cyan-400/70" />

            {scanState === 'idle' && (
              <div className="text-center px-6">
                <div className="w-24 h-24 mx-auto mb-5 rounded-full bg-slate-800/60 border border-slate-700 flex items-center justify-center">
                  <ScanFace className="w-12 h-12 text-slate-400" strokeWidth={1.4} />
                </div>
                <h3 className="text-xl font-bold text-slate-100 mb-2">{copy.waiting}</h3>
                <p className="text-sm text-slate-400 mb-6 max-w-xs mx-auto">{copy.waitingHint}</p>
                <button type="button" onClick={startScan} className="px-6 py-3 rounded-xl bg-gradient-to-l from-amber-500 to-amber-400 text-slate-950 font-bold hover:scale-[1.02] transition-all">
                  {copy.startScan}
                </button>
              </div>
            )}

            {scanState === 'scanning' && (
              <div className="text-center w-full px-6">
                <div className="relative w-40 h-40 mx-auto mb-6">
                  <div className="absolute inset-0 rounded-full border-2 border-cyan-400/30 animate-ping" />
                  <div className="absolute inset-3 rounded-full border-2 border-cyan-400/50" />
                  <div className="absolute inset-6 rounded-full border border-amber-400/40" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <ScanFace className="w-16 h-16 text-cyan-300" strokeWidth={1.5} />
                  </div>
                  <div className="absolute left-0 right-0 h-0.5 bg-cyan-400 shadow-[0_0_15px_2px_rgba(34,211,238,0.7)]" style={{ animation: 'scan 2s linear infinite' }} />
                </div>
                <h3 className="text-lg font-semibold text-cyan-300 mb-1">{copy.scanning}</h3>
                <p className="text-xs text-slate-400 font-mono">{copy.matching}</p>
              </div>
            )}

            {scanState === 'success' && (
              <div className="text-center w-full px-6">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400" strokeWidth={2} />
                </div>
                <h3 className="text-xl font-bold text-emerald-300 mb-5">{copy.success}</h3>
                <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto text-right">
                  <div className="rounded-lg bg-slate-800/60 border border-slate-700 p-3">
                    <p className="text-[11px] text-slate-400 mb-1">{copy.studentId}</p>
                    <p className="text-sm font-bold text-slate-100">{copy.studentSample}</p>
                  </div>
                  <div className="rounded-lg bg-slate-800/60 border border-slate-700 p-3">
                    <p className="text-[11px] text-slate-400 mb-1">{copy.childCode}</p>
                    <p className="text-sm font-bold font-mono text-amber-300">AUN-4821</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="bg-slate-900/60 backdrop-blur border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-2 mb-5 pb-4 border-b border-slate-800">
            <Activity className="w-5 h-5 text-amber-400" />
            <h3 className="text-lg font-bold text-slate-100">{copy.moodHistory}</h3>
          </div>

          {scanState === 'success' ? (
            <div className="space-y-3">
              {moodHistory.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 rounded-xl bg-slate-800/40 border border-slate-700/60">
                  <div>
                    <p className="text-sm font-semibold text-slate-100">{item.mood}</p>
                    <p className="text-xs text-slate-400">{item.date}</p>
                  </div>
                  <div className="text-left">
                    <p className={`text-xl font-bold ${item.score > 80 ? 'text-emerald-400' : item.score > 50 ? 'text-amber-400' : 'text-rose-400'}`}>
                      {item.score}%
                    </p>
                    <p className="text-[10px] text-slate-500">{copy.engagement}</p>
                  </div>
                </div>
              ))}
              <div className="mt-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-sm text-amber-100/90 leading-relaxed">
                💡 <span className="font-semibold text-amber-300">{copy.aiTip}</span> {copy.aiBody}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center py-16 px-6">
              <Fingerprint className="w-14 h-14 text-slate-600 mb-4" strokeWidth={1.3} />
              <p className="text-sm text-slate-400 max-w-xs">{copy.scanPrompt}</p>
            </div>
          )}
        </section>
      </main>
      <style>{`
        @keyframes scan {
          0% { top: 0; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}</style>
    </div>
  );
}
