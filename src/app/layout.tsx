import { Header } from '@/components/common/Header'
import '@/styles/globals.css'
import { ReactNode } from 'react'
import { Providers } from '@/components/common/Providers'

export const metadata = {
  title: 'Jobsta - 友達と応募できる短期バイトマッチングアプリ',
  description: '友達と応募できる短期バイトマッチングアプリ',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body className="bg-gray-50 text-gray-900" suppressHydrationWarning>
        <Providers>
          <Header />
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  )
}