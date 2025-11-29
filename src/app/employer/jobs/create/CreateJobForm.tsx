'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createJob } from '@/lib/actions/jobs'
import { useToast } from '@/components/ui/use-toast'
import { validateCreateJobForm } from '@/lib/utils/job-form-validation'

export function CreateJobForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [dates, setDates] = useState<string[]>([''])

  const [formData, setFormData] = useState({
    title: '',
    job_date: '',
    companyName: '',
    workHours: '',
    hourlyWage: '',
    location: '',
    recruitmentCount: '',
    jobContent: '',
    requirements: '',
    applicationDeadline: '',
    notes: '',
    transportFee: '',
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleDateChange = (index: number, value: string) => {
    const newDates = [...dates]
    newDates[index] = value
    setDates(newDates)
  }

  const addDateField = () => {
    setDates([...dates, ''])
  }

  const removeDateField = (index: number) => {
    if (dates.length > 1) {
      const newDates = dates.filter((_, i) => i !== index)
      setDates(newDates)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // バリデーション
      const validDates = dates.filter((date) => date.trim() !== '')
      const validationResult = validateCreateJobForm({
        ...formData,
        dates: validDates,
      })

      if (!validationResult.isValid) {
        throw new Error(validationResult.error)
      }

      const result = await createJob({
        title: formData.title.trim(),
        companyName: formData.companyName.trim(),
        dates: validDates,
        workHours: formData.workHours.trim(),
        hourlyWage: Number(formData.hourlyWage),
        location: formData.location.trim(),
        recruitmentCount: Number(formData.recruitmentCount),
        jobContent: formData.jobContent.trim(),
        requirements: formData.requirements.trim() || undefined,
        applicationDeadline: formData.applicationDeadline.trim() || undefined,
        notes: formData.notes.trim() || undefined,
        transportFee: formData.transportFee ? Number(formData.transportFee) : undefined,
      })

      if (result.success && result.jobs.length > 0) {
        toast({
          title: '求人を作成しました',
          description: `${result.jobs.length}件の求人を作成しました`,
        })
        router.push('/employer/jobs')
      } else {
        throw new Error((result as any).error || '求人の作成に失敗しました')
      }
    } catch (error) {
      toast({
        title: 'エラー',
        description: error instanceof Error ? error.message : '求人の作成に失敗しました',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
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

      {/* 求人のタイトル */}
      <div>
        <Label htmlFor="title" className="text-base font-semibold">
          求人のタイトル <span className="text-red-500">*</span>
        </Label>
        <Input
          id="title"
          type="text"
          value={formData.title}
          onChange={(e) => handleInputChange('title', e.target.value)}
          placeholder="例：〇〇の求人"
          required
          className="mt-2"
        />
      </div>

      {/* 日付（複数選択） */}
      <div>
        <Label className="text-base font-semibold">
          勤務日 <span className="text-red-500">*</span>
        </Label>
        <div className="mt-2 space-y-2">
          {dates.map((date, index) => (
            <div key={index} className="flex gap-2">
              <Input
                type="date"
                value={date}
                onChange={(e) => handleDateChange(index, e.target.value)}
                required={index === 0}
                className="flex-1"
              />
              {dates.length > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => removeDateField(index)}
                  className="px-4"
                >
                  削除
                </Button>
              )}
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={addDateField}
            className="w-full"
          >
            + 日付を追加
          </Button>
        </div>
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
          placeholder="例：9:00～18:00 (昼休憩60分)"
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

      <div className="pt-6 border-t border-gray-200">
        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-6 text-lg font-semibold disabled:opacity-50"
        >
          {loading ? '作成中...' : '求人を作成'}
        </Button>
      </div>
    </form>
  )
}

