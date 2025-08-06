import { Job } from '@/types';
import { getJobsAll } from '@/utils/supabase/getData';

/**
 * 求人情報を取得するサービス
 * @returns {Promise<Job[]>} 求人のリスト
 */

export async function getJobs(): Promise<Job[]> {
  return await getJobsAll();
}
