import { NextRequest, NextResponse } from 'next/server'

import pool from '@/lib/db'

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url)
		const status = searchParams.get('status')
		const type = searchParams.get('type')
		const search = searchParams.get('search')

		const whereClauses: string[] = []
		const values: any[] = []

		if (status && status !== 'ALL') {
			whereClauses.push('status = ?')
			values.push(status)
		}
		if (type && type !== 'ALL') {
			whereClauses.push('type = ?')
			values.push(type)
		}
		if (search) {
			whereClauses.push('(title LIKE ? OR description LIKE ?)')
			values.push(`%${search}%`, `%${search}%`)
		}

		const whereSql = whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : ''

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
				authorId,
				featured,
				\`order\`,
				fileUrl,
				fileUrls,
				thumbnailMode,
				selectedThumbnails
			FROM content
			${whereSql}
			ORDER BY featured DESC, \`order\` ASC, createdAt DESC
		`, values) as any

		const content = (rows as any[]).map(r => ({
			id: r.id,
			title: r.title,
			description: r.description,
			type: r.type,
			status: r.status,
			thumbnail: r.thumbnail || null,
			tags: r.tags || null,
			createdAt: r.createdAt,
			featured: Boolean(r.featured),
			order: r.order || 0,
			fileUrl: r.fileUrl || null,
			fileUrls: r.fileUrls && typeof r.fileUrls === 'string' && r.fileUrls.trim() !== '' ? JSON.parse(r.fileUrls) : null,
			thumbnailMode: r.thumbnailMode || 'SINGLE',
			selectedThumbnails: r.selectedThumbnails && typeof r.selectedThumbnails === 'string' && r.selectedThumbnails.trim() !== '' ? JSON.parse(r.selectedThumbnails) : null,
			author: { name: 'SK Barangay Tulay' },
		}))

		return NextResponse.json(content)
	} catch (error) {
		console.error('Error fetching content:', error)
		return NextResponse.json(
			{ error: 'Failed to fetch content' },
			{ status: 500 }
		)
	}
}

export async function POST(request: NextRequest) {
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
				status: formData.get('status') as string || 'DRAFT',
				thumbnail: formData.get('thumbnail') as string,
				tags: formData.get('tags') as string,
				featured: formData.get('featured') === 'true',
				order: parseInt(formData.get('order') as string) || 0,
				fileUrl: formData.get('fileUrl') as string,
				fileUrls: formData.get('fileUrls') as string,
				thumbnailMode: formData.get('thumbnailMode') as string || 'SINGLE',
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
			status = 'DRAFT',
			thumbnail,
			tags,
			featured = false,
			order = 0,
			fileUrl,
			fileUrls,
			thumbnailMode = 'SINGLE',
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

		// First, ensure we have a valid user in the users table
		let authorId: string
		const [existingUsers] = await pool.execute('SELECT id FROM users LIMIT 1') as any
		
		if (existingUsers && existingUsers.length > 0) {
			// Use the first existing user
			authorId = existingUsers[0].id
		} else {
			// Create a default user if none exists
			const [defaultUser] = await pool.execute(`
				INSERT INTO users (id, name, email, role, password, createdAt, updatedAt) 
				VALUES (UUID(), 'SK Barangay Tulay', 'admin@tulay.gov.ph', 'ADMIN', '$2b$10$default', NOW(), NOW())
			`) as any
			authorId = defaultUser.insertId
		}

		const [result] = await pool.execute(`
			INSERT INTO content (
				id, title, description, type, status, thumbnail, tags, 
				featured, \`order\`, fileUrl, fileUrls, thumbnailMode, 
				selectedThumbnails, authorId, createdAt, updatedAt
			) VALUES (
				UUID(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW()
			)
		`, [
			title,
			description || null,
			type,
			status,
			thumbnail || null,
			tags || null,
			featured,
			order,
			fileUrl || null,
			parsedFileUrls ? JSON.stringify(parsedFileUrls) : null,
			thumbnailMode,
			parsedSelectedThumbnails ? JSON.stringify(parsedSelectedThumbnails) : null,
			authorId
		]) as any

		return NextResponse.json(
			{ message: 'Content created successfully', id: result.insertId },
			{ status: 201 }
		)
	} catch (error) {
		console.error('Error creating content:', error)
		return NextResponse.json(
			{ error: 'Failed to create content' },
			{ status: 500 }
		)
	}
}


