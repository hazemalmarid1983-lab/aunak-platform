import { useEffect, useState } from 'react';
import { CHILD } from '../../lib/childTheme';

const BREATH_MS = 4000;

export default function ChildCalmZone({ lang = 'ar' }) {
  const [phase, setPhase] = useState('in');

  useEffect(() => {
    const t = setInterval(() => setPhase((p) => (p === 'in' ? 'out' : 'in')), BREATH_MS);
    return () => clearInterval(t);
  }, []);

  const copy =
    lang === 'en'
      ? { title: 'Calm breath', hint: phase === 'in' ? 'Breathe in…' : 'Breathe out…' }
      : { title: 'تنفس هادئ', hint: phase === 'in' ? 'شهيق…' : 'زفير…' };

  return (
    <div className={CHILD.card}>
      <h2 className={`${CHILD.title} text-center mb-6`}>{copy.title}</h2>
      <div className="flex flex-col items-center gap-6 py-8">
        <div
          className={`w-32 h-32 rounded-full bg-gradient-to-br from-sky-300 to-indigo-400 border-4 border-white shadow-xl transition-transform duration-[4000ms] ease-in-out ${
            phase === 'in' ? 'scale-125' : 'scale-90'
          }`}
        />
        <p className="text-xl font-black text-indigo-600">{copy.hint}</p>
      </div>
    </div>
  );
}
