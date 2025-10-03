/**
 * Sistema de fila inteligente para gerações
 * Processa uma geração por vez para evitar sobrecarga
 */

interface GenerationJob {
  id: string;
  userId: string;
  briefing: string;
  timestamp: number;
  priority: 'high' | 'normal' | 'low';
  retries: number;
  maxRetries: number;
}

interface QueueStats {
  pending: number;
  processing: number;
  completed: number;
  failed: number;
  averageWaitTime: number;
}

class SmartGenerationQueue {
  private queue: GenerationJob[] = [];
  private processing = false;
  private stats = {
    pending: 0,
    processing: 0,
    completed: 0,
    failed: 0,
    totalWaitTime: 0,
    completedJobs: 0
  };
  private processingJob: GenerationJob | null = null;

  /**
   * Adiciona job à fila
   */
  async addJob(
    userId: string,
    briefing: string,
    priority: 'high' | 'normal' | 'low' = 'normal'
  ): Promise<string> {
    const job: GenerationJob = {
      id: `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      briefing,
      timestamp: Date.now(),
      priority,
      retries: 0,
      maxRetries: 3
    };

    // Insere na posição correta baseado na prioridade
    this.insertJobByPriority(job);
    this.stats.pending++;

    // Inicia processamento se não estiver rodando
    if (!this.processing) {
      this.processQueue();
    }

    return job.id;
  }

  /**
   * Insere job na posição correta baseado na prioridade
   */
  private insertJobByPriority(job: GenerationJob): void {
    const priorityOrder = { high: 0, normal: 1, low: 2 };
    const jobPriority = priorityOrder[job.priority];

    let insertIndex = this.queue.length;
    for (let i = 0; i < this.queue.length; i++) {
      if (priorityOrder[this.queue[i].priority] > jobPriority) {
        insertIndex = i;
        break;
      }
    }

    this.queue.splice(insertIndex, 0, job);
  }

  /**
   * Processa a fila sequencialmente
   */
  private async processQueue(): Promise<void> {
    this.processing = true;

    while (this.queue.length > 0) {
      const job = this.queue.shift();
      if (!job) break;

      this.processingJob = job;
      this.stats.pending--;
      this.stats.processing++;

      try {
        await this.processJob(job);
        this.stats.completed++;
        this.stats.completedJobs++;
      } catch (error) {
        console.error(`Job ${job.id} failed:`, error);

        if (job.retries < job.maxRetries) {
          // Retry com backoff exponencial
          job.retries++;
          const delay = Math.pow(2, job.retries) * 1000; // 2s, 4s, 8s

          setTimeout(() => {
            this.insertJobByPriority(job);
            this.stats.pending++;
          }, delay);
        } else {
          this.stats.failed++;
        }
      }

      this.stats.processing--;
      this.processingJob = null;

      // Delay entre processamentos para evitar sobrecarga
      await this.delay(2000); // 2 segundos
    }

    this.processing = false;
  }

  /**
   * Processa um job individual
   */
  private async processJob(job: GenerationJob): Promise<void> {
    const startTime = Date.now();

    try {
      // Simula chamada para Supabase Edge Function
      const result = await this.callGenerationAPI(job);

      // Calcula tempo de espera
      const waitTime = Date.now() - job.timestamp;
      this.stats.totalWaitTime += waitTime;

      console.log(`Job ${job.id} completed in ${waitTime}ms`);

      // Aqui você pode emitir eventos ou notificar o frontend
      this.notifyJobComplete(job.id, result);

    } catch (error) {
      console.error(`Job ${job.id} processing error:`, error);
      throw error;
    }
  }

  /**
   * Chama a API de geração (substitua pela sua implementação)
   */
  private async callGenerationAPI(job: GenerationJob): Promise<any> {
    // Aqui você faria a chamada real para Supabase Edge Function
    // Por enquanto, simula com timeout
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (Math.random() > 0.1) { // 90% success rate
          resolve({ success: true, jobId: job.id });
        } else {
          reject(new Error('Simulated API error'));
        }
      }, 1000);
    });
  }

  /**
   * Notifica conclusão do job
   */
  private notifyJobComplete(jobId: string, result: any): void {
    // Aqui você pode implementar notificação via WebSocket, SSE, ou polling
    console.log(`Job ${jobId} completed:`, result);
  }

  /**
   * Delay utility
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Estatísticas da fila
   */
  getStats(): QueueStats {
    return {
      pending: this.stats.pending,
      processing: this.stats.processing,
      completed: this.stats.completed,
      failed: this.stats.failed,
      averageWaitTime: this.stats.completedJobs > 0
        ? this.stats.totalWaitTime / this.stats.completedJobs
        : 0
    };
  }

  /**
   * Status atual da fila
   */
  getStatus(): {
    isProcessing: boolean;
    currentJob: GenerationJob | null;
    queueLength: number;
  } {
    return {
      isProcessing: this.processing,
      currentJob: this.processingJob,
      queueLength: this.queue.length
    };
  }

  /**
   * Cancela job específico
   */
  cancelJob(jobId: string): boolean {
    const index = this.queue.findIndex(job => job.id === jobId);
    if (index !== -1) {
      this.queue.splice(index, 1);
      this.stats.pending--;
      return true;
    }
    return false;
  }

  /**
   * Limpa fila completa
   */
  clearQueue(): void {
    this.queue = [];
    this.stats.pending = 0;
  }
}

// Singleton global
export const generationQueue = new SmartGenerationQueue();

/**
 * Hook para usar a fila no frontend
 */
export function useGenerationQueue() {
  const addJob = (userId: string, briefing: string, priority: 'high' | 'normal' | 'low' = 'normal') => {
    return generationQueue.addJob(userId, briefing, priority);
  };

  const getStats = () => generationQueue.getStats();
  const getStatus = () => generationQueue.getStatus();
  const cancelJob = (jobId: string) => generationQueue.cancelJob(jobId);

  return { addJob, getStats, getStatus, cancelJob };
}
