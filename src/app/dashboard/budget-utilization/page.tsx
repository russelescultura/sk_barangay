"use client"

import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  BarChart3,
  Activity,
  LineChart,
  Target,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  X,
  Check,
  Upload,
  Trash2,
  RefreshCw
} from 'lucide-react'
import { useState, useEffect } from 'react'
import Image from 'next/image'

import { AreaChartComponent } from '@/components/analytics/area-chart'
import { BarChartComponent } from '@/components/analytics/bar-chart'
import { LineChartComponent } from '@/components/analytics/line-chart'
import { PieChartComponent } from '@/components/analytics/pie-chart'
import { ExpenseManager } from '@/components/budget/expense-manager'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface Program {
  id: string
  title: string
  budget: number | null
  spent: number
  remaining: number
  utilizationRate: number
  status: 'ONGOING' | 'COMPLETED' | 'CANCELLED'
  startDate: string
  endDate: string
  targetAudience: string
}

interface BudgetStats {
  totalBudget: number
  totalSpent: number
  totalRemaining: number
  utilizationRate: number
  activePrograms: number
  completedPrograms: number
  totalRevenue: number
  netBudget: number
}

interface Revenue {
  id: string
  title: string
  description?: string
  amount: number
  source: 'MANUAL' | 'GCASH'
  date: string
  receipt?: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  programId: string
  formSubmissionId?: string
  program: {
    id: string
    title: string
  }
  formSubmission?: {
    id: string
    user: {
      name: string
      email: string
    }
  }
}

