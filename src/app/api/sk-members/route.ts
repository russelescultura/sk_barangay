import { NextRequest, NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url)
		const search = searchParams.get('search') || ''
		const statusParam = searchParams.get('status') || ''
		const roleParam = searchParams.get('role') || ''

		// Build where conditions for Prisma
		const where: any = {}
		
		if (statusParam && statusParam !== 'all') {
			const status = statusParam.toUpperCase()
			if (status === 'ACTIVE' || status === 'INACTIVE' || status === 'SUSPENDED') {
				where.status = status
			}
		}
		
		if (roleParam && roleParam !== 'all') {
			const role = roleParam.toUpperCase()
			if (role === 'SK_CHAIRPERSON') {
				where.role = 'SK_CHAIRMAN'
			} else {
				where.role = role
			}
		}
		
		if (search) {
			where.OR = [
				{ name: { contains: search, mode: 'insensitive' } },
				{ email: { contains: search, mode: 'insensitive' } }
			]
		}

		const members = await prisma.sKMember.findMany({
			where,
			orderBy: { createdAt: 'desc' }
		})

		// Transform to match the expected interface
		const normalized = members.map((m) => ({
			id: m.id,
			name: m.name,
			email: m.email,
			phone: m.phone || '',
			role: m.role === 'SK_CHAIRMAN' ? 'SK_CHAIRPERSON' : m.role,
			status: m.status === 'ACTIVE' ? 'Active' : m.status === 'INACTIVE' ? 'Inactive' : 'Pending',
			department: m.department,
			position: m.position,
			location: m.location,
			skills: m.skills ? JSON.parse(m.skills) : [],
			profileImage: m.profileImage || undefined,
			performance: m.performance ? Number(m.performance) : 0,
			projects: m.projects ? Number(m.projects) : 0,
			achievements: m.achievements ? Number(m.achievements) : 0,
			lastActive: m.lastActive ? m.lastActive.toISOString() : '',
			joinDate: m.joinDate ? m.joinDate.toISOString() : '',
			avatar: m.name ? m.name.charAt(0).toUpperCase() : 'U',
		}))

		return NextResponse.json(normalized)
	} catch (error) {
		console.error('Error fetching SK members:', error)
		return NextResponse.json(
			{ error: 'Failed to fetch SK members' },
			{ status: 500 }
		)
	}
}

export async function POST(request: NextRequest) {
	try {
		const body = await request.json()
		const {
			name,
			email,
			phone = '',
			role,
			status = 'Active',
			department,
			position,
			location,
			skills = [],
			profileImage = null,
			performance = 0,
			projects = 0,
			achievements = 0,
		} = body

		if (!name || !email || !role || !department || !position || !location) {
			return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
		}

		// Convert status and role to match database schema
		const dbStatus = status === 'Active' ? 'ACTIVE' : status === 'Inactive' ? 'INACTIVE' : 'SUSPENDED'
		const dbRole = role === 'SK_CHAIRPERSON' ? 'SK_CHAIRMAN' : role

		const member = await prisma.sKMember.create({
			data: {
				name,
				email,
				phone,
				role: dbRole as any,
				status: dbStatus as any,
				department,
				position,
				location,
				skills: JSON.stringify(skills),
				profileImage,
				performance: String(performance),
				projects: String(projects),
				achievements: String(achievements),
			}
		})

		return NextResponse.json({ message: 'Member created', id: member.id }, { status: 201 })
	} catch (error) {
		console.error('Error creating SK member:', error)
		return NextResponse.json({ error: 'Failed to create SK member' }, { status: 500 })
	}
}


