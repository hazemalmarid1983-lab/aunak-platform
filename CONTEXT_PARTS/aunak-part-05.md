<!-- AUNAK CONTEXT — Part 5 | lines 20001-25000 of 28509 | main + Tawasul (English Island excluded) -->

      setSaving(false);
    }
  };

  const saveLedgerCount = async () => {
    setLedgerSaving(true);
    try {
      await setCenterLedgerCount(sessionDate, specialistEmail, ledgerInput);
      await reloadReconciliation();
    } finally {
      setLedgerSaving(false);
    }
  };

  const approveReconciliation = async () => {
    setLedgerSaving(true);
    try {
      await approveDailyReconciliation(sessionDate, specialistEmail);
      await reloadReconciliation();
    } finally {
      setLedgerSaving(false);
    }
  };

  return (
    <div className="p-6 md:p-10 min-h-screen bg-[#0a0a0c] text-slate-200 font-sans" dir={lang === "ar" ? "rtl" : "ltr"}>
      <header className="mb-8 border-b border-[#c9a962]/15 pb-6">
        <h2 className="text-3xl md:text-4xl font-bold text-emerald-400 flex items-center gap-3">
          <FileText className="w-10 h-10" /> {copy.title}
        </h2>
        <p className="text-slate-400 mt-2 text-lg font-mono">{copy.subtitle}</p>
      </header>

      <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#12121a]/70 backdrop-blur-xl border border-[#c9a962]/15 shadow-[0_0_48px_rgba(201,169,98,0.1)] p-8 rounded-3xl border border-[#c9a962]/15 shadow-xl">
            <div className="flex justify-between items-center mb-6 border-b border-[#c9a962]/15 pb-4">
              <h3 className="text-xl font-bold text-slate-300">{copy.liveSession}</h3>
              <span className={`px-3 py-1 rounded-lg text-xs font-mono font-bold ${liveSessionActive ? "bg-rose-500/10 text-rose-400 border border-rose-500/30 animate-pulse" : "bg-slate-800 text-slate-500 border border-slate-700"}`}>
                {liveSessionActive ? copy.liveRec : "—"}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-[#0d0d10]/90 rounded-xl border border-[#c9a962]/15">
                <p className="text-xs text-slate-500 mb-1 font-mono">{copy.beneficiary}</p>
                <p className="font-bold text-slate-200 text-lg">{activeStudent?.name || copy.connecting}</p>
                {activeId && <p className="text-[10px] text-slate-600 font-mono mt-1">{activeId}</p>}
              </div>
              <div className="p-4 bg-[#0d0d10]/90 rounded-xl border border-[#c9a962]/15">
                <p className="text-xs text-slate-500 mb-1 font-mono">{copy.startTime}</p>
                <p className="font-mono text-emerald-400 text-lg">
                  {sessionStartDisplay || (liveSessionActive ? copy.connecting : "—")}
                </p>
              </div>
            </div>
            <div>
              <label className="text-sm text-slate-400 mb-2 block font-bold">{copy.notesLabel}</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full h-32 bg-[#0d0d10]/90 border border-[#c9a962]/15 rounded-xl p-4 text-slate-300 focus:border-indigo-500 outline-none"
                placeholder={copy.notesPlaceholder}
              />
              {saveMsg && <p className="text-xs mt-2 text-emerald-400 font-mono">{saveMsg}</p>}
            </div>

            {(liveSessionActive || activeStudent?.id) && dynamicSessionId && (
              <GoalEngine
                lang={lang}
                student={activeStudent}
                sessionId={dynamicSessionId}
                specialistEmail={specialistEmail}
                patchSession={patchSession}
                sessionAttemptsCache={user?.goalAttempts}
                showWeeklySummary={sovereign}
              />
            )}
          </div>

          <div className="bg-indigo-900/10 p-8 rounded-3xl border border-indigo-500/20">
            <h3 className="text-xl font-bold text-[#e8c872] mb-4 flex items-center gap-2">
              <BrainCircuit className="w-6 h-6" /> {copy.aiReport}
            </h3>
            <p className="text-md text-indigo-200/80 leading-relaxed bg-indigo-950/50 p-5 rounded-xl border border-indigo-500/30">
              {aiReportFromStudent || copy.aiReportEmpty}
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-[#12121a]/70 backdrop-blur-xl border border-[#c9a962]/15 shadow-[0_0_48px_rgba(201,169,98,0.1)] p-6 rounded-3xl border border-[#c9a962]/15">
            <h3 className="text-md font-bold text-slate-300 mb-5 flex items-center gap-2 border-b border-[#c9a962]/15 pb-3">
              <ShieldCheck className="w-5 h-5 text-emerald-400" /> {copy.security}
            </h3>
            <div className="space-y-3">
              {!hideFinancial && (
                <>
              <div className="flex justify-between items-center p-4 bg-[#0d0d10]/90 rounded-xl border border-[#c9a962]/15">
                <span className="text-sm text-slate-400">{copy.sessionFee}</span>
                <input
                  type="number"
                  min={0}
                  value={sessionFee}
                  onChange={(e) => setSessionFee(e.target.value)}
                  className="w-24 text-end bg-slate-900 border border-white/[0.08] rounded-lg px-2 py-1 text-emerald-300 font-mono text-sm"
                />
              </div>
              <div className="flex justify-between items-center p-4 bg-[#0d0d10]/90 rounded-xl border border-[#c9a962]/15">
                <span className="text-sm text-slate-400">{copy.paymentStatus}</span>
                <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">
                  {paymentFromStudent || "—"}
                </span>
              </div>
                </>
              )}
              <div className="flex justify-between items-center p-4 bg-[#0d0d10]/90 rounded-xl border border-[#c9a962]/15">
                <span className="text-sm text-slate-400">{copy.attachmentEncryption}</span>
                <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">AES-256 SECURED</span>
              </div>
            </div>
          </div>

          <div className="bg-[#12121a]/70 backdrop-blur-xl border border-[#c9a962]/15 shadow-[0_0_48px_rgba(201,169,98,0.1)] p-6 rounded-3xl border border-[#c9a962]/15">
            <h3 className="text-md font-bold text-slate-300 mb-4">{copy.reconciliation}</h3>
            <div className="grid grid-cols-3 gap-2 text-center mb-3">
              <div className="p-3 bg-[#0d0d10]/90 rounded-xl border border-[#c9a962]/15">
                <p className="text-[10px] text-slate-500 font-mono">{copy.specialistClaims}</p>
                <p className="text-lg font-bold text-[#e8c872]">{reconciliation?.claimCount ?? "—"}</p>
              </div>
              <div className="p-3 bg-[#0d0d10]/90 rounded-xl border border-[#c9a962]/15">
                <p className="text-[10px] text-slate-500 font-mono">{copy.centerLedger}</p>
                <p className="text-lg font-bold text-[#e8c872]">{reconciliation?.ledgerCount ?? "—"}</p>
              </div>
              <div className="p-3 bg-[#0d0d10]/90 rounded-xl border border-[#c9a962]/15">
                <p className="text-[10px] text-slate-500 font-mono">{copy.difference}</p>
                <p className={`text-lg font-bold ${hasMismatch ? "text-rose-400" : "text-emerald-400"}`}>{reconciliation?.difference ?? "—"}</p>
              </div>
            </div>
            {hasMismatch && (
              <div className="flex items-start gap-2 p-3 mb-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{copy.mismatch}</span>
              </div>
            )}
            <p className="text-[10px] font-mono text-slate-500 mb-3">
              {sovereignApproved ? copy.sovereignApproved : copy.pendingApproval}
            </p>
            {sovereign && (
              <div className="space-y-2 pt-2 border-t border-[#c9a962]/15">
                <label className="text-xs text-slate-400 block">{copy.ledgerCount}</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min={0}
                    value={ledgerInput}
                    onChange={(e) => setLedgerInput(e.target.value)}
                    className="flex-1 bg-[#0d0d10]/90 border border-white/[0.08] rounded-lg px-3 py-2 text-sm font-mono"
                  />
                  <button
                    type="button"
                    disabled={ledgerSaving || !specialistEmail}
                    onClick={saveLedgerCount}
                    className="px-3 py-2 rounded-lg bg-[#12121a]/70 hover:bg-[#12121a]/90 text-xs font-bold disabled:opacity-50"
                  >
                    {ledgerSaving ? "…" : copy.saveLedger}
                  </button>
                </div>
                <button
                  type="button"
                  disabled={ledgerSaving || !specialistEmail}
                  onClick={approveReconciliation}
                  className="w-full py-2 rounded-xl bg-amber-600/20 border border-amber-500/40 text-amber-200 text-sm font-bold hover:bg-amber-600/30 disabled:opacity-50"
                >
                  {copy.approveReconciliation}
                </button>
              </div>
            )}
          </div>

          <div className="bg-[#12121a]/70 backdrop-blur-xl border border-[#c9a962]/15 shadow-[0_0_48px_rgba(201,169,98,0.1)] p-6 rounded-3xl border border-[#c9a962]/15">
            <h3 className="text-md font-bold text-slate-300 mb-5 flex items-center gap-2 border-b border-[#c9a962]/15 pb-3">
              <Lock className="w-5 h-5 text-[#d4af37]" /> {copy.hiddenFields}
            </h3>
            <div className="p-5 bg-[#0d0d10]/90 rounded-xl border border-[#c9a962]/15 relative overflow-hidden">
              {stealthOn && (
              <div className="absolute inset-0 bg-[#0d0d10]/90 backdrop-blur-sm flex flex-col items-center justify-center z-10 border border-white/[0.08] rounded-xl">
                <Lock className="w-6 h-6 text-slate-500 mb-2" />
                <span className="text-xs font-bold text-slate-400 text-center px-4 whitespace-pre-line">{copy.stealthMode}</span>
              </div>
              )}
              <div className={`h-24 font-mono text-xs text-slate-600 p-2 ${stealthOn ? "opacity-20" : ""}`}>
                {copy.sessionFee}: {hideFinancial ? "—" : sessionFee || "—"} · {copy.paymentStatus}: {hideFinancial ? "—" : paymentFromStudent || "—"}
              </div>
            </div>
          </div>

          {encryptBlocked && (
            <p className="text-xs text-rose-400 font-mono text-center px-2">
              {biometricBlocked ? copy.biometricRequired : copy.mismatchBlock}
            </p>
          )}

          <button
            type="button"
            disabled={saving || !activeStudent?.id}
            onClick={approveSession}
            className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-2xl font-bold text-sm disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
            {copy.encryptButton}
          </button>

          <button
            type="button"
            disabled={saving || !activeStudent?.id || encryptBlocked}
            onClick={openSettlement}
            className="w-full py-4 mt-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold text-lg disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {copy.endSession}
          </button>

          <SettlementConfirmModal
            lang={lang}
            open={settleOpen}
            onClose={() => setSettleOpen(false)}
            onConfirm={confirmSettlement}
            reconciliation={reconciliation}
            sessionDate={sessionDate}
            specialistEmail={specialistEmail}
            specialistName={user?.name}
            studentName={activeStudent?.name}
            sessionFee={sessionFee}
            saving={saving}
            sovereign={sovereign}
          />
        </div>
      </div>
    </div>
  );
}
````

## File: src/components/ErrorBoundary.jsx
````javascript
import { Component } from 'react';
import { LUX } from '../lib/luxTheme.js';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div dir="rtl" className="min-h-screen bg-[#0a0a0c] text-slate-200 p-8 font-sans">
          <h1 className="text-xl font-bold text-rose-400 mb-2">حدث خطأ في التطبيق</h1>
          <p className="text-sm text-slate-400 mb-4">{this.state.error.message}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="px-4 py-2 rounded-lg bg-cyan-600 text-white font-bold"
          >
            إعادة تحميل الصفحة
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
````

## File: src/components/PlatformLogo.jsx
````javascript
import { useState } from 'react';
import { HeartHandshake } from 'lucide-react';

export const AUNAK_LOGO_SRC = '/aunak-logo.png';

export const HEADER_LOGO_CLASS = 'w-[120px] sm:w-[150px] aspect-video max-w-full shrink-0 h-auto';

export const GATE_LOGO_CLASS = 'w-[180px] sm:w-[240px] aspect-video max-w-[min(240px,92vw)] shrink-0 h-auto';

export default function PlatformLogo({
  lang = 'ar',
  className = 'w-20 sm:w-24 aspect-video h-auto',
  imgClassName = 'w-full h-full object-contain',
  iconClassName = 'w-8 h-8 text-amber-500',
}) {
  const [error, setError] = useState(false);
  const alt = lang === 'ar' ? 'شعار عونك' : 'Aunak logo';

  return (
    <div
      className={`relative shrink-0 flex items-center justify-center overflow-visible shadow-[0_0_20px_rgba(245,158,11,0.15)] ${className}`}
    >
      {!error ? (
        <img
          src={AUNAK_LOGO_SRC}
          alt={alt}
          className={imgClassName}
          onError={() => setError(true)}
        />
      ) : (
        <HeartHandshake className={iconClassName} aria-hidden />
      )}
    </div>
  );
}
````

## File: src/components/Sidebar.jsx
````javascript
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
      studentsTable: 'جدول الطلاب',
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
      studentsTable: 'Students Table',
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
````

## File: src/hooks/useAirtableData.js
````javascript
import { useState, useEffect, useCallback } from "react";
import { fetchAirtableRecords } from "../lib/airtable";
import { AIRTABLE_TABLES } from "../lib/airtableTables";
import {
  mapAbcPlan,
  mapAccessUser,
  mapEmotionSignal,
  mapLearningRecord,
  mapMedia,
  mapMelodyPattern,
  mapResource,
  mapScientificItem,
  mapSpecialist,
} from "../lib/airtableMappers";

/** All 9 non-student hub sections wired to Airtable (15/15 live platform). */
export const AIRTABLE_SECTION_CONFIG = {
  scientificItems: {
    tableId: AIRTABLE_TABLES.scientificItems,
    mapRecord: mapScientificItem,
    label: "مكتبة البنود / Scientific Items",
  },
  specialists: {
    tableId: AIRTABLE_TABLES.specialists,
    mapRecord: mapSpecialist,
    label: "الأخصائيين / Specialists",
  },
  abcData: {
    tableId: AIRTABLE_TABLES.abcData,
    mapRecord: mapAbcPlan,
    label: "تعديل السلوك ABC / Behavior Mod",
  },
  safeMedia: {
    tableId: AIRTABLE_TABLES.safeMedia,
    mapRecord: mapMedia,
    label: "الوسائط الآمنة / Safe Media",
  },
  melodyLab: {
    tableId: AIRTABLE_TABLES.melodyLab,
    mapRecord: mapMelodyPattern,
    label: "مختبر الألحان / Melody Lab",
  },
  communityResources: {
    tableId: AIRTABLE_TABLES.communityResources,
    mapRecord: mapResource,
    label: "موارد المجتمع / Resources",
  },
  accessControl: {
    tableId: AIRTABLE_TABLES.accessControl,
    mapRecord: mapAccessUser,
    label: "صلاحيات الوصول / Access Control",
  },
  learningDifficulties: {
    tableId: AIRTABLE_TABLES.learningDifficulties,
    mapRecord: mapLearningRecord,
    label: "صعوبات التعلم / Learning Center",
  },
  emotionalMonitoring: {
    tableId: AIRTABLE_TABLES.emotionalMonitoring,
    mapRecord: mapEmotionSignal,
    label: "كاميرا الرصد العاطفي / Emotional Monitoring",
  },
};

/**
 * Load a named hub section (one of the 9 Airtable-backed tables).
 * @param {keyof typeof AIRTABLE_SECTION_CONFIG} sectionKey
 */
export function useAirtableSection(sectionKey, options = {}) {
  const config = AIRTABLE_SECTION_CONFIG[sectionKey];
  if (!config) {
    throw new Error(`Unknown Airtable section: ${sectionKey}`);
  }
  return useAirtableData(config.tableId, {
    mapRecord: config.mapRecord,
    ...options,
  });
}

/**
 * Generic hook: load any Airtable table by ID with loading/error states.
 * @param {string} tableId
 * @param {{ mapRecord?: (record) => object, enabled?: boolean }} options
 */
export function useAirtableData(tableId, options = {}) {
  const { mapRecord, enabled = true, lang = "ar" } = options;
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(Boolean(enabled && tableId));
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!enabled || !tableId) {
      setRecords([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const raw = await fetchAirtableRecords(tableId);
      const list = Array.isArray(raw) ? raw : [];
      const mapped = mapRecord
        ? list.map((r) => {
            try {
              return mapRecord(r, lang);
            } catch (e) {
              console.warn("[useAirtableData] mapRecord failed:", e);
              return { id: r?.id, fields: r?.fields ?? {} };
            }
          })
        : list.map((r) => ({ id: r.id, fields: r?.fields ?? {} }));
      setRecords(mapped.filter(Boolean));
    } catch (err) {
      console.error("[useAirtableData]", tableId, err);
      setError(
        err?.message ??
          (lang === "en" ? "Failed to load data from Airtable" : "فشل تحميل البيانات من Airtable")
      );
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, [tableId, enabled, mapRecord, lang]);

  useEffect(() => {
    load();
  }, [load]);

  return { records, loading, error, refetch: load, isEmpty: !loading && records.length === 0 };
}
````

## File: src/hooks/useStudents.js
````javascript
import { useState, useEffect, useCallback } from "react";
import { fetchStudents } from "../lib/airtable";
import { STUDENT as SF } from "../lib/airtableFields";

export const STUDENT_NAME_FIELD = SF.name;
export const STUDENT_CLASS_FIELD = SF.assigned_class;
export const STUDENTS_TABLE_LABEL = "Students";

export function useStudents(lang = "ar") {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const rows = await fetchStudents();
      const list = Array.isArray(rows) ? rows : [];
      setStudents(
        list.map((row) => {
          const fields = row?.fields ?? {};
          const name =
            lang === "en"
              ? fields[SF.name] || row?.name
              : row?.name ?? fields[SF.name];
          const diagnosis =
            lang === "en" ? row?.diagnosis ?? fields[SF.diagnosis] : row?.diagnosis ?? fields[SF.diagnosis];
          const assignedClass =
            lang === "en"
              ? fields[SF.assigned_class] || row?.assignedClass
              : row?.assignedClass ?? fields[SF.assigned_class];
          return { ...row, name, diagnosis, assignedClass };
        })
      );
    } catch (e) {
      setError(e?.message ?? "Failed to load students");
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }, [lang]);

  useEffect(() => {
    load();
  }, [load]);

  return { students, loading, error, refetch: load };
}
````

## File: src/lib/auth.jsx
````javascript
/**
 * Aunak Authentication Layer — Gate logic for the sovereign platform.
 */

import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { fetchAirtableRecords, fetchStudents, findStudentByIdentifier, getField } from "./airtable";
import { AIRTABLE_TABLES } from "./airtableTables";
import { ACCESS as AF, STUDENT as SF } from "./airtableFields";
import { resolvePlanCode, PLAN_CODES } from "./plans";
import { newDynamicSessionId } from "./goalEngine";
import { buildSpecialistClinicalSession } from "./sovereignProtocol";

export const ROLES = {
  ADMIN: "admin",
  SPECIALIST: "specialist",
  PARENT: "parent",
};

export const SOVEREIGN_OWNER_EMAIL = 'hazem@aunak-center.com';

export function isSovereignOwner(user) {
  const email = String(user?.email ?? '').trim().toLowerCase();
  return email === SOVEREIGN_OWNER_EMAIL.toLowerCase();
}

export const SOVEREIGN_ONLY_SECTIONS = ['access', 'specialists'];

/** Admin (non-sovereign) clinical manager — specialist areas + resources. */
export const CLINICAL_MANAGER_SECTIONS = [
  'live', 'registry', 'diagnostics', 'behavior', 'classrooms',
  'scientific', 'learning', 'emotion', 'crisis', 'media', 'enrollment',
  'biometrics', 'community', 'research', 'reports', 'resources', 'summerAcademy',
];

/** Clinical sections unlocked after sovereign biometric login (≥94.7%). */
export const BIOMETRIC_SOVEREIGN_SECTIONS = [
  'live', 'registry', 'diagnostics', 'behavior', 'classrooms',
  'scientific', 'learning', 'emotion', 'crisis', 'media', 'enrollment',
  'biometrics', 'community', 'research', 'reports', 'resources', 'summerAcademy',
];

const ROLE_ACCESS = {
  [ROLES.ADMIN]: null,
  [ROLES.SPECIALIST]: [
    'live', 'registry', 'diagnostics', 'behavior', 'classrooms',
    'scientific', 'learning', 'emotion', 'crisis', 'media', 'enrollment',
    'biometrics', 'community', 'research', 'reports',
  ],
  [ROLES.PARENT]: ['media', 'community', 'biometrics', 'resources', 'emotion', 'reports', 'summerAcademy'],
};

export function canAccessSection(user, role, sectionId) {
  if (SOVEREIGN_ONLY_SECTIONS.includes(sectionId) && !isSovereignOwner(user)) {
    return false;
  }
  if (user?.biometricSovereign && BIOMETRIC_SOVEREIGN_SECTIONS.includes(sectionId)) {
    return true;
  }
  if (isSovereignOwner(user)) return true;
  if (role === ROLES.ADMIN) {
    return CLINICAL_MANAGER_SECTIONS.includes(sectionId);
  }
  const allowed = ROLE_ACCESS[role];
  return allowed == null || allowed.includes(sectionId);
}

const SESSION_KEY = "aunak.session.v1";

const TOKEN_FIELDS = [AF.access_token];

const ADMIN_LEVELS = ["admin", "مدير", "super", "sovereign", "owner"];

function readSession() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeSession(session) {
  try {
    if (session) sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    else sessionStorage.removeItem(SESSION_KEY);
  } catch {
    /* sessionStorage unavailable */
  }
}

export function getSessionRole() {
  return readSession()?.role ?? null;
}

export function getSession() {
  return readSession();
}

export function getActiveStudentId() {
  return readSession()?.activeStudentId ?? null;
}

export function getSessionPlan() {
  return readSession()?.plan ?? PLAN_CODES.FREE;
}

function resolvePlanFromFields(fields) {
  const raw = getField(fields, SF.plan_code) || getField(fields, SF.subscription_status);
  return resolvePlanCode(raw);
}

function resolveRoleFromRecord(fields) {
  const level = String(getField(fields, AF.access_level) ?? "").toLowerCase();
  if (ADMIN_LEVELS.some((k) => level.includes(k))) return ROLES.ADMIN;

  const permissions = String(getField(fields, AF.permissions) ?? "");
  if (/advanced settings|الإعدادات المتقدمة/i.test(permissions)) return ROLES.ADMIN;

  return ROLES.SPECIALIST;
}

export async function verifyAccessToken(inputToken) {
  const token = String(inputToken ?? "").trim();
  if (!token) return null;

  const records = await fetchAirtableRecords(AIRTABLE_TABLES.accessControl);

  for (const record of records) {
    const f = record?.fields ?? {};

    const tokenMatch = TOKEN_FIELDS.some((fieldName) => {
      const v = getField(f, fieldName);
      return v != null && String(v).trim() === token;
    });

    const email = getField(f, AF.user_email);
    const emailMatch = email != null && String(email).trim().toLowerCase() === token.toLowerCase();

    if (tokenMatch || emailMatch) {
      const role = resolveRoleFromRecord(f);
      const plan =
        resolvePlanFromFields(f) ??
        (role === ROLES.ADMIN ? PLAN_CODES.INSTITUTION : PLAN_CODES.INSTITUTION);
      const base = {
        role,
        plan,
        isSovereignOwner: isSovereignOwner({ email: email || '' }),
        name: getField(f, AF.user_name) || (role === ROLES.ADMIN ? "المدير الأعلى" : "أخصائي"),
        email: email || "",
        permissions: getField(f, AF.permissions) || "",
        recordId: record.id,
        dynamicSessionId: newDynamicSessionId(),
        landingSection: "registry",
      };
      const session =
        role === ROLES.SPECIALIST || role === ROLES.ADMIN
          ? buildSpecialistClinicalSession(base)
          : base;
      return session;
    }
  }

  return null;
}

export function deriveChildCode(student) {
  const explicit = student?.studentCode;
  if (explicit && /AUN/i.test(String(explicit))) return String(explicit);
  if (explicit) return `AUN-${String(explicit).replace(/\s+/g, "").slice(0, 6)}-FX`;
  const seed = String(student?.id ?? "0000").replace(/[^a-zA-Z0-9]/g, "");
  const num = (seed.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % 9000) + 1000;
  return `AUN-${num}-FX`;
}

export async function verifyBiometricChild(childIdentifier) {
  const students = await fetchStudents();
  const list = Array.isArray(students) ? students : [];
  const child = findStudentByIdentifier(list, childIdentifier);
  if (!child) return null;
  const subscriptionRaw = getField(child.fields, SF.subscription_status);
  const subscriptionExpiresAt = getField(child.fields, SF.subscription_expires_at) || null;
  const session = {
    role: ROLES.PARENT,
    plan: resolvePlanFromFields(child.fields) ?? PLAN_CODES.FREE,
    name: "ولي الأمر",
    childName: child.name || "الطفل",
    childCode: deriveChildCode(child),
    childId: child.id,
    activeStudentId: child.id,
    subscriptionRaw,
    subscriptionExpiresAt,
    subscriptionActivated: isSubscriptionActive(subscriptionRaw) && !isSubscriptionExpired({ subscriptionRaw, subscriptionExpiresAt }),
    landingSection: getField(child.fields, SF.preferred_destination) || null,
  };
  return session;
}

const SUBSCRIPTION_ACTIVE = ["active", "نشط", "مفعل", "فعال"];
const SUBSCRIPTION_PENDING = ["pending", "معلق", "بانتظار"];
const SUBSCRIPTION_EXPIRED = ["expired", "منته", "انته", "lapsed"];

export function isSubscriptionPending(rawStatus) {
  if (rawStatus == null || rawStatus === "") return false;
  const v = String(rawStatus).trim().toLowerCase();
  return SUBSCRIPTION_PENDING.some((k) => v.includes(k));
}

export function isSubscriptionActive(rawStatus) {
  if (rawStatus == null || rawStatus === "") return false;
  const v = String(rawStatus).trim().toLowerCase();
  if (SUBSCRIPTION_EXPIRED.some((k) => v.includes(k))) return false;
  return SUBSCRIPTION_ACTIVE.some((k) => v.includes(k));
}

export function isSubscriptionExpired(userOrStatus) {
  const raw =
    typeof userOrStatus === 'object' && userOrStatus !== null
      ? userOrStatus.subscriptionRaw
      : userOrStatus;
  const v = String(raw ?? '').trim().toLowerCase();
  if (SUBSCRIPTION_EXPIRED.some((k) => v.includes(k))) return true;
  const exp =
    typeof userOrStatus === 'object' && userOrStatus !== null
      ? userOrStatus.subscriptionExpiresAt
      : null;
  if (exp) {
    const t = new Date(exp).getTime();
    if (Number.isFinite(t) && t < Date.now()) return true;
  }
  return false;
}

export async function checkSubscriptionActive() {
  const students = await fetchStudents();
  return (Array.isArray(students) ? students : []).some((s) =>
    isSubscriptionActive(getField(s.fields, SF.subscription_status))
  );
}

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => readSession());
  const [subscriptionActive, setSubscriptionActive] = useState(null);

  const login = useCallback((session) => {
    setUser(session);
    writeSession(session);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    writeSession(null);
    setSubscriptionActive(null);
  }, []);

  const setActiveStudent = useCallback((studentId) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, activeStudentId: studentId ?? null };
      writeSession(next);
      return next;
    });
  }, []);

  const patchSession = useCallback((patch) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...(typeof patch === "function" ? patch(prev) : patch) };
      writeSession(next);
      return next;
    });
  }, []);

  useEffect(() => {
    if (!user || user.tawasulMvp) {
      setSubscriptionActive(user?.tawasulMvp ? true : null);
      return undefined;
    }
    let cancelled = false;
    checkSubscriptionActive()
      .then((active) => {
        if (!cancelled) setSubscriptionActive(active);
      })
      .catch(() => {
        if (!cancelled) setSubscriptionActive(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, login, logout, subscriptionActive, setActiveStudent, patchSession }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
````

## File: src/lib/childAccess.js
````javascript
import { fetchStudents, getField } from './airtable';
import { mapStudent } from './airtableMappers';
import { STUDENT as SF } from './airtableFields';

function normalizeToken(raw) {
  return String(raw ?? '').trim().toUpperCase();
}

async function verifyChildViaServer(inputToken) {
  const res = await fetch('/api/tawasul/verify-token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ token: inputToken }),
  });
  const data = await res.json().catch(() => ({}));
  if (res.ok && data?.kind === 'child' && data?.record?.id) {
    return mapStudent(data.record, 'ar');
  }
  if (res.status === 401 || res.status === 403) return null;
  throw new Error(data?.error || `VERIFY_${res.status}`);
}

/** Resolve student by child_interactive_token (AUN-CHD-...). */
export async function findStudentByChildToken(token) {
  const key = normalizeToken(token);
  if (!key || !key.startsWith('AUN-CHD-')) return null;

  try {
    return await verifyChildViaServer(token);
  } catch (serverErr) {
    if (import.meta.env.PROD) {
      console.error('[childAccess] server verify failed:', serverErr?.message);
      return null;
    }
    const students = await fetchStudents();
    return (
      students.find((s) => normalizeToken(s.childInteractiveToken) === key) ||
      students.find((s) => normalizeToken(getField(s.fields, SF.child_interactive_token)) === key) ||
      null
    );
  }
}

export function parseChildRouteToken() {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  return params.get('token')?.trim() || null;
}
````

## File: src/lib/childSessionBridge.js
````javascript
/**
 * Client trigger — child island engagement → session seal API.
 */

/** Max stars on child island + seal trigger — sovereign neural cap. */
export const CHILD_ISLAND_SEAL_THRESHOLD = 5;
export const SOVEREIGN_CHILD_MAX_STARS = CHILD_ISLAND_SEAL_THRESHOLD;

export function clampSovereignStars(count) {
  return Math.min(Math.max(0, Number(count) || 0), SOVEREIGN_CHILD_MAX_STARS);
}

let sealInFlight = false;

export async function triggerChildIslandSeal({
  studentId,
  studentName,
  interactionCount = CHILD_ISLAND_SEAL_THRESHOLD,
  source = 'island_world',
  interactionType = 'play_engagement',
}) {
  if (sealInFlight) return { skipped: true, reason: 'in_flight' };
  if (!studentName && !studentId) return { skipped: true, reason: 'no_student' };

  sealInFlight = true;
  try {
    const res = await fetch('/api/session/child-seal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        studentId,
        studentName,
        interactionCount,
        source,
        interactionType,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.error || 'CHILD_SEAL_FAILED');
    return data;
  } finally {
    sealInFlight = false;
  }
}
````

## File: src/lib/studentPrivacy.js
````javascript
/**
 * Privacy helpers for masking student identifiers in the UI.
 */

import { isStealthMode, setStealthMode } from './sovereignAudio';

const FINANCIAL_FIELD_PATTERN =
  /كفاءة التشغيل|صافي|إيراد|الدفع|دفع|فاتورة|مالي|سعر|تكلفة|revenue|payment|invoice|price|cost|billing|paid|operating efficiency|net revenue/i;

const CLINICAL_FIELD_PATTERN =
  /هدف إجرائي|الهدف الإجرائي|مؤشر التحسن|تشخيص|تقرير طبي|سجل طبي|clinical|diagnosis|medical|iep goal|improvement index/i;

export const STEALTH_BYPASS_CODE = '141092245';
export const SOVEREIGN_EMERGENCY_CODE = '947141092';
export const STEALTH_HIDDEN_SECTIONS = [
  'access',
  'specialists',
  'registry',
  'research',
  'enrollment',
  'diagnostics',
  'scientific',
];

const STEALTH_EVENT = 'aunak-stealth-change';
const EMERGENCY_EVENT = 'aunak-emergency-login';
let stealthDigitBuffer = '';
let emergencyDigitBuffer = '';

export function isAppStealthActive() {
  return isStealthMode();
}

export function setAppStealthActive(on) {
  setStealthMode(Boolean(on));
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(STEALTH_EVENT, { detail: { active: Boolean(on) } }));
  }
}

export function toggleAppStealth() {
  setAppStealthActive(!isAppStealthActive());
}

export function isSectionHiddenInStealth(sectionId) {
  return isAppStealthActive() && STEALTH_HIDDEN_SECTIONS.includes(sectionId);
}

export function shouldForceStudentNameMask(revealNames) {
  return isAppStealthActive() || !revealNames;
}

export function subscribeStealthChanges(callback) {
  if (typeof window === 'undefined') return () => {};
  const handler = (e) => callback(e?.detail?.active ?? isAppStealthActive());
  window.addEventListener(STEALTH_EVENT, handler);
  return () => window.removeEventListener(STEALTH_EVENT, handler);
}

export function handleStealthKeyInput(key) {
  if (!/^\d$/.test(String(key))) {
    stealthDigitBuffer = '';
    return false;
  }
  stealthDigitBuffer = (stealthDigitBuffer + String(key)).slice(-STEALTH_BYPASS_CODE.length);
  if (stealthDigitBuffer === STEALTH_BYPASS_CODE) {
    stealthDigitBuffer = '';
    toggleAppStealth();
    return true;
  }
  return false;
}

/** Sovereign emergency field-inspection login — hidden digit code (94.7 protocol). */
export function handleEmergencyKeyInput(key) {
  if (!/^\d$/.test(String(key))) {
    emergencyDigitBuffer = '';
    return false;
  }
  emergencyDigitBuffer = (emergencyDigitBuffer + String(key)).slice(-SOVEREIGN_EMERGENCY_CODE.length);
  if (emergencyDigitBuffer === SOVEREIGN_EMERGENCY_CODE) {
    emergencyDigitBuffer = '';
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(EMERGENCY_EVENT));
    }
    return true;
  }
  return false;
}

