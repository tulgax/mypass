/**
 * Geocode an address to get latitude and longitude
 * Uses OpenStreetMap Nominatim API (free, no API key required)
 */
export async function geocodeAddress(
  address: string
): Promise<{ latitude: number; longitude: number } | null> {
  if (!address || !address.trim()) {
    return null
  }

  try {
    // Add a small delay to respect rate limits
    await new Promise((resolve) => setTimeout(resolve, 100))

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address.trim())}&limit=1&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'MyPass Studio App', // Required by Nominatim
          'Accept-Language': 'en',
        },
      }
    )

    if (!response.ok) {
      console.error('Geocoding API error:', response.status, response.statusText)
      return null
    }

    const data = await response.json()

    if (data && Array.isArray(data) && data.length > 0 && data[0].lat && data[0].lon) {
      const lat = parseFloat(data[0].lat)
      const lon = parseFloat(data[0].lon)
      
      // Validate coordinates
      if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
        console.error('Invalid coordinates from geocoding:', lat, lon)
        return null
      }

      return {
        latitude: lat,
        longitude: lon,
      }
    }

    console.warn('No results found for address:', address)
    return null
  } catch (error) {
    console.error('Geocoding error:', error)
    return null
  }
}
