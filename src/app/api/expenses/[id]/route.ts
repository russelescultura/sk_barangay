import { NextRequest, NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
	try {
		const { status } = await request.json()
		if (!['APPROVED', 'REJECTED', 'PENDING'].includes(status)) {
			return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
		}

		const expense = await prisma.expense.update({
			where: { id: params.id },
			data: { status },
		})

		return NextResponse.json({ expense })
	} catch (error) {
		console.error('Error updating expense:', error)
		return NextResponse.json({ error: 'Failed to update expense' }, { status: 500 })
	}
}


