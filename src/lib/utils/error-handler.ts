/**
 * 統一されたエラーハンドリングユーティリティ
 */

/**
 * エラーの種類
 */
export type ErrorContext =
  | 'job'
  | 'application'
  | 'group'
  | 'friend'
  | 'notification'
  | 'auth'
  | 'user'
  | 'batch'
  | 'unknown'

/**
 * エラーハンドリングのオプション
 */
export type ErrorHandlerOptions = {
  context: ErrorContext
  operation: string
  defaultErrorMessage?: string
  logError?: boolean
}

/**
 * エラーをログに記録
 */
export function logError(
  error: unknown,
  context: ErrorContext,
  operation: string
): void {
  const errorMessage = error instanceof Error ? error.message : 'Unknown error'
  const errorStack = error instanceof Error ? error.stack : undefined

  console.error(`[${context.toUpperCase()}] ${operation}:`, {
    message: errorMessage,
    stack: errorStack,
    error,
  })
}

/**
 * エラーからユーザーフレンドリーなメッセージを取得
 */
export function getErrorMessage(
  error: unknown,
  defaultMessage: string = '処理に失敗しました'
): string {
  if (error instanceof Error) {
    return error.message || defaultMessage
  }
  return defaultMessage
}

/**
 * エラーハンドリング（ログ出力 + エラーメッセージ取得）
 */
export function handleError(
  error: unknown,
  options: ErrorHandlerOptions
): string {
  const { context, operation, defaultErrorMessage = '処理に失敗しました', logError: shouldLog = true } = options

  if (shouldLog) {
    logError(error, context, operation)
  }

  return getErrorMessage(error, defaultErrorMessage)
}

/**
 * サーバーアクション用のエラーハンドリング
 * エラーログを出力し、エラーレスポンスを返す
 */
export function handleServerActionError<T>(
  error: unknown,
  options: ErrorHandlerOptions
): { success: false; error: string } {
  const errorMessage = handleError(error, options)
  return {
    success: false,
    error: errorMessage,
  }
}

/**
 * データ取得用のエラーハンドリング
 * エラーログを出力し、デフォルト値を返す
 */
export function handleDataFetchError<T>(
  error: unknown,
  options: ErrorHandlerOptions,
  defaultValue: T
): T {
  handleError(error, options)
  return defaultValue
}

