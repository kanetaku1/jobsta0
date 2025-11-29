import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma/client'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/employer/jobs'

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      // Userテーブルに求人作成者を登録
      try {
        await prisma.user.upsert({
          where: { supabaseId: data.user.id },
          update: {
            email: data.user.email || undefined,
            name: data.user.user_metadata?.name || undefined,
            role: 'EMPLOYER',
          },
          create: {
            id: crypto.randomUUID(),
            supabaseId: data.user.id,
            email: data.user.email || undefined,
            name: data.user.user_metadata?.name || undefined,
            role: 'EMPLOYER',
          },
        })
      } catch (dbError) {
        console.error('Error syncing employer user:', dbError)
      }
    }
  }

  return NextResponse.redirect(new URL(next, request.url))
}

