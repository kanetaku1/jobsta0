'use server'

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function applyForJob(jobId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { success: false, message: 'ログインが必要です。' }
    }

    // プロフィールの存在確認（念のため）
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single()

    if (profileError || !profile) {
        console.error('Error getting profile:', profileError)
        return { success: false, message: 'ユーザープロファイルが見つかりません。' }
    }

    // 応募グループを作成
    const { data: group, error: groupError } = await supabase
        .from('application_groups')
        .insert({})
        .select()
        .single()

    if (groupError) {
        console.error('Error creating application group:', groupError)
        return { success: false, message: '応募処理中にエラーが発生しました。' }
    }

    // 応募を作成
    const { error: applicationError } = await supabase
        .from('applications')
        .insert({
            job_id: jobId,
            user_id: user.id, // 認証ユーザーIDを直接使用
            group_id: group.id,
            status: 'pending'
        })

    if (applicationError) {
        console.error('Error creating application:', applicationError)
        // TODO: 作成した応募グループを削除する処理を追加した方がより丁寧
        return { success: false, message: '応募処理中にエラーが発生しました。' }
    }

    revalidatePath(`/jobs/${jobId}`)
    return { success: true, message: '応募が完了しました！' }
}

export async function signUpWithProfile(email: string, password: string) {
    const supabase = await createClient()

    // サインアップ
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error || !data.user) {
        return { success: false, message: 'ユーザー登録に失敗しました。' }
    }

    // profilesテーブルにinsert（認証ユーザーIDをPKとして使用）
    const { error: profileError } = await supabase
        .from('profiles')
        .insert({
            id: data.user.id, // 認証ユーザーIDをプライマリキーとして使用
            username: email.split('@')[0],
        })

    if (profileError) {
        console.error('Profile creation error:', profileError)
        return { success: false, message: 'プロフィール登録に失敗しました。' }
    }

    return { success: true, message: '登録が完了しました！' }
}