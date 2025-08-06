import { createClient } from '@/utils/supabase/server';

export async function applyForJob(jobId: string, userId: string): Promise<{ success: boolean, message: string }> {
    const supabase = await createClient();
    const { data: group, error: groupError } = await supabase
        .from('application_groups')
        .insert({})
        .select()
        .single()
    if (groupError) {
        console.error('Error creating application group:', groupError);
        return { success: false, message: '応募処理中にエラーが発生しました。' };
    }
    const { error: applicationError } = await supabase
        .from('applications')
        .insert({
            job_id: jobId,
            user_id: userId,
            group_id: group?.id,
            status: 'pending' // ステータスを「保留中」で登録
        })
    if (applicationError) {
        console.error('Error creating application:', applicationError);
        return { success: false, message: '応募処理中にエラーが発生しました。' };
    }
    return { success: true, message: '応募が完了しました！' };
}