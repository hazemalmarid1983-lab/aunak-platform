import { describe, expect, it } from 'vitest';
import {
  PROTOCOL_ITEMS,
  aggregateProtocol,
  composeProtocolReport,
  emptyAnswers,
  isProtocolComplete,
  suggestGoalsFromProtocol,
  OBSERVATION_SCALE,
} from '../src/lib/assessmentProtocol.js';

function fillAll(scaleId = 'emerging') {
  const answers = emptyAnswers();
  for (const item of PROTOCOL_ITEMS) {
    answers[item.id] = {
      scale: scaleId,
      weaknesses: item.domain === 'behavior' ? ['attention'] : [],
      note: '',
    };
  }
  return answers;
}

describe('assessmentProtocol', () => {
  it('has comprehensive item coverage across 6 domains', () => {
    expect(PROTOCOL_ITEMS.length).toBe(36);
    const domains = new Set(PROTOCOL_ITEMS.map((i) => i.domain));
    expect(domains.size).toBe(6);
  });

  it('requires all items before complete', () => {
    const partial = emptyAnswers();
    partial['com-01'] = { scale: 'independent', weaknesses: [], note: '' };
    expect(isProtocolComplete(partial)).toBe(false);
    expect(isProtocolComplete(fillAll())).toBe(true);
  });

  it('aggregates domain percents and priorities', () => {
    const answers = fillAll('with_full_prompt');
    // Make communication strong, behavior weak
    for (const item of PROTOCOL_ITEMS.filter((i) => i.domain === 'communication')) {
      answers[item.id].scale = 'independent';
    }
    for (const item of PROTOCOL_ITEMS.filter((i) => i.domain === 'behavior')) {
      answers[item.id].scale = 'not_observed';
    }
    const agg = aggregateProtocol(answers);
    expect(agg.complete).toBe(true);
    expect(agg.overallPercent).toBeGreaterThan(0);
    expect(agg.priorities[0].domainId).toBe('behavior');
    expect(agg.supportNeedHint).toBeTruthy();
  });

  it('composes bilingual report with disclaimer', () => {
    const report = composeProtocolReport({
      lang: 'ar',
      studentName: 'Test Child',
      age: 7,
      assessorName: 'Teacher',
      answers: fillAll('emerging'),
      assessorNotes: 'ملاحظة تجريبية',
    });
    expect(report.bodyAr).toMatch(/تقرير التقييم الإجرائي/);
    expect(report.bodyAr).toMatch(/ليس تشخيصاً طبياً/);
    expect(report.bodyEn).toMatch(/not a medical diagnosis/i);
    expect(report.aggregation.complete).toBe(true);
  });

  it('suggests goals from weak domains', () => {
    const answers = fillAll('independent');
    for (const item of PROTOCOL_ITEMS.filter((i) => i.domain === 'communication')) {
      answers[item.id].scale = 'not_observed';
    }
    const agg = aggregateProtocol(answers);
    const goals = suggestGoalsFromProtocol({ age: 4, aggregation: agg, limit: 4 });
    expect(goals.length).toBeGreaterThan(0);
    expect(goals.length).toBeLessThanOrEqual(4);
  });

  it('observation scale is ordered 0–4', () => {
    expect(OBSERVATION_SCALE.not_observed.score).toBe(0);
    expect(OBSERVATION_SCALE.independent.score).toBe(4);
  });
});
