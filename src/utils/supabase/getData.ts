import { createClient } from '@/utils/supabase/server'
import { Job } from '@/types'

export async function getJobsAll(): Promise<Job[]> {
    const supabase = await createClient()
    const { data: jobs, error } = await supabase
        .from('jobs')
        .select('*')
    if (error) {
        console.error('Error fetching jobs:', error)
        return []
    }
    return jobs || []
}

export async function getJobById(id: string): Promise<Job | null> {
    const supabase = await createClient()
    const { data: job, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', id)
        .single()
    if (error) {
        console.error('Error fetching job by ID:', error)
        return null
    }
    return job || null
}

export async function checkApplicationStatus(jobId: string, userId: string): Promise<boolean> {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('applications')
        .select('id')
        .eq('job_id', jobId)
        .eq('user_id', userId)
        .maybeSingle() // 該当データがなくてもエラーにしない
    if (error) {
        console.error('Error checking application status:', error)
        return false
    }
    return !!data; // dataがあればtrue, なければfalse
}

export async function getUser() {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.getUser()
    if (error) {
        console.error('Error fetching user:', error)
        return null
    }
    return data.user
}
