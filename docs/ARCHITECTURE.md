# Architecture Map

## Module Dependency Map

The application is structured in three strictly decoupled layers, with one-directional dependencies:

1. **Analysis Core (`src/core/`)**
   - Pure, framework-independent TypeScript modules.
   - Responsible for text normalization, tokenization, syllable counting, readability formulas, and sentence scoring.
   - _Dependencies:_ None. No DOM access.

2. **Worker Wrapper (`src/worker/`)**
   - Wraps the Analysis Core in a Web Worker to run off the main thread.
   - Handles message parsing, request identification, and result formatting.
   - _Dependencies:_ Analysis Core.

3. **UI Layer (`src/ui/`)**
   - Plain TypeScript Web Components and raw DOM manipulation.
   - Handles text input, state management, UI rendering, and user interactions.
   - _Dependencies:_ Worker Wrapper (communicates via message passing).

## Data Contract: Worker & UI

Communication between the UI layer and the Web Worker happens via `postMessage`.

**Request (UI -> Worker):**

```typescript
{
  type: 'ANALYZE_REQUEST';
  id: number;
  text: string;
}
```

**Response (Worker -> UI):**

```typescript
{
  type: 'ANALYZE_SUCCESS';
  id: number;
  result: {
    headlineScore: { score: number; label: string; interpretation: string; };
    metrics: { wordCount: number; sentenceCount: number; avgSentenceLength: number; avgSyllablesPerWord: number; readingTimeMinutes: number; fleschKincaidGrade: number; gunningFog: number; smog: number; colemanLiau: number; ari: number; };
    hardestSentences: Array<{ rank: number; text: string; startOffset: number; endOffset: number; difficultyScore: number; reasons: Array<{ label: string; value: string | number; }>; }>;
    warnings: string[];
  };
}
```

**Error Response (Worker -> UI):**

```typescript
{
  type: 'ANALYZE_ERROR';
  id: number;
  error: {
    code: 'TOO_SHORT' | 'TOO_LONG' | 'INTERNAL_ERROR';
    message: string;
  }
}
```
