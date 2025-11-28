import jobsData from '@/data/jobs.json'

export type Job = {
    company_id: string | null
    created_at: string
    description: string | null
    id: string
    job_date: string | null
    location: string | null
    title: string | null
    transport_fee: number | null
    wage_amount: number | null
}

// JSONファイルから求人データを取得
export async function getJobsAll(): Promise<Job[]> {
    // JSONファイルから読み込み（SSR対応）
    return jobsData as Job[]
}

// IDで求人を取得
export async function getJob(id: string): Promise<Job | null> {
    const jobs = await getJobsAll()
    const job = jobs.find(j => j.id === id)
    return job || null
}