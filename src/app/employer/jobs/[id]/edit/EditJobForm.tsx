'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updateJob, deleteJob } from '@/lib/actions/jobs'
import { useToast } from '@/components/ui/use-toast'
import { validateEditJobForm } from '@/lib/utils/job-form-validation'

import type { Job } from '@/lib/utils/getData'

type EditJobFormJob = {
  id: string
  title: string | null
  job_date: string | null
  company_name: string | null
  work_hours: string | null
  wage_amount: number | null
  location: string | null
  recruitment_count: number | null
  job_content: string | null
  requirements: string | null
  application_deadline: string | null
  notes: string | null
  transport_fee: number | null
}

type EditJobFormProps = {
  job: Job
}

function transformJobForEditForm(job: Job): EditJobFormJob {
  return {
    id: job.id,
    title: job.title,
    job_date: job.job_date,
    company_name: job.company_name,
    work_hours: job.work_hours,
    wage_amount: job.wage_amount,
    location: job.location,
    recruitment_count: job.recruitment_count,
    job_content: job.job_content,
    requirements: job.requirements,
    application_deadline: job.application_deadline,
    notes: job.notes,
    transport_fee: job.transport_fee,
  }
}

export function EditJobForm({ job }: EditJobFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const transformedJob = transformJobForEditForm(job)
  const [formData, setFormData] = useState({
    title: transformedJob.title || '',
    companyName: transformedJob.company_name || '',
    workHours: transformedJob.work_hours || '',
    hourlyWage: transformedJob.wage_amount?.toString() || '',
    location: transformedJob.location || '',
    recruitmentCount: transformedJob.recruitment_count?.toString() || '',
    jobContent: transformedJob.job_content || '',
    requirements: transformedJob.requirements || '',
    applicationDeadline: transformedJob.application_deadline
      ? new Date(transformedJob.application_deadline).toISOString().slice(0, 16)
      : '',
    notes: transformedJob.notes || '',
    transportFee: transformedJob.transport_fee?.toString() || '',
    date: transformedJob.job_date ? new Date(transformedJob.job_date).toISOString().split('T')[0] : '',
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // バリデーション
      const validationResult = validateEditJobForm({
        ...formData,
        date: formData.date,
      })

      if (!validationResult.isValid) {
        throw new Error(validationResult.error)
      }

      const result = await updateJob(job.id, {
        title: formData.title.trim(),
        companyName: formData.companyName.trim(),
        date: formData.date,
        location: formData.location.trim(),
        workHours: formData.workHours.trim(),
        hourlyWage: Number(formData.hourlyWage),
        recruitmentCount: Number(formData.recruitmentCount),
        jobContent: formData.jobContent.trim(),
        requirements: formData.requirements.trim() || undefined,
        applicationDeadline: formData.applicationDeadline || undefined,
        notes: formData.notes.trim() || undefined,
        transportFee: formData.transportFee ? Number(formData.transportFee) : undefined,
      })

      if (result.success) {
        toast({
          title: '求人を更新しました',
          description: '求人情報を更新しました',
        })
        router.push('/employer/jobs')
      } else {
        throw new Error('error' in result ? result.error : '求人の更新に失敗しました')
      }
    } catch (error) {
      toast({
        title: 'エラー',
        description: error instanceof Error ? error.message : '求人の更新に失敗しました',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('本当にこの求人を削除しますか？この操作は取り消せません。')) {
      return
    }

    setDeleting(true)

    try {
      const result = await deleteJob(job.id)

      if (result.success) {
        toast({
          title: '求人を削除しました',
          description: '求人を削除しました',
        })
        router.push('/employer/jobs')
      } else {
        throw new Error('error' in result ? result.error : '求人の削除に失敗しました')
      }
    } catch (error) {
      toast({
        title: 'エラー',
        description: error instanceof Error ? error.message : '求人の削除に失敗しました',
        variant: 'destructive',
      })
    } finally {
      setDeleting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 会社名・店舗名 */}
      <div>
        <Label htmlFor="companyName" className="text-base font-semibold">
          会社名・店舗名 <span className="text-red-500">*</span>
        </Label>
        <Input
          id="companyName"
          type="text"
          value={formData.companyName}
          onChange={(e) => handleInputChange('companyName', e.target.value)}
          placeholder="例：株式会社〇〇"
          required
          className="mt-2"
        />
      </div>

      {/* 求人名 */}
      <div>
        <Label htmlFor="title" className="text-base font-semibold">
          求人名 <span className="text-red-500">*</span>
        </Label>
        <Input
          id="title"
          type="text"
          value={formData.title}
          onChange={(e) => handleInputChange('title', e.target.value)}
          placeholder="例：バイトスタッフ"
          required
          className="mt-2"
        />
      </div>

      {/* 日付 */}
      <div>
        <Label htmlFor="date" className="text-base font-semibold">
          勤務日 <span className="text-red-500">*</span>
        </Label>
        <Input
          id="date"
          type="date"
          value={formData.date}
          onChange={(e) => handleInputChange('date', e.target.value)}
          required
          className="mt-2"
        />
      </div>

      {/* 勤務時間 */}
      <div>
        <Label htmlFor="workHours" className="text-base font-semibold">
          勤務時間 <span className="text-red-500">*</span>
        </Label>
        <Input
          id="workHours"
          type="text"
          value={formData.workHours}
          onChange={(e) => handleInputChange('workHours', e.target.value)}
          placeholder="例：9:00～18:00 (昼60分休憩)"
          required
          className="mt-2"
        />
      </div>

      {/* 時給 */}
      <div>
        <Label htmlFor="hourlyWage" className="text-base font-semibold">
          時給（円） <span className="text-red-500">*</span>
        </Label>
        <Input
          id="hourlyWage"
          type="number"
          min="0"
          value={formData.hourlyWage}
          onChange={(e) => handleInputChange('hourlyWage', e.target.value)}
          placeholder="例：1200"
          required
          className="mt-2"
        />
      </div>

      {/* 勤務地 */}
      <div>
        <Label htmlFor="location" className="text-base font-semibold">
          勤務地 <span className="text-red-500">*</span>
        </Label>
        <Input
          id="location"
          type="text"
          value={formData.location}
          onChange={(e) => handleInputChange('location', e.target.value)}
          placeholder="例：〇〇市〇〇区〇〇1-2-3"
          required
          className="mt-2"
        />
      </div>

      {/* 募集人数 */}
      <div>
        <Label htmlFor="recruitmentCount" className="text-base font-semibold">
          募集人数 <span className="text-red-500">*</span>
        </Label>
        <Input
          id="recruitmentCount"
          type="number"
          min="1"
          value={formData.recruitmentCount}
          onChange={(e) => handleInputChange('recruitmentCount', e.target.value)}
          placeholder="例：2"
          required
          className="mt-2"
        />
      </div>

      {/* 業務内容 */}
      <div>
        <Label htmlFor="jobContent" className="text-base font-semibold">
          業務内容 <span className="text-red-500">*</span>
        </Label>
        <textarea
          id="jobContent"
          value={formData.jobContent}
          onChange={(e) => handleInputChange('jobContent', e.target.value)}
          placeholder="例：〇〇の作業など"
          required
          rows={4}
          className="mt-2 flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>

      {/* 応募資格・条件 */}
      <div>
        <Label htmlFor="requirements" className="text-base font-semibold">
          応募資格・条件
        </Label>
        <textarea
          id="requirements"
          value={formData.requirements}
          onChange={(e) => handleInputChange('requirements', e.target.value)}
          placeholder="例：未経験者歓迎"
          rows={3}
          className="mt-2 flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>

      {/* 応募締め切り */}
      <div>
        <Label htmlFor="applicationDeadline" className="text-base font-semibold">
          応募締め切り
        </Label>
        <Input
          id="applicationDeadline"
          type="datetime-local"
          value={formData.applicationDeadline}
          onChange={(e) => handleInputChange('applicationDeadline', e.target.value)}
          className="mt-2"
        />
      </div>

      {/* 交通費 */}
      <div>
        <Label htmlFor="transportFee" className="text-base font-semibold">
          交通費（円）
        </Label>
        <Input
          id="transportFee"
          type="number"
          min="0"
          value={formData.transportFee}
          onChange={(e) => handleInputChange('transportFee', e.target.value)}
          placeholder="例：1000"
          className="mt-2"
        />
      </div>

      {/* 備考 */}
      <div>
        <Label htmlFor="notes" className="text-base font-semibold">
          備考
        </Label>
        <textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => handleInputChange('notes', e.target.value)}
          placeholder="例：作業服貸与　可能であれば安全靴のご用意をお願いします"
          rows={3}
          className="mt-2 flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>

      <div className="pt-6 border-t border-gray-200 flex gap-4">
        <Button
          type="submit"
          disabled={loading}
          className="flex-1 bg-blue-600 text-white py-6 text-lg font-semibold disabled:opacity-50"
        >
          {loading ? '更新中...' : '求人を更新'}
        </Button>
        <Button
          type="button"
          variant="destructive"
          onClick={handleDelete}
          disabled={deleting}
          className="px-6 py-6 text-lg font-semibold disabled:opacity-50"
        >
          {deleting ? '削除中...' : '削除'}
        </Button>
      </div>
    </form>
  )
}

