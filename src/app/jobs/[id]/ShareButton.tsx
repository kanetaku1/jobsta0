'use client'

import { useState } from 'react'
import { Share2, Copy, Check } from 'lucide-react'

type ShareButtonProps = {
    jobId: string
    jobTitle: string
}

export function ShareButton({ jobId, jobTitle }: ShareButtonProps) {
    const [copied, setCopied] = useState(false)

    const shareUrl = typeof window !== 'undefined' 
        ? `${window.location.origin}/jobs/${jobId}`
        : ''

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: jobTitle,
                    text: `友達と一緒に応募しませんか？\n${jobTitle}`,
                    url: shareUrl,
                })
            } catch (error) {
                // ユーザーが共有をキャンセルした場合など
                console.log('Share cancelled')
            }
        } else {
            // フォールバック: クリップボードにコピー
            handleCopy()
        }
    }

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch (error) {
            console.error('Failed to copy:', error)
            alert('リンクのコピーに失敗しました')
        }
    }

    return (
        <div className="flex gap-2">
            <button
                onClick={handleShare}
                className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
                <Share2 size={20} />
                友達に共有
            </button>
            <button
                onClick={handleCopy}
                className="flex items-center gap-2 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
                {copied ? (
                    <>
                        <Check size={20} />
                        コピー完了
                    </>
                ) : (
                    <>
                        <Copy size={20} />
                        リンクをコピー
                    </>
                )}
            </button>
        </div>
    )
}
