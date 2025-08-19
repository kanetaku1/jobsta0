'use client'

import { createGroupForJob } from '@/app/groups/actions'
import { useState } from 'react'

interface CreateGroupButtonProps {
    jobId: number
    className?: string
}

export default function CreateGroupButton({ jobId, className = '' }: CreateGroupButtonProps) {
    const [isCreating, setIsCreating] = useState(false)

    const handleCreateGroup = async () => {
        try {
            setIsCreating(true)
            await createGroupForJob(jobId, className)
        } catch (error) {
            console.error('Failed to create group:', error)
            // エラーハンドリング（必要に応じてトースト表示など）
        } finally {
            setIsCreating(false)
        }
    }

    return (
        <button
            onClick={handleCreateGroup}
            disabled={isCreating}
            className={`bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-md transition-colors ${className}`}
        >
            {isCreating ? '作成中...' : 'グループを作成'}
        </button>
    )
}
