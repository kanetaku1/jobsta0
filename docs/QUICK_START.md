# 🚀 Jobsta クイックスタート

5分でJobstaをセットアップします。

## ⚡ セットアップ

### 1. インストール

```bash
npm install
npx prisma db push
npx prisma generate
```

### 2. LIFF設定

#### LINE Developers Consoleで2つのLIFFアプリを作成

**求職者用LIFF**:
- サイズ: Full
- Endpoint URL: `https://your-domain.com`
- Scope: profile, openid, chat_message.write

**雇用主用LIFF**:
- サイズ: Full
- Endpoint URL: `https://your-domain.com/employer`
- Scope: profile, openid

### 3. 環境変数（`.env.local`）

```env
# 求職者用LIFF
NEXT_PUBLIC_LIFF_ID=your-job-seeker-liff-id
NEXT_PUBLIC_LIFF_ID_JOB_SEEKER=your-job-seeker-liff-id

# 雇用主用LIFF
NEXT_PUBLIC_LIFF_ID_EMPLOYER=your-employer-liff-id

# ワンタイムトークン
ONETIME_TOKEN_SECRET=your-random-secret

# データベース
DATABASE_URL=your-database-url
DIRECT_URL=your-direct-url
```

### 4. 開発サーバー起動

```bash
npm run dev
npx ngrok http 3000
```

### 5. 動作確認

LINEアプリで開く：
- 求職者: `https://liff.line.me/your-job-seeker-liff-id`
- 雇用主: `https://liff.line.me/your-employer-liff-id`

## 📚 詳細ドキュメント

- [LIFF_GUIDE.md](./docs/LIFF_GUIDE.md) - LIFF認証の詳細
- [ENV_VARIABLES.md](./docs/ENV_VARIABLES.md) - 環境変数一覧
- [DEPLOYMENT_GUIDE.md](./docs/DEPLOYMENT_GUIDE.md) - デプロイ手順

## 🐛 トラブルシューティング

| エラー | 解決策 |
|--------|--------|
| LIFF initialization failed | `.env.local`のLIFF IDを確認 |
| page error | Endpoint URLを確認（末尾のスラッシュなし） |

詳細は[LIFF_GUIDE.md](./docs/LIFF_GUIDE.md)を参照してください。
