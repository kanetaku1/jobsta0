import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth/get-current-user'
import { JobSeekerHomePage } from './JobSeekerHomePage'

/**
 * ルートページ
 * 雇用主の場合は求人管理ページにリダイレクト
 * 求職者の場合は求職者向けページを表示
 */
export default async function HomePage() {
  // 現在のユーザーを取得
  const user = await getCurrentUser()
  
  if (user && user.role === 'EMPLOYER') {
    // 雇用主の場合は求人管理ページにリダイレクト
    redirect('/employer/jobs')
  }
  
  // 雇用主でない場合、求職者向けページを表示
  return <JobSeekerHomePage />
}