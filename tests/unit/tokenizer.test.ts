import { test, expect } from 'vitest';
import { segmentSentences, tokenizeWords } from '../../src/core/tokenizer';

test('tokenizer - basic sentence segmentation', () => {
  const text = 'This is a test. And another test! Is this a test?';
  const sentences = segmentSentences(text);
  
  expect(sentences.length).toBe(3);
  expect(sentences[0].text).toBe('This is a test.');
  expect(sentences[1].text).toBe('And another test!');
  expect(sentences[2].text).toBe('Is this a test?');
});

test('tokenizer - abbreviation handling', () => {
  const text = 'Mr. Smith went to Washington. Dr. Jones followed him.';
  const sentences = segmentSentences(text);
  
  expect(sentences.length).toBe(2);
  expect(sentences[0].text).toBe('Mr. Smith went to Washington.');
  expect(sentences[1].text).toBe('Dr. Jones followed him.');
});

test('tokenizer - word extraction', () => {
  const text = 'Self-evident truth, don\'t you think?';
  const words = tokenizeWords(text, 0);
  
  expect(words.map(w => w.text)).toEqual(['Self-evident', 'truth', 'don\'t', 'you', 'think']);
});

test('tokenizer - preserves exact slicing offsets', () => {
  const text = '  \nHello world.  \tNew sentence here!  ';
  const sentences = segmentSentences(text);
  
  sentences.forEach(s => {
    expect(text.substring(s.startOffset, s.endOffset)).toBe(s.text);
  });
});
