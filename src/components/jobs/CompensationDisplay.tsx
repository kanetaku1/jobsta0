import { CompensationType, COMPENSATION_TYPE_LABELS } from '@/types/job'

type CompensationDisplayProps = {
  compensationType: CompensationType
  compensationAmount?: number | null
  className?: string
}

/**
 * 報酬表示コンポーネント
 * 報酬形式に応じた適切な表示
 */
export function CompensationDisplay({
  compensationType,
  compensationAmount,
  className
}: CompensationDisplayProps) {
  if (compensationType === CompensationType.NONE) {
    return (
      <p className={className}>
        <span className="text-gray-600 font-semibold">無給</span>
      </p>
    )
  }

  if (!compensationAmount) {
    return (
      <p className={className}>
        <span className="text-gray-600">報酬：応相談</span>
      </p>
    )
  }

  const getLabel = () => {
    switch (compensationType) {
      case CompensationType.HOURLY:
        return '時給'
      case CompensationType.DAILY:
        return '日給'
      case CompensationType.MONTHLY:
        return '月給'
      case CompensationType.FIXED:
        return '固定報酬'
      default:
        return '報酬'
    }
  }

  return (
    <p className={className}>
      <span className="text-blue-600 font-bold text-lg">
        {getLabel()} {compensationAmount.toLocaleString()}円
      </span>
    </p>
  )
}

/**
 * 詳細ページ用のラベル付き報酬表示
 */
export function CompensationDetailDisplay({
  compensationType,
  compensationAmount,
  className
}: CompensationDisplayProps) {
  return (
    <div className={className}>
      <div className="flex items-start">
        <span className="font-semibold text-gray-700 w-32">報酬:</span>
        {compensationType === CompensationType.NONE ? (
          <span className="text-gray-600">無給</span>
        ) : compensationAmount ? (
          <span className="text-blue-600 font-bold text-xl">
            {COMPENSATION_TYPE_LABELS[compensationType]} {compensationAmount.toLocaleString()}円
          </span>
        ) : (
          <span className="text-gray-600">応相談</span>
        )}
      </div>
    </div>
  )
}
