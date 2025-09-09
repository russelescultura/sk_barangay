"use client"

import React from 'react'
import { 
  Plus, 
  Calendar, 
  Users, 
  FileText, 
  CheckCircle, 
  AlertTriangle,
  Download,
  Eye,
  Edit,
  Trash2,
  MapPin,
  FileCheck,
  Activity,
  Upload,
  File,
  Receipt,
  History,
  Paperclip,
  Mail,
  Clock
} from 'lucide-react'
import { useState, useEffect } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DatePickerProvider } from '@/components/ui/date-picker-provider'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SchedulePicker, formatScheduleDisplay } from '@/components/ui/schedule-picker'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/toast'
import { useAuth } from '@/lib/auth'
import { getLocations, type Location } from '@/lib/services/locations'

interface Program {
  id: string
  title: string
  schedule: string
  benefits: string
  objectives: string
  startDate: string
  endDate: string
  targetAudience: string
  venue?: string
  category?: string
  budget?: number
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
  endDateTime: string | null
  venue: string
  maxParticipants: number | null
  status: 'PLANNED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED'
  poster: string | null
  attachments: string | null
  createdAt: string
  updatedAt: string
  programId: string
  program: {
    id: string
    title: string
    status: string
  }
  assignedMembers?: User[]
  forms: Form[]
}

interface FormField {
  id: string
  name: string
  label: string
  type: 'text' | 'email' | 'number' | 'tel' | 'date' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'rating' | 'scale' | 'paragraph' | 'signature' | 'consent' | 'fileUpload' | 'gcashReceipt'
  required: boolean
  options?: string[] // For select, radio, checkbox fields
  min?: number // For rating, scale fields
  max?: number // For rating, scale fields
  placeholder?: string
  qrCodeImage?: string | null // For QR code fields - stores the uploaded QR code image URL
}

interface Form {
  id: string
  title: string
  type: 'REGISTRATION' | 'SURVEY' | 'WAIVER' | 'FEEDBACK' | 'CUSTOM'
  fields: FormField[]
  fileUpload: boolean
  gcashReceipt: boolean
  qrCodeImage: string | null
  accessLink: string | null
  accessQRCode: string | null
  submissionLimit: number | null
  submissionDeadline: string | null
  isActive: boolean
  publishStatus: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
  createdAt: string
  updatedAt: string
  eventId: string
  event: {
    id: string
    title: string
    dateTime: string
    program: {
      id: string
      title: string
    }
  }
  submissions: FormSubmission[]
}

interface FormSubmission {
  id: string
  data: string
  files: string | null
  gcashReceipt: string | null
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  submittedAt: string
  reviewedAt: string | null
  reviewedBy: string | null
  notes: string | null
  formId: string
  userId: string | null
  form: {
    id: string
    title: string
    event: {
      id: string
      title: string
      program: {
        id: string
        title: string
      }
    }
  }
  user: {
    id: string
    name: string
    email: string
    profileImage: string | null
  } | null
}

interface User {
  id: string
  name: string
  email: string
  profileImage: string | null
}

interface DashboardStats {
  totalPrograms: number
  totalEvents: number
  totalForms: number
  totalSubmissions: number
  ongoingPrograms: number
  activeEvents: number
  pendingSubmissions: number
  approvedSubmissions: number
}

// Helper to get category-specific benefits
function getCategoryBenefits(category: string): string[] {
  const benefitsMap: { [key: string]: string[] } = {
    'Leadership': [
      'Leadership skills development',
      'Government exposure and networking',
      'Community service experience',
      'Certificate of completion',
      'Public speaking skills',
      'Team management experience',
      'Decision-making skills',
      'Strategic thinking abilities'
    ],
    'Environment': [
      'Environmental awareness',
      'Conservation skills',
      'Sustainable practices knowledge',
      'Community clean-up experience',
      'Environmental project management',
      'Green technology exposure',
      'Eco-friendly certification',
      'Nature preservation skills'
    ],
    'Education': [
      'Academic skills enhancement',
      'Tutoring experience',
      'Educational technology skills',
      'Curriculum development exposure',
      'Teaching methodologies',
      'Student mentoring experience',
      'Educational leadership',
      'Learning assessment skills'
    ],
    'Sports': [
      'Physical fitness improvement',
      'Sports coaching skills',
      'Team building experience',
      'Athletic performance enhancement',
      'Sports management exposure',
      'Health and wellness knowledge',
      'Competition experience',
      'Sports leadership skills'
    ],
    'Technology': [
      'Digital literacy skills',
      'Programming knowledge',
      'IT project experience',
      'Digital tools proficiency',
      'Technology innovation exposure',
      'Coding and development skills',
      'Digital transformation knowledge',
      'Tech leadership experience'
    ],
    'Community': [
      'Community service experience',
      'Social work skills',
      'Volunteer management',
      'Community development knowledge',
      'Social impact experience',
      'Community networking',
      'Social responsibility awareness',
      'Community leadership skills'
    ],
    'Health': [
      'Health awareness knowledge',
      'First aid skills',
      'Wellness promotion experience',
      'Health education skills',
      'Medical outreach experience',
      'Health advocacy skills',
      'Preventive care knowledge',
      'Health leadership experience'
    ],
    'Arts': [
      'Creative skills development',
      'Artistic expression experience',
      'Cultural appreciation',
      'Performance skills',
      'Artistic leadership',
      'Cultural preservation knowledge',
      'Creative project management',
      'Arts education experience'
    ],
    'Other': [
      'Skill development',
      'Personal growth',
      'Networking opportunities',
      'Certificate of participation',
      'Project management experience',
      'Professional development',
      'Community involvement',
      'Leadership experience'
    ]
  }
  
  return benefitsMap[category] || benefitsMap['Other'] || []
}

// Helper to get category-specific schedules
function getCategorySchedules(category: string): string[] {
  const schedulesMap: { [key: string]: string[] } = {
    'Leadership': [
      'Weekly meetings every Saturday, 9:00 AM - 12:00 PM',
      'Bi-weekly sessions on Tuesdays and Thursdays, 6:00 PM - 8:00 PM',
      'Monthly workshops on first Saturday, 8:00 AM - 5:00 PM',
      'Quarterly leadership retreats (3-day intensive)',
      'Daily morning sessions, 7:00 AM - 8:30 AM',
      'Weekend intensive programs (Saturday-Sunday)',
      'Evening sessions every Monday and Wednesday, 7:00 PM - 9:00 PM',
      'Monthly community service projects (flexible schedule)'
    ],
    'Environment': [
      'Weekly clean-up drives every Sunday, 6:00 AM - 9:00 AM',
      'Monthly tree planting activities, 7:00 AM - 11:00 AM',
      'Bi-weekly environmental workshops, 2:00 PM - 5:00 PM',
      'Seasonal conservation projects (schedule varies)',
      'Weekly recycling collection, Saturdays 8:00 AM - 12:00 PM',
      'Monthly environmental awareness campaigns',
      'Quarterly eco-tours and nature walks',
      'Daily monitoring and maintenance tasks'
    ],
    'Education': [
      'Weekly tutoring sessions, Monday-Friday, 4:00 PM - 6:00 PM',
      'Monthly educational workshops, 9:00 AM - 3:00 PM',
      'Bi-weekly study groups, Saturdays 10:00 AM - 12:00 PM',
      'Summer intensive programs (6 weeks)',
      'Evening classes, Tuesday and Thursday, 7:00 PM - 9:00 PM',
      'Weekend educational activities, 9:00 AM - 5:00 PM',
      'Monthly academic competitions and events',
      'Daily homework assistance, 3:00 PM - 5:00 PM'
    ],
    'Sports': [
      'Daily training sessions, 5:00 PM - 7:00 PM',
      'Weekly sports competitions, Sundays 8:00 AM - 12:00 PM',
      'Bi-weekly fitness workshops, Saturdays 7:00 AM - 9:00 AM',
      'Monthly sports tournaments (weekend events)',
      'Morning fitness sessions, 6:00 AM - 7:30 AM',
      'Weekly team building activities, 4:00 PM - 6:00 PM',
      'Seasonal sports camps (schedule varies)',
      'Evening recreational sports, 6:00 PM - 8:00 PM'
    ],
    'Technology': [
      'Weekly coding workshops, Saturdays 10:00 AM - 2:00 PM',
      'Bi-weekly tech training sessions, 6:00 PM - 8:00 PM',
      'Monthly hackathons and tech events',
      'Daily computer lab sessions, 3:00 PM - 5:00 PM',
      'Weekly digital literacy classes, 4:00 PM - 6:00 PM',
      'Monthly technology exhibitions',
      'Quarterly tech innovation workshops',
      'Evening programming sessions, 7:00 PM - 9:00 PM'
    ],
    'Community': [
      'Weekly community service, Saturdays 8:00 AM - 12:00 PM',
      'Monthly outreach programs (schedule varies)',
      'Bi-weekly community meetings, 6:00 PM - 8:00 PM',
      'Daily volunteer coordination, 9:00 AM - 5:00 PM',
      'Weekly social work activities, 2:00 PM - 6:00 PM',
      'Monthly community events and celebrations',
      'Quarterly community development projects',
      'Evening community support sessions, 7:00 PM - 9:00 PM'
    ],
    'Health': [
      'Weekly health awareness sessions, 4:00 PM - 6:00 PM',
      'Monthly health check-up camps, 8:00 AM - 4:00 PM',
      'Bi-weekly wellness workshops, Saturdays 9:00 AM - 11:00 AM',
      'Daily health monitoring activities',
      'Weekly fitness and nutrition classes, 5:00 PM - 7:00 PM',
      'Monthly medical outreach programs',
      'Quarterly health education campaigns',
      'Evening health consultation sessions, 6:00 PM - 8:00 PM'
    ],
    'Arts': [
      'Weekly art classes, Saturdays 10:00 AM - 12:00 PM',
      'Bi-weekly cultural workshops, 2:00 PM - 5:00 PM',
      'Monthly art exhibitions and performances',
      'Daily creative sessions, 3:00 PM - 5:00 PM',
      'Weekly music and dance classes, 4:00 PM - 6:00 PM',
      'Monthly cultural festivals and events',
      'Quarterly arts and crafts workshops',
      'Evening cultural activities, 6:00 PM - 8:00 PM'
    ],
    'Other': [
      'Flexible schedule based on participant availability',
      'Weekly sessions, time to be determined',
      'Monthly workshops and activities',
      'On-demand program schedule',
      'Seasonal activities and events',
      'Custom schedule based on program requirements',
      'Regular meetings with flexible timing',
      'Program-specific schedule arrangement'
    ]
  }
  
  return schedulesMap[category] || schedulesMap['Other'] || []
}



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

