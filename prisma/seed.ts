import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting seed...')

  // テストユーザー（EMPLOYER）を作成
  const employer = await prisma.user.upsert({
    where: { supabaseId: 'test-employer-supabase-id' },
    update: {},
    create: {
      supabaseId: 'test-employer-supabase-id',
      email: 'employer@example.com',
      name: 'テスト企業担当者',
      displayName: 'テスト企業',
      role: 'EMPLOYER',
    },
  })

  console.log('Created employer:', employer.id)

  // 単発バイトのサンプル（3件）
  const oneTimeJob1 = await prisma.job.create({
    data: {
      category: 'ONE_TIME_JOB',
      title: 'イベント会場スタッフ募集',
      summary: 'コンサート会場での案内・誘導業務です。お客様に快適にご利用いただけるよう、笑顔で対応してください。明るく元気な方、コミュニケーションが好きな方を歓迎します。',
      companyName: 'イベント運営株式会社',
      location: '東京都渋谷区〇〇1-2-3',
      jobDate: new Date('2026-02-15'),
      workHours: '10:00〜19:00（休憩1時間）',
      compensationType: 'HOURLY',
      compensationAmount: 1300,
      transportFee: 1000,
      recruitmentCount: 5,
      jobContent: `【業務内容】
・会場への案内・誘導
・入場管理
・お客様対応
・会場設営のサポート

【こんな方におすすめ】
・明るく元気な方
・コミュニケーションが好きな方
・チームワークを大切にできる方`,
      requirements: '未経験者歓迎、18歳以上',
      applicationDeadline: new Date('2026-02-10T23:59:00'),
      notes: '制服貸与、食事補助あり',
      employerId: employer.id,
    },
  })

  const oneTimeJob2 = await prisma.job.create({
    data: {
      category: 'ONE_TIME_JOB',
      title: '引っ越しアシスタント',
      summary: '引っ越し作業の補助スタッフを募集します。家具・家電の搬入出や梱包作業をお願いします。体力に自信がある方、チームで動くことが好きな方を歓迎します。',
      companyName: '引越しサービス株式会社',
      location: '埼玉県さいたま市',
      jobDate: new Date('2026-02-20'),
      workHours: '8:00〜17:00（休憩1時間）',
      compensationType: 'DAILY',
      compensationAmount: 12000,
      transportFee: 1500,
      recruitmentCount: 3,
      jobContent: `【業務内容】
・家具・家電の搬入出
・荷物の梱包・開梱
・トラックへの積み込み
・お客様宅の養生作業

【必要なスキル】
・体力に自信がある方
・チームで協力して作業できる方`,
      requirements: '18歳以上、体力に自信がある方',
      applicationDeadline: new Date('2026-02-15T23:59:00'),
      notes: '作業着・軍手貸与',
      externalUrl: 'https://example.com/moving-job',
      externalUrlTitle: '詳細な条件を見る',
      employerId: employer.id,
    },
  })

  const oneTimeJob3 = await prisma.job.create({
    data: {
      category: 'ONE_TIME_JOB',
      title: '試験監督スタッフ',
      summary: '大学入試の試験監督業務です。受験生の案内や試験中の監督業務を行います。静かで落ち着いた環境での勤務です。責任感を持って業務に取り組める方を募集しています。',
      companyName: '教育サポート株式会社',
      location: '東京都千代田区',
      jobDate: new Date('2026-02-25'),
      workHours: '7:30〜18:00（休憩あり）',
      compensationType: 'FIXED',
      compensationAmount: 10000,
      transportFee: 0,
      recruitmentCount: 10,
      jobContent: `【業務内容】
・受験生の受付・案内
・試験中の監督業務
・答案用紙の回収・確認
・会場の準備・片付け

【求める人物像】
・責任感がある方
・正確に作業できる方
・落ち着いて対応できる方`,
      requirements: '大学生以上、未経験可',
      applicationDeadline: new Date('2026-02-18T23:59:00'),
      notes: '昼食支給',
      employerId: employer.id,
    },
  })

  // 中長期アルバイトのサンプル（2件）
  const partTimeJob1 = await prisma.job.create({
    data: {
      category: 'PART_TIME',
      title: 'カフェスタッフ（長期歓迎）',
      summary: '人気カフェでのホールスタッフを募集します。お客様に美味しいコーヒーと笑顔を提供しましょう。未経験者歓迎、丁寧に指導します。シフトは週2日〜相談可能で、学業との両立も可能です。',
      companyName: 'おしゃれカフェ 渋谷店',
      location: '東京都渋谷区',
      startDate: new Date('2026-03-01'),
      workHours: '10:00〜22:00の間でシフト制（1日4時間〜）',
      isFlexibleSchedule: true,
      compensationType: 'HOURLY',
      compensationAmount: 1150,
      transportFee: 500,
      recruitmentCount: 2,
      jobContent: `【業務内容】
・オーダー受付
・ドリンク・フード提供
・レジ業務
・テーブルセッティング
・店内清掃

【おすすめポイント】
・未経験者歓迎！丁寧に指導します
・まかない付き
・おしゃれな制服支給`,
      requirements: '高校生可、週2日〜勤務可能な方',
      applicationDeadline: new Date('2026-02-28T23:59:00'),
      notes: 'まかない1食無料、交通費規定内支給',
      employerId: employer.id,
    },
  })

  const partTimeJob2 = await prisma.job.create({
    data: {
      category: 'PART_TIME',
      title: '書店スタッフ',
      summary: '大型書店での接客・品出しスタッフを募集します。本が好きな方、静かな環境で働きたい方におすすめです。社員割引あり、新刊情報にいち早く触れられます。週3日〜勤務可能です。',
      companyName: '大型書店チェーン 新宿店',
      location: '東京都新宿区',
      startDate: new Date('2026-03-15'),
      endDate: new Date('2026-09-30'),
      workHours: '平日 17:00〜21:00、土日 10:00〜19:00（シフト制）',
      isFlexibleSchedule: true,
      compensationType: 'HOURLY',
      compensationAmount: 1100,
      transportFee: 0,
      recruitmentCount: 3,
      jobContent: `【業務内容】
・レジ業務
・商品陳列・品出し
・在庫管理
・お客様への商品案内
・店内清掃

【特典】
・社員割引10%
・新刊情報にいち早く触れられる
・静かな環境で働ける`,
      requirements: '本が好きな方、週3日以上勤務可能な方',
      applicationDeadline: new Date('2026-03-10T23:59:00'),
      notes: '社員割引あり、制服貸与',
      employerId: employer.id,
    },
  })

  // インターンシップのサンプル（2件）
  const internship1 = await prisma.job.create({
    data: {
      category: 'INTERNSHIP',
      title: 'Webエンジニアインターン',
      summary: 'スタートアップ企業でのWebエンジニアインターンを募集します。実務経験を積みながら、最新技術に触れられます。メンターによる丁寧な指導あり。将来エンジニアを目指す学生におすすめです。',
      companyName: 'テックスタートアップ株式会社',
      location: '東京都港区（リモート可）',
      startDate: new Date('2026-04-01'),
      endDate: new Date('2026-09-30'),
      workHours: '週2〜3日、10:00〜19:00（休憩1時間）',
      compensationType: 'HOURLY',
      compensationAmount: 1500,
      transportFee: 1000,
      recruitmentCount: 2,
      jobContent: `【業務内容】
・Webアプリケーション開発補助
・機能追加・バグ修正
・コードレビュー参加
・技術ドキュメント作成

【学べること】
・React、Next.js、TypeScript
・実務でのチーム開発
・アジャイル開発手法
・コードレビューの受け方・書き方

【求める人物像】
・プログラミングに興味がある方
・学ぶ意欲が高い方
・チームでのコミュニケーションを大切にできる方`,
      requirements: '大学生・大学院生、基本的なプログラミング知識',
      applicationDeadline: new Date('2026-03-20T23:59:00'),
      notes: 'リモート勤務可、Mac貸与、書籍購入補助あり',
      externalUrl: 'https://example.com/engineer-intern',
      externalUrlTitle: 'インターン詳細ページ',
      employerId: employer.id,
    },
  })

  const internship2 = await prisma.job.create({
    data: {
      category: 'INTERNSHIP',
      title: 'マーケティングインターン',
      summary: 'SNSマーケティングやコンテンツ制作を学べるインターンです。実際の企画立案から運用まで経験できます。マーケティングに興味がある学生、将来起業を考えている方におすすめです。',
      companyName: 'マーケティング株式会社',
      location: '東京都渋谷区',
      startDate: new Date('2026-04-01'),
      endDate: new Date('2026-08-31'),
      workHours: '週3日、10:00〜18:00（休憩1時間）',
      compensationType: 'MONTHLY',
      compensationAmount: 50000,
      transportFee: 1000,
      recruitmentCount: 1,
      jobContent: `【業務内容】
・SNS運用（Instagram、Twitter、TikTok）
・コンテンツ企画・制作
・データ分析・レポート作成
・広告運用補助

【身につくスキル】
・SNSマーケティングの実務
・コンテンツ制作スキル
・データ分析力
・プレゼンテーション力`,
      requirements: '大学生・大学院生、SNSに興味がある方',
      applicationDeadline: new Date('2026-03-25T23:59:00'),
      notes: '月1回のフィードバック面談あり',
      employerId: employer.id,
    },
  })

  // ボランティアのサンプル（1件）
  const volunteer1 = await prisma.job.create({
    data: {
      category: 'VOLUNTEER',
      title: '地域清掃ボランティア',
      summary: '地域の公園や河川敷の清掃活動を行うボランティアスタッフを募集します。環境保護に興味がある方、地域貢献したい方を歓迎します。学生から社会人まで幅広い年代の方が参加されています。',
      companyName: 'NPO法人グリーンアース',
      location: '東京都世田谷区',
      jobDate: new Date('2026-03-10'),
      workHours: '9:00〜12:00',
      compensationType: 'NONE',
      transportFee: 0,
      recruitmentCount: 20,
      jobContent: `【活動内容】
・公園内の清掃
・河川敷のゴミ拾い
・植栽エリアの手入れ
・活動後の交流会

【こんな方におすすめ】
・環境問題に関心がある方
・地域貢献したい方
・新しい仲間と出会いたい方
・体を動かすことが好きな方`,
      requirements: '年齢不問、どなたでも参加可能',
      notes: '軍手・ゴミ袋支給、飲み物・軽食あり',
      employerId: employer.id,
    },
  })

  console.log('Created sample jobs:')
  console.log('- One-time jobs:', oneTimeJob1.id, oneTimeJob2.id, oneTimeJob3.id)
  console.log('- Part-time jobs:', partTimeJob1.id, partTimeJob2.id)
  console.log('- Internships:', internship1.id, internship2.id)
  console.log('- Volunteer:', volunteer1.id)

  console.log('Seed completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
