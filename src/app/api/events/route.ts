import { NextRequest, NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const events = await prisma.event.findMany({
      include: {
        program: {
          select: {
            id: true,
            title: true,
            status: true
          }
        },
        forms: {
          include: {
            submissions: {
              include: {
                form: {
                  select: {
                    id: true,
                    title: true
                  }
                },
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    profileImage: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: {
        dateTime: 'desc'
      }
    })

    return NextResponse.json({ events })
  } catch (error) {
    console.error('Error fetching events:', error)
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      title,
      description,
      dateTime,
      endDateTime,
      venue,
      maxParticipants,
      status = 'PLANNED',
      programId,
      assignedMemberIds = [],
      poster = null,
      attachments = null
    } = body

    if (!title || !description || !dateTime || !venue || !programId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create event with assigned members
    const event = await prisma.event.create({
      data: {
        title,
        description,
        dateTime: new Date(dateTime),
        endDateTime: endDateTime ? new Date(endDateTime) : null,
        venue,
        maxParticipants,
        status,
        poster,
        attachments,
        programId,
        // users: {
        //   connect: assignedMemberIds.map((id: string) => ({ id }))
        // }
      },
      include: {
        program: {
          select: {
            id: true,
            title: true,
            status: true
          }
        },
        // users: {
        //   select: {
        //     id: true,
        //     name: true,
        //     email: true,
        //     profileImage: true
        //   }
        // },
        forms: {
          include: {
            submissions: {
              include: {
                form: {
                  select: {
                    id: true,
                    title: true
                  }
                },
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    profileImage: true
                  }
                }
              }
            }
          }
        }
      }
    })

    return NextResponse.json({ event }, { status: 201 })
  } catch (error) {
    console.error('Error creating event:', error)
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    )
  }
} 