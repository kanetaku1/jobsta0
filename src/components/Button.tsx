import { ButtonHTMLAttributes } from 'react'
import clsx from 'clsx'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: 'primary' | 'secondary'
}

export function Button({ children, variant = 'primary', ...props }: ButtonProps) {
    return (
        <button
            {...props}
            className={clsx(
                'px-4 py-2 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2',
                variant === 'primary'
                    ? 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-400'
            )}
        >
            {children}
        </button>
    )
}
