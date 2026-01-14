/**
 * 求人関連の型定義
 */

/**
 * 求人カテゴリ
 */
export enum JobCategory {
  ONE_TIME_JOB = 'ONE_TIME_JOB',  // 単発バイト
  PART_TIME = 'PART_TIME',        // 中長期アルバイト
  INTERNSHIP = 'INTERNSHIP',      // インターンシップ
  VOLUNTEER = 'VOLUNTEER'         // ボランティア
}

/**
 * 報酬形式
 */
export enum CompensationType {
  HOURLY = 'HOURLY',    // 時給
  DAILY = 'DAILY',      // 日給
  MONTHLY = 'MONTHLY',  // 月給
  FIXED = 'FIXED',      // 固定報酬
  NONE = 'NONE'         // 無給
}

/**
 * カテゴリのラベルマッピング
 */
export const JOB_CATEGORY_LABELS: Record<JobCategory, string> = {
  [JobCategory.ONE_TIME_JOB]: '単発バイト',
  [JobCategory.PART_TIME]: '中長期アルバイト',
  [JobCategory.INTERNSHIP]: 'インターンシップ',
  [JobCategory.VOLUNTEER]: 'ボランティア'
}

/**
 * 報酬形式のラベルマッピング
 */
export const COMPENSATION_TYPE_LABELS: Record<CompensationType, string> = {
  [CompensationType.HOURLY]: '時給',
  [CompensationType.DAILY]: '日給',
  [CompensationType.MONTHLY]: '月給',
  [CompensationType.FIXED]: '固定報酬',
  [CompensationType.NONE]: '無給'
}

/**
 * カテゴリごとの利用可能な報酬形式
 */
export const CATEGORY_COMPENSATION_TYPES: Record<JobCategory, CompensationType[]> = {
  [JobCategory.ONE_TIME_JOB]: [
    CompensationType.HOURLY,
    CompensationType.DAILY,
    CompensationType.FIXED
  ],
  [JobCategory.PART_TIME]: [
    CompensationType.HOURLY,
    CompensationType.MONTHLY
  ],
  [JobCategory.INTERNSHIP]: [
    CompensationType.HOURLY,
    CompensationType.MONTHLY,
    CompensationType.FIXED,
    CompensationType.NONE
  ],
  [JobCategory.VOLUNTEER]: [
    CompensationType.NONE
  ]
}

/**
 * 添付ファイル情報
 */
export type JobAttachment = {
  url: string
  name: string
  type: 'pdf' | 'image'
  size?: number
}

/**
 * 求人作成・編集フォームのデータ型
 */
export type JobFormData = {
  // 共通項目
  category: JobCategory
  title: string
  summary: string
  companyName: string
  location: string
  recruitmentCount: number
  jobContent: string
  requirements?: string
  applicationDeadline?: string
  notes?: string
  
  // 報酬関連
  compensationType: CompensationType
  compensationAmount?: number
  transportFee?: number
  
  // 日時関連（カテゴリによって使い分け）
  dates?: string[]        // 単発バイト用（複数日）
  jobDate?: string        // 単発バイト用（単一日）
  startDate?: string      // 長期/インターン用
  endDate?: string        // 長期/インターン用
  workHours?: string
  isFlexibleSchedule?: boolean
  
  // 外部リンク・添付ファイル
  externalUrl?: string
  externalUrlTitle?: string
  attachments?: File[]
  attachmentUrls?: string[]
}

/**
 * バリデーション結果
 */
export type ValidationResult = {
  isValid: boolean
  error?: string
  fieldErrors?: Record<string, string>
}
