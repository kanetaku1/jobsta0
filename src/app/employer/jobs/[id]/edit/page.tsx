import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { requireEmployerAuth } from '@/lib/auth/employer-auth'
import { getJob, updateJob, deleteJob } from '@/lib/actions/jobs'
import { EditJobForm } from './EditJobForm'

export default async function EditJobPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  let employer
  try {
    employer = await requireEmployerAuth()
  } catch (error) {
    redirect('/employer/login')
  }

  const { id } = await params
  const job = await getJob(id)

  if (!job) {
    notFound()
  }

  // 自分の求人か確認
  if (job.employer_id !== employer.id) {
    redirect('/employer/jobs')
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
          <h1 className="text-3xl font-bold text-gray-800 mb-6">求人情報を編集</h1>
          <EditJobForm job={job} />
        </div>
      </div>
    </div>
  )
}

