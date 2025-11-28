// ローディング
const Loading = () => {
    return (
        <div className="flex items-center justify-center h-screen">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
            <p className="mt-4 text-lg text-gray-600">読み込み中...</p>
        </div>
    );
}

export default Loading;