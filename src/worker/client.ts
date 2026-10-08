import { AnalysisResult } from '../core/index';

export class ReadabilityClient {
  private worker: Worker | null = null;
  private currentId = 0;
  private resolves = new Map<number, (res: AnalysisResult) => void>();
  private rejects = new Map<number, (err: any) => void>();

  constructor() {
    this.initWorker();
  }

  private initWorker() {
    try {
      this.worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });
      this.worker.onmessage = (e) => this.handleMessage(e);
      this.worker.onerror = (e) => console.error('Worker error', e);
    } catch (e) {
      console.warn('Worker initialization failed, fallback to main thread might be needed', e);
    }
  }

  private handleMessage(e: MessageEvent) {
    const { type, id, result, error } = e.data;
    
    if (type === 'ANALYZE_SUCCESS') {
      const resolve = this.resolves.get(id);
      if (resolve) {
        resolve(result);
        this.resolves.delete(id);
        this.rejects.delete(id);
      }
    } else if (type === 'ANALYZE_ERROR') {
      const reject = this.rejects.get(id);
      if (reject) {
        reject(error);
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
        import('../core/index').then(({ analyzeText }) => {
          try {
            resolve(analyzeText(text));
          } catch (e) {
            reject(e);
          }
        });
        return;
      }
      
      this.resolves.set(id, resolve);
      this.rejects.set(id, reject);
      this.worker.postMessage({ type: 'ANALYZE_REQUEST', id, text });
    });
  }
}
