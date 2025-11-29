import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma/client'
import { EmployerEmailConfirmClient } from './EmployerEmailConfirmClient'

export default async function EmployerEmailConfirmPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; type?: string; code?: string }>
}) {
  const params = await searchParams
  const token = params.token
  const type = params.type
  const code = params.code

  // codeパラメータがある場合（PKCE flow）- 通常は /employer/auth/callback で処理される
  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      // Userテーブルに求人作成者を登録
      try {
        await prisma.user.upsert({
          where: { supabaseId: data.user.id },
          update: {
            email: data.user.email || undefined,
            name: data.user.user_metadata?.name || undefined,
            role: 'EMPLOYER',
          },
          create: {
            id: crypto.randomUUID(),
            supabaseId: data.user.id,
            email: data.user.email || undefined,
            name: data.user.user_metadata?.name || undefined,
            role: 'EMPLOYER',
          },
        })
      } catch (dbError) {
        console.error('Error syncing employer user:', dbError)
      }

      // セッションが確立されたので、求人管理ページにリダイレクト
      redirect('/employer/jobs')
    }
  }

  // tokenパラメータがある場合（email confirmation token）
  if (token && type === 'signup') {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: 'email',
    })

    if (!error && data.user) {
      // Userテーブルに求人作成者を登録
      try {
        await prisma.user.upsert({
          where: { supabaseId: data.user.id },
          update: {
            email: data.user.email || undefined,
            name: data.user.user_metadata?.name || undefined,
            role: 'EMPLOYER',
          },
          create: {
            id: crypto.randomUUID(),
            supabaseId: data.user.id,
            email: data.user.email || undefined,
            name: data.user.user_metadata?.name || undefined,
            role: 'EMPLOYER',
          },
        })
      } catch (dbError) {
        console.error('Error syncing employer user:', dbError)
      }

      // セッションが確立されたので、求人管理ページにリダイレクト
      redirect('/employer/jobs')
    }
  }

  // エラーがある場合、またはパラメータがない場合はクライアントコンポーネントでエラー表示
  return <EmployerEmailConfirmClient token={token} type={type} code={code} />
}

