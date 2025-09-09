"use client"

import { useRouter } from 'next/navigation'
import React, { useState, useEffect } from 'react'
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Mail,
  Calendar,
  Shield,
  User,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Users,
  UserCheck,
  Camera,
  X,
  Filter,
  ChevronDown,
  Clock,
  MoreHorizontal,
  Activity
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/toast'
import { useAuth } from '@/lib/auth'

interface UserData {
  id: string
  email: string
  name: string | null
  role: 'ADMIN' | 'USER'
  profileImage?: string | null
  createdAt: string
  updatedAt: string
}

interface UserStats {
  total: number
  admins: number
  users: number
  active: number
  inactive: number
}

export default function UsersManagementPage() {
  const { user: currentUser } = useAuth()
  const { error: showError, success: showSuccess } = useToast()
  const router = useRouter()

  // All hooks must be at the top level
  const [users, setUsers] = useState<UserData[]>([])
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null)
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [roleFilter, setRoleFilter] = useState('all')
  const [sortBy, setSortBy] = useState<'name' | 'email' | 'role' | 'createdAt'>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  const [showFilters, setShowFilters] = useState(false)
  const [showUserActions, setShowUserActions] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'USER' as 'ADMIN' | 'USER'
  })
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  // Check if user is admin
  useEffect(() => {
    if (currentUser && currentUser.role !== 'ADMIN') {
      showError('Access denied. Admin privileges required.', 'Permission Denied')
      router.push('/dashboard')
    }
  }, [currentUser, router, showError])

  if (!currentUser || currentUser.role !== 'ADMIN') {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Checking permissions...</p>
        </div>
      </div>
    )
  }

  // Fetch users
  useEffect(() => {
    fetchUsers()
  }, [])

  // Filter and sort users
  useEffect(() => {
    const filtered = users.filter(user => {
      const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.role.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesRole = roleFilter === 'all' || user.role === roleFilter
      
      return matchesSearch && matchesRole
    })

    // Sort users
    filtered.sort((a, b) => {
      let aValue: string | Date
      let bValue: string | Date

      switch (sortBy) {
        case 'name':
          aValue = a.name || ''
          bValue = b.name || ''
          break
        case 'email':
          aValue = a.email
          bValue = b.email
          break
        case 'role':
          aValue = a.role
          bValue = b.role
          break
        case 'createdAt':
          aValue = new Date(a.createdAt)
          bValue = new Date(b.createdAt)
          break
        default:
          aValue = a.name || ''
          bValue = b.name || ''
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    setFilteredUsers(filtered)
  }, [users, searchTerm, roleFilter, sortBy, sortOrder])

  const fetchUsers = async () => {
    try {
      setIsRefreshing(true)
      const response = await fetch('/api/users')
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const formDataToSend = new FormData()
      formDataToSend.append('firstName', formData.firstName)
      formDataToSend.append('lastName', formData.lastName)
      formDataToSend.append('email', formData.email)
      formDataToSend.append('password', formData.password)
      formDataToSend.append('role', formData.role)
      
      if (selectedImage) {
        formDataToSend.append('profileImage', selectedImage)
      }

      const response = await fetch('/api/users', {
        method: 'POST',
        body: formDataToSend,
      })

      if (response.ok) {
        setShowAddModal(false)
        resetForm()
        fetchUsers()
        showSuccess('User created successfully!', 'Success')
      } else {
        const data = await response.json()
        showError(data.error || 'Failed to create user', 'Error')
      }
    } catch (error) {
      showError('Error creating user', 'Error')
    }
  }

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUser) return

    try {
      const formDataToSend = new FormData()
      formDataToSend.append('firstName', formData.firstName)
      formDataToSend.append('lastName', formData.lastName)
      formDataToSend.append('email', formData.email)
      formDataToSend.append('role', formData.role)
      
      if (formData.password) {
        formDataToSend.append('password', formData.password)
      }
      
      if (selectedImage) {
        formDataToSend.append('profileImage', selectedImage)
      }

      const response = await fetch(`/api/users/${selectedUser.id}`, {
        method: 'PUT',
        body: formDataToSend,
      })

      if (response.ok) {
        setShowEditModal(false)
        setSelectedUser(null)
        resetForm()
        fetchUsers()
        showSuccess('User updated successfully!', 'Success')
      } else {
        const data = await response.json()
        showError(data.error || 'Failed to update user', 'Error')
      }
    } catch (error) {
      showError('Error updating user', 'Error')
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchUsers()
        showSuccess('User deleted successfully!', 'Success')
      } else {
        const data = await response.json()
        showError(data.error || 'Failed to delete user', 'Error')
      }
    } catch (error) {
      showError('Error deleting user', 'Error')
    }
  }

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedUsers.length} users?`)) return

    try {
      const promises = selectedUsers.map(userId => 
        fetch(`/api/users/${userId}`, { method: 'DELETE' })
      )
      
      await Promise.all(promises)
      setSelectedUsers([])
      // setShowBulkActions(false) // Removed unused variable
      fetchUsers()
      showSuccess(`${selectedUsers.length} users deleted successfully!`, 'Success')
    } catch (error) {
      showError('Error deleting users', 'Error')
    }
  }

  const handleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([])
    } else {
      setSelectedUsers(filteredUsers.map(user => user.id))
    }
  }

  const handleSelectUser = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showError('Please select a valid image file', 'Invalid File Type')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showError('Image size must be less than 5MB', 'File Too Large')
      return
    }

    setSelectedImage(file)
    
    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const removeImage = () => {
    setSelectedImage(null)
    setImagePreview(null)
  }

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      role: 'USER'
    })
    setSelectedImage(null)
    setImagePreview(null)
  }

  const openViewModal = (user: UserData) => {
    setSelectedUser(user)
    setShowViewModal(true)
    setShowUserActions(null)
  }

  const openEditModal = (user: UserData) => {
    const [firstName, lastName] = (user.name || '').split(' ')
    setSelectedUser(user)
    setFormData({
      firstName: firstName || '',
      lastName: lastName || '',
      email: user.email,
      password: '',
      role: user.role
    })
    setShowEditModal(true)
    setShowUserActions(null)
  }

  const getRoleBadge = (role: string) => {
    return role === 'ADMIN' ? (
      <Badge variant="destructive" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 text-xs">
        <Shield className="w-3 h-3 mr-1" />
        Admin
      </Badge>
    ) : (
      <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs">
        <User className="w-3 h-3 mr-1" />
        User
      </Badge>
    )
  }

  const ProfileImage = ({ user, size = 'md' }: { user: UserData; size?: 'sm' | 'md' | 'lg' }) => {
    const sizeClasses = {
      sm: 'w-8 h-8',
      md: 'w-10 h-10 sm:w-12 sm:h-12',
      lg: 'w-16 h-16'
    }

    const textSizes = {
      sm: 'text-xs',
      md: 'text-sm',
      lg: 'text-lg'
    }

    // Check if user has a profile image
    if (user.profileImage && user.profileImage.startsWith('/images/')) {
      return (
        <div className={`${sizeClasses[size]} rounded-full overflow-hidden bg-primary/10 flex items-center justify-center flex-shrink-0`}>
          <img
            src={user.profileImage}
            alt={user.name || 'User'}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback to initials if image fails to load
              const target = e.target as HTMLImageElement
              target.style.display = 'none'
              const parent = target.parentElement
              if (parent) {
                const fallback = document.createElement('span')
                fallback.className = `font-medium text-primary ${textSizes[size]}`
                fallback.textContent = user.name?.charAt(0).toUpperCase() || 'U'
                parent.appendChild(fallback)
              }
            }}
          />
        </div>
      )
    }

    // Fallback to avatar initials
    return (
      <div className={`${sizeClasses[size]} rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0`}>
        <span className={`font-medium text-primary ${textSizes[size]}`}>
          {user.name?.charAt(0).toUpperCase() || 'U'}
        </span>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getStats = (): UserStats => {
    return {
      total: users.length,
      admins: users.filter(u => u.role === 'ADMIN').length,
      users: users.filter(u => u.role === 'USER').length,
      active: users.length, // Assuming all users are active for now
      inactive: 0
    }
  }



  const stats = getStats()

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading users...</p>
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
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">User Management</h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-2">
              Manage system users and their permissions
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
            <Button 
              variant="outline" 
              onClick={fetchUsers}
              disabled={isRefreshing}
              className="h-10 sm:h-9"
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button onClick={() => setShowAddModal(true)} className="h-10 sm:h-9">
              <Plus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </div>
        </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <Card className="p-3 sm:p-4">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-0">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Users</CardTitle>
            <Users className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-0 pt-2">
            <div className="text-lg sm:text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card className="p-3 sm:p-4">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-0">
            <CardTitle className="text-xs sm:text-sm font-medium">Admins</CardTitle>
            <Shield className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-0 pt-2">
            <div className="text-lg sm:text-2xl font-bold text-red-600">{stats.admins}</div>
          </CardContent>
        </Card>
        <Card className="p-3 sm:p-4">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-0">
            <CardTitle className="text-xs sm:text-sm font-medium">Regular Users</CardTitle>
            <User className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-0 pt-2">
            <div className="text-lg sm:text-2xl font-bold text-blue-600">{stats.users}</div>
          </CardContent>
        </Card>
        <Card className="p-3 sm:p-4">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-0">
            <CardTitle className="text-xs sm:text-sm font-medium">Active Users</CardTitle>
            <UserCheck className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-0 pt-2">
            <div className="text-lg sm:text-2xl font-bold text-green-600">{stats.active}</div>
          </CardContent>
        </Card>
      </div>

      {/* Content */}
      <div className="space-y-4 sm:space-y-6">
        {/* Search and Filters */}
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users by name, email, or role..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              {/* Filters Toggle */}
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center space-x-2 h-9"
                >
                  <Filter className="w-4 h-4" />
                  <span>Filters</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                </Button>
                
                <div className="text-xs sm:text-sm text-muted-foreground">
                  {filteredUsers.length} of {users.length} users
                </div>
              </div>

              {/* Filters Panel */}
              {showFilters && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <Label htmlFor="roleFilter" className="text-sm font-medium">Role</Label>
                <select
                      id="roleFilter"
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                      className="w-full p-2 border rounded-md text-sm"
                >
                  <option value="all">All Roles</option>
                  <option value="ADMIN">Admin</option>
                  <option value="USER">User</option>
                </select>
                  </div>
                  <div>
                    <Label htmlFor="sortBy" className="text-sm font-medium">Sort By</Label>
                <select
                      id="sortBy"
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [field, order] = e.target.value.split('-')
                    setSortBy(field as any)
                    setSortOrder(order as any)
                  }}
                      className="w-full p-2 border rounded-md text-sm"
                >
                  <option value="name-asc">Name (A-Z)</option>
                  <option value="name-desc">Name (Z-A)</option>
                  <option value="email-asc">Email (A-Z)</option>
                  <option value="email-desc">Email (Z-A)</option>
                  <option value="role-asc">Role (A-Z)</option>
                  <option value="role-desc">Role (Z-A)</option>
                  <option value="createdAt-desc">Newest First</option>
                  <option value="createdAt-asc">Oldest First</option>
                </select>
              </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Bulk Actions */}
        {selectedUsers.length > 0 && (
          <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950 dark:border-orange-800">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-orange-600 flex-shrink-0" />
                  <span className="text-sm font-medium">
                    {selectedUsers.length} user{selectedUsers.length > 1 ? 's' : ''} selected
                  </span>
                </div>
                <div className="flex items-center space-x-2 w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedUsers([])}
                    className="flex-1 sm:flex-none"
                  >
                    Clear
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleBulkDelete}
                    className="flex-1 sm:flex-none"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Users List */}
        <div className="space-y-3 sm:space-y-4">
          {/* Select All */}
          {filteredUsers.length > 0 && (
            <div className="flex items-center space-x-2 p-3 bg-muted rounded-md">
              <Checkbox
                checked={selectedUsers.length === filteredUsers.length}
                onCheckedChange={handleSelectAll}
              />
              <span className="text-sm font-medium">Select All</span>
            </div>
          )}

          {/* Responsive Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="p-3 text-left">
                    <Checkbox
                      checked={selectedUsers.length === filteredUsers.length}
                      onCheckedChange={handleSelectAll}
                    />
                  </th>
                  <th className="p-3 text-left font-medium text-sm">User</th>
                  <th className="p-3 text-left font-medium text-sm hidden sm:table-cell">Email</th>
                  <th className="p-3 text-left font-medium text-sm hidden md:table-cell">Role</th>
                  <th className="p-3 text-left font-medium text-sm hidden lg:table-cell">Joined</th>
                  <th className="p-3 text-left font-medium text-sm hidden xl:table-cell">Updated</th>
                  <th className="p-3 text-left font-medium text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
          {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-muted/30 transition-colors">
                    <td className="p-3">
                    <Checkbox
                      checked={selectedUsers.includes(user.id)}
                      onCheckedChange={() => handleSelectUser(user.id)}
                    />
                    </td>
                    <td className="p-3">
                      <div className="flex items-center space-x-3">
                        <ProfileImage user={user} size="sm" />
                        <div className="min-w-0">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-sm truncate">
                              {user.name || 'No Name'}
                            </span>
                        {user.id === currentUser?.id && (
                          <Badge variant="outline" className="text-xs">
                            You
                          </Badge>
                        )}
                      </div>
                          <div className="text-xs text-muted-foreground sm:hidden">
                          {user.email}
                        </div>
                          <div className="flex items-center space-x-2 mt-1 sm:hidden">
                            {getRoleBadge(user.role)}
                            <span className="text-xs text-muted-foreground">
                          Joined {formatDate(user.createdAt)}
                            </span>
                        </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 hidden sm:table-cell">
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-sm truncate max-w-[200px]">{user.email}</span>
                    </div>
                    </td>
                    <td className="p-3 hidden md:table-cell">
                      {getRoleBadge(user.role)}
                    </td>
                    <td className="p-3 hidden lg:table-cell">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-sm">{formatDate(user.createdAt)}</span>
                  </div>
                    </td>
                    <td className="p-3 hidden xl:table-cell">
                  <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-sm">{formatDate(user.updatedAt)}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center space-x-1">
                        {/* Desktop Actions */}
                        <div className="hidden sm:flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openViewModal(user)}
                      title="View user details"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditModal(user)}
                      disabled={user.id === currentUser?.id}
                      title="Edit user"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteUser(user.id)}
                      disabled={user.id === currentUser?.id}
                      className="text-red-600 hover:text-red-700"
                      title="Delete user"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                        {/* Mobile Actions */}
                        <div className="sm:hidden relative">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowUserActions(showUserActions === user.id ? null : user.id)}
                            className="p-1"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                          
                          {showUserActions === user.id && (
                            <div className="absolute right-0 top-8 bg-white dark:bg-gray-800 border rounded-md shadow-lg z-10 min-w-[120px]">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openViewModal(user)}
                                className="w-full justify-start rounded-none"
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                View
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openEditModal(user)}
                                disabled={user.id === currentUser?.id}
                                className="w-full justify-start rounded-none"
                              >
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteUser(user.id)}
                                disabled={user.id === currentUser?.id}
                                className="w-full justify-start rounded-none text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </Button>
                </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredUsers.length === 0 && !isLoading && (
          <Card>
            <CardContent className="p-8 text-center">
              <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No users found</h3>
              <p className="text-muted-foreground text-sm">
                {searchTerm || roleFilter !== 'all' ? 'Try adjusting your search terms or filters.' : 'Get started by adding your first user.'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
          <DialogContent className="max-w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto mx-4 sm:mx-0 p-2 sm:p-4">
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
              <DialogDescription>Create a new user account</DialogDescription>
            </DialogHeader>
            <CardContent>
              <form onSubmit={handleAddUser} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="role">Role</Label>
                  <select
                    id="role"
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value as 'ADMIN' | 'USER'})}
                    className="w-full p-2 border rounded-md"
                    required
                  >
                    <option value="USER">User</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="profileImage">Profile Image</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="file"
                        id="profileImage"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('profileImage')?.click()}
                        className="w-full"
                      >
                        <Camera className="w-4 h-4 mr-2" />
                        Choose Image
                      </Button>
                    </div>
                    {imagePreview && (
                      <div className="relative inline-block">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-20 h-20 rounded-full object-cover border"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={removeImage}
                          className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                  <Button type="submit" className="flex-1">Create User</Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowAddModal(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
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
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription>Update user information</DialogDescription>
            </DialogHeader>
            <CardContent>
              <form onSubmit={handleEditUser} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="editFirstName">First Name</Label>
                    <Input
                      id="editFirstName"
                      value={formData.firstName}
                      onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="editLastName">Last Name</Label>
                    <Input
                      id="editLastName"
                      value={formData.lastName}
                      onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="editEmail">Email</Label>
                  <Input
                    id="editEmail"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="editPassword">Password (leave blank to keep current)</Label>
                  <Input
                    id="editPassword"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="editRole">Role</Label>
                  <select
                    id="editRole"
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value as 'ADMIN' | 'USER'})}
                    className="w-full p-2 border rounded-md"
                    required
                  >
                    <option value="USER">User</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="editProfileImage">Profile Image</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="file"
                        id="editProfileImage"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('editProfileImage')?.click()}
                        className="w-full"
                      >
                        <Camera className="w-4 h-4 mr-2" />
                        Choose Image
                      </Button>
                    </div>
                    {imagePreview && (
                      <div className="relative inline-block">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-20 h-20 rounded-full object-cover border"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={removeImage}
                          className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                    {selectedUser?.profileImage && !imagePreview && (
                      <div className="relative inline-block">
                        <img
                          src={selectedUser.profileImage}
                          alt="Current"
                          className="w-20 h-20 rounded-full object-cover border"
                        />
                        <span className="text-xs text-muted-foreground block mt-1">Current image</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                  <Button type="submit" className="flex-1">Update User</Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowEditModal(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
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
          <DialogContent className="max-w-[95vw] sm:max-w-lg max-h-[90vh] overflow-y-auto mx-4 sm:mx-0 p-2 sm:p-4">
            <DialogHeader>
              <DialogTitle>User Details</DialogTitle>
              <DialogDescription>View detailed information about this user</DialogDescription>
            </DialogHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Profile Image and Basic Info */}
                <div className="flex items-center space-x-4">
                  <ProfileImage user={selectedUser} size="lg" />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-semibold truncate">{selectedUser.name || 'No Name'}</h3>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 mt-1">
                      {getRoleBadge(selectedUser.role)}
                      {selectedUser.id === currentUser?.id && (
                        <Badge variant="outline" className="text-xs mt-1 sm:mt-0">
                          You
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* User Information Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-sm truncate">{selectedUser.email}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Role</Label>
                    <div className="flex items-center space-x-2">
                      {selectedUser.role === 'ADMIN' ? (
                        <Shield className="w-4 h-4 text-red-600 flex-shrink-0" />
                      ) : (
                        <User className="w-4 h-4 text-blue-600 flex-shrink-0" />
                      )}
                      <span className="text-sm capitalize">{selectedUser.role.toLowerCase()}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">User ID</Label>
                    <div className="flex items-center space-x-2">
                      <Activity className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-sm font-mono text-xs break-all">{selectedUser.id}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <span className="text-sm">Active</span>
                    </div>
                  </div>
                </div>

                {/* Timestamps */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-muted-foreground">Account Information</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-muted-foreground">Joined</Label>
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-sm">{formatDate(selectedUser.createdAt)}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-muted-foreground">Last Updated</Label>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-sm">{formatDate(selectedUser.updatedAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Profile Image Section */}
                {selectedUser.profileImage && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Profile Image</Label>
                    <div className="flex items-center space-x-2">
                      <Camera className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-sm">Image uploaded</span>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowViewModal(false)
                      openEditModal(selectedUser)
                    }}
                    className="flex-1"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit User
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowViewModal(false)}
                    className="flex-1"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </CardContent>
          </DialogContent>
        </Dialog>
      )}
    </div>
  </div>
  )
} 