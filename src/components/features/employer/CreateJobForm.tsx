'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/common';
import { createJob } from '@/app/employer/actions';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface CreateJobFormData {
  title: string
  description: string
  wage: number
  jobDate: string
  maxMembers: number
}

export function CreateJobForm() {
  const router = useRouter()
  const { toast } = useToast()
  const { user, userStatus } = useAuth()
  const [formData, setFormData] = useState<CreateJobFormData>({
    title: '',
    description: '',
    wage: 1000,
    jobDate: '',
    maxMembers: 1
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      toast({
        title: 'エラー',
        description: 'ログインが必要です',
        variant: 'destructive',
      })
      return
    }

    setIsSubmitting(true)

    try {
      const result = await createJob(
        formData.title,
        formData.description,
        formData.wage,
        new Date(formData.jobDate),
        formData.maxMembers,
        user.id
      )
      
      toast({
        title: '求人作成完了',
        description: '求人が正常に作成されました',
      })
      router.push('/employer/jobs')
    } catch (error) {
      console.error('Failed to create job:', error)
      toast({
        title: 'エラー',
        description: '求人の作成に失敗しました',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'wage' || name === 'maxMembers' ? parseInt(value) || 0 : value
    }))
  }

  if (userStatus === 'LOADING') {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">認証中...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 mb-4">求人を作成するにはログインが必要です</p>
        <Button onClick={() => router.push('/auth/login')}>
          ログイン
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
          求人タイトル *
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="例: イベント会場スタッフ"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
          仕事内容 *
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          required
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="仕事の詳細を記入してください"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="wage" className="block text-sm font-medium text-gray-700 mb-2">
            日給 (円) *
          </label>
          <input
            type="number"
            id="wage"
            name="wage"
            value={formData.wage}
            onChange={handleInputChange}
            required
            min="1000"
            step="100"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="maxMembers" className="block text-sm font-medium text-gray-700 mb-2">
            募集人数 *
          </label>
          <input
            type="number"
            id="maxMembers"
            name="maxMembers"
            value={formData.maxMembers}
            onChange={handleInputChange}
            required
            min="1"
            max="50"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label htmlFor="jobDate" className="block text-sm font-medium text-gray-700 mb-2">
          勤務日 *
        </label>
        <input
          type="datetime-local"
          id="jobDate"
          name="jobDate"
          value={formData.jobDate}
          onChange={handleInputChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex space-x-4">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
        >
          {isSubmitting ? '作成中...' : '求人を作成'}
        </Button>
        
        <Button
          type="button"
          onClick={() => router.back()}
          className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded"
        >
          キャンセル
        </Button>
      </div>
    </form>
  )
}
