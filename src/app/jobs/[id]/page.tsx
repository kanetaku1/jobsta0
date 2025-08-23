import { getWaitingRoom } from '@/app/actions';
import { Button } from '@/components/common';
import { JobDetailCard } from '@/components/features/dashboard';
import { JobService } from '@/lib/services/jobService';
import { GroupService } from '@/lib/services/groupService';
import { notFound } from 'next/navigation';

async function getJobWithGroups(id: string) {
  try {
    const job = await JobService.getJobById(parseInt(id));
    if (!job) {
      notFound();
    }

    // 求人に関連するグループを取得
    const groups = await GroupService.getGroupsByJobId(job.id);

    return { job, groups };
  } catch (err) {
    console.error(err);
    throw new Error('Failed to fetch job');
  }
}

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { job, groups } = await getJobWithGroups(id);

  return (
    <div className="space-y-4">
      <JobDetailCard job={job} groups={groups} />
    </div>
  );
}
