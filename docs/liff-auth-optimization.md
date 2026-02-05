# LIFF認証の最適化

## 🎯 問題

**症状**: 求人作成・編集フォームで入力中に頻繁にページがリロードされる

**原因**: 
- Next.jsのFast Refreshでコンポーネントが再マウントされる
- `LiffProvider`が再マウントされるたびに`POST /api/auth/liff/verify`が実行される
- API実行に1.5秒〜3秒かかり、その間入力が中断される

---

## ✅ 解決策

### トークン検証のキャッシュ機能を実装

1. **sessionStorageでキャッシュ管理**
   - 検証済みフラグと検証時刻を保存
   - タブごとに独立したキャッシュ

2. **5分間の有効期限**
   - 一度検証したら5分間は再検証しない
   - セキュリティとパフォーマンスのバランス

3. **エラー時の自動クリア**
   - 検証失敗時はキャッシュをクリア
   - 次回アクセス時に再検証

---

## 📊 効果

### API呼び出し回数の削減

**Before（改善前）:**
```
時刻 00:00 → POST /api/auth/liff/verify（1回目）
時刻 00:30 → POST /api/auth/liff/verify（2回目）Fast Refresh
時刻 01:00 → POST /api/auth/liff/verify（3回目）ページ遷移
時刻 01:30 → POST /api/auth/liff/verify（4回目）Fast Refresh
時刻 02:00 → POST /api/auth/liff/verify（5回目）

合計: 5回（10秒〜15秒）
```

**After（改善後）:**
```
時刻 00:00 → POST /api/auth/liff/verify（1回目）
時刻 00:30 → キャッシュヒット（スキップ）
時刻 01:00 → キャッシュヒット（スキップ）
時刻 01:30 → キャッシュヒット（スキップ）
時刻 02:00 → キャッシュヒット（スキップ）
時刻 05:00 → POST /api/auth/liff/verify（2回目）5分経過

合計: 2回（3秒〜6秒）
```

**削減率: 60%〜80%**

---

## 🔧 技術詳細

### キャッシュキー

```typescript
const VERIFICATION_CACHE_KEY = 'liff_token_verified'
const VERIFICATION_TIMESTAMP_KEY = 'liff_token_verified_at'
const VERIFICATION_CACHE_DURATION = 5 * 60 * 1000 // 5分
```

### キャッシュ判定ロジック

```typescript
function shouldVerifyToken(): boolean {
  // 1. キャッシュの存在確認
  const verified = sessionStorage.getItem(VERIFICATION_CACHE_KEY)
  const timestamp = sessionStorage.getItem(VERIFICATION_TIMESTAMP_KEY)
  
  if (!verified || !timestamp) return true // キャッシュなし → 検証必要
  
  // 2. 有効期限チェック
  const now = Date.now()
  const verifiedAt = parseInt(timestamp, 10)
  const elapsed = now - verifiedAt
  
  if (elapsed > VERIFICATION_CACHE_DURATION) {
    // 有効期限切れ → キャッシュクリア → 検証必要
    sessionStorage.removeItem(VERIFICATION_CACHE_KEY)
    sessionStorage.removeItem(VERIFICATION_TIMESTAMP_KEY)
    return true
  }
  
  // 3. キャッシュ有効 → 検証スキップ
  return false
}
```

---

## 🧪 テスト方法

### 1. キャッシュ動作の確認

```javascript
// ブラウザの開発者コンソールで実行

// 初回アクセス時
sessionStorage.getItem('liff_token_verified') // null

// 検証後
sessionStorage.getItem('liff_token_verified') // "true"
sessionStorage.getItem('liff_token_verified_at') // "1738749600000"

// ページリロード後（5分以内）
// → 検証スキップのログが出る: "Token verification skipped (cached)"
```

### 2. コンソールログの確認

**初回アクセス（検証あり）:**
```
Verifying LIFF token...
POST /api/auth/liff/verify 200 in 1743ms
LIFF token verified successfully
```

**5分以内の再アクセス（検証スキップ）:**
```
Token verification skipped (cached)
```

**5分経過後（再検証）:**
```
Verifying LIFF token...
POST /api/auth/liff/verify 200 in 1743ms
LIFF token verified successfully
```

### 3. ネットワークタブの確認

1. ブラウザの開発者ツールを開く
2. Networkタブを選択
3. 求人作成ページにアクセス
4. `liff/verify` を検索
5. **初回のみ表示され、リロード後は表示されないことを確認**

---

## ⚠️ セキュリティ考慮事項

### なぜ5分間？

1. **ユーザー体験**: フォーム入力中の中断を防ぐ
2. **セキュリティ**: 長すぎるとトークン盗用のリスク
3. **LINE APIの仕様**: アクセストークンの有効期限は30日間

### sessionStorage vs localStorage

- **sessionStorage**: タブを閉じるとクリアされる（セキュリティ向上）
- **localStorage**: 永続的に保存される（セキュリティリスク）

→ **sessionStorageを採用**

---

## 📋 今後の改善案

- [ ] トークンリフレッシュ機能
- [ ] バックグラウンドでの定期検証
- [ ] オフライン対応
- [ ] Service Worker統合

---

## 🔍 関連ファイル

- `src/lib/liff/liff-provider.tsx` - LIFF認証プロバイダー
- `src/app/api/auth/liff/verify/route.ts` - 検証API
- `docs/auto-save-feature.md` - 全体ドキュメント
