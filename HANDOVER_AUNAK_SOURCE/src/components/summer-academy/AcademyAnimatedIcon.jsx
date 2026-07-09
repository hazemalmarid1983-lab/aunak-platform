import { motion } from 'framer-motion';
import { TRACK_EMOJI } from '../../lib/academyTheme';

export default function AcademyAnimatedIcon({ trackId, size = 'lg', active = false }) {
  const emoji = TRACK_EMOJI[trackId] ?? '⭐';
  const sizeClass = size === 'lg' ? 'text-5xl' : size === 'md' ? 'text-3xl' : 'text-2xl';

  return (
    <motion.div
      className={`${sizeClass} select-none inline-flex items-center justify-center`}
      style={{ perspective: 400 }}
      whileHover={{ scale: 1.15, rotateY: 15, rotateX: -8 }}
      whileTap={{ scale: 0.92, rotateY: -10 }}
      animate={
        active
          ? { y: [0, -8, 0], rotateZ: [0, 5, -5, 0] }
          : { y: [0, -4, 0] }
      }
      transition={{
        repeat: Infinity,
        duration: active ? 0.8 : 2.5,
        ease: 'easeInOut',
      }}
    >
      <span className="drop-shadow-md" role="img" aria-hidden>
        {emoji}
      </span>
    </motion.div>
  );
}
