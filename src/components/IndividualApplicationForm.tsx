'use client'

import { useState } from 'react'
import { User, Mail, Phone, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import { getCurrentUserId, createApplicationGroup } from '@/lib/localStorage'

type IndividualApplicationFormProps = {
  jobId: string
  jobTitle: string
  onSuccess: () => void
}

export function IndividualApplicationForm({ jobId, jobTitle, onSuccess }: IndividualApplicationFormProps) {
  const { toast } = useToast()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name.trim()) {
      toast({
        title: 'エラー',
        description: 'お名前を入力してください',
        variant: 'destructive',
      })
      return
    }

    setSubmitting(true)

    try {
      const userId = getCurrentUserId()
      
      // 個人応募の場合は、友達なしで応募グループを作成
      createApplicationGroup(jobId, userId, [], jobTitle)
      
      toast({
        title: '応募が完了しました',
        description: '応募情報を送信しました',
      })

      onSuccess()
    } catch (error) {
      toast({
        title: 'エラー',
        description: '応募の送信に失敗しました',
        variant: 'destructive',
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label htmlFor="name">
          お名前 <span className="text-red-500">*</span>
        </Label>
        <div className="relative mt-1">
          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="山田太郎"
            required
            className="pl-10"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="email">
          メールアドレス
        </Label>
        <div className="relative mt-1">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@email.com"
            className="pl-10"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="phone">
          電話番号
        </Label>
        <div className="relative mt-1">
          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="090-1234-5678"
            className="pl-10"
          />
        </div>
      </div>

      <Button
        type="submit"
        disabled={submitting}
        className="w-full bg-blue-600 text-white py-6 text-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Send size={20} />
        {submitting ? '送信中...' : '応募する'}
      </Button>
    </form>
  )
}

