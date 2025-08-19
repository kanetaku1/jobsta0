'use client'

import { useState } from 'react'
import { createGroupForJob } from '@/app/groups/actions'

interface CreateGroupFormProps {
    jobId: number
    onGroupCreated?: () => void
    className?: string
}

export function CreateGroupForm({ jobId, onGroupCreated, className = '' }: CreateGroupFormProps) {
    const [groupName, setGroupName] = useState('')
    const [isCreating, setIsCreating] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        if (!groupName.trim()) {
            setError('グループ名を入力してください')
            return
        }

        setIsCreating(true)
        setError('')

        try {
            await createGroupForJob(jobId, groupName.trim())
            setGroupName('')
            onGroupCreated?.()
        } catch (error) {
            console.error('グループ作成に失敗しました:', error)
            setError('グループの作成に失敗しました。もう一度お試しください。')
        } finally {
            setIsCreating(false)
        }
    }

    return (
        <div className={`bg-white p-4 rounded-lg border border-gray-200 ${className}`}>
            <h3 className="text-lg font-semibold mb-3">新しいグループを作成</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                    <label htmlFor="groupName" className="block text-sm font-medium text-gray-700 mb-1">
                        グループ名 <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        id="groupName"
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                        placeholder="例: 朝班、夜班、土日班"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={isCreating}
                    />
                </div>
                
                {error && (
                    <p className="text-red-500 text-sm">{error}</p>
                )}
                
                <button
                    type="submit"
                    disabled={isCreating || !groupName.trim()}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                    {isCreating ? '作成中...' : 'グループを作成'}
                </button>
            </form>
        </div>
    )
}
