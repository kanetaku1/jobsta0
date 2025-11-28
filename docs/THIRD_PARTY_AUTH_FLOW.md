# Third-Party Auth の仕組みとフロー

## 📋 概要

現在の実装では、**SupabaseのThird-Party Auth機能**を使用して、Auth0経由のLINEログインをSupabaseと連携させています。

## 🔄 認証フローの全体像

```
ユーザー
  ↓
LINE Developers (LINE Login)
  ↓
Auth0 (LINE Social Connection)
  ↓
Auth0 ID Token を取得
  ↓
クッキーに保存 (auth0_id_token)
  ↓
Supabase Client に accessToken として提供
  ↓
Supabase Third-Party Auth がトークンを検証
  ↓
Postgres の authenticated ロールを割り当て
  ↓
Supabase Data API / Storage / Realtime にアクセス可能
```

---

## 🔑 重要なポイント

### 1. Supabase Third-Party Auth の仕組み

**SupabaseのThird-Party Auth機能は、以下のように動作します：**

1. **トークンの検証**: Supabaseは、Auth0が発行したJWTトークンを検証します
2. **ロールの割り当て**: JWT内の`role: 'authenticated'` claimを確認し、Postgresの`authenticated`ロールを割り当てます
3. **データアクセス**: `authenticated`ロールにより、RLS（Row Level Security）ポリシーに基づいてデータにアクセスできます

**注意**: Third-Party Authを使用する場合、**Supabase Authのユーザーとして登録されるわけではありません**。代わりに、Auth0のトークンが直接SupabaseのAPIで使用されます。

### 2. クッキーの役割

**クッキーは、以下の目的で使用されます：**

1. **トークンの一時保存**: Auth0から取得したIDトークンをクライアント側で保持
2. **Supabase Clientへの提供**: Supabaseクライアントが`accessToken`オプションでトークンを取得
3. **セッション管理**: ログイン状態を維持（クッキーが存在する間はログイン状態）

### 3. Supabaseデータとの紐づけ

**現在の実装では、以下の方法でSupabaseデータと紐づけています：**

1. **Auth0 ID Tokenの`sub`（subject）をユーザーIDとして使用**
   - `sub`は、Auth0が発行する一意のユーザー識別子です
   - LINEログインの場合、LINEのユーザーIDが含まれます

2. **PrismaのUserテーブルに同期**
   - `syncUserFromSupabase()`関数で、Supabaseのユーザー情報をPrismaのUserテーブルに同期
   - ただし、Third-Party Authの場合、`supabase.auth.getUser()`は動作しない可能性があります

---

## ⚠️ 現在の実装の問題点

### 問題1: `syncUserFromSupabase()`が動作しない可能性

現在の`syncUserFromSupabase()`は、`supabase.auth.getUser()`を使用していますが、Third-Party Authの場合、これは動作しない可能性があります。

**理由:**
- Third-Party Authでは、Supabase Authのユーザーとして登録されない
- `supabase.auth.getUser()`は、Supabase Authのセッションを前提としている

**解決策:**
- Auth0のIDトークンから直接ユーザー情報を取得
- PrismaのUserテーブルに直接保存

### 問題2: ユーザー情報の取得方法

現在の実装では、クライアント側でJWTをデコードしてユーザー情報を取得していますが、サーバー側でも同様の処理が必要です。

---

## ✅ 推奨される実装方法

### 方法1: Auth0 ID Tokenから直接ユーザー情報を取得

```typescript
// src/app/auth/callback/route.ts
import { decode } from 'jsonwebtoken'

export async function GET(request: Request) {
  // ... Auth0からトークンを取得 ...
  
  const idToken = tokenData.id_token
  
  // IDトークンをデコードしてユーザー情報を取得
  const decoded = decode(idToken) as any
  const userId = decoded.sub // Auth0のユーザーID
  const email = decoded.email
  const name = decoded.name
  
  // PrismaのUserテーブルに保存
  await prisma.user.upsert({
    where: { supabaseId: userId },
    update: {
      email,
      name,
      // ...
    },
    create: {
      id: randomUUID(),
      supabaseId: userId,
      email,
      name,
      // ...
    },
  })
  
  // クッキーに保存してリダイレクト
  // ...
}
```

