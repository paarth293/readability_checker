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
  expect(interpretFleschReadingEase(95).label).toBe('Very Easy');
  expect(interpretFleschReadingEase(85).label).toBe('Easy');
  expect(interpretFleschReadingEase(75).label).toBe('Fairly Easy');
  expect(interpretFleschReadingEase(65).label).toBe('Standard');
  expect(interpretFleschReadingEase(55).label).toBe('Fairly Difficult');
  expect(interpretFleschReadingEase(35).label).toBe('Difficult');
  expect(interpretFleschReadingEase(15).label).toBe('Very Difficult');
});
