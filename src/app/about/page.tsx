"use client"

import { 
  Award, 
  Target, 
  Heart, 
  BookOpen, 
  TreePine, 
  ChevronRight, 
  ArrowRight,
  Star,
  Globe,
  Info,
  Loader2
} from 'lucide-react'
import { useState, useEffect } from 'react'

import Footer from '@/components/layout/footer'
import Header from '@/components/layout/header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

  const coreValues = [
    {
    icon: <Heart className="h-5 w-5 sm:h-6 sm:w-6" />,
    title: 'Community Service',
    description: 'Dedicated to serving the community through official government programs and initiatives.',
    color: 'bg-sky-50 text-sky-700'
  },
  {
    icon: <Target className="h-5 w-5 sm:h-6 sm:w-6" />,
    title: 'Youth Leadership',
    description: 'Empowering young leaders to develop essential skills for community leadership.',
    color: 'bg-sky-50 text-sky-700'
  },
  {
    icon: <BookOpen className="h-5 w-5 sm:h-6 sm:w-6" />,
    title: 'Education Support',
    description: 'Providing educational assistance and scholarship programs for deserving students.',
    color: 'bg-sky-50 text-sky-700'
  },
  {
    icon: <TreePine className="h-5 w-5 sm:h-6 sm:w-6" />,
    title: 'Environmental Protection',
    description: 'Implementing programs for environmental conservation and sustainability.',
    color: 'bg-sky-50 text-sky-700'
    }
  ]

  const achievements = [
    {
    year: '2023',
    title: 'Youth Leadership Excellence Award',
    description: 'Recognized for outstanding youth leadership and community service initiatives.',
    icon: <Award className="h-5 w-5 sm:h-6 sm:w-6" />
  },
  {
    year: '2022',
    title: 'Community Development Champion',
    description: 'Successfully implemented 15 community development projects benefiting over 500 residents.',
    icon: <Target className="h-5 w-5 sm:h-6 sm:w-6" />
  },
  {
    year: '2021',
    title: 'Environmental Protection Award',
    description: 'Led successful tree planting and clean-up campaigns across the barangay.',
    icon: <TreePine className="h-5 w-5 sm:h-6 sm:w-6" />
  },
  {
    year: '2020',
    title: 'Educational Support Program',
    description: 'Provided scholarships and educational assistance to 50 deserving students.',
    icon: <BookOpen className="h-5 w-5 sm:h-6 sm:w-6" />
  }
]



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
  performance: number
  projects: number
  achievements: number
  profileImage?: string
  avatar?: string
  lastActive: string
  joinDate: string
}

