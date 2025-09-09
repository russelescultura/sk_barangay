import { NextRequest, NextResponse } from 'next/server'

import pool from '@/lib/db'

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
	try {
		const [rows] = await pool.execute(`
			SELECT 
				id,
				title,
				description,
				type,
				status,
				thumbnail,
				tags,
				createdAt,
				updatedAt,
				authorId,
				featured,
				\`order\`,
				fileUrl,
				fileUrls,
				thumbnailMode,
				selectedThumbnails
			FROM content
			WHERE id = ?
		`, [params.id]) as any

		if (!rows || rows.length === 0) {
			return NextResponse.json(
				{ error: 'Content not found' },
				{ status: 404 }
			)
		}

		const content = rows[0]
		return NextResponse.json({
			id: content.id,
			title: content.title,
			description: content.description,
			type: content.type,
			status: content.status,
			thumbnail: content.thumbnail || null,
			tags: content.tags || null,
			createdAt: content.createdAt,
			updatedAt: content.updatedAt,
			featured: Boolean(content.featured),
			order: content.order || 0,
			fileUrl: content.fileUrl || null,
			fileUrls: content.fileUrls && typeof content.fileUrls === 'string' && content.fileUrls.trim() !== '' ? JSON.parse(content.fileUrls) : null,
			thumbnailMode: content.thumbnailMode || 'SINGLE',
			selectedThumbnails: content.selectedThumbnails && typeof content.selectedThumbnails === 'string' && content.selectedThumbnails.trim() !== '' ? JSON.parse(content.selectedThumbnails) : null,
			author: { name: 'SK Barangay Tulay' }
		})
	} catch (error) {
		console.error('Error fetching content:', error)
		return NextResponse.json(
			{ error: 'Failed to fetch content' },
			{ status: 500 }
		)
	}
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
	try {
		const contentType = request.headers.get('content-type') || ''
		let body: any = {}

		if (contentType.includes('application/json')) {
			body = await request.json()
		} else if (contentType.includes('multipart/form-data')) {
			const formData = await request.formData()
			
			// For now, just process the form data without file uploads
			// File uploads should be handled via the dedicated /api/upload endpoint
			body = {
				title: formData.get('title') as string,
				description: formData.get('description') as string,
				type: formData.get('type') as string,
				status: formData.get('status') as string,
				thumbnail: formData.get('thumbnail') as string,
				tags: formData.get('tags') as string,
				featured: formData.get('featured') === 'true',
				order: parseInt(formData.get('order') as string) || 0,
				fileUrl: formData.get('fileUrl') as string,
				fileUrls: formData.get('fileUrls') as string,
				thumbnailMode: formData.get('thumbnailMode') as string,
				selectedThumbnails: formData.get('selectedThumbnails') as string,
			}
		} else {
			try {
				body = await request.json()
			} catch (e) {
				return NextResponse.json(
					{ error: 'Invalid request format. Expected JSON or FormData.' },
					{ status: 400 }
				)
			}
		}

		const {
			title,
			description,
			type,
			status,
			thumbnail,
			tags,
			featured,
			order,
			fileUrl,
			fileUrls,
			thumbnailMode,
			selectedThumbnails,
		} = body

		if (!title || !type) {
			return NextResponse.json(
				{ error: 'Title and type are required' },
				{ status: 400 }
			)
		}

		// Handle JSON parsing for arrays/objects
		let parsedFileUrls = null
		let parsedSelectedThumbnails = null

		if (fileUrls && typeof fileUrls === 'string' && fileUrls.trim() !== '' && fileUrls !== '[]') {
			try {
				parsedFileUrls = typeof fileUrls === 'string' ? JSON.parse(fileUrls) : fileUrls
			} catch (e) {
				parsedFileUrls = fileUrls
			}
		}

		if (selectedThumbnails && typeof selectedThumbnails === 'string' && selectedThumbnails.trim() !== '' && selectedThumbnails !== '[]') {
			try {
				parsedSelectedThumbnails = typeof selectedThumbnails === 'string' ? JSON.parse(selectedThumbnails) : selectedThumbnails
			} catch (e) {
				parsedSelectedThumbnails = selectedThumbnails
			}
		}

		// For updates, we don't change the authorId, so no need to check foreign key constraints
		await pool.execute(`
			UPDATE content SET 
				title = ?, 
				description = ?, 
				type = ?, 
				status = ?, 
				thumbnail = ?, 
				tags = ?, 
				featured = ?, 
				\`order\` = ?, 
				fileUrl = ?, 
				fileUrls = ?, 
				thumbnailMode = ?, 
				selectedThumbnails = ?, 
				updatedAt = NOW()
			WHERE id = ?
		`, [
			title,
			description || null,
			type,
			status || 'DRAFT',
			thumbnail || null,
			tags || null,
			featured || false,
			order || 0,
			fileUrl || null,
			parsedFileUrls ? JSON.stringify(parsedFileUrls) : null,
			thumbnailMode || 'SINGLE',
			parsedSelectedThumbnails ? JSON.stringify(parsedSelectedThumbnails) : null,
			params.id
		])

		return NextResponse.json({ message: 'Content updated successfully' })
	} catch (error) {
		console.error('Error updating content:', error)
		return NextResponse.json(
			{ error: 'Failed to update content' },
			{ status: 500 }
		)
	}
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
	try {
		const contentType = request.headers.get('content-type') || ''
		let body: any = {}

		if (contentType.includes('application/json')) {
			body = await request.json()
		} else if (contentType.includes('multipart/form-data')) {
			const formData = await request.formData()
			
			// Process form data for partial updates
			body = {}
			if (formData.has('title')) body.title = formData.get('title') as string
			if (formData.has('description')) body.description = formData.get('description') as string
			if (formData.has('type')) body.type = formData.get('type') as string
			if (formData.has('status')) body.status = formData.get('status') as string
			if (formData.has('thumbnail')) body.thumbnail = formData.get('thumbnail') as string
			if (formData.has('tags')) body.tags = formData.get('tags') as string
			if (formData.has('featured')) body.featured = formData.get('featured') === 'true'
			if (formData.has('order')) body.order = parseInt(formData.get('order') as string) || 0
			if (formData.has('fileUrl')) body.fileUrl = formData.get('fileUrl') as string
			if (formData.has('fileUrls')) body.fileUrls = formData.get('fileUrls') as string
			if (formData.has('thumbnailMode')) body.thumbnailMode = formData.get('thumbnailMode') as string
			if (formData.has('selectedThumbnails')) body.selectedThumbnails = formData.get('selectedThumbnails') as string
		} else {
			try {
				body = await request.json()
			} catch (e) {
				return NextResponse.json(
					{ error: 'Invalid request format. Expected JSON or FormData.' },
					{ status: 400 }
				)
			}
		}

		// Check if at least one field is provided for update
		if (Object.keys(body).length === 0) {
			return NextResponse.json(
				{ error: 'At least one field must be provided for update' },
				{ status: 400 }
			)
		}

		// Build dynamic UPDATE query based on provided fields
		const updateFields: string[] = []
		const updateValues: any[] = []

		if (body.title !== undefined) {
			updateFields.push('title = ?')
			updateValues.push(body.title)
		}
		if (body.description !== undefined) {
			updateFields.push('description = ?')
			updateValues.push(body.description)
		}
		if (body.type !== undefined) {
			updateFields.push('type = ?')
			updateValues.push(body.type)
		}
		if (body.status !== undefined) {
			updateFields.push('status = ?')
			updateValues.push(body.status)
		}
		if (body.thumbnail !== undefined) {
			updateFields.push('thumbnail = ?')
			updateValues.push(body.thumbnail)
		}
		if (body.tags !== undefined) {
			updateFields.push('tags = ?')
			updateValues.push(body.tags)
		}
		if (body.featured !== undefined) {
			updateFields.push('featured = ?')
			updateValues.push(body.featured)
		}
		if (body.order !== undefined) {
			updateFields.push('`order` = ?')
			updateValues.push(body.order)
		}
		if (body.fileUrl !== undefined) {
			updateFields.push('fileUrl = ?')
			updateValues.push(body.fileUrl)
		}
		if (body.fileUrls !== undefined) {
			let parsedFileUrls = null
			if (body.fileUrls && typeof body.fileUrls === 'string' && body.fileUrls.trim() !== '' && body.fileUrls !== '[]') {
				try {
					parsedFileUrls = typeof body.fileUrls === 'string' ? JSON.parse(body.fileUrls) : body.fileUrls
				} catch (e) {
					parsedFileUrls = body.fileUrls
				}
			}
			updateFields.push('fileUrls = ?')
			updateValues.push(parsedFileUrls ? JSON.stringify(parsedFileUrls) : null)
		}
		if (body.thumbnailMode !== undefined) {
			updateFields.push('thumbnailMode = ?')
			updateValues.push(body.thumbnailMode)
		}
		if (body.selectedThumbnails !== undefined) {
			let parsedSelectedThumbnails = null
			if (body.selectedThumbnails && typeof body.selectedThumbnails === 'string' && body.selectedThumbnails.trim() !== '' && body.selectedThumbnails !== '[]') {
				try {
					parsedSelectedThumbnails = typeof body.selectedThumbnails === 'string' ? JSON.parse(body.selectedThumbnails) : body.selectedThumbnails
				} catch (e) {
					parsedSelectedThumbnails = body.selectedThumbnails
				}
			}
			updateFields.push('selectedThumbnails = ?')
			updateValues.push(parsedSelectedThumbnails ? JSON.stringify(parsedSelectedThumbnails) : null)
		}

		// Always update the updatedAt timestamp
		updateFields.push('updatedAt = NOW()')
		
		// Add the WHERE clause parameter
		updateValues.push(params.id)

		const updateQuery = `UPDATE content SET ${updateFields.join(', ')} WHERE id = ?`
		
		await pool.execute(updateQuery, updateValues)

		return NextResponse.json({ message: 'Content updated successfully' })
	} catch (error) {
		console.error('Error updating content:', error)
		return NextResponse.json(
			{ error: 'Failed to update content' },
			{ status: 500 }
		)
	}
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
	try {
		await pool.execute('DELETE FROM content WHERE id = ?', [params.id])
		return NextResponse.json({ message: 'Content deleted successfully' })
	} catch (error) {
		console.error('Error deleting content:', error)
		return NextResponse.json(
			{ error: 'Failed to delete content' },
			{ status: 500 }
		)
	}
}
