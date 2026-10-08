export function countSyllables(word: string): number {
  word = word.toLowerCase().replace(/[^a-z]/g, '');
  if (!word) return 0;
  if (word.length <= 3) return 1;

  // Basic exceptions
  const exceptions: Record<string, number> = {
    the: 1,
    there: 1,
    their: 1,
    where: 1,
    were: 1,
    every: 3,
    business: 2,
    chocolate: 3,
    family: 3,
    different: 3,
  };

  if (exceptions[word]) return exceptions[word];

  // Strip trailing e and es, but not le
  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
  word = word.replace(/^y/, '');

  const syllables = word.match(/[aeiouy]{1,2}/g);
  return syllables ? syllables.length : 1;
}

export function isComplexWord(word: string): boolean {
  return countSyllables(word) >= 3;
}
