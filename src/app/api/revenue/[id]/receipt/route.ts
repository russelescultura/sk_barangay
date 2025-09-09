import { writeFile } from 'fs/promises'
import path from 'path'

import { NextRequest, NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const formData = await request.formData()
    const files = formData.getAll('receipts') as File[]
    
    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files uploaded' },
        { status: 400 }
      )
    }

    const uploadedFiles: string[] = []

    for (const file of files) {
      if (!file.name) continue

      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)

      // Create unique filename
      const timestamp = Date.now()
      const fileName = `revenue-receipt-${params.id}-${timestamp}-${file.name}`
      const filePath = path.join(process.cwd(), 'public', 'uploads', 'receipts', fileName)

      // Ensure directory exists
      const uploadDir = path.dirname(filePath)
      await writeFile(filePath, buffer)

      // Store relative path for database
      const relativePath = `/uploads/receipts/${fileName}`
      uploadedFiles.push(relativePath)
    }

    // Update revenue with receipt paths
    const revenue = await prisma.revenue.update({
      where: { id: params.id },
      data: {
        receipt: uploadedFiles.join(','),
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

    return NextResponse.json({ 
      revenue,
      uploadedFiles 
    })
  } catch (error) {
    console.error('Error uploading receipts:', error)
    return NextResponse.json(
      { error: 'Failed to upload receipts' },
      { status: 500 }
    )
  }
} 