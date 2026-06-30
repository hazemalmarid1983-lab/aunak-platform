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
