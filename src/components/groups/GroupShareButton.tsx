'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useLiff } from '@/lib/liff/liff-provider'
import { Share2, Copy, Check } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { QRCodeSVG } from 'qrcode.react'
import { generateGroupInviteLink } from '@/lib/actions/invite-tokens'

interface GroupShareButtonProps {
  groupId: string
  jobTitle?: string
}

export function GroupShareButton({ groupId, jobTitle }: GroupShareButtonProps) {
  const { toast } = useToast()
  const liff = useLiff()
  const [inviteUrl, setInviteUrl] = useState('')
  const [copied, setCopied] = useState(false)
  const [showQR, setShowQR] = useState(false)
  const [loading, setLoading] = useState(false)
  
  // 招待リンクを生成
  const createInviteLink = async () => {
    if (inviteUrl) return inviteUrl // 既に生成済み
    
    try {
      setLoading(true)
      const link = await generateGroupInviteLink(groupId)
      setInviteUrl(link)
      return link
    } catch (error) {
      console.error('Failed to generate invite link:', error)
      toast({
        title: 'エラー',
        description: '招待リンクの生成に失敗しました',
        variant: 'destructive',
      })
      return ''
    } finally {
      setLoading(false)
    }
  }
  
  const handleShare = async () => {
    const link = await createInviteLink()
    if (!link) return
    
    // LINE内かどうかで判定
    if (liff.isInClient && liff.isInitialized) {
      // LINE内: shareTargetPickerを使用
      try {
        await liff.shareInvite(link)
        toast({
          title: '送信しました',
          description: '招待リンクを送信しました',
        })
      } catch (error) {
        console.error('LINE share failed:', error)
        await copyToClipboard(link)
      }
    } else {
      // その他: QRコードとコピーを表示
      setShowQR(true)
    }
  }
  
  const copyToClipboard = async (link: string) => {
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
    }
  }
  
  return (
    <>
      <Button 
        onClick={handleShare} 
        disabled={loading}
        className="flex items-center gap-2"
      >
        {copied ? (
          <>
            <Check size={18} />
            コピー済み
          </>
        ) : (
          <>
            <Share2 size={18} />
            グループに招待
          </>
        )}
      </Button>
      
      {/* QRコードモーダル */}
      {showQR && inviteUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md m-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">グループに招待</h2>
              <button
                onClick={() => setShowQR(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                このリンクまたはQRコードを友達に送って、グループに参加してもらえます。
              </p>
              
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={inviteUrl}
                  className="flex-1 px-3 py-2 border rounded text-sm"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(inviteUrl)}
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                </Button>
              </div>
              
              <div className="flex items-center justify-center p-4 bg-gray-50 rounded border">
                <QRCodeSVG value={inviteUrl} size={200} />
              </div>
              
              <Button onClick={() => setShowQR(false)} className="w-full">
                閉じる
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
