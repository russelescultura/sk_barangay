import { NextRequest, NextResponse } from 'next/server'

import pool from '@/lib/db'
import { prisma } from '@/lib/prisma'

export async function GET() {
	try {
		// Fetch programs from MySQL directly (schema uses camelCase column names)
		const [programRows] = await pool.execute(`
			SELECT 
				id,
				title,
				objectives,
				startDate,
				endDate,
				targetAudience,
				status,
				createdAt,
				updatedAt,
				budget,
				category,
				schedule,
				benefits,
				venue,
				schedule_type,
				start_time,
				end_time,
				frequency,
				frequency_interval,
				days_of_week,
				timezone,
				schedule_exceptions
			FROM programs
			ORDER BY createdAt DESC
		`) as any

		const programIds = (programRows as any[]).map(p => p.id)
		const eventsByProgram: Record<string, any[]> = {}
		if (programIds.length > 0) {
			const placeholders = programIds.map(() => '?').join(',')
			const [eventRows] = await pool.execute(
				`SELECT id, title, description, dateTime, venue, maxParticipants, status, poster, attachments, createdAt, updatedAt, programId, endDateTime FROM events WHERE programId IN (${placeholders})`,
				programIds
			) as any
			for (const ev of eventRows as any[]) {
				if (ev.programId) {
					const programId = ev.programId as string
					if (!eventsByProgram[programId]) {
						eventsByProgram[programId] = []
					}
					eventsByProgram[programId].push(ev)
				}
			}
		}

		const programs = (programRows as any[]).map(p => {
			console.log('Processing program:', p.id, 'start_time:', p.start_time, 'end_time:', p.end_time)
			
			// Helper function to extract time from various formats
			const extractTime = (timeValue: any) => {
				if (!timeValue) return null
				
				// If it's already a time string (HH:MM or HH:MM:SS), extract just HH:MM
				if (typeof timeValue === 'string') {
					if (timeValue.includes(':')) {
						return timeValue.split(':').slice(0, 2).join(':')
					}
				}
				
				// If it's a Date object, extract time in Philippine timezone
				if (timeValue instanceof Date) {
					// Since we stored it with +08:00, we need to extract the time as stored
					// The Date object will automatically handle the timezone conversion
					const hours = timeValue.getHours().toString().padStart(2, '0')
					const minutes = timeValue.getMinutes().toString().padStart(2, '0')
					return `${hours}:${minutes}`
				}
				
				// If it's a timestamp, try to parse it
				try {
					const date = new Date(timeValue)
					if (!isNaN(date.getTime())) {
						// Extract time from the stored timestamp
						const hours = date.getHours().toString().padStart(2, '0')
						const minutes = date.getMinutes().toString().padStart(2, '0')
						return `${hours}:${minutes}`
					}
				} catch (e) {
					console.log('Could not parse time value:', timeValue)
				}
				
				return null
			}
			
			return {
				...p,
				// Format time fields to extract just the time portion
				start_time: extractTime(p.start_time),
				end_time: extractTime(p.end_time),
				events: p.id ? (eventsByProgram[p.id] || []) : [],
			}
		})

		console.log('Final programs response:', programs.map(p => ({ id: p.id, start_time: p.start_time, end_time: p.end_time })))
		return NextResponse.json({ programs })
	} catch (error) {
		console.error('Error fetching programs:', error)
		return NextResponse.json(
			{ error: 'Failed to fetch programs' },
			{ status: 500 }
		)
	}
}

export async function POST(request: NextRequest) {
	try {
		const body = await request.json()
		console.log('API POST - Received body:', body)
		
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
			// Enhanced schedule fields
			scheduleType = 'RECURRING',
			startTime = null,
			endTime = null,
			frequency = 'WEEKLY',
			frequencyInterval = 1,
			daysOfWeek = null,
			timezone = 'Asia/Manila',
			scheduleExceptions = null,
		} = body
		
		console.log('API POST - Extracted fields:')
		console.log('- title:', title)
		console.log('- category:', category)
		console.log('- budget:', budget)
		console.log('- scheduleType:', scheduleType)
		console.log('- startTime:', startTime)
		console.log('- endTime:', endTime)
		console.log('- frequency:', frequency)
		console.log('- frequencyInterval:', frequencyInterval)
		console.log('- daysOfWeek:', daysOfWeek)
		console.log('- timezone:', timezone)
		console.log('- scheduleExceptions:', scheduleExceptions)

		if (!title || !benefits || !objectives || !startDate || !endDate || !targetAudience) {
			return NextResponse.json(
				{ error: 'Missing required fields' },
				{ status: 400 }
			)
		}

		const program = await prisma.program.create({
			data: {
				title,
				objectives,
				startDate: new Date(startDate),
				endDate: new Date(endDate),
				targetAudience,
				status,
				budget: budget !== null && budget !== '' ? Number(budget) : null,
				category,
				schedule: schedule || '', // Provide default empty string if schedule is empty
				benefits,
				venue,
				
				// Enhanced schedule fields
				schedule_type: scheduleType,
				start_time: startTime || null,
				end_time: endTime || null,
				frequency,
				frequency_interval: frequencyInterval,
				days_of_week: daysOfWeek ? JSON.stringify(daysOfWeek) : null,
				timezone,
				schedule_exceptions: scheduleExceptions ? JSON.stringify(scheduleExceptions) : null,
			} as any,
		})

		return NextResponse.json({ program }, { status: 201 })
	} catch (error) {
		console.error('Error creating program:', error)
		return NextResponse.json(
			{ error: 'Failed to create program' },
			{ status: 500 }
		)
	}
}


