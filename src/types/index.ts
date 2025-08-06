import { UUID } from "crypto"
import { Timestamp } from "next/dist/server/lib/cache-handlers/types"

/*
 * ファイルパス: src/types/index.ts (新規作成)
 * 役割: アプリケーション全体で利用する型定義を管理します。
 */
export type Job = {
    id: UUID
    title: string
    description: string | null
    wage_amount: number
    transport_fee: number | null
    job_date: Date
    location: string | null
    company_id: string | null
    created_at: Timestamp
}

// 今後、ユーザープロフィールや企業情報などの型もここに追加していきます。
export type Profile = {
    id: UUID
    username: string
    full_name: string | null
    user_type: string
    created_at: Timestamp
}

export type Company = {
    id: UUID
    company_name: string
    industry: string
    created_at: Timestamp
}

export type application_group = {
    id: UUID
    group_name: string
    created_at: Timestamp
}

export type Application = {
    id: UUID
    job_id: UUID
    user_id: UUID
    group_id: UUID | null
    status: string
    created_at: Timestamp
}