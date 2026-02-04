# LINE LIFF認証ガイド

Jobstaは、LINE LIFFを使用して、求職者と雇用主をロール別に認証します。

## 🚀 クイックセットアップ

### 1. 環境変数を設定

```env
# 求職者用LIFF ID
NEXT_PUBLIC_LIFF_ID=your-job-seeker-liff-id
NEXT_PUBLIC_LIFF_ID_JOB_SEEKER=your-job-seeker-liff-id

# 雇用主用LIFF ID
NEXT_PUBLIC_LIFF_ID_EMPLOYER=your-employer-liff-id

# ワンタイムトークン
ONETIME_TOKEN_SECRET=your-random-secret
```

### 2. LINE Developers ConsoleでLIFFアプリを作成

**求職者用LIFF**:
- サイズ: Full
- Endpoint URL: `https://your-domain.com`
- Scope: profile, openid, chat_message.write

**雇用主用LIFF**:
- サイズ: Full
- Endpoint URL: `https://your-domain.com/employer`
- Scope: profile, openid

### 3. 動作確認

```bash
npm run dev
npx ngrok http 3000
```

LINEアプリでLIFF URLを開く：
- 求職者: `https://liff.line.me/your-job-seeker-liff-id`
- 雇用主: `https://liff.line.me/your-employer-liff-id`

## 📋 認証フロー

### 求職者
```
LIFF URL → / → LIFF認証 → ホーム画面
```

### 雇用主
```
LIFF URL → /employer → LIFF認証 → 求人管理画面
```

**重要**: ログイン画面は表示されません。自動的にLINE認証が実行されます。

## ⚙️ Endpoint URL設定

### ✅ 正しい設定

```
求職者: https://your-domain.com
雇用主: https://your-domain.com/employer
```

### ❌ 間違った設定

```
❌ https://your-domain.com/
❌ https://your-domain.com/login
❌ https://your-domain.com/employer/
❌ https://your-domain.com/employer/login
```

## 🔒 ロール管理

- 初回登録時にLIFF URLに応じてロールが自動設定される
- 既存ユーザーのロールは変更されない
- 求職者が雇用主用リンクを開いてもロールは変わらない

## 🐛 トラブルシューティング

### エラー: "page error"

**原因**: Endpoint URLが間違っている

**解決策**:
1. LINE Developers ConsoleでEndpoint URLを確認
2. 末尾のスラッシュがないか確認
3. ngrokが起動しているか確認

### エラー: "LIFF not initialized"

**原因**: 環境変数が設定されていない

**解決策**:
1. `.env.local`を確認
2. LIFF IDが正しいか確認
3. サーバーを再起動

---

詳細は[docs/QUICK_START.md](./QUICK_START.md)を参照してください。
