import { NextRequest, NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'

interface FormField {
  id: string
  name: string
  label: string
  type: string
  required?: boolean
  placeholder?: string
}

interface SubmissionData {
  [key: string]: string
}

export async function POST() {
  try {
    // Get all approved form submissions
    const approvedSubmissions = await prisma.formSubmission.findMany({
      where: {
        status: 'APPROVED'
      },
      include: {
        form: {
          include: {
            event: {
              include: {
                program: true
              }
            }
          }
        },
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    console.log(`Found ${approvedSubmissions.length} approved submissions`)

    let createdRevenues = 0
    let skippedRevenues = 0

    for (const submission of approvedSubmissions) {
      console.log(`Processing submission ${submission.id}`)
      console.log(`Form fields raw:`, submission.form.fields)
      console.log(`Submission data raw:`, submission.data)
      
      // Parse form fields from JSON string
      let formFields: FormField[] = []
      let submissionData: SubmissionData = {}
      
      try {
        let parsedFields = JSON.parse(submission.form.fields)
        console.log(`Initial parsed form fields:`, parsedFields)
        
        // Handle double-encoded JSON strings
        if (typeof parsedFields === 'string') {
          console.log('Fields is a string, parsing again...')
          parsedFields = JSON.parse(parsedFields)
          console.log(`Double-parsed form fields:`, parsedFields)
        }
        
        // Handle different data structures for form fields
        if (Array.isArray(parsedFields)) {
          formFields = parsedFields
        } else if (parsedFields && typeof parsedFields === 'object') {
          if (parsedFields.fields && Array.isArray(parsedFields.fields)) {
            formFields = parsedFields.fields
          } else if (parsedFields.formFields && Array.isArray(parsedFields.formFields)) {
            formFields = parsedFields.formFields
          } else {
            formFields = Object.values(parsedFields).filter((item: any): item is FormField => 
              Boolean(item && typeof item === 'object' && item !== null && 'type' in item)
            )
          }
        }
        
        // Parse submission data
        const parsedData = JSON.parse(submission.data)
        console.log(`Parsed submission data:`, parsedData)
        
        if (typeof parsedData === 'object' && parsedData !== null) {
          submissionData = parsedData
        }
        
        console.log(`Processed formFields:`, formFields)
        console.log(`Processed submissionData:`, submissionData)
        
        // Debug: Log each field to see what we have
        formFields.forEach((field, index) => {
          console.log(`Field ${index}:`, field)
          console.log(`Field ${index} type:`, field.type)
          console.log(`Field ${index} name:`, field.name)
        })
        
      } catch (error) {
        console.log('Could not parse form fields or submission data for submission:', submission.id, error)
        continue
      }

      // Ensure formFields is an array before filtering
      if (!Array.isArray(formFields)) {
        console.log(`FormFields is not an array for submission ${submission.id}:`, formFields)
        continue
      }

      // Find GCash receipt fields - add more detailed logging
      console.log(`Total form fields: ${formFields.length}`)
      const gcashFields = formFields.filter((field: any) => {
        console.log(`Checking field:`, field)
        console.log(`Field type: ${field.type}, checking if === 'gcashReceipt'`)
        const isGcashField = Boolean(field && typeof field.type === 'string' && field.type === 'gcashReceipt')
        console.log(`Is GCash field: ${isGcashField}`)
        return isGcashField
      })

      console.log(`Found ${gcashFields.length} GCash receipt fields`)

      for (const gcashField of gcashFields) {
        // Get the value from submission data using the field name
        const fieldValue = submissionData[gcashField.name]
        const amountValue = submissionData[`${gcashField.name}_amount`]
        const receiptValue = submissionData[`${gcashField.name}_receipt`]
        
        console.log(`Field ${gcashField.name} value:`, fieldValue)
        console.log(`Field ${gcashField.name}_amount:`, amountValue)
        console.log(`Field ${gcashField.name}_receipt:`, receiptValue)
        
        if (!amountValue) {
          console.log(`No amount found for field ${gcashField.name}`)
          continue
        }

        // Try to extract amount from the amount field
        let amount = 0
        try {
          amount = parseFloat(amountValue)
        } catch {
          console.log(`Could not parse amount: ${amountValue}`)
          continue
        }
        
        console.log(`Extracted amount: ${amount}`)
        
        if (amount <= 0) {
          console.log(`Amount is 0 or negative, skipping`)
          continue
        }

        // Check if revenue already exists for this submission and field
        const existingRevenue = await prisma.revenue.findFirst({
          where: {
            formSubmissionId: submission.id,
            source: 'GCASH'
          }
        })

        console.log(`Checking for existing revenue for submission ${submission.id}:`, existingRevenue)

        // Prevent duplicate entries
        if (existingRevenue) {
          console.log(`Revenue already exists for submission ${submission.id}, skipping`)
          skippedRevenues++
          continue
        }

        console.log(`Creating revenue entry for submission ${submission.id} with amount ${amount}`)

        // Create revenue entry
        await prisma.revenue.create({
          data: {
            title: `GCash Payment - ${gcashField.label || 'Payment'}`,
            description: `Automatic revenue from form submission by ${submissionData['Full Name'] || submissionData['fullName'] || submissionData['name'] || submission.user?.name || 'User'}`,
            amount,
            source: 'GCASH',
            date: submission.submittedAt,
            status: 'APPROVED', // Auto-approve since form is already approved
            programId: submission.form.event.program.id,
            formSubmissionId: submission.id,
            receipt: receiptValue || null
          }
        })

        console.log(`Created revenue entry for ₱${amount}`)
        createdRevenues++
      }
    }

    return NextResponse.json({
      message: 'GCash revenue sync completed',
      created: createdRevenues,
      skipped: skippedRevenues,
      totalProcessed: approvedSubmissions.length
    })
  } catch (error) {
    console.error('Error syncing GCash revenue:', error)
    return NextResponse.json(
      { error: 'Failed to sync GCash revenue' },
      { status: 500 }
    )
  }
} 