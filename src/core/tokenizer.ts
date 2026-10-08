export interface Token {
  text: string;
  startOffset: number;
  endOffset: number;
}

export interface Sentence extends Token {
  words: Token[];
}

const abbreviationRegex = /^(mr|mrs|ms|dr|prof|sr|jr|vs|etc|eg|ie|vol|inc|ltd|co)\.$/i;
const initialRegex = /^[A-Z]\.$/i;

export function normalizeText(text: string): string {
  // We preserve exact text and offsets for tokenization.
  // This just returns the text as is for now since tokenizer works on raw offsets.
  return text;
}

export function tokenizeWords(text: string, startOffset: number): Token[] {
  const words: Token[] = [];
  const regex = /[a-zA-Z0-9]+(?:[-'][a-zA-Z0-9]+)*/g;
  let match;

  while ((match = regex.exec(text)) !== null) {
    words.push({
      text: match[0],
      startOffset: startOffset + match.index,
      endOffset: startOffset + match.index + match[0].length,
    });
  }

  return words;
}

export function segmentSentences(text: string): Sentence[] {
  const sentences: Sentence[] = [];
  
  // Basic regex for sentence splitting, handling quotes and basic abbreviations
  // This is a naive regex for the scaffold. In a real app, we need a robust state machine.
  // We match until a sentence terminator (. ? !) followed by a space or quote, or end of string.
  
  const regex = /[^.!?]+(?:[.!?]+(?:["')\]>]*\s+|$))?/g;
  let match;

  // We need to handle abbreviations. If a sentence ends with "Dr. ", it's not a sentence end.
  // For time constraints in this mock, we will do a basic split.
  
  let currentSentenceText = '';
  let currentStart = 0;

  while ((match = regex.exec(text)) !== null) {
    let segment = match[0];
    
    // Check if the segment actually ends with an abbreviation
    const wordsInSegment = segment.trim().split(/\s+/);
    const lastWord = wordsInSegment[wordsInSegment.length - 1];
    
    if (abbreviationRegex.test(lastWord) || initialRegex.test(lastWord)) {
      // It's an abbreviation, keep accumulating
      currentSentenceText += segment;
    } else {
      // End of sentence
      currentSentenceText += segment;
      const trimStart = currentSentenceText.length - currentSentenceText.trimStart().length;
      const cleanText = currentSentenceText.trim();
      
      if (cleanText.length > 0) {
        const sentenceStart = currentStart + trimStart;
        const sentenceEnd = sentenceStart + cleanText.length;
        
        sentences.push({
          text: cleanText,
          startOffset: sentenceStart,
          endOffset: sentenceEnd,
          words: tokenizeWords(cleanText, sentenceStart),
        });
      }
      
      currentStart += currentSentenceText.length;
      currentSentenceText = '';
    }
  }

  // Remainder
  if (currentSentenceText.trim().length > 0) {
    const cleanText = currentSentenceText.trim();
    const trimStart = currentSentenceText.length - currentSentenceText.trimStart().length;
    const sentenceStart = currentStart + trimStart;
    
    sentences.push({
      text: cleanText,
      startOffset: sentenceStart,
      endOffset: sentenceStart + cleanText.length,
      words: tokenizeWords(cleanText, sentenceStart),
    });
  }

  return sentences;
}
