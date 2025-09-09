"use client"

import { 
  Trophy, 
  Users, 
  Calendar, 
  Target, 
  Heart, 
  BookOpen, 
  TreePine, 
  ChevronRight,
  ArrowRight,
  Star,
  Clock,
  MapPin,
  Info,
  Award,
  Shield,
  CheckCircle,
  Loader2
} from 'lucide-react'
import { useState, useEffect } from 'react'

import Footer from '@/components/layout/footer'
import Header from '@/components/layout/header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

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
  events: any[]
  // Enhanced schedule fields
  schedule_type?: 'ONE_TIME' | 'RECURRING'
  start_time?: string
  end_time?: string
  frequency?: 'DAILY' | 'WEEKLY' | 'BI_WEEKLY' | 'MONTHLY' | 'CUSTOM'
  frequency_interval?: number
  days_of_week?: string
  timezone?: string
  schedule_exceptions?: string
}

const getCategoryIcon = (category?: string) => {
  switch (category?.toLowerCase()) {
    case 'leadership':
      return <Trophy className="h-6 w-6 sm:h-8 sm:w-8" />
    case 'environment':
      return <TreePine className="h-6 w-6 sm:h-8 sm:w-8" />
    case 'education':
      return <BookOpen className="h-6 w-6 sm:h-8 sm:w-8" />
    case 'sports':
      return <Target className="h-6 w-6 sm:h-8 sm:w-8" />
    case 'technology':
      return <Shield className="h-6 w-6 sm:h-8 sm:w-8" />
    case 'community':
      return <Heart className="h-6 w-6 sm:h-8 sm:w-8" />
    case 'health':
      return <Award className="h-6 w-6 sm:h-8 sm:w-8" />
    case 'arts':
      return <Star className="h-6 w-6 sm:h-8 sm:w-8" />
    default:
      return <Trophy className="h-6 w-6 sm:h-8 sm:w-8" />
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const getDuration = (startDate: string, endDate: string) => {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const diffTime = Math.abs(end.getTime() - start.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays <= 30) return `${diffDays} days`
  if (diffDays <= 90) return `${Math.floor(diffDays / 30)} months`
  return `${Math.floor(diffDays / 365)} years`
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

// Helper function to format schedule display with readable time
const formatScheduleDisplay = (program: Program): string => {
  if (program.start_time && program.end_time) {
    const scheduleType = program.schedule_type || 'RECURRING'
    const frequency = program.frequency || 'WEEKLY'
    const daysOfWeek = program.days_of_week ? JSON.parse(program.days_of_week || '[]') : ['MONDAY']
    
    if (scheduleType === 'ONE_TIME') {
      return `One-time event on ${formatDate(program.startDate)} from ${formatTimeReadable(program.start_time)} to ${formatTimeReadable(program.end_time)}`
    }

    const dayLabels = daysOfWeek.map((day: string) => {
      const dayLabelsMap: { [key: string]: string } = {
        'MONDAY': 'Mon', 'TUESDAY': 'Tue', 'WEDNESDAY': 'Wed', 'THURSDAY': 'Thu',
        'FRIDAY': 'Fri', 'SATURDAY': 'Sat', 'SUNDAY': 'Sun'
      }
      return dayLabelsMap[day] || day
    })

    if (dayLabels.length === 0) return 'No schedule configured'

    const frequencyText = frequency === 'CUSTOM' 
      ? 'Custom schedule'
      : `${frequency.charAt(0) + frequency.slice(1).toLowerCase()} on ${dayLabels.join(', ')}`

    return `${frequencyText} from ${formatTimeReadable(program.start_time)} to ${formatTimeReadable(program.end_time)}`
  }
  
  return program.schedule || 'Schedule to be determined'
}

export default function ProgramsPage() {
  const [programs, setPrograms] = useState<Program[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('All Programs')
  const [categories, setCategories] = useState<{ name: string; count: number; active: boolean }[]>([])

  // Ensure programs is always an array with explicit typing
  const programsArray: Program[] = Array.isArray(programs) ? programs : []

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const response = await fetch('/api/programs')
        if (response.ok) {
          const data = await response.json()
          console.log('API Response:', data)
          setPrograms(data.programs || [])
          
          // Generate categories from data
          const programsData = data.programs || []
          const categoryCounts: { [key: string]: number } = {}
          programsData.forEach((program: Program) => {
            if (program.category) {
              categoryCounts[program.category] = (categoryCounts[program.category] || 0) + 1
            }
          })
          
          const categoryList = [
            { name: 'All Programs', count: programsData.length, active: true },
            ...Object.entries(categoryCounts).map(([name, count]) => ({
              name,
              count,
              active: false
            }))
          ]
          setCategories(categoryList)
        }
      } catch (error) {
        console.error('Error fetching programs:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPrograms()
  }, [])

  const filteredPrograms = selectedCategory === 'All Programs' 
    ? programsArray 
    : programsArray.filter(program => program.category === selectedCategory)

  const activePrograms = programsArray.filter(p => p.status === 'ONGOING').length
  const totalPrograms = programsArray.length
  const uniqueCategories = new Set(programsArray.map(p => p.category).filter(Boolean)).size

  const stats = [
    { label: 'Active Programs', value: `${activePrograms}+`, icon: <Trophy className="h-5 w-5 sm:h-6 sm:w-6" /> },
    { label: 'Total Programs', value: `${totalPrograms}+`, icon: <Users className="h-5 w-5 sm:h-6 sm:w-6" /> },
    { label: 'Categories', value: `${uniqueCategories}+`, icon: <Calendar className="h-5 w-5 sm:h-6 sm:w-6" /> },
    { label: 'Success Rate', value: '95%', icon: <Target className="h-5 w-5 sm:h-6 sm:w-6" /> }
  ]

  const handleCategoryFilter = (categoryName: string) => {
    setSelectedCategory(categoryName)
    setCategories(prev => prev.map(cat => ({
      ...cat,
      active: cat.name === categoryName
    })))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header currentPage="/programs" />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-sky-600" />
            <p className="text-gray-600">Loading programs...</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header currentPage="/programs" />

      {/* Hero Banner Section */}
      <section className="relative bg-gradient-to-br from-sky-600 via-sky-700 to-sky-800 py-12 sm:py-16 lg:py-20 overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
          style={{
            backgroundImage: `url('/images/profiles/ana-reyes.jpg')`
          }}
        ></div>
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-sky-900/50 to-sky-800/50"></div>
        
        <div className="relative max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="text-center max-w-4xl mx-auto pt-16 sm:pt-20 lg:pt-24">

            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 text-white leading-tight">
              Community Development
              <span className="block text-sky-200">Programs & Services</span>
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-sky-100 max-w-3xl mx-auto mb-6 sm:mb-8 leading-relaxed px-2">
              Discover our comprehensive range of official government programs and initiatives 
              designed to serve the community and develop youth leadership in accordance with 
              local government regulations and community needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
              <Button 
                className="bg-white text-sky-600 hover:bg-sky-50 font-semibold px-4 py-2.5 sm:px-6 sm:py-3 text-sm shadow-lg transition-all duration-300 hover:shadow-xl focus:ring-4 focus:ring-white/20 w-full sm:w-auto rounded-lg" 
                asChild
              >
                <a href="/forms/cmdwjcxro0003piol3b572m7p">
                  Register as Youth
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
              <Button 
                className="bg-sky-600 hover:bg-sky-700 text-white border border-sky-300 font-semibold px-4 py-2.5 sm:px-6 sm:py-3 text-sm transition-all duration-300 hover:shadow-xl focus:ring-4 focus:ring-sky-200 w-full sm:w-auto rounded-lg" 
                asChild
              >
                <a href="/contact">
                  Contact Office
                  <ChevronRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-8 sm:py-12 lg:py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 text-gray-900">Program Impact</h2>
            <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto px-2">
              Our commitment to public service and community development through official government programs.
            </p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {stats.map((stat, index) => (
              <Card key={index} className="text-center border border-gray-200 shadow-sm">
                <CardContent className="pt-4 sm:pt-6 pb-4 sm:pb-6 px-2 sm:px-4">
                  <div className="flex justify-center mb-3 sm:mb-4 text-sky-600">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-sky-100 rounded-lg flex items-center justify-center">
                      <div className="text-sky-600">
                        {stat.icon}
                      </div>
                    </div>
                  </div>
                  <h3 className="text-lg sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">{stat.value}</h3>
                  <p className="text-gray-600 font-medium text-xs sm:text-sm leading-tight">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Programs Section */}
      <section className="py-8 sm:py-12 lg:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 text-gray-900">Available Programs</h2>
            <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto px-2">
              Official government programs and initiatives designed to serve the community and develop youth leadership.
            </p>
          </div>
          
          {/* Category Filters */}
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-8 sm:mb-12">
            {categories.map((category, index) => (
              <Button
                key={index}
                variant={category.active ? "default" : "outline"}
                size="sm"
                className={`text-xs sm:text-sm ${
                  category.active 
                    ? 'bg-sky-600 hover:bg-sky-700 text-white' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => handleCategoryFilter(category.name)}
              >
                {category.name}
                <Badge variant="secondary" className="ml-2 text-xs">
                  {category.count}
                </Badge>
              </Button>
            ))}
          </div>

          {filteredPrograms.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">No programs found for the selected category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {filteredPrograms.map((program) => (
                <Card key={program.id} className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3 sm:pb-4">
                    <div className="flex items-start space-x-3 sm:space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-sky-100 rounded-lg flex items-center justify-center">
                          <div className="text-sky-600">
                            {getCategoryIcon(program.category)}
                          </div>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 sm:gap-3 mb-2">
                          <Badge variant="secondary" className={`text-xs ${
                            program.status === 'ONGOING' ? 'bg-green-100 text-green-800' :
                            program.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {program.status}
                          </Badge>
                          {program.category && (
                            <Badge variant="outline" className="text-xs">
                              {program.category}
                            </Badge>
                          )}
                        </div>
                        <CardTitle className="text-base sm:text-lg mb-2 text-gray-900 leading-tight">{program.title}</CardTitle>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600">
                          <span className="flex items-center">
                            <Users className="h-3 w-3 mr-1" />
                            {program.events.length} events
                          </span>
                          <span className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {getDuration(program.startDate, program.endDate)}
                          </span>
                          {program.venue && (
                            <span className="flex items-center">
                              <MapPin className="h-3 w-3 mr-1" />
                              {program.venue}
                            </span>
                          )}
                        </div>
                        
                                                 {/* Brief Schedule Preview */}
                         {program.start_time && program.end_time && (
                           <div className="mt-2 text-xs text-gray-500">
                             <span className="font-medium">📅 </span>
                             {formatScheduleDisplay(program)}
                           </div>
                         )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="px-4 sm:px-6">
                    <p className="text-sm sm:text-base text-gray-600 leading-relaxed mb-4">{program.objectives}</p>
                    
                    <div className="space-y-3 sm:space-y-4 mb-4">
                      <div>
                        <h4 className="text-xs sm:text-sm font-semibold text-gray-900 mb-1">Schedule:</h4>
                        <div className="space-y-2">
                          {/* Enhanced Schedule Display */}
                          {program.start_time && program.end_time ? (
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Clock className="h-3 w-3 text-gray-500" />
                                <span className="text-xs sm:text-sm text-gray-600 font-medium">
                                  {formatScheduleDisplay(program)}
                                </span>
                              </div>
                              
                              
                              
                              {/* Show original schedule text if different from structured data */}
                              {program.schedule && program.schedule.trim() && (
                                <p className="text-xs text-gray-500/80 border-t pt-2">
                                  <span className="font-medium">Additional Info:</span> {program.schedule}
                                </p>
                              )}
                            </div>
                          ) : (
                            /* Fallback to original schedule text */
                            <p className="text-xs sm:text-sm text-gray-600">{program.schedule || 'Schedule to be determined'}</p>
                          )}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-semibold text-gray-900 mb-1">Target Audience:</h4>
                        <p className="text-xs sm:text-sm text-gray-600">{program.targetAudience}</p>
                      </div>
                    </div>

                    {program.benefits && (
                      <div className="mb-4">
                        <h4 className="text-xs sm:text-sm font-semibold text-gray-900 mb-2">Benefits:</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-2">
                          {program.benefits.split('\n').filter(benefit => benefit.trim()).map((benefit, index) => (
                            <div key={index} className="flex items-center text-xs sm:text-sm text-gray-600">
                              <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 mr-1.5 sm:mr-2 flex-shrink-0" />
                              <span className="truncate">{benefit.replace('• ', '')}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <Button 
                      className="bg-sky-600 hover:bg-sky-700 text-white font-medium transition-colors focus:ring-4 focus:ring-sky-200 text-sm sm:text-base w-full sm:w-auto" 
                      asChild
                    >
                      <a href="/contact">
                        Apply Now
                        <ChevronRight className="ml-2 h-3 w-3 sm:h-4 sm:w-4" />
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-8 sm:py-12 lg:py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 text-center">
          <div className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 bg-sky-50 rounded-md text-sky-700 text-xs sm:text-sm font-medium mb-4 sm:mb-6 border border-sky-200">
            <Info className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
            Join Our Programs
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6 text-gray-900">Ready to Get Started?</h2>
          <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8 max-w-2xl mx-auto px-2 leading-relaxed">
            Join our official government programs and become part of the youth development 
            initiatives in Barangay Tulay. Contact our office for registration details.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
            <Button 
              className="bg-sky-600 hover:bg-sky-700 text-white font-medium px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base shadow-sm transition-colors focus:ring-4 focus:ring-sky-200 w-full sm:w-auto" 
              asChild
            >
              <a href="/contact">
                Contact Office
                <ArrowRight className="ml-2 h-3 w-3 sm:h-4 sm:w-4" />
              </a>
            </Button>
            <Button 
              className="bg-white text-sky-600 border border-sky-300 hover:bg-sky-50 font-medium px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base transition-colors focus:ring-4 focus:ring-sky-200 w-full sm:w-auto" 
              asChild
            >
              <a href="/forms/cmdwjcxro0003piol3b572m7p">
                Register as Youth
                <ChevronRight className="ml-2 h-3 w-3 sm:h-4 sm:w-4" />
              </a>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
} 