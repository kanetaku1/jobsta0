'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createJob } from '@/lib/actions/jobs'
import { useToast } from '@/components/ui/use-toast'
import { validateCreateJobForm } from '@/lib/utils/job-form-validation'
import { FileUploader } from '@/components/jobs/FileUploader'
import { 
  JobCategory, 
  CompensationType, 
  JOB_CATEGORY_LABELS, 
  COMPENSATION_TYPE_LABELS,
  CATEGORY_COMPENSATION_TYPES 
} from '@/types/job'

type UploadedFile = {
  url: string
  fileName: string
  fileType: 'pdf' | 'image'
  fileSize: number
}

const DRAFT_STORAGE_KEY = 'jobsta_create_job_draft'

export function CreateJobForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [dates, setDates] = useState<string[]>([''])
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [hasDraft, setHasDraft] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const [formData, setFormData] = useState({
    category: JobCategory.ONE_TIME_JOB,
    title: '',
    summary: '',
    companyName: '',
    workHours: '',
    compensationType: CompensationType.HOURLY,
    compensationAmount: '',
    location: '',
    recruitmentCount: '',
    jobContent: '',
    requirements: '',
    applicationDeadline: '',
    notes: '',
    transportFee: '',
    startDate: '',
    endDate: '',
    isFlexibleSchedule: false,
    externalUrl: '',
    externalUrlTitle: '',
  })

  // 初回マウント時に下書きを読み込む
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY)
      if (savedDraft) {
        try {
          const parsed = JSON.parse(savedDraft)
          setFormData(parsed.formData)
          setDates(parsed.dates || [''])
          setUploadedFiles(parsed.uploadedFiles || [])
          setHasDraft(true)
          toast({
            title: '下書きを復元しました',
            description: '前回の入力内容を読み込みました',
          })
        } catch (error) {
          console.error('Failed to load draft:', error)
        }
      }
    }
  }, [])

  // フォームデータが変更されたら自動保存 & 変更フラグを立てる
  useEffect(() => {
    // 何か入力されている場合は変更フラグを立てる
    const hasContent = !!(formData.title || formData.summary || formData.companyName || 
                       formData.jobContent || formData.location)
    setHasUnsavedChanges(hasContent)

    if (typeof window !== 'undefined' && hasContent) {
      setSaveStatus('saving')
      const timer = setTimeout(() => {
        const draft = {
          formData,
          dates,
          uploadedFiles,
          savedAt: new Date().toISOString(),
        }
        localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft))
        setSaveStatus('saved')
        
        // 「保存済み」表示を2秒後に消す
        setTimeout(() => setSaveStatus('idle'), 2000)
      }, 1000) // 1秒後に保存（入力中の負荷を軽減）

      return () => clearTimeout(timer)
    }
  }, [formData, dates, uploadedFiles])

  // ページ離脱時の警告（ブラウザの標準ダイアログ）
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges && !loading) {
        e.preventDefault()
        e.returnValue = '' // Chrome requires returnValue to be set
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [hasUnsavedChanges, loading])

  // Next.js Router のページ遷移時の警告
  useEffect(() => {
    const handleRouteChange = () => {
      if (hasUnsavedChanges && !loading) {
        const confirmLeave = window.confirm(
          '入力中の内容が保存されていません。\n下書きとして自動保存されていますが、このページを離れてもよろしいですか？'
        )
        if (!confirmLeave) {
          throw 'Route change aborted by user'
        }
      }
    }

    // Note: Next.js App Router では router events が異なるため、
    // beforeunload イベントで対応します
    // 将来的に navigation API を使用することも検討

    return () => {
      // cleanup
    }
  }, [hasUnsavedChanges, loading])

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  // 下書きをクリア
  const clearDraft = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(DRAFT_STORAGE_KEY)
      setHasDraft(false)
      setHasUnsavedChanges(false)
    }
  }

  const handleCategoryChange = (value: string) => {
    const newCategory = value as JobCategory
    // カテゴリ変更時、報酬形式をデフォルトに設定
    const defaultCompensationType = CATEGORY_COMPENSATION_TYPES[newCategory][0]
    setFormData((prev) => ({ 
      ...prev, 
      category: newCategory,
      compensationType: defaultCompensationType
    }))
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
      // 日付の準備
      const validDates = dates.filter((date) => date.trim() !== '')
      
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
        dates: validDates,
        startDate: formData.startDate,
        endDate: formData.endDate,
        isFlexibleSchedule: formData.isFlexibleSchedule,
        externalUrl: formData.externalUrl,
        externalUrlTitle: formData.externalUrlTitle,
      }

      const validationResult = validateCreateJobForm(validationData)
      if (!validationResult.isValid) {
        // フィールドエラーをstateに保存
        setFieldErrors(validationResult.fieldErrors || {})
        throw new Error(validationResult.error)
      }
      
      // バリデーション成功時はエラーをクリア
      setFieldErrors({})

      // 求人作成データ
      const createJobData: any = {
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
        applicationDeadline: formData.applicationDeadline.trim() || undefined,
        notes: formData.notes.trim() || undefined,
        transportFee: formData.transportFee ? Number(formData.transportFee) : undefined,
        externalUrl: formData.externalUrl.trim() || undefined,
        externalUrlTitle: formData.externalUrlTitle.trim() || undefined,
        attachmentUrls: uploadedFiles.map(f => f.url),
      }

      // 報酬額（無給以外の場合）
      if (formData.compensationType !== CompensationType.NONE) {
        createJobData.compensationAmount = Number(formData.compensationAmount)
      }

      // カテゴリに応じた日付
      if (formData.category === JobCategory.ONE_TIME_JOB || formData.category === JobCategory.VOLUNTEER) {
        createJobData.dates = validDates
      } else {
        createJobData.startDate = formData.startDate
        createJobData.endDate = formData.endDate || undefined
        createJobData.isFlexibleSchedule = formData.isFlexibleSchedule
      }

      const result = await createJob(createJobData)

      if (result.success && result.jobs.length > 0) {
        // 作成成功時に下書きをクリア & 変更フラグをリセット
        clearDraft()
        toast({
          title: '求人を作成しました',
          description: `${result.jobs.length}件の求人を作成しました`,
        })
        // 離脱警告を無効化してからリダイレクト
        setHasUnsavedChanges(false)
        setTimeout(() => {
          router.push('/employer/jobs')
        }, 100)
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

  // 利用可能な報酬形式
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
              前回の入力内容を読み込みました。このフォームは自動保存されます。
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              if (confirm('下書きをクリアして最初から入力しますか？')) {
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
          className={`mt-2 ${fieldErrors.companyName ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
        />
        {fieldErrors.companyName && (
          <p className="mt-1 text-sm text-red-600">{fieldErrors.companyName}</p>
        )}
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
          placeholder="例：イベントスタッフ募集"
          required
          className={`mt-2 ${fieldErrors.title ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
        />
        {fieldErrors.title && (
          <p className="mt-1 text-sm text-red-600">{fieldErrors.title}</p>
        )}
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
          className={`mt-2 flex w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
            fieldErrors.summary 
              ? 'border-red-500 focus-visible:ring-red-500' 
              : 'border-input focus-visible:ring-ring'
          }`}
        />
        <div className="flex justify-between items-center mt-1">
          <div>
            {fieldErrors.summary && (
              <p className="text-sm text-red-600">{fieldErrors.summary}</p>
            )}
          </div>
          <p className={`text-xs ${formData.summary.length < 100 || formData.summary.length > 200 ? 'text-red-500' : 'text-gray-500'}`}>
            {formData.summary.length}/200文字
          </p>
        </div>
      </div>

      {/* 日付（カテゴリ別） */}
      {(formData.category === JobCategory.ONE_TIME_JOB || formData.category === JobCategory.VOLUNTEER) && (
        <div>
          <Label className="text-base font-semibold">
            {formData.category === JobCategory.VOLUNTEER ? '活動日' : '勤務日'}{' '}
            <span className="text-red-500">*</span>
          </Label>
          <div className="mt-2 space-y-2">
            {dates.map((date, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => handleDateChange(index, e.target.value)}
                  required={index === 0}
                  className={`flex-1 ${fieldErrors.dates && index === 0 ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
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
          {fieldErrors.dates && (
            <p className="mt-1 text-sm text-red-600">{fieldErrors.dates}</p>
          )}
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
              className={`mt-2 ${fieldErrors.startDate ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
            />
            {fieldErrors.startDate && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.startDate}</p>
            )}
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
              className={`mt-2 ${fieldErrors.endDate ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
            />
            {fieldErrors.endDate && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.endDate}</p>
            )}
            {formData.category === JobCategory.PART_TIME && !fieldErrors.endDate && (
              <p className="mt-1 text-xs text-gray-500">
                終了日が未定の場合は空欄可
              </p>
            )}
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
          placeholder="例：9:00～18:00 (昼休憩60分)"
          required
          className={`mt-2 ${fieldErrors.workHours ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
        />
        {fieldErrors.workHours && (
          <p className="mt-1 text-sm text-red-600">{fieldErrors.workHours}</p>
        )}
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
            className={`mt-2 ${fieldErrors.compensationAmount ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
          />
          {fieldErrors.compensationAmount && (
            <p className="mt-1 text-sm text-red-600">{fieldErrors.compensationAmount}</p>
          )}
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
          placeholder="例：東京都渋谷区〇〇1-2-3"
          required
          className={`mt-2 ${fieldErrors.location ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
        />
        {fieldErrors.location && (
          <p className="mt-1 text-sm text-red-600">{fieldErrors.location}</p>
        )}
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
          className={`mt-2 ${fieldErrors.recruitmentCount ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
        />
        {fieldErrors.recruitmentCount && (
          <p className="mt-1 text-sm text-red-600">{fieldErrors.recruitmentCount}</p>
        )}
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
          placeholder="詳細な業務内容を記載してください"
          required
          rows={6}
          className={`mt-2 flex w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
            fieldErrors.jobContent 
              ? 'border-red-500 focus-visible:ring-red-500' 
              : 'border-input focus-visible:ring-ring'
          }`}
        />
        {fieldErrors.jobContent && (
          <p className="mt-1 text-sm text-red-600">{fieldErrors.jobContent}</p>
        )}
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
          className={`mt-2 ${fieldErrors.externalUrl ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
        />
        {fieldErrors.externalUrl && (
          <p className="mt-1 text-sm text-red-600">{fieldErrors.externalUrl}</p>
        )}
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
              className={`mt-1 ${fieldErrors.externalUrlTitle ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
            />
            {fieldErrors.externalUrlTitle && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.externalUrlTitle}</p>
            )}
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
