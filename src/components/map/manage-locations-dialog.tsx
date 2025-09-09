"use client"

import { Pencil, Trash2, Search, MapPin } from 'lucide-react'
import { useState, useEffect } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { getLocations, updateLocation, deleteLocation, type Location } from '@/lib/services/locations'

interface ManageLocationsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onLocationsChanged: () => void
}

export function ManageLocationsDialog({ open, onOpenChange, onLocationsChanged }: ManageLocationsDialogProps) {
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [editingLocation, setEditingLocation] = useState<Location | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      loadLocations()
    }
  }, [open])

  const loadLocations = async () => {
    try {
      setLoading(true)
      const data = await getLocations()
      setLocations(data)
      setError(null)
    } catch (err) {
      setError('Failed to load locations')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteLocation = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) {
      return
    }

    try {
      await deleteLocation(id)
      setLocations(prev => prev.filter(loc => loc.id !== id))
      onLocationsChanged()
    } catch (err) {
      alert('Failed to delete location')
    }
  }

  const handleUpdateLocation = async (location: Location, updates: Partial<Location>) => {
    try {
      const updatedLocation = await updateLocation(location.id, updates)
      setLocations(prev => prev.map(loc => 
        loc.id === location.id ? { ...loc, ...updates } : loc
      ))
      setEditingLocation(null)
      onLocationsChanged()
    } catch (err) {
      alert('Failed to update location')
    }
  }

  const filteredLocations = locations.filter(location =>
    location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    location.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    location.type.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      SCHOOL: 'bg-blue-100 text-blue-800',
      GOVERNMENT: 'bg-red-100 text-red-800',
      HEALTH: 'bg-green-100 text-green-800',
      COMMERCIAL: 'bg-purple-100 text-purple-800',
      SPORTS: 'bg-orange-100 text-orange-800',
      RELIGIOUS: 'bg-yellow-100 text-yellow-800',
      EMERGENCY: 'bg-red-100 text-red-800',
      RESIDENTIAL: 'bg-gray-100 text-gray-800',
      RECREATION: 'bg-cyan-100 text-cyan-800',
    }
    return colors[type] || 'bg-gray-100 text-gray-800'
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Manage Locations
          </DialogTitle>
          <DialogDescription>
            View, edit, and delete existing locations on the map.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search locations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              {error}
            </div>
          )}

          {/* Locations List */}
          <div className="max-h-[400px] overflow-y-auto space-y-2">
            {loading ? (
              <div className="text-center py-8">Loading locations...</div>
            ) : filteredLocations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchTerm ? 'No locations found matching your search.' : 'No locations found.'}
              </div>
            ) : (
              filteredLocations.map((location) => (
                <div
                  key={location.id}
                  className="p-4 border rounded-lg space-y-2 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {editingLocation?.id === location.id ? (
                        <EditLocationForm
                          location={location}
                          onSave={(updates) => handleUpdateLocation(location, updates)}
                          onCancel={() => setEditingLocation(null)}
                        />
                      ) : (
                        <>
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-medium">{location.name}</h3>
                            <Badge className={`text-xs ${getTypeColor(location.type)}`}>
                              {location.type.toLowerCase()}
                            </Badge>
                          </div>
                          {location.description && (
                            <p className="text-sm text-muted-foreground mb-1">
                              {location.description}
                            </p>
                          )}
                          {location.address && (
                            <p className="text-xs text-muted-foreground mb-1">
                              📍 {location.address}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            Coordinates: {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                          </p>
                        </>
                      )}
                    </div>
                    
                    {editingLocation?.id !== location.id && (
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingLocation(location)}
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteLocation(location.id, location.name)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="flex justify-between items-center pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              {filteredLocations.length} location(s) found
            </div>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

interface EditLocationFormProps {
  location: Location
  onSave: (updates: Partial<Location>) => void
  onCancel: () => void
}

function EditLocationForm({ location, onSave, onCancel }: EditLocationFormProps) {
  const [formData, setFormData] = useState({
    name: location.name,
    description: location.description || '',
    address: location.address || '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      name: formData.name,
      description: formData.description || undefined,
      address: formData.address || undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Input
        value={formData.name}
        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
        placeholder="Location name"
        required
      />
      <Input
        value={formData.address}
        onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
        placeholder="Address"
      />
      <Input
        value={formData.description}
        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
        placeholder="Description"
      />
      <div className="flex gap-2">
        <Button type="submit" size="sm">Save</Button>
        <Button type="button" size="sm" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}