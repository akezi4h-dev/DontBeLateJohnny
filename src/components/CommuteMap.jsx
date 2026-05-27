import { useState, useEffect, useCallback, useMemo } from 'react'
import { GoogleMap, useJsApiLoader, Marker, DirectionsRenderer } from '@react-google-maps/api'
import { FACILITY_INFO, DEFAULT_HOME } from '../utils/commuteCalc'

const GOOGLE_LIBRARIES = ['places']
const HOME_KEY         = 'shiftstack_home_location'
const GEO_CACHE_KEY    = 'shiftstack_geocode_cache'

const DARK_MAP_STYLES = [
  { elementType: 'geometry',               stylers: [{ color: '#141414' }] },
  { elementType: 'labels.text.fill',       stylers: [{ color: '#5c5c5c' }] },
  { elementType: 'labels.text.stroke',     stylers: [{ color: '#141414' }] },
  { featureType: 'administrative',         elementType: 'geometry',           stylers: [{ color: '#2a2a2a' }] },
  { featureType: 'administrative.country', elementType: 'labels.text.fill',   stylers: [{ color: '#9ca5b3' }] },
  { featureType: 'poi',                    stylers: [{ visibility: 'off' }] },
  { featureType: 'road',                   elementType: 'geometry',           stylers: [{ color: '#2a2a2a' }] },
  { featureType: 'road',                   elementType: 'geometry.stroke',    stylers: [{ color: '#1a1a1a' }] },
  { featureType: 'road',                   elementType: 'labels.text.fill',   stylers: [{ color: '#6b7280' }] },
  { featureType: 'road.highway',           elementType: 'geometry',           stylers: [{ color: '#333333' }] },
  { featureType: 'road.highway',           elementType: 'geometry.stroke',    stylers: [{ color: '#222222' }] },
  { featureType: 'transit',                stylers: [{ visibility: 'off' }] },
  { featureType: 'water',                  elementType: 'geometry',           stylers: [{ color: '#0a0a0a' }] },
]

const MAP_OPTIONS = {
  styles:                DARK_MAP_STYLES,
  disableDefaultUI:      true,
  clickableIcons:        false,
  gestureHandling:       'greedy',   // one-finger pan on touch, scroll-wheel on desktop
  draggable:             true,
  scrollwheel:           true,
  disableDoubleClickZoom: true,
}

function svgUrl(svg) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

