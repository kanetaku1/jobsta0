"use client"

import { Button } from '@/components/common/buttons/Button'
import type { PersonalInfoFormProps } from '@/types'
import { useState } from 'react'

interface PersonalInfo {
  phone: string
  address: string
  emergencyContact: string
}

export default function PersonalInfoForm({
  userId,
  onSubmit,
  onCancel,
  initialData = {},
}: PersonalInfoFormProps) {
  const [formData, setFormData] = useState<PersonalInfo>({
    phone: initialData.phone || '',
    address: initialData.address || '',
    emergencyContact: initialData.emergencyContact || '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Partial<PersonalInfo>>({})

  const validateForm = (): boolean => {
    const newErrors: Partial<PersonalInfo> = {}

    if (!formData.phone.trim()) {
      newErrors.phone = '電話番号は必須です'
    } else if (!/^[\d\-+()\s]+$/.test(formData.phone)) {
      newErrors.phone = '有効な電話番号を入力してください'
    }

    if (!formData.address.trim()) {
      newErrors.address = '住所は必須です'
    }

    if (!formData.emergencyContact.trim()) {
      newErrors.emergencyContact = '緊急連絡先は必須です'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit(formData)
    } catch (error) {
      console.error('個人情報の更新に失敗しました:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: keyof PersonalInfo, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // エラーをクリア
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          個人情報登録
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 電話番号 */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
              電話番号 <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              id="phone"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="例: 090-1234-5678"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.phone ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
            )}
          </div>

          {/* 住所 */}
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
              住所 <span className="text-red-500">*</span>
            </label>
            <textarea
              id="address"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              placeholder="例: 東京都渋谷区..."
              rows={3}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.address ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.address && (
              <p className="mt-1 text-sm text-red-600">{errors.address}</p>
            )}
          </div>

          {/* 緊急連絡先 */}
          <div>
            <label htmlFor="emergencyContact" className="block text-sm font-medium text-gray-700 mb-2">
              緊急連絡先 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="emergencyContact"
              value={formData.emergencyContact}
              onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
              placeholder="例: 家族の名前と電話番号"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.emergencyContact ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.emergencyContact && (
              <p className="mt-1 text-sm text-red-600">{errors.emergencyContact}</p>
            )}
          </div>

          {/* 注意事項 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-900 mb-2">注意事項</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• 入力された個人情報は本応募時に使用されます</li>
              <li>• 個人情報は適切に管理され、目的外での使用はありません</li>
              <li>• 本応募後は個人情報の更新ができません</li>
            </ul>
          </div>

          {/* ボタン */}
          <div className="flex gap-4 pt-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? '更新中...' : '個人情報を更新'}
            </Button>
            <Button
              type="button"
              onClick={onCancel}
              variant="secondary"
              className="flex-1"
            >
              キャンセル
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
