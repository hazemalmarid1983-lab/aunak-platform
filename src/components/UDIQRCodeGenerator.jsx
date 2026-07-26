import { useEffect, useMemo, useRef, useState } from 'react';
import { Download, ExternalLink, Loader2, QrCode } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { LUX } from '../lib/luxTheme';
import { MOCK_DATA_MODE, mockB2gChildCode } from '../lib/airtable';

function UDIQRCodeContent({ recordId, lang, compact }) {
  const canvasRef = useRef(null);
  const [b2gCode, setB2gCode] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    if (MOCK_DATA_MODE) {
      setB2gCode(mockB2gChildCode(recordId));
      setError('');
      return undefined;
    }

    fetch('/api/udi/code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recordId }),
    })
      .then(async (response) => {
        const body = await response.json().catch(() => ({}));
        if (!response.ok || !body.b2gCode) throw new Error(body.error || 'UDI_CODE_FAILED');
        if (!cancelled) setB2gCode(body.b2gCode);
      })
      .catch(() => {
        if (!cancelled) {
          setError(lang === 'en' ? 'Could not generate the UDI passport.' : 'تعذر توليد الجواز النمائي.');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [recordId, lang]);

  const passportUrl = useMemo(() => {
    if (!b2gCode) return '';
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://aunak.vercel.app';
    return `${origin}/udi/${b2gCode}`;
  }, [b2gCode]);

  const downloadPassport = () => {
    const canvas = canvasRef.current?.querySelector('canvas');
    if (!canvas || !b2gCode) return;
    const link = document.createElement('a');
    link.download = `aunak-udi-${b2gCode}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const copy =
    lang === 'en'
      ? {
          title: 'Unified Developmental Identity',
          download: 'Download developmental passport',
          open: 'Open passport',
        }
      : {
          title: 'سجل الهوية النمائية الموحد',
          download: 'تحميل الجواز النمائي',
          open: 'فتح الجواز',
        };

  return (
    <section
      className={`${LUX.glassCard} ${compact ? 'p-4 md:p-4' : ''} flex flex-col items-center text-center gap-3`}
      aria-label={copy.title}
    >
      <div className="flex items-center gap-2">
        <QrCode className="w-5 h-5 text-[#e8c872]" />
        <h3 className={LUX.headingGold}>{copy.title}</h3>
      </div>

      {!b2gCode && !error ? (
        <Loader2 className="w-7 h-7 animate-spin text-emerald-400 my-6" aria-label="loading" />
      ) : error ? (
        <p className={LUX.errorRose}>{error}</p>
      ) : (
        <>
          <div ref={canvasRef} className="rounded-2xl bg-white p-3">
            <QRCodeCanvas
              value={passportUrl}
              size={compact ? 144 : 184}
              level="H"
              marginSize={1}
              title={`${copy.title} ${b2gCode}`}
            />
          </div>
          <p className="font-mono text-[#e8c872] tracking-wider" dir="ltr">{b2gCode}</p>
          <div className="flex flex-wrap justify-center gap-2">
            <button type="button" onClick={downloadPassport} className={LUX.btnGold}>
              <Download className="w-4 h-4 inline me-2" />
              {copy.download}
            </button>
            <a href={passportUrl} target="_blank" rel="noreferrer" className={LUX.btnGhost}>
              <ExternalLink className="w-4 h-4 inline me-2" />
              {copy.open}
            </a>
          </div>
        </>
      )}
    </section>
  );
}

export default function UDIQRCodeGenerator({ recordId, lang = 'ar', compact = false }) {
  if (!recordId) return null;
  return (
    <UDIQRCodeContent
      key={`${recordId}-${lang}`}
      recordId={recordId}
      lang={lang}
      compact={compact}
    />
  );
}
