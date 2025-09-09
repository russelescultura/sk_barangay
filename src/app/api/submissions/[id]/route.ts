import { NextRequest, NextResponse } from 'next/server'

import { emailService } from '@/lib/email'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { status, reviewedBy, reviewedAt, notes } = body

    if (!status || !['APPROVED', 'REJECTED'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be APPROVED or REJECTED' },
        { status: 400 }
      )
    }

    // Get the submission with related data
    const submission = await prisma.formSubmission.findUnique({
      where: { id: params.id },
      include: {
        form: {
          select: {
            id: true,
            title: true,
            eventId: true,
            event: {
              select: {
                id: true,
                title: true,
                dateTime: true
              }
            }
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    if (!submission) {
      return NextResponse.json(
        { error: 'Submission not found' },
        { status: 404 }
      )
    }

    // Update the submission status
    const updatedSubmission = await prisma.formSubmission.update({
      where: { id: params.id },
      data: {
        status,
        reviewedBy: reviewedBy || 'Admin',
        reviewedAt: reviewedAt || new Date().toISOString(),
        notes: notes || null
      },
      include: {
        form: {
          select: {
            id: true,
            title: true,
            eventId: true,
            event: {
              select: {
                id: true,
                title: true,
                dateTime: true
              }
            }
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    // Send email notification if email is available
    let emailSent = false
    let emailError: string | null = null

    try {
      // Extract email from form data or user data
      let recipientEmail = submission.user?.email
      let recipientName = submission.user?.name || 'User'

      // Try to get email from form data if user email is not available
      if (!recipientEmail && submission.data) {
        try {
          const formData = JSON.parse(submission.data)
          recipientEmail = formData['Enter your Email Address'] || 
                          formData['Enter Your Email Address'] || 
                          formData['Email Address'] || 
                          formData['email'] || 
                          formData['Email'] || 
                          formData['emailAddress'] || 
                          formData['email_address']
          
          if (recipientEmail) {
            recipientName = formData['Enter your Name'] || 
                           formData['Enter Your Name'] || 
                           formData['Name'] || 
                           formData['name'] || 
                           'User'
          }
        } catch (parseError) {
          console.log('Could not parse form data for email extraction:', parseError)
        }
      }

      if (recipientEmail) {
        const emailData = {
          recipientEmail,
          recipientName,
          submissionTitle: 'Your Submission',
          formTitle: submission.form?.title || 'Form Submission',
          eventName: submission.form?.event?.title,
          eventDate: submission.form?.event?.dateTime ? new Date(submission.form.event.dateTime).toLocaleDateString() : '',
          status: status as 'APPROVED' | 'REJECTED',
          reviewerName: reviewedBy || 'Admin',
          reviewDate: new Date().toLocaleDateString(),
          notes: notes || undefined
        }

        emailSent = await emailService.sendSubmissionStatusEmail(emailData)
        
        if (emailSent) {
          console.log(`✅ Email notification sent successfully to ${recipientEmail}`)
        } else {
          console.log(`❌ Failed to send email notification to ${recipientEmail}`)
        }
      } else {
        console.log('No email address found for submission notification')
      }
    } catch (error) {
      console.error('Error sending email notification:', error)
      emailError = error instanceof Error ? error.message : 'Unknown error'
    }

    return NextResponse.json({
      submission: updatedSubmission,
      emailNotification: {
        sent: emailSent,
        error: emailError
      }
    })

  } catch (error) {
    console.error('Error updating submission:', error)
    return NextResponse.json(
      { error: 'Failed to update submission' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const submission = await prisma.formSubmission.findUnique({
      where: { id: params.id },
      include: {
        form: {
          select: {
            id: true,
            title: true,
            eventId: true,
            event: {
              select: {
                id: true,
                title: true,
                dateTime: true
              }
            }
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    if (!submission) {
      return NextResponse.json(
        { error: 'Submission not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ submission })
  } catch (error) {
    console.error('Error fetching submission:', error)
    return NextResponse.json(
      { error: 'Failed to fetch submission' },
      { status: 500 }
    )
  }
}
