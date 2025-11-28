import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { requireEmployerAuth } from '@/lib/auth/employer-auth'
import { getJob, getJobApplications } from '@/lib/actions/jobs'
import { Badge } from '@/components/ui/badge'

export default async function EmployerJobDetailPage({
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
  if ((job as any).employer_id !== employer.id) {
    redirect('/employer/jobs')
  }

  const applications = await getJobApplications(id)

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <Link
          href="/employer/jobs"
          className="text-blue-600 hover:text-blue-800 mb-6 inline-block"
        >
          ← 求人管理に戻る
        </Link>

        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">
            {job.title || 'タイトルなし'}
          </h1>

          <div className="space-y-4 mb-6">
            {job.company_name && (
              <div className="flex items-start">
                <span className="font-semibold text-gray-700 w-32">会社名・店舗名:</span>
                <span className="text-gray-600">{job.company_name}</span>
              </div>
            )}

            {job.location && (
              <div className="flex items-start">
                <span className="font-semibold text-gray-700 w-32">勤務地:</span>
                <span className="text-gray-600">{job.location}</span>
              </div>
            )}

            {job.job_date && (
              <div className="flex items-start">
                <span className="font-semibold text-gray-700 w-32">勤務日:</span>
                <span className="text-gray-600">
                  {new Date(job.job_date).toLocaleDateString('ja-JP', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
            )}

            {job.work_hours && (
              <div className="flex items-start">
                <span className="font-semibold text-gray-700 w-32">勤務時間:</span>
                <span className="text-gray-600">{job.work_hours}</span>
              </div>
            )}

            {job.wage_amount && (
              <div className="flex items-start">
                <span className="font-semibold text-gray-700 w-32">時給:</span>
                <span className="text-blue-600 font-bold text-xl">
                  {job.wage_amount.toLocaleString()}円
                </span>
              </div>
            )}

            {job.recruitment_count && (
              <div className="flex items-start">
                <span className="font-semibold text-gray-700 w-32">募集人数:</span>
                <span className="text-gray-600">{job.recruitment_count}名</span>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-gray-200">
            <Link href={`/employer/jobs/${id}/edit`}>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                求人を編集
              </button>
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            応募者一覧 ({applications.length}名)
          </h2>

          {applications.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">まだ応募がありません</p>
            </div>
          ) : (
            <div className="space-y-6">
              {applications.map((app) => (
                <div
                  key={app.id}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-1">
                        {app.applicant.name}
                      </h3>
                      {app.applicant.email && (
                        <p className="text-sm text-gray-600">{app.applicant.email}</p>
                      )}
                    </div>
                    <Badge
                      variant={
                        app.status === 'APPROVED'
                          ? 'default'
                          : app.status === 'REJECTED'
                          ? 'destructive'
                          : 'secondary'
                      }
                    >
                      {app.status === 'PENDING'
                        ? '審査中'
                        : app.status === 'APPROVED'
                        ? '承認'
                        : app.status === 'REJECTED'
                        ? '却下'
                        : '完了'}
                    </Badge>
                  </div>

                  {app.group && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-sm font-semibold text-gray-700 mb-2">
                        グループ: {app.group.ownerName}のグループ
                      </p>
                      <div className="space-y-2">
                        {app.group.members.map((member) => (
                          <div
                            key={member.id}
                            className="flex items-center justify-between text-sm bg-gray-50 p-2 rounded"
                          >
                            <span className="text-gray-700">
                              {member.user
                                ? member.user.name
                                : member.name || '不明'}
                            </span>
                            <Badge
                              variant={
                                member.status === 'APPROVED'
                                  ? 'default'
                                  : member.status === 'REJECTED'
                                  ? 'destructive'
                                  : 'secondary'
                              }
                              className="text-xs"
                            >
                              {member.status === 'PENDING'
                                ? '承認待ち'
                                : member.status === 'APPROVED'
                                ? '承認済み'
                                : '辞退'}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <p className="text-xs text-gray-500 mt-4">
                    応募日時: {new Date(app.created_at).toLocaleString('ja-JP')}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

