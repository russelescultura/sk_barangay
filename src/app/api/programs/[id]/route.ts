import { NextRequest, NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
	try {
		const program = await prisma.program.findUnique({
			where: { id: params.id },
			include: { events: true },
		})

		if (!program) {
			return NextResponse.json({ error: 'Program not found' }, { status: 404 })
		}

		return NextResponse.json({ program })
	} catch (error) {
		console.error('Error fetching program:', error)
		return NextResponse.json({ error: 'Failed to fetch program' }, { status: 500 })
	}
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
	try {
		const body = await request.json()
		console.log('API PUT - Received body:', body)
		
		const {
			title,
			schedule,
			benefits,
			objectives,
			startDate,
			endDate,
			targetAudience,
			venue = null,
			category = null,
			budget = null,
			status = 'ONGOING',
			scheduleType,
			startTime,
			endTime,
			frequency,
			frequencyInterval,
			daysOfWeek,
			timezone,
			scheduleExceptions,
		} = body
		
		console.log('API PUT - Extracted schedule fields:')
		console.log('- scheduleType:', scheduleType)
		console.log('- startTime:', startTime)
		console.log('- endTime:', endTime)
		console.log('- frequency:', frequency)
		console.log('- frequencyInterval:', frequencyInterval)
		console.log('- daysOfWeek:', daysOfWeek)
		console.log('- timezone:', timezone)
		console.log('- scheduleExceptions:', scheduleExceptions)

		const program = await prisma.program.update({
			where: { id: params.id },
			data: {
				title,
				objectives,
				startDate: startDate ? new Date(startDate) : undefined,
				endDate: endDate ? new Date(endDate) : undefined,
				targetAudience,
				status,
				budget: budget !== null && budget !== '' ? Number(budget) : null,
				category,
				schedule,
				benefits,
				venue,
				
				// Enhanced schedule fields
				schedule_type: scheduleType,
                start_time: startTime || null,
                end_time: endTime || null,
                frequency,
                frequency_interval: frequencyInterval,
                days_of_week: daysOfWeek && Array.isArray(daysOfWeek) ? JSON.stringify(daysOfWeek) : null,
                timezone,
                schedule_exceptions: scheduleExceptions && Array.isArray(scheduleExceptions) ? JSON.stringify(scheduleExceptions) : null
    
			} as any,
			include: { events: true },
		})

		return NextResponse.json({ program })
	} catch (error) {
		console.error('Error updating program:', error)
		return NextResponse.json({ error: 'Failed to update program' }, { status: 500 })
	}
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
	try {
		await prisma.program.delete({ where: { id: params.id } })
		return NextResponse.json({ message: 'Program deleted successfully' })
	} catch (error) {
		console.error('Error deleting program:', error)
		return NextResponse.json({ error: 'Failed to delete program' }, { status: 500 })
	}
}


