import { CHILD } from '../../lib/childTheme';
import { TAWASUL_CHILD } from '../../lib/tawasulChildTheme';

export default function ChildStarsPanel({ lang = 'ar', starCount = 0, sovereign = false }) {
  const theme = sovereign ? TAWASUL_CHILD : CHILD;
  const copy =
    lang === 'en'
      ? { title: 'My stars', empty: 'Play to collect stars!', count: 'Stars collected' }
      : { title: 'نجومي', empty: 'العب لجمع النجوم!', count: 'نجومك' };

  return (
    <div className={theme.card}>
      <h2 className={`${theme.title} text-center mb-6`}>{copy.title}</h2>
      <div className="text-center py-8">
        <p className={`text-6xl font-black mb-2 ${sovereign ? 'text-[#e8c872]' : 'text-amber-500'}`}>
          {starCount} ⭐
        </p>
        <p className={`text-sm font-bold ${sovereign ? 'text-emerald-400/80' : 'text-slate-500'}`}>
          {starCount > 0 ? copy.count : copy.empty}
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-2 mt-4">
        {Array.from({ length: Math.min(starCount, 20) }).map((_, i) => (
          <span key={i} className="text-2xl">
            ⭐
          </span>
        ))}
      </div>
    </div>
  );
}
