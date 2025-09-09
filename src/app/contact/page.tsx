"use client"

import React from 'react'
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Send,
  CheckCircle,
  MessageSquare,
  ChevronRight,
  ArrowRight
} from 'lucide-react'
import { useState } from 'react'

import Footer from '@/components/layout/footer'
import Header from '@/components/layout/header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

  const contactInfo = [
    {
    icon: <MapPin className="h-4 w-4 sm:h-5 sm:w-5" />,
    label: 'Office Address',
    value: 'Barangay Hall, Barangay Tulay, Philippines',
    description: 'Official government office location',
    color: 'sky'
  },
  {
    icon: <Phone className="h-4 w-4 sm:h-5 sm:w-5" />,
    label: 'Phone Number',
    value: '+63 912 345 6789',
    description: 'Official government contact number',
    color: 'green'
  },
  {
    icon: <Mail className="h-4 w-4 sm:h-5 sm:w-5" />,
    label: 'Email Address',
    value: 'sk.tulay@barangay.gov.ph',
    description: 'Official government email address',
    color: 'purple'
  },
  {
    icon: <Clock className="h-4 w-4 sm:h-5 sm:w-5" />,
    label: 'Office Hours',
    value: 'Monday - Friday, 8:00 AM - 5:00 PM',
    description: 'Government office operating hours',
    color: 'orange'
  }
]

const officeHours = [
  { day: 'Monday - Friday', hours: '8:00 AM - 5:00 PM', status: 'Open' },
  { day: 'Saturday', hours: '8:00 AM - 12:00 PM', status: 'Open' },
  { day: 'Sunday', hours: 'Closed', status: 'Closed' }
]

