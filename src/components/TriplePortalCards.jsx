import { TRIPLE_PORTAL_META } from '../lib/tripleAccessProtocol';

export default function TriplePortalCards({ lang = 'ar', portalLinks, compact = false }) {
  if (!portalLinks) return null;

  const roles = ['parent', 'child', 'specialist'];

  return (
    <div className={`grid gap-2 ${compact ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-3'} mt-4`}>
      {roles.map((role) => {
        const meta = TRIPLE_PORTAL_META[role];
        const href = portalLinks[role];
        if (!href) return null;
        return (
          <a
            key={role}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="block p-3 rounded-xl bg-white/[0.06] border border-white/15 hover:border-[#c9a962]/40 transition-all text-center"
          >
            <span className="text-2xl block mb-1">{meta.emoji}</span>
            <span className="text-xs font-bold text-slate-200 block">
              {meta.label[lang] ?? meta.label.ar}
            </span>
            <span className="text-[9px] font-mono text-slate-500 break-all mt-1 block">
              {portalLinks.tokens?.[role]?.slice(0, 18)}…
            </span>
          </a>
        );
      })}
    </div>
  );
}
