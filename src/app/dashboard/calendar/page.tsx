"use client"

import { EventInput } from '@fullcalendar/core'
import { 
  Calendar as CalendarIcon, 
  Clock,
  Users,
  MapPin,
  Bell,
  TrendingUp,
  Filter,
  Search,
  X,
  RefreshCw,
  Grid3X3,
  List
} from 'lucide-react'
import React, { useState, useEffect, useCallback } from 'react'

import { EventCalendar } from '@/components/calendar/event-calendar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'


interface Program {
  id: string
  title: string
  description: string
  objectives: string
  startDate: string
  endDate: string
  targetAudience: string
  status: 'ONGOING' | 'COMPLETED' | 'CANCELLED'
  createdAt: string
  updatedAt: string
  assignedMembers?: User[]
  events: Event[]
}

interface Event {
  id: string
  title: string
  description: string
  dateTime: string
  endDateTime?: string
  venue?: string
  status: 'ACTIVE' | 'PLANNED' | 'COMPLETED' | 'CANCELLED'
  assignedMembers?: User[]
  programId?: string
}

interface Form {
  id: string
  title: string
  description: string
  submissionDeadline?: string
  status: 'DRAFT' | 'PUBLISHED' | 'CLOSED'
  programId?: string
}

interface User {
  id: string
  name: string
  email: string
  role: string
}

interface CalendarStats {
  totalEvents: number
  totalPrograms: number
  totalForms: number
  upcomingEvents: number
  pendingSubmissions: number
  approvedSubmissions: number
}

interface FilterState {
  searchQuery: string
  eventTypes: string[]
  statuses: string[]
  programs: string[]
  dateRange: {
    start: Date | null
    end: Date | null
  }
  showPrograms: boolean
  showEvents: boolean
  showForms: boolean
}

