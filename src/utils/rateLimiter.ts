/**
 * Rate Limiter inteligente usando apenas memória
 * Zero custo, alta performance
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
  lastRequest: number;
}

class SmartRateLimiter {
  private limits = new Map<string, RateLimitEntry>();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Limpeza automática a cada 5 minutos
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  /**
   * Verifica se usuário pode fazer request
   * @param userId ID do usuário
   * @param maxRequests Máximo de requests por janela
   * @param windowMs Janela de tempo em ms
   * @returns {canProceed: boolean, remainingTime?: number}
   */
  canProceed(
    userId: string,
    maxRequests: number = 1,
    windowMs: number = 60000 // 1 minuto
  ): { canProceed: boolean; remainingTime?: number; retryAfter?: number } {
    const now = Date.now();
    const entry = this.limits.get(userId);

    if (!entry || now > entry.resetTime) {
      // Primeira request ou janela expirada
      this.limits.set(userId, {
        count: 1,
        resetTime: now + windowMs,
        lastRequest: now
      });
      return { canProceed: true };
    }

    if (entry.count >= maxRequests) {
      // Rate limit atingido
      const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
      return {
        canProceed: false,
        retryAfter,
        remainingTime: entry.resetTime - now
      };
    }

    // Incrementa contador
    entry.count++;
    entry.lastRequest = now;
    this.limits.set(userId, entry);

    return { canProceed: true };
  }

  /**
   * Limpeza automática de entradas expiradas
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [userId, entry] of this.limits.entries()) {
      if (now > entry.resetTime) {
        this.limits.delete(userId);
      }
    }
  }

  /**
   * Reset manual para usuário (útil para testes)
   */
  resetUser(userId: string): void {
    this.limits.delete(userId);
  }

  /**
   * Estatísticas do rate limiter
   */
  getStats(): { activeUsers: number; totalRequests: number } {
    let totalRequests = 0;
    for (const entry of this.limits.values()) {
      totalRequests += entry.count;
    }
    return {
      activeUsers: this.limits.size,
      totalRequests
    };
  }

  /**
   * Cleanup manual
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.limits.clear();
  }
}

// Singleton global
export const rateLimiter = new SmartRateLimiter();

/**
 * Hook para usar rate limiting no frontend
 */
export function useRateLimit(userId: string | null) {
  const checkLimit = (maxRequests: number = 1, windowMs: number = 60000) => {
    if (!userId) return { canProceed: false, retryAfter: 0 };
    return rateLimiter.canProceed(userId, maxRequests, windowMs);
  };

  return { checkLimit };
}
