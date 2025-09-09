export interface Location {
  id: string
  name: string
  description?: string
  address?: string
  latitude: number
  longitude: number
  type: LocationType
  image?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export type LocationType = 
  | 'SCHOOL'
  | 'GOVERNMENT' 
  | 'HEALTH'
  | 'COMMERCIAL'
  | 'SPORTS'
  | 'RELIGIOUS'
  | 'EMERGENCY'
  | 'RESIDENTIAL'
  | 'RECREATION'
  | 'GYMNASIUM'

export interface CreateLocationData {
  name: string
  description?: string
  address?: string
  latitude: number
  longitude: number
  type: LocationType
  image?: string
}

export interface UpdateLocationData {
  name?: string
  description?: string
  address?: string
  latitude?: number
  longitude?: number
  type?: LocationType
  image?: string
}

// Get all locations
export async function getLocations(): Promise<Location[]> {
  try {
    const response = await fetch('/api/locations')
    if (!response.ok) {
      throw new Error('Failed to fetch locations')
    }
    return await response.json()
  } catch (error) {
    console.error('Error fetching locations:', error)
    throw error
  }
}

// Get a specific location
export async function getLocation(id: string): Promise<Location> {
  try {
    const response = await fetch(`/api/locations/${id}`)
    if (!response.ok) {
      throw new Error('Failed to fetch location')
    }
    return await response.json()
  } catch (error) {
    console.error('Error fetching location:', error)
    throw error
  }
}

// Create a new location
export async function createLocation(data: CreateLocationData): Promise<Location> {
  try {
    const response = await fetch('/api/locations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    
    if (!response.ok) {
      throw new Error('Failed to create location')
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error creating location:', error)
    throw error
  }
}

// Update a location
export async function updateLocation(id: string, data: UpdateLocationData): Promise<Location> {
  try {
    const response = await fetch(`/api/locations/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    
    if (!response.ok) {
      throw new Error('Failed to update location')
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error updating location:', error)
    throw error
  }
}

// Delete a location
export async function deleteLocation(id: string): Promise<Location> {
  try {
    const response = await fetch(`/api/locations/${id}`, {
      method: 'DELETE',
    })
    
    if (!response.ok) {
      throw new Error('Failed to delete location')
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error deleting location:', error)
    throw error
  }
}