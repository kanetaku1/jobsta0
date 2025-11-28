# Jobsta - ソーシャルバイトアプリ

**Jobsta（ジョブスタ)**は、友達と一緒に応募できるソーシャル型短期バイトマッチングアプリです。

## 🚀 開発環境セットアップ

#### 1. リポジトリをクローン

```bash
git clone https://github.com/kanetaku1/jobsta0.git
cd jobsta0
```

#### 2. 環境変数を設定

`.env.local`ファイルを作成し、SupabaseとPrismaの設定を行ってください。

詳細は [`docs/AUTH_SETUP_GUIDE.md`](./docs/AUTH_SETUP_GUIDE.md) を参照してください。

```bash
# 必要な環境変数
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
DATABASE_URL=postgresql://postgres:password@host:5432/postgres
DIRECT_URL=postgresql://postgres:password@host:5432/postgres
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

#### 3. パッケージをインストール

```bash
npm install
```

#### 4. データベースのセットアップ

```bash
# Prisma Clientの生成
npm run db:generate

# データベースマイグレーション（初回のみ）
npm run db:migrate
```

#### 5. ローカルサーバー起動

```bash
npm run dev
```

## 🧪 テスト環境の使い分け

### 開発環境（devブランチ）
- **データベース**: 実際の開発用データベースでテスト
- **目的**: 機能の動作確認、統合テスト
- **方法**: `npm run dev`でローカルサーバー起動

### CI環境（GitHub Actions）
- **データベース**: 不要（モックデータで十分）
- **目的**: コード品質チェック（ESLint、TypeScript、Prettier）
- **方法**: プルリクエスト時に自動実行
- **注意**: ビルドテストはVercelが代行

### 本番環境（mainブランチ + Vercel）
- **データベース**: 本番用データベース
- **目的**: 実際のユーザー向けサービス
- **方法**: mainブランチへのマージで自動デプロイ
- **テスト**: Vercelが自動でビルド・デプロイテストを実行

## 📁 フォルダ構成

```
/src
  ├── app/          # 画面ルーティング
  ├── components/   # UIコンポーネント群
  ├── lib/          # データベース接続やサービス
  ├── types/        # TypeScript型定義
  └── styles/       # スタイルシート
```

## 🛠 使用技術

- **Frontend**: Next.js 15.4.5, React 19.1.0, TypeScript v5
- **Styling**: TailwindCSS v3.4.17, Shadcn/ui
- **Database**: PostgreSQL (Supabase) + Prisma v6.13.0
- **Authentication**: Supabase Auth (LINE Login対応)
- **Deployment**: Vercel

## 👥 チーム開発ルール

### ブランチ戦略

- **main**: 本番環境用（直接編集禁止）
- **dev**: 開発用の統合ブランチ
- **feature/xxx**: 新機能開発用
- **bugfix/xxx**: バグ修正用

### 開発の流れ

1. **ブランチ作成**: `git checkout -b feature/新機能名`
2. **コーディング**: 機能を実装
3. **コミット**: `git commit -m "feat: 新機能の説明"`
4. **プッシュ**: `git push origin feature/新機能名`
5. **プルリクエスト**: GitHubでレビュー依頼
6. **レビュー**: チームメンバーが確認
7. **マージ**: 承認後にdevブランチに統合

### コミットメッセージのルール

- `feat:` - 新機能
- `fix:` - バグ修正
- `docs:` - ドキュメント更新
- `style:` - コードスタイルの変更
- `refactor:` - リファクタリング

## 🔧 よくあるトラブルと解決方法

### データベース関連

```bash
# Prisma Clientの生成
npm run db:generate

# マイグレーション（開発環境）
npm run db:migrate

# マイグレーション（本番環境）
npm run db:migrate:deploy

# Prisma Studio（データベースGUI）
npm run db:studio

# スキーマを直接プッシュ（開発用）
npm run db:push
```

### Supabase設定

詳細な設定手順は [`docs/AUTH_SETUP_GUIDE.md`](./docs/AUTH_SETUP_GUIDE.md) を参照してください。

## 📚 参考資料

- [Next.js公式ドキュメント](https://nextjs.org/docs)
- [TailwindCSS公式ドキュメント](https://tailwindcss.com/docs)
- [Prisma公式ドキュメント](https://www.prisma.io/docs)
- [GitHub Flow](https://guides.github.com/introduction/flow/)

## 🤝 チーム開発のコツ

1. **小さな変更を頻繁に**: 大きな変更は分けて実装
2. **コミュニケーション**: 分からないことは遠慮なく質問
3. **レビュー**: お互いのコードを確認し合う
4. **ドキュメント**: 分かったことは共有する

## 🆘 困ったときは

- GitHubのIssuesで質問
- チーム内で相談
- このREADME.mdを確認

---
