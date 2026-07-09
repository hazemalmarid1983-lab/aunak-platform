import { useState } from 'react';
import { HeartHandshake } from 'lucide-react';

export const AUNAK_LOGO_SRC = '/aunak-logo.png';

export const HEADER_LOGO_CLASS = 'w-[120px] sm:w-[150px] aspect-video max-w-full shrink-0 h-auto';

export const GATE_LOGO_CLASS = 'w-[180px] sm:w-[240px] aspect-video max-w-[min(240px,92vw)] shrink-0 h-auto';

export default function PlatformLogo({
  lang = 'ar',
  className = 'w-20 sm:w-24 aspect-video h-auto',
  imgClassName = 'w-full h-full object-contain',
  iconClassName = 'w-8 h-8 text-amber-500',
}) {
  const [error, setError] = useState(false);
  const alt = lang === 'ar' ? 'شعار عونك' : 'Aunak logo';

  return (
    <div
      className={`relative shrink-0 flex items-center justify-center overflow-visible shadow-[0_0_20px_rgba(245,158,11,0.15)] ${className}`}
    >
      {!error ? (
        <img
          src={AUNAK_LOGO_SRC}
          alt={alt}
          className={imgClassName}
          onError={() => setError(true)}
        />
      ) : (
        <HeartHandshake className={iconClassName} aria-hidden />
      )}
    </div>
  );
}
