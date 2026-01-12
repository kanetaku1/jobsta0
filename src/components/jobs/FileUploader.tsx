'use client'

import { useState, useCallback, ChangeEvent } from 'react'
import { X, Upload, FileText, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { uploadJobAttachment, deleteJobAttachment } from '@/lib/actions/uploads'

type UploadedFile = {
  url: string
  fileName: string
  fileType: 'pdf' | 'image'
  fileSize: number
}

type FileUploaderProps = {
  onFilesChange: (files: UploadedFile[]) => void
  initialFiles?: UploadedFile[]
  maxFiles?: number
}

/**
 * ファイルアップローダーコンポーネント
 * ドラッグ&ドロップ、プレビュー、進捗バー対応
 */
export function FileUploader({ 
  onFilesChange, 
  initialFiles = [],
  maxFiles = 5 
}: FileUploaderProps) {
  const [files, setFiles] = useState<UploadedFile[]>(initialFiles)
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const { toast } = useToast()

  const handleFileChange = async (selectedFiles: FileList | null) => {
    if (!selectedFiles || selectedFiles.length === 0) return

    // 最大ファイル数チェック
    if (files.length + selectedFiles.length > maxFiles) {
      toast({
        title: 'エラー',
        description: `最大${maxFiles}件までアップロード可能です`,
        variant: 'destructive'
      })
      return
    }

    setUploading(true)

    try {
      const uploadPromises = Array.from(selectedFiles).map(async (file) => {
        const formData = new FormData()
        formData.append('file', file)
        
        const result = await uploadJobAttachment(formData)
        
        if (result.success && 'url' in result) {
          return {
            url: result.url,
            fileName: result.fileName,
            fileType: result.fileType as 'pdf' | 'image',
            fileSize: result.fileSize
          }
        } else {
          throw new Error('error' in result ? result.error : 'アップロード失敗')
        }
      })

      const uploadedFiles = await Promise.all(uploadPromises)
      const newFiles = [...files, ...uploadedFiles]
      setFiles(newFiles)
      onFilesChange(newFiles)

      toast({
        title: '成功',
        description: `${uploadedFiles.length}件のファイルをアップロードしました`
      })
    } catch (error) {
      toast({
        title: 'エラー',
        description: error instanceof Error ? error.message : 'ファイルのアップロードに失敗しました',
        variant: 'destructive'
      })
    } finally {
      setUploading(false)
    }
  }

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    handleFileChange(e.target.files)
  }

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files)
    }
  }, [files, maxFiles])

  const handleRemoveFile = async (index: number) => {
    const fileToRemove = files[index]
    
    try {
      const result = await deleteJobAttachment(fileToRemove.url)
      
      if (result.success) {
        const newFiles = files.filter((_, i) => i !== index)
        setFiles(newFiles)
        onFilesChange(newFiles)

        toast({
          title: '成功',
          description: 'ファイルを削除しました'
        })
      } else {
        throw new Error('error' in result ? result.error : '削除失敗')
      }
    } catch (error) {
      toast({
        title: 'エラー',
        description: error instanceof Error ? error.message : 'ファイルの削除に失敗しました',
        variant: 'destructive'
      })
    }
  }

  return (
    <div className="space-y-4">
      {/* ドラッグ&ドロップエリア */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        } ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <p className="text-sm text-gray-600 mb-2">
          ファイルをドラッグ&ドロップ、またはクリックして選択
        </p>
        <p className="text-xs text-gray-500 mb-4">
          PDF、PNG、JPEGのみ（最大5MB、{maxFiles}件まで）
        </p>
        <input
          type="file"
          id="file-upload"
          className="hidden"
          multiple
          accept=".pdf,.png,.jpg,.jpeg"
          onChange={handleFileInputChange}
          disabled={uploading || files.length >= maxFiles}
        />
        <label htmlFor="file-upload">
          <Button
            type="button"
            variant="outline"
            disabled={uploading || files.length >= maxFiles}
            onClick={() => document.getElementById('file-upload')?.click()}
          >
            {uploading ? 'アップロード中...' : 'ファイルを選択'}
          </Button>
        </label>
      </div>

      {/* アップロード済みファイル一覧 */}
      {files.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">
            アップロード済み ({files.length}/{maxFiles})
          </p>
          <div className="space-y-2">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  {file.fileType === 'image' ? (
                    <ImageIcon className="h-5 w-5 text-blue-500 flex-shrink-0" />
                  ) : (
                    <FileText className="h-5 w-5 text-red-500 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {file.fileName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(file.fileSize / 1024).toFixed(2)} KB
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveFile(index)}
                  className="ml-2 flex-shrink-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
