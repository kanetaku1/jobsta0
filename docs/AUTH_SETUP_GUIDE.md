# 認証設定ガイド

このドキュメントでは、LINEログイン機能を実装するために必要な設定を説明します。

## 設定の全体像

```
ユーザー → LINE Developers (LINE Login) → Auth0 → Supabase (Third-Party Auth) → Jobsta
```

## 1. LINE Developers Console の設定

### 必要な設定項目

1. **LINE Login チャネルの作成**
   - [LINE Developers Console](https://developers.line.biz/console/)にアクセス
   - プロバイダーを作成（まだの場合）
   - 「LINE Login」チャネルを作成

2. **Callback URL の設定**
   - LINE Login チャネルの設定ページで「Callback URL」を設定
   - 設定するURL:
     ```
     https://<your-auth0-domain>/login/callback
     ```
   - 例: `https://your-tenant.auth0.com/login/callback`

3. **取得する情報**
   - Channel ID（LINE_CHANNEL_ID）- 現在は使用していませんが、将来の拡張用
   - Channel Secret（LINE_CHANNEL_SECRET）- 現在は使用していませんが、将来の拡張用

### 注意事項

- Auth0経由でLINEログインを使用する場合、LINE Developers ConsoleのCallback URLはAuth0のCallback URLを設定します
- 直接LINE Loginを使用する場合は、`https://<your-domain>/auth/callback`を設定しますが、現在の実装ではAuth0経由のため不要です

---

## 2. Auth0 の設定

### 2.1 LINE Social Connection の設定

1. **Auth0 Dashboard にアクセス**
   - [Auth0 Dashboard](https://manage.auth0.com/)にログイン

2. **LINE Social Connection を有効化**
   - 左メニューから「Authentication」→「Social」を選択
   - 「LINE」を選択または作成
   - LINE Developers Consoleから取得した情報を設定:
     - **Client ID**: LINE Login チャネルのChannel ID
     - **Client Secret**: LINE Login チャネルのChannel Secret
   - 「Save」をクリック

3. **Connection を有効化**
   - LINE Connection の設定で「Enabled」をONにする

### 2.2 Application の設定

1. **Application の作成/確認**
   - 左メニューから「Applications」→「Applications」を選択
   - 既存のApplicationを選択、または新規作成

2. **Application Type の設定**
   - Application Type: **Regular Web Application** を選択

3. **Allowed Callback URLs の設定（重要）**
   
   以下のURLを追加してください：
   
   **開発環境:**
   ```
   http://localhost:3000/auth/callback
   ```
   
   **本番環境:**
   ```
   https://<your-domain>/auth/callback
   ```
   
   例:
   ```
   http://localhost:3000/auth/callback,https://jobsta.example.com/auth/callback
   ```
   
   **注意**: カンマ区切りで複数のURLを設定できます

4. **Allowed Logout URLs の設定**
   
   以下のURLを追加：
   
   **開発環境:**
   ```
   http://localhost:3000
   ```
   
   **本番環境:**
   ```
   https://<your-domain>
   ```

5. **Allowed Web Origins の設定**
   
   以下のURLを追加：
   
   **開発環境:**
   ```
   http://localhost:3000
   ```
   
   **本番環境:**
   ```
   https://<your-domain>
   ```

6. **取得する情報**
   - **Domain**: `your-tenant.auth0.com` 形式
   - **Client ID**: Application の Client ID
   - **Client Secret**: Application の Client Secret（機密情報）

### 2.3 Auth0 Action の設定（Supabase Third-Party Auth用）

1. **Auth0 Action の作成**
   - 左メニューから「Actions」→「Flows」→「Login」を選択
   - 「+ Custom」をクリックして新しいActionを作成

2. **Action コードの追加**
   ```javascript
   exports.onExecutePostLogin = async (event, api) => {
     // SupabaseのThird-Party Auth機能で必要なrole claimを追加
     api.idToken.setCustomClaim('role', 'authenticated');
     api.accessToken.setCustomClaim('role', 'authenticated');
   };
   ```

3. **Action の適用**
   - 「Deploy」をクリック
   - 「Login」フローにActionを追加

---

## 3. Supabase の設定

### 3.1 Third-Party Auth 統合の設定

1. **Supabase Dashboard にアクセス**
   - [Supabase Dashboard](https://supabase.com/dashboard)にログイン
   - プロジェクトを選択

2. **Third-Party Auth 統合の追加**
   - 左メニューから「Authentication」→「Settings」を選択
   - 「Third-Party Auth」セクションを探す
   - 「Add Integration」をクリック
   - 「Auth0」を選択

3. **Auth0 の情報を入力**
   - **Tenant ID**: Auth0のTenant ID（Domainから取得可能）
   - **Tenant Region**: Auth0のリージョン（例: `us`, `eu`, `au`）
   - 「Save」をクリック

### 3.2 Redirect URLs の設定

1. **Redirect URLs の許可リストに追加**
   - 左メニューから「Authentication」→「URL Configuration」を選択
   - 「Redirect URLs」に以下を追加：
   
   **開発環境:**
   ```
   http://localhost:3000/auth/callback
   ```
   
   **本番環境:**
   ```
   https://<your-domain>/auth/callback
   ```

---

## 4. 環境変数の設定

### 4.1 必要な環境変数

`.env.local`ファイルに以下の環境変数を設定してください：

```env
# ==================== データベース ====================
DATABASE_URL=postgresql://postgres:password@host:5432/postgres
DIRECT_URL=postgresql://postgres:password@host:5432/postgres

# ==================== Supabase ====================
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>

# ==================== Auth0（クライアント側）====================
NEXT_PUBLIC_AUTH0_DOMAIN=<your-tenant>.auth0.com
NEXT_PUBLIC_AUTH0_CLIENT_ID=<your-auth0-client-id>

# ==================== Auth0（サーバー側）====================
AUTH0_DOMAIN=<your-tenant>.auth0.com
AUTH0_CLIENT_ID=<your-auth0-client-id>
AUTH0_CLIENT_SECRET=<your-auth0-client-secret>
```

### 4.2 環境変数の使用箇所

| 環境変数 | 使用箇所 | 説明 |
|---------|---------|------|
| `DATABASE_URL` | Prisma | データベース接続URL |
| `DIRECT_URL` | Prisma | 直接データベース接続URL |
| `NEXT_PUBLIC_SUPABASE_URL` | クライアント/サーバー | SupabaseプロジェクトURL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | クライアント/サーバー | Supabase匿名キー |
| `NEXT_PUBLIC_AUTH0_DOMAIN` | クライアント側 | Auth0ドメイン（ログインページで使用） |
| `NEXT_PUBLIC_AUTH0_CLIENT_ID` | クライアント側 | Auth0 Client ID（ログインページで使用） |
| `AUTH0_DOMAIN` | サーバー側 | Auth0ドメイン（コールバック処理で使用） |
| `AUTH0_CLIENT_ID` | サーバー側 | Auth0 Client ID（コールバック処理で使用） |
| `AUTH0_CLIENT_SECRET` | サーバー側 | Auth0 Client Secret（コールバック処理で使用） |

### 4.3 現在未使用の環境変数

以下の環境変数は現在の実装では使用されていませんが、将来の拡張用に保持できます：

- `LINE_CHANNEL_ACCESS_TOKEN` - 現在未使用（Auth0経由のため）
- `LINE_CHANNEL_SECRET` - 現在未使用（Auth0経由のため）

**削除する場合:**
- 直接LINE Login APIを使用する予定がない場合は削除可能です

---

## 5. 設定の確認チェックリスト

### Auth0 の設定確認

- [ ] LINE Social Connection が有効になっている
- [ ] Application の Callback URL に `http://localhost:3000/auth/callback` が追加されている
- [ ] Application の Callback URL に本番環境のURLが追加されている
- [ ] Allowed Logout URLs が設定されている
- [ ] Allowed Web Origins が設定されている
- [ ] Auth0 Action で `role: 'authenticated'` claim が設定されている

### Supabase の設定確認

- [ ] Third-Party Auth 統合で Auth0 が追加されている
- [ ] Redirect URLs に `http://localhost:3000/auth/callback` が追加されている
- [ ] Redirect URLs に本番環境のURLが追加されている

### 環境変数の確認

- [ ] `.env.local` にすべての必要な環境変数が設定されている
- [ ] `AUTH0_CLIENT_SECRET` が設定されている（サーバー側で必要）
- [ ] 本番環境用の環境変数も設定されている

---

## 6. トラブルシューティング

### Callback URL mismatch エラー

**原因:**
- Auth0のApplication設定で、Callback URLが許可リストに追加されていない

**解決方法:**
1. Auth0 Dashboard → Applications → 該当Application
2. 「Allowed Callback URLs」に以下を追加：
   - 開発環境: `http://localhost:3000/auth/callback`
   - 本番環境: `https://<your-domain>/auth/callback`
3. 「Save Changes」をクリック

### ログイン後、トークンが取得できない

**原因:**
- Auth0のClient Secretが設定されていない、または間違っている

**解決方法:**
1. `.env.local`に`AUTH0_CLIENT_SECRET`が設定されているか確認
2. Auth0 Dashboardで正しいClient Secretを確認
3. 環境変数を再設定

---

## 7. 本番環境へのデプロイ時の注意事項

1. **環境変数の設定**
   - Vercelなどのホスティングサービスで環境変数を設定
   - `NEXT_PUBLIC_`で始まる変数はクライアント側に公開されるため注意

2. **Callback URL の追加**
   - 本番環境のURLをAuth0とSupabaseの両方に追加

3. **HTTPS の使用**
   - 本番環境では必ずHTTPSを使用
   - Auth0とSupabaseの設定でもHTTPS URLを使用

