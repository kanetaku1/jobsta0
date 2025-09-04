import { JobCard } from '@/components/features/dashboard';
import { JobService } from '@/lib/services/jobService';
import { notFound } from 'next/navigation';

// 動的レンダリングを強制
export const dynamic = 'force-dynamic';

async function getJobs() {
  try {
    const jobs = await JobService.getAllJobs();
    if (!jobs || jobs.length === 0) {
      return [];
    }
    return jobs;
  } catch (err) {
    console.error(err);
    return []; // エラー時は空配列を返す
  }
}

export default async function WorkerJobsPage() {
  const jobs = await getJobs();

  return (
    <div className="space-y-4">
      {jobs.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">求人が見つかりませんでした</p>
        </div>
      ) : (
        jobs.map(job => (
          <JobCard key={job.id} job={job} />
        ))
      )}
    </div>
  );
}