export default function CommuteMap({ shifts: todayShifts, dateLabel, taskStops = [], getCategoryByKey }) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey ?? '',
    libraries: GOOGLE_LIBRARIES,
  })

  const [home, setHome]           = useState(() => {
    try { return JSON.parse(localStorage.getItem(HOME_KEY)) } catch (_) { return null }
  })
  const [livePos, setLivePos]     = useState(null)
  const [geoCache, setGeoCache]   = useState(() => {
    try { return JSON.parse(localStorage.getItem(GEO_CACHE_KEY)) ?? {} } catch (_) { return {} }
  })
  const [settingHome, setSettingHome] = useState(false)
  const [mapRef, setMapRef]       = useState(null)
  const [collapsed, setCollapsed] = useState(false)
  const [directionLegs, setDirectionLegs] = useState([]) // [{ directions, color }]

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

  // ── Geocode work addresses + task stop addresses ────────────────────────
  useEffect(() => {
    if (!isLoaded || !window.google) return

    const toGeocode = [] // [{ key, address }]

    // Employer addresses
    const employers = [...new Set(todayShifts.map((s) => s.employer))]
    employers.forEach((key) => {
      if (geoCache[key]) return
      const address = FACILITY_INFO[key]?.address || getCategoryByKey(key)?.address
      if (address) toGeocode.push({ key, address })
    })

    // Task stop addresses (keyed as "task:<address>" to avoid collisions)
    taskStops.forEach((stop) => {
      const key = `task:${stop.address}`
      if (!geoCache[key]) toGeocode.push({ key, address: stop.address })
    })

    if (!toGeocode.length) return

    const geocoder = new window.google.maps.Geocoder()
    toGeocode.forEach(({ key, address }) => {
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
  }, [isLoaded, todayShifts, taskStops, getCategoryByKey]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Build per-leg directions (one per stop, each in the category's colour) ─
  useEffect(() => {
    if (!isLoaded || !home || !window.google || !todayShifts.length) {
      setDirectionLegs([])
      return
    }

    const stops = [...new Set(todayShifts.map((s) => s.employer))]
      .map((key) => ({ pos: geoCache[key], cat: getCategoryByKey(key) }))
      .filter((s) => s.pos)

    if (!stops.length) return

    // Task stops as waypoints on the first leg (home → first employer)
    const taskWaypoints = taskStops
      .map((stop) => geoCache[`task:${stop.address}`])
      .filter(Boolean)
      .map((pos) => ({ location: pos, stopover: true }))

    const waypoints = [{ pos: home, cat: null }, ...stops]
    const svc = new window.google.maps.DirectionsService()

    const requests = waypoints.slice(0, -1).map((from, i) => {
      const to = waypoints[i + 1]
      return new Promise((resolve) => {
        svc.route(
          {
            origin:     from.pos,
            destination: to.pos,
            travelMode: window.google.maps.TravelMode.DRIVING,
            ...(i === 0 && taskWaypoints.length ? { waypoints: taskWaypoints } : {}),
          },
          (result, status) => resolve(status === 'OK' ? { directions: result, color: to.cat?.color ?? '#ffffff' } : null)
        )
      })
    })

    Promise.all(requests).then((legs) => setDirectionLegs(legs.filter(Boolean)))
  }, [isLoaded, home, geoCache, todayShifts, taskStops, getCategoryByKey])

  // ── Work markers (memoised so fitBounds effect can depend on them) ──────
  const workMarkers = useMemo(() =>
    [...new Map(todayShifts.map((s) => [s.employer, s])).values()]
      .map((shift) => {
        const cat = getCategoryByKey(shift.employer)
        const pos = geoCache[shift.employer]
        return pos ? { pos, cat } : null
      })
      .filter(Boolean),
    [todayShifts, geoCache, getCategoryByKey]
  )

  // ── Auto-fit bounds to show home + work pins + task stops ───────────────
  useEffect(() => {
    if (!mapRef || !isLoaded || !window.google) return
    const points = []
    if (home) points.push(home)
    workMarkers.forEach(({ pos }) => points.push(pos))
    taskStops.forEach((stop) => {
      const pos = geoCache[`task:${stop.address}`]
      if (pos) points.push(pos)
    })
    if (points.length < 2) return

    const bounds = new window.google.maps.LatLngBounds()
    points.forEach((p) => bounds.extend(p))
    mapRef.fitBounds(bounds, { top: 48, right: 48, bottom: 64, left: 48 })
  }, [mapRef, home, workMarkers, geoCache, taskStops, isLoaded])

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
      },
      () => setSettingHome(false),
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }, [])

  // ── Marker icons ────────────────────────────────────────────────────────
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
      path:         window.google.maps.SymbolPath.CIRCLE,
      scale:        8,
      fillColor:    '#3b82f6',
      fillOpacity:  1,
      strokeColor:  '#ffffff',
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

  // Distinct pin for task stops — small white diamond with a check
  const taskIcon = useMemo(() => {
    if (!isLoaded) return null
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="34" viewBox="0 0 28 34"><path d="M14 0C6.27 0 0 6.27 0 14c0 9.33 14 20 14 20S28 23.33 28 14C28 6.27 21.73 0 14 0z" fill="rgba(255,255,255,0.85)"/><path d="M9 13.5l3.5 3.5 6.5-6.5" stroke="#141414" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`
    return {
      url:        svgUrl(svg),
      scaledSize: new window.google.maps.Size(24, 30),
      anchor:     new window.google.maps.Point(12, 30),
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
      <div className="mx-4 mb-4 h-12 rounded-2xl bg-[#1a1a1a] flex items-center justify-center">
        <span className="text-white/30 text-sm">Map failed to load</span>
      </div>
    )
  }

  if (!isLoaded) {
    return (
      <div className="mx-4 mb-4 h-48 rounded-2xl bg-[#1a1a1a] flex items-center justify-center">
        <span className="text-white/30 text-sm">Loading map…</span>
      </div>
    )
  }

  const mapCenter = home ?? workMarkers[0]?.pos ?? DEFAULT_HOME

  return (
    <div className="mx-4 mb-4 rounded-2xl overflow-hidden" style={{ backgroundColor: '#1a1a1a' }}>

      {/* ── Header strip — always visible, tap to collapse ── */}
      <div
        className="flex items-center justify-between px-4 py-3 cursor-pointer select-none"
        onClick={() => setCollapsed((c) => !c)}
      >
        <div className="flex items-center gap-2">
          <span className="text-sm">🗺️</span>
          <span
            className="text-xs font-bold uppercase tracking-widest"
            style={{ color: 'rgba(255,255,255,0.4)', fontFamily: "'Space Grotesk', sans-serif" }}
          >
            {dateLabel ? `${dateLabel}'s Route` : "Today's Route"}
          </span>
          {!home && (
            <span className="text-[10px] text-white/25 font-normal">— set home to see route</span>
          )}
        </div>
        <svg
          width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke="rgba(255,255,255,0.3)" strokeWidth="2.5"
          style={{ transform: collapsed ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
        >
          <path d="M18 15l-6-6-6 6" />
        </svg>
      </div>

      {/* ── Map ── */}
      {!collapsed && (
        <div className="relative" style={{ height: 'min(50dvh, 50vh)' }}>
          <GoogleMap
            mapContainerStyle={{ width: '100%', height: '100%' }}
            center={mapCenter}
            zoom={10}
            options={MAP_OPTIONS}
            onLoad={setMapRef}
          >
            {directionLegs.map((leg, i) => (
              <DirectionsRenderer
                key={i}
                directions={leg.directions}
                options={{
                  suppressMarkers: true,
                  polylineOptions: {
                    strokeColor:   leg.color,
                    strokeOpacity: 0.8,
                    strokeWeight:  5,
                  },
                }}
              />
            ))}
            {home && homeIcon    && <Marker position={home}   icon={homeIcon}  zIndex={10} />}
            {livePos && liveIcon && <Marker position={livePos} icon={liveIcon} zIndex={20} />}
            {workMarkers.map(({ pos, cat }) => {
              const icon = makeWorkIcon(cat.color)
              return icon ? <Marker key={cat.key ?? cat.name} position={pos} icon={icon} zIndex={5} /> : null
            })}
            {taskStops.map((stop) => {
              const pos = geoCache[`task:${stop.address}`]
              return (pos && taskIcon)
                ? <Marker key={`task:${stop.address}`} position={pos} icon={taskIcon} title={stop.text} zIndex={8} />
                : null
            })}
          </GoogleMap>

          {/* Zoom controls */}
          <div
            className="absolute top-3 right-3 flex flex-col pointer-events-none"
            style={{ gap: '2px' }}
          >
            {['+', '−'].map((label, i) => (
              <button
                key={label}
                onClick={(e) => {
                  e.stopPropagation()
                  if (mapRef) mapRef.setZoom((mapRef.getZoom() ?? 10) + (i === 0 ? 1 : -1))
                }}
                className="pointer-events-auto w-8 h-8 flex items-center justify-center text-base font-bold transition-all active:scale-90"
                style={{
                  background:          'rgba(14,14,14,0.85)',
                  backdropFilter:      'blur(12px)',
                  WebkitBackdropFilter:'blur(12px)',
                  border:              '1px solid rgba(255,255,255,0.12)',
                  borderRadius:        i === 0 ? '8px 8px 4px 4px' : '4px 4px 8px 8px',
                  color:               'rgba(255,255,255,0.7)',
                  lineHeight:          1,
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Set / update home button */}
          <div className="absolute bottom-3 inset-x-0 flex justify-center pointer-events-none">
            <button
              onClick={(e) => { e.stopPropagation(); handleSetHome() }}
              disabled={settingHome}
              className="pointer-events-auto flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all active:scale-95 disabled:opacity-50"
              style={{
                background:     'rgba(14,14,14,0.85)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border:         '1px solid rgba(255,255,255,0.12)',
                color:          home ? 'rgba(255,255,255,0.45)' : '#ffffff',
                fontFamily:     "'Syne', sans-serif",
              }}
            >
              {settingHome ? '…' : home ? '📍 Update home' : '📍 Set home location'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
