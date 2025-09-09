"use client"

import { Icon } from 'leaflet'
import { useEffect, useState, useRef, forwardRef, useImperativeHandle } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMapEvents, useMap, Polyline } from 'react-leaflet'

import { getLocations, createLocation, updateLocation, deleteLocation, type Location, type LocationType } from '@/lib/services/locations'

// Event interface for map display
interface Event {
  id: string
  title: string
  description: string
  dateTime: string
  endDateTime: string | null
  venue: string
  maxParticipants: number | null
  status: 'PLANNED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED'
  poster: string | null
  attachments: string | null
  createdAt: string
  updatedAt: string
  programId: string
  program: {
    id: string
    title: string
    status: string
  }
}

// Define location data
const barangayLocations = [
    {
        id: 1,
        name: "Casiguran Central School",
        position: [12.8728, 124.0092] as [number, number],
        type: "school",
        description: "Main educational institution in Casiguran",
        address: "Casiguran, Sorsogon, Philippines"
    },
    {
        id: 2,
        name: "Casiguran Barangay Hall",
        position: [12.8735, 124.0088] as [number, number],
        type: "government",
        description: "Main government office and administrative center",
        address: "Casiguran, Sorsogon, Philippines"
    },
    {
        id: 3,
        name: "Casiguran Health Center",
        position: [12.8720, 124.0095] as [number, number],
        type: "health",
        description: "Primary healthcare facility for residents",
        address: "Casiguran, Sorsogon, Philippines"
    },
    {
        id: 4,
        name: "Casiguran Public Market",
        position: [12.8740, 124.0085] as [number, number],
        type: "commercial",
        description: "Main marketplace for local commerce",
        address: "Casiguran, Sorsogon, Philippines"
    },
    {
        id: 5,
        name: "Casiguran Municipal Hall",
        position: [12.8745, 124.0080] as [number, number],
        type: "government",
        description: "Municipal government office",
        address: "Casiguran, Sorsogon, Philippines"
    },
    {
        id: 6,
        name: "Casiguran Basketball Court",
        position: [12.8725, 124.0090] as [number, number],
        type: "sports",
        description: "Community sports and recreation facility",
        address: "Casiguran, Sorsogon, Philippines"
    }
]

// Map Events Component
function MapEvents({ onRightClick, onMapClick }: { onRightClick: (e: any) => void; onMapClick?: (e: any) => void }) {
    useMapEvents({
        contextmenu: onRightClick,
        click: onMapClick
    })
    return null
}

// Popup Handler Component
function PopupHandler({ setIsPopupOpen, setMapRef }: {
    setIsPopupOpen: (open: boolean) => void
    setMapRef: (map: any) => void
}) {
    const map = useMap()
    const [zoomControlVisible, setZoomControlVisible] = useState(true)
    const zoomControlRef = useRef<any>(null)

    useEffect(() => {
        setMapRef(map)

        // Get the zoom control element
        const zoomControlElement = map.getContainer().querySelector('.leaflet-control-zoom')
        if (zoomControlElement) {
            zoomControlRef.current = zoomControlElement
        }

        const handlePopupOpen = () => {
            setIsPopupOpen(true)
            // Hide zoom controls
            if (zoomControlRef.current && zoomControlVisible) {
                zoomControlRef.current.style.display = 'none'
                setZoomControlVisible(false)
            }
        }

        const handlePopupClose = () => {
            setIsPopupOpen(false)
            // Show zoom controls
            if (zoomControlRef.current && !zoomControlVisible) {
                zoomControlRef.current.style.display = 'block'
                setZoomControlVisible(true)
            }
        }

        // Add event listeners
        map.on('popupopen', handlePopupOpen)
        map.on('popupclose', handlePopupClose)

        // Invalidate size
        setTimeout(() => {
            map.invalidateSize();
        }, 100);

        // Cleanup
        return () => {
            map.off('popupopen', handlePopupOpen)
            map.off('popupclose', handlePopupClose)
        }
    }, [map, setIsPopupOpen, setMapRef, zoomControlVisible])

    return null
}

// Trash Zone Component
function TrashZone({ 
    visible, 
    draggedLocation, 
    onDelete 
}: { 
    visible: boolean
    draggedLocation: Location | null
    onDelete: (location: Location) => Promise<boolean>
}) {
    const [isHovered, setIsHovered] = useState(false)

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault()
        if (draggedLocation) {
            const success = await onDelete(draggedLocation)
            if (success) {
                setIsHovered(false)
            }
        }
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        setIsHovered(true)
    }

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault()
        setIsHovered(false)
    }

    if (!visible) return null

    return (
        <div 
            className={`absolute bottom-4 right-4 z-10 w-24 h-24 rounded-full border-4 border-dashed transition-all duration-200 flex items-center justify-center ${
                isHovered 
                    ? 'border-red-500 bg-red-100 scale-110' 
                    : 'border-red-300 bg-red-50'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
        >
            <div className="text-center">
                <div className={`text-2xl ${isHovered ? 'text-red-600' : 'text-red-400'}`}>
                    🗑️
                </div>
                <div className={`text-xs font-medium ${isHovered ? 'text-red-600' : 'text-red-400'}`}>
                    Drop to Delete
                </div>
            </div>
        </div>
    )
}

// Quick Add Form Component
function QuickAddForm({ 
    position, 
    onSubmit, 
    onCancel 
}: { 
    position: [number, number]
    onSubmit: (data: { name: string; type: LocationType; description?: string; image?: string }) => void
    onCancel: () => void 
}) {
    const [name, setName] = useState('')
    const [type, setType] = useState<LocationType>('SCHOOL')
    const [description, setDescription] = useState('')
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const [uploading, setUploading] = useState(false)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                alert('Please select a valid image file (JPEG, PNG, GIF, etc.)')
                e.target.value = '' // Clear the input
                return
            }
            
            // Validate file size (max 5MB)
            const maxSize = 5 * 1024 * 1024 // 5MB
            if (file.size > maxSize) {
                alert('File size must be less than 5MB')
                e.target.value = '' // Clear the input
                return
            }
            
            setSelectedFile(file)
            // Create preview
            const reader = new FileReader()
            reader.onload = (e) => {
                setImagePreview(e.target?.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const uploadImage = async (): Promise<string | null> => {
        if (!selectedFile) return null

        setUploading(true)
        try {
            const formData = new FormData()
            formData.append('file', selectedFile)

            const response = await fetch('/api/upload/location-image', {
                method: 'POST',
                body: formData,
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Failed to upload image')
            }

            const result = await response.json()
            if (!result.url) {
                throw new Error('No URL returned from upload')
            }
            
            return result.url
        } catch (error) {
            console.error('Error uploading image:', error)
            const errorMessage = error instanceof Error ? error.message : 'Failed to upload image'
            alert(`Failed to upload image: ${errorMessage}`)
            return null
        } finally {
            setUploading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        // Validate required fields
        const errors: string[] = []
        
        if (!name.trim()) {
            errors.push('Location name is required')
        } else if (name.trim().length < 3) {
            errors.push('Location name must be at least 3 characters long')
        } else if (name.trim().length > 100) {
            errors.push('Location name must be less than 100 characters')
        }
        
        if (!type) {
            errors.push('Location type is required')
        }
        
        if (description && description.trim().length > 500) {
            errors.push('Description must be less than 500 characters')
        }
        
        if (errors.length > 0) {
            alert(`Please fix the following errors:\n${errors.join('\n')}`)
            return
        }

        let imageUrl = null
        if (selectedFile) {
            imageUrl = await uploadImage()
        }
        
        onSubmit({
            name: name.trim(),
            type,
            description: description.trim() || undefined,
            image: imageUrl || undefined
        })
    }

    return (
        <>
            {/* Backdrop for mobile */}
            <div className="fixed inset-0 bg-black/20 z-40 sm:hidden" onClick={onCancel} />
            
            {/* Responsive Form Container */}
            <div className="fixed inset-x-2 top-4 z-50 sm:absolute sm:top-4 sm:left-4 sm:inset-x-auto bg-white rounded-lg shadow-lg border p-3 sm:p-4 w-auto sm:min-w-[280px] sm:max-w-[320px] max-h-[calc(100vh-2rem)] overflow-y-auto">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-sm sm:text-base">Add Location</h3>
                    <button
                        type="button"
                        onClick={onCancel}
                        className="sm:hidden p-1 text-gray-400 hover:text-gray-600"
                        aria-label="Close"
                    >
                        ✕
                    </button>
                </div>
                
                <p className="text-xs text-gray-500 mb-3 break-all">
                Coordinates: {position[0].toFixed(6)}, {position[1].toFixed(6)}
            </p>
            
            <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                        <label className="block text-xs sm:text-sm font-medium mb-1">Name *</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter location name"
                            className="w-full px-2 py-1.5 sm:py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                        autoFocus
                    />
                </div>

                <div>
                        <label className="block text-xs sm:text-sm font-medium mb-1">Type *</label>
                    <select
                        value={type}
                        onChange={(e) => setType(e.target.value as LocationType)}
                            className="w-full px-2 py-1.5 sm:py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="SCHOOL">School</option>
                        <option value="GOVERNMENT">Government</option>
                        <option value="HEALTH">Health Center</option>
                        <option value="COMMERCIAL">Commercial</option>
                        <option value="SPORTS">Sports Facility</option>
                        <option value="RELIGIOUS">Religious</option>
                        <option value="EMERGENCY">Emergency Service</option>
                        <option value="RESIDENTIAL">Residential</option>
                        <option value="RECREATION">Recreation</option>
                    </select>
                </div>

                <div>
                        <label className="block text-xs sm:text-sm font-medium mb-1">Description</label>
                    <input
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Optional description"
                            className="w-full px-2 py-1.5 sm:py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div>
                        <label className="block text-xs sm:text-sm font-medium mb-1">Image</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                            className="w-full px-2 py-1.5 sm:py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {imagePreview && (
                        <div className="mt-2">
                            <img
                                src={imagePreview}
                                alt="Preview"
                                    className="w-full h-16 sm:h-20 object-cover rounded border"
                            />
                        </div>
                    )}
                </div>

                    <div className="flex flex-col sm:flex-row gap-2 pt-2">
                    <button
                        type="submit"
                        disabled={uploading}
                            className="flex-1 px-3 py-2 sm:py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
                    >
                            {uploading ? 'Uploading...' : 'Add Location'}
                    </button>
                    <button
                        type="button"
                        onClick={onCancel}
                            className="hidden sm:block px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
        </>
    )
}

// Modern custom icons with category-specific symbols and event indicator
const createModernIcon = (color: string, iconPath: string, hasEvents: boolean = false) => new Icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(`
        <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                    <feDropShadow dx="1" dy="2" stdDeviation="2" flood-color="#000000" flood-opacity="0.3"/>
                </filter>
                ${hasEvents ? `
                <animate id="blink" attributeName="opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite"/>
                ` : ''}
            </defs>
            <circle cx="16" cy="16" r="15" fill="${color}" stroke="white" stroke-width="2" filter="url(#shadow)"/>
            <g transform="translate(16, 16)">
                ${iconPath}
            </g>
            ${hasEvents ? `
            <circle cx="24" cy="8" r="6" fill="#ef4444" stroke="white" stroke-width="2">
                <animate attributeName="opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite"/>
            </circle>
            <text x="24" y="10" text-anchor="middle" fill="white" font-size="8" font-weight="bold">!</text>
            ` : ''}
        </svg>
    `)}`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
})

