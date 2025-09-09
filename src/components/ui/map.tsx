"use client"

import { MapPin } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'

interface MapProps {
  latitude?: number
  longitude?: number
  onLocationSelect?: (lat: number, lng: number) => void
  className?: string
}

export function Map({ latitude, longitude, onLocationSelect, className = "" }: MapProps) {
  const [map, setMap] = useState<any>(null)
  const [marker, setMarker] = useState<any>(null)
  const mapRef = useRef<HTMLDivElement>(null)
  const [isMapLoaded, setIsMapLoaded] = useState(false)

  // Default center (Casiguran, Sorsogon)
  const defaultCenter = [12.873089, 124.005875]
  const [center, setCenter] = useState(
    latitude && longitude ? [latitude, longitude] : defaultCenter
  )

  useEffect(() => {
    // Load Leaflet CSS
    const loadLeafletCSS = () => {
      if (document.querySelector('link[href*="leaflet.css"]')) return
      
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY='
      link.crossOrigin = ''
      document.head.appendChild(link)
    }

    // Load Leaflet script
    const loadLeafletScript = () => {
      if (window.L) {
        setIsMapLoaded(true)
        return
      }

      const script = document.createElement('script')
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
      script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo='
      script.crossOrigin = ''
      script.onload = () => setIsMapLoaded(true)
      document.head.appendChild(script)
    }

    loadLeafletCSS()
    loadLeafletScript()
  }, [])

  useEffect(() => {
    if (!isMapLoaded || !mapRef.current || !window.L) return

    const L = window.L

    // Initialize map with zoom level 18
    const mapInstance = L.map(mapRef.current).setView(center, 18)

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mapInstance)

    setMap(mapInstance)

    // Add marker if coordinates are provided
    if (latitude && longitude) {
      const markerInstance = L.marker([latitude, longitude], {
        draggable: true
      }).addTo(mapInstance)
      
      setMarker(markerInstance)

      // Add event listener for marker drag
      markerInstance.on('dragend', (event: any) => {
        const position = event.target.getLatLng()
        if (onLocationSelect) {
          onLocationSelect(position.lat, position.lng)
        }
      })
    }

    // Add click listener to map
    mapInstance.on('click', (event: any) => {
      const lat = event.latlng.lat
      const lng = event.latlng.lng
      
      // Remove existing marker
      if (marker) {
        mapInstance.removeLayer(marker)
      }

      // Add new marker
      const newMarker = L.marker([lat, lng], {
        draggable: true
      }).addTo(mapInstance)
      
      setMarker(newMarker)

      // Add event listener for marker drag
      newMarker.on('dragend', (event: any) => {
        const position = event.target.getLatLng()
        if (onLocationSelect) {
          onLocationSelect(position.lat, position.lng)
        }
      })

      if (onLocationSelect) {
        onLocationSelect(lat, lng)
      }
    })

    return () => {
      if (mapInstance) {
        mapInstance.remove()
      }
    }
  }, [isMapLoaded, center, latitude, longitude, onLocationSelect])

  if (!isMapLoaded) {
    return (
      <div className={`flex items-center justify-center h-64 bg-gray-100 rounded-lg ${className}`}>
        <div className="text-center">
          <MapPin className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500">Loading map...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`${className}`}>
      {/* Map container */}
      <div 
        ref={mapRef} 
        className="w-full h-64 rounded-lg border border-gray-200"
        style={{ minHeight: '256px' }}
      />
    </div>
  )
}

// Add Leaflet types to window object
declare global {
  interface Window {
    L: any
  }
} 