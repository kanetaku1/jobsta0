# 型定義ガイド

## 概要

このプロジェクトでは、型安全性を確保し、保守性を向上させるために、明確な階層構造を持つ型定義システムを採用しています。

## 型定義の階層構造

### 1. 基本エンティティ型 (`src/types/group.ts`)

最もシンプルで基本的な型定義です。データベースのテーブル構造に対応します。

```typescript
export interface Job {
  id: number
  title: string
  description: string | null
  wage: number
  jobDate: Date
  maxMembers: number
  status: JobStatus
  location?: string | null
  requirements?: string | null
  creatorId: number
  createdAt: Date
}
```

**特徴:**
- リレーションを含まない
- 基本的なプロパティのみ
- データベースのスキーマと1:1対応

### 2. サービス層用の型 (`src/types/services.ts`)

サービス層で使用する、リレーションを含む拡張型です。

```typescript
export interface JobWithWaitingRoomInfo extends Job {
  waitingRoom: {
    groups: {
      _count: { members: number }
      leader: { id: number; name: string | null; avatar: string | null }
      members: Array<{...}>
    }[]
  } | null
}
```

**特徴:**
- 基本型を拡張
- Prismaのクエリ結果に対応
- サービス層でのみ使用

### 3. UIコンポーネント用の型 (`src/types/components.ts`)

ReactコンポーネントのPropsとして使用する型です。

```typescript
export interface JobCardProps extends BaseComponentProps {
  job: Job
  variant?: 'default' | 'compact'
  showActions?: boolean
}
```

**特徴:**
- コンポーネントのProps定義
- 共通の`BaseComponentProps`を継承
- UI層でのみ使用

## 命名規則

### 基本型
- `Job`, `User`, `Group`, `WaitingRoom`

### 拡張型
- `JobWithWaitingRoomInfo` - `With`プレフィックスでリレーションを表現
- `WaitingRoomWithFullDetails` - `WithFull`で完全な情報を含むことを表現

### 用途別型
- `JobCardProps` - `Props`サフィックスでコンポーネントのPropsを表現
- `CreateJobData` - `Data`サフィックスでデータ作成用の型を表現

## 使用方法

### 1. 基本型の使用

```typescript
import { Job, User } from '@/types'

function processJob(job: Job) {
  // 基本的なJob型を使用
  console.log(job.title, job.wage)
}
```

### 2. 拡張型の使用

```typescript
import { JobWithWaitingRoomInfo } from '@/types'

function processJobWithWaitingRoom(job: JobWithWaitingRoomInfo) {
  // 待機ルーム情報を含むJob型を使用
  if (job.waitingRoom) {
    console.log(`待機ルーム内のグループ数: ${job.waitingRoom.groups.length}`)
  }
}
```

### 3. 型ガードの使用

```typescript
import { isJob, validateAndTransform } from '@/types/validation'

function safeProcessJob(data: any) {
  if (isJob(data)) {
    // 型安全に処理
    processJob(data)
  } else {
    console.error('Invalid job data')
  }
}

// または、変換と検証を同時に行う
const job = validateAndTransform(data, isJob)
```

## 型定義の追加・変更時の注意点

### 1. 新しい型を追加する場合

1. **基本型**: `src/types/group.ts`に追加
2. **拡張型**: `src/types/services.ts`に追加
3. **UI用型**: `src/types/components.ts`に追加
4. **エクスポート**: `src/types/index.ts`でエクスポート

### 2. 既存の型を変更する場合

1. **影響範囲の確認**: その型を使用している箇所を特定
2. **段階的な変更**: 一度に大きな変更を避け、小さな変更を段階的に実施
3. **テストの実行**: 変更後にビルドとテストを実行

### 3. 型の整合性を保つ

```typescript
// ❌ 悪い例：型の不一致
interface Job {
  id: string  // numberからstringに変更
}

// ✅ 良い例：型の一貫性を保つ
interface Job {
  id: number  // 一貫してnumberを使用
}
```

## ベストプラクティス

### 1. 型の再利用

```typescript
// ✅ 良い例：共通の型を定義して再利用
interface BaseEntity {
  id: number
  createdAt: Date
}

interface Job extends BaseEntity {
  title: string
  // ... その他のプロパティ
}
```

### 2. 型の明確化

```typescript
// ✅ 良い例：明確な型名
interface JobWithWaitingRoomAndGroups extends Job {
  waitingRoom: WaitingRoomWithGroups
}

// ❌ 悪い例：曖昧な型名
interface JobExtended extends Job {
  // 何が拡張されているか不明
}
```

### 3. 型の検証

```typescript
// ✅ 良い例：実行時の型チェック
function processJob(job: Job) {
  if (!isJob(job)) {
    throw new Error('Invalid job data')
  }
  // 型安全に処理
}
```

## トラブルシューティング

### よくある問題

1. **型の不一致エラー**
   - 型ガードを使用して実行時にチェック
   - `validateAndTransform`関数を使用

2. **インポートエラー**
   - 正しいパスでインポートしているか確認
   - `src/types/index.ts`でエクスポートされているか確認

3. **型の循環参照**
   - 型定義の依存関係を整理
   - 必要に応じて型を分離

### デバッグ方法

1. **TypeScriptコンパイラのエラーメッセージを確認**
2. **型の定義を`console.log`で出力**
3. **型ガードを使用して実行時の型をチェック**

## まとめ

適切な型定義により、以下のメリットが得られます：

- **型安全性**: コンパイル時のエラー検出
- **保守性**: コードの理解と変更が容易
- **開発効率**: 自動補完とエラーチェック
- **品質**: バグの早期発見と防止

型定義は一度作成すれば長期間使用されるため、初期設計に時間をかけることをお勧めします。
