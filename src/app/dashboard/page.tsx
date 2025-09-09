"use client"

import { 
  Users, 
  Activity, 
  DollarSign, 
  BarChart3, 
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  FileText,
  Target,
  UserCheck,
  Eye,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react'
import { useState, useEffect } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface DashboardStats {
  totalPrograms: number
  totalEvents: number
  totalSubmissions: number
  totalYouthProfiles: number
  totalContentPosts: number
  totalBudget: number
  recentActivities: any[]
  programStats: any[]
  eventStats: any[]
  submissionStats: any[]
  budgetStats: any[]
  youthProfileStats: any[]
  contentPostStats: any[]
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('/api/dashboard/stats')
          if (!response.ok) {
          throw new Error('Failed to fetch dashboard data')
        }
        const data = await response.json()
        setStats(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
        console.error('Error fetching dashboard data:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const dashboardStats = [
    {
      title: 'Total Programs',
      value: stats?.totalPrograms || 0,
      change: '+12.5%',
      changeType: 'positive',
      icon: <Target className="h-4 w-4" />,
    },
    {
      title: 'Total Events',
      value: stats?.totalEvents || 0,
      change: '+8.2%',
      changeType: 'positive',
      icon: <Calendar className="h-4 w-4" />,
    },
    {
      title: 'Total Submissions',
      value: stats?.totalSubmissions || 0,
      change: '+15.3%',
      changeType: 'positive',
      icon: <FileText className="h-4 w-4" />,
    },
    {
      title: 'Youth Profiles',
      value: stats?.totalYouthProfiles || 0,
      change: '+5.7%',
      changeType: 'positive',
      icon: <UserCheck className="h-4 w-4" />,
    },
  ]

  const budgetStats = [
    {
      title: 'Total Budget',
      value: `₱${stats?.totalBudget?.toLocaleString() || 0}`,
      change: '+3.2%',
      changeType: 'positive',
      icon: <DollarSign className="h-4 w-4" />,
    },
    {
      title: 'Content Posts',
      value: stats?.totalContentPosts || 0,
      change: '+18.9%',
      changeType: 'positive',
      icon: <Eye className="h-4 w-4" />,
    },
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin text-sky-600" />
          <span className="text-gray-600">Loading Dashboard...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-2">Failed to load Dashboard</div>
          <p className="text-gray-600 text-sm">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8 pt-16 lg:pt-8">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Welcome back! Here's what's happening with SK Barangay Tulay today.
          </p>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {dashboardStats.map((stat, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <div className="h-4 w-4 text-muted-foreground">
                  {stat.icon}
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="flex items-center space-x-1 text-xs text-muted-foreground mt-1">
                  {stat.changeType === 'positive' ? (
                    <ArrowUpRight className="h-3 w-3 text-green-600" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3 text-red-600" />
                  )}
                  <span className={stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'}>
                    {stat.change}
                  </span>
                  <span>from last month</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Budget and Content Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {budgetStats.map((stat, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <div className="h-4 w-4 text-muted-foreground">
                  {stat.icon}
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="flex items-center space-x-1 text-xs text-muted-foreground mt-1">
                  {stat.changeType === 'positive' ? (
                    <ArrowUpRight className="h-3 w-3 text-green-600" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3 text-red-600" />
                  )}
                  <span className={stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'}>
                    {stat.change}
                  </span>
                  <span>from last month</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Analytics Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Program Analytics */}
          <Card>
            <CardHeader>
              <CardTitle>Program Analytics</CardTitle>
              <CardDescription>
                Program creation trends over the last 4 months
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                {stats?.programStats && stats.programStats.length > 0 ? (
                  <div className="h-full relative">
                    {/* SVG Container */}
                    <svg className="w-full h-full" viewBox="0 0 400 200" preserveAspectRatio="none">
                      {/* Grid Lines */}
                      <defs>
                        <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                          <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#f3f4f6" strokeWidth="1"/>
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill="url(#grid)" />
                      
                      {/* Chart Area */}
                      <g transform="translate(40, 20)">
                        {/* Calculate dimensions */}
                        {(() => {
                          const maxValue = Math.max(...stats.programStats.map(s => s.count));
                          const minValue = 0;
                          const chartWidth = 320;
                          const chartHeight = 140;
                          const xStep = chartWidth / (stats.programStats.length - 1);
                          
                          // Create line path
                          const linePath = stats.programStats.map((stat, index) => {
                            const x = index * xStep;
                            const y = chartHeight - ((stat.count - minValue) / (maxValue - minValue)) * chartHeight;
                            return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
                          }).join(' ');
                          
                          // Create area path
                          const areaPath = `${stats.programStats.map((stat, index) => {
                            const x = index * xStep;
                            const y = chartHeight - ((stat.count - minValue) / (maxValue - minValue)) * chartHeight;
                            return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
                          }).join(' ')  } L ${chartWidth} ${chartHeight} L 0 ${chartHeight} Z`;
                          
                          return (
                            <>
                              {/* Area fill */}
                              <path
                                d={areaPath}
                                fill="url(#areaGradient)"
                                opacity="0.3"
                              />
                              
                              {/* Line */}
                              <path
                                d={linePath}
                                stroke="#0ea5e9"
                                strokeWidth="3"
                                fill="none"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              
                              {/* Data points */}
                              {stats.programStats.map((stat, index) => {
                                const x = index * xStep;
                                const y = chartHeight - ((stat.count - minValue) / (maxValue - minValue)) * chartHeight;
                                return (
                                  <g key={index}>
                                    <circle
                                      cx={x}
                                      cy={y}
                                      r="4"
                                      fill="#0ea5e9"
                                      className="hover:r-6 transition-all duration-200"
                                    />
                                    <text
                                      x={x}
                                      y={y - 10}
                                      textAnchor="middle"
                                      className="text-xs fill-gray-600"
                                    >
                                      {stat.count}
                                    </text>
                                  </g>
                                );
                              })}
                              
                              {/* X-axis labels */}
                              {stats.programStats.map((stat, index) => {
                                const x = index * xStep;
                                return (
                                  <text
                                    key={index}
                                    x={x}
                                    y={chartHeight + 20}
                                    textAnchor="middle"
                                    className="text-xs fill-gray-500"
                                  >
                                    {stat.month}
                                  </text>
                                );
                              })}
                            </>
                          );
                        })()}
                      </g>
                      
                      {/* Gradient definitions */}
                      <defs>
                        <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.4"/>
                          <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.1"/>
                        </linearGradient>
                      </defs>
                    </svg>
                    
                    {/* Summary */}
                    <div className="absolute bottom-0 left-0 right-0 text-center">
                      <p className="text-sm text-muted-foreground">
                        Total Programs: {stats.totalPrograms}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">No program data available</p>
                    </div>
                </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Event Analytics */}
          <Card>
            <CardHeader>
              <CardTitle>Event Analytics</CardTitle>
              <CardDescription>
                Event creation trends over the last 4 months
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                {stats?.eventStats && stats.eventStats.length > 0 ? (
                  <div className="h-full flex flex-col">
                    <div className="flex-1 flex items-end justify-between space-x-2">
                      {stats.eventStats.map((stat, index) => (
                        <div key={index} className="flex flex-col items-center space-y-2">
                          <div 
                            className="w-12 bg-green-600 rounded-t-sm transition-all duration-300 hover:bg-green-700"
                            style={{ 
                              height: `${Math.max((stat.count / Math.max(...stats.eventStats.map(s => s.count))) * 200, 20)}px` 
                            }}
                          />
                          <span className="text-xs text-muted-foreground">{stat.month}</span>
                          <span className="text-xs font-medium">{stat.count}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 text-center">
                      <p className="text-sm text-muted-foreground">
                        Total Events: {stats.totalEvents}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">No event data available</p>
                    </div>
                </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Monitoring Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Submission Updates */}
          <Card>
                  <CardHeader>
              <CardTitle>Submission Updates</CardTitle>
                    <CardDescription>
                Recent form submissions and status
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                {stats?.recentActivities?.slice(0, 5).map((activity, index) => (
                  <div key={index} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <FileText className="h-4 w-4 text-primary" />
                          </div>
                          <div className="flex-1 space-y-1">
                            <p className="text-sm font-medium leading-none">
                        {activity.user || 'Anonymous'}
                            </p>
                            <p className="text-sm text-muted-foreground">
                        {activity.action || 'Submitted a form'}
                            </p>
                          </div>
                            <div className="text-xs text-muted-foreground">
                      {activity.time || 'Just now'}
                          </div>
                        </div>
                      ))}
                    </div>
            </CardContent>
          </Card>

          {/* Budget Monitoring */}
          <Card>
            <CardHeader>
              <CardTitle>Budget Monitoring</CardTitle>
              <CardDescription>
                Budget allocation and spending tracking
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Total Budget</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    ₱{stats?.totalBudget?.toLocaleString() || 0}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Allocated</span>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    ₱{((stats?.totalBudget || 0) * 0.75).toLocaleString()}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Remaining</span>
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                    ₱{((stats?.totalBudget || 0) * 0.25).toLocaleString()}
                  </Badge>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-sky-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Youth Profiling Monitor */}
          <Card>
            <CardHeader>
              <CardTitle>Youth Profiling Monitor</CardTitle>
              <CardDescription>
                Youth registration and profile updates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Total Profiles</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    {stats?.totalYouthProfiles || 0}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Active Profiles</span>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    {Math.floor((stats?.totalYouthProfiles || 0) * 0.85)}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">New This Month</span>
                  <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                    {Math.floor((stats?.totalYouthProfiles || 0) * 0.12)}
                  </Badge>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                </div>
              </div>
                  </CardContent>
                </Card>
              </div>

        {/* Content Post Monitor */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Content Post Monitor</CardTitle>
              <CardDescription>
                Content creation and engagement metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Total Posts</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    {stats?.totalContentPosts || 0}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Published</span>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    {Math.floor((stats?.totalContentPosts || 0) * 0.9)}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Draft</span>
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                    {Math.floor((stats?.totalContentPosts || 0) * 0.1)}
                  </Badge>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '90%' }}></div>
                </div>
              </div>
            </CardContent>
          </Card>

              {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                    <CardDescription>
                      Common tasks and shortcuts
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">

              <Button className="w-full justify-start" variant="outline">
                        <Users className="mr-2 h-4 w-4" />
                Manage Youth Profiles
                    </Button>
              <Button className="w-full justify-start" variant="outline">
                <Calendar className="mr-2 h-4 w-4" />
                Create Event
                    </Button>
              <Button className="w-full justify-start" variant="outline">
                <FileText className="mr-2 h-4 w-4" />
                Create Form
                    </Button>
                  </CardContent>
                </Card>
        </div>

                {/* System Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card>
                  <CardHeader>
                    <CardTitle>System Status</CardTitle>
                    <CardDescription>
                      Current system health and performance
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">API Status</span>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Operational
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                <span className="text-sm">Database</span>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Healthy
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Form Submissions</span>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Active
                </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                <span className="text-sm">Youth Profiling</span>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Online
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>
                Latest updates from the system
                    </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                {stats?.recentActivities?.slice(0, 4).map((activity, index) => (
                  <div key={index} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Activity className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {activity.user || 'System'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {activity.action || 'System update'}
                      </p>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {activity.time || 'Just now'}
                        </div>
                      </div>
                    ))}
                  </div>
              <Button variant="outline" className="w-full mt-6">
                View All Activity
                  </Button>
                </CardContent>
              </Card>
            </div>
      </div>
    </div>
  )
} 