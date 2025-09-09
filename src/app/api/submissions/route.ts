import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

import { NextRequest, NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'

export async function GET() {
	try {
		const submissions = await prisma.formSubmission.findMany({
			orderBy: { submittedAt: 'desc' },
			include: {
				form: {
					select: { id: true, title: true, eventId: true }
				},
				user: {
					select: { id: true, name: true, email: true }
				}
			}
		})

		return NextResponse.json({ submissions })
	} catch (error) {
		console.error('Error fetching submissions:', error)
		return NextResponse.json(
			{ error: 'Failed to fetch submissions' },
			{ status: 500 }
		)
	}
}

export async function POST(request: NextRequest) {
	try {
		const contentType = request.headers.get('content-type') || ''
		
		let formId: string
		let submissionData: any
		const files: { [key: string]: File } = {}
		
		if (contentType.includes('multipart/form-data')) {
			// Handle form data with files
			const formData = await request.formData()
			formId = formData.get('formId') as string
			const dataString = formData.get('data') as string
			submissionData = dataString ? JSON.parse(dataString) : {}
			
			// Extract files
			for (const [key, value] of formData.entries()) {
				if (value instanceof File && key !== 'data' && key !== 'formId') {
					files[key] = value
				}
			}
		} else {
			// Handle JSON data
			const body = await request.json()
			formId = body.formId
			submissionData = typeof body.data === 'string' ? JSON.parse(body.data) : body.data
		}

		if (!formId) {
			return NextResponse.json(
				{ error: 'Form ID is required' },
				{ status: 400 }
			)
		}

		// Verify form exists and is active
		const form = await prisma.form.findUnique({
			where: { id: formId },
			include: {
				event: true
			}
		})

		if (!form) {
			return NextResponse.json(
				{ error: 'Form not found' },
				{ status: 404 }
			)
		}

		if (!form.isActive || form.publishStatus !== 'PUBLISHED') {
			return NextResponse.json(
				{ error: 'Form is not available for submissions' },
				{ status: 400 }
			)
		}

		// Check submission deadline
		if (form.submissionDeadline && new Date(form.submissionDeadline) < new Date()) {
			return NextResponse.json(
				{ error: 'Submission deadline has passed' },
				{ status: 400 }
			)
		}

		// Check submission limit
		if (form.submissionLimit) {
			const submissionCount = await prisma.formSubmission.count({
				where: { formId }
			})
			
			if (submissionCount >= form.submissionLimit) {
				return NextResponse.json(
					{ error: 'Submission limit reached' },
					{ status: 400 }
				)
			}
		}

		// Handle file uploads
		const fileUrls: { [key: string]: string } = {}
		if (Object.keys(files).length > 0) {
			const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'submissions')
			
			try {
				await mkdir(uploadDir, { recursive: true })
			} catch (error) {
				// Directory might already exist
			}

			for (const [fieldName, file] of Object.entries(files)) {
				if (file.size > 0) {
					const timestamp = Date.now()
					const fileName = `${fieldName}-${timestamp}-${file.name}`
					const filePath = path.join(uploadDir, fileName)
					
					const bytes = await file.arrayBuffer()
					const buffer = Buffer.from(bytes)
					
					await writeFile(filePath, buffer)
					fileUrls[fieldName] = `/uploads/submissions/${fileName}`
				}
			}
		}

		// Merge file URLs with submission data
		const finalSubmissionData = { ...submissionData, ...fileUrls }

		// Create submission
		const submission = await prisma.formSubmission.create({
			data: {
				formId,
				data: JSON.stringify(finalSubmissionData),
				submittedAt: new Date()
			}
		})

		return NextResponse.json(
			{ 
				message: 'Form submitted successfully',
				submission: {
					id: submission.id,
					submittedAt: submission.submittedAt
				}
			},
			{ status: 201 }
		)

	} catch (error) {
		console.error('Error submitting form:', error)
		return NextResponse.json(
			{ error: 'Failed to submit form. Please try again.' },
			{ status: 500 }
		)
	}
}

