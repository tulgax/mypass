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

  useEffect(() => {
    // Only run geocoding after component is mounted
    if (!isMounted) return

    // If we have coordinates, use them
    if (latitude && longitude) {
      setCoordinates({ lat: latitude, lng: longitude })
      return
    }

    // If we only have an address, geocode it
    if (address && !coordinates && isMounted) {
      setIsGeocoding(true)
      geocodeAddress(address)
        .then((coords) => {
          if (coords) {
            setCoordinates({ lat: coords.latitude, lng: coords.longitude })
          }
        })
        .catch((error) => {
          console.error('Geocoding failed:', error)
          // Keep coordinates as null to show fallback
        })
        .finally(() => {
          setIsGeocoding(false)
        })
    }
  }, [address, latitude, longitude, isMounted, coordinates])

  if (isGeocoding) {
    return (
      <div className={cn('w-full rounded-lg border overflow-hidden', className)} style={{ height }}>
        <Skeleton className="h-full w-full" />
      </div>
    )
  }

  // Show fallback if geocoding failed or no coordinates
  if (!coordinates && !isGeocoding && isMounted) {
    return (
      <div
        className={cn(
          'w-full rounded-lg border overflow-hidden bg-muted flex items-center justify-center',
          className
        )}
        style={{ height }}
      >
        <div className="text-center space-y-2 p-4">
          <p className="text-sm text-muted-foreground">Unable to load map</p>
          {address && (
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary hover:underline"
            >
              View on Google Maps
            </a>
          )}
        </div>
      </div>
    )
  }

  // Still loading or geocoding
  if (!coordinates || !isMounted) {
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
        center={[coordinates.lat, coordinates.lng]}
        zoom={zoom}
        scrollWheelZoom={false}
        className="h-full w-full z-0"
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[coordinates.lat, coordinates.lng]}>
          {address && (
            <Popup>
              <div className="text-sm font-medium">{address}</div>
            </Popup>
          )}
        </Marker>
      </MapContainer>
    </div>
  )
}
