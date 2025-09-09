"use client"

import { 
  Plus, 
  Upload, 
  FileText, 
  DollarSign, 
  Calendar,
  Receipt,
  AlertCircle,
  CheckCircle,
  XCircle,
  Image as ImageIcon,
  X
} from 'lucide-react'
import { useState, useEffect, useRef } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/toast'

interface Expense {
  id: string
  title: string
  description?: string
  amount: number
  category: string
  date: string
  receipt?: string
  receipts?: string[]
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  programId: string
  program: {
    id: string
    title: string
    budget: number
  }
}

interface Program {
  id: string
  title: string
  budget: number
}

const EXPENSE_CATEGORIES = [
  { value: 'VENUE', label: 'Venue', icon: '🏢' },
  { value: 'MATERIALS', label: 'Materials', icon: '📦' },
  { value: 'FOOD', label: 'Food', icon: '🍽️' },
  { value: 'TRANSPORTATION', label: 'Transportation', icon: '🚗' },
  { value: 'EQUIPMENT', label: 'Equipment', icon: '🖥️' },
  { value: 'MARKETING', label: 'Marketing', icon: '📢' },
  { value: 'ADMINISTRATIVE', label: 'Administrative', icon: '📋' },
  { value: 'OTHER', label: 'Other', icon: '📝' }
]

interface ExpenseManagerProps {
  programId?: string
  onExpenseAdded?: () => void
}

