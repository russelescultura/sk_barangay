"use client"

import { Shield, ArrowRight, Mail, Phone, MapPin } from 'lucide-react'
import Image from 'next/image'

import { Button } from '@/components/ui/button'

const governmentServices = [
  { href: '/programs', label: 'Youth Programs' },
  { href: '/news', label: 'Public Announcements' },
  { href: '/contact', label: 'Contact Information' },
  { href: '/about', label: 'About SK' }
]

const quickLinks = [
  { href: '/auth/register', label: 'Youth Registration' },
  { href: '/auth/login', label: 'Admin Portal' },
  { href: '/contact', label: 'Contact Office' },
  { href: '/about', label: 'Our Mission' }
]

const contactInfo = [
  {
    icon: <MapPin className="h-3 w-3 sm:h-4 sm:w-4" />,
    label: 'Address',
    value: 'Barangay Hall, Barangay Tulay, Philippines'
  },
  {
    icon: <Phone className="h-3 w-3 sm:h-4 sm:w-4" />,
    label: 'Phone',
    value: '+63 912 345 6789'
  },
  {
    icon: <Mail className="h-3 w-3 sm:h-4 sm:w-4" />,
    label: 'Email',
    value: 'sk.tulay@barangay.gov.ph'
  }
]

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-6 sm:mb-8">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-2 sm:space-x-3 mb-4 sm:mb-6">
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
                <h3 className="text-base sm:text-lg font-bold truncate">SK Barangay Tulay</h3>
                <p className="text-xs sm:text-sm text-gray-400 truncate">Official Government Office</p>
              </div>
            </div>
            <p className="text-gray-300 text-xs sm:text-sm mb-4 sm:mb-6 leading-relaxed">
              Official youth council serving the community of Barangay Tulay.
              We provide public services, community programs, and youth development
              initiatives in accordance with local government regulations.
            </p>
            <Button
              size="sm"
              className="bg-sky-600 hover:bg-sky-700 text-white font-medium text-xs sm:text-sm w-full sm:w-auto"
              asChild
            >
              <a href="/auth/register" className="flex items-center justify-center">
                Register Now
                <ArrowRight className="ml-2 h-3 w-3 sm:h-4 sm:w-4" />
              </a>
            </Button>
          </div>

          {/* Government Services */}
          <div>
            <h4 className="text-base sm:text-lg font-semibold mb-4 sm:mb-6">Government Services</h4>
            <ul className="space-y-2 sm:space-y-3">
              {governmentServices.map((service) => (
                <li key={service.href}>
                  <a
                    href={service.href}
                    className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center group text-xs sm:text-sm"
                  >
                    <ArrowRight className="h-3 w-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                    <span className="truncate">{service.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-base sm:text-lg font-semibold mb-4 sm:mb-6">Quick Links</h4>
            <ul className="space-y-2 sm:space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center group text-xs sm:text-sm"
                  >
                    <ArrowRight className="h-3 w-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                    <span className="truncate">{link.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Information */}
          <div>
            <h4 className="text-base sm:text-lg font-semibold mb-4 sm:mb-6">Contact Information</h4>
            <div className="space-y-3 sm:space-y-4">
              {contactInfo.map((info, index) => (
                <div key={index} className="flex items-start space-x-2 sm:space-x-3">
                  <div className="flex-shrink-0 mt-0.5 sm:mt-1">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 bg-sky-600 rounded-full flex items-center justify-center">
                      <div className="text-white">
                        {info.icon}
                      </div>
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-medium text-gray-300 truncate">{info.label}</p>
                    <p className="text-xs sm:text-sm text-gray-400 leading-relaxed break-words">{info.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 pt-6 sm:pt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <div className="text-center sm:text-left">
              <p className="text-gray-400 text-xs sm:text-sm">&copy; 2024 SK Barangay Tulay. Official Government Website.</p>
              <p className="text-gray-500 text-xs mt-1 leading-relaxed">Serving the youth and community of Barangay Tulay</p>
            </div>
            <div className="flex flex-wrap justify-center sm:justify-end gap-4 sm:gap-6">
              <a href="/privacy" className="text-gray-400 hover:text-white text-xs sm:text-sm transition-colors">Privacy Policy</a>
              <a href="/terms" className="text-gray-400 hover:text-white text-xs sm:text-sm transition-colors">Terms of Service</a>
              <a href="/contact" className="text-gray-400 hover:text-white text-xs sm:text-sm transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
} 