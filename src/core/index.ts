import { normalizeText, segmentSentences } from './tokenizer';
import { computeStats, TextStats } from './stats';
import { computeFormulas, FormulasResult } from './formulas';
import { interpretFleschReadingEase, HeadlineScore } from './interpretation';
import { scoreSentences, HardSentence } from './scorer';

export interface AnalysisResult {
  headlineScore: HeadlineScore;
  metrics: TextStats & FormulasResult;
  hardestSentences: HardSentence[];
  warnings: string[];
}

export function analyzeText(text: string): AnalysisResult {
  const warnings: string[] = [];

  if (!text || text.trim().length === 0) {
    warnings.push('Text is empty.');
    return createEmptyResult(warnings);
  }

  const normalized = normalizeText(text);
  const sentences = segmentSentences(normalized);

  if (sentences.length === 0) {
    warnings.push('No valid sentences found.');
    return createEmptyResult(warnings);
  }

  const stats = computeStats(sentences);
  const formulas = computeFormulas(stats);
  const headlineScore = interpretFleschReadingEase(formulas.fleschReadingEase);
  const hardestSentences = scoreSentences(sentences);

  if (sentences.length < 5) {
    warnings.push('Text is very short. Scores may be less reliable.');
  }

  return {
    headlineScore,
    metrics: {
      ...stats,
      ...formulas,
    },
    hardestSentences,
    warnings,
  };
}

function createEmptyResult(warnings: string[]): AnalysisResult {
  return {
    headlineScore: { score: 0, label: 'N/A', interpretation: 'No text provided.' },
    metrics: {
      wordCount: 0,
      sentenceCount: 0,
      syllableCount: 0,
      characterCount: 0,
      complexWordCount: 0,
      avgWordsPerSentence: 0,
      avgSyllablesPerWord: 0,
      readingTimeMinutes: 0,
      fleschReadingEase: 0,
      fleschKincaidGrade: 0,
      gunningFog: 0,
      smog: 0,
      colemanLiau: 0,
      ari: 0,
    },
    hardestSentences: [],
    warnings,
  };
}
