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
          title: 'Neural skills river',
          subtitle: 'Six questions — flows into your sovereign profile',
          progress: 'Question',
          of: 'of',
          back: 'Back',
          next: 'Next',
          seeResult: 'Seal my result',
          saving: 'Syncing to neural vault…',
        }
      : {
          title: 'نهر المهارات العصبي',
          subtitle: 'ستة أسئلة — تنساب إلى ملفك السيادي',
          progress: 'سؤال',
          of: 'من',
          back: 'رجوع',
          next: 'التالي',
          seeResult: 'ختم نتيجتي',
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