// Icon paths for different categories
const getIconPath = (type: string) => {
    switch (type) {
        case 'school':
            return `<path d="M-6 -8 L6 -8 L6 6 L-6 6 Z M-4 -6 L4 -6 L4 4 L-4 4 Z M-2 -4 L2 -4 M-2 -2 L2 -2 M-2 0 L2 0 M-2 2 L2 2" stroke="white" stroke-width="1.5" fill="none"/>`;
        case 'government':
            return `<path d="M-8 6 L8 6 L8 4 L-8 4 Z M-6 4 L-6 -2 L6 -2 L6 4 M-4 -2 L-4 -6 L4 -6 L4 -2 M-2 -6 L-2 -8 L2 -8 L2 -6" stroke="white" stroke-width="1.5" fill="none"/>`;
        case 'health':
            return `<path d="M-2 -8 L2 -8 L2 -2 L8 -2 L8 2 L2 2 L2 8 L-2 8 L-2 2 L-8 2 L-8 -2 L-2 -2 Z" fill="white"/>`;
        case 'commercial':
            return `<path d="M-8 6 L8 6 L8 -6 L-8 -6 Z M-6 4 L6 4 L6 -4 L-6 -4 Z M-4 2 L4 2 M-4 0 L4 0 M-4 -2 L4 -2" stroke="white" stroke-width="1.5" fill="none"/>`;
        case 'sports':
            return `<circle cx="0" cy="0" r="7" stroke="white" stroke-width="1.5" fill="none"/><path d="M-7 0 Q0 -7 7 0 Q0 7 -7 0" stroke="white" stroke-width="1.5" fill="none"/>`;
        case 'religious':
            return `<path d="M0 -8 L0 8 M-6 -2 L6 -2" stroke="white" stroke-width="2"/>`;
        case 'emergency':
            return `<path d="M-1 -8 L1 -8 L1 -1 L8 -1 L8 1 L1 1 L1 8 L-1 8 L-1 1 L-8 1 L-8 -1 L-1 -1 Z" fill="white"/>`;
        case 'residential':
            return `<path d="M-8 6 L8 6 L8 0 L0 -8 L-8 0 Z M-4 6 L-4 2 L4 2 L4 6 M0 6 L0 2" stroke="white" stroke-width="1.5" fill="none"/>`;
        case 'recreation':
            return `<path d="M-8 -8 L8 -8 L8 8 L-8 8 Z M-6 -6 L6 -6 L6 6 L-6 6 Z" stroke="white" stroke-width="1.5" fill="none"/><circle cx="0" cy="0" r="3" fill="white"/>`;
        case 'gymnasium':
            return `<path d="M-8 6 L8 6 L8 -6 L-8 -6 Z M-6 4 L6 4 L6 -4 L-6 -4 Z M-3 1 L3 1 L3 -1 L-3 -1 Z" stroke="white" stroke-width="1.5" fill="none"/>`;
        default:
            return `<circle cx="0" cy="0" r="4" fill="white"/>`;
    }
}

const getIconByType = (type: string, hasEvents: boolean = false) => {
    switch (type) {
        case 'school': return createModernIcon('#3B82F6', getIconPath('school'), hasEvents) // Blue - Book/School
        case 'government': return createModernIcon('#DC2626', getIconPath('government'), hasEvents) // Red - Building
        case 'health': return createModernIcon('#059669', getIconPath('health'), hasEvents) // Green - Medical Cross
        case 'commercial': return createModernIcon('#7C3AED', getIconPath('commercial'), hasEvents) // Purple - Store
        case 'sports': return createModernIcon('#EA580C', getIconPath('sports'), hasEvents) // Orange - Ball
        case 'religious': return createModernIcon('#EAB308', getIconPath('religious'), hasEvents) // Yellow - Cross
        case 'emergency': return createModernIcon('#EF4444', getIconPath('emergency'), hasEvents) // Red - Emergency Cross
        case 'residential': return createModernIcon('#6B7280', getIconPath('residential'), hasEvents) // Gray - House
        case 'recreation': return createModernIcon('#06B6D4', getIconPath('recreation'), hasEvents) // Cyan - Park
        case 'gymnasium': return createModernIcon('#4F46E5', getIconPath('gymnasium'), hasEvents) // Indigo - Gym
        default: return createModernIcon('#6B7280', getIconPath('default'), hasEvents) // Gray - Dot
    }
}

// Modern temporary marker for new location
const tempMarkerIcon = new Icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(`
        <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                    <feDropShadow dx="1" dy="2" stdDeviation="2" flood-color="#000000" flood-opacity="0.3"/>
                </filter>
            </defs>
            <circle cx="16" cy="16" r="15" fill="#10B981" stroke="white" stroke-width="3" stroke-dasharray="5,3" filter="url(#shadow)"/>
            <g transform="translate(16, 16)">
                <path d="M-6 0 L6 0 M0 -6 L0 6" stroke="white" stroke-width="3" stroke-linecap="round"/>
            </g>
        </svg>
    `)}`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
})

// Event marker icons
const createEventIcon = (status: string) => new Icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(`
        <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                    <feDropShadow dx="1" dy="2" stdDeviation="2" flood-color="#000000" flood-opacity="0.3"/>
                </filter>
            </defs>
            <circle cx="16" cy="16" r="15" fill="${status === 'ACTIVE' ? '#EF4444' : status === 'COMPLETED' ? '#10B981' : status === 'CANCELLED' ? '#6B7280' : '#F59E0B'}" stroke="white" stroke-width="2" filter="url(#shadow)"/>
            <g transform="translate(16, 16)">
                <path d="M-6 -4 L6 -4 L6 4 L-6 4 Z M-4 -2 L4 -2 L4 2 L-4 2 Z" stroke="white" stroke-width="1.5" fill="none"/>
                <path d="M-2 -6 L2 -6 L2 -4 L-2 -4 Z" stroke="white" stroke-width="1.5" fill="none"/>
            </g>
        </svg>
    `)}`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
})

