"use client"

import Image from 'next/image'
import { useParams } from 'next/navigation'
import { useState, useEffect } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Map } from '@/components/ui/map'
import { Textarea } from '@/components/ui/textarea'


interface FormField {
  id: string
  name: string
  label: string
  type: 'text' | 'email' | 'number' | 'tel' | 'date' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'rating' | 'scale' | 'paragraph' | 'signature' | 'consent' | 'fileUpload' | 'gcashReceipt'
  required: boolean
  options?: string[]
  min?: number
  max?: number
  placeholder?: string
  qrCodeImage?: string | null
}

interface Form {
  id: string
  title: string
  type: string
  fields: FormField[]
  fileUpload: boolean
  gcashReceipt: boolean
  qrCodeImage: string | null
  submissionLimit: number | null
  submissionDeadline: string | null
  isActive: boolean
  publishStatus: string
  event: {
    id: string
    title: string
    dateTime: string
    program: {
      id: string
      title: string
    }
  }
}

export default function PublicFormPage() {
  const params = useParams()
  const formId = params.id as string
  const [form, setForm] = useState<Form | null>(null)
  const [formData, setFormData] = useState<{[key: string]: any}>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deadlineDate, setDeadlineDate] = useState<string | null>(null)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [submissionId, setSubmissionId] = useState<string | null>(null)
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [selectedLatitude, setSelectedLatitude] = useState<number | null>(null)
  const [selectedLongitude, setSelectedLongitude] = useState<number | null>(null)

  useEffect(() => {
    fetchForm()
  }, [formId])

  const fetchForm = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/forms/${formId}`)
      
      if (response.ok) {
        const data = await response.json()
        
        // Check if form is published and active
        if (data.form.publishStatus !== 'PUBLISHED' || !data.form.isActive) {
          setError('This form is not currently available.')
          return
        }
        
        // Check submission deadline
        if (data.form.submissionDeadline && new Date(data.form.submissionDeadline) < new Date()) {
          setDeadlineDate(data.form.submissionDeadline)
          setError('The submission deadline for this form has passed.')
          return
        }
        
        setForm(data.form)
      } else {
        setError('Form not found.')
      }
    } catch (error) {
      console.error('Error fetching form:', error)
      setError('Failed to load form.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (fieldName: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }))
  }

  const handleLocationSelect = (lat: number, lng: number) => {
    setSelectedLatitude(lat)
    setSelectedLongitude(lng)
    // Also store in form data for submission
    setFormData(prev => ({
      ...prev,
      latitude: lat,
      longitude: lng
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!form) return

    try {
      setIsSubmitting(true)
      
      // Validate required fields
      const missingFields = form.fields
        .filter(field => {
          if (!field.required) return false
          
          // For gcashReceipt fields, check if receipt is uploaded
          if (field.type === 'gcashReceipt') {
            return !formData[`${field.name}_receipt`]
          }
          
          // For regular fields, check the field value
          return !formData[field.name]
        })
        .map(field => field.label)
      
      if (missingFields.length > 0) {
        setErrorMessage(`Please fill in the following required fields: ${missingFields.join(', ')}`)
        setShowErrorModal(true)
        return
      }


      
      // Check if we have file uploads
      const hasFiles = Object.values(formData).some(value => value instanceof File)
      
      if (hasFiles) {
        // Handle form data with files using FormData
        const formDataToSend = new FormData()
        formDataToSend.append('formId', form.id)
        
        // Separate files from regular data
        const regularData: Record<string, any> = {}
        
        for (const [key, value] of Object.entries(formData)) {
          if (value instanceof File) {
            formDataToSend.append(key, value)
          } else {
            regularData[key] = value
          }
        }
        
        formDataToSend.append('data', JSON.stringify(regularData))
        
        const response = await fetch('/api/submissions', {
          method: 'POST',
          body: formDataToSend,
        })

        if (response.ok) {
          const result = await response.json()
          setSubmissionId(result.submission?.id || `SK-${Date.now()}`)
          setShowSuccessModal(true)
          setFormData({})
        } else {
          const error = await response.json()
          setErrorMessage(error.error || 'Failed to submit form')
          setShowErrorModal(true)
        }
      } else {
        // Handle regular form data with JSON
        const response = await fetch('/api/submissions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            formId: form.id,
            data: JSON.stringify(formData)
          }),
        })

        if (response.ok) {
          const result = await response.json()
          setSubmissionId(result.submission?.id || `SK-${Date.now()}`)
          setShowSuccessModal(true)
          setFormData({})
        } else {
          const error = await response.json()
          setErrorMessage(error.error || 'Failed to submit form')
          setShowErrorModal(true)
        }
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      setErrorMessage('Failed to submit form. Please try again.')
      setShowErrorModal(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading form...</p>
        </div>
      </div>
    )
  }

  if (error) {
    const isDeadlineExpired = error.includes('deadline')
    const isFormInactive = error.includes('not currently available')
    const isFormNotFound = error.includes('not found')
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="shadow-lg border-0 overflow-hidden">
            {/* Header with Icon */}
            <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  {isDeadlineExpired ? (
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : isFormInactive ? (
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.865-.833-2.635 0L4.179 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  )}
                </div>
                <div>
                  <h1 className="text-white font-semibold text-lg">
                    {isDeadlineExpired ? 'Submission Deadline Passed' : 
                     isFormInactive ? 'Form Currently Unavailable' : 
                     'Form Not Found'}
                  </h1>
                  <p className="text-white/80 text-sm">
                    {isDeadlineExpired ? 'This form is no longer accepting submissions' : 
                     isFormInactive ? 'This form is temporarily unavailable' : 
                     'The requested form could not be found'}
                  </p>
                </div>
              </div>
            </div>

            <CardContent className="p-6 space-y-4">
              {/* Main Message */}
              <div className="text-center space-y-3">
                <div className="mx-auto w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    We're Sorry
                  </h2>
                  <p className="text-gray-600 leading-relaxed">
                    {isDeadlineExpired 
                      ? `The submission deadline for this form has passed${deadlineDate ? ` on ${formatDateTime(deadlineDate)}` : ''}. We are no longer accepting new submissions for this event.`
                      : isFormInactive
                      ? "This form is currently not available for submissions. It may be temporarily disabled or still in preparation."
                      : "The form you're looking for doesn't exist or may have been removed. Please check the URL and try again."
                    }
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-4">
                {isDeadlineExpired && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <h3 className="font-medium text-amber-800 text-sm">Missed the deadline?</h3>
                        <p className="text-amber-700 text-xs mt-1">
                          Contact the event organizers if you have special circumstances or need assistance.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button 
                    onClick={() => window.history.back()} 
                    variant="outline" 
                    className="flex-1 border-gray-300 hover:bg-gray-50"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Go Back
                  </Button>
                  
                  <Button 
                    onClick={() => window.location.href = '/'} 
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    Go Home
                  </Button>
                </div>
              </div>

              {/* Contact Information */}
              <div className="border-t pt-4">
                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-2">Need help or have questions?</p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm">
                    <button 
                      onClick={() => window.location.href = 'mailto:skoffice@barangay.gov.ph'}
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      Email SK Office
                    </button>
                    
                    <span className="hidden sm:block text-gray-300">•</span>
                    
                    <button 
                      onClick={() => window.location.href = 'tel:+639123456789'}
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      Call SK Office
                    </button>
                  </div>
                </div>
              </div>
          </CardContent>
        </Card>

          {/* Additional Help Section */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 mb-3">
              Looking for other available forms?
            </p>
            <Button 
              variant="ghost" 
              onClick={() => window.location.href = '/dashboard'}
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              Browse All Forms
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!form) {
    return null
  }

  return (
    <div>
      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
          <Card className="w-full max-w-sm sm:max-w-md shadow-2xl rounded-xl">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3 shadow-md">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <CardTitle className="text-lg">Form Submitted Successfully</CardTitle>
              <CardDescription className="text-sm">
                Thank you for your submission. We have received your application.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Submission ID */}
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-700">Reference Number</p>
                    <p className="text-sm font-mono font-semibold text-gray-900 break-all">
                      {submissionId?.startsWith('SK-') ? submissionId : `SK-${submissionId}`}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Submitted on {new Date().toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      const refNumber = submissionId?.startsWith('SK-') ? submissionId : `SK-${submissionId}`
                      navigator.clipboard.writeText(refNumber)
                    }}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors ml-2 flex-shrink-0"
                    title="Copy reference number"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <Button 
                  onClick={() => setShowSuccessModal(false)}
                  variant="outline" 
                  className="flex-1 text-sm"
                >
                  Close
                </Button>
                
                <Button 
                  onClick={() => {
                    setShowSuccessModal(false)
                    window.location.href = '/dashboard'
                  }}
                  className="flex-1 text-sm bg-sky-600 hover:bg-sky-700"
                >
                  View Forms
                </Button>
              </div>
            </CardContent>
          </Card>
                </div>
      )}

      {/* Error Modal */}
      {showErrorModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
          <Card className="w-full max-w-sm sm:max-w-md shadow-2xl rounded-xl">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-3 shadow-md">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.865-.833-2.635 0L4.179 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <CardTitle className="text-lg text-red-600">Submission Error</CardTitle>
              <CardDescription className="text-sm">
                {errorMessage}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Error Details */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-red-700 break-words">
                      {errorMessage}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Button */}
                <Button 
                  onClick={() => setShowErrorModal(false)}
                className="w-full text-sm"
                >
                Close
                </Button>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-sky-100">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            {/* SK Logo and Brand */}
            <div className="flex items-center justify-center mb-6">
              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 sm:h-16 sm:w-16 flex items-center justify-center">
                  <Image
                    src="/images/profiles/TULAYLOGO.png"
                    alt="SK Barangay Tulay Logo"
                    width={64}
                    height={64}
                    className="h-12 w-12 sm:h-16 sm:w-16 object-contain drop-shadow-md"
                  />
          </div>
                <div className="text-left">
                  <h1 className="text-lg sm:text-xl font-bold text-gray-900">SK Barangay Tulay</h1>
                  <p className="text-sm text-gray-600">Official Government Website</p>
                </div>
              </div>
            </div>
            
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-sky-100 border border-sky-200 mb-4 shadow-md">
              <span className="text-sky-700 text-sm font-medium">📋 Form Submission</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">{form.title}</h2>
            <div className="text-base text-gray-600 space-y-2">
            <div className="break-words">Event: {form.event.title} • Program: {form.event.program.title}</div>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {formatDateTime(form.event.dateTime)}
                </span>
              {form.submissionDeadline && (
                  <span className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Deadline: {formatDateTime(form.submissionDeadline)}
                  </span>
                )}
              </div>
            </div>
            </div>
          </div>
        </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="w-full">
          {/* Form Card */}
          <Card className="shadow-2xl border-0 rounded-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-sky-600 to-sky-700 text-white shadow-lg">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center shadow-md">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
                  <CardTitle className="text-xl">Application Form</CardTitle>
                  <CardDescription className="text-sky-100">
                    Please complete all required fields marked with *
                  </CardDescription>
            </div>
          </div>
            </CardHeader>
            
            <CardContent className="p-8 bg-white">
              <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Personal Information Section */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-4 pb-4 border-b border-gray-200">
                      <div className="w-8 h-8 bg-sky-100 rounded-full flex items-center justify-center shadow-md">
                        <svg className="w-4 h-4 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
                        <p className="text-sm text-gray-600">Please provide your details</p>
                    </div>
                  </div>
                  
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {form.fields.filter(field => field.type !== 'gcashReceipt').map((field) => (
                      <div key={field.id} className="group">
                        <Label 
                          htmlFor={field.name}
                            className="text-sm font-semibold text-gray-700 mb-3 block"
                        >
                          {field.label}
                          {field.required && <span className="text-red-500 ml-1">*</span>}
                        </Label>
                  
                        {field.type === 'textarea' ? (
                          <Textarea
                            id={field.name}
                            value={formData[field.name] || ''}
                            onChange={(e) => handleInputChange(field.name, e.target.value)}
                            placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                            required={field.required}
                              className="resize-none min-h-[120px] border-gray-300 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 rounded-lg text-sm transition-all duration-200 shadow-sm hover:shadow-md"
                          />
                        ) : field.type === 'select' ? (
                          <select
                            id={field.name}
                            value={formData[field.name] || ''}
                            onChange={(e) => handleInputChange(field.name, e.target.value)}
                            required={field.required}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 bg-white transition-all duration-200 shadow-sm hover:shadow-md"
                          >
                            <option value="">Select an option</option>
                            {field.options?.map((option, idx) => (
                              <option key={idx} value={option}>{option}</option>
                            ))}
                          </select>
                        ) : field.type === 'radio' ? (
                            <div className="space-y-3 p-6 bg-sky-50 rounded-lg border border-sky-200 shadow-md hover:shadow-lg transition-all duration-200">
                            {field.options?.map((option, idx) => (
                                <div key={idx} className="flex items-center space-x-3">
                                <input
                                  type="radio"
                                  id={`${field.name}-${idx}`}
                                  name={field.name}
                                  value={option}
                                  checked={formData[field.name] === option}
                                  onChange={(e) => handleInputChange(field.name, e.target.value)}
                                  required={field.required}
                                    className="w-4 h-4 text-sky-600 border-gray-300 focus:ring-sky-500"
                                />
                                  <Label htmlFor={`${field.name}-${idx}`} className="text-sm font-medium text-gray-700 cursor-pointer">
                                  {option}
                                </Label>
                              </div>
                            ))}
                          </div>
                        ) : field.type === 'checkbox' ? (
                            <div className="space-y-3 p-6 bg-sky-50 rounded-lg border border-sky-200 shadow-md hover:shadow-lg transition-all duration-200">
                            {field.options?.map((option, idx) => (
                                <div key={idx} className="flex items-center space-x-3">
                                <input
                                  type="checkbox"
                                  id={`${field.name}-${idx}`}
                                  value={option}
                                  checked={(formData[field.name] || []).includes(option)}
                                  onChange={(e) => {
                                    const currentValues = formData[field.name] || []
                                    if (e.target.checked) {
                                      handleInputChange(field.name, [...currentValues, option])
                                    } else {
                                      handleInputChange(field.name, currentValues.filter((v: string) => v !== option))
                                    }
                                  }}
                                    className="w-4 h-4 text-sky-600 border-gray-300 rounded focus:ring-sky-500"
                                />
                                  <Label htmlFor={`${field.name}-${idx}`} className="text-sm font-medium text-gray-700 cursor-pointer">
                                  {option}
                                </Label>
                              </div>
                            ))}
                          </div>

                        ) : field.type === 'fileUpload' ? (
                            <div className="bg-sky-50 p-6 rounded-lg border border-sky-200 shadow-md hover:shadow-lg transition-all duration-200">
                            <div className="relative">
                              <input
                                type="file"
                                id={field.name}
                                accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
                                onChange={(e) => {
                                  const file = e.target.files?.[0]
                                  if (file) {
                                    handleInputChange(field.name, file)
                                  }
                                }}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                required={field.required}
                              />
                                <div className="p-8 border border-dashed border-gray-300 rounded-lg bg-white text-center hover:border-sky-400 transition-all duration-200 shadow-sm hover:shadow-md">
                                  <div className="flex flex-col items-center gap-4">
                                    <div className="w-12 h-12 bg-sky-100 rounded-full flex items-center justify-center shadow-md">
                                      <svg className="w-6 h-6 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                    </svg>
                                  </div>
                                  <div>
                                      <p className="text-base font-medium text-gray-800">
                                      {formData[field.name] instanceof File 
                                        ? `Selected: ${(formData[field.name] as File).name}`
                                        : 'Click to upload file'
                                      }
                                    </p>
                                      <p className="text-sm text-gray-600">
                                      PDF, DOC, TXT, PNG, JPG (5MB max)
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                            {formData[field.name] instanceof File && (
                                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg shadow-md">
                                  <div className="flex items-center gap-3">
                                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                    <span className="text-sm font-medium text-green-800">
                                    {(formData[field.name] as File).name}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        ) : field.type === 'signature' ? (
                            <div className="bg-sky-50 p-6 rounded-lg border border-sky-200 shadow-md hover:shadow-lg transition-all duration-200">
                              <div className="bg-white border border-dashed border-gray-300 rounded-lg p-8 text-center min-h-[140px] flex flex-col items-center justify-center hover:border-sky-400 transition-all duration-200 shadow-sm hover:shadow-md">
                                <div className="w-12 h-12 bg-sky-100 rounded-full flex items-center justify-center mb-4 shadow-md">
                                  <svg className="w-6 h-6 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                              </div>
                                <h4 className="text-base font-medium text-gray-800 mb-3">Digital Signature</h4>
                              <div className="w-full">
                                <input
                                  type="file"
                                  id={`${field.name}_signature`}
                                  accept="image/*"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0]
                                    if (file) {
                                      handleInputChange(field.name, file)
                                    }
                                  }}
                                  className="hidden"
                                  required={field.required}
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                    className="w-full shadow-sm hover:shadow-md"
                                  onClick={() => {
                                    const input = document.getElementById(`${field.name}_signature`) as HTMLInputElement
                                    input?.click()
                                  }}
                                >
                                  Upload Signature
                                </Button>
                              </div>
                                <p className="text-sm text-gray-500 mt-3">
                                PNG, JPG, JPEG files only
                              </p>
                            </div>
                            {formData[field.name] instanceof File && (
                                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg shadow-md">
                                  <div className="flex items-center gap-3">
                                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                    <span className="text-sm font-medium text-green-800">
                                    {(formData[field.name] as File).name}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        ) : field.type === 'paragraph' ? (
                            <div className="p-6 bg-sky-50 rounded-lg border border-sky-200 shadow-md hover:shadow-lg transition-all duration-200">
                            <div className="prose prose-sm max-w-none">
                              <p className="text-gray-700 mb-0">
                                {field.placeholder || 'This is an informational paragraph.'}
                              </p>
                            </div>
                          </div>
                        ) : field.type === 'consent' ? (
                            <div className="space-y-4 p-6 bg-sky-50 rounded-lg border border-sky-200 shadow-md hover:shadow-lg transition-all duration-200">
                              <div className="flex items-start space-x-4">
                              <input
                                type="checkbox"
                                id={field.name}
                                checked={formData[field.name] || false}
                                onChange={(e) => handleInputChange(field.name, e.target.checked)}
                                required={field.required}
                                  className="w-5 h-5 text-sky-600 border-gray-300 rounded focus:ring-sky-500 focus:ring-2 mt-1"
                              />
                              <Label htmlFor={field.name} className="text-sm font-medium text-gray-700 cursor-pointer leading-relaxed">
                                {field.placeholder || 'I agree to the terms and conditions'}
                              </Label>
                            </div>
                          </div>
                        ) : field.type === 'rating' ? (
                            <div className="space-y-4">
                              <div className="flex items-center gap-3">
                              {[1, 2, 3, 4, 5].map((rating) => (
                                <button
                                  key={rating}
                                  type="button"
                                  onClick={() => handleInputChange(field.name, rating)}
                                    className={`w-12 h-12 rounded-full border-2 transition-all duration-200 shadow-md hover:shadow-lg ${
                                    (formData[field.name] || 0) >= rating
                                      ? 'bg-yellow-400 border-yellow-400 text-white'
                                      : 'border-gray-300 hover:border-yellow-400'
                                  }`}
                                >
                                    <svg className="w-6 h-6 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                </button>
                              ))}
                            </div>
                            <p className="text-sm text-gray-600">
                              {formData[field.name] ? `${formData[field.name]} out of 5 stars` : 'Select a rating'}
                            </p>
                          </div>
                        ) : field.type === 'scale' ? (
                            <div className="space-y-6">
                            <div className="flex items-center justify-between text-sm text-gray-600">
                              <span>{field.min || 1}</span>
                              <span>{field.max || 10}</span>
                            </div>
                            <input
                              type="range"
                              id={field.name}
                              min={field.min || 1}
                              max={field.max || 10}
                              value={formData[field.name] || field.min || 1}
                              onChange={(e) => handleInputChange(field.name, parseInt(e.target.value))}
                                className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                              style={{
                                  background: `linear-gradient(to right, #0284c7 0%, #0284c7 ${((formData[field.name] || field.min || 1) - (field.min || 1)) / ((field.max || 10) - (field.min || 1)) * 100}%, #e2e8f0 ${((formData[field.name] || field.min || 1) - (field.min || 1)) / ((field.max || 10) - (field.min || 1)) * 100}%, #e2e8f0 100%)`
                              }}
                              required={field.required}
                            />
                            <div className="text-center">
                                <span className="inline-flex items-center px-6 py-3 rounded-full text-lg font-medium bg-sky-100 text-sky-800 shadow-md">
                                {formData[field.name] || field.min || 1}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <Input
                            type={field.type}
                            id={field.name}
                            value={formData[field.name] || ''}
                            onChange={(e) => handleInputChange(field.name, e.target.value)}
                            placeholder={field.placeholder || (field.type === 'date' ? 'dd/mm/yyyy' : `Enter ${field.label.toLowerCase()}`)}
                            required={field.required}
                            min={field.min}
                            max={field.max}
                              className="border-gray-300 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 rounded-lg text-sm h-12 transition-all duration-200 shadow-sm hover:shadow-md"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                  {/* Location Map Section - Only for Youth Registration */}
                  {form.title.toLowerCase().includes('youth registration') && (
                    <div className="mt-6 sm:mt-8 mb-4">
                      <Card className="shadow-2xl border-0 rounded-xl sm:rounded-2xl overflow-hidden">
                        <CardHeader className="bg-gradient-to-r from-sky-600 to-sky-700 text-white shadow-lg p-4 sm:p-6">
                          <CardTitle className="text-base sm:text-lg">📍 Location Pin</CardTitle>
                          <CardDescription className="text-sky-100 text-sm">
                            Click on the map to pin your exact location or use the search to find an address
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="p-4 sm:p-6 bg-white">
                          <div className="space-y-3 sm:space-y-4">
                            <div className="text-sm text-gray-600">
                              <p>Please select your location on the map below. This helps us better understand your area for program planning.</p>
                            </div>
                            
                            <div className="relative z-10">
                              <Map
                                latitude={selectedLatitude || undefined}
                                longitude={selectedLongitude || undefined}
                                onLocationSelect={handleLocationSelect}
                                className="w-full h-48 sm:h-56 md:h-64 lg:h-72 rounded-lg border border-gray-200 shadow-md"
                              />
                            </div>
                            
                            {selectedLatitude && selectedLongitude && (
                              <div className="p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg shadow-md">
                                <div className="flex items-center gap-2 sm:gap-3">
                                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                                  <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium text-green-800">Location Selected</p>
                                    <p className="text-xs text-green-600 break-all">
                                      {selectedLatitude.toFixed(6)}, {selectedLongitude.toFixed(6)}
                                    </p>
                      </div>
                      </div>
                    </div>
                            )}
                            
                            {!selectedLatitude && !selectedLongitude && (
                              <div className="p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg shadow-md">
                                <div className="flex items-center gap-2 sm:gap-3">
                                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium text-blue-800">Location Not Selected</p>
                                    <p className="text-xs text-blue-600">Click on the map above to select your location</p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                  
                  {/* Payment Information Section - Inside Form */}
                  {form.fields.filter(field => field.type === 'gcashReceipt').map((field) => (
                    <div key={field.id} className="space-y-6">
                      <div className="flex items-center gap-4 pb-4 border-b border-gray-200">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center shadow-md">
                          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">Payment Information</h3>
                          <p className="text-sm text-gray-600">Complete payment details and upload receipt</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label className="text-sm font-semibold text-gray-700">GCash Account Name</Label>
                          <Input
                            value={formData[`${field.name}_accountName`] || ''}
                            onChange={(e) => handleInputChange(`${field.name}_accountName`, e.target.value)}
                            placeholder="Enter GCash account name"
                            required={field.required}
                            className="border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 rounded-lg text-sm h-12 transition-all duration-200 shadow-sm hover:shadow-md"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-semibold text-gray-700">Transaction Reference Number</Label>
                          <Input
                            value={formData[`${field.name}_referenceNumber`] || ''}
                            onChange={(e) => handleInputChange(`${field.name}_referenceNumber`, e.target.value)}
                            placeholder="Enter transaction reference number"
                            required={field.required}
                            className="border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 rounded-lg text-sm h-12 transition-all duration-200 shadow-sm hover:shadow-md"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-gray-700">Payment Amount</Label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">₱</span>
                          <Input
                            type="number"
                            step="0.01"
                            value={formData[`${field.name}_amount`] || ''}
                            onChange={(e) => handleInputChange(`${field.name}_amount`, e.target.value)}
                            placeholder="0.00"
                            required={field.required}
                            className="border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 rounded-lg text-sm h-12 pl-10 transition-all duration-200 shadow-sm hover:shadow-md"
                          />
                        </div>
                      </div>
                      
                      {/* QR Code Display */}
                      {(field.qrCodeImage || form.qrCodeImage) && (
                        <div className="bg-green-50 p-6 rounded-lg border border-green-200 shadow-md hover:shadow-lg transition-all duration-200">
                          <div className="text-center">
                            <div className="bg-white p-4 rounded-lg border inline-block mb-6 shadow-md">
                              <img 
                                src={(field.qrCodeImage || form.qrCodeImage)!} 
                                alt="GCash QR Code" 
                                className="mx-auto h-36 w-36 object-contain cursor-pointer hover:scale-105 transition-transform"
                                style={{ imageRendering: 'crisp-edges' }}
                                onClick={() => {
                                  window.open((field.qrCodeImage || form.qrCodeImage)!, '_blank')
                                }}
                              />
                            </div>
                            <div className="space-y-4">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="w-full bg-white hover:bg-green-50 border-green-200 text-green-700 hover:text-green-800 shadow-sm hover:shadow-md"
                                onClick={() => {
                                  window.open((field.qrCodeImage || form.qrCodeImage)!, '_blank')
                                }}
                              >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                View Full Size
                              </Button>
                              
                              <div className="bg-white p-4 rounded-lg border border-green-200 shadow-md">
                                <div className="flex items-center gap-3 mb-3">
                                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                  </svg>
                                  <p className="text-sm font-semibold text-green-800">
                                    Scan with GCash App
                                  </p>
                                </div>
                                <p className="text-sm text-gray-600">
                                  Open your GCash app and scan this QR code to make the payment
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Payment Receipt Upload */}
                      <div className="space-y-4">
                        <Label className="text-sm font-semibold text-gray-700">Upload Payment Receipt</Label>
                        
                        <div className="relative">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (file) {
                                handleInputChange(`${field.name}_receipt`, file)
                              }
                            }}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            required={field.required}
                            id={`receipt-upload-${field.name}`}
                          />
                          <div 
                            className="p-8 border border-dashed border-green-300 rounded-lg bg-white text-center hover:border-green-400 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md"
                            onClick={() => document.getElementById(`receipt-upload-${field.name}`)?.click()}
                          >
                            {formData[`${field.name}_receipt`] ? (
                              <div className="flex flex-col items-center gap-4">
                                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center shadow-md">
                                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                </div>
                                <div>
                                  <p className="text-base font-medium text-green-800 mb-2">
                                    ✓ Receipt uploaded successfully
                                  </p>
                                  <p className="text-sm text-green-600">
                                    {formData[`${field.name}_receipt`] instanceof File ? formData[`${field.name}_receipt`].name : 'File selected'}
                                  </p>
                                  <button
                                    type="button"
                                    onClick={() => handleInputChange(`${field.name}_receipt`, null)}
                                    className="mt-3 text-sm text-red-600 hover:text-red-800 underline"
                                  >
                                    Remove file
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center gap-4">
                                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center shadow-md">
                                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                  </svg>
                                </div>
                                <div>
                                  <p className="text-base font-medium text-green-800 mb-2">
                                    Click to upload receipt image
                                  </p>
                                  <p className="text-sm text-green-600">
                                    PNG, JPG, JPEG • Max 5MB
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="p-4 bg-green-50 rounded-lg border border-green-200 shadow-md">
                          <div className="flex items-start gap-3">
                            <svg className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-sm text-green-700">
                              <strong>Tip:</strong> Make sure the receipt shows the transaction reference number, amount, and date clearly.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </form>
                
                {/* Submit Button - Centered Underneath Form */}
                <div className="mt-12 pt-8 border-t border-gray-200">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-4">
                      Please review all information before submitting
                    </p>
                    <Button 
                      type="submit" 
                      className="px-8 py-3 text-base font-semibold bg-sky-600 hover:bg-sky-700 text-white transition-all duration-200 shadow-xl hover:shadow-2xl rounded-lg" 
                      disabled={isSubmitting}
                      onClick={handleSubmit}
                    >
                      {isSubmitting ? (
                        <div className="flex items-center gap-2">
                          <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Submitting...</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                          </svg>
                          <span>Submit Application</span>
                        </div>
                      )}
                    </Button>
                    <p className="text-xs text-gray-500 mt-4">
                      By submitting this form, you agree to our terms and conditions
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}