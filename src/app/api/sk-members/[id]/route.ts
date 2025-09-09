import { NextRequest, NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
	try {
		const member = await prisma.sKMember.findUnique({
			where: { id: params.id }
		})

		if (!member) {
			return NextResponse.json({ error: 'Member not found' }, { status: 404 })
		}

		// Transform to match the expected interface
		const normalized = {
			id: member.id,
			name: member.name,
			email: member.email,
			phone: member.phone || '',
			role: member.role === 'SK_CHAIRMAN' ? 'SK_CHAIRPERSON' : member.role,
			status: member.status === 'ACTIVE' ? 'Active' : member.status === 'INACTIVE' ? 'Inactive' : 'Pending',
			department: member.department,
			position: member.position,
			location: member.location,
			skills: member.skills ? JSON.parse(member.skills) : [],
			profileImage: member.profileImage || undefined,
			performance: member.performance ? Number(member.performance) : 0,
			projects: member.projects ? Number(member.projects) : 0,
			achievements: member.achievements ? Number(member.achievements) : 0,
			lastActive: member.lastActive ? member.lastActive.toISOString() : '',
			joinDate: member.joinDate ? member.joinDate.toISOString() : '',
			avatar: member.name ? member.name.charAt(0).toUpperCase() : 'U',
		}

		return NextResponse.json(normalized)
	} catch (error) {
		console.error('Error fetching SK member:', error)
		return NextResponse.json({ error: 'Failed to fetch SK member' }, { status: 500 })
	}
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
	try {
		const body = await request.json()
		const {
			name,
			email,
			phone = '',
			role,
			status,
			department,
			position,
			location,
			skills = [],
			profileImage = null,
			performance = 0,
			projects = 0,
			achievements = 0,
		} = body

		// Convert status and role to match database schema
		const dbStatus = status === 'Active' ? 'ACTIVE' : status === 'Inactive' ? 'INACTIVE' : 'SUSPENDED'
		const dbRole = role === 'SK_CHAIRPERSON' ? 'SK_CHAIRMAN' : role

		await prisma.sKMember.update({
			where: { id: params.id },
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

		return NextResponse.json({ message: 'Member updated' })
	} catch (error) {
		console.error('Error updating SK member:', error)
		return NextResponse.json({ error: 'Failed to update SK member' }, { status: 500 })
	}
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
	try {
		await prisma.sKMember.delete({
			where: { id: params.id }
		})
		return NextResponse.json({ message: 'Member deleted' })
	} catch (error) {
		console.error('Error deleting SK member:', error)
		return NextResponse.json({ error: 'Failed to delete SK member' }, { status: 500 })
	}
}


