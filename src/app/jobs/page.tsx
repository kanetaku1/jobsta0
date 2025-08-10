import React from 'react';
import { JobCard } from '@/components/JobCard';
import { Job } from '@/types/job';

async function fetchAllJobs() {
    const res = await fetch(`http://localhost:3000/api/jobs`, {
        cache: "no-store"
    });
    const data = await res.json()
    return data.jobs
}

export default async function job() {
    const jobs = await fetchAllJobs()

    return (
        <div className="space-y-4">
            {jobs.map((job: Job) => (
                <JobCard key={job.id} job={job} />
            ))}
        </div>
    );
};