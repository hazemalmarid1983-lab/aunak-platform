import { useState } from 'react';
import { HeartHandshake } from 'lucide-react';

export const AUNAK_LOGO_SRC = '/aunak-logo.png';

export default function PlatformLogo({
  lang = 'ar',
  className = 'w-14 h-[4.5rem]',
  imgClassName = 'w-full h-full object-contain',
}) {
  const [error, setError] = useState(false);
  const alt = lang === 'ar' ? 'شعار عونك' : 'Aunak logo';

  return (
    <div
      className={`relative shrink-0 rounded-xl flex items-center justify-center bg-slate-900 border border-amber-500/30 overflow-hidden shadow-[0_0_15px_rgba(245,158,11,0.2)] ${className}`}
    >
      {!error ? (
        <img
          src={AUNAK_LOGO_SRC}
          alt={alt}
          className={imgClassName}
          onError={() => setError(true)}
        />
      ) : (
        <HeartHandshake className="w-8 h-8 text-amber-500" aria-hidden />
      )}
    </div>
  );
}
