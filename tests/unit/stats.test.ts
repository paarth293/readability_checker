import { test, expect } from 'vitest';
import { countSyllables } from '../../src/core/syllables';
import { computeStats } from '../../src/core/stats';

test('syllables - count accurately', () => {
  expect(countSyllables('the')).toBe(1);
  expect(countSyllables('banana')).toBe(3);
  expect(countSyllables('apple')).toBe(2);
  expect(countSyllables('computer')).toBe(3);
  expect(countSyllables('every')).toBe(3);
});

test('stats - computes overall stats correctly', () => {
  const sentences = [
    {
      text: 'A quick test.',
      startOffset: 0,
      endOffset: 13,
      words: [
        { text: 'A', startOffset: 0, endOffset: 1 },
        { text: 'quick', startOffset: 2, endOffset: 7 },
        { text: 'test', startOffset: 8, endOffset: 12 },
      ],
    },
  ];

  const stats = computeStats(sentences);
  expect(stats.wordCount).toBe(3);
  expect(stats.sentenceCount).toBe(1);
  expect(stats.syllableCount).toBe(3);
});
