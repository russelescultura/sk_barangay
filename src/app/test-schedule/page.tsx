'use client'

import { useState } from 'react'

import { SchedulePicker, ScheduleData } from '@/components/ui/schedule-picker'

export default function TestSchedulePage() {
  const [scheduleData, setScheduleData] = useState<ScheduleData>({
    scheduleType: 'RECURRING',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '17:00',
    frequency: 'WEEKLY',
    frequencyInterval: 1,
    daysOfWeek: ['MONDAY', 'WEDNESDAY', 'FRIDAY'],
    timezone: 'Asia/Manila',
    scheduleExceptions: [],
    customDescription: 'Test program schedule'
  })

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">SchedulePicker Component Test</h1>
      
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Current Schedule Data:</h2>
        <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
          {JSON.stringify(scheduleData, null, 2)}
        </pre>
      </div>

      <div className="mt-8">
        <SchedulePicker
          value={scheduleData}
          onChange={setScheduleData}
        />
      </div>
    </div>
  )
}
