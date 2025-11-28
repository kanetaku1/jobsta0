'use client'

import { useState } from 'react'
import { X, Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { QRCodeSVG } from 'qrcode.react'
import { useToast } from '@/components/ui/use-toast'
import type { Group } from '@/types/application'

type GroupInviteLinkModalProps = {
  isOpen: boolean
  onClose: () => void
  group: Group
}

export function GroupInviteLinkModal({ isOpen, onClose, group }: GroupInviteLinkModalProps) {
  const { toast } = useToast()
  const [copied, setCopied] = useState(false)

  if (!isOpen) return null

  const handleCopyLink = () => {
    navigator.clipboard.writeText(group.groupInviteLink)
    setCopied(true)
    toast({
      title: 'コピーしました',
      description: 'グループ招待リンクをクリップボードにコピーしました',
    })
    setTimeout(() => {
      setCopied(false)
    }, 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">グループ招待リンク</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="閉じる"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800 text-sm">
              💡 グループ招待リンクをコピーするか、QRコードを表示して友達に送ってください。友達はリンクから求人情報を確認して参加できます。
            </p>
          </div>

          <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <p className="font-medium text-gray-900 mb-2">グループ招待リンク</p>
                <div className="flex items-center gap-2 mb-3">
                  <input
                    type="text"
                    readOnly
                    value={group.groupInviteLink}
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded bg-white"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCopyLink}
                    className="flex items-center gap-2"
                  >
                    {copied ? (
                      <>
                        <Check size={16} />
                        コピー済み
                      </>
                    ) : (
                      <>
                        <Copy size={16} />
                        コピー
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-center p-4 bg-white rounded border border-gray-200">
              <QRCodeSVG value={group.groupInviteLink} size={200} />
            </div>
            <p className="text-xs text-gray-500 text-center mt-2">
              QRコードをスキャンしてグループに参加
            </p>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              onClick={onClose}
              className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
            >
              閉じる
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

