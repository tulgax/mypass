'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import type { ExploreStudio } from '@/lib/data/public-explore'

// Dynamically import Leaflet only on client side
let MapContainer: any
let TileLayer: any
let Marker: any
let Popup: any
let L: any
let MarkerClusterGroup: any
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

    // Try to load marker cluster
    try {
      require('leaflet.markercluster')
      const rmc = require('react-leaflet-markercluster')
      MarkerClusterGroup = rmc.default || rmc
    } catch {
      // Marker clustering not available, will render markers directly
    }

    // Fix for default marker icons in Next.js
    if (L && L.Icon && L.Icon.Default) {
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl:
          'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl:
          'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      })
    }

    isLeafletLoaded = true
  } catch (error) {
    console.error('Failed to load Leaflet:', error)
  }
}

interface StudioMapViewProps {
  studios: ExploreStudio[]
  className?: string
}

export function StudioMapView({
  studios,
  className,
}: StudioMapViewProps) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    if (typeof window !== 'undefined') {
      loadLeaflet()
      // Import CSS for marker clustering
      try {
        require('leaflet.markercluster/dist/MarkerCluster.css')
        require('leaflet.markercluster/dist/MarkerCluster.Default.css')
      } catch {
        // Silently ignore
      }
    }
  }, [])

  // Default center: Ulaanbaatar, Mongolia
  const defaultCenter: [number, number] = [47.8864, 106.9057]

  // Compute bounds or use default
  const studiosWithCoords = studios.filter(
    (s) => s.latitude != null && s.longitude != null
  )

  const center: [number, number] =
    studiosWithCoords.length > 0
      ? [
          studiosWithCoords.reduce((sum, s) => sum + s.latitude!, 0) /
            studiosWithCoords.length,
          studiosWithCoords.reduce((sum, s) => sum + s.longitude!, 0) /
            studiosWithCoords.length,
        ]
      : defaultCenter

  if (
    !isMounted ||
    typeof window === 'undefined' ||
    !MapContainer ||
    !isLeafletLoaded
  ) {
    return (
      <div
        className={cn('w-full rounded-lg border overflow-hidden h-[60vh] sm:h-125', className)}
      >
        <Skeleton className="h-full w-full" />
      </div>
    )
  }

  const markers = studiosWithCoords.map((studio) => (
    <Marker
      key={studio.id}
      position={[studio.latitude!, studio.longitude!]}
    >
      <Popup>
        <div className="min-w-40">
          <p className="font-semibold text-sm">{studio.name}</p>
          {studio.address && (
            <p className="text-xs text-gray-500 mt-0.5">{studio.address}</p>
          )}
          <a
            href={`/${studio.slug}`}
            className="text-xs text-blue-600 underline mt-1 inline-block"
          >
            View Studio
          </a>
        </div>
      </Popup>
    </Marker>
  ))

  return (
    <div
      className={cn('w-full rounded-lg border overflow-hidden h-[60vh] sm:h-125', className)}
    >
      <MapContainer
        center={center}
        zoom={studiosWithCoords.length > 1 ? 11 : 14}
        scrollWheelZoom
        className="h-full w-full z-0"
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {MarkerClusterGroup ? (
          <MarkerClusterGroup>{markers}</MarkerClusterGroup>
        ) : (
          markers
        )}
      </MapContainer>
    </div>
  )
}
