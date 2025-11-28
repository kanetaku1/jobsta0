import { getJobsAll as getJobsAllFromDB, getJob as getJobFromDB } from '@/lib/actions/jobs'

export type Job = {
    company_id: string | null
    company_name: string | null
    work_hours: string | null
    recruitment_count: number | null
    job_content: string | null
    requirements: string | null
    application_deadline: string | null
    notes: string | null
    employer_id: string | null
    created_at: string
    description: string | null
    id: string
    job_date: string | null
    location: string | null
    title: string | null
    transport_fee: number | null
    wage_amount: number | null
}

// データベースから求人データを取得
export async function getJobsAll(): Promise<Job[]> {
    return await getJobsAllFromDB()
}

// IDで求人を取得
export async function getJob(id: string): Promise<Job | null> {
    return await getJobFromDB(id)
}

// 複数のIDで求人を一括取得（N+1問題の解決）
export async function getJobsByIds(ids: string[]): Promise<Map<string, Job>> {
    const jobs = await getJobsAll()
    const jobsMap = new Map<string, Job>()
    
    for (const id of ids) {
        const job = jobs.find(j => j.id === id)
        if (job) {
            jobsMap.set(id, job)
        }
    }
    
    return jobsMap
}

