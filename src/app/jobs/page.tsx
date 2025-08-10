import React from 'react';
import { JobCard } from '@/components/JobCard';

// 仮データ（後でPrisma経由のDB取得に置き換え）
const mockJobs = [
    {
        id: '1',
        title: '長岡花火大会スタッフ募集',
        wage: 9000,
        eventDate: '2025-08-02',
    },
    {
        id: '2',
        title: '農業体験・収穫バイト',
        wage: 8000,
        eventDate: '2025-09-10',
    },
]

const job = () => {
    return (
        <div className="space-y-4">
            {mockJobs.map((job) => (
                <JobCard key={job.id} job={job} />
            ))}
        </div>
    );
};

export default job;