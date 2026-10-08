import { Sentence } from './tokenizer';
import { countSyllables, isComplexWord } from './syllables';

export interface HardSentence {
  rank: number;
  text: string;
  startOffset: number;
  endOffset: number;
  difficultyScore: number;
  reasons: Array<{ label: string; value: string | number }>;
}

export function scoreSentences(sentences: Sentence[]): HardSentence[] {
  const scored = sentences.map((sentence) => {
    const wordCount = sentence.words.length;
    let complexWordCount = 0;
    let clauses = 0;

    for (const word of sentence.words) {
      const syllables = countSyllables(word.text);
      if (syllables >= 3 && isComplexWord(word.text)) {
        complexWordCount++;
      }
    }

    // Rough approximation for clauses based on punctuation (commas, semicolons, etc.)
    const punctuationMatch = sentence.text.match(/[,;:()\-—]/g);
    if (punctuationMatch) {
      clauses = punctuationMatch.length;
    }

    // Difficulty score based on words, complex words, clauses
    const difficultyScore = wordCount * 0.5 + complexWordCount * 2 + clauses * 1.5;

    const reasons = [];
    if (wordCount > 25) {
      reasons.push({ label: 'Very long sentence', value: `${wordCount} words` });
    }
    if (complexWordCount > 3) {
      reasons.push({ label: 'Many complex words', value: `${complexWordCount} complex words` });
    }
    if (clauses > 4) {
      reasons.push({ label: 'Heavy punctuation / many clauses', value: `${clauses} markers` });
    }

    // Fallback reason if it's generally hard but didn't hit specific thresholds
    if (reasons.length === 0 && difficultyScore > 20) {
      reasons.push({ label: 'High structural complexity', value: difficultyScore.toFixed(1) });
    }

    return {
      rank: 0,
      text: sentence.text,
      startOffset: sentence.startOffset,
      endOffset: sentence.endOffset,
      difficultyScore,
      reasons,
    };
  });

  // Filter out sentences that aren't actually hard (threshold)
  const threshold = 15;
  const hardSentences = scored.filter((s) => s.difficultyScore >= threshold);

  // Sort by difficulty descending, tie break by startOffset
  hardSentences.sort((a, b) => {
    if (b.difficultyScore !== a.difficultyScore) {
      return b.difficultyScore - a.difficultyScore;
    }
    return a.startOffset - b.startOffset; // earlier in text goes first
  });

  // Take top 5
  const top5 = hardSentences.slice(0, 5);

  // Assign ranks
  top5.forEach((s, i) => {
    s.rank = i + 1;
  });

  return top5;
}
