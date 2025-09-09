"use client"

import React from 'react'
import { 
  Users, 
  Calendar, 
  Target, 
  Heart, 
  BookOpen, 
  TreePine, 
  Trophy, 
  ChevronRight, 
  ArrowRight,
  Star,
  Clock,
  MapPin, 
  Phone, 
  Mail, 
  User,
  Award,
  Activity,
  FileText,
  Info,
  Megaphone,
  Search,
  Eye,
  Download,
  X,
  AlertCircle
} from 'lucide-react'
import { useState, useEffect, useRef } from 'react'

import Footer from '@/components/layout/footer'
import Header from '@/components/layout/header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

// Animation types and their corresponding classes - defined outside component to prevent recreation
const animationTypes = [
  { type: 'fade-up', class: 'animate-fade-up', initial: 'opacity-0 translate-y-8' },
  { type: 'fade-down', class: 'animate-fade-down', initial: 'opacity-0 -translate-y-8' },
  { type: 'slide-left', class: 'animate-slide-left', initial: 'opacity-0 -translate-x-8' },
  { type: 'slide-right', class: 'animate-slide-right', initial: 'opacity-0 translate-x-8' }
]

interface ContentItem {
  id: string
  title: string
  description: string
  type: string
  status: string
  featured: boolean
  thumbnail?: string
  fileUrls?: string | string[] | null // JSON string or parsed array of multiple file URLs
  thumbnailMode?: string // SINGLE or MULTIPLE
  selectedThumbnails?: string | string[] | null // JSON string or parsed array of selected thumbnail URLs
  tags?: string
  author?: {
    name: string
  }
  createdAt: string
}

interface SKMember {
  id: string
  name: string
  email: string
  phone: string
  role: string
  status: string
  department: string
  position: string
  location: string
  skills: string[]
  profileImage?: string
  performance: number
  projects: number
  achievements: number
  lastActive: string
  avatar: string
}

