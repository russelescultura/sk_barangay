"use client"

import { EventClickArg, EventInput, ViewApi } from '@fullcalendar/core'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import listPlugin from '@fullcalendar/list'
import FullCalendar from '@fullcalendar/react'
import timeGridPlugin from '@fullcalendar/timegrid'
import { ChevronLeft, ChevronRight, X, MapPin, Clock, Users, Calendar, AlertCircle } from 'lucide-react'
import React, { useRef, useState, useEffect } from 'react'

import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"


interface EventCalendarProps {
  events: EventInput[]
  isLoading?: boolean
  error?: string | null
}

export function EventCalendar({ events, isLoading = false, error = null }: EventCalendarProps) {
  const calendarRef = useRef<FullCalendar>(null)
  const [currentView, setCurrentView] = useState('dayGridMonth')
  const [calendarTitle, setCalendarTitle] = useState('')
  const [selectedEvent, setSelectedEvent] = useState<EventClickArg | null>(null)
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Helper function to format dates correctly
  const formatEventDate = (date: Date | null | undefined) => {
    if (!date) return ''
    
    try {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      
      return `${month}/${day}/${year}, ${hours}:${minutes} ${date.getHours() >= 12 ? 'PM' : 'AM'}`
    } catch (error) {
      console.error('Error formatting date:', error)
      return 'Invalid date'
    }
  }

  // Update calendar title when view changes
  useEffect(() => {
    const calendarApi = calendarRef.current?.getApi()
    if (calendarApi) {
      setCalendarTitle(calendarApi.view.title)
      const handleDatesSet = () => {
        setCalendarTitle(calendarApi.view.title)
      }
      calendarApi.on('datesSet', handleDatesSet)
      return () => {
        calendarApi.off('datesSet', handleDatesSet)
      }
    }
  }, [currentView])

  // Function to change calendar view
  const handleViewChange = (view: string) => {
    try {
      const calendarApi = calendarRef.current?.getApi()
      if (calendarApi) {
        calendarApi.changeView(view)
        setCurrentView(view)
      }
    } catch (error) {
      console.error('Error changing view:', error)
    }
  }
  
  const handleEventClick = (clickInfo: EventClickArg) => {
    setSelectedEvent(clickInfo)
    setIsPopoverOpen(true)
  }

  // Navigation handlers with error handling
  const handleNext = () => {
    try {
      const api = calendarRef.current?.getApi()
      if (api) api.next()
    } catch (error) {
      console.error('Error navigating next:', error)
    }
  }
  
  const handlePrev = () => {
    try {
      const api = calendarRef.current?.getApi()
      if (api) api.prev()
    } catch (error) {
      console.error('Error navigating previous:', error)
    }
  }
  
  const handleToday = () => {
    try {
      const api = calendarRef.current?.getApi()
      if (api) api.today()
    } catch (error) {
      console.error('Error navigating to today:', error)
    }
  }

  // Get view display names
  const getViewDisplayName = (view: string) => {
    const viewNames: Record<string, string> = {
      'dayGridMonth': 'Month',
      'timeGridWeek': 'Week', 
      'timeGridDay': 'Day',
      'listWeek': 'List'
    }
    return viewNames[view] || view
  }

  // Get available views based on device
  const getAvailableViews = () => {
    if (isMobile) {
      return ['dayGridMonth', 'listWeek'] // Simplified views for mobile
    }
    return ['dayGridMonth', 'timeGridWeek', 'timeGridDay', 'listWeek']
  }

  // Render custom event content with better accessibility
  const renderEventContent = (eventInfo: any) => {
    const { event } = eventInfo
    const eventType = event.extendedProps?.eventType || 'event'
    
    return (
      <div 
        className="fc-event-main-frame w-full overflow-hidden cursor-pointer"
        role="button"
        tabIndex={0}
        aria-label={`${eventType}: ${event.title}`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            handleEventClick({ event } as EventClickArg)
          }
        }}
      >
        <div className="fc-event-title-container">
          <div className="fc-event-title fc-sticky font-medium text-xs leading-tight">
            {event.title}
          </div>
        </div>
      </div>
    )
  }

  // Removed invalid FullCalendar onError handler; FullCalendar React does not support onError prop

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 bg-muted/20 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Loading calendar...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-64 bg-destructive/10 rounded-lg border border-destructive/20">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
          <p className="text-sm text-destructive font-medium">Failed to load calendar</p>
          <p className="text-xs text-destructive/70 mt-1">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-background rounded-lg w-full">
      {/* Calendar Header */}
      <div className="flex flex-col space-y-3 mb-4 p-4 border-b">
        {/* Title and Navigation Row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-primary" />
            <h2 className="text-lg sm:text-xl font-bold truncate">{calendarTitle}</h2>
          </div>
          
          <div className="flex items-center border rounded-md shadow-sm">
            <Button 
              variant="ghost" 
              size="sm" 
              className="rounded-r-none p-2 hover:bg-muted" 
              onClick={handlePrev}
              aria-label="Previous period"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="border-l border-r rounded-none px-3 text-sm hover:bg-muted" 
              onClick={handleToday}
            >
              Today
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="rounded-l-none p-2 hover:bg-muted" 
              onClick={handleNext}
              aria-label="Next period"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        {/* View Switcher Row */}
        <div className="flex items-center space-x-1 border p-1 rounded-md bg-muted/30">
          {getAvailableViews().map((view) => (
            <Button
              key={view}
              variant={currentView === view ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => handleViewChange(view)}
              className="capitalize whitespace-nowrap text-xs px-3 py-1 h-8"
              aria-label={`Switch to ${getViewDisplayName(view)} view`}
            >
              {getViewDisplayName(view)}
            </Button>
          ))}
        </div>
      </div>

      {/* FullCalendar Component */}
      <div className="px-4 pb-4">
        <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
            initialView={currentView}
            headerToolbar={false}
            events={events}
            height="auto"
            eventClick={handleEventClick}
            eventContent={renderEventContent}
            aspectRatio={isMobile ? 1.0 : 1.2}
            contentHeight="auto"
            dayMaxEvents={isMobile ? 2 : 4}
            moreLinkClick="popover"
            eventDisplay="block"
            eventTimeFormat={{
              hour: '2-digit',
              minute: '2-digit',
              hour12: true
            }}
            slotMinTime="06:00:00"
            slotMaxTime="22:00:00"
            allDaySlot={true}
            slotDuration="00:30:00"
            slotLabelFormat={{
              hour: '2-digit',
              minute: '2-digit',
              hour12: true
            }}
            locale="en"
            firstDay={1} // Monday
            weekNumbers={false}
            selectable={false}
            editable={false}
            droppable={false}
            eventResizableFromStart={false}
            eventDurationEditable={false}
            eventStartEditable={false}
            eventOverlap={false}
            eventConstraint="businessHours"
            businessHours={{
              daysOfWeek: [1, 2, 3, 4, 5], // Monday - Friday
              startTime: '08:00',
              endTime: '18:00',
            }}
            nowIndicator={true}
            scrollTime="08:00:00"
            expandRows={true}
            stickyHeaderDates={true}
            dayHeaderFormat={{ weekday: 'short', day: 'numeric' }}
            titleFormat={{ month: 'long', year: 'numeric' }}
            listDayFormat={{ month: 'long', day: 'numeric', year: 'numeric' }}
            listDaySideFormat={{ weekday: 'long' }}
          />

          {/* Event Details Popover */}
          {selectedEvent && (
            <PopoverContent 
              align="center" 
              side="top" 
              className="w-[calc(100vw-2rem)] max-w-96 shadow-xl rounded-lg z-50 mx-4 border-0 bg-white dark:bg-gray-900"
              sideOffset={5}
            >
              <div className="p-4">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold pr-2 leading-tight text-gray-900 dark:text-white">
                      {selectedEvent.event.title}
                    </h3>
                    <div className="flex items-center space-x-2 mt-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        selectedEvent.event.extendedProps.eventType === 'program' 
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                          : selectedEvent.event.extendedProps.eventType === 'form'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      }`}>
                        {selectedEvent.event.extendedProps.eventType === 'program' ? 'Program' : 
                         selectedEvent.event.extendedProps.eventType === 'form' ? 'Form Deadline' : 'Event'}
                      </span>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setIsPopoverOpen(false)} 
                    className="flex-shrink-0 hover:bg-gray-100 dark:hover:bg-gray-800"
                    aria-label="Close event details"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-start text-sm">
                    <Clock className="w-4 h-4 mr-3 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div className="leading-tight">
                      <div className="font-medium">Start: {formatEventDate(selectedEvent.event.start)}</div>
                      {selectedEvent.event.end && (
                        <div className="font-medium mt-1">
                          End: {(() => {
                            if (selectedEvent.event.allDay && selectedEvent.event.end) {
                              const endDate = new Date(selectedEvent.event.end)
                              endDate.setDate(endDate.getDate() - 1)
                              return formatEventDate(endDate)
                            }
                            return formatEventDate(selectedEvent.event.end)
                          })()}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {selectedEvent.event.extendedProps.eventType === 'event' && selectedEvent.event.extendedProps.venue && (
                    <div className="flex items-start text-sm">
                      <MapPin className="w-4 h-4 mr-3 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <span className="leading-tight">
                        <span className="font-medium">Venue:</span> {selectedEvent.event.extendedProps.venue}
                      </span>
                    </div>
                  )}
                  
                  {selectedEvent.event.extendedProps.eventType === 'program' && selectedEvent.event.extendedProps.targetAudience && (
                    <div className="flex items-start text-sm">
                      <Users className="w-4 h-4 mr-3 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <span className="leading-tight">
                        <span className="font-medium">Target Audience:</span> {selectedEvent.event.extendedProps.targetAudience}
                      </span>
                    </div>
                  )}
                  
                  {selectedEvent.event.extendedProps.description && (
                    <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {selectedEvent.event.extendedProps.description}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </PopoverContent>
          )}
        </Popover>
      </div>
    </div>
  )
}
