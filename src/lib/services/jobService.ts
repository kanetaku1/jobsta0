import { prisma } from '@/lib/prisma'
import type { CreateJobData, JobWithWaitingRoomInfo, UpdateJobData } from '@/types'

export class JobService {
  /**
   * 全求人を取得する
   */
  static async getAllJobs(): Promise<JobWithWaitingRoomInfo[]> {
    try {
      const jobs = await prisma.job.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          waitingRoom: {
            include: {
              groups: {
                include: {
                  _count: { select: { members: true } },
                  leader: {
                    select: { id: true, name: true, avatar: true }
                  },
                  members: {
                    include: {
                      user: {
                        select: { id: true, name: true, avatar: true }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      })
      return jobs
    } catch (error) {
      console.error('Failed to fetch all jobs:', error)
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      })
      throw new Error('求人の取得に失敗しました')
    }
  }

  /**
   * 雇用主が作成した求人を取得する
   */
  static async getEmployerJobs(employerId: number): Promise<JobWithWaitingRoomInfo[]> {
    try {
      const jobs = await prisma.job.findMany({
        where: { creatorId: employerId },
        orderBy: { createdAt: 'desc' },
        include: {
          waitingRoom: {
            include: {
              groups: {
                include: {
                  _count: { select: { members: true } },
                  leader: {
                    select: { id: true, name: true, avatar: true }
                  },
                  members: {
                    include: {
                      user: {
                        select: { id: true, name: true, avatar: true }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      })
      
      return jobs
    } catch (error) {
      console.error('Failed to fetch employer jobs:', error)
      throw new Error('求人の取得に失敗しました')
    }
  }

  /**
   * 求人をIDで取得する
   */
  static async getJobById(id: number): Promise<JobWithWaitingRoomInfo | null> {
    try {
      // IDの検証
      if (!id || isNaN(id) || id <= 0) {
        console.error('Invalid job ID:', id)
        throw new Error('無効な求人IDです')
      }

      const job = await prisma.job.findUnique({
        where: { id },
        include: {
          waitingRoom: {
            include: {
              groups: {
                include: {
                  leader: {
                    select: { id: true, name: true, avatar: true }
                  },
                  members: {
                    include: {
                      user: {
                        select: { id: true, name: true, avatar: true }
                      }
                    }
                  },
                  _count: { select: { members: true } }
                }
              }
            }
          }
        }
      })
      
      if (!job) {
        console.log('Job not found for ID:', id)
        return null
      }
      
      return job
    } catch (error) {
      console.error('Failed to fetch job with ID:', id)
      console.error('Error type:', typeof error)
      console.error('Error constructor:', error?.constructor?.name)
      console.error('Error message:', error instanceof Error ? error.message : 'Unknown error')
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
      console.error('Full error object:', error)
      
      // より具体的なエラーメッセージを提供
      if (error instanceof Error) {
        if (error.message.includes('Record to find does not exist')) {
          throw new Error('指定された求人が見つかりません')
        } else if (error.message.includes('Invalid value')) {
          throw new Error('無効な求人IDです')
        } else if (error.message.includes('connection')) {
          throw new Error('データベース接続エラーが発生しました')
        }
      }
      
      throw new Error('求人の取得に失敗しました')
    }
  }

  /**
   * 求人を作成する
   */
  static async createJob(data: CreateJobData) {
    return await prisma.job.create({
      data: {
        title: data.title,
        description: data.description,
        wage: data.wage,
        jobDate: data.jobDate,
        maxMembers: data.maxMembers,
        creatorId: data.employerId,
        location: data.location,
        requirements: data.requirements,
        status: 'ACTIVE'
      }
    })
  }

  /**
   * 求人を更新する
   */
  static async updateJob(id: number, data: UpdateJobData) {
    try {
      const job = await prisma.job.update({
        where: { id },
        data: {
          ...data,
          jobDate: data.jobDate ? new Date(data.jobDate) : undefined,
        },
      })
      return job
    } catch (error) {
      console.error('Failed to update job:', error)
      throw new Error('求人の更新に失敗しました')
    }
  }

  /**
   * 求人を削除する
   */
  static async deleteJob(id: number): Promise<void> {
    try {
      await prisma.job.delete({
        where: { id },
      })
    } catch (error) {
      console.error('Failed to delete job:', error)
      throw new Error('求人の削除に失敗しました')
    }
  }

  /**
   * 求人の応募者情報を取得する
   */
  static async getJobApplications(jobId: number) {
    try {
      const job = await prisma.job.findUnique({
        where: { id: jobId },
        include: {
          waitingRoom: {
            include: {
              groups: {
                include: {
                  leader: {
                    select: { id: true, name: true }
                  },
                  members: {
                    include: {
                      user: {
                        select: { id: true, name: true, phone: true }
                      }
                    }
                  },
                  applications: {
                    include: {
                      user: {
                        select: { id: true, name: true, phone: true }
                      }
                    }
                  }
                }
              }
            }
          },
          // 個人応募も取得
          applications: {
            where: { groupId: null },
            include: {
              user: {
                select: { id: true, name: true, phone: true }
              }
            }
          }
        }
      })
      return job
    } catch (error) {
      console.error('Failed to fetch job applications:', error)
      throw new Error('応募者情報の取得に失敗しました')
    }
  }
}
