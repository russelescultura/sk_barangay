import { NextRequest, NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const event = await prisma.event.findUnique({
      where: { id: params.id },
      include: {
        program: {
          select: {
            id: true,
            title: true,
            status: true
          }
        },
        // assignedMembers: {
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

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ event })
  } catch (error) {
    console.error('Error fetching event:', error)
    return NextResponse.json(
      { error: 'Failed to fetch event' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    
    const {
      title,
      description,
      dateTime,
      endDateTime,
      venue,
      maxParticipants,
      status,
      programId,
      assignedMemberIds = [],
      poster,
      attachments
    } = body

    if (!title || !description || !dateTime || !venue || !programId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if event exists
    const existingEvent = await prisma.event.findUnique({
      where: { id: params.id }
    })

    if (!existingEvent) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    // Update event
    const event = await prisma.event.update({
      where: { id: params.id },
      data: {
        title,
        description,
        dateTime: new Date(dateTime),
        endDateTime: endDateTime ? new Date(endDateTime) : null,
        venue,
        maxParticipants: maxParticipants ? parseInt(maxParticipants) : null,
        status,
        poster,
        attachments,
        programId,
        // assignedMembers: {
        //   set: [], // Clear existing assignments
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
        // assignedMembers: {
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

    return NextResponse.json({ event })
  } catch (error) {
    console.error('Error updating event:', error)
    return NextResponse.json(
      { error: 'Failed to update event' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if event exists
    const existingEvent = await prisma.event.findUnique({
      where: { id: params.id },
      include: {
        forms: {
          include: {
            submissions: true
          }
        }
      }
    })

    if (!existingEvent) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    // Check if event has forms with submissions
    const hasSubmissions = existingEvent.forms.some(form => form.submissions.length > 0)
    
    if (hasSubmissions) {
      return NextResponse.json(
        { error: 'Cannot delete event with existing form submissions' },
        { status: 400 }
      )
    }

    // Delete event (this will cascade delete forms due to the schema relationship)
    await prisma.event.delete({
      where: { id: params.id }
    })

    return NextResponse.json(
      { message: 'Event deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting event:', error)
    return NextResponse.json(
      { error: 'Failed to delete event' },
      { status: 500 }
    )
  }
} 