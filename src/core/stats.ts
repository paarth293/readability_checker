import { Sentence } from './tokenizer';
import { countSyllables, isComplexWord } from './syllables';

export interface TextStats {
  wordCount: number;
  sentenceCount: number;
  syllableCount: number;
  characterCount: number;
  complexWordCount: number;
  avgWordsPerSentence: number;
  avgSyllablesPerWord: number;
  readingTimeMinutes: number;
}

export function computeStats(sentences: Sentence[]): TextStats {
  let wordCount = 0;
  let syllableCount = 0;
  let characterCount = 0;
  let complexWordCount = 0;

  for (const sentence of sentences) {
    for (const word of sentence.words) {
      wordCount++;
      characterCount += word.text.length;

      const syllables = countSyllables(word.text);
      syllableCount += syllables;

      if (syllables >= 3 && isComplexWord(word.text)) {
        complexWordCount++;
      }
    }
  }

  const sentenceCount = sentences.length || 1;
  const safeWordCount = wordCount || 1;

  return {
    wordCount,
    sentenceCount: sentences.length,
    syllableCount,
    characterCount,
    complexWordCount,
    avgWordsPerSentence: wordCount / sentenceCount,
    avgSyllablesPerWord: syllableCount / safeWordCount,
    readingTimeMinutes: Math.ceil(wordCount / 250), // 250 wpm average
  };
}
