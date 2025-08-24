'use client';

import { Button } from '@/components/common/buttons/Button';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

export default function HomePage() {
    const { userStatus, guestInfo } = useAuth();

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <h1 className="text-4xl font-bold mb-8">Jobsta</h1>
                <p className="text-xl text-gray-600 mb-12">友達と応募できる短期バイトマッチングアプリ</p>
                
                {/* 認証状態に応じたメッセージ */}
                {userStatus === 'GUEST' && (
                    <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg max-w-md mx-auto">
                        <p className="text-blue-800">
                            <strong>{guestInfo?.displayName}さん</strong>、GUESTモードでアプリを利用中です
                        </p>
                        <p className="text-sm text-blue-600 mt-2">
                            本応募には個人情報の登録が必要です
                        </p>
                    </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
                    <div className="p-8 bg-white rounded-lg shadow-lg">
                        <h2 className="text-2xl font-semibold mb-4">労働者の方</h2>
                        <p className="text-gray-600 mb-6">求人情報を探して、友達と一緒に応募しましょう</p>
                        <Link 
                            href="/worker" 
                            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            求人を探す
                        </Link>
                    </div>
                    
                    <div className="p-8 bg-white rounded-lg shadow-lg">
                        <h2 className="text-2xl font-semibold mb-4">雇用主の方</h2>
                        <p className="text-gray-600 mb-6">求人を登録して、労働者を募集しましょう</p>
                        <Link 
                            href="/employer" 
                            className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
                        >
                            求人を登録
                        </Link>
                    </div>
                </div>

                {/* 認証状態に応じた追加アクション */}
                {userStatus === 'LOADING' && (
                    <div className="mt-12">
                        <div className="animate-pulse bg-gray-200 h-8 w-32 rounded mx-auto"></div>
                    </div>
                )}

                {userStatus === 'GUEST' && (
                    <div className="mt-12 space-y-4">
                        <p className="text-gray-600">より多くの機能を利用したい場合は</p>
                        <div className="space-x-4">
                            <Link href="/auth/signup">
                                <Button size="lg">
                                    アカウントを作成
                                </Button>
                            </Link>
                            <Link href="/auth/login">
                                <Button variant="outline" size="lg">
                                    ログイン
                                </Button>
                            </Link>
                        </div>
                    </div>
                )}

                {userStatus === 'REGISTERED' && (
                    <div className="mt-12">
                        <p className="text-gray-600 mb-4">アカウントにログイン済みです</p>
                        <Link href="/worker">
                            <Button size="lg">
                                求人を探し始める
                            </Button>
                        </Link>
                    </div>
                )}

                {userStatus === 'LOADING' && (
                    <div className="mt-12 space-y-4">
                        <p className="text-gray-600">アプリを利用するには</p>
                        <div className="space-x-4">
                            <Link href="/auth/signup">
                                <Button size="lg">
                                    新規登録
                                </Button>
                            </Link>
                            <Link href="/auth/login">
                                <Button variant="outline" size="lg">
                                    ログイン
                                </Button>
                            </Link>
                            <Link href="/auth/guest">
                                <Button variant="secondary" size="lg">
                                    GUESTモード
                                </Button>
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
