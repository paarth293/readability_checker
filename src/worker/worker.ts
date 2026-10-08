import { analyzeText } from '../core/index';

interface WorkerRequest {
  type: string;
  id: number;
  text: string;
}

self.onmessage = (e: MessageEvent<WorkerRequest>) => {
  const { type, id, text } = e.data;

  if (type === 'ANALYZE_REQUEST') {
    try {
      const result = analyzeText(text);
      self.postMessage({
        type: 'ANALYZE_SUCCESS',
        id,
        result,
      });
    } catch (error: unknown) {
      self.postMessage({
        type: 'ANALYZE_ERROR',
        id,
        error: {
          code: 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      });
    }
  }
};
