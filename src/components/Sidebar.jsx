import { useState, useEffect } from 'react';
import {
  Users,
  Loader2,
  Eye,
  EyeOff,
  PanelLeftClose,
  PanelLeftOpen,
  ShieldCheck,
} from 'lucide-react';
import {
  getDisplayStudentName,
  getDisplayStudentCode,
  getMaskedStudentLabel,
  isAppStealthActive,
  shouldForceStudentNameMask,
} from '../lib/studentPrivacy';
import { LUX } from '../lib/luxTheme.js';

const STORAGE_REVEAL = 'aunak-sidebar-reveal-names';
const STORAGE_COLLAPSED = 'aunak-sidebar-collapsed';

function readStoredBoolean(key, fallback = false) {
  try {
    const value = localStorage.getItem(key);
    return value === null ? fallback : value === 'true';
  } catch {
    return fallback;
  }
}

export default function Sidebar({
  lang = 'ar',
  students = [],
  loading = false,
  error = null,
  refetch,
  selectedStudentId,
  onSelectStudent,
  liveSessionFocus = false,
  className = '',
}) {
  const [revealNames, setRevealNames] = useState(() => readStoredBoolean(STORAGE_REVEAL, false));
  const [collapsed, setCollapsed] = useState(() => readStoredBoolean(STORAGE_COLLAPSED, false));

  useEffect(() => {
    if (liveSessionFocus) setCollapsed(true);
  }, [liveSessionFocus]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_REVEAL, String(revealNames));
    } catch {
      /* ignore */
    }
  }, [revealNames]);

  useEffect(() => {
    if (liveSessionFocus) return;
    try {
      localStorage.setItem(STORAGE_COLLAPSED, String(collapsed));
    } catch {
      /* ignore */
    }
  }, [collapsed, liveSessionFocus]);

  const t = {
    ar: {
      studentsTable: 'سجل المستفيدين',
      loadingStudents: (label) => `جاري التحميل من ${label}...`,
      retry: 'إعادة المحاولة',
      noRecords: (label) => `لا يوجد سجلات في "${label}"`,
      noName: 'بدون اسم',
      revealNames: 'إظهار الأسماء',
      hideNames: 'إخفاء الأسماء',
      expandSidebar: 'فتح القائمة',
      collapseSidebar: 'طي القائمة',
      privacyProtected: 'محمي',
    },
    en: {
      studentsTable: 'Beneficiaries Registry',
      loadingStudents: (label) => `Loading from ${label}...`,
      retry: 'Retry',
      noRecords: (label) => `No records in "${label}"`,
      noName: 'Unnamed',
      revealNames: 'Reveal names',
      hideNames: 'Hide names',
      expandSidebar: 'Expand sidebar',
      collapseSidebar: 'Collapse sidebar',
      privacyProtected: 'Protected',
    },
  };

  const copy = t[lang] ?? t.ar;
  const studentList = Array.isArray(students) ? students : [];
  const textAlign = lang === 'ar' ? 'text-right' : 'text-left';
  const shellClass = `relative z-10 flex flex-col min-h-0 max-h-full ${LUX.glass} rounded-2xl overflow-hidden shadow-xl ${className}`.trim();

  if (collapsed) {
    return (
      <aside
        className={`w-12 shrink-0 ${shellClass}`}
        aria-label={copy.studentsTable}
      >
        <div className="flex flex-col items-center py-3 gap-2 shrink-0 border-b border-[#c9a962]/15 bg-[#12121a]/55 backdrop-blur-xl">
          <button
            type="button"
            onClick={() => setCollapsed(false)}
            className={LUX.sovereignIconBtn}
            title={copy.expandSidebar}
            aria-label={copy.expandSidebar}
          >
            <PanelLeftOpen className="w-4 h-4" />
          </button>
          <div className="p-1.5 rounded-lg text-emerald-500/70" title={copy.privacyProtected}>
            <ShieldCheck className="w-4 h-4" />
          </div>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto lux-nav-scroll p-1.5 space-y-1">
          {studentList.map((student, index) => {
            const forceMask = shouldForceStudentNameMask(revealNames);
            return (
              <button
                key={student.id}
                type="button"
                onClick={() => onSelectStudent?.(student.id)}
                title={forceMask ? getMaskedStudentLabel(index, lang) : (student.name ?? undefined)}
                className={`w-full p-2 rounded-lg border transition-all ${
                  selectedStudentId === student.id
                    ? 'bg-emerald-500/10 border-emerald-400/35 text-emerald-300'
                    : 'border-transparent text-slate-500 hover:bg-[#12121a]/70 hover:border-white/[0.06]'
                }`}
              >
                <span className="text-[10px] font-mono font-bold">
                  {forceMask ? String(index + 1).padStart(2, '0') : (student.name || '?').charAt(0)}
                </span>
              </button>
            );
          })}
        </div>
      </aside>
    );
  }

  return (
    <aside className={`w-64 shrink-0 ${shellClass}`}>
      <div className="shrink-0 p-3 border-b border-[#c9a962]/15 bg-[#12121a]/55 backdrop-blur-xl space-y-2 relative z-20">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Users className="w-5 h-5 text-emerald-400 shrink-0" />
            <h2 className="text-sm font-bold text-slate-200 truncate">{copy.studentsTable}</h2>
          </div>
          <button
            type="button"
            onClick={() => setCollapsed(true)}
            className={LUX.sovereignIconBtn}
            title={copy.collapseSidebar}
            aria-label={copy.collapseSidebar}
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        </div>

        {!isAppStealthActive() && (
          <button
            type="button"
            onClick={() => setRevealNames((prev) => !prev)}
            className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all border ${
              revealNames
                ? 'bg-[#c9a962]/10 border-[#c9a962]/30 text-[#e8c872] hover:bg-[#c9a962]/15'
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/15'
            }`}
            aria-pressed={revealNames}
          >
            {revealNames ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            {revealNames ? copy.hideNames : copy.revealNames}
          </button>
        )}
      </div>

      <div
        className="flex-1 min-h-0 overflow-y-auto lux-nav-scroll p-2 space-y-1 relative z-10"
        dir={lang === 'ar' ? 'rtl' : 'ltr'}
        lang={lang}
      >
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-8 text-slate-500 text-sm">
            <Loader2 className="w-4 h-4 animate-spin" /> {copy.loadingStudents(copy.studentsTable)}
          </div>
        ) : error ? (
          <div className="text-center py-6 px-2 space-y-2">
            <p className="text-xs text-rose-400">{error}</p>
            {refetch && (
              <button type="button" onClick={refetch} className="text-xs text-emerald-400 hover:underline">
                {copy.retry}
              </button>
            )}
          </div>
        ) : studentList.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-8 px-2">{copy.noRecords(copy.studentsTable)}</p>
        ) : (
          studentList.map((student, index) => {
            const forceMask = shouldForceStudentNameMask(revealNames);
            const displayName = getDisplayStudentName(student, index, revealNames, lang, copy.noName);
            const displayCode = getDisplayStudentCode(student, revealNames);
            const maskedLabel = getMaskedStudentLabel(index, lang);

            return (
              <button
                key={student.id}
                type="button"
                onClick={() => onSelectStudent?.(student.id)}
                title={forceMask ? maskedLabel : (student.name ?? undefined)}
                className={`w-full ${textAlign} px-3 py-2.5 rounded-xl transition-all border flex items-center gap-2.5 ${
                  selectedStudentId === student.id
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'border-transparent text-slate-300 hover:bg-[#12121a]/70 hover:border-white/[0.08]'
                }`}
              >
                <span
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 border ${
                    !forceMask
                      ? 'bg-[#12121a]/70 border-slate-600 text-slate-300'
                      : 'bg-slate-800/80 border-white/[0.08] text-slate-500 font-mono'
                  }`}
                  aria-hidden="true"
                >
                  {!forceMask
                    ? (student.name || '?').charAt(0)
                    : String(index + 1).padStart(2, '0')}
                </span>
                <span className="min-w-0 flex-1">
                  <p className="font-bold text-sm truncate" dir="auto">
                    {displayName}
                  </p>
                  {displayCode && (
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5 truncate" dir="ltr">
                      ID: {displayCode}
                    </p>
                  )}
                </span>
              </button>
            );
          })
        )}
      </div>
    </aside>
  );
}
