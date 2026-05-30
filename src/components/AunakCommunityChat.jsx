import { useState, useEffect } from 'react';
import { ShieldAlert, Send, ShieldCheck, UserCircle2, UserCheck } from 'lucide-react';
import { useStudents } from '../hooks/useStudents';
import Sidebar from './Sidebar';
import PlatformLogo from './PlatformLogo';

export default function AunakCommunityChat({ lang = 'ar' }) {
  const { students, loading: studentsLoading, error: studentsError, refetch } = useStudents(lang);
  const studentList = Array.isArray(students) ? students : [];
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [message, setMessage] = useState("");
  const [isBlocked, setIsBlocked] = useState(false);

  const t = {
    ar: {
      title: 'مجتمع عونك',
      subtitle: 'الصدقة الجارية - الدعم التكافلي',
      moderator: 'الرقيب الذكي نشط',
      privacyBanner: 'لحماية أطفالنا: يمنع الرقيب الآلي مشاركة الأسماء، التشخيصات الطبية، أو بيانات التواصل.',
      you: 'أنت',
      placeholder: 'اكتب رسالتك هنا...',
      securityAlert: 'تنبيه أمني: اكتشف الرقيب الذكي بيانات حساسة. يرجى مسحها.',
      initialChat: [
        { id: 1, sender: "أم محمد", role: "parent", text: "السلام عليكم، طفلي عمره 3 سنوات وما زال لا يتكلم بوضوح. هل هذا طبيعي؟", time: "09:21 AM" },
        { id: 2, sender: "د. سارة المنصوري", role: "specialist", text: "وعليكم السلام! في عمر الثلاث سنوات يُتوقع جملاً من 3-4 كلمات. تواصلي مع أخصائي عبر قسم التقييم.", time: "09:23 AM" },
        { id: 3, sender: "Parent Ahmed", role: "parent", text: "My daughter started speech therapy last month — already seeing improvements! 🙏", time: "09:31 AM" },
      ],
    },
    en: {
      title: 'Aunak Community',
      subtitle: 'Ongoing charity — peer support network',
      moderator: 'Smart Moderator Active',
      privacyBanner: 'To protect our children: the AI moderator blocks names, medical diagnoses, and contact details.',
      you: 'You',
      placeholder: 'Type your message here...',
      securityAlert: 'Security alert: sensitive data detected. Please remove it.',
      initialChat: [
        { id: 1, sender: "Umm Mohammed", role: "parent", text: "Hello, my child is 3 and still not speaking clearly. Is this normal?", time: "09:21 AM" },
        { id: 2, sender: "Dr. Sara Al-Mansouri", role: "specialist", text: "Hello! At age three, 3–4 word sentences are expected. Contact a specialist through the assessment section.", time: "09:23 AM" },
        { id: 3, sender: "Parent Ahmed", role: "parent", text: "My daughter started speech therapy last month — already seeing improvements! 🙏", time: "09:31 AM" },
      ],
    },
  };

  const copy = t[lang] ?? t.ar;
  const [chatLogs, setChatLogs] = useState(() => (t[lang] ?? t.ar).initialChat);

  useEffect(() => {
    setChatLogs((t[lang] ?? t.ar).initialChat);
  }, [lang]);

  const SENSITIVE_PATTERNS = [
    /\b(اسم[ي ه]|اسم الطفل|طفل[ي ه]|ابن[ي ه]|بنت[ي ه])\b/i,
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
    <div dir={lang === 'ar' ? 'rtl' : 'ltr'} className="min-h-screen bg-[#050508] text-slate-100 font-sans p-4 md:p-8">
      <header className="max-w-6xl mx-auto mb-8 flex items-center justify-between border-b border-slate-800 pb-6">
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

      <div className="max-w-6xl mx-auto flex gap-4 h-[600px]">
        <Sidebar
          lang={lang}
          students={studentList}
          loading={studentsLoading}
          error={studentsError}
          refetch={refetch}
          selectedStudentId={selectedStudentId}
          onSelectStudent={setSelectedStudentId}
        />

      <main className="flex-1 bg-slate-900/60 backdrop-blur border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col min-w-0">
        <div className="bg-slate-800/50 p-4 border-b border-slate-800 flex items-center gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-400" />
          <p className="text-sm text-amber-200">{copy.privacyBanner}</p>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {chatLogs.map(log => (
            <div key={log.id} className={`flex gap-4 ${log.sender === copy.you ? "flex-row-reverse" : ""}`}>
              <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center shrink-0 border border-slate-700">
                {log.role === "specialist" ? <UserCheck className="w-5 h-5 text-cyan-400" /> : <UserCircle2 className="w-5 h-5 text-slate-400" />}
              </div>
              <div className={`max-w-[80%] ${log.sender === copy.you ? (lang === 'ar' ? 'text-left' : 'text-right') : (lang === 'ar' ? 'text-right' : 'text-left')}`}>
                <div className={`flex items-center gap-2 mb-1 ${lang === 'ar' ? 'justify-end flex-row-reverse' : 'justify-start'}`}>
                  <span className="text-xs text-slate-500">{log.time}</span>
                  <span className={`text-sm font-bold ${log.role === "specialist" ? "text-cyan-400" : "text-amber-400"}`}>{log.sender}</span>
                </div>
                <div className={`p-4 rounded-2xl ${log.sender === copy.you ? "bg-cyan-600/20 border border-cyan-500/30 text-cyan-50" : "bg-slate-800 border border-slate-700 text-slate-200"}`}>
                  {log.text}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-950">
          <div className="relative flex items-center gap-4">
            <input
              type="text"
              value={message}
              onChange={handleTextChange}
              placeholder={copy.placeholder}
              className={`flex-1 bg-slate-900 border ${isBlocked ? 'border-rose-500 focus:ring-rose-500/20' : 'border-slate-700 focus:ring-cyan-500/20'} rounded-xl px-4 py-3 text-slate-100 outline-none focus:ring-2 transition-all`}
            />
            <button
              type="button"
              onClick={handleSendMessage}
              disabled={isBlocked || !message.trim()}
              className={`p-3 rounded-xl flex items-center justify-center transition-all ${isBlocked || !message.trim() ? 'bg-slate-800 text-slate-600' : 'bg-cyan-500 text-slate-950 hover:bg-cyan-400'}`}
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
