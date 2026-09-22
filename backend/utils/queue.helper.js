// utils/queue.helper.js
// Manages concurrent AI deck generation (max 2 at a time)

class GenerationQueue {
  constructor(maxConcurrent = 2) {
    this.maxConcurrent = parseInt(process.env.MAX_CONCURRENT_GENERATIONS) || maxConcurrent;
    this.active = new Map();   // deckId -> job
    this.waiting = [];
    this.positions = new Map(); // deckId -> queue position
  }

  enqueue(deckId, jobFn, progressCallback) {
    return new Promise((resolve, reject) => {
      const job = { deckId, jobFn, progressCallback, resolve, reject };

      if (this.active.size < this.maxConcurrent) {
        this._run(job);
      } else {
        this.waiting.push(job);
        const pos = this.waiting.length;
        this.positions.set(deckId, pos);
        progressCallback?.({ status: 'queued', position: pos, message: `In queue (position ${pos})` });
      }
    });
  }

  async _run(job) {
    this.active.set(job.deckId, job);
    this.positions.delete(job.deckId);

    job.progressCallback?.({ status: 'generating', position: 0, message: 'Starting generation...' });

    try {
      const result = await job.jobFn(job.progressCallback);
      job.resolve(result);
    } catch (err) {
      job.reject(err);
    } finally {
      this.active.delete(job.deckId);
      this._processNext();
    }
  }

  _processNext() {
    if (this.waiting.length === 0) return;
    if (this.active.size >= this.maxConcurrent) return;

    const next = this.waiting.shift();

    // Update positions for remaining queued items
    this.waiting.forEach((job, i) => {
      this.positions.set(job.deckId, i + 1);
      job.progressCallback?.({ status: 'queued', position: i + 1, message: `In queue (position ${i + 1})` });
    });

    this._run(next);
  }

  getStatus() {
    return {
      active: this.active.size,
      waiting: this.waiting.length,
      maxConcurrent: this.maxConcurrent,
    };
  }

  cancel(deckId) {
    const idx = this.waiting.findIndex(j => j.deckId === deckId);
    if (idx !== -1) {
      const [job] = this.waiting.splice(idx, 1);
      this.positions.delete(deckId);
      job.reject(new Error('Cancelled'));
      return true;
    }
    return false;
  }
}

const queue = new GenerationQueue();
module.exports = queue;
