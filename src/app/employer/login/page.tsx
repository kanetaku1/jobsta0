'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { signUpEmployer, signInEmployer } from '@/lib/auth/employer-auth'
import { useToast } from '@/components/ui/use-toast'

export default function EmployerLoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (isSignUp) {
        // サインアップ
        if (!formData.name.trim()) {
          throw new Error('名前を入力してください')
        }
        const result = await signUpEmployer(
          formData.email,
          formData.password,
          formData.name
        )

        if (result.success) {
          toast({
            title: '登録完了',
            description: '確認メールを送信しました。メールを確認してください。',
          })
          // メール確認が必要な場合は、ここでメッセージを表示
        } else {
          throw new Error(result.error || '登録に失敗しました')
        }
      } else {
        // ログイン
        const result = await signInEmployer(formData.email, formData.password)

        if (result.success) {
          toast({
            title: 'ログイン成功',
            description: '求人管理ページに移動します',
          })
          router.push('/employer/jobs')
        } else {
          throw new Error(result.error || 'ログインに失敗しました')
        }
      }
    } catch (error) {
      toast({
        title: 'エラー',
        description: error instanceof Error ? error.message : 'エラーが発生しました',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">
          求人作成者ログイン
        </h1>
        <p className="text-gray-600 mb-8 text-center">
          {isSignUp ? '新規登録' : 'ログイン'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div>
              <Label htmlFor="name">お名前</Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="山田太郎"
                required={isSignUp}
                className="mt-1"
              />
            </div>
          )}

          <div>
            <Label htmlFor="email">メールアドレス</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="example@email.com"
              required
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="password">パスワード</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              className="mt-1"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white hover:bg-blue-700 py-6 text-lg font-semibold disabled:opacity-50"
          >
            {loading
              ? isSignUp
                ? '登録中...'
                : 'ログイン中...'
              : isSignUp
              ? '新規登録'
              : 'ログイン'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            {isSignUp
              ? '既にアカウントをお持ちの方はログイン'
              : '新規登録はこちら'}
          </button>
        </div>
      </div>
    </div>
  )
}

