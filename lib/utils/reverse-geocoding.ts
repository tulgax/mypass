/**
 * Reverse geocode coordinates to get an address
 * Uses OpenStreetMap Nominatim API (free, no API key required)
 */
export async function reverseGeocode(
  latitude: number,
  longitude: number
): Promise<string | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'MyPass Studio App', // Required by Nominatim
        },
      }
    )

    if (!response.ok) {
      return null
    }

    const data = await response.json()

    if (data && data.display_name) {
      return data.display_name
    }

    return null
  } catch (error) {
    console.error('Reverse geocoding error:', error)
    return null
  }
}
