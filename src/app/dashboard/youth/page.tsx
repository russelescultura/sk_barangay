"use client"

import { 
  UserCheck, 
  BarChart3, 
  Plus, 
  Edit, 
  Trash2, 
  Phone, 
  MapPin, 
  GraduationCap,
  Award,
  Users,
  Calendar,
  TrendingUp,
  Eye
} from 'lucide-react'
import { useState, useEffect } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Map } from '@/components/ui/map'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'

interface YouthProfile {
  id: number
  trackingId: string
  // Basic Information
  fullName: string
  dateOfBirth: string
  age: number
  sex: string
  civilStatus: string
  profilePicture?: string
  
  // Contact & Address
  mobileNumber: string
  emailAddress?: string
  barangay: string
  streetAddress: string
  
  // Educational Background
  educationLevel: string
  gradeLevel?: string
  schoolName: string
  courseStrand?: string
  isGraduated: boolean
  lastSchoolYear?: string
  
  // Skills and Interests
  skills: string
  hobbies: string
  preferredPrograms: string
  
  // Employment Status
  isEmployed: boolean
  occupation?: string
  workingHours?: string
  
  // Community Involvement
  skMembership: boolean
  volunteerExperience: string
  leadershipRoles: string
  
  // Others
  isPWD: boolean
  pwdType?: string
  indigenousGroup?: string
  isSoloParent: boolean
  specialCases?: string
  
  // Emergency Contact
  emergencyContactPerson?: string
  emergencyContactNumber?: string
  emergencyRelationship?: string
  
  // Location coordinates
  latitude?: number
  longitude?: number
  
  // System Fields
  status: string
  committee: string
  participation: number
  dateOfRegistration: string
  lastActivity: string
  createdAt: string
  updatedAt: string
}

