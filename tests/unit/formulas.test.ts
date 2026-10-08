import { test, expect } from 'vitest';
import { computeFormulas } from '../../src/core/formulas';
import { interpretFleschReadingEase } from '../../src/core/interpretation';
import { TextStats } from '../../src/core/stats';

test('formulas - computations', () => {
  const stats: TextStats = {
    wordCount: 100,
    sentenceCount: 5,
    syllableCount: 150,
    characterCount: 500,
    complexWordCount: 10,
    avgWordsPerSentence: 20,
    avgSyllablesPerWord: 1.5,
    readingTimeMinutes: 1,
  };
  
  const formulas = computeFormulas(stats);
  expect(formulas.fleschReadingEase).toBeGreaterThan(0);
  expect(formulas.fleschKincaidGrade).toBeGreaterThan(0);
});

test('interpretation - correct bands', () => {
  const result = interpretFleschReadingEase(95);
  expect(result.label).toBe('Very Easy');
  
  const result2 = interpretFleschReadingEase(65);
  expect(result2.label).toBe('Standard');
});
