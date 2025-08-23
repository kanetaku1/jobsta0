import { JobCard } from '@/components/features/dashboard';
import { JobService } from '@/lib/services/jobService';
import { notFound } from 'next/navigation';

async function getJobs() {
  try {
    const jobs = await JobService.getAllJobs();
    if (!jobs || jobs.length === 0) {
      notFound();
    }
    return jobs;
  } catch (err) {
    console.error(err);
    throw new Error('Failed to fetch jobs');
  }
}

export default async function JobsPage() {
  const jobs = await getJobs();

  return (
    <div className="space-y-4">
      {jobs.map(job => (
        <JobCard key={job.id} job={job} />
      ))}
    </div>
  );
}
