import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Icon } from './Icons'

const CITY_COORDS = {
  Casablanca:   [33.5731, -7.5898],
  Marrakech:    [31.6295, -7.9811],
  Rabat:        [34.0209, -6.8416],
  Agadir:       [30.4202, -9.5982],
  'Fès':        [34.0181, -5.0078],
  Tanger:       [35.7595, -5.8340],
  Essaouira:    [31.5085, -9.7595],
  'Kénitra':    [34.2610, -6.5802],
  'Meknès':     [33.8935, -5.5473],
  Oujda:        [34.6867, -1.9114],
  'Tétouan':    [35.5785, -5.3684],
  Dakhla:       [23.7136, -15.9355],
  Ifrane:       [33.5228, -5.1097],
  Bouznika:     [33.7917, -7.1589],
}

const TYPE_CFG = {
  soiree:     { color: '#7c3aed', label: 'Soirée'  },
  gala:       { color: '#f59e0b', label: 'Gala'    },
  concert:    { color: '#3b82f6', label: 'Concert' },
  universite: { color: '#10b981', label: 'Étudiant'},
  festival:   { color: '#06b6d4', label: 'Festival'},
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  try {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('fr-MA', { day: 'numeric', month: 'long' })
  } catch { return dateStr }
}

function buildPopup(ev) {
  const cfg  = TYPE_CFG[ev.type] || { color: '#6b7280', label: ev.type }
  const bgA  = cfg.color + '30'
  const isFull = (ev.capacity - ev.tickets_sold) <= 0
  const gmaps  = `https://www.google.com/maps/search/${encodeURIComponent((ev.venue || ev.city) + ', Maroc')}`
  const imgHtml = ev.image_url
    ? `<div class="mpop-img" style="background-image:url(${ev.image_url})"></div>`
    : ''
  const priceHtml = isFull
    ? '<span class="mpop-price-full">Complet</span>'
    : `<span class="mpop-price-from">dès</span><span class="mpop-price-val">${ev.price_standard} MAD</span>`

  return `
    <div class="mpop">
      ${imgHtml}
      <div class="mpop-body">
        <div class="mpop-badges">
          <span class="mpop-type-tag" style="background:${bgA};color:${cfg.color};border:1px solid ${cfg.color}40">${cfg.label}</span>
          <span class="mpop-city-tag">${ev.city}</span>
          ${isFull ? '<span class="mpop-full-tag">Complet</span>' : ''}
        </div>
        <p class="mpop-ev-title">${ev.title}</p>
        <p class="mpop-venue">
          <svg viewBox="0 0 20 20" width="11" height="11" fill="currentColor" style="opacity:.5;display:inline;vertical-align:middle;margin-right:3px">
            <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"/>
          </svg>${ev.venue}
        </p>
        <p class="mpop-date">
          <svg viewBox="0 0 20 20" width="11" height="11" fill="currentColor" style="opacity:.5;display:inline;vertical-align:middle;margin-right:3px">
            <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"/>
          </svg>${formatDate(ev.date)}${ev.time ? ' · ' + ev.time : ''}
        </p>
        <div class="mpop-footer">
          <div class="mpop-price-block">${priceHtml}</div>
          <div class="mpop-acts">
            <a href="/events/${ev.id}" class="mpop-btn-primary">Réserver</a>
            <a href="${gmaps}" target="_blank" rel="noopener" class="mpop-btn-outline">Maps ↗</a>
          </div>
        </div>
      </div>
    </div>`
}

function makeIcon(type) {
  const cfg = TYPE_CFG[type] || { color: '#7c3aed' }
  return L.divIcon({
    className: '',
    html: `<div class="mmarker" style="--dot:${cfg.color}"><div class="mmarker-ring"></div></div>`,
    iconSize:    [32, 32],
    iconAnchor:  [16, 16],
    popupAnchor: [0, -20],
  })
}

