/**
 * Calming Sensory Pulse — fires on the specialist's calm_pulse command.
 * The whole screen becomes a slow fluid blue/violet gradient with breathing
 * aurora blobs and a soft breathing orb, pulling the child into stillness.
 */
export default function ChildCalmOverlay({ show, lang = 'ar' }) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[65] overflow-hidden" aria-hidden>
      <div className="tawasul-calm-fluid absolute inset-0" />

      {/* aurora blobs */}
      <div className="tawasul-aurora absolute -top-1/4 -left-1/4 w-[70vw] h-[70vw] rounded-full bg-[radial-gradient(circle,rgba(129,140,248,0.5),transparent_60%)] blur-3xl" />
      <div className="tawasul-aurora-delay absolute -bottom-1/4 -right-1/4 w-[75vw] h-[75vw] rounded-full bg-[radial-gradient(circle,rgba(167,139,250,0.45),transparent_60%)] blur-3xl" />
      <div className="tawasul-aurora absolute top-1/3 right-1/4 w-[45vw] h-[45vw] rounded-full bg-[radial-gradient(circle,rgba(56,189,248,0.35),transparent_60%)] blur-3xl" />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen gap-8 px-6">
        <div className="tawasul-breathe w-44 h-44 rounded-full bg-gradient-to-br from-indigo-300/80 to-violet-400/70 border border-white/30" />
        <p className="text-2xl font-black text-indigo-50/90 tracking-widest text-center drop-shadow">
          {lang === 'en' ? 'breathe…' : '…تنفّس'}
        </p>
      </div>
    </div>
  );
}