export default function BudgetUtilizationPage() {
  const [programs, setPrograms] = useState<Program[]>([])
  const [revenues, setRevenues] = useState<Revenue[]>([])
  const [stats, setStats] = useState<BudgetStats>({
    totalBudget: 0,
    totalSpent: 0,
    totalRemaining: 0,
    utilizationRate: 0,
    activePrograms: 0,
    completedPrograms: 0,
    totalRevenue: 0,
    netBudget: 0
  })
  const [loading, setLoading] = useState(true)
  const [showAddRevenueModal, setShowAddRevenueModal] = useState(false)
  const [selectedProgram, setSelectedProgram] = useState<string>('')
  const [revenueForm, setRevenueForm] = useState({
    title: '',
    description: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0]
  })
  const [selectedReceipts, setSelectedReceipts] = useState<File[]>([])
  const [showReceiptModal, setShowReceiptModal] = useState(false)
  const [selectedRevenueForReceipt, setSelectedRevenueForReceipt] = useState<string>('')

  // Data transformation functions for analytics components
  const transformBudgetAllocationData = (programs: Program[]) => {
    const programTypes = programs.reduce((acc, program) => {
      const type = program.targetAudience || 'General'
      if (!acc[type]) {
        acc[type] = { name: type, value: 0 }
      }
      acc[type].value += program.budget || 0
      return acc
    }, {} as Record<string, { name: string; value: number }>)

    return Object.values(programTypes)
      .filter(item => item.value > 0)
      .sort((a, b) => b.value - a.value)
  }

  const transformMonthlySpendingData = (programs: Program[]) => {
    const monthlyData = programs.reduce((acc, program) => {
      const date = new Date(program.startDate)
      const monthYear = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      
      if (!acc[monthYear]) {
        acc[monthYear] = { name: monthYear, budget: 0, spent: 0 }
      }
      acc[monthYear].budget += program.budget || 0
      acc[monthYear].spent += program.spent || 0
      return acc
    }, {} as Record<string, { name: string; budget: number; spent: number }>)

    return Object.values(monthlyData)
      .sort((a, b) => new Date(a.name).getTime() - new Date(b.name).getTime())
  }

  const transformBudgetVsActualData = (programs: Program[]) => {
    const timelineData = programs.reduce((acc, program) => {
      const startDate = new Date(program.startDate)
      const endDate = new Date(program.endDate)
      
      const current = new Date(startDate)
      while (current <= endDate) {
        const dateKey = current.toISOString().split('T')[0]
        if (dateKey && !acc[dateKey]) {
          acc[dateKey] = { name: dateKey, budget: 0, actual: 0 }
        }
        
        const totalDays = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
        const daysElapsed = (current.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
        const progress = Math.min(daysElapsed / totalDays, 1)
        
        if (dateKey && acc[dateKey]) {
        acc[dateKey].budget += program.budget || 0
        acc[dateKey].actual += (program.spent || 0) * progress
        }
        
        current.setDate(current.getDate() + 7)
      }
      return acc
    }, {} as Record<string, { name: string; budget: number; actual: number }>)

    return Object.values(timelineData)
      .sort((a, b) => new Date(a.name).getTime() - new Date(b.name).getTime())
      .slice(0, 12)
  }

  const transformUtilizationData = (programs: Program[]) => {
    const statusData = programs.reduce((acc, program) => {
      const status = program.status
      if (!acc[status]) {
        acc[status] = { name: status, spent: 0 }
      }
      acc[status].spent += program.spent || 0
      return acc
    }, {} as Record<string, { name: string; spent: number }>)

    return Object.values(statusData)
      .filter(item => item.spent > 0)
      .sort((a, b) => b.spent - a.spent)
  }

  const transformForecastData = (_programs: Program[]) => {
    // Generate 6 months of forecast data
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
    return months.map((month, index) => ({
      month,
      budget: 50000 + (index * 5000),
      forecast: 45000 + (index * 4000),
      actual: 42000 + (index * 3500)
    }))
  }

  // Revenue analytics functions
  const transformRevenueBySourceData = (revenues: Revenue[]) => {
    const sourceData = revenues.reduce((acc, revenue) => {
      const source = revenue.source
      if (!acc[source]) {
        acc[source] = 0
      }
      acc[source] += revenue.amount
      return acc
    }, {} as Record<string, number>)

    return Object.entries(sourceData).map(([source, amount]) => ({
      name: source === 'MANUAL' ? 'Manual Entry' : 'GCash',
      value: amount
    }))
  }

  const transformRevenueByMonthData = (revenues: Revenue[]) => {
    const monthlyData = revenues.reduce((acc, revenue) => {
      const date = new Date(revenue.date)
      const month = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      
      if (!acc[month]) {
        acc[month] = { month, manual: 0, gcash: 0 }
      }
      
      if (revenue.source === 'MANUAL') {
        acc[month].manual += revenue.amount
      } else {
        acc[month].gcash += revenue.amount
      }
      
      return acc
    }, {} as Record<string, { month: string; manual: number; gcash: number }>)

    return Object.values(monthlyData).sort((a, b) => 
      new Date(a.month).getTime() - new Date(b.month).getTime()
    )
  }

  const transformRevenueByProgramData = (revenues: Revenue[]) => {
    const programData = revenues.reduce((acc, revenue) => {
      const programName = revenue.program.title
      if (!acc[programName]) {
        acc[programName] = 0
      }
      acc[programName] += revenue.amount
      return acc
    }, {} as Record<string, number>)

    return Object.entries(programData)
      .map(([program, amount]) => ({ name: program, value: amount }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5) // Top 5 programs
  }

  const transformRevenueTrendData = (revenues: Revenue[]) => {
    const sortedRevenues = revenues
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-12) // Last 12 entries

    return sortedRevenues.map((revenue, index) => ({
      date: new Date(revenue.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      amount: revenue.amount,
      source: revenue.source,
      cumulative: sortedRevenues
        .slice(0, index + 1)
        .reduce((sum, r) => sum + r.amount, 0)
    }))
  }

  const transformBudgetVsRevenueData = (programs: Program[], revenues: Revenue[]) => {
    const totalBudget = programs.reduce((sum, program) => sum + (program.budget || 0), 0)
    const totalSpent = programs.reduce((sum, program) => sum + program.spent, 0)
    const totalRevenue = revenues.reduce((sum, revenue) => sum + revenue.amount, 0)
    const netBudget = totalBudget - totalSpent + totalRevenue

    return [
      { name: 'Budget', value: totalBudget, color: '#3b82f6' },
      { name: 'Spent', value: totalSpent, color: '#ef4444' },
      { name: 'Revenue', value: totalRevenue, color: '#10b981' },
      { name: 'Net Budget', value: netBudget, color: '#f59e0b' }
    ]
  }

  useEffect(() => {
    fetchBudgetData()
    fetchRevenueData()
  }, [])

  const fetchBudgetData = async () => {
    try {
      const response = await fetch('/api/budget')
      const data = await response.json()
      
      if (data.programs) {
        setPrograms(data.programs)
        setStats({
          totalBudget: data.stats.totalBudget,
          totalSpent: data.stats.totalSpent,
          totalRemaining: data.stats.totalRemaining,
          utilizationRate: data.stats.overallUtilizationRate,
          activePrograms: data.stats.activePrograms,
          completedPrograms: data.stats.completedPrograms,
          totalRevenue: data.stats.totalRevenue || 0,
          netBudget: data.stats.netBudget || 0
        })
      }
    } catch (error) {
      console.error('Error fetching budget data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ONGOING':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  const getUtilizationColor = (rate: number) => {
    if (rate >= 80) return 'text-green-600'
    if (rate >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  // Revenue functions
  const fetchRevenueData = async () => {
    try {
      // Add cache-busting parameter to ensure fresh data
      const timestamp = new Date().getTime()
      const response = await fetch(`/api/revenue?t=${timestamp}`)
      const data = await response.json()
      if (data.revenues) {
        setRevenues(data.revenues)
      }
    } catch (error) {
      console.error('Error fetching revenue data:', error)
    }
  }

  const handleAddRevenue = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedProgram || revenueForm.amount <= 0) return

    try {
      const response = await fetch('/api/revenue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...revenueForm,
          programId: selectedProgram,
          source: 'MANUAL'
        }),
      })

      if (response.ok) {
        setShowAddRevenueModal(false)
        setRevenueForm({
          title: '',
          description: '',
          amount: 0,
          date: new Date().toISOString().split('T')[0]
        })
        setSelectedProgram('')
        fetchBudgetData()
        fetchRevenueData()
      }
    } catch (error) {
      console.error('Error adding revenue:', error)
    }
  }

  const getRevenueSourceColor = (source: string) => {
    switch (source) {
      case 'MANUAL':
        return 'bg-blue-100 text-blue-800'
      case 'GCASH':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getRevenueStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'REJECTED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // Approval functions
  const handleApproveRevenue = async (revenueId: string) => {
    try {
      const response = await fetch(`/api/revenue/${revenueId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'APPROVED' }),
      })

      if (response.ok) {
        fetchRevenueData()
        fetchBudgetData()
      }
    } catch (error) {
      console.error('Error approving revenue:', error)
    }
  }

  const handleRejectRevenue = async (revenueId: string) => {
    try {
      const response = await fetch(`/api/revenue/${revenueId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'REJECTED' }),
      })

      if (response.ok) {
        fetchRevenueData()
        fetchBudgetData()
      }
    } catch (error) {
      console.error('Error rejecting revenue:', error)
    }
  }

  const handleDeleteRevenue = async (revenueId: string) => {
    if (!confirm('Are you sure you want to delete this revenue entry?')) return

    try {
      const response = await fetch(`/api/revenue/${revenueId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchRevenueData()
        fetchBudgetData()
      }
    } catch (error) {
      console.error('Error deleting revenue:', error)
    }
  }

  // Receipt functions
  const handleReceiptUpload = async (revenueId: string) => {
    if (selectedReceipts.length === 0) return

    try {
      const formData = new FormData()
      selectedReceipts.forEach((file) => {
        formData.append('receipts', file)
      })

      const response = await fetch(`/api/revenue/${revenueId}/receipt`, {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        setSelectedReceipts([])
        setShowReceiptModal(false)
        setSelectedRevenueForReceipt('')
        fetchRevenueData()
      }
    } catch (error) {
      console.error('Error uploading receipts:', error)
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    setSelectedReceipts(files)
  }

  const openReceiptModal = (revenueId: string) => {
    setSelectedRevenueForReceipt(revenueId)
    setShowReceiptModal(true)
  }

  const getReceiptImages = (receiptString: string | null) => {
    if (!receiptString) return []
    return receiptString.split(',').filter(Boolean)
  }

  // Sync GCash revenue from approved form submissions
  const handleSyncGCashRevenue = async () => {
    try {
      const response = await fetch('/api/revenue/sync-gcash', {
        method: 'POST',
      })

      if (response.ok) {
        const result = await response.json()
        alert(`Sync completed!\nCreated: ${result.created}\nSkipped: ${result.skipped}\nTotal processed: ${result.totalProcessed}`)
        fetchRevenueData()
        fetchBudgetData()
      } else {
        alert('Failed to sync GCash revenue')
      }
    } catch (error) {
      console.error('Error syncing GCash revenue:', error)
      alert('Error syncing GCash revenue')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 lg:py-8">
          <div className="flex items-center justify-center min-h-[300px] sm:min-h-[400px]">
            <div className="flex flex-col items-center gap-3 sm:gap-4">
              <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-primary"></div>
              <p className="text-xs sm:text-sm text-muted-foreground">Loading budget data...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 lg:py-8">
        {/* Header Section - Mobile First */}
        <div className="mb-4 sm:mb-6 lg:mb-8 pt-16 lg:pt-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">Budget Utilization</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-2">
            Track and analyze budget spending across all SK programs
          </p>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-3 sm:space-y-4 lg:space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1 p-1 bg-muted/30 rounded-lg overflow-x-auto">
            <TabsTrigger value="overview" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2 sm:py-1.5 px-2 sm:px-3 data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-foreground transition-all duration-200">
              <Target className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Overview</span>
              <span className="sm:hidden">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="programs" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2 sm:py-1.5 px-2 sm:px-3 data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-foreground transition-all duration-200">
              <Users className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Programs</span>
              <span className="sm:hidden">Programs</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2 sm:py-1.5 px-2 sm:px-3 data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-foreground transition-all duration-200">
              <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Analytics</span>
              <span className="sm:hidden">Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="expenses" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2 sm:py-1.5 px-2 sm:px-3 data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-foreground transition-all duration-200">
              <DollarSign className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Expenses</span>
              <span className="sm:hidden">Expenses</span>
            </TabsTrigger>
            <TabsTrigger value="revenue" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2 sm:py-1.5 px-2 sm:px-3 data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-foreground transition-all duration-200">
              <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Revenue</span>
              <span className="sm:hidden">Revenue</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2 sm:py-1.5 px-2 sm:px-3 data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-foreground transition-all duration-200">
              <LineChart className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Reports</span>
              <span className="sm:hidden">Reports</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4 sm:space-y-6">
            {/* Key Metrics Cards - Mobile First */}
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-6">
              <Card className="hover:shadow-md transition-shadow duration-200 p-3 sm:p-4">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-0">
                  <CardTitle className="text-xs sm:text-sm font-medium">Total Budget</CardTitle>
                  <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="p-0 pt-2">
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold">₱{stats.totalBudget.toLocaleString()}</div>
                  <div className="flex items-center space-x-1 text-xs text-muted-foreground mt-1">
                    <ArrowUpRight className="h-3 w-3 text-green-600" />
                    <span className="text-green-600">+12.5%</span>
                    <span className="hidden sm:inline">from last month</span>
                    <span className="sm:hidden">vs last</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow duration-200 p-3 sm:p-4">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-0">
                  <CardTitle className="text-xs sm:text-sm font-medium">Total Spent</CardTitle>
                  <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="p-0 pt-2">
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold">₱{stats.totalSpent.toLocaleString()}</div>
                  <div className="flex items-center space-x-1 text-xs text-muted-foreground mt-1">
                    <ArrowUpRight className="h-3 w-3 text-green-600" />
                    <span className="text-green-600">+{stats.utilizationRate.toFixed(1)}%</span>
                    <span className="hidden sm:inline">utilization</span>
                    <span className="sm:hidden">util</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow duration-200 p-3 sm:p-4">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-0">
                  <CardTitle className="text-xs sm:text-sm font-medium">Remaining Budget</CardTitle>
                  <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="p-0 pt-2">
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold">₱{stats.totalRemaining.toLocaleString()}</div>
                  <div className="flex items-center space-x-1 text-xs text-muted-foreground mt-1">
                    <ArrowDownRight className="h-3 w-3 text-red-600" />
                    <span className="text-red-600">-8.2%</span>
                    <span className="hidden sm:inline">from last month</span>
                    <span className="sm:hidden">vs last</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow duration-200 p-3 sm:p-4">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-0">
                  <CardTitle className="text-xs sm:text-sm font-medium">Active Programs</CardTitle>
                  <Activity className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="p-0 pt-2">
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold">{stats.activePrograms}</div>
                  <div className="flex items-center space-x-1 text-xs text-muted-foreground mt-1">
                    <ArrowUpRight className="h-3 w-3 text-green-600" />
                    <span className="text-green-600">+2</span>
                    <span className="hidden sm:inline">from last month</span>
                    <span className="sm:hidden">vs last</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow duration-200 p-3 sm:p-4">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-0">
                  <CardTitle className="text-xs sm:text-sm font-medium">Total Revenue</CardTitle>
                  <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="p-0 pt-2">
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold">₱{stats.totalRevenue.toLocaleString()}</div>
                  <div className="flex items-center space-x-1 text-xs text-muted-foreground mt-1">
                    <ArrowUpRight className="h-3 w-3 text-green-600" />
                    <span className="text-green-600">+15.3%</span>
                    <span className="hidden sm:inline">from last month</span>
                    <span className="sm:hidden">vs last</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow duration-200 p-3 sm:p-4">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-0">
                  <CardTitle className="text-xs sm:text-sm font-medium">Net Budget</CardTitle>
                  <Target className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="p-0 pt-2">
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold">₱{stats.netBudget.toLocaleString()}</div>
                  <div className="flex items-center space-x-1 text-xs text-muted-foreground mt-1">
                    <ArrowUpRight className="h-3 w-3 text-green-600" />
                    <span className="text-green-600">+23.8%</span>
                    <span className="hidden sm:inline">with revenue</span>
                    <span className="sm:hidden">w/ revenue</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Budget Utilization Progress */}
            <Card className="p-3 sm:p-4">
              <CardHeader className="p-0 pb-3 sm:pb-4">
                <CardTitle className="text-lg sm:text-xl">Overall Budget Utilization</CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Current spending progress and efficiency across all programs
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6 p-0">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Utilization Rate</span>
                    <span className={`text-lg font-bold ${getUtilizationColor(stats.utilizationRate)}`}>
                      {stats.utilizationRate.toFixed(1)}%
                    </span>
                  </div>
                  <Progress value={stats.utilizationRate} className="h-3" />
                </div>
                
                <div className="grid grid-cols-3 gap-3 sm:gap-6 pt-4 border-t">
                  <div className="text-center">
                    <div className="text-lg sm:text-xl lg:text-2xl font-bold">₱{stats.totalBudget.toLocaleString()}</div>
                    <div className="text-xs sm:text-sm text-muted-foreground">Budgeted</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg sm:text-xl lg:text-2xl font-bold">₱{stats.totalSpent.toLocaleString()}</div>
                    <div className="text-xs sm:text-sm text-muted-foreground">Spent</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg sm:text-xl lg:text-2xl font-bold">₱{stats.totalRemaining.toLocaleString()}</div>
                    <div className="text-xs sm:text-sm text-muted-foreground">Remaining</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Revenue Insights */}
            <Card className="p-3 sm:p-4">
              <CardHeader className="p-0 pb-3 sm:pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
                  <div>
                    <CardTitle className="text-lg sm:text-xl">Revenue Insights</CardTitle>
                    <CardDescription className="text-sm sm:text-base">
                      Revenue generation and financial performance overview
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchRevenueData}
                    className="flex items-center gap-2 w-full sm:w-auto h-10 sm:h-9"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Refresh
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6 p-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs sm:text-sm font-medium">Revenue by Source</span>
                    </div>
                    <div className="space-y-2 sm:space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                          <span className="text-xs sm:text-sm">Manual Entry</span>
                        </div>
                        <span className="text-xs sm:text-sm font-medium">
                          ₱{revenues.filter(r => r.source === 'MANUAL').reduce((sum, r) => sum + r.amount, 0).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-green-500"></div>
                          <span className="text-xs sm:text-sm">GCash</span>
                        </div>
                        <span className="text-xs sm:text-sm font-medium">
                          ₱{revenues.filter(r => r.source === 'GCASH').reduce((sum, r) => sum + r.amount, 0).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs sm:text-sm font-medium">Revenue Status</span>
                    </div>
                    <div className="space-y-2 sm:space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-green-500"></div>
                          <span className="text-xs sm:text-sm">Approved</span>
                        </div>
                        <span className="text-xs sm:text-sm font-medium">
                          ₱{revenues.filter(r => r.status === 'APPROVED').reduce((sum, r) => sum + r.amount, 0).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                          <span className="text-xs sm:text-sm">Pending</span>
                        </div>
                        <span className="text-xs sm:text-sm font-medium">
                          ₱{revenues.filter(r => r.status === 'PENDING').reduce((sum, r) => sum + r.amount, 0).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-3 sm:gap-6 pt-4 border-t">
                  <div className="text-center">
                    <div className="text-lg sm:text-xl lg:text-2xl font-bold">{revenues.length}</div>
                    <div className="text-xs sm:text-sm text-muted-foreground">Total Entries</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg sm:text-xl lg:text-2xl font-bold">{revenues.filter(r => r.status === 'APPROVED').length}</div>
                    <div className="text-xs sm:text-sm text-muted-foreground">Approved</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg sm:text-xl lg:text-2xl font-bold">{revenues.filter(r => r.status === 'PENDING').length}</div>
                    <div className="text-xs sm:text-sm text-muted-foreground">Pending</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Programs Tab */}
          <TabsContent value="programs" className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
              <div>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold">Program Management</h2>
                <p className="text-sm sm:text-base text-muted-foreground mt-1">View and manage all SK programs</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="px-2 sm:px-3 py-1 text-xs sm:text-sm">
                  {programs.length} Total Programs
                </Badge>
                <Badge variant="outline" className="px-2 sm:px-3 py-1 text-xs sm:text-sm">
                  {stats.activePrograms} Active
                </Badge>
              </div>
            </div>

            <div className="grid gap-4 sm:gap-6">
              {programs.map((program) => {
                const budget = program.budget || 0
                const utilizationRate = program.utilizationRate
                const remaining = program.remaining

                return (
                  <Card key={program.id} className="hover:shadow-md transition-shadow duration-200 p-3 sm:p-4">
                    <CardHeader className="p-0 pb-3 sm:pb-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
                        <div className="space-y-1">
                          <CardTitle className="text-lg sm:text-xl lg:text-2xl">{program.title}</CardTitle>
                          <CardDescription className="flex items-center gap-2 text-sm sm:text-base">
                            <Users className="h-3 w-3 sm:h-4 sm:w-4" />
                            {program.targetAudience}
                          </CardDescription>
                        </div>
                        <Badge className={`${getStatusColor(program.status)} text-xs sm:text-sm px-2 sm:px-3 py-1`}>
                          {program.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4 sm:space-y-6 p-0">
                      {/* Budget Metrics */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                        <div className="space-y-1">
                          <div className="text-xs sm:text-sm text-muted-foreground">Budget</div>
                          <div className="text-base sm:text-lg font-semibold">₱{budget.toLocaleString()}</div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-xs sm:text-sm text-muted-foreground">Spent</div>
                          <div className="text-base sm:text-lg font-semibold">₱{program.spent.toLocaleString()}</div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-xs sm:text-sm text-muted-foreground">Remaining</div>
                          <div className="text-base sm:text-lg font-semibold">₱{remaining.toLocaleString()}</div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-xs sm:text-sm text-muted-foreground">Utilization</div>
                          <div className={`text-base sm:text-lg font-semibold ${getUtilizationColor(utilizationRate)}`}>
                            {utilizationRate.toFixed(1)}%
                          </div>
                        </div>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs sm:text-sm">
                          <span>Progress</span>
                          <span>{utilizationRate.toFixed(1)}%</span>
                        </div>
                        <Progress value={utilizationRate} className="h-2 sm:h-3" />
                      </div>

                      {/* Program Details */}
                      <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground pt-3 sm:pt-4 border-t">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span className="text-xs sm:text-sm">
                            {new Date(program.startDate).toLocaleDateString()} - {new Date(program.endDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4 sm:space-y-6">
            <div className="space-y-4 sm:space-y-6">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold">Analytics & Insights</h2>
                  <p className="text-sm sm:text-base text-muted-foreground mt-1">Comprehensive budget and revenue analysis</p>
                </div>
              </div>
              
              {/* Budget Analytics */}
              <div className="space-y-3 sm:space-y-4">
                <h3 className="text-base sm:text-lg lg:text-xl font-semibold">Budget Analytics</h3>
                <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
                  <Card className="p-3 sm:p-4">
                    <CardHeader className="p-0 pb-3 sm:pb-4">
                      <CardTitle className="text-sm sm:text-base lg:text-lg">Budget Allocation by Program Type</CardTitle>
                      <CardDescription className="text-xs sm:text-sm">Distribution of budget across different target audiences</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                      <PieChartComponent 
                        data={transformBudgetAllocationData(programs)}
                        dataKey="value"
                        nameKey="name"
                        title=""
                        height={250}
                      />
                    </CardContent>
                  </Card>
                  
                  <Card className="p-3 sm:p-4">
                    <CardHeader className="p-0 pb-3 sm:pb-4">
                      <CardTitle className="text-sm sm:text-base lg:text-lg">Budget Utilization by Status</CardTitle>
                      <CardDescription className="text-xs sm:text-sm">Spending efficiency by program status</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                      <PieChartComponent 
                        data={transformUtilizationData(programs)}
                        dataKey="spent"
                        nameKey="name"
                        title=""
                        height={250}
                      />
                    </CardContent>
                  </Card>
                </div>
                
                <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
                  <Card className="p-3 sm:p-4">
                    <CardHeader className="p-0 pb-3 sm:pb-4">
                      <CardTitle className="text-sm sm:text-base lg:text-lg">Monthly Spending Trends</CardTitle>
                      <CardDescription className="text-xs sm:text-sm">Budget vs actual spending by month</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                      <BarChartComponent 
                        data={transformMonthlySpendingData(programs)}
                        dataKeys={['budget', 'spent']}
                        title=""
                        height={250}
                      />
                    </CardContent>
                  </Card>
                  
                  <Card className="p-3 sm:p-4">
                    <CardHeader className="p-0 pb-3 sm:pb-4">
                      <CardTitle className="text-sm sm:text-base lg:text-lg">Budget vs Actual Spending Over Time</CardTitle>
                      <CardDescription className="text-xs sm:text-sm">Tracking budget performance over time</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                      <LineChartComponent 
                        data={transformBudgetVsActualData(programs)}
                        dataKeys={['budget', 'actual']}
                        title=""
                        height={250}
                      />
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Revenue Analytics */}
              <div className="space-y-3 sm:space-y-4">
                <h3 className="text-base sm:text-lg lg:text-xl font-semibold">Revenue Analytics</h3>
                <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
                  <Card className="p-3 sm:p-4">
                    <CardHeader className="p-0 pb-3 sm:pb-4">
                      <CardTitle className="text-sm sm:text-base lg:text-lg">Revenue by Source</CardTitle>
                      <CardDescription className="text-xs sm:text-sm">Distribution of revenue from manual entries vs GCash</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                      <PieChartComponent 
                        data={transformRevenueBySourceData(revenues)}
                        dataKey="value"
                        nameKey="name"
                        title=""
                        height={250}
                      />
                    </CardContent>
                  </Card>
                  
                  <Card className="p-3 sm:p-4">
                    <CardHeader className="p-0 pb-3 sm:pb-4">
                      <CardTitle className="text-sm sm:text-base lg:text-lg">Revenue by Program</CardTitle>
                      <CardDescription className="text-xs sm:text-sm">Top 5 programs by revenue generation</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                      <PieChartComponent 
                        data={transformRevenueByProgramData(revenues)}
                        dataKey="value"
                        nameKey="name"
                        title=""
                        height={250}
                      />
                    </CardContent>
                  </Card>
                </div>
                
                <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
                  <Card className="p-3 sm:p-4">
                    <CardHeader className="p-0 pb-3 sm:pb-4">
                      <CardTitle className="text-sm sm:text-base lg:text-lg">Monthly Revenue Trends</CardTitle>
                      <CardDescription className="text-xs sm:text-sm">Revenue breakdown by source over time</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                      <BarChartComponent 
                        data={transformRevenueByMonthData(revenues)}
                        dataKeys={['manual', 'gcash']}
                        title=""
                        height={250}
                      />
                    </CardContent>
                  </Card>
                  
                  <Card className="p-3 sm:p-4">
                    <CardHeader className="p-0 pb-3 sm:pb-4">
                      <CardTitle className="text-sm sm:text-base lg:text-lg">Revenue Growth Trend</CardTitle>
                      <CardDescription className="text-xs sm:text-sm">Cumulative revenue growth over time</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                      <LineChartComponent 
                        data={transformRevenueTrendData(revenues)}
                        dataKeys={['amount', 'cumulative']}
                        title=""
                        height={250}
                      />
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Combined Budget & Revenue Analytics */}
              <div className="space-y-3 sm:space-y-4">
                <h3 className="text-base sm:text-lg lg:text-xl font-semibold">Financial Overview</h3>
                <div className="grid gap-4 sm:gap-6">
                  <Card className="p-3 sm:p-4">
                    <CardHeader className="p-0 pb-3 sm:pb-4">
                      <CardTitle className="text-sm sm:text-base lg:text-lg">Budget vs Revenue Overview</CardTitle>
                      <CardDescription className="text-xs sm:text-sm">Complete financial picture including budget, spending, and revenue</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                      <PieChartComponent 
                        data={transformBudgetVsRevenueData(programs, revenues)}
                        dataKey="value"
                        nameKey="name"
                        title=""
                        height={250}
                      />
                    </CardContent>
                  </Card>
                  
                  <Card className="p-3 sm:p-4">
                    <CardHeader className="p-0 pb-3 sm:pb-4">
                      <CardTitle className="text-sm sm:text-base lg:text-lg">Budget Forecasting</CardTitle>
                      <CardDescription className="text-xs sm:text-sm">6-month spending forecast based on current trends</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                      <AreaChartComponent 
                        data={transformForecastData(programs)}
                        dataKeys={['budget', 'forecast', 'actual']}
                        title=""
                        height={250}
                      />
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Expenses Tab */}
          <TabsContent value="expenses" className="space-y-4 sm:space-y-6">
            <div className="space-y-4 sm:space-y-6">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold">Expense Tracking</h2>
                  <p className="text-sm sm:text-base text-muted-foreground mt-1">Manage and track program expenses</p>
                </div>
              </div>
              <ExpenseManager onExpenseAdded={fetchBudgetData} />
            </div>
          </TabsContent>

          {/* Revenue Tab */}
          <TabsContent value="revenue" className="space-y-4 sm:space-y-6">
            <div className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold">Revenue Management</h2>
                    <p className="text-sm sm:text-base text-muted-foreground mt-1">Track and manage revenue from programs and GCash payments</p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button 
                    onClick={handleSyncGCashRevenue}
                    variant="outline"
                    className="flex items-center gap-2 w-full sm:w-auto h-10 sm:h-9"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Sync GCash
                  </Button>
                  <Button onClick={() => setShowAddRevenueModal(true)} className="flex items-center gap-2 w-full sm:w-auto h-10 sm:h-9">
                    <Plus className="h-4 w-4" />
                    Add Revenue
                  </Button>
                </div>
              </div>

              {/* Revenue Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
                <Card className="hover:shadow-md transition-shadow duration-200 p-3 sm:p-4">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-0">
                    <CardTitle className="text-xs sm:text-sm font-medium">Total Revenue</CardTitle>
                    <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent className="p-0 pt-2">
                    <div className="text-lg sm:text-xl lg:text-2xl font-bold">₱{stats.totalRevenue.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">All time revenue</p>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow duration-200 p-3 sm:p-4">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-0">
                    <CardTitle className="text-xs sm:text-sm font-medium">Manual Revenue</CardTitle>
                    <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent className="p-0 pt-2">
                    <div className="text-lg sm:text-xl lg:text-2xl font-bold">₱{revenues.filter(r => r.source === 'MANUAL').reduce((sum, r) => sum + r.amount, 0).toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">Manually entered</p>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow duration-200 p-3 sm:p-4">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-0">
                    <CardTitle className="text-xs sm:text-sm font-medium">GCash Revenue</CardTitle>
                    <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent className="p-0 pt-2">
                    <div className="text-lg sm:text-xl lg:text-2xl font-bold">₱{revenues.filter(r => r.source === 'GCASH').reduce((sum, r) => sum + r.amount, 0).toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">From form submissions</p>
                  </CardContent>
                </Card>
              </div>

              {/* Revenue List */}
              <Card className="p-3 sm:p-4">
                <CardHeader className="p-0 pb-3 sm:pb-4">
                  <CardTitle className="text-lg sm:text-xl">Revenue Transactions</CardTitle>
                  <CardDescription className="text-sm sm:text-base">All revenue entries and their status</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="space-y-3 sm:space-y-4">
                    {revenues.length === 0 ? (
                      <div className="text-center py-6 sm:py-8 text-muted-foreground">
                        <TrendingUp className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 opacity-50" />
                        <p className="text-sm sm:text-base">No revenue transactions yet</p>
                        <p className="text-xs sm:text-sm">Add your first revenue entry to get started</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {revenues.map((revenue) => (
                          <div key={revenue.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 border rounded-lg hover:bg-muted/50 transition-colors gap-3 sm:gap-4">
                            <div className="flex items-start space-x-3 sm:space-x-4">
                              <div className="flex flex-col">
                                <div className="font-medium text-sm sm:text-base">{revenue.title}</div>
                                <div className="text-xs sm:text-sm text-muted-foreground">{revenue.program.title}</div>
                                {revenue.description && (
                                  <div className="text-xs sm:text-sm text-muted-foreground">{revenue.description}</div>
                                )}
                                {/* Receipt Images */}
                                 {revenue.receipt && getReceiptImages(revenue.receipt).length > 0 && (
                                   <div className="flex gap-2 mt-2">
                                     {getReceiptImages(revenue.receipt).map((receiptPath, index) => (
                                       <Image
                                         key={index}
                                         src={receiptPath}
                                         alt={`Receipt ${index + 1}`}
                                         width={48}
                                         height={48}
                                         className="w-12 h-12 object-cover rounded border cursor-pointer"
                                         onClick={() => window.open(receiptPath, '_blank')}
                                         onKeyDown={(e) => {
                                           if (e.key === 'Enter' || e.key === ' ') {
                                             e.preventDefault()
                                             window.open(receiptPath, '_blank')
                                           }
                                         }}
                                         role="button"
                                         tabIndex={0}
                                       />
                                     ))}
                                   </div>
                                 )}
                               </div>
                             </div>
                             <div className="flex items-center space-x-4">
                               <div className="text-right">
                                 <div className="font-bold">₱{revenue.amount.toLocaleString()}</div>
                                 <div className="text-sm text-muted-foreground">{new Date(revenue.date).toLocaleDateString()}</div>
                               </div>
                               <div className="flex flex-col items-end space-y-2">
                                 <div className="flex gap-1">
                                   <Badge className={getRevenueSourceColor(revenue.source)}>
                                     {revenue.source}
                                   </Badge>
                                   <Badge className={getRevenueStatusColor(revenue.status)}>
                                     {revenue.status}
                                   </Badge>
                                 </div>
                                 {/* Action Buttons */}
                                 <div className="flex gap-1">
                                   {revenue.status === 'PENDING' && (
                                     <>
                                       <Button
                                         size="sm"
                                         variant="outline"
                                         className="h-6 px-2 text-xs"
                                         onClick={() => handleApproveRevenue(revenue.id)}
                                       >
                                         <Check className="h-3 w-3 mr-1" />
                                         Approve
                                       </Button>
                                       <Button
                                         size="sm"
                                         variant="outline"
                                         className="h-6 px-2 text-xs"
                                         onClick={() => handleRejectRevenue(revenue.id)}
                                       >
                                         <X className="h-3 w-3 mr-1" />
                                         Reject
                                       </Button>
                                     </>
                                   )}
                                   <Button
                                     size="sm"
                                     variant="outline"
                                     className="h-6 px-2 text-xs"
                                     onClick={() => openReceiptModal(revenue.id)}
                                   >
                                     <Upload className="h-3 w-3 mr-1" />
                                     Receipt
                                   </Button>
                                   <Button
                                     size="sm"
                                     variant="outline"
                                     className="h-6 px-2 text-xs text-red-600 hover:text-red-700"
                                     onClick={() => handleDeleteRevenue(revenue.id)}
                                   >
                                     <Trash2 className="h-3 w-3 mr-1" />
                                     Delete
                                   </Button>
                                 </div>
                               </div>
                             </div>
                           </div>
                         ))}
                       </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-4 sm:space-y-6">
            <div className="space-y-4 sm:space-y-6">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <LineChart className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold">Budget Reports</h2>
                  <p className="text-sm sm:text-base text-muted-foreground mt-1">Generate detailed budget reports and insights</p>
                </div>
              </div>
              
              <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card className="hover:shadow-md transition-shadow duration-200 cursor-pointer p-3 sm:p-4">
                  <CardHeader className="p-0 pb-3 sm:pb-4">
                    <CardTitle className="text-sm sm:text-base lg:text-lg">Monthly Report</CardTitle>
                    <CardDescription className="text-xs sm:text-sm">Budget utilization by month</CardDescription>
                  </CardHeader>
                  <CardContent className="p-0 pt-2">
                    <div className="text-xl sm:text-2xl lg:text-3xl font-bold">₱{stats.totalSpent.toLocaleString()}</div>
                    <p className="text-xs sm:text-sm text-muted-foreground">Total spent this month</p>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow duration-200 cursor-pointer p-3 sm:p-4">
                  <CardHeader className="p-0 pb-3 sm:pb-4">
                    <CardTitle className="text-sm sm:text-base lg:text-lg">Program Efficiency</CardTitle>
                    <CardDescription className="text-xs sm:text-sm">Performance metrics by program</CardDescription>
                  </CardHeader>
                  <CardContent className="p-0 pt-2">
                    <div className="text-xl sm:text-2xl lg:text-3xl font-bold">{stats.utilizationRate.toFixed(1)}%</div>
                    <p className="text-xs sm:text-sm text-muted-foreground">Average efficiency</p>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow duration-200 cursor-pointer p-3 sm:p-4">
                  <CardHeader className="p-0 pb-3 sm:pb-4">
                    <CardTitle className="text-sm sm:text-base lg:text-lg">Forecast</CardTitle>
                    <CardDescription className="text-xs sm:text-sm">Budget projections</CardDescription>
                  </CardHeader>
                  <CardContent className="p-0 pt-2">
                    <div className="text-xl sm:text-2xl lg:text-3xl font-bold">₱{stats.totalRemaining.toLocaleString()}</div>
                    <p className="text-xs sm:text-sm text-muted-foreground">Available for next quarter</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Add Revenue Modal */}
        <Dialog open={showAddRevenueModal} onOpenChange={setShowAddRevenueModal}>
          <DialogContent className="max-w-[95vw] sm:max-w-md mx-4 sm:mx-0">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl">Add Revenue</DialogTitle>
              <DialogDescription className="text-sm sm:text-base">
                Add a new revenue entry to track income for your programs.
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleAddRevenue} className="space-y-3 sm:space-y-4">
              <div>
                <label htmlFor="program-select" className="text-xs sm:text-sm font-medium">Program</label>
                <select
                  id="program-select"
                  value={selectedProgram}
                  onChange={(e) => setSelectedProgram(e.target.value)}
                  className="w-full mt-1 p-2 sm:p-3 border rounded-md text-sm sm:text-base h-10 sm:h-11"
                  required
                >
                  <option value="">Select a program</option>
                  {programs.map((program) => (
                    <option key={program.id} value={program.id}>
                      {program.title}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="revenue-title" className="text-xs sm:text-sm font-medium">Title</label>
                <input
                  id="revenue-title"
                  type="text"
                  value={revenueForm.title}
                  onChange={(e) => setRevenueForm({...revenueForm, title: e.target.value})}
                  className="w-full mt-1 p-2 sm:p-3 border rounded-md text-sm sm:text-base h-10 sm:h-11"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="revenue-description" className="text-xs sm:text-sm font-medium">Description (Optional)</label>
                <textarea
                  id="revenue-description"
                  value={revenueForm.description}
                  onChange={(e) => setRevenueForm({...revenueForm, description: e.target.value})}
                  className="w-full mt-1 p-2 sm:p-3 border rounded-md text-sm sm:text-base h-10 sm:h-11"
                  rows={3}
                />
              </div>
              
              <div>
                <label htmlFor="revenue-amount" className="text-xs sm:text-sm font-medium">Amount (₱)</label>
                <input
                  id="revenue-amount"
                  type="number"
                  value={revenueForm.amount}
                  onChange={(e) => setRevenueForm({...revenueForm, amount: parseFloat(e.target.value) || 0})}
                  className="w-full mt-1 p-2 sm:p-3 border rounded-md text-sm sm:text-base h-10 sm:h-11"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="revenue-date" className="text-xs sm:text-sm font-medium">Date</label>
                <input
                  id="revenue-date"
                  type="date"
                  value={revenueForm.date}
                  onChange={(e) => setRevenueForm({...revenueForm, date: e.target.value})}
                  className="w-full mt-1 p-2 sm:p-3 border rounded-md text-sm sm:text-base h-10 sm:h-11"
                  required
                />
              </div>
              
              <DialogFooter className="flex flex-col space-y-2 pt-4 sm:flex-row sm:space-y-0 sm:space-x-2 sm:justify-end">
                <Button type="submit" className="w-full sm:w-auto h-12 sm:h-10">
                  Add Revenue
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddRevenueModal(false)}
                  className="w-full sm:w-auto h-12 sm:h-10"
                >
                  Cancel
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Receipt Upload Modal */}
        <Dialog open={showReceiptModal} onOpenChange={(open) => {
          if (!open) {
            setShowReceiptModal(false)
            setSelectedReceipts([])
            setSelectedRevenueForReceipt('')
          }
        }}>
          <DialogContent className="max-w-[95vw] sm:max-w-md mx-4 sm:mx-0">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl">Upload Receipt Images</DialogTitle>
              <DialogDescription className="text-sm sm:text-base">
                Select receipt images to upload for this revenue entry.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-3 sm:space-y-4">
              <div>
                <label htmlFor="receipt-images" className="text-xs sm:text-sm font-medium">Select Receipt Images</label>
                <input
                  id="receipt-images"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="w-full mt-1 p-2 sm:p-3 border rounded-md text-sm sm:text-base h-10 sm:h-11"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  You can select multiple images (JPG, PNG, etc.)
                </p>
              </div>
              
              {selectedReceipts.length > 0 && (
                <div>
                  <label htmlFor="selected-files" className="text-xs sm:text-sm font-medium">Selected Files:</label>
                  <div className="mt-2 space-y-1">
                    {selectedReceipts.map((file, index) => (
                      <div key={index} className="text-xs sm:text-sm text-muted-foreground">
                        {file.name} ({(file.size / 1024).toFixed(1)} KB)
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <DialogFooter className="flex flex-col space-y-2 pt-4 sm:flex-row sm:space-y-0 sm:space-x-2 sm:justify-end">
                <Button 
                  onClick={() => handleReceiptUpload(selectedRevenueForReceipt)}
                  disabled={selectedReceipts.length === 0}
                  className="w-full sm:w-auto h-12 sm:h-10"
                >
                  Upload Receipts
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowReceiptModal(false)
                    setSelectedReceipts([])
                    setSelectedRevenueForReceipt('')
                  }}
                  className="w-full sm:w-auto h-12 sm:h-10"
                >
                  Cancel
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
} 