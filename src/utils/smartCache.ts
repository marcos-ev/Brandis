/**
 * Cache inteligente com fallbacks
 * Usa localStorage + memória para cache distribuído
 */

interface CachedResult {
  data: any;
  timestamp: number;
  hits: number;
  userId: string;
  briefingHash: string;
}

interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  hitRate: number;
}

class SmartCache {
  private memoryCache = new Map<string, CachedResult>();
  private stats = { hits: 0, misses: 0 };
  private maxMemorySize = 100; // Máximo 100 entradas na memória
  private maxAge = 24 * 60 * 60 * 1000; // 24 horas

  /**
   * Gera hash do briefing para cache key
   */
  private generateHash(briefing: string): string {
    // Normaliza o briefing
    const normalized = briefing
      .toLowerCase()
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s]/g, '');

    // Hash simples (em produção use crypto)
    let hash = 0;
    for (let i = 0; i < normalized.length; i++) {
      const char = normalized.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Busca no cache
   */
  get(briefing: string, userId: string): CachedResult | null {
    const hash = this.generateHash(briefing);
    const key = `${userId}_${hash}`;

    // Tenta memória primeiro
    let result = this.memoryCache.get(key);

    if (!result) {
      // Tenta localStorage
      try {
        const stored = localStorage.getItem(`cache_${key}`);
        if (stored) {
          result = JSON.parse(stored);
          // Move para memória se ainda válido
          if (this.isValid(result)) {
            this.memoryCache.set(key, result);
          } else {
            localStorage.removeItem(`cache_${key}`);
            return null;
          }
        }
      } catch (error) {
        console.warn('Cache read error:', error);
      }
    }

    if (result && this.isValid(result)) {
      result.hits++;
      this.stats.hits++;
      return result;
    }

    this.stats.misses++;
    return null;
  }

  /**
   * Salva no cache
   */
  set(briefing: string, userId: string, data: any): void {
    const hash = this.generateHash(briefing);
    const key = `${userId}_${hash}`;

    const result: CachedResult = {
      data,
      timestamp: Date.now(),
      hits: 0,
      userId,
      briefingHash: hash
    };

    // Salva na memória
    this.memoryCache.set(key, result);

    // Salva no localStorage
    try {
      localStorage.setItem(`cache_${key}`, JSON.stringify(result));
    } catch (error) {
      console.warn('Cache write error:', error);
    }

    // Limpa cache se necessário
    this.cleanup();
  }

  /**
   * Verifica se resultado é válido
   */
  private isValid(result: CachedResult): boolean {
    return Date.now() - result.timestamp < this.maxAge;
  }

  /**
   * Limpeza automática do cache
   */
  private cleanup(): void {
    // Limpa memória se muito grande
    if (this.memoryCache.size > this.maxMemorySize) {
      const entries = Array.from(this.memoryCache.entries());
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp);

      // Remove os mais antigos
      const toRemove = entries.slice(0, this.maxMemorySize / 2);
      toRemove.forEach(([key]) => this.memoryCache.delete(key));
    }

    // Limpa localStorage expirado
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('cache_')) {
          try {
            const data = JSON.parse(localStorage.getItem(key) || '{}');
            if (!this.isValid(data)) {
              localStorage.removeItem(key);
            }
          } catch (error) {
            localStorage.removeItem(key);
          }
        }
      });
    } catch (error) {
      console.warn('Cache cleanup error:', error);
    }
  }

  /**
   * Busca resultados similares (fuzzy matching)
   */
  findSimilar(briefing: string, userId: string, threshold: number = 0.7): CachedResult[] {
    const normalizedBriefing = briefing.toLowerCase().trim();
    const similar: CachedResult[] = [];

    for (const [key, result] of this.memoryCache.entries()) {
      if (result.userId === userId) {
        const similarity = this.calculateSimilarity(normalizedBriefing, result.briefingHash);
        if (similarity >= threshold) {
          similar.push(result);
        }
      }
    }

    return similar.sort((a, b) => b.hits - a.hits); // Ordena por popularidade
  }

  /**
   * Calcula similaridade simples entre textos
   */
  private calculateSimilarity(text1: string, text2: string): number {
    const words1 = text1.split(' ');
    const words2 = text2.split(' ');

    const intersection = words1.filter(word => words2.includes(word));
    const union = [...new Set([...words1, ...words2])];

    return intersection.length / union.length;
  }

  /**
   * Estatísticas do cache
   */
  getStats(): CacheStats {
    const total = this.stats.hits + this.stats.misses;
    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      size: this.memoryCache.size,
      hitRate: total > 0 ? this.stats.hits / total : 0
    };
  }

  /**
   * Limpa cache específico do usuário
   */
  clearUserCache(userId: string): void {
    // Limpa memória
    for (const [key, result] of this.memoryCache.entries()) {
      if (result.userId === userId) {
        this.memoryCache.delete(key);
      }
    }

    // Limpa localStorage
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(`cache_${userId}_`)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn('User cache clear error:', error);
    }
  }

  /**
   * Limpa todo o cache
   */
  clear(): void {
    this.memoryCache.clear();
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('cache_')) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn('Cache clear error:', error);
    }
  }
}

// Singleton global
export const smartCache = new SmartCache();

/**
 * Hook para usar cache no frontend
 */
export function useSmartCache() {
  const get = (briefing: string, userId: string) => smartCache.get(briefing, userId);
  const set = (briefing: string, userId: string, data: any) => smartCache.set(briefing, userId, data);
  const findSimilar = (briefing: string, userId: string, threshold?: number) =>
    smartCache.findSimilar(briefing, userId, threshold);
  const getStats = () => smartCache.getStats();
  const clearUserCache = (userId: string) => smartCache.clearUserCache(userId);

  return { get, set, findSimilar, getStats, clearUserCache };
}