export function subscribeEmergencyLogin(callback) {
  if (typeof window === 'undefined') return () => {};
  const handler = () => callback();
  window.addEventListener(EMERGENCY_EVENT, handler);
  return () => window.removeEventListener(EMERGENCY_EVENT, handler);
}

export function handleSovereignKeyInput(key) {
  return handleStealthKeyInput(key) || handleEmergencyKeyInput(key);
}

export function maskSensitiveFields(fields, role) {
  if (!fields || typeof fields !== 'object') return fields;
  if (role === 'admin' && !isAppStealthActive()) return fields;
  const masked = {};
  for (const [key, value] of Object.entries(fields)) {
    const isSensitive =
      FINANCIAL_FIELD_PATTERN.test(key) || CLINICAL_FIELD_PATTERN.test(key);
    if (!isSensitive) masked[key] = value;
  }
  return masked;
}

export function maskFinancialFields(fields, role) {
  return maskSensitiveFields(fields, role);
}

export function getMaskedStudentLabel(index, lang = 'ar') {
  const num = String(index + 1).padStart(2, '0');
  return lang === 'ar' ? `طالب-${num}` : `Student-${num}`;
}

export function getStudentInitials(name) {
  if (!name?.trim()) return '?';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export function getDisplayStudentName(student, index, revealNames, lang, noNameLabel) {
  if (shouldForceStudentNameMask(revealNames)) {
    return getMaskedStudentLabel(index, lang);
  }
  return student.name || noNameLabel;
}

export function getDisplayStudentCode(student, revealNames) {
  if (shouldForceStudentNameMask(revealNames)) {
    return null;
  }
  if (revealNames && student.studentCode) {
    return student.studentCode;
  }
  return null;
}
````

## File: src/lib/tawasulAssessmentEngine.js
````javascript
/**
 * Tawasul — Zero Entry: auto-generate programmed_goal from assessment data.
 */

import { buildAssessmentProfileFromScore, parseStoredAssessmentScore } from './initialAssessmentEngine.js';

const GOAL_TEMPLATES = {
  ar: {
    balanced: (name, focus) =>
      `🎯 ${name}: هدف اليوم — تعزيز ${focus || 'التواصل البصري'} عبر لعبة الجزر (3 جولات هادئة).`,
    moderate: (name, focus) =>
      `🎯 ${name}: هدف إجرائي — ${focus || 'تنظيم الانتباه'} · 5 تفاعلات في عالم الجزر + مكافأة نجمة.`,
    elevated: (name, focus) =>
      `🎯 ${name}: هدف عاجل — ${focus || 'تهدئة ثم جذب انتباه'} · ابدأ بتبويب «هدوء» ثم «العب» (5 نجوم).`,
  },
  en: {
    balanced: (name, focus) =>
      `🎯 ${name}: Daily goal — strengthen ${focus || 'eye contact'} via island play (3 calm rounds).`,
    moderate: (name, focus) =>
      `🎯 ${name}: Programmed goal — ${focus || 'attention regulation'} · 5 island interactions + star reward.`,
    elevated: (name, focus) =>
      `🎯 ${name}: Urgent goal — ${focus || 'calm then engage'} · start Calm tab then Play (5 stars).`,
  },
};

function pickFocus(profile, lang) {
  const areas = profile?.focusAreas ?? [];
  if (!areas.length) return null;
  const labels = {
    communication: lang === 'en' ? 'communication' : 'التواصل',
    social: lang === 'en' ? 'social play' : 'اللعب الاجتماعي',
    behavior: lang === 'en' ? 'behavior regulation' : 'تنظيم السلوك',
    sensory: lang === 'en' ? 'sensory calm' : 'التهدئة الحسية',
    language: lang === 'en' ? 'language expression' : 'التعبير اللغوي',
    flexibility: lang === 'en' ? 'flexibility' : 'المرونة',
  };
  return labels[areas[0]] ?? areas[0];
}

/** Build programmed_goal text from assessment score / comprehensive status. */
export function generateProgrammedGoalFromAssessment({
  studentName = 'الطفل',
  scoreRaw,
  comprehensiveStatus = 'completed',
  lang = 'ar',
} = {}) {
  const name = String(studentName ?? 'الطفل').trim() || 'الطفل';
  const status = String(comprehensiveStatus ?? '').toLowerCase();
  if (status && !/completed|complete|done|منته|مكتمل/.test(status)) {
    return null;
  }

  const score = parseStoredAssessmentScore(scoreRaw);
  if (score == null) return null;

  const profile = buildAssessmentProfileFromScore(score, lang);
  const band = profile?.band ?? 'moderate';
  const focus = pickFocus(profile, lang);
  const tpl = GOAL_TEMPLATES[lang]?.[band] ?? GOAL_TEMPLATES.ar[band];
  return tpl(name, focus);
}

export function shouldAutoInjectGoal(fields = {}) {
  const status = String(fields.comprehensive_assessment_status ?? fields.Comprehensive_Assessment_Status ?? '').toLowerCase();
  const score = fields.initial_assessment_score ?? fields.Initial_Assessment_Score ?? fields['Initial Assessment Score'];
  const hasScore = score != null && score !== '';
  const completed = /completed|complete|done|مكتمل/.test(status);
  const goal = fields.programmed_goal ?? fields.Programmed_Goal ?? fields['programmed_goal'];
  const goalEmpty = !goal || String(goal).trim().length < 8;
  return hasScore && completed && goalEmpty;
}
````

## File: src/lib/tawasulStudentFields.js
````javascript
/**
 * Tawasul sandbox Students table — snake_case protocol (aligned with airtableFields.js).
 * Base app3vCT2j2JepNVZa · table tbliBfCKXNyVtWJiO
 */

import { STUDENT as SF } from './airtableFields.js';

export const TAWASUL_STUDENTS_TABLE_ID = 'tbliBfCKXNyVtWJiO';

/** Canonical column names — single source: airtableFields STUDENT + mirror fields. */
export const TAWASUL_STUDENT = {
  name: 'Name',
  childInteractiveToken: SF.child_interactive_token,
  programmedGoal: SF.programmed_goal,
  mirrorCommand: SF.mirror_command,
  mirrorPayload: SF.mirror_payload,
  initialAssessmentScore: SF.initial_assessment_score,
  comprehensiveAssessmentStatus: SF.comprehensive_assessment_status,
  assignedSpecialist: SF.assigned_specialist,
};

export { SF as TAWASUL_STUDENT_FIELDS };

/** Normalize mirror select values to snake_case (echo_goal, calm_pulse, …). */
export function normalizeMirrorCommand(raw) {
  return String(raw ?? '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_');
}

export function mirrorCommandToAirtable(command) {
  return normalizeMirrorCommand(command);
}

export function pickTawasulField(fields, ...keys) {
  if (!fields || typeof fields !== 'object') return null;
  for (const key of keys) {
    const v = fields[key];
    if (v != null && String(v).trim() !== '') return v;
  }
  return null;
}

export function readTawasulProgrammedGoal(fields) {
  return pickTawasulField(fields, SF.programmed_goal);
}

export function readTawasulMirrorCommand(fields) {
  const raw = pickTawasulField(fields, SF.mirror_command);
  return raw ? normalizeMirrorCommand(raw) : '';
}

export function readTawasulMirrorPayload(fields) {
  return pickTawasulField(fields, SF.mirror_payload) ?? '';
}

export function readTawasulAssessmentScore(fields) {
  return pickTawasulField(fields, SF.initial_assessment_score);
}

export function readTawasulComprehensiveStatus(fields) {
  return pickTawasulField(
    fields,
    SF.comprehensive_assessment_status,
    'comprehensive_assessment'
  );
}

/** Pass snake_case patch through; normalize mirror_command values only. */
export function patchToTawasulAirtableFields(patch = {}) {
  const out = { ...patch };
  if (out.mirror_command != null) {
    out[SF.mirror_command] = mirrorCommandToAirtable(out.mirror_command);
  }
  return out;
}

export function buildTawasulMirrorPatch(command, payload = '', goalEcho) {
  const fields = {
    [SF.mirror_command]: mirrorCommandToAirtable(command),
    [SF.mirror_payload]: String(payload ?? ''),
  };
  if (goalEcho != null && String(goalEcho).trim()) {
    fields[SF.programmed_goal] = String(goalEcho).trim();
  }
  return fields;
}
````

## File: src/lib/tripleAccessProtocol.js
````javascript
/**
 * Triple-device access protocol — one activation → three role tokens (parent / child / specialist).
 * Used on redeem (server + client fallback).
 */

import { STUDENT as SF } from './airtableFields.js';

export const DEVICE_TOKEN_PREFIX = {
  parent: 'PRT',
  child: 'CHD',
  specialist: 'SPC',
  /** Wave 4 — English Talk Island direct-entry token */
  english: 'ENG',
};

export const COMPREHENSIVE_ASSESSMENT = {
  not_started: 'not_started',
  in_progress: 'in_progress',
  completed: 'completed',
};

function randomHex(byteCount = 16) {
  const bytes = new Uint8Array(byteCount);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    throw new Error('crypto.getRandomValues unavailable');
  }
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

/** Generate one device token: AUN-{PRT|CHD|SPC}-{32hex} */
export function generateDeviceToken(role) {
  const prefix = DEVICE_TOKEN_PREFIX[role];
  if (!prefix) throw new Error(`Unknown device role: ${role}`);
  return `AUN-${prefix}-${randomHex(16).toUpperCase()}`;
}

/** English Talk Island direct-entry token: AUN-ENG-{32hex}. */
export function generateEnglishIslandToken() {
  return generateDeviceToken('english');
}

/** Map an English token → Students column write. */
export function englishTokenAirtableFields(token) {
  if (!token) return {};
  return { [SF.student_english_token]: token };
}

/** Parent + child + specialist/tutor tokens for a student record. */
export function generateTripleDeviceTokens() {
  return {
    parent: generateDeviceToken('parent'),
    child: generateDeviceToken('child'),
    specialist: generateDeviceToken('specialist'),
  };
}

/** Map tokens → Airtable Students column writes. */
export function tripleTokenAirtableFields(tokens) {
  if (!tokens) return {};
  return {
    [SF.parent_access_token]: tokens.parent,
    [SF.child_interactive_token]: tokens.child,
    [SF.specialist_tutor_token]: tokens.specialist,
  };
}

/**
 * Fields applied on successful activation redeem (subscription + triple tokens).
 * Sets comprehensive_assessment_status to not_started unless already completed.
 */
export function buildActivationRedeemFields(
  subscriptionFields,
  { tokens, existingComprehensiveStatus } = {}
) {
  const triple = tripleTokenAirtableFields(tokens ?? generateTripleDeviceTokens());
  const fields = { ...subscriptionFields, ...triple };

  const existing = String(existingComprehensiveStatus ?? '')
    .trim()
    .toLowerCase();
  if (existing !== COMPREHENSIVE_ASSESSMENT.completed) {
    fields[SF.comprehensive_assessment_status] = COMPREHENSIVE_ASSESSMENT.not_started;
  }

  return fields;
}

/** Sovereign portal routes — parent / child / specialist after activation. */
export const TRIPLE_PORTAL_META = {
  parent: {
    path: '/parent',
    param: 'token',
    label: { ar: 'لوحة الأهل', en: 'Parent Dashboard' },
    emoji: '👨‍👩‍👧',
  },
  child: {
    path: '/child',
    param: 'token',
    label: { ar: 'عالم عوني — الطفل', en: 'Awni Play World' },
    emoji: '🌈',
  },
  specialist: {
    path: '/',
    param: 'token',
    section: 'specialists',
    label: { ar: 'البوابة السريرية', en: 'Clinical Portal' },
    emoji: '🩺',
  },
};

export function buildTriplePortalLinks(origin, tokens) {
  if (!tokens?.parent || !tokens?.child || !tokens?.specialist) return null;
  const base = String(origin ?? '').replace(/\/$/, '');
  const root = base || (typeof window !== 'undefined' ? window.location.origin : 'https://aunak.vercel.app');
  return {
    parent: `${root}/parent?token=${encodeURIComponent(tokens.parent)}`,
    child: `${root}/child?token=${encodeURIComponent(tokens.child)}`,
    specialist: `${root}/?section=specialists&token=${encodeURIComponent(tokens.specialist)}`,
    tokens,
  };
}
````

## File: src/main.jsx
````javascript
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { bootstrapMasterBypassFromUrl } from './lib/sovereignMasterBypass.js'

bootstrapMasterBypassFromUrl()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
````

## File: vercel.json
````json
{
  "rewrites": [
    {
      "source": "/((?!api/).*)",
      "destination": "/index.html"
    }
  ]
}
````

## File: .gitignore
````
# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

node_modules
dist
dist-ssr
*.local

# Editor directories and files
.vscode/*
!.vscode/extensions.json
.idea
.DS_Store
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

.vercel

# Local patch scripts & IDE debug artifacts
_patch/
.cursor/
.env*
````

## File: api/_handlers/tawasul/config.js
````javascript
import { sanitizeAscii } from '../../../src/lib/paymentActivation.js';

export const TAWASUL_BASE_ID = 'app3vCT2j2JepNVZa';
const TAWASUL_SPECIALISTS_TABLE = 'tblhVAdIeUmqDQTmi';
const TAWASUL_STUDENTS_TABLE = 'tbliBfCKXNyVtWJiO';

function resolveTawasulTable(envId, fallback) {
  const id = sanitizeAscii(envId);
  if (id === fallback) return id;
  if (!id) return fallback;
  // Ignore sovereign table IDs baked into env when verifying Tawasul sandbox tokens.
  return fallback;
}

export function resolveServerBaseId() {
  const raw =
    process.env.AIRTABLE_BASE_ID ||
    process.env.VITE_AIRTABLE_BASE_ID ||
    (process.env.VITE_TAWASUL_MVP === 'true' ? TAWASUL_BASE_ID : 'appaGfKj4vYhMw0cb');
  return sanitizeAscii(raw).split('/')[0];
}

export function tawasulVerifyConfig() {
  const apiKey = process.env.AIRTABLE_API_KEY || process.env.VITE_AIRTABLE_PAT;
  const envBase = resolveServerBaseId();
  const envSpecialistsTable =
    sanitizeAscii(process.env.VITE_AIRTABLE_SPECIALISTS_TABLE_ID) ||
    sanitizeAscii(process.env.AIRTABLE_SPECIALISTS_TABLE_ID);
  const envStudentsTable =
    sanitizeAscii(process.env.VITE_AIRTABLE_STUDENTS_TABLE_ID) ||
    sanitizeAscii(process.env.AIRTABLE_STUDENTS_TABLE_ID);
  return {
    apiKey,
    // Tawasul sandbox tokens — never the sovereign production base.
    baseId: envBase === TAWASUL_BASE_ID ? envBase : TAWASUL_BASE_ID,
    specialistsTable: resolveTawasulTable(envSpecialistsTable, TAWASUL_SPECIALISTS_TABLE),
    studentsTable: resolveTawasulTable(envStudentsTable, TAWASUL_STUDENTS_TABLE),
  };
}

export function tawasulServerConfig() {
  const apiKey = process.env.AIRTABLE_API_KEY || process.env.VITE_AIRTABLE_PAT;
  const baseId = resolveServerBaseId();
  const specialistsTable =
    sanitizeAscii(process.env.VITE_AIRTABLE_SPECIALISTS_TABLE_ID) ||
    sanitizeAscii(process.env.AIRTABLE_SPECIALISTS_TABLE_ID) ||
    (baseId === TAWASUL_BASE_ID ? TAWASUL_SPECIALISTS_TABLE : 'tblnmcLd5M3U6sErl');
  const studentsTable =
    sanitizeAscii(process.env.VITE_AIRTABLE_STUDENTS_TABLE_ID) ||
    sanitizeAscii(process.env.AIRTABLE_STUDENTS_TABLE_ID) ||
    (baseId === TAWASUL_BASE_ID ? TAWASUL_STUDENTS_TABLE : 'tblzYmBGmCxx2vdcr');
  return { apiKey, baseId, specialistsTable, studentsTable };
}

export function airtableHeaders(apiKey, { write = false } = {}) {
  const headers = {
    Authorization: `Bearer ${sanitizeAscii(apiKey)}`,
    Accept: 'application/json',
  };
  if (write) headers['Content-Type'] = 'application/json';
  return headers;
}
````

## File: api/airtable.js
````javascript
/**
 * Vercel serverless proxy for Airtable (keeps PAT off the client when VITE_USE_AIRTABLE_PROXY=true).
 * GET|POST|PATCH /api/airtable?table=tblXXX&recordId=recXXX (optional)
 */

function sanitizeAscii(value) {
  if (value == null) return "";
  return String(value)
    .replace(/^\uFEFF/, "")
    .replace(/\u200B/g, "")
    .replace(/[\r\n\t]/g, "")
    .replace(/[^\x20-\x7E]/g, "")
    .trim();
}

function sanitizeHeaders(headers) {
  const out = {};
  for (const [name, value] of Object.entries(headers || {})) {
    const key = sanitizeAscii(name);
    const val = sanitizeAscii(value);
    if (key && val) out[key] = val;
  }
  return out;
}

export default async function handler(req, res) {
  const method = req.method?.toUpperCase?.() || "GET";
  if (!["GET", "POST", "PATCH"].includes(method)) {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const tableId = req.query?.table;
  if (!tableId || typeof tableId !== "string") {
    res.status(400).json({ error: "Missing ?table= query parameter" });
    return;
  }

  const apiKey = process.env.AIRTABLE_API_KEY || process.env.VITE_AIRTABLE_PAT;
  const baseId = sanitizeAscii(
    process.env.AIRTABLE_BASE_ID ||
      process.env.VITE_AIRTABLE_BASE_ID ||
      (process.env.VITE_TAWASUL_MVP === "true" ? "app3vCT2j2JepNVZa" : "appaGfKj4vYhMw0cb")
  ).split("/")[0];

  if (!apiKey) {
    res.status(500).json({ error: "AIRTABLE_API_KEY not configured on server" });
    return;
  }

  const recordId = req.query?.recordId;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(req.query || {})) {
    if (key === "table" || key === "recordId") continue;
    if (value != null && value !== "") params.set(key, String(value));
  }

  const qs = params.toString();
  const recordSuffix =
    recordId && typeof recordId === "string" ? `/${encodeURIComponent(recordId)}` : "";
  const url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableId)}${recordSuffix}${qs ? `?${qs}` : ""}`;

  const headers = sanitizeHeaders({
    Authorization: `Bearer ${sanitizeAscii(apiKey)}`,
    Accept: "application/json",
    ...(method !== "GET" ? { "Content-Type": "application/json" } : {}),
  });

  try {
    const init = { method, headers };
    if (method !== "GET" && req.body != null) {
      init.body = typeof req.body === "string" ? req.body : JSON.stringify(req.body);
    }
    const response = await fetch(url, init);
    const body = await response.text();
    res.status(response.status).setHeader("Content-Type", "application/json");
    res.send(body);
  } catch (err) {
    res.status(502).json({ error: err?.message ?? "Proxy fetch failed" });
  }
}
````

## File: docs/TAWASUL_MVP.md
````markdown
# Tawasul MVP — منصة تواصل (Isolated Sandbox)

> **Branch:** `Tawasul_MVP` · **Main branch:** frozen standby · **Flag:** `VITE_TAWASUL_MVP=true`

Independent MVP for remote specialist–child communication. No merge into `main` until sovereign sign-off.

---

## 1. Git & Vercel (Preview subdomain)

```bash
git checkout Tawasul_MVP
git push -u origin Tawasul_MVP
```

**Vercel**

1. Project → Settings → Git → Production Branch stays **`main`** (standby).
2. Enable **Preview Deployments** for branch `Tawasul_MVP`.
3. Settings → Environment Variables → scope **Preview** + branch filter `Tawasul_MVP`:

| Variable | Value |
|----------|--------|
| `VITE_TAWASUL_MVP` | `true` |
| `VITE_AIRTABLE_BASE_ID` | *(new free base ID)* |
| `VITE_AIRTABLE_PAT` | Personal access token |
| `AIRTABLE_API_KEY` | Same PAT (server routes) |
| `AIRTABLE_BASE_ID` | Same base ID |
| `VITE_AIRTABLE_STUDENTS_TABLE_ID` | `tbl…` from URL |
| `VITE_AIRTABLE_SPECIALISTS_TABLE_ID` | `tbl…` |
| `VITE_AIRTABLE_DAILY_SESSIONS_TABLE_ID` | `tbl…` |
| `AIRTABLE_DAILY_SESSIONS_TABLE_ID` | Same sessions table |

4. Optional: Domains → assign preview alias e.g. `tawasul.aunak.vercel.app` to latest `Tawasul_MVP` deployment.

**Local dev**

```bash
# .env.local on this branch only
VITE_TAWASUL_MVP=true
VITE_AIRTABLE_BASE_ID=appXXXXXXXXXXXXXX
# … table IDs …
npm run dev
```

---

## 2. Airtable base (live — `app3vCT2j2JepNVZa`)

| Table | ID |
|-------|-----|
| Specialists | `tblhVAdIeUmqDQTmi` |
| Students | `tbliBfCKXNyVtWJiO` |
| Daily Sessions | `tbl8su5soBPDeGb6Z` |

**Note:** UI field `Name` maps to `student_name` / `specialist_name` in code via fallback.

Extend sovereignty columns (mirror + assessment):

```bash
node scripts/tawasul-extend-schema.mjs
```

### tblSpecialists

| Field | Type | Notes |
|-------|------|-------|
| `specialist_name` | Single line text | e.g. حازم |
| `specialist_tutor_token` | Single line text | `AUN-SPC-{32hex}` |
| `professional_email` | Email | optional |
| `status` | Single select | `active` |

**Seed:** exactly **2 rows** (حازم + الأخصائي 2).

### tblStudents (max 10 rows)

| Field | Type | Notes |
|-------|------|-------|
| `student_name` | Single line text | |
| `student_id` | Single line text | |
| `age` | Number | |
| `status` | Single select | `active` |
| `assigned_specialist` | **Link → Specialists** | Permy isolation (5 per specialist) |
| `child_interactive_token` | Single line text | `AUN-CHD-…` |
| `specialist_tutor_token` | Single line text | copy of owning specialist token |
| `programmed_goal` | Long text | shown on child **Home** tab |
| `mirror_command` | Single line text | Ghost Mirror: `echo_goal`, `drop_star`, `calm_pulse` |
| `mirror_payload` | Single line text | mirror nonce / payload |
| `initial_assessment_score` | Number | AppSheet assessment |
| `comprehensive_assessment_status` | Single select | `not_started`, `in_progress`, `completed` |

### tblDailySessions (Tawasul live schema)

| Field | Type | Notes |
|-------|------|-------|
| `Session Date` | Date | |
| `Session Notes` | Long text | includes `AUN-4611 · Island World` marker |
| `student` | Link → Students | |
| `Daily Goal Achieved` | Checkbox | set on seal |
| `Session Duration (min)` | Number | derived from interactions |

Child play (`/child?token=…`) triggers `POST /api/session/child-seal` after **5 interactions** → one sealed row per student per day (`tawasulSessionSeal.js` on Tawasul base).

---

## 8. Sovereignty engines (Tawasul full lab)

| Engine | Route / file | Behavior |
|--------|----------------|----------|
| Zero Entry assessment | `POST /api/tawasul/assessment-sync` | AppSheet → auto `programmed_goal` from score |
| Ghost Mirror | `POST /api/tawasul/mirror` + `TawasulMirrorPanel` | Specialist echoes goal, drops stars, calm pulse → child polls Airtable every 3.5s |
| Idle gaze (5s) | `useTawasulIdleGaze` | Play tab idle → typewriter audio cue |
| Hybrid Awni | `ChildAwniCompanion` | Speaks when calm; silent + calm body on meltdown risk |
| Sovereign Island UI | `tawasulChildTheme.js` | Matte black · gold · emerald neon child shell |
| Session seal | `api/session/child-seal.js` | Routes to Tawasul schema when `VITE_TAWASUL_MVP=true` |

**Excluded (by design):** biometric login, sovereign access control, deep admin, payment activation gate.

**AppSheet webhook:** point automation to `https://<preview>/api/tawasul/assessment-sync` with body `{ "recordId": "rec…", "fields": { "initial_assessment_score": 72, "comprehensive_assessment_status": "completed" } }`.

