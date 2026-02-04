# Jobsta - LINE連携バイトマッチングアプリ

LINEと連携した友達と一緒に応募できるソーシャル型短期バイトマッチングアプリです。

## ✨ 主な機能

- **LINE LIFF認証**: LINE内でシームレスにログイン
- **ロール別認証**: 求職者と雇用主で別々のLIFF URL
- **友達招待**: shareTargetPickerで友達を直接招待
- **グループ応募**: 友達と一緒に求人応募
- **ワンタイムトークン**: 招待リンクからワンタップログイン

## 🚀 クイックスタート

### 1. インストール

```bash
npm install
npx prisma db push
npx prisma generate
```

### 2. 環境変数設定（`.env.local`）

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

### 3. 開発サーバー起動

```bash
npm run dev
npx ngrok http 3000
```

### 4. LINE Developers ConsoleでLIFFアプリ作成

**求職者用**: Endpoint URL `https://your-domain.com`  
**雇用主用**: Endpoint URL `https://your-domain.com/employer`

詳細は[docs/QUICK_START.md](./docs/QUICK_START.md)を参照してください。

## 🛠 使用技術

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: TailwindCSS, Shadcn/ui
- **Database**: PostgreSQL (Supabase) + Prisma
- **Authentication**: LINE LIFF, ワンタイムトークン
- **Deployment**: Vercel

## 📁 プロジェクト構造

```
src/
├── app/                  # Next.js App Router
│   ├── api/auth/         # 認証API
│   ├── employer/         # 雇用主画面
│   ├── jobs/             # 求人検索
│   └── friends/          # 友達管理
├── components/           # UIコンポーネント
├── lib/
│   ├── auth/             # 認証ロジック
│   ├── liff/             # LIFF統合
│   └── actions/          # サーバーアクション
└── types/                # TypeScript型定義
```

## 🔧 開発コマンド

```bash
npm run dev              # 開発サーバー
npm run build            # ビルド
npm run type-check       # 型チェック
npm run lint             # リント
```

## 👥 ブランチ戦略

- **main**: 本番環境用
- **dev**: 開発用統合ブランチ
- **feature/xxx**: 新機能開発
- **fix/xxx**: バグ修正

## 📚 ドキュメント

- **[docs/QUICK_START.md](./docs/QUICK_START.md)** - セットアップ手順
- **[docs/LIFF_GUIDE.md](./docs/LIFF_GUIDE.md)** - LIFF認証ガイド
- **[docs/ENV_VARIABLES.md](./docs/ENV_VARIABLES.md)** - 環境変数一覧
- **[docs/DEPLOYMENT_GUIDE.md](./docs/DEPLOYMENT_GUIDE.md)** - デプロイ手順
- **[docs/PROJECT_OVERVIEW.md](./docs/PROJECT_OVERVIEW.md)** - プロジェクト概要

## 🐛 トラブルシューティング

| エラー | 解決策 |
|--------|--------|
| LIFF initialization failed | `.env.local`のLIFF IDを確認 |
| page error | Endpoint URLを確認（末尾スラッシュなし） |
| shareTargetPicker not available | Scopeに`chat_message.write`を追加 |

---

**🎉 LINEで友達と一緒にバイトを見つけよう！**
