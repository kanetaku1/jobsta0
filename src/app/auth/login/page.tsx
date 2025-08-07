import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { redirect } from 'next/navigation'
import type { Database } from '@/types/database.types'

//　ログインページ
export default async function LoginPage() {
    const supabase = createServerComponentClient<Database>({
        cookies,
    })

    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
        redirect('/')
    }
}