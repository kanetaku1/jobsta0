import { redirect } from 'next/navigation'
import { getCurrentEmployer } from '@/lib/auth/employer-auth'
import { JobSeekerHomePage } from './JobSeekerHomePage'

/**
 * ルートページ
 * 雇用主（Supabaseセッション）と求職者（Auth0トークン）の両方をチェック
 * 優先順位: 雇用主 > 求職者 > 未認証
 */
export default async function HomePage() {
  // まず雇用主セッションをチェック（サーバーサイド）
  const employer = await getCurrentEmployer()
  
  if (employer) {
    // 雇用主の場合は求人管理ページにリダイレクト
    redirect('/employer/jobs')
  }
  
  // 雇用主でない場合、求職者向けページを表示
  // 認証済みの場合は求職者向け機能を表示
  return <JobSeekerHomePage />
}