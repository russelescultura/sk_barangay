import { NextRequest, NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { status, notes } = body

    if (!status || !['APPROVED', 'REJECTED', 'PENDING'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be APPROVED, REJECTED, or PENDING' },
        { status: 400 }
      )
    }

    const revenue = await prisma.revenue.update({
      where: { id: params.id },
      data: {
        status,
        updatedAt: new Date(),
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

    return NextResponse.json({ revenue })
  } catch (error) {
    console.error('Error updating revenue:', error)
    return NextResponse.json(
      { error: 'Failed to update revenue' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.revenue.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Revenue deleted successfully' })
  } catch (error) {
    console.error('Error deleting revenue:', error)
    return NextResponse.json(
      { error: 'Failed to delete revenue' },
      { status: 500 }
    )
  }
} 