### 方法2: SupabaseのThird-Party Auth統合を活用

SupabaseのThird-Party Auth統合が正しく設定されていれば、以下のように動作します：

1. **Auth0のIDトークンをSupabase Clientに提供**
   ```typescript
   const supabase = createClient(url, key, {
     accessToken: async () => {
       return getAuth0IdToken() // クッキーから取得
     },
   })
   ```

2. **Supabaseがトークンを検証**
   - Supabaseは、Auth0の公開鍵を使用してトークンを検証
   - `role: 'authenticated'` claimを確認
   - Postgresの`authenticated`ロールを割り当て

3. **データアクセス**
   - RLSポリシーに基づいてデータにアクセス可能
   - `auth.uid()`などの関数は、JWTの`sub` claimを使用

---

## 🔧 現在の実装の確認

### クッキーの保存（`src/app/auth/callback/route.ts`）

```typescript
// Auth0からIDトークンを取得
const idToken = tokenData.id_token

// クッキーに保存
response.cookies.set('auth0_id_token', idToken, {
  httpOnly: false, // クライアント側で読み取れるようにする
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 60 * 60, // 1時間
  path: '/',
})
```

### Supabase Clientでの使用（`src/lib/supabase/client.ts`）

```typescript
export function createClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      accessToken: async () => {
        return getAuth0IdToken() // クッキーから取得
      },
    }
  )
}
```

### ユーザー情報の取得（クライアント側）

現在、クライアント側ではJWTをデコードしてユーザー情報を取得しています：

```typescript
// src/components/Header.tsx, src/app/page.tsx など
function getUserFromToken(): any {
  const idToken = getAuth0IdToken()
  const payload = decodeJWT(idToken)
  return {
    id: payload.sub,
    email: payload.email,
    // ...
  }
}
```

---

## 📝 まとめ

### 質問への回答

**Q: Auth0からLINEログインして得られた情報をクッキーに保存し、そのクッキーでSupabaseのデータと紐づけるということでしょうか？**

**A: はい、その通りです。ただし、以下の点に注意してください：**

1. **クッキーに保存するもの**: Auth0のIDトークン（JWT）
2. **Supabaseとの紐づけ**: 
   - Supabase Clientに`accessToken`として提供
   - Supabaseがトークンを検証し、`authenticated`ロールを割り当て
   - JWTの`sub` claimがユーザー識別子として使用される
3. **データベースとの紐づけ**: 
   - PrismaのUserテーブルに`supabaseId`として`sub`を保存
   - これにより、SupabaseのRLSポリシーとPrismaのデータを紐づけ

### 重要な注意点

- **Supabase Authのユーザーとして登録されない**: Third-Party Authでは、Supabase Authのユーザーとして登録されません。代わりに、Auth0のトークンが直接使用されます。
- **`supabase.auth.getUser()`は動作しない**: Third-Party Authの場合、`supabase.auth.getUser()`は動作しない可能性があります。代わりに、JWTをデコードしてユーザー情報を取得する必要があります。
- **RLSポリシーの設定**: SupabaseのRLSポリシーで、`auth.uid()`を使用する場合、JWTの`sub` claimが使用されます。

---

## 🔄 改善提案

現在の実装を改善するには、以下の点を検討してください：

1. **`syncUserFromSupabase()`の修正**: Auth0のIDトークンから直接ユーザー情報を取得するように変更
2. **サーバー側でのユーザー情報取得**: サーバー側でもJWTをデコードしてユーザー情報を取得
3. **エラーハンドリング**: トークンの検証失敗時のエラーハンドリングを追加

