import { useCallback } from 'react';
import FreeAssessmentFlow from '../assessment/FreeAssessmentFlow';
import { TAWASUL_CHILD } from '../../lib/tawasulChildTheme';
import {
  enqueueAcademySpeech,
  scriptAssessmentDone,
  unlockAcademyVoice,
} from '../../lib/academyVoice';
import { playSuccessChime } from '../../lib/sovereignAudio';

async function syncTawasulAssessment(recordId, computed, studentName) {
  const res = await fetch('/api/tawasul/assessment-sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      recordId,
      studentName,
      fields: {
        initial_assessment_score: computed.scorePercent,
        comprehensive_assessment_status: 'completed',
      },
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || 'ASSESSMENT_SYNC_FAILED');
  return data;
}

export default function ChildAssessmentPanel({
  lang = 'ar',
  studentName = '',
  recordId,
  onComplete,
  onGoalSynced,
}) {
  const copyOverrides =
    lang === 'en'
      ? {
          badge: 'Developmental Screening Matrix',
          brand: 'Aunak Interactive Platform',
          tagline: 'Twelve items — flows into your sovereign profile',
          ctaContinue: 'Seal my result',
          saving: 'Syncing to neural vault…',
        }
      : {
          badge: 'مقياس المسح النمائي الأولي',
          brand: 'منصة عونك التفاعلية',
          tagline: 'اثنا عشر بنداً — تنساب إلى ملفك السيادي',
          ctaContinue: 'ختم نتيجتي',
          saving: 'مزامنة مع الخزنة العصبية…',
        };

  const persistResult = useCallback(
    async (id, computed) => {
      if (!id) return;
      await syncTawasulAssessment(id, computed, studentName);
    },
    [studentName]
  );

  const handleComplete = (result) => {
    unlockAcademyVoice();
    playSuccessChime();
    enqueueAcademySpeech(scriptAssessmentDone(lang), { lang, preferCloud: true });
    onGoalSynced?.();
    onComplete?.(result);
  };

  return (
    <div className={TAWASUL_CHILD.card}>
      <FreeAssessmentFlow
        lang={lang}
        studentName={studentName}
        recordId={recordId}
        skipPromo
        copyOverrides={copyOverrides}
        persistResult={persistResult}
        onComplete={handleComplete}
      />
    </div>
  );
}
