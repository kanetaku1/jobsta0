import { Header } from '@/components/common'
import { ToastProvider } from '@/components/ui/use-toast'
import { AuthProvider } from '@/contexts/AuthContext'
import '@/styles/globals.css'
import { ReactNode } from 'react'

export const metadata = {
  title: 'Jobsta',
  description: '友達と応募できる短期バイトマッチングアプリ',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body className="bg-gray-50 text-gray-900" suppressHydrationWarning>
        <AuthProvider>
          <ToastProvider>
            <Header />
            <main className="max-w-4xl mx-auto p-4">{children}</main>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
