import { NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'

export async function GET() {
	try {
		const [programs, revenueAgg] = await Promise.all([
			prisma.program.findMany({
				orderBy: { createdAt: 'desc' },
				include: {
					expenses: true,
					revenues: true,
				},
			}),
			prisma.revenue.aggregate({ _sum: { amount: true } }),
		])

		interface ExpenseRow { amount: number }
		interface ProgramRow {
			id: string
			title: string
			budget: number | null
			status: string
			createdAt: Date
			updatedAt: Date
			expenses: ExpenseRow[]
		}

		interface MappedProgram {
			id: string
			title: string
			budget: number
			status: string
			createdAt: Date
			updatedAt: Date
			spent: number
			remaining: number
			utilizationRate: number
		}

		const mapped: MappedProgram[] = (programs as unknown as ProgramRow[]).map((p: ProgramRow): MappedProgram => {
			const spent = p.expenses.reduce((sum: number, e: ExpenseRow) => sum + e.amount, 0)
			const budgetNum = p.budget || 0
			const remaining = budgetNum - spent
			const utilizationRate = budgetNum > 0 ? (spent / budgetNum) * 100 : 0
			return {
				id: p.id,
				title: p.title,
				budget: budgetNum,
				status: p.status,
				createdAt: p.createdAt,
				updatedAt: p.updatedAt,
				spent,
				remaining,
				utilizationRate,
			}
		})

		const totalBudget = mapped.reduce((sum: number, p: MappedProgram) => sum + (p.budget || 0), 0)
		const totalSpent = mapped.reduce((sum: number, p: MappedProgram) => sum + p.spent, 0)
		const totalRevenue = revenueAgg._sum.amount || 0
		const totalRemaining = totalBudget - totalSpent + totalRevenue
		const overallUtilizationRate = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0
		const activePrograms = mapped.filter((p: MappedProgram) => p.status === 'ONGOING').length
		const completedPrograms = mapped.filter((p: MappedProgram) => p.status === 'COMPLETED').length

		return NextResponse.json({
			programs: mapped,
			stats: {
				totalBudget,
				totalSpent,
				totalRemaining,
				overallUtilizationRate,
				activePrograms,
				completedPrograms,
				totalRevenue,
				netBudget: totalRemaining,
			},
		})
	} catch (error) {
		console.error('Error fetching budget:', error)
		return NextResponse.json(
			{ error: 'Failed to fetch budget' },
			{ status: 500 }
		)
	}
}


