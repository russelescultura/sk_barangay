"use client"

import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { createLocation, type LocationType } from '@/lib/services/locations'

interface AddLocationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onLocationAdded: () => void
}

const locationTypes: { value: LocationType; label: string }[] = [
  { value: 'SCHOOL', label: 'School' },
  { value: 'GOVERNMENT', label: 'Government' },
  { value: 'HEALTH', label: 'Health Center' },
  { value: 'COMMERCIAL', label: 'Commercial' },
  { value: 'SPORTS', label: 'Sports Facility' },
  { value: 'RELIGIOUS', label: 'Religious' },
  { value: 'EMERGENCY', label: 'Emergency Service' },
  { value: 'RESIDENTIAL', label: 'Residential' },
  { value: 'RECREATION', label: 'Recreation' },
]

export function AddLocationDialog({ open, onOpenChange, onLocationAdded }: AddLocationDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    latitude: '',
    longitude: '',
    type: 'SCHOOL' as LocationType
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Validate required fields
      if (!formData.name || !formData.latitude || !formData.longitude) {
        throw new Error('Name, latitude, and longitude are required')
      }

      // Validate coordinates
      const lat = parseFloat(formData.latitude)
      const lng = parseFloat(formData.longitude)
      
      if (isNaN(lat) || isNaN(lng)) {
        throw new Error('Invalid coordinates')
      }

      if (lat < -90 || lat > 90) {
        throw new Error('Latitude must be between -90 and 90')
      }

      if (lng < -180 || lng > 180) {
        throw new Error('Longitude must be between -180 and 180')
      }

      await createLocation({
        name: formData.name,
        description: formData.description || undefined,
        address: formData.address || undefined,
        latitude: lat,
        longitude: lng,
        type: formData.type
      })

      // Reset form
      setFormData({
        name: '',
        description: '',
        address: '',
        latitude: '',
        longitude: '',
        type: 'SCHOOL'
      })

      onLocationAdded()
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create location')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError(null)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Location</DialogTitle>
          <DialogDescription>
            Add a new location to the barangay map. Fill in the details below.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter location name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Type *</Label>
            <select
              id="type"
              value={formData.type}
              onChange={(e) => handleInputChange('type', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background"
              required
            >
              {locationTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="latitude">Latitude *</Label>
              <Input
                id="latitude"
                type="number"
                step="any"
                value={formData.latitude}
                onChange={(e) => handleInputChange('latitude', e.target.value)}
                placeholder="12.8728"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="longitude">Longitude *</Label>
              <Input
                id="longitude"
                type="number"
                step="any"
                value={formData.longitude}
                onChange={(e) => handleInputChange('longitude', e.target.value)}
                placeholder="124.0092"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              placeholder="Enter address"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Enter description"
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Adding...' : 'Add Location'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}