"use client"

import { 
  Users, 
  Plus, 
  Search, 
  MoreHorizontal,
  Mail,
  Phone,
  Calendar,
  Edit,
  Trash2,
  Eye,
  Filter,
  Download,
  Upload,
  UserPlus,
  Shield,
  Activity,
  MapPin,
  Building,
  GraduationCap,
  Heart,
  Star,
  Award,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Camera,
  User,
  Loader2,
  Network
} from 'lucide-react'
import Image from 'next/image'
import { useState, useEffect } from 'react'

import { OrgChart } from '@/components/dashboard/org-chart'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/toast'
import { skMembersService, type SKMember } from '@/lib/services/sk-members'

export default function UsersPage() {
  const { error: showError, success: showSuccess } = useToast()
  const [users, setUsers] = useState<SKMember[]>([])
  const [filteredUsers, setFilteredUsers] = useState<SKMember[]>([])
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [roleFilter, setRoleFilter] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<SKMember | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'SK_COUNCILOR' as 'SK_CHAIRPERSON' | 'SK_SECRETARY' | 'SK_TREASURER' | 'SK_COUNCILOR',
    status: 'Active' as 'Active' | 'Inactive' | 'Pending',
    department: '',
    position: '',
    joinDate: '',
    location: '',
    skills: [] as string[],
    performance: 0,
    projects: 0,
    achievements: 0
  })
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [showOrgChart, setShowOrgChart] = useState(false)
  
  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Load data on component mount
  useEffect(() => {
    if (mounted) {
      loadMembers()
    }
  }, [mounted])

  // Filter users when search or filters change
  useEffect(() => {
    const filtered = users.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.role.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === 'all' || user.status === statusFilter
      const matchesRole = roleFilter === 'all' || user.role === roleFilter
      
      return matchesSearch && matchesStatus && matchesRole
    })
    setFilteredUsers(filtered)
  }, [users, searchTerm, statusFilter, roleFilter])

  const loadMembers = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const members = await skMembersService.getMembers({
        search: searchTerm || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        role: roleFilter !== 'all' ? roleFilter : undefined
      })
      
      setUsers(members)
      
      // Calculate stats
      const statsData = {
        total: members.length,
        active: members.filter(u => u.status === 'Active').length,
        inactive: members.filter(u => u.status === 'Inactive').length,
        pending: members.filter(u => u.status === 'Pending').length
      }
      setStats(statsData)
    } catch (err) {
      setError('Failed to load SK members')
      console.error('Error loading members:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleViewUser = (user: SKMember) => {
    setSelectedUser(user)
    setShowViewModal(true)
  }

  const handleEditUser = (user: SKMember) => {
    setSelectedUser(user)
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role as 'SK_CHAIRPERSON' | 'SK_SECRETARY' | 'SK_TREASURER' | 'SK_COUNCILOR',
      status: user.status,
      department: user.department,
      position: user.position,
      joinDate: user.joinDate,
      location: user.location,
      skills: user.skills,
      performance: user.performance,
      projects: user.projects,
      achievements: user.achievements
    })
    setShowEditModal(true)
  }

  const handleDeleteUser = async (userId: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      try {
        await skMembersService.deleteMember(userId)
        await loadMembers() // Reload data
      } catch (err) {
        console.error('Error deleting user:', err)
        showError('Failed to delete user', 'Error')
      }
    }
  }

  const handleCreateMember = async () => {
    // Validate required fields
    if (!formData.name || !formData.email || !formData.phone || !formData.department || !formData.position || !formData.location) {
      showError('Please fill in all required fields', 'Validation Error')
      return
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      showError('Please enter a valid email address', 'Invalid Email')
      return
    }

    setIsSubmitting(true)
    try {
      await skMembersService.createMember({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        role: formData.role,
        department: formData.department.trim(),
        position: formData.position.trim(),
        location: formData.location.trim(),
        skills: formData.skills,
        profileImage: imagePreview || undefined
      })
      
      setShowAddModal(false)
      resetForm()
      await loadMembers() // Reload data
      showSuccess('SK member created successfully!', 'Success')
    } catch (err: any) {
      console.error('Error creating member:', err)
      const errorMessage = err.message || 'Failed to create member'
      showError(`Error: ${errorMessage}`, 'Error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdateMember = async () => {
    if (!selectedUser) return
    
    // Validate required fields
    if (!formData.name || !formData.email || !formData.phone || !formData.department || !formData.position || !formData.location) {
      showError('Please fill in all required fields', 'Validation Error')
      return
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      showError('Please enter a valid email address', 'Invalid Email')
      return
    }

    setIsSubmitting(true)
    try {
      await skMembersService.updateMember(selectedUser.id, {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        role: formData.role,
        status: formData.status,
        department: formData.department.trim(),
        position: formData.position.trim(),
        location: formData.location.trim(),
        skills: formData.skills,
        profileImage: imagePreview || selectedUser.profileImage
      })
      
      setShowEditModal(false)
      resetForm()
      await loadMembers() // Reload data
      showSuccess('SK member updated successfully!', 'Success')
    } catch (err: any) {
      console.error('Error updating member:', err)
      const errorMessage = err.message || 'Failed to update member'
      showError(`Error: ${errorMessage}`, 'Error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: 'SK_COUNCILOR' as 'SK_CHAIRPERSON' | 'SK_SECRETARY' | 'SK_TREASURER' | 'SK_COUNCILOR',
      department: '',
      position: '',
      joinDate: '',
      location: '',
      skills: [] as string[],
      performance: 0,
      projects: 0,
      achievements: 0,
      status: 'Active' as 'Active' | 'Inactive' | 'Pending'
    })
    setSelectedImage(null)
    setImagePreview(null)
    setSelectedUser(null)
  }

  const handleAddModalClose = () => {
    setShowAddModal(false)
    resetForm()
  }

  const handleEditModalClose = () => {
    setShowEditModal(false)
    resetForm()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800'
      case 'Inactive': return 'bg-gray-100 text-gray-800'
      case 'Pending': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPerformanceColor = (performance: number) => {
    if (performance >= 90) return 'text-green-600'
    if (performance >= 80) return 'text-blue-600'
    if (performance >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        showError('Please select an image file', 'Invalid File Type')
        return
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showError('Image size should be less than 5MB', 'File Too Large')
        return
      }
      
      setSelectedImage(file)
      
      try {
        // Upload file to server
        const formData = new FormData()
        formData.append('file', file)
        formData.append('type', 'profile')
        
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        })
        
        if (response.ok) {
          const result = await response.json()
          setImagePreview(result.url)
        } else {
          const error = await response.json()
          showError(`Upload failed: ${error.error}`, 'Upload Error')
        }
      } catch (error) {
        console.error('Upload error:', error)
        showError('Failed to upload image', 'Upload Error')
      }
    }
  }

  const ProfileImage = ({ user, size = 'md' }: { user: SKMember; size?: 'sm' | 'md' | 'lg' }) => {
    const sizeClasses = {
      sm: 'h-8 w-8',
      md: 'h-12 w-12',
      lg: 'h-16 w-16'
    }

    // Check if user has a profile image (local file path)
    if (user.profileImage && (user.profileImage.startsWith('/images/') || user.profileImage.startsWith('/uploads/'))) {
      return (
        <div className={`${sizeClasses[size]} rounded-full overflow-hidden bg-primary/10 flex items-center justify-center`}>
          <Image
            src={user.profileImage}
            alt={user.name}
            width={size === 'sm' ? 32 : size === 'md' ? 48 : 64}
            height={size === 'sm' ? 32 : size === 'md' ? 48 : 64}
            className="rounded-full object-cover"
            onError={(e) => {
              // Fallback to initials if image fails to load
              const target = e.target as HTMLImageElement
              target.style.display = 'none'
              const parent = target.parentElement
              if (parent) {
                const fallback = document.createElement('span')
                fallback.className = `font-medium text-primary ${size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-lg'}`
                fallback.textContent = user.avatar
                parent.appendChild(fallback)
              }
            }}
          />
        </div>
      )
    }

    // Fallback to avatar initials
    return (
      <div className={`${sizeClasses[size]} rounded-full bg-primary/10 flex items-center justify-center`}>
        <span className={`font-medium text-primary ${size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-lg'}`}>
          {user.avatar}
        </span>
      </div>
    )
  }

  if (!mounted) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading SK members...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Error Loading Data</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={loadMembers}>Try Again</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 lg:py-8">
        {/* Header Section - Mobile First */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4 sm:mb-6 lg:mb-8 pt-16 lg:pt-8">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">SK Members</h1>
            <p className="text-muted-foreground mt-2">
              Manage Sangguniang Kabataan members and organizational structure
            </p>
          </div>
          <Button onClick={() => {
            resetForm()
            setShowAddModal(true)
          }} className="w-full sm:w-auto h-10 sm:h-9">
            <Plus className="mr-2 h-4 w-4" />
            Add Member
          </Button>
        </div>

      {/* Content */}
      <div className="space-y-4 sm:space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
            <Card className="hover:shadow-md transition-shadow duration-200 p-3 sm:p-4">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-0">
                <CardTitle className="text-xs sm:text-sm font-medium">Total Members</CardTitle>
                <Users className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="p-0 pt-2">
                <div className="text-lg sm:text-xl lg:text-2xl font-bold">{stats.total}</div>
                <p className="text-xs text-muted-foreground">
                  All SK members
                </p>
              </CardContent>
            </Card>
            <Card className="hover:shadow-md transition-shadow duration-200 p-3 sm:p-4">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-0">
                <CardTitle className="text-xs sm:text-sm font-medium">Active Members</CardTitle>
                <div className="h-3 w-3 sm:h-4 sm:w-4 rounded-full bg-green-500" />
              </CardHeader>
              <CardContent className="p-0 pt-2">
                <div className="text-lg sm:text-xl lg:text-2xl font-bold">{stats.active}</div>
                <p className="text-xs text-muted-foreground">
                  Currently active
                </p>
              </CardContent>
            </Card>
            <Card className="hover:shadow-md transition-shadow duration-200 p-3 sm:p-4">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-0">
                <CardTitle className="text-xs sm:text-sm font-medium">Inactive Members</CardTitle>
                <div className="h-3 w-3 sm:h-4 sm:w-4 rounded-full bg-red-500" />
              </CardHeader>
              <CardContent className="p-0 pt-2">
                <div className="text-lg sm:text-xl lg:text-2xl font-bold">{stats.inactive}</div>
                <p className="text-xs text-muted-foreground">
                  Currently inactive
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-3 w-3 sm:h-4 sm:w-4" />
              <Input
                placeholder="Search members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 sm:pl-10 text-xs sm:text-sm h-10 sm:h-11"
              />
            </div>
                        <div className="flex flex-col sm:flex-row gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="p-2 sm:p-3 border rounded-md text-xs sm:text-sm h-10 sm:h-11"
              >
                <option value="all">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="PENDING">Pending</option>
              </select>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="p-2 sm:p-3 border rounded-md text-xs sm:text-sm h-10 sm:h-11"
              >
                <option value="all">All Roles</option>
                <option value="SK_CHAIRPERSON">Chairperson</option>
                <option value="SK_SECRETARY">Secretary</option>
                <option value="SK_TREASURER">Treasurer</option>
                <option value="SK_COUNCILOR">Councilor</option>
              </select>
                <Button 
                  variant="outline" 
                  onClick={() => setShowOrgChart(true)}
                  className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3 h-10 sm:h-9 w-full sm:w-auto"
                >
                  <Network className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">View Org Chart</span>
                  <span className="sm:hidden">Chart</span>
                </Button>
              </div>
            </div>

          {/* Users Table */}
          <Card className="p-3 sm:p-4">
            <CardHeader className="p-0 pb-3 sm:pb-4">
              <CardTitle className="text-lg sm:text-xl">SK Members ({filteredUsers.length})</CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Manage and view all Sangguniang Kabataan members
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {filteredUsers.length === 0 ? (
                <div className="text-center py-6 sm:py-8">
                  <Users className="h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-3 sm:mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No members found</h3>
                  <p className="text-muted-foreground mb-4">
                    {users.length === 0 ? 'No SK members have been added yet.' : 'No members match your search criteria.'}
                  </p>
                  {users.length === 0 && (
                    <Button onClick={() => {
                      resetForm()
                      setShowAddModal(true)
                    }} className="h-10 sm:h-9">
                      <UserPlus className="mr-2 h-4 w-4" />
                      Add First Member
                    </Button>
                  )}
                </div>
              ) : (
                <>
                  {/* Desktop Table */}
                  <div className="hidden lg:block">
                    <div className="space-y-4">
                      {filteredUsers.map((user) => (
                        <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                          <div className="flex items-center space-x-4">
                            <ProfileImage user={user} size="md" />
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <h3 className="font-medium">{user.name}</h3>
                                <Badge className={getStatusColor(user.status)}>
                                  {user.status}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">{user.email}</p>
                              <div className="flex items-center space-x-4 mt-1">
                                <span className="text-sm text-muted-foreground">{user.role}</span>
                                <span className="text-sm text-muted-foreground">•</span>
                                <span className="text-sm text-muted-foreground">{user.department}</span>
                                <span className="text-sm text-muted-foreground">•</span>
                                <span className={`text-sm font-medium ${getPerformanceColor(user.performance)}`}>
                                  {user.performance}% Performance
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="text-right mr-4">
                              <p className="text-sm text-muted-foreground">Last active</p>
                              <p className="text-sm font-medium">{user.lastActive}</p>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleViewUser(user)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleEditUser(user)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleDeleteUser(user.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Mobile Cards */}
                  <div className="lg:hidden space-y-3">
                    {filteredUsers.map((user) => (
                      <div key={user.id} className="border rounded-lg p-3 space-y-3">
                        {/* Header with image and basic info */}
                        <div className="flex items-start space-x-2">
                          <ProfileImage user={user} size="sm" />
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 mb-1">
                              <h3 className="font-medium truncate text-sm">{user.name}</h3>
                              <Badge className={getStatusColor(user.status)}>
                                {user.status}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                            <p className="text-xs text-muted-foreground">{user.role}</p>
                          </div>
                          <div className="flex flex-col space-y-1">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => handleViewUser(user)}
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => handleEditUser(user)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => handleDeleteUser(user.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>

                        {/* Additional info - stacked for very small screens */}
                        <div className="space-y-1 text-xs">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                            <span className="text-muted-foreground">Department:</span>
                            <span className="truncate">{user.department}</span>
                          </div>
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                            <span className="text-muted-foreground">Performance:</span>
                            <span className={`font-medium ${getPerformanceColor(user.performance)}`}>
                              {user.performance}%
                            </span>
                          </div>
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                            <span className="text-muted-foreground">Last active:</span>
                            <span className="truncate">{user.lastActive}</span>
                          </div>
                        </div>

                        {/* Action buttons for mobile - stacked on very small screens */}
                        <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1 text-xs"
                            onClick={() => handleViewUser(user)}
                          >
                            <Eye className="mr-1 h-3 w-3" />
                            View
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1 text-xs"
                            onClick={() => handleEditUser(user)}
                          >
                            <Edit className="mr-1 h-3 w-3" />
                            Edit
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1 text-xs"
                            onClick={() => handleDeleteUser(user.id)}
                          >
                            <Trash2 className="mr-1 h-3 w-3" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Add User Modal */}
          {showAddModal && (
            <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
              <DialogContent className="max-w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto mx-4 sm:mx-0 p-2 sm:p-4">
                <DialogHeader>
                  <DialogTitle className="text-lg sm:text-xl">Add New SK Member</DialogTitle>
                  <DialogDescription className="text-sm sm:text-base">Create a new SK member account</DialogDescription>
                </DialogHeader>
                <CardContent className="space-y-4">
                  {/* Profile Image Upload */}
                  <div className="text-center">
                    <div className="relative inline-block">
                      <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                        {imagePreview ? (
                          <Image
                            src={imagePreview}
                            alt="Profile preview"
                            width={80}
                            height={80}
                            className="rounded-full object-cover"
                          />
                        ) : (
                          <User className="h-8 w-8 text-primary" />
                        )}
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="profile-upload-add"
                      />
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => document.getElementById('profile-upload-add')?.click()}
                      >
                        <Camera className="mr-2 h-4 w-4" />
                        Upload Photo
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label>Full Name *</Label>
                    <Input 
                      placeholder="Enter full name" 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label>Email *</Label>
                    <Input 
                      type="email" 
                      placeholder="Enter email address" 
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label>Phone *</Label>
                    <Input 
                      placeholder="Enter phone number" 
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label>Role *</Label>
                    <select 
                      className="w-full p-2 border rounded-md"
                      value={formData.role}
                      onChange={(e) => setFormData({...formData, role: e.target.value as 'SK_CHAIRPERSON' | 'SK_SECRETARY' | 'SK_TREASURER' | 'SK_COUNCILOR'})}
                      required
                    >
                      <option value="SK_CHAIRPERSON">SK Chairperson</option>
                      <option value="SK_SECRETARY">SK Secretary</option>
                      <option value="SK_TREASURER">SK Treasurer</option>
                      <option value="SK_COUNCILOR">SK Councilor</option>
                    </select>
                  </div>
                  <div>
                    <Label>Department *</Label>
                    <Input 
                      placeholder="Enter department" 
                      value={formData.department}
                      onChange={(e) => setFormData({...formData, department: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label>Position *</Label>
                    <Input 
                      placeholder="Enter position" 
                      value={formData.position}
                      onChange={(e) => setFormData({...formData, position: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label>Location *</Label>
                    <Input 
                      placeholder="Enter location" 
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                      required
                    />
                  </div>
                </CardContent>
                <DialogFooter className="flex flex-col space-y-2 pt-2 sm:flex-row sm:space-y-0 sm:space-x-2 sm:justify-end">
                  <Button className="w-full sm:w-auto h-12 sm:h-10" onClick={handleCreateMember} disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'Add Member'
                    )}
                  </Button>
                  <Button variant="outline" onClick={handleAddModalClose} disabled={isSubmitting} className="w-full sm:w-auto h-12 sm:h-10">
                    Cancel
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}

          {/* Edit User Modal */}
          {showEditModal && selectedUser && (
            <Dialog open={showEditModal} onOpenChange={(open) => {
              if (!open) {
                setShowEditModal(false)
                setSelectedUser(null)
              }
            }}>
              <DialogContent className="max-w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto mx-4 sm:mx-0 p-2 sm:p-4">
                <DialogHeader>
                  <DialogTitle>Edit SK Member</DialogTitle>
                  <DialogDescription>Update SK member information</DialogDescription>
                </DialogHeader>
                <CardContent className="space-y-3 sm:space-y-4">
                  {/* Profile Image Upload */}
                  <div className="text-center">
                    <div className="relative inline-block">
                      <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                        {imagePreview ? (
                          <Image
                            src={imagePreview}
                            alt="Profile preview"
                            width={80}
                            height={80}
                            className="rounded-full object-cover"
                          />
                        ) : selectedUser.profileImage && (selectedUser.profileImage.startsWith('/images/') || selectedUser.profileImage.startsWith('/uploads/')) ? (
                          <Image
                            src={selectedUser.profileImage}
                            alt={selectedUser.name}
                            width={80}
                            height={80}
                            className="rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-lg font-medium text-primary">{selectedUser.avatar}</span>
                        )}
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="profile-upload-edit"
                      />
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => document.getElementById('profile-upload-edit')?.click()}
                      >
                        <Camera className="mr-2 h-4 w-4" />
                        Change Photo
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs sm:text-sm">Full Name *</Label>
                    <Input 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      required
                      className="h-10 sm:h-11 text-sm sm:text-base"
                    />
                  </div>
                  <div>
                    <Label className="text-xs sm:text-sm">Email *</Label>
                    <Input 
                      type="email" 
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      required
                      className="h-10 sm:h-11 text-sm sm:text-base"
                    />
                  </div>
                  <div>
                    <Label className="text-xs sm:text-sm">Phone *</Label>
                    <Input 
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      required
                      className="h-10 sm:h-11 text-sm sm:text-base"
                    />
                  </div>
                  <div>
                    <Label className="text-xs sm:text-sm">Role *</Label>
                    <select 
                      className="w-full p-2 sm:p-3 border rounded-md text-sm sm:text-base h-10 sm:h-11" 
                      value={formData.role}
                      onChange={(e) => setFormData({...formData, role: e.target.value as 'SK_CHAIRPERSON' | 'SK_SECRETARY' | 'SK_TREASURER' | 'SK_COUNCILOR'})}
                      required
                    >
                      <option value="SK_CHAIRPERSON">SK Chairperson</option>
                      <option value="SK_SECRETARY">SK Secretary</option>
                      <option value="SK_TREASURER">SK Treasurer</option>
                      <option value="SK_COUNCILOR">SK Councilor</option>
                    </select>
                  </div>
                  <div>
                    <Label className="text-xs sm:text-sm">Status *</Label>
                    <select 
                      className="w-full p-2 sm:p-3 border rounded-md text-sm sm:text-base h-10 sm:h-11" 
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value as 'Active' | 'Inactive' | 'Pending'})}
                      required
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                      <option value="Pending">Pending</option>
                    </select>
                  </div>
                  <div>
                    <Label className="text-xs sm:text-sm">Department *</Label>
                    <Input 
                      value={formData.department}
                      onChange={(e) => setFormData({...formData, department: e.target.value})}
                      required
                      className="h-10 sm:h-11 text-sm sm:text-base"
                    />
                  </div>
                  <div>
                    <Label className="text-xs sm:text-sm">Position *</Label>
                    <Input 
                      value={formData.position}
                      onChange={(e) => setFormData({...formData, position: e.target.value})}
                      required
                      className="h-10 sm:h-11 text-sm sm:text-base"
                    />
                  </div>
                  <div>
                    <Label className="text-xs sm:text-sm">Location *</Label>
                    <Input 
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                      required
                      className="h-10 sm:h-11 text-sm sm:text-base"
                    />
                  </div>
                </CardContent>
                <DialogFooter className="flex flex-col space-y-2 pt-2 sm:flex-row sm:space-y-0 sm:space-x-2 sm:justify-end">
                  <Button className="w-full sm:w-auto h-12 sm:h-10" onClick={handleUpdateMember} disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </Button>
                  <Button variant="outline" onClick={handleEditModalClose} disabled={isSubmitting} className="w-full sm:w-auto h-12 sm:h-10">
                    Cancel
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}

          {/* View User Modal */}
          {showViewModal && selectedUser && (
            <Dialog open={showViewModal} onOpenChange={(open) => {
              if (!open) {
                setShowViewModal(false)
                setSelectedUser(null)
              }
            }}>
              <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto mx-4 sm:mx-0 p-2 sm:p-4">
                <DialogHeader>
                  <DialogTitle>Member Details</DialogTitle>
                  <DialogDescription>View detailed information about this SK member</DialogDescription>
                </DialogHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center space-x-4">
                        <ProfileImage user={selectedUser} size="lg" />
                        <div>
                          <h3 className="text-lg font-bold">{selectedUser.name}</h3>
                          <p className="text-muted-foreground">{selectedUser.role}</p>
                          <Badge className={getStatusColor(selectedUser.status)}>
                            {selectedUser.status}
                          </Badge>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{selectedUser.email}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{selectedUser.phone}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Building className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{selectedUser.department}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{selectedUser.location}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">Joined: {selectedUser.joinDate}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2">Skills</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedUser.skills.map((skill, index) => (
                            <Badge key={index} variant="secondary">{skill}</Badge>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center p-3 bg-muted rounded-lg">
                          <div className={`text-2xl font-bold ${getPerformanceColor(selectedUser.performance)}`}>
                            {selectedUser.performance}%
                          </div>
                          <div className="text-xs text-muted-foreground">Performance</div>
                        </div>
                        <div className="text-center p-3 bg-muted rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">
                            {selectedUser.projects}
                          </div>
                          <div className="text-xs text-muted-foreground">Projects</div>
                        </div>
                        <div className="text-center p-3 bg-muted rounded-lg">
                          <div className="text-2xl font-bold text-yellow-600">
                            {selectedUser.achievements}
                          </div>
                          <div className="text-xs text-muted-foreground">Achievements</div>
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <Button onClick={() => {
                          setShowViewModal(false)
                          handleEditUser(selectedUser)
                        }}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Member
                        </Button>
                        <Button variant="outline" onClick={() => setShowViewModal(false)}>
                          Close
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </DialogContent>
            </Dialog>
          )}

        {/* Org Chart Modal */}
        {showOrgChart && (
          <Dialog open={showOrgChart} onOpenChange={setShowOrgChart}>
            <DialogContent className="max-w-[95vw] sm:max-w-6xl max-h-[90vh] overflow-y-auto mx-4 sm:mx-0 p-1 sm:p-3">
              <DialogHeader className="pb-2">
                <DialogTitle>SK Organizational Chart</DialogTitle>
                <DialogDescription>View the organizational structure of SK members</DialogDescription>
              </DialogHeader>
              <div className="p-0">
                <OrgChart members={users} />
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  )
} 