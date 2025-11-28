import { ReactNode } from 'react'

export const metadata = {
  title: 'Jobsta - 求人管理',
  description: '求人作成者向け管理画面',
}

export default function EmployerLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  )
}

