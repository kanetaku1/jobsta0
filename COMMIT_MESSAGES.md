# コミットメッセージ

## オプション1: 1つのコミットにまとめる場合

```
refactor: グループ招待機能のリファクタリングとコンポーネント化

- 不要な個別招待リンクページを削除
- 不要な関数（generateInviteLink、getGroupAndMemberFromInvite）を削除
- グループ招待リンク表示モーダルをコンポーネント化（GroupInviteLinkModal）
- メンバーリスト表示をコンポーネント化（GroupMemberList）
- 求人情報表示をコンポーネント化（JobInfo）
- グループ関連のユーティリティ関数を共通化（utils/group.ts）
- 応募ページとグループ作成モーダルをリファクタリング
- デザイナーがUI調整しやすいようにコンポーネントを分離

変更内容:
- 削除: src/app/invite/[groupId]/[memberId]/page.tsx
- 新規: src/components/GroupInviteLinkModal.tsx
- 新規: src/components/GroupMemberList.tsx
- 新規: src/components/JobInfo.tsx
- 新規: src/utils/group.ts
- 修正: 複数ファイルのリファクタリング
```

## オプション2: 複数のコミットに分ける場合

### コミット1: 不要な機能の削除
```
refactor: 個別招待リンク機能を削除

グループ招待機能の変更に伴い、個別招待リンクページと関連関数を削除。
グループ全体の招待リンクのみを使用するように変更。

- 削除: src/app/invite/[groupId]/[memberId]/page.tsx
- 削除: generateInviteLink関数
- 削除: getGroupAndMemberFromInvite関数
```

### コミット2: コンポーネント化
```
refactor: UIコンポーネントを分離してデザイナーが調整しやすく

グループ招待リンク表示、メンバーリスト、求人情報表示を
独立したコンポーネントに分離。

- 新規: GroupInviteLinkModal - グループ招待リンク表示モーダル
- 新規: GroupMemberList - メンバーリスト表示コンポーネント
- 新規: JobInfo - 求人情報表示コンポーネント（variant対応）
- 新規: ApplicationToggle - 応募参加トグルコンポーネント
- 新規: ui/switch - Shadcn/ui Switchコンポーネント
```

### コミット3: 共通化とリファクタリング
```
refactor: グループ関連ロジックを共通化

グループ関連のユーティリティ関数を集約し、重複コードを削減。

- 新規: utils/group.ts - グループ関連ユーティリティ関数
  - getApprovedMembers
  - getParticipatingMembers
  - getMemberApplicationStatus
  - canSubmitApplication
- 修正: ApplyPageで新しいコンポーネントとユーティリティを使用
- 修正: GroupCreateModalでGroupInviteLinkModalを使用
- 修正: GroupInvitePageでJobInfoコンポーネントを使用
```

## 推奨

オプション2（複数のコミットに分ける）を推奨します。
理由:
1. 変更履歴が明確になる
2. レビューしやすい
3. 問題が発生した場合にロールバックしやすい
4. 各コミットの意図が明確

