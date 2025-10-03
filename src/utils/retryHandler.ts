/**
 * Sistema de retry inteligente com fallbacks
 * Implementa circuit breaker e backoff exponencial
 */

interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  jitter: boolean;
}

interface CircuitBreakerState {
  failures: number;
  lastFailureTime: number;
  state: 'closed' | 'open' | 'half-open';
  threshold: number;
  timeout: number;
}

class SmartRetryHandler {
  private circuitBreakers = new Map<string, CircuitBreakerState>();
  private defaultConfig: RetryConfig = {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 10000,
    backoffMultiplier: 2,
    jitter: true
  };

  /**
   * Executa operação com retry inteligente
   */
  async executeWithRetry<T>(
    operation: () => Promise<T>,
    operationId: string = 'default',
    config: Partial<RetryConfig> = {}
  ): Promise<T> {
    const finalConfig = { ...this.defaultConfig, ...config };

    // Verifica circuit breaker
    if (!this.canExecute(operationId)) {
      throw new Error(`Circuit breaker open for ${operationId}`);
    }

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= finalConfig.maxRetries; attempt++) {
      try {
        const result = await operation();

        // Sucesso - reset circuit breaker
        this.onSuccess(operationId);
        return result;

      } catch (error) {
        lastError = error as Error;

        // Registra falha no circuit breaker
        this.onFailure(operationId);

        // Se não é a última tentativa, aguarda antes de retry
        if (attempt < finalConfig.maxRetries) {
          const delay = this.calculateDelay(attempt, finalConfig);
          await this.delay(delay);
        }
      }
    }

    // Todas as tentativas falharam
    throw lastError || new Error('All retry attempts failed');
  }

  /**
   * Verifica se pode executar (circuit breaker)
   */
  private canExecute(operationId: string): boolean {
    const breaker = this.circuitBreakers.get(operationId);

    if (!breaker) {
      return true; // Primeira execução
    }

    const now = Date.now();

    switch (breaker.state) {
      case 'closed':
        return true;

      case 'open':
        // Verifica se timeout expirou
        if (now - breaker.lastFailureTime > breaker.timeout) {
          breaker.state = 'half-open';
          return true;
        }
        return false;

      case 'half-open':
        return true;

      default:
        return true;
    }
  }

  /**
   * Registra sucesso no circuit breaker
   */
  private onSuccess(operationId: string): void {
    const breaker = this.circuitBreakers.get(operationId);
    if (breaker) {
      breaker.failures = 0;
      breaker.state = 'closed';
    }
  }

  /**
   * Registra falha no circuit breaker
   */
  private onFailure(operationId: string): void {
    let breaker = this.circuitBreakers.get(operationId);

    if (!breaker) {
      breaker = {
        failures: 0,
        lastFailureTime: 0,
        state: 'closed',
        threshold: 5, // 5 falhas consecutivas
        timeout: 60000 // 1 minuto
      };
      this.circuitBreakers.set(operationId, breaker);
    }

    breaker.failures++;
    breaker.lastFailureTime = Date.now();

    // Abre circuit breaker se threshold atingido
    if (breaker.failures >= breaker.threshold) {
      breaker.state = 'open';
    }
  }

  /**
   * Calcula delay com backoff exponencial e jitter
   */
  private calculateDelay(attempt: number, config: RetryConfig): number {
    let delay = config.baseDelay * Math.pow(config.backoffMultiplier, attempt);

    // Limita delay máximo
    delay = Math.min(delay, config.maxDelay);

    // Adiciona jitter para evitar thundering herd
    if (config.jitter) {
      const jitterRange = delay * 0.1; // 10% de jitter
      delay += (Math.random() - 0.5) * 2 * jitterRange;
    }

    return Math.max(0, delay);
  }

  /**
   * Delay utility
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Fallback para operações críticas
   */
  async executeWithFallback<T>(
    primaryOperation: () => Promise<T>,
    fallbackOperation: () => Promise<T>,
    operationId: string = 'default'
  ): Promise<T> {
    try {
      return await this.executeWithRetry(primaryOperation, operationId);
    } catch (error) {
      console.warn(`Primary operation failed for ${operationId}, trying fallback:`, error);

      try {
        return await fallbackOperation();
      } catch (fallbackError) {
        console.error(`Both primary and fallback failed for ${operationId}:`, fallbackError);
        throw fallbackError;
      }
    }
  }

  /**
   * Timeout wrapper para operações
   */
  async executeWithTimeout<T>(
    operation: () => Promise<T>,
    timeoutMs: number,
    operationId: string = 'default'
  ): Promise<T> {
    return this.executeWithRetry(async () => {
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error(`Operation timeout after ${timeoutMs}ms`)), timeoutMs);
      });

      return Promise.race([operation(), timeoutPromise]);
    }, operationId);
  }

  /**
   * Estatísticas dos circuit breakers
   */
  getCircuitBreakerStats(): Record<string, CircuitBreakerState> {
    const stats: Record<string, CircuitBreakerState> = {};
    for (const [id, state] of this.circuitBreakers.entries()) {
      stats[id] = { ...state };
    }
    return stats;
  }

  /**
   * Reset circuit breaker específico
   */
  resetCircuitBreaker(operationId: string): void {
    this.circuitBreakers.delete(operationId);
  }

  /**
   * Reset todos os circuit breakers
   */
  resetAllCircuitBreakers(): void {
    this.circuitBreakers.clear();
  }
}

// Singleton global
export const retryHandler = new SmartRetryHandler();

/**
 * Hook para usar retry handler no frontend
 */
export function useRetryHandler() {
  const executeWithRetry = <T>(
    operation: () => Promise<T>,
    operationId?: string,
    config?: Partial<RetryConfig>
  ) => retryHandler.executeWithRetry(operation, operationId, config);

  const executeWithFallback = <T>(
    primaryOperation: () => Promise<T>,
    fallbackOperation: () => Promise<T>,
    operationId?: string
  ) => retryHandler.executeWithFallback(primaryOperation, fallbackOperation, operationId);

  const executeWithTimeout = <T>(
    operation: () => Promise<T>,
    timeoutMs: number,
    operationId?: string
  ) => retryHandler.executeWithTimeout(operation, timeoutMs, operationId);

  const getStats = () => retryHandler.getCircuitBreakerStats();
  const resetCircuitBreaker = (operationId: string) => retryHandler.resetCircuitBreaker(operationId);

  return { executeWithRetry, executeWithFallback, executeWithTimeout, getStats, resetCircuitBreaker };
}