---

## 3. Seed script

After creating tables and copying table IDs into `.env.local`:

```bash
node scripts/tawasul-seed.mjs
```

Outputs specialist tokens, child tokens, and record IDs for QA.

---

## 4. Specialist isolation (Permy filter)

- Login: `specialist_tutor_token` from **Specialists** table (not Access Control).
- Caseload: students where `assigned_specialist` links to specialist `recordId` (max 5).
- Fallback: match `students.specialist_tutor_token` during migration.

Code: `src/lib/specialistIsolation.js`, `src/lib/tawasulAuth.js`.

---

## 5. Child UI (`ChildInteractiveShell`)

Route: `/child?token=AUN-CHD-…`

Bottom nav:

| Tab | AR | Content |
|-----|-----|---------|
| home | الرئيسية | `programmed_goal` from specialist panel |
| play | العب | Island play + session seal |
| calm | هدوء | Breathing exercise |
| stars | نجومي | Session star counter |

---

## 6. AppSheet comprehensive assessment

1. Duplicate current assessment AppSheet app.
2. Point data destination to **new base** → `tblStudents`.
3. Map columns: `student_name`, `initial_assessment_score`, `comprehensive_assessment_status`.
4. Do **not** point AppSheet at production base `appaGfKj4vYhMw0cb`.

---

## 7. Accounting note (daily sessions)

Sealed rows in **Daily Sessions** (`Session Notes` contains island marker) are the billing source of truth. Count rows per `student` link / `Session Date` — not manual notes in Students.

---

## URLs (after deploy)

| Role | URL |
|------|-----|
| Specialist | `https://<tawasul-preview>/tawasul` → token gate (also `/` when `VITE_TAWASUL_MVP=true`) |
| Child | `https://<tawasul-preview>/child?token=AUN-CHD-…` |

Main production `https://aunak.vercel.app` remains on `main` unchanged.
````

## File: scripts/airtable-diagnostic.mjs
````javascript
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const BASE_ID = "appaGfKj4vYhMw0cb";
const STUDENTS_TABLE = "tblzYmBGmCxx2vdcr";

const envText = readFileSync(resolve(ROOT, ".env.local"), "utf8");
const pat = envText.match(/VITE_AIRTABLE_PAT=(.+)/)?.[1]?.trim();
if (!pat) {
  console.error("No VITE_AIRTABLE_PAT in .env.local");
  process.exit(1);
}

const headers = { Authorization: `Bearer ${pat}`, Accept: "application/json" };

const HUB_TABLES = {
  scientificItems: "tblnCbBSmwDWwO5SJ",
  specialists: "tblnmcLd5M3U6sErl",
  abcData: "tblJ580ptTVkv07hD",
  safeMedia: "tbljdOSE8CozrzBZN",
  melodyLab: "tblMddsXqCz91hfoU",
  communityResources: "tblV28iWarzve32pP",
  accessControl: "tblfBvd5WI7alVCFU",
  learningDifficulties: "tblcNXSmU90TomEHH",
  emotionalMonitoring: "tblokLHmSHss3FQft",
};

const SECTIONS = [
  { id: "live", label: "Live Registry", tableId: STUDENTS_TABLE },
  { id: "registry", label: "Session Registry", tableId: STUDENTS_TABLE },
  { id: "diagnostics", label: "Diagnostics", tableId: STUDENTS_TABLE },
  { id: "classrooms", label: "Classrooms", tableId: STUDENTS_TABLE },
  { id: "community", label: "Aunak Community", tableId: STUDENTS_TABLE },
  { id: "behavior", label: "Behavior Mod (ABC)", tableId: HUB_TABLES.abcData },
  { id: "scientific", label: "Scientific Lib", tableId: HUB_TABLES.scientificItems },
  { id: "specialists", label: "Specialists", tableId: HUB_TABLES.specialists },
  { id: "media", label: "Safe Media", tableId: HUB_TABLES.safeMedia },
  { id: "emotion", label: "Melodies Lab", tableId: HUB_TABLES.melodyLab },
  { id: "resources", label: "Resources", tableId: HUB_TABLES.communityResources },
  { id: "access", label: "Access Control", tableId: HUB_TABLES.accessControl },
  { id: "learning", label: "Learning Center", tableId: HUB_TABLES.learningDifficulties },
  { id: "crisis", label: "Smart Shield / Emotion", tableId: HUB_TABLES.emotionalMonitoring },
  { id: "biometrics", label: "Biometrics ID", tableId: STUDENTS_TABLE },
  { id: "goalAttempts", label: "Goal Attempts (Dynamic Flow)", tableId: process.env.VITE_AIRTABLE_GOAL_ATTEMPTS_TABLE_ID || "" },
];

async function fetchJson(url) {
  const res = await fetch(url, { headers });
  const text = await res.text();
  let body;
  try {
    body = JSON.parse(text);
  } catch {
    body = text;
  }
  return { status: res.status, ok: res.ok, body };
}

console.log("=== AUNAK AIRTABLE DIAGNOSTIC ===");
console.log(`Base: ${BASE_ID}`);
console.log(`Client: src/lib/airtable.js`);
console.log("");

const meta = await fetchJson(`https://api.airtable.com/v0/meta/bases/${BASE_ID}/tables`);
console.log("--- Base Meta (tables list) ---");
let tables = [];
if (meta.ok) {
  tables = meta.body.tables || [];
  console.log(`Status: OK (${meta.status})`);
  console.log(`Tables found: ${tables.length}`);
  for (const t of tables) console.log(`  - ${t.name} | ${t.id}`);
} else {
  console.log(`Status: FAIL (${meta.status})`);
  console.log(typeof meta.body === "object" ? JSON.stringify(meta.body, null, 2) : meta.body);
}

console.log("");
console.log("--- Students Table (as fetchStudents() does) ---");
const withView = await fetchJson(
  `https://api.airtable.com/v0/${BASE_ID}/${STUDENTS_TABLE}?maxRecords=1&view=Grid%20view`
);
console.log(`Table: ${STUDENTS_TABLE}`);
console.log(`Grid view: ${withView.status} ${withView.ok ? "OK" : "FAIL"}`);
if (!withView.ok) {
  const noView = await fetchJson(
    `https://api.airtable.com/v0/${BASE_ID}/${STUDENTS_TABLE}?maxRecords=1`
  );
  console.log(`Fallback (no view): ${noView.status} ${noView.ok ? "OK" : "FAIL"}`);
  if (noView.ok) console.log(`Records returned: ${(noView.body.records || []).length}`);
} else {
  console.log(`Records returned: ${(withView.body.records || []).length}`);
}

if (tables.length) {
  console.log("");
  console.log("--- All Base Tables Fetch Probe ---");
  for (const t of tables) {
    const r = await fetchJson(
      `https://api.airtable.com/v0/${BASE_ID}/${t.id}?maxRecords=1`
    );
    console.log(`${r.ok ? "OK  " : "FAIL"} ${r.status} | ${t.name} (${t.id})`);
  }
}

console.log("");
console.log("--- 15 Hub Sections (all wired to Airtable) ---");
let failCount = 0;
for (const s of SECTIONS) {
  const r = await fetchJson(
    `https://api.airtable.com/v0/${BASE_ID}/${s.tableId}?maxRecords=1`
  );
  if (!r.ok) failCount++;
  const count = r.ok ? (r.body.records || []).length : 0;
  console.log(
    `${r.ok ? "OK  " : "FAIL"} ${r.status} | ${s.id.padEnd(12)} | ${s.label} -> ${s.tableId} (${count} sample)`
  );
}

console.log("");
console.log("--- Pagination (fetchAllRecords simulation) ---");
{
  let offset;
  let total = 0;
  let pages = 0;
  do {
    const qs = new URLSearchParams({ pageSize: "100", view: "Grid view" });
    if (offset) qs.set("offset", offset);
    const r = await fetchJson(
      `https://api.airtable.com/v0/${BASE_ID}/${STUDENTS_TABLE}?${qs}`
    );
    pages++;
    if (!r.ok) {
      console.log(`Page ${pages}: FAIL ${r.status}`);
      break;
    }
    total += (r.body.records || []).length;
    offset = r.body.offset;
  } while (offset);
  console.log(`Pages: ${pages}, Total student records: ${total}`);
}

