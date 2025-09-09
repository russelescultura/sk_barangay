"use client"

import { MapPin } from 'lucide-react'
import dynamic from 'next/dynamic'
import { useMemo, useRef } from 'react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function MapPage() {
    const mapRef = useRef<any>(null)

    const Map = useMemo(
        () =>
            dynamic(() => import('@/components/map/interactive-map').then(mod => ({ default: mod.default })), {
                loading: () => <div className="h-full w-full flex items-center justify-center">Loading map...</div>,
                ssr: false,
            }),
        []
    )

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8">
                {/* Header Section - Consistent with main dashboard */}
                <div className="flex items-center justify-between mb-8 pt-16 lg:pt-8">
                        <div>
                        <h1 className="text-3xl font-bold tracking-tight">Interactive Map</h1>
                        <p className="text-muted-foreground mt-2">
                                View and interact with the barangay map and locations.
                            </p>
                    </div>
                </div>
            
            {/* Map Card */}
            <Card>
                <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                            <MapPin className="h-5 w-5" />
                            <CardTitle>Barangay Map</CardTitle>
                        </div>
                    </div>
                    <CardDescription>
                            Interactive map showing important locations in Casiguran, Sorsogon
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col p-0">
                    <div className="p-6">
                        {/* Map Legend */}
                        <div className="mb-3 p-3 bg-muted/50 rounded-lg">
                            <h3 className="text-sm font-medium mb-2">Location Types:</h3>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
                                <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                                        <svg width="12" height="12" viewBox="0 0 16 16" fill="white">
                                                <path d="M2 2h12v10H2V2zm2 2v6h8V4H4zm2 1h4M4 6h4M4 8h4M4 10h4" stroke="white" strokeWidth="1" fill="none"/>
                                            </svg>
                                    </div>
                                    <span className="text-xs font-medium">Schools</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 rounded-full bg-red-600 flex items-center justify-center">
                                        <svg width="12" height="12" viewBox="0 0 16 16" fill="white">
                                                <path d="M1 14h14v-2H1v2zm2-2V6h10v6M5 6V2h6v4M7 2V0h2v2" stroke="white" strokeWidth="1" fill="none"/>
                                            </svg>
                                    </div>
                                    <span className="text-xs font-medium">Government</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 rounded-full bg-green-600 flex items-center justify-center">
                                        <svg width="12" height="12" viewBox="0 0 16 16" fill="white">
                                                <path d="M7 1v6h6v2H7v6H5V9H1V7h4V1h2z" fill="white"/>
                                            </svg>
                                    </div>
                                    <span className="text-xs font-medium">Health</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 rounded-full bg-purple-600 flex items-center justify-center">
                                        <svg width="12" height="12" viewBox="0 0 16 16" fill="white">
                                                <path d="M1 14h14V2H1v12zm2-10h10v8H3V4zm2 2h6M3 8h6M3 10h6" stroke="white" strokeWidth="1" fill="none"/>
                                            </svg>
                                    </div>
                                    <span className="text-xs font-medium">Commercial</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 rounded-full bg-orange-600 flex items-center justify-center">
                                        <svg width="12" height="12" viewBox="0 0 16 16" fill="white">
                                            <circle cx="8" cy="8" r="6" stroke="white" strokeWidth="1" fill="none"/>
                                            <path d="M2 8c3-3 3-3 6 0 3 3 3 3 6 0" stroke="white" strokeWidth="1" fill="none"/>
                                            </svg>
                                    </div>
                                    <span className="text-xs font-medium">Sports</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 rounded-full bg-yellow-500 flex items-center justify-center">
                                        <svg width="12" height="12" viewBox="0 0 16 16" fill="white">
                                            <path d="M8 1v14M4 5h8" stroke="white" strokeWidth="1.5"/>
                                            </svg>
                                    </div>
                                    <span className="text-xs font-medium">Religious</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
                                        <svg width="12" height="12" viewBox="0 0 16 16" fill="white">
                                                <path d="M7.5 1v6.5H1v1h6.5V15h1V8.5H15v-1H8.5V1h-1z" fill="white"/>
                                            </svg>
                                    </div>
                                    <span className="text-xs font-medium">Emergency</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 rounded-full bg-gray-500 flex items-center justify-center">
                                        <svg width="12" height="12" viewBox="0 0 16 16" fill="white">
                                                <path d="M1 14h14V8L8 1 1 8v6zm3-6h8v4H4V8zm4 4V8" stroke="white" strokeWidth="1" fill="none"/>
                                            </svg>
                                    </div>
                                    <span className="text-xs font-medium">Residential</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 rounded-full bg-cyan-500 flex items-center justify-center">
                                        <svg width="12" height="12" viewBox="0 0 16 16" fill="white">
                                                <path d="M1 1h14v14H1V1zm2 2v10h10V3H3z" stroke="white" strokeWidth="1" fill="none"/>
                                                <circle cx="8" cy="8" r="2" fill="white"/>
                                            </svg>
                                    </div>
                                    <span className="text-xs font-medium">Recreation</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center">
                                        <svg width="12" height="12" viewBox="0 0 16 16" fill="white">
                                            <path d="M1 14h14V2H1v12zm2-10h10v8H3V4zm3 3h4v2H6V7z" stroke="white" strokeWidth="1" fill="none"/>
                                                </svg>
                                            </div>
                                    <span className="text-xs font-medium">Gymnasium</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                    <div className="h-[87vh] w-full rounded-b-lg overflow-hidden border-t">
                            <Map ref={mapRef} />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