export default function AboutPage() {
  const [skMembers, setSkMembers] = useState<SKMember[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSKMembers = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('/api/sk-members')
        if (!response.ok) {
          throw new Error('Failed to fetch SK members')
        }
        const data = await response.json()
        setSkMembers(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
        console.error('Error fetching SK members:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSKMembers()
  }, [])
  return (
    <div className="min-h-screen bg-gray-50">
      <Header currentPage="/about" />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-sky-600 via-sky-700 to-sky-800 py-8 sm:py-12 lg:py-16 overflow-hidden">
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
              Official Youth Council
              <span className="block text-sky-200">Serving the Community</span>
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-sky-100 max-w-3xl mx-auto mb-6 sm:mb-8 leading-relaxed px-2">
              The Sangguniang Kabataan (SK) of Barangay Tulay is the official youth council 
              representing young people aged 15-30 in our community. We are committed to 
              providing public services and fostering youth leadership.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-8 sm:py-12 lg:py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12">
            <Card className="border border-gray-200 shadow-sm">
              <CardHeader className="pb-4 sm:pb-6">
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-sky-100 rounded-lg flex items-center justify-center">
                    <Target className="h-5 w-5 sm:h-6 sm:w-6 text-sky-600" />
                  </div>
                  <CardTitle className="text-lg sm:text-xl font-bold text-gray-900">Our Mission</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed mb-4">
                  To serve the community through official government programs, youth empowerment initiatives, 
                  and public service activities that benefit all residents of Barangay Tulay.
                </p>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  We strive to create opportunities for youth development, community engagement, 
                  and sustainable growth in accordance with local government regulations.
                </p>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 shadow-sm">
              <CardHeader className="pb-4 sm:pb-6">
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-sky-100 rounded-lg flex items-center justify-center">
                    <Globe className="h-5 w-5 sm:h-6 sm:w-6 text-sky-600" />
                  </div>
                  <CardTitle className="text-lg sm:text-xl font-bold text-gray-900">Our Vision</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed mb-4">
                  To be the leading youth council in community development, fostering a vibrant, 
                  engaged, and empowered youth population that actively contributes to the 
                  betterment of Barangay Tulay.
                </p>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  We envision a community where young people are valued partners in governance 
                  and development, working together for a sustainable future.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-8 sm:py-12 lg:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 text-gray-900">Core Values</h2>
            <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto px-2">
              The fundamental principles that guide our work and commitment to the community.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {coreValues.map((value, index) => (
              <Card key={index} className="text-center border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="pt-4 sm:pt-6 pb-4 sm:pb-6 px-3 sm:px-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-sky-100 rounded-lg flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <div className="text-sky-600">
                    {value.icon}
                    </div>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">{value.title}</h3>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Achievements */}
      <section className="py-8 sm:py-12 lg:py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 text-gray-900">Key Achievements</h2>
            <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto px-2">
              Notable accomplishments and milestones in our service to the community.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {achievements.map((achievement, index) => (
              <Card key={index} className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-3 sm:pb-4">
                  <div className="flex items-start space-x-3 sm:space-x-4">
                <div className="flex-shrink-0">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-sky-100 rounded-lg flex items-center justify-center">
                        <div className="text-sky-600">
                          {achievement.icon}
                        </div>
                  </div>
                </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 sm:gap-3 mb-2">
                        <Badge variant="secondary" className="bg-sky-50 text-sky-700 text-xs">
                          {achievement.year}
                        </Badge>
                        <Star className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500" />
                      </div>
                      <CardTitle className="text-base sm:text-lg mb-2 text-gray-900 leading-tight">{achievement.title}</CardTitle>
                </div>
              </div>
                </CardHeader>
                <CardContent className="px-4 sm:px-6">
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{achievement.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team Members */}
      <section className="py-8 sm:py-12 lg:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 text-gray-900">SK Officials</h2>
            <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto px-2">
              Elected youth officials serving the community through official government positions.
            </p>
          </div>
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="flex items-center space-x-2">
                <Loader2 className="h-6 w-6 animate-spin text-sky-600" />
                <span className="text-gray-600">Loading SK Officials...</span>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-red-600 mb-2">Failed to load SK Officials</div>
              <p className="text-gray-600 text-sm">{error}</p>
            </div>
          ) : skMembers.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-600 mb-2">No SK Officials found</div>
              <p className="text-gray-500 text-sm">Please check back later or contact the office for information.</p>
            </div>
          ) : (
            <div className="space-y-8 sm:space-y-12">
              {/* Chairman Level */}
              {skMembers.filter(member => member.role.toLowerCase().includes('chairman')).map((member) => (
                <div key={member.id} className="flex justify-center">
                  <div className="relative">
                    <Card className="text-center border-2 border-sky-200 shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-sky-50 to-white">
                      <CardContent className="pt-6 sm:pt-8 pb-6 sm:pb-8 px-6 sm:px-8">
                        <div className="relative mb-4 sm:mb-6">
                          {member.profileImage ? (
                            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full mx-auto overflow-hidden border-4 border-sky-200">
                              <img 
                                src={member.profileImage} 
                                alt={member.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-sky-100 rounded-full mx-auto flex items-center justify-center border-4 border-sky-200">
                              <span className="text-sky-600 font-bold text-lg sm:text-xl">
                                {member.avatar || member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                              </span>
                            </div>
                          )}
                          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
                            <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border-3 border-white shadow-sm ${
                              member.status === 'Active' ? 'bg-green-500' : 'bg-gray-400'
                            }`}></div>
                          </div>
                        </div>
                        <h3 className="font-bold text-gray-900 mb-2 text-lg sm:text-xl">{member.name}</h3>
                        <p className="text-sky-600 font-semibold mb-3 text-base sm:text-lg">{member.role}</p>
                        <p className="text-sm text-gray-600 mb-2">{member.email}</p>
                        <p className="text-sm text-gray-500 mb-4">{member.department}</p>
                        
                        {/* Performance Stats */}
                        <div className="grid grid-cols-3 gap-3 mb-4">
                          <div className="text-center">
                            <div className="text-sm font-bold text-gray-900">{member.performance}%</div>
                            <div className="text-xs text-gray-500">Performance</div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm font-bold text-gray-900">{member.projects}</div>
                            <div className="text-xs text-gray-500">Projects</div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm font-bold text-gray-900">{member.achievements}</div>
                            <div className="text-xs text-gray-500">Achievements</div>
                          </div>
                        </div>

                        {/* Skills */}
                        {member.skills && member.skills.length > 0 && (
                          <div className="space-y-1">
                            {member.skills.slice(0, 3).map((skill, idx) => (
                              <div key={idx} className="flex items-center justify-center text-sm text-gray-600">
                                <Star className="h-4 w-4 mr-1 text-yellow-500 flex-shrink-0" />
                                <span>{skill}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0.5 h-8 sm:h-12 bg-sky-300"></div>
                  </div>
                </div>
              ))}

              {/* Executive Level (Secretary, Treasurer) */}
              {(() => {
                const executives = skMembers.filter(member => 
                  member.role.toLowerCase().includes('secretary') || 
                  member.role.toLowerCase().includes('treasurer')
                );
                return executives.length > 0 ? (
                  <div className="flex justify-center">
                    <div className="relative">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8">
                        {executives.map((member) => (
                          <Card key={member.id} className="text-center border border-sky-200 shadow-md hover:shadow-lg transition-shadow bg-white">
                            <CardContent className="pt-4 sm:pt-6 pb-4 sm:pb-6 px-4 sm:px-6">
                  <div className="relative mb-3 sm:mb-4">
                                {member.profileImage ? (
                                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full mx-auto overflow-hidden border-3 border-sky-200">
                                    <img 
                                      src={member.profileImage} 
                                      alt={member.name}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                ) : (
                                  <div className="w-14 h-14 sm:w-16 sm:h-16 bg-sky-100 rounded-full mx-auto flex items-center justify-center border-3 border-sky-200">
                                    <span className="text-sky-600 font-semibold text-base sm:text-lg">
                                      {member.avatar || member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                    </span>
                    </div>
                                )}
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
                                  <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full border-2 border-white shadow-sm ${
                                    member.status === 'Active' ? 'bg-green-500' : 'bg-gray-400'
                                  }`}></div>
                                </div>
                              </div>
                              <h3 className="font-semibold text-gray-900 mb-1 text-base sm:text-lg">{member.name}</h3>
                              <p className="text-sky-600 font-medium mb-2 text-sm sm:text-base">{member.role}</p>
                              <p className="text-xs text-gray-600 mb-2">{member.email}</p>
                              <p className="text-xs text-gray-500 mb-3">{member.department}</p>
                              
                              {/* Performance Stats */}
                              <div className="grid grid-cols-3 gap-2 mb-3">
                                <div className="text-center">
                                  <div className="text-xs font-semibold text-gray-900">{member.performance}%</div>
                                  <div className="text-xs text-gray-500">Performance</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-xs font-semibold text-gray-900">{member.projects}</div>
                                  <div className="text-xs text-gray-500">Projects</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-xs font-semibold text-gray-900">{member.achievements}</div>
                                  <div className="text-xs text-gray-500">Achievements</div>
                                </div>
                              </div>

                              {/* Skills */}
                              {member.skills && member.skills.length > 0 && (
                                <div className="space-y-1">
                                  {member.skills.slice(0, 2).map((skill, idx) => (
                                    <div key={idx} className="flex items-center justify-center text-xs text-gray-600">
                                      <Star className="h-3 w-3 mr-1 text-yellow-500 flex-shrink-0" />
                                      <span>{skill}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0.5 h-8 sm:h-12 bg-sky-300"></div>
                    </div>
                  </div>
                ) : null;
              })()}

              {/* Councilors Level */}
              {(() => {
                const councilors = skMembers.filter(member => 
                  member.role.toLowerCase().includes('councilor') ||
                  member.role.toLowerCase().includes('member')
                );
                return councilors.length > 0 ? (
                  <div className="flex justify-center">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                      {councilors.map((member) => (
                        <Card key={member.id} className="text-center border border-gray-200 shadow-sm hover:shadow-md transition-shadow bg-white">
                          <CardContent className="pt-4 sm:pt-6 pb-4 sm:pb-6 px-3 sm:px-4">
                            <div className="relative mb-3 sm:mb-4">
                              {member.profileImage ? (
                                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full mx-auto overflow-hidden border-2 border-gray-200">
                                  <img 
                                    src={member.profileImage} 
                                    alt={member.name}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              ) : (
                                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gray-100 rounded-full mx-auto flex items-center justify-center border-2 border-gray-200">
                                  <span className="text-gray-600 font-semibold text-sm sm:text-base">
                                    {member.avatar || member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                  </span>
                                </div>
                              )}
                              <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
                                <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full border-2 border-white shadow-sm ${
                                  member.status === 'Active' ? 'bg-green-500' : 'bg-gray-400'
                                }`}></div>
                    </div>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">{member.name}</h3>
                            <p className="text-sky-600 font-medium mb-2 text-xs sm:text-sm">{member.role}</p>
                            <p className="text-xs text-gray-600 mb-2 leading-tight">{member.email}</p>
                            <p className="text-xs text-gray-500 mb-3 leading-tight">{member.department}</p>
                            
                            {/* Performance Stats */}
                            <div className="grid grid-cols-3 gap-2 mb-3">
                              <div className="text-center">
                                <div className="text-xs font-semibold text-gray-900">{member.performance}%</div>
                                <div className="text-xs text-gray-500">Performance</div>
                              </div>
                              <div className="text-center">
                                <div className="text-xs font-semibold text-gray-900">{member.projects}</div>
                                <div className="text-xs text-gray-500">Projects</div>
                              </div>
                              <div className="text-center">
                                <div className="text-xs font-semibold text-gray-900">{member.achievements}</div>
                                <div className="text-xs text-gray-500">Achievements</div>
                              </div>
                            </div>

                            {/* Skills */}
                            {member.skills && member.skills.length > 0 && (
                  <div className="space-y-1">
                                {member.skills.slice(0, 2).map((skill, idx) => (
                      <div key={idx} className="flex items-center justify-center text-xs text-gray-600 leading-tight">
                        <Star className="h-3 w-3 mr-1 text-yellow-500 flex-shrink-0" />
                                    <span className="text-xs">{skill}</span>
                      </div>
                    ))}
                                {member.skills.length > 2 && (
                                  <div className="text-xs text-gray-500">
                                    +{member.skills.length - 2} more skills
                                  </div>
                                )}
                  </div>
                            )}
                </CardContent>
              </Card>
            ))}
          </div>
                  </div>
                ) : null;
              })()}
            </div>
          )}
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-8 sm:py-12 lg:py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 text-center">
          <div className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 bg-sky-50 rounded-md text-sky-700 text-xs sm:text-sm font-medium mb-4 sm:mb-6 border border-sky-200">
            <Info className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
            Get in Touch
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6 text-gray-900">Contact Our Office</h2>
          <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8 max-w-2xl mx-auto px-2 leading-relaxed">
            For inquiries about our programs, youth registration, or community services, 
            please contact SK Barangay Tulay through our official channels.
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
              <a href="/auth/register">
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