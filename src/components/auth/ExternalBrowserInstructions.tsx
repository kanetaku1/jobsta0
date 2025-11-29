'use client'

import { useEffect, useState } from 'react'
import { isInAppBrowser } from '@/lib/utils/browser-detection'

type ExternalBrowserInstructionsProps = {
  showCurrentStatus?: boolean
}

export function ExternalBrowserInstructions({
  showCurrentStatus = false,
}: ExternalBrowserInstructionsProps) {
  const [isInApp, setIsInApp] = useState(false)

  useEffect(() => {
    if (showCurrentStatus) {
      setIsInApp(isInAppBrowser())
    }
  }, [showCurrentStatus])

  return (
    <>
      <div className="rounded-md bg-yellow-50 px-4 py-3 text-left">
        <p className="text-sm text-yellow-800 font-medium mb-2">
          以下の手順で外部ブラウザで開いてください：
        </p>
        <ol className="text-xs text-yellow-700 space-y-2 list-decimal list-inside">
          <li>
            画面右上のメニュー（<span className="font-semibold">⋮</span> または{' '}
            <span className="font-semibold">…</span>）をタップ
          </li>
          <li>「Safariで開く」または「Chromeで開く」を選択</li>
          <li>外部ブラウザで開いたら、再度ログインをお試しください</li>
        </ol>
      </div>

      {showCurrentStatus && isInApp && (
        <div className="mb-6 rounded-md bg-blue-50 px-4 py-3">
          <p className="text-xs text-blue-800">
            <strong>現在、インアプリブラウザで表示されています。</strong>
            <br />
            上記の手順で外部ブラウザに切り替えてください。
          </p>
        </div>
      )}
    </>
  )
}

