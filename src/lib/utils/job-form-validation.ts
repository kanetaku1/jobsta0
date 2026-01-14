/**
 * 求人フォームのバリデーション関数
 */

import { JobCategory, CompensationType } from '@/types/job'

export type JobFormData = {
  category: JobCategory
  companyName: string
  title: string
  summary?: string
  workHours: string
  location: string
  recruitmentCount: string
  jobContent: string
  compensationType: CompensationType
  compensationAmount?: string
  transportFee?: string
  externalUrl?: string
  externalUrlTitle?: string
  date?: string // EditJobFormのみ
  dates?: string[] // CreateJobFormのみ
  startDate?: string // 長期/インターン用
  endDate?: string // 長期/インターン用
  isFlexibleSchedule?: boolean
}

export type ValidationResult = {
  isValid: boolean
  error?: string
  fieldErrors?: Record<string, string>
}

/**
 * URLバリデーション
 */
export function validateUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

/**
 * サマリー文字数バリデーション（100〜200文字）
 */
export function validateSummary(summary: string): ValidationResult {
  const trimmed = summary.trim()
  if (trimmed.length < 100) {
    return { isValid: false, error: 'サマリーは100文字以上で入力してください' }
  }
  if (trimmed.length > 200) {
    return { isValid: false, error: 'サマリーは200文字以内で入力してください' }
  }
  return { isValid: true }
}

/**
 * 共通の求人フォームバリデーション
 */
export function validateJobFormCommon(data: JobFormData): ValidationResult {
  const fieldErrors: Record<string, string> = {}

  // タイトル
  if (!data.title?.trim()) {
    fieldErrors.title = '求人のタイトルを入力してください'
  }

  // 会社名
  if (!data.companyName.trim()) {
    fieldErrors.companyName = '会社名・店舗名を入力してください'
  }

  // サマリー（必須）
  if (!data.summary?.trim()) {
    fieldErrors.summary = 'サマリーを入力してください（100〜200文字）'
  } else {
    const summaryResult = validateSummary(data.summary)
    if (!summaryResult.isValid) {
      fieldErrors.summary = summaryResult.error!
    }
  }

  // 勤務地
  if (!data.location.trim()) {
    fieldErrors.location = '勤務地を入力してください'
  }

  // 募集人数
  if (!data.recruitmentCount || Number(data.recruitmentCount) <= 0) {
    fieldErrors.recruitmentCount = '募集人数を正しく入力してください'
  }

  // 業務内容
  if (!data.jobContent.trim()) {
    fieldErrors.jobContent = '業務内容を入力してください'
  }

  // 報酬関連（ボランティア以外）
  if (data.compensationType !== CompensationType.NONE) {
    if (!data.compensationAmount || Number(data.compensationAmount) <= 0) {
      fieldErrors.compensationAmount = '報酬額を正しく入力してください'
    }
  }

  // 外部URL（任意だが、入力された場合はバリデーション）
  if (data.externalUrl && data.externalUrl.trim()) {
    if (!validateUrl(data.externalUrl)) {
      fieldErrors.externalUrl = '正しいURL形式で入力してください（http:// または https://）'
    }
    if (!data.externalUrlTitle?.trim()) {
      fieldErrors.externalUrlTitle = '外部URLのタイトルを入力してください'
    }
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { 
      isValid: false, 
      error: '入力内容に誤りがあります',
      fieldErrors 
    }
  }

  return { isValid: true }
}

/**
 * カテゴリ別の日時バリデーション
 */
export function validateCategorySpecificFields(data: JobFormData): ValidationResult {
  const fieldErrors: Record<string, string> = {}

  switch (data.category) {
    case JobCategory.ONE_TIME_JOB:
      // 単発バイト：勤務日必須
      if (data.dates) {
        const validDates = data.dates.filter((date) => date.trim() !== '')
        if (validDates.length === 0) {
          fieldErrors.dates = '少なくとも1つの日付を入力してください'
        }
      } else if (!data.date) {
        fieldErrors.date = '勤務日を入力してください'
      }
      // 勤務時間必須
      if (!data.workHours?.trim()) {
        fieldErrors.workHours = '勤務時間を入力してください'
      }
      break

    case JobCategory.PART_TIME:
      // 中長期アルバイト：開始日必須
      if (!data.startDate) {
        fieldErrors.startDate = '勤務開始日を入力してください'
      }
      // 勤務時間またはシフト情報必須
      if (!data.workHours?.trim()) {
        fieldErrors.workHours = '勤務時間またはシフト情報を入力してください'
      }
      break

    case JobCategory.INTERNSHIP:
      // インターンシップ：開始日・終了日必須
      if (!data.startDate) {
        fieldErrors.startDate = '勤務開始日を入力してください'
      }
      if (!data.endDate) {
        fieldErrors.endDate = '勤務終了日を入力してください'
      }
      // 開始日 < 終了日のチェック
      if (data.startDate && data.endDate) {
        const start = new Date(data.startDate)
        const end = new Date(data.endDate)
        if (start >= end) {
          fieldErrors.endDate = '終了日は開始日より後の日付を入力してください'
        }
      }
      // 勤務時間必須
      if (!data.workHours?.trim()) {
        fieldErrors.workHours = '勤務時間を入力してください'
      }
      break

    case JobCategory.VOLUNTEER:
      // ボランティア：活動日必須
      if (data.dates) {
        const validDates = data.dates.filter((date) => date.trim() !== '')
        if (validDates.length === 0) {
          fieldErrors.dates = '少なくとも1つの活動日を入力してください'
        }
      } else if (!data.date) {
        fieldErrors.date = '活動日を入力してください'
      }
      // 活動時間必須
      if (!data.workHours?.trim()) {
        fieldErrors.workHours = '活動時間を入力してください'
      }
      break
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { 
      isValid: false, 
      error: 'カテゴリ固有の項目に誤りがあります',
      fieldErrors 
    }
  }

  return { isValid: true }
}

/**
 * 求人作成フォームのバリデーション
 */
export function validateCreateJobForm(data: JobFormData): ValidationResult {
  // 共通バリデーション
  const commonResult = validateJobFormCommon(data)
  if (!commonResult.isValid) {
    return commonResult
  }

  // カテゴリ別バリデーション
  const categoryResult = validateCategorySpecificFields(data)
  if (!categoryResult.isValid) {
    return categoryResult
  }

  return { isValid: true }
}

/**
 * 求人編集フォームのバリデーション
 */
export function validateEditJobForm(data: JobFormData): ValidationResult {
  // 共通バリデーション
  const commonResult = validateJobFormCommon(data)
  if (!commonResult.isValid) {
    return commonResult
  }

  // カテゴリ別バリデーション
  const categoryResult = validateCategorySpecificFields(data)
  if (!categoryResult.isValid) {
    return categoryResult
  }

  return { isValid: true }
}

