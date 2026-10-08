import { AnalysisResult } from '../core/index';

interface WorkerResponse {
  type: 'ANALYZE_SUCCESS' | 'ANALYZE_ERROR';
  id: number;
  result?: AnalysisResult;
  error?: { code: string; message: string };
}

export class ReadabilityClient {
  private worker: Worker | null = null;
  private currentId = 0;
  private resolves = new Map<number, (res: AnalysisResult) => void>();
  private rejects = new Map<number, (err: Error) => void>();

  constructor() {
    this.initWorker();
  }

  private initWorker() {
    try {
      this.worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });
      this.worker.onmessage = (e: MessageEvent<WorkerResponse>) => this.handleMessage(e);
      this.worker.onerror = (e) => console.error('Worker error', e);
    } catch (e: unknown) {
      console.warn('Worker initialization failed, fallback to main thread might be needed', e);
    }
  }

  private handleMessage(e: MessageEvent<WorkerResponse>) {
    const { type, id, result, error } = e.data;

    if (type === 'ANALYZE_SUCCESS' && result) {
      const resolve = this.resolves.get(id);
      if (resolve) {
        resolve(result);
        this.resolves.delete(id);
        this.rejects.delete(id);
      }
    } else if (type === 'ANALYZE_ERROR' && error) {
      const reject = this.rejects.get(id);
      if (reject) {
        reject(new Error(error.message));
        this.resolves.delete(id);
        this.rejects.delete(id);
      }
    }
  }

  public analyze(text: string): Promise<AnalysisResult> {
    const id = ++this.currentId;

    // Cancel previous inflight requests by rejecting them (debounce/supersede)
    for (const [pendingId, reject] of this.rejects.entries()) {
      if (pendingId < id) {
        reject(new Error('Superseded'));
        this.resolves.delete(pendingId);
        this.rejects.delete(pendingId);
      }
    }

    return new Promise((resolve, reject) => {
      if (!this.worker) {
        // Fallback to main thread
        import('../core/index')
          .then(({ analyzeText }) => {
            try {
              resolve(analyzeText(text));
            } catch (e: unknown) {
              reject(e instanceof Error ? e : new Error('Unknown fallback error'));
            }
          })
          .catch((err: unknown) => {
            reject(err instanceof Error ? err : new Error('Failed to import fallback'));
          });
        return;
      }

      this.resolves.set(id, resolve);
      this.rejects.set(id, reject);
      this.worker.postMessage({ type: 'ANALYZE_REQUEST', id, text });
    });
  }
}
