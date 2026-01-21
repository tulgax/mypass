'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { geocodeAddress } from '@/lib/utils/geocoding'
import { Skeleton } from '@/components/ui/skeleton'

// Dynamically import Leaflet only on client side
let MapContainer: any
let TileLayer: any
let Marker: any
let Popup: any
let useMap: any
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
    Popup = leaflet.Popup
    useMap = leaflet.useMap
    L = leafletCore.default || leafletCore

    // Fix for default marker icons in Next.js
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

// Component to update map center when coordinates change
function ChangeView({ center, zoom }: { center: [number, number]; zoom: number }) {
  if (typeof window === 'undefined' || !useMap || !isLeafletLoaded) return null
  
  try {
    const map = useMap()
    useEffect(() => {
      if (map) {
        map.setView(center, zoom, { animate: false })
      }
    }, [map, center[0], center[1], zoom])
    return null
  } catch (error) {
    return null
  }
}

interface MapProps {
  latitude?: number
  longitude?: number
  address?: string
  className?: string
  height?: string
  zoom?: number
}

export function StudioMap({
  latitude,
  longitude,
  address,
  className,
  height = '300px',
  zoom = 15,
}: MapProps) {
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(() => {
    // Initialize with props if available
    if (latitude != null && longitude != null && !isNaN(Number(latitude)) && !isNaN(Number(longitude))) {
      return { lat: Number(latitude), lng: Number(longitude) }
    }
    return null
  })
  const [isGeocoding, setIsGeocoding] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  // Ensure component is mounted and Leaflet is loaded
  useEffect(() => {
    setIsMounted(true)
    if (typeof window !== 'undefined') {
      loadLeaflet()
    }
  }, [])

  // Update coordinates when props change - ensure they're numbers
  useEffect(() => {
    if (latitude != null && longitude != null && !isNaN(Number(latitude)) && !isNaN(Number(longitude))) {
      const lat = Number(latitude)
      const lng = Number(longitude)
      setCoordinates((prev) => {
        // Only update if values actually changed
        if (!prev || prev.lat !== lat || prev.lng !== lng) {
          return { lat, lng }
        }
        return prev
      })
    } else if (latitude == null || longitude == null || isNaN(Number(latitude)) || isNaN(Number(longitude))) {
      // Clear coordinates if props are invalid
      setCoordinates(null)
    }
  }, [latitude, longitude])

  // Geocode address on mount if we have address but no coordinates
  useEffect(() => {
    if (address && !coordinates && typeof window !== 'undefined' && isMounted) {
      setIsGeocoding(true)
      geocodeAddress(address)
        .then((coords) => {
          if (coords) {
            setCoordinates({ lat: coords.latitude, lng: coords.longitude })
          }
        })
        .catch(() => {
          // Silently fail - will show map with default center
        })
        .finally(() => {
          setIsGeocoding(false)
        })
    }
  }, [address, isMounted, coordinates])

  // Default center (Ulaanbaatar, Mongolia)
  const defaultCenter: [number, number] = [47.8864, 106.9057]
  const center: [number, number] = coordinates
    ? [coordinates.lat, coordinates.lng]
    : defaultCenter

  if (isGeocoding) {
    return (
      <div className={cn('w-full rounded-lg border overflow-hidden', className)} style={{ height }}>
        <Skeleton className="h-full w-full" />
      </div>
    )
  }

  // Only render map if we're mounted, in the browser, and Leaflet is loaded
  if (!isMounted || typeof window === 'undefined' || !MapContainer || !isLeafletLoaded) {
    return (
      <div className={cn('w-full rounded-lg border overflow-hidden', className)} style={{ height }}>
        <Skeleton className="h-full w-full" />
      </div>
    )
  }

  return (
    <div className={cn('w-full rounded-lg border overflow-hidden', className)} style={{ height }}>
      <MapContainer
        key={`${center[0]}-${center[1]}`}
        center={center}
        zoom={zoom}
        scrollWheelZoom={false}
        className="h-full w-full z-0"
        style={{ height: '100%', width: '100%' }}
      >
        <ChangeView center={center} zoom={zoom} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {coordinates && (
          <Marker position={[coordinates.lat, coordinates.lng]}>
            {address && (
              <Popup>
                <div className="text-sm font-medium">{address}</div>
              </Popup>
            )}
          </Marker>
        )}
      </MapContainer>
    </div>
  )
}
