"use client"

import { Users, Shield, User, Star } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface SKMember {
  id: string
  name: string
  email: string
  role: string
  status: string
  avatar: string
  profileImage?: string
  department: string
  position: string
  performance: number
  projects: number
  achievements: number
}

interface OrgChartProps {
  members: SKMember[]
}

export function OrgChart({ members }: OrgChartProps) {
const getRoleIcon = (role: string) => {
  switch (role) {
      case 'SK_CHAIRPERSON':
        return <Shield className="w-4 h-4 text-red-600" />
      case 'SK_SECRETARY':
        return <User className="w-4 h-4 text-blue-600" />
      case 'SK_TREASURER':
        return <Star className="w-4 h-4 text-green-600" />
    default:
        return <Users className="w-4 h-4 text-gray-600" />
  }
}

  const getRoleBadge = (role: string) => {
    const baseClasses = "text-xs font-medium px-2 py-1 rounded-full"
    
  switch (role) {
      case 'SK_CHAIRPERSON':
        return <Badge className={`${baseClasses} bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200`}>Chairperson</Badge>
      case 'SK_SECRETARY':
        return <Badge className={`${baseClasses} bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200`}>Secretary</Badge>
      case 'SK_TREASURER':
        return <Badge className={`${baseClasses} bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200`}>Treasurer</Badge>
      case 'SK_COUNCILOR':
        return <Badge className={`${baseClasses} bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200`}>Councilor</Badge>
    default:
        return <Badge className={`${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200`}>{role}</Badge>
  }
}

  const getStatusBadge = (status: string) => {
    const baseClasses = "text-xs font-medium px-2 py-1 rounded-full"
    
  switch (status) {
    case 'ACTIVE':
        return <Badge className={`${baseClasses} bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200`}>Active</Badge>
    case 'INACTIVE':
        return <Badge className={`${baseClasses} bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200`}>Inactive</Badge>
    case 'PENDING':
        return <Badge className={`${baseClasses} bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200`}>Pending</Badge>
    default:
        return <Badge className={`${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200`}>{status}</Badge>
  }
}
  
  return (
    <Card className="p-1 sm:p-2">
      <CardHeader className="p-0 pb-1 sm:pb-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="flex items-center text-lg sm:text-xl">
            <Users className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            SK Organization Chart
          </CardTitle>
          <button
            type="button"
            aria-label="Close"
            onClick={() => {
              // best-effort: try to click dialog close button if present in header
              const anyClose = document.querySelector('[data-state="open"] button[aria-label="Close"]') as HTMLButtonElement | null
              if (anyClose) anyClose.click()
            }}
            className="inline-flex items-center justify-center rounded-md border bg-background hover:bg-muted transition-colors w-7 h-7 text-xs"
          >
            ✕
          </button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1 sm:gap-2">
          {members.map((member) => (
            <div key={member.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 sm:gap-2 p-1.5 sm:p-2 border rounded-lg">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  {member.profileImage ? (
                    <img
                      src={member.profileImage}
                      alt={member.name}
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-sm sm:text-lg font-semibold text-primary truncate">
                      {member.avatar}
                    </span>
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="font-semibold text-sm sm:text-base truncate">{member.name}</h3>
                    {getRoleIcon(member.role)}
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground break-words">{member.email}</p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    {getRoleBadge(member.role)}
                    {getStatusBadge(member.status)}
                  </div>
                </div>
              </div>

              <div className="text-left sm:text-right">
                <div className="text-sm sm:text-base font-medium break-words">{member.position}</div>
                <div className="text-xs sm:text-sm text-muted-foreground break-words">{member.department}</div>
                <div className="text-xs sm:text-sm text-muted-foreground mt-1">
                  Performance: {member.performance}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
} 