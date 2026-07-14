import { useState } from 'react';
import { ShieldAlert, Send, ShieldCheck, UserCircle2, UserCheck } from 'lucide-react';
import { useStudents } from '../hooks/useStudents';
import Sidebar from './Sidebar';
import PlatformLogo from './PlatformLogo';
import { LUX } from '../lib/luxTheme.js';

export default function AunakCommunityChat({ lang = 'ar' }) {
  const { students, loading: studentsLoading, error: studentsError, refetch } = useStudents(lang);
  const studentList = Array.isArray(students) ? students : [];
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [message, setMessage] = useState("");
  const [isBlocked, setIsBlocked] = useState(false);

  const t = {
    ar: {
      title: 'منتدى الدعم الأسري ومجتمع التمكين المشترك',
      subtitle: 'الصدقة الجارية - الدعم التكافلي الأسري',
      moderator: 'الرقيب الذكي نشط',
      privacyBanner: 'لحماية مستفيدينا: يمنع الرقيب الآلي مشاركة الأسماء، التشخيصات الطبية، أو بيانات التواصل.',
      you: 'أنت',
      placeholder: 'اكتب مشاركتك في منتدى الدعم هنا...',
      securityAlert: 'تنبيه أمني: اكتشف الرقيب الذكي بيانات حساسة. يرجى مسحها.',
      emptyChat: 'لا توجد مشاركات بعد — ابدأ أول مشاركة في منتدى الدعم.',
    },
    en: {
      title: 'Family Support Forum & Shared Empowerment Community',
      subtitle: 'Ongoing charity — peer family support network',
      moderator: 'Smart Moderator Active',
      privacyBanner: 'To protect our beneficiaries: the AI moderator blocks names, medical diagnoses, and contact details.',
      you: 'You',
      placeholder: 'Share in the family support forum...',
      securityAlert: 'Security alert: sensitive data detected. Please remove it.',
      emptyChat: 'No posts yet — start the first forum contribution.',
    },
  };

  const copy = t[lang] ?? t.ar;
  const [chatLogs, setChatLogs] = useState([]);

  const SENSITIVE_PATTERNS = [
    /\b(اسم[ي ه]|اسم المستفيد|اسم الطفل|طفل[ي ه]|ابن[ي ه]|بنت[ي ه]|مستفيد[ي ه])\b/i,
    /\b(تقرير|تشخيص|نتيجة فحص|خطة علاجية)\b/i,
    /\b(my child|my son|my daughter|[A-Z][a-z]+ is \d+ years)\b/i,
    /\b(diagnosis|assessment report|clinical data)\b/i,
    /[\w.+-]+@[\w.-]+\.[a-z]{2,}/i,
    /\+?[\d\s\-\(\).]{9,}/g,
  ];

  const handleTextChange = (e) => {
    const text = e.target.value;
    setMessage(text);
    const blocked = SENSITIVE_PATTERNS.some(p => p.test(text));
    setIsBlocked(blocked);
  };

  const handleSendMessage = () => {
    if (isBlocked || !message.trim()) return;
    setChatLogs([...chatLogs, { id: Date.now(), sender: copy.you, role: "parent", text: message, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }]);
    setMessage("");
  };

  return (
    <div dir={lang === 'ar' ? 'rtl' : 'ltr'} className="min-h-screen bg-[#0a0a0c] text-slate-300 font-sans p-4 md:p-8">
      <header className="max-w-6xl mx-auto mb-8 flex items-center justify-between border-b border-[#c9a962]/15 pb-6">
        <div className="flex items-center gap-4">
          <PlatformLogo lang={lang} className="w-16 h-20 rounded-2xl" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-l from-amber-300 to-cyan-300 bg-clip-text text-transparent">{copy.title}</h1>
            <p className="text-sm text-slate-400 mt-1">{copy.subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-emerald-400 text-sm font-bold">
          <ShieldCheck className="w-4 h-4" /> {copy.moderator}
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        </div>
      </header>

      <div className="max-w-6xl mx-auto flex gap-4 h-[min(600px,calc(100vh-12rem))] min-h-0">
        <Sidebar
          lang={lang}
          students={studentList}
          loading={studentsLoading}
          error={studentsError}
          refetch={refetch}
          selectedStudentId={selectedStudentId}
          onSelectStudent={setSelectedStudentId}
          className="self-stretch"
        />

      <main className="flex-1 min-w-0 min-h-0 relative z-0 bg-[#12121a]/70 backdrop-blur-xl border border-[#c9a962]/15 shadow-[0_0_48px_rgba(201,169,98,0.1)] rounded-2xl overflow-hidden flex flex-col">
        <div className="bg-[#12121a]/55 backdrop-blur-xl p-4 border-b border-[#c9a962]/15 flex items-center gap-3">
          <ShieldAlert className="w-5 h-5 text-[#d4af37]" />
          <p className="text-sm text-amber-200">{copy.privacyBanner}</p>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {chatLogs.length === 0 ? (
            <p className="text-center text-slate-500 text-sm py-16">{copy.emptyChat}</p>
          ) : (
          chatLogs.map(log => (
            <div key={log.id} className={`flex gap-4 ${log.sender === copy.you ? "flex-row-reverse" : ""}`}>
              <div className="w-10 h-10 rounded-full bg-[#12121a]/70 flex items-center justify-center shrink-0 border border-white/[0.08]">
                {log.role === "specialist" ? <UserCheck className="w-5 h-5 text-emerald-400" /> : <UserCircle2 className="w-5 h-5 text-slate-400" />}
              </div>
              <div className={`max-w-[80%] ${log.sender === copy.you ? (lang === 'ar' ? 'text-left' : 'text-right') : (lang === 'ar' ? 'text-right' : 'text-left')}`}>
                <div className={`flex items-center gap-2 mb-1 ${lang === 'ar' ? 'justify-end flex-row-reverse' : 'justify-start'}`}>
                  <span className="text-xs text-slate-500">{log.time}</span>
                  <span className={`text-sm font-bold ${log.role === "specialist" ? "text-emerald-400" : "text-[#d4af37]"}`}>{log.sender}</span>
                </div>
                <div className={`p-4 rounded-2xl ${log.sender === copy.you ? "bg-cyan-600/20 border border-emerald-400/30 text-cyan-50" : "bg-[#12121a]/70 border border-white/[0.08] text-slate-200"}`}>
                  {log.text}
                </div>
              </div>
            </div>
          ))
          )}
        </div>

        <div className="p-4 border-t border-[#c9a962]/15 bg-[#0d0d10]/90">
          <div className="relative flex items-center gap-4">
            <input
              type="text"
              value={message}
              onChange={handleTextChange}
              placeholder={copy.placeholder}
              className={`flex-1 bg-slate-900 border ${isBlocked ? 'border-rose-500 focus:ring-rose-500/20' : 'border-white/[0.08] focus:ring-cyan-500/20'} rounded-xl px-4 py-3 text-slate-300 outline-none focus:ring-2 transition-all`}
            />
            <button
              type="button"
              onClick={handleSendMessage}
              disabled={isBlocked || !message.trim()}
              className={`p-3 rounded-xl flex items-center justify-center transition-all ${isBlocked || !message.trim() ? 'bg-[#12121a]/70 text-slate-600' : 'bg-emerald-500 text-slate-950 hover:bg-cyan-400'}`}
            >
              <Send className="w-5 h-5" />
            </button>
            {isBlocked && (
              <div className={`absolute -top-12 ${lang === 'ar' ? 'right-0' : 'left-0'} bg-rose-500/10 border border-rose-500/50 text-rose-400 text-xs px-3 py-2 rounded-lg flex items-center gap-2 animate-bounce font-bold`}>
                <ShieldAlert className="w-4 h-4" /> {copy.securityAlert}
              </div>
            )}
          </div>
        </div>
      </main>
      </div>
    </div>
  );
}
