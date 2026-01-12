import { redirect } from 'next/navigation'
import { requireEmployerAuth } from '@/lib/auth/employer-auth'
import { getEmployerJobs } from '@/lib/actions/jobs'
import { EmployerJobsPageClient } from './EmployerJobsPageClient'

export default async function EmployerJobsPage() {
  let employer
  try {
    employer = await requireEmployerAuth()
  } catch (error) {
    redirect('/employer/login')
  }

  const jobs = await getEmployerJobs()

  return <EmployerJobsPageClient employer={employer} initialJobs={jobs} />
}

