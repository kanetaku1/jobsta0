/*
 * ファイルパス: src/app/jobs/[id]/actions.ts (新規作成)
 * 役割: 求人詳細ページに関連するサーバーサイドの処理を定義します。
 */
import { applyForJob } from "@/utils/supabase/postData";

export async function apply(jobId: string, userId: string): Promise<{ success: boolean, message: string }> {
    const result = await applyForJob(jobId, userId);
    return result;
}