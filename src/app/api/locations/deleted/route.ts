import { NextRequest, NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'

// GET /api/locations/deleted - Get all soft-deleted locations
export async function GET() {
  try {
    const deletedLocations = await prisma.location.findMany({
      where: { isActive: false },
      orderBy: { updatedAt: 'desc' }
    })

    return NextResponse.json(deletedLocations)
  } catch (error) {
    console.error('Error fetching deleted locations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch deleted locations' },
      { status: 500 }
    )
  }
}

// PATCH /api/locations/deleted - Restore a deleted location
export async function PATCH(request: NextRequest) {
  try {
    const { id } = await request.json()

    if (!id) {
      return NextResponse.json(
        { error: 'Location ID is required' },
        { status: 400 }
      )
    }

    const location = await prisma.location.update({
      where: { id },
      data: { isActive: true }
    })

    return NextResponse.json({ message: 'Location restored successfully', location })
  } catch (error) {
    console.error('Error restoring location:', error)
    return NextResponse.json(
      { error: 'Failed to restore location' },
      { status: 500 }
    )
  }
}