export function ExpenseManager({ programId, onExpenseAdded }: ExpenseManagerProps) {
  const { error: showError, success: showSuccess } = useToast()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [programs, setPrograms] = useState<Program[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedProgram, setSelectedProgram] = useState(programId || '')
  const [uploadedImages, setUploadedImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    amount: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    receipt: ''
  })

  useEffect(() => {
    fetchExpenses()
    fetchPrograms()
  }, [selectedProgram, selectedCategory])

  const fetchExpenses = async () => {
    try {
      const params = new URLSearchParams()
      if (selectedProgram) params.append('programId', selectedProgram)
      if (selectedCategory) params.append('category', selectedCategory)

      const response = await fetch(`/api/expenses?${params}`)
      const data = await response.json()
      
      if (data.expenses) {
        setExpenses(data.expenses)
      }
    } catch (error) {
      console.error('Error fetching expenses:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPrograms = async () => {
    try {
      const response = await fetch('/api/programs')
      const data = await response.json()
      
      if (data.programs) {
        setPrograms(data.programs)
      }
    } catch (error) {
      console.error('Error fetching programs:', error)
    }
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    
    files.forEach(file => {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        showError('Please select only image files', 'Invalid File Type')
        return
      }
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        showError('Image size should be less than 5MB', 'File Too Large')
        return
      }

      // Add file to uploaded images
      setUploadedImages(prev => [...prev, file])
      
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreviews(prev => [...prev, e.target?.result as string])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index))
    setImagePreviews(prev => prev.filter((_, i) => i !== index))
  }

  const removeAllImages = () => {
    setUploadedImages([])
    setImagePreviews([])
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const uploadImages = async (files: File[]): Promise<string[]> => {
    const uploadPromises = files.map(async (file) => {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', 'receipt')

      try {
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        })

        if (!response.ok) {
          throw new Error('Failed to upload image')
        }

        const data = await response.json()
        return data.url
      } catch (error) {
        console.error('Error uploading image:', error)
        throw error
      }
    })

    return Promise.all(uploadPromises)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      let receiptUrls: string[] = []

      // Upload images if provided
      if (uploadedImages.length > 0) {
        receiptUrls = await uploadImages(uploadedImages)
      }

      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          programId: selectedProgram,
          amount: parseFloat(formData.amount),
          receipts: receiptUrls.length > 0 ? receiptUrls : undefined
        })
      })

      if (response.ok) {
        setFormData({
          title: '',
          description: '',
          amount: '',
          category: '',
          date: new Date().toISOString().split('T')[0],
          receipt: ''
        })
        setUploadedImages([])
        setImagePreviews([])
        setIsDialogOpen(false)
        fetchExpenses()
        onExpenseAdded?.()
        showSuccess('Expense created successfully!', 'Success')
      } else {
        const errorData = await response.json()
        showError(errorData.error || 'Failed to create expense', 'Error')
      }
    } catch (error) {
      console.error('Error creating expense:', error)
      showError('Failed to create expense', 'Error')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
      case 'REJECTED':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircle className="h-4 w-4" />
      case 'PENDING':
        return <AlertCircle className="h-4 w-4" />
      case 'REJECTED':
        return <XCircle className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  const getCategoryIcon = (category: string) => {
    const cat = EXPENSE_CATEGORIES.find(c => c.value === category)
    return cat?.icon || '📝'
  }

  const handleApproveExpense = async (expenseId: string) => {
    try {
      const response = await fetch(`/api/expenses/${expenseId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'APPROVED' })
      })

      if (response.ok) {
        showSuccess('Expense approved successfully!', 'Success')
        fetchExpenses() // Refresh the list
      } else {
        const errorData = await response.json()
        showError(errorData.error || 'Failed to approve expense', 'Error')
      }
    } catch (error) {
      console.error('Error approving expense:', error)
      showError('Failed to approve expense', 'Error')
    }
  }

  const handleRejectExpense = async (expenseId: string) => {
    try {
      const response = await fetch(`/api/expenses/${expenseId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'REJECTED' })
      })

      if (response.ok) {
        showSuccess('Expense rejected successfully!', 'Success')
        fetchExpenses() // Refresh the list
      } else {
        const errorData = await response.json()
        showError(errorData.error || 'Failed to reject expense', 'Error')
      }
    } catch (error) {
      console.error('Error rejecting expense:', error)
      showError('Failed to reject expense', 'Error')
    }
  }

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0)
  const pendingExpenses = expenses.filter(e => e.status === 'PENDING')
  const approvedExpenses = expenses.filter(e => e.status === 'APPROVED')

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Expense Management</h2>
          <p className="text-muted-foreground">Track and manage program expenses</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Expense
            </Button>
          </DialogTrigger>
                     <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Expense</DialogTitle>
              <DialogDescription>
                Record a new expense for tracking and budget management.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="program">Program</Label>
                  <select
                    id="program"
                    value={selectedProgram}
                    onChange={(e) => setSelectedProgram(e.target.value)}
                    className="w-full p-2 border rounded-md"
                    required
                  >
                    <option value="">Select Program</option>
                    {programs.map((program) => (
                      <option key={program.id} value={program.id}>
                        {program.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full p-2 border rounded-md"
                    required
                  >
                    <option value="">Select Category</option>
                    {EXPENSE_CATEGORIES.map((category) => (
                      <option key={category.value} value={category.value}>
                        {category.icon} {category.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="title">Expense Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Venue rental for youth workshop"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Additional details about the expense..."
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="amount">Amount (₱)</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="0.00"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>
              </div>
              
              {/* Image Upload Section */}
              <div>
                <Label htmlFor="receipt">Receipt Image</Label>
                <div className="space-y-3">
                  {/* Upload Button */}
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      Upload Receipt
                    </Button>
                                         <input
                       ref={fileInputRef}
                       type="file"
                       accept="image/*"
                       multiple
                       onChange={handleImageUpload}
                       className="hidden"
                     />
                     {uploadedImages.length > 0 && (
                       <Button
                         type="button"
                         variant="outline"
                         size="sm"
                         onClick={removeAllImages}
                         className="text-red-600 hover:text-red-700"
                       >
                         <X className="h-4 w-4" />
                         Remove All
                       </Button>
                     )}
                  </div>
                  
                                     {/* Image Previews */}
                   {imagePreviews.length > 0 && (
                     <div className="space-y-3">
                       <div className="text-sm font-medium text-muted-foreground">
                         {uploadedImages.length} receipt{uploadedImages.length > 1 ? 's' : ''} selected
                       </div>
                                               <div className="grid grid-cols-3 gap-2">
                          {imagePreviews.map((preview, index) => (
                            <div key={index} className="relative border rounded-lg p-1">
                              <img
                                src={preview}
                                alt={`Receipt preview ${index + 1}`}
                                className="w-full h-20 object-cover rounded"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => removeImage(index)}
                                className="absolute top-0.5 right-0.5 h-5 w-5 p-0 bg-red-500 text-white hover:bg-red-600"
                              >
                                <X className="h-2.5 w-2.5" />
                              </Button>
                              <div className="mt-1 text-xs text-muted-foreground truncate">
                                {uploadedImages[index]?.name?.substring(0, 15)}...
                              </div>
                            </div>
                          ))}
                        </div>
                     </div>
                   )}
                  

                </div>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Add Expense</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₱{totalExpenses.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {expenses.length} expenses recorded
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingExpenses.length}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting approval
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvedExpenses.length}</div>
            <p className="text-xs text-muted-foreground">
              Approved expenses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(expenses.map(e => e.category)).size}
            </div>
            <p className="text-xs text-muted-foreground">
              Different categories used
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div>
          <Label htmlFor="filter-program">Filter by Program</Label>
          <select
            id="filter-program"
            value={selectedProgram}
            onChange={(e) => setSelectedProgram(e.target.value)}
            className="w-full p-2 border rounded-md"
          >
            <option value="">All Programs</option>
            {programs.map((program) => (
              <option key={program.id} value={program.id}>
                {program.title}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="filter-category">Filter by Category</Label>
          <select
            id="filter-category"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full p-2 border rounded-md"
          >
            <option value="">All Categories</option>
            {EXPENSE_CATEGORIES.map((category) => (
              <option key={category.value} value={category.value}>
                {category.icon} {category.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Expenses List */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Expenses</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
        </TabsList>

                 <TabsContent value="all" className="space-y-4">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
             {expenses.map((expense) => (
               <Card key={expense.id} className="h-fit">
                 <CardHeader className="pb-3">
                   <div className="flex items-start justify-between">
                     <div className="flex items-start gap-2 flex-1">
                       <span className="text-xl">{getCategoryIcon(expense.category)}</span>
                       <div className="min-w-0 flex-1">
                         <CardTitle className="text-base leading-tight">{expense.title}</CardTitle>
                         <CardDescription className="text-xs">{expense.program.title}</CardDescription>
                       </div>
                     </div>
                     <Badge className={getStatusColor(expense.status)}>
                       {getStatusIcon(expense.status)}
                       {expense.status}
                     </Badge>
                   </div>
                 </CardHeader>
                 <CardContent className="pt-0">
                   <div className="flex items-center justify-between mb-2">
                     <div className="text-sm text-muted-foreground">
                       {new Date(expense.date).toLocaleDateString()}
                     </div>
                     <div className="text-lg font-bold">₱{expense.amount.toLocaleString()}</div>
                   </div>
                   {expense.description && (
                     <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{expense.description}</p>
                   )}
                   {expense.receipt && (
                     <div className="mt-2">
                       <a 
                         href={expense.receipt} 
                         target="_blank" 
                         rel="noopener noreferrer"
                         className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                       >
                         <ImageIcon className="h-3 w-3" />
                         View Receipt
                       </a>
                     </div>
                   )}
                   {expense.receipts && expense.receipts.length > 0 && (
                     <div className="mt-2">
                       <div className="text-xs font-medium text-muted-foreground mb-1">
                         Receipts ({expense.receipts.length})
                       </div>
                       <div className="flex flex-wrap gap-1">
                         {expense.receipts.map((receipt, index) => (
                           <a 
                             key={index}
                             href={receipt} 
                             target="_blank" 
                             rel="noopener noreferrer"
                             className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                           >
                             <ImageIcon className="h-3 w-3" />
                             Receipt {index + 1}
                           </a>
                         ))}
                       </div>
                     </div>
                   )}
                   
                                       {/* Approval Actions for Pending Expenses */}
                    {expense.status === 'PENDING' && (
                      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="default"
                            className="flex-1"
                            onClick={() => handleApproveExpense(expense.id)}
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="flex-1"
                            onClick={() => handleRejectExpense(expense.id)}
                          >
                            <XCircle className="h-3 w-3 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    )}
                 </CardContent>
               </Card>
             ))}
           </div>
         </TabsContent>

                 <TabsContent value="pending" className="space-y-4">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
             {pendingExpenses.map((expense) => (
               <Card key={expense.id} className="h-fit">
                 <CardHeader className="pb-3">
                   <div className="flex items-start justify-between">
                     <div className="flex items-start gap-2 flex-1">
                       <span className="text-xl">{getCategoryIcon(expense.category)}</span>
                       <div className="min-w-0 flex-1">
                         <CardTitle className="text-base leading-tight">{expense.title}</CardTitle>
                         <CardDescription className="text-xs">{expense.program.title}</CardDescription>
                       </div>
                     </div>
                     <Badge className={getStatusColor(expense.status)}>
                       {getStatusIcon(expense.status)}
                       {expense.status}
                     </Badge>
                   </div>
                 </CardHeader>
                 <CardContent className="pt-0">
                   <div className="flex items-center justify-between mb-2">
                     <div className="text-sm text-muted-foreground">
                       {new Date(expense.date).toLocaleDateString()}
                     </div>
                     <div className="text-lg font-bold">₱{expense.amount.toLocaleString()}</div>
                   </div>
                   {expense.description && (
                     <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{expense.description}</p>
                   )}
                   
                                       {/* Approval Actions for Pending Expenses */}
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="default"
                          className="flex-1"
                          onClick={() => handleApproveExpense(expense.id)}
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="flex-1"
                          onClick={() => handleRejectExpense(expense.id)}
                        >
                          <XCircle className="h-3 w-3 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </div>
                 </CardContent>
               </Card>
             ))}
           </div>
         </TabsContent>

                 <TabsContent value="approved" className="space-y-4">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
             {approvedExpenses.map((expense) => (
               <Card key={expense.id} className="h-fit">
                 <CardHeader className="pb-3">
                   <div className="flex items-start justify-between">
                     <div className="flex items-start gap-2 flex-1">
                       <span className="text-xl">{getCategoryIcon(expense.category)}</span>
                       <div className="min-w-0 flex-1">
                         <CardTitle className="text-base leading-tight">{expense.title}</CardTitle>
                         <CardDescription className="text-xs">{expense.program.title}</CardDescription>
                       </div>
                     </div>
                     <Badge className={getStatusColor(expense.status)}>
                       {getStatusIcon(expense.status)}
                       {expense.status}
                     </Badge>
                   </div>
                 </CardHeader>
                 <CardContent className="pt-0">
                   <div className="flex items-center justify-between mb-2">
                     <div className="text-sm text-muted-foreground">
                       {new Date(expense.date).toLocaleDateString()}
                     </div>
                     <div className="text-lg font-bold">₱{expense.amount.toLocaleString()}</div>
                   </div>
                   {expense.description && (
                     <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{expense.description}</p>
                   )}
                 </CardContent>
               </Card>
             ))}
           </div>
         </TabsContent>
      </Tabs>
    </div>
  )
} 