const getEventIcon = (status: string) => createEventIcon(status)

const InteractiveMap = forwardRef<{ refreshLocations: () => void }, {}>((props, ref) => {
    const [locations, setLocations] = useState<Location[]>([])
    const [youthProfiles, setYouthProfiles] = useState<any[]>([])
    const [events, setEvents] = useState<Event[]>([])
    const [editMode, setEditMode] = useState(false)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [showAddLocationForm, setShowAddLocationForm] = useState(false)
    const [newLocationPosition, setNewLocationPosition] = useState<[number, number] | null>(null)
    const [tempMarker, setTempMarker] = useState<[number, number] | null>(null)
    const [showTrashZone, setShowTrashZone] = useState(false)
    const [draggedLocation, setDraggedLocation] = useState<Location | null>(null)
    const [isPopupOpen, setIsPopupOpen] = useState(false)
    const [userLocation, setUserLocation] = useState<[number, number] | null>(null)
    const [selectedDestination, setSelectedDestination] = useState<Location | null>(null)
    const [showRoute, setShowRoute] = useState(false)
    const [routeInfo, setRouteInfo] = useState<{
        walkingTime: string
        drivingTime: string
        distance: string
        routePath: [number, number][]
    } | null>(null)
    const [isLoadingRoute, setIsLoadingRoute] = useState(false)
    const [isLoadingLocation, setIsLoadingLocation] = useState(false)
    const [locationAccuracy, setLocationAccuracy] = useState<number | null>(null)
    const [locationError, setLocationError] = useState<string | null>(null)
    const [isSelectingLocation, setIsSelectingLocation] = useState(false)
    
    // Validation states
    const [validationErrors, setValidationErrors] = useState<{
        locationName?: string
        locationType?: string
        locationDescription?: string
        locationImage?: string
        routeCalculation?: string
    }>({})
    const [showValidationModal, setShowValidationModal] = useState(false)
    const [validationMessage, setValidationMessage] = useState('')
    const [modalType, setModalType] = useState<'error' | 'success' | 'info'>('error')
    const [showConfirmModal, setShowConfirmModal] = useState(false)
    const [confirmMessage, setConfirmMessage] = useState('')
    const [confirmCallback, setConfirmCallback] = useState<(() => void) | null>(null)
    

    
    const mapRef = useRef<any>(null)
    
    // Fix for default icon paths in Next.js
    useEffect(() => {
        const defaultIcon = new Icon({
            iconUrl: '/images/marker-icon.png',
            shadowUrl: '/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41],
        })

        // Set the default icon for all markers
        if (typeof window !== 'undefined' && window.L) {
            window.L.Marker.prototype.options.icon = defaultIcon
        }
    }, [])

    // Function to set map reference
    const setMapRef = (map: any) => {
        mapRef.current = map
    }
    
    // Custom center coordinates for Casiguran, Sorsogon
    const position: [number, number] = [12.873131, 124.005867]
    
    // Load locations and events from database
    useEffect(() => {
        loadLocations()
        loadEvents()
        loadYouthProfiles()
    }, [])

    // Load youth profiles
    const loadYouthProfiles = async () => {
        try {
            const response = await fetch('/api/youth')
            if (!response.ok) {
                throw new Error('Failed to fetch youth profiles')
            }
            const data = await response.json()
            // Filter only youth profiles with coordinates
            const profilesWithCoordinates = data.filter((profile: any) => 
                profile.latitude && profile.longitude
            )
            setYouthProfiles(profilesWithCoordinates)
        } catch (err) {
            console.error('Failed to load youth profiles:', err)
            setYouthProfiles([])
        }
    }

    // Create youth member icon (using residential style)
    const createYouthIcon = () => new Icon({
        iconUrl: `data:image/svg+xml;base64,${btoa(`
            <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                        <feDropShadow dx="1" dy="2" stdDeviation="2" flood-color="#000000" flood-opacity="0.3"/>
                    </filter>
                </defs>
                <circle cx="16" cy="16" r="15" fill="#6B7280" stroke="white" stroke-width="2" filter="url(#shadow)"/>
                <g transform="translate(16, 16)">
                    <path d="M-8 6 L8 6 L8 0 L0 -8 L-8 0 Z M-4 6 L-4 2 L4 2 L4 6 M0 6 L0 2" stroke="white" stroke-width="1.5" fill="none"/>
                </g>
            </svg>
        `)}`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -16],
    })

    const youthIcon = createYouthIcon()

    // Expose refresh function to parent component
    useImperativeHandle(ref, () => ({
        refreshLocations: () => {
            loadLocations()
            loadYouthProfiles()
        }
    }))

    // Match events with locations based on venue name
    const getEventsForLocation = (locationName: string) => {
        return events.filter(event => event.venue === locationName)
    }

    // Format date for display
    const formatEventDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    // Create a simple route path with intermediate points
    const createSimpleRoutePath = (start: [number, number], end: [number, number]): [number, number][] => {
        const path: [number, number][] = [start]
        
        // Add intermediate points for smoother visualization
        const steps = 10
        for (let i = 1; i < steps; i++) {
            const lat = start[0] + (end[0] - start[0]) * (i / steps)
            const lng = start[1] + (end[1] - start[1]) * (i / steps)
            path.push([lat, lng])
        }
        
        path.push(end)
        return path
    }

    // Get user's current location with enhanced options
    const getUserLocation = () => {
        if (navigator.geolocation) {
            setIsLoadingLocation(true)
            setLocationError(null)
            
            const options = {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 60000 // 1 minute cache
            }
            
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude, accuracy } = position.coords
                    setUserLocation([latitude, longitude])
                    setLocationAccuracy(accuracy)
                    setIsLoadingLocation(false)
                    
                    // Auto-center map to user location
                    if (mapRef.current) {
                        mapRef.current.setView([latitude, longitude], 15)
                    }
                },
                (error) => {
                    console.error('Error getting location:', error)
                    setIsLoadingLocation(false)
                    
                    let errorMessage = 'Unable to get your location.'
                    switch (error.code) {
                        case error.PERMISSION_DENIED:
                            errorMessage = 'Location access denied. Please enable location services in your browser.'
                            break
                        case error.POSITION_UNAVAILABLE:
                            errorMessage = 'Location information unavailable. Please try again.'
                            break
                        case error.TIMEOUT:
                            errorMessage = 'Location request timed out. Please try again.'
                            break
                    }
                    
                    setLocationError(errorMessage)
                    showValidationError(errorMessage)
                },
                options
            )
        } else {
            setLocationError('Geolocation is not supported by this browser.')
            showValidationError('Geolocation is not supported by this browser.')
        }
    }

    // Watch user's location for real-time updates
    const startLocationWatching = () => {
        if (navigator.geolocation) {
            const options = {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 30000 // 30 seconds cache
            }
            
            return navigator.geolocation.watchPosition(
                (position) => {
                    const { latitude, longitude, accuracy } = position.coords
                    setUserLocation([latitude, longitude])
                    setLocationAccuracy(accuracy)
                },
                (error) => {
                    console.error('Error watching location:', error)
                },
                options
            )
        }
        return null
    }

    // Handle manual location selection
    const startLocationSelection = () => {
        setIsSelectingLocation(true)
        setLocationError(null)
        clearValidationErrors()
        
        // Show custom instruction modal
        showInfoMessage('Click anywhere on the map to set your location. Click the "Cancel Selection" button to cancel.')
    }

    // Handle map click for location selection
    const handleMapClickForLocation = (e: any) => {
        if (isSelectingLocation) {
            const { lat, lng } = e.latlng
            setUserLocation([lat, lng])
            setLocationAccuracy(null) // Manual selection has no accuracy info
            setIsSelectingLocation(false)
            
            // Auto-center map to selected location
            if (mapRef.current) {
                mapRef.current.setView([lat, lng], 15)
            }
        }
    }

    // Cancel location selection
    const cancelLocationSelection = () => {
        setIsSelectingLocation(false)
        setLocationError(null)
        setValidationErrors({})
    }

    // Validation functions
    const validateLocationData = (data: { name: string; type: LocationType; description?: string; image?: string }) => {
        const errors: typeof validationErrors = {}
        
        // Validate name
        if (!data.name || data.name.trim().length === 0) {
            errors.locationName = 'Location name is required'
        } else if (data.name.trim().length < 3) {
            errors.locationName = 'Location name must be at least 3 characters long'
        } else if (data.name.trim().length > 100) {
            errors.locationName = 'Location name must be less than 100 characters'
        }
        
        // Validate type
        if (!data.type) {
            errors.locationType = 'Location type is required'
        }
        
        // Validate description (optional but if provided, check length)
        if (data.description && data.description.trim().length > 500) {
            errors.locationDescription = 'Description must be less than 500 characters'
        }
        
        // Validate image (optional but if provided, check format)
        if (data.image && !data.image.startsWith('data:image/') && !data.image.startsWith('http') && !data.image.startsWith('/uploads/')) {
            errors.locationImage = 'Invalid image format'
        }
        
        setValidationErrors(errors)
        return Object.keys(errors).length === 0
    }

    const showValidationError = (message: string) => {
        setValidationMessage(message)
        setModalType('error')
        setShowValidationModal(true)
    }

    const showSuccessMessage = (message: string) => {
        setValidationMessage(message)
        setModalType('success')
        setShowValidationModal(true)
    }

    const showInfoMessage = (message: string) => {
        setValidationMessage(message)
        setModalType('info')
        setShowValidationModal(true)
    }

    const clearValidationErrors = () => {
        setValidationErrors({})
        setShowValidationModal(false)
        setValidationMessage('')
    }

    const showConfirmDialog = (message: string, callback: () => void) => {
        setConfirmMessage(message)
        setConfirmCallback(() => callback)
        setShowConfirmModal(true)
    }

    const handleConfirm = () => {
        if (confirmCallback) {
            confirmCallback()
        }
        setShowConfirmModal(false)
        setConfirmCallback(null)
    }

    const handleCancel = () => {
        setShowConfirmModal(false)
        setConfirmCallback(null)
    }

    // Calculate route between two points using real road routing
    const calculateRoute = async (start: [number, number], end: [number, number]) => {
        setIsLoadingRoute(true)
        try {
            // Using OpenStreetMap Routing API (OSRM) for real road routing
            const response = await fetch(`https://router.project-osrm.org/route/v1/driving/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=geojson&steps=true`)
            
            if (response.ok) {
                const data = await response.json()
                if (data.routes && data.routes.length > 0) {
                    const route = data.routes[0]
                    const distance = (route.distance / 1000).toFixed(1) // km
                    const drivingTime = Math.round(route.duration / 60) // minutes
                    
                    // Estimate walking time (3x slower than driving)
                    const walkingTime = Math.round(drivingTime * 3)
                    
                    // Extract route path coordinates from the geometry
                    const routePath = route.geometry.coordinates.map((coord: number[]) => [coord[1], coord[0]]) // Convert to [lat, lng]
                    
                    setRouteInfo({
                        walkingTime: `${walkingTime} min`,
                        drivingTime: `${drivingTime} min`,
                        distance: `${distance} km`,
                        routePath
                    })
                } else {
                    throw new Error('No route found')
                }
            } else {
                throw new Error('Failed to fetch route')
            }
        } catch (error) {
            console.error('Error calculating route:', error)
            
            // Try alternative routing service (GraphHopper)
            // Note: Replace YOUR_GRAPHHOPPER_KEY with actual GraphHopper API key
            try {
                const graphHopperResponse = await fetch(`https://graphhopper.com/api/1/route?point=${start[0]},${start[1]}&point=${end[0]},${end[1]}&vehicle=car&key=YOUR_GRAPHHOPPER_KEY&instructions=false&calc_points=true&points_encoded=false`)
                
                if (graphHopperResponse.ok) {
                    const graphHopperData = await graphHopperResponse.json()
                    if (graphHopperData.paths && graphHopperData.paths.length > 0) {
                        const path = graphHopperData.paths[0]
                        const distance = (path.distance / 1000).toFixed(1) // km
                        const drivingTime = Math.round(path.time / 60000) // milliseconds to minutes
                        const walkingTime = Math.round(drivingTime * 3)
                        
                        // Extract route path coordinates
                        const routePath: [number, number][] = path.points.coordinates.map((coord: number[]) => [coord[1], coord[0]] as [number, number])
                        
                        setRouteInfo({
                            walkingTime: `${walkingTime} min`,
                            drivingTime: `${drivingTime} min`,
                            distance: `${distance} km`,
                            routePath
                        })
                        return
                    }
                }
            } catch (graphHopperError) {
                console.error('GraphHopper routing failed:', graphHopperError)
            }
            
            // Final fallback: Use Google Maps Directions API (requires API key)
            try {
                const googleResponse = await fetch(`https://maps.googleapis.com/maps/api/directions/json?origin=${start[0]},${start[1]}&destination=${end[0]},${end[1]}&key=YOUR_GOOGLE_API_KEY`)
                
                if (googleResponse.ok) {
                    const googleData = await googleResponse.json()
                    if (googleData.routes && googleData.routes.length > 0) {
                        const route = googleData.routes[0]
                        const leg = route.legs[0]
                        const distance = (leg.distance.value / 1000).toFixed(1) // meters to km
                        const drivingTime = Math.round(leg.duration.value / 60) // seconds to minutes
                        const walkingTime = Math.round(drivingTime * 3)
                        
                        // Extract route path from Google's polyline
                        const routePath: [number, number][] = decodePolyline(route.overview_polyline.points).map((coord: [number, number]) => [coord[0], coord[1]] as [number, number])
                        
                        setRouteInfo({
                            walkingTime: `${walkingTime} min`,
                            drivingTime: `${drivingTime} min`,
                            distance: `${distance} km`,
                            routePath
                        })
                        return
                    }
                }
            } catch (googleError) {
                console.error('Google Maps routing failed:', googleError)
            }
            
            // Ultimate fallback: Simple straight line with better estimation
            const distance = calculateDistance(start, end)
            const drivingTime = Math.round(distance * 2.5) // More realistic: 24 km/h average
            const walkingTime = Math.round(drivingTime * 3)
            
            // Create a more realistic route path with road-like curves
            const routePath: [number, number][] = createRoadLikePath(start, end)
            
            setRouteInfo({
                walkingTime: `${walkingTime} min`,
                drivingTime: `${drivingTime} min`,
                distance: `${distance.toFixed(1)} km`,
                routePath
            })
        } finally {
            setIsLoadingRoute(false)
        }
    }

    // Decode Google Maps polyline
    const decodePolyline = (encoded: string): [number, number][] => {
        const poly: [number, number][] = []
        let index = 0, len = encoded.length
        let lat = 0, lng = 0

        while (index < len) {
            let shift = 0, result = 0

            do {
                const b = encoded.charCodeAt(index++) - 63
                result |= (b & 0x1f) << shift
                shift += 5
            } while (result >= 0x20)

            const dlat = ((result & 1) ? ~(result >> 1) : (result >> 1))
            lat += dlat

            shift = 0
            result = 0

            do {
                const b = encoded.charCodeAt(index++) - 63
                result |= (b & 0x1f) << shift
                shift += 5
            } while (result >= 0x20)

            const dlng = ((result & 1) ? ~(result >> 1) : (result >> 1))
            lng += dlng

            poly.push([lat / 1E5, lng / 1E5])
        }

        return poly
    }

    // Create a more realistic road-like path
    const createRoadLikePath = (start: [number, number], end: [number, number]): [number, number][] => {
        const path: [number, number][] = [start]
        
        // Calculate midpoint with some offset to simulate road curves
        const midLat = (start[0] + end[0]) / 2
        const midLng = (start[1] + end[1]) / 2
        
        // Add some realistic road curves by creating intermediate points
        const steps = 15
        for (let i = 1; i < steps; i++) {
            const t = i / steps
            const lat = start[0] + (end[0] - start[0]) * t
            const lng = start[1] + (end[1] - start[1]) * t
            
            // Add some road-like curves (slight offset)
            const curveOffset = Math.sin(t * Math.PI) * 0.0001
            path.push([lat + curveOffset, lng + curveOffset] as [number, number])
        }
        
        path.push(end)
        return path
    }

    // Calculate distance between two points (Haversine formula)
    const calculateDistance = (start: [number, number], end: [number, number]) => {
        const R = 6371 // Earth's radius in km
        const dLat = (end[0] - start[0]) * Math.PI / 180
        const dLon = (end[1] - start[1]) * Math.PI / 180
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(start[0] * Math.PI / 180) * Math.cos(end[0] * Math.PI / 180) *
                  Math.sin(dLon/2) * Math.sin(dLon/2)
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
        return R * c
    }

    // Handle destination selection
    const handleDestinationSelect = (location: Location) => {
        setSelectedDestination(location)
        if (userLocation) {
            calculateRoute(userLocation, [location.latitude, location.longitude])
        }
    }

    // Handle popup positioning to ensure it stays within viewport
    const handlePopupOpen = (e: any) => {
        const popup = e.popup
        if (popup) {
            // Ensure popup content doesn't exceed viewport
            const content = popup.getElement()
            if (content) {
                const contentWrapper = content.querySelector('.leaflet-popup-content-wrapper')
                if (contentWrapper) {
                    contentWrapper.style.maxHeight = '350px'
                    contentWrapper.style.overflow = 'hidden'
                }
                
                // Force the popup to stay within viewport bounds
                setTimeout(() => {
                    const popupElement = content.closest('.leaflet-popup')
                    if (popupElement) {
                        const rect = popupElement.getBoundingClientRect()
                        const viewportHeight = window.innerHeight
                        const viewportWidth = window.innerWidth
                        
                        // Adjust padding based on screen size
                        const padding = viewportWidth <= 320 ? 10 : 20
                        
                        // Adjust if popup goes below viewport
                        if (rect.bottom > viewportHeight - padding) {
                            popupElement.style.top = `${viewportHeight - rect.height - padding}px`
                        }
                        
                        // Adjust if popup goes above viewport
                        if (rect.top < padding) {
                            popupElement.style.top = `${padding}px`
                        }
                        
                        // Adjust if popup goes right of viewport
                        if (rect.right > viewportWidth - padding) {
                            popupElement.style.left = `${viewportWidth - rect.width - padding}px`
                        }
                        
                        // Adjust if popup goes left of viewport
                        if (rect.left < padding) {
                            popupElement.style.left = `${padding}px`
                        }
                    }
                }, 100)
            }
        }
    }

    const loadLocations = async () => {
        try {
            setLoading(true)
            const dbLocations = await getLocations()
            setLocations(dbLocations)
            setError(null)
        } catch (err) {
            setError('Failed to load locations')
            // Fallback to static data
            setLocations(barangayLocations as any)
        } finally {
            setLoading(false)
        }
    }

    const loadEvents = async () => {
        try {
            const response = await fetch('/api/events')
            if (!response.ok) {
                throw new Error('Failed to fetch events')
            }
            const data = await response.json()
            setEvents(data.events || [])
        } catch (err) {
            console.error('Failed to load events:', err)
            setEvents([])
        }
    }

    // Handle marker drag start
    const handleMarkerDragStart = (location: Location) => {
        setDraggedLocation(location)
        setShowTrashZone(true)
    }

    // Handle marker drag end
    const handleMarkerDragEnd = async (id: string, newPosition: [number, number]) => {
        setShowTrashZone(false)
        setDraggedLocation(null)

        try {
            const updatedLocation = await updateLocation(id, {
                latitude: newPosition[0],
                longitude: newPosition[1]
            })
            
            setLocations(prev => prev.map(location => 
                location.id === id 
                    ? { ...location, latitude: newPosition[0], longitude: newPosition[1] }
                    : location
            ))
        } catch (error) {
            console.error('Failed to update location:', error)
            showValidationError('Failed to save location changes')
        }
    }

    // Handle delete via drag to trash zone
    const handleDeleteDrag = async (location: Location) => {
        showConfirmDialog(`Delete "${location.name}"?`, async () => {
        try {
            await deleteLocation(location.id)
            setLocations(prev => prev.filter(loc => loc.id !== location.id))
            setShowTrashZone(false)
            setDraggedLocation(null)
        } catch (error) {
            console.error('Failed to delete location:', error)
                showValidationError('Failed to delete location')
            }
        })
            return false
    }
    
    // Copy coordinates to clipboard
    const copyCoordinates = (position: [number, number]) => {
        navigator.clipboard.writeText(`[${position[0]}, ${position[1]}]`)
        showSuccessMessage(`Coordinates copied: [${position[0]}, ${position[1]}]`)
    }

    // Handle map right-click to add location
    const handleMapRightClick = (e: any) => {
        const { lat, lng } = e.latlng
        setNewLocationPosition([lat, lng])
        setTempMarker([lat, lng])
        setShowAddLocationForm(true)
    }

    // Quick add location
    const handleQuickAddLocation = async (formData: { name: string; type: LocationType; description?: string; image?: string }) => {
        // Clear previous validation errors
        clearValidationErrors()
        
        // Validate form data
        if (!validateLocationData(formData)) {
            const errorMessages = Object.values(validationErrors).filter(Boolean)
            showValidationError(`Please fix the following errors:\n${errorMessages.join('\n')}`)
            return
        }
        
        // Validate position
        if (!newLocationPosition) {
            showValidationError('Location position is required. Please click on the map to set a position.')
            return
        }

        try {
            await createLocation({
                name: formData.name.trim(),
                description: formData.description?.trim() || '',
                latitude: newLocationPosition[0],
                longitude: newLocationPosition[1],
                type: formData.type,
                image: formData.image || undefined
            })

            // Refresh locations
            loadLocations()
            
            // Reset form state
            setShowAddLocationForm(false)
            setNewLocationPosition(null)
            setTempMarker(null)
            
            // Show success message
            showSuccessMessage('Location created successfully!')
        } catch (error: any) {
            console.error('Failed to add location:', error)
            const errorMessage = error.message || 'Unknown error occurred'
            showValidationError(`Failed to create location: ${errorMessage}`)
        }
    }

    // Cancel adding location
    const handleCancelAdd = () => {
        setShowAddLocationForm(false)
        setNewLocationPosition(null)
        setTempMarker(null)
    }

    if (typeof window === 'undefined') {
        return <div className="h-full w-full flex items-center justify-center bg-gray-100">Loading map...</div>
    }

    if (loading) {
        return <div className="h-full w-full flex items-center justify-center bg-gray-100">Loading locations...</div>
    }

    if (error) {
        return (
            <div className="h-full w-full flex flex-col items-center justify-center bg-gray-100">
                <p className="text-red-600 mb-2">{error}</p>
                <button 
                    onClick={loadLocations}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    Retry
                </button>
            </div>
        )
    }

    return (
        <div className="relative">
            <style jsx>{`
                .event-tooltip {
                    background: rgba(0, 0, 0, 0.8) !important;
                    color: white !important;
                    border: none !important;
                    border-radius: 6px !important;
                    padding: 8px 12px !important;
                    font-size: 12px !important;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3) !important;
                }
                .event-tooltip::before {
                    border-top-color: rgba(0, 0, 0, 0.8) !important;
                }
                
                .custom-popup {
                    max-width: 260px !important;
                    max-height: 300px !important;
                }
                
                .custom-popup .leaflet-popup-content-wrapper {
                    max-height: 300px !important;
                    overflow: hidden !important;
                }
                
                .custom-popup .leaflet-popup-content {
                    margin: 6px !important;
                    max-height: 280px !important;
                    overflow-y: auto !important;
                    word-wrap: break-word !important;
                }
                

                
                .custom-popup .leaflet-popup-tip {
                    background: white !important;
                }
                
                /* Ensure popup stays within viewport */
                .custom-popup {
                    position: absolute !important;
                    z-index: 1000 !important;
                }
                
                /* Responsive adjustments for small screens */
                @media (max-width: 640px) {
                    .custom-popup {
                        max-width: 240px !important;
                        max-height: 300px !important;
                    }
                    .custom-popup .leaflet-popup-content {
                        max-width: 220px !important;
                        max-height: 270px !important;
                    }
                }
                
                /* Extra small screens */
                @media (max-width: 480px) {
                    .custom-popup {
                        max-width: 220px !important;
                        max-height: 280px !important;
                    }
                    .custom-popup .leaflet-popup-content {
                        max-width: 200px !important;
                        max-height: 250px !important;
                    }
                }
                
                /* Very small mobile screens */
                @media (max-width: 375px) {
                    .custom-popup {
                        max-width: 200px !important;
                        max-height: 260px !important;
                    }
                    .custom-popup .leaflet-popup-content {
                        max-width: 180px !important;
                        max-height: 230px !important;
                    }
                }
                
                /* iPhone SE and very small screens */
                @media (max-width: 320px) {
                    .custom-popup {
                        max-width: 180px !important;
                        max-height: 240px !important;
                    }
                    .custom-popup .leaflet-popup-content {
                        max-width: 160px !important;
                        max-height: 210px !important;
                    }
                }
                
                /* Completely hidden scrollbar styling */
                .custom-popup .leaflet-popup-content {
                    scrollbar-width: none !important;
                    -ms-overflow-style: none !important;
                }
                
                .custom-popup .leaflet-popup-content::-webkit-scrollbar {
                    width: 0 !important;
                    height: 0 !important;
                    background: transparent !important;
                }
                
                .custom-popup .leaflet-popup-content::-webkit-scrollbar-track {
                    background: transparent !important;
                    width: 0 !important;
                }
                
                .custom-popup .leaflet-popup-content::-webkit-scrollbar-thumb {
                    background: transparent !important;
                    width: 0 !important;
                }
                
                .custom-popup .leaflet-popup-content::-webkit-scrollbar-corner {
                    background: transparent !important;
                }
                
                /* Target the specific scrollable div */
                .custom-scrollable::-webkit-scrollbar {
                    width: 0 !important;
                    height: 0 !important;
                    background: transparent !important;
                }
                
                .custom-scrollable::-webkit-scrollbar-track {
                    background: transparent !important;
                    width: 0 !important;
                }
                
                .custom-scrollable::-webkit-scrollbar-thumb {
                    background: transparent !important;
                    width: 0 !important;
                }
                
                .custom-scrollable {
                    scrollbar-width: none !important;
                    -ms-overflow-style: none !important;
                }
                
                /* Force hide all scrollbars in the popup */
                .custom-popup *::-webkit-scrollbar {
                    width: 0 !important;
                    height: 0 !important;
                    background: transparent !important;
                    display: none !important;
                }
                
                .custom-popup *::-webkit-scrollbar-track {
                    display: none !important;
                    background: transparent !important;
                }
                
                .custom-popup *::-webkit-scrollbar-thumb {
                    display: none !important;
                    background: transparent !important;
                }
                
                .custom-popup *::-webkit-scrollbar-corner {
                    display: none !important;
                    background: transparent !important;
                }
            `}</style>
            {/* Instructions */}
            {!isPopupOpen && (
                <div className="absolute bottom-4 left-2 z-10 bg-white/90 rounded-lg px-2 py-1.5 text-xs text-gray-600 shadow-sm max-w-[180px] sm:max-w-[200px]">
                <div>💡 Right-click to add location</div>
                {editMode && (
                      <div className="mt-0.5">🗑️ Drag markers to trash to delete</div>
                  )}
                      {events.length > 0 && (
                          <div className="mt-0.5">📅 Hover markers to see events</div>
                      )}
                      {userLocation && (
                          <div className="mt-0.5">🗺️ Click "Get Route" in location popups</div>
                      )}
                      {isSelectingLocation && (
                          <div className="mt-0.5 text-yellow-700 font-medium">🎯 Click anywhere on the map to set your location</div>
                )}
            </div>
            )}

                        {/* Controls */}
            {!isPopupOpen && (
                <div className="absolute top-2 right-2 z-10 space-y-1 max-w-[100px] w-auto max-h-[calc(100vh-2rem)] overflow-y-auto sm:max-w-[220px] md:max-w-[260px] lg:max-w-[300px] md:right-4 lg:right-6 pb-2">
                <button
                    onClick={() => setEditMode(!editMode)}
                    className={`w-auto px-2 py-1.5 text-xs rounded font-medium transition-colors ${
                        editMode 
                            ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                            : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                    }`}
                    title={editMode ? 'Exit Edit Mode' : 'Edit Markers'}
                >
                    <span className="hidden sm:inline">{editMode ? 'Exit Edit' : 'Edit Markers'}</span>
                    <span className="sm:hidden text-xs">✏️</span>
                </button>
                    
                                        {/* Location Services */}
                    <div className="bg-white/90 rounded-lg p-1 text-xs shadow-sm">
                        <div className="font-medium mb-1.5 text-xs">📍 Location Services</div>
                        <div className="space-y-1">
                            <button
                                onClick={getUserLocation}
                                disabled={isLoadingLocation}
                                className={`w-auto px-2 py-1.5 rounded text-xs transition-colors ${
                                    isLoadingLocation 
                                        ? 'bg-gray-100 text-gray-500 cursor-not-allowed' 
                                        : userLocation 
                                            ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                                            : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                                }`}
                                title={isLoadingLocation ? 'Getting Location...' : userLocation ? 'My Location' : 'Get My Location'}
                            >
                                <span className="hidden sm:inline">{isLoadingLocation ? '📍 Getting...' : userLocation ? '📍 My Location' : '📍 Get Location'}</span>
                                <span className="sm:hidden text-xs">{isLoadingLocation ? '⏳' : userLocation ? '📍' : '📍'}</span>
                            </button>
                            
                            <button
                                onClick={startLocationSelection}
                                disabled={isSelectingLocation}
                                className={`w-auto px-2 py-1.5 rounded text-xs transition-colors ${
                                    isSelectingLocation 
                                        ? 'bg-yellow-100 text-yellow-700 cursor-not-allowed' 
                                        : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                                }`}
                                title={isSelectingLocation ? 'Selecting Location...' : 'Choose Location'}
                            >
                                <span className="hidden sm:inline">{isSelectingLocation ? '🎯 Selecting...' : '🎯 Choose'}</span>
                                <span className="sm:hidden text-xs">{isSelectingLocation ? '⏳' : '🎯'}</span>
                            </button>
                            
                            {isSelectingLocation && (
                                <button
                                    onClick={cancelLocationSelection}
                                    className="w-auto px-2 py-1.5 bg-red-100 text-red-700 rounded hover:bg-red-200 text-xs"
                                    title="Cancel Location Selection"
                                >
                                    <span className="hidden sm:inline">❌ Cancel</span>
                                    <span className="sm:hidden text-xs">❌</span>
                                </button>
                            )}
                            
                            {locationError && (
                                <div className="text-xs text-red-600 bg-red-50 p-1 rounded">
                                    ⚠️ {locationError}
            </div>
                            )}
                            
                            {userLocation && locationAccuracy && (
                                <div className="text-xs text-gray-600 bg-gray-50 p-1 rounded">
                                    📍 Accuracy: ±{Math.round(locationAccuracy)}m
                                </div>
                            )}
                            
                            {userLocation && !locationAccuracy && (
                                <div className="text-xs text-gray-600 bg-gray-50 p-1 rounded">
                                    <span className="hidden sm:inline">📍 Manual selection</span>
                                    <span className="sm:hidden text-xs">📍 Manual</span>
                                </div>
                            )}
                            
                            {userLocation && (
                                <button
                                    onClick={() => setShowRoute(!showRoute)}
                                    className="w-auto px-2 py-1.5 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-xs"
                                    title={showRoute ? 'Hide Routes' : 'Show Routes'}
                                >
                                    <span className="hidden sm:inline">{showRoute ? '🗺️ Hide' : '🗺️ Show'}</span>
                                    <span className="sm:hidden text-xs">{showRoute ? '🗺️' : '🗺️'}</span>
                                </button>
                            )}
                        </div>
                    </div>
                    
                    {/* Route Summary */}
                    {showRoute && routeInfo && selectedDestination && (
                        <div className="bg-white/90 rounded-lg p-2 text-xs shadow-sm">
                            <div className="font-medium mb-2 text-xs">🗺️ Route to {selectedDestination.name}</div>
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between gap-2">
                                    <span className="text-gray-600">🚶 Walking:</span>
                                    <span className="font-medium text-xs text-right">{routeInfo.walkingTime}</span>
                                </div>
                                <div className="flex items-center justify-between gap-2">
                                    <span className="text-gray-600">🚗 Driving:</span>
                                    <span className="font-medium text-xs text-right">{routeInfo.drivingTime}</span>
                                </div>
                                <div className="flex items-center justify-between gap-2">
                                    <span className="text-gray-600">📏 Distance:</span>
                                    <span className="font-medium text-xs text-right">{routeInfo.distance}</span>
                                </div>
                            </div>
                            <div className="mt-2 pt-2 border-t border-gray-200">
                                <div className="flex items-center gap-1 text-blue-600">
                                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                    <span className="text-xs">Route path shown on map</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Event Legend */}
                    {events.length > 0 && (
                        <div className="bg-white/90 rounded-lg p-1 text-xs shadow-sm">
                            <div className="font-medium mb-1.5 text-xs">Events:</div>
                            <div className="grid grid-cols-2 gap-1">
                                <div className="flex items-center gap-1" title="Planned Events">
                                    <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                                    <span className="text-xs">Plan</span>
                                </div>
                                <div className="flex items-center gap-1" title="Active Events">
                                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                    <span className="text-xs">Active</span>
                                </div>
                                <div className="flex items-center gap-1" title="Completed Events">
                                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                    <span className="text-xs">Done</span>
                                </div>
                                <div className="flex items-center gap-1" title="Cancelled Events">
                                    <div className="w-2 h-2 rounded-full bg-gray-500"></div>
                                    <span className="text-xs">Cancel</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Youth Member Legend */}
                    {youthProfiles.length > 0 && (
                        <div className="bg-white/90 rounded-lg p-1 text-xs shadow-sm">
                            <div className="font-medium mb-1.5 text-xs">Youth Members:</div>
                            <div className="flex items-center gap-1">
                                <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                                <span className="text-xs">Youth ({youthProfiles.length})</span>
                            </div>
                        </div>
                    )}

                </div>
            )}

            {/* Quick Add Form */}
            {showAddLocationForm && newLocationPosition && (
                <QuickAddForm
                    position={newLocationPosition}
                    onSubmit={handleQuickAddLocation}
                    onCancel={handleCancelAdd}
                />
            )}

            {/* Custom Modal */}
            {showValidationModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                modalType === 'error' ? 'bg-red-100' : 
                                modalType === 'success' ? 'bg-green-100' : 
                                'bg-blue-100'
                            }`}>
                                {modalType === 'error' && (
                                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                    </svg>
                                )}
                                {modalType === 'success' && (
                                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                )}
                                {modalType === 'info' && (
                                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                )}
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">
                                    {modalType === 'error' ? 'Validation Error' : 
                                     modalType === 'success' ? 'Success' : 
                                     'Information'}
                                </h3>
                                <p className="text-sm text-gray-600">
                                    {modalType === 'error' ? 'Please fix the following issues' : 
                                     modalType === 'success' ? 'Operation completed successfully' : 
                                     'Please follow the instructions below'}
                                </p>
                            </div>
                        </div>
                        
                        <div className={`rounded-lg p-4 mb-6 ${
                            modalType === 'error' ? 'bg-red-50 border border-red-200' : 
                            modalType === 'success' ? 'bg-green-50 border border-green-200' : 
                            'bg-blue-50 border border-blue-200'
                        }`}>
                            <div className={`text-sm whitespace-pre-line ${
                                modalType === 'error' ? 'text-red-800' : 
                                modalType === 'success' ? 'text-green-800' : 
                                'text-blue-800'
                            }`}>
                                {validationMessage}
                            </div>
                        </div>
                        
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowValidationModal(false)}
                                className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                                    modalType === 'error' ? 'bg-red-100 text-red-700 hover:bg-red-200' : 
                                    modalType === 'success' ? 'bg-green-100 text-green-700 hover:bg-green-200' : 
                                    'bg-blue-100 text-blue-700 hover:bg-blue-200'
                                }`}
                            >
                                OK
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirmation Modal */}
            {showConfirmModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Confirm Action</h3>
                                <p className="text-sm text-gray-600">Please confirm this action</p>
                            </div>
                        </div>
                        
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                            <div className="text-sm text-yellow-800">
                                {confirmMessage}
                            </div>
                        </div>
                        
                        <div className="flex gap-3">
                            <button
                                onClick={handleCancel}
                                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirm}
                                className="flex-1 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Trash Zone */}
            <TrashZone
                visible={showTrashZone && editMode}
                draggedLocation={draggedLocation}
                onDelete={handleDeleteDrag}
            />

            <MapContainer
                center={position}
                zoom={18}
                maxZoom={20}
                style={{ 
                    height: '100%', 
                    width: '100%', 
                    minHeight: '400px',
                    cursor: isSelectingLocation ? 'crosshair' : 'default'
                }}
                className="z-0 leaflet-container"
            >
                <PopupHandler setIsPopupOpen={setIsPopupOpen} setMapRef={setMapRef} />
                <MapEvents 
                    onRightClick={handleMapRightClick} 
                    onMapClick={handleMapClickForLocation}
                />
                
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    maxZoom={19}
                    tileSize={256}
                    zoomOffset={0}
                />

                {/* User location marker */}
                {userLocation && (
                    <Marker 
                        position={userLocation} 
                        icon={new Icon({
                            iconUrl: `data:image/svg+xml;base64,${btoa(`
                                <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="16" cy="16" r="15" fill="#10B981" stroke="white" stroke-width="2"/>
                                    <circle cx="16" cy="16" r="6" fill="white"/>
                                    <circle cx="16" cy="16" r="3" fill="#10B981"/>
                                </svg>
                            `)}`,
                            iconSize: [32, 32],
                            iconAnchor: [16, 16],
                            popupAnchor: [0, -16],
                        })}
                    >
                        <Popup>
                            <div className="text-center">
                                <p className="font-medium text-green-600">📍 Your Location</p>
                                <p className="text-xs text-gray-500">
                                    Lat: {userLocation[0].toFixed(6)}
                                </p>
                                <p className="text-xs text-gray-500">
                                    Lng: {userLocation[1].toFixed(6)}
                                </p>
                                {locationAccuracy && (
                                    <p className="text-xs text-blue-600">
                                        Accuracy: ±{Math.round(locationAccuracy)}m
                                    </p>
                                )}
                                <div className="mt-2 pt-2 border-t border-gray-200">
                                    <button
                                        onClick={() => {
                                            if (mapRef.current) {
                                                mapRef.current.setView(userLocation, 16)
                                            }
                                        }}
                                        className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                                    >
                                        Center Map
                                    </button>
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                )}

                {/* Route path visualization */}
                {showRoute && routeInfo && routeInfo.routePath && routeInfo.routePath.length > 0 && (
                    <>
                        {/* Main route line */}
                        <Polyline
                            positions={routeInfo.routePath}
                            color="#3B82F6"
                            weight={6}
                            opacity={0.9}
                        />
                        
                        {/* Route border for better visibility */}
                        <Polyline
                            positions={routeInfo.routePath}
                            color="#1E40AF"
                            weight={8}
                            opacity={0.3}
                        />
                        
                        {/* Route direction arrows */}
                        {routeInfo.routePath.length > 2 && (
                            <Polyline
                                positions={routeInfo.routePath}
                                color="#FFFFFF"
                                weight={2}
                                opacity={0.8}
                                dashArray="5, 10"
                            />
                        )}
                    </>
                )}

                {/* Temporary marker for new location */}
                {tempMarker && (
                    <Marker position={tempMarker} icon={tempMarkerIcon}>
                        <Popup>
                            <div className="text-center">
                                <p className="font-medium text-green-600">New Location</p>
                                <p className="text-xs text-gray-500">
                                    Fill the form to add this location
                                </p>
                            </div>
                        </Popup>
                    </Marker>
                )}

                {/* Existing location markers */}
                {locations.map((location) => {
                    const locationEvents = getEventsForLocation(location.name)
                    const hasEvents = locationEvents.length > 0
                    return (
                    <Marker 
                        key={location.id} 
                        position={[location.latitude, location.longitude]} 
                        icon={getIconByType(location.type.toLowerCase(), hasEvents)}
                        draggable={editMode}
                        eventHandlers={{
                            dragstart: () => {
                                handleMarkerDragStart(location)
                            },
                            dragend: (e) => {
                                const marker = e.target;
                                const newPosition = marker.getLatLng();
                                
                                // Check if dragged to trash zone (bottom-right area)
                                const mapContainer = marker._map.getContainer();
                                const mapBounds = mapContainer.getBoundingClientRect();
                                const trashZoneArea = {
                                    left: mapBounds.width - 120,
                                    top: mapBounds.height - 120,
                                    right: mapBounds.width - 20,
                                    bottom: mapBounds.height - 20
                                };
                                
                                // Get marker position on screen
                                const markerPoint = marker._map.latLngToContainerPoint(newPosition);
                                
                                // Check if marker is in trash zone
                                if (
                                    markerPoint.x >= trashZoneArea.left &&
                                    markerPoint.x <= trashZoneArea.right &&
                                    markerPoint.y >= trashZoneArea.top &&
                                    markerPoint.y <= trashZoneArea.bottom
                                ) {
                                    // Dragged to trash zone - delete the location
                                    handleDeleteDrag(location);
                                } else {
                                    // Normal drag - update position
                                    handleMarkerDragEnd(location.id, [newPosition.lat, newPosition.lng]);
                                }
                            }
                        }}
                    >
                            {/* Hover Tooltip for Events */}
                            {locationEvents.length > 0 && (
                                <Tooltip 
                                    direction="top" 
                                    offset={[0, -10]}
                                    className="event-tooltip"
                                    permanent={false}
                                >
                                    <div className="text-center">
                                        <div className="font-semibold text-sm mb-1">
                                            📅 {locationEvents.length} Event{locationEvents.length > 1 ? 's' : ''}
                                        </div>
                                        {locationEvents.slice(0, 2).map((event) => (
                                            <div key={event.id} className="text-xs opacity-90">
                                                • {event.title}
                                            </div>
                                        ))}
                                        {locationEvents.length > 2 && (
                                            <div className="text-xs opacity-70">
                                                +{locationEvents.length - 2} more...
                                            </div>
                                        )}
                                    </div>
                                </Tooltip>
                            )}
                            
                            <Popup 
                                maxWidth={window.innerWidth <= 320 ? 160 : window.innerWidth <= 375 ? 180 : window.innerWidth <= 480 ? 200 : window.innerWidth <= 640 ? 220 : 260}
                                maxHeight={window.innerWidth <= 320 ? 200 : window.innerWidth <= 375 ? 220 : window.innerWidth <= 480 ? 240 : window.innerWidth <= 640 ? 260 : 300}
                                className="custom-popup"
                                closeButton={true}
                                autoPan={true}
                                autoPanPadding={window.innerWidth <= 320 ? [20, 20] : window.innerWidth <= 375 ? [30, 30] : [40, 40]}
                                keepInView={true}
                                eventHandlers={{
                                    add: handlePopupOpen
                                }}
                            >
                                <div className={`space-y-2 overflow-y-auto custom-scrollable ${
                                    window.innerWidth <= 320 ? 'max-w-[140px] max-h-[180px]' :
                                    window.innerWidth <= 375 ? 'max-w-[160px] max-h-[200px]' :
                                    window.innerWidth <= 480 ? 'max-w-[180px] max-h-[220px]' :
                                    window.innerWidth <= 640 ? 'max-w-[200px] max-h-[240px]' :
                                    'max-w-[240px] max-h-[280px]'
                                }`}>
                                    <h3 className="font-bold text-lg break-words">{location.name}</h3>
                                {location.image && (
                                    <img
                                        src={location.image}
                                        alt={location.name}
                                            className="w-full h-20 object-cover rounded"
                                        />
                                    )}
                                    <p className="text-sm text-gray-600 break-words">{location.description}</p>
                                    <p className="text-xs text-gray-500 break-words">{location.address}</p>
                                    
                                    {/* Events at this location */}
                                    {locationEvents.length > 0 && (
                                        <div className="mt-3 pt-3 border-t border-gray-200">
                                            <h4 className="font-semibold text-sm text-gray-700 mb-2">
                                                📅 Events ({locationEvents.length})
                                            </h4>
                                            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                                                {locationEvents.map((event) => (
                                                    <div key={event.id} className="bg-gray-50 p-2 rounded text-xs">
                                                        <div className="flex items-center justify-between mb-1">
                                                            <span className="font-medium text-gray-800 truncate flex-1 mr-2">
                                                                {event.title}
                                                            </span>
                                                            <span className={`px-1 py-0.5 rounded text-xs flex-shrink-0 ${
                                                                event.status === 'ACTIVE' ? 'bg-red-100 text-red-800' :
                                                                event.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                                                event.status === 'CANCELLED' ? 'bg-gray-100 text-gray-800' :
                                                                'bg-yellow-100 text-yellow-800'
                                                            }`}>
                                                                {event.status.toLowerCase()}
                                                            </span>
                                                        </div>
                                                        <p className="text-gray-600 text-xs break-words">
                                                            {formatEventDate(event.dateTime)}
                                                        </p>
                                                        {event.maxParticipants && (
                                                            <p className="text-gray-500 text-xs">
                                                                Max: {event.maxParticipants} participants
                                                            </p>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    
                                <div className="flex items-center justify-between">
                                    <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 capitalize">
                                        {location.type.toLowerCase()}
                                    </span>
                                    <button
                                        onClick={() => copyCoordinates([location.latitude, location.longitude])}
                                        className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
                                    >
                                        Copy Coords
                                    </button>
                                </div>
                                    
                                    {/* Route Information */}
                                    {userLocation && showRoute && (
                                        <div className="mt-3 pt-3 border-t border-gray-200">
                                            <div className="flex items-center justify-between mb-2">
                                                <h4 className="font-semibold text-sm text-gray-700">
                                                    🗺️ Route Info
                                                </h4>
                                                <button
                                                    onClick={() => handleDestinationSelect(location)}
                                                    className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                                                >
                                                    {selectedDestination?.id === location.id ? 'Selected' : 'Get Route'}
                                                </button>
                                            </div>
                                            
                                            {selectedDestination?.id === location.id && routeInfo && (
                                                <div className="space-y-1.5 text-xs">
                                                    <div className="flex justify-between items-center gap-2">
                                                        <span className="text-gray-600">🚶 Walking:</span>
                                                        <span className="font-medium text-right">{routeInfo.walkingTime}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center gap-2">
                                                        <span className="text-gray-600">🚗 Driving:</span>
                                                        <span className="font-medium text-right">{routeInfo.drivingTime}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center gap-2">
                                                        <span className="text-gray-600">📏 Distance:</span>
                                                        <span className="font-medium text-right">{routeInfo.distance}</span>
                                                    </div>
                                                </div>
                                            )}
                                            
                                            {selectedDestination?.id === location.id && isLoadingRoute && (
                                                <div className="text-xs text-gray-500 text-center py-2">
                                                    Calculating route...
                                                </div>
                                            )}
                                        </div>
                                    )}
                                <div className="text-xs text-gray-400">
                                    Lat: {location.latitude.toFixed(6)}, Lng: {location.longitude.toFixed(6)}
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                    )
                })}

                {/* Youth Member Markers */}
                {youthProfiles.map((youth) => (
                    <Marker 
                        key={`youth-${youth.id}`} 
                        position={[youth.latitude, youth.longitude]} 
                        icon={youthIcon}
                    >
                        <Popup 
                            maxWidth={window.innerWidth <= 320 ? 160 : window.innerWidth <= 375 ? 180 : window.innerWidth <= 480 ? 200 : window.innerWidth <= 640 ? 220 : 260}
                            maxHeight={window.innerWidth <= 320 ? 200 : window.innerWidth <= 375 ? 220 : window.innerWidth <= 480 ? 240 : window.innerWidth <= 640 ? 260 : 300}
                            className="custom-popup"
                            closeButton={true}
                            autoPan={true}
                            autoPanPadding={window.innerWidth <= 320 ? [20, 20] : window.innerWidth <= 375 ? [30, 30] : [40, 40]}
                            keepInView={true}
                            eventHandlers={{
                                add: handlePopupOpen
                            }}
                        >
                            <div className={`space-y-2 overflow-y-auto custom-scrollable ${
                                window.innerWidth <= 320 ? 'max-w-[140px] max-h-[180px]' :
                                window.innerWidth <= 375 ? 'max-w-[160px] max-h-[200px]' :
                                window.innerWidth <= 480 ? 'max-w-[180px] max-h-[220px]' :
                                window.innerWidth <= 640 ? 'max-w-[200px] max-h-[240px]' :
                                'max-w-[240px] max-h-[280px]'
                            }`}>
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                        <span className="text-purple-600 font-bold text-sm">👤</span>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg break-words">{youth.fullName}</h3>
                                        <p className="text-xs text-gray-500">Youth Member</p>
                                    </div>
                                </div>
                                
                                {youth.profilePicture && (
                                    <img
                                        src={youth.profilePicture}
                                        alt={youth.fullName}
                                        className="w-full h-32 object-contain rounded"
                                    />
                                )}
                                
                                <div className="space-y-1 text-xs">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Age:</span>
                                        <span className="font-medium">{youth.age} years old</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Sex:</span>
                                        <span className="font-medium">{youth.sex}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Status:</span>
                                        <span className={`px-1 py-0.5 rounded text-xs ${
                                            youth.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                        }`}>
                                            {youth.status}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Committee:</span>
                                        <span className="font-medium">{youth.committee}</span>
                                    </div>
                                </div>
                                
                                <div className="text-xs text-gray-500 break-words">
                                    <p><strong>Address:</strong> {youth.streetAddress}, {youth.barangay}</p>
                                </div>
                                
                                {youth.mobileNumber && (
                                    <div className="text-xs text-gray-500">
                                        <p><strong>Contact:</strong> {youth.mobileNumber}</p>
                                    </div>
                                )}
                                
                                <div className="flex items-center justify-between">
                                    <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                                        Residential
                                    </span>
                                    <button
                                        onClick={() => copyCoordinates([youth.latitude, youth.longitude])}
                                        className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
                                    >
                                        Copy Coords
                                    </button>
                                </div>
                                
                                <div className="text-xs text-gray-400">
                                    Lat: {youth.latitude.toFixed(6)}, Lng: {youth.longitude.toFixed(6)}
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    )
})

InteractiveMap.displayName = 'InteractiveMap'

export default InteractiveMap
