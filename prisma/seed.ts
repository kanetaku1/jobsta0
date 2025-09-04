import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // テストユーザーを作成
  const employer = await prisma.user.upsert({
    where: { email: 'employer@test.com' },
    update: {},
    create: {
      email: 'employer@test.com',
      name: 'テスト雇用主',
      userType: 'EMPLOYER',
      companyName: 'テスト株式会社',
      companyAddress: '東京都渋谷区',
      companyPhone: '03-1234-5678'
    }
  })

  const worker1 = await prisma.user.upsert({
    where: { email: 'worker1@test.com' },
    update: {},
    create: {
      email: 'worker1@test.com',
      name: 'テスト労働者1',
      userType: 'WORKER',
      phone: '090-1234-5678',
      address: '東京都新宿区',
      emergencyContact: '090-8765-4321'
    }
  })

  const worker2 = await prisma.user.upsert({
    where: { email: 'worker2@test.com' },
    update: {},
    create: {
      email: 'worker2@test.com',
      name: 'テスト労働者2',
      userType: 'WORKER',
      phone: '090-2345-6789',
      address: '東京都品川区',
      emergencyContact: '090-7654-3210'
    }
  })

  // テスト求人を作成
  const job = await prisma.job.create({
    data: {
      title: 'テスト求人',
      description: 'これはテスト用の求人です',
      wage: 10000,
      jobDate: new Date('2024-12-25'),
      maxMembers: 5,
      creatorId: employer.id,
      location: '東京都渋谷区',
      requirements: '特にありません',
      status: 'ACTIVE'
    }
  })

  // 待機ルームを作成
  const waitingRoom = await prisma.waitingRoom.create({
    data: {
      jobId: job.id,
      isOpen: true,
      maxGroups: 3
    }
  })

  // テストグループを作成
  const group = await prisma.group.create({
    data: {
      name: 'テストグループ',
      waitingRoomId: waitingRoom.id,
      leaderId: worker1.id
    }
  })

  // グループメンバーを追加
  await prisma.groupUser.create({
    data: {
      groupId: group.id,
      userId: worker1.id,
      status: 'APPLYING'
    }
  })

  await prisma.groupUser.create({
    data: {
      groupId: group.id,
      userId: worker2.id,
      status: 'PENDING'
    }
  })

  console.log('シードデータが正常に作成されました')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
