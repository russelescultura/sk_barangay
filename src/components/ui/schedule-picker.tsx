'use client'

import { Calendar, Clock, X } from 'lucide-react'
import React, { useState } from 'react'

import { Button } from './button'
import { Card, CardContent, CardHeader, CardTitle } from './card'
import { Checkbox } from './checkbox'
import { Input } from './input'
import { Label } from './label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select'

export interface ScheduleData {
  scheduleType: 'ONE_TIME' | 'RECURRING'
  startDate: string
  endDate: string
  startTime: string
  endTime: string
  frequency: 'DAILY' | 'WEEKLY' | 'BI_WEEKLY' | 'MONTHLY' | 'CUSTOM'
  frequencyInterval: number
  daysOfWeek: string[]
  timezone?: string // Optional since it's always Philippine time
  exceptions: string[]
  customDescription?: string
}

interface SchedulePickerProps {
  value: ScheduleData
  onChange: (schedule: ScheduleData) => void
  className?: string
}

const DAYS_OF_WEEK = [
  { value: 'MONDAY', label: 'Mon', short: 'M' },
  { value: 'TUESDAY', label: 'Tue', short: 'T' },
  { value: 'WEDNESDAY', label: 'Wed', short: 'W' },
  { value: 'THURSDAY', label: 'Thu', short: 'Th' },
  { value: 'FRIDAY', label: 'Fri', short: 'F' },
  { value: 'SATURDAY', label: 'Sat', short: 'S' },
  { value: 'SUNDAY', label: 'Sun', short: 'Su' }
]

const FREQUENCY_OPTIONS = [
  { value: 'DAILY', label: 'Daily', description: 'Every day' },
  { value: 'WEEKLY', label: 'Weekly', description: 'Every week' },
  { value: 'BI_WEEKLY', label: 'Bi-weekly', description: 'Every 2 weeks' },
  { value: 'MONTHLY', label: 'Monthly', description: 'Every month' },
  { value: 'CUSTOM', label: 'Custom', description: 'Custom pattern' }
]

// Timezone is always Philippine time
const PHILIPPINE_TIMEZONE = 'Asia/Manila'

// Helper function to convert 24-hour time format to 12-hour format with AM/PM
const formatTimeReadable = (time24: string): string => {
  if (!time24 || !time24.includes(':')) return time24
  
  const [hours, minutes] = time24.split(':')
  if (!hours || !minutes) return time24
  const hour = parseInt(hours, 10)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
  
  return `${hour12}:${minutes} ${ampm}`
}

