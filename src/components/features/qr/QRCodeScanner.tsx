'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { useState, useRef, useEffect } from 'react';
import { QrCode, Camera, X } from 'lucide-react';

interface QRCodeScannerProps {
  onScanSuccess: (data: any) => void;
  onClose?: () => void;
}

export default function QRCodeScanner({ onScanSuccess, onClose }: QRCodeScannerProps) {
  const { toast } = useToast();
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startScanning = async () => {
    try {
      setError(null);
      setIsScanning(true);

      // カメラアクセスを要求
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' } // 背面カメラを優先
      });

      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      // QRコードスキャンのロジック（簡易版）
      // 実際の実装では、jsQRやquagga2などのライブラリを使用
      toast({
        title: 'カメラを起動しました',
        description: 'QRコードをカメラにかざしてください',
      });

    } catch (err) {
      console.error('Camera access error:', err);
      setError('カメラにアクセスできませんでした。権限を確認してください。');
      setIsScanning(false);
    }
  };

  const stopScanning = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  };

  const handleManualInput = () => {
    const qrData = prompt('QRコードの内容を手動で入力してください:');
    if (qrData) {
      try {
        const parsedData = JSON.parse(qrData);
        onScanSuccess(parsedData);
      } catch (err) {
        toast({
          title: 'エラー',
          description: '無効なQRコードデータです',
          variant: 'destructive',
        });
      }
    }
  };

  // コンポーネントのアンマウント時にカメラを停止
  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, []);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="h-5 w-5" />
          QRコードスキャン
        </CardTitle>
        <CardDescription>
          グループ参加用のQRコードをスキャンしてください
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* カメラ表示エリア */}
        <div className="relative bg-gray-100 rounded-lg overflow-hidden">
          {isScanning ? (
            <video
              ref={videoRef}
              className="w-full h-64 object-cover"
              playsInline
              muted
            />
          ) : (
            <div className="w-full h-64 flex items-center justify-center">
              <div className="text-center">
                <Camera className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                <p className="text-gray-600">カメラを起動してQRコードをスキャン</p>
              </div>
            </div>
          )}
          
          {/* スキャンオーバーレイ */}
          {isScanning && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-48 h-48 border-2 border-blue-500 rounded-lg bg-transparent">
                <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-blue-500 rounded-tl-lg"></div>
                <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-blue-500 rounded-tr-lg"></div>
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-blue-500 rounded-bl-lg"></div>
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-blue-500 rounded-br-lg"></div>
              </div>
            </div>
          )}
        </div>

        {/* エラー表示 */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded p-3 text-sm text-red-800">
            {error}
          </div>
        )}

        {/* コントロールボタン */}
        <div className="space-y-2">
          {!isScanning ? (
            <Button onClick={startScanning} className="w-full">
              <Camera className="h-4 w-4 mr-2" />
              カメラを起動
            </Button>
          ) : (
            <Button onClick={stopScanning} variant="outline" className="w-full">
              <X className="h-4 w-4 mr-2" />
              スキャンを停止
            </Button>
          )}
          
          <Button onClick={handleManualInput} variant="outline" className="w-full">
            手動入力
          </Button>
        </div>

        {/* 使用方法 */}
        <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm">
          <p className="text-blue-800 font-medium mb-2">スキャン方法:</p>
          <ol className="text-blue-700 space-y-1 list-decimal list-inside">
            <li>「カメラを起動」をタップ</li>
            <li>QRコードをカメラにかざす</li>
            <li>自動的にグループ参加ページに移動</li>
            <li>カメラが起動しない場合は「手動入力」を使用</li>
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
