"use client"

import React from 'react'
import { 
  Plus, 
  Upload, 
  FileText, 
  Megaphone, 
  Edit, 
  Trash2, 
  Eye, 
  Star,
  Calendar,
  User,
  Tag,
  X,
  CheckCircle,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Quote,
  Search
} from 'lucide-react'
import { useState, useEffect, useRef } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/components/ui/toast'

interface Content {
  id: string
  title: string
  description?: string
  type: 'ANNOUNCEMENT' | 'NEWS' | 'EVENT'
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
  fileUrl?: string
  thumbnail?: string
  fileUrls?: string | string[] | null // JSON string or parsed array of multiple file URLs
  thumbnailMode?: string // SINGLE or MULTIPLE
  selectedThumbnails?: string | string[] | null // JSON string or parsed array of selected thumbnail URLs
  tags?: string
  featured: boolean
  order?: number
  createdAt: string
  author: {
    name: string
  }
}

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

const RichTextEditor = ({ value, onChange, placeholder }: RichTextEditorProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value)
  }

  const wrapText = (before: string, after: string) => {
    if (textareaRef.current) {
      const textarea = textareaRef.current
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const selectedText = textarea.value.substring(start, end)
      
      if (selectedText) {
        const newText = before + selectedText + after
        const newValue = textarea.value.substring(0, start) + newText + textarea.value.substring(end)
        onChange(newValue)
        
        // Set cursor position after the inserted text
        setTimeout(() => {
          textarea.focus()
          textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length)
        }, 0)
      } else {
        // If no text is selected, insert the tags at cursor position
        const newValue = textarea.value.substring(0, start) + before + after + textarea.value.substring(end)
        onChange(newValue)
        
        // Set cursor position between the tags
        setTimeout(() => {
          textarea.focus()
          textarea.setSelectionRange(start + before.length, start + before.length)
        }, 0)
      }
    }
  }

  const formatBold = () => wrapText('<strong>', '</strong>')
  const formatItalic = () => wrapText('<em>', '</em>')
  const formatUnderline = () => wrapText('<u>', '</u>')

  const insertList = (ordered: boolean) => {
    if (textareaRef.current) {
      const textarea = textareaRef.current
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const selectedText = textarea.value.substring(start, end)
      
      if (selectedText) {
        const lines = selectedText.split('\n')
        const listItems = lines.map(line => line.trim()).filter(line => line.length > 0)
        const tag = ordered ? 'ol' : 'ul'
        const listHtml = `<${tag}>\n${listItems.map(item => `  <li>${item}</li>`).join('\n')}\n</${tag}>`
        
        const newValue = textarea.value.substring(0, start) + listHtml + textarea.value.substring(end)
        onChange(newValue)
      } else {
        const tag = ordered ? 'ol' : 'ul'
        const listHtml = `<${tag}>\n  <li>List item</li>\n</${tag}>`
        const newValue = textarea.value.substring(0, start) + listHtml + textarea.value.substring(end)
        onChange(newValue)
      }
    }
  }

  const insertQuote = () => {
    if (textareaRef.current) {
      const textarea = textareaRef.current
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const selectedText = textarea.value.substring(start, end)
      
      if (selectedText) {
        const newText = `<blockquote>${selectedText}</blockquote>`
        const newValue = textarea.value.substring(0, start) + newText + textarea.value.substring(end)
        onChange(newValue)
      } else {
        const newText = '<blockquote>Quote text here</blockquote>'
        const newValue = textarea.value.substring(0, start) + newText + textarea.value.substring(end)
        onChange(newValue)
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Handle formatting shortcuts
    if (e.ctrlKey || e.metaKey) {
      switch (e.key.toLowerCase()) {
        case 'b':
          e.preventDefault()
          formatBold()
          break
        case 'i':
          e.preventDefault()
          formatItalic()
          break
        case 'u':
          e.preventDefault()
          formatUnderline()
          break
      }
    }
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 bg-gray-50 border-b">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={formatBold}
          className="h-8 w-8 p-0"
          title="Bold (Ctrl+B)"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={formatItalic}
          className="h-8 w-8 p-0"
          title="Italic (Ctrl+I)"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={formatUnderline}
          className="h-8 w-8 p-0"
          title="Underline (Ctrl+U)"
        >
          <Underline className="h-4 w-4" />
        </Button>
        
        <div className="w-px h-6 bg-gray-300 mx-1"></div>
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => insertList(false)}
          className="h-8 w-8 p-0"
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => insertList(true)}
          className="h-8 w-8 p-0"
          title="Numbered List"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={insertQuote}
          className="h-8 w-8 p-0"
          title="Quote"
        >
          <Quote className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Editor */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="min-h-[120px] w-full p-3 focus:outline-none focus:ring-0 resize-none"
        style={{
          minHeight: '120px',
          fontFamily: 'inherit',
          fontSize: 'inherit',
          lineHeight: 'inherit'
        }}
      />
    </div>
  )
}

