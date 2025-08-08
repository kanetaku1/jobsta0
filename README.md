# Jobsta - ソーシャルバイトアプリ

**Jobsta（ジョブスタ)**は、友達と一緒に応募できるソーシャル型短期バイトマッチングアプリです。

## 🚀 開発環境セットアップ

### 1. リポジトリをクローン
```bash
git clone https://github.com/kanetaku1/jobsta0.git
cd jobsta0
```

### 2. 環境変数を設定
`.env.local.example`をコピーして`.env.local`を作成し、Supabaseなどのキーを設定してください。

```bash
#コードをコピーする
cp .env.local.example .env.local
```

### 3. パッケージをインストール
```bash
npm install
```

### 4. ローカルサーバー起動
```bash
npm run dev
```

### 📁 フォルダ構成
```bash
/src
  ├── app/          # 画面ルーティング
  ├── components/     # UIコンポーネント群
  ├── utils/            # SupabaseクライアントやAPIラッパー
  ├── hooks/          # カスタムフック
  └── types/          # TypeScript型定義
```

### 🛠 使用技術
- Frontend: Next.js
- Backend: Supabase
- Deployment: Vercel
- UI: TailwindCSS, Figma

### 👥 チーム開発ルール
- 開発ブランチ:  dev
- 機能追加:　feature/xxx
- バグ修正:　bugfix/xxx
- PR時はテンプレートに従ってレビュー依頼

