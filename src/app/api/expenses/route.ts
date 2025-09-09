import { NextRequest, NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url)
		const programId = searchParams.get('programId') || undefined
		const category = searchParams.get('category') || undefined

		const expenses = await prisma.expense.findMany({
			where: {
				AND: [
					programId ? { programId } : {},
					category ? { category: category as any } : {},
				],
			},
			include: {
				program: { select: { id: true, title: true, budget: true } },
			},
			orderBy: { date: 'desc' },
		})

		const shaped = expenses.map((e: any) => ({
			...e,
			receipts: e.receipt ? [e.receipt] : [],
		}))

		return NextResponse.json({ expenses: shaped })
	} catch (error) {
		console.error('Error fetching expenses:', error)
		return NextResponse.json({ error: 'Failed to fetch expenses' }, { status: 500 })
	}
}

export async function POST(request: NextRequest) {
	try {
		const body = await request.json()
		const {
			title,
			description = null,
			amount,
			category,
			date,
			receipt = null,
			receipts = undefined as string[] | undefined,
			programId,
		} = body

		if (!title || !amount || !category || !date || !programId) {
			return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
		}

		const expense = await prisma.expense.create({
			data: {
				title,
				description,
				amount: Number(amount),
				category,
				date: new Date(date),
				receipt: receipt || (Array.isArray(receipts) ? receipts[0] ?? null : null),
				status: 'PENDING',
				programId,
			},
			include: {
				program: { select: { id: true, title: true, budget: true } },
			},
		})

		const shaped = { ...expense, receipts: expense.receipt ? [expense.receipt] : [] }
		return NextResponse.json({ expense: shaped }, { status: 201 })
	} catch (error) {
		console.error('Error creating expense:', error)
		return NextResponse.json({ error: 'Failed to create expense' }, { status: 500 })
	}
}


