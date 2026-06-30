import { CHILD } from '../../lib/childTheme';

export default function ChildStarsPanel({ lang = 'ar', starCount = 0 }) {
  const copy =
    lang === 'en'
      ? { title: 'My stars', empty: 'Play to collect stars!', count: 'Stars collected' }
      : { title: 'نجومي', empty: 'العب لجمع النجوم!', count: 'نجومك' };

  return (
    <div className={CHILD.card}>
      <h2 className={`${CHILD.title} text-center mb-6`}>{copy.title}</h2>
      <div className="text-center py-8">
        <p className="text-6xl font-black text-amber-500 mb-2">{starCount} ⭐</p>
        <p className="text-sm font-bold text-slate-500">{starCount > 0 ? copy.count : copy.empty}</p>
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
