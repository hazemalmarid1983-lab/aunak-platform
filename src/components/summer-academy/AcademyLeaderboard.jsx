import { motion } from 'framer-motion';
import { ACADEMY } from '../../lib/academyTheme';

export default function AcademyLeaderboard({ lang, rows }) {
  const copy = {
    ar: { title: 'لوحة الصدارة 🏆', sub: 'ترتيب الجهد — لا نقص!', empty: 'كن أول مغامر!' },
    en: { title: 'Leaderboard 🏆', sub: 'Effort rank — no deficit!', empty: 'Be first!' },
  }[lang];

  return (
    <div className={ACADEMY.card}>
      <h3 className={`${ACADEMY.title} text-xl mb-1`}>{copy.title}</h3>
      <p className={`${ACADEMY.subtitle} mb-4`}>{copy.sub}</p>
      {rows.length === 0 ? (
        <p className="text-slate-500">{copy.empty}</p>
      ) : (
        <ul className="space-y-2">
          {rows.slice(0, 6).map((row, i) => (
            <motion.li
              key={row.studentId ?? row.displayName}
              className="flex items-center gap-3 p-3 rounded-2xl bg-white/80 border border-orange-100"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: i * 0.05 }}
            >
              <span className="text-xl font-black text-orange-500 w-8">{row.rank}</span>
              <div className="flex-1 min-w-0">
                <p className="font-bold truncate text-slate-800">{row.displayName}</p>
                <p className="text-[10px] font-semibold text-slate-500">
                  {row.tasksCompleted} {lang === 'ar' ? 'مهمة' : 'tasks'} · {row.totalXp} XP · {row.badge}
                </p>
              </div>
            </motion.li>
          ))}
        </ul>
      )}
    </div>
  );
}
