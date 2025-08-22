# 開発者向けドキュメント

このドキュメントは、Jobstaプロジェクトの開発者向けの詳細な情報を提供します。

## 🏗️ アーキテクチャ

### 技術スタック
- **Frontend**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **Database**: PostgreSQL + Prisma
- **Authentication**: Supabase Auth
- **Testing**: Vitest
- **Storybook**: UIコンポーネントの開発・テスト

### プロジェクト構造
```
src/
├── app/                 # Next.js App Router
│   ├── groups/         # グループ関連のページ
│   ├── jobs/           # 求人関連のページ
│   ├── invite/         # 招待関連のページ
│   └── layout.tsx      # ルートレイアウト
├── components/         # 再利用可能なコンポーネント
│   ├── common/         # 共通コンポーネント
│   ├── features/       # 機能別コンポーネント
│   └── layouts/        # レイアウトコンポーネント
├── lib/               # ユーティリティとサービス
│   ├── prisma.ts      # Prismaクライアント
│   ├── supabase.ts    # Supabaseクライアント
│   └── services/      # ビジネスロジック
├── types/             # TypeScript型定義
└── styles/            # グローバルスタイル
```

## 🚀 開発環境のセットアップ

### 前提条件
- Node.js 18以上
- Docker Desktop
- Git

### 1. リポジトリのクローン
```bash
git clone https://github.com/kanetaku1/jobsta0.git
cd jobsta0
```

### 2. 環境変数の設定
```bash
cp .env.local.example .env.local
# .env.localファイルを編集して必要な値を設定
```

### 3. Dockerで開発環境を起動
```bash
docker-compose up --build
```

### 4. データベースのセットアップ
```bash
# 別のターミナルで
docker-compose exec app npx prisma migrate dev
docker-compose exec app npx prisma generate
```

## 🧪 テスト

### テストの実行
```bash
# 全テストを実行
npm test

# テストをウォッチモードで実行
npm run test:ui

# カバレッジレポートを生成
npm run test:coverage
```

### テストファイルの命名規則
- テストファイル: `*.test.ts` または `*.spec.ts`
- テストディレクトリ: `__tests__/`

### テストの書き方
```typescript
import { describe, it, expect } from 'vitest';

describe('UserService', () => {
  it('should create a new user', () => {
    // テストコード
    expect(true).toBe(true);
  });
});
```

## 📝 コーディング規約

### TypeScript
- 型定義を必ず書く
- `any`型の使用は避ける
- インターフェースは`I`プレフィックスを付けない

### React
- 関数コンポーネントを使用
- Propsの型定義を必ず書く
- カスタムフックは`use`プレフィックスを付ける

### CSS
- TailwindCSSのユーティリティクラスを優先
- カスタムCSSは最小限に
- レスポンシブデザインを意識

## 🔧 開発ツール

### ESLint
```bash
# リンターを実行
npm run lint

# 自動修正
npm run lint:fix
```

### Prettier
```bash
# コードフォーマット
npm run format

# フォーマットチェック
npm run format:check
```

### TypeScript
```bash
# 型チェック
npm run type-check
```

## 🗄️ データベース

### Prisma
- スキーマ定義: `prisma/schema.prisma`
- マイグレーション: `prisma/migrations/`
- クライアント生成: `npm run postinstall`

### マイグレーション
```bash
# 新しいマイグレーションを作成
npx prisma migrate dev --name migration_name

# 本番環境への適用
npx prisma migrate deploy

# データベースのリセット
npx prisma migrate reset
```

### データベースの確認
```bash
# Prisma Studioを起動
npx prisma studio
```

## 🔐 認証

### Supabase Auth
- ユーザー登録・ログイン
- セッション管理
- 権限管理

### 認証フロー
1. ユーザーがログインフォームを送信
2. Supabase Authで認証
3. セッショントークンを取得
4. 保護されたルートへのアクセス制御

## 🚀 デプロイ

### 開発環境
- ローカル: `http://localhost:3000`
- Docker: `http://localhost:3000`

### 本番環境
- Vercelで自動デプロイ
- mainブランチへのマージでトリガー

## 🐛 デバッグ

### ログ出力
```typescript
console.log('デバッグ情報');
console.error('エラー情報');
```

### ブラウザ開発者ツール
- React Developer Tools
- Network タブ
- Console タブ

### VS Code デバッグ
- ブレークポイントの設定
- 変数の監視
- コールスタックの確認

## 📚 参考資料

- [Next.js公式ドキュメント](https://nextjs.org/docs)
- [Prisma公式ドキュメント](https://www.prisma.io/docs)
- [Supabase公式ドキュメント](https://supabase.com/docs)
- [TailwindCSS公式ドキュメント](https://tailwindcss.com/docs)
- [Vitest公式ドキュメント](https://vitest.dev/)

## 🤝 チーム開発

### コードレビュー
- プルリクエストは必ずレビューを受ける
- レビューコメントは建設的に
- 承認は「LGTM」で統一

### コミュニケーション
- 分からないことは遠慮なく質問
- 進捗や課題は定期的に共有
- 知識の共有を積極的に行う

---
