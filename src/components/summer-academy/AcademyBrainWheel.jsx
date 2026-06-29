import { motion } from 'framer-motion';
import { ACADEMY } from '../../lib/academyTheme';
import { TRACKS } from '../../lib/summerAcademyEngine';
import AcademyAnimatedIcon from './AcademyAnimatedIcon';

export default function AcademyBrainWheel({ lang, onSpin, result, brainMedia }) {
  const copy = {
    ar: { title: 'عجلة تنشيط الدماغ 🎡', sub: 'فيديوهات · مواقف · ألغاز', spin: 'دوّر العجلة!' },
    en: { title: 'Brain Wheel 🎡', sub: 'Videos · situations · riddles', spin: 'Spin!' },
  }[lang] ?? { title: 'عجلة 🎡', sub: '', spin: 'Spin!' };

  return (
    <motion.div
      className={`${ACADEMY.card} border-violet-200`}
      whileHover={{ boxShadow: '0 12px 40px rgba(139,92,246,0.2)' }}
    >
      <div className="flex items-center gap-3 mb-4">
        <AcademyAnimatedIcon trackId="brain" size="md" />
        <div>
          <h3 className="font-black text-violet-700">{copy.title}</h3>
          <p className="text-xs text-slate-500">{copy.sub}</p>
        </div>
      </div>
      <motion.button
        type="button"
        onClick={onSpin}
        className="w-full py-3 rounded-2xl bg-gradient-to-r from-violet-400 to-purple-500 text-white font-black shadow-lg"
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.95, rotate: 360 }}
        transition={{ type: 'spring' }}
      >
        {copy.spin}
      </motion.button>
      {result && (
        <motion.p
          className="mt-4 text-center font-black text-violet-700"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
        >
          {lang === 'ar' ? TRACKS[result].labelAr : TRACKS[result].labelEn}{' '}
          {TRACKS[result].icon}
        </motion.p>
      )}
      {brainMedia.length > 0 && (
        <div className="mt-4 space-y-1">
          {brainMedia.slice(0, 2).map((m) => (
            <p key={m.id} className="text-xs text-slate-600 truncate">
              🎬 {m.title}
            </p>
          ))}
        </div>
      )}
    </motion.div>
  );
}
