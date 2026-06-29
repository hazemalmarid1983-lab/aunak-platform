import { motion } from 'framer-motion';
import { ACADEMY, TRACK_ACADEMY_COLORS } from '../../lib/academyTheme';
import { TRACKS } from '../../lib/summerAcademyEngine';
import AcademyAnimatedIcon from './AcademyAnimatedIcon';

function TrackCard({ trackId, lang, done, onComplete, loading, onChallenge }) {
  const track = TRACKS[trackId];
  const colors = TRACK_ACADEMY_COLORS[trackId] ?? TRACK_ACADEMY_COLORS.arabic;

  return (
    <motion.div
      className={`rounded-2xl p-5 bg-gradient-to-br ${colors} border-2 bg-white/80 backdrop-blur-sm shadow-lg`}
      whileHover={{ scale: 1.03, y: -4 }}
      layout
    >
      <div className="flex items-center gap-3 mb-4">
        <AcademyAnimatedIcon trackId={trackId} active={!done} />
        <h4 className="font-black text-lg text-slate-800">
          {lang === 'ar' ? track.labelAr : track.labelEn}
        </h4>
      </div>
      {done ? (
        <p className="text-sm font-black text-emerald-600">⭐ {lang === 'ar' ? 'أنجزت!' : 'Done!'}</p>
      ) : (
        <motion.button
          type="button"
          disabled={loading}
          onClick={() => {
            onChallenge?.();
            onComplete(trackId);
          }}
          className={`${ACADEMY.btnPrimary} w-full text-sm py-3`}
          whileTap={{ scale: 0.95 }}
        >
          {lang === 'ar' ? '🎮 ابدأ!' : '🎮 Go!'}
        </motion.button>
      )}
    </motion.div>
  );
}

export default function AcademyTrackHub({ lang, trackIds, todayTasks, onComplete, loading, onChallenge }) {
  const copy = lang === 'ar' ? 'مسارات اليوم' : "Today's Tracks";

  return (
    <div className={`${ACADEMY.card} md:col-span-2`}>
      <h2 className={`${ACADEMY.title} text-xl mb-4`}>{copy}</h2>
      <div className="grid sm:grid-cols-2 gap-4">
        {trackIds.map((id) => (
          <TrackCard
            key={id}
            trackId={id}
            lang={lang}
            done={todayTasks.includes(id)}
            onComplete={onComplete}
            loading={loading}
            onChallenge={onChallenge}
          />
        ))}
      </div>
    </div>
  );
}
