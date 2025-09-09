import { NextRequest, NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const formsFromDb = await prisma.form.findMany({
      include: {
        event: {
          include: {
            program: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
        submissions: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    const forms = formsFromDb.map((form) => {
      let parsedFields: any[] = []
      try {
        const fieldsString = form.fields as string || '[]'
        let fieldsData = JSON.parse(fieldsString)
        
        // Handle double-encoded JSON strings
        if (typeof fieldsData === 'string') {
          fieldsData = JSON.parse(fieldsData)
        }
        
        // Now it should be a proper array
        if (Array.isArray(fieldsData)) {
          // Handle legacy forms that don't have 'id' field
          parsedFields = fieldsData.map((field: any, index: number) => ({
            id: field.id || `field-${index}`,
            name: field.name || '',
            label: field.label || '',
            type: field.type || 'text',
            required: field.required || false,
            options: field.options || [],
            min: field.min,
            max: field.max,
            placeholder: field.placeholder || '',
            qrCodeImage: field.qrCodeImage || null
          }))
        } else {
          console.error('Still not an array after double parsing for form:', form.id, fieldsData)
          parsedFields = []
        }
      } catch (error) {
        console.error(`Error parsing fields for form ${form.id}:`, error)
        parsedFields = []
      }
      
      return {
        ...form,
        fields: parsedFields
      }
    })

    return NextResponse.json({ forms })
  } catch (error) {
    console.error('Error fetching forms:', error)
    return NextResponse.json(
      { error: 'Failed to fetch forms' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      title,
      type,
      fields,
      fileUpload = false,
      gcashReceipt = false,
      qrCodeImage = null,
      submissionLimit = null,
      submissionDeadline = null,
      isActive = true,
      publishStatus = 'DRAFT',
      eventId
    } = body

    if (!title || !type || !fields || !eventId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create form
    const form = await prisma.form.create({
      data: {
        title,
        type,
        fields: JSON.stringify(fields),
        fileUpload,
        gcashReceipt,
        qrCodeImage,
        submissionLimit,
        submissionDeadline: submissionDeadline ? new Date(submissionDeadline) : null,
        isActive,
        publishStatus,
        eventId
      },
      include: {
        event: {
          include: {
            program: {
              select: {
                id: true,
                title: true
              }
            }
          }
        },
        submissions: true
      }
    })

    return NextResponse.json({ form }, { status: 201 })
  } catch (error) {
    console.error('Error creating form:', error)
    return NextResponse.json(
      { error: 'Failed to create form' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      id,
      title,
      type,
      fields,
      fileUpload = false,
      gcashReceipt = false,
      qrCodeImage = null,
      submissionLimit = null,
      submissionDeadline = null,
      isActive = true,
      publishStatus = 'DRAFT',
      eventId
    } = body

    if (!id || !title || !type || !fields || !eventId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Update form
    const form = await prisma.form.update({
      where: { id },
      data: {
        title,
        type,
        fields: JSON.stringify(fields),
        fileUpload,
        gcashReceipt,
        qrCodeImage,
        submissionLimit,
        submissionDeadline: submissionDeadline ? new Date(submissionDeadline) : null,
        isActive,
        publishStatus,
        eventId
      },
      include: {
        event: {
          include: {
            program: {
              select: {
                id: true,
                title: true
              }
            }
          }
        },
        submissions: true
      }
    })

    return NextResponse.json({ form }, { status: 200 })
  } catch (error) {
    console.error('Error updating form:', error)
    return NextResponse.json(
      { error: 'Failed to update form' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Form ID is required' },
        { status: 400 }
      )
    }

    // Delete form (this will also delete associated submissions due to cascade)
    await prisma.form.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Form deleted successfully' }, { status: 200 })
  } catch (error) {
    console.error('Error deleting form:', error)
    return NextResponse.json(
      { error: 'Failed to delete form' },
      { status: 500 }
    )
  }
} 