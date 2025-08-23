import { Header } from '@/components/common'
import '@/styles/globals.css'
import { ReactNode } from 'react'

export const metadata = {
  title: 'Jobsta',
  description: '友達と応募できる短期バイトマッチングアプリ',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ja">
      <body className="bg-gray-50 text-gray-900">
        <Header />
        <main className="max-w-4xl mx-auto p-4">{children}</main>
      </body>
    </html>
  );
}
