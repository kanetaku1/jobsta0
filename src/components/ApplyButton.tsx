'use client'

import { useFormStatus } from 'react-dom'
import { applyForJob } from '@/utils/supabase/postData'
import { useEffect, useActionState } from 'react'

const initialState = {
    message: '',
    success: false,
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

export function ApplyButton({ jobId, hasApplied }: { jobId: string, hasApplied: boolean }) {
    const [state, formAction] = useActionState(applyForJob.bind(null, jobId), initialState)

    useEffect(() => {
        if (state.message) {
            alert(state.message);
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