const socialMedia = [
  {
    name: 'Facebook',
    url: '#',
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    ),
    color: 'blue'
  },
  {
    name: 'Twitter',
    url: '#',
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
      </svg>
    ),
    color: 'sky'
  },
  {
    name: 'YouTube',
    url: '#',
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
      </svg>
    ),
    color: 'red'
    }
  ]

  const faqs = [
    {
    question: 'How can I register as a youth member?',
    answer: 'You can register as a youth member by visiting our office during business hours or by filling out the online registration form on our website. You must be between 15-30 years old and a resident of Barangay Tulay.',
    category: 'Registration'
    },
    {
    question: 'What government services do you provide?',
    answer: 'We provide various government services including youth registration, community programs, educational support, environmental initiatives, and official government announcements. All services are provided in accordance with local government regulations.',
    category: 'Services'
    },
    {
    question: 'How can I participate in community programs?',
    answer: 'To participate in our community programs, you must first register as a youth member. Once registered, you can join any of our government-sponsored programs and activities. Contact our office for more information.',
    category: 'Programs'
    },
    {
    question: 'What are the requirements for youth registration?',
    answer: 'Requirements include: proof of residency in Barangay Tulay, age between 15-30 years old, valid government ID, and completed registration form. All registrations are processed through official government procedures.',
    category: 'Registration'
    },
    {
      question: 'How can I report community concerns?',
    answer: 'You can report community concerns through our official channels: visit our office, call our hotline, or send an email. All reports are handled through proper government protocols and procedures.',
    category: 'Services'
  },
  {
    question: 'What is the process for official government inquiries?',
    answer: 'For official government inquiries, please contact our office during business hours. You may also submit your inquiry through our official email address. All inquiries are processed according to government regulations.',
    category: 'General'
  }
]

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setIsSubmitting(false)
    setIsSubmitted(true)
    
    // Reset form after submission
    setTimeout(() => {
      setIsSubmitted(false)
      setFormData({ name: '', email: '', subject: '', message: '' })
    }, 3000)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'sky': return 'bg-sky-100 text-sky-600 border-sky-200'
      case 'green': return 'bg-green-100 text-green-600 border-green-200'
      case 'purple': return 'bg-purple-100 text-purple-600 border-purple-200'
      case 'orange': return 'bg-orange-100 text-orange-600 border-orange-200'
      case 'blue': return 'bg-blue-100 text-blue-600 border-blue-200'
      case 'red': return 'bg-red-100 text-red-600 border-red-200'
      default: return 'bg-gray-100 text-gray-600 border-gray-200'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header currentPage="/contact" />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-sky-600 via-sky-700 to-sky-800 py-8 sm:py-12 lg:py-16 overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
          style={{
            backgroundImage: `url('/images/profiles/luis-martinez.jpg')`
          }}
        ></div>
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-sky-900/50 to-sky-800/50"></div>
        
        <div className="relative max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="text-center max-w-4xl mx-auto pt-16 sm:pt-20 lg:pt-24">

            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 text-white leading-tight">
              Contact Our
              <span className="block text-sky-200">Government Office</span>
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-sky-100 max-w-3xl mx-auto mb-6 sm:mb-8 leading-relaxed px-2">
              For official government inquiries, youth registration, and community services, 
              please contact SK Barangay Tulay through our official channels.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-8 sm:py-12 lg:py-16 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 text-gray-900">Office Information</h2>
            <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto px-2">
              Official government office details and contact information for SK Barangay Tulay.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {contactInfo.map((info, index) => (
              <Card key={index} className="group border-0 shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-1 bg-white/60 backdrop-blur-md rounded-2xl overflow-hidden relative border border-white/20">
                <CardContent className="pt-4 sm:pt-6 pb-4 sm:pb-6 px-3 sm:px-4 text-center">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4 ${getColorClasses(info.color)}`}>
                    {info.icon}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">{info.label}</h3>
                  <p className="text-xs sm:text-sm text-gray-600 mb-2 leading-relaxed">{info.value}</p>
                  <p className="text-xs text-gray-500 leading-tight">{info.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Office Hours */}
      <section className="py-8 sm:py-12 lg:py-16 bg-gradient-to-br from-sky-50 via-white to-blue-50">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 text-gray-900">Office Hours</h2>
            <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto px-2">
              Visit us during our official government office hours.
            </p>
          </div>
          <Card className="border-0 shadow-lg bg-white/60 backdrop-blur-md rounded-2xl overflow-hidden border border-white/20">
            <CardContent className="p-6 sm:p-8">
              <div className="space-y-4">
                {officeHours.map((schedule, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-white/50 rounded-lg border border-gray-100">
                    <div className="flex items-center space-x-4">
                      <Clock className="h-5 w-5 text-sky-600" />
                      <div>
                        <h3 className="font-semibold text-gray-900">{schedule.day}</h3>
                        <p className="text-sm text-gray-600">{schedule.hours}</p>
                      </div>
                    </div>
                    <Badge 
                      variant={schedule.status === 'Open' ? 'default' : 'secondary'}
                      className={schedule.status === 'Open' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-gray-100 text-gray-600 border-gray-200'}
                    >
                      {schedule.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

            {/* Contact Form */}
      <section className="py-8 sm:py-12 lg:py-16 bg-white">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 text-gray-900">Send Us a Message</h2>
            <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto px-2">
              For official government inquiries and community concerns, please use our contact form below.
            </p>
                  </div>
          
          <Card className="border-0 shadow-lg bg-white/60 backdrop-blur-md rounded-2xl overflow-hidden border border-white/20">
            <CardContent className="p-4 sm:p-6 lg:p-8">
              {isSubmitted ? (
                <div className="text-center py-8 sm:py-12">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Message Sent Successfully!</h3>
                  <p className="text-sm sm:text-base text-gray-600">
                    Thank you for contacting SK Barangay Tulay. We will respond to your inquiry within 24-48 hours.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Enter your full name"
                        className="text-sm sm:text-base"
                      />
                </div>
                <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Enter your email address"
                        className="text-sm sm:text-base"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                      Subject *
                    </label>
                    <Input
                      id="subject"
                      name="subject"
                      type="text"
                      required
                      value={formData.subject}
                      onChange={handleInputChange}
                      placeholder="Enter message subject"
                      className="text-sm sm:text-base"
                    />
                    </div>
                  
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                      Message *
                    </label>
                    <Textarea
                      id="message"
                      name="message"
                      required
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="Enter your message here..."
                      rows={6}
                      className="text-sm sm:text-base"
                    />
                    </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-sky-600 hover:bg-sky-700 text-white font-medium px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base shadow-sm transition-colors focus:ring-4 focus:ring-sky-200 w-full sm:w-auto"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Send Message
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="border-gray-300 text-gray-700 hover:bg-gray-50 font-medium px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base transition-colors focus:ring-4 focus:ring-sky-200 w-full sm:w-auto"
                      onClick={() => setFormData({ name: '', email: '', subject: '', message: '' })}
                    >
                      Clear Form
                    </Button>
                  </div>
                </form>
              )}
                </CardContent>
              </Card>
        </div>
      </section>

      {/* Social Media */}
      <section className="py-8 sm:py-12 lg:py-16 bg-gradient-to-br from-sky-50 via-white to-blue-50 overflow-hidden">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 text-gray-900">Follow Us</h2>
            <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto px-2">
              Stay connected with SK Barangay Tulay on social media for updates and announcements.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            {socialMedia.map((platform, index) => (
              <Card key={index} className="group border-0 shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-1 bg-white/60 backdrop-blur-md rounded-2xl overflow-hidden relative border border-white/20">
                <CardContent className="p-6 sm:p-8 text-center">
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center mx-auto mb-4 sm:mb-6 ${getColorClasses(platform.color)}`}>
                    {platform.icon}
                  </div>
                  <h3 className="font-semibold text-gray-900 text-lg sm:text-xl mb-2">{platform.name}</h3>
                  <Button 
                    variant="outline" 
                    className="border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-4 focus:ring-sky-200 transition-all duration-200" 
                    asChild
                  >
                    <a href={platform.url} className="flex items-center justify-center">
                      Follow on {platform.name}
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-8 sm:py-12 lg:py-16 bg-white overflow-hidden">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 text-gray-900">Frequently Asked Questions</h2>
            <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto px-2">
              Common questions about our government services and youth programs.
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {faqs.map((faq, index) => (
              <Card key={index} className="group border-0 shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-1 bg-white/60 backdrop-blur-md rounded-2xl overflow-hidden relative border border-white/20">
                <CardHeader className="pb-3 sm:pb-4">
                  <div className="flex items-start space-x-3 sm:space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-sky-100 rounded-lg flex items-center justify-center">
                        <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 text-sky-600" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge variant="secondary" className="text-xs bg-sky-50 text-sky-700 border-sky-200">
                          {faq.category}
                        </Badge>
                      </div>
                      <CardTitle className="text-base sm:text-lg mb-2 text-gray-900 leading-tight">{faq.question}</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="px-4 sm:px-6">
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-8 sm:py-12 lg:py-16 bg-gradient-to-br from-sky-50 via-white to-blue-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 text-center">
          <div className="bg-gradient-to-r from-sky-600 to-blue-600 rounded-2xl p-8 sm:p-12 shadow-xl">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-4 sm:mb-6">Ready to Get Started?</h2>
            <p className="text-sky-100 text-sm sm:text-base lg:text-lg mb-6 sm:mb-8 max-w-2xl mx-auto">
            Visit our official government office for in-person assistance with youth registration, 
            program inquiries, and community services.
          </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Button 
                className="bg-white text-sky-600 hover:bg-sky-50 font-medium px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base shadow-lg transition-all duration-300 hover:shadow-xl focus:ring-4 focus:ring-white/20 w-full sm:w-auto rounded-xl" 
              asChild
            >
              <a href="/auth/register">
                Register as Youth
                  <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
              </a>
            </Button>
            <Button 
                className="bg-sky-600 hover:bg-sky-700 text-white border border-sky-300 font-medium px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base transition-all duration-300 hover:shadow-xl focus:ring-4 focus:ring-sky-200 w-full sm:w-auto rounded-xl" 
              asChild
            >
              <a href="/programs">
                View Programs
                  <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
              </a>
            </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
} 