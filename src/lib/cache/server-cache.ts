import { unstable_cache } from 'next/cache'

/**
 * Server Actions用のキャッシュヘルパー
 * Next.jsのunstable_cacheを使用
 */

/**
 * キャッシュ付きでデータ取得関数をラップ
 * 
 * @param fn データ取得関数
 * @param keyPrefix キャッシュキーのプレフィックス
 * @param ttl キャッシュ時間（秒）
 * @param tags キャッシュタグ（無効化用）
 */
export function withCache<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  keyPrefix: string,
  ttl: number = 30,
  tags?: string[]
): T {
  return ((...args: Parameters<T>) => {
    const cacheKey = `${keyPrefix}:${JSON.stringify(args)}`
    
    return unstable_cache(
      async () => {
        return await fn(...args)
      },
      [cacheKey],
      {
        revalidate: ttl,
        tags: tags || [],
      }
    )()
  }) as T
}

/**
 * キャッシュを無効化するためのタグ
 */
export const CACHE_TAGS = {
  FRIENDS: 'friends',
  GROUPS: 'groups',
  APPLICATIONS: 'applications',
  NOTIFICATIONS: 'notifications',
  USER: 'user',
} as const

