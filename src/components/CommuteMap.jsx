import { useState, useEffect, useCallback, useMemo } from 'react'
import { GoogleMap, useJsApiLoader, Marker, DirectionsRenderer } from '@react-google-maps/api'
import { FACILITY_INFO } from '../utils/commuteCalc'

// Must be module-level constants — useJsApiLoader requires stable references
const GOOGLE_LIBRARIES = ['places']
const HOME_KEY = 'shiftstack_home_location'
const GEO_CACHE_KEY = 'shiftstack_geocode_cache'
const NASHVILLE = { lat: 36.1627, lng: -86.7816 }

const DARK_MAP_STYLES = [
  { elementType: 'geometry',            stylers: [{ color: '#141414' }] },
  { elementType: 'labels.text.fill',    stylers: [{ color: '#5c5c5c' }] },
  { elementType: 'labels.text.stroke',  stylers: [{ color: '#141414' }] },
  { featureType: 'administrative',      elementType: 'geometry',           stylers: [{ color: '#2a2a2a' }] },
  { featureType: 'administrative.country', elementType: 'labels.text.fill', stylers: [{ color: '#9ca5b3' }] },
  { featureType: 'poi',                 stylers: [{ visibility: 'off' }] },
  { featureType: 'road',                elementType: 'geometry',           stylers: [{ color: '#2a2a2a' }] },
  { featureType: 'road',                elementType: 'geometry.stroke',    stylers: [{ color: '#1a1a1a' }] },
  { featureType: 'road',                elementType: 'labels.text.fill',   stylers: [{ color: '#6b7280' }] },
  { featureType: 'road.highway',        elementType: 'geometry',           stylers: [{ color: '#333333' }] },
  { featureType: 'road.highway',        elementType: 'geometry.stroke',    stylers: [{ color: '#222222' }] },
  { featureType: 'transit',             stylers: [{ visibility: 'off' }] },
  { featureType: 'water',               elementType: 'geometry',           stylers: [{ color: '#0a0a0a' }] },
]

const MAP_OPTIONS = {
  styles: DARK_MAP_STYLES,
  disableDefaultUI: true,
  clickableIcons: false,
  gestureHandling: 'cooperative',
}

function svgUrl(svg) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

