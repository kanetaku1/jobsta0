'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useLiff } from '@/lib/liff/liff-provider'
import { Share2, Copy, Check } from 'lucide-react'

interface SocialShareButtonProps {
  inviteUrl: string
  label?: string
}

export function SocialShareButton({ inviteUrl, label = '友達を招待' }: SocialShareButtonProps) {
  const liff = useLiff()
  const [copied, setCopied] = useState(false)
  
  const handleShare = async () => {
    // LINE内かどうかで判定
    if (liff.isInClient && liff.isInitialized) {
      // LINE内: shareTargetPickerを使用
      try {
        await liff.shareInvite(inviteUrl)
      } catch (error) {
        console.error('LINE share failed:', error)
        // フォールバック: コピー
        await copyToClipboard()
      }
    } else {
      // その他: クリップボードにコピー
      await copyToClipboard()
    }
  }
  
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
    }
  }
  
  return (
    <Button onClick={handleShare} className="flex items-center gap-2">
      {copied ? (
        <>
          <Check size={18} />
          コピー済み
        </>
      ) : (
        <>
          <Share2 size={18} />
          {label}
        </>
      )}
    </Button>
  )
}
