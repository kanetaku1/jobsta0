'use server';

import { supabase } from '@/lib/supabase';
import { getUserBySupabaseId } from '@/lib/actions/auth';

/**
 * Server Component用の認証チェック関数（リダイレクトなし）
 * 認証されていない場合はnullを返す
 */
export async function getAuthUser() {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.user) {
    return null;
  }
  
  return session.user;
}

/**
 * Server Component用のユーザー情報取得関数（リダイレクトなし）
 * 認証されていない場合はnullを返す
 */
export async function getPrismaUser() {
  const supabaseUser = await getAuthUser();
  
  if (!supabaseUser) {
    return null;
  }
  
  try {
    const prismaUser = await getUserBySupabaseId(supabaseUser.id);
    return { supabaseUser, prismaUser };
  } catch {
    return null;
  }
}

/**
 * Server Component用の特定ユーザータイプの認証チェック（リダイレクトなし）
 * 指定されたユーザータイプでない場合はnullを返す
 */
export async function getUserByType(userType: 'WORKER' | 'EMPLOYER') {
  const userData = await getPrismaUser();
  
  if (!userData || userData.prismaUser.userType !== userType) {
    return null;
  }
  
  return userData;
}

