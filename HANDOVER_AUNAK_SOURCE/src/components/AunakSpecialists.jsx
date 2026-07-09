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
