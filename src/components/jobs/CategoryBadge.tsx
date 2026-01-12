import { JobCategory, JOB_CATEGORY_LABELS } from '@/types/job'
import { cn } from '@/lib/utils/cn'

type CategoryBadgeProps = {
  category: JobCategory
  className?: string
}

/**
 * カテゴリバッジコンポーネント
 * カテゴリごとに色分けして表示
 */
export function CategoryBadge({ category, className }: CategoryBadgeProps) {
  const getColor = (cat: JobCategory) => {
    switch (cat) {
      case JobCategory.ONE_TIME_JOB:
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case JobCategory.PART_TIME:
        return 'bg-green-100 text-green-800 border-green-200'
      case JobCategory.INTERNSHIP:
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case JobCategory.VOLUNTEER:
        return 'bg-orange-100 text-orange-800 border-orange-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        getColor(category),
        className
      )}
    >
      {JOB_CATEGORY_LABELS[category]}
    </span>
  )
}
