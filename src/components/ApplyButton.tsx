/*
 * ファイルパス: src/components/ApplyButton.tsx (新規作成)
 * 役割: 応募処理を実行するためのクライアントコンポーネント
 */
import { useFormState, useFormStatus } from 'react-dom'
import { apply } from '@/app/jobs/[id]/actions'
import { useEffect } from 'react'

const initialState = {
    success: false,
    message: '',
}

function SubmitButton() {
    const { pending } = useFormStatus()
    return (
        <button
            type="submit"
            aria-disabled={pending}
            disabled={pending}
            className="bg-green-500 text-white font-bold py-3 px-10 rounded-full hover:bg-green-600 transition-colors duration-300 text-lg disabled:bg-gray-400"
        >
            {pending ? '処理中...' : 'このバイトに一人で応募する'}
        </button>
    )
}

// フォームアクション関数
function applyAction(prevState: typeof initialState, formData: FormData): Promise<typeof initialState> {
    const jobId = formData.get('jobId') as string
    const userId = formData.get('userId') as string
    return apply(jobId, userId)
}

export async function ApplyButton({ jobId, userId, hasApplied }: { jobId: string, userId: string, hasApplied: boolean }) {
    const [state, formAction] = useFormState(applyAction, initialState)

    useEffect(() => {
        if (state.message) {
            alert(state.message)
        }
    }, [state]);

    if (hasApplied) {
        return (
            <div className="text-center">
                <p className="text-lg font-semibold text-green-600">✅ この求人には応募済みです</p>
            </div>
        )
    }

    return (
        <form action={formAction} className="text-center">
            <SubmitButton />
        </form>
    )
}
