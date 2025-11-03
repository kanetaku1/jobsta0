# デプロイメントガイド

## 🚀 ローカルから本番環境への移行

### 移行の流れ

#### 1. ローカル開発（完了）
```bash
# ローカル環境で開発・テスト完了
npm run dev:local
```

#### 2. 本番データベースの準備
```bash
# 本番環境のデータベースURLを設定
# .env.production または Vercel環境変数に設定
DATABASE_URL="postgresql://user:password@your-production-db:5432/jobsta0"
```

#### 3. マイグレーションの適用
```bash
# 本番環境でマイグレーション実行
npx prisma migrate deploy
```

#### 4. シードデータの投入（必要に応じて）
```bash
# 本番環境でシードデータ投入
npm run db:seed
```

### 環境変数の管理

#### 開発環境（.env.local）
```bash
# ローカルデータベース
DATABASE_URL="postgresql://postgres:password@localhost:5432/jobsta0"
DIRECT_URL="postgresql://postgres:password@localhost:5432/jobsta0"

# Supabase認証
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

#### 本番環境（Vercel環境変数）
```bash
# 本番データベース
DATABASE_URL=postgresql://user:password@your-production-db:5432/jobsta0
DIRECT_URL=postgresql://user:password@your-production-db:5432/jobsta0

# Supabase認証（同じ値）
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 🔄 自動化されたデプロイフロー

### Vercelでの自動デプロイ

1. **GitHubにプッシュ**
   ```bash
   git push origin main
   ```

2. **Vercelが自動実行**
   - 環境変数の読み込み
   - `prisma generate`の実行
   - `prisma migrate deploy`の実行
   - アプリケーションのビルド・デプロイ

### カスタムビルドコマンドの設定

`vercel.json`でビルドプロセスを最適化：

```json
{
  "buildCommand": "prisma generate && prisma migrate deploy && next build",
  "installCommand": "npm install"
}
```

## 📊 移行のメリット

| 項目 | 従来の方法 | Prisma + マイグレーション |
|------|------------|---------------------------|
| **移行時間** | 数時間〜数日 | 数分 |
| **データ損失リスク** | 高い | なし |
| **手動作業** | 大量 | 最小限 |
| **ロールバック** | 困難 | 簡単 |
| **チーム同期** | 困難 | 自動 |

## 🛠 トラブルシューティング

### よくある問題と解決方法

#### 1. マイグレーション競合
```bash
# マイグレーション状態の確認
npx prisma migrate status

# 競合の解決
npx prisma migrate resolve --applied "migration_name"
```

#### 2. 環境変数の不整合
```bash
# 環境変数の確認
echo $DATABASE_URL

# Vercelでの環境変数設定確認
vercel env ls
```

#### 3. データベース接続エラー
```bash
# 接続テスト
npx prisma db pull

# スキーマの同期確認
npx prisma db push --preview-feature
```

## 🎯 ベストプラクティス

### 1. 開発フロー
- ローカル環境で完全にテスト
- マイグレーションは必ずローカルで検証
- 本番環境への移行は自動化

### 2. データ管理
- 重要なデータはシードファイルで管理
- 本番データのバックアップを定期的に実行
- マイグレーションは段階的に適用

### 3. 監視とログ
- デプロイ後の動作確認
- エラーログの監視
- パフォーマンスの監視

## 🔗 関連リンク

- [Prisma Migrate公式ドキュメント](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [Vercel環境変数設定](https://vercel.com/docs/concepts/projects/environment-variables)
- [PostgreSQL移行ガイド](https://www.postgresql.org/docs/current/backup.html)
