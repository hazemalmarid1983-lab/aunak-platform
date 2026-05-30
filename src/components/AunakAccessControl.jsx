import { useState } from 'react';
import { ShieldCheck, Key, Users, Lock, Server, BrainCircuit, EyeOff } from 'lucide-react';
import { useAirtableData } from '../hooks/useAirtableData';
import { AIRTABLE_TABLES } from '../lib/airtableTables';
import { mapAccessUser } from '../lib/airtableMappers';
import { AirtableEmpty, AirtableErrorBanner, AirtableLoading } from './AirtableStatus';

export default function AunakAccessControl({ lang = 'ar' }) {
  const [stealthMode, setStealthMode] = useState(false);
  const { records: users, loading, error, isEmpty } = useAirtableData(AIRTABLE_TABLES.accessControl, {
    mapRecord: mapAccessUser,
    lang,
  });

  const t = {
    ar: {
      title: 'التحكم في صلاحيات الوصول (السيادة)',
      subtitle: 'بيانات حية من Airtable',
      disableStealth: 'إيقاف وضع التخفي',
      enableStealth: 'تفعيل وضع التخفي',
      userManagement: 'إدارة المستخدمين والصلاحيات',
      lastLogin: (v) => `آخر دخول: ${v}`,
      aiTitle: 'مناطق الوصول الذكية ورابط الاختفاء الذاتي (AI)',
      aiBody: 'يتم تحليل سلوكيات الوصول برمجياً. في حال استشعار أي دخول غير مصرح به لبيانات مشفرة، يقوم الذكاء الاصطناعي بتوليد "رابط اختفاء ذاتي" ينهي الجلسة ويقفل السجل فوراً.',
      stealthOn: 'الوضع الحالي: التخفي مفعل، الحقول المالية والإدارية محجوبة عن الأخصائيين.',
      stealthOff: 'الوضع الحالي: شفافية كاملة للمصرح لهم.',
      serverProtocols: 'بروتوكولات الخوادم',
      militaryEncryption: 'التشفير العسكري',
      mirrorSync: 'النسخ المرآتي اللحظي',
      auditLogs: 'استخراج سجل التدقيق (Audit Logs)',
    },
    en: {
      title: 'Access Control (Sovereign)',
      subtitle: 'Live data from Airtable',
      disableStealth: 'Disable Stealth Mode',
      enableStealth: 'Enable Stealth Mode',
      userManagement: 'User & Permission Management',
      lastLogin: (v) => `Last login: ${v}`,
      aiTitle: 'Smart Access Zones & Self-Destruct Link (AI)',
      aiBody: 'Access behavior is analyzed programmatically. If unauthorized access to encrypted data is detected, AI generates a self-destruct link that terminates the session and locks the record immediately.',
      stealthOn: 'Current mode: Stealth active — financial and admin fields hidden from specialists.',
      stealthOff: 'Current mode: Full transparency for authorized users.',
      serverProtocols: 'Server Protocols',
      militaryEncryption: 'Military-Grade Encryption',
      mirrorSync: 'Real-Time Mirror Sync',
      auditLogs: 'Export Audit Logs',
    },
  };

  const copy = t[lang] ?? t.ar;

  return (
    <div className="p-6 md:p-10 min-h-screen bg-[#050508] text-slate-200 font-sans" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <header className="mb-8 border-b border-slate-800 pb-6 flex justify-between items-center">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-amber-400 flex items-center gap-3">
            <ShieldCheck className="w-10 h-10" /> {copy.title}
          </h2>
          <p className="text-slate-400 mt-2 text-lg font-mono">{copy.subtitle}</p>
        </div>
        <button 
          type="button"
          onClick={() => setStealthMode(!stealthMode)}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold transition-all ${stealthMode ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-[0_0_20px_rgba(225,29,72,0.4)]' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'}`}
        >
          {stealthMode ? <EyeOff className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
          {stealthMode ? copy.disableStealth : copy.enableStealth}
        </button>
      </header>

      <AirtableErrorBanner error={error} />

      <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
        <div className="lg:col-span-2 space-y-6">
           <div className="bg-slate-900/60 p-8 rounded-3xl border border-slate-800 shadow-xl">
              <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
                 <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2"><Users className="w-6 h-6 text-amber-400" /> {copy.userManagement}</h3>
              </div>
              
              {loading ? (
                <AirtableLoading lang={lang} />
              ) : isEmpty ? (
                <AirtableEmpty lang={lang} />
              ) : (
              <div className="space-y-4">
                 {users.map(user => (
                    <div key={user.id} className="p-5 bg-slate-950 rounded-2xl border border-slate-800 flex justify-between items-center hover:border-amber-500/30 transition-colors">
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-xl">
                             {(user.name || '?').charAt(0)}
                          </div>
                          <div>
                             <h4 className="text-md font-bold text-slate-200">{user.name}</h4>
                             <p className="text-xs text-slate-500 mt-1 font-mono">{user.email} • {user.role}</p>
                          </div>
                       </div>
                       <div className="flex flex-col items-end gap-2">
                          <span className="px-3 py-1 bg-slate-800 text-slate-300 rounded-lg text-xs font-bold">{user.access}</span>
                          <span className="text-[10px] text-slate-500 font-mono">{copy.lastLogin(user.lastLogin)}</span>
                       </div>
                    </div>
                 ))}
              </div>
              )}
           </div>

           <div className="bg-amber-900/10 p-8 rounded-3xl border border-amber-500/20 shadow-[0_0_30px_rgba(245,158,11,0.05)]">
              <h3 className="text-xl font-bold text-amber-300 mb-4 flex items-center gap-2"><BrainCircuit className="w-6 h-6" /> {copy.aiTitle}</h3>
              <p className="text-md text-amber-200/80 leading-relaxed bg-amber-950/50 p-5 rounded-xl border border-amber-500/30">
                 {copy.aiBody}
                 <br/><br/>
                 <span className={`font-bold ${stealthMode ? 'text-rose-400' : 'text-emerald-400'}`}>
                   {stealthMode ? copy.stealthOn : copy.stealthOff}
                 </span>
              </p>
           </div>
        </div>

        <div className="space-y-6">
           <div className="bg-slate-900/60 p-6 rounded-3xl border border-slate-800">
              <h3 className="text-md font-bold text-slate-300 mb-5 flex items-center gap-2 border-b border-slate-800 pb-3"><Server className="w-5 h-5 text-cyan-400" /> {copy.serverProtocols}</h3>
              <div className="space-y-3">
                 <div className="flex justify-between items-center p-4 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="text-sm text-slate-400">{copy.militaryEncryption}</span>
                    <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">AES-256</span>
                 </div>
                 <div className="flex justify-between items-center p-4 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="text-sm text-slate-400">{copy.mirrorSync}</span>
                    <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-2 py-1 rounded">ACTIVE</span>
                 </div>
              </div>
           </div>
           <button type="button" className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-bold text-sm transition-all border border-slate-700 shadow-lg flex justify-center items-center gap-2">
              <Key className="w-4 h-4" /> {copy.auditLogs}
           </button>
        </div>
      </div>
    </div>
  );
}
