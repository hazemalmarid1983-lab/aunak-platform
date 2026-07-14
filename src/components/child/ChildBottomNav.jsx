import { Home, Gamepad2, Moon, Star, ClipboardList } from 'lucide-react';

const BASE_TABS = [
  { id: 'home', icon: Home, ar: 'الرئيسية', en: 'Home' },
  { id: 'play', icon: Gamepad2, ar: 'تدخل حسي', en: 'Sensory' },
  { id: 'assessment', icon: ClipboardList, ar: 'مسح نمائي', en: 'Screening', sovereignOnly: true },
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
