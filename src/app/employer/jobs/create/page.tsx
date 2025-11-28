import { redirect } from 'next/navigation'
import Link from 'next/link'
import { requireEmployerAuth } from '@/lib/auth/employer-auth'
import { CreateJobForm } from './CreateJobForm'

export default async function CreateJobPage() {
  try {
    await requireEmployerAuth()
  } catch (error) {
    redirect('/employer/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <Link
          href="/employer/jobs"
          className="text-blue-600 hover:text-blue-800 mb-6 inline-block"
        >
          ← 求人管理に戻る
        </Link>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">求人情報を入力</h1>
          <CreateJobForm />
        </div>
      </div>
    </div>
  )
}

