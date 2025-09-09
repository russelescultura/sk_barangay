import { NextRequest, NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { referenceCode } = await request.json()

    if (!referenceCode) {
      return NextResponse.json(
        { error: 'Reference code is required' },
        { status: 400 }
      )
    }

    // Clean the reference code (remove SK- prefix if present)
    const cleanReferenceCode = referenceCode.replace(/^SK-/i, '')

    // Find the submission by ID
    const submission = await prisma.formSubmission.findUnique({
      where: { id: cleanReferenceCode },
      include: {
        form: {
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
            }
          }
        }
      }
    })

    if (!submission) {
      return NextResponse.json(
        { error: 'Submission not found. Please check your reference code and try again.' },
        { status: 404 }
      )
    }

    // Parse submission data
    let formData = {}
    try {
      formData = JSON.parse(submission.data)
    } catch (error) {
      console.error('Error parsing submission data:', error)
      formData = {}
    }

    // Extract user name from form data
    const getUserName = (data: any) => {
      // Look for common name field variations
      return data['Enter you full name'] ||
        data['Enter You Full Name'] || 
        data['Enter Your Full Name'] || 
        data['Full Name'] || 
        data['Full name'] ||
        data['Name'] || 
        data['fullName'] || 
        data['name'] ||
        'Anonymous User'
    }

    // Extract files from form data
    const getUploadedFiles = (data: any) => {
      const files: Array<{ fieldName: string, filePath: string, fileName: string }> = []
      
      Object.entries(data).forEach(([key, value]) => {
        if (typeof value === 'string' && value.startsWith('/uploads/submissions/')) {
          // Extract original filename from the path
          const pathParts = value.split('-')
          const originalName = pathParts.length > 2 ? 
            pathParts.slice(2).join('-') : 
            value.split('/').pop() || key
          
          files.push({
            fieldName: key,
            filePath: value,
            fileName: originalName
          })
        }
      })
      
      return files
    }

    const response = {
      submission: {
        id: submission.id,
        referenceCode: `SK-${submission.id}`,
        status: submission.status,
        submittedAt: submission.submittedAt,
        reviewedAt: submission.reviewedAt,
        notes: submission.notes,
        submitterName: getUserName(formData)
      },
      form: {
        id: submission.form.id,
        title: submission.form.title,
        type: submission.form.type
      },
      event: submission.form.event ? {
        id: submission.form.event.id,
        title: submission.form.event.title
      } : null,
      program: submission.form.event?.program ? {
        id: submission.form.event.program.id,
        title: submission.form.event.program.title
      } : null,
      formData,
      uploadedFiles: getUploadedFiles(formData)
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Error tracking submission:', error)
    return NextResponse.json(
      { error: 'Failed to track submission. Please try again.' },
      { status: 500 }
    )
  }
}
