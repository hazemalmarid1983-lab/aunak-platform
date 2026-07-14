import { useMemo, useState } from 'react';
import { CheckCircle2, ChevronDown, ChevronUp, Library, Search, Sparkles, X } from 'lucide-react';
import {
  AGE_BANDS,
  GOAL_DOMAINS,
  SEVERITY,
  countGoalsForGroup,
  getCoreGoalsForGroup,
  getExtendedBankGoals,
  groupGoalsByDomain,
  suggestGoalsForStudent,
} from '../lib/goalBank';
import { LUX } from '../lib/luxTheme';

const MAX_GOALS = 6;

/**
 * Smooth IEP goal picker: group (age × support) → core goals → extended bank → custom.
 */
export default function GoalBankPicker({
  lang = 'ar',
  age,
  severity,
  onSeverityChange,
  selectedIds = [],
  onToggle,
  onApplySuggestions,
}) {
  const ar = lang !== 'en';
  const [domain, setDomain] = useState('all');
  const [search, setSearch] = useState('');
  const [showBank, setShowBank] = useState(false);
  const [bandOverride, setBandOverride] = useState(null);

  const band =
    (bandOverride && AGE_BANDS[bandOverride]) ||
    Object.values(AGE_BANDS).find((b) => Number(age) >= b.min && Number(age) <= b.max) ||
    null;

  const ageBandId = band?.id;
  const counts = countGoalsForGroup({ ageBandId, severity });

  const filterOpts = { ageBandId, severity, domain, search };

  const coreGoals = useMemo(() => getCoreGoalsForGroup(filterOpts), [ageBandId, severity, domain, search]);
  const bankGoals = useMemo(() => getExtendedBankGoals(filterOpts), [ageBandId, severity, domain, search]);
  const coreGrouped = useMemo(() => groupGoalsByDomain(coreGoals), [coreGoals]);
  const bankGrouped = useMemo(() => groupGoalsByDomain(bankGoals), [bankGoals]);
  const suggestions = useMemo(
    () => suggestGoalsForStudent({ ageBandId, severity, limit: MAX_GOALS }),
    [ageBandId, severity]
  );

  const copy = ar
    ? {
        group: 'مجموعة المستفيد',
        stage: 'المرحلة',
        need: 'مستوى الاحتياج',
        autoAge: 'من عمر المستفيد',
        changeStage: 'تعديل المرحلة يدوياً',
        domains: 'مجال الهدف',
        all: 'الكل',
        search: 'ابحث في صياغة الهدف…',
        coreTitle: 'الأهداف الأساسية لهذه المجموعة',
        coreHint: 'اختر منها أولاً — مناسبة للمرحلة ومستوى الاحتياج',
        bankTitle: 'بنك الأهداف الإضافي',
        bankHint: 'إن لم تناسب الأهداف الأساسية — افتح البنك لنفس المجموعة',
        openBank: 'فتح بنك الأهداف',
        closeBank: 'إخفاء البنك',
        suggest: 'تعبئة مقترحة سريعة (مجال لكل هدف)',
        applySuggest: 'تطبيق المقترحات',
        selected: 'المختارة للخطة',
        empty: 'لا أهداف ضمن هذا التصفية',
        countCore: 'أساسية',
        countBank: 'بنك',
        source: 'المصدر',
      }
    : {
        group: 'Beneficiary group',
        stage: 'Stage',
        need: 'Support-need level',
        autoAge: 'From beneficiary age',
        changeStage: 'Override stage manually',
        domains: 'Goal domain',
        all: 'All',
        search: 'Search goal wording…',
        coreTitle: 'Core goals for this group',
        coreHint: 'Select these first — matched to stage and support need',
        bankTitle: 'Extended goal bank',
        bankHint: 'If core goals do not fit — open the bank for the same group',
        openBank: 'Open goal bank',
        closeBank: 'Hide bank',
        suggest: 'Quick suggested fill (one domain each)',
        applySuggest: 'Apply suggestions',
        selected: 'Selected for IEP',
        empty: 'No goals for this filter',
        countCore: 'Core',
        countBank: 'Bank',
        source: 'Source',
      };

  const renderGoalCard = (goal) => {
    const on = selectedIds.includes(goal.id);
    const full = !on && selectedIds.length >= MAX_GOALS;
    return (
      <button
        key={goal.id}
        type="button"
        disabled={full}
        onClick={() => onToggle?.(goal.id)}
        className={`w-full text-start rounded-2xl border px-3.5 py-3 transition-all duration-200 ${
          on
            ? 'border-emerald-400/45 bg-emerald-500/15 shadow-[0_0_24px_rgba(16,185,129,0.12)] scale-[1.01]'
            : 'border-white/10 bg-white/[0.03] hover:border-[#c9a962]/35 hover:bg-[#c9a962]/08'
        } ${full ? 'opacity-40 cursor-not-allowed' : ''}`}
      >
        <div className="flex items-start gap-3">
          <span
            className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border text-[10px] ${
              on ? 'border-emerald-400 bg-emerald-500/30 text-emerald-100' : 'border-white/20 text-transparent'
            }`}
          >
            {on ? '✓' : '·'}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm text-slate-100 leading-relaxed">{ar ? goal.ar : goal.en}</p>
            <p className="mt-1 text-[10px] font-mono text-slate-500">
              {GOAL_DOMAINS[goal.domain]?.[ar ? 'ar' : 'en']} · {copy.source}: {goal.source}
            </p>
          </div>
        </div>
      </button>
    );
  };

  const renderGrouped = (grouped) => {
    if (!grouped.length) {
      return <p className="text-xs text-slate-500 py-4 text-center">{copy.empty}</p>;
    }
    return (
      <div className="space-y-4">
        {grouped.map(({ domainId, meta, goals }) => (
          <div key={domainId}>
            <p className="mb-2 text-[11px] font-bold tracking-wide text-[#c9a962]/90">
              {ar ? meta.ar : meta.en}
              <span className="ms-2 font-mono text-slate-600">{goals.length}</span>
            </p>
            <div className="grid gap-2 sm:grid-cols-1">{goals.map(renderGoalCard)}</div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-5" dir={ar ? 'rtl' : 'ltr'}>
      {/* Group selectors */}
      <div className={`${LUX.card} p-4 space-y-4 border border-[#c9a962]/20`}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-bold text-[#e8c872]">{copy.group}</p>
          <p className="text-[10px] font-mono text-slate-500">
            {copy.countCore} {counts.core} · {copy.countBank} {counts.bank}
          </p>
        </div>

        <div>
          <p className="text-[11px] text-slate-400 mb-2">{copy.stage}</p>
          <div className="flex flex-wrap gap-2">
            {Object.values(AGE_BANDS).map((b) => {
              const active = ageBandId === b.id;
              return (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setBandOverride(b.id)}
                  className={`rounded-xl px-3 py-2 text-xs font-bold border transition-colors ${
                    active
                      ? 'bg-[#c9a962]/20 border-[#c9a962]/50 text-[#e8c872]'
                      : 'border-white/10 text-slate-400 hover:border-white/25'
                  }`}
                >
                  {ar ? b.ar : b.en}
                </button>
              );
            })}
          </div>
          <p className="mt-1.5 text-[10px] text-slate-600">
            {copy.autoAge}: {age ?? '—'} · {copy.changeStage}
          </p>
        </div>

        <div>
          <p className="text-[11px] text-slate-400 mb-2">{copy.need}</p>
          <div className="flex flex-wrap gap-2">
            {Object.values(SEVERITY).map((s) => {
              const active = severity === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => onSeverityChange?.(s.id)}
                  className={`rounded-xl px-3 py-2 text-xs font-bold border transition-colors ${
                    active
                      ? 'bg-emerald-500/20 border-emerald-400/45 text-emerald-200'
                      : 'border-white/10 text-slate-400 hover:border-white/25'
                  }`}
                >
                  {ar ? s.ar : s.en}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick suggestions */}
      <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <p className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> {copy.suggest}
          </p>
          <button
            type="button"
            onClick={() => onApplySuggestions?.(suggestions.map((g) => g.id))}
            className="text-[11px] font-bold px-3 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 hover:bg-emerald-500/30"
          >
            {copy.applySuggest}
          </button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {suggestions.map((g) => (
            <span
              key={g.id}
              className="text-[10px] px-2 py-1 rounded-lg bg-black/20 text-slate-300 border border-white/5 max-w-[14rem] truncate"
              title={ar ? g.ar : g.en}
            >
              {ar ? g.ar : g.en}
            </span>
          ))}
        </div>
      </div>

      {/* Domain + search */}
      <div className="space-y-3">
        <p className="text-[11px] text-slate-400">{copy.domains}</p>
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => setDomain('all')}
            className={`rounded-full px-3 py-1 text-[11px] font-bold border ${
              domain === 'all'
                ? 'border-[#c9a962]/50 bg-[#c9a962]/15 text-[#e8c872]'
                : 'border-white/10 text-slate-400'
            }`}
          >
            {copy.all}
          </button>
          {Object.entries(GOAL_DOMAINS).map(([id, meta]) => (
            <button
              key={id}
              type="button"
              onClick={() => setDomain(id)}
              className={`rounded-full px-3 py-1 text-[11px] font-bold border ${
                domain === id
                  ? 'border-[#c9a962]/50 bg-[#c9a962]/15 text-[#e8c872]'
                  : 'border-white/10 text-slate-400'
              }`}
            >
              {ar ? meta.ar : meta.en}
            </button>
          ))}
        </div>
        <label className="relative block">
          <Search className="absolute top-2.5 start-3 w-4 h-4 text-slate-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={copy.search}
            className="w-full rounded-xl bg-[#0d0d10] border border-white/10 ps-9 pe-3 py-2 text-sm text-slate-200 placeholder:text-slate-600"
          />
        </label>
      </div>

      {/* Selected tray */}
      {selectedIds.length > 0 && (
        <div className="sticky top-2 z-10 rounded-2xl border border-emerald-400/30 bg-[#0d0d10]/95 backdrop-blur-md p-3 shadow-lg">
          <p className="text-[11px] font-bold text-emerald-300 mb-2 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {copy.selected}: {selectedIds.length}/{MAX_GOALS}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {selectedIds.map((id) => {
              const goal = [...coreGoals, ...bankGoals, ...suggestions].find((x) => x.id === id);
              const label = goal ? (ar ? goal.ar : goal.en) : id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => onToggle?.(id)}
                  className="inline-flex items-center gap-1 max-w-full text-[10px] px-2 py-1 rounded-lg bg-emerald-500/15 border border-emerald-400/30 text-emerald-100"
                >
                  <span className="truncate">{label}</span>
                  <X className="w-3 h-3 shrink-0 opacity-70" />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Core goals */}
      <section className="space-y-3">
        <div>
          <h3 className="text-sm font-bold text-slate-100">{copy.coreTitle}</h3>
          <p className="text-[11px] text-slate-500 mt-0.5">{copy.coreHint}</p>
        </div>
        <div className="max-h-[28rem] overflow-y-auto rounded-2xl border border-white/10 bg-white/[0.02] p-3">
          {renderGrouped(coreGrouped)}
        </div>
      </section>

      {/* Extended bank */}
      <section className="space-y-3">
        <button
          type="button"
          onClick={() => setShowBank((v) => !v)}
          className="w-full flex items-center justify-between gap-2 rounded-2xl border border-[#c9a962]/25 bg-[#c9a962]/08 px-4 py-3 text-sm font-bold text-[#e8c872] hover:bg-[#c9a962]/14 transition-colors"
        >
          <span className="inline-flex items-center gap-2">
            <Library className="w-4 h-4" />
            {showBank ? copy.closeBank : copy.openBank}
            <span className="font-mono text-[10px] text-slate-500">({counts.bank})</span>
          </span>
          {showBank ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        {showBank && (
          <div className="space-y-2 animate-in fade-in">
            <p className="text-[11px] text-slate-500">{copy.bankHint}</p>
            <div className="max-h-[22rem] overflow-y-auto rounded-2xl border border-[#c9a962]/15 bg-black/20 p-3">
              {renderGrouped(bankGrouped)}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