export default function CommuteMap({ todayShifts, getCategoryByKey }) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey ?? '',
    libraries: GOOGLE_LIBRARIES,
  })

  const [home, setHome] = useState(() => {
    try { return JSON.parse(localStorage.getItem(HOME_KEY)) } catch (_) { return null }
  })
  const [livePos, setLivePos]     = useState(null)
  const [directions, setDirections] = useState(null)
  const [geoCache, setGeoCache]   = useState(() => {
    try { return JSON.parse(localStorage.getItem(GEO_CACHE_KEY)) ?? {} } catch (_) { return {} }
  })
  const [settingHome, setSettingHome] = useState(false)
  const [mapRef, setMapRef]       = useState(null)

  // ── Live GPS ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!navigator.geolocation) return
    const id = navigator.geolocation.watchPosition(
      ({ coords }) => setLivePos({ lat: coords.latitude, lng: coords.longitude }),
      () => {},
      { enableHighAccuracy: true, maximumAge: 15000 }
    )
    return () => navigator.geolocation.clearWatch(id)
  }, [])

  // ── Geocode work addresses ──────────────────────────────────────────────
  useEffect(() => {
    if (!isLoaded || !window.google) return
    const employers = [...new Set(todayShifts.map((s) => s.employer))]
    const toGeocode = employers.filter((key) => {
      if (geoCache[key]) return false
      const facility = FACILITY_INFO[key]
      const cat      = getCategoryByKey(key)
      return !!(facility?.address || cat?.address)
    })
    if (!toGeocode.length) return

    const geocoder = new window.google.maps.Geocoder()
    toGeocode.forEach((key) => {
      const address = FACILITY_INFO[key]?.address || getCategoryByKey(key)?.address
      geocoder.geocode({ address }, (results, status) => {
        if (status === 'OK' && results[0]) {
          const loc = results[0].geometry.location
          setGeoCache((prev) => {
            const next = { ...prev, [key]: { lat: loc.lat(), lng: loc.lng() } }
            localStorage.setItem(GEO_CACHE_KEY, JSON.stringify(next))
            return next
          })
        }
      })
    })
  }, [isLoaded, todayShifts, getCategoryByKey]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Build directions whenever home or geocache changes ──────────────────
  useEffect(() => {
    if (!isLoaded || !home || !window.google || !todayShifts.length) {
      setDirections(null)
      return
    }
    const stops = [...new Set(todayShifts.map((s) => s.employer))]
      .map((key) => geoCache[key])
      .filter(Boolean)
    if (!stops.length) return

    const svc = new window.google.maps.DirectionsService()
    svc.route(
      {
        origin:      home,
        destination: stops[stops.length - 1],
        waypoints:   stops.slice(0, -1).map((location) => ({ location, stopover: true })),
        travelMode:  window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        setDirections(status === 'OK' ? result : null)
      }
    )
  }, [isLoaded, home, geoCache, todayShifts])

  // ── Set home via GPS ────────────────────────────────────────────────────
  const handleSetHome = useCallback(() => {
    if (!navigator.geolocation) return
    setSettingHome(true)
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const pos = { lat: coords.latitude, lng: coords.longitude }
        localStorage.setItem(HOME_KEY, JSON.stringify(pos))
        setHome(pos)
        setSettingHome(false)
        mapRef?.panTo(pos)
      },
      () => setSettingHome(false),
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }, [mapRef])

  // ── Marker icons (require isLoaded for google.maps constructors) ────────
  const homeIcon = useMemo(() => {
    if (!isLoaded) return null
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="44" viewBox="0 0 36 44"><path d="M18 0C8.06 0 0 8.06 0 18c0 12 18 26 18 26S36 30 36 18C36 8.06 27.94 0 18 0z" fill="#ffffff"/><path d="M18 9 10 16.5h2.5V25h4.5v-5h2v5H23V16.5H25.5Z" fill="#141414"/></svg>`
    return {
      url:        svgUrl(svg),
      scaledSize: new window.google.maps.Size(32, 40),
      anchor:     new window.google.maps.Point(16, 40),
    }
  }, [isLoaded])

  const liveIcon = useMemo(() => {
    if (!isLoaded) return null
    return {
      path:        window.google.maps.SymbolPath.CIRCLE,
      scale:       8,
      fillColor:   '#3b82f6',
      fillOpacity: 1,
      strokeColor: '#ffffff',
      strokeWeight: 2.5,
    }
  }, [isLoaded])

  const makeWorkIcon = useCallback((color) => {
    if (!isLoaded) return null
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="40" viewBox="0 0 32 40"><path d="M16 0C7.16 0 0 7.16 0 16c0 10.67 16 24 16 24S32 26.67 32 16C32 7.16 24.84 0 16 0z" fill="${color}"/><circle cx="16" cy="16" r="7" fill="white" opacity="0.95"/></svg>`
    return {
      url:        svgUrl(svg),
      scaledSize: new window.google.maps.Size(28, 36),
      anchor:     new window.google.maps.Point(14, 36),
    }
  }, [isLoaded])

  // ── No API key ──────────────────────────────────────────────────────────
  if (!apiKey) {
    return (
      <div className="mx-4 mb-4 rounded-2xl bg-[#1a1a1a] p-6 text-center space-y-3">
        <div className="text-4xl">🗺️</div>
        <p className="text-white/45 text-sm leading-relaxed">
          Add{' '}
          <code className="text-white/80 bg-white/10 px-1.5 py-0.5 rounded font-mono text-xs">
            VITE_GOOGLE_MAPS_API_KEY
          </code>{' '}
          to enable the commute map.
        </p>
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="mx-4 mb-4 h-16 rounded-2xl bg-[#1a1a1a] flex items-center justify-center">
        <span className="text-white/30 text-sm">Map failed to load</span>
      </div>
    )
  }

  if (!isLoaded) {
    return (
      <div className="mx-4 mb-4 h-56 rounded-2xl bg-[#1a1a1a] flex items-center justify-center">
        <span className="text-white/30 text-sm">Loading map…</span>
      </div>
    )
  }

  const workMarkers = [...new Map(todayShifts.map((s) => [s.employer, s])).values()]
    .map((shift) => {
      const cat = getCategoryByKey(shift.employer)
      const pos = geoCache[shift.employer]
      return pos ? { pos, cat } : null
    })
    .filter(Boolean)

  const mapCenter = home ?? workMarkers[0]?.pos ?? NASHVILLE

  return (
    <div className="mx-4 mb-4 relative rounded-2xl overflow-hidden" style={{ height: 240 }}>
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '100%' }}
        center={mapCenter}
        zoom={home ? 12 : 11}
        options={MAP_OPTIONS}
        onLoad={setMapRef}
      >
        {/* Route polyline */}
        {directions && (
          <DirectionsRenderer
            directions={directions}
            options={{
              suppressMarkers: true,
              polylineOptions: {
                strokeColor:   '#ffffff',
                strokeOpacity: 0.45,
                strokeWeight:  4,
              },
            }}
          />
        )}

        {/* Home */}
        {home && homeIcon && <Marker position={home} icon={homeIcon} zIndex={10} />}

        {/* Work locations */}
        {workMarkers.map(({ pos, cat }) => {
          const icon = makeWorkIcon(cat.color)
          return icon ? (
            <Marker
              key={cat.key ?? cat.name}
              position={pos}
              icon={icon}
              zIndex={5}
            />
          ) : null
        })}

        {/* Live GPS dot */}
        {livePos && liveIcon && (
          <Marker position={livePos} icon={liveIcon} zIndex={20} />
        )}
      </GoogleMap>

      {/* Set / update home overlay */}
      <div className="absolute bottom-3 inset-x-0 flex justify-center pointer-events-none">
        <button
          onClick={handleSetHome}
          disabled={settingHome}
          className="pointer-events-auto flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all active:scale-95 disabled:opacity-50"
          style={{
            background:     'rgba(14,14,14,0.82)',
            backdropFilter: 'blur(12px)',
            border:         '1px solid rgba(255,255,255,0.12)',
            color:          home ? 'rgba(255,255,255,0.45)' : '#ffffff',
            fontFamily:     "'Syne', sans-serif",
          }}
        >
          {settingHome ? '…' : home ? '📍 Update home' : '📍 Set home location'}
        </button>
      </div>
    </div>
  )
}
