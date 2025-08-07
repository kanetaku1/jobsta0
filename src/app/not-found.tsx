'use client'

// データが存在しないときの画面
const NotFound = () => {
    return (
        <div>
            <div className="text-center text-5xl font-bold mb-3">404</div>
            <div className="text-center text-2xl font-bold mb-6">ページが見つかりません</div>
        </div>
    );
}
export default NotFound;