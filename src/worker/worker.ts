import { analyzeText } from '../core/index';

self.onmessage = (e: MessageEvent) => {
  const { type, id, text } = e.data;
  
  if (type === 'ANALYZE_REQUEST') {
    try {
      const result = analyzeText(text);
      self.postMessage({
        type: 'ANALYZE_SUCCESS',
        id,
        result
      });
    } catch (error: any) {
      self.postMessage({
        type: 'ANALYZE_ERROR',
        id,
        error: { code: 'INTERNAL_ERROR', message: error.message || 'Unknown error' }
      });
    }
  }
};