export default function SKProgramsPage() {
  // Helper function to format dates for datetime-local inputs
  const formatDateForInput = (dateString: string) => {
    const date = new Date(dateString)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day}T${hours}:${minutes}`
  }

  const { user: currentUser } = useAuth()
  const toast = useToast()
  // const { confirm, confirmDelete } = useConfirmation() // Unused - removed to fix linter
  const [activeTab, setActiveTab] = useState('overview')
  const [programs, setPrograms] = useState<Program[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [forms, setForms] = useState<Form[]>([])
  const [submissions, setSubmissions] = useState<FormSubmission[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddProgramModal, setShowAddProgramModal] = useState(false)
  const [isCreatingProgram, setIsCreatingProgram] = useState(false)
  const [showAddEventModal, setShowAddEventModal] = useState(false)
  const [isCreatingEvent, setIsCreatingEvent] = useState(false)
  const [showAddFormModal, setShowAddFormModal] = useState(false)
  const [isCreatingForm, setIsCreatingForm] = useState(false)
  const [selectedForm, setSelectedForm] = useState<Form | null>(null)
  const [editingForm, setEditingForm] = useState<Form | null>(null)
  const [showEditFormModal, setShowEditFormModal] = useState(false)
  const [isEditingForm, setIsEditingForm] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)
  const [isDeletingForm, setIsDeletingForm] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [isViewingEvent, setIsViewingEvent] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [showEditEventModal, setShowEditEventModal] = useState(false)
  const [isEditingEvent, setIsEditingEvent] = useState(false)
  const [showDeleteEventConfirm, setShowDeleteEventConfirm] = useState<string | null>(null)
  const [isDeletingEvent, setIsDeletingEvent] = useState(false)
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null)
  const [isViewingProgram, setIsViewingProgram] = useState(false)
  const [editingProgram, setEditingProgram] = useState<Program | null>(null)
  const [showEditProgramModal, setShowEditProgramModal] = useState(false)
  const [isEditingProgram, setIsEditingProgram] = useState(false)
  const [showDeleteProgramConfirm, setShowDeleteProgramConfirm] = useState<string | null>(null)
  const [isDeletingProgram, setIsDeletingProgram] = useState(false)
  const [selectedSubmission, setSelectedSubmission] = useState<FormSubmission | null>(null)
  const [isViewingSubmission, setIsViewingSubmission] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectingSubmission, setRejectingSubmission] = useState<FormSubmission | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [selectedReasonType, setSelectedReasonType] = useState<'predefined' | 'custom'>('predefined')

  // Pre-defined rejection reasons for user-friendly selection
  const rejectionReasons = [
    'Missing required documents',
    'Incomplete information provided',
    'Documents are unclear or illegible',
    'Payment verification pending',
    'Age requirement not met',
    'Maximum participants reached',
    'Event date has passed',
    'Invalid contact information',
    'Duplicate submission detected',
    'Other (please specify)'
  ]
  const [showDeleteSubmissionModal, setShowDeleteSubmissionModal] = useState(false)
  const [deletingSubmission, setDeletingSubmission] = useState<FormSubmission | null>(null)
  const [showEmailTestModal, setShowEmailTestModal] = useState(false)
  const [testEmail, setTestEmail] = useState('')
  const [isTestingEmail, setIsTestingEmail] = useState(false)
  
  // Bulk operations state
  const [selectedSubmissions, setSelectedSubmissions] = useState<Set<string>>(new Set())
  const [showBulkActionModal, setShowBulkActionModal] = useState(false)
  const [bulkActionType, setBulkActionType] = useState<'approve' | 'reject' | 'delete' | null>(null)
  const [isPerformingBulkAction, setIsPerformingBulkAction] = useState(false)
  const [bulkRejectionReason, setBulkRejectionReason] = useState('')
  const [locations, setLocations] = useState<Location[]>([])
  const [isLoadingLocations, setIsLoadingLocations] = useState(false)
  const [programFormData, setProgramFormData] = useState({
    title: '',
    schedule: '',
    benefits: '',
    objectives: '',
    startDate: '',
    endDate: '',
    targetAudience: '',
    venue: '',
    venueType: 'map' as 'map' | 'manual',
    category: '',
    budget: '',
    status: 'ONGOING' as 'ONGOING' | 'COMPLETED' | 'CANCELLED',
    
    // Enhanced schedule fields
    scheduleType: 'RECURRING',
    startTime: '09:00',
    endTime: '17:00',
    frequency: 'WEEKLY',
    frequencyInterval: 1,
    daysOfWeek: ['MONDAY'] as string[],
    timezone: 'Asia/Manila',
    scheduleExceptions: [] as string[]
  })
  const [eventFormData, setEventFormData] = useState({
    title: '',
    description: '',
    dateTime: '',
    endDateTime: '',
    venue: '',
    maxParticipants: '',
    status: 'PLANNED' as 'PLANNED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED',
    programId: '',
    poster: '',
    attachments: ''
  })
  const [formFormData, setFormFormData] = useState<{
    title: string
    type: 'REGISTRATION' | 'SURVEY' | 'WAIVER' | 'FEEDBACK' | 'CUSTOM'
    fields: FormField[]
    fileUpload: boolean
    gcashReceipt: boolean
    qrCodeImage: string | null
    accessLink: string | null
    accessQRCode: string | null
    submissionLimit: string
    submissionDeadline: string
    isActive: boolean
    publishStatus: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
    eventId: string
  }>({
    title: '',
    type: 'REGISTRATION',
    fields: [],
    fileUpload: false,
    gcashReceipt: false,
    qrCodeImage: null,
    accessLink: null,
    accessQRCode: null,
    submissionLimit: '',
    submissionDeadline: '',
    isActive: true,
    publishStatus: 'DRAFT',
    eventId: ''
  })
  const [stats, setStats] = useState<DashboardStats>({
    totalPrograms: 0,
    totalEvents: 0,
    totalForms: 0,
    totalSubmissions: 0,
    ongoingPrograms: 0,
    activeEvents: 0,
    pendingSubmissions: 0,
    approvedSubmissions: 0
  })

  // TODO: Implement youth profile creation functionality
  // const [youthProfileCreated, setYouthProfileCreated] = useState<boolean>(false)
  // const [youthProfileData, setYouthProfileData] = useState<any>(null)

  useEffect(() => {
    fetchData()
    fetchLocations()
  }, [])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      
      // Fetch all data in parallel
      const [programsRes, eventsRes, formsRes, submissionsRes, locationsRes] = await Promise.all([
        fetch('/api/programs'),
        fetch('/api/events'),
        fetch('/api/forms'),
        fetch('/api/submissions'),
        fetch('/api/locations')
      ])

      const [programsData, eventsData, formsData, submissionsData, locationsData] = await Promise.all([
        programsRes.json(),
        eventsRes.json(),
        formsRes.json(),
        submissionsRes.json(),
        locationsRes.json()
      ])

      console.log('Fetched programs data:', programsData.programs)
      setPrograms(programsData.programs || [])
      setEvents(eventsData.events || [])
      setForms(formsData.forms || [])
      setSubmissions(submissionsData.submissions || [])
      setLocations(locationsData || [])

      // Calculate stats
      const calculatedStats: DashboardStats = {
        totalPrograms: programsData.programs?.length || 0,
        totalEvents: eventsData.events?.length || 0,
        totalForms: formsData.forms?.length || 0,
        totalSubmissions: submissionsData.submissions?.length || 0,
        ongoingPrograms: programsData.programs?.filter((p: Program) => p.status === 'ONGOING').length || 0,
        activeEvents: eventsData.events?.filter((e: Event) => e.status === 'ACTIVE').length || 0,
        pendingSubmissions: submissionsData.submissions?.filter((s: FormSubmission) => s.status === 'PENDING').length || 0,
        approvedSubmissions: submissionsData.submissions?.filter((s: FormSubmission) => s.status === 'APPROVED').length || 0
      }

      setStats(calculatedStats)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateProgram = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!programFormData.title || !programFormData.benefits || !programFormData.objectives || 
        !programFormData.startDate || !programFormData.endDate || !programFormData.targetAudience) {
      toast.error('Please fill in all required fields', 'Missing Information')
      return
    }

    try {
      setIsCreatingProgram(true)
      
      console.log('Form submission - sending data:', programFormData)
      console.log('Form submission - category value:', programFormData.category)
      
      const response = await fetch('/api/programs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(programFormData),
      })

      if (response.ok) {
        const newProgram = await response.json()
        setPrograms(prev => [newProgram.program, ...prev])
        setStats(prev => ({
          ...prev,
          totalPrograms: prev.totalPrograms + 1,
          ongoingPrograms: prev.ongoingPrograms + 1
        }))
        setShowAddProgramModal(false)
        setProgramFormData({
          title: '',
          schedule: '',
          benefits: '',
          objectives: '',
          startDate: '',
          endDate: '',
          targetAudience: '',
          venue: '',
          venueType: 'map',
          category: '',
          budget: '',
          status: 'ONGOING',
          
          // Enhanced schedule fields
          scheduleType: 'RECURRING',
          startTime: '09:00',
          endTime: '17:00',
          frequency: 'WEEKLY',
          frequencyInterval: 1,
          daysOfWeek: ['MONDAY'] as string[],
          timezone: 'Asia/Manila',
          scheduleExceptions: [] as string[]
        })
        toast.success('Program created successfully!', 'Success')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to create program', 'Creation Failed')
      }
    } catch (error) {
      console.error('Error creating program:', error)
      toast.error('Failed to create program', 'Network Error')
    } finally {
      setIsCreatingProgram(false)
    }
  }

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!eventFormData.title || !eventFormData.description || !eventFormData.dateTime || 
        !eventFormData.venue || !eventFormData.programId) {
      toast.error('Please fill in all required fields', 'Missing Information')
      return
    }

    try {
      setIsCreatingEvent(true)
      
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...eventFormData,
          maxParticipants: eventFormData.maxParticipants ? parseInt(eventFormData.maxParticipants) : null
        }),
      })

      if (response.ok) {
        const newEvent = await response.json()
        setEvents(prev => [newEvent.event, ...prev])
        setStats(prev => ({
          ...prev,
          totalEvents: prev.totalEvents + 1,
          activeEvents: prev.activeEvents + (newEvent.event.status === 'ACTIVE' ? 1 : 0)
        }))
        setShowAddEventModal(false)
        resetEventFormData()
        toast.success('Event created successfully!', 'Success')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to create event', 'Creation Failed')
      }
    } catch (error) {
      console.error('Error creating event:', error)
      toast.error('Failed to create event', 'Network Error')
    } finally {
      setIsCreatingEvent(false)
    }
  }

  const handleCreateForm = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formFormData.title || !formFormData.type || !formFormData.eventId) {
      toast.error('Please fill in all required fields', 'Missing Information')
      return
    }

    try {
      setIsCreatingForm(true)
      
      console.log('Creating form with data:', formFormData)
      console.log('QR Code Image being sent:', formFormData.qrCodeImage)
      
      const response = await fetch('/api/forms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formFormData,
          fields: JSON.stringify(formFormData.fields), // Ensure fields are stringified
          qrCodeImage: formFormData.qrCodeImage || null,
          submissionLimit: formFormData.submissionLimit ? parseInt(formFormData.submissionLimit) : null,
          submissionDeadline: formFormData.submissionDeadline || null
        }),
      })

      if (response.ok) {
        const newForm = await response.json()
        
        // Generate QR code if form is published
        if (formFormData.publishStatus === 'PUBLISHED') {
          const qrData = await generateFormQRCode(newForm.form.id)
          if (qrData) {
            newForm.form.accessLink = qrData.accessLink
            newForm.form.accessQRCode = qrData.qrCodeUrl
          }
        }
        
        setForms(prev => [newForm.form, ...prev])
        setStats(prev => ({
          ...prev,
          totalForms: prev.totalForms + 1
        }))
        setShowAddFormModal(false)
        resetFormData()
        
        if (formFormData.publishStatus === 'PUBLISHED') {
          toast.success('Form created and published successfully! QR code and access link have been generated.', 'Form Published')
        }
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to create form', 'Creation Failed')
      }
    } catch (error) {
      console.error('Error creating form:', error)
      toast.error('Failed to create form', 'Network Error')
    } finally {
      setIsCreatingForm(false)
    }
  }

  const handleFormFieldChange = (index: number, field: keyof FormField, value: string | boolean | string[] | number | null) => {
    const newFields = [...formFormData.fields];
    (newFields[index] as any)[field] = value;
    setFormFormData({ ...formFormData, fields: newFields });
  };

  const addFormField = () => {
      setFormFormData({
          ...formFormData,
          fields: [
              ...formFormData.fields,
              { id: `${Date.now()}`, name: '', label: '', type: 'text', required: false }
          ]
      });
  };

  const resetFormData = () => {
    setFormFormData({
      title: '',
      type: 'REGISTRATION',
      fields: [],
      fileUpload: false,
      gcashReceipt: false,
      qrCodeImage: null,
      accessLink: null,
      accessQRCode: null,
      submissionLimit: '',
      submissionDeadline: '',
      isActive: true,
      publishStatus: 'DRAFT',
      eventId: ''
    })
  }

  const removeFormField = (index: number) => {
      const newFields = formFormData.fields.filter((_, i) => i !== index);
      setFormFormData({ ...formFormData, fields: newFields });
  };

  const handleViewForm = async (formId: string) => {
    try {
      const response = await fetch(`/api/forms/${formId}`)
      if (response.ok) {
        const data = await response.json()
        console.log('Form data received:', data.form)
        console.log('Fields data:', data.form.fields)
        console.log('QR Code Image:', data.form.qrCodeImage)
        setSelectedForm(data.form)
      } else {
        toast.error('Failed to fetch form details.', 'Loading Error')
      }
    } catch (error) {
      console.error('Error fetching form:', error)
      toast.error('An error occurred while fetching form details.', 'Loading Error')
    }
  }

  const handleEditForm = async (form: Form) => {
    try {
      // Fetch the latest form data to ensure we have the correct fields
      const response = await fetch(`/api/forms/${form.id}`)
      if (response.ok) {
        const data = await response.json()
        const latestForm = data.form
        
        setEditingForm(latestForm)
        // Pre-populate the edit form data with the latest data
        console.log('Loading form for edit:', latestForm)
        console.log('QR Code Image from DB:', latestForm.qrCodeImage)
        setFormFormData({
          title: latestForm.title,
          type: latestForm.type,
          fields: Array.isArray(latestForm.fields) ? latestForm.fields : [],
          fileUpload: latestForm.fileUpload,
          gcashReceipt: latestForm.gcashReceipt,
          qrCodeImage: latestForm.qrCodeImage || null,
          accessLink: latestForm.accessLink || null,
          accessQRCode: latestForm.accessQRCode || null,
          submissionLimit: latestForm.submissionLimit?.toString() || '',
          submissionDeadline: latestForm.submissionDeadline ? formatDateForInput(latestForm.submissionDeadline) : '',
          isActive: latestForm.isActive,
          publishStatus: latestForm.publishStatus || 'DRAFT',
          eventId: latestForm.eventId
        })
        setShowEditFormModal(true)
      } else {
        toast.error('Failed to fetch form details for editing.', 'Loading Error')
      }
    } catch (error) {
      console.error('Error fetching form for editing:', error)
      toast.error('An error occurred while loading form details for editing.', 'Loading Error')
    }
  }

  const generateFormQRCode = async (formId: string) => {
    try {
      const response = await fetch('/api/forms/generate-qr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ formId }),
      })

      if (response.ok) {
        const data = await response.json()
        return data
      } else {
        console.error('Failed to generate QR code')
        return null
      }
    } catch (error) {
      console.error('Error generating QR code:', error)
      return null
    }
  }

  const handleUpdateForm = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!editingForm || !formFormData.title || !formFormData.type || !formFormData.eventId) {
      toast.error('Please fill in all required fields', 'Missing Information')
      return
    }

    try {
      setIsEditingForm(true)
      
      console.log('Updating form with data:', formFormData)
      console.log('QR Code Image being sent:', formFormData.qrCodeImage)
      
      // Check if form is being published and doesn't have QR code yet
      const wasPublished = editingForm.publishStatus === 'PUBLISHED'
      const isBeingPublished = formFormData.publishStatus === 'PUBLISHED'
      const needsQRCode = isBeingPublished && !wasPublished && !formFormData.accessQRCode

      const response = await fetch('/api/forms', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: editingForm.id,
          ...formFormData,
          fields: JSON.stringify(formFormData.fields),
          qrCodeImage: formFormData.qrCodeImage || null,
          submissionLimit: formFormData.submissionLimit ? parseInt(formFormData.submissionLimit) : null,
          submissionDeadline: formFormData.submissionDeadline || null
        }),
      })

      if (response.ok) {
        const updatedForm = await response.json()
        
        // Generate QR code if form is being published
        if (needsQRCode) {
          const qrData = await generateFormQRCode(editingForm.id)
          if (qrData) {
            updatedForm.form.accessLink = qrData.accessLink
            updatedForm.form.accessQRCode = qrData.qrCodeUrl
          }
        }
        
        setForms(prev => prev.map(form => 
          form.id === editingForm.id ? updatedForm.form : form
        ))
        setShowEditFormModal(false)
        setEditingForm(null)
        setFormFormData({
          title: '',
          type: 'REGISTRATION',
          fields: [{ id: '1', name: 'fullName', label: 'Full Name', type: 'text', required: true }],
          fileUpload: false,
          gcashReceipt: false,
          qrCodeImage: null,
          accessLink: null,
          accessQRCode: null,
          submissionLimit: '',
          submissionDeadline: '',
          isActive: true,
          publishStatus: 'DRAFT',
          eventId: ''
        })
        
        if (needsQRCode) {
          toast.success('Form published successfully! QR code and access link have been generated.', 'Form Published')
        } else {
          toast.success('Form updated successfully!', 'Success')
        }
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to update form', 'Update Failed')
      }
    } catch (error) {
      console.error('Error updating form:', error)
      toast.error('Failed to update form', 'Network Error')
    } finally {
      setIsEditingForm(false)
    }
  }

  const handleDeleteForm = async (formId: string) => {
    try {
      setIsDeletingForm(true)
      
      const response = await fetch(`/api/forms?id=${formId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setForms(prev => prev.filter(form => form.id !== formId))
        setStats(prev => ({
          ...prev,
          totalForms: prev.totalForms - 1
        }))
        setShowDeleteConfirm(null)
        toast.success('Form deleted successfully!', 'Success')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to delete form', 'Delete Failed')
      }
    } catch (error) {
      console.error('Error deleting form:', error)
      toast.error('Failed to delete form', 'Network Error')
    } finally {
      setIsDeletingForm(false)
    }
  }

  const handleViewEvent = async (eventId: string) => {
    try {
      const response = await fetch(`/api/events/${eventId}`)
      
      if (response.ok) {
        const data = await response.json()
        setSelectedEvent(data.event)
        setIsViewingEvent(true)
      } else {
        toast.error('Failed to fetch event details', 'Loading Error')
      }
    } catch (error) {
      console.error('Error fetching event:', error)
      toast.error('Failed to fetch event details', 'Loading Error')
    }
  }

  // Fetch locations for venue selection
  const fetchLocations = async () => {
    try {
      setIsLoadingLocations(true)
      const locationsData = await getLocations()
      setLocations(locationsData)
    } catch (error) {
      console.error('Error fetching locations:', error)
      toast.error('Failed to load locations', 'Error')
    } finally {
      setIsLoadingLocations(false)
    }
  }

  // Reset event form data to initial state
  const resetEventFormData = () => {
    setEventFormData({
      title: '',
      description: '',
      dateTime: '',
      endDateTime: '',
      venue: '',
      maxParticipants: '',
      status: 'PLANNED',
      programId: '',
      poster: '',
      attachments: ''
    })
  }

  const handleEditEvent = async (event: Event) => {
    setEditingEvent(event)
    
    setEventFormData({
      title: event.title,
      description: event.description,
      dateTime: formatDateForInput(event.dateTime),
      endDateTime: event.endDateTime ? formatDateForInput(event.endDateTime) : '',
      venue: event.venue,
      maxParticipants: event.maxParticipants?.toString() || '',
      status: event.status,
      programId: event.programId,
      poster: event.poster || '',
      attachments: event.attachments || ''
    })
    setShowEditEventModal(true)
  }

  const handleUpdateEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!editingEvent) return

    try {
      setIsEditingEvent(true)
      
      const response = await fetch(`/api/events/${editingEvent.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...eventFormData,
          assignedMemberIds: editingEvent.assignedMembers?.map(member => member.id) || []
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setEvents(prev => prev.map(event => 
          event.id === editingEvent.id ? data.event : event
        ))
        setShowEditEventModal(false)
        setEditingEvent(null)
        resetEventFormData()
        toast.success('Event updated successfully!', 'Success')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to update event', 'Update Failed')
      }
    } catch (error) {
      console.error('Error updating event:', error)
      toast.error('Failed to update event', 'Network Error')
    } finally {
      setIsEditingEvent(false)
    }
  }

  const handleDeleteEvent = async (eventId: string) => {
    try {
      setIsDeletingEvent(true)
      
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setEvents(prev => prev.filter(event => event.id !== eventId))
        setStats(prev => ({
          ...prev,
          totalEvents: prev.totalEvents - 1
        }))
        setShowDeleteEventConfirm(null)
        toast.success('Event deleted successfully!', 'Success')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to delete event', 'Delete Failed')
      }
    } catch (error) {
      console.error('Error deleting event:', error)
      toast.error('Failed to delete event', 'Network Error')
    } finally {
      setIsDeletingEvent(false)
    }
  }

  const handleViewProgram = async (programId: string) => {
    try {
      const response = await fetch(`/api/programs/${programId}`)
      
      if (response.ok) {
        const data = await response.json()
        setSelectedProgram(data.program)
        setIsViewingProgram(true)
      } else {
        toast.error('Failed to fetch program details', 'Loading Error')
      }
    } catch (error) {
      console.error('Error fetching program:', error)
      toast.error('Failed to fetch program details', 'Loading Error')
    }
  }

  const handleEditProgram = async (program: Program) => {
    setEditingProgram(program)
    
    console.log('Editing program - received data:', program)
    console.log('Editing program - start_time:', (program as any).start_time)
    console.log('Editing program - end_time:', (program as any).end_time)
    
    // Format dates for date inputs (YYYY-MM-DD format)
    const formatDateForDateInput = (dateString: string) => {
      const date = new Date(dateString)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    }
    
    setProgramFormData({
      title: program.title,
      schedule: program.schedule,
      benefits: program.benefits,
      objectives: program.objectives,
      startDate: formatDateForDateInput(program.startDate),
      endDate: formatDateForDateInput(program.endDate),
      targetAudience: program.targetAudience,
      venue: program.venue || '',
      venueType: program.venue && locations.some(loc => loc.name === program.venue) ? 'map' : 'manual',
      category: program.category || '',
      budget: program.budget?.toString() || '',
      status: program.status,
      
      // Enhanced schedule fields - read from program data
      scheduleType: (program as any).schedule_type || 'RECURRING',
      startTime: (program as any).start_time || '09:00',
      endTime: (program as any).end_time || '17:00',
      frequency: (program as any).frequency || 'WEEKLY',
      frequencyInterval: (program as any).frequency_interval || 1,
      daysOfWeek: (program as any).days_of_week ? JSON.parse((program as any).days_of_week) : ['MONDAY'],
      timezone: (program as any).timezone || 'Asia/Manila',
      scheduleExceptions: (program as any).schedule_exceptions ? JSON.parse((program as any).schedule_exceptions) : []
    })
    
    console.log('Form data after setting:', programFormData)
    console.log('Form data - startTime:', programFormData.startTime)
    console.log('Form data - endTime:', programFormData.endTime)
    console.log('Raw program data - start_time:', (program as any).start_time)
    console.log('Raw program data - end_time:', (program as any).end_time)
    console.log('Raw program data - start_time type:', typeof (program as any).start_time)
    console.log('Raw program data - end_time type:', typeof (program as any).end_time)
    setShowEditProgramModal(true)
  }

  const handleUpdateProgram = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!editingProgram) return

    try {
      setIsEditingProgram(true)
      
      console.log('Form update - sending data:', {
        ...programFormData,
        assignedMemberIds: editingProgram.assignedMembers?.map(member => member.id) || []
      })
      console.log('Form update - category value:', programFormData.category)
      
      const response = await fetch(`/api/programs/${editingProgram.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...programFormData,
          assignedMemberIds: editingProgram.assignedMembers?.map(member => member.id) || []
        }),
      })

      if (response.ok) {
        // Refresh the programs list to get the updated data with proper field names
        const programsResponse = await fetch('/api/programs')
        const programsData = await programsResponse.json()
        setPrograms(programsData.programs || [])
        
        setShowEditProgramModal(false)
        setEditingProgram(null)
        setProgramFormData({
          title: '',
          schedule: '',
          benefits: '',
          objectives: '',
          startDate: '',
          endDate: '',
          targetAudience: '',
          venue: '',
          venueType: 'map',
          category: '',
          budget: '',
          status: 'ONGOING',
          
          // Enhanced schedule fields
          scheduleType: 'RECURRING',
          startTime: '09:00',
          endTime: '17:00',
          frequency: 'WEEKLY',
          frequencyInterval: 1,
          daysOfWeek: ['MONDAY'] as string[],
          timezone: 'Asia/Manila',
          scheduleExceptions: [] as string[]
        })
        toast.success('Program updated successfully!', 'Success')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to update program', 'Update Failed')
      }
    } catch (error) {
      console.error('Error updating program:', error)
      toast.error('Failed to update program', 'Network Error')
    } finally {
      setIsEditingProgram(false)
    }
  }

  const handleDeleteProgram = async (programId: string) => {
    try {
      setIsDeletingProgram(true)
      
      const response = await fetch(`/api/programs/${programId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setPrograms(prev => prev.filter(program => program.id !== programId))
        setStats(prev => ({
          ...prev,
          totalPrograms: prev.totalPrograms - 1
        }))
        setShowDeleteProgramConfirm(null)
        toast.success('Program deleted successfully!', 'Success')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to delete program', 'Delete Failed')
      }
    } catch (error) {
      console.error('Error deleting program:', error)
      toast.error('Failed to delete program', 'Network Error')
    } finally {
      setIsDeletingProgram(false)
    }
  }

  const handleViewSubmission = (submission: FormSubmission) => {
    setSelectedSubmission(submission)
    setIsViewingSubmission(true)
  }

  const handleApproveSubmission = async (submissionId: string) => {
    try {
      const response = await fetch(`/api/submissions/${submissionId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'APPROVED',
          reviewedBy: currentUser?.name || 'Admin',
          reviewedAt: new Date().toISOString()
        }),
      })

      if (response.ok) {
        const submission = submissions.find(sub => sub.id === submissionId)
        // Update the submission in state
        setSubmissions(submissions.map(sub => 
          sub.id === submissionId 
            ? { ...sub, status: 'APPROVED' as const, reviewedBy: currentUser?.name || 'Admin', reviewedAt: new Date().toISOString() }
            : sub
        ))
        
        // Show success message with email notification info
        let emailInfo = ' (no email notification - email not available)'
        
        if (submission?.data) {
          try {
            const formData = JSON.parse(submission.data)
            const formEmail = formData['Enter your Email Address'] || 
                            formData['Enter Your Email Address'] || 
                            formData['Email Address'] || 
                            formData['email'] || 
                            formData['Email'] || 
                            formData['emailAddress'] || 
                            formData['email_address']
            
            if (formEmail) {
              emailInfo = ` and approval email sent to ${formEmail}`
            } else if (submission?.user?.email) {
              emailInfo = ` and approval email sent to ${submission.user?.email}`
            }
          } catch (error) {
            // If parsing fails, try user email as fallback
            if (submission?.user?.email) {
              emailInfo = ` and approval email sent to ${submission.user?.email}`
            }
          }
        } else if (submission?.user?.email) {
          emailInfo = ` and approval email sent to ${submission.user?.email}`
        }
        
        toast.success(`Submission approved successfully!${emailInfo}`, 'Approval Sent')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to approve submission', 'Approval Failed')
      }
    } catch (error) {
      console.error('Error approving submission:', error)
      toast.error('Failed to approve submission', 'Network Error')
    }
  }

  const handleRejectSubmission = (submission: FormSubmission) => {
    setRejectingSubmission(submission)
    setRejectionReason('')
    setSelectedReasonType('predefined')
    setShowRejectModal(true)
  }

  const confirmRejectSubmission = async () => {
    if (!rejectingSubmission) return
    
    try {
      const response = await fetch(`/api/submissions/${rejectingSubmission.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'REJECTED',
          reviewedBy: currentUser?.name || 'Admin',
          reviewedAt: new Date().toISOString(),
          notes: rejectionReason || 'Submission rejected'
        }),
      })

      if (response.ok) {
        // Update the submission in state
        setSubmissions(submissions.map(sub => 
          sub.id === rejectingSubmission.id 
            ? { 
                ...sub, 
                status: 'REJECTED' as const, 
                reviewedBy: currentUser?.name || 'Admin', 
                reviewedAt: new Date().toISOString(),
                notes: rejectionReason || 'Submission rejected'
              }
            : sub
        ))
        
        // Show success message with email notification info
        let emailInfo = ' (no email notification - email not available)'
        
        if (rejectingSubmission?.data) {
          try {
            const formData = JSON.parse(rejectingSubmission.data)
            const formEmail = formData['Enter your Email Address'] || 
                            formData['Enter Your Email Address'] || 
                            formData['Email Address'] || 
                            formData['email'] || 
                            formData['Email'] || 
                            formData['emailAddress'] || 
                            formData['email_address']
            
            if (formEmail) {
              emailInfo = ` and rejection email sent to ${formEmail}`
            } else if (rejectingSubmission?.user?.email) {
              emailInfo = ` and rejection email sent to ${rejectingSubmission.user?.email}`
            }
          } catch (error) {
            // If parsing fails, try user email as fallback
            if (rejectingSubmission?.user?.email) {
              emailInfo = ` and rejection email sent to ${rejectingSubmission.user?.email}`
            }
          }
        } else if (rejectingSubmission?.user?.email) {
          emailInfo = ` and rejection email sent to ${rejectingSubmission.user?.email}`
        }
        
        toast.success(`Submission rejected successfully!${emailInfo}`, 'Rejection Sent')
        setShowRejectModal(false)
        setRejectingSubmission(null)
        setRejectionReason('')
        setSelectedReasonType('predefined')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to reject submission', 'Rejection Failed')
      }
    } catch (error) {
      console.error('Error rejecting submission:', error)
      toast.error('Failed to reject submission', 'Network Error')
    }
  }

  const handleDeleteSubmission = (submission: FormSubmission) => {
    setDeletingSubmission(submission)
    setShowDeleteSubmissionModal(true)
  }

  const confirmDeleteSubmission = async () => {
    if (!deletingSubmission) return
    
    try {
      const response = await fetch(`/api/submissions/${deletingSubmission.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        // Remove the submission from state
        setSubmissions(submissions.filter(sub => sub.id !== deletingSubmission.id))
        toast.success('Submission deleted successfully!', 'Success')
        setShowDeleteSubmissionModal(false)
        setDeletingSubmission(null)
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to delete submission', 'Delete Failed')
      }
    } catch (error) {
      console.error('Error deleting submission:', error)
      toast.error('Failed to delete submission', 'Network Error')
    }
  }

  // Bulk operations
  const handleSelectSubmission = (submissionId: string) => {
    setSelectedSubmissions(prev => {
      const newSet = new Set(prev)
      if (newSet.has(submissionId)) {
        newSet.delete(submissionId)
      } else {
        newSet.add(submissionId)
      }
      return newSet
    })
  }

  const handleSelectAllSubmissions = () => {
    const allSubmissionIds = submissions.map(sub => sub.id)
    setSelectedSubmissions(new Set(allSubmissionIds))
  }

  const handleClearSelection = () => {
    setSelectedSubmissions(new Set())
  }

  const handleBulkAction = (actionType: 'approve' | 'reject' | 'delete') => {
    if (selectedSubmissions.size === 0) return
    
    setBulkActionType(actionType)
    setShowBulkActionModal(true)
  }

  const confirmBulkAction = async () => {
    if (!bulkActionType || selectedSubmissions.size === 0) return

    try {
      setIsPerformingBulkAction(true)
      
      const submissionIds = Array.from(selectedSubmissions)
      
      switch (bulkActionType) {
        case 'approve':
          await Promise.all(submissionIds.map(async (id) => {
            const response = await fetch(`/api/submissions/${id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ status: 'APPROVED' })
            })
            return response.ok
          }))
          break
          
        case 'reject':
          await Promise.all(submissionIds.map(async (id) => {
            const response = await fetch(`/api/submissions/${id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                status: 'REJECTED',
                notes: bulkRejectionReason || 'Bulk rejection'
              })
            })
            return response.ok
          }))
          break
          
        case 'delete':
          await Promise.all(submissionIds.map(async (id) => {
            const response = await fetch(`/api/submissions/${id}`, {
              method: 'DELETE'
            })
            return response.ok
          }))
          break
      }
      
      // Refresh data
      await fetchData()
      
      // Clear selection and close modal
      setSelectedSubmissions(new Set())
      setShowBulkActionModal(false)
      setBulkActionType(null)
      setBulkRejectionReason('')
      
    } catch (error) {
      console.error('Error performing bulk action:', error)
    } finally {
      setIsPerformingBulkAction(false)
    }
  }

  const testEmailService = async () => {
    if (!testEmail) {
      toast.error('Please enter an email address', 'Missing Information')
      return
    }

    setIsTestingEmail(true)
    try {
      const response = await fetch('/api/test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ to: testEmail }),
      })

      const result = await response.json()

      if (response.ok) {
        toast.success('Test email sent successfully! Please check your inbox.', 'Email Sent')
        setShowEmailTestModal(false)
        setTestEmail('')
      } else {
        toast.error(result.error || 'Failed to send test email', 'Email Failed')
      }
    } catch (error) {
      console.error('Error testing email:', error)
      toast.error('Failed to send test email', 'Network Error')
    } finally {
      setIsTestingEmail(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const baseClasses = "text-xs font-medium px-2 py-1 rounded-full"
    
    switch (status) {
      case 'ONGOING':
        return <Badge className={`${baseClasses} bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200`}>Ongoing</Badge>
      case 'COMPLETED':
        return <Badge className={`${baseClasses} bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200`}>Completed</Badge>
      case 'CANCELLED':
        return <Badge className={`${baseClasses} bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200`}>Cancelled</Badge>
      case 'PLANNED':
        return <Badge className={`${baseClasses} bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200`}>Planned</Badge>
      case 'ACTIVE':
        return <Badge className={`${baseClasses} bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200`}>Active</Badge>
      case 'INACTIVE':
        return <Badge className={`${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200`}>Inactive</Badge>
      case 'PENDING':
        return <Badge className={`${baseClasses} bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200`}>Pending</Badge>
      case 'APPROVED':
        return <Badge className={`${baseClasses} bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200`}>Approved</Badge>
      case 'REJECTED':
        return <Badge className={`${baseClasses} bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200`}>Rejected</Badge>
      case 'DRAFT':
        return <Badge className={`${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200`}>Draft</Badge>
      case 'PUBLISHED':
        return <Badge className={`${baseClasses} bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200`}>Published</Badge>
      case 'ARCHIVED':
        return <Badge className={`${baseClasses} bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200`}>Archived</Badge>
      default:
        return <Badge className={`${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200`}>{status}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Helper function to extract user name from form data
  const getUserNameFromSubmission = (submission: FormSubmission) => {
    try {
      const formData = JSON.parse(submission.data)
      // Look for common name field variations - check the exact field names from the form
      const nameField = formData['Enter you full name'] ||  // exact match from console log
                      formData['Enter You Full Name'] || 
                      formData['Enter Your Full Name'] || 
                      formData['Full Name'] || 
                      formData['Full name'] ||  // lowercase 'n'
                      formData['Name'] || 
                      formData['fullName'] || 
                      formData['name'] ||
                      submission.user?.name ||
                      'Anonymous User'
      

      
      return nameField
    } catch (error) {
      console.error('Error parsing submission data:', error)
      return submission.user?.name || 'Anonymous User'
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading SK Program Management...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header Section - Consistent with main dashboard */}
        <div className="flex items-center justify-between mb-8 pt-16 lg:pt-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">SK Program Management</h1>
            <p className="text-muted-foreground mt-2">
              Manage Sangguniang Kabataan programs, events, forms, and submissions
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

      {/* Add Program Modal */}
      <Dialog open={showAddProgramModal} onOpenChange={(open) => {
        if (open) {
          // Reset form data when opening create modal
          setProgramFormData({
            title: '',
            schedule: '',
            benefits: '',
            objectives: '',
            startDate: '',
            endDate: '',
            targetAudience: '',
            venue: '',
            venueType: 'map',
            category: '',
            budget: '',
            status: 'ONGOING',
            
            // Enhanced schedule fields
            scheduleType: 'RECURRING',
            startTime: '09:00',
            endTime: '17:00',
            frequency: 'WEEKLY',
            frequencyInterval: 1,
            daysOfWeek: ['MONDAY'] as string[],
            timezone: 'Asia/Manila',
            scheduleExceptions: [] as string[]
          })
        }
        setShowAddProgramModal(open)
      }}>
        <DialogContent className="w-[98vw] max-w-2xl max-h-[98vh] overflow-y-auto p-2 xs:p-3 sm:p-6">
          <DialogHeader className="pb-2 xs:pb-3 sm:pb-4">
            <DialogTitle className="text-base xs:text-lg sm:text-xl">Create New Program</DialogTitle>
            <DialogDescription className="text-xs xs:text-sm">Add a new SK program to the system</DialogDescription>
          </DialogHeader>
            <CardContent className="p-0">
              <form onSubmit={handleCreateProgram} className="space-y-3 xs:space-y-4 sm:space-y-6">
                <div className="space-y-1 xs:space-y-2">
                  <Label htmlFor="title" className="text-xs xs:text-sm font-medium">Program Title *</Label>
                  <Input
                    id="title"
                    value={programFormData.title}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProgramFormData({...programFormData, title: e.target.value})}
                    placeholder="Enter program title"
                    required
                    className="w-full text-sm xs:text-base py-2 xs:py-3"
                  />
                </div>
                
                <div className="space-y-2 xs:space-y-3">
                  <Label htmlFor="schedule" className="text-xs xs:text-sm font-medium">Schedule *</Label>
                  <div className="space-y-2 xs:space-y-3">
                    <DatePickerProvider>
                      <SchedulePicker
                        value={{
                          scheduleType: programFormData.scheduleType as 'ONE_TIME' | 'RECURRING',
                          startDate: programFormData.startDate,
                          endDate: programFormData.endDate,
                          startTime: programFormData.startTime,
                          endTime: programFormData.endTime,
                          frequency: programFormData.frequency as 'DAILY' | 'WEEKLY' | 'BI_WEEKLY' | 'MONTHLY' | 'CUSTOM',
                          frequencyInterval: programFormData.frequencyInterval,
                          daysOfWeek: programFormData.daysOfWeek,
                          timezone: programFormData.timezone,
                          exceptions: programFormData.scheduleExceptions,
                          customDescription: programFormData.schedule
                        }}
                        onChange={(scheduleData) => {
                          const updatedData = {
                            ...programFormData,
                            startDate: scheduleData.startDate,
                            endDate: scheduleData.endDate,
                            scheduleType: scheduleData.scheduleType,
                            startTime: scheduleData.startTime,
                            endTime: scheduleData.endTime,
                            frequency: scheduleData.frequency,
                            frequencyInterval: scheduleData.frequencyInterval,
                            daysOfWeek: scheduleData.daysOfWeek,
                            timezone: scheduleData.timezone || 'Asia/Manila',
                            scheduleExceptions: scheduleData.exceptions,
                            schedule: scheduleData.customDescription || ''
                          }
                          setProgramFormData(updatedData)
                        }}
                      />
                    </DatePickerProvider>
                    {programFormData.category && (
                      <div className="space-y-2">
                        <Label className="text-sm text-muted-foreground">Suggested schedules for {programFormData.category}:</Label>
                        <div className="flex flex-wrap gap-2">
                          {getCategorySchedules(programFormData.category).map((schedule, index) => (
                            <Button
                              key={index}
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setProgramFormData({...programFormData, schedule});
                              }}
                              className="text-xs"
                            >
                              {schedule.length > 40 ? `${schedule.substring(0, 40)  }...` : schedule}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2 xs:space-y-3">
                  <Label htmlFor="benefits" className="text-xs xs:text-sm font-medium">Benefits *</Label>
                  <div className="space-y-2 xs:space-y-3">
                    <Textarea
                      id="benefits"
                      value={programFormData.benefits}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setProgramFormData({...programFormData, benefits: e.target.value})}
                      placeholder="List the benefits participants will receive"
                      rows={3}
                      required
                      className="w-full text-sm xs:text-base resize-none py-2 xs:py-3"
                    />
                    {programFormData.category && (
                      <div className="space-y-2">
                        <Label className="text-sm text-muted-foreground">Suggested benefits for {programFormData.category}:</Label>
                        <div className="flex flex-wrap gap-2">
                          {getCategoryBenefits(programFormData.category).map((benefit, index) => (
                            <Button
                              key={index}
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const currentBenefits = programFormData.benefits;
                                const newBenefit = currentBenefits ? `${currentBenefits}\n• ${benefit}` : `• ${benefit}`;
                                setProgramFormData({...programFormData, benefits: newBenefit});
                              }}
                              className="text-xs"
                            >
                              + {benefit}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="space-y-1 xs:space-y-2">
                  <Label htmlFor="objectives" className="text-xs xs:text-sm font-medium">Objectives *</Label>
                  <Textarea
                    id="objectives"
                    value={programFormData.objectives}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setProgramFormData({...programFormData, objectives: e.target.value})}
                    placeholder="List the program objectives"
                    rows={3}
                    required
                    className="w-full text-sm xs:text-base resize-none py-2 xs:py-3"
                  />
                </div>
                

                
                <div className="space-y-1 xs:space-y-2">
                  <Label htmlFor="targetAudience" className="text-xs xs:text-sm font-medium">Target Audience *</Label>
                  <Input
                    id="targetAudience"
                    value={programFormData.targetAudience}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProgramFormData({...programFormData, targetAudience: e.target.value})}
                    placeholder="e.g., Youth aged 15-30"
                    required
                    className="w-full text-sm xs:text-base py-2 xs:py-3"
                  />
                </div>
                
                <div className="space-y-2 xs:space-y-3">
                  <Label htmlFor="programVenue" className="text-xs xs:text-sm font-medium">Venue</Label>
                  <div className="space-y-3 xs:space-y-4">
                    {/* Venue Type Selection */}
                    <div className="flex flex-col gap-1 xs:gap-2">
                      <Button
                        type="button"
                        variant={programFormData.venueType === 'map' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setProgramFormData({...programFormData, venueType: 'map', venue: ''})}
                        className="w-full text-xs xs:text-sm py-2 xs:py-2.5"
                      >
                        📍 Map Location
                      </Button>
                      <Button
                        type="button"
                        variant={programFormData.venueType === 'manual' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setProgramFormData({...programFormData, venueType: 'manual', venue: ''})}
                        className="w-full text-xs xs:text-sm py-2 xs:py-2.5"
                      >
                        ✏️ Manual Entry
                      </Button>
                    </div>

                    {/* Map Location Selection */}
                    {programFormData.venueType === 'map' && (
                      <div className="relative">
                        <select
                          id="programVenue"
                          value={programFormData.venue}
                          onChange={(e) => setProgramFormData({...programFormData, venue: e.target.value})}
                          className="w-full px-2 xs:px-3 py-2 xs:py-3 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-sm xs:text-base"
                          disabled={isLoadingLocations}
                        >
                          <option value="">Select a venue from map locations</option>
                          {locations.map((location) => (
                            <option key={location.id} value={location.name}>
                              {location.name} - {location.type.toLowerCase()}
                            </option>
                          ))}
                        </select>
                        {isLoadingLocations && (
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Manual Venue Entry */}
                    {programFormData.venueType === 'manual' && (
                      <Input
                        id="programVenueManual"
                        value={programFormData.venue}
                        onChange={(e) => setProgramFormData({...programFormData, venue: e.target.value})}
                        placeholder="Enter venue manually (e.g., Barangay Hall, Community Center, School)"
                        className="w-full text-sm xs:text-base py-2 xs:py-3"
                      />
                    )}

                    {/* Help Text */}
                    {programFormData.venueType === 'map' && locations.length === 0 && !isLoadingLocations && (
                      <div className="text-xs text-gray-500 mt-1">
                        <p>No locations found. Add locations on the map first.</p>
                        <button
                          type="button"
                          onClick={fetchLocations}
                          className="text-blue-600 hover:text-blue-800 underline mt-1"
                        >
                          Refresh locations
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="space-y-1 xs:space-y-2">
                  <Label htmlFor="category" className="text-xs xs:text-sm font-medium">Category</Label>
                  <select
                    id="category"
                    value={programFormData.category}
                    onChange={(e) => setProgramFormData({...programFormData, category: e.target.value})}
                    className="w-full px-2 xs:px-3 py-2 xs:py-3 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-sm xs:text-base"
                  >
                    <option value="">Select a category</option>
                    <option value="Leadership">Leadership</option>
                    <option value="Environment">Environment</option>
                    <option value="Education">Education</option>
                    <option value="Sports">Sports</option>
                    <option value="Technology">Technology</option>
                    <option value="Community">Community</option>
                    <option value="Health">Health</option>
                    <option value="Arts">Arts</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                
                <div className="space-y-1 xs:space-y-2">
                  <Label htmlFor="budget" className="text-xs xs:text-sm font-medium">Budget (₱)</Label>
                  <Input
                    id="budget"
                    type="number"
                    step="0.01"
                    min="0"
                    value={programFormData.budget}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProgramFormData({...programFormData, budget: e.target.value})}
                    placeholder="Enter budget amount"
                    className="w-full text-sm xs:text-base py-2 xs:py-3"
                  />
                </div>
                
                <div className="space-y-1 xs:space-y-2">
                  <Label htmlFor="status" className="text-xs xs:text-sm font-medium">Status</Label>
                  <select
                    id="status"
                    value={programFormData.status}
                    onChange={(e) => setProgramFormData({...programFormData, status: e.target.value as 'ONGOING' | 'COMPLETED' | 'CANCELLED'})}
                    className="w-full px-2 xs:px-3 py-2 xs:py-3 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-sm xs:text-base"
                  >
                    <option value="ONGOING">Ongoing</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>
                
                <div className="flex flex-col gap-2 xs:gap-3 pt-4 xs:pt-6 border-t">
                  <Button 
                    type="submit" 
                    disabled={isCreatingProgram}
                    className="w-full py-2.5 xs:py-3 text-sm xs:text-base"
                  >
                    {isCreatingProgram ? 'Creating...' : 'Create Program'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddProgramModal(false)}
                    disabled={isCreatingProgram}
                    className="w-full py-2.5 xs:py-3 text-sm xs:text-base"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </DialogContent>
        </Dialog>

      {/* Add Event Modal */}
      <Dialog open={showAddEventModal} onOpenChange={(open) => {
        if (!open) {
                    resetEventFormData()
                    setShowAddEventModal(false)
        }
      }}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Event</DialogTitle>
            <DialogDescription>Add a new SK event to the system</DialogDescription>
          </DialogHeader>
            <CardContent>
              <form onSubmit={handleCreateEvent} className="space-y-4">
                <div>
                  <Label htmlFor="eventTitle">Event Title *</Label>
                  <Input
                    id="eventTitle"
                    value={eventFormData.title}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEventFormData({...eventFormData, title: e.target.value})}
                    placeholder="Enter event title"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="eventDescription">Description *</Label>
                  <Textarea
                    id="eventDescription"
                    value={eventFormData.description}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEventFormData({...eventFormData, description: e.target.value})}
                    placeholder="Describe the event"
                    rows={3}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="eventDateTime">Date & Time *</Label>
                    <Input
                      id="eventDateTime"
                      type="datetime-local"
                      value={eventFormData.dateTime}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEventFormData({...eventFormData, dateTime: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="eventEndDateTime">End Date & Time (Optional)</Label>
                    <Input
                      id="eventEndDateTime"
                      type="datetime-local"
                      value={eventFormData.endDateTime}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEventFormData({...eventFormData, endDateTime: e.target.value})}
                      min={eventFormData.dateTime}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="eventVenue">Venue *</Label>
                    <div className="relative">
                      <select
                        id="eventVenue"
                        value={eventFormData.venue}
                        onChange={(e) => setEventFormData({...eventFormData, venue: e.target.value})}
                        className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                        required
                        disabled={isLoadingLocations}
                      >
                        <option value="">Select a venue from map locations</option>
                        {locations.map((location) => (
                          <option key={location.id} value={location.name}>
                            {location.name} - {location.type.toLowerCase()}
                          </option>
                        ))}
                      </select>
                      {isLoadingLocations && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        </div>
                      )}
                    </div>
                    {locations.length === 0 && !isLoadingLocations && (
                      <div className="text-xs text-gray-500 mt-1">
                        <p>No locations found. Add locations on the map first.</p>
                        <button
                          type="button"
                          onClick={fetchLocations}
                          className="text-blue-600 hover:text-blue-800 underline mt-1"
                        >
                          Refresh locations
                        </button>
                      </div>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="eventMaxParticipants">Max Participants</Label>
                    <Input
                      id="eventMaxParticipants"
                      type="number"
                      value={eventFormData.maxParticipants}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEventFormData({...eventFormData, maxParticipants: e.target.value})}
                      placeholder="Optional"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="eventMaxParticipants">Max Participants</Label>
                    <Input
                      id="eventMaxParticipants"
                      type="number"
                      value={eventFormData.maxParticipants}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEventFormData({...eventFormData, maxParticipants: e.target.value})}
                      placeholder="Optional"
                    />
                  </div>
                  <div>
                    <Label htmlFor="eventStatus">Status</Label>
                    <select
                      id="eventStatus"
                      value={eventFormData.status}
                      onChange={(e) => setEventFormData({...eventFormData, status: e.target.value as 'PLANNED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED'})}
                      className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="PLANNED">Planned</option>
                      <option value="ACTIVE">Active</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="eventProgramId">Program *</Label>
                  <select
                    id="eventProgramId"
                    value={eventFormData.programId}
                    onChange={(e) => setEventFormData({...eventFormData, programId: e.target.value})}
                    className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                    required
                  >
                    <option value="">Select a program</option>
                    {programs.map((program) => (
                      <option key={program.id} value={program.id}>
                        {program.title}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      resetEventFormData()
                      setShowAddEventModal(false)
                    }}
                    disabled={isCreatingEvent}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isCreatingEvent}>
                    {isCreatingEvent ? 'Creating...' : 'Create Event'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </DialogContent>
        </Dialog>

      {/* Add Form Modal */}
      <Dialog open={showAddFormModal} onOpenChange={(open) => {
        if (!open) {
                    setShowAddFormModal(false)
                    resetFormData()
        }
      }}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Form</DialogTitle>
            <DialogDescription>Add a new form to an event</DialogDescription>
          </DialogHeader>
            <CardContent>
              <form onSubmit={handleCreateForm} className="space-y-4">
                <div>
                  <Label htmlFor="formTitle">Form Title *</Label>
                  <Input
                    id="formTitle"
                    value={formFormData.title}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormFormData({...formFormData, title: e.target.value})}
                    placeholder="Enter form title"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="formType">Form Type *</Label>
                    <select
                      id="formType"
                      value={formFormData.type}
                      onChange={(e) => setFormFormData({...formFormData, type: e.target.value as 'REGISTRATION' | 'SURVEY' | 'WAIVER' | 'FEEDBACK' | 'CUSTOM'})}
                      className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                      required
                    >
                      <option value="REGISTRATION">Registration</option>
                      <option value="SURVEY">Survey</option>
                      <option value="WAIVER">Waiver</option>
                      <option value="FEEDBACK">Feedback</option>
                      <option value="CUSTOM">Custom</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="formEventId">Event *</Label>
                    <select
                      id="formEventId"
                      value={formFormData.eventId}
                      onChange={(e) => setFormFormData({...formFormData, eventId: e.target.value})}
                      className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                      required
                    >
                      <option value="">Select an event</option>
                      {events.map((event) => (
                        <option key={event.id} value={event.id}>
                          {event.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div>
                  <Label>Form Fields *</Label>
                  <div className="space-y-4 rounded-md border p-4">
                    {formFormData.fields.map((field, index) => (
                      <div key={field.id} className="grid grid-cols-1 gap-4 rounded-lg border p-3 sm:grid-cols-3">
                        <Input
                          value={field.label}
                          onChange={(e) => handleFormFieldChange(index, 'label', e.target.value)}
                          placeholder="Field Label"
                          required
                        />
                        <Input
                          value={field.name}
                          onChange={(e) => handleFormFieldChange(index, 'name', e.target.value)}
                          placeholder="Field Name (e.g., fullName)"
                          required
                        />
                        <div className="flex items-center gap-2">
                          <select
                            value={field.type}
                            onChange={(e) => handleFormFieldChange(index, 'type', e.target.value)}
                            className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                          >
                            {/* Basic field types for all forms */}
                            <option value="text">Text</option>
                            <option value="email">Email</option>
                            <option value="number">Number</option>
                            <option value="tel">Phone</option>
                            <option value="date">Date</option>
                            <option value="textarea">Textarea</option>
                            <option value="fileUpload">File Upload</option>
                            <option value="gcashReceipt">GCash Receipt</option>
                            <option value="qrCode">QR Code</option>
                            
                            {/* Survey and Registration additional field types */}
                            {(formFormData.type === 'SURVEY' || formFormData.type === 'REGISTRATION') && (
                              <>
                                <option value="select">Dropdown</option>
                                <option value="radio">Radio Buttons</option>
                                <option value="checkbox">Checkboxes</option>
                                <option value="rating">Rating (1-5)</option>
                                <option value="scale">Scale (1-10)</option>
                                <option value="paragraph">Paragraph</option>
                              </>
                            )}
                            
                            {/* Waiver-specific field types */}
                            {formFormData.type === 'WAIVER' && (
                              <>
                                <option value="consent">Consent Checkbox</option>
                                <option value="signature">Signature</option>
                                <option value="paragraph">Legal Text</option>
                                <option value="select">Dropdown</option>
                              </>
                            )}
                            
                            {/* Feedback-specific field types */}
                            {formFormData.type === 'FEEDBACK' && (
                              <>
                                <option value="rating">Rating (1-5)</option>
                                <option value="scale">Scale (1-10)</option>
                                <option value="select">Dropdown</option>
                                <option value="radio">Radio Buttons</option>
                                <option value="checkbox">Checkboxes</option>
                                <option value="paragraph">Paragraph</option>
                              </>
                            )}
                          </select>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFormField(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        {/* Options field for select, radio, checkbox */}
                        {(field.type === 'select' || field.type === 'radio' || field.type === 'checkbox') && (
                          <div className="col-span-1 sm:col-span-3">
                            <Label className="text-sm">Options (one per line)</Label>
                            <Textarea
                              value={field.options?.join('\n') || ''}
                              onChange={(e) => {
                                const lines = e.target.value.split('\n');
                                handleFormFieldChange(index, 'options', lines.filter(opt => opt.trim()));
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  // Prevent form submission on Enter
                                  e.preventDefault();
                                  e.stopPropagation();
                                  // Insert newline at cursor position
                                  const textarea = e.target as HTMLTextAreaElement;
                                  const start = textarea.selectionStart;
                                  const end = textarea.selectionEnd;
                                  const value = textarea.value;
                                  const newValue = `${value.substring(0, start)  }\n${  value.substring(end)}`;
                                  textarea.value = newValue;
                                  textarea.selectionStart = textarea.selectionEnd = start + 1;
                                  // Trigger onChange manually
                                  const event = new Event('input', { bubbles: true });
                                  textarea.dispatchEvent(event);
                                }
                              }}
                              placeholder="Option 1&#10;Option 2&#10;Option 3"
                              rows={4}
                              className="mt-1 resize-none font-mono text-sm"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                              Press Enter to add a new line for each option
                            </p>
                          </div>
                        )}
                        
                        {/* Min/Max fields for rating and scale */}
                        {(field.type === 'rating' || field.type === 'scale') && (
                          <div className="col-span-1 sm:col-span-3 grid grid-cols-2 gap-2">
                            <div>
                              <Label className="text-sm">Minimum</Label>
                              <Input
                                type="number"
                                value={field.min || 1}
                                onChange={(e) => handleFormFieldChange(index, 'min', parseInt(e.target.value))}
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label className="text-sm">Maximum</Label>
                              <Input
                                type="number"
                                value={field.max || (field.type === 'rating' ? 5 : 10)}
                                onChange={(e) => handleFormFieldChange(index, 'max', parseInt(e.target.value))}
                                className="mt-1"
                              />
                            </div>
                          </div>
                        )}
                        
                        {/* Placeholder field for text inputs */}
                        {(field.type === 'text' || field.type === 'email' || field.type === 'textarea') && (
                          <div className="col-span-1 sm:col-span-3">
                            <Label className="text-sm">Placeholder (optional)</Label>
                            <Input
                              value={field.placeholder || ''}
                              onChange={(e) => handleFormFieldChange(index, 'placeholder', e.target.value)}
                              placeholder="Enter placeholder text"
                              className="mt-1"
                            />
                          </div>
                        )}
                        
                        <div className="col-span-1 flex items-center sm:col-span-3">
                          <input
                            type="checkbox"
                            checked={field.required}
                            onChange={(e) => handleFormFieldChange(index, 'required', e.target.checked)}
                            className="mr-2"
                            id={`required-${field.id}`}
                          />
                          <Label htmlFor={`required-${field.id}`} className="text-sm font-normal">
                            Required
                          </Label>
                        </div>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={addFormField}
                    >
                      <Plus className="mr-2 h-4 w-4" /> Add Field
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="formPublishStatus">Publish Status</Label>
                    <select
                      id="formPublishStatus"
                      value={formFormData.publishStatus}
                      onChange={(e) => setFormFormData({...formFormData, publishStatus: e.target.value as 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'})}
                      className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="DRAFT">Draft</option>
                      <option value="PUBLISHED">Published</option>
                      <option value="ARCHIVED">Archived</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="formSubmissionLimit">Submission Limit</Label>
                    <Input
                      id="formSubmissionLimit"
                      type="number"
                      value={formFormData.submissionLimit}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormFormData({...formFormData, submissionLimit: e.target.value})}
                      placeholder="Optional"
                    />
                  </div>
                </div>
                
                {/* QR Code Upload Section */}
                <div>
                  <Label className="text-sm">GCash QR Code Image</Label>
                  <div className="mt-2 p-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                    <div className="text-center">
                      {formFormData.qrCodeImage ? (
                        <div>
                          <img src={formFormData.qrCodeImage} alt="GCash QR Code" className="mx-auto h-32 w-32 object-contain mb-2"/>
                          <p className="text-sm text-gray-600">QR Code uploaded successfully</p>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setFormFormData({...formFormData, qrCodeImage: null})}
                            className="mt-2"
                          >
                            Remove QR Code
                          </Button>
                        </div>
                      ) : (
                        <>
                          <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          <p className="mt-1 text-sm text-gray-600">Upload GCash QR Code image</p>
                          <p className="mt-1 text-xs text-gray-500">PNG, JPG up to 5MB</p>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            try {
                              const formData = new FormData()
                              formData.append('file', file)
                              
                              const response = await fetch('/api/upload/qr-code', {
                                method: 'POST',
                                body: formData
                              })
                              
                              if (response.ok) {
                                const result = await response.json()
                                setFormFormData({...formFormData, qrCodeImage: result.fileUrl})
                              } else {
                                console.error('Upload failed')
                              }
                            } catch (error) {
                              console.error('Upload error:', error)
                            }
                          }
                        }}
                        className="mt-2 w-full"
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="formSubmissionDeadline">Submission Deadline</Label>
                  <Input
                    id="formSubmissionDeadline"
                    type="datetime-local"
                    value={formFormData.submissionDeadline}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormFormData({...formFormData, submissionDeadline: e.target.value})}
                  />
                </div>
                

                
                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowAddFormModal(false)
                      resetFormData()
                    }}
                    disabled={isCreatingForm}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isCreatingForm}>
                    {isCreatingForm ? 'Creating...' : 'Create Form'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </DialogContent>
        </Dialog>

      {/* View Form Modal */}
      {selectedForm && (
        <Dialog open={!!selectedForm} onOpenChange={(open) => {
          if (!open) setSelectedForm(null)
        }}>
          <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedForm.title}</DialogTitle>
              <DialogDescription>
                    {selectedForm.type.toLowerCase()} form for the event: {selectedForm.event.title}
              </DialogDescription>
            </DialogHeader>
            <CardContent className="grid gap-6 md:grid-cols-2">
              {/* Form Preview */}
              <div className="space-y-4">
                <h3 className="font-semibold">Form Preview</h3>
                <div className="space-y-4 rounded-lg border p-4">
                  {Array.isArray(selectedForm.fields) ? (
                    selectedForm.fields.map((field) => (
                      <div key={field.id}>
                        <Label htmlFor={field.name}>
                          {field.label} {field.required && <span className="text-destructive">*</span>}
                        </Label>
                        {field.type === 'textarea' ? (
                          <Textarea 
                            id={field.name} 
                            placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`} 
                            readOnly 
                          />
                        ) : field.type === 'select' ? (
                          <select 
                            id={field.name} 
                            className="w-full px-3 py-2 border border-input rounded-md bg-transparent"
                            disabled
                          >
                            <option value="">Select an option</option>
                            {field.options?.map((option, idx) => (
                              <option key={idx} value={option}>{option}</option>
                            ))}
                          </select>
                        ) : field.type === 'radio' ? (
                          <div className="space-y-2">
                            {field.options?.map((option, idx) => (
                              <div key={idx} className="flex items-center space-x-2">
                                <input type="radio" id={`${field.name}-${idx}`} name={field.name} disabled />
                                <Label htmlFor={`${field.name}-${idx}`} className="text-sm">{option}</Label>
                              </div>
                            ))}
                          </div>
                        ) : field.type === 'checkbox' ? (
                          <div className="space-y-2">
                            {field.options?.map((option, idx) => (
                              <div key={idx} className="flex items-center space-x-2">
                                <input type="checkbox" id={`${field.name}-${idx}`} disabled />
                                <Label htmlFor={`${field.name}-${idx}`} className="text-sm">{option}</Label>
                              </div>
                            ))}
                          </div>
                        ) : field.type === 'rating' ? (
                          <div className="flex items-center space-x-2">
                            {Array.from({ length: field.max || 5 }, (_, i) => (
                              <button
                                key={i}
                                type="button"
                                className="text-2xl text-gray-300 hover:text-yellow-400 disabled:cursor-not-allowed"
                                disabled
                              >
                                ★
                              </button>
                            ))}
                            <span className="text-sm text-gray-500">({field.min || 1}-{field.max || 5})</span>
                          </div>
                        ) : field.type === 'scale' ? (
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-500">{field.min || 1}</span>
                            <div className="flex-1 h-2 bg-gray-200 rounded-full">
                              <div className="w-1/2 h-full bg-blue-500 rounded-full"></div>
                            </div>
                            <span className="text-sm text-gray-500">{field.max || 10}</span>
                          </div>
                        ) : field.type === 'consent' ? (
                          <div className="flex items-center space-x-2">
                            <input type="checkbox" id={field.name} disabled />
                            <Label htmlFor={field.name} className="text-sm">
                              I agree to the terms and conditions
                            </Label>
                          </div>
                        ) : field.type === 'signature' ? (
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                            <p className="text-sm text-gray-500">Signature area</p>
                          </div>
                        ) : field.type === 'paragraph' ? (
                          <div className="p-3 bg-gray-50 rounded border text-sm text-gray-600">
                            <p>This is a paragraph field for displaying information or instructions.</p>
                          </div>
                        ) : field.type === 'fileUpload' ? (
                          <div className="mt-2 p-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                            <div className="text-center">
                              <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                              <p className="mt-1 text-sm text-gray-600">Click to upload or drag and drop</p>
                              <p className="mt-1 text-xs text-gray-500">PDF, DOC, DOCX, TXT, PNG, JPG up to 5MB</p>
                            </div>
                          </div>
                        ) : field.type === 'gcashReceipt' ? (
                          <div className="space-y-4">
                            <div>
                              <Input 
                                placeholder="Enter GCash account name" 
                                readOnly 
                              />
                            </div>
                            <div>
                              <Input 
                                placeholder="Enter transaction reference number" 
                                readOnly 
                              />
                            </div>
                            <div>
                              <Input 
                                type="number" 
                                placeholder="Enter payment amount" 
                                readOnly 
                              />
                            </div>
                            <div>
                              <Label className="text-sm font-medium">GCash QR Code</Label>
                              {(selectedForm?.qrCodeImage || field.qrCodeImage) ? (
                                <div className="mt-2 p-4 border border-gray-300 rounded-lg bg-gray-50">
                                  <div className="text-center">
                                    <img src={(field.qrCodeImage || selectedForm.qrCodeImage) || undefined} alt="GCash QR Code" className="mx-auto h-32 w-32 object-contain"/>
                                    <p className="mt-2 text-sm text-gray-600">Scan this QR code to make payment</p>
                                  </div>
                                </div>
                              ) : (
                                <div className="mt-2 p-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                                  <div className="text-center">
                                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    <p className="mt-1 text-sm text-gray-600">No QR code uploaded</p>
                                    <p className="mt-1 text-xs text-gray-500">Form creator needs to upload QR code</p>
                                  </div>
                                </div>
                              )}
                            </div>
                            <div>
                              <Label className="text-sm font-medium">Payment Receipt Screenshot</Label>
                              <div className="mt-2 p-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                                <div className="text-center">
                                  <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                                  </svg>
                                  <p className="mt-1 text-sm text-gray-600">Upload GCash payment receipt screenshot</p>
                                  <p className="mt-1 text-xs text-gray-500">PNG, JPG up to 5MB</p>
                                </div>
                              </div>
                            </div>
                          </div>

                        ) : (
                          <Input 
                            type={field.type} 
                            id={field.name} 
                            placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`} 
                            readOnly 
                          />
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No fields configured for this form.</p>
                  )}
                  

                  
                  <Button className="w-full">Submit</Button>
                </div>
              </div>

              {/* Form Access Information */}
              {selectedForm.publishStatus === 'PUBLISHED' && (selectedForm.accessLink || selectedForm.accessQRCode) && (
                <div className="space-y-4">
                  <h3 className="font-semibold">Form Access</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Access Link */}
                    {selectedForm.accessLink && (
                      <div>
                        <Label className="text-sm font-medium">Public Access Link</Label>
                        <div className="mt-2 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <input
                              type="text"
                              value={selectedForm.accessLink}
                              readOnly
                              className="flex-1 text-sm bg-transparent border-none p-0 focus:outline-none"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                navigator.clipboard.writeText(selectedForm.accessLink!)
                                toast.success('Link copied to clipboard!', 'Copied')
                              }}
                            >
                              Copy
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* QR Code */}
                    {selectedForm.accessQRCode && (
                      <div>
                        <Label className="text-sm font-medium">QR Code</Label>
                        <div className="mt-2 p-4 bg-gray-50 border border-gray-200 rounded-lg text-center">
                          <img 
                            src={selectedForm.accessQRCode} 
                            alt="Form Access QR Code" 
                            className="mx-auto h-24 w-24 object-contain mb-2"
                          />
                          <p className="text-xs text-muted-foreground mb-2">
                            Scan to access the form
                          </p>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              window.open(selectedForm.accessQRCode!, '_blank')
                            }}
                          >
                            Download
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Submissions List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Submissions ({selectedForm.submissions?.length || 0})</h3>
                  
                  {/* Bulk Actions */}
                  {selectedSubmissions.size > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">
                        {selectedSubmissions.size} selected
                      </span>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleBulkAction('approve')}
                          className="text-green-600 hover:text-green-700"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleBulkAction('reject')}
                          className="text-red-600 hover:text-red-700"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleBulkAction('delete')}
                          className="text-red-600 hover:text-red-700"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={handleClearSelection}
                        >
                          Clear
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Select All Button */}
                                 {selectedForm.submissions && selectedForm.submissions.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleSelectAllSubmissions}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Select All
                    </Button>
                    {selectedSubmissions.size > 0 && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleClearSelection}
                      >
                        Clear Selection
                      </Button>
                    )}
                  </div>
                )}
                
                <div className="space-y-3">
                                     {selectedForm.submissions && selectedForm.submissions.length > 0 ? (
                    selectedForm.submissions.map((submission) => (
                      <div key={submission.id} className="flex items-center justify-between rounded-lg border p-3">
                        {/* Checkbox for bulk selection */}
                                                <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={selectedSubmissions.has(submission.id)}
                            onChange={() => handleSelectSubmission(submission.id)}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <div className="flex-1">
                            <p className="text-sm font-medium">{getUserNameFromSubmission(submission)}</p>
                          <p className="text-xs text-muted-foreground">{formatDateTime(submission.submittedAt)}</p>
                          
                          {/* Show uploaded files if any */}
                          {submission.files && (() => {
                            try {
                              const filesData = JSON.parse(submission.files)
                              if (Array.isArray(filesData) && filesData.length > 0) {
                                return (
                                  <div className="mt-2">
                                    <p className="text-xs font-medium text-blue-600">Uploaded Files:</p>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {filesData.map((file: any, index: number) => (
                                        <a
                                          key={index}
                                          href={file.filePath || file}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-xs text-blue-500 hover:text-blue-700 underline"
                                        >
                                          {file.originalName || file}
                                        </a>
                                      ))}
                                    </div>
                                  </div>
                                )
                              }
                            } catch (error) {
                              console.error('Error parsing files data:', error)
                            }
                            return null
                          })()}
                          
                          {/* Show GCash receipt if any */}
                          {submission.gcashReceipt && (
                            <div className="mt-2">
                              <p className="text-xs font-medium text-green-600">GCash Payment Details:</p>
                              <div className="mt-1 space-y-1">
                                <div className="flex justify-between text-xs">
                                  <span className="text-gray-600">Account:</span>
                                  <span className="font-medium">
                                    {(() => {
                                      try {
                                        return submission.data ? JSON.parse(submission.data).gcashAccountName || 'N/A' : 'N/A'
                                      } catch (error) {
                                        return 'N/A'
                                      }
                                    })()}
                                  </span>
                                </div>
                                <div className="flex justify-between text-xs">
                                  <span className="text-gray-600">Reference:</span>
                                  <span className="font-medium">
                                    {(() => {
                                      try {
                                        return submission.data ? JSON.parse(submission.data).gcashReferenceNumber || 'N/A' : 'N/A'
                                      } catch (error) {
                                        return 'N/A'
                                      }
                                    })()}
                                  </span>
                                </div>
                                <div className="flex justify-between text-xs">
                                  <span className="text-gray-600">Amount:</span>
                                  <span className="font-medium">₱
                                    {(() => {
                                      try {
                                        return submission.data ? JSON.parse(submission.data).gcashAmount || 'N/A' : 'N/A'
                                      } catch (error) {
                                        return 'N/A'
                                      }
                                    })()}
                                  </span>
                                </div>
                                <div className="mt-1">
                                  <a
                                    href={submission.gcashReceipt}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-green-500 hover:text-green-700 underline"
                                  >
                                    📄 View Receipt
                                  </a>
                                </div>
                              </div>
                            </div>
                          )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusBadge(submission.status)}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No submissions yet.</p>
                  )}
                </div>
              </div>
            </CardContent>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Form Modal */}
      {showEditFormModal && editingForm && (
        <Dialog open={showEditFormModal} onOpenChange={(open) => {
          if (!open) {
                    setShowEditFormModal(false)
                    setEditingForm(null)
          }
        }}>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Form</DialogTitle>
              <DialogDescription>Update form details and fields</DialogDescription>
            </DialogHeader>
            <CardContent>
              <form onSubmit={handleUpdateForm} className="space-y-4">
                <div>
                  <Label htmlFor="editFormTitle">Form Title *</Label>
                  <Input
                    id="editFormTitle"
                    value={formFormData.title}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormFormData({...formFormData, title: e.target.value})}
                    placeholder="Enter form title"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="editFormType">Form Type *</Label>
                    <select
                      id="editFormType"
                      value={formFormData.type}
                      onChange={(e) => setFormFormData({...formFormData, type: e.target.value as 'REGISTRATION' | 'SURVEY' | 'WAIVER' | 'FEEDBACK' | 'CUSTOM'})}
                      className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                      required
                    >
                      <option value="REGISTRATION">Registration</option>
                      <option value="SURVEY">Survey</option>
                      <option value="WAIVER">Waiver</option>
                      <option value="FEEDBACK">Feedback</option>
                      <option value="CUSTOM">Custom</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="editFormEventId">Event *</Label>
                    <select
                      id="editFormEventId"
                      value={formFormData.eventId}
                      onChange={(e) => setFormFormData({...formFormData, eventId: e.target.value})}
                      className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                      required
                    >
                      <option value="">Select an event</option>
                      {events.map((event) => (
                        <option key={event.id} value={event.id}>
                          {event.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div>
                  <Label>Form Fields *</Label>
                  <div className="space-y-4 rounded-md border p-4">
                    {Array.isArray(formFormData.fields) && formFormData.fields.map((field, index) => (
                      <div key={field.id} className="grid grid-cols-1 gap-4 rounded-lg border p-3 sm:grid-cols-3">
                        <Input
                          value={field.label}
                          onChange={(e) => handleFormFieldChange(index, 'label', e.target.value)}
                          placeholder="Field Label"
                          required
                        />
                        <Input
                          value={field.name}
                          onChange={(e) => handleFormFieldChange(index, 'name', e.target.value)}
                          placeholder="Field Name (e.g., fullName)"
                          required
                        />
                        <div className="flex items-center gap-2">
                          <select
                            value={field.type}
                            onChange={(e) => handleFormFieldChange(index, 'type', e.target.value)}
                            className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                          >
                            {/* Basic field types for all forms */}
                            <option value="text">Text</option>
                            <option value="email">Email</option>
                            <option value="number">Number</option>
                            <option value="tel">Phone</option>
                            <option value="date">Date</option>
                            <option value="textarea">Textarea</option>
                            <option value="fileUpload">File Upload</option>
                            <option value="gcashReceipt">GCash Receipt</option>
                            <option value="qrCode">QR Code</option>

                            {/* Survey and Registration additional field types */}
                            {(formFormData.type === 'SURVEY' || formFormData.type === 'REGISTRATION') && (
                              <>
                                <option value="select">Dropdown</option>
                                <option value="radio">Radio Buttons</option>
                                <option value="checkbox">Checkboxes</option>
                                <option value="rating">Rating (1-5)</option>
                                <option value="scale">Scale (1-10)</option>
                                <option value="paragraph">Paragraph</option>
                              </>
                            )}

                            {/* Waiver-specific field types */}
                            {formFormData.type === 'WAIVER' && (
                              <>
                                <option value="consent">Consent Checkbox</option>
                                <option value="signature">Signature</option>
                                <option value="paragraph">Legal Text</option>
                                <option value="select">Dropdown</option>
                              </>
                            )}

                            {/* Feedback-specific field types */}
                            {formFormData.type === 'FEEDBACK' && (
                              <>
                                <option value="rating">Rating (1-5)</option>
                                <option value="scale">Scale (1-10)</option>
                                <option value="select">Dropdown</option>
                                <option value="radio">Radio Buttons</option>
                                <option value="checkbox">Checkboxes</option>
                                <option value="paragraph">Paragraph</option>
                              </>
                            )}
                          </select>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFormField(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        {/* Options field for select, radio, checkbox */}
                        {(field.type === 'select' || field.type === 'radio' || field.type === 'checkbox') && (
                          <div className="col-span-1 sm:col-span-3">
                            <Label className="text-sm">Options (one per line)</Label>
                            <Textarea
                              value={field.options?.join('\n') || ''}
                              onChange={(e) => {
                                const lines = e.target.value.split('\n');
                                handleFormFieldChange(index, 'options', lines.filter(opt => opt.trim()));
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  const textarea = e.target as HTMLTextAreaElement;
                                  const start = textarea.selectionStart;
                                  const end = textarea.selectionEnd;
                                  const value = textarea.value;
                                  const newValue = `${value.substring(0, start)  }\n${  value.substring(end)}`;
                                  textarea.value = newValue;
                                  textarea.selectionStart = textarea.selectionEnd = start + 1;
                                  const event = new Event('input', { bubbles: true });
                                  textarea.dispatchEvent(event);
                                }
                              }}
                              placeholder="Option 1&#10;Option 2&#10;Option 3"
                              rows={4}
                              className="mt-1 resize-none font-mono text-sm"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                              Press Enter to add a new line for each option
                            </p>
                          </div>
                        )}

                        {/* Min/Max fields for rating and scale */}
                        {(field.type === 'rating' || field.type === 'scale') && (
                          <div className="col-span-1 sm:col-span-3 grid grid-cols-2 gap-2">
                            <div>
                              <Label className="text-sm">Minimum</Label>
                              <Input
                                type="number"
                                value={field.min || 1}
                                onChange={(e) => handleFormFieldChange(index, 'min', parseInt(e.target.value))}
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label className="text-sm">Maximum</Label>
                              <Input
                                type="number"
                                value={field.max || (field.type === 'rating' ? 5 : 10)}
                                onChange={(e) => handleFormFieldChange(index, 'max', parseInt(e.target.value))}
                                className="mt-1"
                              />
                            </div>
                          </div>
                        )}

                        {/* Placeholder field for text inputs */}
                        {(field.type === 'text' || field.type === 'email' || field.type === 'textarea') && (
                          <div className="col-span-1 sm:col-span-3">
                            <Label className="text-sm">Placeholder (optional)</Label>
                            <Input
                              value={field.placeholder || ''}
                              onChange={(e) => handleFormFieldChange(index, 'placeholder', e.target.value)}
                              placeholder="Enter placeholder text"
                              className="mt-1"
                            />
                          </div>
                        )}
                        <div className="col-span-1 flex items-center sm:col-span-3">
                          <input
                            type="checkbox"
                            checked={field.required}
                            onChange={(e) => handleFormFieldChange(index, 'required', e.target.checked)}
                            className="mr-2"
                            id={`edit-required-${field.id}`}
                          />
                          <Label htmlFor={`edit-required-${field.id}`} className="text-sm font-normal">
                            Required
                          </Label>
                        </div>
                        
                        {/* QR Code Image Upload for GCash Receipt fields */}
                        {field.type === 'gcashReceipt' && (
                          <div className="col-span-1 sm:col-span-3">
                            <Label className="text-sm">GCash QR Code Image</Label>
                            <div className="mt-2 p-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                              <div className="text-center">
                                {field.qrCodeImage ? (
                                  <div>
                                    <img src={field.qrCodeImage} alt="GCash QR Code" className="mx-auto h-32 w-32 object-contain mb-2"/>
                                    <p className="text-sm text-gray-600">QR Code uploaded successfully</p>
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleFormFieldChange(index, 'qrCodeImage', null)}
                                      className="mt-2"
                                    >
                                      Remove QR Code
                                    </Button>
                                  </div>
                                ) : (
                                  <>
                                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    <p className="mt-1 text-sm text-gray-600">Upload GCash QR Code image</p>
                                    <p className="mt-1 text-xs text-gray-500">PNG, JPG up to 5MB</p>
                                  </>
                                )}
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={async (e) => {
                                    const file = e.target.files?.[0]
                                    if (file) {
                                      try {
                                        const formData = new FormData()
                                        formData.append('file', file)
                                        
                                        const response = await fetch('/api/upload/qr-code', {
                                          method: 'POST',
                                          body: formData
                                        })
                                        
                                        if (response.ok) {
                                          const result = await response.json()
                                          handleFormFieldChange(index, 'qrCodeImage', result.fileUrl)
                                        } else {
                                          console.error('Upload failed')
                                        }
                                      } catch (error) {
                                        console.error('Upload error:', error)
                                      }
                                    }
                                  }}
                                  className="mt-2 w-full"
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={addFormField}
                    >
                      <Plus className="mr-2 h-4 w-4" /> Add Field
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="editFormSubmissionLimit">Submission Limit</Label>
                    <Input
                      id="editFormSubmissionLimit"
                      type="number"
                      value={formFormData.submissionLimit}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormFormData({...formFormData, submissionLimit: e.target.value})}
                      placeholder="Optional"
                    />
                  </div>
                  <div>
                    <Label htmlFor="editFormSubmissionDeadline">Submission Deadline</Label>
                    <Input
                      id="editFormSubmissionDeadline"
                      type="datetime-local"
                      value={formFormData.submissionDeadline}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormFormData({...formFormData, submissionDeadline: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="editFormPublishStatus">Publish Status</Label>
                    <select
                      id="editFormPublishStatus"
                      value={formFormData.publishStatus}
                      onChange={(e) => setFormFormData({...formFormData, publishStatus: e.target.value as 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'})}
                      className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="DRAFT">Draft</option>
                      <option value="PUBLISHED">Published</option>
                      <option value="ARCHIVED">Archived</option>
                    </select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="editFormIsActive"
                      checked={formFormData.isActive}
                      onChange={(e) => setFormFormData({...formFormData, isActive: e.target.checked})}
                      className="rounded"
                    />
                    <Label htmlFor="editFormIsActive">Active</Label>
                  </div>
                </div>

                {/* Form Access QR Code and Link Section */}
                {formFormData.publishStatus === 'PUBLISHED' && (formFormData.accessLink || formFormData.accessQRCode) && (
                  <div className="border-t pt-4">
                    <Label className="text-lg font-semibold mb-4 block">Form Access</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Access Link */}
                      <div>
                        <Label className="text-sm font-medium">Public Access Link</Label>
                        <div className="mt-2 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <input
                              type="text"
                              value={formFormData.accessLink || ''}
                              readOnly
                              className="flex-1 text-sm bg-transparent border-none p-0 focus:outline-none"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                if (formFormData.accessLink) {
                                  navigator.clipboard.writeText(formFormData.accessLink)
                                  toast.success('Link copied to clipboard!', 'Copied')
                                }
                              }}
                            >
                              Copy
                            </Button>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Share this link for users to access the form directly
                        </p>
                      </div>

                      {/* QR Code */}
                      <div>
                        <Label className="text-sm font-medium">QR Code</Label>
                        <div className="mt-2 p-4 bg-gray-50 border border-gray-200 rounded-lg text-center">
                          {formFormData.accessQRCode ? (
                            <div>
                              <img 
                                src={formFormData.accessQRCode} 
                                alt="Form Access QR Code" 
                                className="mx-auto h-32 w-32 object-contain mb-2"
                              />
                              <p className="text-xs text-muted-foreground">
                                Scan to access the form
                              </p>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="mt-2"
                                onClick={() => {
                                  if (formFormData.accessQRCode) {
                                    window.open(formFormData.accessQRCode, '_blank')
                                  }
                                }}
                              >
                                Download QR Code
                              </Button>
                            </div>
                          ) : (
                            <div className="py-8">
                              <p className="text-sm text-muted-foreground">
                                QR code will be generated when form is published
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowEditFormModal(false)
                      setEditingForm(null)
                    }}
                    disabled={isEditingForm}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isEditingForm}>
                    {isEditingForm ? 'Updating...' : 'Update Form'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <Dialog open={!!showDeleteConfirm} onOpenChange={(open) => {
          if (!open) setShowDeleteConfirm(null)
        }}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-red-600">Delete Form</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this form? This action cannot be undone and will also delete all associated submissions.
              </DialogDescription>
            </DialogHeader>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(null)}
                  disabled={isDeletingForm}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleDeleteForm(showDeleteConfirm)}
                  disabled={isDeletingForm}
                >
                  {isDeletingForm ? 'Deleting...' : 'Delete'}
                </Button>
              </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <Card className="p-3 sm:p-4">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-0">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Programs</CardTitle>
            <Activity className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-0 pt-2">
            <div className="text-lg sm:text-2xl font-bold">{stats.totalPrograms}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.ongoingPrograms} ongoing
            </p>
          </CardContent>
        </Card>

        <Card className="p-3 sm:p-4">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-0">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Events</CardTitle>
            <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-0 pt-2">
            <div className="text-lg sm:text-2xl font-bold">{stats.totalEvents}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.activeEvents} active
            </p>
          </CardContent>
        </Card>

        <Card className="p-3 sm:p-4">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-0">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Forms</CardTitle>
            <FileText className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-0 pt-2">
            <div className="text-lg sm:text-2xl font-bold">{stats.totalForms}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Active forms
            </p>
          </CardContent>
        </Card>

        <Card className="p-3 sm:p-4">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-0">
            <CardTitle className="text-xs sm:text-sm font-medium">Submissions</CardTitle>
            <FileCheck className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-0 pt-2">
            <div className="text-lg sm:text-2xl font-bold">{stats.totalSubmissions}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.pendingSubmissions} pending
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="flex w-full overflow-x-auto scrollbar-hide bg-background border-b">
          <TabsTrigger value="overview" className="flex-shrink-0 text-xs sm:text-sm md:text-base whitespace-nowrap min-w-[90px] sm:min-w-[110px] md:min-w-[130px] px-2 sm:px-3 md:px-4 lg:px-6">Overview</TabsTrigger>
          <TabsTrigger value="programs" className="flex-shrink-0 text-xs sm:text-sm md:text-base whitespace-nowrap min-w-[90px] sm:min-w-[110px] md:min-w-[130px] px-2 sm:px-3 md:px-4 lg:px-6">Programs</TabsTrigger>
          <TabsTrigger value="events" className="flex-shrink-0 text-xs sm:text-sm md:text-base whitespace-nowrap min-w-[90px] sm:min-w-[110px] md:min-w-[130px] px-2 sm:px-3 md:px-4 lg:px-6">Events</TabsTrigger>
          <TabsTrigger value="forms" className="flex-shrink-0 text-xs sm:text-sm md:text-base whitespace-nowrap min-w-[90px] sm:min-w-[110px] md:min-w-[130px] px-2 sm:px-3 md:px-4 lg:px-6">Forms</TabsTrigger>
          <TabsTrigger value="submissions" className="flex-shrink-0 text-xs sm:text-sm md:text-base whitespace-nowrap min-w-[90px] sm:min-w-[110px] md:min-w-[130px] px-2 sm:px-3 md:px-4 lg:px-6">Submissions</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Programs */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="w-4 h-4 mr-2" />
                  Recent Programs
                </CardTitle>
                <CardDescription>Latest SK programs and their status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {programs.slice(0, 5).map((program) => (
                    <div key={program.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">{program.title}</h4>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(program.startDate)} - {formatDate(program.endDate)}
                          {program.budget && (
                            <span className="ml-2 text-green-600 font-medium">
                              • ₱{program.budget.toLocaleString()}
                            </span>
                          )}
                        </p>
                      </div>
                      {getStatusBadge(program.status)}
                    </div>
                  ))}
                  {programs.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No programs found
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Events */}
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <CardTitle className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      Upcoming Events
                    </CardTitle>
                    <CardDescription>Events scheduled in the next 30 days</CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.location.href = '/dashboard/calendar'}
                    className="w-full sm:w-auto"
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">View Calendar</span>
                    <span className="sm:hidden">Calendar</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {events
                    .filter(event => new Date(event.dateTime) > new Date())
                    .slice(0, 5)
                    .map((event) => (
                    <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">{event.title}</h4>
                        <p className="text-xs text-muted-foreground">
                          {formatDateTime(event.dateTime)} • {event.venue}
                        </p>
                      </div>
                      {getStatusBadge(event.status)}
                    </div>
                  ))}
                  {events.filter(event => new Date(event.dateTime) > new Date()).length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No upcoming events
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Submissions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileCheck className="w-4 h-4 mr-2" />
                Recent Submissions
              </CardTitle>
              <CardDescription>Latest form submissions and their status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {submissions.slice(0, 10).map((submission) => (
                  <div key={submission.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border rounded-lg space-y-2 sm:space-y-0">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-medium text-primary">
                          {getUserNameFromSubmission(submission).charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">{submission.form?.title || 'Form Title Unavailable'}</h4>
                        <p className="text-xs text-muted-foreground">
                          {getUserNameFromSubmission(submission)} • {formatDateTime(submission.submittedAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-end sm:justify-start flex-shrink-0">
                    {getStatusBadge(submission.status)}
                    </div>
                  </div>
                ))}
                {submissions.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No submissions found
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Programs Tab */}
        <TabsContent value="programs" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">SK Programs</h2>
            <Button onClick={() => setShowAddProgramModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Program
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {programs.map((program) => (
              <Card key={program.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base truncate">{program.title}</CardTitle>
                      <CardDescription className="text-xs mt-1">
                        {formatDate(program.startDate)} - {formatDate(program.endDate)}
                      </CardDescription>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {program.category && (
                        <Badge variant="secondary" className="text-xs">
                          {program.category}
                        </Badge>
                      )}
                      {getStatusBadge(program.status)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground mb-3">
                    <span className="font-medium">Schedule:</span>
                    {/* Enhanced Schedule Display */}
                    {(program as any).start_time && (program as any).end_time ? (
                      <div className="mt-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs">
                            {formatScheduleDisplay({
                              scheduleType: (program as any).schedule_type || 'RECURRING',
                              startDate: program.startDate,
                              endDate: program.endDate,
                              startTime: (program as any).start_time || '09:00',
                              endTime: (program as any).end_time || '17:00',
                              frequency: (program as any).frequency || 'WEEKLY',
                              frequencyInterval: (program as any).frequency_interval || 1,
                              daysOfWeek: (program as any).days_of_week ? JSON.parse((program as any).days_of_week) : ['MONDAY'],
                              timezone: (program as any).timezone || 'Asia/Manila',
                              exceptions: (program as any).schedule_exceptions ? JSON.parse((program as any).schedule_exceptions) : [],
                              customDescription: program.schedule
                            })}
                          </span>
                        </div>
                        {/* Show original schedule text if different from structured data */}
                        {program.schedule && program.schedule.trim() && (
                          <p className="text-xs text-muted-foreground/80 line-clamp-2">
                            {program.schedule}
                          </p>
                        )}
                      </div>
                    ) : (
                      <span className="ml-1">{program.schedule}</span>
                    )}
                  </div>
                  {program.venue && (
                    <p className="text-sm text-muted-foreground line-clamp-1 mb-3">
                      <span className="font-medium">Venue:</span> {program.venue}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                    <span>{program.events?.length || 0} events</span>
                    <div className="flex items-center gap-2">
                      {program.budget && (
                        <span className="text-green-600 font-medium">
                          ₱{program.budget.toLocaleString()}
                        </span>
                      )}
                      <span>{program.assignedMembers?.length || 0} members</span>
                    </div>
                  </div>
                  <div className="flex gap-2 justify-center">
                    <Button
                      variant="outline"
                      size="sm"
                      className="p-2 sm:p-2 sm:px-3"
                      onClick={() => handleViewProgram(program.id)}
                      title="View Program"
                    >
                      <Eye className="w-4 h-4" />
                      <span className="hidden sm:inline ml-2">View</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="p-2 sm:p-2 sm:px-3"
                      onClick={() => handleEditProgram(program)}
                      title="Edit Program"
                    >
                      <Edit className="w-4 h-4" />
                      <span className="hidden sm:inline ml-2">Edit</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="p-2 sm:p-2 sm:px-3 text-red-600 hover:text-red-700"
                      onClick={() => setShowDeleteProgramConfirm(program.id)}
                      title="Delete Program"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="hidden sm:inline ml-2">Delete</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Events Tab */}
        <TabsContent value="events" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">SK Events</h2>
            <Button onClick={() => {
              resetEventFormData()
              setShowAddEventModal(true)
            }}>
              <Plus className="w-4 h-4 mr-2" />
              Add Event
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {events.map((event) => (
              <Card key={event.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base truncate">{event.title}</CardTitle>
                      <CardDescription className="text-xs mt-1">
                        {formatDateTime(event.dateTime)}
                      </CardDescription>
                    </div>
                    {getStatusBadge(event.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {event.description}
                  </p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                    <span className="flex items-center">
                      <MapPin className="w-3 h-3 mr-1" />
                      {event.venue}
                    </span>
                    {event.maxParticipants && (
                      <span className="flex items-center">
                        <Users className="w-3 h-3 mr-1" />
                        {event.forms?.reduce((acc, form) => acc + (form.submissions?.length || 0), 0) || 0}/{event.maxParticipants}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2 justify-center">
                    <Button
                      variant="outline"
                      size="sm"
                      className="p-2 sm:p-2 sm:px-3"
                      onClick={() => handleViewEvent(event.id)}
                      title="View Event"
                    >
                      <Eye className="w-4 h-4" />
                      <span className="hidden sm:inline ml-2">View</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="p-2 sm:p-2 sm:px-3"
                      onClick={() => handleEditEvent(event)}
                      title="Edit Event"
                    >
                      <Edit className="w-4 h-4" />
                      <span className="hidden sm:inline ml-2">Edit</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="p-2 sm:p-2 sm:px-3 text-red-600 hover:text-red-700"
                      onClick={() => setShowDeleteEventConfirm(event.id)}
                      title="Delete Event"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="hidden sm:inline ml-2">Delete</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Forms Tab */}
        <TabsContent value="forms" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">SK Forms</h2>
            <Button onClick={() => setShowAddFormModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Form
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {forms.map((form) => (
              <Card key={form.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base truncate">{form.title}</CardTitle>
                      <CardDescription className="text-xs mt-1 capitalize">
                        {form.type.toLowerCase()} form
                      </CardDescription>
                    </div>
                    <div className="flex flex-col gap-1">
                      {getStatusBadge(form.publishStatus)}
                      {getStatusBadge(form.isActive ? 'ACTIVE' : 'INACTIVE')}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground mb-3">
                    Event: {form.event.title}
                  </p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{form.submissions?.length || 0} submissions</span>
                    {form.submissionLimit && (
                      <span>{form.submissions?.length || 0}/{form.submissionLimit}</span>
                    )}
                  </div>
                  <div className="flex gap-2 justify-center mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="p-2 sm:p-2 sm:px-3"
                      onClick={() => handleViewForm(form.id)}
                      title="View Form"
                    >
                      <Eye className="w-4 h-4" />
                      <span className="hidden sm:inline ml-2">View Form</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="p-2 sm:p-2 sm:px-3"
                      onClick={() => handleEditForm(form)}
                      title="Edit Form"
                    >
                      <Edit className="w-4 h-4" />
                      <span className="hidden sm:inline ml-2">Edit</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="p-2 sm:p-2 sm:px-3 text-red-600 hover:text-red-700"
                      onClick={() => setShowDeleteConfirm(form.id)}
                      title="Delete Form"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="hidden sm:inline ml-2">Delete</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Submissions Tab */}
        <TabsContent value="submissions" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Form Submissions</h2>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setShowEmailTestModal(true)}
                title="Test Email Service"
              >
                <Mail className="w-4 h-4 mr-2" />
                Test Email
              </Button>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export All
              </Button>
            </div>
          </div>
          
          {/* Bulk Actions Header */}
          {selectedSubmissions.size > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-blue-800">
                      {selectedSubmissions.size} submission{selectedSubmissions.size !== 1 ? 's' : ''} selected
                    </p>
                    <p className="text-xs text-blue-600">
                      Choose an action to perform on selected submissions
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleBulkAction('approve')}
                    className="text-green-600 hover:text-green-700 border-green-300"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Approve All
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleBulkAction('reject')}
                    className="text-red-600 hover:text-red-700 border-red-300"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Reject All
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleBulkAction('delete')}
                    className="text-red-600 hover:text-red-700 border-red-300"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete All
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleClearSelection}
                    className="text-gray-600 hover:text-gray-800"
                  >
                    Clear
                  </Button>
                </div>
              </div>
            </div>
          )}
          
          {/* Select All Button */}
          {submissions.length > 0 && (
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleSelectAllSubmissions}
                className="text-blue-600 hover:text-blue-700"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Select All
              </Button>
              {selectedSubmissions.size > 0 && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleClearSelection}
                >
                  Clear Selection
                </Button>
              )}
            </div>
          )}
          
          <div className="space-y-4">
            {submissions.map((submission) => (
              <Card key={submission.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      {/* Checkbox for bulk selection */}
                      <input
                        type="checkbox"
                        checked={selectedSubmissions.has(submission.id)}
                        onChange={() => handleSelectSubmission(submission.id)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-medium text-primary">
                          {getUserNameFromSubmission(submission).charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-semibold text-sm truncate">{submission.form?.title || 'Form Title Unavailable'}</h3>
                          {getStatusBadge(submission.status)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {getUserNameFromSubmission(submission)} • {formatDateTime(submission.submittedAt)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Event: {submission.form?.event?.title || 'Event Unavailable'}
                        </p>
                        
                        {/* Show uploaded files if any */}
                        {submission.files && (() => {
                          try {
                            const filesData = JSON.parse(submission.files)
                            if (Array.isArray(filesData) && filesData.length > 0) {
                              return (
                                <div className="mt-2">
                                  <p className="text-xs font-medium text-blue-600">Files:</p>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {filesData.slice(0, 2).map((file: any, index: number) => (
                                      <a
                                        key={index}
                                        href={file.filePath || file}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-blue-500 hover:text-blue-700 underline"
                                      >
                                        {file.originalName || file}
                                      </a>
                                    ))}
                                    {filesData.length > 2 && (
                                      <span className="text-xs text-gray-500">
                                        +{filesData.length - 2} more
                                      </span>
                                    )}
                                  </div>
                                </div>
                              )
                            }
                          } catch (error) {
                            console.error('Error parsing files data:', error)
                          }
                          return null
                        })()}
                        
                        {/* Show GCash receipt if any */}
                        {submission.gcashReceipt && (
                          <div className="mt-1">
                            <div className="flex items-center gap-2 text-xs">
                              <span className="text-green-600">💳 GCash:</span>
                              <span className="text-gray-600">
                                {(() => {
                                  try {
                                    return submission.data ? JSON.parse(submission.data).gcashAccountName || 'N/A' : 'N/A'
                                  } catch (error) {
                                    return 'N/A'
                                  }
                                })()}
                              </span>
                              <span className="text-gray-500">•</span>
                              <span className="text-gray-600">
                                ₱{(() => {
                                  try {
                                    return submission.data ? JSON.parse(submission.data).gcashAmount || 'N/A' : 'N/A'
                                  } catch (error) {
                                    return 'N/A'
                                  }
                                })()}
                              </span>
                            </div>
                            <a
                              href={submission.gcashReceipt}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-green-500 hover:text-green-700 underline"
                            >
                              📄 View Receipt
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Button variant="ghost" size="sm" onClick={() => handleViewSubmission(submission)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      {submission.status === 'PENDING' && (
                        <>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-green-600 hover:text-green-700 hover:bg-green-50" 
                            onClick={() => handleApproveSubmission(submission.id)}
                            title="Approve Submission"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-red-600 hover:text-red-700 hover:bg-red-50" 
                            onClick={() => handleRejectSubmission(submission)}
                            title="Reject Submission"
                          >
                            <AlertTriangle className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-gray-600 hover:text-red-600 hover:bg-red-50" 
                        onClick={() => handleDeleteSubmission(submission)}
                        title="Delete Submission"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Event View Modal */}
      {isViewingEvent && selectedEvent && (
        <Dialog open={isViewingEvent} onOpenChange={(open) => {
          if (!open) {
                    setIsViewingEvent(false)
                    setSelectedEvent(null)
          }
        }}>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Event Details</DialogTitle>
              <DialogDescription>View event information and related data</DialogDescription>
            </DialogHeader>
            <CardContent className="space-y-6">
              {/* Event Basic Info */}
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">{selectedEvent.title}</h3>
                  <div className="flex items-center space-x-2 mt-1">
                    {getStatusBadge(selectedEvent.status)}
                    <span className="text-sm text-muted-foreground">
                      Program: {selectedEvent.program.title}
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Date & Time</Label>
                    <p className="text-sm text-muted-foreground">
                      {formatDateTime(selectedEvent.dateTime)}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Venue</Label>
                    <p className="text-sm text-muted-foreground">{selectedEvent.venue}</p>
                  </div>
                  {selectedEvent.maxParticipants && (
                    <div>
                      <Label className="text-sm font-medium">Max Participants</Label>
                      <p className="text-sm text-muted-foreground">
                        {selectedEvent.forms?.reduce((acc, form) => acc + (form.submissions?.length || 0), 0) || 0}/{selectedEvent.maxParticipants}
                      </p>
                    </div>
                  )}
                  <div>
                    <Label className="text-sm font-medium">Created</Label>
                    <p className="text-sm text-muted-foreground">
                      {formatDateTime(selectedEvent.createdAt)}
                    </p>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Description</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedEvent.description}
                  </p>
                </div>
              </div>

              {/* Assigned Members */}
              {selectedEvent.assignedMembers && selectedEvent.assignedMembers.length > 0 && (
                <div>
                  <Label className="text-sm font-medium">Assigned Members</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedEvent.assignedMembers?.map((member) => (
                      <div key={member.id} className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-xs font-medium text-primary">
                            {member.name?.charAt(0).toUpperCase() || 'U'}
                          </span>
                        </div>
                        <span className="text-xs">{member.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Forms */}
              {selectedEvent.forms && selectedEvent.forms.length > 0 && (
                <div>
                  <Label className="text-sm font-medium">Forms ({selectedEvent.forms.length})</Label>
                  <div className="space-y-2 mt-2">
                    {selectedEvent.forms.map((form) => (
                      <div key={form.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <h4 className="font-medium text-sm">{form.title}</h4>
                          <p className="text-xs text-muted-foreground capitalize">
                            {form.type.toLowerCase()} • {form.submissions?.length || 0} submissions
                          </p>
                        </div>
                        {getStatusBadge(form.isActive ? 'ACTIVE' : 'INACTIVE')}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Submissions */}
              {selectedEvent.forms && selectedEvent.forms.some(form => (form.submissions?.length || 0) > 0) && (
                <div>
                  <Label className="text-sm font-medium">Recent Submissions</Label>
                  <div className="space-y-2 mt-2">
                    {selectedEvent.forms
                      ?.flatMap(form => (form.submissions || []).map(submission => ({ ...submission, formTitle: form.title })))
                      ?.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
                      ?.slice(0, 5)
                      ?.map((submission) => (
                        <div key={submission.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-2 border rounded space-y-2 sm:space-y-0">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{getUserNameFromSubmission(submission)}</p>
                            <p className="text-xs text-muted-foreground truncate">
                              {submission.formTitle} • {formatDateTime(submission.submittedAt)}
                            </p>
                          </div>
                          <div className="flex justify-end sm:justify-start flex-shrink-0">
                          {getStatusBadge(submission.status)}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </CardContent>
          </DialogContent>
        </Dialog>
      )}

      {/* Event Edit Modal */}
      {showEditEventModal && editingEvent && (
        <Dialog open={showEditEventModal} onOpenChange={(open) => {
          if (!open) {
                    setShowEditEventModal(false)
                    setEditingEvent(null)
          }
        }}>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Event</DialogTitle>
              <DialogDescription>Update event information</DialogDescription>
            </DialogHeader>
            <CardContent>
              <form onSubmit={handleUpdateEvent} className="space-y-4">
                <div>
                  <Label htmlFor="editEventTitle">Event Title *</Label>
                  <Input
                    id="editEventTitle"
                    value={eventFormData.title}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEventFormData({...eventFormData, title: e.target.value})}
                    placeholder="Enter event title"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="editEventDescription">Description *</Label>
                  <Textarea
                    id="editEventDescription"
                    value={eventFormData.description}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEventFormData({...eventFormData, description: e.target.value})}
                    placeholder="Describe the event"
                    rows={3}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="editEventDateTime">Date & Time *</Label>
                    <Input
                      id="editEventDateTime"
                      type="datetime-local"
                      value={eventFormData.dateTime}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEventFormData({...eventFormData, dateTime: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="editEventEndDateTime">End Date & Time (Optional)</Label>
                    <Input
                      id="editEventEndDateTime"
                      type="datetime-local"
                      value={eventFormData.endDateTime}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEventFormData({...eventFormData, endDateTime: e.target.value})}
                      min={eventFormData.dateTime}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="editEventVenue">Venue *</Label>
                    <div className="relative">
                      <select
                        id="editEventVenue"
                        value={eventFormData.venue}
                        onChange={(e) => setEventFormData({...eventFormData, venue: e.target.value})}
                        className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                        required
                        disabled={isLoadingLocations}
                      >
                        <option value="">Select a venue from map locations</option>
                        {locations.map((location) => (
                          <option key={location.id} value={location.name}>
                            {location.name} - {location.type.toLowerCase()}
                          </option>
                        ))}
                      </select>
                      {isLoadingLocations && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        </div>
                      )}
                    </div>
                    {locations.length === 0 && !isLoadingLocations && (
                      <div className="text-xs text-gray-500 mt-1">
                        <p>No locations found. Add locations on the map first.</p>
                        <button
                          type="button"
                          onClick={fetchLocations}
                          className="text-blue-600 hover:text-blue-800 underline mt-1"
                        >
                          Refresh locations
                        </button>
                      </div>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="editEventMaxParticipants">Max Participants</Label>
                    <Input
                      id="editEventMaxParticipants"
                      type="number"
                      value={eventFormData.maxParticipants}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEventFormData({...eventFormData, maxParticipants: e.target.value})}
                      placeholder="Leave empty for unlimited"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="editEventStatus">Status</Label>
                    <select
                      id="editEventStatus"
                      value={eventFormData.status}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setEventFormData({...eventFormData, status: e.target.value as any})}
                      className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                    >
                      <option value="PLANNED">Planned</option>
                      <option value="ACTIVE">Active</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="editEventProgram">Program *</Label>
                    <select
                      id="editEventProgram"
                      value={eventFormData.programId}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setEventFormData({...eventFormData, programId: e.target.value})}
                      className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                      required
                    >
                      <option value="">Select a program</option>
                      {programs.map((program) => (
                        <option key={program.id} value={program.id}>
                          {program.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                

                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="editEventPoster">Poster URL</Label>
                    <Input
                      id="editEventPoster"
                      value={eventFormData.poster}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEventFormData({...eventFormData, poster: e.target.value})}
                      placeholder="Enter poster URL"
                    />
                  </div>
                  <div>
                    <Label htmlFor="editEventAttachments">Attachments</Label>
                    <Input
                      id="editEventAttachments"
                      value={eventFormData.attachments}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEventFormData({...eventFormData, attachments: e.target.value})}
                      placeholder="Enter attachment URLs (comma separated)"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowEditEventModal(false)
                      setEditingEvent(null)
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isEditingEvent}>
                    {isEditingEvent ? 'Updating...' : 'Update Event'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </DialogContent>
        </Dialog>
      )}

      {/* Event Delete Confirmation Modal */}
      {showDeleteEventConfirm && (
        <Dialog open={!!showDeleteEventConfirm} onOpenChange={(open) => {
          if (!open) setShowDeleteEventConfirm(null)
        }}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Delete Event</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this event? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteEventConfirm(null)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleDeleteEvent(showDeleteEventConfirm)}
                  disabled={isDeletingEvent}
                >
                  {isDeletingEvent ? 'Deleting...' : 'Delete Event'}
                </Button>
              </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Program View Modal */}
      {isViewingProgram && selectedProgram && (
        <Dialog open={isViewingProgram} onOpenChange={(open) => {
          if (!open) {
                    setIsViewingProgram(false)
                    setSelectedProgram(null)
          }
        }}>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Program Details</DialogTitle>
              <DialogDescription>View program information and related data</DialogDescription>
            </DialogHeader>
            <CardContent className="space-y-6">
              {/* Program Basic Info */}
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">{selectedProgram.title}</h3>
                  <div className="flex items-center space-x-2 mt-1">
                    {getStatusBadge(selectedProgram.status)}
                    <span className="text-sm text-muted-foreground">
                      {formatDate(selectedProgram.startDate)} - {formatDate(selectedProgram.endDate)}
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Start Date</Label>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(selectedProgram.startDate)}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">End Date</Label>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(selectedProgram.endDate)}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Target Audience</Label>
                    <p className="text-sm text-muted-foreground">{selectedProgram.targetAudience}</p>
                  </div>
                  {selectedProgram.venue && (
                    <div>
                      <Label className="text-sm font-medium">Venue</Label>
                      <p className="text-sm text-muted-foreground">{selectedProgram.venue}</p>
                    </div>
                  )}
                  {selectedProgram.category && (
                    <div>
                      <Label className="text-sm font-medium">Category</Label>
                      <Badge variant="secondary" className="text-xs">
                        {selectedProgram.category}
                      </Badge>
                    </div>
                  )}
                  <div>
                    <Label className="text-sm font-medium">Created</Label>
                    <p className="text-sm text-muted-foreground">
                      {formatDateTime(selectedProgram.createdAt)}
                    </p>
                  </div>
                  {selectedProgram.budget && (
                    <div>
                      <Label className="text-sm font-medium">Budget</Label>
                      <p className="text-sm text-green-600 font-medium">
                        ₱{selectedProgram.budget.toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Schedule</Label>
                  <div className="space-y-2 mt-1">
                    {/* Enhanced Schedule Display */}
                    {(selectedProgram as any).start_time && (selectedProgram as any).end_time ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">
                            {formatScheduleDisplay({
                              scheduleType: (selectedProgram as any).schedule_type || 'RECURRING',
                              startDate: selectedProgram.startDate,
                              endDate: selectedProgram.endDate,
                              startTime: (selectedProgram as any).start_time || '09:00',
                              endTime: (selectedProgram as any).end_time || '17:00',
                              frequency: (selectedProgram as any).frequency || 'WEEKLY',
                              frequencyInterval: (selectedProgram as any).frequency_interval || 1,
                              daysOfWeek: (selectedProgram as any).days_of_week ? JSON.parse((selectedProgram as any).days_of_week) : ['MONDAY'],
                              timezone: (selectedProgram as any).timezone || 'Asia/Manila',
                              exceptions: (selectedProgram as any).schedule_exceptions ? JSON.parse((selectedProgram as any).schedule_exceptions) : [],
                              customDescription: selectedProgram.schedule
                            })}
                          </span>
                        </div>
                        
                        {/* Schedule Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-muted-foreground">
                          <div>
                            <span className="font-medium">Time:</span> {formatTimeReadable((selectedProgram as any).start_time)} - {formatTimeReadable((selectedProgram as any).end_time)}
                          </div>
                          <div>
                            <span className="font-medium">Frequency:</span> {(selectedProgram as any).frequency || 'Weekly'}
                          </div>
                          {(selectedProgram as any).days_of_week && (
                            <div className="md:col-span-2">
                              <span className="font-medium">Days:</span> {JSON.parse((selectedProgram as any).days_of_week).map((day: string) => {
                                const dayLabels: { [key: string]: string } = {
                                  'MONDAY': 'Mon', 'TUESDAY': 'Tue', 'WEDNESDAY': 'Wed', 'THURSDAY': 'Thu',
                                  'FRIDAY': 'Fri', 'SATURDAY': 'Sat', 'SUNDAY': 'Sun'
                                }
                                return dayLabels[day] || day
                              }).join(', ')}
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      /* Fallback to original schedule text */
                      <p className="text-sm text-muted-foreground">
                        {selectedProgram.schedule}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Benefits</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedProgram.benefits}
                  </p>
                </div>

                <div>
                  <Label className="text-sm font-medium">Objectives</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedProgram.objectives}
                  </p>
                </div>
              </div>

              {/* Assigned Members */}
              {selectedProgram.assignedMembers && selectedProgram.assignedMembers.length > 0 && (
                <div>
                  <Label className="text-sm font-medium">Assigned Members</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedProgram.assignedMembers?.map((member) => (
                      <div key={member.id} className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-xs font-medium text-primary">
                            {member.name?.charAt(0).toUpperCase() || 'U'}
                          </span>
                        </div>
                        <span className="text-xs">{member.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Events */}
              {selectedProgram.events && selectedProgram.events.length > 0 && (
                <div>
                  <Label className="text-sm font-medium">Events ({selectedProgram.events.length})</Label>
                  <div className="space-y-2 mt-2">
                    {selectedProgram.events.map((event) => (
                      <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <h4 className="font-medium text-sm">{event.title}</h4>
                          <p className="text-xs text-muted-foreground">
                            {formatDateTime(event.dateTime)} • {event.venue}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {event.forms?.length || 0} forms • {event.forms?.reduce((acc, form) => acc + (form.submissions?.length || 0), 0) || 0} submissions
                          </p>
                        </div>
                        {getStatusBadge(event.status)}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Submissions */}
              {selectedProgram.events && selectedProgram.events.some(event => 
                event.forms?.some(form => (form.submissions?.length || 0) > 0)
              ) && (
                <div>
                  <Label className="text-sm font-medium">Recent Submissions</Label>
                  <div className="space-y-2 mt-2">
                    {selectedProgram.events
                      ?.flatMap(event => event.forms || [])
                      ?.flatMap(form => (form.submissions || []).map(submission => ({ ...submission, formTitle: form.title })))
                      ?.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
                      ?.slice(0, 5)
                      ?.map((submission) => (
                        <div key={submission.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-2 border rounded space-y-2 sm:space-y-0">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{getUserNameFromSubmission(submission)}</p>
                            <p className="text-xs text-muted-foreground truncate">
                              {submission.formTitle} • {formatDateTime(submission.submittedAt)}
                            </p>
                          </div>
                          <div className="flex justify-end sm:justify-start flex-shrink-0">
                          {getStatusBadge(submission.status)}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </CardContent>
          </DialogContent>
        </Dialog>
      )}

      {/* Program Edit Modal */}
      {showEditProgramModal && editingProgram && (
        <Dialog open={showEditProgramModal} onOpenChange={(open) => {
          if (!open) {
            setShowEditProgramModal(false)
            setEditingProgram(null)
            // Reset form data to initial state
            setProgramFormData({
              title: '',
              schedule: '',
              benefits: '',
              objectives: '',
              startDate: '',
              endDate: '',
              targetAudience: '',
              venue: '',
              venueType: 'map',
              category: '',
              budget: '',
              status: 'ONGOING',
              
              // Enhanced schedule fields
              scheduleType: 'RECURRING',
              startTime: '09:00',
              endTime: '17:00',
              frequency: 'WEEKLY',
              frequencyInterval: 1,
              daysOfWeek: ['MONDAY'] as string[],
              timezone: 'Asia/Manila',
              scheduleExceptions: [] as string[]
            })
          }
        }}>
          <DialogContent className="w-[98vw] max-w-2xl max-h-[98vh] overflow-y-auto p-2 xs:p-3 sm:p-6">
            <DialogHeader className="pb-2 xs:pb-3 sm:pb-4">
              <DialogTitle className="text-base xs:text-lg sm:text-xl">Edit Program</DialogTitle>
              <DialogDescription className="text-xs xs:text-sm">Update program information</DialogDescription>
            </DialogHeader>
            <CardContent className="p-0">
              <form onSubmit={handleUpdateProgram} className="space-y-3 xs:space-y-4 sm:space-y-6">
                <div>
                  <Label htmlFor="editProgramTitle">Program Title *</Label>
                  <Input
                    id="editProgramTitle"
                    value={programFormData.title}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProgramFormData({...programFormData, title: e.target.value})}
                    placeholder="Enter program title"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="editProgramSchedule">Schedule *</Label>
                  <div className="space-y-2">
                    <DatePickerProvider>
                      <SchedulePicker
                        value={{
                          scheduleType: programFormData.scheduleType as 'ONE_TIME' | 'RECURRING',
                          startDate: programFormData.startDate,
                          endDate: programFormData.endDate,
                          startTime: programFormData.startTime,
                          endTime: programFormData.endTime,
                          frequency: programFormData.frequency as 'DAILY' | 'WEEKLY' | 'BI_WEEKLY' | 'MONTHLY' | 'CUSTOM',
                          frequencyInterval: programFormData.frequencyInterval,
                          daysOfWeek: programFormData.daysOfWeek,
                          timezone: programFormData.timezone,
                          exceptions: programFormData.scheduleExceptions,
                          customDescription: programFormData.schedule
                        }}
                        onChange={(scheduleData) => {
                          console.log('SchedulePicker onChange received:', scheduleData)
                          const updatedData = {
                            ...programFormData,
                            startDate: scheduleData.startDate,
                            endDate: scheduleData.endDate,
                            scheduleType: scheduleData.scheduleType,
                            startTime: scheduleData.startTime,
                            endTime: scheduleData.endTime,
                            frequency: scheduleData.frequency,
                            frequencyInterval: scheduleData.frequencyInterval,
                            daysOfWeek: scheduleData.daysOfWeek,
                            timezone: scheduleData.timezone || 'Asia/Manila',
                            scheduleExceptions: scheduleData.exceptions,
                            schedule: scheduleData.customDescription || ''
                          }
                          console.log('Updated programFormData:', updatedData)
                          setProgramFormData(updatedData)
                        }}
                    />
                  </DatePickerProvider>
                    {programFormData.category && (
                      <div className="space-y-2">
                        <Label className="text-sm text-muted-foreground">Suggested schedules for {programFormData.category}:</Label>
                        <div className="flex flex-wrap gap-2">
                          {getCategorySchedules(programFormData.category).map((schedule, index) => (
                            <Button
                              key={index}
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setProgramFormData({...programFormData, schedule});
                              }}
                              className="text-xs"
                            >
                              {schedule.length > 40 ? `${schedule.substring(0, 40)  }...` : schedule}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="editProgramBenefits">Benefits *</Label>
                  <div className="space-y-2">
                    <Textarea
                      id="editProgramBenefits"
                      value={programFormData.benefits}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setProgramFormData({...programFormData, benefits: e.target.value})}
                      placeholder="List the benefits participants will receive"
                      rows={3}
                      required
                    />
                    {programFormData.category && (
                      <div className="space-y-2">
                        <Label className="text-sm text-muted-foreground">Suggested benefits for {programFormData.category}:</Label>
                        <div className="flex flex-wrap gap-2">
                          {getCategoryBenefits(programFormData.category).map((benefit, index) => (
                            <Button
                              key={index}
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const currentBenefits = programFormData.benefits;
                                const newBenefit = currentBenefits ? `${currentBenefits}\n• ${benefit}` : `• ${benefit}`;
                                setProgramFormData({...programFormData, benefits: newBenefit});
                              }}
                              className="text-xs"
                            >
                              + {benefit}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="editProgramObjectives">Objectives *</Label>
                  <Textarea
                    id="editProgramObjectives"
                    value={programFormData.objectives}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setProgramFormData({...programFormData, objectives: e.target.value})}
                    placeholder="List the program objectives"
                    rows={3}
                    required
                  />
                </div>
                

                
                <div>
                  <Label htmlFor="editProgramTargetAudience">Target Audience *</Label>
                  <Input
                    id="editProgramTargetAudience"
                    value={programFormData.targetAudience}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProgramFormData({...programFormData, targetAudience: e.target.value})}
                    placeholder="Enter target audience"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="editProgramVenue">Venue</Label>
                  <div className="space-y-3">
                    {/* Venue Type Selection */}
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant={programFormData.venueType === 'map' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setProgramFormData({...programFormData, venueType: 'map', venue: ''})}
                        className="text-xs"
                      >
                        📍 Map Location
                      </Button>
                      <Button
                        type="button"
                        variant={programFormData.venueType === 'manual' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setProgramFormData({...programFormData, venueType: 'manual', venue: ''})}
                        className="text-xs"
                      >
                        ✏️ Manual Entry
                      </Button>
                    </div>

                    {/* Map Location Selection */}
                    {programFormData.venueType === 'map' && (
                      <div className="relative">
                        <select
                          id="editProgramVenue"
                          value={programFormData.venue}
                          onChange={(e) => setProgramFormData({...programFormData, venue: e.target.value})}
                          className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                          disabled={isLoadingLocations}
                        >
                          <option value="">Select a venue from map locations</option>
                          {locations.map((location) => (
                            <option key={location.id} value={location.name}>
                              {location.name} - {location.type.toLowerCase()}
                            </option>
                          ))}
                        </select>
                        {isLoadingLocations && (
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Manual Venue Entry */}
                    {programFormData.venueType === 'manual' && (
                      <Input
                        id="editProgramVenueManual"
                        value={programFormData.venue}
                        onChange={(e) => setProgramFormData({...programFormData, venue: e.target.value})}
                        placeholder="Enter venue manually (e.g., Barangay Hall, Community Center, School)"
                        className="w-full"
                      />
                    )}

                    {/* Help Text */}
                    {programFormData.venueType === 'map' && locations.length === 0 && !isLoadingLocations && (
                      <div className="text-xs text-gray-500 mt-1">
                        <p>No locations found. Add locations on the map first.</p>
                        <button
                          type="button"
                          onClick={fetchLocations}
                          className="text-blue-600 hover:text-blue-800 underline mt-1"
                        >
                          Refresh locations
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="editProgramCategory">Category</Label>
                  <select
                    id="editProgramCategory"
                    value={programFormData.category}
                    onChange={(e) => setProgramFormData({...programFormData, category: e.target.value})}
                    className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                  >
                    <option value="">Select a category</option>
                    <option value="Leadership">Leadership</option>
                    <option value="Environment">Environment</option>
                    <option value="Education">Education</option>
                    <option value="Sports">Sports</option>
                    <option value="Technology">Technology</option>
                    <option value="Community">Community</option>
                    <option value="Health">Health</option>
                    <option value="Arts">Arts</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                
                <div>
                  <Label htmlFor="editProgramBudget">Budget (₱)</Label>
                  <Input
                    id="editProgramBudget"
                    type="number"
                    step="0.01"
                    min="0"
                    value={programFormData.budget}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProgramFormData({...programFormData, budget: e.target.value})}
                    placeholder="Enter budget amount"
                  />
                </div>
                
                <div>
                  <Label htmlFor="editProgramStatus">Status</Label>
                  <select
                    id="editProgramStatus"
                    value={programFormData.status}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setProgramFormData({...programFormData, status: e.target.value as any})}
                    className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                  >
                    <option value="ONGOING">Ongoing</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>
                
                <div className="flex flex-col gap-2 xs:gap-3 pt-4 xs:pt-6 border-t">
                  <Button 
                    type="submit" 
                    disabled={isEditingProgram}
                    className="w-full py-2.5 xs:py-3 text-sm xs:text-base"
                  >
                    {isEditingProgram ? 'Updating...' : 'Update Program'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowEditProgramModal(false)
                      setEditingProgram(null)
                    }}
                    className="w-full py-2.5 xs:py-3 text-sm xs:text-base"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </DialogContent>
        </Dialog>
      )}

      {/* Program Delete Confirmation Modal */}
      {showDeleteProgramConfirm && (
        <Dialog open={!!showDeleteProgramConfirm} onOpenChange={(open) => {
          if (!open) setShowDeleteProgramConfirm(null)
        }}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Delete Program</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this program? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteProgramConfirm(null)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleDeleteProgram(showDeleteProgramConfirm)}
                  disabled={isDeletingProgram}
                >
                  {isDeletingProgram ? 'Deleting...' : 'Delete Program'}
                </Button>
              </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Submission View Modal */}
      {isViewingSubmission && selectedSubmission && (
        <Dialog open={isViewingSubmission} onOpenChange={(open) => {
          if (!open) {
                    setIsViewingSubmission(false)
                    setSelectedSubmission(null)
          }
        }}>
          <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Submission Details</DialogTitle>
              <DialogDescription>View complete submission information</DialogDescription>
            </DialogHeader>
            <CardContent>
              {/* Submission Basic Info */}
              <div className="space-y-4 mb-6">
                <div>
                  <h3 className="font-semibold text-lg">{selectedSubmission.form?.title || 'Form Title Unavailable'}</h3>
                  <div className="flex items-center space-x-2 mt-1">
                    {getStatusBadge(selectedSubmission.status)}
                    <span className="text-sm text-muted-foreground">
                      Event: {selectedSubmission.form?.event?.title || 'Event Unavailable'}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      Program: {selectedSubmission.form?.event?.program?.title || 'Program Unavailable'}
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Submitted By</Label>
                    <p className="text-sm text-muted-foreground">
                       {getUserNameFromSubmission(selectedSubmission)}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Submitted At</Label>
                    <p className="text-sm text-muted-foreground">
                      {formatDateTime(selectedSubmission.submittedAt)}
                    </p>
                  </div>
                  {selectedSubmission.reviewedAt && (
                    <div>
                      <Label className="text-sm font-medium">Reviewed At</Label>
                      <p className="text-sm text-muted-foreground">
                        {formatDateTime(selectedSubmission.reviewedAt)}
                      </p>
                    </div>
                  )}
                  {selectedSubmission.reviewedBy && (
                    <div>
                      <Label className="text-sm font-medium">Reviewed By</Label>
                      <p className="text-sm text-muted-foreground">
                        {selectedSubmission.reviewedBy}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Tabs */}
              <Tabs defaultValue="details" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="details" className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Details
                  </TabsTrigger>
                  <TabsTrigger value="attachments" className="flex items-center gap-2">
                    <Paperclip className="w-4 h-4" />
                    Attachments
                  </TabsTrigger>
                  <TabsTrigger value="history" className="flex items-center gap-2">
                    <History className="w-4 h-4" />
                    History
                  </TabsTrigger>
                </TabsList>

                {/* Details Tab */}
                <TabsContent value="details" className="space-y-6 mt-6">
                  {/* Submission Data */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <h4 className="font-semibold text-lg text-gray-900">Form Data</h4>
                    </div>
                    
                    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                      {(() => {
                        try {
                          const formData = JSON.parse(selectedSubmission.data)
                          return (
                            <div className="divide-y divide-gray-100">
                              {Object.entries(formData).map(([key, value]) => {
                                // Convert field names to user-friendly labels
                                const getFieldLabel = (fieldName: string) => {
                                  const labelMap: Record<string, string> = {
                                    // Exact field names from your form (from console logs)
                                    'Enter you full name': 'Full Name',
                                    'Enter your Email Address': 'Email Address',
                                    'Enter your Players': 'Number of Players',
                                    'Enter your Phone Number': 'Phone Number',
                                    'Enter the preferred date': 'Preferred Date',
                                    'Enter the names': 'Player Names',
                                    'alright': 'Confirmation',
                                    'Yjg_accountName': 'Account Name',
                                    'Yjg_referenceNumber': 'Reference Number',
                                    'Yjg_amount': 'Amount',
                                    'SIGNATURE': 'Signature',
                                    'Upload here': 'Upload Here',
                                    'Yjg_receipt': 'Payment Receipt',
                                    // Legacy mappings for compatibility
                                    'Enter You Full Name': 'Full Name',
                                    'Enter Your Full Name': 'Full Name',
                                    'Enter Your Email Address': 'Email Address',
                                    'Enter Your Phone Number': 'Phone Number',
                                    'Enter Your Players': 'Number of Players',
                                    'Enter The Preferred Date': 'Preferred Date',
                                    'Enter The Names': 'Player Names',
                                    'Yjg_account Name': 'Account Name',
                                    'Yjg_reference Number': 'Reference Number',
                                    'Alright': 'Confirmation',
                                    'Full name': 'Full Name',
                                    'Email Address': 'Email Address',
                                    'Players': 'Number of Players',
                                    'Phone Number': 'Phone Number',
                                    'Preferred date': 'Preferred Date',
                                    'Names': 'Player Names',
                                    'Account Name': 'Account Name',
                                    'Reference Number': 'Reference Number',
                                    'Amount': 'Amount'
                                  }
                                 
                                 // Check if we have a specific mapping
                                 if (labelMap[fieldName]) {
                                   return labelMap[fieldName]
                                 }
                                 
                                 // Fallback: clean up common patterns
                                 return fieldName
                                   .replace(/^Enter\s+(You|Your|The)\s+/i, '') // Remove "Enter You/Your/The"
                                   .replace(/^Yjg_/i, '') // Remove "Yjg_" prefix
                                   .replace(/([A-Z])/g, ' $1') // Add spaces before capitals
                                   .replace(/^./, str => str.toUpperCase()) // Capitalize first letter
                                   .trim()
                               }
                               
                               const getFieldIcon = (fieldName: string) => {
                                 const iconMap: Record<string, string> = {
                                   'Full Name': 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
                                   'Email Address': 'M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
                                   'Phone Number': 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z',
                                   'Number of Players': 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
                                   'Preferred Date': 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
                                   'Player Names': 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
                                   'Account Name': 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1',
                                   'Reference Number': 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
                                   'Amount': 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1',
                                   'Signature': 'M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z',
                                   'Payment Receipt': 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z',
                                   'Confirmation': 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
                                 }
                                 
                                 const label = getFieldLabel(fieldName)
                                 return iconMap[label] || 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                               }
                               
                               const formatValue = (value: any, fieldName: string) => {
                                 if (typeof value === 'string') {
                                   // Check if it's an email
                                   if (fieldName.toLowerCase().includes('email')) {
                                     return (
                                       <a 
                                         href={`mailto:${value}`}
                                         className="text-blue-600 hover:text-blue-800 underline"
                                       >
                                         {value}
                                       </a>
                                     )
                                   }
                                   // Check if it's a phone number
                                   if (fieldName.toLowerCase().includes('phone')) {
                                     return (
                                       <a 
                                         href={`tel:${value}`}
                                         className="text-blue-600 hover:text-blue-800 underline"
                                       >
                                         {value}
                                       </a>
                                     )
                                   }
                                   // Check if it's a date
                                   if (fieldName.toLowerCase().includes('date')) {
                                     return new Date(value).toLocaleDateString('en-US', {
                                       year: 'numeric',
                                       month: 'long',
                                       day: 'numeric'
                                     })
                                   }
                                   // Check if it's a number
                                   if (fieldName.toLowerCase().includes('amount') || fieldName.toLowerCase().includes('number')) {
                                     return (
                                       <span className="font-mono font-semibold text-green-600">
                                         {fieldName.toLowerCase().includes('amount') ? `₱${value}` : value}
                                       </span>
                                     )
                                   }
                                   return value
                                 }
                                 return JSON.stringify(value)
                               }
                               
                               const isCopyable = (fieldName: string) => {
                                 const copyableFields = ['Email Address', 'Phone Number', 'Reference Number', 'Account Name']
                                 return copyableFields.includes(getFieldLabel(fieldName))
                               }
                               
                               return (
                                 <div key={key} className="p-4 hover:bg-gray-50 transition-colors">
                                   <div className="flex items-start gap-3">
                                     <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                       <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={getFieldIcon(key)} />
                                       </svg>
                                     </div>
                                     <div className="flex-1 min-w-0">
                                       <div className="flex items-center justify-between">
                                         <h5 className="text-sm font-medium text-gray-900 mb-1">
                                           {getFieldLabel(key)}
                                         </h5>
                                         {isCopyable(getFieldLabel(key)) && (
                                           <button
                                             onClick={() => navigator.clipboard.writeText(String(value))}
                                             className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                                             title="Copy to clipboard"
                                           >
                                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                             </svg>
                                           </button>
                                         )}
                                       </div>
                                       <p className="text-sm text-gray-600 break-words">
                                         {formatValue(value, key)}
                                       </p>
                                     </div>
                                   </div>
                                 </div>
                               )
                             })}
                            </div>
                          )
                        } catch (error) {
                          return (
                            <div className="p-6 text-center">
                              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.865-.833-2.635 0L4.179 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                              </div>
                              <p className="text-sm text-gray-500">Unable to parse form data</p>
                            </div>
                          )
                        }
                      })()}
                    </div>
                  </div>

                  {/* Notes */}
                  {selectedSubmission.notes && (
                    <div className="space-y-4">
                      <h4 className="font-semibold text-base">Review Notes</h4>
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <p className="text-sm text-blue-900">{selectedSubmission.notes}</p>
                      </div>
                    </div>
                  )}
                </TabsContent>

                {/* Attachments Tab */}
                <TabsContent value="attachments" className="space-y-6 mt-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-base">User Uploaded Files</h4>
                    <p className="text-sm text-gray-600">Files uploaded by the user during form submission</p>

              {/* Uploaded Files */}
              {(() => {
                try {
                  // First check for files in the main data field
                  const formData = JSON.parse(selectedSubmission.data)
                        const fileEntries: Array<[string, string]> = []
                  
                  // Extract file URLs from form data (look for paths that start with /uploads/)
                  Object.entries(formData).forEach(([key, value]) => {
                    if (typeof value === 'string' && value.startsWith('/uploads/submissions/')) {
                      fileEntries.push([key, value])
                    }
                  })
                  
                  // Also check for backward compatibility with separate files field
                  if (selectedSubmission.files) {
                    try {
                      const filesData = JSON.parse(selectedSubmission.files)
                        
                        if (Array.isArray(filesData)) {
                          // If it's an array, convert to entries
                        filesData.forEach((file, index) => {
                          fileEntries.push([`file_${index}`, file])
                        })
                        } else if (typeof filesData === 'object' && filesData !== null) {
                          // If it's an object, convert to entries
                        Object.entries(filesData).forEach(([key, value]) => {
                          if (typeof value === 'string') {
                            fileEntries.push([key, value])
                          }
                        })
                      }
                    } catch (error) {
                      console.error('Error parsing files field:', error)
                    }
                        }
                        
                        if (fileEntries.length > 0) {
                    return (
                      <div className="space-y-4">
                              <h5 className="font-medium text-sm text-gray-700 flex items-center gap-2">
                                <Upload className="w-4 h-4" />
                                Uploaded Files ({fileEntries.length})
                              </h5>
                              <div className="space-y-3">
                                {fileEntries.map(([fieldName, fileUrl], index) => {
                                  // Extract filename from URL or use field name
                                  const fileName = fileUrl.split('/').pop() || fieldName
                                  const fileExtension = fileName.split('.').pop()?.toUpperCase() || 'FILE'
                                  
                                  return (
                                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                                      <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                          <File className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <p className="text-sm font-medium text-gray-900 truncate">
                                            {fileName}
                                          </p>
                                          <div className="flex items-center gap-2 text-xs text-gray-500">
                                            <span className="bg-gray-200 px-2 py-1 rounded text-xs font-medium">
                                              {fileExtension}
                              </span>
                                            <span>Field: {fieldName}</span>
                                            <span>Uploaded by user</span>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-2 flex-shrink-0">
                                        <a
                                          href={fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                          className="text-blue-500 hover:text-blue-700 text-sm underline flex items-center gap-1 px-3 py-1 rounded hover:bg-blue-50 transition-colors"
                                        >
                                          <Eye className="w-4 h-4" />
                                          View
                                        </a>
                                        <a
                                          href={fileUrl}
                                          download={fileName}
                                          className="text-green-600 hover:text-green-700 text-sm underline flex items-center gap-1 px-3 py-1 rounded hover:bg-green-50 transition-colors"
                                        >
                                          <Download className="w-4 h-4" />
                                          Download
                              </a>
                            </div>
                                    </div>
                                  )
                                })}
                        </div>
                      </div>
                    )
                  }
                } catch (error) {
                  console.error('Error parsing submission data for files:', error)
                }
                return null
              })()}

              {/* GCash Receipt */}
              {selectedSubmission.gcashReceipt && (
                <div className="space-y-4">
                        <h5 className="font-medium text-sm text-gray-700 flex items-center gap-2">
                          <Receipt className="w-4 h-4" />
                          Payment Receipt
                        </h5>
                        <div className="flex items-center justify-between p-4 border rounded-lg bg-green-50 border-green-200 hover:bg-green-100 transition-colors">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <Receipt className="w-5 h-5 text-green-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-green-900">GCash Payment Receipt</p>
                              <div className="flex items-center gap-2 text-xs text-green-700">
                                <span className="bg-green-200 px-2 py-1 rounded text-xs font-medium">
                                  IMAGE
                                </span>
                                <span>Payment confirmation</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                      <a
                        href={selectedSubmission.gcashReceipt}
                        target="_blank"
                        rel="noopener noreferrer"
                              className="text-green-600 hover:text-green-700 text-sm underline flex items-center gap-1 px-3 py-1 rounded hover:bg-green-50 transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                              View
                            </a>
                            <a
                              href={selectedSubmission.gcashReceipt}
                              download="gcash-receipt.jpg"
                              className="text-green-600 hover:text-green-700 text-sm underline flex items-center gap-1 px-3 py-1 rounded hover:bg-green-50 transition-colors"
                            >
                              <Download className="w-4 h-4" />
                              Download
                      </a>
                    </div>
                  </div>
                </div>
              )}

                    {/* No attachments message */}
                    {(() => {
                      let hasFiles = false
                      
                      // Check for files in main data field first
                      try {
                        const formData = JSON.parse(selectedSubmission.data)
                        const fileUrls = Object.values(formData).filter(value => 
                          typeof value === 'string' && value.startsWith('/uploads/submissions/')
                        )
                        hasFiles = fileUrls.length > 0
                      } catch (error) {
                        console.error('Error checking for files in submission data:', error)
                      }
                      
                      // Also check separate files field for backward compatibility
                      if (!hasFiles && selectedSubmission.files) {
                        try {
                          const filesData = JSON.parse(selectedSubmission.files)
                          if (Array.isArray(filesData)) {
                            hasFiles = filesData.length > 0
                          } else if (typeof filesData === 'object' && filesData !== null) {
                            hasFiles = Object.keys(filesData).length > 0
                          }
                        } catch {
                          hasFiles = false
                        }
                      }
                      
                      return !hasFiles && !selectedSubmission.gcashReceipt
                    })() && (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Paperclip className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Files Uploaded</h3>
                        <p className="text-gray-500 text-sm max-w-md mx-auto">
                          This submission doesn't contain any uploaded files or attachments from the user.
                        </p>
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* History Tab */}
                <TabsContent value="history" className="space-y-6 mt-6">
                <div className="space-y-4">
                    <h4 className="font-semibold text-base">Submission History</h4>
                    
                    <div className="space-y-4">
                      {/* Submission Created */}
                      <div className="flex items-start gap-4 p-4 border rounded-lg bg-blue-50 border-blue-200">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-blue-900">Submission Created</p>
                            <span className="text-xs text-blue-700">{formatDateTime(selectedSubmission.submittedAt)}</span>
                  </div>
                                                      <p className="text-xs text-blue-700 mt-1">
                             Submitted by {getUserNameFromSubmission(selectedSubmission)}
                            </p>
                          <p className="text-xs text-blue-600 mt-1">
                            Status: <span className="font-medium">Pending</span>
                          </p>
                </div>
                      </div>

                      {/* Status Changes */}
                      {selectedSubmission.status !== 'PENDING' && (
                        <div className="flex items-start gap-4 p-4 border rounded-lg bg-green-50 border-green-200">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-green-900">
                                Status Updated to {selectedSubmission.status}
                              </p>
                              <span className="text-xs text-green-700">
                                {selectedSubmission.reviewedAt ? formatDateTime(selectedSubmission.reviewedAt) : 'Recently'}
                              </span>
                            </div>
                            {selectedSubmission.reviewedBy && (
                              <p className="text-xs text-green-700 mt-1">
                                Reviewed by {selectedSubmission.reviewedBy}
                              </p>
                            )}
                            {selectedSubmission.notes && (
                              <p className="text-xs text-green-600 mt-1">
                                Notes: {selectedSubmission.notes}
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Additional History Items */}
                      <div className="flex items-start gap-4 p-4 border rounded-lg bg-gray-50 border-gray-200">
                        <div className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-700">Form Accessed</p>
                            <span className="text-xs text-gray-500">{formatDateTime(selectedSubmission.submittedAt)}</span>
                          </div>
                          <p className="text-xs text-gray-600 mt-1">
                            Form: {selectedSubmission.form?.title || 'Form Title Unavailable'}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Event: {selectedSubmission.form?.event?.title || 'Event Unavailable'}
                          </p>
                        </div>
                      </div>

                      {/* Future History Items */}
                      <div className="text-center py-4">
                        <p className="text-gray-500 text-sm">More history events will appear here as the submission progresses</p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </DialogContent>
        </Dialog>
      )}

      {/* Reject Submission Modal */}
      {showRejectModal && rejectingSubmission && (
        <Dialog open={showRejectModal} onOpenChange={(open) => {
          if (!open) {
                    setShowRejectModal(false)
                    setRejectingSubmission(null)
                    setRejectionReason('')
          }
        }}>
          <DialogContent className="sm:max-w-md max-h-[90vh] flex flex-col">
            <DialogHeader>
              <DialogTitle className="text-lg">Reject Submission</DialogTitle>
              <DialogDescription>
                Please provide a reason for rejecting this submission
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 overflow-y-auto flex-1">
                        <div>
                          <Label htmlFor="rejection-reason">Reason for rejection</Label>
                          <div className="mt-2 space-y-2">
                            <p className="text-sm text-gray-600 mb-3">Select a common reason or write your own:</p>
                            
                            {/* Pre-defined reasons */}
                            <div className="grid grid-cols-1 gap-1 mb-3">
                              {rejectionReasons.map((reason, index) => (
                                <button
                                  key={index}
                                  type="button"
                                  onClick={() => {
                                    setRejectionReason(reason)
                                    setSelectedReasonType('predefined')
                                  }}
                                  className={`text-left p-2 rounded-lg border transition-colors ${
                                    selectedReasonType === 'predefined' && rejectionReason === reason
                                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                  }`}
                                >
                                  <span className="text-sm">{reason}</span>
                                </button>
                              ))}
                            </div>
                            
                            {/* Custom reason textarea */}
                            <div>
                              <Label htmlFor="custom-reason" className="text-sm font-medium text-gray-700">
                                Custom reason
                              </Label>
                              <Textarea
                                id="custom-reason"
                                value={selectedReasonType === 'custom' ? rejectionReason : ''}
                                onChange={(e) => {
                                  setRejectionReason(e.target.value)
                                  setSelectedReasonType('custom')
                                }}
                                onFocus={() => setSelectedReasonType('custom')}
                                placeholder="Write your own detailed reason..."
                                rows={2}
                                className="mt-1"
                              />
                            </div>
                          </div>
                        </div>
              
              <div className="bg-gray-50 p-2 rounded-lg">
                <p className="text-sm font-medium text-gray-700">Submission Details:</p>
                <p className="text-sm text-gray-600">{rejectingSubmission.form?.title || 'Form Title Unavailable'}</p>
                <p className="text-xs text-gray-500">
                  Submitted by: {getUserNameFromSubmission(rejectingSubmission)}
                </p>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowRejectModal(false)
                    setRejectingSubmission(null)
                    setRejectionReason('')
                    setSelectedReasonType('predefined')
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={confirmRejectSubmission}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Reject Submission
                </Button>
              </div>
        </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Submission Modal */}
      {showDeleteSubmissionModal && deletingSubmission && (
        <Dialog open={showDeleteSubmissionModal} onOpenChange={(open) => {
          if (!open) {
                    setShowDeleteSubmissionModal(false)
                    setDeletingSubmission(null)
          }
        }}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-lg text-red-600">Delete Submission</DialogTitle>
              <DialogDescription>
                This action cannot be undone. Are you sure you want to delete this submission?
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-800">Warning</p>
                    <p className="text-sm text-red-700 mt-1">
                      Deleting this submission will permanently remove all associated data including files and responses.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm font-medium text-gray-700">Submission Details:</p>
                <p className="text-sm text-gray-600">{deletingSubmission.form?.title || 'Form Title Unavailable'}</p>
                <p className="text-xs text-gray-500">
                  Submitted by: {getUserNameFromSubmission(deletingSubmission)}
                </p>
                <p className="text-xs text-gray-500">
                  Status: {deletingSubmission.status}
                </p>
                <p className="text-xs text-gray-500">
                  Submitted: {formatDateTime(deletingSubmission.submittedAt)}
                </p>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDeleteSubmissionModal(false)
                    setDeletingSubmission(null)
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={confirmDeleteSubmission}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Delete Submission
                </Button>
              </div>
        </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Test Email Modal */}
      {showEmailTestModal && (
        <Dialog open={showEmailTestModal} onOpenChange={(open) => {
          if (!open) {
                    setShowEmailTestModal(false)
                    setTestEmail('')
          }
        }}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-lg">Test Email Service</DialogTitle>
              <DialogDescription>
                Send a test email to verify the email service is working correctly
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="test-email">Email Address</Label>
                <Input
                  id="test-email"
                  type="email"
                  placeholder="Enter email address to send test to"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  className="mt-1"
                />
              </div>
              
              <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                <div className="flex items-start space-x-3">
                  <Mail className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-800">Email Service Test</p>
                    <p className="text-sm text-blue-700 mt-1">
                      This will send a test email with sample submission status notification to verify the email service is working.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowEmailTestModal(false)
                    setTestEmail('')
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={testEmailService}
                  disabled={isTestingEmail || !testEmail}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isTestingEmail ? 'Sending...' : 'Send Test Email'}
                </Button>
              </div>
        </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Bulk Action Modal */}
      {showBulkActionModal && bulkActionType && (
        <Dialog open={showBulkActionModal} onOpenChange={(open) => {
          if (!open) {
            setShowBulkActionModal(false)
            setBulkActionType(null)
            setBulkRejectionReason('')
          }
        }}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-lg">
                    {bulkActionType === 'approve' && 'Bulk Approve Submissions'}
                    {bulkActionType === 'reject' && 'Bulk Reject Submissions'}
                    {bulkActionType === 'delete' && 'Bulk Delete Submissions'}
              </DialogTitle>
              <DialogDescription>
                    {bulkActionType === 'approve' && `Approve ${selectedSubmissions.size} selected submissions`}
                    {bulkActionType === 'reject' && `Reject ${selectedSubmissions.size} selected submissions`}
                    {bulkActionType === 'delete' && `Delete ${selectedSubmissions.size} selected submissions`}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {/* Warning for delete action */}
              {bulkActionType === 'delete' && (
                <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.865-.833-2.635 0L4.179 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-red-800">Warning</p>
                      <p className="text-sm text-red-700 mt-1">
                        This action will permanently delete {selectedSubmissions.size} submissions and cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Rejection reason for reject action */}
              {bulkActionType === 'reject' && (
                <div>
                  <Label htmlFor="bulk-rejection-reason">Rejection Reason (Optional)</Label>
                  <Textarea
                    id="bulk-rejection-reason"
                    placeholder="Enter a reason for rejection..."
                    value={bulkRejectionReason}
                    onChange={(e) => setBulkRejectionReason(e.target.value)}
                    className="mt-1"
                    rows={3}
                  />
                </div>
              )}

              {/* Confirmation message */}
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                <div className="flex items-start space-x-3">
                  <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-blue-800">Confirmation</p>
                    <p className="text-sm text-blue-700 mt-1">
                      {bulkActionType === 'approve' && `Are you sure you want to approve ${selectedSubmissions.size} submissions?`}
                      {bulkActionType === 'reject' && `Are you sure you want to reject ${selectedSubmissions.size} submissions?`}
                      {bulkActionType === 'delete' && `Are you sure you want to delete ${selectedSubmissions.size} submissions?`}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowBulkActionModal(false)
                    setBulkActionType(null)
                    setBulkRejectionReason('')
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={confirmBulkAction}
                  disabled={isPerformingBulkAction}
                  className={
                    bulkActionType === 'approve' ? 'bg-green-600 hover:bg-green-700' :
                    bulkActionType === 'reject' ? 'bg-red-600 hover:bg-red-700' :
                    'bg-red-600 hover:bg-red-700'
                  }
                >
                  {isPerformingBulkAction ? 'Processing...' : 
                   bulkActionType === 'approve' ? 'Approve All' :
                   bulkActionType === 'reject' ? 'Reject All' :
                   'Delete All'
                  }
                </Button>
              </div>
        </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Youth Profile Creation Notification - TODO: Implement youth profile creation functionality */}
      {/*
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md shadow-2xl rounded-xl">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3 shadow-md">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <CardTitle className="text-lg">Youth Profile Created</CardTitle>
              <CardDescription className="text-sm">
                A new youth profile has been automatically created from the approved form submission.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-green-800">Tracking ID</p>
                  <p className="text-base font-mono font-semibold text-green-900">
                    {youthProfileData.trackingId}
                  </p>
                  <p className="text-sm text-green-700">
                    Name: {youthProfileData.fullName}
                  </p>
                  <p className="text-sm text-green-700">
                    Age: {youthProfileData.age} years old
                  </p>
                  <p className="text-sm text-green-700">
                    Contact: {youthProfileData.mobileNumber}
                  </p>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button 
                  onClick={() => setYouthProfileCreated(false)}
                  variant="outline" 
                  className="flex-1 text-sm"
                >
                  Close
                </Button>
                
                <Button 
                  onClick={() => {
                    setYouthProfileCreated(false)
                    window.location.href = '/dashboard/youth'
                  }}
                  className="flex-1 text-sm bg-sky-600 hover:bg-sky-700"
                >
                  View Youth Profiles
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      */}
    </div>
  </div>
  )
} 