/**
 * クライアント側でのデータキャッシュ管理
 * メモリベースのキャッシュ（Map使用）
 * TTL（Time To Live）機能付き
 */

type CacheEntry<T> = {
  data: T
  timestamp: number
  ttl: number // Time To Live in milliseconds
}

class ClientCache {
  private cache = new Map<string, CacheEntry<any>>()

  /**
   * キャッシュからデータを取得
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    
    if (!entry) {
      return null
    }

    // TTLチェック
    const now = Date.now()
    if (now - entry.timestamp > entry.ttl) {
      // 期限切れ
      this.cache.delete(key)
      return null
    }

    return entry.data as T
  }

  /**
   * キャッシュにデータを保存
   */
  set<T>(key: string, data: T, ttl: number = 30000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    })
  }

  /**
   * キャッシュを削除
   */
  delete(key: string): void {
    this.cache.delete(key)
  }

  /**
   * 特定のパターンに一致するキャッシュを削除
   */
  deletePattern(pattern: string): void {
    const regex = new RegExp(pattern)
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key)
      }
    }
  }

  /**
   * すべてのキャッシュをクリア
   */
  clear(): void {
    this.cache.clear()
  }

  /**
   * 期限切れのキャッシュをクリーンアップ
   */
  cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key)
      }
    }
  }
}

// シングルトンインスタンス
export const clientCache = new ClientCache()

// 定期的にクリーンアップ（5分ごと）
if (typeof window !== 'undefined') {
  setInterval(() => {
    clientCache.cleanup()
  }, 5 * 60 * 1000)
}

/**
 * キャッシュキーを生成するヘルパー関数
 */
export function createCacheKey(prefix: string, ...args: (string | number | undefined)[]): string {
  const parts = args.filter(arg => arg !== undefined).map(String)
  return `${prefix}:${parts.join(':')}`
}