export default function ContentManagementPage() {
  const { success, error } = useToast()
  const [contents, setContents] = useState<Content[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [selectedType, setSelectedType] = useState<'ANNOUNCEMENT' | 'NEWS' | 'EVENT'>('ANNOUNCEMENT')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingContent, setEditingContent] = useState<Content | null>(null)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tags: '',
    featured: false,
    order: 0
  })
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [dragActive, setDragActive] = useState(false)
  const [thumbnailMode, setThumbnailMode] = useState<'SINGLE' | 'MULTIPLE'>('SINGLE')
  const [selectedThumbnails, setSelectedThumbnails] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchContents()
  }, [])



  // Filter content based on search query
  const filteredContents = contents.filter(content => {
    if (!searchQuery) return true
    
    const query = searchQuery.toLowerCase()
    return (
      content.title.toLowerCase().includes(query) ||
      (content.description && content.description.toLowerCase().includes(query)) ||
      (content.tags && content.tags.toLowerCase().includes(query)) ||
      content.type.toLowerCase().includes(query) ||
      content.status.toLowerCase().includes(query)
    )
  })

  const fetchContents = async () => {
    try {
      const response = await fetch('/api/content')
      if (response.ok) {
        const data = await response.json()
        setContents(data)
      }
    } catch (err) {
      console.error('Error fetching contents:', err)
      error("Failed to load content", "Error")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const newFiles = Array.from(e.dataTransfer.files)
      setSelectedFiles(prev => [...prev, ...newFiles])
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      const newFiles = Array.from(files)
      setSelectedFiles(prev => [...prev, ...newFiles])
    }
  }

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUploading(true)

    try {
      // First, upload any selected files to get URLs
      const uploadedFileUrls: string[] = []
      
      if (selectedFiles.length > 0) {
        for (const file of selectedFiles) {
          const uploadFormData = new FormData()
          uploadFormData.append('file', file)
          uploadFormData.append('type', 'content')
          
          const uploadResponse = await fetch('/api/upload', {
            method: 'POST',
            body: uploadFormData
          })
          
          if (uploadResponse.ok) {
            const uploadResult = await uploadResponse.json()
            uploadedFileUrls.push(uploadResult.url)
          } else {
            throw new Error(`Failed to upload file: ${file.name}`)
          }
        }
      }

      const formDataToSend = new FormData()
      formDataToSend.append('title', formData.title)
      formDataToSend.append('description', formData.description)
      formDataToSend.append('type', selectedType)
      formDataToSend.append('tags', formData.tags)
      formDataToSend.append('featured', formData.featured.toString())
      formDataToSend.append('order', formData.order.toString())
      formDataToSend.append('thumbnailMode', thumbnailMode)
      
      // Process selected thumbnails to get actual URLs
      const processedSelectedThumbnails: string[] = []
      selectedThumbnails.forEach(selection => {
        const fileIndex = selectedFiles.findIndex(f => f.name === selection)
        if (fileIndex >= 0 && uploadedFileUrls[fileIndex]) {
          processedSelectedThumbnails.push(uploadedFileUrls[fileIndex])
        }
      })
      
      if (processedSelectedThumbnails.length > 0) {
        formDataToSend.append('selectedThumbnails', JSON.stringify(processedSelectedThumbnails))
      }

      // Save all uploaded file URLs
      if (uploadedFileUrls.length > 0) {
        formDataToSend.append('fileUrls', JSON.stringify(uploadedFileUrls))
      }

      const response = await fetch('/api/content', {
        method: 'POST',
        body: formDataToSend
      })

      if (response.ok) {
        success("Content uploaded successfully", "Success")
        setIsDialogOpen(false)
        setFormData({ title: '', description: '', tags: '', featured: false, order: 0 })
        setSelectedFiles([])
        setSelectedThumbnails([])
        fetchContents()
      } else {
        const errorData = await response.json()
        error(errorData.message || "Failed to upload content", "Error")
      }
    } catch (err) {
      console.error('Error uploading content:', err)
      error("Failed to upload content", "Error")
    } finally {
      setIsUploading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this content?')) {
    try {
      const response = await fetch(`/api/content/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        success("Content deleted successfully", "Success")
        fetchContents()
      } else {
          error("Failed to delete content", "Error")
      }
    } catch (err) {
      console.error('Error deleting content:', err)
      error("Failed to delete content", "Error")
      }
    }
  }

  const handleStatusChange = async (id: string, status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED') => {
    try {
      const response = await fetch(`/api/content/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      })

      if (response.ok) {
        success(`Content ${status.toLowerCase()} successfully`, "Success")
        fetchContents()
      } else {
        error("Failed to update status", "Error")
      }
    } catch (err) {
      console.error('Error updating status:', err)
      error("Failed to update status", "Error")
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'ANNOUNCEMENT': return <Megaphone className="h-4 w-4" />
      case 'NEWS': return <FileText className="h-4 w-4" />
      case 'EVENT': return <Calendar className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PUBLISHED': return 'bg-green-100 text-green-800'
      case 'DRAFT': return 'bg-yellow-100 text-yellow-800'
      case 'ARCHIVED': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))  } ${  sizes[i]}`
  }

  const parseFileUrls = (fileUrls: string | null | undefined | string[]): string[] => {
    if (!fileUrls) return []
    
    // If it's already an array, return it
    if (Array.isArray(fileUrls)) return fileUrls
    
    // If it's a string, try to parse it
    if (typeof fileUrls === 'string' && fileUrls.trim() !== '') {
      try {
        return JSON.parse(fileUrls)
      } catch {
        return []
      }
    }
    
    return []
  }

  const openEditModal = (content: Content) => {
    setEditingContent(content)
    setSelectedType(content.type)
    setFormData({
      title: content.title,
      description: content.description || '',
      tags: content.tags || '',
      featured: content.featured,
      order: content.order || 0
    })
    setSelectedFiles([])
    setThumbnailMode((content.thumbnailMode as 'SINGLE' | 'MULTIPLE') || 'SINGLE')
    
         // Load existing selected thumbnails
     if (content.selectedThumbnails) {
       try {
         const selectedThumbnailUrls = Array.isArray(content.selectedThumbnails) ? content.selectedThumbnails : 
           (typeof content.selectedThumbnails === 'string' && content.selectedThumbnails.trim() !== '' && content.selectedThumbnails !== '[]' ? JSON.parse(content.selectedThumbnails) : [])
         const existingFileUrls = parseFileUrls(content.fileUrls)
        
        if (selectedThumbnailUrls.length > 0) {
          // Map selected thumbnail URLs to their indices in the existing file URLs
          const thumbnailSelections = selectedThumbnailUrls.map((url: string) => {
            const existingIndex = existingFileUrls.indexOf(url)
            return existingIndex >= 0 ? `existing-${existingIndex}` : null
          }).filter(Boolean) as string[]
          
          setSelectedThumbnails(thumbnailSelections)
        } else {
          setSelectedThumbnails([])
        }
      } catch (error) {
        console.error('Error parsing selectedThumbnails:', error)
        setSelectedThumbnails([])
      }
    } else {
      setSelectedThumbnails([])
    }
    

    setIsEditDialogOpen(true)
  }

  const closeEditModal = () => {
    setIsEditDialogOpen(false)
    setEditingContent(null)
    setFormData({ title: '', description: '', tags: '', featured: false, order: 0 })
    setSelectedFiles([])
    setSelectedType('ANNOUNCEMENT')
    setThumbnailMode('SINGLE')
    setSelectedThumbnails([])
  }

  const resetFormData = () => {
    setFormData({ title: '', description: '', tags: '', featured: false, order: 0 })
    setSelectedFiles([])
    setSelectedType('ANNOUNCEMENT')
    setEditingContent(null)
    setThumbnailMode('SINGLE')
    setSelectedThumbnails([])
  }

  const openAddModal = () => {
    resetFormData()
    setIsDialogOpen(true)
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingContent) return

    setIsUploading(true)

    try {
      // First, upload any new files to get URLs
      const uploadedFileUrls: string[] = []
      
      if (selectedFiles.length > 0) {
        for (const file of selectedFiles) {
          const uploadFormData = new FormData()
          uploadFormData.append('file', file)
          uploadFormData.append('type', 'content')
          
          const uploadResponse = await fetch('/api/upload', {
            method: 'POST',
            body: uploadFormData
          })
          
          if (uploadResponse.ok) {
            const uploadResult = await uploadResponse.json()
            uploadedFileUrls.push(uploadResult.url)
          } else {
            throw new Error(`Failed to upload file: ${file.name}`)
          }
        }
      }

      const formDataToSend = new FormData()
      formDataToSend.append('title', formData.title)
      formDataToSend.append('description', formData.description)
      formDataToSend.append('type', selectedType)
      formDataToSend.append('tags', formData.tags)
      formDataToSend.append('featured', formData.featured.toString())
      formDataToSend.append('order', formData.order.toString())
      
      // Process selected thumbnails for edit
      let processedSelectedThumbnails: string[] = []
      
      if (editingContent) {
        const existingFileUrls = parseFileUrls(editingContent.fileUrls)
        
        selectedThumbnails.forEach(selection => {
          if (selection.startsWith('existing-')) {
            // Extract index from "existing-{index}"
            const index = parseInt(selection.replace('existing-', ''))
            if (existingFileUrls[index]) {
              processedSelectedThumbnails.push(existingFileUrls[index])
            }
          } else {
            // This is a new file name, find the corresponding uploaded URL
            const fileIndex = selectedFiles.findIndex(f => f.name === selection)
            if (fileIndex >= 0 && uploadedFileUrls[fileIndex]) {
              processedSelectedThumbnails.push(uploadedFileUrls[fileIndex])
            }
          }
        })
      } else {
        processedSelectedThumbnails = selectedThumbnails
      }
      

      
      formDataToSend.append('thumbnailMode', thumbnailMode)
      if (processedSelectedThumbnails.length > 0) {
        formDataToSend.append('selectedThumbnails', JSON.stringify(processedSelectedThumbnails))
      }

      // Combine existing file URLs with new uploaded URLs
      let allFileUrls: string[] = []
      if (editingContent) {
        const existingFileUrls = parseFileUrls(editingContent.fileUrls)
        allFileUrls = [...existingFileUrls, ...uploadedFileUrls]
      } else {
        allFileUrls = uploadedFileUrls
      }
      
      if (allFileUrls.length > 0) {
        formDataToSend.append('fileUrls', JSON.stringify(allFileUrls))
      }

      const response = await fetch(`/api/content/${editingContent.id}`, {
        method: 'PUT',
        body: formDataToSend
      })

      if (response.ok) {
        success("Content updated successfully", "Success")
        closeEditModal()
        fetchContents() // Refresh the content list
      } else {
        const errorData = await response.json()
        error(errorData.message || "Failed to update content", "Error")
      }
    } catch (err) {
      console.error('Error updating content:', err)
      error("Failed to update content", "Error")
    } finally {
      setIsUploading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8">
          <div className="flex items-center justify-center h-48 sm:h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground text-sm sm:text-base">Loading content...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8">
        {/* Header - Mobile First */}
        <div className="mb-6 sm:mb-8 pt-16 lg:pt-8">
          <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Content Management</h1>
              <p className="text-muted-foreground mt-2 text-sm sm:text-base">
                Upload and manage content for your website homepage
              </p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={(open) => {
              setIsDialogOpen(open)
              if (!open) {
                resetFormData()
              }
            }}>
              <DialogTrigger asChild>
                <Button onClick={openAddModal} className="w-full sm:w-auto h-12 sm:h-10 text-base sm:text-sm">
                        <Plus className="mr-2 h-4 w-4" />
                  Upload Content
                      </Button>
              </DialogTrigger>
              <DialogContent className="max-w-[95vw] sm:max-w-4xl max-h-[90vh] overflow-y-auto mx-4 sm:mx-0">
                <DialogHeader>
                  <DialogTitle className="text-lg sm:text-xl">Upload New Content</DialogTitle>
                  <DialogDescription className="text-sm sm:text-base">
                    Add new content to your website. Supported types: Announcements, News, and Events.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                  <Tabs value={selectedType} onValueChange={(value) => setSelectedType(value as any)} className="w-full">
                    <TabsList className="grid w-full grid-cols-3 gap-1 sm:gap-2 p-1 sm:p-1 bg-muted/30 rounded-lg">
                      <TabsTrigger 
                        value="ANNOUNCEMENT" 
                        className="text-sm sm:text-base py-3 sm:py-2 px-3 sm:px-4 data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-foreground transition-all duration-200"
                      >
                        Announcement
                      </TabsTrigger>
                      <TabsTrigger 
                        value="NEWS" 
                        className="text-sm sm:text-base py-3 sm:py-2 px-3 sm:px-4 data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-foreground transition-all duration-200"
                      >
                        News
                      </TabsTrigger>
                      <TabsTrigger 
                        value="EVENT" 
                        className="text-sm sm:text-base py-3 sm:py-2 px-3 sm:px-4 data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-foreground transition-all duration-200"
                      >
                        Event
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>

                  <div className="grid grid-cols-1 gap-6 sm:gap-6 lg:grid-cols-2">
                  <div className="space-y-3 sm:space-y-4">
                <div>
                      <label className="text-sm font-medium">Title</label>
                  <Input 
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter content title" 
                    required
                    className="h-12 sm:h-10 text-base sm:text-sm"
                  />
                </div>

                <div>
                      <label className="text-sm font-medium">Description</label>
                        <RichTextEditor
                        value={formData.description}
                          onChange={(value) => setFormData({ ...formData, description: value })}
                    placeholder="Enter content description" 
                  />
                </div>

                  <div>
                      <label className="text-sm font-medium">Tags</label>
                  <Input 
                        value={formData.tags}
                        onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                        placeholder="Enter tags (comma separated)"
                        className="h-12 sm:h-10 text-base sm:text-sm"
                  />
                </div>

                      <div className="flex items-center space-x-4">
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={formData.featured}
                            onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                            className="rounded"
                          />
                          <span className="text-sm">Featured Content</span>
                        </label>
                      </div>

                      <div>
                        <label className="text-sm font-medium">Display Order</label>
                        <Input 
                          type="number"
                          value={formData.order}
                          onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                          placeholder="0"
                          className="h-12 sm:h-10 text-base sm:text-sm"
                        />
                      </div>
                    </div>

                    <div className="space-y-3 sm:space-y-4">
                <div>
                      <label className="text-sm font-medium">File Upload</label>
                        <div 
                          className={`border-2 border-dashed rounded-lg p-4 sm:p-6 text-center transition-colors ${
                            dragActive 
                              ? 'border-sky-500 bg-sky-50' 
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                          onDragEnter={handleDrag}
                          onDragLeave={handleDrag}
                          onDragOver={handleDrag}
                          onDrop={handleDrop}
                        >
                        <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                        <input
                    type="file" 
                          onChange={handleFileChange}
                          className="hidden"
                          id="file-upload"
                          accept="image/*,video/*,.pdf,.doc,.docx"
                            multiple
                        />
                        <label htmlFor="file-upload" className="cursor-pointer">
                          <span className="text-sm text-gray-600">
                            Click to upload or drag and drop
                          </span>
                            <p className="text-xs text-gray-500 mt-1">
                              Supports multiple files
                            </p>
                        </label>
                        </div>
                      </div>

                      {/* Selected Files Display */}
                      {selectedFiles.length > 0 && (
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Selected Files ({selectedFiles.length})</label>
                          <div className="max-h-40 overflow-y-auto space-y-2">
                            {selectedFiles.map((file, index) => (
                              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                                <div className="flex items-center space-x-2">
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                  <div>
                                    <p className="text-sm font-medium">{file.name}</p>
                                    <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                                  </div>
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeFile(index)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Thumbnail Selection */}
                      {selectedFiles.length > 0 && (
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium">Thumbnail Selection</label>
                            <div className="flex items-center space-x-4 mt-2">
                              <label className="flex items-center space-x-2">
                                <input
                                  type="radio"
                                  name="thumbnailMode"
                                  value="SINGLE"
                                  checked={thumbnailMode === 'SINGLE'}
                                  onChange={(e) => {
                                    const newMode = e.target.value as 'SINGLE' | 'MULTIPLE'
                                    setThumbnailMode(newMode)
                                    
                                    // If switching to single mode and multiple thumbnails are selected, keep only the first
                                    if (newMode === 'SINGLE' && selectedThumbnails.length > 1) {
                                      setSelectedThumbnails([selectedThumbnails[0]!])
                                    }
                                  }}
                                  className="rounded"
                                />
                                <span className="text-sm">Single Thumbnail</span>
                              </label>
                              <label className="flex items-center space-x-2">
                                <input
                                  type="radio"
                                  name="thumbnailMode"
                                  value="MULTIPLE"
                                  checked={thumbnailMode === 'MULTIPLE'}
                                  onChange={(e) => {
                                    const newMode = e.target.value as 'SINGLE' | 'MULTIPLE'
                                    setThumbnailMode(newMode)
                                    
                                    // If switching to single mode and multiple thumbnails are selected, keep only the first
                                    if (newMode === 'SINGLE' && selectedThumbnails.length > 1) {
                                      setSelectedThumbnails([selectedThumbnails[0]!])
                                    }
                                  }}
                                  className="rounded"
                                />
                                <span className="text-sm">Multiple Thumbnails (Dynamic)</span>
                              </label>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              {thumbnailMode === 'SINGLE' 
                                ? 'Select one image to use as the main thumbnail' 
                                : 'Select multiple images to rotate as thumbnails on page refresh'
                              }
                            </p>
                          </div>

                          {/* Thumbnail Preview */}
                          <div>
                            <label className="text-sm font-medium">
                              {thumbnailMode === 'SINGLE' ? 'Select Thumbnail' : 'Select Thumbnails'}
                            </label>
                            <div className="grid grid-cols-2 gap-2 mt-2">
                              {selectedFiles.map((file, index) => {
                                const isImage = file.type.startsWith('image/')
                                const isSelected = selectedThumbnails.includes(file.name)
                                
                                return (
                                  <div key={index} className="relative">
                                    <div 
                                      className={`aspect-video bg-gray-100 rounded-lg overflow-hidden cursor-pointer border-2 transition-colors ${
                                        isSelected ? 'border-sky-500 bg-sky-50' : 'border-gray-200 hover:border-gray-300'
                                      }`}
                                      onClick={() => {
                                        if (thumbnailMode === 'SINGLE') {
                                          setSelectedThumbnails([file.name])
                                        } else {
                                          if (isSelected) {
                                            setSelectedThumbnails(prev => prev.filter(name => name !== file.name))
                                          } else {
                                            setSelectedThumbnails(prev => [...prev, file.name])
                                          }
                                        }
                                      }}
                                    >
                                      {isImage ? (
                                        <img
                                          src={URL.createObjectURL(file)}
                                          alt={`Preview ${index + 1}`}
                                          className="w-full h-full object-cover"
                                        />
                                      ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                          <FileText className="h-8 w-8 text-gray-400" />
                                        </div>
                                      )}
                                      {isSelected && (
                                        <div className="absolute top-2 right-2">
                                          <div className="bg-sky-500 text-white rounded-full w-6 h-6 flex items-center justify-center">
                                            <CheckCircle className="h-4 w-4" />
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                    <p className="text-xs text-gray-600 mt-1 truncate">{file.name}</p>
                                  </div>
                                )
                              })}
                            </div>
                            {thumbnailMode === 'MULTIPLE' && selectedThumbnails.length > 0 && (
                              <p className="text-xs text-gray-500 mt-2">
                                Selected {selectedThumbnails.length} thumbnail{selectedThumbnails.length !== 1 ? 's' : ''} for rotation
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2 pt-4 border-t sm:flex-row sm:space-y-0 sm:space-x-2 sm:justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsDialogOpen(false)
                        resetFormData()
                      }}
                      className="w-full sm:w-auto h-12 sm:h-10"
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isUploading} className="w-full sm:w-auto h-12 sm:h-10">
                      {isUploading ? 'Uploading...' : 'Upload Content'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>

            {/* Edit Content Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
              if (!open) {
                closeEditModal()
              } else {
                setIsEditDialogOpen(open)
              }
            }}>
              <DialogContent className="max-w-[95vw] sm:max-w-4xl max-h-[90vh] overflow-y-auto mx-4 sm:mx-0">
                <DialogHeader>
                  <DialogTitle className="text-lg sm:text-xl">Edit Content</DialogTitle>
                  <DialogDescription className="text-sm sm:text-base">
                    Update content details and files. Supported types: Announcements, News, and Events.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleEditSubmit} className="space-y-4 sm:space-y-6">
                  <Tabs value={selectedType} onValueChange={(value) => setSelectedType(value as any)} className="w-full">
                    <TabsList className="grid w-full grid-cols-3 gap-1 sm:gap-2 p-1 sm:p-1 bg-muted/30 rounded-lg">
                      <TabsTrigger 
                        value="ANNOUNCEMENT" 
                        className="text-sm sm:text-base py-3 sm:py-2 px-3 sm:px-4 data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-foreground transition-all duration-200"
                      >
                        Announcement
                      </TabsTrigger>
                      <TabsTrigger 
                        value="NEWS" 
                        className="text-sm sm:text-base py-3 sm:py-2 px-3 sm:px-4 data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-foreground transition-all duration-200"
                      >
                        News
                      </TabsTrigger>
                      <TabsTrigger 
                        value="EVENT" 
                        className="text-sm sm:text-base py-3 sm:py-2 px-3 sm:px-4 data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-foreground transition-all duration-200"
                      >
                        Event
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>

                  <div className="grid grid-cols-1 gap-6 sm:gap-6 lg:grid-cols-2">
                    <div className="space-y-3 sm:space-y-4">
                      <div>
                        <label className="text-sm font-medium">Title</label>
                        <Input 
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          placeholder="Enter content title" 
                          required
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium">Description</label>
                        <RichTextEditor
                          value={formData.description}
                          onChange={(value) => setFormData({ ...formData, description: value })}
                          placeholder="Enter content description"
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium">Tags</label>
                        <Input 
                          value={formData.tags}
                          onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                          placeholder="Enter tags (comma separated)"
                        />
                </div>

                    <div className="flex items-center space-x-4">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.featured}
                          onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                          className="rounded"
                        />
                        <span className="text-sm">Featured Content</span>
                      </label>
                </div>

                <div>
                      <label className="text-sm font-medium">Display Order</label>
                  <Input 
                        type="number"
                        value={formData.order}
                        onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                        placeholder="0"
                  />
                </div>
                  </div>

                    <div className="space-y-3 sm:space-y-4">
                      <div>
                        <label className="text-sm font-medium">File Upload</label>
                        <div 
                          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                            dragActive 
                              ? 'border-sky-500 bg-sky-50' 
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                          onDragEnter={handleDrag}
                          onDragLeave={handleDrag}
                          onDragOver={handleDrag}
                          onDrop={handleDrop}
                        >
                          <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                          <input
                            type="file" 
                            onChange={handleFileChange}
                            className="hidden"
                            id="edit-file-upload"
                            accept="image/*,video/*,.pdf,.doc,.docx"
                            multiple
                          />
                          <label htmlFor="edit-file-upload" className="cursor-pointer">
                            <span className="text-sm text-gray-600">
                              Click to upload or drag and drop
                            </span>
                            <p className="text-xs text-gray-500 mt-1">
                              Supports multiple files
                            </p>
                          </label>
                        </div>
                      </div>

                      {/* Selected Files Display */}
                      {selectedFiles.length > 0 && (
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Selected Files ({selectedFiles.length})</label>
                          <div className="max-h-40 overflow-y-auto space-y-2">
                            {selectedFiles.map((file, index) => (
                              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                                <div className="flex items-center space-x-2">
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                  <div>
                                    <p className="text-sm font-medium">{file.name}</p>
                                    <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                                  </div>
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeFile(index)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Current Files Display */}
                      {editingContent && parseFileUrls(editingContent.fileUrls).length > 0 && (
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Current Files ({parseFileUrls(editingContent.fileUrls).length})</label>
                          <div className="grid grid-cols-2 gap-2">
                            {parseFileUrls(editingContent.fileUrls).map((url, index) => (
                              <div key={index} className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                                <img
                                  src={url}
                                  alt={`${editingContent.title} - File ${index + 1}`}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ))}
                          </div>
                          <p className="text-xs text-gray-500">
                            Select existing files as thumbnails or upload new ones
                          </p>
                        </div>
                      )}

                      {/* Thumbnail Selection for Edit */}
                      {(selectedFiles.length > 0 || (editingContent && parseFileUrls(editingContent.fileUrls).length > 0)) && (
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium">Thumbnail Selection</label>
                            <div className="flex items-center space-x-4 mt-2">
                              <label className="flex items-center space-x-2">
                                <input
                                  type="radio"
                                  name="editThumbnailMode"
                                  value="SINGLE"
                                  checked={thumbnailMode === 'SINGLE'}
                                  onChange={(e) => {
                                    const newMode = e.target.value as 'SINGLE' | 'MULTIPLE'
                                    setThumbnailMode(newMode)
                                    
                                    // If switching to single mode and multiple thumbnails are selected, keep only the first
                                    if (newMode === 'SINGLE' && selectedThumbnails.length > 1) {
                                      setSelectedThumbnails([selectedThumbnails[0]!])
                                    }
                                  }}
                                  className="rounded"
                                />
                                <span className="text-sm">Single Thumbnail</span>
                              </label>
                              <label className="flex items-center space-x-2">
                                <input
                                  type="radio"
                                  name="editThumbnailMode"
                                  value="MULTIPLE"
                                  checked={thumbnailMode === 'MULTIPLE'}
                                  onChange={(e) => {
                                    const newMode = e.target.value as 'SINGLE' | 'MULTIPLE'
                                    setThumbnailMode(newMode)
                                    
                                    // If switching to single mode and multiple thumbnails are selected, keep only the first
                                    if (newMode === 'SINGLE' && selectedThumbnails.length > 1) {
                                      setSelectedThumbnails([selectedThumbnails[0]!])
                                    }
                                  }}
                                  className="rounded"
                                />
                                <span className="text-sm">Multiple Thumbnails (Dynamic)</span>
                              </label>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              {thumbnailMode === 'SINGLE' 
                                ? 'Select one image to use as the main thumbnail' 
                                : 'Select multiple images to rotate as thumbnails on page refresh'
                              }
                            </p>
                          </div>

                          {/* Thumbnail Preview for Edit */}
                          <div>
                            <label className="text-sm font-medium">
                              {thumbnailMode === 'SINGLE' ? 'Select Thumbnail' : 'Select Thumbnails'}
                            </label>
                            <div className="grid grid-cols-2 gap-2 mt-2">
                              {/* Show new files if any */}
                              {selectedFiles.map((file, index) => {
                                const isImage = file.type.startsWith('image/')
                                const isSelected = selectedThumbnails.includes(file.name)
                                
                                return (
                                  <div key={`new-${index}`} className="relative">
                                    <div 
                                      className={`aspect-video bg-gray-100 rounded-lg overflow-hidden cursor-pointer border-2 transition-colors ${
                                        isSelected ? 'border-sky-500 bg-sky-50' : 'border-gray-200 hover:border-gray-300'
                                      }`}
                                      onClick={() => {
                                        if (thumbnailMode === 'SINGLE') {
                                          setSelectedThumbnails([file.name])
                                        } else {
                                          if (isSelected) {
                                            setSelectedThumbnails(prev => prev.filter(name => name !== file.name))
                                          } else {
                                            setSelectedThumbnails(prev => [...prev, file.name])
                                          }
                                        }
                                      }}
                                    >
                                      {isImage ? (
                                        <img
                                          src={URL.createObjectURL(file)}
                                          alt={`Preview ${index + 1}`}
                                          className="w-full h-full object-cover"
                                        />
                                      ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                          <FileText className="h-8 w-8 text-gray-400" />
                                        </div>
                                      )}
                                      {isSelected && (
                                        <div className="absolute top-2 right-2">
                                          <div className="bg-sky-500 text-white rounded-full w-6 h-6 flex items-center justify-center">
                                            <CheckCircle className="h-4 w-4" />
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                    <p className="text-xs text-gray-600 mt-1 truncate">{file.name}</p>
                                  </div>
                                )
                              })}
                              
                              {/* Show existing files */}
                              {editingContent && parseFileUrls(editingContent.fileUrls).map((url, index) => {
                                const isSelected = selectedThumbnails.includes(`existing-${index}`)
                                

                                
                                return (
                                  <div key={`existing-${index}`} className="relative">
                                    <div 
                                      className={`aspect-video bg-gray-100 rounded-lg overflow-hidden cursor-pointer border-2 transition-colors ${
                                        isSelected ? 'border-sky-500 bg-sky-50' : 'border-gray-200 hover:border-gray-300'
                                      }`}
                                      onClick={() => {
                                        if (thumbnailMode === 'SINGLE') {
                                          setSelectedThumbnails([`existing-${index}`])
                                        } else {
                                          if (isSelected) {
                                            setSelectedThumbnails(prev => prev.filter(name => name !== `existing-${index}`))
                                          } else {
                                            setSelectedThumbnails(prev => [...prev, `existing-${index}`])
                                          }
                                        }
                                      }}
                                    >
                                      <img
                                        src={url}
                                        alt={`Existing file ${index + 1}`}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                          // Fallback if image fails to load
                                          const target = e.target as HTMLImageElement
                                          target.style.display = 'none'
                                          const parent = target.parentElement
                                          if (parent) {
                                            parent.innerHTML = '<div class="w-full h-full flex items-center justify-center"><FileText class="h-8 w-8 text-gray-400" /></div>'
                                          }
                                        }}
                                      />
                                      {isSelected && (
                                        <div className="absolute top-2 right-2">
                                          <div className="bg-sky-500 text-white rounded-full w-6 h-6 flex items-center justify-center">
                                            <CheckCircle className="h-4 w-4" />
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                    <p className="text-xs text-gray-600 mt-1 truncate">Existing file {index + 1}</p>
                                  </div>
                                )
                              })}
                            </div>
                            {thumbnailMode === 'MULTIPLE' && selectedThumbnails.length > 0 && (
                              <p className="text-xs text-gray-500 mt-2">
                                Selected {selectedThumbnails.length} thumbnail{selectedThumbnails.length !== 1 ? 's' : ''} for rotation
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2 pt-4 border-t sm:flex-row sm:space-y-0 sm:space-x-2 sm:justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={closeEditModal}
                      className="w-full sm:w-auto h-12 sm:h-10"
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isUploading} className="w-full sm:w-auto h-12 sm:h-10">
                      {isUploading ? 'Updating...' : 'Update Content'}
                    </Button>
                  </div>
                </form>
            </DialogContent>
          </Dialog>
                      </div>
                    </div>

        {/* Search and View Toggle - Mobile First */}
        <div className="space-y-4 mb-6">
          {/* Search Bar - Full Width on Mobile */}
          <div className="w-full">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search content..."
                className="pl-10 w-full h-12 text-base"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          {/* Header and Controls - Stacked on Mobile */}
          <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-semibold sm:text-lg">Content</h2>
              <Badge variant="secondary" className="text-sm px-2 py-1">
                {filteredContents.length} items
              </Badge>
            </div>
            
            {/* View Toggle - Compact on Mobile */}
            <div className="flex items-center border rounded-lg p-1 bg-muted/30 w-fit">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="h-10 px-3 sm:h-8 sm:px-2"
              >
                <div className="grid grid-cols-2 gap-0.5 w-4 h-4">
                  <div className="w-1.5 h-1.5 bg-current rounded-sm"></div>
                  <div className="w-1.5 h-1.5 bg-current rounded-sm"></div>
                  <div className="w-1.5 h-1.5 bg-current rounded-sm"></div>
                  <div className="w-1.5 h-1.5 bg-current rounded-sm"></div>
                </div>
                <span className="ml-2 text-sm sm:text-xs sm:hidden">Grid</span>
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="h-10 px-3 sm:h-8 sm:px-2"
              >
                <List className="h-4 w-4" />
                <span className="ml-2 text-sm sm:text-xs sm:hidden">List</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Content Display - Mobile First */}
        <div className="max-h-[60vh] sm:max-h-[70vh] overflow-y-auto">
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 gap-4 sm:gap-6 pb-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredContents.map((content) => (
            <Card key={content.id} className="hover:shadow-md transition-shadow duration-200">
              <CardHeader className="p-4 sm:p-6">
                <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                  <div className="flex items-center space-x-2">
                    {getTypeIcon(content.type)}
                    <Badge variant="outline" className="text-xs px-2 py-1">
                      {content.type}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-1">
                    {content.featured && <Star className="h-4 w-4 text-yellow-500" />}
                    <Badge className={getStatusColor(content.status)}>
                      {content.status}
                    </Badge>
                  </div>
                    </div>
                <CardTitle className="text-lg sm:text-xl mt-3 sm:mt-0">{content.title}</CardTitle>
                <div className="mt-2">
                    <div 
                      dangerouslySetInnerHTML={{ __html: content.description || '' }}
                      className="text-sm text-muted-foreground prose prose-sm max-w-none line-clamp-2"
                      style={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}
                    />
                </div>
              </CardHeader>
                            <CardContent className="p-4 sm:p-6 pt-0">
                <div className="space-y-4">
                                         {/* Show images based on selectedThumbnails or fileUrls */}
                     {(() => {
                       const fileUrls = parseFileUrls(content.fileUrls || null)
                       const selectedThumbnails = content.selectedThumbnails ? 
                         (Array.isArray(content.selectedThumbnails) ? content.selectedThumbnails : 
                          (typeof content.selectedThumbnails === 'string' && content.selectedThumbnails.trim() !== '' && content.selectedThumbnails !== '[]' ? JSON.parse(content.selectedThumbnails) : [])) : []
                       

                       
                       // If there are selected thumbnails, show them
                       if (selectedThumbnails.length > 0) {
                        return (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-700">
                                Thumbnails ({selectedThumbnails.length})
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 sm:gap-3">
                              {selectedThumbnails.slice(0, 4).map((url: string, index: number) => (
                                <div key={index} className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                                  <img
                                    src={url}
                                    alt={`${content.title} - Thumbnail ${index + 1}`}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      // Fallback if image fails to load
                                      const target = e.target as HTMLImageElement
                                      target.style.display = 'none'
                                      const parent = target.parentElement
                                      if (parent) {
                                        parent.innerHTML = '<div class="w-full h-full flex items-center justify-center"><FileText class="h-8 w-8 text-gray-400" /></div>'
                                      }
                                    }}
                                  />
                                </div>
                              ))}
                              {selectedThumbnails.length > 4 && (
                                <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                                  <span className="text-sm text-gray-500">
                                    +{selectedThumbnails.length - 4} more
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      }
                      // If no selected thumbnails but there are fileUrls, show them
                      else if (fileUrls.length > 0) {
                        return (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-700">
                                Files ({fileUrls.length})
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 sm:gap-3">
                              {fileUrls.slice(0, 4).map((url: string, index: number) => (
                                <div key={index} className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                                  <img
                                    src={url}
                                    alt={`${content.title} - File ${index + 1}`}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      // Fallback if image fails to load
                                      const target = e.target as HTMLImageElement
                                      target.style.display = 'none'
                                      const parent = target.parentElement
                                      if (parent) {
                                        parent.innerHTML = '<div class="w-full h-full flex items-center justify-center"><FileText class="h-8 w-8 text-gray-400" /></div>'
                                      }
                                    }}
                                  />
                                </div>
                              ))}
                              {fileUrls.length > 4 && (
                                <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                                  <span className="text-sm text-gray-500">
                                    +{fileUrls.length - 4} more
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      }
                      // Fallback to thumbnail if available
                      else if (content.thumbnail) {
                        return (
                          <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                            <img
                              src={content.thumbnail}
                              alt={content.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                // Fallback if image fails to load
                                const target = e.target as HTMLImageElement
                                target.style.display = 'none'
                                const parent = target.parentElement
                                if (parent) {
                                  parent.innerHTML = '<div class="w-full h-full flex items-center justify-center"><FileText class="h-8 w-8 text-gray-400" /></div>'
                                }
                              }}
                            />
                          </div>
                        )
                      }
                      return null
                    })()}
                  
                  <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <User className="h-3 w-3" />
                      <span>{content.author.name}</span>
                    </div>
                    <span>{new Date(content.createdAt).toLocaleDateString()}</span>
                  </div>

                  {content.tags && (
                    <div className="flex items-center space-x-1">
                      <Tag className="h-3 w-3 text-muted-foreground" />
                      <div className="flex flex-wrap gap-1">
                        {content.tags.split(',').map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs px-2 py-1">
                            {tag.trim()}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col space-y-2 pt-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                    <div className="flex space-x-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusChange(content.id, 'PUBLISHED')}
                        disabled={content.status === 'PUBLISHED'}
                        className="flex-1 sm:flex-none"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        <span className="sm:hidden">Publish</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusChange(content.id, 'DRAFT')}
                        disabled={content.status === 'DRAFT'}
                        className="flex-1 sm:flex-none"
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        <span className="sm:hidden">Draft</span>
                      </Button>
                    </div>
                      <div className="flex space-x-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditModal(content)}
                        className="flex-1 sm:flex-none"
                        >
                          <Edit className="h-3 w-3 mr-1" />
                        <span className="sm:hidden">Edit</span>
                        </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(content.id)}
                        className="flex-1 sm:flex-none"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                      </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          </div>
          ) : (
            /* List View - Mobile First */
            <div className="space-y-3 sm:space-y-4 pb-4">
              {filteredContents.map((content) => (
                <Card key={content.id} className="hover:shadow-md transition-shadow duration-200">
                  <div className="flex flex-col space-y-3 p-4 sm:flex-row sm:items-start sm:gap-4 sm:space-y-0">
                    {/* Thumbnail */}
                    <div className="flex-shrink-0 self-center sm:self-start">
                                             {(() => {
                         const fileUrls = parseFileUrls(content.fileUrls || null)
                         const selectedThumbnails = content.selectedThumbnails ? 
                           (Array.isArray(content.selectedThumbnails) ? content.selectedThumbnails : 
                            (typeof content.selectedThumbnails === 'string' && content.selectedThumbnails.trim() !== '' && content.selectedThumbnails !== '[]' ? JSON.parse(content.selectedThumbnails) : [])) : []
                         

                         
                         // If there are selected thumbnails, show the first one
                         if (selectedThumbnails.length > 0) {
                          return (
                            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-lg overflow-hidden">
                              <img
                                src={selectedThumbnails[0]!}
                                alt={content.title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  // Fallback if image fails to load
                                  const target = e.target as HTMLImageElement
                                  target.style.display = 'none'
                                  const parent = target.parentElement
                                  if (parent) {
                                    parent.innerHTML = '<div class="w-full h-full flex items-center justify-center"><FileText class="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" /></div>'
                                  }
                                }}
                              />
                            </div>
                          )
                        }
                        // If no selected thumbnails but there are fileUrls, show the first one
                        else if (fileUrls.length > 0) {
                          return (
                            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-lg overflow-hidden">
                              <img
                                src={fileUrls[0]}
                                alt={content.title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  // Fallback if image fails to load
                                  const target = e.target as HTMLImageElement
                                  target.style.display = 'none'
                                  const parent = target.parentElement
                                  if (parent) {
                                    parent.innerHTML = '<div class="w-full h-full flex items-center justify-center"><FileText class="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" /></div>'
                                  }
                                }}
                              />
                            </div>
                          )
                        }
                        // Fallback to thumbnail if available
                        else if (content.thumbnail) {
                          return (
                            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-lg overflow-hidden">
                              <img
                                src={content.thumbnail}
                                alt={content.title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  // Fallback if image fails to load
                                  const target = e.target as HTMLImageElement
                                  target.style.display = 'none'
                                  const parent = target.parentElement
                                  if (parent) {
                                    parent.innerHTML = '<div class="w-full h-full flex items-center justify-center"><FileText class="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" /></div>'
                                  }
                                }}
                              />
                            </div>
                          )
                        }
                        // Default fallback
                        return (
                          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                            <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
                          </div>
                        )
                      })()}
        </div>

                    {/* Content Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col space-y-2 mb-3 sm:flex-row sm:items-start sm:justify-between sm:space-y-0">
                        <div className="flex items-center space-x-2">
                          {getTypeIcon(content.type)}
                          <Badge variant="outline" className="text-xs px-2 py-1">
                            {content.type}
                          </Badge>
                          {content.featured && <Star className="h-4 w-4 text-yellow-500" />}
                        </div>
                        <Badge className={getStatusColor(content.status)}>
                          {content.status}
                        </Badge>
                      </div>
                      
                      <h3 className="text-lg font-semibold mb-2">{content.title}</h3>
                      
                      <div 
                        dangerouslySetInnerHTML={{ __html: content.description || '' }}
                        className="text-sm text-muted-foreground prose prose-sm max-w-none line-clamp-2 mb-3"
                        style={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}
                      />

                      <div className="flex flex-col space-y-2 mb-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <User className="h-3 w-3" />
                          <span>{content.author.name}</span>
                        </div>
                        <span>{new Date(content.createdAt).toLocaleDateString()}</span>
                      </div>

                      {content.tags && (
                        <div className="flex items-center space-x-1 mb-3">
                          <Tag className="h-3 w-3 text-muted-foreground" />
                          <div className="flex flex-wrap gap-1">
                            {content.tags.split(',').map((tag, index) => (
                              <Badge key={index} variant="secondary" className="text-xs px-2 py-1">
                                {tag.trim()}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex flex-col space-y-2 pt-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                        <div className="flex space-x-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStatusChange(content.id, 'PUBLISHED')}
                            disabled={content.status === 'PUBLISHED'}
                            className="flex-1 sm:flex-none"
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            <span className="sm:hidden">Publish</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStatusChange(content.id, 'DRAFT')}
                            disabled={content.status === 'DRAFT'}
                            className="flex-1 sm:flex-none"
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            <span className="sm:hidden">Draft</span>
                          </Button>
                        </div>
                        <div className="flex space-x-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEditModal(content)}
                            className="flex-1 sm:flex-none"
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            <span className="sm:hidden">Edit</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(content.id)}
                            className="flex-1 sm:flex-none"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {filteredContents.length === 0 && (
          <div className="text-center py-8 sm:py-12 px-4">
            {searchQuery ? (
              <>
                <Search className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mb-3 sm:mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No content found</h3>
                <p className="text-gray-500 mb-4 text-sm sm:text-base">
                  No content matches your search for "{searchQuery}"
                </p>
                <Button onClick={() => setSearchQuery('')} className="w-full sm:w-auto">
                  Clear Search
                </Button>
              </>
            ) : (
              <>
                <Upload className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mb-3 sm:mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No content yet</h3>
                <p className="text-gray-500 mb-4 text-sm sm:text-base">
              Get started by uploading your first piece of content
            </p>
                <Button onClick={openAddModal} className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Upload Content
            </Button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
} 