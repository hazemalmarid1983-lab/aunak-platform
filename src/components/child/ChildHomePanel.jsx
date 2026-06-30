import { motion } from 'framer-motion';
import { Target } from 'lucide-react';
import { CHILD } from '../../lib/childTheme';

export default function ChildHomePanel({ lang = 'ar', studentName, programmedGoal }) {
  const copy =
    lang === 'en'
      ? {
          hi: 'Hi',
          todayGoal: "Today's goal from your specialist",
          noGoal: 'Your specialist will set a goal soon — keep smiling!',
          mascot: 'You can do it!',
        }
      : {
          hi: 'مرحباً',
          todayGoal: 'هدفك اليوم من الأخصائي',
          noGoal: 'سيضع الأخصائي هدفاً قريباً — ابتسم!',
          mascot: 'أنت تستطيع!',
        };

  const firstName = studentName?.split?.(' ')?.[0] ?? studentName ?? '';

  return (
    <div className={CHILD.card}>
      <div className={CHILD.mascotWrap}>
        <div className={CHILD.mascotFace}>🌟</div>
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className={CHILD.speech}
        >
          {firstName ? `${copy.hi} ${firstName}! ${copy.mascot}` : copy.mascot}
        </motion.p>
      </div>

      <div className="mt-6 rounded-3xl border-4 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-5">
        <div className="flex items-center gap-2 mb-3 text-amber-700">
          <Target className="w-5 h-5" />
          <h2 className="font-black text-lg">{copy.todayGoal}</h2>
        </div>
        <p className="text-base font-bold text-slate-700 leading-relaxed whitespace-pre-wrap">
          {programmedGoal?.trim() ? programmedGoal.trim() : copy.noGoal}
        </p>
      </div>
    </div>
  );
}
