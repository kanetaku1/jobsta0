'use client'

import type { InviteFormProps } from '@/types'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function InviteForm({ groupId }: InviteFormProps) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        availability: 'yes' as 'yes' | 'no' | 'maybe'
    })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        try {
            // ここで一時的な参加者として登録
            // 実際の実装では、セッション管理や一時的なデータベース保存を行う
            console.log('招待フォーム送信:', { groupId, ...formData })
            
            // 成功時の処理
            alert('応募待機ルームに参加しました！')
            
            // グループページにリダイレクト
            router.push(`/groups/${groupId}`)
            
        } catch (error) {
            console.error('参加に失敗しました:', error)
            alert('参加に失敗しました。もう一度お試しください。')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-xl font-semibold mb-4">応募待機ルームに参加</h3>
            <p className="text-gray-600 mb-4">
                この求人に興味がありますか？参加を希望する場合は、以下の情報を入力してください。
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        お名前 <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="山田太郎"
                    />
                </div>

                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        メールアドレス <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="example@email.com"
                    />
                </div>

                <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                        電話番号
                    </label>
                    <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="090-1234-5678"
                    />
                </div>

                <div>
                    <label htmlFor="availability" className="block text-sm font-medium text-gray-700 mb-1">
                        参加の意向 <span className="text-red-500">*</span>
                    </label>
                    <select
                        id="availability"
                        name="availability"
                        required
                        value={formData.availability}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="yes">参加したい</option>
                        <option value="maybe">検討中</option>
                        <option value="no">参加しない</option>
                    </select>
                </div>

                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                        {isSubmitting ? '送信中...' : '応募待機ルームに参加'}
                    </button>
                </div>

                <p className="text-xs text-gray-500 text-center">
                    この情報は応募待機ルームでの確認用として使用されます。
                    実際の応募時には、より詳細な情報が必要になります。
                </p>
            </form>
        </div>
    )
}
