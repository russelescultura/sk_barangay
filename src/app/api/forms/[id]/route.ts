import { NextRequest, NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const form = await prisma.form.findUnique({
      where: { id: params.id },
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
        submissions: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                profileImage: true,
              },
            },
          },
          orderBy: {
            submittedAt: 'desc',
          },
        },
      },
    })

    if (!form) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 })
    }

    // Since fields are stored as a JSON string, parse them before sending.
    let parsedFields: any[] = []
    try {
      const fieldsString = form.fields as string || '[]'
      let fieldsData = JSON.parse(fieldsString)
      
      // Handle double-encoded JSON strings
      if (typeof fieldsData === 'string') {
        fieldsData = JSON.parse(fieldsData)
      }
      
      console.log('Final parsed fields data:', fieldsData)
      console.log('Is array?', Array.isArray(fieldsData))
      
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
        console.error('Still not an array after double parsing:', fieldsData)
        parsedFields = []
      }
    } catch (parseError) {
      console.error(`Error parsing fields for form ${params.id}:`, parseError)
      console.error('Raw fields data:', form.fields)
      parsedFields = []
    }

    const parsedForm = {
      ...form,
      fields: parsedFields,
    }

    return NextResponse.json({ form: parsedForm })
  } catch (error) {
    console.error(`Error fetching form ${params.id}:`, error)
    // It's possible the JSON parsing fails if the string is malformed.
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Failed to parse form fields' },
        { status: 500 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to fetch form' },
      { status: 500 }
    )
  }
}
