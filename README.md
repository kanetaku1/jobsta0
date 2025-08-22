# Jobsta - ソーシャルバイトアプリ

**Jobsta（ジョブスタ)**は、友達と一緒に応募できるソーシャル型短期バイトマッチングアプリです。

## 🚀 開発環境セットアップ

### 方法1: Dockerを使った簡単セットアップ（推奨）

#### 1. Dockerのインストール

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) をダウンロードしてインストール
- インストール後、Docker Desktopを起動

#### 2. リポジトリをクローン

```bash
git clone https://github.com/kanetaku1/jobsta0.git
cd jobsta0
```

#### 3. 環境変数を設定

`.env.local.example`をコピーして`.env.local`を作成し、Supabaseなどのキーを設定してください。

```bash
cp .env.local.example .env.local
```

#### 4. Dockerで開発環境を起動

```bash
docker-compose up --build
```

これだけで開発環境が起動します！ブラウザで http://localhost:3000 にアクセスしてください。

#### 5. 開発環境の停止

```bash
docker-compose down
```

### 方法2: 従来のセットアップ

#### 1. リポジトリをクローン

```bash
git clone https://github.com/kanetaku1/jobsta0.git
cd jobsta0
```

#### 2. 環境変数を設定

`.env.local.example`をコピーして`.env.local`を作成し、Supabaseなどのキーを設定してください。

```bash
cp .env.local.example .env.local
```

#### 3. パッケージをインストール

```bash
npm install
```

#### 4. ローカルサーバー起動

```bash
npm run dev
```

## 🐳 Dockerを使うメリット

- **環境の統一**: 全員が同じ開発環境を使える
- **簡単セットアップ**: 複雑な環境構築が不要
- **依存関係の管理**: Node.jsのバージョンなどを自動で管理
- **データベース**: PostgreSQLも自動で起動

## 🧪 テスト環境の使い分け

### 開発環境（devブランチ）
- **データベース**: 実際の開発用データベースでテスト
- **目的**: 機能の動作確認、統合テスト
- **方法**: `npm run dev`でローカルサーバー起動

### CI環境（GitHub Actions）
- **データベース**: 不要（モックデータで十分）
- **目的**: コード品質チェック、ビルド確認
- **方法**: プルリクエスト時に自動実行

### 本番環境（mainブランチ + Vercel）
- **データベース**: 本番用データベース
- **目的**: 実際のユーザー向けサービス
- **方法**: mainブランチへのマージで自動デプロイ

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

- **Frontend**: Next.js 14, TypeScript
- **Styling**: TailwindCSS
- **Database**: PostgreSQL (Prisma)
- **Authentication**: Supabase
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

### Docker関連

```bash
# コンテナが起動しない場合
docker-compose down
docker-compose up --build

# ログを確認
docker-compose logs app

# コンテナ内でコマンド実行
docker-compose exec app npm run build

# シンプル版で試す
docker-compose -f docker-compose.simple.yml up --build
```

### Dockerが起動しない場合

1. **Docker Desktopの再起動**
   - Docker Desktopを完全に終了して再起動
   - 起動完了まで数分待つ

2. **従来の環境構築を使用**

   ```bash
   npm install
   npm run dev
   ```

3. **WSL2の確認**
   - Windows 10/11でWSL2が有効になっているか確認
   - Docker Desktopの設定で「Use WSL 2 based engine」が有効

### データベース関連

```bash
# データベースのリセット
docker-compose down -v
docker-compose up --build

# Prismaマイグレーション
docker-compose exec app npx prisma migrate dev
```

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
