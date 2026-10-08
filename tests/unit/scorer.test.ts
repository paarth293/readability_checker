import { test, expect } from 'vitest';
import { scoreSentences } from '../../src/core/scorer';
import { segmentSentences } from '../../src/core/tokenizer';

test('scorer - top 5 hard sentences', () => {
  const text = `
  This is a short one.
  This is another incredibly easy sentence.
  However, this sentence is remarkably convoluted, extraordinarily protracted, and undeniably challenging for an average reader to fully comprehend without significant effort.
  Here is a simple one.
  This sentence also features considerable complexity, multiple clauses, and extensive vocabulary.
  `;
  
  const sentences = segmentSentences(text);
  const hardSentences = scoreSentences(sentences);
  
  expect(hardSentences.length).toBeGreaterThan(0);
  expect(hardSentences.length).toBeLessThanOrEqual(5);
  
  // The longest sentence should be rank 1
  expect(hardSentences[0].text).toContain('However, this sentence is remarkably convoluted');
  expect(hardSentences[0].rank).toBe(1);
});
