import { useState, useEffect, useMemo } from 'react';
import {
  FlaskConical,
  ShieldCheck,
  Eye,
  Download,
  Send,
  Lock,
  Globe2,
  Database,
  Loader2,
  KeyRound,
  CheckCircle2,
} from 'lucide-react';
import { fetchAirtableRecords, parseHarmonyScore } from '../lib/airtable';
import {
  RESEARCH_SOURCES,
  anonymizeForResearch,
  smartCensorAudit,
  applyCensor,
  encryptForExport,
} from '../lib/research';
import { useAuth, ROLES } from '../lib/auth';
import { LUX } from '../lib/luxTheme.js';

/** Find the first indicator whose key matches the pattern. */
function pickIndicator(indicators, pattern) {
  for (const [key, value] of Object.entries(indicators ?? {})) {
    if (pattern.test(key)) return value;
  }
  return null;
}

function distribution(rows, pattern) {
  const counts = new Map();
  for (const row of rows) {
    let v = pickIndicator(row.indicators, pattern);
    if (Array.isArray(v)) v = v[0];
    if (v == null || v === '') continue;
    const label = String(v).trim();
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
}

const BAR_COLORS = ['bg-amber-600', 'bg-indigo-500', 'bg-emerald-600', 'bg-rose-500', 'bg-cyan-600', 'bg-violet-500'];

export default function AunakResearchHub({ lang = 'ar' }) {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === ROLES.ADMIN;

  const [rowsBySource, setRowsBySource] = useState({});
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [exportKey, setExportKey] = useState(null);
  const [published, setPublished] = useState(false);

  const t = {
    ar: {
      title: 'مركز عونك للأبحاث',
      subtitle: 'القسم 16 — أطلس التوحد الوطني · بيانات مجرّدة بالكامل من الهوية',
      badgeCensor: 'الرقيب الذكي: المخرجات مدققة',
      badgeAes: 'تشفير AES-256',
      loading: 'جاري سحب البيانات الحيوية وتجريدها من الهوية...',
      kpiCases: 'حالة بحثية مجرّدة',
      kpiSources: 'مصادر حيوية',
      kpiHarmony: 'متوسط التناغم',
      kpiCensor: 'فحص الرقيب',
      censorPass: 'نظيف 100%',
      censorBlocked: (n) => `حُجبت ${n} سجلات`,
      atlas: 'أطلس التوحد الوطني',
      atlasHint: 'توزيعات مجمعة — لا يمكن إرجاع أي مؤشر لهوية طفل بعينه',
      diagDist: 'توزيع التشخيصات',
      moodDist: 'توزيع الحالات المزاجية المرصودة',
      harmonyDist: 'توزيع درجات التناغم',
      bucketLow: 'حرج (<50)',
      bucketMid: 'متوسط (50-79)',
      bucketHigh: 'مرتفع (80+)',
      noData: 'لا توجد مؤشرات كافية بعد',
      sources: 'المصادر الحيوية المغذية للأطلس',
      records: 'سجل',
      exportBtn: 'تحميل الحزمة البحثية (AES-256)',
      exportingBtn: 'جاري التشفير...',
      exportKeyLabel: 'مفتاح فك التشفير (يُعرض مرة واحدة — احفظه الآن):',
      publishBtn: 'نشر في الأطلس الوطني',
      publishedBtn: 'تم النشر في الأطلس',
      publishLocked: 'النشر صلاحية حصرية للمدير الأعلى (Super Admin)',
      anonNote: 'وظيفة anonymizeForResearch() أزالت أسماء الأطفال، الأكواد، بيانات التواصل وأولياء الأمور قبل أي عرض أو تحميل.',
    },
    en: {
      title: 'Aunak Research Center',
      subtitle: 'Section 16 — National Autism Atlas · fully de-identified data',
      badgeCensor: 'Smart Censor: outputs audited',
      badgeAes: 'AES-256 Encryption',
      loading: 'Pulling vital data and stripping identity...',
      kpiCases: 'Anonymized research cases',
      kpiSources: 'Vital sources',
      kpiHarmony: 'Avg. harmony',
      kpiCensor: 'Censor audit',
      censorPass: '100% clean',
      censorBlocked: (n) => `${n} rows blocked`,
      atlas: 'National Autism Atlas',
      atlasHint: 'Aggregate distributions — no indicator can be traced back to a child',
      diagDist: 'Diagnosis Distribution',
      moodDist: 'Observed Mood Distribution',
      harmonyDist: 'Harmony Score Distribution',
      bucketLow: 'Critical (<50)',
      bucketMid: 'Moderate (50-79)',
      bucketHigh: 'High (80+)',
      noData: 'Not enough indicators yet',
      sources: 'Vital sources feeding the atlas',
      records: 'records',
      exportBtn: 'Download Research Package (AES-256)',
      exportingBtn: 'Encrypting...',
      exportKeyLabel: 'Decryption key (shown once — save it now):',
      publishBtn: 'Publish to National Atlas',
      publishedBtn: 'Published to Atlas',
      publishLocked: 'Publishing is exclusive to the Super Admin',
      anonNote: 'anonymizeForResearch() removed child names, codes, contact and guardian data before any display or download.',
    },
  };
  const copy = t[lang] ?? t.ar;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const results = await Promise.allSettled(
        RESEARCH_SOURCES.map((s) => fetchAirtableRecords(s.tableId))
      );
      if (cancelled) return;
      const next = {};
      RESEARCH_SOURCES.forEach((s, i) => {
        const records = results[i].status === 'fulfilled' ? results[i].value : [];
        // تجريد الهوية ثم تمرير المخرجات على الرقيب الذكي قبل أي عرض.
        next[s.key] = applyCensor(anonymizeForResearch(records, s.key));
      });
      setRowsBySource(next);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const allRows = useMemo(() => Object.values(rowsBySource).flat(), [rowsBySource]);
  const audit = useMemo(() => smartCensorAudit(allRows), [allRows]);

  const harmonyScores = useMemo(() => {
    return (rowsBySource.students ?? [])
      .map((row) => parseHarmonyScore(pickIndicator(row.indicators, /harmony|تناغم/i)))
      .filter((h) => h != null);
  }, [rowsBySource.students]);

  const avgHarmony = harmonyScores.length
    ? Math.round(harmonyScores.reduce((a, b) => a + b, 0) / harmonyScores.length)
    : null;

  const harmonyBuckets = useMemo(() => {
    const buckets = [
      { label: copy.bucketLow, color: 'bg-rose-500', count: 0 },
      { label: copy.bucketMid, color: 'bg-amber-600', count: 0 },
      { label: copy.bucketHigh, color: 'bg-emerald-600', count: 0 },
    ];
    for (const h of harmonyScores) {
      if (h < 50) buckets[0].count += 1;
      else if (h < 80) buckets[1].count += 1;
      else buckets[2].count += 1;
    }
    return buckets;
  }, [harmonyScores, copy.bucketLow, copy.bucketMid, copy.bucketHigh]);

  const diagDist = useMemo(
    () => distribution(rowsBySource.students ?? [], /تشخيص|diagnosis/i),
    [rowsBySource.students]
  );
  const moodDist = useMemo(
    () => distribution(rowsBySource.emotion ?? [], /مزاج|mood|عاطفة|emotion/i),
    [rowsBySource.emotion]
  );

  const handleExport = async () => {
    if (exporting || allRows.length === 0) return;
    setExporting(true);
    setExportKey(null);
    try {
      // الرقيب الذكي يدقق المخرجات النهائية قبل السماح بالتحميل.
      const cleanRows = applyCensor(allRows);
      const { fileText, keyHex } = await encryptForExport({
        atlas: 'Aunak National Autism Atlas',
        cases: cleanRows,
      });
      const blob = new Blob([fileText], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `aunak-research-${Date.now()}.aun.json`;
      a.click();
      URL.revokeObjectURL(url);
      setExportKey(keyHex);
    } finally {
      setExporting(false);
    }
  };

  const maxDiag = Math.max(1, ...diagDist.map(([, n]) => n));
  const maxMood = Math.max(1, ...moodDist.map(([, n]) => n));
  const maxBucket = Math.max(1, ...harmonyBuckets.map((b) => b.count));

  return (
    <div
      className="p-6 md:p-10 min-h-screen bg-[#08070d] text-slate-200 font-sans"
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
    >
      {/* Dark Academic header */}
      <header className="mb-8 relative overflow-hidden rounded-3xl border border-amber-700/30 bg-gradient-to-br from-[#15110a] via-[#0d0b14] to-[#0a0d16] p-8 shadow-[0_0_50px_rgba(180,130,40,0.08)]">
        <div className="absolute top-0 left-0 w-72 h-72 bg-amber-700/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-indigo-700/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-l from-amber-300 via-amber-200 to-indigo-300 bg-clip-text text-transparent flex items-center gap-3">
              <FlaskConical className="w-9 h-9 text-amber-500 shrink-0" /> {copy.title}
            </h2>
            <p className="text-slate-400 mt-3 font-mono text-sm">{copy.subtitle}</p>
          </div>
          <div className="flex flex-col gap-2 shrink-0">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
              <Eye className="w-3.5 h-3.5" /> {copy.badgeCensor}
            </span>
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#c9a962] to-[#d4af37]/10 border border-amber-600/30 text-[#e8c872] text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5" /> {copy.badgeAes}
            </span>
          </div>
        </div>
      </header>

      {loading ? (
        <div className="text-center py-24 text-slate-400 font-mono flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-amber-600" />
          {copy.loading}
        </div>
      ) : (
        <div className="max-w-7xl mx-auto space-y-8">
          {/* KPI row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-[#100e16] border border-[#c9a962]/15 text-center">
              <p className="text-4xl font-black text-[#e8c872]">{allRows.length}</p>
              <p className="text-xs text-slate-500 mt-2">{copy.kpiCases}</p>
            </div>
            <div className="p-5 rounded-2xl bg-[#100e16] border border-[#c9a962]/15 text-center">
              <p className="text-4xl font-black text-[#e8c872]">{RESEARCH_SOURCES.length}</p>
              <p className="text-xs text-slate-500 mt-2">{copy.kpiSources}</p>
            </div>
            <div className="p-5 rounded-2xl bg-[#100e16] border border-[#c9a962]/15 text-center">
              <p className="text-4xl font-black text-emerald-300">{avgHarmony != null ? `${avgHarmony}%` : '—'}</p>
              <p className="text-xs text-slate-500 mt-2">{copy.kpiHarmony}</p>
            </div>
            <div className="p-5 rounded-2xl bg-[#100e16] border border-[#c9a962]/15 text-center">
              <p className={`text-lg font-black mt-2 ${audit.passed ? 'text-emerald-300' : 'text-rose-300'}`}>
                {audit.passed ? copy.censorPass : copy.censorBlocked(audit.flags.length)}
              </p>
              <p className="text-xs text-slate-500 mt-2">{copy.kpiCensor}</p>
            </div>
          </div>

          {/* National Atlas */}
          <section className="p-7 rounded-3xl bg-[#0d0b14] border border-indigo-800/40 shadow-xl">
            <div className="flex items-center gap-3 mb-1">
              <Globe2 className="w-6 h-6 text-emerald-400" />
              <h3 className="text-xl font-bold text-slate-300">{copy.atlas}</h3>
            </div>
            <p className="text-xs text-slate-500 mb-6">{copy.atlasHint}</p>

            <div className="grid lg:grid-cols-3 gap-6">
              {[
                { title: copy.diagDist, data: diagDist, max: maxDiag },
                { title: copy.moodDist, data: moodDist, max: maxMood },
              ].map(({ title, data, max }) => (
                <div key={title} className="p-5 rounded-2xl bg-[#100e16] border border-[#c9a962]/15">
                  <h4 className="text-sm font-bold text-amber-200/90 mb-4">{title}</h4>
                  {data.length === 0 ? (
                    <p className="text-xs text-slate-600 py-6 text-center">{copy.noData}</p>
                  ) : (
                    <div className="space-y-3">
                      {data.map(([label, count], i) => (
                        <div key={label}>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-slate-300 truncate max-w-[70%]">{label}</span>
                            <span className="text-slate-500 font-mono">{count}</span>
                          </div>
                          <div className="w-full bg-slate-900 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all duration-700 ${BAR_COLORS[i % BAR_COLORS.length]}`}
                              style={{ width: `${(count / max) * 100}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              <div className="p-5 rounded-2xl bg-[#100e16] border border-[#c9a962]/15">
                <h4 className="text-sm font-bold text-amber-200/90 mb-4">{copy.harmonyDist}</h4>
                {harmonyScores.length === 0 ? (
                  <p className="text-xs text-slate-600 py-6 text-center">{copy.noData}</p>
                ) : (
                  <div className="flex items-end gap-4 h-36 px-2">
                    {harmonyBuckets.map((bucket) => (
                      <div key={bucket.label} className="flex-1 flex flex-col items-center gap-2">
                        <span className="text-xs font-mono text-slate-400">{bucket.count}</span>
                        <div
                          className={`w-full rounded-t-xl ${bucket.color} transition-all duration-700`}
                          style={{ height: `${Math.max(6, (bucket.count / maxBucket) * 100)}px` }}
                        />
                        <span className="text-[10px] text-slate-500 text-center leading-tight">{bucket.label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Sources + actions */}
          <div className="grid lg:grid-cols-2 gap-6">
            <section className="p-6 rounded-3xl bg-[#0d0b14] border border-[#c9a962]/15">
              <h3 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-400" /> {copy.sources}
              </h3>
              <div className="space-y-2">
                {RESEARCH_SOURCES.map((s) => (
                  <div key={s.key} className="flex items-center justify-between p-3 rounded-xl bg-[#100e16] border border-[#c9a962]/15/80 text-sm">
                    <span className="text-slate-300">{lang === 'ar' ? s.ar : s.en}</span>
                    <span className="text-xs font-mono text-[#d4af37]/80">
                      {(rowsBySource[s.key] ?? []).length} {copy.records}
                    </span>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-[11px] text-slate-500 leading-relaxed bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-3">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 inline me-1" /> {copy.anonNote}
              </p>
            </section>

            <section className="p-6 rounded-3xl bg-[#0d0b14] border border-amber-800/30 flex flex-col gap-4">
              <button
                type="button"
                onClick={handleExport}
                disabled={exporting || allRows.length === 0}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-l from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-white font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {exporting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                {exporting ? copy.exportingBtn : copy.exportBtn}
              </button>

              {exportKey && (
                <div className="p-4 rounded-xl bg-[#0d0d10]/90 border border-amber-600/40">
                  <p className="text-[11px] text-[#e8c872] mb-2 flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5" /> {copy.exportKeyLabel}
                  </p>
                  <code dir="ltr" className="block text-[10px] text-emerald-300 font-mono break-all select-all">
                    {exportKey}
                  </code>
                </div>
              )}

              {isSuperAdmin ? (
                <button
                  type="button"
                  onClick={() => setPublished(true)}
                  disabled={published}
                  className={`w-full py-3.5 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 ${published ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40' : 'bg-gradient-to-l from-indigo-700 to-indigo-600 hover:from-indigo-600 hover:to-indigo-500 text-white'}`}
                >
                  {published ? <CheckCircle2 className="w-5 h-5" /> : <Send className="w-5 h-5" />}
                  {published ? copy.publishedBtn : copy.publishBtn}
                </button>
              ) : (
                <div className="w-full py-3.5 rounded-2xl bg-slate-900 border border-white/[0.08] text-slate-500 text-sm font-bold flex items-center justify-center gap-2">
                  <Lock className="w-4 h-4" /> {copy.publishLocked}
                </div>
              )}
            </section>
          </div>
        </div>
      )}
    </div>
  );
}
