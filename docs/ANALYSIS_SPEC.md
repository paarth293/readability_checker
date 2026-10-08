# Analysis Specification

This document strictly defines the mathematical and logical rules for text analysis, readability scoring, and identifying the hardest sentences.

## 1. Tokenization and Definitions

### Word
A word is defined as any continuous sequence of alphabetic characters (A-Z, a-z), including:
- Internal apostrophes for contractions or possessives (e.g., "don't", "author's").
- Internal hyphens for compound words (e.g., "fast-paced").
- Numbers (e.g., "1984", "3.14") count as one word.
- Abbreviations (e.g., "U.S.A.") count as one word.
- Em-dashes (—) and en-dashes (–) split words unless they are internal hyphens.

### Sentence
A sequence of words terminating in a period (`.`), exclamation mark (`!`), or question mark (`?`).
- **Ellipses (`...`)**: Do not terminate a sentence unless immediately followed by a capitalized word indicating a new sentence.
- **Abbreviations**: Known abbreviations (e.g., "Mr.", "Dr.", "e.g.", "i.e.", "Inc."), initials ("J. R. R."), and decimals ("3.14") do not terminate a sentence.
- **Quoted Dialogue**: Punctuation inside quotes (e.g., `"Hello!" he said.`) does not prematurely terminate the outer sentence if it continues as a dialogue tag. A sentence may end with a closing quote or bracket (`She said, "Go away."`).

### Dialogue Handling
Dialogue is fully included in the analysis. Sentence splitting logic respects quotation boundaries so that dialogue tags (e.g., "he said") remain attached to the spoken sentence if connected by grammar, or are split properly depending on punctuation.

## 2. Syllable Counting Rules
Syllables are calculated using a rule-based approach:
1. Count vowel groups (a, e, i, o, u, y).
2. Subtract silent 'e' at the end of words (except when it's the only vowel, like "the").
3. Subtract consecutive vowels (diphthongs/triphthongs count as 1, e.g., "ea" in "read").
4. Add exceptions: "le" at the end of words following a consonant counts as 1 (e.g., "apple").
5. Add 1 for words ending in 'es' or 'ed' if they form a separate syllable (e.g., "started"), but not if silent (e.g., "passed").
6. **Exceptions Table**: A small, curated exceptions list will handle irregular words where the rule-based approach fails.

## 3. Readability Formulas
*(W = Total Words, S = Total Sentences, Y = Total Syllables, C = Total Characters, CW = Complex Words (3+ syllables, excluding proper nouns, familiar jargon, and compound words))*

1. **Flesch Reading Ease**: `206.835 - (1.015 * (W / S)) - (84.6 * (Y / W))`
2. **Flesch-Kincaid Grade Level**: `(0.39 * (W / S)) + (11.8 * (Y / W)) - 15.59`
3. **Gunning Fog Index**: `0.4 * ((W / S) + 100 * (CW / W))`
4. **SMOG Index**: `1.0430 * sqrt(CW * (30 / S)) + 3.1291` *(Requires >= 30 sentences. Return "Not enough text" if S < 30)*
5. **Coleman-Liau Index**: `0.0588 * L - 0.296 * S100 - 15.8` *(L = average letters per 100 words, S100 = average sentences per 100 words)*
6. **Automated Readability Index (ARI)**: `4.71 * (C / W) + 0.5 * (W / S) - 21.43`

## 4. Headline Score and Interpretation
The **Flesch Reading Ease** is the headline score, chosen for its intuitive 0-100 scale ("higher is easier") and broad recognition.

### Interpretation Bands:
- **90-100**: Very Easy (Average 5th grader)
- **80-89**: Easy (Average 6th grader)
- **70-79**: Fairly Easy (Average 7th grader)
- **60-69**: Standard (Average 8th-9th grader, typical for popular fiction)
- **50-59**: Fairly Difficult (High school level)
- **30-49**: Difficult (College level)
- **0-29**: Very Difficult (College graduate, highly academic)

## 5. Sentence Difficulty Scoring (The Top Five)
A transparent, deterministic weighted sum used to rank the "hardest" sentences relative to the text.

**Formula**:
`Score = (0.4 * Normalized_Length) + (0.3 * Normalized_Syllables_Per_Word) + (0.2 * Proportion_of_Complex_Words) + (0.1 * Normalized_Punctuation_Density)`
*(Normalization scales features from 0 to 1 based on the maximum observed in the current text)*

- **Tie-breaking**: If scores are equal, the sentence appearing first in the text (lower character offset) ranks higher.
- **Minimum Threshold**: To qualify as "hard", a sentence must contain at least 5 words and have a normalized score greater than 0.2.

## 6. Reason Labels
For each identified hard sentence, assign specific reason labels based on these triggers:
- **"Very long sentence"**: Triggered if word count > 1.5x the text's average sentence length AND > 25 words.
- **"Many complex words"**: Triggered if proportion of complex words > 20%.
- **"Heavy punctuation / many clauses"**: Triggered if count of clause-signaling punctuation (commas, semicolons, colons, dashes) > 4.
- **"Dense vocabulary"**: Triggered if average syllables per word > 1.8.

## 7. Edge-case Behavior
- **Empty / Whitespace only**: Return empty state, prompt for text.
- **Text under minimum length**: If < 5 sentences, show warning "Text is too short for reliable analysis" but calculate what is possible. Disable SMOG.
- **Fewer than 5 qualifying sentences**: Return only the sentences that pass the minimum threshold (e.g., 2 sentences, or 0 sentences). Do not pad with non-qualifying sentences.
- **No terminal punctuation**: Treat the entire text as 1 single sentence.
- **All-caps text**: Lowercase internally for syllable counting rules.
- **Only dialogue**: Processed normally.
- **Non-English / Mixed text**: Analyzed blindly as English. (UI will warn that results are designed for English).
- **Extremely long input**: Maximum supported size is 100,000 words. If exceeded, truncate at 100,000 words and show a clear warning that text was truncated.
