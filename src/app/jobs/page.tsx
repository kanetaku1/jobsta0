import JobList from "./JobList";
import { getJobs } from "./jobService";

/**
 * ファイルパス: src/app/jobs/page.tsx
 * 役割: 求人一覧ページ。getJobsを呼び出して求人情報を取得し、JobListコンポーネントに渡す
 */
export const dynamic = 'force-dynamic';

export default async function JobsPage() {
    const jobs = await getJobs();
    return <JobList jobs={jobs} />;
}