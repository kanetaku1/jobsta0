// 型引数を指定しなくても認証機能は動作します
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function LogoutButton() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    // ログアウト後にログインページへ
    redirect('/login')
}