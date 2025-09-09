"use client"

import { 
  Search, 
  Calendar, 
  User, 
  ChevronRight,
  ArrowRight,
  FileText,
  Megaphone,
  Activity
} from 'lucide-react'
import { useState, useEffect } from 'react'

import Footer from '@/components/layout/footer'
import Header from '@/components/layout/header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface ContentItem {
  id: string
  title: string
  description: string
  type: string
  status: string
  featured: boolean
  thumbnail?: string
  fileUrl?: string
  fileUrls?: string // JSON string of multiple file URLs
  selectedThumbnails?: string // JSON string of selected thumbnail URLs
  tags?: string
  author?: {
    name: string
  }
  createdAt: string
}

const categories = [
  { id: 'all', label: 'All', icon: <FileText className="h-3 w-3 sm:h-4 sm:w-4" /> },
  { id: 'ANNOUNCEMENT', label: 'Announcements', icon: <Megaphone className="h-3 w-3 sm:h-4 sm:w-4" /> },
  { id: 'NEWS', label: 'News', icon: <FileText className="h-3 w-3 sm:h-4 sm:w-4" /> },
  { id: 'EVENT', label: 'Events', icon: <Calendar className="h-3 w-3 sm:h-4 sm:w-4" /> },

]

export default function NewsPage() {
  const [content, setContent] = useState<ContentItem[]>([])
  const [filteredContent, setFilteredContent] = useState<ContentItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  useEffect(() => {
    fetchContent()
  }, [])

  useEffect(() => {
    filterContent()
  }, [content, searchTerm, selectedCategory])

  const fetchContent = async () => {
    try {
      const response = await fetch('/api/content')
      if (response.ok) {
        const data = await response.json()
        const published = data.filter((item: ContentItem) => item.status === 'PUBLISHED')
        setContent(published)
      }
    } catch (error) {
      console.error('Error fetching content:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterContent = () => {
    let filtered = content

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.type === selectedCategory)
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.tags && item.tags.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // Sort by creation date (oldest first - chronological order)
    filtered = filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())

    setFilteredContent(filtered)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'ANNOUNCEMENT':
        return 'Announcement'
      case 'NEWS':
        return 'News'
      case 'EVENT':
        return 'Event'
      default:
        return 'News'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'ANNOUNCEMENT':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'NEWS':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'EVENT':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'AWARD':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const parseFileUrls = (fileUrls: string | null | undefined): string[] => {
    if (!fileUrls) return []
    try {
      return JSON.parse(fileUrls)
    } catch {
      return []
    }
  }

  const parseSelectedThumbnails = (selectedThumbnails: string | null | undefined): string[] => {
    if (!selectedThumbnails) return []
    try {
      return JSON.parse(selectedThumbnails)
    } catch {
      return []
    }
  }

  const getDynamicThumbnail = (content: ContentItem): string | null => {
    const selectedThumbnails = parseSelectedThumbnails(content.selectedThumbnails)
    const fileUrls = parseFileUrls(content.fileUrls)
    
    if (selectedThumbnails.length > 0) {
      // For multiple thumbnails, randomly select one
      const randomIndex = Math.floor(Math.random() * selectedThumbnails.length)
      return selectedThumbnails[randomIndex] || null
    } else if (fileUrls.length > 0) {
      // Fallback to first file if no thumbnails selected
      return fileUrls[0] || null
    } else if (content.thumbnail) {
      // Fallback to thumbnail field
      return content.thumbnail
    }
    return null
  }

  // Get content for different sections
  // Featured content: The assigned featured article (regardless of date)
  const featuredContent = filteredContent.find(item => item.featured) || filteredContent[0]
  // Sidebar content: Articles 1, 2, 3, 4 (by age - oldest first, excluding featured)
  const nonFeaturedContent = filteredContent.filter(item => item.id !== featuredContent?.id)
  const sidebarContent = nonFeaturedContent.slice(0, 4) // Get articles 1-4 (index 0-3)

  return (
    <div className="min-h-screen bg-gray-50">
      <Header currentPage="/news" />

      {/* Hero Banner Section */}
      <section className="relative bg-gradient-to-br from-sky-600 via-sky-700 to-sky-800 py-12 sm:py-16 lg:py-20 overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
          style={{
            backgroundImage: `url('/images/profiles/maria-santos.jpg')`
          }}
        ></div>
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-sky-900/50 to-sky-800/50"></div>
        
        <div className="relative max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="text-center max-w-4xl mx-auto pt-16 sm:pt-20 lg:pt-24">

            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 text-white leading-tight">
              News & Announcements
              <span className="block text-sky-200">Stay Updated with SK Barangay Tulay</span>
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-sky-100 max-w-3xl mx-auto mb-6 sm:mb-8 leading-relaxed px-2">
              Get the latest updates, announcements, and news from the official youth council 
              of Barangay Tulay. Stay informed about community programs, events, and government initiatives.
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

      {/* Search and Filter Section */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
          <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4 lg:gap-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">Latest Updates</h2>
              <p className="text-sm sm:text-lg text-gray-600">
                Browse through our latest articles and announcements
                {!isLoading && filteredContent.length > 0 && (
                  <span className="ml-2 text-xs sm:text-sm text-gray-500">
                    ({filteredContent.length} {filteredContent.length === 1 ? 'article' : 'articles'} published)
                  </span>
                )}
              </p>
            </div>
            <div className="flex w-full lg:w-auto items-center gap-3 sm:gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search articles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full sm:w-80 border-gray-300 focus:border-sky-500 focus:ring-sky-500"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Filters */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className={`text-xs sm:text-sm font-medium transition-all duration-200 ${
                  selectedCategory === category.id 
                    ? 'bg-sky-600 hover:bg-sky-700 text-white shadow-sm' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
                }`}
              >
                {category.label}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:py-12">
        {isLoading ? (
          <div className="text-center py-16 sm:py-20">
            <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-b-2 border-sky-600 mx-auto mb-6 sm:mb-8"></div>
            <p className="text-gray-600 text-base sm:text-xl font-medium">Loading the latest news...</p>
          </div>
        ) : filteredContent.length > 0 ? (
          <>
            {/* Featured Post and News List Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
              {/* Featured Post - Left Section (2/3 width) */}
              {featuredContent && (
                <div className="lg:col-span-2 min-w-0">
                  <article className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 h-56 sm:h-72 lg:h-96 group border border-gray-200 min-w-0">
                    <div className="relative h-full">
                      {(() => {
                        const fileUrls = parseFileUrls(featuredContent.fileUrls)
                        console.log('Featured content fileUrls:', fileUrls.length, fileUrls)
                        const dynamicThumbnail = getDynamicThumbnail(featuredContent)
                        if (dynamicThumbnail) {
                          return (
                            <div className="w-full h-full">
                              <img 
                                src={dynamicThumbnail} 
                                alt={`${featuredContent.title} - Thumbnail`}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                            </div>
                          )
                        } else if (featuredContent.thumbnail || featuredContent.fileUrl) {
                          return (
                            <img 
                              src={featuredContent.thumbnail || featuredContent.fileUrl} 
                              alt={featuredContent.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          )
                        } else {
                          return (
                            <div className="w-full h-full bg-gradient-to-br from-sky-600 via-sky-700 to-sky-800 flex items-center justify-center">
                              <FileText className="h-12 w-12 sm:h-16 sm:w-16 text-white/50" />
                            </div>
                          )
                        }
                      })()}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
                      <div className="absolute top-4 sm:top-6 right-4 sm:right-6">
                        <Badge className="bg-white text-gray-900 text-xs sm:text-sm font-semibold px-2.5 sm:px-3 py-1 shadow-sm">
                          Featured Post
                        </Badge>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-8 text-white min-w-0">
                        <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3 md:mb-4 leading-tight break-words line-clamp-2 md:line-clamp-3">
                          {featuredContent.title}
                        </h2>
                        <p className="text-white/90 text-sm sm:text-base md:text-lg leading-relaxed line-clamp-3 mb-4 sm:mb-5 md:mb-6">
                          {featuredContent.description}
                        </p>
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center text-xs sm:text-sm text-white/80 min-w-0">
                            <User className="h-4 w-4 mr-2 flex-shrink-0" />
                            <span className="font-medium truncate">{featuredContent.author?.name || 'SK Barangay Tulay'}</span>
                            <span className="mx-2">•</span>
                            <span className="truncate">{formatDate(featuredContent.createdAt)}</span>
                          </div>
                          <Button 
                            className="bg-sky-600 hover:bg-sky-700 text-white font-medium px-4 py-2 sm:px-6 sm:py-3 shadow-sm transition-colors focus:ring-4 focus:ring-sky-200 flex-shrink-0" 
                            asChild
                          >
                            <a href={`/news/${featuredContent.id}`}>
                              Read Full Story
                              <ChevronRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                            </a>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </article>
                </div>
              )}

              {/* News List - Right Section (1/3 width) */}
              <div className="lg:col-span-1 lg:h-96 lg:overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                <div className="space-y-3 sm:space-y-4 lg:h-full lg:pr-2">
                  {sidebarContent.map((item) => (
                    <article key={item.id} className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 group border border-gray-200">
                      <div className="flex flex-col sm:flex-row h-24 sm:h-20">
                        <div className="sm:w-1/3">
                          <div className="relative h-full">
                            {(() => {
                              const dynamicThumbnail = getDynamicThumbnail(item)
                              if (dynamicThumbnail) {
                                return (
                                  <div className="grid grid-cols-1 gap-1 h-full">
                                    <img 
                                      src={dynamicThumbnail} 
                                      alt={item.title}
                                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                  </div>
                                )
                              } else if (item.thumbnail || item.fileUrl) {
                                return (
                                  <img 
                                    src={item.thumbnail || item.fileUrl} 
                                    alt={item.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                  />
                                )
                              } else {
                                return (
                                  <div className="w-full h-full bg-gradient-to-br from-sky-600 to-sky-800 flex items-center justify-center">
                                    <FileText className="h-6 w-6 text-white/50" />
                                  </div>
                                )
                              }
                            })()}
                          </div>
                        </div>
                        <div className="sm:w-2/3 p-3">
                          <div className="flex items-center text-xs text-gray-500 mb-1">
                            <span className="font-medium">{formatDate(item.createdAt)}</span>
                            <span className="mx-2">•</span>
                            <span>5 min Read</span>
                          </div>
                          <h3 className="font-semibold text-sm text-gray-900 line-clamp-2 leading-tight group-hover:text-sky-600 transition-colors">
                            <a href={`/news/${item.id}`}>
                              {item.title}
                            </a>
                          </h3>
                          <p className="mt-1 text-xs text-gray-600 line-clamp-2">
                            {item.description}
                          </p>
                          <div className="mt-1">
                            <a href={`/news/${item.id}`} className="inline-flex items-center text-[11px] font-medium text-sky-700 hover:text-sky-800">
                              Read more
                              <ChevronRight className="ml-1 h-3 w-3" />
                            </a>
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </div>

            {/* Additional News Grid */}
            {nonFeaturedContent.length > 4 && (
              <section className="mt-12 sm:mt-16">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-5 sm:mb-8 border-b-2 border-gray-200 pb-3 sm:pb-4">
                  More News
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
                  {nonFeaturedContent.slice(4).map((item) => (
                    <article key={item.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group border border-gray-200">
                      <div className="relative h-40 sm:h-48 overflow-hidden">
                        {(() => {
                          const dynamicThumbnail = getDynamicThumbnail(item)
                          if (dynamicThumbnail) {
                            return (
                              <div className="w-full h-full">
                                <img 
                                  src={dynamicThumbnail} 
                                  alt={`${item.title} - Thumbnail`}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                              </div>
                            )
                          } else if (item.thumbnail || item.fileUrl) {
                            return (
                              <img 
                                src={item.thumbnail || item.fileUrl} 
                                alt={item.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            )
                          } else {
                            return (
                              <div className="w-full h-full bg-gradient-to-br from-sky-600 to-sky-800 flex items-center justify-center">
                                <FileText className="h-8 w-8 text-white/50" />
                              </div>
                            )
                          }
                        })()}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                        <div className="absolute top-3 left-3 sm:top-4 sm:left-4">
                          <Badge className={`${getTypeColor(item.type)} text-[10px] sm:text-xs font-semibold px-2.5 py-1 sm:px-3 shadow-sm`}>
                            {getTypeLabel(item.type)}
                          </Badge>
                        </div>
                      </div>
                      <div className="p-4 sm:p-6">
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3 leading-tight group-hover:text-sky-600 transition-colors line-clamp-2">
                          <a href={`/news/${item.id}`}>
                            {item.title}
                          </a>
                        </h3>
                        <p className="text-gray-600 leading-relaxed mb-3 sm:mb-4 line-clamp-3 text-sm">
                          {item.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-xs sm:text-sm text-gray-500">
                            <User className="h-4 w-4 mr-2" />
                            <span className="font-medium">{item.author?.name || 'SK Barangay Tulay'}</span>
                            <span className="mx-2">•</span>
                            <span>{formatDate(item.createdAt)}</span>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 text-xs sm:text-sm font-medium" 
                            asChild
                          >
                            <a href={`/news/${item.id}`}>
                              Read More
                              <ChevronRight className="ml-2 h-4 w-4" />
                            </a>
                          </Button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            )}
          </>
        ) : (
          <div className="text-center py-16 sm:py-20">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 sm:mb-8">
              <Activity className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">No articles found</h3>
            <p className="text-gray-600 text-base sm:text-xl max-w-2xl mx-auto">
              {searchTerm || selectedCategory !== 'all' 
                ? 'Try adjusting your search or filter criteria to find what you\'re looking for.'
                : 'No articles are currently available. Check back soon for updates!'
              }
            </p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
} 