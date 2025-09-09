"use client"

import { Menu, X, Home, Info, BookOpen, FileText, Phone, User, LogIn } from 'lucide-react'
import Image from 'next/image'
import { useState, useEffect } from 'react'

import { Button } from '@/components/ui/button'

const navItems = [
  { href: '/', label: 'Home', icon: <Home className="h-4 w-4 sm:h-5 sm:w-5" /> },
  { href: '/about', label: 'About', icon: <Info className="h-4 w-4 sm:h-5 sm:w-5" /> },
  { href: '/programs', label: 'Programs', icon: <BookOpen className="h-4 w-4 sm:h-5 sm:w-5" /> },
  { href: '/news', label: 'Announcements', icon: <FileText className="h-4 w-4 sm:h-5 sm:w-5" /> },
  { href: '/contact', label: 'Contact', icon: <Phone className="h-4 w-4 sm:h-5 sm:w-5" /> }
]

interface HeaderProps {
  currentPage: string
}

export default function Header({ currentPage }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  // Scroll detection for glassmorphism effect
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      setIsScrolled(scrollTop > 50)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (isMenuOpen && !target.closest('.sidebar') && !target.closest('.menu-button')) {
        setIsMenuOpen(false)
      }
    }

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.body.style.overflow = 'unset'
    }
  }, [isMenuOpen])

  // Close sidebar on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isMenuOpen) {
        setIsMenuOpen(false)
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isMenuOpen])

  // Close sidebar on window resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && isMenuOpen) {
        setIsMenuOpen(false)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [isMenuOpen])

  return (
    <>
      <nav 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out overflow-hidden ${
          isScrolled 
            ? 'bg-white/10 backdrop-blur-xl shadow-2xl border border-white/30' 
            : 'bg-transparent'
        }`}
        style={{
          background: isScrolled 
            ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)'
            : 'transparent',
          backdropFilter: isScrolled ? 'blur(20px) saturate(180%)' : 'none',
          WebkitBackdropFilter: isScrolled ? 'blur(20px) saturate(180%)' : 'none',
          border: isScrolled 
            ? '1px solid rgba(255, 255, 255, 0.3)' 
            : 'none',
          boxShadow: isScrolled 
            ? '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)' 
            : 'none'
        }}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-3 sm:py-4 overflow-hidden">
        <div className="flex items-center justify-between min-w-0">
            {/* Logo and Brand */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="h-8 w-8 sm:h-10 sm:w-10 flex items-center justify-center">
                <Image
                  src="/images/profiles/TULAYLOGO.png"
                  alt="SK Barangay Tulay Logo"
                  width={40}
                  height={40}
                  className="h-8 w-8 sm:h-10 sm:w-10 object-contain"
                />
              </div>
              <div className="min-w-0">
                <h1 className={`text-sm sm:text-lg font-bold truncate drop-shadow-lg transition-colors duration-300 ${
                  isScrolled ? 'text-gray-900' : 'text-white'
                }`}>SK Barangay Tulay</h1>
                <p className={`text-xs truncate drop-shadow-lg transition-colors duration-300 ${
                  isScrolled ? 'text-gray-600' : 'text-white/90'
                }`}>Official Government Website</p>
            </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                  className={`text-sm font-medium transition-all duration-300 drop-shadow-lg px-3 py-2 rounded-lg ${
                  currentPage === item.href
                      ? isScrolled 
                        ? 'text-sky-600 bg-sky-50/80 backdrop-blur-sm border border-sky-200/50 shadow-lg'
                        : 'text-white'
                      : isScrolled
                        ? 'text-gray-700 hover:text-sky-600 hover:bg-gray-50/80 hover:backdrop-blur-sm hover:border hover:border-gray-200/50'
                        : 'text-white/90 hover:text-white'
                }`}
              >
                {item.label}
              </a>
            ))}
          </div>

            {/* Desktop Buttons */}
            <div className="hidden md:flex items-center space-x-3 lg:space-x-4">
              <Button
                variant="outline"
                size="sm"
                className={`font-medium text-xs sm:text-sm transition-all duration-300 ${
                  isScrolled
                    ? 'border-gray-300/50 text-gray-700 hover:bg-gray-50/80 hover:border-gray-400/50 shadow-lg backdrop-blur-sm'
                    : 'border-white/40 text-white hover:bg-white/20'
                }`}
                asChild
              >
                <a href="/auth/login">Admin Portal</a>
              </Button>
              <Button
                size="sm"
                className={`font-medium text-xs sm:text-sm transition-all duration-300 ${
                  isScrolled
                    ? 'bg-gradient-to-r from-sky-600 to-sky-700 hover:from-sky-700 hover:to-sky-800 text-white border border-sky-500/30 shadow-lg backdrop-blur-sm'
                    : 'bg-white text-sky-600 hover:bg-white/90'
                }`}
                asChild
              >
                <a href="/forms/cmdwjcxro0003piol3b572m7p">Register as Youth</a>
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`p-1.5 sm:p-2 menu-button transition-all duration-300 ${
                  isScrolled
                    ? 'text-gray-700 hover:bg-gray-50/80 hover:border hover:border-gray-200/50 shadow-lg backdrop-blur-sm rounded-lg'
                    : 'text-white hover:bg-white/20'
                }`}
                aria-label="Toggle navigation menu"
              >
                {isMenuOpen ? (
                  <X className="h-4 w-4 sm:h-5 sm:w-5" />
                ) : (
                  <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 md:hidden" />
      )}

      {/* Mobile Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-72 sm:w-80 z-50 transform transition-transform duration-300 ease-in-out md:hidden sidebar overflow-y-auto ${
          isMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.85) 100%)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)'
        }}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/30 bg-gradient-to-r from-white/50 to-sky-50/30 backdrop-blur-sm">
          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
            <div className="h-8 w-8 sm:h-10 sm:w-10 flex items-center justify-center flex-shrink-0">
              <Image
                src="/images/profiles/TULAYLOGO.png"
                alt="SK Barangay Tulay Logo"
                width={40}
                height={40}
                className="h-8 w-8 sm:h-10 sm:w-10 object-contain"
              />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-lg font-bold text-gray-900 truncate">SK Barangay Tulay</h2>
              <p className="text-xs text-gray-600 truncate">Official Government Website</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMenuOpen(false)}
            className="p-1.5 sm:p-2 flex-shrink-0"
            aria-label="Close navigation menu"
          >
            <X className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        </div>

        {/* Sidebar Navigation */}
        <div className="flex flex-col h-full max-h-screen overflow-hidden">
          <nav className="flex-1 px-4 sm:px-6 py-3 sm:py-4 overflow-y-auto">
            <div className="space-y-1 sm:space-y-2">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-2 sm:space-x-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg text-sm font-medium transition-all duration-300 ${
                    currentPage === item.href
                      ? 'bg-gradient-to-r from-sky-50/80 to-sky-100/60 text-sky-700 border border-sky-200/50 shadow-lg backdrop-blur-sm'
                      : 'text-gray-700 hover:bg-white/60 hover:text-sky-600 hover:shadow-md backdrop-blur-sm border border-transparent hover:border-white/30'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className={`flex-shrink-0 transition-colors duration-300 ${
                    currentPage === item.href ? 'text-sky-600' : 'text-sky-500'
                  }`}>{item.icon}</span>
                  <span className="truncate">{item.label}</span>
                </a>
              ))}
            </div>
          </nav>

          {/* Sidebar Footer */}
          <div className="flex-shrink-0 border-t border-white/30 p-4 sm:p-6 space-y-3 bg-gradient-to-t from-white/40 to-transparent backdrop-blur-sm">
            <div className="text-xs text-gray-600 mb-3 sm:mb-4">
              <p className="font-medium text-gray-800 mb-1">Government Services</p>
              <p className="leading-relaxed">Access official SK Barangay Tulay services and information</p>
            </div>
            
            <div className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full border-white/40 text-gray-700 hover:bg-white/60 hover:border-white/60 font-medium text-xs sm:text-sm backdrop-blur-sm shadow-lg transition-all duration-300"
                asChild
              >
                <a href="/auth/login" className="flex items-center justify-center space-x-2">
                  <LogIn className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>Admin Portal</span>
                </a>
            </Button>
              <Button
                size="sm"
                className="w-full bg-gradient-to-r from-sky-600 to-sky-700 hover:from-sky-700 hover:to-sky-800 text-white font-medium text-xs sm:text-sm shadow-lg backdrop-blur-sm border border-sky-500/30 transition-all duration-300"
                asChild
              >
                <a href="/forms/cmdwjcxro0003piol3b572m7p" className="flex items-center justify-center space-x-2">
                  <User className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>Register as Youth</span>
                </a>
            </Button>
            </div>

            {/* Contact Info */}
            <div className="pt-3 sm:pt-4 border-t border-white/30">
              <div className="text-xs text-gray-600">
                <p className="font-medium text-gray-800 mb-1">Contact Office</p>
                <p className="leading-relaxed">For inquiries and assistance</p>
                <p className="mt-2 text-sky-600 truncate font-medium">contact@sk-tulay.gov.ph</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
} 