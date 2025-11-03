# ローカル開発環境ガイド

## 🎯 なぜローカル開発環境を使うべきか

### オンラインデータベースの問題点
- **接続の不安定性**: ネットワーク状況により接続が切れる
- **レスポンスの遅延**: クエリ実行時間が長い（10秒以上）
- **データ競合**: 複数の開発者が同じデータを操作
- **デバッグの困難**: データの状態を自由に変更できない

### ローカル開発環境のメリット
- **高速なレスポンス**: ローカル接続による即座のクエリ実行
- **安定した接続**: ネットワーク依存なし
- **独立したデータ**: 他の開発者との競合なし
- **自由なデバッグ**: データの状態を自由に変更可能
- **オフライン開発**: インターネット接続不要

## 🚀 ローカル開発環境のセットアップ

### 1. 環境変数の設定

`.env.local`ファイルを作成し、以下の内容を設定してください：

```bash
# Supabase設定（認証のみ使用）
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# ローカルデータベース設定（開発用）
DATABASE_URL="postgresql://postgres:password@localhost:5432/jobsta0"
DIRECT_URL="postgresql://postgres:password@localhost:5432/jobsta0"
```

### 2. 開発環境の起動方法

```bash
# 1. マイグレーション実行
npm run db:migrate

# 2. アプリケーション起動
npm run dev
```

### 3. データベース操作

```bash
# マイグレーション実行
npm run db:migrate

# データベースリセット
npm run db:reset

# シードデータ投入
npm run db:seed

# Prisma Studio起動（GUI）
npm run db:studio

# Prismaクライアント生成
npm run db:generate
```

## 🔄 開発フローの最適化

### 推奨開発フロー

1. **開発開始時**
   ```bash
   # アプリケーション起動
   npm run dev
   ```

2. **スキーマ変更時**
   ```bash
   # マイグレーション作成・実行
   npm run db:migrate
   ```

3. **データリセット時**
   ```bash
   # データベースリセット
   npm run db:reset
   # シードデータ投入
   npm run db:seed
   ```

4. **デバッグ時**
   ```bash
   # Prisma Studioでデータ確認
   npm run db:studio
   ```

### 環境の使い分け

| 環境 | 用途 | データベース | 認証 |
|------|------|-------------|------|
| **ローカル開発** | 機能開発・デバッグ | ローカルPostgreSQL | Supabase Auth |
| **ステージング** | 統合テスト | ステージングDB | Supabase Auth |
| **本番** | 実際のサービス | 本番DB | Supabase Auth |

## 🛠 トラブルシューティング

### よくある問題と解決方法

#### 1. データベース接続エラー
```bash
# データベース接続設定を確認
# .env.localのDATABASE_URLとDIRECT_URLを確認
```

#### 2. マイグレーションエラー
```bash
# マイグレーション状態確認
npx prisma migrate status

# 強制リセット
npm run db:reset
```

#### 3. Prismaクライアントエラー
```bash
# クライアント再生成
npm run db:generate
```

## 📊 パフォーマンス比較

| 項目 | オンラインDB | ローカルDB |
|------|-------------|-----------|
| クエリ実行時間 | 5-20秒 | 0.1-0.5秒 |
| 接続安定性 | 不安定 | 安定 |
| デバッグ容易性 | 困難 | 容易 |
| データ独立性 | なし | あり |

## 🎯 ベストプラクティス

### 1. 開発時のデータ管理
- ローカル環境では自由にデータを変更
- 重要なテストデータはシードファイルで管理
- 定期的にデータベースをリセット

### 2. チーム開発
- 各開発者が独立したローカル環境を使用
- スキーマ変更は必ずマイグレーションで管理
- 環境変数は`.env.local`で管理（Gitにコミットしない）

### 3. デプロイ前の確認
- ローカル環境で全機能をテスト
- ステージング環境で最終確認
- 本番環境へのデプロイ

## 🔗 関連リンク

- [Prisma公式ドキュメント](https://www.prisma.io/docs)
- [Next.js公式ドキュメント](https://nextjs.org/docs)
