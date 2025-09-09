"use client"

import {
  LayoutDashboard,
  Users,
  Calendar,
  Bell,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Activity,
  Map,
  UserCheck,
  DollarSign,
  Upload,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { useAuth } from '@/lib/auth'
import { cn } from '@/lib/utils'

interface SidebarProps {
  className?: string
}

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'SK Programs',
    href: '/dashboard/sk-programs',
    icon: Activity,
  },
  {
    name: 'Budget Utilization',
    href: '/dashboard/budget-utilization',
    icon: DollarSign,
  },
  {
    name: 'SK Youth Profiling',
    href: '/dashboard/youth',
    icon: UserCheck,
  },
  {
    name: 'SK Members',
    href: '/dashboard/users',
    icon: Users,
  },
  {
    name: 'User Management',
    href: '/dashboard/users-management',
    icon: Users,
  },
  {
    name: 'Calendar',
    href: '/dashboard/calendar',
    icon: Calendar,
  },
  {
    name: 'Map',
    href: '/dashboard/map',
    icon: Map,
  },
  {
    name: 'Content Management',
    href: '/dashboard/content-management',
    icon: Upload,
  },
]

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { logout, user } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="bg-background/80 backdrop-blur-sm shadow-lg"
        >
          {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          'flex flex-col h-full bg-card border-r transition-all duration-300 ease-in-out',
          'lg:translate-x-0 lg:static lg:z-auto',
          isCollapsed ? 'lg:w-16' : 'lg:w-64',
          isMobileMenuOpen
            ? 'fixed inset-y-0 left-0 z-50 w-64 translate-x-0'
            : 'fixed inset-y-0 left-0 z-50 w-64 -translate-x-full lg:relative',
          className
        )}
      >
        {/* Logo */}
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className={cn("text-xl font-bold", isCollapsed && "lg:hidden")}>SK Project</h2>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="hidden lg:flex"
                onClick={() => setIsCollapsed(!isCollapsed)}
              >
                {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navigation.map((item) => {
            // Hide User Management for non-admin users
            if (item.name === 'User Management' && user?.role !== 'ADMIN') {
              return null
            }
            
            const isActive = pathname === item.href
            return (
              <Link key={item.name} href={item.href} onClick={() => setIsMobileMenuOpen(false)}>
                <Button
                  variant={isActive ? 'secondary' : 'ghost'}
                  className={cn(
                    'w-full justify-start',
                    isActive && 'bg-secondary text-secondary-foreground',
                    isCollapsed && 'lg:justify-center lg:px-2'
                  )}
                >
                  <item.icon className={cn("h-4 w-4", isCollapsed ? "lg:mr-0" : "mr-2")} />
                  <span className={cn("hidden sm:inline", isCollapsed && "lg:hidden")}>{item.name}</span>
                  <span className={cn("sm:hidden", isCollapsed && "lg:hidden")}>{item.name}</span>
                </Button>
              </Link>
            )
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t space-y-2">
          <ThemeToggle isCollapsed={isCollapsed} />
          <Button 
            variant="ghost" 
            className={cn("w-full justify-start text-red-600 hover:text-red-700", isCollapsed && "lg:justify-center lg:px-2")}
            onClick={async () => {
              setIsSigningOut(true)
              // Logout user
              logout()
              router.push('/auth/login')
              setIsSigningOut(false)
            }}
            disabled={isSigningOut}
          >
            {isSigningOut ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600" />
            ) : (
              <LogOut className={cn("h-4 w-4", isCollapsed ? "lg:mr-0" : "mr-2")} />
            )}
            <span className={cn("hidden sm:inline", isCollapsed && "lg:hidden")}>
              {isSigningOut ? 'Signing out...' : 'Sign Out'}
            </span>
            <span className={cn("sm:hidden", isCollapsed && "lg:hidden")}>
              {isSigningOut ? 'Signing out...' : 'Sign Out'}
            </span>
          </Button>
        </div>
      </div>
    </>
  )
} 