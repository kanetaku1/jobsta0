'use server'

import { createClient } from '@/lib/supabase/server'
import { requireEmployerAuth } from '@/lib/auth/employer-auth'
import { handleServerActionError } from '@/lib/utils/error-handler'

/**
 * 許可されるファイル形式
 */
const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/jpg'
] as const

/**
 * ファイルサイズ上限（5MB）
 */
const MAX_FILE_SIZE = 5 * 1024 * 1024

/**
 * PDFページ数上限
 */
const MAX_PDF_PAGES = 5

/**
 * ファイルのバリデーション
 */
function validateFile(file: File): { isValid: boolean; error?: string } {
  // ファイルサイズチェック
  if (file.size > MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: `ファイルサイズは5MB以下にしてください（現在: ${(file.size / 1024 / 1024).toFixed(2)}MB）`
    }
  }

  // ファイル形式チェック
  if (!ALLOWED_FILE_TYPES.includes(file.type as any)) {
    return {
      isValid: false,
      error: `許可されていないファイル形式です。PDF、PNG、JPEGのみアップロード可能です。`
    }
  }

  return { isValid: true }
}

/**
 * 求人添付ファイルをアップロード
 */
export async function uploadJobAttachment(formData: FormData) {
  try {
    // 認証チェック（EMPLOYER のみ）
    const employer = await requireEmployerAuth()

    const file = formData.get('file') as File
    if (!file) {
      throw new Error('ファイルが選択されていません')
    }

    // バリデーション
    const validation = validateFile(file)
    if (!validation.isValid) {
      throw new Error(validation.error)
    }

    // Supabaseクライアント取得
    const supabase = await createClient()

    // ファイル名を一意にする
    const timestamp = Date.now()
    const randomStr = Math.random().toString(36).substring(2, 8)
    const fileExt = file.name.split('.').pop()
    const fileName = `${timestamp}_${randomStr}.${fileExt}`
    const filePath = `${employer.supabaseId}/${fileName}`

    // Supabase Storageにアップロード
    const { data, error } = await supabase.storage
      .from('job-attachments')
      .upload(filePath, file, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('Upload error:', error)
      throw new Error(`ファイルのアップロードに失敗しました: ${error.message}`)
    }

    // 公開URLを取得
    const { data: urlData } = supabase.storage
      .from('job-attachments')
      .getPublicUrl(filePath)

    return {
      success: true,
      url: urlData.publicUrl,
      fileName: file.name,
      fileType: file.type.startsWith('image/') ? 'image' : 'pdf',
      fileSize: file.size
    }
  } catch (error) {
    return handleServerActionError(error, {
      context: 'upload',
      operation: 'uploadJobAttachment',
      defaultErrorMessage: 'ファイルのアップロードに失敗しました'
    })
  }
}

/**
 * 求人添付ファイルを削除
 */
export async function deleteJobAttachment(fileUrl: string) {
  try {
    // 認証チェック（EMPLOYER のみ）
    const employer = await requireEmployerAuth()

    // URLからファイルパスを抽出
    const url = new URL(fileUrl)
    const pathMatch = url.pathname.match(/job-attachments\/(.+)/)
    if (!pathMatch) {
      throw new Error('無効なファイルURLです')
    }

    const filePath = pathMatch[1]

    // 自分のファイルかチェック（セキュリティ）
    if (!filePath.startsWith(employer.supabaseId)) {
      throw new Error('他のユーザーのファイルは削除できません')
    }

    // Supabaseクライアント取得
    const supabase = await createClient()

    // Supabase Storageから削除
    const { error } = await supabase.storage
      .from('job-attachments')
      .remove([filePath])

    if (error) {
      console.error('Delete error:', error)
      throw new Error(`ファイルの削除に失敗しました: ${error.message}`)
    }

    return {
      success: true,
      message: 'ファイルを削除しました'
    }
  } catch (error) {
    return handleServerActionError(error, {
      context: 'upload',
      operation: 'deleteJobAttachment',
      defaultErrorMessage: 'ファイルの削除に失敗しました'
    })
  }
}

/**
 * 複数ファイルを一括アップロード
 */
export async function uploadMultipleJobAttachments(formData: FormData) {
  try {
    // 認証チェック（EMPLOYER のみ）
    await requireEmployerAuth()

    const files = formData.getAll('files') as File[]
    if (files.length === 0) {
      throw new Error('ファイルが選択されていません')
    }

    // 各ファイルをアップロード
    const results = await Promise.allSettled(
      files.map(async (file) => {
        const fileFormData = new FormData()
        fileFormData.append('file', file)
        return uploadJobAttachment(fileFormData)
      })
    )

    // 成功したものと失敗したものを分離
    const successful = results
      .filter((r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled' && r.value.success)
      .map(r => r.value)

    const failed = results
      .filter((r): r is PromiseRejectedResult => r.status === 'rejected')
      .map(r => r.reason?.message || 'アップロード失敗')

    return {
      success: true,
      uploaded: successful,
      failed: failed,
      message: `${successful.length}件のファイルをアップロードしました${failed.length > 0 ? `（${failed.length}件失敗）` : ''}`
    }
  } catch (error) {
    return handleServerActionError(error, {
      context: 'upload',
      operation: 'uploadMultipleJobAttachments',
      defaultErrorMessage: 'ファイルのアップロードに失敗しました'
    })
  }
}
