/*
 * ファイルパス: src/app/layout.tsx
 * 役割: ルートレイアウト。ヘッダーを組み込む
 */
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Header from '@/components/Header'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Jobsta - 友達と一緒に働けるソーシャルバイト',
  description: 'Jobstaは、友達と一緒に短期バイトに応募できる新しいマッチングアプリです。',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body className={inter.className}>
        <div className="flex flex-col min-h-screen bg-gray-50">
          <Header />
          <main className="flex-grow">
            {children}
          </main>
          <footer className="text-center p-4 text-gray-500 text-sm">
            © 2025 Jobsta
          </footer>
        </div>
      </body>
    </html>
  )
}
