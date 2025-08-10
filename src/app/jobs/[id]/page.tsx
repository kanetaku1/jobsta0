'use client'

import React from 'react';
import { JobDetailCard } from '@/components/JobDetailCard';
import { Job } from '@/types/job';

const getJobById = async (id: number) => {
    const res = await fetch(`http://localhost:3000/api/jobs/${id}`);
    const data = await res.json()
    return data.job
}

export default async function job({params}: { params: Promise<{ id: number }>}) {
    const { id } = await params
    const job: Job = await getJobById(id)

    return (
        <div className="space-y-4">
            {(job? 
                <JobDetailCard job={job} />
                : 
                <p className="text-2xl font-bold mb-6">求人情報は見当たりません</p>
            )}
        </div>
    );
};