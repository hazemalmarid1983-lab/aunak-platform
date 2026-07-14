import { useState, useEffect, useMemo } from 'react';
import { ShieldCheck, Key, Users, Lock, Server, BrainCircuit, EyeOff, Map, HandMetal, Loader2 } from 'lucide-react';
import { useAirtableData } from '../hooks/useAirtableData';
import { AIRTABLE_TABLES } from '../lib/airtableTables';
import { mapAccessUser } from '../lib/airtableMappers';
import { fetchStudents } from '../lib/airtable';
import { isStealthMode, setStealthMode } from '../lib/sovereignAudio';
import { useAuth, isSovereignOwner } from '../lib/auth';
import { AirtableEmpty, AirtableErrorBanner, AirtableLoading } from './AirtableStatus';
import { LUX } from '../lib/luxTheme.js';
import { StatusBadge, TruncateTooltip, ST } from './ui/SovereignTable';

export default function AunakAccessControl({ lang = 'ar', defaultStealth = false }) {
  const { user, patchSession } = useAuth();
  const sovereign = isSovereignOwner(user);
  const manualOverride = Boolean(user?.manualOverride);

  const [stealthMode, setStealthModeLocal] = useState(() => isStealthMode() || Boolean(defaultStealth));
  const [roadmapLoading, setRoadmapLoading] = useState(false);
  const [roadmapStudents, setRoadmapStudents] = useState([]);

  useEffect(() => {
    setStealthMode(stealthMode);
  }, [stealthMode]);

  useEffect(() => {
    if (!sovereign) return;
    let cancelled = false;
    setRoadmapLoading(true);
    fetchStudents()
      .then((rows) => {
        if (!cancelled) setRoadmapStudents(Array.isArray(rows) ? rows : []);
      })
      .catch(() => {
        if (!cancelled) setRoadmapStudents([]);
      })
      .finally(() => {
        if (!cancelled) setRoadmapLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [sovereign]);

  const roadmapStats = useMemo(() => {
    const counts = { new: 0, active: 0, other: 0 };
    for (const s of roadmapStudents) {
      const raw = String(s?.status ?? s?.fields?.Status ?? "").trim().toLowerCase();
      if (raw === "new" || raw === "جديد") counts.new += 1;
      else if (raw === "active" || raw === "نشط") counts.active += 1;
      else counts.other += 1;
    }
    return counts;
  }, [roadmapStudents]);

  const toggleManualOverride = () => {
    patchSession({ manualOverride: !manualOverride });
  };
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
      stealthOn: 'الوضع الحالي: التخفي مفعل، الحقول المالية والإدارية محجوبة عن المعالجين السلوكيين.',
      stealthOff: 'الوضع الحالي: شفافية كاملة للمصرح لهم.',
      serverProtocols: 'بروتوكولات الخوادم',
      militaryEncryption: 'التشفير العسكري',
      mirrorSync: 'النسخ المرآتي اللحظي',
      auditLogs: 'استخراج سجل التدقيق (Audit Logs)',
      roadmapTitle: 'خارطة الطريق — حالة المستفيدين (Status)',
      roadmapNew: 'New — مقياس المسح النمائي',
      roadmapActive: 'Active — سجل حي / عالم الجزر',
      roadmapOther: 'أخرى / غير مصنف',
      manualOverride: 'التحكم اليدوي (Manual Override)',
      manualOn: 'مفعّل — تجاوز قفل الرخص والبوابات',
      manualOff: 'معطّل — السياسات الافتراضية نشطة',
      enableManual: 'تفعيل التحكم اليدوي',
      disableManual: 'إيقاف التحكم اليدوي',
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
      stealthOn: 'Current mode: Stealth active — financial and admin fields hidden from behavior therapists.',
      stealthOff: 'Current mode: Full transparency for authorized users.',
      serverProtocols: 'Server Protocols',
      militaryEncryption: 'Military-Grade Encryption',
      mirrorSync: 'Real-Time Mirror Sync',
      auditLogs: 'Export Audit Logs',
      roadmapTitle: 'Roadmap — beneficiary Status',
      roadmapNew: 'New — Developmental Screening Matrix',
      roadmapActive: 'Active — live registry / island world',
      roadmapOther: 'Other / unclassified',
      manualOverride: 'Manual Override',
      manualOn: 'Active — bypass license locks and gates',
      manualOff: 'Inactive — default policies enforced',
      enableManual: 'Enable Manual Override',
      disableManual: 'Disable Manual Override',
    },
  };

  const copy = t[lang] ?? t.ar;

  return (
    <div className="p-6 md:p-10 min-h-screen bg-[#0a0a0c] text-slate-200 font-sans" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <header className="mb-8 border-b border-[#c9a962]/15 pb-6 flex justify-between items-center">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-[#d4af37] flex items-center gap-3">
            <ShieldCheck className="w-10 h-10" /> {copy.title}
          </h2>
          <p className="text-slate-400 mt-2 text-lg font-mono">{copy.subtitle}</p>
        </div>
        <button 
          type="button"
          onClick={() => setStealthModeLocal((v) => !v)}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold transition-all ${stealthMode ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-[0_0_20px_rgba(225,29,72,0.4)]' : 'bg-[#12121a]/70 hover:bg-[#12121a]/90 text-slate-300'}`}
        >
          {stealthMode ? <EyeOff className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
          {stealthMode ? copy.disableStealth : copy.enableStealth}
        </button>
      </header>

      <AirtableErrorBanner error={error} />

      <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
        <div className="lg:col-span-2 space-y-6">
           <div className="bg-[#12121a]/70 backdrop-blur-xl border border-[#c9a962]/15 shadow-[0_0_48px_rgba(201,169,98,0.1)] p-8 rounded-3xl border border-[#c9a962]/15 shadow-xl">
              <div className="flex justify-between items-center mb-6 border-b border-[#c9a962]/15 pb-4">
                 <h3 className="text-xl font-bold text-slate-300 flex items-center gap-2"><Users className="w-6 h-6 text-[#d4af37]" /> {copy.userManagement}</h3>
              </div>
              
              {loading ? (
                <AirtableLoading lang={lang} />
              ) : isEmpty ? (
                <AirtableEmpty lang={lang} />
              ) : (
              <div className="space-y-3">
                 {users.map((user, i) => (
                    <div
                      key={user.id}
                      className={`${ST.listRow} ${i % 2 === 1 ? ST.listRowAlt : ''}`}
                    >
                       <div className="flex items-center gap-4 min-w-0">
                          <div className="w-12 h-12 shrink-0 rounded-full bg-gradient-to-r from-[#c9a962] to-[#d4af37]/10 border border-amber-500/30 flex items-center justify-center text-[#d4af37] font-bold text-xl">
                             {(user.name || '?').charAt(0)}
                          </div>
                          <div className="min-w-0">
                             <h4 className="text-md font-bold text-neutral-200 truncate">{user.name}</h4>
                             <p className="text-xs text-neutral-400 mt-1 font-mono truncate">
                               <TruncateTooltip text={`${user.email} • ${user.role}`} muted maxWidthClass="max-w-[18rem]" />
                             </p>
                          </div>
                       </div>
                       <div className="flex flex-col items-end gap-2 shrink-0 ms-4">
                          <StatusBadge status={user.status || user.access} label={user.status || user.access} />
                          <TruncateTooltip
                            text={user.access}
                            muted
                            maxWidthClass="max-w-[10rem]"
                            className="text-[10px] font-mono"
                          />
                          <span className="text-[10px] text-neutral-400 font-mono">
                            {copy.lastLogin(user.lastLogin)}
                          </span>
                       </div>
                    </div>
                 ))}
              </div>
              )}
           </div>

           <div className="bg-amber-900/10 p-8 rounded-3xl border border-amber-500/20 shadow-[0_0_30px_rgba(245,158,11,0.05)]">
              <h3 className="text-xl font-bold text-[#e8c872] mb-4 flex items-center gap-2"><BrainCircuit className="w-6 h-6" /> {copy.aiTitle}</h3>
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
           {sovereign && (
             <>
               <div className={`${LUX.glassCard} p-6`}>
                 <h3 className={`${LUX.headingGold} mb-4 flex items-center gap-2 border-b border-[#c9a962]/15 pb-3`}>
                   <Map className="w-5 h-5 text-emerald-400" /> {copy.roadmapTitle}
                 </h3>
                 {roadmapLoading ? (
                   <div className={`flex items-center gap-2 text-sm ${LUX.muted}`}>
                     <Loader2 className="w-4 h-4 animate-spin" /> …
                   </div>
                 ) : (
                   <div className="space-y-3">
                     <div className="flex justify-between items-center p-4 bg-[#0d0d10]/90 rounded-xl border border-emerald-400/20">
                       <span className="text-sm text-slate-400">{copy.roadmapNew}</span>
                       <span className={`text-lg font-bold ${LUX.emeraldValue}`}>{roadmapStats.new}</span>
                     </div>
                     <div className="flex justify-between items-center p-4 bg-[#0d0d10]/90 rounded-xl border border-[#c9a962]/20">
                       <span className="text-sm text-slate-400">{copy.roadmapActive}</span>
                       <span className={`text-lg font-bold ${LUX.goldText}`}>{roadmapStats.active}</span>
                     </div>
                     <div className="flex justify-between items-center p-4 bg-[#0d0d10]/90 rounded-xl border border-white/[0.06]">
                       <span className="text-sm text-slate-400">{copy.roadmapOther}</span>
                       <span className="text-lg font-bold text-slate-400">{roadmapStats.other}</span>
                     </div>
                   </div>
                 )}
               </div>

               <div className={`${LUX.glassCard} p-6`}>
                 <h3 className={`${LUX.headingGold} mb-3 flex items-center gap-2`}>
                   <HandMetal className="w-5 h-5 text-amber-400" /> {copy.manualOverride}
                 </h3>
                 <p className={`text-xs mb-4 ${manualOverride ? "text-amber-300" : LUX.muted}`}>
                   {manualOverride ? copy.manualOn : copy.manualOff}
                 </p>
                 <button
                   type="button"
                   onClick={toggleManualOverride}
                   className={`w-full py-3 rounded-xl font-bold text-sm transition-all border flex justify-center items-center gap-2 ${
                     manualOverride
                       ? "bg-amber-600/90 hover:bg-amber-500 text-white border-amber-400/40 shadow-[0_0_24px_rgba(245,158,11,0.25)]"
                       : `${LUX.btnGhost} w-full`
                   }`}
                 >
                   <HandMetal className="w-4 h-4" />
                   {manualOverride ? copy.disableManual : copy.enableManual}
                 </button>
               </div>
             </>
           )}

           <div className="bg-[#12121a]/70 backdrop-blur-xl border border-[#c9a962]/15 shadow-[0_0_48px_rgba(201,169,98,0.1)] p-6 rounded-3xl border border-[#c9a962]/15">
              <h3 className="text-md font-bold text-slate-300 mb-5 flex items-center gap-2 border-b border-[#c9a962]/15 pb-3"><Server className="w-5 h-5 text-emerald-400" /> {copy.serverProtocols}</h3>
              <div className="space-y-3">
                 <div className="flex justify-between items-center p-4 bg-neutral-950 rounded-xl border border-slate-800/60 transition-all duration-200 ease-in-out hover:border-amber-500/30">
                    <span className="text-sm text-neutral-400">{copy.militaryEncryption}</span>
                    <StatusBadge variant="active" label="AES-256" />
                 </div>
                 <div className="flex justify-between items-center p-4 bg-neutral-900/40 rounded-xl border border-slate-800/60 transition-all duration-200 ease-in-out hover:border-amber-500/30">
                    <span className="text-sm text-neutral-400">{copy.mirrorSync}</span>
                    <StatusBadge variant="active" label="ACTIVE" />
                 </div>
              </div>
           </div>
           <button type="button" className="w-full py-4 bg-[#12121a]/70 hover:bg-[#12121a]/90 text-white rounded-2xl font-bold text-sm transition-all border border-white/[0.08] shadow-lg flex justify-center items-center gap-2">
              <Key className="w-4 h-4" /> {copy.auditLogs}
           </button>
        </div>
      </div>
    </div>
  );
}
