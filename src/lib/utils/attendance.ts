/**
 * 勤務時間計算と給与計算のユーティリティ関数
 */

/**
 * 勤務時間を計算する（時間単位）
 * @param startTime 勤務開始時刻
 * @param endTime 勤務終了時刻
 * @returns 勤務時間（時間単位）
 */
export function calculateWorkHours(startTime: Date, endTime: Date): number {
  const diffInMs = endTime.getTime() - startTime.getTime()
  const diffInHours = diffInMs / (1000 * 60 * 60) // ミリ秒を時間に変換
  return Math.round(diffInHours * 100) / 100 // 小数点第2位まで
}

/**
 * 給与を計算する
 * @param workHours 勤務時間（時間単位）
 * @param hourlyWage 時給（円）
 * @returns 総給与（円）
 */
export function calculateWage(workHours: number, hourlyWage: number): number {
  return Math.round(workHours * hourlyWage)
}

/**
 * 勤務時間をフォーマットする
 * @param hours 勤務時間（時間単位）
 * @returns フォーマットされた勤務時間文字列（例: "8時間30分"）
 */
export function formatWorkHours(hours: number): string {
  const h = Math.floor(hours)
  const m = Math.round((hours - h) * 60)
  return `${h}時間${m}分`
}

/**
 * 金額をフォーマットする
 * @param amount 金額（円）
 * @returns フォーマットされた金額文字列（例: "¥1,500"）
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY'
  }).format(amount)
}

/**
 * 時間をフォーマットする
 * @param date 日時
 * @returns フォーマットされた時間文字列（例: "14:30"）
 */
export function formatTime(date: Date): string {
  return new Date(date).toLocaleTimeString('ja-JP', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * 日付をフォーマットする
 * @param date 日時
 * @returns フォーマットされた日付文字列（例: "2024年1月15日"）
 */
export function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

/**
 * 勤務統計を計算する
 * @param attendances 勤務記録の配列
 * @returns 勤務統計オブジェクト
 */
export function calculateAttendanceStats(attendances: any[]) {
  const completedAttendances = attendances.filter(a => a.endTime)
  
  const totalHours = completedAttendances.reduce((sum, a) => sum + (a.totalHours || 0), 0)
  const totalWage = completedAttendances.reduce((sum, a) => sum + (a.totalWage || 0), 0)
  const paidWage = completedAttendances
    .filter(a => a.isPaid)
    .reduce((sum, a) => sum + (a.totalWage || 0), 0)
  
  const uniqueUsers = new Set(attendances.map(a => a.userId)).size
  const workDays = completedAttendances.length
  
  return {
    totalHours,
    totalWage,
    paidWage,
    unpaidWage: totalWage - paidWage,
    workDays,
    uniqueUsers,
    averageHoursPerDay: workDays > 0 ? totalHours / workDays : 0,
    averageWagePerDay: workDays > 0 ? totalWage / workDays : 0
  }
}

/**
 * 勤務時間の妥当性をチェックする
 * @param startTime 勤務開始時刻
 * @param endTime 勤務終了時刻
 * @returns 妥当性チェック結果
 */
export function validateWorkTime(startTime: Date, endTime: Date): {
  isValid: boolean
  error?: string
} {
  const now = new Date()
  
  // 未来の時刻は無効
  if (startTime > now) {
    return { isValid: false, error: '勤務開始時刻は未来の時刻にできません' }
  }
  
  if (endTime > now) {
    return { isValid: false, error: '勤務終了時刻は未来の時刻にできません' }
  }
  
  // 終了時刻は開始時刻より後でなければならない
  if (endTime <= startTime) {
    return { isValid: false, error: '勤務終了時刻は開始時刻より後でなければなりません' }
  }
  
  // 勤務時間が長すぎる場合（24時間以上）
  const workHours = calculateWorkHours(startTime, endTime)
  if (workHours > 24) {
    return { isValid: false, error: '勤務時間が24時間を超えています' }
  }
  
  // 勤務時間が短すぎる場合（1分未満）
  if (workHours < 1/60) {
    return { isValid: false, error: '勤務時間が1分未満です' }
  }
  
  return { isValid: true }
}
