import { describe, expect, it } from 'vitest';
import {
  CLINICAL_QUESTIONS,
  filterQuestions,
  getRelevantDomains,
  ASSESSMENT_PATHWAYS,
} from '../src/lib/clinicalQuestionBank.js';
import {
  createClinicalSession,
  saveClinicalAnswer,
  composeClinicalReport,
  sessionProgress,
  calculateDomainScores,
} from '../src/lib/clinicalQuestionnaireEngine.js';

describe('clinicalQuestionBank', () => {
  it('has 36 items across 8 domains', () => {
    expect(CLINICAL_QUESTIONS.length).toBe(36);
    const domains = new Set(CLINICAL_QUESTIONS.map((q) => q.domain));
    expect(domains.size).toBe(8);
  });

  it('filters by assessment pathway and age', () => {
    const asd = filterQuestions({ assessmentType: ASSESSMENT_PATHWAYS.asd, ageInMonths: 72 });
    const ld = filterQuestions({
      assessmentType: ASSESSMENT_PATHWAYS.learning_difficulties,
      ageInMonths: 72,
    });
    expect(asd.length).toBeGreaterThan(0);
    expect(ld.length).toBeGreaterThan(0);
    const asdDomains = new Set(asd.map((q) => q.domain));
    for (const d of asdDomains) {
      expect(getRelevantDomains(ASSESSMENT_PATHWAYS.asd)).toContain(d);
    }
  });

  it('comprehensive pathway includes both ASD and learning domains', () => {
    const both = filterQuestions({ assessmentType: ASSESSMENT_PATHWAYS.both, ageInMonths: 84 });
    const domains = new Set(both.map((q) => q.domain));
    expect(domains.has('communication')).toBe(true);
    expect(domains.has('academic')).toBe(true);
  });
});

describe('clinicalQuestionnaireEngine', () => {
  it('creates session with filtered question ids', () => {
    const session = createClinicalSession({
      studentId: 'recTest123',
      studentName: 'Test',
      age: 7,
      assessmentType: ASSESSMENT_PATHWAYS.both,
    });
    expect(session.questionIds.length).toBeGreaterThan(0);
    expect(session.status).toBe('in_progress');
  });

  it('saves answers and tracks progress', () => {
    let session = createClinicalSession({
      studentId: 'recTest123',
      assessmentType: ASSESSMENT_PATHWAYS.asd,
      age: 6,
    });
    for (const qid of session.questionIds) {
      const res = saveClinicalAnswer(session, { questionId: qid, value: '2' });
      expect(res.ok).toBe(true);
      session = res.session;
    }
    const prog = sessionProgress(session);
    expect(prog.complete).toBe(true);
    expect(prog.pct).toBeGreaterThanOrEqual(80);
  });

  it('composes report with disclaimer and SMART goals', () => {
    const session = createClinicalSession({
      studentId: 'recTest123',
      studentName: 'Salem',
      age: 8,
      assessmentType: ASSESSMENT_PATHWAYS.both,
    });
    let current = session;
    for (const qid of session.questionIds.slice(0, 10)) {
      current = saveClinicalAnswer(current, { questionId: qid, value: '3' }).session;
    }
    const questions = CLINICAL_QUESTIONS.filter((q) => current.questionIds.includes(q.id));
    const report = composeClinicalReport({ session: current, questions, lang: 'ar' });
    expect(report.bodyAr).toMatch(/ليس تشخيصاً طبياً/);
    expect(report.bodyEn).toMatch(/not a licensed medical diagnosis/i);
    expect(report.smartGoals.length).toBeGreaterThan(0);
    expect(calculateDomainScores(current, questions)).toBeTruthy();
  });
});