export default function YouthProfilingPage() {
  const [activeTab, setActiveTab] = useState('profiles')
  const [youthProfiles, setYouthProfiles] = useState<YouthProfile[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterAge, setFilterAge] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingProfile, setEditingProfile] = useState<YouthProfile | null>(null)
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [viewingProfile, setViewingProfile] = useState<YouthProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null)
  const [profilePicturePreview, setProfilePicturePreview] = useState<string | null>(null)
  const [removeProfilePicture, setRemoveProfilePicture] = useState(false)
  const [selectedLatitude, setSelectedLatitude] = useState<number | undefined>()
  const [selectedLongitude, setSelectedLongitude] = useState<number | undefined>()

  // Helper function to format date for HTML date input
  const formatDateForInput = (dateString: string | undefined): string => {
    if (!dateString) return ''
    try {
      const date = new Date(dateString)
      return date.toISOString().split('T')[0] // Returns YYYY-MM-DD format
    } catch (error) {
      console.error('Error formatting date:', error)
      return ''
    }
  }

  // Sample data - replace with API call
  useEffect(() => {
    const loadYouthProfiles = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('/api/youth')
        if (!response.ok) {
          throw new Error('Failed to fetch youth profiles')
        }
        const data = await response.json()
        setYouthProfiles(data)
      } catch (error) {
        console.error('Failed to load youth profiles:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadYouthProfiles()
  }, [])

  // Update location coordinates when editing profile changes
  useEffect(() => {
    if (editingProfile) {
      setSelectedLatitude(editingProfile.latitude)
      setSelectedLongitude(editingProfile.longitude)
    } else {
      setSelectedLatitude(undefined)
      setSelectedLongitude(undefined)
    }
  }, [editingProfile])

  const handleCreateYouth = async (formData: any) => {
    try {
      const response = await fetch('/api/youth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create youth profile')
      }

      const newProfile = await response.json()
      setYouthProfiles(prev => [newProfile, ...prev])
      handleDialogClose()
    } catch (error) {
      console.error('Failed to create youth profile:', error)
      // Use a more user-friendly error display instead of alert
      const errorMessage = error instanceof Error ? error.message : 'Failed to create youth profile'
      // You can implement a toast notification here instead of alert
      console.error(errorMessage)
    }
  }

  const handleUpdateYouth = async (id: number, formData: any) => {
    try {
      const response = await fetch(`/api/youth/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update youth profile')
      }

      const updatedProfile = await response.json()
      setYouthProfiles(prev => prev.map(profile => 
        profile.id === id ? updatedProfile : profile
      ))
      handleDialogClose()
    } catch (error) {
      console.error('Failed to update youth profile:', error)
      // Use a more user-friendly error display instead of alert
      const errorMessage = error instanceof Error ? error.message : 'Failed to update youth profile'
      // You can implement a toast notification here instead of alert
      console.error(errorMessage)
    }
  }

  const handleDeleteYouth = async (id: number) => {
    if (!confirm('Are you sure you want to delete this youth profile?')) {
      return
    }

    try {
      const response = await fetch(`/api/youth/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete youth profile')
      }

      setYouthProfiles(prev => prev.filter(profile => profile.id !== id))
    } catch (error) {
      console.error('Failed to delete youth profile:', error)
      // Use a more user-friendly error display instead of alert
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete youth profile'
      // You can implement a toast notification here instead of alert
      console.error(errorMessage)
    }
  }

  const handleProfilePictureChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setProfilePictureFile(file)
      // Create a preview for the UI
      const reader = new FileReader()
      reader.onload = (e) => {
        setProfilePicturePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const resetProfilePicture = () => {
    setProfilePictureFile(null)
    setProfilePicturePreview(null)
    setRemoveProfilePicture(false)
  }

  const handleLocationSelect = (lat: number, lng: number) => {
    setSelectedLatitude(lat)
    setSelectedLongitude(lng)
  }

  const uploadProfilePicture = async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append('profilePicture', file)
    
    try {
      const response = await fetch('/api/upload-profile-picture', {
        method: 'POST',
        body: formData,
      })
      
      if (!response.ok) {
        throw new Error('Failed to upload profile picture')
      }
      
      const result = await response.json()
      return result.filePath // This should return something like "/images/profiles/filename.jpg"
    } catch (error) {
      console.error('Failed to upload profile picture:', error)
      throw error
    }
  }

  const handleFormSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    
    const form = event.target as HTMLFormElement
    const formData = new FormData(form)
    const data: any = {}
    
    // Collect form data and handle boolean conversions
    Array.from(formData.entries()).forEach(([key, value]) => {
      if (key.startsWith('dialog-')) {
        const fieldName = key.replace('dialog-', '')
        
        // Handle boolean fields
        if (['isGraduated', 'isEmployed', 'skMembership', 'isPWD', 'isSoloParent'].includes(fieldName)) {
          data[fieldName] = value === 'true'
        } else {
          data[fieldName] = value
        }
      }
    })

    // Remove gradeLevel if it's empty to avoid database issues
    if (data.gradeLevel === '') {
      delete data.gradeLevel
    }

    // Remove other empty string fields to avoid database issues
    const fieldsToClean = [
      'emailAddress', 'civilStatus', 'courseStrand', 'lastSchoolYear',
      'skills', 'hobbies', 'preferredPrograms', 'occupation', 'workingHours',
      'volunteerExperience', 'leadershipRoles', 'pwdType', 'indigenousGroup',
      'specialCases', 'emergencyContactPerson', 'emergencyContactNumber',
      'emergencyRelationship'
    ]
    
    fieldsToClean.forEach(field => {
      if (data[field] === '') {
        delete data[field]
      }
    })

    // Handle profile picture upload or removal
    if (profilePictureFile) {
      try {
        const filePath = await uploadProfilePicture(profilePictureFile)
        data.profilePicture = filePath // Store the local file path
      } catch (error) {
        console.error('Failed to upload profile picture:', error)
        // Continue without the profile picture if upload fails
      }
    } else if (removeProfilePicture) {
      // User wants to remove the profile picture
      data.profilePicture = null
    }

    // Add location coordinates if selected
    if (selectedLatitude !== undefined && selectedLongitude !== undefined) {
      data.latitude = selectedLatitude
      data.longitude = selectedLongitude
    }

    // Calculate age from date of birth
    if (data.dateOfBirth) {
      const birthDate = new Date(data.dateOfBirth)
      const today = new Date()
      const age = today.getFullYear() - birthDate.getFullYear()
      const monthDiff = today.getMonth() - birthDate.getMonth()
      data.age = monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate()) ? age - 1 : age
    }

    // Generate tracking ID if creating new profile
    if (!editingProfile) {
      data.trackingId = `SK-${Date.now()}`
      data.dateOfRegistration = new Date().toISOString()
      data.lastActivity = new Date().toISOString()
      data.createdAt = new Date().toISOString()
      data.updatedAt = new Date().toISOString()
    } else {
      data.updatedAt = new Date().toISOString()
    }

    try {
      if (editingProfile) {
        await handleUpdateYouth(editingProfile.id, data)
      } else {
        await handleCreateYouth(data)
      }
    } catch (error) {
      console.error('Form submission error:', error)
    }
  }

  const filteredProfiles = youthProfiles.filter(profile => {
    const matchesSearch = profile.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         profile.schoolName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         profile.committee.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesAge = filterAge === 'all' || 
                      (filterAge === '15-17' && profile.age >= 15 && profile.age <= 17) ||
                      (filterAge === '18-20' && profile.age >= 18 && profile.age <= 20) ||
                      (filterAge === '21+' && profile.age >= 21)
    
    const matchesStatus = filterStatus === 'all' || profile.status === filterStatus
    
    return matchesSearch && matchesAge && matchesStatus
  })

  const stats = {
    total: youthProfiles.length,
    active: youthProfiles.filter(p => p.status === 'Active').length,
    inactive: youthProfiles.filter(p => p.status === 'Inactive').length,
    graduated: youthProfiles.filter(p => p.status === 'Graduated').length,
    avgParticipation: Math.round(youthProfiles.reduce((sum, p) => sum + p.participation, 0) / youthProfiles.length),
    committees: Array.from(new Set(youthProfiles.map(p => p.committee))).length
  }

  const committeeStats = youthProfiles.reduce((acc, profile) => {
    acc[profile.committee] = (acc[profile.committee] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const handleDialogClose = () => {
    setShowAddDialog(false)
    setEditingProfile(null)
    resetProfilePicture()
    setSelectedLatitude(undefined)
    setSelectedLongitude(undefined)
    
    // Reset form if it exists
    setTimeout(() => {
      const form = document.querySelector('form') as HTMLFormElement
      if (form) {
        form.reset()
      }
    }, 100)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 lg:py-8">
        {/* Header Section - Mobile First */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4 sm:mb-6 lg:mb-8 pt-16 lg:pt-8">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">SK Youth Profiling</h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-2">Manage and track youth member profiles, statistics, and engagement</p>
          </div>
          <Button onClick={() => setShowAddDialog(true)} className="flex items-center gap-2 w-full sm:w-auto h-10 sm:h-9">
            <Plus className="h-4 w-4" />
            Add New Youth
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
          <TabsList className="grid w-full grid-cols-2 gap-1 p-1 bg-muted/30 rounded-lg">
            <TabsTrigger value="profiles" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2 sm:py-1.5 px-2 sm:px-3 data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-foreground transition-all duration-200">
              <UserCheck className="h-3 w-3 sm:h-4 sm:w-4" />
              Profiles
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2 sm:py-1.5 px-2 sm:px-3 data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-foreground transition-all duration-200">
              <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4" />
              Statistics
            </TabsTrigger>
          </TabsList>

        {/* Profiles Tab */}
        <TabsContent value="profiles" className="flex-1 overflow-y-auto pb-6">
          <Card className="h-full p-3 sm:p-4">
            <CardHeader className="p-0 pb-3 sm:pb-4">
              <CardTitle className="text-lg sm:text-xl">Youth Profiles</CardTitle>
              <CardDescription className="text-sm sm:text-base">View and manage all youth member profiles</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4 overflow-y-auto p-0">
              {/* Search and Filter Controls */}
              <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <Label htmlFor="search" className="text-xs sm:text-sm">Search</Label>
                  <Input 
                    id="search" 
                    placeholder="Search by name, school, or committee"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="h-10 sm:h-11 text-sm sm:text-base"
                  />
                </div>
                <div>
                  <Label htmlFor="filterAge" className="text-xs sm:text-sm">Age Filter</Label>
                  <select 
                    id="filterAge" 
                    className="w-full p-2 sm:p-3 border rounded-md text-sm sm:text-base h-10 sm:h-11"
                    value={filterAge}
                    onChange={(e) => setFilterAge(e.target.value)}
                  >
                    <option value="all">All Ages</option>
                    <option value="15-17">15-17 years</option>
                    <option value="18-20">18-21 years</option>
                    <option value="22-25">22-25 years</option>
                    <option value="26+">26+ years</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="filterStatus" className="text-xs sm:text-sm">Status Filter</Label>
                  <select 
                    id="filterStatus" 
                    className="w-full p-2 sm:p-3 border rounded-md text-sm sm:text-base h-10 sm:h-11"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="all">All Status</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Graduated">Graduated</option>
                  </select>
                </div>
              </div>

              {/* Results Section */}
              <div className="border-t pt-3 sm:pt-4">
                {isLoading ? (
                  <div className="flex items-center justify-center py-6 sm:py-8">
                    <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-primary"></div>
                  </div>
                ) : filteredProfiles.length === 0 ? (
                  <div className="text-center py-6 sm:py-8 text-muted-foreground">
                    <p className="text-sm sm:text-base">No youth members found matching your criteria</p>
                  </div>
                ) : (
                  <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredProfiles.map((profile) => (
                      <Card key={profile.id} className="hover:shadow-md transition-shadow p-3 sm:p-4">
                        <CardContent className="p-0">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2 sm:gap-3">
                              {/* Profile Picture */}
                              <div className="flex-shrink-0">
                                {profile.profilePicture ? (
                                  <img
                                    src={profile.profilePicture}
                                    alt={`${profile.fullName}'s profile`}
                                    className="h-10 w-10 sm:h-12 sm:w-12 rounded-full object-cover border-2 border-gray-200"
                                    onError={(e) => {
                                      // Fallback to default avatar if image fails to load
                                      const target = e.target as HTMLImageElement
                                      target.src = '/images/profiles/default-avatar.jpg'
                                    }}
                                  />
                                ) : (
                                  <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gray-200 flex items-center justify-center">
                                    <UserCheck className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400" />
                                  </div>
                                )}
                              </div>
                              <div>
                                <h3 className="font-semibold text-base sm:text-lg">{profile.fullName}</h3>
                                <p className="text-xs sm:text-sm text-muted-foreground">{profile.age} years old • {profile.sex}</p>
                              </div>
                            </div>
                            <Badge variant={profile.status === 'Active' ? 'default' : 'secondary'} className="text-xs sm:text-sm px-2 sm:px-3 py-1">
                              {profile.status}
                            </Badge>
                          </div>
                          
                          <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                            <div className="flex items-center gap-2">
                              <Phone className="h-3 w-3 text-muted-foreground" />
                              <span className="truncate">{profile.mobileNumber}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-3 w-3 text-muted-foreground" />
                              <span className="truncate">{profile.barangay}, {profile.streetAddress}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <GraduationCap className="h-3 w-3 text-muted-foreground" />
                              <span className="truncate">{profile.schoolName}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Award className="h-3 w-3 text-muted-foreground" />
                              <span className="truncate">{profile.committee}</span>
                            </div>
                          </div>

                          <div className="mt-3 pt-3 border-t">
                            <div className="flex items-center justify-between text-xs sm:text-sm">
                              <span>Participation:</span>
                              <span className="font-medium">{profile.participation} events</span>
                            </div>
                            <div className="flex items-center justify-between text-xs sm:text-sm">
                              <span>Last Activity:</span>
                              <span className="text-muted-foreground">{profile.lastActivity}</span>
                            </div>
                          </div>

                          <div className="mt-3 flex flex-col sm:flex-row gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setViewingProfile(profile)
                                setShowViewDialog(true)
                              }}
                              className="w-full sm:w-auto h-9 sm:h-8 text-xs sm:text-sm"
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              View
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setEditingProfile(profile)}
                              className="w-full sm:w-auto h-9 sm:h-8 text-xs sm:text-sm"
                            >
                              <Edit className="h-3 w-3 mr-1" />
                              Edit
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-red-600 hover:text-red-700 w-full sm:w-auto h-9 sm:h-8 text-xs sm:text-sm"
                              onClick={() => handleDeleteYouth(profile.id)}
                            >
                              <Trash2 className="h-3 w-3 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Statistics Tab */}
        <TabsContent value="stats" className="flex-1 overflow-y-auto pb-6">
          <div className="grid gap-3 sm:gap-4 grid-cols-2 md:grid-cols-2 lg:grid-cols-4">
            <Card className="p-3 sm:p-4">
              <CardContent className="p-0">
                <div className="flex items-center gap-2">
                  <Users className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground">Total Members</p>
                    <p className="text-lg sm:text-xl lg:text-2xl font-bold">{stats.total}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="p-3 sm:p-4">
              <CardContent className="p-0">
                <div className="flex items-center gap-2">
                  <UserCheck className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground">Active Members</p>
                    <p className="text-lg sm:text-xl lg:text-2xl font-bold">{stats.active}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="p-3 sm:p-4">
              <CardContent className="p-0">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground">Avg Participation</p>
                    <p className="text-lg sm:text-xl lg:text-2xl font-bold">{stats.avgParticipation}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="p-3 sm:p-4">
              <CardContent className="p-0">
                <div className="flex items-center gap-2">
                  <Award className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600" />
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground">Committees</p>
                    <p className="text-lg sm:text-xl lg:text-2xl font-bold">{stats.committees}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 mt-4 sm:mt-6">
            <Card className="p-3 sm:p-4">
              <CardHeader className="p-0 pb-3 sm:pb-4">
                <CardTitle className="text-base sm:text-lg">Committee Distribution</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-2 sm:space-y-3">
                  {Object.entries(committeeStats).map(([committee, count]) => (
                    <div key={committee} className="flex items-center justify-between">
                      <span className="text-xs sm:text-sm">{committee}</span>
                      <Badge variant="outline" className="text-xs sm:text-sm px-2 sm:px-3 py-1">{count} members</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="p-3 sm:p-4">
              <CardHeader className="p-0 pb-3 sm:pb-4">
                <CardTitle className="text-base sm:text-lg">Status Overview</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm">Active</span>
                    <Badge variant="default" className="text-xs sm:text-sm px-2 sm:px-3 py-1">{stats.active}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm">Inactive</span>
                    <Badge variant="secondary" className="text-xs sm:text-sm px-2 sm:px-3 py-1">{stats.inactive}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm">Graduated</span>
                    <Badge variant="outline" className="text-xs sm:text-sm px-2 sm:px-3 py-1">{stats.graduated}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>

      {/* Add/Edit Dialog */}
      <Dialog open={showAddDialog || !!editingProfile} onOpenChange={handleDialogClose}>
        <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[85vh] overflow-hidden flex flex-col mx-4 sm:mx-0">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="text-lg sm:text-xl">{editingProfile ? 'Edit Youth Profile' : 'Add New Youth Member'}</DialogTitle>
            <DialogDescription className="text-sm sm:text-base">
              {editingProfile ? 'Update the youth member information' : 'Register a new youth member to the SK program'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto space-y-3 sm:space-y-4 pr-2">
            <form onSubmit={handleFormSubmit}>
              {/* Basic Information Section */}
              <div className="border-b pb-3 sm:pb-4">
                <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Basic Information</h3>
                <div className="grid gap-3 sm:gap-4 grid-cols-1 md:grid-cols-2">
                  <div>
                    <Label htmlFor="dialog-fullName" className="text-xs sm:text-sm">Full Name *</Label>
                    <Input 
                      id="dialog-fullName" 
                      name="dialog-fullName"
                      placeholder="Enter full name"
                      defaultValue={editingProfile?.fullName}
                      required
                      className="h-10 sm:h-11 text-sm sm:text-base"
                    />
                  </div>
                  <div>
                    <Label htmlFor="dialog-dateOfBirth" className="text-xs sm:text-sm">Date of Birth *</Label>
                    <Input 
                      id="dialog-dateOfBirth" 
                      name="dialog-dateOfBirth"
                      type="date"
                      defaultValue={formatDateForInput(editingProfile?.dateOfBirth)}
                      required
                      className="h-10 sm:h-11 text-sm sm:text-base"
                    />
                  </div>
                  <div>
                    <Label htmlFor="dialog-sex" className="text-xs sm:text-sm">Sex/Gender *</Label>
                    <select 
                      id="dialog-sex" 
                      name="dialog-sex"
                      className="w-full p-2 sm:p-3 border rounded-md text-sm sm:text-base h-10 sm:h-11"
                      defaultValue={editingProfile?.sex}
                      required
                    >
                      <option value="">Select gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="dialog-civilStatus" className="text-xs sm:text-sm">Civil Status</Label>
                    <select 
                      id="dialog-civilStatus" 
                      name="dialog-civilStatus"
                      className="w-full p-2 sm:p-3 border rounded-md text-sm sm:text-base h-10 sm:h-11"
                      defaultValue={editingProfile?.civilStatus}
                    >
                      <option value="">Select status</option>
                      <option value="Single">Single</option>
                      <option value="Married">Married</option>
                      <option value="Widowed">Widowed</option>
                      <option value="Divorced">Divorced</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="dialog-profilePicture">Profile Picture</Label>
                    {profilePicturePreview ? (
                      <div className="mt-1 flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <img
                            className="h-16 w-16 rounded-full object-cover"
                            src={profilePicturePreview}
                            alt="Profile preview"
                          />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-600">{profilePictureFile?.name}</p>
                          <button
                            type="button"
                            onClick={resetProfilePicture}
                            className="text-sm text-red-600 hover:text-red-800"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ) : editingProfile?.profilePicture ? (
                      <div className="mt-1 flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <img
                            className="h-16 w-16 rounded-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                            src={editingProfile.profilePicture}
                            alt="Current profile"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.src = '/images/profiles/default-avatar.jpg'
                            }}
                            onClick={() => {
                              // Trigger file input when clicking on the image
                              const fileInput = document.getElementById('dialog-profilePicture') as HTMLInputElement
                              if (fileInput) {
                                fileInput.click()
                              }
                            }}
                          />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-600">Current profile picture</p>
                          <p className="text-xs text-gray-500 mb-2">Click the image or button below to replace</p>
                          {removeProfilePicture && (
                            <p className="text-xs text-red-600 mb-2">⚠️ Profile picture will be removed when you save</p>
                          )}
                          <div className="flex gap-2">
                            <label
                              htmlFor="dialog-profilePicture"
                              className="cursor-pointer bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1 rounded-md text-sm font-medium transition-colors"
                            >
                              Upload New Image
                              <input
                                id="dialog-profilePicture"
                                name="dialog-profilePicture"
                                type="file"
                                className="sr-only"
                                accept="image/*"
                                onChange={handleProfilePictureChange}
                              />
                            </label>
                            <button
                              type="button"
                              onClick={() => {
                                setRemoveProfilePicture(true)
                              }}
                              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                                removeProfilePicture 
                                  ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                                  : 'text-red-600 hover:text-red-800 hover:bg-red-50'
                              }`}
                            >
                              {removeProfilePicture ? 'Removing...' : 'Remove'}
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                        <div className="space-y-1 text-center">
                          <svg
                            className="mx-auto h-12 w-12 text-gray-400"
                            stroke="currentColor"
                            fill="none"
                            viewBox="0 0 48 48"
                            aria-hidden="true"
                          >
                            <path
                              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                              strokeWidth={2}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          <div className="flex text-sm text-gray-600">
                            <label
                              htmlFor="dialog-profilePicture"
                              className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-primary-dark focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary"
                            >
                              <span>Upload a file</span>
                              <input
                                id="dialog-profilePicture"
                                name="dialog-profilePicture"
                                type="file"
                                className="sr-only"
                                accept="image/*"
                                onChange={handleProfilePictureChange}
                              />
                            </label>
                            <p className="pl-1">or drag and drop</p>
                          </div>
                          <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Contact & Address Section */}
              <div className="border-b pb-3 sm:pb-4">
                <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Contact & Address</h3>
                <div className="grid gap-3 sm:gap-4 grid-cols-1 md:grid-cols-2">
                  <div>
                    <Label htmlFor="dialog-mobileNumber">Mobile Number *</Label>
                    <Input 
                      id="dialog-mobileNumber" 
                      name="dialog-mobileNumber"
                      placeholder="Enter mobile number"
                      defaultValue={editingProfile?.mobileNumber}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="dialog-emailAddress">Email Address</Label>
                    <Input 
                      id="dialog-emailAddress" 
                      name="dialog-emailAddress"
                      type="email"
                      placeholder="Enter email address"
                      defaultValue={editingProfile?.emailAddress}
                    />
                  </div>
                  <div>
                    <Label htmlFor="dialog-barangay">Barangay *</Label>
                    <Input 
                      id="dialog-barangay" 
                      name="dialog-barangay"
                      placeholder="Enter barangay"
                      defaultValue={editingProfile?.barangay}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="dialog-streetAddress">Street Address/Purok *</Label>
                    <Input 
                      id="dialog-streetAddress" 
                      name="dialog-streetAddress"
                      placeholder="Enter street address"
                      defaultValue={editingProfile?.streetAddress}
                      required
                    />
                  </div>
                </div>
                
                {/* Location Map Section */}
                <div className="mt-4">
                  <Label>Location Pin (Optional)</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    Click on the map to pin the exact location or use the search to find an address
                  </p>
                  <Map
                    latitude={selectedLatitude}
                    longitude={selectedLongitude}
                    onLocationSelect={handleLocationSelect}
                    className="w-full h-64 rounded-md border"
                  />
                  {selectedLatitude && selectedLongitude && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Selected: {selectedLatitude.toFixed(6)}, {selectedLongitude.toFixed(6)}
                    </p>
                  )}
                </div>
              </div>

              {/* Educational Background Section */}
              <div className="border-b pb-4">
                <h3 className="text-lg font-semibold mb-4">Educational Background</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="dialog-educationLevel">Current Education Level *</Label>
                    <select 
                      id="dialog-educationLevel" 
                      name="dialog-educationLevel"
                      className="w-full p-2 border rounded-md"
                      defaultValue={editingProfile?.educationLevel}
                      required
                      onChange={(e) => {
                        const gradeLevelSelect = document.getElementById('dialog-gradeLevel') as HTMLSelectElement
                        if (gradeLevelSelect) {
                          gradeLevelSelect.value = ''
                        }
                      }}
                    >
                      <option value="">Select education level</option>
                      <option value="Elementary">Elementary</option>
                      <option value="High School">High School</option>
                      <option value="Senior High School">Senior High School</option>
                      <option value="College">College</option>
                      <option value="Graduate School">Graduate School</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="dialog-gradeLevel">Grade/Year Level</Label>
                    <select 
                      id="dialog-gradeLevel" 
                      name="dialog-gradeLevel"
                      className="w-full p-2 border rounded-md"
                      defaultValue={editingProfile?.gradeLevel}
                    >
                      <option value="">Select grade level</option>
                      <optgroup label="Elementary">
                        <option value="Grade 1">Grade 1</option>
                        <option value="Grade 2">Grade 2</option>
                        <option value="Grade 3">Grade 3</option>
                        <option value="Grade 4">Grade 4</option>
                        <option value="Grade 5">Grade 5</option>
                        <option value="Grade 6">Grade 6</option>
                      </optgroup>
                      <optgroup label="High School">
                        <option value="Grade 7">Grade 7</option>
                        <option value="Grade 8">Grade 8</option>
                        <option value="Grade 9">Grade 9</option>
                        <option value="Grade 10">Grade 10</option>
                      </optgroup>
                      <optgroup label="Senior High School">
                        <option value="Grade 11">Grade 11</option>
                        <option value="Grade 12">Grade 12</option>
                      </optgroup>
                      <optgroup label="College">
                        <option value="1st Year">1st Year</option>
                        <option value="2nd Year">2nd Year</option>
                        <option value="3rd Year">3rd Year</option>
                        <option value="4th Year">4th Year</option>
                        <option value="5th Year">5th Year</option>
                      </optgroup>
                      <optgroup label="Graduate School">
                        <option value="1st Year">1st Year</option>
                        <option value="2nd Year">2nd Year</option>
                        <option value="3rd Year">3rd Year</option>
                        <option value="4th Year">4th Year</option>
                        <option value="4rth year">4rth year</option>
                      </optgroup>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="dialog-schoolName">School Name *</Label>
                    <Input 
                      id="dialog-schoolName" 
                      name="dialog-schoolName"
                      placeholder="Enter school name"
                      defaultValue={editingProfile?.schoolName}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="dialog-courseStrand">Course/Strand (if SHS/College)</Label>
                    <Input 
                      id="dialog-courseStrand" 
                      name="dialog-courseStrand"
                      placeholder="e.g., STEM, ABM, BS Computer Science"
                      defaultValue={editingProfile?.courseStrand}
                    />
                  </div>
                  <div>
                    <Label htmlFor="dialog-isGraduated">Graduated?</Label>
                    <select 
                      id="dialog-isGraduated" 
                      name="dialog-isGraduated"
                      className="w-full p-2 border rounded-md"
                      defaultValue={editingProfile?.isGraduated?.toString()}
                    >
                      <option value="">Select status</option>
                      <option value="true">Yes</option>
                      <option value="false">No</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="dialog-lastSchoolYear">Last School Year Attended</Label>
                    <Input 
                      id="dialog-lastSchoolYear" 
                      name="dialog-lastSchoolYear"
                      placeholder="e.g., 2023-2024"
                      defaultValue={editingProfile?.lastSchoolYear}
                    />
                  </div>
                </div>
              </div>

              {/* Skills and Interests Section */}
              <div className="border-b pb-4">
                <h3 className="text-lg font-semibold mb-4">Skills and Interests</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="dialog-skills">Skills</Label>
                    <Input 
                      id="dialog-skills" 
                      name="dialog-skills"
                      placeholder="e.g., dancing"
                      defaultValue={editingProfile?.skills || ''}
                    />
                  </div>
                  <div>
                    <Label htmlFor="dialog-hobbies">Hobbies/Interests</Label>
                    <Input 
                      id="dialog-hobbies" 
                      name="dialog-hobbies"
                      placeholder="e.g., reading"
                      defaultValue={editingProfile?.hobbies || ''}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="dialog-preferredPrograms">Preferred SK Programs</Label>
                    <Input 
                      id="dialog-preferredPrograms" 
                      name="dialog-preferredPrograms"
                      placeholder="e.g., sports"
                      defaultValue={editingProfile?.preferredPrograms || ''}
                    />
                  </div>
                </div>
              </div>

              {/* Employment Status Section */}
              <div className="border-b pb-4">
                <h3 className="text-lg font-semibold mb-4">Employment Status</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="dialog-isEmployed">Employed?</Label>
                    <select 
                      id="dialog-isEmployed" 
                      name="dialog-isEmployed"
                      className="w-full p-2 border rounded-md"
                      defaultValue={editingProfile?.isEmployed?.toString()}
                    >
                      <option value="">Select status</option>
                      <option value="true">Yes</option>
                      <option value="false">No</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="dialog-occupation">Occupation (if employed)</Label>
                    <Input 
                      id="dialog-occupation" 
                      name="dialog-occupation"
                      placeholder="e.g., Student, Freelancer, Part-time worker"
                      defaultValue={editingProfile?.occupation}
                    />
                  </div>
                  <div>
                    <Label htmlFor="dialog-workingHours">Working Hours</Label>
                    <select 
                      id="dialog-workingHours" 
                      name="dialog-workingHours"
                      className="w-full p-2 border rounded-md"
                      defaultValue={editingProfile?.workingHours}
                    >
                      <option value="">Select hours</option>
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Community Involvement Section */}
              <div className="border-b pb-4">
                <h3 className="text-lg font-semibold mb-4">Community Involvement</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="dialog-skMembership">SK Membership or Affiliation</Label>
                    <select 
                      id="dialog-skMembership" 
                      name="dialog-skMembership"
                      className="w-full p-2 border rounded-md"
                      defaultValue={editingProfile?.skMembership?.toString()}
                    >
                      <option value="">Select status</option>
                      <option value="true">Yes</option>
                      <option value="false">No</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="dialog-volunteerExperience">Volunteer Experience</Label>
                    <Input 
                      id="dialog-volunteerExperience" 
                      name="dialog-volunteerExperience"
                      placeholder="e.g., Barangay Clean-up"
                      defaultValue={editingProfile?.volunteerExperience || ''}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="dialog-leadershipRoles">Leadership Role Held</Label>
                    <Input 
                      id="dialog-leadershipRoles" 
                      name="dialog-leadershipRoles"
                      placeholder="e.g., Youth Council Member"
                      defaultValue={editingProfile?.leadershipRoles || ''}
                    />
                  </div>
                </div>
              </div>

              {/* Others Section */}
              <div className="border-b pb-4">
                <h3 className="text-lg font-semibold mb-4">Others</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="dialog-isPWD">PWD Status</Label>
                    <select 
                      id="dialog-isPWD" 
                      name="dialog-isPWD"
                      className="w-full p-2 border rounded-md"
                      defaultValue={editingProfile?.isPWD?.toString()}
                    >
                      <option value="">Select status</option>
                      <option value="true">Yes</option>
                      <option value="false">No</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="dialog-pwdType">PWD Type (if Yes)</Label>
                    <Input 
                      id="dialog-pwdType" 
                      name="dialog-pwdType"
                      placeholder="e.g., Visual impairment, Mobility"
                      defaultValue={editingProfile?.pwdType}
                    />
                  </div>
                  <div>
                    <Label htmlFor="dialog-indigenousGroup">Indigenous Group Affiliation</Label>
                    <Input 
                      id="dialog-indigenousGroup" 
                      name="dialog-indigenousGroup"
                      placeholder="e.g., Aeta, Igorot, Lumad (if applicable)"
                      defaultValue={editingProfile?.indigenousGroup}
                    />
                  </div>
                  <div>
                    <Label htmlFor="dialog-isSoloParent">Solo Parent</Label>
                    <select 
                      id="dialog-isSoloParent" 
                      name="dialog-isSoloParent"
                      className="w-full p-2 border rounded-md"
                      defaultValue={editingProfile?.isSoloParent?.toString()}
                    >
                      <option value="">Select status</option>
                      <option value="true">Yes</option>
                      <option value="false">No</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="dialog-specialCases">Special Cases (optional)</Label>
                    <Textarea 
                      id="dialog-specialCases" 
                      name="dialog-specialCases"
                      placeholder="Any special circumstances or additional information"
                      defaultValue={editingProfile?.specialCases}
                    />
                  </div>
                </div>
              </div>

              {/* Emergency Contact Section */}
              <div className="border-b pb-4">
                <h3 className="text-lg font-semibold mb-4">Emergency Contact</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="dialog-emergencyContactPerson">Emergency Contact Person</Label>
                    <Input 
                      id="dialog-emergencyContactPerson" 
                      name="dialog-emergencyContactPerson"
                      placeholder="e.g., Father, Mother, Guardian"
                      defaultValue={editingProfile?.emergencyContactPerson}
                    />
                  </div>
                  <div>
                    <Label htmlFor="dialog-emergencyContactNumber">Emergency Contact Number</Label>
                    <Input 
                      id="dialog-emergencyContactNumber" 
                      name="dialog-emergencyContactNumber"
                      placeholder="Enter contact number"
                      defaultValue={editingProfile?.emergencyContactNumber}
                    />
                  </div>
                  <div>
                    <Label htmlFor="dialog-emergencyRelationship">Relationship</Label>
                    <Input 
                      id="dialog-emergencyRelationship" 
                      name="dialog-emergencyRelationship"
                      placeholder="e.g., Father, Mother, Brother, Sister"
                      defaultValue={editingProfile?.emergencyRelationship}
                    />
                  </div>
                </div>
              </div>

              {/* System Fields Section */}
              <div className="border-b pb-4">
                <h3 className="text-lg font-semibold mb-4">System Information</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="dialog-committee">Committee *</Label>
                    <select 
                      id="dialog-committee" 
                      name="dialog-committee"
                      className="w-full p-2 border rounded-md"
                      defaultValue={editingProfile?.committee}
                      required
                    >
                      <option value="">Select committee</option>
                      <option value="Events">Events</option>
                      <option value="Sports">Sports</option>
                      <option value="Public Relations">Public Relations</option>
                      <option value="Technology">Technology</option>
                      <option value="Culture & Arts">Culture & Arts</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="dialog-status">Status *</Label>
                    <select 
                      id="dialog-status" 
                      name="dialog-status"
                      className="w-full p-2 border rounded-md"
                      defaultValue={editingProfile?.status}
                      required
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                      <option value="Graduated">Graduated</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-4">
                <Button type="button" variant="outline" onClick={handleDialogClose}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingProfile ? 'Update Member' : 'Add Member'}
                </Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Youth Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Youth Member Details</DialogTitle>
            <DialogDescription>
              Complete profile information for {viewingProfile?.fullName}
            </DialogDescription>
          </DialogHeader>
          
          {viewingProfile && (
            <div className="space-y-6">
              {/* Header with Profile Picture */}
              <div className="flex items-start gap-4 border-b pb-4">
                <div className="flex-shrink-0">
                  {viewingProfile.profilePicture ? (
                    <img
                      src={viewingProfile.profilePicture}
                      alt={`${viewingProfile.fullName}'s profile`}
                      className="h-24 w-24 rounded-full object-cover border-2 border-gray-200"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = '/images/profiles/default-avatar.jpg'
                      }}
                    />
                  ) : (
                    <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center">
                      <UserCheck className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold">{viewingProfile.fullName}</h2>
                  <p className="text-lg text-muted-foreground">{viewingProfile.age} years old • {viewingProfile.sex}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant={viewingProfile.status === 'Active' ? 'default' : 'secondary'}>
                      {viewingProfile.status}
                    </Badge>
                    <Badge variant="outline">{viewingProfile.committee}</Badge>
                  </div>
                </div>
              </div>

              {/* Basic Information */}
              <div className="border-b pb-4">
                <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Full Name</Label>
                    <p className="text-sm">{viewingProfile.fullName}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Date of Birth</Label>
                    <p className="text-sm">{viewingProfile.dateOfBirth}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Age</Label>
                    <p className="text-sm">{viewingProfile.age} years old</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Sex</Label>
                    <p className="text-sm">{viewingProfile.sex}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Civil Status</Label>
                    <p className="text-sm">{viewingProfile.civilStatus}</p>
                  </div>
                </div>
              </div>

              {/* Contact & Address */}
              <div className="border-b pb-4">
                <h3 className="text-lg font-semibold mb-4">Contact & Address</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Mobile Number</Label>
                    <p className="text-sm">{viewingProfile.mobileNumber}</p>
                  </div>
                  {viewingProfile.emailAddress && (
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Email Address</Label>
                      <p className="text-sm">{viewingProfile.emailAddress}</p>
                    </div>
                  )}
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Barangay</Label>
                    <p className="text-sm">{viewingProfile.barangay}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Street Address</Label>
                    <p className="text-sm">{viewingProfile.streetAddress}</p>
                  </div>
                </div>
              </div>

              {/* Educational Background */}
              <div className="border-b pb-4">
                <h3 className="text-lg font-semibold mb-4">Educational Background</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Education Level</Label>
                    <p className="text-sm">{viewingProfile.educationLevel}</p>
                  </div>
                  {viewingProfile.gradeLevel && (
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Grade Level</Label>
                      <p className="text-sm">{viewingProfile.gradeLevel}</p>
                    </div>
                  )}
                  <div>
                    <Label className="text-sm font-medium text-gray-600">School Name</Label>
                    <p className="text-sm">{viewingProfile.schoolName}</p>
                  </div>
                  {viewingProfile.courseStrand && (
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Course/Strand</Label>
                      <p className="text-sm">{viewingProfile.courseStrand}</p>
                    </div>
                  )}
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Graduation Status</Label>
                    <p className="text-sm">{viewingProfile.isGraduated ? 'Graduated' : 'Currently Enrolled'}</p>
                  </div>
                  {viewingProfile.lastSchoolYear && (
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Last School Year</Label>
                      <p className="text-sm">{viewingProfile.lastSchoolYear}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Skills and Interests */}
              <div className="border-b pb-4">
                <h3 className="text-lg font-semibold mb-4">Skills and Interests</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Skills</Label>
                    <p className="text-sm">{viewingProfile.skills}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Hobbies</Label>
                    <p className="text-sm">{viewingProfile.hobbies}</p>
                  </div>
                  <div className="md:col-span-2">
                    <Label className="text-sm font-medium text-gray-600">Preferred Programs</Label>
                    <p className="text-sm">{viewingProfile.preferredPrograms}</p>
                  </div>
                </div>
              </div>

              {/* Employment Status */}
              <div className="border-b pb-4">
                <h3 className="text-lg font-semibold mb-4">Employment Status</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Employment Status</Label>
                    <p className="text-sm">{viewingProfile.isEmployed ? 'Employed' : 'Unemployed'}</p>
                  </div>
                  {viewingProfile.occupation && (
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Occupation</Label>
                      <p className="text-sm">{viewingProfile.occupation}</p>
                    </div>
                  )}
                  {viewingProfile.workingHours && (
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Working Hours</Label>
                      <p className="text-sm">{viewingProfile.workingHours}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Community Involvement */}
              <div className="border-b pb-4">
                <h3 className="text-lg font-semibold mb-4">Community Involvement</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">SK Membership</Label>
                    <p className="text-sm">{viewingProfile.skMembership ? 'Yes' : 'No'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Volunteer Experience</Label>
                    <p className="text-sm">{viewingProfile.volunteerExperience}</p>
                  </div>
                  <div className="md:col-span-2">
                    <Label className="text-sm font-medium text-gray-600">Leadership Roles</Label>
                    <p className="text-sm">{viewingProfile.leadershipRoles}</p>
                  </div>
                </div>
              </div>

              {/* Others */}
              <div className="border-b pb-4">
                <h3 className="text-lg font-semibold mb-4">Others</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">PWD Status</Label>
                    <p className="text-sm">{viewingProfile.isPWD ? 'Yes' : 'No'}</p>
                  </div>
                  {viewingProfile.pwdType && (
                    <div>
                      <Label className="text-sm font-medium text-gray-600">PWD Type</Label>
                      <p className="text-sm">{viewingProfile.pwdType}</p>
                    </div>
                  )}
                  {viewingProfile.indigenousGroup && (
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Indigenous Group</Label>
                      <p className="text-sm">{viewingProfile.indigenousGroup}</p>
                    </div>
                  )}
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Solo Parent</Label>
                    <p className="text-sm">{viewingProfile.isSoloParent ? 'Yes' : 'No'}</p>
                  </div>
                  {viewingProfile.specialCases && (
                    <div className="md:col-span-2">
                      <Label className="text-sm font-medium text-gray-600">Special Cases</Label>
                      <p className="text-sm">{viewingProfile.specialCases}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Emergency Contact */}
              {(viewingProfile.emergencyContactPerson || viewingProfile.emergencyContactNumber) && (
                <div className="border-b pb-4">
                  <h3 className="text-lg font-semibold mb-4">Emergency Contact</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    {viewingProfile.emergencyContactPerson && (
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Emergency Contact Person</Label>
                        <p className="text-sm">{viewingProfile.emergencyContactPerson}</p>
                      </div>
                    )}
                    {viewingProfile.emergencyContactNumber && (
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Emergency Contact Number</Label>
                        <p className="text-sm">{viewingProfile.emergencyContactNumber}</p>
                      </div>
                    )}
                    {viewingProfile.emergencyRelationship && (
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Relationship</Label>
                        <p className="text-sm">{viewingProfile.emergencyRelationship}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* System Information */}
              <div className="border-b pb-4">
                <h3 className="text-lg font-semibold mb-4">System Information</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Committee</Label>
                    <p className="text-sm">{viewingProfile.committee}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Status</Label>
                    <p className="text-sm">{viewingProfile.status}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Participation</Label>
                    <p className="text-sm">{viewingProfile.participation} events</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Last Activity</Label>
                    <p className="text-sm">{viewingProfile.lastActivity}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Date of Registration</Label>
                    <p className="text-sm">{viewingProfile.dateOfRegistration}</p>
                  </div>
                  {viewingProfile.latitude && viewingProfile.longitude && (
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Location Coordinates</Label>
                      <p className="text-sm">{viewingProfile.latitude.toFixed(6)}, {viewingProfile.longitude.toFixed(6)}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-4">
                <Button type="button" variant="outline" onClick={() => setShowViewDialog(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}