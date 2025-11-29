/**
 * 求人フォームのバリデーション関数
 */

export type JobFormData = {
  companyName: string
  workHours: string
  hourlyWage: string
  location: string
  recruitmentCount: string
  jobContent: string
  title?: string // CreateJobFormのみ
  date?: string // EditJobFormのみ
  dates?: string[] // CreateJobFormのみ
}

export type ValidationResult = {
  isValid: boolean
  error?: string
}

/**
 * 共通の求人フォームバリデーション
 */
export function validateJobFormCommon(data: JobFormData): ValidationResult {
  if (!data.companyName.trim()) {
    return { isValid: false, error: '会社名・店舗名を入力してください' }
  }

  if (!data.workHours.trim()) {
    return { isValid: false, error: '勤務時間を入力してください' }
  }

  if (!data.hourlyWage || Number(data.hourlyWage) <= 0) {
    return { isValid: false, error: '時給を正しく入力してください' }
  }

  if (!data.location.trim()) {
    return { isValid: false, error: '勤務地を入力してください' }
  }

  if (!data.recruitmentCount || Number(data.recruitmentCount) <= 0) {
    return { isValid: false, error: '募集人数を正しく入力してください' }
  }

  if (!data.jobContent.trim()) {
    return { isValid: false, error: '業務内容を入力してください' }
  }

  return { isValid: true }
}

/**
 * 求人作成フォームのバリデーション
 */
export function validateCreateJobForm(data: JobFormData & { title: string; dates: string[] }): ValidationResult {
  // 共通バリデーション
  const commonResult = validateJobFormCommon(data)
  if (!commonResult.isValid) {
    return commonResult
  }

  // タイトルチェック
  if (!data.title.trim()) {
    return { isValid: false, error: '求人のタイトルを入力してください' }
  }

  // 日付チェック
  const validDates = data.dates.filter((date) => date.trim() !== '')
  if (validDates.length === 0) {
    return { isValid: false, error: '少なくとも1つの日付を入力してください' }
  }

  // 日付の形式チェック
  for (const dateStr of validDates) {
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) {
      return { isValid: false, error: '日付の形式が正しくありません' }
    }
  }

  return { isValid: true }
}

/**
 * 求人編集フォームのバリデーション
 */
export function validateEditJobForm(data: JobFormData & { date: string }): ValidationResult {
  // 共通バリデーション
  const commonResult = validateJobFormCommon(data)
  if (!commonResult.isValid) {
    return commonResult
  }

  // 日付チェック
  if (!data.date) {
    return { isValid: false, error: '日付を入力してください' }
  }

  return { isValid: true }
}

