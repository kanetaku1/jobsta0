# 認証システム統一ガイド

このディレクトリには、統一された認証システムの実装が含まれています。

## 概要

認証チェックを統一し、重複を排除するために以下のコンポーネントとフックを提供しています：

- `serverAuth.ts`: Server Component用の認証関数
- `AuthContext.tsx`: Client Component用の認証コンテキスト（useAuthフックを含む）
- `AuthGuard.tsx`: 認証が必要なページを保護するコンポーネント

## 使用方法

### Server Component での使用

```typescript
import { getUserByType, getPrismaUser, getAuthUser } from '@/lib/auth/serverAuth';

// 特定のユーザータイプが必要な場合
export default async function EmployerPage() {
  const userData = await getUserByType('EMPLOYER');
  if (!userData) {
    return <div>雇用主として認証されていません</div>;
  }
  // 雇用主として認証されていることが保証される
}

// 認証されたユーザーが必要な場合
export default async function UserPage() {
  const userData = await getPrismaUser();
  if (!userData) {
    return <div>ログインが必要です</div>;
  }
  // 認証されたユーザーであることが保証される
}

// 認証状態をチェック（リダイレクトなし）
export default async function ConditionalPage() {
  const authUser = await getAuthUser();
  
  if (!authUser) {
    return <div>ログインが必要です</div>;
  }
  
  // 認証されたユーザーのコンテンツ
}
```

### Client Component での使用

```typescript
import { useAuth } from '@/contexts/AuthContext';
import AuthGuard from '@/components/features/auth/AuthGuard';

// フックを使用
function MyComponent() {
  const { isAuthenticated, isWorker, isEmployer, canAccess } = useAuth();
  
  if (!isAuthenticated) {
    return <div>ログインが必要です</div>;
  }
  
  if (canAccess('EMPLOYER')) {
    return <div>雇用主向けコンテンツ</div>;
  }
  
  return <div>一般ユーザー向けコンテンツ</div>;
}

// AuthGuardを使用
function ProtectedPage() {
  return (
    <AuthGuard requireAuth={true} userType="EMPLOYER">
      <div>雇用主のみアクセス可能</div>
    </AuthGuard>
  );
}
```

### AuthGuard のオプション

```typescript
interface AuthGuardProps {
  children: ReactNode;
  requireAuth?: boolean;           // 認証が必要かどうか（デフォルト: true）
  userType?: 'WORKER' | 'EMPLOYER'; // 必要なユーザータイプ
  redirectTo?: string;             // リダイレクト先（デフォルト: '/auth/login'）
  fallback?: ReactNode;            // 認証失敗時の表示内容
  showLoading?: boolean;           // ローディング表示するかどうか（デフォルト: true）
}
```

## 認証状態のヘルパー

### useAuth フックで利用可能なプロパティ

```typescript
const {
  // 基本情報
  user,           // Supabaseユーザー
  prismaUser,     // Prismaユーザー
  guestInfo,      // ゲスト情報
  userStatus,     // ユーザー状態
  isLoading,      // ローディング状態
  error,          // エラー情報
  
  // 認証状態のヘルパー
  isAuthenticated, // 認証済みかどうか
  isWorker,        // ワーカーかどうか
  isEmployer,      // 雇用主かどうか
  isGuest,         // ゲストかどうか
  
  // 認証チェック関数
  requireAuth,     // 認証が必要かチェック
  canAccess,       // アクセス可能かチェック
  isOwner,         // 所有者かチェック
  hasPermission,   // 権限があるかチェック
  
  // アクション
  signOut,         // サインアウト
  setGuestMode,    // ゲストモード設定
  clearGuestMode,  // ゲストモードクリア
} = useAuth();
```

## 移行ガイド

### 既存のコードからの移行

1. **Server Component**: `supabase.auth.getSession()` の直接使用を `getUserByType()` に置き換え
2. **Client Component**: `useUser` フックを `useAuth` フックに置き換え
3. **認証ガード**: 手動の認証チェックを `AuthGuard` コンポーネントに置き換え

### 例: 移行前後

```typescript
// 移行前
async function getData() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) {
    redirect('/auth/login');
  }
  const user = await getUserBySupabaseId(session.user.id);
  // ...
}

// 移行後
async function getData() {
  const userData = await getUserByType('EMPLOYER');
  if (!userData) {
    return <div>認証が必要です</div>;
  }
  // ...
}
```

## 注意事項

1. **Server Component**: `getUserByType()` などの関数はnullを返す可能性があるため、適切にエラーハンドリングを行う
2. **Client Component**: `useAuth` フックは `AuthProvider` 内で使用する必要がある
3. **パフォーマンス**: 認証チェックは必要最小限に留め、不要な再レンダリングを避ける

## トラブルシューティング

### よくある問題

1. **AuthProvider が見つからない**: `useAuth` フックを `AuthProvider` の外で使用している
2. **リダイレクトループ**: 認証チェックの条件が正しく設定されていない
3. **型エラー**: ユーザータイプの指定が正しくない

### デバッグ

```typescript
// 認証状態をデバッグ
const { isAuthenticated, isWorker, isEmployer, error } = useAuth();
console.log({ isAuthenticated, isWorker, isEmployer, error });
```
