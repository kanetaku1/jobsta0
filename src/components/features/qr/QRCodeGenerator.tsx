'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { useState } from 'react';
import QRCode from 'react-qr-code';
import { Download, Copy, QrCode } from 'lucide-react';

interface QRCodeGeneratorProps {
  groupId: number;
  jobTitle: string;
  onClose?: () => void;
}

export default function QRCodeGenerator({ groupId, jobTitle, onClose }: QRCodeGeneratorProps) {
  const { toast } = useToast();
  const [customMessage, setCustomMessage] = useState('');
  
  // QRコードに含めるデータ
  const qrData = {
    type: 'group_join',
    groupId: groupId,
    jobTitle: jobTitle,
    message: customMessage || `「${jobTitle}」のグループに参加しませんか？`,
    timestamp: Date.now()
  };

  const qrString = JSON.stringify(qrData);
  const joinUrl = `${window.location.origin}/guest/join/${groupId}`;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(joinUrl);
    toast({
      title: 'コピー完了',
      description: 'グループ参加URLをコピーしました',
    });
  };

  const handleDownloadQR = () => {
    const svg = document.getElementById('qr-code-svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      
      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = `group-${groupId}-qr.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="h-5 w-5" />
          グループ参加QRコード
        </CardTitle>
        <CardDescription>
          このQRコードを友達に送って、グループに参加してもらいましょう
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* カスタムメッセージ */}
        <div className="space-y-2">
          <Label htmlFor="customMessage">カスタムメッセージ（任意）</Label>
          <Input
            id="customMessage"
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
            placeholder="友達へのメッセージを入力"
            maxLength={100}
          />
          <p className="text-xs text-gray-500">
            QRコードに含まれるメッセージです（最大100文字）
          </p>
        </div>

        {/* QRコード表示 */}
        <div className="flex justify-center p-4 bg-white rounded-lg border">
          <div id="qr-code-container">
            <QRCode
              id="qr-code-svg"
              value={qrString}
              size={200}
              style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
            />
          </div>
        </div>

        {/* グループ情報 */}
        <div className="text-center space-y-2">
          <p className="text-sm font-medium">グループID: {groupId}</p>
          <p className="text-sm text-gray-600">{jobTitle}</p>
          {customMessage && (
            <p className="text-sm text-blue-600 italic">"{customMessage}"</p>
          )}
        </div>

        {/* アクションボタン */}
        <div className="space-y-2">
          <Button 
            onClick={handleCopyUrl}
            variant="outline" 
            className="w-full"
          >
            <Copy className="h-4 w-4 mr-2" />
            参加URLをコピー
          </Button>
          
          <Button 
            onClick={handleDownloadQR}
            variant="outline" 
            className="w-full"
          >
            <Download className="h-4 w-4 mr-2" />
            QRコードをダウンロード
          </Button>
        </div>

        {/* 使用方法 */}
        <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm">
          <p className="text-blue-800 font-medium mb-2">使用方法:</p>
          <ol className="text-blue-700 space-y-1 list-decimal list-inside">
            <li>友達にQRコードを送信</li>
            <li>友達がQRコードをスキャン</li>
            <li>自動的にグループ参加ページに移動</li>
            <li>表示名を入力して参加</li>
          </ol>
        </div>

        {onClose && (
          <Button onClick={onClose} variant="outline" className="w-full">
            閉じる
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
