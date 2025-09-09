"use client"

import { 
  Calendar, 
  User, 
  Tag, 
  ChevronLeft,
  ArrowLeft,
  Info,
  FileText,
  Megaphone,
  Award,
  Clock,
  Share2
} from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

import Footer from '@/components/layout/footer'
import Header from '@/components/layout/header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface ContentItem {
  id: string
  title: string
  description: string
  content?: string
  type: string
  status: string
  featured: boolean
  thumbnail?: string
  fileUrl?: string
  fileUrls?: string | string[] | null // JSON string or parsed array of multiple file URLs
  thumbnailMode?: string // SINGLE or MULTIPLE
  selectedThumbnails?: string | string[] | null // JSON string or parsed array of selected thumbnail URLs
  tags?: string
  author?: {
    name: string
  }
  createdAt: string
}

export default function NewsArticlePage() {
  const params = useParams()
  const router = useRouter()
  const [article, setArticle] = useState<ContentItem | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null)
  const [showImageModal, setShowImageModal] = useState(false)
  const [imageLoading, setImageLoading] = useState<{ [key: number]: boolean }>({})

  useEffect(() => {
    fetchArticle()
  }, [params.id])

  const fetchArticle = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/content/${params.id}`)
      
      if (response.ok) {
        const data = await response.json()
        console.log('Fetched article data:', data)
        
        if (data.status === 'PUBLISHED') {
          setArticle(data)
          
          // Debug: Log the images that will be displayed
          const images = getContentImages(data)
          console.log('Article images:', images)
        } else {
          setError('Article not found or not published')
        }
      } else {
        setError('Article not found')
      }
    } catch (error) {
      console.error('Error fetching article:', error)
      setError('Failed to load article')
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'ANNOUNCEMENT':
        return <Megaphone className="h-4 w-4" />
      case 'NEWS':
        return <FileText className="h-4 w-4" />
      case 'EVENT':
        return <Calendar className="h-4 w-4" />
      case 'AWARD':
        return <Award className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const parseFileUrls = (fileUrls: string | string[] | null | undefined): string[] => {
    if (!fileUrls) return []
    
    // If it's already an array, return it
    if (Array.isArray(fileUrls)) return fileUrls
    
    // If it's a string, try to parse it
    if (typeof fileUrls === 'string' && fileUrls.trim() !== '') {
      try {
        const parsed = JSON.parse(fileUrls)
        console.log('Parsed fileUrls:', parsed)
        return Array.isArray(parsed) ? parsed : []
      } catch (error) {
        console.error('Error parsing fileUrls:', error, 'Raw value:', fileUrls)
        // If parsing fails, try to split by comma or treat as single URL
        if (fileUrls.includes(',')) {
          return fileUrls.split(',').map(url => url.trim()).filter(url => url.length > 0)
        }
        return [fileUrls]
      }
    }
    
    return []
  }

  // Helper function to get the best images for content display
  const getContentImages = (content: ContentItem): string[] => {
    console.log('Getting images for content:', {
      fileUrls: content.fileUrls,
      selectedThumbnails: content.selectedThumbnails,
      thumbnail: content.thumbnail
    })
    
    // First priority: fileUrls (all uploaded images)
    if (content.fileUrls) {
      const fileUrls = parseFileUrls(content.fileUrls)
      console.log('Parsed fileUrls result:', fileUrls)
      if (fileUrls.length > 0) {
        console.log('Using fileUrls:', fileUrls)
        return fileUrls
      }
    }
    
    // Second priority: selectedThumbnails (if no fileUrls)
    if (content.selectedThumbnails) {
      const selectedThumbnails = Array.isArray(content.selectedThumbnails) ? content.selectedThumbnails : 
        (typeof content.selectedThumbnails === 'string' && content.selectedThumbnails.trim() !== '' && content.selectedThumbnails !== '[]' ? JSON.parse(content.selectedThumbnails) : [])
      
      if (selectedThumbnails.length > 0) {
        console.log('Using selectedThumbnails:', selectedThumbnails)
        return selectedThumbnails
      }
    }
    
    // Third priority: thumbnail (legacy field)
    if (content.thumbnail) {
      console.log('Using thumbnail:', content.thumbnail)
      return [content.thumbnail]
    }
    
    console.log('No images found')
    return []
  }

  const openImageModal = (index: number) => {
    setSelectedImageIndex(index)
    setShowImageModal(true)
  }

  const closeImageModal = () => {
    setShowImageModal(false)
    setSelectedImageIndex(null)
  }

  const nextImage = () => {
    const images = getContentImages(article!)
    if (selectedImageIndex !== null && selectedImageIndex < images.length - 1) {
      setSelectedImageIndex(selectedImageIndex + 1)
    }
  }

  const prevImage = () => {
    if (selectedImageIndex !== null && selectedImageIndex > 0) {
      setSelectedImageIndex(selectedImageIndex - 1)
    }
  }

  const handleImageLoad = (index: number) => {
    setImageLoading(prev => ({ ...prev, [index]: false }))
  }

  const handleImageError = (index: number) => {
    setImageLoading(prev => ({ ...prev, [index]: false }))
    console.error(`Image ${index} failed to load`)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header currentPage="/news" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 md:py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading article...</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header currentPage="/news" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 md:py-16">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="h-8 w-8 text-gray-400" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Article Not Found</h1>
            <p className="text-gray-600 mb-8">
              {error || 'The article you are looking for could not be found.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                className="bg-sky-600 hover:bg-sky-700 text-white font-medium px-6 py-3 text-base shadow-sm transition-colors focus:ring-4 focus:ring-sky-200" 
                onClick={() => router.back()}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Back
              </Button>
              <Button 
                className="bg-white text-sky-600 border border-sky-300 hover:bg-sky-50 font-medium px-6 py-3 text-base transition-colors focus:ring-4 focus:ring-sky-200" 
                asChild
              >
                <a href="/news">
                  View All News
                </a>
              </Button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header currentPage="/news" />

      {/* Article Header */}
      <section className="bg-white border-b border-gray-200 py-10 sm:py-14 md:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6 sm:mb-8">
            <Button 
              variant="outline"
              onClick={() => router.back()}
              className="border-gray-300 text-gray-700 hover:bg-gray-50 font-medium transition-colors"
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to News
            </Button>
          </div>

          <div className="space-y-6 sm:space-y-8">
            {/* Article metadata with improved layout */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
              <div className="flex items-center gap-3 sm:gap-4">
                <Badge variant="outline" className="bg-sky-50 text-sky-700 border-sky-200 font-medium">
                  <span className="mr-2">{getTypeIcon(article.type)}</span>
                {article.type}
              </Badge>
                <time className="text-sm text-gray-600 flex items-center font-medium">
                  <Clock className="h-4 w-4 mr-2" />
                {formatDate(article.createdAt)}
              </time>
            </div>

              <Button
                variant="outline"
                size="sm"
                className="border-gray-300 text-gray-700 hover:bg-gray-50 font-medium"
              >
                <Share2 className="mr-2 h-3 w-3" />
                Share Article
              </Button>
            </div>

            {/* Article title with improved typography */}
            <div className="space-y-4 sm:space-y-6">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                {article.title}
              </h1>

              {/* Author information */}
              <div className="flex items-center text-gray-600">
                <User className="h-5 w-5 mr-3" />
                <span className="font-medium">
                  {article.author?.name || 'SK Barangay Tulay'}
                </span>
              </div>
            </div>

            {/* Facebook-style Image Gallery */}
            {(() => {
              const images = getContentImages(article)
              if (images.length > 0) {
                return (
                  <div className="mt-8 sm:mt-10 md:mt-12">
                    <div className="grid grid-cols-2 gap-2 rounded-xl overflow-hidden shadow-lg">
                      {images.length === 1 && (
                        <div className="col-span-2">
                          <img 
                            src={images[0]} 
                            alt={`${article.title} - Image 1`}
                            className="w-full h-56 sm:h-72 md:h-96 object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
                            onClick={() => openImageModal(0)}
                            onError={(e) => {
                              console.error('Image failed to load:', e);
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                      
                      {images.length === 2 && (
                        <>
                          <div className="h-48 sm:h-64 md:h-80">
                            <img 
                              src={images[0]} 
                              alt={`${article.title} - Image 1`}
                              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
                              onClick={() => openImageModal(0)}
                            />
                          </div>
                          <div className="h-48 sm:h-64 md:h-80">
                            <img 
                              src={images[1]} 
                              alt={`${article.title} - Image 2`}
                              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
                              onClick={() => openImageModal(1)}
                            />
                          </div>
                        </>
                      )}
                      
                      {images.length === 3 && (
                        <>
                          <div className="row-span-2 h-64 sm:h-80 md:h-96">
                            <img 
                              src={images[0]} 
                              alt={`${article.title} - Image 1`}
                              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
                              onClick={() => openImageModal(0)}
                            />
                          </div>
                          <div className="h-40 sm:h-48 md:h-56">
                            <img 
                              src={images[1]} 
                              alt={`${article.title} - Image 2`}
                              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
                              onClick={() => openImageModal(1)}
                            />
                          </div>
                          <div className="h-40 sm:h-48 md:h-56">
                            <img 
                              src={images[2]} 
                              alt={`${article.title} - Image 3`}
                              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
                              onClick={() => openImageModal(2)}
                            />
                          </div>
                        </>
                      )}
                      
                      {images.length === 4 && (
                        <>
                          <div className="h-40 sm:h-48 md:h-56">
                            <img 
                              src={images[0]} 
                              alt={`${article.title} - Image 1`}
                              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
                              onClick={() => openImageModal(0)}
                            />
                          </div>
                          <div className="h-40 sm:h-48 md:h-56">
                            <img 
                              src={images[1]} 
                              alt={`${article.title} - Image 2`}
                              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
                              onClick={() => openImageModal(1)}
                            />
                          </div>
                          <div className="h-40 sm:h-48 md:h-56">
                            <img 
                              src={images[2]} 
                              alt={`${article.title} - Image 3`}
                              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
                              onClick={() => openImageModal(2)}
                            />
                          </div>
                          <div className="h-40 sm:h-48 md:h-56">
                            <img 
                              src={images[3]} 
                              alt={`${article.title} - Image 4`}
                              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
                              onClick={() => openImageModal(3)}
                            />
                          </div>
                        </>
                      )}
                      
                      {images.length > 4 && (
                        <>
                          <div className="h-40 sm:h-48 md:h-56">
                            <img 
                              src={images[0]} 
                              alt={`${article.title} - Image 1`}
                              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
                              onClick={() => openImageModal(0)}
                            />
                          </div>
                          <div className="h-40 sm:h-48 md:h-56">
                            <img 
                              src={images[1]} 
                              alt={`${article.title} - Image 2`}
                              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
                              onClick={() => openImageModal(1)}
                            />
                          </div>
                          <div className="h-40 sm:h-48 md:h-56">
                            <img 
                              src={images[2]} 
                              alt={`${article.title} - Image 3`}
                              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
                              onClick={() => openImageModal(2)}
                            />
                          </div>
                          <div className="h-40 sm:h-48 md:h-56 relative group">
                            <img 
                              src={images[3]} 
                              alt={`${article.title} - Image 4`}
                              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
                              onClick={() => openImageModal(3)}
                            />
                            {/* Facebook-style overlay with +X more */}
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center group-hover:bg-black/70 transition-all duration-300">
                              <div className="text-white text-2xl sm:text-3xl font-bold">
                                +{images.length - 4}
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )
              } else if (article.thumbnail || article.fileUrl) {
                return (
                  <div className="mt-8 sm:mt-10 md:mt-12">
                    <img 
                      src={article.thumbnail || article.fileUrl} 
                      alt={article.title}
                      className="w-full h-56 sm:h-72 md:h-80 object-cover rounded-xl shadow-lg cursor-pointer hover:scale-105 transition-transform duration-300"
                      onClick={() => openImageModal(0)}
                    />
                  </div>
                )
              }
              return null
            })()}
          </div>
        </div>
      </section>

      {/* Article Content */}
      <section className="py-10 sm:py-12 md:py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="border-0 shadow-lg bg-white">
            <CardContent className="p-4 sm:p-6 md:p-10">
              <div className="prose prose-sm sm:prose-base md:prose-lg prose-gray max-w-none">
                {/* Rich text content with proper spacing and typography */}
                <div 
                  className="text-gray-800 leading-relaxed space-y-6"
                  dangerouslySetInnerHTML={{ 
                    __html: article.description || article.content || '' 
                  }}
                />

                {/* Fallback content if no rich text */}
                {!article.description && !article.content && (
                  <div className="text-gray-700 leading-relaxed space-y-4">
                    <p className="text-base sm:text-lg">
                      This is an official government announcement from SK Barangay Tulay. 
                      For more information about this announcement, please contact our office 
                      during business hours.
                    </p>
                    <p className="text-sm sm:text-base text-gray-600">
                      We are committed to serving our community with transparency and dedication. 
                      Stay connected with us for the latest updates on government programs, 
                      community events, and youth development initiatives.
                    </p>
                  </div>
                )}
              </div>

              {/* Tags section with improved styling */}
              {article.tags && (
                <div className="mt-10 sm:mt-12 pt-8 border-t border-gray-200">
                  <div className="flex items-center gap-2 mb-4">
                    <Tag className="h-4 w-4 text-gray-500" />
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                      Related Topics
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-2 sm:gap-3">
                    {article.tags.split(',').map((tag: string, index: number) => (
                      <Badge 
                        key={index} 
                        variant="secondary" 
                        className="text-xs bg-sky-50 text-sky-700 border border-sky-200 px-3 py-1 font-medium"
                      >
                        {tag.trim()}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Article metadata with improved layout */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span className="font-medium">
                        {article.author?.name || 'SK Barangay Tulay'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <time>{formatDate(article.createdAt)}</time>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-gray-300 text-gray-700 hover:bg-gray-50 font-medium"
                    >
                      <Share2 className="mr-2 h-3 w-3" />
                      Share Article
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Related Information with improved styling */}
      <section className="py-10 sm:py-14 md:py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-14 md:mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">Stay Connected</h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Get the latest updates on government programs, community events, and youth development initiatives 
              from SK Barangay Tulay.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <Card className="border-0 shadow-lg bg-white hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-6 sm:p-8 text-center">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-sky-100 rounded-xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <FileText className="h-7 w-7 sm:h-8 sm:w-8 text-sky-600" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">All Announcements</h3>
                <p className="text-gray-600 mb-4 sm:mb-6 leading-relaxed">
                  View all official government announcements and community updates from our barangay.
                </p>
                <Button 
                  variant="outline" 
                  className="border-sky-300 text-sky-600 hover:bg-sky-50 font-medium px-6" 
                  asChild
                >
                  <a href="/news">View All News</a>
                </Button>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-white hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-6 sm:p-8 text-center">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-sky-100 rounded-xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <Info className="h-7 w-7 sm:h-8 sm:w-8 text-sky-600" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">Contact Office</h3>
                <p className="text-gray-600 mb-4 sm:mb-6 leading-relaxed">
                  Get in touch with our official government office for inquiries and assistance.
                </p>
                <Button 
                  variant="outline" 
                  className="border-sky-300 text-sky-600 hover:bg-sky-50 font-medium px-6" 
                  asChild
                >
                  <a href="/contact">Contact Us</a>
                </Button>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-white hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-6 sm:p-8 text-center">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-sky-100 rounded-xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <User className="h-7 w-7 sm:h-8 sm:w-8 text-sky-600" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">Join Our Community</h3>
                <p className="text-gray-600 mb-4 sm:mb-6 leading-relaxed">
                  Register as a youth member to participate in government programs and activities.
                </p>
                <Button 
                  variant="outline" 
                  className="border-sky-300 text-sky-600 hover:bg-sky-50 font-medium px-6" 
                  asChild
                >
                  <a href="/auth/register">Register Now</a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />

      {/* Image Modal */}
      {showImageModal && selectedImageIndex !== null && article && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Close Button */}
            <button
              onClick={closeImageModal}
              className="absolute top-4 right-4 z-10 text-white hover:text-gray-300 transition-colors"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Navigation Buttons */}
            {getContentImages(article).length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  disabled={selectedImageIndex === 0}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 text-white hover:text-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={nextImage}
                  disabled={selectedImageIndex === getContentImages(article).length - 1}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 text-white hover:text-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}

            {/* Image */}
            <div className="w-full h-full flex items-center justify-center p-4">
              {imageLoading[selectedImageIndex] && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                </div>
              )}
              <img
                src={getContentImages(article)[selectedImageIndex]}
                alt={`${article.title} - Image ${selectedImageIndex + 1}`}
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                style={{ 
                  maxHeight: 'calc(100vh - 2rem)', 
                  maxWidth: 'calc(100vw - 2rem)',
                  objectFit: 'contain'
                }}
                onLoad={() => handleImageLoad(selectedImageIndex)}
                onError={() => handleImageError(selectedImageIndex)}
              />
            </div>

            {/* Image Counter */}
            {getContentImages(article).length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 text-white bg-black/50 px-4 py-2 rounded-full">
                {selectedImageIndex + 1} / {getContentImages(article).length}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
} 