// Helper to get status badge
function getStatusBadge(status: string, _type: 'event' | 'program' | 'form') {
  const statusConfig = {
    'ONGOING': { label: 'Ongoing', variant: 'default' as const, className: 'bg-green-100 text-green-800 border-green-200' },
    'ACTIVE': { label: 'Active', variant: 'default' as const, className: 'bg-green-100 text-green-800 border-green-200' },
    'PLANNED': { label: 'Planned', variant: 'secondary' as const, className: 'bg-blue-100 text-blue-800 border-blue-200' },
    'COMPLETED': { label: 'Completed', variant: 'secondary' as const, className: 'bg-gray-100 text-gray-800 border-gray-200' },
    'CANCELLED': { label: 'Cancelled', variant: 'destructive' as const, className: 'bg-red-100 text-red-800 border-red-200' },
    'DRAFT': { label: 'Draft', variant: 'secondary' as const, className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    'PUBLISHED': { label: 'Published', variant: 'default' as const, className: 'bg-green-100 text-green-800 border-green-200' },
    'CLOSED': { label: 'Closed', variant: 'secondary' as const, className: 'bg-gray-100 text-gray-800 border-gray-200' }
  }

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig['PLANNED']
  
  return (
    <Badge variant={config.variant} className={`text-xs ${config.className}`}>
      {config.label}
    </Badge>
  )
}

// Helper to format data for FullCalendar
function formatCalendarEvents(programs: Program[], events: Event[], forms: Form[]): EventInput[] {
  const calendarEvents: EventInput[] = [];

    // Add programs to the calendar
  programs.forEach(program => {
    const statusColor = program.status === 'ONGOING' ? '#10B981' :
                       program.status === 'COMPLETED' ? '#3B82F6' : '#EF4444';
    
    // For all-day events, FullCalendar expects the end date to be the day after the last day
    const startDate = new Date(program.startDate);
    const endDate = new Date(program.endDate);
    endDate.setDate(endDate.getDate() + 1);
    
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];
    
    if (startDateStr && endDateStr) {
      const programEvent: EventInput = {
      id: `program-${program.id}`,
      title: `📋 ${program.title}`,
        start: startDateStr, // Format as YYYY-MM-DD for all-day events
        end: endDateStr, // Format as YYYY-MM-DD for all-day events
      allDay: true,
      backgroundColor: statusColor,
      borderColor: statusColor,
      textColor: '#FFFFFF',
      extendedProps: {
        eventType: 'program',
        ...program
        }
      };
      calendarEvents.push(programEvent);
      }
  });

  // Group events by date to handle multiple events on the same day
  const eventsByDate = new Map<string, Event[]>();
  events.forEach(event => {
    const dateKey = new Date(event.dateTime).toDateString();
    if (!eventsByDate.has(dateKey)) {
      eventsByDate.set(dateKey, []);
    }
    eventsByDate.get(dateKey)!.push(event);
  });

  // Add events to the calendar with proper handling for multiple events
  eventsByDate.forEach((dayEvents, _dateKey) => {
    if (dayEvents.length === 1) {
      // Single event - show normally
      const event = dayEvents[0];
      if (!event) return; // Guard against undefined
      
      const statusColor = event.status === 'ACTIVE' ? '#10B981' :
                         event.status === 'PLANNED' ? '#F59E0B' :
                         event.status === 'COMPLETED' ? '#3B82F6' : '#EF4444';
      
      const eventData: EventInput = {
         id: `event-${event.id}`,
         title: `🎯 ${event.title}`,
         start: event.dateTime,
         allDay: false,
         backgroundColor: statusColor,
         borderColor: statusColor,
         textColor: '#FFFFFF',
         extendedProps: {
           eventType: 'event',
           ...event
         }
      };
      
      if (event.endDateTime) {
        eventData.end = event.endDateTime;
      }
      
      calendarEvents.push(eventData);
    } else {
      // Multiple events on the same day - show as separate events with time indicators
      dayEvents.sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());
      
      dayEvents.forEach((event, index) => {
        const statusColor = event.status === 'ACTIVE' ? '#10B981' :
                           event.status === 'PLANNED' ? '#F59E0B' :
                           event.status === 'COMPLETED' ? '#3B82F6' : '#EF4444';
        
        const time = new Date(event.dateTime).toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        });
        
        const eventData: EventInput = {
           id: `event-${event.id}`,
           title: `🎯 ${time} - ${event.title}`,
           start: event.dateTime,
           allDay: false,
           backgroundColor: statusColor,
           borderColor: statusColor,
           textColor: '#FFFFFF',
           extendedProps: {
             eventType: 'event',
             isMultiEvent: true,
             eventIndex: index + 1,
             totalEvents: dayEvents.length,
             ...event
           }
        };
        
        if (event.endDateTime) {
          eventData.end = event.endDateTime;
        }
        
        calendarEvents.push(eventData);
      });
    }
  });

  // Add form deadlines to the calendar
  forms.forEach(form => {
    if (form.submissionDeadline) {
      const isUrgent = new Date(form.submissionDeadline) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // Within 7 days
      
      const formEvent: EventInput = {
        id: `form-${form.id}`,
        title: `⏰ ${form.title}`,
        start: form.submissionDeadline,
        allDay: true,
        backgroundColor: isUrgent ? '#DC2626' : '#EF4444',
        borderColor: isUrgent ? '#DC2626' : '#EF4444',
        textColor: '#FFFFFF',
        extendedProps: {
          eventType: 'form',
          isUrgent,
          ...form
        }
      };
      calendarEvents.push(formEvent);
    }
  });

  return calendarEvents;
}

// Helper to get upcoming events (next 30 days)
function getUpcomingEvents(events: Event[], programs: Program[]): Array<Event | Program> {
  const now = new Date();
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  
  const upcomingEvents = events.filter(event => {
    const eventDate = new Date(event.dateTime);
    return eventDate >= now && eventDate <= thirtyDaysFromNow;
  });
  
  const upcomingPrograms = programs.filter(program => {
    const endDate = new Date(program.endDate);
    return endDate >= now && endDate <= thirtyDaysFromNow;
  });
  
  return [...upcomingEvents, ...upcomingPrograms].sort((a, b) => {
    const dateA = 'dateTime' in a ? new Date(a.dateTime) : new Date(a.endDate);
    const dateB = 'dateTime' in b ? new Date(b.dateTime) : new Date(b.endDate);
    return dateA.getTime() - dateB.getTime();
  }).slice(0, 5);
}

