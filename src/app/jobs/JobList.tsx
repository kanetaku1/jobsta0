import styles from './JobList.module.css';
import { Job } from '@/types';
import React from 'react';
import Link from 'next/link';

/*
* ファイルパス: src/app/jobs/JobList.tsx
* 役割: 求人一覧を表示するコンポーネント。求人情報を受け取り、カード形式で表示
*       求人がない場合はメッセージを表示
*/

type JobListProps = {
    jobs: Job[];
};

export default function JobList({ jobs }: JobListProps) {
    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6">求人一覧</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {jobs.length === 0 && (
                    <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center text-gray-500">
                        現在、求人情報はありません。
                    </div>
                )}
                {jobs.map((job) => (
                    <Link key={job.id} className={styles.jobCard} href={`/jobs/${job.id}`}>
                        <h2 className={styles.jobTitle}>{job.title}</h2>
                        <p className={styles.jobDescription}>{job.description}</p>
                        <p className={styles.jobLocation}>勤務地：{job.location}</p>
                        <p className={styles.jobWage}>日給 {job.wage_amount.toLocaleString()}円</p>
                        <p className={styles.jobDate}>日付：{job.job_date.toLocaleString()}</p>
                        {job.transport_fee !== undefined && (
                            <p className={styles.jobTransportFee}>交通費：{job.transport_fee === null ? 'なし' : `${job.transport_fee}円`}</p>
                        )}
                    </Link>
                ))}
            </div>
        </div>
    );
}
