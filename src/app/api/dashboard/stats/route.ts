import { NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'

type RecentActivity = {
  id: string
  data: string
  submittedAt: Date | null
  user: { name: string | null; email: string | null } | null
  form: { title: string | null } | null
}

export async function GET() {
  try {
    console.log('Starting dashboard stats fetch...')
    
    // Test database connection first
    try {
      await prisma.$connect()
      console.log('Database connection successful')
    } catch (dbError) {
      console.error('Database connection failed:', dbError)
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      )
    }

    // Fetch all the required statistics with individual error handling
    let totalPrograms = 0
    let totalEvents = 0
    let totalSubmissions = 0
    let totalYouthProfiles = 0
    let totalContentPosts = 0
    let totalBudget = 0
    let recentActivities: RecentActivity[] = []

    try {
      totalPrograms = await prisma.program.count()
      console.log('Total Programs fetched:', totalPrograms)
    } catch (error) {
      console.error('Error fetching programs:', error)
    }

    try {
      totalEvents = await prisma.event.count()
      console.log('Total Events fetched:', totalEvents)
    } catch (error) {
      console.error('Error fetching events:', error)
    }

    try {
      totalSubmissions = await prisma.formSubmission.count()
      console.log('Total Submissions fetched:', totalSubmissions)
    } catch (error) {
      console.error('Error fetching submissions:', error)
    }

    try {
      totalYouthProfiles = await prisma.youthProfile.count()
      console.log('Total Youth Profiles fetched:', totalYouthProfiles)
    } catch (error) {
      console.error('Error fetching youth profiles:', error)
    }

    try {
      totalContentPosts = await prisma.content.count()
      console.log('Total Content Posts fetched:', totalContentPosts)
    } catch (error) {
      console.error('Error fetching content posts:', error)
    }

    try {
      const budgetResult = await prisma.revenue.aggregate({
        _sum: {
          amount: true
        }
      })
      totalBudget = budgetResult._sum.amount || 0
      console.log('Total Budget fetched:', totalBudget)
    } catch (error) {
      console.error('Error fetching budget:', error)
    }

    try {
      recentActivities = await prisma.formSubmission.findMany({
        take: 10,
        orderBy: {
          submittedAt: 'desc'
        },
        select: {
          id: true,
          data: true,
          submittedAt: true,
          user: {
            select: {
              name: true,
              email: true
            }
          },
          form: {
            select: {
              title: true
            }
          }
        }
      })
      console.log('Recent Activities fetched:', recentActivities.length)
    } catch (error) {
      console.error('Error fetching recent activities:', error)
    }

    // Debug logging
    console.log('Dashboard Stats Debug:')
    console.log('Total Programs:', totalPrograms)
    console.log('Total Events:', totalEvents)
    console.log('Total Submissions:', totalSubmissions)
    console.log('Total Youth Profiles:', totalYouthProfiles)
    console.log('Total Content Posts:', totalContentPosts)
    console.log('Total Budget:', totalBudget)

    // Transform recent activities
    const transformedActivities = recentActivities.map((activity: RecentActivity) => {
      let userName = 'Anonymous'
      
      // Try to get user name from the user record first
      if (activity.user?.name) {
        userName = activity.user.name
      } else {
        // Try to extract name from form data if no user record
        try {
          const formData = JSON.parse(activity.data)
          
          // Check for various name fields that might be in the form
          if (formData['Full Name']) {
            userName = formData['Full Name']
          } else if (formData.fullName) {
            userName = formData.fullName
          } else if (formData.name) {
            userName = formData.name
          } else if (formData.firstName && formData.lastName) {
            userName = `${formData.firstName} ${formData.lastName}`
          } else if (formData.firstName) {
            userName = formData.firstName
          } else if (formData.lastName) {
            userName = formData.lastName
          } else if (formData.submitterName) {
            userName = formData.submitterName
          } else if (formData.participantName) {
            userName = formData.participantName
          } else if (formData['Name']) {
            userName = formData['Name']
          }
        } catch (e) {
          // If parsing fails, keep as Anonymous
        }
      }
      
      return {
        user: userName,
        action: `Submitted ${activity.form?.title || 'a form'}`,
        time: activity.submittedAt ? new Date(activity.submittedAt).toLocaleDateString() : 'Just now'
      }
    })

    // Get monthly statistics for the last 4 months
    const now = new Date()
    const months = []
    for (let i = 3; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      months.push({
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        startDate: date,
        endDate: new Date(date.getFullYear(), date.getMonth() + 1, 0)
      })
    }

    // Initialize monthly stats arrays
    let programStats: { month: string; count: number }[] = []
    let eventStats: { month: string; count: number }[] = []
    let submissionStats: { month: string; count: number }[] = []
    let budgetStats: { month: string; amount: number }[] = []
    let youthProfileStats: { month: string; count: number }[] = []
    let contentPostStats: { month: string; count: number }[] = []

    // Fetch monthly statistics with error handling
    try {
      programStats = await Promise.all(months.map(async ({ month, startDate, endDate }) => {
        try {
          const count = await prisma.program.count({
            where: {
              createdAt: {
                gte: startDate,
                lte: endDate
              }
            }
          })
          return { month, count }
        } catch (error) {
          console.error(`Error fetching program stats for ${month}:`, error)
          return { month, count: 0 }
        }
      }))
    } catch (error) {
      console.error('Error fetching program stats:', error)
    }

    try {
      eventStats = await Promise.all(months.map(async ({ month, startDate, endDate }) => {
        try {
          const count = await prisma.event.count({
            where: {
              createdAt: {
                gte: startDate,
                lte: endDate
              }
            }
          })
          return { month, count }
        } catch (error) {
          console.error(`Error fetching event stats for ${month}:`, error)
          return { month, count: 0 }
        }
      }))
    } catch (error) {
      console.error('Error fetching event stats:', error)
    }

    try {
      submissionStats = await Promise.all(months.map(async ({ month, startDate, endDate }) => {
        try {
          const count = await prisma.formSubmission.count({
            where: {
              submittedAt: {
                gte: startDate,
                lte: endDate
              }
            }
          })
          return { month, count }
        } catch (error) {
          console.error(`Error fetching submission stats for ${month}:`, error)
          return { month, count: 0 }
        }
      }))
    } catch (error) {
      console.error('Error fetching submission stats:', error)
    }

    try {
      budgetStats = await Promise.all(months.map(async ({ month, startDate, endDate }) => {
        try {
          const result = await prisma.revenue.aggregate({
            where: {
              createdAt: {
                gte: startDate,
                lte: endDate
              }
            },
            _sum: {
              amount: true
            }
          })
          return { month, amount: result._sum.amount || 0 }
        } catch (error) {
          console.error(`Error fetching budget stats for ${month}:`, error)
          return { month, amount: 0 }
        }
      }))
    } catch (error) {
      console.error('Error fetching budget stats:', error)
    }

    try {
      youthProfileStats = await Promise.all(months.map(async ({ month, startDate, endDate }) => {
        try {
          const count = await prisma.youthProfile.count({
            where: {
              createdAt: {
                gte: startDate,
                lte: endDate
              }
            }
          })
          return { month, count }
        } catch (error) {
          console.error(`Error fetching youth profile stats for ${month}:`, error)
          return { month, count: 0 }
        }
      }))
    } catch (error) {
      console.error('Error fetching youth profile stats:', error)
    }

    try {
      contentPostStats = await Promise.all(months.map(async ({ month, startDate, endDate }) => {
        try {
          const count = await prisma.content.count({
            where: {
              createdAt: {
                gte: startDate,
                lte: endDate
              }
            }
          })
          return { month, count }
        } catch (error) {
          console.error(`Error fetching content post stats for ${month}:`, error)
          return { month, count: 0 }
        }
      }))
    } catch (error) {
      console.error('Error fetching content post stats:', error)
    }

    const stats = {
      totalPrograms,
      totalEvents,
      totalSubmissions,
      totalYouthProfiles,
      totalContentPosts,
      totalBudget,
      recentActivities: transformedActivities,
      programStats,
      eventStats,
      submissionStats,
      budgetStats,
      youthProfileStats,
      contentPostStats
    }

    console.log('Dashboard stats successfully generated')
    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard statistics', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  } finally {
    try {
      await prisma.$disconnect()
      console.log('Database connection closed')
    } catch (error) {
      console.error('Error closing database connection:', error)
    }
  }
}
