import { TextStats } from './stats';

export interface FormulasResult {
  fleschReadingEase: number;
  fleschKincaidGrade: number;
  gunningFog: number;
  smog: number;
  colemanLiau: number;
  ari: number;
}

export function computeFormulas(stats: TextStats): FormulasResult {
  // Prevent zero division
  const words = stats.wordCount || 1;
  const sentences = stats.sentenceCount || 1;
  const syllables = stats.syllableCount || 1;
  const characters = stats.characterCount || 1;
  const complexWords = stats.complexWordCount || 0;

  const wordsPerSentence = words / sentences;
  const syllablesPerWord = syllables / words;

  // Flesch Reading Ease: 206.835 - 1.015 * (total words / total sentences) - 84.6 * (total syllables / total words)
  const fleschReadingEase = 206.835 - 1.015 * wordsPerSentence - 84.6 * syllablesPerWord;

  // Flesch-Kincaid Grade Level: 0.39 * (total words / total sentences) + 11.8 * (total syllables / total words) - 15.59
  const fleschKincaidGrade = 0.39 * wordsPerSentence + 11.8 * syllablesPerWord - 15.59;

  // Gunning Fog: 0.4 * [ (words/sentences) + 100 * (complexWords/words) ]
  const gunningFog = 0.4 * (wordsPerSentence + 100 * (complexWords / words));

  // SMOG Index: 1.0430 * sqrt(complexWords * (30 / sentences)) + 3.1291
  // Valid only if sentences >= 30, but we compute it anyway for simplicity, or return 0 if < 30.
  const smog = sentences >= 30 ? 1.043 * Math.sqrt(complexWords * (30 / sentences)) + 3.1291 : 0;

  // Coleman-Liau: 0.0588 * L - 0.296 * S - 15.8
  // L = average number of letters per 100 words
  // S = average number of sentences per 100 words
  const l = (characters / words) * 100;
  const s = (sentences / words) * 100;
  const colemanLiau = 0.0588 * l - 0.296 * s - 15.8;

  // Automated Readability Index (ARI): 4.71 * (characters/words) + 0.5 * (words/sentences) - 21.43
  const ari = 4.71 * (characters / words) + 0.5 * wordsPerSentence - 21.43;

  return {
    fleschReadingEase: Math.max(0, Math.round(fleschReadingEase * 10) / 10),
    fleschKincaidGrade: Math.max(0, Math.round(fleschKincaidGrade * 10) / 10),
    gunningFog: Math.max(0, Math.round(gunningFog * 10) / 10),
    smog: Math.max(0, Math.round(smog * 10) / 10),
    colemanLiau: Math.max(0, Math.round(colemanLiau * 10) / 10),
    ari: Math.max(0, Math.round(ari * 10) / 10),
  };
}
