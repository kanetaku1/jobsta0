'use client';

import { Group } from '@/types/group';
import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface WaitingRoomProps {
  group: Group;
}

export function WaitingRoom({ group }: WaitingRoomProps) {
  const [showQRCode, setShowQRCode] = useState(false);
  const [showFinalApplication, setShowFinalApplication] = useState(false);

  const generateInviteUrl = (groupId: number) => {
    return `${window.location.origin}/invite/${groupId}`;
  };

  const handleFinalApplication = () => {
    setShowFinalApplication(true);
  };

  return (
    <div className="space-y-6">
      {/* グループ情報ヘッダー */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
        <h2 className="text-2xl font-semibold mb-2">
          {group.name || `グループ #${group.id}`}
        </h2>
        <p className="text-gray-600">応募待機ルーム</p>
      </div>

      {/* 求人情報サマリー */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-xl font-semibold mb-4">求人情報</h2>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-500">タイトル</p>
            <p className="font-medium">{group.job!.title}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">時給</p>
            <p className="font-medium text-blue-600">
              {group.job!.wage.toLocaleString()}円
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">勤務日</p>
            <p className="font-medium">
              {new Date(group.job!.jobDate).toLocaleDateString('ja-JP')}
            </p>
          </div>
        </div>
      </div>

      {/* ルーム統計 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
          <p className="text-2xl font-bold text-blue-600">
            {group.members?.length || 0}
          </p>
          <p className="text-gray-600">参加者数</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
          <p className="text-2xl font-bold text-green-600">
            {group.applications?.length || 0}
          </p>
          <p className="text-gray-600">応募者数</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
          <p className="text-2xl font-bold text-purple-600">
            {group.members && group.applications && group.members.length > 0
              ? Math.round(
                  (group.applications.length / group.members.length) * 100
                )
              : 0}
            %
          </p>
          <p className="text-gray-600">応募率</p>
        </div>
      </div>

      {/* 参加者リスト */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">参加者一覧</h3>
          <button
            onClick={() => setShowQRCode(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            QRコードで招待
          </button>
        </div>

        {group.members && group.members.length > 0 ? (
          <div className="space-y-3">
            {group.members.map(member => (
              <div
                key={member.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-medium">
                    {member.user?.name || '名前未設定'}
                  </p>
                  <p className="text-sm text-gray-600">{member.user?.email}</p>
                </div>
                <div className="text-sm text-gray-500">
                  参加日:{' '}
                  {new Date(member.joinedAt).toLocaleDateString('ja-JP')}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">まだ参加者がいません</p>
        )}
      </div>

      {/* 応募者リスト */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold mb-4">応募者一覧</h3>
        {group.applications && group.applications.length > 0 ? (
          <div className="space-y-3">
            {group.applications.map(application => (
              <div
                key={application.id}
                className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200"
              >
                <div>
                  <p className="font-medium">応募者 #{application.id}</p>
                  <p className="text-sm text-gray-600">
                    応募日:{' '}
                    {new Date(application.submittedAt).toLocaleDateString(
                      'ja-JP'
                    )}
                  </p>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                  応募済み
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">まだ応募者がいません</p>
        )}
      </div>

      {/* 最終応募ボタン */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
        <h3 className="text-lg font-semibold mb-4">最終応募</h3>
        <p className="text-gray-600 mb-4">
          参加者の参加/不参加が決まったら、最終応募を行ってください。
        </p>
        <button
          onClick={handleFinalApplication}
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          最終応募を行う
        </button>
      </div>

      {/* QRコードモーダル */}
      {showQRCode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">招待用QRコード</h3>
            <p className="text-sm text-gray-600 mb-2 text-center">
              {group.name || `グループ #${group.id}`}
            </p>
            <div className="flex justify-center mb-4">
              <QRCodeSVG
                value={generateInviteUrl(group.id)}
                size={200}
                level="M"
              />
            </div>
            <p className="text-sm text-gray-600 mb-4 text-center">
              このQRコードを友達に見せて、ルームに招待してください
            </p>
            <div className="flex justify-end">
              <button
                onClick={() => setShowQRCode(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 最終応募モーダル */}
      {showFinalApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">最終応募</h3>
            <p className="text-gray-600 mb-4">
              最終応募には、より詳細な個人情報が必要になります。
              この機能は現在開発中です。
            </p>
            <div className="flex justify-end">
              <button
                onClick={() => setShowFinalApplication(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
