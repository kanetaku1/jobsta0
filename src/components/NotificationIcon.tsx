import { Bell, CheckCircle, XCircle } from 'lucide-react'
import type { NotificationType } from '@/types/application'

interface NotificationIconProps {
  type: NotificationType
  size?: number
  className?: string
}

export function NotificationIcon({ type, size = 20, className }: NotificationIconProps) {
  const baseClassName = className || ''
  
  switch (type) {
    case 'application_invitation':
      return <Bell size={size} className={`text-blue-500 ${baseClassName}`} />
    case 'application_approved':
      return <CheckCircle size={size} className={`text-green-500 ${baseClassName}`} />
    case 'application_rejected':
      return <XCircle size={size} className={`text-red-500 ${baseClassName}`} />
    default:
      return <Bell size={size} className={baseClassName} />
  }
}

