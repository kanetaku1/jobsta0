'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { updateJob, deleteJob } from '@/lib/actions/jobs'
import { useToast } from '@/components/ui/use-toast'
import { validateEditJobForm } from '@/lib/utils/job-form-validation'
import { FileUploader } from '@/components/jobs/FileUploader'
import { 
  JobCategory, 
  CompensationType, 
  JOB_CATEGORY_LABELS, 
  COMPENSATION_TYPE_LABELS,
  CATEGORY_COMPENSATION_TYPES 
} from '@/types/job'
import type { Job } from '@/lib/utils/getData'

type EditJobFormProps = {
  job: Job
}

type UploadedFile = {
  url: string
  fileName: string
  fileType: 'pdf' | 'image'
  fileSize: number
}

export function EditJobForm({ job }: EditJobFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [hasDraft, setHasDraft] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')

  const DRAFT_STORAGE_KEY = `jobsta_edit_job_draft_${job.id}`

  // 初期ファイル
  const initialFiles: UploadedFile[] = job.attachment_urls
    ? JSON.parse(job.attachment_urls).map((url: string) => ({
        url,
        fileName: url.split('/').pop() || 'file',
        fileType: url.toLowerCase().endsWith('.pdf') ? 'pdf' : 'image',
        fileSize: 0
      }))
    : []

  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>(initialFiles)

  const initialFormData = {
    category: (job.category as JobCategory) || JobCategory.ONE_TIME_JOB,
    title: job.title || '',
    summary: job.summary || '',
    companyName: job.company_name || '',
    workHours: job.work_hours || '',
    compensationType: (job.compensation_type as CompensationType) || CompensationType.HOURLY,
    compensationAmount: job.compensation_amount?.toString() || '',
    location: job.location || '',
    recruitmentCount: job.recruitment_count?.toString() || '',
    jobContent: job.job_content || '',
    requirements: job.requirements || '',
    applicationDeadline: job.application_deadline
      ? new Date(job.application_deadline).toISOString().slice(0, 16)
      : '',
    notes: job.notes || '',
    transportFee: job.transport_fee?.toString() || '',
    date: job.job_date ? new Date(job.job_date).toISOString().split('T')[0] : '',
    startDate: job.start_date ? new Date(job.start_date).toISOString().split('T')[0] : '',
    endDate: job.end_date ? new Date(job.end_date).toISOString().split('T')[0] : '',
    isFlexibleSchedule: job.is_flexible_schedule || false,
    externalUrl: job.external_url || '',
    externalUrlTitle: job.external_url_title || '',
  }

  const [formData, setFormData] = useState(initialFormData)

  // 初回マウント時に下書きを読み込む
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY)
      if (savedDraft) {
        try {
          const parsed = JSON.parse(savedDraft)
          setFormData(parsed.formData)
          setUploadedFiles(parsed.uploadedFiles || initialFiles)
          setHasDraft(true)
          toast({
            title: '下書きを復元しました',
            description: '前回の編集内容を読み込みました',
          })
        } catch (error) {
          console.error('Failed to load draft:', error)
        }
      }
    }
  }, [])

  // フォームデータが変更されたら自動保存 & 変更検知
  useEffect(() => {
    // 初期値と異なる場合は変更フラグを立てる
    const hasChanged = 
      formData.title !== initialFormData.title ||
      formData.summary !== initialFormData.summary ||
      formData.companyName !== initialFormData.companyName ||
      formData.jobContent !== initialFormData.jobContent ||
      formData.location !== initialFormData.location ||
      formData.workHours !== initialFormData.workHours ||
      formData.compensationAmount !== initialFormData.compensationAmount ||
      formData.recruitmentCount !== initialFormData.recruitmentCount
    
    setHasUnsavedChanges(hasChanged)

    if (typeof window !== 'undefined' && hasChanged) {
      setSaveStatus('saving')
      const timer = setTimeout(() => {
        const draft = {
          formData,
          uploadedFiles,
          savedAt: new Date().toISOString(),
        }
        localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft))
        setSaveStatus('saved')
        
        // 「保存済み」表示を2秒後に消す
        setTimeout(() => setSaveStatus('idle'), 2000)
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [formData, uploadedFiles, DRAFT_STORAGE_KEY])

  // ページ離脱時の警告
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges && !loading && !deleting) {
        e.preventDefault()
        e.returnValue = ''
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [hasUnsavedChanges, loading, deleting])

  // 下書きをクリア
  const clearDraft = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(DRAFT_STORAGE_KEY)
      setHasDraft(false)
      setHasUnsavedChanges(false)
    }
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleCategoryChange = (value: string) => {
    const newCategory = value as JobCategory
    const defaultCompensationType = CATEGORY_COMPENSATION_TYPES[newCategory][0]
    setFormData((prev) => ({ 
      ...prev, 
      category: newCategory,
      compensationType: defaultCompensationType
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // バリデーション用データ
      const validationData = {
        category: formData.category,
        title: formData.title,
        summary: formData.summary,
        companyName: formData.companyName,
        workHours: formData.workHours,
        compensationType: formData.compensationType,
        compensationAmount: formData.compensationAmount,
        location: formData.location,
        recruitmentCount: formData.recruitmentCount,
        jobContent: formData.jobContent,
        requirements: formData.requirements,
        applicationDeadline: formData.applicationDeadline,
        notes: formData.notes,
        transportFee: formData.transportFee,
        date: formData.date,
        startDate: formData.startDate,
        endDate: formData.endDate,
        isFlexibleSchedule: formData.isFlexibleSchedule,
        externalUrl: formData.externalUrl,
        externalUrlTitle: formData.externalUrlTitle,
      }

      const validationResult = validateEditJobForm(validationData)
      if (!validationResult.isValid) {
        throw new Error(validationResult.error)
      }

      // 更新データ
      const updateJobData: any = {
        category: formData.category,
        title: formData.title.trim(),
        summary: formData.summary.trim(),
        companyName: formData.companyName.trim(),
        location: formData.location.trim(),
        recruitmentCount: Number(formData.recruitmentCount),
        jobContent: formData.jobContent.trim(),
        compensationType: formData.compensationType,
        workHours: formData.workHours.trim(),
        requirements: formData.requirements.trim() || undefined,
        applicationDeadline: formData.applicationDeadline || undefined,
        notes: formData.notes.trim() || undefined,
        transportFee: formData.transportFee ? Number(formData.transportFee) : undefined,
        externalUrl: formData.externalUrl.trim() || undefined,
        externalUrlTitle: formData.externalUrlTitle.trim() || undefined,
        attachmentUrls: uploadedFiles.map(f => f.url),
      }

      // 報酬額（無給以外の場合）
      if (formData.compensationType !== CompensationType.NONE) {
        updateJobData.compensationAmount = Number(formData.compensationAmount)
      }

      // カテゴリに応じた日付
      if (formData.category === JobCategory.ONE_TIME_JOB || formData.category === JobCategory.VOLUNTEER) {
        updateJobData.date = formData.date
      } else {
        updateJobData.startDate = formData.startDate
        updateJobData.endDate = formData.endDate || undefined
        updateJobData.isFlexibleSchedule = formData.isFlexibleSchedule
      }

      const result = await updateJob(job.id, updateJobData)

      if (result.success) {
        // 更新成功時に下書きをクリア & 変更フラグをリセット
        clearDraft()
        toast({
          title: '求人を更新しました',
          description: '求人情報を更新しました',
        })
        // 離脱警告を無効化してからリダイレクト
        setHasUnsavedChanges(false)
        setTimeout(() => {
          router.push('/employer/jobs')
        }, 100)
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
        // 削除成功時に下書きをクリア & 変更フラグをリセット
        clearDraft()
        toast({
          title: '求人を削除しました',
          description: '求人を削除しました',
        })
        // 離脱警告を無効化してからリダイレクト
        setHasUnsavedChanges(false)
        setTimeout(() => {
          router.push('/employer/jobs')
        }, 100)
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

  const availableCompensationTypes = CATEGORY_COMPENSATION_TYPES[formData.category]

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 自動保存ステータス */}
      {hasUnsavedChanges && (
        <div className="fixed top-4 right-4 z-50 bg-white shadow-lg rounded-lg px-4 py-2 border border-gray-200 flex items-center gap-2">
          {saveStatus === 'saving' && (
            <>
              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-700">保存中...</span>
            </>
          )}
          {saveStatus === 'saved' && (
            <>
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-700">✓ 保存済み</span>
            </>
          )}
        </div>
      )}

      {/* 下書き復元通知 */}
      {hasDraft && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-blue-900 mb-1">💾 下書きから復元しました</h3>
            <p className="text-sm text-blue-800">
              前回の編集内容を読み込みました。このフォームは自動保存されます。
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              if (confirm('下書きをクリアして元のデータに戻しますか？')) {
                clearDraft()
                window.location.reload()
              }
            }}
            className="text-blue-700 hover:text-blue-900"
          >
            クリア
          </Button>
        </div>
      )}

      {/* カテゴリ選択 */}
      <div>
        <Label htmlFor="category" className="text-base font-semibold">
          求人カテゴリ <span className="text-red-500">*</span>
        </Label>
        <Select value={formData.category} onValueChange={handleCategoryChange}>
          <SelectTrigger className="mt-2">
            <SelectValue placeholder="カテゴリを選択" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(JOB_CATEGORY_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

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

      {/* サマリー */}
      <div>
        <Label htmlFor="summary" className="text-base font-semibold">
          サマリー（100〜200文字） <span className="text-red-500">*</span>
        </Label>
        <textarea
          id="summary"
          value={formData.summary}
          onChange={(e) => handleInputChange('summary', e.target.value)}
          placeholder="求人の要約を100〜200文字で入力してください"
          required
          rows={3}
          className="mt-2 flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
        <p className="mt-1 text-xs text-gray-500">
          {formData.summary.length}/200文字
        </p>
      </div>

      {/* 日付（カテゴリ別） */}
      {(formData.category === JobCategory.ONE_TIME_JOB || formData.category === JobCategory.VOLUNTEER) && (
        <div>
          <Label htmlFor="date" className="text-base font-semibold">
            {formData.category === JobCategory.VOLUNTEER ? '活動日' : '勤務日'}{' '}
            <span className="text-red-500">*</span>
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
      )}

      {/* 開始日・終了日（長期/インターン） */}
      {(formData.category === JobCategory.PART_TIME || formData.category === JobCategory.INTERNSHIP) && (
        <>
          <div>
            <Label htmlFor="startDate" className="text-base font-semibold">
              勤務開始日 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="startDate"
              type="date"
              value={formData.startDate}
              onChange={(e) => handleInputChange('startDate', e.target.value)}
              required
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="endDate" className="text-base font-semibold">
              勤務終了日 {formData.category === JobCategory.INTERNSHIP && <span className="text-red-500">*</span>}
            </Label>
            <Input
              id="endDate"
              type="date"
              value={formData.endDate}
              onChange={(e) => handleInputChange('endDate', e.target.value)}
              required={formData.category === JobCategory.INTERNSHIP}
              className="mt-2"
            />
          </div>

          {formData.category === JobCategory.PART_TIME && (
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isFlexibleSchedule"
                checked={formData.isFlexibleSchedule}
                onChange={(e) => handleInputChange('isFlexibleSchedule', e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="isFlexibleSchedule" className="text-sm font-normal">
                シフトは柔軟に調整可能
              </Label>
            </div>
          )}
        </>
      )}

      {/* 勤務時間 */}
      <div>
        <Label htmlFor="workHours" className="text-base font-semibold">
          {formData.category === JobCategory.VOLUNTEER ? '活動時間' : '勤務時間'}{' '}
          <span className="text-red-500">*</span>
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

      {/* 報酬形式 */}
      <div>
        <Label htmlFor="compensationType" className="text-base font-semibold">
          報酬形式 <span className="text-red-500">*</span>
        </Label>
        <Select 
          value={formData.compensationType} 
          onValueChange={(value) => handleInputChange('compensationType', value)}
        >
          <SelectTrigger className="mt-2">
            <SelectValue placeholder="報酬形式を選択" />
          </SelectTrigger>
          <SelectContent>
            {availableCompensationTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {COMPENSATION_TYPE_LABELS[type]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 報酬額（無給以外） */}
      {formData.compensationType !== CompensationType.NONE && (
        <div>
          <Label htmlFor="compensationAmount" className="text-base font-semibold">
            報酬額（円） <span className="text-red-500">*</span>
          </Label>
          <Input
            id="compensationAmount"
            type="number"
            min="0"
            value={formData.compensationAmount}
            onChange={(e) => handleInputChange('compensationAmount', e.target.value)}
            placeholder="例：1200"
            required
            className="mt-2"
          />
        </div>
      )}

      {/* 勤務地 */}
      <div>
        <Label htmlFor="location" className="text-base font-semibold">
          {formData.category === JobCategory.VOLUNTEER ? '活動場所' : '勤務地'}{' '}
          <span className="text-red-500">*</span>
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
          {formData.category === JobCategory.VOLUNTEER ? '活動内容' : '業務内容'}{' '}
          <span className="text-red-500">*</span>
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

      {/* 外部リンク */}
      <div>
        <Label htmlFor="externalUrl" className="text-base font-semibold">
          外部求人ページURL（任意）
        </Label>
        <Input
          id="externalUrl"
          type="url"
          value={formData.externalUrl}
          onChange={(e) => handleInputChange('externalUrl', e.target.value)}
          placeholder="https://example.com/job"
          className="mt-2"
        />
        {formData.externalUrl && (
          <div className="mt-2">
            <Label htmlFor="externalUrlTitle" className="text-sm font-medium">
              リンクのタイトル <span className="text-red-500">*</span>
            </Label>
            <Input
              id="externalUrlTitle"
              type="text"
              value={formData.externalUrlTitle}
              onChange={(e) => handleInputChange('externalUrlTitle', e.target.value)}
              placeholder="例：詳細はこちら"
              required={!!formData.externalUrl}
              className="mt-1"
            />
          </div>
        )}
      </div>

      {/* ファイルアップロード */}
      <div>
        <Label className="text-base font-semibold">
          添付ファイル（任意）
        </Label>
        <p className="text-xs text-gray-500 mt-1 mb-2">
          求人票のPDFや画像を添付できます（最大5件、各5MB）
        </p>
        <FileUploader onFilesChange={setUploadedFiles} initialFiles={uploadedFiles} />
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