const src = readFileSync(resolve(ROOT, "src/lib/airtable.js"), "utf8");
const hardcodedMatch = src.match(/HARDCODED_API_KEY = "([^"]+)"/);
const hardcoded = hardcodedMatch?.[1] ?? "unknown";
console.log("");
console.log("--- Client config (src/lib/airtable.js) ---");
console.log(
  `HARDCODED_API_KEY: ${hardcoded === "put_your_token_here" ? "PLACEHOLDER (dev relies on .env.local)" : "SET"}`
);
console.log(`VITE_AIRTABLE_PAT: ${pat.startsWith("pat") ? "present" : "missing"}`);
console.log(`Hub tables configured: ${Object.keys(HUB_TABLES).length} (+ students table)`);
console.log(`Hook: useAirtableData / useAirtableSection in src/hooks/useAirtableData.js`);

console.log("");
console.log("--- Summary ---");
const dataApiOk = withView.ok;
console.log(`Data API (records): ${dataApiOk ? "stable (200)" : "failed"}`);
console.log(`Meta API (schema): ${meta.ok ? "ok" : "403 — token lacks schema.bases:read scope (non-blocking)"}`);
console.log(`Tables enumerated: ${tables.length || "n/a (meta blocked)"}`);
console.log(`Sections wired to Airtable: ${SECTIONS.length}/15`);
console.log(`Failed section fetches: ${failCount}`);
console.log(`Platform status: ${failCount === 0 && dataApiOk ? "15/15 LIVE" : "NEEDS ATTENTION"}`);
process.exit(failCount > 0 || !dataApiOk ? 1 : 0);
````

## File: src/components/AunakBehaviorMod.jsx
````javascript
import { useState, useEffect } from 'react';
import { useStudents } from '../hooks/useStudents';
import { useAirtableData } from '../hooks/useAirtableData';
import { AIRTABLE_TABLES } from '../lib/airtableTables';
import { mapAbcPlan } from '../lib/airtableMappers';
import { AirtableEmpty, AirtableErrorBanner, AirtableLoading } from './AirtableStatus';
import { TrendingDown, BrainCircuit, LineChart, FileSignature, Target } from 'lucide-react';
import { LUX } from '../lib/luxTheme.js';