export default function EventMap({ events }) {
  const containerRef = useRef(null)
  const mapRef       = useRef(null)
  const markersRef   = useRef([])
  const [locating,   setLocating]   = useState(false)
  const [nearbyCity, setNearbyCity] = useState(null)

  // Initialize map once
  useEffect(() => {
    if (mapRef.current || !containerRef.current) return

    const map = L.map(containerRef.current, {
      center: [31.7917, -7.0926],
      zoom: 6,
      zoomControl: false,
      attributionControl: false,
    })

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map)

    L.control.zoom({ position: 'bottomright' }).addTo(map)
    L.control.attribution({ position: 'bottomleft', prefix: false })
      .addAttribution('© <a href="https://openstreetmap.org">OSM</a> · © <a href="https://carto.com">CARTO</a>')
      .addTo(map)

    mapRef.current = map
    return () => {
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null }
    }
  }, [])

  // Update individual event markers when events change
  useEffect(() => {
    if (!mapRef.current || !events.length) return

    markersRef.current.forEach(m => m.remove())
    markersRef.current = []

    for (const ev of events) {
      if (!ev.lat || !ev.lng) continue

      const marker = L.marker([ev.lat, ev.lng], { icon: makeIcon(ev.type) })
        .bindPopup(buildPopup(ev), {
          className:  'mpop-wrapper',
          maxWidth:   300,
          minWidth:   280,
          autoPanPaddingTopLeft:     L.point(20, 80),
          autoPanPaddingBottomRight: L.point(20, 20),
        })
        .addTo(mapRef.current)

      markersRef.current.push(marker)
    }
  }, [events])

  const locateMe = () => {
    if (!navigator.geolocation || !mapRef.current) return
    setLocating(true)
    navigator.geolocation.getCurrentPosition(pos => {
      const { latitude: lat, longitude: lng } = pos.coords
      setLocating(false)

      let nearestCity = null, minDist = Infinity
      for (const [city, [cLat, cLng]] of Object.entries(CITY_COORDS)) {
        const d = Math.hypot(lat - cLat, lng - cLng)
        if (d < minDist) { minDist = d; nearestCity = city }
      }
      setNearbyCity(nearestCity)

      if (mapRef.current._userMarker) mapRef.current._userMarker.remove()
      const userIcon = L.divIcon({
        className: '',
        html: '<div class="mmarker-user"><div class="mmarker-user-ring"></div></div>',
        iconSize:   [20, 20],
        iconAnchor: [10, 10],
      })
      mapRef.current._userMarker = L.marker([lat, lng], { icon: userIcon })
        .bindTooltip('Votre position', { direction: 'top' })
        .addTo(mapRef.current)

      const target = CITY_COORDS[nearestCity] || [lat, lng]
      mapRef.current.flyTo(target, 11, { duration: 1.4 })
    }, () => setLocating(false), { timeout: 8000 })
  }

  return (
    <div className="relative rounded-2xl overflow-hidden border border-white/[0.07] shadow-2xl shadow-black/50"
         style={{ height: '620px' }}>
      <div ref={containerRef} className="w-full h-full" />

      {/* Overlay controls */}
      <div className="absolute top-4 left-4 z-[900] flex flex-col gap-2">
        <button
          onClick={locateMe}
          disabled={locating}
          className="glass-panel-2026 flex items-center gap-2 px-4 py-2.5 rounded-xl
                     text-white text-sm font-semibold cursor-pointer
                     hover:border-violet-500/40 transition-all disabled:opacity-60">
          {locating
            ? <span className="w-4 h-4 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
            : <Icon name="location" className="w-4 h-4 text-violet-400" />}
          {locating ? 'Localisation…' : 'Événements proches'}
        </button>

        {nearbyCity && (
          <div className="glass-violet-2026 rounded-xl px-4 py-2 text-sm text-violet-200 font-medium">
            <span className="text-white/60 text-xs block mb-0.5">Ville la plus proche</span>
            <span className="font-bold text-white">{nearbyCity}</span>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="absolute bottom-10 right-4 z-[900] glass-panel-2026 rounded-xl px-3 py-2.5 space-y-1.5">
        {Object.entries(TYPE_CFG).map(([, cfg]) => (
          <div key={cfg.label} className="flex items-center gap-2 text-xs text-white/70">
            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: cfg.color }} />
            {cfg.label}
          </div>
        ))}
      </div>
    </div>
  )
}
