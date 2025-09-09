import { NextRequest, NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const revenues = await prisma.revenue.findMany({
      include: {
        program: {
          select: {
            id: true,
            title: true,
          },
        },
        formSubmission: {
          select: {
            id: true,
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({ revenues })
  } catch (error) {
    console.error('Error fetching revenues:', error)
    return NextResponse.json(
      { error: 'Failed to fetch revenues' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, description, amount, date, programId, source = 'MANUAL' } = body

    if (!title || !amount || !programId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const revenue = await prisma.revenue.create({
      data: {
        title,
        description,
        amount: parseFloat(amount),
        date: new Date(date),
        source,
        programId,
        status: 'PENDING',
      },
      include: {
        program: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    })

    return NextResponse.json({ revenue }, { status: 201 })
  } catch (error) {
    console.error('Error creating revenue:', error)
    return NextResponse.json(
      { error: 'Failed to create revenue' },
      { status: 500 }
    )
  }
} 