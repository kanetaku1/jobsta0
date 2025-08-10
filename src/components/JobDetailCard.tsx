'use client'

import { Job } from '@/types/job'
import { redirect } from 'next/navigation'

type JobCardProps = {
    job: Job
}

export function JobDetailCard({ job }: JobCardProps) {

    const handleClick = async() => {
        console.log("待機ルーム参加ボタンが押されました")
        redirect('/')
    }

    return (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold">{job.title}</h2>
            <p className="text-gray-600">日給: {job.wage.toLocaleString()}円</p>
            <p className="text-gray-500">日程: {new Date(job.jobDate).toDateString()}</p>
            <div className="mt-3">
                <button
                    className="text-blue-600 hover:underline"
                    onClick={handleClick}
                >
                    応募待機ルームにジョインする
                </button>
            </div>
        </div>
    )
}