// Helper to calculate calendar stats
function calculateCalendarStats(events: Event[], programs: Program[], forms: Form[]): CalendarStats {
  const now = new Date();
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  
  const upcomingEvents = events.filter(event => {
    const eventDate = new Date(event.dateTime);
    return eventDate >= now && eventDate <= thirtyDaysFromNow;
  }).length;
  

  const pendingSubmissions = forms.filter(form => form.status === 'DRAFT').length;
  const approvedSubmissions = forms.filter(form => form.status === 'PUBLISHED').length;
  
  return {
    totalEvents: events.length,
    totalPrograms: programs.length,
    totalForms: forms.length,
    upcomingEvents,
    pendingSubmissions,
    approvedSubmissions
  };
}

export default function CalendarPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [programs, setPrograms] = useState<Program[]>([])
  const [forms, setForms] = useState<Form[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [calendarEvents, setCalendarEvents] = useState<EventInput[]>([])
  const [upcomingEvents, setUpcomingEvents] = useState<Array<Event | Program>>([])
  const [stats, setStats] = useState<CalendarStats>({
    totalEvents: 0,
    totalPrograms: 0,
    totalForms: 0,
    upcomingEvents: 0,
    pendingSubmissions: 0,
    approvedSubmissions: 0
  })
  
  // Filtering state
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    eventTypes: [],
    statuses: [],
    programs: [],
    dateRange: {
      start: null,
      end: null
    },
    showPrograms: true,
    showEvents: true,
    showForms: true
  })
  const [showFilters, setShowFilters] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar')

  const [notifications, setNotifications] = useState<Array<{
    id: string
    type: 'warning' | 'info' | 'success'
    message: string
    timestamp: Date
  }>>([])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Fetch all data in parallel with cache busting
      const timestamp = Date.now()
      const [eventsResponse, programsResponse, formsResponse] = await Promise.all([
        fetch(`/api/events?t=${timestamp}`),
        fetch(`/api/programs?t=${timestamp}`),
        fetch(`/api/forms?t=${timestamp}`)
      ])

      // Check if all responses are ok
      if (!eventsResponse.ok || !programsResponse.ok || !formsResponse.ok) {
        throw new Error('Failed to fetch calendar data. Please try again.')
      }

      const eventsData = await eventsResponse.json()
      const programsData = await programsResponse.json()
      const formsData = await formsResponse.json()

      if (eventsData.events) setEvents(eventsData.events)
      if (programsData.programs) setPrograms(programsData.programs)
      if (formsData.forms) setForms(formsData.forms)

    } catch (error) {
      console.error('Error fetching calendar data:', error)
      setError(error instanceof Error ? error.message : 'An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  // Filtering functions
  const applyFilters = useCallback((allEvents: EventInput[]): EventInput[] => {
    return allEvents.filter(event => {
      // Search query filter
      if (filters.searchQuery && event.title && !event.title.toLowerCase().includes(filters.searchQuery.toLowerCase())) {
        return false
      }
      
      // Event type filter
      if (filters.eventTypes.length > 0 && event.extendedProps?.eventType && !filters.eventTypes.includes(event.extendedProps.eventType)) {
        return false
      }
      
      // Status filter
      if (filters.statuses.length > 0 && event.extendedProps?.status && !filters.statuses.includes(event.extendedProps.status)) {
        return false
      }
      
      // Program filter
      if (filters.programs.length > 0 && event.extendedProps?.programId && !filters.programs.includes(event.extendedProps.programId)) {
        return false
      }
      
      // Date range filter
      if (filters.dateRange.start && event.start) {
        const eventStart = typeof event.start === 'string' ? new Date(event.start) : event.start
        if (eventStart < filters.dateRange.start) {
          return false
        }
      }
      if (filters.dateRange.end && event.end) {
        const eventEnd = typeof event.end === 'string' ? event.end : event.end
        if (eventEnd > filters.dateRange.end) {
          return false
        }
      }
      
      // Visibility filters
      if (!filters.showPrograms && event.extendedProps?.eventType === 'program') {
        return false
      }
      if (!filters.showEvents && event.extendedProps?.eventType === 'event') {
        return false
      }
      if (!filters.showForms && event.extendedProps?.eventType === 'form') {
        return false
      }
      
      return true
    })
  }, [filters])

  // Helper to get today's events
  const getTodayEvents = useCallback(() => {
    const today = new Date();
    return events.filter(event => {
      const eventDate = new Date(event.dateTime);
      return eventDate.toDateString() === today.toDateString();
    }).sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());
  }, [events])

  // Smart notification functions
  const generateNotifications = useCallback(() => {
    const newNotifications: Array<{
      id: string
      type: 'warning' | 'info' | 'success'
      message: string
      timestamp: Date
    }> = []

    const now = new Date()

    // Check for today's events
    const todayEvents = getTodayEvents();
    if (todayEvents.length > 0) {
      if (todayEvents.length === 1) {
        const firstEvent = todayEvents[0];
        if (firstEvent) {
        newNotifications.push({
          id: 'today-single',
          type: 'info',
            message: `📅 Today: "${firstEvent.title}" at ${formatDateTime(firstEvent.dateTime)}`,
          timestamp: new Date()
        });
        }
      } else {
        newNotifications.push({
          id: 'today-multiple',
          type: 'info',
          message: `📅 Today: ${todayEvents.length} events scheduled`,
          timestamp: new Date()
        });
      }
    }

    // Check for urgent form deadlines
    forms.forEach(form => {
      if (form.submissionDeadline) {
        const deadline = new Date(form.submissionDeadline)
        const now = new Date()
        
        // Reset time to start of day for accurate day calculation
        const deadlineStart = new Date(deadline.getFullYear(), deadline.getMonth(), deadline.getDate())
        const nowStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        
        const daysUntilDeadline = Math.floor((deadlineStart.getTime() - nowStart.getTime()) / (1000 * 60 * 60 * 24))
        
        if (daysUntilDeadline <= 3 && daysUntilDeadline > 0) {
          newNotifications.push({
            id: `deadline-${form.id}`,
            type: 'warning',
            message: `⚠️ Urgent: Form "${form.title}" deadline in ${daysUntilDeadline} day${daysUntilDeadline > 1 ? 's' : ''}`,
            timestamp: new Date()
          })
        }
      }
    })

    // Check for upcoming events
    events.forEach(event => {
      const eventDate = new Date(event.dateTime)
      const daysUntilEvent = Math.floor((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      
      if (daysUntilEvent <= 7 && daysUntilEvent > 0) {
        newNotifications.push({
          id: `upcoming-${event.id}`,
          type: 'info',
          message: `📅 Upcoming: "${event.title}" in ${daysUntilEvent} day${daysUntilEvent > 1 ? 's' : ''}`,
          timestamp: new Date()
        })
      }
    })

    setNotifications(newNotifications.slice(0, 5)) // Limit to 5 notifications
  }, [events, forms, getTodayEvents])

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (events.length > 0 || programs.length > 0 || forms.length > 0) {
      const formattedEvents = formatCalendarEvents(programs, events, forms)
      const filteredEvents = applyFilters(formattedEvents)
      setCalendarEvents(filteredEvents)
      
      const upcoming = getUpcomingEvents(events, programs)
      setUpcomingEvents(upcoming)
      
      const calendarStats = calculateCalendarStats(events, programs, forms)
      setStats(calendarStats)
      
      // Generate smart notifications
      generateNotifications()
    }
  }, [events, programs, forms, filters])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const clearFilters = () => {
    setFilters({
      searchQuery: '',
      eventTypes: [],
      statuses: [],
      programs: [],
      dateRange: {
        start: null,
        end: null
      },
      showPrograms: true,
      showEvents: true,
      showForms: true
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading calendar...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <CalendarIcon className="h-8 w-8 text-destructive" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Failed to Load Calendar</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={fetchData} className="w-full">
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        {/* Header Section - Mobile First Design */}
        <div className="space-y-4 mb-6 pt-16 lg:pt-8">
          {/* Main Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Calendar</h1>
              <p className="text-muted-foreground text-sm sm:text-base">
              Manage your schedule and upcoming events
            </p>
          </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2">
          <Button 
            variant="outline" 
            onClick={fetchData}
            disabled={isLoading}
                className="flex items-center justify-center gap-2"
          >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
                <span className="sm:hidden">Sync</span>
          </Button>
          
              <Button 
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center justify-center gap-2"
              >
                <Filter className="h-4 w-4" />
                <span className="hidden sm:inline">Filters</span>
                <span className="sm:hidden">Filter</span>
              </Button>
            </div>
          </div>

          {/* Search and View Toggle */}
          <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Bar */}
            <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
                placeholder="Search events, programs, forms..."
              value={filters.searchQuery}
              onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
                className="pl-10 w-full"
            />
          </div>
          
            {/* View Mode Toggle */}
            <div className="flex items-center border rounded-lg p-1 bg-muted/30">
              <Button
                variant={viewMode === 'calendar' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('calendar')}
                className="flex items-center gap-2 px-3"
              >
                <Grid3X3 className="h-4 w-4" />
                <span className="hidden sm:inline">Calendar</span>
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="flex items-center gap-2 px-3"
              >
                <List className="h-4 w-4" />
                <span className="hidden sm:inline">List</span>
              </Button>
            </div>
          </div>

          {/* Quick Stats - Dashboard Style */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="hover:shadow-md transition-shadow duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Events</CardTitle>
                <div className="h-4 w-4 text-muted-foreground">
                  <CalendarIcon className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalEvents}</div>
                <div className="flex items-center space-x-1 text-xs text-muted-foreground mt-1">
                  <span>Calendar events</span>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Programs</CardTitle>
                <div className="h-4 w-4 text-muted-foreground">
                  <TrendingUp className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalPrograms}</div>
                <div className="flex items-center space-x-1 text-xs text-muted-foreground mt-1">
                  <span>Active programs</span>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
                <div className="h-4 w-4 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.upcomingEvents}</div>
                <div className="flex items-center space-x-1 text-xs text-muted-foreground mt-1">
                  <span>Next 30 days</span>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Today's Events</CardTitle>
                <div className="h-4 w-4 text-muted-foreground">
                  <CalendarIcon className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{getTodayEvents().length}</div>
                <div className="flex items-center space-x-1 text-xs text-muted-foreground mt-1">
                  <span>Scheduled today</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Filters Section */}
        {showFilters && (
          <Card className="mb-6">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Filters</CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={clearFilters}>
                    Clear All
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setShowFilters(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Event Type Filters */}
              <div className="space-y-3">
                  <Label className="text-sm font-medium">Event Types</Label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="show-programs"
                        checked={filters.showPrograms}
                        onCheckedChange={(checked) => setFilters(prev => ({ ...prev, showPrograms: checked as boolean }))}
                      />
                      <Label htmlFor="show-programs" className="text-sm">Programs</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="show-events"
                        checked={filters.showEvents}
                        onCheckedChange={(checked) => setFilters(prev => ({ ...prev, showEvents: checked as boolean }))}
                      />
                      <Label htmlFor="show-events" className="text-sm">Events</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="show-forms"
                        checked={filters.showForms}
                        onCheckedChange={(checked) => setFilters(prev => ({ ...prev, showForms: checked as boolean }))}
                      />
                      <Label htmlFor="show-forms" className="text-sm">Form Deadlines</Label>
                    </div>
                  </div>
                </div>
                
                {/* Status Filters */}
              <div className="space-y-3">
                  <Label className="text-sm font-medium">Status</Label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {['ONGOING', 'PLANNED', 'ACTIVE', 'COMPLETED', 'CANCELLED'].map((status) => (
                      <div key={status} className="flex items-center space-x-2">
                        <Checkbox
                          id={`status-${status}`}
                          checked={filters.statuses.includes(status)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setFilters(prev => ({ ...prev, statuses: [...prev.statuses, status] }))
                            } else {
                              setFilters(prev => ({ ...prev, statuses: prev.statuses.filter(s => s !== status) }))
                            }
                          }}
                        />
                        <Label htmlFor={`status-${status}`} className="text-sm">{status}</Label>
                      </div>
                    ))}
                  </div>
                </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content Area */}
        <div className="space-y-6">
        {/* Calendar View */}
          {viewMode === 'calendar' && (
          <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5" />
                Event Calendar
              </CardTitle>
              <CardDescription>
                View all programs, events, and form deadlines in one place
              </CardDescription>
            </CardHeader>
              <CardContent className="p-0">
                <EventCalendar 
                  events={calendarEvents} 
                  isLoading={isLoading}
                  error={error}
                />
            </CardContent>
          </Card>
          )}

          {/* List View */}
          {viewMode === 'list' && (
            <div className="space-y-4">
          {/* Today's Events */}
              <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Today's Events
                    </span>
                {(() => {
                  const todayEvents = getTodayEvents();
                  return todayEvents.length > 0 && (
                        <Badge variant="secondary" className="text-sm">
                      {todayEvents.length} event{todayEvents.length > 1 ? 's' : ''}
                    </Badge>
                  );
                })()}
              </CardTitle>
              <CardDescription>
                Your schedule for today
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(() => {
                  const todayEvents = getTodayEvents();
                      if (todayEvents.length === 0) {
                        return (
                          <div className="text-center py-8 text-muted-foreground">
                            <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p className="text-sm">No events scheduled for today</p>
                          </div>
                        );
                      }

                  return todayEvents.map((event, index) => (
                        <div key={event.id} className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Clock className="h-6 w-6 text-primary" />
                    </div>
                      <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-medium truncate">{event.title}</h3>
                          {getStatusBadge(event.status, 'event')}
                          {index === 0 && (
                            <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                              Next
                        </Badge>
                          )}
                      </div>
                                                 <p className="text-sm text-muted-foreground mb-2">
                           {formatDateTime(event.dateTime)}
                           {event.endDateTime && (
                             <span className="text-xs text-muted-foreground ml-2">
                               - {formatDateTime(event.endDateTime)}
                             </span>
                           )}
                         </p>
                            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                            <span>{event.assignedMembers?.length || 0} assigned</span>
                        </div>
                              {event.venue && (
                                <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                            <span className="truncate">{event.venue}</span>
                          </div>
                              )}
                        </div>
                        {event.description && (
                          <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                            {event.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </CardContent>
          </Card>

              {/* Upcoming Events */}
            <Card>
              <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Upcoming Events
                </CardTitle>
                <CardDescription>
                    Events and programs in the next 30 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingEvents.map((item) => {
                  const isEvent = 'dateTime' in item;
                  const isProgram = !isEvent;
                  return (
                        <div key={item.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        {isProgram ? (
                              <TrendingUp className="h-5 w-5 text-purple-500" />
                        ) : (
                              <CalendarIcon className="h-5 w-5 text-primary" />
                        )}
                    </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{item.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {isEvent ? formatDateTime(item.dateTime) : formatDate(item.endDate)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {isProgram ? 'Program' : 'Event'}
                        </p>
                      </div>
                      {getStatusBadge(item.status, isEvent ? 'event' : 'program')}
                    </div>
                  );
                })}
                {upcomingEvents.length === 0 && (
                      <div className="text-center py-6 text-muted-foreground">
                    <p className="text-sm">No upcoming events</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
            </div>
          )}

          {/* Notifications */}
          {notifications.length > 0 && (
          <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notifications
                </CardTitle>
              <CardDescription>
                  Important updates and reminders
              </CardDescription>
            </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`flex items-start gap-3 p-3 rounded-lg border ${
                        notification.type === 'warning' ? 'bg-orange-50 border-orange-200 dark:bg-orange-950/20 dark:border-orange-800' :
                        notification.type === 'info' ? 'bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800' :
                        'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800'
                      }`}
                    >
                      <div className={`h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                        notification.type === 'warning' ? 'bg-orange-100 text-orange-600' :
                        notification.type === 'info' ? 'bg-blue-100 text-blue-600' :
                        'bg-green-100 text-green-600'
                      }`}>
                        {notification.type === 'warning' ? '⚠️' : notification.type === 'info' ? 'ℹ️' : '✅'}
                </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{notification.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {notification.timestamp.toLocaleTimeString()}
                        </p>
              </div>
                </div>
                  ))}
              </div>
            </CardContent>
          </Card>
          )}
        </div>
      </div>
    </div>
  )
} 