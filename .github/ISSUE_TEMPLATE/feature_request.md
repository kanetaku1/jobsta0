name: ✨ 機能要望
description: 新しい機能や改善アイデアを提案する
title: "[FEATURE] "
labels: [enhancement]
assignees: ''

body:
  - type: textarea
    id: feature-description
    attributes:
      label: 機能の説明
      description: 提案する機能が何か、なぜ必要かを書いてください
      placeholder: 例）友達と同時に応募できるようにしたい
    validations:
      required: true

  - type: textarea
    id: benefit
    attributes:
      label: ユーザーや開発者にとっての利点
      placeholder: 例）UX向上、再応募の手間削減など
    validations:
      required: true

  - type: textarea
    id: notes
    attributes:
      label: 実装案や補足
      placeholder: UI案、関連リンクなどがあれば記載
