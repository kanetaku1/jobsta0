name: 🐛 バグ報告
description: バグを報告して修正を依頼する
title: "[BUG] "
labels: [bug]
assignees: ''

body:
  - type: textarea
    id: what-happened
    attributes:
      label: 問題の内容
      description: 何が起きたか、どのように再現できるかを詳しく記述してください
      placeholder: 例）ログインボタンを押しても反応しない
    validations:
      required: true

  - type: textarea
    id: expected
    attributes:
      label: 期待する挙動
      placeholder: 例）ログインに成功し、マイページに遷移する
    validations:
      required: true

  - type: input
    id: browser
    attributes:
      label: 使用環境（ブラウザやOS）
      placeholder: 例）Chrome 114, iOS 17

  - type: input
    id: related
    attributes:
      label: 関連Issue/PR
      placeholder: #123
