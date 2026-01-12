import { getJobsAll } from '@/lib/utils/getData'
import { JobsPageClient } from './JobsPageClient'

export default async function JobsPage() {
    const jobs = await getJobsAll()
    return <JobsPageClient initialJobs={jobs} />
}