export default function HomePage() {
  const [publishedContent, setPublishedContent] = useState<ContentItem[]>([])
  const [isLoadingContent, setIsLoadingContent] = useState(true)
  const [skMembers, setSkMembers] = useState<SKMember[]>([])
  const [isLoadingMembers, setIsLoadingMembers] = useState(true)
  const [programs, setPrograms] = useState<any[]>([])
  const [isLoadingPrograms, setIsLoadingPrograms] = useState(true)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [currentOfficerSlide, setCurrentOfficerSlide] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)
  
  // Submission tracking states
  const [referenceCode, setReferenceCode] = useState('')
  const [isTracking, setIsTracking] = useState(false)
  const [showTrackingModal, setShowTrackingModal] = useState(false)
  const [trackingResult, setTrackingResult] = useState<any>(null)
  const [trackingError, setTrackingError] = useState<string | null>(null)

  // Constants
  const BANNER_IMAGES = [
    {
      src: '/images/Banner1.jpg',
      alt: 'SK Barangay Tulay Youth Council',
      title: 'SK Barangay Tulay',
      subtitle: 'Youth Council'
    },
    {
      src: '/images/Banner2.jpg',
      alt: 'Official Government Logo',
      title: 'Official Government',
      subtitle: 'Youth Services'
    },
    {
      src: '/images/Banner3.jpg',
      alt: 'Community Service',
      title: 'Community Service',
      subtitle: 'Youth Development'
    }
  ] as const



  const SERVICES = [
    {
      title: 'Youth Registration',
      description: 'Official government registration for youth members aged 15-30.',
      icon: User
    },
    {
      title: 'Community Programs',
      description: 'Access to official government community development programs.',
      icon: Target
    },
    {
      title: 'Public Information',
      description: 'Official government announcements and community updates.',
      icon: FileText
    },
    {
      title: 'Contact Office',
      description: 'Direct contact with government officials for inquiries.',
      icon: Phone
    }
  ] as const

  // Auto-advance slides
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % BANNER_IMAGES.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [BANNER_IMAGES.length])

  // Auto-advance officer slides
  useEffect(() => {
    if (skMembers.length === 0) return
    
    const interval = setInterval(() => {
      setCurrentOfficerSlide((prev) => (prev + 1) % Math.ceil(skMembers.length / 3))
    }, 4000)

    return () => clearInterval(interval)
  }, [skMembers.length])

  // Manual slide navigation
  const goToSlide = (index: number) => {
    setCurrentSlide(index)
  }

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % BANNER_IMAGES.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + BANNER_IMAGES.length) % BANNER_IMAGES.length)
  }

  // Officer carousel navigation
  const goToOfficerSlide = (index: number) => {
    setCurrentOfficerSlide(index)
  }

  const nextOfficerSlide = () => {
    const itemsPerSlide = isMobile ? 1 : isTablet ? 2 : 3
    const maxSlides = Math.ceil(skMembers.length / itemsPerSlide)
    // Next slide clicked
    setCurrentOfficerSlide((prev) => {
      const next = prev + 1
      return next >= maxSlides ? 0 : next
    })
  }

  const prevOfficerSlide = () => {
    const itemsPerSlide = isMobile ? 1 : isTablet ? 2 : 3
    const maxSlides = Math.ceil(skMembers.length / itemsPerSlide)
    // Previous slide clicked
    setCurrentOfficerSlide((prev) => {
      const next = prev - 1
      return next < 0 ? maxSlides - 1 : next
    })
  }

  // Refs for scroll animations
  const heroRef = useRef<HTMLElement>(null)
  const servicesRef = useRef<HTMLElement>(null)
  const aboutRef = useRef<HTMLElement>(null)
  const programsRef = useRef<HTMLElement>(null)
  const officersRef = useRef<HTMLElement>(null)
  const announcementsRef = useRef<HTMLElement>(null)
  const contactRef = useRef<HTMLElement>(null)

  // Random animation state for each section
  const [sectionAnimations, setSectionAnimations] = useState<{[key: string]: {type: string, class: string, initial: string}}>({})

  // Generate random animations on component mount - only run once
  useEffect(() => {
    const sections = ['hero', 'services', 'about', 'programs', 'officers', 'announcements', 'contact']
    const animations: {[key: string]: {type: string, class: string, initial: string}} = {}
    
    sections.forEach(section => {
      const randomAnimation = animationTypes[Math.floor(Math.random() * animationTypes.length)]
      if (randomAnimation) {
        animations[section] = randomAnimation
      }
    })
    
    setSectionAnimations(animations)
  }, []) // Empty dependency array to run only once

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
        return <Trophy className="h-6 w-6 sm:h-8 sm:w-8" />
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

  const getDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays <= 30) return `${diffDays} Days`
    if (diffDays <= 90) return `${Math.floor(diffDays / 30)} Months`
    return `${Math.floor(diffDays / 365)} Years`
  }

  // Helper function to get the best image for content display
  const getContentImage = (content: ContentItem): string | null => {
    // Getting image for content
    
    // First priority: selectedThumbnails (if any)
    if (content.selectedThumbnails) {
      const selectedThumbnails = Array.isArray(content.selectedThumbnails) ? content.selectedThumbnails : 
        (typeof content.selectedThumbnails === 'string' && content.selectedThumbnails.trim() !== '' && content.selectedThumbnails !== '[]' ? JSON.parse(content.selectedThumbnails) : [])
      
      if (selectedThumbnails.length > 0) {
        // Using selectedThumbnails
        return selectedThumbnails[0]
      }
    }
    
    // Second priority: fileUrls (if any)
    if (content.fileUrls) {
      const fileUrls = Array.isArray(content.fileUrls) ? content.fileUrls : 
        (typeof content.fileUrls === 'string' && content.fileUrls.trim() !== '' ? JSON.parse(content.fileUrls) : [])
      
      if (fileUrls.length > 0) {
        // Using fileUrls
        return fileUrls[0]
      }
    }
    
    // Third priority: thumbnail (legacy field)
    if (content.thumbnail) {
      // Using thumbnail
      return content.thumbnail
    }
    
    // No image found for content
    return null
  }



    // Scroll animation setup
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const element = entry.target as HTMLElement
          const sectionId = element.getAttribute('data-section')
          
          if (sectionId && sectionAnimations[sectionId]) {
            const animation = sectionAnimations[sectionId]
            element.classList.add(animation.class)
            element.classList.remove('opacity-0', ...animation.initial.split(' '))
          }
        }
      })
    }, observerOptions)

    // Observe all sections
    const sections = [
      heroRef.current,
      servicesRef.current,
      aboutRef.current,
      programsRef.current,
      officersRef.current,
      announcementsRef.current,
      contactRef.current
    ].filter(Boolean)

    sections.forEach((section) => {
      if (section) {
        observer.observe(section)
      }
    })
    
    return () => {
      sections.forEach((section) => {
        if (section) {
          observer.unobserve(section)
        }
      })
    }
  }, [sectionAnimations])

  useEffect(() => {
    fetchPublishedContent()
    fetchSKMembers()
    fetchPrograms()
    
    // Set responsive breakpoints
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640)
      setIsTablet(window.innerWidth >= 640 && window.innerWidth < 1024)
    }
    
    handleResize()
    window.addEventListener('resize', handleResize)
    
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const fetchPublishedContent = async () => {
    try {
      const response = await fetch('/api/content')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      // Fetched content data
      
      // Filter for published content and ensure proper data structure
      const published = data.filter((item: ContentItem) => item.status === 'PUBLISHED')
      // Published content
      
      // Sort by creation date (newest first) and take the first 3
      const sortedPublished = published.sort((a: ContentItem, b: ContentItem) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      
      // Sorted published content
      setPublishedContent(sortedPublished.slice(0, 3))
    } catch (error) {
      // Error fetching content
      setPublishedContent([])
    } finally {
      setIsLoadingContent(false)
    }
  }

  const fetchSKMembers = async () => {
    try {
      const response = await fetch('/api/sk-members')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
        const data = await response.json()
      // Fetched SK members
        setSkMembers(data)
    } catch (error) {
      // Error fetching SK members
      setSkMembers([])
    } finally {
      setIsLoadingMembers(false)
    }
  }

  const fetchPrograms = async () => {
    try {
      const response = await fetch('/api/programs')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
        const data = await response.json()
        const programsData = data.programs || []
        setPrograms(programsData.slice(0, 4))
    } catch (error) {
      // Error fetching programs
      setPrograms([])
    } finally {
      setIsLoadingPrograms(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Submission tracking function
  const handleTrackSubmission = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!referenceCode.trim()) {
      setTrackingError('Please enter a reference code')
      return
    }

    setIsTracking(true)
    setTrackingError(null)

    try {
      const response = await fetch('/api/submissions/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ referenceCode: referenceCode.trim() }),
      })

      if (response.ok) {
        const data = await response.json()
        setTrackingResult(data)
        setShowTrackingModal(true)
        setReferenceCode('')
      } else {
        const error = await response.json()
        setTrackingError(error.error || 'Failed to track submission')
      }
    } catch (error) {
      // Error tracking submission
      setTrackingError('Failed to track submission. Please try again.')
    } finally {
      setIsTracking(false)
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'REJECTED':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'PENDING':
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    }
  }

  const safeSlideIndex = ((currentSlide % BANNER_IMAGES.length) + BANNER_IMAGES.length) % BANNER_IMAGES.length
  const currentBanner = BANNER_IMAGES[safeSlideIndex]

  return (
    <main className="min-h-screen bg-gray-50 overflow-x-hidden pt-16">
      <Header currentPage="/" />

      {/* Hero Section */}
      <section 
        ref={heroRef}
        data-section="hero"
        className={`relative bg-gradient-to-br from-sky-50 via-sky-700 to-sky-800 min-h-[70vh] sm:min-h-screen pt-0 overflow-hidden transition-all duration-1000 ease-out ${
          sectionAnimations.hero ? sectionAnimations.hero.initial : 'opacity-0 translate-y-8'
        }`}
        style={{ marginTop: '-80px', paddingTop: '80px' }}
        aria-labelledby="hero-heading"
      >
        {/* Background Image Slider */}
        <div className="absolute inset-0 overflow-hidden">
          {BANNER_IMAGES.map((image, index) => (
          <div 
              key={index}
              className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000 ease-in-out ${
                index === currentSlide ? 'opacity-70' : 'opacity-0'
              }`}
            style={{
                backgroundImage: `url(${image.src})`
                }}
              />
            ))}
        </div>
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-sky-900/50 to-sky-800/50"></div>
        
        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm rounded-full p-2 sm:p-3 text-white hover:bg-white/30 transition-colors focus:ring-4 focus:ring-white/20 z-10"
          aria-label="Previous slide"
        >
          <ChevronRight className="h-4 w-4 sm:h-6 sm:w-6 rotate-180" />
        </button>
        
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm rounded-full p-2 sm:p-3 text-white hover:bg-white/30 transition-colors focus:ring-4 focus:ring-white/20 z-10"
          aria-label="Next slide"
        >
          <ChevronRight className="h-4 w-4 sm:h-6 sm:w-6" />
        </button>
        
        <div className="relative max-w-6xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 h-full flex items-center overflow-hidden">
          <div className="text-center max-w-4xl mx-auto w-full pt-16 sm:pt-20 md:pt-24 lg:pt-28 min-w-0">

            <div className="transition-all duration-1000 ease-in-out">
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold mb-3 sm:mb-4 md:mb-6 text-white leading-tight">
                {currentBanner?.title || 'SK Barangay Tulay'}
                <span className="block text-sky-200 mt-1 sm:mt-2">{currentBanner?.subtitle || 'Youth Council'}</span>
            </h1>
            </div>
            <p className="text-xs sm:text-sm md:text-base lg:text-lg text-sky-100 max-w-2xl sm:max-w-3xl mx-auto mb-4 sm:mb-6 md:mb-8 leading-relaxed px-2 sm:px-4">
              Official youth council serving the community of Barangay Tulay. 
              We provide public services, community programs, and youth development initiatives.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-3 sm:px-4 mb-6 sm:mb-8 md:mb-12">
              <Button 
                className="bg-white text-sky-600 hover:bg-sky-50 font-semibold px-4 py-2.5 sm:px-6 sm:py-3 text-xs sm:text-sm shadow-lg transition-all duration-300 hover:shadow-xl focus:ring-4 focus:ring-white/20 w-full sm:w-auto rounded-lg" 
                asChild
              >
                <a href="/auth/register">
                  Register as Youth
                  <ArrowRight className="ml-1.5 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
                </a>
              </Button>
              <Button 
                className="bg-sky-600 hover:bg-sky-700 text-white border border-sky-300 font-semibold px-4 py-2.5 sm:px-6 sm:py-3 text-xs sm:text-sm transition-all duration-300 hover:shadow-xl focus:ring-4 focus:ring-sky-200 w-full sm:w-auto rounded-lg" 
                asChild
              >
                <a href="/contact">
                  Contact Office
                  <ChevronRight className="ml-1.5 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
                </a>
              </Button>
            </div>
          </div>
        </div>
        
        {/* Slide Indicators */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
          {BANNER_IMAGES.map((_, index) => (
            <button
                key={index} 
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${
                index === currentSlide 
                  ? 'bg-white scale-125' 
                  : 'bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </section>

      {/* Floating Public Services Card */}
      <section 
        ref={servicesRef}
        data-section="services"
        className={`relative -mt-4 sm:-mt-6 md:-mt-8 lg:-mt-12 mb-4 sm:mb-6 md:mb-8 lg:mb-12 transition-all duration-1000 ease-out min-h-[250px] sm:min-h-[300px] ${
          sectionAnimations.services ? sectionAnimations.services.initial : 'opacity-0 -translate-x-8'
        }`}
        aria-labelledby="services-heading"
      >
        <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <Card className="bg-white border-0 shadow-xl rounded-xl sm:rounded-2xl overflow-hidden backdrop-blur-sm">
            <CardHeader className="text-center pb-3 sm:pb-4 pt-4 sm:pt-6 px-4 sm:px-6">
              <h2 id="services-heading" className="text-base sm:text-lg md:text-xl font-bold mb-2 text-gray-900">Public Services</h2>
              <p className="text-xs sm:text-sm text-gray-600 max-w-lg mx-auto">
                Access official government services and information for youth members and community residents.
              </p>
            </CardHeader>
            <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                {SERVICES.map((service, index) => {
                  const IconComponent = service.icon
                  return (
                  <div 
                    key={index} 
                      className="text-center group cursor-pointer transition-all duration-300 hover:scale-105 p-2 sm:p-3 rounded-lg hover:bg-gray-50" 
                    role="article"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-sky-100 rounded-lg flex items-center justify-center mx-auto mb-2 sm:mb-3 group-hover:bg-sky-200 transition-all duration-300 group-hover:scale-110 shadow-sm">
                      <div className="text-sky-600 group-hover:text-sky-700 transition-colors" aria-hidden="true">
                          <IconComponent className="h-4 w-4 sm:h-5 sm:w-5" />
                      </div>
                    </div>
                      <h3 className="font-semibold text-gray-900 text-xs sm:text-sm group-hover:text-sky-600 transition-colors">{service.title}</h3>
                  </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* About Section */}
      <section 
        ref={aboutRef}
        data-section="about"
        className={`py-6 sm:py-8 md:py-12 lg:py-16 bg-white transition-all duration-1000 ease-out min-h-[400px] sm:min-h-[450px] ${
          sectionAnimations.about ? sectionAnimations.about.initial : 'opacity-0 translate-x-8'
        }`}
        aria-labelledby="about-heading"
      >
        <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 h-full flex flex-col justify-center">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 md:gap-12 items-center">
            <div>
              <div className="inline-flex items-center px-2 py-1 sm:px-2.5 sm:py-1 md:px-3 md:py-1 bg-sky-50 rounded-md text-sky-700 text-xs sm:text-sm font-medium mb-3 sm:mb-4 md:mb-6 border border-sky-200" role="banner">
                <Award className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-1.5 md:mr-2" aria-hidden="true" />
                Established 2019
              </div>
              <h2 id="about-heading" className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold mb-3 sm:mb-4 text-gray-900">About SK Barangay Tulay</h2>
              <p className="text-xs sm:text-sm md:text-base text-gray-600 mb-3 sm:mb-4 leading-relaxed">
                  The Sangguniang Kabataan (SK) of Barangay Tulay is the official youth council 
                  representing young people aged 15-30 in our community. As a government body, 
                  we are committed to providing public services, fostering youth leadership, 
                  and implementing community development programs in accordance with local government regulations.
                </p>
              <p className="text-xs sm:text-sm md:text-base text-gray-600 mb-4 sm:mb-6 leading-relaxed">
                  Our mission is to serve the community through official government programs, 
                  youth empowerment initiatives, and public service activities that benefit 
                  all residents of Barangay Tulay.
                </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Button 
                  className="bg-sky-600 hover:bg-sky-700 text-white font-semibold px-4 py-2.5 sm:px-6 sm:py-3 text-xs sm:text-sm shadow-sm transition-colors focus:ring-4 focus:ring-sky-200 w-full sm:w-auto rounded-lg" 
                  asChild
                >
                  <a href="/about">
                    Learn More
                    <ChevronRight className="ml-1.5 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" aria-hidden="true" />
                  </a>
                </Button>
                <Button 
                  className="bg-white text-sky-600 border border-sky-300 hover:bg-sky-50 font-semibold px-4 py-2.5 sm:px-6 sm:py-3 text-xs sm:text-sm transition-colors focus:ring-4 focus:ring-sky-200 w-full sm:w-auto rounded-lg" 
                  asChild
                >
                  <a href="/contact">
                    Contact Us
                    <ChevronRight className="ml-1.5 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" aria-hidden="true" />
                  </a>
                </Button>
              </div>
            </div>
            <div className="relative group">
              <div className="relative overflow-hidden rounded-2xl shadow-xl border border-gray-200/50">
                <img
                  src="/images/tulay.jpg"
                  alt="SK Barangay Tulay Services - Community Service, Youth Leadership, Education, and Environment"
                  className="w-full h-64 sm:h-80 lg:h-96 object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.nextElementSibling?.classList.remove('hidden');
                  }}
                />
        
               
                    </div>
                  </div>
          </div>
        </div>
      </section>

      {/* Programs Section */}
      <section 
        ref={programsRef}
        data-section="programs"
        className={`py-6 sm:py-8 md:py-12 bg-gradient-to-br from-sky-100 via-sky-50 to-blue-100 transition-all duration-1000 ease-out min-h-[300px] sm:min-h-[350px] ${
          sectionAnimations.programs ? sectionAnimations.programs.initial : 'opacity-0 -translate-x-8'
        }`}
        aria-labelledby="programs-heading"
      >
        <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 h-full flex flex-col justify-center">
          <div className="text-center mb-4 sm:mb-6 md:mb-8">
            <div className="inline-flex items-center px-2 py-1 sm:px-3 sm:py-1.5 md:px-4 md:py-2 bg-sky-50 rounded-full text-sky-700 text-xs sm:text-sm font-medium mb-2 sm:mb-3 md:mb-4 border border-sky-200" role="banner">
              <Trophy className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-1.5 md:mr-2" aria-hidden="true" />
              Official Government Initiatives
            </div>
            <h2 id="programs-heading" className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3 md:mb-4 text-gray-900 bg-gradient-to-r from-gray-900 via-sky-800 to-sky-600 bg-clip-text text-transparent">
              Government Programs
            </h2>
            <p className="text-xs sm:text-sm md:text-base lg:text-lg text-gray-600 max-w-2xl sm:max-w-3xl mx-auto px-2 sm:px-4 leading-relaxed">
              Official government programs and initiatives designed to serve the community and develop youth leadership with excellence and dedication.
            </p>
          </div>
          
          {isLoadingPrograms ? (
            <div className="text-center py-12 sm:py-16" role="status" aria-live="polite">
              <div className="relative">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-sky-200 border-t-sky-600 mx-auto mb-6" aria-hidden="true"></div>
                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-sky-400 animate-ping" aria-hidden="true"></div>
              </div>
              <p className="text-sm sm:text-base text-gray-600 font-medium">Loading government programs...</p>
            </div>
          ) : programs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 overflow-hidden">
              {programs.map((program, index) => (
                <Card 
                  key={program.id || index} 
                  className="group border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 bg-white/60 backdrop-blur-md rounded-xl sm:rounded-2xl overflow-hidden relative focus-within:ring-4 focus-within:ring-sky-200 border border-white/20 min-w-0" 
                  role="article"
                  tabIndex={0}
                  aria-labelledby={`program-${program.id || index}`}
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <CardHeader className="pb-3 px-3 sm:px-4 md:px-6">
                    <div className="flex items-start space-x-2 sm:space-x-3 md:space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-gradient-to-br from-sky-100 to-blue-100 rounded-lg sm:rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-300">
                          <div className="text-sky-600 group-hover:text-sky-700 transition-colors" aria-hidden="true">
                            {getCategoryIcon(program.category)}
                          </div>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle 
                          id={`program-${program.id || index}`}
                          className="text-base sm:text-lg md:text-xl mb-2 text-gray-900 leading-tight group-hover:text-sky-800 transition-colors duration-300"
                        >
                          {program.title}
                        </CardTitle>
                        <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 md:gap-2 text-xs sm:text-sm">
                          <Badge variant="secondary" className={`text-xs font-semibold ${
                            program.status === 'ONGOING' ? 'bg-green-100 text-green-800 border-green-200' :
                            program.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                            'bg-red-100 text-red-800 border-red-200'
                          }`}>
                            {program.status}
                          </Badge>
                          <span className="flex items-center text-gray-600 bg-gray-50 px-1.5 sm:px-2 py-1 rounded-full text-xs">
                            <Users className="h-3 w-3 mr-1" aria-hidden="true" />
                            {program.events?.length || 0} events
                          </span>
                          <span className="flex items-center text-gray-600 bg-gray-50 px-1.5 sm:px-2 py-1 rounded-full text-xs">
                            <Clock className="h-3 w-3 mr-1" aria-hidden="true" />
                            {getDuration(program.startDate, program.endDate)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="px-3 sm:px-4 md:px-6 pb-3 sm:pb-4 md:pb-6">
                    <p className="text-xs sm:text-sm md:text-base text-gray-600 leading-relaxed mb-3 sm:mb-4 line-clamp-3">
                      {program.objectives}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-xs text-gray-500">
                        <Calendar className="h-3 w-3 mr-1" aria-hidden="true" />
                        <span>Government Initiative</span>
                      </div>
                    <Button 
                      className="bg-sky-600 hover:bg-sky-700 text-white font-semibold transition-all duration-300 focus:ring-4 focus:ring-sky-200 text-xs sm:text-sm shadow-sm hover:shadow-md rounded-lg" 
                      asChild
                    >
                           <a href="/programs" className="flex items-center" aria-label={`View details for ${program.title}`}>
                        View Details
                        <ChevronRight className="ml-1.5 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" aria-hidden="true" />
                      </a>
                    </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 sm:py-16">
                             <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-sky-100/80 to-blue-100/80 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg border border-white/30">
                 <Trophy className="h-8 w-8 sm:h-10 sm:w-10 text-sky-600" aria-hidden="true" />
               </div>
              <p className="text-sm sm:text-base text-gray-600 font-medium">No government programs available at the moment.</p>
            </div>
          )}
          
          <div className="text-center mt-8 sm:mt-12">
            <Button 
              className="bg-sky-600 hover:bg-sky-700 text-white font-semibold px-6 py-3 text-sm shadow-lg hover:shadow-xl transition-all duration-300 focus:ring-4 focus:ring-sky-200 rounded-lg" 
              asChild
            >
               <a href="/programs" className="flex items-center">
                 View All Government Programs
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Submission Tracking Section */}
      <section className="py-8 sm:py-12 lg:py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <div className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 bg-sky-50 rounded-full text-sky-700 text-xs sm:text-sm font-medium mb-4 sm:mb-6 border border-sky-200">
              <Search className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
              Track Your Submission
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 text-gray-900 bg-gradient-to-r from-gray-900 via-sky-800 to-sky-600 bg-clip-text text-transparent">
              Check Your Application Status
            </h2>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Enter your reference code to track the status of your form submission and view submission details.
            </p>
          </div>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-white via-sky-50/30 to-white backdrop-blur-md rounded-2xl overflow-hidden relative border border-sky-100/50">
            <CardContent className="p-6 sm:p-8">
              <form onSubmit={handleTrackSubmission} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="referenceCode" className="block text-sm font-semibold text-gray-700">
                    Reference Code
                  </label>
                  <div className="relative">
                    <input
                      id="referenceCode"
                      type="text"
                      placeholder="Enter your reference code (e.g., SK-abc123xyz)"
                      value={referenceCode}
                      onChange={(e) => setReferenceCode(e.target.value)}
                      className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:ring-4 focus:ring-sky-200 focus:border-sky-500 transition-all duration-200 bg-white/80 backdrop-blur-sm"
                    />
                    <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  </div>
                  <p className="text-xs text-gray-500">
                    Your reference code was provided after successful form submission. It starts with "SK-".
                  </p>
                </div>

                {trackingError && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                    <p className="text-sm text-red-700">{trackingError}</p>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={isTracking || !referenceCode.trim()}
                  className="w-full bg-sky-600 hover:bg-sky-700 text-white font-semibold py-3 text-sm shadow-lg hover:shadow-xl transition-all duration-300 focus:ring-4 focus:ring-sky-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isTracking ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                      Tracking...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      Track Submission
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="text-center">
                  <p className="text-xs text-gray-500 mb-3">Need help?</p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-sky-300 text-sky-600 hover:bg-sky-50 hover:border-sky-400 text-xs"
                      asChild
                    >
                      <a href="/contact">Contact Support</a>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-sky-300 text-sky-600 hover:bg-sky-50 hover:border-sky-400 text-xs"
                      asChild
                    >
                      <a href="/programs">View Programs</a>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* SK Officers Section */}
      <section 
        ref={officersRef}
        data-section="officers"
        className={`py-6 sm:py-8 lg:py-12 bg-sky-600 transition-all duration-1000 ease-out overflow-hidden min-h-[350px] ${
          sectionAnimations.officers ? sectionAnimations.officers.initial : 'opacity-0 translate-x-8'
        }`}
        aria-labelledby="officers-heading"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 overflow-hidden h-full flex flex-col justify-center">
          <div className="text-center mb-6 sm:mb-8 min-w-0">

            <h2 id="officers-heading" className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 text-white">
              Elected Youth Leaders
            </h2>
            <p className="text-sm sm:text-base lg:text-lg text-white/90 max-w-3xl mx-auto px-2 leading-relaxed">
              Dedicated young leaders elected by the community to serve in official government positions, driving positive change and fostering youth development with integrity and commitment.
            </p>
          </div>
          
          {isLoadingMembers ? (
            <div className="text-center py-12 sm:py-16" role="status" aria-live="polite">
              <div className="relative">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-sky-200 border-t-sky-600 mx-auto mb-6" aria-hidden="true"></div>
                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-sky-400 animate-ping" aria-hidden="true"></div>
              </div>
              <p className="text-sm sm:text-base text-gray-600 font-medium">Loading SK officials...</p>
            </div>
          ) : skMembers.length > 0 ? (
            <div className="relative overflow-hidden">
              {/* Simple SK Members Display */}
            <div className="relative">
                {/* Navigation Arrows */}
                {Math.ceil(skMembers.length / (isMobile ? 1 : isTablet ? 2 : 3)) > 1 && (
                  <>
                <button
                  onClick={prevOfficerSlide}
                  className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 bg-white/95 backdrop-blur-md rounded-full p-2 sm:p-3 lg:p-4 text-gray-600 hover:text-sky-600 hover:bg-white transition-all duration-300 focus:ring-4 focus:ring-sky-200 z-20 shadow-xl border border-gray-200/50 hover:shadow-2xl hover:scale-110"
                  aria-label="Previous officials"
                >
                  <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 rotate-180" />
                </button>
                
                <button
                  onClick={nextOfficerSlide}
                  className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 bg-white/95 backdrop-blur-md rounded-full p-2 sm:p-3 lg:p-4 text-gray-600 hover:text-sky-600 hover:bg-white transition-all duration-300 focus:ring-4 focus:ring-sky-200 z-20 shadow-xl border border-gray-200/50 hover:shadow-2xl hover:scale-110"
                  aria-label="Next officials"
                >
                  <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
                </button>
                  </>
                )}

                {/* Current Slide Display */}
                <div className="px-4 sm:px-6 py-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 transition-all duration-700 ease-in-out">
                    {skMembers.slice(currentOfficerSlide * (isMobile ? 1 : isTablet ? 2 : 3), (currentOfficerSlide + 1) * (isMobile ? 1 : isTablet ? 2 : 3)).map((officer: SKMember) => (
                <Card 
                   key={officer.id} 
                   className="group text-center border-0 shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-105 bg-white/40 backdrop-blur-md rounded-2xl overflow-hidden relative border border-white/30" 
                  role="article"
                >
                                {/* Premium Gradient Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-br from-sky-50/50 via-white to-sky-100/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                
                        <CardContent className="relative pt-6 sm:pt-8 pb-6 sm:pb-8 px-4 sm:px-6">
                                  {/* Premium Profile Image */}
                                  <div className="relative mb-4 sm:mb-6">
                                    {officer.profileImage && (officer.profileImage.startsWith('/images/') || officer.profileImage.startsWith('/uploads/')) ? (
                                      <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full mx-auto overflow-hidden ring-4 ring-white shadow-xl group-hover:ring-sky-200 transition-all duration-500">
                                        <img
                                          src={officer.profileImage}
                                          alt={officer.name}
                                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                        </div>
                      ) : (
                                      <div className="relative w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-sky-100 to-sky-200 rounded-full mx-auto flex items-center justify-center ring-4 ring-white shadow-xl group-hover:ring-sky-200 transition-all duration-500">
                                        <span className="text-sky-700 font-bold text-lg sm:text-xl">
                                          {officer.avatar}
                          </span>
                                        <div className="absolute inset-0 bg-gradient-to-t from-sky-300/20 to-transparent"></div>
                        </div>
                      )}
                                    
                                    {/* Premium Status Indicator */}
                                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                                      <div className="w-4 h-4 sm:w-5 sm:h-5 bg-gradient-to-r from-green-400 to-green-500 rounded-full border-3 border-white shadow-lg flex items-center justify-center">
                                        <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-white rounded-full"></div>
                      </div>
                    </div>
                                  </div>
                                  
                                  {/* Premium Content */}
                          <div className="space-y-2 sm:space-y-3">
                                    <h3 className="font-bold text-gray-900 text-lg sm:text-xl group-hover:text-sky-700 transition-colors duration-300 truncate">{officer.name}</h3>
                                    <div className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-sky-500 to-sky-600 rounded-full text-white text-xs sm:text-sm font-semibold shadow-sm">
                                      {officer.role}
                                    </div>
                                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed truncate">{officer.email}</p>
                                    
                                    {/* Premium Stats */}
                                    <div className="space-y-2 pt-2">
                                      {officer.performance > 0 && (
                                        <div className="flex items-center justify-center text-xs sm:text-sm text-gray-700 leading-tight bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg py-2 px-3">
                                          <Star className="h-3 w-3 sm:h-4 sm:w-4 mr-2 text-yellow-500 flex-shrink-0" aria-hidden="true" />
                                          <span className="font-medium">{officer.performance}% Performance</span>
                        </div>
                      )}
                                      {officer.department && (
                                        <div className="flex items-center justify-center text-xs sm:text-sm text-gray-700 leading-tight bg-gradient-to-r from-sky-50 to-blue-50 rounded-lg py-2 px-3">
                                          <Award className="h-3 w-3 sm:h-4 sm:w-4 mr-2 text-sky-500 flex-shrink-0" aria-hidden="true" />
                                          <span className="font-medium">{officer.department}</span>
                        </div>
                      )}
                                    </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
                      </div>
                    </div>

                {/* Slide Indicators */}
                {Math.ceil(skMembers.length / (isMobile ? 1 : isTablet ? 2 : 3)) > 1 && (
              <div className="flex justify-center mt-8 sm:mt-12 space-x-3">
                    {Array.from({ length: Math.ceil(skMembers.length / (isMobile ? 1 : isTablet ? 2 : 3)) }, (_, index) => (
                    <button
                      key={index}
                      onClick={() => goToOfficerSlide(index)}
                      className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full transition-all duration-300 ${
                        index === currentOfficerSlide 
                          ? 'bg-gradient-to-r from-sky-500 to-sky-600 scale-125 shadow-lg' 
                          : 'bg-gray-300 hover:bg-gray-400 hover:scale-110'
                      }`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                    ))}
                  </div>
                )}
              </div>


              
              {/* Member Count Display */}
              <div className="flex justify-center mt-4 sm:mt-6">
                <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-sky-500 to-sky-600 rounded-full text-white text-sm font-semibold shadow-lg">
                  <Users className="h-4 w-4 mr-2" aria-hidden="true" />
                  {skMembers.length} Elected Youth Members
                </div>
                        </div>
                    </div>
          ) : (
            <div className="text-center py-12 sm:py-16">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Users className="h-8 w-8 sm:h-10 sm:w-10 text-gray-400" aria-hidden="true" />
              </div>
              <p className="text-sm sm:text-base text-gray-600 font-medium">No SK officials available at the moment.</p>
            </div>
          )}
        </div>
      </section>

      {/* Announcements */}
      <section 
        ref={announcementsRef}
        data-section="announcements"
        className={`py-8 sm:py-12 lg:py-16 bg-gradient-to-br from-sky-50 via-white to-blue-50 transition-all duration-1000 ease-out min-h-[450px] ${
          sectionAnimations.announcements ? sectionAnimations.announcements.initial : 'opacity-0 -translate-x-8'
        }`}
        aria-labelledby="announcements-heading"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center">
          <div className="text-center mb-8 sm:mb-12">
            <div className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 bg-sky-50 rounded-full text-sky-700 text-xs sm:text-sm font-medium mb-4 sm:mb-6 border border-sky-200" role="banner">
              <Megaphone className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" aria-hidden="true" />
              Community Updates
            </div>
            <h2 id="announcements-heading" className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 text-gray-900 bg-gradient-to-r from-gray-900 via-sky-800 to-sky-600 bg-clip-text text-transparent">
              Latest News & Announcements
            </h2>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600 max-w-3xl mx-auto px-2 leading-relaxed">
              Stay informed with the latest community updates, government announcements, and important news from SK Barangay Tulay.
            </p>
          </div>
          {isLoadingContent ? (
              <div className="text-center py-12 sm:py-16" role="status" aria-live="polite">
                <div className="relative">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-sky-200 border-t-sky-600 mx-auto mb-6" aria-hidden="true"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-sky-400 animate-ping" aria-hidden="true"></div>
                </div>
                <p className="text-sm sm:text-base text-gray-600 font-medium">Loading announcements...</p>
            </div>
          ) : publishedContent.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 overflow-hidden">
                {/* Featured Announcement - Left Side */}
                <div className="lg:col-span-2 min-w-0">
                <Card 
                  className="group border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] bg-gradient-to-br from-white via-sky-50/30 to-white backdrop-blur-md rounded-3xl overflow-hidden relative h-full focus-within:ring-4 focus-within:ring-sky-200 border border-sky-100/50"  
                  role="article"
                  tabIndex={0}
                  aria-labelledby={publishedContent[0] ? `featured-announcement-${publishedContent[0].id}` : undefined}
                  style={{ animationDelay: '0ms' }}
                >
                  {publishedContent[0] && (
                    <div className="flex flex-col h-full">
                      {/* Enhanced Image Section */}
                      <div className="relative w-full h-64 sm:h-80 lg:h-96 overflow-hidden">
                        {getContentImage(publishedContent[0]) ? (
                          <img
                            src={getContentImage(publishedContent[0])!}
                            alt={`Featured announcement: ${publishedContent[0].title}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="eager"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              (target.nextElementSibling as HTMLElement | null)?.classList.remove('hidden');
                            }}
                          />
                        ) : null}
                        <div className={`w-full h-full bg-gradient-to-br from-sky-100 via-blue-100 to-sky-200 flex items-center justify-center ${getContentImage(publishedContent[0]) ? 'hidden' : ''}`} aria-label="No image available">
                          <div className="text-center">
                            <FileText className="h-16 w-16 text-sky-600 mb-2" aria-hidden="true" />
                            <p className="text-sky-700 text-sm font-medium">No Image Available</p>
                          </div>
                        </div>
                        
                        {/* Enhanced Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent group-hover:from-black/30 transition-all duration-500"></div>
                        
                        {/* Enhanced Badge */}
                        <div className="absolute top-4 left-4 z-10">
                          <Badge className="bg-white/95 backdrop-blur-md text-sky-700 border-sky-200 text-xs font-bold shadow-lg border-0">
                            {publishedContent[0].type}
                          </Badge>
                        </div>
                        
                        {/* Enhanced Date */}
                        <div className="absolute top-4 right-4 z-10">
                          <time 
                            className="text-xs text-white font-bold bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-full shadow-lg"
                            dateTime={publishedContent[0].createdAt}
                          >
                            {formatDate(publishedContent[0].createdAt)}
                          </time>
                        </div>
                      </div>
                      
                      {/* Enhanced Content Section */}
                      <div className="w-full p-6 sm:p-8 flex flex-col justify-between flex-1 bg-gradient-to-b from-white to-sky-50/20">
                        <div className="space-y-4 flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-2 h-2 bg-sky-500 rounded-full animate-pulse"></div>
                            <span className="text-xs text-sky-600 font-semibold uppercase tracking-wide">Featured</span>
                          </div>
                          
                          <h3 
                            id={`featured-announcement-${publishedContent[0].id}`}
                            className="font-bold text-gray-900 text-lg sm:text-xl lg:text-2xl leading-tight group-hover:text-sky-800 transition-colors duration-300"
                          >
                            {publishedContent[0].title}
                          </h3>
                          
                          <p className="text-sm sm:text-base text-gray-600 leading-relaxed line-clamp-6">
                            {publishedContent[0].description}
                          </p>
                          
                          {/* Enhanced Tags */}
                          {publishedContent[0].tags && (
                            <div className="flex flex-wrap gap-2" role="list" aria-label="Content tags">
                              {publishedContent[0].tags.split(',').slice(0, 3).map((tag: string, index: number) => (
                                <Badge 
                                  key={index} 
                                  variant="secondary" 
                                  className="text-xs bg-gradient-to-r from-sky-100 to-blue-100 text-sky-700 border-sky-200 font-semibold shadow-sm hover:shadow-md transition-all duration-200"
                                  role="listitem"
                                >
                                  {tag.trim()}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        
                        {/* Enhanced Footer */}
                        <div className="flex items-center justify-between pt-4 border-t border-sky-200/50">
                          <div className="flex items-center text-xs text-gray-600">
                            <div className="w-6 h-6 bg-sky-100 rounded-full flex items-center justify-center mr-2">
                              <User className="h-3 w-3 text-sky-600" aria-hidden="true" />
                            </div>
                            <span className="font-medium">{publishedContent[0].author?.name || 'SK Barangay Tulay'}</span>
                          </div>
                          
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="border-sky-300 text-sky-600 hover:bg-sky-50 hover:border-sky-400 focus:ring-4 focus:ring-sky-200 text-xs font-semibold transition-all duration-200 rounded-lg shadow-sm hover:shadow-md" 
                            asChild
                          >
                            <a href="/news" className="flex items-center" aria-label={`Read full article: ${publishedContent[0].title}`}>
                              Read Article
                              <ChevronRight className="ml-1 h-3 w-3" aria-hidden="true" />
                            </a>
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </Card>
            </div>
                
                {/* Other News - Right Side */}
                <div className="lg:col-span-1 flex flex-col h-full space-y-4 min-w-0" role="list" aria-label="Additional announcements">
                  {publishedContent.slice(1, 3).map((item) => (
                    <Card 
                      key={item.id} 
                      className="group border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] bg-gradient-to-br from-white via-sky-50/20 to-white backdrop-blur-md rounded-2xl overflow-hidden relative focus-within:ring-4 focus-within:ring-sky-200 border border-sky-100/30 flex-1"  
                      role="listitem"
                      tabIndex={0}
                      aria-labelledby={`announcement-${item.id}`}
                    >
                      <div className="flex flex-col h-full">
                        {/* Enhanced Image Section */}
                        <div className="relative w-full h-32 sm:h-40 overflow-hidden">
                          {getContentImage(item) ? (
                            <img
                              src={getContentImage(item)!}
                              alt={`Announcement: ${item.title}`}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              loading="lazy"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                target.nextElementSibling?.classList.remove('hidden');
                              }}
                            />
                          ) : null}
                          <div className={`w-full h-full bg-gradient-to-br from-sky-100 via-blue-100 to-sky-200 flex items-center justify-center ${getContentImage(item) ? 'hidden' : ''}`} aria-label="No image available">
                            <div className="text-center">
                              <FileText className="h-8 w-8 text-sky-600 mb-1" aria-hidden="true" />
                              <p className="text-sky-700 text-xs font-medium">No Image</p>
                            </div>
                          </div>
                          
                          {/* Enhanced Gradient Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent group-hover:from-black/30 transition-all duration-500"></div>
                          
                          {/* Enhanced Badge */}
                          <div className="absolute top-2 left-2 z-10">
                            <Badge className="bg-white/95 backdrop-blur-md text-sky-700 border-sky-200 text-xs font-bold shadow-lg border-0">
                              {item.type}
                            </Badge>
                          </div>
                          
                          {/* Enhanced Date */}
                          <div className="absolute top-2 right-2 z-10">
                            <time 
                              className="text-xs text-white font-bold bg-black/70 backdrop-blur-md px-2 py-1 rounded-full shadow-lg"
                              dateTime={item.createdAt}
                            >
                              {formatDate(item.createdAt)}
                            </time>
                          </div>
                        </div>
                        
                        {/* Enhanced Content Section */}
                        <div className="w-full p-4 sm:p-5 flex flex-col justify-between flex-1 bg-gradient-to-b from-white to-sky-50/10">
                          <div className="space-y-2">
                            <div className="flex items-center gap-1 mb-1">
                              <div className="w-1.5 h-1.5 bg-sky-400 rounded-full"></div>
                              <span className="text-xs text-sky-600 font-semibold uppercase tracking-wide">News</span>
                            </div>
                            
                            <h3 
                              id={`announcement-${item.id}`}
                              className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2 group-hover:text-sky-800 transition-colors duration-300"
                            >
                              {item.title}
                            </h3>
                            
                            <p className="text-xs text-gray-600 leading-relaxed line-clamp-3">
                              {item.description}
                            </p>
                          </div>
          
                          {/* Enhanced Footer */}
                          <div className="flex items-center justify-between pt-2 border-t border-sky-200/30 mt-3">
                            <div className="flex items-center text-xs text-gray-600">
                              <div className="w-5 h-5 bg-sky-100 rounded-full flex items-center justify-center mr-2">
                                <User className="h-2.5 w-2.5 text-sky-600" aria-hidden="true" />
                              </div>
                              <span className="font-medium">{item.author?.name || 'SK Barangay Tulay'}</span>
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="border-sky-300 text-sky-600 hover:bg-sky-50 hover:border-sky-400 focus:ring-4 focus:ring-sky-200 text-xs font-semibold transition-all duration-200 rounded-lg shadow-sm hover:shadow-md" 
                              asChild
                            >
                              <a href="/news" className="flex items-center" aria-label={`Read full article: ${item.title}`}>
                                Read More
                                <ChevronRight className="ml-1 h-3 w-3" aria-hidden="true" />
                              </a>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                    ))}
                  </div>
                </div>
          ) : (
            <div className="text-center py-8 sm:py-12" role="status">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Activity className="h-6 w-6 text-gray-400" aria-hidden="true" />
              </div>
              <p className="text-sm sm:text-base text-gray-600">No announcements at this time.</p>
            </div>
          )}
          <div className="text-center mt-6 sm:mt-8">
            <Button 
              className="bg-sky-600 hover:bg-sky-700 text-white font-semibold px-6 py-3 text-sm shadow-sm transition-colors focus:ring-4 focus:ring-sky-200 rounded-lg" 
              asChild
            >
              <a href="/news">
                View All Announcements
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section 
        ref={contactRef}
        data-section="contact"
        className={`py-8 sm:py-12 lg:py-16 bg-gradient-to-br from-sky-50 via-white to-blue-50 transition-all duration-1000 ease-out min-h-[450px] ${
          sectionAnimations.contact ? sectionAnimations.contact.initial : 'opacity-0 translate-x-8'
        }`}
        aria-labelledby="contact-heading"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center">
          {/* Header */}
          <div className="text-center mb-8 sm:mb-12">
            <div className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 bg-sky-50 rounded-full text-sky-700 text-xs sm:text-sm font-medium mb-4 sm:mb-6 border border-sky-200" role="banner">
              <Info className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" aria-hidden="true" />
              Government Office
            </div>
            <h2 id="contact-heading" className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 text-gray-900 bg-gradient-to-r from-gray-900 via-sky-800 to-sky-600 bg-clip-text text-transparent">
              Contact Information
            </h2>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600 max-w-3xl mx-auto px-2 leading-relaxed">
              For official government inquiries, youth registration, and community services, 
              please contact SK Barangay Tulay through our official channels.
            </p>
          </div>

                    {/* Combined Map and Contact Card */}
          <div className="mb-8 sm:mb-12 lg:mb-16 overflow-hidden">
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-md rounded-xl sm:rounded-2xl overflow-hidden relative border border-white/30">
              <CardContent className="p-0">
                <div className="grid grid-cols-1 xl:grid-cols-2">
                  {/* Google Map Section */}
                  <div className="order-2 xl:order-1 h-64 sm:h-80 md:h-96 lg:h-[500px] xl:h-full">
                    <div className="relative h-full w-full">
                      <iframe 
                        width="100%" 
                        height="100%" 
                        frameBorder="0" 
                        style={{border:0}} 
                        src="https://www.google.com/maps/embed/v1/place?key=AIzaSyB2NIWI3Tv9iDPrlnowr_0ZqZWoAQydKJU&q=12.873067570011914,124.00579697836933&maptype=roadmap" 
                        allowFullScreen
                        title="SK Barangay Tulay Location"
                        className="w-full h-full rounded-t-xl sm:rounded-t-2xl xl:rounded-l-2xl xl:rounded-t-none"
                      />
                    </div>
                  </div>

                  {/* Contact Information Section */}
                  <div className="order-1 xl:order-2 p-4 sm:p-6 lg:p-8 h-full flex flex-col justify-center">
                    
                    {/* Contact Items */}
                    <div className="space-y-2 sm:space-y-3 lg:space-y-4">
                      {/* Office Location */}
                      <div className="group p-3 sm:p-4 lg:p-5 bg-gradient-to-br from-white/60 to-sky-50/30 rounded-lg border border-sky-200/30 hover:border-sky-300/50 transition-all duration-300 hover:shadow-md backdrop-blur-sm">
                        <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-sky-500 to-sky-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md group-hover:shadow-lg transition-all duration-300">
                            <MapPin className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" aria-hidden="true" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-gray-900 text-xs sm:text-sm lg:text-base mb-0.5 sm:mb-1">Office Location</h4>
                            <p className="text-xs sm:text-sm lg:text-base text-gray-700 leading-tight font-medium">
                              Barangay Hall, Tulay<br />
                              Municipality of Casiguran<br />
                              Province of Sorsogon
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Phone Contact */}
                      <div className="group p-3 sm:p-4 lg:p-5 bg-gradient-to-br from-white/60 to-sky-50/30 rounded-lg border border-sky-200/30 hover:border-sky-300/50 transition-all duration-300 hover:shadow-md backdrop-blur-sm">
                        <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-sky-500 to-sky-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md group-hover:shadow-lg transition-all duration-300">
                            <Phone className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" aria-hidden="true" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-gray-900 text-xs sm:text-sm lg:text-base mb-0.5 sm:mb-1">Phone Contact</h4>
                            <div className="space-y-0.5">
                              <p className="text-xs sm:text-sm lg:text-base text-gray-700 leading-tight">
                                <span className="font-semibold text-sky-700">Main:</span> <span className="break-all">(123) 456-7890</span>
                              </p>
                              <p className="text-xs sm:text-sm lg:text-base text-gray-700 leading-tight">
                                <span className="font-semibold text-sky-700">Youth:</span> <span className="break-all">(123) 456-7891</span>
                              </p>
                              <p className="text-xs sm:text-sm lg:text-base text-gray-700 leading-tight">
                                <span className="font-semibold text-red-600">Emergency:</span> <span className="break-all">(123) 456-7892</span>
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Email Contact */}
                      <div className="group p-3 sm:p-4 lg:p-5 bg-gradient-to-br from-white/60 to-sky-50/30 rounded-lg border border-sky-200/30 hover:border-sky-300/50 transition-all duration-300 hover:shadow-md backdrop-blur-sm">
                        <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-sky-500 to-sky-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md group-hover:shadow-lg transition-all duration-300">
                            <Mail className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" aria-hidden="true" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-gray-900 text-xs sm:text-sm lg:text-base mb-0.5 sm:mb-1">Email Contact</h4>
                            <div className="space-y-0.5">
                              <p className="text-xs sm:text-sm lg:text-base text-gray-700 leading-tight">
                                <span className="font-semibold text-sky-700">General:</span> <span className="break-all">info@skbarangaytulay.gov.ph</span>
                              </p>
                              <p className="text-xs sm:text-sm lg:text-base text-gray-700 leading-tight">
                                <span className="font-semibold text-sky-700">Youth:</span> <span className="break-all">youth@skbarangaytulay.gov.ph</span>
                              </p>
                              <p className="text-xs sm:text-sm lg:text-base text-gray-700 leading-tight">
                                <span className="font-semibold text-sky-700">Support:</span> <span className="break-all">support@skbarangaytulay.gov.ph</span>
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Call to Action */}
          <div className="text-center">
            <div className="bg-gradient-to-r from-sky-600 to-blue-600 rounded-2xl p-8 shadow-xl">
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-4 sm:mb-6">
                Need More Information?
              </h3>
              <p className="text-sky-100 text-sm sm:text-base lg:text-lg mb-6 sm:mb-8 max-w-2xl mx-auto">
                Visit our dedicated contact page for detailed information, office hours, 
                contact forms, and frequently asked questions.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  className="bg-white text-sky-600 hover:bg-sky-50 font-semibold px-6 py-3 text-sm shadow-lg transition-all duration-300 hover:shadow-xl focus:ring-4 focus:ring-white/20 w-full sm:w-auto rounded-lg" 
                  asChild
                >
                  <a href="/contact">
                    Contact Us
                    <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                  </a>
                </Button>
                <Button 
                  className="bg-sky-600 hover:bg-sky-700 text-white border border-sky-300 font-semibold px-6 py-3 text-sm transition-all duration-300 hover:shadow-xl focus:ring-4 focus:ring-sky-200 w-full sm:w-auto rounded-lg" 
                  asChild
                >
                  <a href="/auth/register">
                    Register as Youth
                    <ChevronRight className="ml-2 h-4 w-4" aria-hidden="true" />
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      {/* Tracking Results Modal */}
      {showTrackingModal && trackingResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md sm:max-w-lg md:max-w-2xl lg:max-w-3xl xl:max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white rounded-t-2xl border-b border-gray-200 p-4 sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">Submission Details</h3>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Reference:</span> {trackingResult.submission.referenceCode}
                    </p>
                    <Badge className={`text-xs font-semibold w-fit ${getStatusBadgeColor(trackingResult.submission.status)}`}>
                      {trackingResult.submission.status}
                    </Badge>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowTrackingModal(false)
                    setTrackingResult(null)
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                  aria-label="Close modal"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-6 space-y-6">
              {/* Status and Basic Info */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Submitted By</p>
                    <p className="text-sm text-gray-900">{trackingResult.submission.submitterName}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Submitted At</p>
                    <p className="text-sm text-gray-900">
                      {new Date(trackingResult.submission.submittedAt).toLocaleString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        timeZone: 'Asia/Manila'
                      })} PHT
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Form</p>
                    <p className="text-sm text-gray-900">{trackingResult.form.title}</p>
                    <p className="text-xs text-gray-500">{trackingResult.form.type}</p>
                  </div>
                  {trackingResult.program && (
                    <div>
                      <p className="text-sm font-medium text-gray-700">Program</p>
                      <p className="text-sm text-gray-900">{trackingResult.program.title}</p>
                    </div>
                  )}
                  {trackingResult.submission.reviewedAt && (
                    <div>
                      <p className="text-sm font-medium text-gray-700">Reviewed At</p>
                      <p className="text-sm text-gray-900">
                        {new Date(trackingResult.submission.reviewedAt).toLocaleString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          timeZone: 'Asia/Manila'
                        })} PHT
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Form Data */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-sky-600" />
                  Submission Data
                </h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {Object.entries(trackingResult.formData).map(([key, value]) => {
                      // Skip file URLs as they're shown separately
                      if (typeof value === 'string' && value.startsWith('/uploads/submissions/')) {
                        return null
                      }
                      
                      return (
                        <div key={key} className="space-y-1">
                          <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">{key}</p>
                          <p className="text-sm text-gray-900 break-words bg-white rounded px-3 py-2 border border-gray-200">
                            {String(value)}
                          </p>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Uploaded Files */}
              {trackingResult.uploadedFiles.length > 0 && (
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-sky-600" />
                    Uploaded Files ({trackingResult.uploadedFiles.length})
                  </h4>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                    {trackingResult.uploadedFiles.map((file: {name: string, url: string, fieldName?: string, fileName?: string, filePath?: string}, index: number) => (
                      <div key={index} className="flex items-center gap-3 p-4 border rounded-lg bg-white hover:bg-gray-50 transition-colors">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <FileText className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{file.fieldName || file.name}</p>
                          <p className="text-xs text-gray-500 truncate">{file.fileName || file.name}</p>
                          <div className="flex items-center gap-3 mt-2">
                            <a
                              href={file.filePath || file.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-700 text-xs font-medium flex items-center gap-1 hover:underline transition-colors"
                            >
                              <Eye className="w-3 h-3" />
                              View
                            </a>
                            <a
                              href={file.filePath || file.url}
                              download={file.fileName || file.name}
                              className="text-green-600 hover:text-green-700 text-xs font-medium flex items-center gap-1 hover:underline transition-colors"
                            >
                              <Download className="w-3 h-3" />
                              Download
                            </a>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Review Notes */}
              {trackingResult.submission.notes && (
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Review Notes</h4>
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-900">{trackingResult.submission.notes}</p>
                  </div>
                </div>
              )}


            </div>
          </div>
        </div>
      )}
    </main>
  )
} 