export function SchedulePicker({ value, onChange, className }: SchedulePickerProps) {
  const [showCustomDescription, setShowCustomDescription] = useState(false)

  const updateSchedule = (updates: Partial<ScheduleData>) => {
    console.log('updateSchedule called with updates:', updates)
    const newValue = { ...value, ...updates }
    console.log('New schedule value:', newValue)
    onChange(newValue)
  }

  const toggleDayOfWeek = (day: string) => {
    const newDays = value.daysOfWeek.includes(day)
      ? value.daysOfWeek.filter(d => d !== day)
      : [...value.daysOfWeek, day]
    updateSchedule({ daysOfWeek: newDays })
  }

  const addException = () => {
    const today = new Date().toISOString().split('T')[0] || new Date().toISOString().slice(0, 10)
    updateSchedule({ exceptions: [...value.exceptions, today] })
  }

  const removeException = (date: string) => {
    updateSchedule({ exceptions: value.exceptions.filter(d => d !== date) })
  }

  const getSchedulePreview = () => {
    if (value.scheduleType === 'ONE_TIME') {
      return `One-time event on ${value.startDate} from ${formatTimeReadable(value.startTime)} to ${formatTimeReadable(value.endTime)}`
    }

    const dayLabels = value.daysOfWeek.map(day => 
      DAYS_OF_WEEK.find(d => d.value === day)?.label
    ).filter(Boolean)

    if (dayLabels.length === 0) return 'No days selected'

    const frequencyText = value.frequency === 'CUSTOM' 
      ? 'Custom schedule'
      : `${value.frequency.charAt(0) + value.frequency.slice(1).toLowerCase()} on ${dayLabels.join(', ')}`

    return `${frequencyText} from ${formatTimeReadable(value.startTime)} to ${formatTimeReadable(value.endTime)}`
  }

  const getQuickTemplates = () => [
    {
      name: 'Weekday Mornings',
      schedule: {
        ...value,
        frequency: 'WEEKLY' as const,
        frequencyInterval: 1,
        daysOfWeek: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'],
        startTime: '09:00',
        endTime: '12:00'
      }
    },
    {
      name: 'Weekend Afternoons',
      schedule: {
        ...value,
        frequency: 'WEEKLY' as const,
        frequencyInterval: 1,
        daysOfWeek: ['SATURDAY', 'SUNDAY'],
        startTime: '14:00',
        endTime: '17:00'
      }
    },
    {
      name: 'Evening Classes',
      schedule: {
        ...value,
        frequency: 'WEEKLY' as const,
        frequencyInterval: 1,
        daysOfWeek: ['TUESDAY', 'THURSDAY'],
        startTime: '19:00',
        endTime: '21:00'
      }
    },
    {
      name: 'Daily Program',
      schedule: {
        ...value,
        frequency: 'DAILY' as const,
        frequencyInterval: 1,
        daysOfWeek: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'],
        startTime: '10:00',
        endTime: '16:00'
      }
    }
  ]

  return (
    <div className={`space-y-3 xs:space-y-4 sm:space-y-6 ${className}`}>
      {/* Schedule Type Selection */}
      <div className="flex flex-col gap-1 xs:gap-2">
        <Button
          type="button"
          variant={value.scheduleType === 'ONE_TIME' ? 'default' : 'outline'}
          size="sm"
          onClick={() => updateSchedule({ scheduleType: 'ONE_TIME' })}
          className="w-full py-2 xs:py-2.5 text-xs xs:text-sm"
        >
          📅 One-time Event
        </Button>
        <Button
          type="button"
          variant={value.scheduleType === 'RECURRING' ? 'default' : 'outline'}
          size="sm"
          onClick={() => updateSchedule({ scheduleType: 'RECURRING' })}
          className="w-full py-2 xs:py-2.5 text-xs xs:text-sm"
        >
          🔄 Recurring Schedule
        </Button>
      </div>

             {/* Date Range */}
       <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 xs:gap-4">
         <div className="space-y-1 xs:space-y-2">
           <Label htmlFor="startDate" className="text-xs xs:text-sm font-medium">Start Date *</Label>
           <Input
             type="date"
             value={value.startDate || ''}
             onChange={(e) => {
               const selectedDate = e.target.value
               console.log('Start date selected:', selectedDate)
               updateSchedule({ 
                 startDate: selectedDate
               })
             }}
             required
             className="w-full"
           />
         </div>
         <div className="space-y-1 xs:space-y-2">
           <Label htmlFor="endDate" className="text-xs xs:text-sm font-medium">End Date *</Label>
           <Input
             type="date"
             value={value.endDate || ''}
             onChange={(e) => {
               const selectedDate = e.target.value
               console.log('End date selected:', selectedDate)
               updateSchedule({ 
                 endDate: selectedDate
               })
             }}
             required
             className="w-full"
           />
         </div>
       </div>

             {/* Time Range */}
       <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 xs:gap-4">
         <div className="space-y-1 xs:space-y-2">
           <Label htmlFor="startTime" className="text-xs xs:text-sm font-medium">Start Time *</Label>
           <Input
             type="time"
             value={value.startTime || ''}
             onChange={(e) => updateSchedule({ 
               startTime: e.target.value
             })}
             required
             className="w-full"
           />
         </div>
         <div className="space-y-1 xs:space-y-2">
           <Label htmlFor="endTime" className="text-xs xs:text-sm font-medium">End Time *</Label>
           <Input
             type="time"
             value={value.endTime || ''}
             onChange={(e) => updateSchedule({ 
               endTime: e.target.value
             })}
             required
             className="w-full"
           />
         </div>
       </div>

      {/* Recurring Options */}
      {value.scheduleType === 'RECURRING' && (
        <>
          {/* Frequency */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 xs:gap-4">
            <div className="space-y-1 xs:space-y-2">
              <Label htmlFor="frequency" className="text-xs xs:text-sm font-medium">Frequency *</Label>
              <Select
                value={value.frequency}
                onValueChange={(val) => updateSchedule({ frequency: val as any })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  {FREQUENCY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex flex-col">
                        <span className="font-medium">{option.label}</span>
                        <span className="text-sm text-muted-foreground">{option.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1 xs:space-y-2">
              <Label htmlFor="frequencyInterval" className="text-xs xs:text-sm font-medium">Interval</Label>
              <Input
                id="frequencyInterval"
                type="number"
                min="1"
                max="52"
                value={value.frequencyInterval}
                onChange={(e) => updateSchedule({ frequencyInterval: parseInt(e.target.value) || 1 })}
                placeholder="1"
              />
            </div>
          </div>

          {/* Days of Week */}
          <div className="space-y-2 xs:space-y-3">
            <Label className="text-xs xs:text-sm font-medium">Days of Week *</Label>
            <div className="flex flex-wrap gap-1 xs:gap-2">
              {DAYS_OF_WEEK.map((day) => (
                <Button
                  key={day.value}
                  type="button"
                  variant={value.daysOfWeek.includes(day.value) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => toggleDayOfWeek(day.value)}
                  className="min-w-[40px] xs:min-w-[50px] py-1.5 xs:py-2.5 text-xs xs:text-sm"
                >
                  {day.short}
                </Button>
              ))}
            </div>
          </div>

          {/* Quick Templates */}
          <div className="space-y-2 xs:space-y-3">
            <Label className="text-xs xs:text-sm text-muted-foreground">Quick Templates</Label>
            <div className="flex flex-wrap gap-1 xs:gap-2">
              {getQuickTemplates().map((template) => (
                <Button
                  key={template.name}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => updateSchedule(template.schedule)}
                  className="text-xs py-1.5 xs:py-2"
                >
                  {template.name}
                </Button>
              ))}
            </div>
          </div>
        </>
      )}



      {/* Schedule Exceptions */}
      <div className="space-y-2 xs:space-y-3">
        <Label className="text-xs xs:text-sm font-medium">Schedule Exceptions (Cancelled/Postponed Dates)</Label>
        <div className="space-y-2 xs:space-y-3">
          {value.exceptions.map((date) => (
            <div key={date} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-1 xs:gap-2">
              <Input
                type="date"
                value={date}
                onChange={(e) => {
                  const newExceptions = value.exceptions.map(d => d === date ? e.target.value : d)
                  updateSchedule({ exceptions: newExceptions })
                }}
                className="flex-1 text-sm xs:text-base py-1.5 xs:py-2"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeException(date)}
                className="px-2 xs:px-3 py-1.5 xs:py-2"
              >
                <X className="h-3 w-3 xs:h-4 xs:w-4" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addException}
            className="w-full sm:w-auto py-2 xs:py-2.5 text-xs xs:text-sm"
          >
            + Add Exception Date
          </Button>
        </div>
      </div>

      {/* Custom Description (Optional) */}
      <div className="space-y-2 xs:space-y-3">
        <div className="flex items-center gap-2">
          <Checkbox
            id="showCustomDescription"
            checked={showCustomDescription}
            onCheckedChange={(checked) => setShowCustomDescription(checked as boolean)}
          />
          <Label htmlFor="showCustomDescription" className="text-xs xs:text-sm font-medium">Add custom schedule description</Label>
        </div>
        {showCustomDescription && (
          <Input
            placeholder="e.g., Special instructions, venue details, etc."
            value={value.customDescription || ''}
            onChange={(e) => updateSchedule({ customDescription: e.target.value })}
            className="w-full text-sm xs:text-base py-1.5 xs:py-2"
          />
        )}
      </div>

      {/* Schedule Preview */}
      <Card className="border-2">
        <CardHeader className="pb-2 xs:pb-3">
          <CardTitle className="text-sm xs:text-base sm:text-lg flex items-center gap-1 xs:gap-2">
            <Calendar className="h-3 w-3 xs:h-4 xs:w-4 sm:h-5 sm:w-5" />
            Schedule Preview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 xs:space-y-3">
            <div className="flex items-start gap-1 xs:gap-2">
              <Clock className="h-3 w-3 xs:h-4 xs:w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <span className="font-medium text-xs xs:text-sm sm:text-base leading-relaxed">{getSchedulePreview()}</span>
            </div>

            {value.exceptions.length > 0 && (
              <div className="flex items-center gap-1 xs:gap-2">
                <X className="h-3 w-3 xs:h-4 xs:w-4 text-muted-foreground flex-shrink-0" />
                <span className="text-xs text-muted-foreground">
                  {value.exceptions.length} exception(s) configured
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Helper function to convert old text schedule to new structured format
export function parseTextSchedule(text: string): ScheduleData {
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  
  return {
    scheduleType: 'RECURRING',
    startDate: today.toISOString().split('T')[0] || today.toISOString().slice(0, 10),
    endDate: tomorrow.toISOString().split('T')[0] || tomorrow.toISOString().slice(0, 10),
    startTime: '09:00',
    endTime: '17:00',
    frequency: 'WEEKLY',
    frequencyInterval: 1,
    daysOfWeek: ['MONDAY'],
    timezone: PHILIPPINE_TIMEZONE,
    exceptions: [],
    customDescription: text
  }
}

// Helper function to convert structured schedule to display text
export function formatScheduleDisplay(schedule: ScheduleData): string {
  if (schedule.scheduleType === 'ONE_TIME') {
    return `One-time event on ${schedule.startDate} from ${formatTimeReadable(schedule.startTime)} to ${formatTimeReadable(schedule.endTime)}`
  }

  const dayLabels = schedule.daysOfWeek.map(day => 
    DAYS_OF_WEEK.find(d => d.value === day)?.label
  ).filter(Boolean)

  if (dayLabels.length === 0) return 'No schedule configured'

  const frequencyText = schedule.frequency === 'CUSTOM' 
    ? 'Custom schedule'
    : `${schedule.frequency.charAt(0) + schedule.frequency.slice(1).toLowerCase()} on ${dayLabels.join(', ')}`

  return `${frequencyText} from ${formatTimeReadable(schedule.startTime)} to ${formatTimeReadable(schedule.endTime)}`
}
