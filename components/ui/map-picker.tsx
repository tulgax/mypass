'use client'

import { useEffect, useState, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'

// Dynamically import Leaflet only on client side
let MapContainer: any
let TileLayer: any
let Marker: any
let useMapEvents: any
let L: any
let isLeafletLoaded = false

function loadLeaflet() {
  if (typeof window === 'undefined' || isLeafletLoaded) return

  try {
    const leaflet = require('react-leaflet')
    const leafletCore = require('leaflet')
    
    MapContainer = leaflet.MapContainer
    TileLayer = leaflet.TileLayer
    Marker = leaflet.Marker
    useMapEvents = leaflet.useMapEvents
    L = leafletCore.default || leafletCore

    // Fix for default marker icons
    if (L && L.Icon && L.Icon.Default) {
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      })
    }
    
    isLeafletLoaded = true
  } catch (error) {
    console.error('Failed to load Leaflet:', error)
  }
}

interface MapPickerProps {
  latitude?: number | null
  longitude?: number | null
  address?: string
  onLocationSelect: (lat: number, lng: number) => void
  className?: string
  height?: string
  zoom?: number
}

// Component to handle map clicks
function MapClickHandler({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
  if (typeof window === 'undefined' || !useMapEvents || !isLeafletLoaded) return null

  try {
    const map = useMapEvents({
      click: (e: any) => {
        const { lat, lng } = e.latlng
        onLocationSelect(lat, lng)
      },
    })
    return null
  } catch (error) {
    console.error('Map click handler error:', error)
    return null
  }
}

export function MapPicker({
  latitude,
  longitude,
  address,
  onLocationSelect,
  className,
  height = '300px',
  zoom = 13,
}: MapPickerProps) {
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(
    latitude && longitude ? { lat: latitude, lng: longitude } : null
  )
  const [isGeocoding, setIsGeocoding] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  // Ensure component is mounted and Leaflet is loaded
  useEffect(() => {
    setIsMounted(true)
    if (typeof window !== 'undefined') {
      loadLeaflet()
    }
  }, [])

  // Geocode address on mount if we have address but no coordinates
  useEffect(() => {
    if (address && !coordinates && typeof window !== 'undefined') {
      setIsGeocoding(true)
      import('@/lib/utils/geocoding')
        .then(({ geocodeAddress }) => geocodeAddress(address))
        .then((coords) => {
          if (coords) {
            setCoordinates({ lat: coords.latitude, lng: coords.longitude })
            onLocationSelect(coords.latitude, coords.longitude)
          }
        })
        .catch(() => {
          // Silently fail
        })
        .finally(() => {
          setIsGeocoding(false)
        })
    }
  }, [address])

  // Update coordinates when props change
  useEffect(() => {
    if (latitude && longitude) {
      setCoordinates({ lat: latitude, lng: longitude })
    }
  }, [latitude, longitude])

  const handleLocationSelect = useCallback(
    (lat: number, lng: number) => {
      setCoordinates({ lat, lng })
      onLocationSelect(lat, lng)
    },
    [onLocationSelect]
  )

  if (isGeocoding) {
    return (
      <div className={cn('w-full rounded-lg border overflow-hidden', className)} style={{ height }}>
        <Skeleton className="h-full w-full" />
      </div>
    )
  }

  // Default center (can be customized)
  const defaultCenter: [number, number] = [47.8864, 106.9057] // Ulaanbaatar, Mongolia
  const center: [number, number] = coordinates
    ? [coordinates.lat, coordinates.lng]
    : defaultCenter

  // Only render map if we're mounted, in the browser, and Leaflet is loaded
  if (!isMounted || typeof window === 'undefined' || !MapContainer || !isLeafletLoaded) {
    return (
      <div className={cn('w-full rounded-lg border overflow-hidden', className)} style={{ height }}>
        <Skeleton className="h-full w-full" />
      </div>
    )
  }

  return (
    <div className={cn('w-full rounded-lg border overflow-hidden relative', className)} style={{ height }}>
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        className="h-full w-full z-0 cursor-crosshair"
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapClickHandler onLocationSelect={handleLocationSelect} />
        {coordinates && (
          <Marker position={[coordinates.lat, coordinates.lng]}>
            {address && (
              <div className="text-sm font-medium">{address}</div>
            )}
          </Marker>
        )}
      </MapContainer>
      <div className="absolute bottom-2 left-2 z-[1000] bg-background/90 backdrop-blur-sm px-3 py-1.5 rounded-md text-xs text-muted-foreground border pointer-events-none">
        Click on the map to set location
      </div>
    </div>
  )
}
