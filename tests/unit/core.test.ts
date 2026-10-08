import { test, expect } from 'vitest';
import { analyzeText } from '../../src/core/index';

test('core - analyzes text and produces correct shape', () => {
  const text = 'This is a simple test. It should be very easy to read.';
  const result = analyzeText(text);
  
  expect(result.warnings.length).toBeGreaterThan(0); // Should warn about being short
  expect(result.metrics.wordCount).toBe(12);
  expect(result.headlineScore.score).toBeGreaterThan(80);
});

test('core - empty input', () => {
  const result = analyzeText('   ');
  expect(result.warnings).toContain('Text is empty.');
});
