# 環境変数の説明

このドキュメントでは、Jobstaアプリケーションで使用する環境変数について説明します。

## 必須環境変数

### データベース

| 変数名 | 説明 | 使用箇所 |
|--------|------|---------|
| `DATABASE_URL` | Prismaで使用するPostgreSQLデータベースの接続URL | Prisma Client |
| `DIRECT_URL` | Prismaで使用する直接データベース接続URL | Prisma Client |

**取得方法:**
- Supabase Dashboard → Project Settings → Database → Connection string

---

### Supabase

| 変数名 | 説明 | 使用箇所 |
|--------|------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | SupabaseプロジェクトのURL | クライアント/サーバー |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase匿名キー | クライアント/サーバー |

**取得方法:**
- Supabase Dashboard → Project Settings → API
- `NEXT_PUBLIC_`プレフィックスは、クライアント側（ブラウザ）に公開されるため注意

**使用箇所:**
- `src/lib/supabase/client.ts` - Supabaseクライアントの作成
- `src/lib/supabase/server.ts` - Supabaseサーバークライアントの作成
- `src/lib/supabase/middleware.ts` - ミドルウェアでのセッション管理

---

### Auth0（クライアント側）

| 変数名 | 説明 | 使用箇所 |
|--------|------|---------|
| `NEXT_PUBLIC_AUTH0_DOMAIN` | Auth0テナントのドメイン | クライアント側 |
| `NEXT_PUBLIC_AUTH0_CLIENT_ID` | Auth0 ApplicationのClient ID | クライアント側 |

**取得方法:**
- Auth0 Dashboard → Applications → 該当Application → Settings

**使用箇所:**
- `src/app/login/page.tsx` - LINEログイン時の認証URL構築

**注意:**
- `NEXT_PUBLIC_`プレフィックスは、クライアント側（ブラウザ）に公開されるため注意
- 機密情報（Client Secret）は含めない

---

### Auth0（サーバー側）

| 変数名 | 説明 | 使用箇所 |
|--------|------|---------|
| `AUTH0_DOMAIN` | Auth0テナントのドメイン | サーバー側 |
| `AUTH0_CLIENT_ID` | Auth0 ApplicationのClient ID | サーバー側 |
| `AUTH0_CLIENT_SECRET` | Auth0 ApplicationのClient Secret | サーバー側 |

**取得方法:**
- Auth0 Dashboard → Applications → 該当Application → Settings
- Client Secretは一度しか表示されないため、必ず保存してください

**使用箇所:**
- `src/app/auth/callback/route.ts` - 認証コードをトークンに交換する処理

**注意:**
- `NEXT_PUBLIC_`プレフィックスがないため、サーバー側でのみ使用可能
- Client Secretは機密情報のため、絶対に公開しないでください

---

## オプション環境変数（将来の拡張用）

### LINE（現在は未使用）

| 変数名 | 説明 | 使用箇所 |
|--------|------|---------|
| `LINE_CHANNEL_ACCESS_TOKEN` | LINE Messaging APIのアクセストークン | 未使用 |
| `LINE_CHANNEL_SECRET` | LINE Loginチャネルのシークレット | 未使用 |

**現在の状況:**
- 現在の実装では、Auth0経由でLINEログインを使用しているため、これらの環境変数は使用されていません
- 将来、直接LINE Login APIやLINE Messaging APIを使用する場合に必要になります

**削除する場合:**
- 直接LINE APIを使用する予定がない場合は、`.env.local`から削除可能です

---

## 環境変数の設定方法

### 開発環境

1. プロジェクトルートに`.env.local`ファイルを作成
2. `.env.example`を参考に、必要な値を設定
3. 実際の値に置き換える

```bash
# .env.localの例
DATABASE_URL=postgresql://postgres:password@localhost:5432/jobsta0
DIRECT_URL=postgresql://postgres:password@localhost:5432/jobsta0
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_AUTH0_DOMAIN=your-tenant.auth0.com
NEXT_PUBLIC_AUTH0_CLIENT_ID=xxxxx
AUTH0_DOMAIN=your-tenant.auth0.com
AUTH0_CLIENT_ID=xxxxx
AUTH0_CLIENT_SECRET=xxxxx
```

### 本番環境（Vercel）

1. Vercel Dashboard → Project → Settings → Environment Variables
2. 各環境変数を追加
3. 環境（Production, Preview, Development）を選択

**注意:**
- `NEXT_PUBLIC_`で始まる変数は、クライアント側に公開されるため、機密情報を含めないでください
- Client Secretなどの機密情報は、`NEXT_PUBLIC_`なしの変数として設定してください

---

## 環境変数の確認方法

### 開発環境

```bash
# 環境変数が正しく読み込まれているか確認
npm run dev
# ブラウザのコンソールでエラーがないか確認
```

### 本番環境

- Vercel Dashboardで環境変数が設定されているか確認
- デプロイ後のログでエラーがないか確認

---

## トラブルシューティング

### 環境変数が読み込まれない

**原因:**
- `.env.local`ファイルが存在しない
- 環境変数名が間違っている
- サーバーを再起動していない

**解決方法:**
1. `.env.local`ファイルが存在するか確認
2. 環境変数名が正しいか確認（大文字小文字、アンダースコアなど）
3. 開発サーバーを再起動（`npm run dev`）

### Client Secretがundefined

**原因:**
- `AUTH0_CLIENT_SECRET`が設定されていない
- サーバー側の環境変数が読み込まれていない

**解決方法:**
1. `.env.local`に`AUTH0_CLIENT_SECRET`が設定されているか確認
2. サーバーを再起動
3. Vercelなどの本番環境では、環境変数が正しく設定されているか確認