export default function AunakBehaviorMod({ lang = 'ar' }) {
  const { students } = useStudents(lang);
  const { records: plans, loading, error, isEmpty } = useAirtableData(AIRTABLE_TABLES.abcData, {
    mapRecord: mapAbcPlan,
    lang,
  });

  const [activePlan, setActivePlan] = useState(null);

  const t = {
    ar: {
      title: 'إدارة تعديل السلوك',
      subtitle: 'خطط ABC — بيانات حية من Airtable',
      targetStudent: 'الطالب المستهدف:',
      activePlans: 'الخطط السلوكية النشطة',
      emptyAbc: 'لا توجد بيانات ABC حالياً',
      planDetails: 'تفاصيل خطة التدخل',
      targetBehavior: 'السلوك المستهدف',
      strategyLabel: 'استراتيجية التدخل وملاحظات التقدم (نص حر)',
      strategyPlaceholder: 'أدخل استراتيجيات التدخل وملاحظات الجلسة هنا...',
      chartTitle: 'منحنى شدة السلوك (AI)',
      viewChart: 'عرض تفاصيل الرسم البياني',
      planMeta: (title, intensity) => `الخطة: ${title} — ${intensity}`,
      abcFallback: 'بيانات ABC من Airtable',
      progressTitle: 'تقييم التقدم الذكي',
      progressBody: 'تشير البيانات التحليلية إلى استجابة ممتازة لاستراتيجية (التعزيز التفاضلي). يُنصح بتقليل المحفزات المادية تدريجياً.',
    },
    en: {
      title: 'Behavior Modification',
      subtitle: 'ABC plans — live data from Airtable',
      targetStudent: 'Target student:',
      activePlans: 'Active Behavior Plans',
      emptyAbc: 'No ABC data available',
      planDetails: 'Intervention Plan Details',
      targetBehavior: 'Target Behavior',
      strategyLabel: 'Intervention strategy & progress notes (free text)',
      strategyPlaceholder: 'Enter intervention strategies and session notes here...',
      chartTitle: 'Behavior Intensity Curve (AI)',
      viewChart: 'View Chart Details',
      planMeta: (title, intensity) => `Plan: ${title} — ${intensity}`,
      abcFallback: 'ABC data from Airtable',
      progressTitle: 'Smart Progress Assessment',
      progressBody: 'Analytics indicate excellent response to differential reinforcement. Recommend gradually reducing tangible reinforcers.',
    },
  };

  const copy = t[lang] ?? t.ar;

  useEffect(() => {
    if (plans.length > 0) {
      setActivePlan((prev) =>
        prev && plans.some((p) => p.id === prev) ? prev : plans[0].id
      );
    } else {
      setActivePlan(null);
    }
  }, [plans]);

  const active = plans.find((p) => p.id === activePlan) ?? null;

  return (
    <div className="p-6 md:p-10 min-h-screen bg-[#0a0a0c] text-slate-200 font-sans" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <header className="mb-8 border-b border-[#c9a962]/15 pb-6 flex justify-between items-center">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-orange-400 flex items-center gap-3">
            <TrendingDown className="w-10 h-10" /> {copy.title}
          </h2>
          <p className="text-slate-400 mt-2 text-lg font-mono">{copy.subtitle}</p>
        </div>
      </header>

      <AirtableErrorBanner error={error} />

      <div className="grid lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-[#12121a]/70 backdrop-blur-xl border border-[#c9a962]/15 shadow-[0_0_48px_rgba(201,169,98,0.1)] p-5 rounded-2xl border border-[#c9a962]/15">
            <h3 className="text-sm text-slate-500 mb-2 font-bold">{copy.targetStudent}</h3>
            <p className="text-xl font-bold text-slate-300 flex items-center gap-2">
               {students?.[0]?.name || '—'}
            </p>
          </div>
          
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-slate-300 mb-2 border-b border-[#c9a962]/15 pb-2">{copy.activePlans}</h3>
            {loading ? (
              <AirtableLoading lang={lang} />
            ) : isEmpty ? (
              <AirtableEmpty lang={lang} message={copy.emptyAbc} />
            ) : (
            plans.map(plan => (
              <button 
                key={plan.id}
                type="button"
                onClick={() => setActivePlan(plan.id)}
                className={`w-full ${lang === 'ar' ? 'text-right' : 'text-left'} p-4 rounded-xl border transition-all ${activePlan === plan.id ? 'bg-[#c9a962]/10 border-[#c9a962]/35/50 text-[#e8c872] shadow-lg' : 'bg-[#12121a]/70 backdrop-blur-xl border border-[#c9a962]/15 shadow-[0_0_48px_rgba(201,169,98,0.1)] border-[#c9a962]/15 text-slate-400 hover:bg-[#12121a]/70'}`}
              >
                <h4 className="font-bold text-sm mb-1">{plan.title}</h4>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">{plan.status}</span>
                  <span className="text-emerald-400" dir="ltr">{plan.intensity}</span>
                </div>
              </button>
            ))
            )}
          </div>
        </div>

        <div className="lg:col-span-3 space-y-6">
           <div className="bg-[#12121a]/70 backdrop-blur-xl border border-[#c9a962]/15 shadow-[0_0_48px_rgba(201,169,98,0.1)] p-8 rounded-3xl border border-[#c9a962]/15 shadow-xl">
              <div className="flex justify-between items-center mb-6 border-b border-[#c9a962]/15 pb-4">
                 <h3 className="text-2xl font-bold text-slate-300 flex items-center gap-2"><FileSignature className="w-6 h-6 text-orange-400" /> {copy.planDetails}</h3>
                 {active && (
                 <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-mono font-bold animate-pulse">{active.status}</span>
                 )}
              </div>
              
              {loading ? (
                <AirtableLoading lang={lang} />
              ) : !active ? (
                <AirtableEmpty lang={lang} />
              ) : (
              <div className="space-y-5">
                 <div className="p-4 bg-[#0d0d10]/90 rounded-xl border border-[#c9a962]/15">
                    <p className="text-sm text-slate-500 mb-2 font-bold flex items-center gap-2"><Target className="w-4 h-4" /> {copy.targetBehavior}</p>
                    <p className="text-slate-200">{active.behavior}</p>
                 </div>
                 <div>
                    <label className="text-sm text-slate-400 mb-2 block font-bold">{copy.strategyLabel}</label>
                    <textarea className="w-full h-24 bg-[#0d0d10]/90 border border-white/[0.08] rounded-xl p-4 text-slate-300 focus:border-[#c9a962]/45 outline-none text-sm" placeholder={copy.strategyPlaceholder}></textarea>
                 </div>
              </div>
              )}
           </div>

           <div className="grid md:grid-cols-2 gap-6">
               <div className="bg-orange-900/10 p-6 rounded-3xl border border-[#c9a962]/35/20 flex flex-col items-center justify-center text-center shadow-[0_0_30px_rgba(249,115,22,0.05)] relative overflow-hidden group">
                  <div className="absolute inset-0 bg-[#0d0d10]/90/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center z-10">
                     <button type="button" className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg font-bold">{copy.viewChart}</button>
                  </div>
                  <LineChart className="w-16 h-16 text-orange-500/50 mb-3" />
                  <h3 className="text-lg font-bold text-[#e8c872]">{copy.chartTitle}</h3>
                  <p className="text-xs text-orange-200/60 mt-2 font-mono">
                    {active ? copy.planMeta(active.title, active.intensity) : copy.abcFallback}
                  </p>
               </div>

               <div className="bg-[#12121a]/70 backdrop-blur-xl border border-[#c9a962]/15 shadow-[0_0_48px_rgba(201,169,98,0.1)] p-6 rounded-3xl border border-[#c9a962]/15 flex flex-col justify-center">
                  <h3 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2"><BrainCircuit className="w-5 h-5 text-emerald-400" /> {copy.progressTitle}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed p-4 bg-[#0d0d10]/90 rounded-xl border border-[#c9a962]/15">
                     {copy.progressBody}
                  </p>
               </div>
           </div>
        </div>
      </div>
    </div>
  );
}
````

## File: src/components/AunakEmotionalLab.jsx
````javascript
import { useState, useEffect, useMemo } from 'react';
import { Camera, Music, Smile, Activity, BrainCircuit, PlayCircle } from 'lucide-react';
import { useAirtableData } from '../hooks/useAirtableData';
import { AIRTABLE_TABLES } from '../lib/airtableTables';
import { mapMelodyPattern, mapEmotionSignal } from '../lib/airtableMappers';
import { AirtableEmpty, AirtableErrorBanner, AirtableLoading } from './AirtableStatus';
import { LUX } from '../lib/luxTheme.js';

export default function AunakEmotionalLab({ lang = 'ar' }) {
  const { records: patterns, loading, error, isEmpty } = useAirtableData(AIRTABLE_TABLES.melodyLab, {
    mapRecord: mapMelodyPattern,
    lang,
  });

  const {
    records: emotionSignals,
    loading: emotionLoading,
    error: emotionError,
    isEmpty: emotionEmpty,
  } = useAirtableData(AIRTABLE_TABLES.emotionalMonitoring, {
    mapRecord: mapEmotionSignal,
    lang,
  });

  const topEmotion = emotionSignals[0] ?? null;

  const resolvedEmotionLabel = useMemo(() => {
    if (!topEmotion) return null;
    if (topEmotion.linkedPatternId) {
      const linked = patterns.find((p) => p.id === topEmotion.linkedPatternId);
      if (linked?.name) return linked.name;
    }
    if (topEmotion.label && !/^rec[a-zA-Z0-9]{10,}$/.test(topEmotion.label)) {
      return topEmotion.label;
    }
    if (topEmotion.preferredPattern) {
      return lang === 'en' ? 'Preferred pattern active' : 'نمط مفضل نشط';
    }
    return lang === 'en' ? 'Emotional monitoring active' : 'رصد عاطفي نشط';
  }, [topEmotion, patterns, lang]);

  const [activePattern, setActivePattern] = useState(null);

  const t = {
    ar: {
      title: 'مختبر ألحان عونك والرصد العاطفي',
      subtitle: 'أنماط صوتية حية من Airtable (مختبر الألحان)',
      liveMonitoring: 'الرصد العاطفي اللحظي',
      detected: (label, score) => `رصد: ${label} (${score}%)`,
      scanning: (au) => `Face AUs: ${au || 'SCANNING...'}`,
      patterns: 'الأنماط الصوتية التعليمية',
      emptyMelody: 'لا توجد بيانات حالياً في مختبر الألحان',
      interaction: 'مؤشر التفاعل',
      aiAnalysis: (name, score) => `تحليل الذكاء الاصطناعي: ${name} — ${score}% تفاعل.`,
    },
    en: {
      title: 'Aunak Melodies Lab & Emotional Monitoring',
      subtitle: 'Live audio patterns from Airtable (Melody Lab)',
      liveMonitoring: 'Live Emotional Monitoring',
      detected: (label, score) => `Detected: ${label} (${score}%)`,
      scanning: (au) => `Face AUs: ${au || 'SCANNING...'}`,
      patterns: 'Educational Audio Patterns',
      emptyMelody: 'No data in Melody Lab yet',
      interaction: 'Interaction Index',
      aiAnalysis: (name, score) => `AI analysis: ${name} — ${score}% engagement.`,
    },
  };

  const copy = t[lang] ?? t.ar;

  useEffect(() => {
    if (patterns.length > 0) {
      const firstId = patterns[0].id;
      setActivePattern((prev) =>
        prev && patterns.some((p) => p.id === prev) ? prev : firstId
      );
    }
  }, [patterns]);

  const active = patterns.find((p) => p.id === activePattern) ?? null;

  return (
    <div className="p-6 md:p-10 min-h-screen text-slate-200" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
       <header className="mb-8 border-b border-[#c9a962]/15 pb-6">
         <h2 className={`${LUX.titleGradient} flex items-center gap-3`}>
           <Music className="w-8 h-8" /> {copy.title}
         </h2>
         <p className="text-slate-400 mt-2">{copy.subtitle}</p>
       </header>

       <AirtableErrorBanner error={error || emotionError} />

       <div className="grid lg:grid-cols-2 gap-8">
         <div className="bg-[#12121a]/70 backdrop-blur-xl border border-[#c9a962]/15 shadow-[0_0_48px_rgba(201,169,98,0.1)] p-6 rounded-3xl border border-[#c9a962]/15 shadow-xl">
           <div className="flex items-center justify-between mb-4 border-b border-[#c9a962]/15 pb-4">
             <div className="flex items-center gap-2 text-emerald-400 font-mono text-sm">
               <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> AI CAMERA ACTIVE
             </div>
             <Camera className="w-5 h-5 text-slate-500" />
           </div>
           <div className="relative aspect-video bg-[#0d0d10]/90 rounded-xl border border-white/[0.08] flex flex-col items-center justify-center overflow-hidden">
             <div className="absolute inset-0 border-2 border-emerald-400/20 rounded-xl animate-pulse" />
             <Smile className="w-16 h-16 text-emerald-400 mb-4" strokeWidth={1.5} />
             <div className="text-center z-10">
               <h3 className="font-bold text-slate-200">{copy.liveMonitoring}</h3>
               {emotionLoading ? (
                 <AirtableLoading lang={lang} />
               ) : emotionEmpty ? (
                 <AirtableEmpty lang={lang} />
               ) : (
               <p className="text-xs text-slate-400 font-mono mt-2">
                 {resolvedEmotionLabel
                   ? copy.detected(resolvedEmotionLabel, topEmotion?.score ?? '—')
                   : copy.scanning(active?.au !== '—' ? active?.au : null)}
               </p>
               )}
             </div>
           </div>
         </div>

         <div className="space-y-4">
           <h3 className="text-xl font-bold text-[#d4af37] flex items-center gap-2 mb-6">
             <Activity className="w-5 h-5" /> {copy.patterns}
           </h3>
           {loading ? (
             <AirtableLoading lang={lang} />
           ) : isEmpty ? (
             <AirtableEmpty lang={lang} message={copy.emptyMelody} />
           ) : (
           patterns.map(pattern => (
             <button key={pattern.id} type="button" onClick={() => setActivePattern(pattern.id)} className={`w-full flex items-center justify-between p-5 rounded-2xl border transition-all ${activePattern === pattern.id ? 'bg-cyan-900/30 border-emerald-400 shadow-[0_0_20px_rgba(6,182,212,0.2)]' : 'bg-[#12121a]/70 backdrop-blur-xl border border-[#c9a962]/15 shadow-[0_0_48px_rgba(201,169,98,0.1)] border-[#c9a962]/15 hover:border-slate-600'}`}>
               <div className={lang === 'ar' ? 'text-right' : 'text-left'}>
                 <h4 className="font-bold text-slate-300 flex items-center gap-2"><PlayCircle className={`w-4 h-4 ${activePattern === pattern.id ? 'text-emerald-400' : 'text-slate-500'}`} /> {pattern.name}</h4>
                 <p className="text-sm text-slate-400 mt-1">{pattern.desc}</p>
               </div>
               <div className={lang === 'ar' ? 'text-left' : 'text-right'}>
                 <div className="text-2xl font-black text-emerald-400">{pattern.score}%</div>
                 <div className="text-[10px] text-slate-500">{copy.interaction}</div>
               </div>
             </button>
           ))
           )}
           {active && (
             <div className="mt-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex gap-3">
               <BrainCircuit className="w-6 h-6 text-emerald-400 shrink-0" />
               <p className="text-sm text-emerald-200">{copy.aiAnalysis(active.name, active.score)}</p>
             </div>
           )}
         </div>
       </div>
    </div>
  );
}
````

## File: src/components/AunakLearningCenter.jsx
````javascript
import { useState, useEffect, useMemo } from 'react';
import {
  BookOpen,
  Brain,
  Eye,
  GraduationCap,
  Lightbulb,
  Sparkles,
  TrendingUp,
  Trophy,
} from 'lucide-react';
import { useAirtableData } from '../hooks/useAirtableData';
import { useGazeNeutralityObserver } from '../hooks/useGazeNeutralityObserver';
import { detectGazeNeutralityCondition } from '../lib/sovereignProtocol';
import { useStudents } from '../hooks/useStudents';
import { useAuth } from '../lib/auth';
import { AIRTABLE_TABLES } from '../lib/airtableTables';
import { mapLearningRecord } from '../lib/airtableMappers';
import { AirtableEmpty, AirtableErrorBanner, AirtableLoading } from './AirtableStatus';
import { LUX } from '../lib/luxTheme.js';

const GROWTH_PILLARS = {
  ar: [
    { id: 'literacy', label: 'القراءة والكتابة', icon: BookOpen, color: 'gold' },
    { id: 'cognitive', label: 'المهارات المعرفية', icon: Brain, color: 'emerald' },
    { id: 'focus', label: 'التركيز والانتباه', icon: Lightbulb, color: 'muted' },
    { id: 'progress', label: 'التقدم الأكاديمي', icon: TrendingUp, color: 'emerald' },
  ],
  en: [
    { id: 'literacy', label: 'Literacy Skills', icon: BookOpen, color: 'gold' },
    { id: 'cognitive', label: 'Cognitive Skills', icon: Brain, color: 'emerald' },
    { id: 'focus', label: 'Focus & Attention', icon: Lightbulb, color: 'muted' },
    { id: 'progress', label: 'Academic Progress', icon: TrendingUp, color: 'emerald' },
  ],
};

const PILLAR_STYLES = {
  gold: {
    card: LUX.pillarGold,
    icon: 'text-[#e8c872] bg-[#c9a962]/12 border border-[#c9a962]/25',
    bar: 'bg-gradient-to-r from-[#c9a962] to-[#d4af37]',
  },
  emerald: {
    card: LUX.pillarEmerald,
    icon: 'text-emerald-400 bg-emerald-500/12 border border-emerald-400/25',
    bar: 'bg-emerald-400',
  },
  muted: {
    card: LUX.pillarMuted,
    icon: 'text-[#e8c872] bg-[#c9a962]/8 border border-[#c9a962]/20',
    bar: 'bg-[#c9a962]/60',
  },
};

const PENDING = '—';

export default function AunakLearningCenter({ lang = 'ar' }) {
  const { records, error, isEmpty, loading } = useAirtableData(AIRTABLE_TABLES.learningDifficulties, {
    mapRecord: mapLearningRecord,
    lang,
  });
  const { students } = useStudents(lang);
  const { user } = useAuth();

  const latest = records[0] ?? null;
  const pillars = GROWTH_PILLARS[lang] ?? GROWTH_PILLARS.ar;

  const [activePillar, setActivePillar] = useState(pillars[0]?.id ?? 'literacy');

  const t = {
    ar: {
      title: 'مركز النمو الأكاديمي والمعرفي',
      subtitle: 'المتابعة التربوية والتأهيلية — مسارات تعليمية مخصصة من Airtable',
      subtitleStudent: (name) => `الطالب: ${name}`,
      subtitleGoal: (goal) => `الهدف التعليمي: ${goal}`,
      subtitleEmpty: 'لا توجد بيانات تعليمية حالياً — أضف سجلات في Airtable',
      noAssessment: 'لم يُجرَ اختبار بعد',
      badge: 'مركز تعليمي',
      growthHub: 'محاور النمو',
      engagement: 'مؤشر المشاركة التعليمية',
      engagementHint: 'يعكس مدى تفاعل المتعلم مع الأنشطة الأكاديمية',
      focus: 'مستوى التركيز الأكاديمي',
      milestone: 'إنجاز الأسبوع',
      coachTip: 'توصية المعلّم الذكي',
      applyTip: 'تطبيق التوصية',
      sessionNotes: 'ملاحظات التقدم التربوي',
      recordsCount: (n) => `${n} سجلات تعليمية`,
    },
    en: {
      title: 'Academic & Cognitive Growth Hub',
      subtitle: 'Educational & rehabilitative follow-up — personalized learning paths from Airtable',
      subtitleStudent: (name) => `Student: ${name}`,
      subtitleGoal: (goal) => `Learning goal: ${goal}`,
      subtitleEmpty: 'No educational records yet — add entries in Airtable',
      noAssessment: 'No assessment yet',
      badge: 'Learning Hub',
      growthHub: 'Growth Pillars',
      engagement: 'Educational Engagement Index',
      engagementHint: 'Reflects learner participation in academic activities',
      focus: 'Academic Focus Level',
      milestone: 'Weekly Milestone',
      coachTip: 'Smart Educator Tip',
      applyTip: 'Apply Recommendation',
      sessionNotes: 'Educational Progress Notes',
      recordsCount: (n) => `${n} learning records`,
    },
  };

  const copy = t[lang] ?? t.ar;

  useEffect(() => {
    setActivePillar((GROWTH_PILLARS[lang] ?? GROWTH_PILLARS.ar)[0]?.id ?? 'literacy');
  }, [lang]);

  const studentList = Array.isArray(students) ? students : [];
  const activeStudentId = user?.activeStudentId ?? user?.childId ?? null;
  const linkedStudent = useMemo(() => {
    if (latest?.studentLinkedId) {
      const byLink = studentList.find((s) => s.id === latest.studentLinkedId);
      if (byLink) return byLink;
    }
    if (activeStudentId) {
      return studentList.find((s) => s.id === activeStudentId) ?? null;
    }
    return null;
  }, [studentList, latest?.studentLinkedId, activeStudentId]);

  const subtitleText = useMemo(() => {
    if (!latest && isEmpty) return copy.subtitleEmpty;
    if (linkedStudent?.name) return copy.subtitleStudent(linkedStudent.name);
    if (latest?.goalLabel) return copy.subtitleGoal(latest.goalLabel);
    return copy.subtitle;
  }, [latest, isEmpty, linkedStudent, copy]);

  const hasAssessment = latest?.tStatic != null || latest?.focusLevel != null;

  const focusLevel = hasAssessment && latest?.focusLevel != null
    ? Math.min(100, Math.max(0, latest.focusLevel))
    : null;

  const gazeTrigger = hasAssessment && detectGazeNeutralityCondition({
    focusLevel,
    tStatic: latest?.tStatic ?? null,
  });

  const gaze = useGazeNeutralityObserver({
    active: hasAssessment,
    triggerCondition: gazeTrigger,
    lang,
    disableDim: true,
  });

  const engagementScore = useMemo(() => {
    if (!hasAssessment) return null;
    if (latest?.tStatic != null) {
      return Math.min(100, Math.max(0, 100 - latest.tStatic * 4));
    }
    if (focusLevel != null) return focusLevel;
    return null;
  }, [hasAssessment, latest?.tStatic, focusLevel]);

  const pillarScores = useMemo(() => {
    if (!hasAssessment) {
      return pillars.reduce((acc, pillar) => {
        acc[pillar.id] = null;
        return acc;
      }, {});
    }
    const academic = latest?.academicProgress;
    const focus = focusLevel ?? academic;
    return {
      literacy: academic != null ? Math.min(100, academic) : focus,
      cognitive: focus != null ? Math.min(100, Math.max(0, focus - 4)) : null,
      focus: focusLevel,
      progress: academic,
    };
  }, [hasAssessment, latest?.academicProgress, focusLevel, pillars]);

  const formatScore = (score) => (score == null ? PENDING : `${score}%`);

  const activePillarMeta = pillars.find((p) => p.id === activePillar) ?? pillars[0];
  const activeStyles = PILLAR_STYLES[activePillarMeta?.color] ?? PILLAR_STYLES.gold;
  const ActivePillarIcon = activePillarMeta?.icon;
  const activePillarScore = pillarScores[activePillar];

  return (
    <div
      className="p-6 md:p-10 min-h-screen bg-[#0a0a0c] text-slate-200 font-sans"
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
    >
      <AirtableErrorBanner error={error} />

      <header className={`mb-10 relative overflow-hidden rounded-3xl ${LUX.glassCard} p-8`}>
        <div className="absolute top-0 left-0 w-64 h-64 bg-[#c9a962]/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl translate-x-1/3 translate-y-1/3 pointer-events-none" />
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-4 ${LUX.emeraldBadge}`}>
              <Sparkles className="w-3.5 h-3.5" /> {copy.badge}
            </span>
            <h2 className={`${LUX.titleGradient} flex items-center gap-3 text-3xl md:text-4xl`}>
              <GraduationCap className="w-9 h-9 text-[#d4af37] shrink-0" /> {copy.title}
            </h2>
            <p className="text-slate-400 mt-3 text-base max-w-2xl leading-relaxed">{subtitleText}</p>
            {!loading && records.length > 0 && (
              <p className="text-xs text-[#c9a962]/80 font-mono mt-2">{copy.recordsCount(records.length)}</p>
            )}
          </div>
          <div className="shrink-0 p-5 rounded-2xl border border-[#c9a962]/25 bg-[#12121a]/70 backdrop-blur-xl text-center min-w-[140px]">
            <p className="text-xs text-slate-500 mb-1">{copy.engagement}</p>
            <p className={`text-4xl font-black ${hasAssessment ? 'text-[#e8c872]' : 'text-slate-500'}`}>
              {engagementScore != null ? `${engagementScore}%` : copy.noAssessment}
            </p>
            <p className="text-[10px] text-slate-500 mt-2 leading-snug">{copy.engagementHint}</p>
          </div>
        </div>
      </header>

      {loading ? (
        <div className="mb-6">
          <AirtableLoading lang={lang} />
        </div>
      ) : isEmpty ? (
        <div className="mb-6">
          <AirtableEmpty lang={lang} />
        </div>
      ) : null}

      <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h3 className="text-sm font-bold text-slate-400 mb-4 flex items-center gap-2">
              <Brain className="w-4 h-4 text-[#d4af37]" /> {copy.growthHub}
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {pillars.map((pillar) => {
                const styles = PILLAR_STYLES[pillar.color] ?? PILLAR_STYLES.gold;
                const Icon = pillar.icon;
                const score = pillarScores[pillar.id];
                const isActive = activePillar === pillar.id;

                return (
                  <button
                    key={pillar.id}
                    type="button"
                    onClick={() => setActivePillar(pillar.id)}
                    className={`p-5 rounded-2xl border text-left transition-all ${styles.card} ${
                      isActive ? 'ring-2 ring-offset-2 ring-offset-[#050508] ring-[#c9a962]/45 shadow-lg' : ''
                    } ${lang === 'ar' ? 'text-right' : 'text-left'}`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${styles.icon}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <h4 className="font-bold text-slate-300 text-sm mb-2">{pillar.label}</h4>
                    <div className="w-full bg-slate-800/80 rounded-full h-1.5 mb-1">
                      {score != null && (
                        <div
                          className={`h-1.5 rounded-full transition-all duration-700 ${styles.bar}`}
                          style={{ width: `${score}%` }}
                        />
                      )}
                    </div>
                    <span className="text-xs font-mono text-slate-500">{formatScore(score)}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div
            className={`p-8 rounded-3xl border shadow-xl min-h-[220px] flex flex-col justify-center ${activeStyles.card}`}
          >
            <div className="flex items-center gap-4 mb-6">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${activeStyles.icon}`}>
                {ActivePillarIcon && <ActivePillarIcon className="w-7 h-7" />}
              </div>
              <div>
                <p className="text-xs text-slate-500 font-mono uppercase tracking-wider">
                  {lang === 'ar' ? 'أ ب ت' : 'A B C'}
                </p>
                <h4 className="text-xl font-bold text-slate-300">{activePillarMeta?.label}</h4>
              </div>
            </div>
            <p className={`text-5xl md:text-6xl font-black tracking-tight ${hasAssessment ? 'text-[#e8c872]' : 'text-slate-500'}`}>
              {formatScore(activePillarScore)}
            </p>
            <p className="text-sm text-slate-400 mt-3">
              {hasAssessment ? copy.engagementHint : copy.noAssessment}
            </p>
          </div>
        </div>

        <div className="space-y-5">
          {gaze.visible && (
            <div className="p-5 rounded-2xl border border-rose-500/40 bg-rose-500/10 shadow-[0_0_25px_rgba(244,63,94,0.12)]">
              <h4 className="font-bold text-rose-300 mb-2 flex items-center gap-2 text-sm">
                <Eye className="w-4 h-4 animate-pulse" /> {gaze.alertTitle}
                <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
              </h4>
              <p className="text-xs text-rose-200/90 font-mono leading-relaxed min-h-[2.5rem]" dir="auto">
                {gaze.typedAlert}
                <span className="inline-block w-1.5 h-3.5 bg-rose-300 animate-pulse align-middle ms-0.5" />
              </p>
            </div>
          )}

          <div className="bg-[#12121a]/70 backdrop-blur-xl border border-[#c9a962]/15 shadow-[0_0_48px_rgba(201,169,98,0.1)] p-6 rounded-2xl">
            <h3 className="text-slate-400 mb-2 font-mono text-sm">{copy.focus}</h3>
            <div className={`text-5xl font-black mb-4 ${hasAssessment && focusLevel != null ? 'text-emerald-400' : 'text-slate-500'}`}>
              {focusLevel != null ? `${focusLevel}%` : copy.noAssessment}
            </div>
            {focusLevel != null && (
              <div className="w-full bg-[#12121a]/70 rounded-full h-2">
                <div
                  className="bg-emerald-400 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${focusLevel}%` }}
                />
              </div>
            )}
          </div>

          {latest?.milestone && (
            <div className="p-5 rounded-2xl border border-[#c9a962]/30 bg-[#c9a962]/10">
              <h4 className="font-bold text-[#e8c872] mb-2 flex items-center gap-2">
                <Trophy className="w-4 h-4" /> {copy.milestone}
              </h4>
              <p className="text-sm text-slate-400 leading-relaxed">{latest.milestone}</p>
            </div>
          )}

          {latest?.notes && (
            <div className="p-4 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 text-sm text-emerald-200">
              <p className="text-xs font-bold text-emerald-400 mb-2">{copy.sessionNotes}</p>
              {latest.notes}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
````

## File: src/components/AunakResources.jsx
````javascript
import { useState, useEffect, useMemo } from 'react';
import { FolderOpen, FileText, Download, Star, BrainCircuit, Users } from 'lucide-react';
import { useAirtableData } from '../hooks/useAirtableData';
import { AIRTABLE_TABLES } from '../lib/airtableTables';
import { mapResource } from '../lib/airtableMappers';
import { AirtableEmpty, AirtableErrorBanner, AirtableLoading } from './AirtableStatus';
import { LUX } from '../lib/luxTheme.js';

const FILTER_OPTIONS = {
  ar: ['الكل', 'أدوات تشخيص', 'أدلة إرشادية', 'مقالات تعليمية', 'فيديوهات'],
  en: ['All', 'Diagnostic Tools', 'Guidelines', 'Educational Articles', 'Videos'],
};

export default function AunakResources({ lang = 'ar' }) {
  const { records: resources, loading, error, isEmpty } = useAirtableData(AIRTABLE_TABLES.communityResources, {
    mapRecord: mapResource,
    lang,
  });

  const filterOptions = useMemo(() => {
    const types = [...new Set(resources.map((r) => r.type).filter(Boolean))];
    const allLabel = lang === 'en' ? 'All' : 'الكل';
    return types.length > 0 ? [allLabel, ...types] : FILTER_OPTIONS[lang] ?? FILTER_OPTIONS.ar;
  }, [resources, lang]);

  const [activeFilter, setActiveFilter] = useState(filterOptions[0]);

  useEffect(() => {
    setActiveFilter(filterOptions[0]);
  }, [lang, filterOptions]);

  useEffect(() => {
    if (filterOptions.length && !filterOptions.includes(activeFilter)) {
      setActiveFilter(filterOptions[0]);
    }
  }, [filterOptions, activeFilter]);

  const t = {
    ar: {
      title: 'موارد دعم المجتمع',
      subtitle: 'بيانات حية من Airtable',
      addResource: '+ إضافة مورد جديد',
      categories: 'تصنيفات الموارد',
      emptyLibrary: 'لا توجد بيانات حالياً في موارد المجتمع',
      emptyFilter: 'لا توجد موارد في هذا التصنيف.',
      aiTitle: 'ملخص المورد ودرجة إمكانية الوصول (AI)',
      aiBody: (n) => `يقوم الذكاء الاصطناعي بتحليل الموارد المرفوعة وتلخيصها تلقائياً. ${n} مورداً متزامناً من Airtable.`,
    },
    en: {
      title: 'Community Support Resources',
      subtitle: 'Live data from Airtable',
      addResource: '+ Add New Resource',
      categories: 'Resource Categories',
      emptyLibrary: 'No data in community resources',
      emptyFilter: 'No resources in this category.',
      aiTitle: 'Resource Summary & Accessibility Score (AI)',
      aiBody: (n) => `AI analyzes and summarizes uploaded resources automatically. ${n} resources synced from Airtable.`,
    },
  };

  const copy = t[lang] ?? t.ar;
  const allLabel = filterOptions[0];

  const filtered =
    activeFilter === allLabel
      ? resources
      : resources.filter(
          (r) =>
            r.type?.includes(activeFilter) ||
            activeFilter.includes(r.type || '')
        );

  return (
    <div className="p-6 md:p-10 min-h-screen bg-[#0a0a0c] text-slate-200 font-sans" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <header className="mb-8 border-b border-[#c9a962]/15 pb-6 flex justify-between items-center">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-pink-400 flex items-center gap-3">
            <FolderOpen className="w-10 h-10" /> {copy.title}
          </h2>
          <p className="text-slate-400 mt-2 text-lg font-mono">{copy.subtitle}</p>
        </div>
        <button type="button" className="flex items-center gap-2 bg-pink-600 hover:bg-pink-500 text-white px-5 py-3 rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(236,72,153,0.3)]">
          {copy.addResource}
        </button>
      </header>

      <AirtableErrorBanner error={error} />

      <div className="grid lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-lg font-bold text-slate-300 mb-2 border-b border-[#c9a962]/15 pb-2">{copy.categories}</h3>
          <nav className="space-y-2">
            {filterOptions.map(cat => (
              <button 
                key={cat}
                type="button"
                onClick={() => setActiveFilter(cat)}
                className={`w-full ${lang === 'ar' ? 'text-right' : 'text-left'} p-3.5 rounded-xl border font-bold transition-all text-sm ${activeFilter === cat ? 'bg-pink-500/10 border-pink-500/50 text-pink-300 shadow-lg' : 'bg-[#12121a]/70 backdrop-blur-xl border border-[#c9a962]/15 shadow-[0_0_48px_rgba(201,169,98,0.1)] border-[#c9a962]/15 text-slate-400 hover:bg-[#12121a]/70'}`}
              >
                {cat}
              </button>
            ))}
          </nav>
        </div>

        <div className="lg:col-span-3 space-y-6">
           {loading ? (
             <AirtableLoading lang={lang} />
           ) : isEmpty ? (
             <AirtableEmpty lang={lang} message={copy.emptyLibrary} />
           ) : (
           <div className="grid md:grid-cols-2 gap-6">
             {filtered.length > 0 ? filtered.map(res => (
                <div key={res.id} className="bg-[#12121a]/70 backdrop-blur-xl border border-[#c9a962]/15 shadow-[0_0_48px_rgba(201,169,98,0.1)] p-6 rounded-3xl border border-[#c9a962]/15 shadow-xl hover:border-pink-500/30 transition-all group">
                   <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                         <div className="w-12 h-12 rounded-xl bg-[#0d0d10]/90 border border-[#c9a962]/15 flex items-center justify-center">
                            <FileText className="w-6 h-6 text-pink-400" />
                         </div>
                         <div>
                            <h4 className="font-bold text-slate-300">{res.title}</h4>
                            <span className="text-xs text-pink-400 bg-pink-500/10 px-2 py-1 rounded-md">{res.type}</span>
                         </div>
                      </div>
                   </div>
                   <p className="text-sm text-slate-400 mb-6 line-clamp-2 leading-relaxed">{res.summary || '—'}</p>
                   <div className="flex items-center justify-between pt-4 border-t border-[#c9a962]/15">
                      <div className="flex gap-4">
                         <span className="flex items-center gap-1 text-xs text-slate-500"><Users className="w-3 h-3"/> {res.audience}</span>
                         <span className="flex items-center gap-1 text-xs text-slate-500"><Download className="w-3 h-3"/> {res.downloads}</span>
                      </div>
                      {res.rating != null && (
                        <span className="flex items-center gap-1 text-xs text-[#d4af37] font-bold"><Star className="w-3 h-3"/> {res.rating}</span>
                      )}
                   </div>
                </div>
             )) : (
               <div className="col-span-2"><AirtableEmpty lang={lang} message={copy.emptyFilter} /></div>
             )}
           </div>
           )}

           <div className="bg-pink-900/10 p-8 rounded-3xl border border-pink-500/20 shadow-[0_0_30px_rgba(236,72,153,0.05)] mt-8">
              <h3 className="text-xl font-bold text-pink-300 mb-4 flex items-center gap-2"><BrainCircuit className="w-6 h-6" /> {copy.aiTitle}</h3>
              <p className="text-md text-pink-200/80 leading-relaxed bg-pink-950/50 p-5 rounded-xl border border-pink-500/30">
                 {copy.aiBody(resources.length)}
              </p>
           </div>
        </div>
      </div>
    </div>
  );
}
````

## File: src/components/AunakSafeMedia.jsx
````javascript
import { useState, useEffect, useMemo, useRef } from 'react';
import { Video, ShieldCheck, PlayCircle, BrainCircuit, Lock, Clock, Image, Headphones } from 'lucide-react';
import { useAirtableData } from '../hooks/useAirtableData';
import { useAuth } from '../lib/auth';
import { useStudents } from '../hooks/useStudents';
import { triggerChildIslandSeal, CHILD_ISLAND_SEAL_THRESHOLD } from '../lib/childSessionBridge';
import { AIRTABLE_TABLES } from '../lib/airtableTables';
import { mapMedia } from '../lib/airtableMappers';
import { AirtableEmpty, AirtableErrorBanner, AirtableLoading } from './AirtableStatus';
import { LUX } from '../lib/luxTheme.js';

const MEDIA_CATEGORIES = {
  en: ['Video Tutorials', 'Visual Aids', 'Audio Exercises'],
  ar: ['دروس فيديو', 'وسائل بصرية', 'تمارين صوتية'],
};

const CATEGORY_ALIASES = {
  'Video Tutorials': ['video tutorials', 'video', 'tutorial', 'فيديو', 'دروس فيديو', 'دروس'],
  'Visual Aids': ['visual aids', 'visual', 'aids', 'image', 'بصر', 'وسائل بصرية', 'مرئ'],
  'Audio Exercises': ['audio exercises', 'audio', 'exercise', 'sound', 'صوت', 'تمارين صوتية', 'سمع'],
};

function normalizeMediaCategory(rawCategory, lang = 'ar') {
  const canonical = MEDIA_CATEGORIES.en;
  const localized = MEDIA_CATEGORIES[lang] ?? MEDIA_CATEGORIES.ar;
  if (!rawCategory) return localized[0];

  const lower = String(rawCategory).toLowerCase().trim();
  const idx = canonical.findIndex((cat) => {
    if (cat.toLowerCase() === lower) return true;
    return (CATEGORY_ALIASES[cat] ?? []).some((alias) => lower.includes(alias.toLowerCase()));
  });

  return idx >= 0 ? localized[idx] : rawCategory;
}

function categoryIcon(category, lang = 'ar') {
  const labels = MEDIA_CATEGORIES[lang] ?? MEDIA_CATEGORIES.ar;
  if (category === labels[0]) return Video;
  if (category === labels[1]) return Image;
  if (category === labels[2]) return Headphones;
  return Video;
}

export default function AunakSafeMedia({ lang = 'ar' }) {
  const { user } = useAuth();
  const { students } = useStudents(lang);
  const islandEngagementRef = useRef(0);
  const islandSealRef = useRef(false);

  const activeStudent = useMemo(() => {
    const id = user?.childId ?? user?.activeStudentId;
    if (!id) return students?.[0] ?? null;
    return students.find((s) => s.id === id) ?? students?.[0] ?? null;
  }, [user?.childId, user?.activeStudentId, students]);

  const recordIslandEngagement = (interactionType = 'media_clip') => {
    islandEngagementRef.current += 1;
    const count = islandEngagementRef.current;
    if (islandSealRef.current || count < CHILD_ISLAND_SEAL_THRESHOLD || !activeStudent?.name) return;
    islandSealRef.current = true;
    triggerChildIslandSeal({
      studentId: activeStudent.id,
      studentName: activeStudent.name,
      interactionCount: count,
      source: 'safe_media_islands',
      interactionType,
    }).catch(() => {
      islandSealRef.current = false;
    });
  };

  const { records: mediaLibrary, loading, error, isEmpty } = useAirtableData(AIRTABLE_TABLES.safeMedia, {
    mapRecord: mapMedia,
    lang,
  });

  const [activeCategory, setActiveCategory] = useState(
    (MEDIA_CATEGORIES[lang] ?? MEDIA_CATEGORIES.ar)[0]
  );
  const [activeVideo, setActiveVideo] = useState(null);

  const t = {
    ar: {
      title: 'مكتبة الوسائط الآمنة (Safe Media)',
      subtitle: 'محتوى مشفر (AES-256) — بيانات حية من Airtable',
      categories: 'تصنيفات المكتبة',
      selectClip: 'اختر مقطعاً للبدء',
      aiSummary: 'ملخص الوسائط وتوصيات التعلم (AI)',
      activeClip: (title, category) => `المقطع النشط: ${title} (${category}).`,
      noData: 'لا توجد بيانات حالياً — أضف مقاطع في Airtable لعرض التوصيات الذكية.',
      emptyCategory: 'لا توجد مقاطع في هذا التصنيف.',
      archive: 'الأرشيف المشفر',
    },
    en: {
      title: 'Safe Media Library',
      subtitle: 'AES-256 encrypted content — live data from Airtable',
      categories: 'Library Categories',
      selectClip: 'Select a clip to start',
      aiSummary: 'Media Summary & Learning Recommendations (AI)',
      activeClip: (title, category) => `Active clip: ${title} (${category}).`,
      noData: 'No data yet — add clips in Airtable to show AI recommendations.',
      emptyCategory: 'No clips in this category.',
      archive: 'Encrypted Archive',
    },
  };

  const copy = t[lang] ?? t.ar;

  const categoryOptions = useMemo(() => {
    const fromData = [...new Set(mediaLibrary.map((m) => m.category).filter(Boolean))];
    return fromData.length > 0 ? fromData : MEDIA_CATEGORIES[lang] ?? MEDIA_CATEGORIES.ar;
  }, [mediaLibrary, lang]);

  const usesDataCategories = useMemo(
    () => [...new Set(mediaLibrary.map((m) => m.category).filter(Boolean))].length > 0,
    [mediaLibrary]
  );

  const normalizedLibrary = useMemo(
    () =>
      mediaLibrary.map((item) => ({
        ...item,
        displayCategory: usesDataCategories
          ? item.category
          : normalizeMediaCategory(item.category, lang),
      })),
    [mediaLibrary, lang, usesDataCategories]
  );

  const filteredLibrary = useMemo(
    () => normalizedLibrary.filter((item) => item.displayCategory === activeCategory),
    [normalizedLibrary, activeCategory]
  );

  useEffect(() => {
    setActiveCategory(categoryOptions[0]);
  }, [lang, categoryOptions]);

  useEffect(() => {
    if (categoryOptions.length && !categoryOptions.includes(activeCategory)) {
      setActiveCategory(categoryOptions[0]);
    }
  }, [categoryOptions, activeCategory]);

  useEffect(() => {
    if (filteredLibrary.length > 0) {
      setActiveVideo((prev) =>
        prev && filteredLibrary.some((m) => m.id === prev) ? prev : filteredLibrary[0].id
      );
    } else {
      setActiveVideo(null);
    }
  }, [filteredLibrary]);

  const selected = filteredLibrary.find((m) => m.id === activeVideo) ?? normalizedLibrary.find((m) => m.id === activeVideo);

  return (
    <div className="p-6 md:p-10 min-h-screen bg-[#0a0a0c] text-slate-200 font-sans" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <header className="mb-8 border-b border-[#c9a962]/15 pb-6">
        <h2 className="text-3xl md:text-4xl font-bold text-emerald-400 flex items-center gap-3">
          <Video className="w-10 h-10" /> {copy.title}
        </h2>
        <p className="text-slate-400 mt-2 text-lg font-mono">{copy.subtitle}</p>
      </header>

      <AirtableErrorBanner error={error} />

      <div className="grid lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-lg font-bold text-slate-300 mb-2 border-b border-[#c9a962]/15 pb-2">{copy.categories}</h3>
          <nav className="space-y-2">
            {categoryOptions.map((cat) => {
              const Icon = categoryIcon(cat, lang);
              const count = normalizedLibrary.filter((m) => m.displayCategory === cat).length;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`w-full flex items-center justify-between p-3.5 rounded-xl border font-bold transition-all text-sm ${
                    activeCategory === cat
                      ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-300 shadow-lg'
                      : 'bg-[#12121a]/70 backdrop-blur-xl border border-[#c9a962]/15 shadow-[0_0_48px_rgba(201,169,98,0.1)] border-[#c9a962]/15 text-slate-400 hover:bg-[#12121a]/70'
                  }`}
                >
                  <span className={`flex items-center gap-2 ${lang === 'ar' ? 'flex-row-reverse' : ''}`}>
                    <Icon className="w-4 h-4 shrink-0" />
                    {cat}
                  </span>
                  <span className="text-xs font-mono text-slate-500">{count}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="lg:col-span-3 space-y-6">
          <div className="bg-[#12121a]/70 backdrop-blur-xl border border-[#c9a962]/15 shadow-[0_0_48px_rgba(201,169,98,0.1)] p-4 rounded-3xl border border-[#c9a962]/15 shadow-xl overflow-hidden relative">
            <div className="absolute top-6 right-6 z-10 flex gap-2">
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 rounded-lg text-xs font-mono font-bold flex items-center gap-1 backdrop-blur-md">
                <ShieldCheck className="w-3 h-3" /> AES-256 SECURED
              </span>
            </div>
            <div className="aspect-video bg-[#0d0d10]/90 rounded-2xl border border-white/[0.08] flex flex-col items-center justify-center relative overflow-hidden group">
              <div className="absolute inset-0 bg-emerald-900/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <PlayCircle
                className="w-20 h-20 text-emerald-500/50 group-hover:text-emerald-400 transition-colors cursor-pointer z-10"
                onClick={() => recordIslandEngagement('media_play')}
              />
              <p className="mt-4 text-slate-500 font-mono z-10">{selected?.title || copy.selectClip}</p>
            </div>
          </div>

          <div className="bg-emerald-900/10 p-8 rounded-3xl border border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.05)]">
            <h3 className="text-xl font-bold text-emerald-300 mb-4 flex items-center gap-2">
              <BrainCircuit className="w-6 h-6" /> {copy.aiSummary}
            </h3>
            <p className="text-md text-emerald-200/80 leading-relaxed bg-emerald-950/50 p-5 rounded-xl border border-emerald-500/30">
              {selected ? copy.activeClip(selected.title, selected.displayCategory) : copy.noData}
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-slate-300 mb-4 flex items-center gap-2 border-b border-[#c9a962]/15 pb-2">
              <Lock className="w-5 h-5 text-slate-500" /> {copy.archive}
              <span className="text-xs font-normal text-emerald-400/80 ml-auto">{activeCategory}</span>
            </h3>
            {loading ? (
              <AirtableLoading lang={lang} />
            ) : isEmpty ? (
              <AirtableEmpty lang={lang} />
            ) : filteredLibrary.length === 0 ? (
              <AirtableEmpty lang={lang} message={copy.emptyCategory} />
            ) : (
              <div className="space-y-3">
                {filteredLibrary.map((media) => (
                  <button
                    key={media.id}
                    type="button"
                    onClick={() => {
                      setActiveVideo(media.id);
                      recordIslandEngagement('media_select');
                    }}
                    className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
                      activeVideo === media.id
                        ? 'bg-emerald-500/10 border-emerald-500/50 shadow-lg'
                        : 'bg-[#12121a]/70 backdrop-blur-xl border border-[#c9a962]/15 shadow-[0_0_48px_rgba(201,169,98,0.1)] border-[#c9a962]/15 hover:bg-[#12121a]/70'
                    }`}
                  >
                    <div className={lang === 'ar' ? 'text-right' : 'text-left'}>
                      <h4
                        className={`font-bold text-sm ${activeVideo === media.id ? 'text-emerald-300' : 'text-slate-200'}`}
                      >
                        {media.title}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1">{media.displayCategory}</p>
                    </div>
                    <div className={`flex flex-col ${lang === 'ar' ? 'items-end text-left' : 'items-end text-right'}`}>
                      <ShieldCheck className="w-4 h-4 text-emerald-500 mb-1" />
                      <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {media.duration}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
````

## File: src/components/AunakSpecialists.jsx
````javascript
import { useState, useEffect, useMemo, useCallback } from 'react';
import { Stethoscope, Mail, Phone, Award, ShieldCheck, Lock, Loader2 } from 'lucide-react';
import { useAirtableData } from '../hooks/useAirtableData';
import { AIRTABLE_TABLES } from '../lib/airtableTables';
import { mapSpecialist } from '../lib/airtableMappers';
import { updateSpecialistRecord } from '../lib/airtable';
import { useAuth, isSovereignOwner } from '../lib/auth';
import { AirtableEmpty, AirtableErrorBanner, AirtableLoading } from './AirtableStatus';
import { LUX } from '../lib/luxTheme.js';

import { SPECIALIST } from '../lib/airtableFields';

const ADMIN_NOTES_FIELD = SPECIALIST.admin_notes;

function hasSpecialistName(s, lang) {
  const fallback = lang === 'en' ? 'Specialist' : 'أخصائي';
  return Boolean(s.name && s.name !== fallback);
}

export default function AunakSpecialists({ lang = 'ar' }) {
  const { user } = useAuth();
  const sovereign = isSovereignOwner(user);
  const { records: specialists, loading, error, refetch } = useAirtableData(AIRTABLE_TABLES.specialists, {
    mapRecord: mapSpecialist,
    lang,
  });

  const [activeSpecialist, setActiveSpecialist] = useState(null);
  const [adminNotesDraft, setAdminNotesDraft] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [notesMsg, setNotesMsg] = useState('');

  const visibleSpecialists = useMemo(
    () => specialists.filter((s) => hasSpecialistName(s, lang) || (s.specialty && s.specialty !== '—')),
    [specialists, lang]
  );

  const t = {
    ar: {
      title: 'إدارة الكادر والأخصائيين',
      subtitle: 'بيانات حية من Airtable — جدول الأخصائيين',
      staff: 'الكادر السريري',
      profile: 'الملف المهني السريري',
      verified: 'موثق ومسجل',
      specialty: 'نوع التخصص',
      email: 'البريد الإلكتروني المهني',
      phone: 'رقم التواصل',
      adminNotes: 'ملاحظات الإدارة (خاصة)',
      noNotes: '— لا توجد ملاحظات —',
      sovereignOnly: 'للمشرف السيادي فقط',
      saveNotes: 'حفظ الملاحظات',
      saved: 'تم حفظ ملاحظات الإدارة',
      saveErr: 'تعذر حفظ الملاحظات',
    },
    en: {
      title: 'Specialists & Staff Management',
      subtitle: 'Live data from Airtable — Specialists table',
      staff: 'Clinical Staff',
      profile: 'Clinical Professional Profile',
      verified: 'Verified & Registered',
      specialty: 'Specialization',
      email: 'Professional Email',
      phone: 'Contact Number',
      adminNotes: 'Admin Notes (Private)',
      noNotes: '— No notes —',
      sovereignOnly: 'Super Admin only',
      saveNotes: 'Save notes',
      saved: 'Admin notes saved',
      saveErr: 'Could not save notes',
    },
  };

  const copy = t[lang] ?? t.ar;

  useEffect(() => {
    if (visibleSpecialists.length > 0) {
      setActiveSpecialist((prev) =>
        prev && visibleSpecialists.some((s) => s.id === prev) ? prev : visibleSpecialists[0].id
      );
    } else {
      setActiveSpecialist(null);
    }
  }, [visibleSpecialists]);

  const active = visibleSpecialists.find((s) => s.id === activeSpecialist) ?? null;
  const showEmpty = !loading && visibleSpecialists.length === 0;
  const isVerified = Boolean(active?.name && active?.specialty && active.specialty !== '—');

  useEffect(() => {
    setAdminNotesDraft(active?.adminNotes ?? '');
    setNotesMsg('');
  }, [active?.id, active?.adminNotes]);

  const saveAdminNotes = useCallback(async () => {
    if (!sovereign || !active?.id) return;
    setSavingNotes(true);
    setNotesMsg('');
    try {
      await updateSpecialistRecord(active.id, { [ADMIN_NOTES_FIELD]: adminNotesDraft.trim() });
      setNotesMsg(copy.saved);
      refetch();
    } catch (e) {
      setNotesMsg(e?.message || copy.saveErr);
    } finally {
      setSavingNotes(false);
    }
  }, [sovereign, active?.id, adminNotesDraft, copy.saved, copy.saveErr, refetch]);

  return (
    <div className="p-6 md:p-10 min-h-screen bg-[#0a0a0c] text-slate-200 font-sans" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <header className="mb-8 border-b border-[#c9a962]/15 pb-6">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-teal-400 flex items-center gap-3">
            <Stethoscope className="w-10 h-10" /> {copy.title}
          </h2>
          <p className="text-slate-400 mt-2 text-lg font-mono">{copy.subtitle}</p>
        </div>
      </header>

      <AirtableErrorBanner error={error} />

      <div className="grid lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-lg font-bold text-slate-300 mb-2 border-b border-[#c9a962]/15 pb-2">{copy.staff}</h3>
          {loading ? (
            <AirtableLoading lang={lang} />
          ) : showEmpty ? (
            <AirtableEmpty lang={lang} />
          ) : (
            <nav className="space-y-2">
              {visibleSpecialists.map((spec) => (
                <button
                  key={spec.id}
                  type="button"
                  onClick={() => setActiveSpecialist(spec.id)}
                  className={`w-full ${lang === 'ar' ? 'text-right' : 'text-left'} p-4 rounded-xl border transition-all ${activeSpecialist === spec.id ? 'bg-teal-500/10 border-teal-500/50 text-teal-300 shadow-lg' : 'bg-[#12121a]/70 backdrop-blur-xl border border-[#c9a962]/15 text-slate-400 hover:bg-[#12121a]/90'}`}
                >
                  <h4 className="font-bold text-sm mb-1">{spec.name}</h4>
                  <p className="text-xs text-slate-500">{spec.specialty}</p>
                </button>
              ))}
            </nav>
          )}
        </div>

        <div className="lg:col-span-3 space-y-6">
          <div className="bg-[#12121a]/70 backdrop-blur-xl border border-[#c9a962]/15 shadow-[0_0_48px_rgba(201,169,98,0.1)] p-8 rounded-3xl">
            <div className="flex justify-between items-center mb-6 border-b border-[#c9a962]/15 pb-4">
              <h3 className="text-2xl font-bold text-slate-300 flex items-center gap-2">
                <Award className="w-6 h-6 text-teal-400" /> {copy.profile}
              </h3>
              {isVerified && (
                <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-mono font-bold">
                  {copy.verified}
                </span>
              )}
            </div>

            {loading ? (
              <AirtableLoading lang={lang} />
            ) : !active ? (
              <AirtableEmpty lang={lang} />
            ) : (
              <>
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-3">
                    <div className="p-3 bg-[#0d0d10]/90 rounded-xl border border-[#c9a962]/15">
                      <p className="text-xs text-slate-500 mb-1">{copy.specialty}</p>
                      <p className="text-sm font-bold text-teal-300">{active.specialty || '—'}</p>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-[#0d0d10]/90 rounded-xl border border-[#c9a962]/15">
                      <Mail className="w-4 h-4 text-slate-500 shrink-0" />
                      <span className="text-sm text-slate-300">{active.email || '—'}</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-[#0d0d10]/90 rounded-xl border border-[#c9a962]/15">
                      <Phone className="w-4 h-4 text-slate-500 shrink-0" />
                      <span className="text-sm text-slate-300" dir="ltr">{active.phone || '—'}</span>
                    </div>
                  </div>
                </div>

                <div className="p-5 bg-[#0d0d10]/90 rounded-xl border border-rose-500/20 relative overflow-hidden">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-bold text-slate-400 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-rose-400" /> {copy.adminNotes}
                    </span>
                    {!sovereign && (
                      <span className="text-[10px] bg-rose-500/10 text-rose-400 px-2 py-1 rounded border border-rose-500/20 font-mono">
                        {copy.sovereignOnly}
                      </span>
                    )}
                  </div>

                  {!sovereign ? (
                    <div className="relative min-h-[5rem]">
                      <div className="absolute inset-0 bg-[#0d0d10]/90 backdrop-blur-sm flex flex-col items-center justify-center z-10 border border-rose-500/20 rounded-xl">
                        <Lock className="w-6 h-6 text-rose-400 mb-2" />
                        <span className="text-xs font-bold text-rose-300">{copy.sovereignOnly}</span>
                      </div>
                      <p className="text-sm text-slate-600 font-mono opacity-30 select-none">████████</p>
                    </div>
                  ) : (
                    <>
                      <textarea
                        value={adminNotesDraft}
                        onChange={(e) => setAdminNotesDraft(e.target.value)}
                        placeholder={copy.noNotes}
                        className="w-full min-h-[6rem] bg-[#0a0a0c]/80 border border-[#c9a962]/15 rounded-xl p-3 text-sm text-slate-300 font-mono outline-none focus:border-rose-400/40"
                      />
                      <div className="flex items-center gap-3 mt-3">
                        <button
                          type="button"
                          disabled={savingNotes}
                          onClick={saveAdminNotes}
                          className={`${LUX.btnEmerald} px-4 py-2 rounded-xl text-sm font-bold disabled:opacity-50 flex items-center gap-2`}
                        >
                          {savingNotes ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                          {copy.saveNotes}
                        </button>
                        {notesMsg && <span className="text-xs text-emerald-400 font-mono">{notesMsg}</span>}
                      </div>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
````

## File: src/components/child/ChildBottomNav.jsx
````javascript
import { Home, Gamepad2, Moon, Star, ClipboardList } from 'lucide-react';

const BASE_TABS = [
  { id: 'home', icon: Home, ar: 'الرئيسية', en: 'Home' },
  { id: 'play', icon: Gamepad2, ar: 'تفاعل', en: 'Engage' },
  { id: 'assessment', icon: ClipboardList, ar: 'التقييم', en: 'Assessment', sovereignOnly: true },
  { id: 'calm', icon: Moon, ar: 'هدوء', en: 'Calm' },
  { id: 'stars', icon: Star, ar: 'نجومي', en: 'Stars' },
];

export default function ChildBottomNav({ lang = 'ar', active, onChange, sovereign = false }) {
  const tabs = BASE_TABS.filter((t) => !t.sovereignOnly || sovereign);

  return (
    <nav
      className={
        sovereign
          ? 'fixed bottom-0 inset-x-0 z-30 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 bg-[#12121a]/90 backdrop-blur-xl border-t border-[#c9a962]/25'
          : 'fixed bottom-0 inset-x-0 z-30 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 bg-white/80 backdrop-blur-xl border-t border-white/60'
      }
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
    >
      <div className="max-w-lg mx-auto flex gap-1">
        {tabs.map(({ id, icon: Icon, ar, en }) => {
          const on = active === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onChange(id)}
              className={`flex-1 flex flex-col items-center gap-0.5 py-2 rounded-2xl transition-all ${
                on
                  ? sovereign
                    ? 'bg-gradient-to-t from-[#c9a962]/25 to-emerald-500/15 text-[#e8c872]'
                    : 'bg-gradient-to-t from-orange-400/30 to-pink-400/20 text-orange-600'
                  : sovereign
                    ? 'text-emerald-400/60'
                    : 'text-slate-500'
              }`}
            >
              <Icon className={`w-6 h-6 ${on ? 'scale-110' : ''}`} />
              <span className="text-[10px] font-black">{lang === 'en' ? en : ar}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
````

## File: src/components/child/ChildCalmZone.jsx
````javascript
import { useEffect, useState } from 'react';
import { CHILD } from '../../lib/childTheme';
import { TAWASUL_CHILD } from '../../lib/tawasulChildTheme';

const BREATH_MS = 4000;

export default function ChildCalmZone({ lang = 'ar', sovereign = false }) {
  const theme = sovereign ? TAWASUL_CHILD : CHILD;
  const [phase, setPhase] = useState('in');

  useEffect(() => {
    const t = setInterval(() => setPhase((p) => (p === 'in' ? 'out' : 'in')), BREATH_MS);
    return () => clearInterval(t);
  }, []);

  const copy =
    lang === 'en'
      ? { title: sovereign ? 'Neural calm pulse' : 'Calm breath', hint: phase === 'in' ? 'Breathe in…' : 'Breathe out…' }
      : { title: sovereign ? 'نبض الهدوء العصبي' : 'تنفس هادئ', hint: phase === 'in' ? 'شهيق…' : 'زفير…' };

  return (
    <div className={theme.card}>
      <h2 className={`${theme.title} text-center mb-6`}>{copy.title}</h2>
      <div className="flex flex-col items-center gap-6 py-8">
        <div
          className={`w-32 h-32 rounded-full border-4 shadow-xl transition-transform duration-[4000ms] ease-in-out ${
            sovereign
              ? `bg-gradient-to-br from-emerald-400/80 to-[#c9a962]/60 border-[#e8c872]/40 shadow-[0_0_32px_rgba(52,211,153,0.25)] ${
                  phase === 'in' ? 'scale-125' : 'scale-90'
                }`
              : `bg-gradient-to-br from-sky-300 to-indigo-400 border-white ${
                  phase === 'in' ? 'scale-125' : 'scale-90'
                }`
          }`}
        />
        <p className={`text-xl font-black ${sovereign ? 'text-emerald-300' : 'text-indigo-600'}`}>{copy.hint}</p>
      </div>
    </div>
  );
}
````

## File: src/components/child/ChildHomePanel.jsx
````javascript
import { motion } from 'framer-motion';
import { Target } from 'lucide-react';
import { CHILD } from '../../lib/childTheme';
import ChildGoalSpeaker from './ChildGoalSpeaker';

export default function ChildHomePanel({ lang = 'ar', studentName, programmedGoal, sovereign = false }) {
  const copy =
    lang === 'en'
      ? {
          hi: 'Hi',
          todayGoal: "Today's goal from your specialist",
          noGoal: 'Your specialist will set a goal soon — keep smiling!',
          mascot: 'You can do it!',
        }
      : {
          hi: 'مرحباً',
          todayGoal: 'هدفك اليوم من الأخصائي',
          noGoal: 'سيضع الأخصائي هدفاً قريباً — ابتسم!',
          mascot: 'أنت تستطيع!',
        };

  const firstName = studentName?.split?.(' ')?.[0] ?? studentName ?? '';

  // Textless sovereign mode — the goal is HEARD, never read.
  if (sovereign) {
    return (
      <ChildGoalSpeaker lang={lang} goalText={programmedGoal} studentName={studentName} />
    );
  }

  return (
    <div className={CHILD.card}>
      <div className={CHILD.mascotWrap}>
        <div className={CHILD.mascotFace}>🌟</div>
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className={CHILD.speech}
        >
          {firstName ? `${copy.hi} ${firstName}! ${copy.mascot}` : copy.mascot}
        </motion.p>
      </div>

      <div className="mt-6 rounded-3xl border-4 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-5">
        <div className="flex items-center gap-2 mb-3 text-amber-700">
          <Target className="w-5 h-5" />
          <h2 className="font-black text-lg">{copy.todayGoal}</h2>
        </div>
        <p className="text-base font-bold text-slate-700 leading-relaxed whitespace-pre-wrap">
          {programmedGoal?.trim() ? programmedGoal.trim() : copy.noGoal}
        </p>
      </div>
    </div>
  );
}
````

## File: src/components/child/ChildPlayZone.jsx
````javascript
import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { CHILD, CHILD_GREETINGS, BUBBLE_COLORS } from '../../lib/childTheme';
import { TAWASUL_CHILD, TAWASUL_BUBBLE_COLORS } from '../../lib/tawasulChildTheme';
import {
  triggerChildIslandSeal,
  CHILD_ISLAND_SEAL_THRESHOLD,
} from '../../lib/childSessionBridge';

function randomBubble(colors) {
  return {
    id: Math.random().toString(36).slice(2),
    x: 10 + Math.random() * 70,
    y: 10 + Math.random() * 50,
    size: 48 + Math.random() * 40,
    color: colors[Math.floor(Math.random() * colors.length)],
    emoji: ['⭐', '🎈', '🌈', '💫', '🦋'][Math.floor(Math.random() * 5)],
  };
}

export default function ChildPlayZone({
  lang = 'ar',
  studentName,
  studentId,
  onCelebrate,
  sovereignIsland = false,
  starCap = null,
  globalStarCount = 0,
}) {
  const theme = sovereignIsland ? TAWASUL_CHILD : CHILD;
  const bubbleColors = sovereignIsland ? TAWASUL_BUBBLE_COLORS : BUBBLE_COLORS;
  const greetings = CHILD_GREETINGS[lang] ?? CHILD_GREETINGS.ar;
  const cap = starCap ?? Infinity;
  const atCap = sovereignIsland && globalStarCount >= cap;
  const [greetingIdx, setGreetingIdx] = useState(0);
  const [bubbles, setBubbles] = useState(() => Array.from({ length: 6 }, () => randomBubble(bubbleColors)));
  const [popped, setPopped] = useState(0);
  const [targetColor, setTargetColor] = useState(0);
  const [mode, setMode] = useState('bubbles');
  const sealTriggeredRef = useRef(false);

  const maybeSealSession = useCallback(
    (nextCount) => {
      if (sealTriggeredRef.current || nextCount < CHILD_ISLAND_SEAL_THRESHOLD) return;
      sealTriggeredRef.current = true;
      triggerChildIslandSeal({
        studentId,
        studentName,
        interactionCount: nextCount,
        source: 'child_play_zone',
        interactionType: mode,
      }).catch(() => {
        sealTriggeredRef.current = false;
      });
    },
    [studentId, studentName, mode]
  );

  const colors =
    lang === 'en'
      ? ['Pink', 'Blue', 'Orange', 'Green', 'Purple']
      : ['وردي', 'أزرق', 'برتقالي', 'أخضر', 'بنفسجي'];

  const rewardPop = useCallback(() => {
    if (atCap) return;
    setGreetingIdx((i) => (i + 1) % greetings.length);
    onCelebrate?.();
  }, [atCap, greetings.length, onCelebrate]);

  const pop = useCallback(
    (id) => {
      setBubbles((prev) => prev.filter((b) => b.id !== id));
      setPopped((n) => {
        const next = n + 1;
        maybeSealSession(next);
        return next;
      });
      rewardPop();
      if (bubbles.length <= 2) {
        setTimeout(() => setBubbles(Array.from({ length: 6 }, () => randomBubble(bubbleColors))), 400);
      }
    },
    [bubbles.length, maybeSealSession, bubbleColors, rewardPop]
  );

  useEffect(() => {
    const t = setInterval(() => setTargetColor((c) => (c + 1) % bubbleColors.length), 8000);
    return () => clearInterval(t);
  }, [bubbleColors.length]);

  const displayScore = sovereignIsland ? globalStarCount : popped;
  const scoreLabel =
    sovereignIsland && cap !== Infinity
      ? lang === 'en'
        ? `Stars ${displayScore}/${cap}`
        : `نجوم ${displayScore}/${cap}`
      : `${lang === 'en' ? 'Stars' : 'نجوم'}: ${displayScore} ⭐`;

  const copy =
    lang === 'en'
      ? {
          bubbles: sovereignIsland ? 'Pop neural stars — sovereign cap 5' : 'Pop the stars!',
          colors: 'Tap the matching color!',
          switchBubbles: 'Neural',
          switchColors: 'Spectrum',
          capped: 'Five stars sealed — session complete!',
        }
      : {
          bubbles: sovereignIsland ? 'فقّ النجوم العصبية — سقف 5' : 'فقّ الفقاعات!',
          colors: 'اضغط اللون المطلوب!',
          switchBubbles: 'عصبي',
          switchColors: 'طيف',
          capped: 'خُتمت الخمس نجوم — الجلسة مكتملة!',
        };

  const modeBtn = (on, activeClass, idleClass) =>
    `flex-1 py-2 rounded-xl font-bold text-sm ${on ? activeClass : idleClass}`;

  return (
    <div className={theme.card}>
      <div className={theme.mascotWrap}>
        <div className={theme.mascotFace}>{sovereignIsland ? '⚡' : '🤖'}</div>
        <motion.p
          key={greetingIdx}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={theme.speech}
        >
          {atCap
            ? copy.capped
            : greetingIdx === 0 && studentName
              ? `${lang === 'en' ? 'Hi' : 'مرحباً'} ${studentName}! ${greetings[0]}`
              : greetings[greetingIdx]}
        </motion.p>
      </div>

      <div className="flex gap-2 my-4">
        <button
          type="button"
          onClick={() => setMode('bubbles')}
          className={modeBtn(
            mode === 'bubbles',
            sovereignIsland ? 'bg-[#c9a962] text-[#0a0a0c]' : 'bg-orange-400 text-white',
            sovereignIsland
              ? 'bg-[#12121a]/60 text-emerald-300/80 border border-emerald-400/20'
              : 'bg-white/60 text-slate-600'
          )}
        >
          {copy.switchBubbles}
        </button>
        <button
          type="button"
          onClick={() => setMode('colors')}
          className={modeBtn(
            mode === 'colors',
            sovereignIsland ? 'bg-emerald-500 text-[#0a0a0c]' : 'bg-teal-400 text-white',
            sovereignIsland
              ? 'bg-[#12121a]/60 text-[#e8c872]/80 border border-[#c9a962]/20'
              : 'bg-white/60 text-slate-600'
          )}
        >
          {copy.switchColors}
        </button>
      </div>

      <p className={`${theme.subtitle} text-center mb-4`}>
        {mode === 'bubbles' ? copy.bubbles : `${copy.colors} — ${colors[targetColor]}`}
      </p>

      {mode === 'bubbles' ? (
        <div
          className={
            sovereignIsland
              ? theme.islandArena
              : 'relative h-64 rounded-3xl bg-gradient-to-b from-sky-100 to-pink-50 overflow-hidden border-4 border-white'
          }
        >
          {bubbles.map((b) => (
            <motion.button
              key={b.id}
              type="button"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className={`${theme.btnBubble} bg-gradient-to-br ${b.color}`}
              style={{
                left: `${b.x}%`,
                top: `${b.y}%`,
                width: b.size,
                height: b.size,
                fontSize: b.size * 0.35,
              }}
              onClick={() => pop(b.id)}
            >
              {b.emoji}
            </motion.button>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {bubbleColors.map((c, i) => (
            <motion.button
              key={c}
              type="button"
              whileTap={{ scale: 0.92 }}
              onClick={() => {
                if (i === targetColor) {
                  setPopped((n) => {
                    const next = n + 1;
                    maybeSealSession(next);
                    return next;
                  });
                  setTargetColor((t) => (t + 1) % bubbleColors.length);
                  rewardPop();
                }
              }}
              className={`h-24 rounded-3xl bg-gradient-to-br ${c} border-4 ${
                i === targetColor
                  ? sovereignIsland
                    ? 'border-[#e8c872] ring-4 ring-emerald-400/40'
                    : 'border-yellow-300 ring-4 ring-yellow-200'
                  : sovereignIsland
                    ? 'border-[#c9a962]/30'
                    : 'border-white'
              } shadow-lg`}
            />
          ))}
        </div>
      )}

      <p
        className={`text-center mt-4 text-2xl font-black ${
          sovereignIsland ? 'text-[#e8c872]' : 'text-amber-500'
        }`}
      >
        {scoreLabel}
      </p>
    </div>
  );
}
````

## File: src/components/child/ChildStarsPanel.jsx
````javascript
import { CHILD } from '../../lib/childTheme';
import { TAWASUL_CHILD } from '../../lib/tawasulChildTheme';
import { SOVEREIGN_CHILD_MAX_STARS } from '../../lib/childSessionBridge';

export default function ChildStarsPanel({
  lang = 'ar',
  starCount = 0,
  sovereign = false,
  maxStars = SOVEREIGN_CHILD_MAX_STARS,
}) {
  const theme = sovereign ? TAWASUL_CHILD : CHILD;
  const cap = sovereign ? maxStars : null;
  const displayCount = cap != null ? Math.min(starCount, cap) : starCount;
  const copy =
    lang === 'en'
      ? {
          title: sovereign ? 'Sovereign stars' : 'My stars',
          empty: sovereign ? 'Engage to earn up to 5 stars' : 'Play to collect stars!',
          count: cap != null ? `${displayCount} of ${cap} sealed` : 'Stars collected',
        }
      : {
          title: sovereign ? 'النجوم السيادية' : 'نجومي',
          empty: sovereign ? 'تفاعل لجمع حتى 5 نجوم' : 'العب لجمع النجوم!',
          count: cap != null ? `${displayCount} من ${cap} مُختومة` : 'نجومك',
        };

  return (
    <div className={theme.card}>
      <h2 className={`${theme.title} text-center mb-6`}>{copy.title}</h2>
      <div className="text-center py-8">
        <p className={`text-6xl font-black mb-2 ${sovereign ? 'text-[#e8c872]' : 'text-amber-500'}`}>
          {cap != null ? `${displayCount}/${cap}` : `${displayCount} ⭐`}
        </p>
        <p className={`text-sm font-bold ${sovereign ? 'text-emerald-400/80' : 'text-slate-500'}`}>
          {displayCount > 0 ? copy.count : copy.empty}
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-2 mt-4">
        {Array.from({ length: cap != null ? cap : Math.min(displayCount, 20) }).map((_, i) => (
          <span key={i} className={`text-2xl ${i < displayCount ? '' : 'opacity-20 grayscale'}`}>
            ⭐
          </span>
        ))}
      </div>
    </div>
  );
}
````

## File: src/index.css
````css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --lux-bg: #0a0a0c;
    --lux-gold: #c9a962;
    --lux-emerald: #34d399;
  }

  html,
  body,
  #root {
    height: 100%;
    min-height: 100%;
  }

  body {
    margin: 0;
    background-color: var(--lux-bg);
    background-image:
      radial-gradient(ellipse 120% 80% at 50% -20%, rgba(201, 169, 98, 0.1), transparent 50%),
      radial-gradient(ellipse 80% 60% at 100% 100%, rgba(52, 211, 153, 0.06), transparent 45%);
    color: rgb(226 232 240);
  }
}

@layer components {
  .lux-page {
    @apply min-h-full bg-[#0a0a0c] text-slate-300 font-sans;
  }

  .lux-glass {
    @apply bg-[#12121a]/70 backdrop-blur-xl border border-[#c9a962]/15 shadow-[0_0_48px_rgba(201,169,98,0.1)];
  }

  .lux-title {
    @apply text-2xl md:text-3xl font-bold bg-gradient-to-l from-[#e8c872] via-[#d4af37] to-[#c9a962] bg-clip-text text-transparent;
  }

  .lux-card {
    @apply lux-glass rounded-3xl p-6 md:p-8 transition-all;
  }

  .lux-input {
    @apply w-full px-4 py-3 rounded-xl bg-[#0d0d10]/90 border border-white/[0.08] text-slate-300 focus:border-emerald-400/45 focus:outline-none focus:ring-1 focus:ring-emerald-400/25;
  }

  .lux-btn-gold {
    @apply px-6 py-3 rounded-xl bg-gradient-to-r from-[#c9a962] to-[#d4af37] font-bold text-[#0a0a0c] hover:shadow-[0_0_32px_rgba(201,169,98,0.28)] transition-all;
  }

  .lux-btn-emerald {
    @apply px-6 py-3 rounded-xl bg-emerald-500 text-[#0a0a0c] font-bold hover:shadow-[0_0_32px_rgba(52,211,153,0.28)] transition-all;
  }

  .lux-heading-gold {
    @apply text-lg font-bold bg-gradient-to-l from-[#e8c872] to-[#c9a962] bg-clip-text text-transparent;
  }

  .lux-emerald-value {
    @apply text-emerald-300 font-mono;
  }
}
/* Luxury nav & main scrollbars */
.lux-nav-scroll::-webkit-scrollbar,
.lux-main-scroll::-webkit-scrollbar { width: 6px; }
.lux-nav-scroll::-webkit-scrollbar-track,
.lux-main-scroll::-webkit-scrollbar-track { background: #0a0a0c; }
.lux-nav-scroll::-webkit-scrollbar-thumb,
.lux-main-scroll::-webkit-scrollbar-thumb { background: rgba(201,169,98,0.25); border-radius: 999px; }
.lux-nav-scroll,
.lux-main-scroll { scrollbar-color: rgba(201,169,98,0.25) #0a0a0c; scrollbar-width: thin; }

/* Hub layering — nav below chrome, modals above content */
.lux-modal-layer { z-index: 50; }
.lux-overlay-layer { z-index: 45; }

/* Gaze neutrality — instant ambient dim + emerald vignette */
html.lux-gaze-dim,
html.lux-gaze-dim body {
  filter: brightness(0.72) saturate(0.85);
  transition: filter 0.8s ease;
}

html.lux-gaze-dim::before {
  content: "";
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 9998;
  background: radial-gradient(ellipse at center, transparent 40%, rgba(52, 211, 153, 0.12) 100%);
}

/* Aunak Reports — print-optimized export */
@media print {
  @page {
    margin: 1.5cm;
    size: A4;
  }

  body,
  html,
  #root {
    background: #fff !important;
    color: #111 !important;
    height: auto !important;
    min-height: auto !important;
    overflow: visible !important;
  }

  .no-print,
  aside,
  header.sovereign-top-bar,
  [class*="sovereignTopBar"],
  [class*="asideShell"],
  nav {
    display: none !important;
  }

  .aunak-report-print {
    display: block !important;
    width: 100% !important;
    max-width: 100% !important;
    padding: 0 !important;
    margin: 0 !important;
    background: #fff !important;
    color: #111 !important;
  }

  .aunak-report-print * {
    color: #111 !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  .aunak-report-section {
    break-inside: avoid;
    page-break-inside: avoid;
    border: 1px solid #cbd5e1 !important;
    background: #f8fafc !important;
    margin-bottom: 1rem !important;
  }

  .aunak-report-header {
    border-bottom: 2px solid #2563eb !important;
    margin-bottom: 1.5rem !important;
  }
}

/* Summer Academy — live playful animations */
@keyframes academy-orb-float {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(3%, -4%) scale(1.05); }
  66% { transform: translate(-2%, 3%) scale(0.98); }
}

@keyframes academy-glow-pulse {
  0%, 100% { opacity: 0.3; transform: translate(-50%, -50%) scale(1); }
  50% { opacity: 0.55; transform: translate(-50%, -50%) scale(1.08); }
}

@keyframes academy-celebrate-burst {
  0% { opacity: 0; }
  10% { opacity: 1; }
  100% { opacity: 0; }
}

@keyframes academy-confetti-fall {
  0% { transform: translateY(-10vh) rotate(0deg); opacity: 1; }
  100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
}

@keyframes academy-icon-wobble {
  0%, 100% { transform: perspective(400px) rotateY(0deg) scale(1); }
  25% { transform: perspective(400px) rotateY(12deg) scale(1.08); }
  75% { transform: perspective(400px) rotateY(-8deg) scale(1.05); }
}

@keyframes academy-bg-shift {
  0%, 100% { filter: hue-rotate(0deg); }
  50% { filter: hue-rotate(8deg); }
}

.academy-orb-float { animation: academy-orb-float 8s ease-in-out infinite; }
.academy-orb-float-delay { animation: academy-orb-float 10s ease-in-out infinite 2s; }
.academy-glow-pulse { animation: academy-glow-pulse 3s ease-in-out infinite; }
.academy-celebrate-burst { animation: academy-celebrate-burst 1.5s ease-out forwards; }
.academy-bg-shift { animation: academy-bg-shift 12s ease-in-out infinite; }
.academy-icon-wobble { animation: academy-icon-wobble 2s ease-in-out infinite; }

.academy-confetti-piece {
  position: absolute;
  top: -5%;
  width: 10px;
  height: 10px;
  border-radius: 2px;
  animation: academy-confetti-fall 1.4s ease-in forwards;
}

@keyframes child-bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

.child-play-root {
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}

.academy-live-root { position: relative; min-height: 100vh; }
.academy-mascot-shadow { filter: drop-shadow(0 12px 24px rgba(255, 100, 80, 0.25)); }

/* ============================================================= */
/* Tawasul child — sensory dopamine factory (avatar, reward, calm) */
/* ============================================================= */

/* Fluid calming gradient (calm_pulse) — slow drifting blue/violet waves */
@keyframes tawasul-fluid {
  0%   { background-position: 0% 50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
.tawasul-calm-fluid {
  background: linear-gradient(
    120deg,
    #0b1a3a 0%, #1e2a78 20%, #3b2f8f 40%,
    #5b3fa6 55%, #2a4d9e 72%, #123a7a 88%, #0b1a3a 100%
  );
  background-size: 320% 320%;
  animation: tawasul-fluid 14s ease-in-out infinite;
}

/* Soft breathing aurora blobs layered over the fluid gradient */
@keyframes tawasul-aurora {
  0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.5; }
  50%      { transform: translate(4%, -3%) scale(1.15); opacity: 0.8; }
}
.tawasul-aurora { animation: tawasul-aurora 9s ease-in-out infinite; }
.tawasul-aurora-delay { animation: tawasul-aurora 11s ease-in-out infinite 2.5s; }

/* Calm breathing orb */
@keyframes tawasul-breathe {
  0%, 100% { transform: scale(0.85); box-shadow: 0 0 40px rgba(129, 140, 248, 0.35); }
  50%      { transform: scale(1.18); box-shadow: 0 0 90px rgba(167, 139, 250, 0.6); }
}
.tawasul-breathe { animation: tawasul-breathe 5.5s ease-in-out infinite; }

/* Avatar life — breathe, blink, float */
@keyframes tawasul-avatar-breathe {
  0%, 100% { transform: translateY(0) scale(1); }
  50%      { transform: translateY(-6px) scale(1.03); }
}
@keyframes tawasul-blink {
  0%, 92%, 100% { transform: scaleY(1); }
  96%           { transform: scaleY(0.1); }
}
.tawasul-avatar-breathe { animation: tawasul-avatar-breathe 3.4s ease-in-out infinite; }
.tawasul-blink { animation: tawasul-blink 4.2s ease-in-out infinite; transform-origin: center; }
.tawasul-blink-delay { animation: tawasul-blink 4.2s ease-in-out infinite 0.08s; transform-origin: center; }

/* Speaker pulse rings (goal TTS button) */
@keyframes tawasul-ring {
  0%   { transform: scale(0.9); opacity: 0.7; }
  100% { transform: scale(2.1); opacity: 0; }
}
.tawasul-ring { animation: tawasul-ring 2s ease-out infinite; }
.tawasul-ring-delay { animation: tawasul-ring 2s ease-out infinite 1s; }

/* Speaker equalizer bars while speaking */
@keyframes tawasul-eq {
  0%, 100% { transform: scaleY(0.35); }
  50%      { transform: scaleY(1); }
}
.tawasul-eq-bar { transform-origin: bottom; animation: tawasul-eq 0.7s ease-in-out infinite; }

/* Reward — fireworks burst */
@keyframes tawasul-firework {
  0%   { transform: translate(0, 0) scale(0.2); opacity: 1; }
  70%  { opacity: 1; }
  100% { transform: translate(var(--fx), var(--fy)) scale(1); opacity: 0; }
}
.tawasul-fw-spark {
  position: absolute;
  width: 10px; height: 10px;
  border-radius: 999px;
  animation: tawasul-firework 1.1s ease-out forwards;
}

/* Reward — balloons rising */
@keyframes tawasul-balloon-rise {
  0%   { transform: translateY(0) rotate(var(--rot)); opacity: 0; }
  10%  { opacity: 1; }
  100% { transform: translateY(-115vh) rotate(calc(var(--rot) * -1)); opacity: 0; }
}
.tawasul-balloon {
  position: absolute;
  bottom: -14vh;
  animation: tawasul-balloon-rise var(--dur, 3.4s) ease-in forwards;
  will-change: transform;
}

/* Reward — confetti fall (sovereign colors) */
@keyframes tawasul-confetti {
  0%   { transform: translateY(-12vh) rotate(0deg); opacity: 1; }
  100% { transform: translateY(114vh) rotate(760deg); opacity: 0; }
}
.tawasul-confetti-piece {
  position: absolute;
  top: -6%;
  width: 12px; height: 16px;
  border-radius: 3px;
  animation: tawasul-confetti 1.8s ease-in forwards;
}

/* Central Ta-da pop */
@keyframes tawasul-tada {
  0%   { transform: scale(0.2) rotate(-12deg); opacity: 0; }
  30%  { transform: scale(1.25) rotate(6deg); opacity: 1; }
  55%  { transform: scale(0.95) rotate(-3deg); }
  75%  { transform: scale(1.08) rotate(0deg); opacity: 1; }
  100% { transform: scale(1) rotate(0deg); opacity: 0; }
}
.tawasul-tada { animation: tawasul-tada 2.6s ease-out forwards; }
````

## File: src/lib/airtable.js
````javascript
/**
 * Airtable REST client — native fetch only (no npm "airtable" package).
 */

import { AIRTABLE_TABLES } from "./airtableTables";
import { mapStudent } from "./airtableMappers";
import {
  STUDENT as SF,
  DAILY_SESSION as DS_FIELDS,
  ACCESS as AF,
  GOAL_ATTEMPT as GA_FIELDS,
  STUDENT_SELECT as SS,
} from "./airtableFields";

export { AIRTABLE_TABLES };
export { STUDENT, DAILY_SESSION, ACCESS, GOAL_ATTEMPT, SPECIALIST, SUMMER_ACADEMY } from "./airtableFields";

export const STUDENTS_TABLE = AIRTABLE_TABLES.students;

/** @deprecated use STUDENT.* from airtableFields */
export const STUDENT_NAME_FIELD = SF.name;
export const STUDENT_STATUS_FIELD = SF.status;
export const STUDENT_ID_FIELD = SF.id;
export const STUDENT_BIOMETRIC_FIELD = SF.face_biometric;
export const STUDENT_BIOMETRIC_STATUS_FIELD = SF.biometric_status;
export const STUDENT_HARMONY_FIELD = SF.harmony_score;
export const STUDENT_CAMERA_ACCESS_FIELD = SF.camera_access;
export const STUDENT_PARENT_PHONE_FIELD = SF.parent_phone;
export const PREFERRED_LANDING_FIELD = SF.preferred_destination;
export const STUDENT_AGE_FIELD = SF.age;
export const STUDENT_DIAGNOSIS_FIELD = SF.diagnosis;
export const STUDENT_CLASS_FIELD = SF.assigned_class;

export const STUDENTS_TABLE_LABEL = "Students";

export const DEFAULT_ENROLLMENT_STATUS = "active";
export const REFERENCE_CAPTURE_APPROVED_STATUS = "approved";

/** True when face descriptor missing or Biometric Capture Status is not approved. */
export function studentNeedsReferenceCapture(student) {
  const f = student?.fields ?? {};
  const rawDescriptor = student?.faceBiometric ?? getField(f, SF.face_biometric);
  const hasDescriptor =
    rawDescriptor != null &&
    rawDescriptor !== "" &&
    String(rawDescriptor).trim().length > 8;

  const captureStatus = getField(f, SF.biometric_status);
  if (!captureStatus || String(captureStatus).trim() === "") {
    return !hasDescriptor;
  }
  const approved = /approved|captured|active|complete|معتمد|ملتقط/i.test(
    String(captureStatus).trim()
  );
  return !hasDescriptor || !approved;
}

/** Unique student code: name + last 4 phone digits + YYYYMMDD → (ID) كود الطالب */
export function generateUniqueStudentCode({ name, parentPhone, date = new Date() } = {}) {
  const nameNorm = String(name ?? "student")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\p{L}\p{N}\-_]/gu, "");
  const digits = String(parentPhone ?? "").replace(/\D/g, "");
  const last4 = (digits.slice(-4) || "0000").padStart(4, "0");
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${nameNorm || "student"}-${last4}-${y}${m}${d}`;
}

/** @deprecated use generateUniqueStudentCode */
export function generateStudentId(name, parentPhone) {
  return generateUniqueStudentCode({ name, parentPhone });
}

/** Logical enrollment payload → env-resolved Airtable column names for POST. */
export function buildStudentEnrollmentFields({
  name,
  age,
  diagnosis,
  status,
  parentPhone,
  parentCountryCode,
  preferredLanding,
} = {}) {
  const fields = {};
  if (name?.trim()) fields[SF.name] = name.trim();
  if (age != null && age !== "" && Number.isFinite(Number(age))) {
    fields[SF.age] = Number(age);
  }
  if (diagnosis?.trim()) fields[SF.diagnosis] = diagnosis.trim();
  fields[SF.status] = status ?? SS.status.new;
  fields[SF.subscription_status] = SS.subscription_status.pending;
  if (parentCountryCode?.trim()) fields[SF.parent_country_code] = parentCountryCode.trim();
  if (parentPhone?.trim()) fields[SF.parent_phone] = parentPhone.trim();
  const code = generateUniqueStudentCode({ name, parentPhone });
  if (code) fields[SF.id] = code;
  if (preferredLanding?.trim()) fields[SF.preferred_destination] = preferredLanding.trim();
  return fields;
}

const DEFAULT_AIRTABLE_BASE_ID = "appaGfKj4vYhMw0cb";

/** Paste your Airtable Personal Access Token here (pat...). */
const HARDCODED_API_KEY = "put_your_token_here";

function sanitizeAscii(value) {
  if (value == null) return "";
  return String(value)
    .replace(/^\uFEFF/, "")
    .replace(/\u200B/g, "")
    .replace(/[\r\n\t]/g, "")
    .replace(/[^\x20-\x7E]/g, "")
    .trim();
}

function sanitizeApiKey(key) {
  if (key == null || key === "") return key;
  return sanitizeAscii(key);
}

function sanitizeBaseId(raw) {
  const cleaned = sanitizeAscii(raw);
  if (!cleaned) return DEFAULT_AIRTABLE_BASE_ID;
  const segment = cleaned.split("/")[0].split("?")[0];
  const alnum = segment.replace(/[^a-zA-Z0-9]/g, "");
  return alnum || DEFAULT_AIRTABLE_BASE_ID;
}

function resolveBaseId() {
  const fromEnv = import.meta.env.VITE_AIRTABLE_BASE_ID;
  if (!fromEnv) return DEFAULT_AIRTABLE_BASE_ID;
  return sanitizeBaseId(fromEnv);
}

function resolveApiKey() {
  const fromEnv =
    import.meta.env.VITE_AIRTABLE_API_KEY ||
    import.meta.env.VITE_AIRTABLE_PAT;
  if (fromEnv && fromEnv !== "put_your_token_here") return sanitizeApiKey(fromEnv);
  return sanitizeApiKey(HARDCODED_API_KEY);
}

export const AIRTABLE_API_KEY = resolveApiKey();
export const AIRTABLE_BASE_ID = resolveBaseId();

const BASE_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}`;

export const USE_PROXY = import.meta.env.VITE_USE_AIRTABLE_PROXY === "true";

function hasDirectApiKey() {
  const key = resolveApiKey();
  return Boolean(key && key !== "put_your_token_here");
}

async function proxyFetch(tableId, { method = "GET", params = {}, recordId, body } = {}) {
  const qs = new URLSearchParams({ table: tableId });
  if (recordId) qs.set("recordId", recordId);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) qs.set(key, String(value));
  }
  const init = {
    method,
    headers: { Accept: sanitizeAscii("application/json") },
  };
  if (body != null && method !== "GET") {
    init.headers["Content-Type"] = sanitizeAscii("application/json");
    init.body = JSON.stringify(body);
  }
  assertLatin1Headers(init.headers);
  const response = await fetch("/api/airtable?" + qs.toString(), init);
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error("Airtable proxy " + response.status + (detail ? ": " + detail : ""));
  }
  return response.json();
}

async function directFetchTable(tableId, params = {}) {
  const url = BASE_URL + "/" + encodeURIComponent(tableId) + buildQueryString(params);
  const response = await fetch(url, {
    method: "GET",
    headers: airtableRequestHeaders(),
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error("Airtable Error " + response.status + (detail ? ": " + detail : ""));
  }
  return response.json();
}

async function directWrite(tableId, method, body, recordId) {
  const suffix = recordId ? "/" + encodeURIComponent(recordId) : "";
  const url = BASE_URL + "/" + encodeURIComponent(tableId) + suffix;
  const response = await fetch(url, {
    method,
    headers: airtableRequestHeaders({ write: true }),
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error("Airtable Error " + response.status + (detail ? ": " + detail : ""));
  }
  return response.json();
}

function assertLatin1Headers(headers) {
  for (const [name, value] of Object.entries(headers || {})) {
    const s = String(value);
    for (let i = 0; i < s.length; i++) {
      if (s.charCodeAt(i) > 255) {
        throw new Error(`Airtable request header "${name}" is not Latin-1 safe`);
      }
    }
  }
}

function airtableRequestHeaders({ write = false } = {}) {
  const token = sanitizeApiKey(AIRTABLE_API_KEY);
  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: sanitizeAscii("application/json"),
  };
  if (write) headers["Content-Type"] = sanitizeAscii("application/json");
  assertLatin1Headers(headers);
  return headers;
}


export const airtable = {
  apiKey: AIRTABLE_API_KEY,
  baseId: AIRTABLE_BASE_ID,
  baseUrl: BASE_URL,
  studentsTableId: STUDENTS_TABLE,
};

function fieldValue(raw) {
  if (raw == null || raw === "") return null;
  if (Array.isArray(raw)) {
    return raw
      .map((v) => (typeof v === "object" && v !== null ? v.name ?? String(v) : String(v)))
      .join(", ");
  }
  if (typeof raw === "object") {
    if ("value" in raw && raw.value != null && raw.value !== "") {
      return fieldValue(raw.value);
    }
    if ("state" in raw && (raw.state === "error" || raw.state === "empty")) {
      return null;
    }
    if (raw.name != null && raw.name !== "") return String(raw.name);
    return null;
  }
  return String(raw);
}

export function getField(fields, exactName, ...fallbackIncludes) {
  if (!fields || typeof fields !== "object") return null;
  if (exactName in fields) return fieldValue(fields[exactName]);

  const needles = [exactName, ...fallbackIncludes].filter(
    (n) => n != null && String(n).trim() !== ""
  );

  for (const needle of needles) {
    const key = Object.keys(fields).find(
      (k) =>
        k === needle ||
        (typeof needle === "string" && needle.length > 0 && k.includes(String(needle)))
    );
    if (key) return fieldValue(fields[key]);
  }

  return null;
}

export function parseHarmonyScore(score) {
  if (score == null || score === "") return null;
  const n = Number(String(score).replace(/%/g, "").trim());
  return Number.isFinite(n) ? n : null;
}

function buildQueryString(params = {}) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) search.append(key, String(value));
  }
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

async function airtableFetchTable(tableId, params = {}) {
  if (USE_PROXY) {
    try {
      return await proxyFetch(tableId, { method: "GET", params });
    } catch (proxyErr) {
      if (hasDirectApiKey()) {
        console.warn("[airtable] proxy GET failed, falling back to direct:", proxyErr.message);
        return directFetchTable(tableId, params);
      }
      throw proxyErr;
    }
  }
  if (!hasDirectApiKey()) {
    throw new Error(
      "Airtable API key missing. Set VITE_USE_AIRTABLE_PROXY=true or VITE_AIRTABLE_API_KEY in .env.local"
    );
  }
  return directFetchTable(tableId, params);
}

export async function fetchAllRecords(tableId, params = {}) {
  const allRecords = [];
  let offset;

  do {
    const pageParams = { ...params };
    if (offset) pageParams.offset = offset;
    const page = await airtableFetchTable(tableId, pageParams);
    if (Array.isArray(page.records)) allRecords.push(...page.records);
    offset = page.offset;
  } while (offset);

  return allRecords;
}

/** Fetch all records from any table; tries Grid view then falls back. */
export async function fetchAirtableRecords(tableId, params = {}) {
  if (!tableId) return [];
  try {
    return await fetchAllRecords(tableId, { view: "Grid view", ...params });
  } catch (firstError) {
    console.warn(`[airtable] Grid view failed for ${tableId}:`, firstError.message);
    try {
      return await fetchAllRecords(tableId, params);
    } catch (secondError) {
      console.error(`[airtable] fetch failed for ${tableId}:`, secondError);
      throw secondError;
    }
  }
}

async function loadStudentRecords() {
  try {
    return await fetchAllRecords(STUDENTS_TABLE, { view: "Grid view" });
  } catch (firstError) {
    console.warn("[airtable] Grid view fetch failed, retrying without view:", firstError.message);
    return fetchAllRecords(STUDENTS_TABLE);
  }
}

export function getStudentAssignedClass(fields) {
  if (!fields || typeof fields !== "object") return null;
  return getField(fields, SF.assigned_class);
}

function mapRecord(record) {
  const mapped = mapStudent(record, "ar");
  const fields = record?.fields ?? {};
  return {
    ...mapped,
    assignedClass: mapped.assignedClass ?? getStudentAssignedClass(fields),
  };
}

/** Match a student from a live registry by child code, record id, or name fragment. */
export function findStudentByIdentifier(students, identifier) {
  if (!identifier || !Array.isArray(students)) return null;
  const needle = String(identifier).trim().toLowerCase().replace(/\s+/g, "");
  if (!needle) return null;

  return (
    students.find((student) => {
      const code = String(student?.studentCode ?? "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "");
      const id = String(student?.id ?? "")
        .trim()
        .toLowerCase();
      const name = String(student?.name ?? "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "");
      return (
        (code && (code === needle || code.includes(needle) || needle.includes(code))) ||
        (id && id === needle) ||
        (name && name.includes(needle))
      );
    }) ?? null
  );
}

export async function fetchStudents() {
  const records = await loadStudentRecords();
  if (!Array.isArray(records)) return [];
  return records.map(mapRecord);
}

const ACTIVE_PERMISSION_MARKERS = ["active", "نشط", "مفعل", "فعال", "enabled", "approved", "معتمد"];

async function airtableWrite(tableId, method, body, recordId) {
  const payload =
    body != null && typeof body === "object" && "fields" in body && body.typecast == null
      ? { ...body, typecast: true }
      : body;
  if (USE_PROXY) {
    try {
      return await proxyFetch(tableId, { method, body: payload, recordId });
    } catch (proxyErr) {
      if (hasDirectApiKey()) {
        console.warn("[airtable] proxy write failed, falling back to direct:", proxyErr.message);
        return directWrite(tableId, method, payload, recordId);
      }
      throw proxyErr;
    }
  }
  if (!hasDirectApiKey()) {
    throw new Error(
      "Airtable API key missing. Set VITE_USE_AIRTABLE_PROXY=true or VITE_AIRTABLE_API_KEY in .env.local"
    );
  }
  return directWrite(tableId, method, payload, recordId);
}

function scrubFields(fields) {
  const out = {};
  for (const [k, v] of Object.entries(fields || {})) {
    if (v !== undefined && v !== null && v !== "") out[k] = v;
  }
  return out;
}

/** Parse Airtable 422 body — surface unknown field / invalid select for UI. */
export function formatAirtableWriteError(err) {
  const msg = String(err?.message ?? "");
  let body = msg;
  const colon = msg.indexOf(": ");
  if (colon >= 0) body = msg.slice(colon + 2);
  try {
    const parsed = JSON.parse(body);
    const ae = parsed?.error ?? parsed;
    const type = ae?.type ?? "";
    const message = ae?.message ?? msg;
    if (type === "UNKNOWN_FIELD_NAME" || /unknown field name/i.test(message)) {
      const m = String(message).match(/Unknown field name: "?([^"\n]+)"?/i);
      const bad = m?.[1]?.trim();
      return bad
        ? `UNKNOWN_FIELD_NAME: "${bad}" — create or rename this column in Airtable Students table`
        : `UNKNOWN_FIELD_NAME: ${message}`;
    }
    if (type === "INVALID_MULTIPLE_CHOICE_OPTIONS") {
      return `INVALID_SELECT_OPTION: ${message}`;
    }
    if (/insufficient permissions to create new select option/i.test(message)) {
      const opt = String(message).match(/option\s+"?([^"]+)"?/i)?.[1]?.trim() ?? "unknown";
      return (
        `SELECT_OPTION_MISSING: "${opt}" — in Airtable add this option to the dropdown, or use a token with schema.bases:write. ` +
        `Required: status→new,active | subscription_status→pending,active | preferred_destination→media,registry,community,diagnostics`
      );
    }
    if (type) return `${type}: ${message}`;
    return message;
  } catch {
    if (/UNKNOWN_FIELD_NAME/i.test(msg)) return msg;
    return msg || "Airtable write failed";
  }
}

export async function createStudentRecord(fields) {
  try {
    const data = await airtableWrite(STUDENTS_TABLE, "POST", { fields: scrubFields(fields) });
    return mapRecord(data);
  } catch (err) {
    throw new Error(formatAirtableWriteError(err));
  }
}

export async function updateStudentRecord(recordId, fields) {
  if (!recordId) throw new Error("recordId required");
  const data = await airtableWrite(STUDENTS_TABLE, "PATCH", { fields: fields ?? {} }, recordId);
  return mapRecord(data);
}

export async function saveStudentFaceBiometric(
  recordId,
  descriptorJson,
  { captureStatus = REFERENCE_CAPTURE_APPROVED_STATUS } = {}
) {
  const row = await updateStudentRecord(recordId, { [SF.face_biometric]: descriptorJson });
  try {
    await updateStudentRecord(recordId, { [SF.biometric_status]: captureStatus });
  } catch (err) {
    console.warn("[saveStudentFaceBiometric] biometric_status:", err?.message);
  }
  return row;
}

/** Ensure student Status is Active after enrollment; subscription stays Pending until activation code. */
export async function promoteStudentStatus(recordId) {
  if (!recordId) throw new Error("recordId required");
  return updateStudentRecord(recordId, {
    [SF.status]: DEFAULT_ENROLLMENT_STATUS,
    [SF.subscription_status]: SS.subscription_status.pending,
  });
}

/** Save free quick-assessment result on student record. */
export async function saveInitialAssessmentScore(recordId, scorePayload) {
  if (!recordId) throw new Error("recordId required");
  const scoreValue =
    typeof scorePayload === "object" && scorePayload?.score != null
      ? Number(scorePayload.score)
      : typeof scorePayload === "number"
        ? scorePayload
        : null;

  const fields = {};
  if (scoreValue != null && Number.isFinite(scoreValue)) {
    fields[SF.initial_assessment_score] = scoreValue;
  } else if (typeof scorePayload === "string") {
    fields[SF.initial_assessment_score] = scorePayload;
  }

  if (typeof scorePayload === "object" && scorePayload != null) {
    fields[SF.initial_assessment_score] =
      scorePayload.score ?? fields[SF.initial_assessment_score];
  }

  fields[SF.comprehensive_assessment_status] = "not_started";

  return updateStudentRecord(recordId, fields);
}

export async function updateSpecialistRecord(recordId, fields) {
  if (!recordId) throw new Error("recordId required");
  const data = await airtableWrite(AIRTABLE_TABLES.specialists, "PATCH", { fields: fields ?? {} }, recordId);
  return mapRecord(data);
}

function isPermissionRecordActive(fields) {
  if (!fields || typeof fields !== "object") return false;
  const status = getField(fields, AF.status);
  if (status == null || status === "") return false;
  const v = String(status).trim().toLowerCase();
  if (/denied|inactive|مرفوض|معطل|disabled/.test(v)) return false;
  return ACTIVE_PERMISSION_MARKERS.some((m) => v.includes(m)) || v === "true" || v === "1";
}

/** True when linked access-control records grant an active camera permission. */
export async function hasActiveCameraPermission(student) {
  const ids = student?.cameraAccessIds;
  const list = Array.isArray(ids) ? ids : [];
  if (!list.length) return false;

  const records = await fetchAirtableRecords(AIRTABLE_TABLES.accessControl);
  return list.some((id) => {
    const rec = records.find((r) => r.id === id);
    return rec ? isPermissionRecordActive(rec.fields) : false;
  });
}

/** Create active camera permission in Access Control and link to student record. */
export async function createCameraAccessPermission(studentRecordId, studentName) {
  if (!studentRecordId) return null;

  try {
    const permissionFields = scrubFields({
      [AF.user_name]: studentName ? `Camera — ${studentName}` : "Camera Access",
      [AF.status]: "active",
      [AF.permissions]: "camera_biometric",
      [AF.access_level]: "parent",
    });

    const data = await airtableWrite(AIRTABLE_TABLES.accessControl, "POST", {
      fields: permissionFields,
    });
    const permissionRecord = data;

    if (!permissionRecord?.id) return null;

    try {
      await updateStudentRecord(studentRecordId, {
        [SF.camera_access]: [permissionRecord.id],
      });
    } catch {
      /* permission created but link failed — non-blocking */
    }

    return permissionRecord;
  } catch (err) {
    console.warn(
      "[airtable] createCameraAccessPermission skipped:",
      formatAirtableWriteError(err)
    );
    return null;
  }
}

const DAILY_SESSIONS_LS = "aunak.dailySessions.v1";
const LEDGER_OVERRIDE_LS = "aunak.ledgerOverride.v1";

/** Canonical Daily Sessions columns — snake_case. */
export const DAILY_SESSION_FIELDS = {
  sessionDate: DS_FIELDS.session_date,
  specialistName: DS_FIELDS.specialist_name,
  studentName: DS_FIELDS.student_name,
  notes: DS_FIELDS.notes,
  claimStatus: DS_FIELDS.claim_status,
  sealedAt: DS_FIELDS.sealed_at,
  specialistSignature: DS_FIELDS.specialist_signature,
  immutableHash: DS_FIELDS.immutable_hash,
  sessionSequence: DS_FIELDS.session_sequence,
  pinVerified: DS_FIELDS.pin_verified,
};

const DS = DAILY_SESSION_FIELDS;
const CLAIM_STATUS_SEALED = "Sealed";

function isCloudDailySessionsTable() {
  return Boolean(AIRTABLE_TABLES.dailySessions);
}

function normalizeSessionDate(date) {
  if (!date) return new Date().toISOString().slice(0, 10);
  const s = String(date).trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  const d = new Date(s);
  if (!Number.isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  return new Date().toISOString().slice(0, 10);
}

function normalizeEmail(email) {
  return String(email ?? "").trim().toLowerCase();
}

function readDailySessionsBackup() {
  try {
    const raw = localStorage.getItem(DAILY_SESSIONS_LS);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeDailySessionsBackup(records) {
  try {
    localStorage.setItem(DAILY_SESSIONS_LS, JSON.stringify(records));
  } catch {
    /* ignore */
  }
}

function backupRecordFromAirtable(record) {
  const suffix = Math.random().toString(36).slice(2, 8);
  return {
    id: record?.id ?? "local-" + Date.now() + "-" + suffix,
    fields: { ...(record?.fields ?? record) },
  };
}

function appendDailySessionBackup(fields) {
  const list = readDailySessionsBackup();
  list.push(backupRecordFromAirtable({ fields }));
  writeDailySessionsBackup(list);
}

function updateDailySessionBackup(recordId, patchFields) {
  const list = readDailySessionsBackup();
  const idx = list.findIndex((r) => r.id === recordId);
  if (idx >= 0) {
    list[idx] = {
      ...list[idx],
      fields: { ...list[idx].fields, ...patchFields },
    };
  } else {
    list.push(backupRecordFromAirtable({ id: recordId, fields: patchFields }));
  }
  writeDailySessionsBackup(list);
}

function readLedgerOverrides() {
  try {
    const raw = localStorage.getItem(LEDGER_OVERRIDE_LS);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}
