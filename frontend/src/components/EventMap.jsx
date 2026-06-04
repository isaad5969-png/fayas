import { useEffect, useRef, useState, useCallback } from 'react'
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
  soiree:     { color: '#7c3aed', label: 'Soirée'    },
  gala:       { color: '#f59e0b', label: 'Gala'      },
  concert:    { color: '#3b82f6', label: 'Concert'   },
  universite: { color: '#10b981', label: 'Étudiant'  },
  festival:   { color: '#06b6d4', label: 'Festival'  },
}

const TILE_URLS = {
  // OSM standard inversé via CSS → rendu dark premium très lisible
  dark:    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  // CARTO Voyager : gris neutre, routes très claires
  voyager: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
  // CARTO clair
  light:   'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
}

// Classes CSS appliquées sur le tile-layer selon le style
const TILE_CLASS = {
  dark:    'map-tiles-dark',
  voyager: 'map-tiles-voyager',
  light:   'map-tiles-light',
}

function formatDate(d) {
  if (!d) return ''
  try { return new Date(d + 'T00:00:00').toLocaleDateString('fr-MA', { day: 'numeric', month: 'long' }) }
  catch { return d }
}

function buildPopup(ev) {
  const cfg    = TYPE_CFG[ev.type] || { color: '#6b7280', label: ev.type }
  const isFull = (ev.capacity - ev.tickets_sold) <= 0
  const avail  = Math.max(0, ev.capacity - ev.tickets_sold)
  const pct    = Math.min(100, Math.round((ev.tickets_sold / ev.capacity) * 100))
  const isLow  = !isFull && avail < ev.capacity * 0.25
  const barClr = isFull ? '#ef4444' : isLow ? '#f59e0b' : '#7c3aed'
  const avClr  = isFull ? '#fca5a5' : isLow ? '#fde68a' : '#6ee7b7'
  const gmaps  = `https://www.google.com/maps/search/${encodeURIComponent((ev.venue || ev.city) + ', Maroc')}`

  const imgSection = ev.image_url
    ? `<div class="mpop-img" style="background-image:url(${ev.image_url})">
         <div class="mpop-img-overlay"></div>
         <span class="mpop-type-pill" style="background:${cfg.color}25;color:${cfg.color};border-color:${cfg.color}50">${cfg.label}</span>
         ${isFull ? '<span class="mpop-status-pill mpop-status-full">Complet</span>' : isLow ? `<span class="mpop-status-pill mpop-status-low">⚡ ${avail} restantes</span>` : ''}
       </div>`
    : `<div class="mpop-img mpop-img-empty" style="background:linear-gradient(135deg,${cfg.color}20 0%,${cfg.color}08 100%)">
         <span class="mpop-type-pill" style="background:${cfg.color}25;color:${cfg.color};border-color:${cfg.color}50">${cfg.label}</span>
         ${isFull ? '<span class="mpop-status-pill mpop-status-full">Complet</span>' : ''}
       </div>`

  return `<div class="mpop">
    ${imgSection}
    <div class="mpop-body">
      <div class="mpop-city-row">
        <span class="mpop-city-dot" style="background:${cfg.color}"></span>
        <span>${ev.city}</span>
      </div>
      <p class="mpop-ev-title">${ev.title}</p>
      <p class="mpop-meta">📍 ${ev.venue}</p>
      <p class="mpop-meta">🗓 ${formatDate(ev.date)}${ev.time ? ' · ' + ev.time : ''}</p>

      <div class="mpop-cap">
        <div class="mpop-cap-header">
          <span class="mpop-cap-label">${isFull ? '0' : avail} place${avail !== 1 ? 's' : ''}</span>
          <span style="color:${avClr};font-weight:700;font-size:11px">${100 - pct}% dispo</span>
        </div>
        <div class="mpop-cap-bg">
          <div class="mpop-cap-fill" style="width:${pct}%;background:${barClr}"></div>
        </div>
      </div>

      <div class="mpop-footer">
        <div class="mpop-price-block">
          ${isFull
            ? '<span style="font-size:13px;font-weight:700;color:#fca5a5">Complet</span>'
            : `<span class="mpop-price-from">dès</span><span class="mpop-price-val">${ev.price_standard} MAD</span>`}
        </div>
        <div class="mpop-acts">
          <a href="/events/${ev.id}" class="mpop-btn-primary">Réserver</a>
          <a href="${gmaps}" target="_blank" rel="noopener" class="mpop-btn-outline">Maps ↗</a>
        </div>
      </div>
    </div>
  </div>`
}

function makeIcon(type, selected = false) {
  const { color } = TYPE_CFG[type] || { color: '#7c3aed' }
  const cls = `mmarker${selected ? ' mmarker--sel' : ''}`
  const sz  = selected ? 40 : 32
  return L.divIcon({
    className: '',
    html: `<div class="${cls}" style="--dot:${color}"><div class="mmarker-ring"></div></div>`,
    iconSize:    [sz, sz],
    iconAnchor:  [sz / 2, sz / 2],
    popupAnchor: [0, -22],
  })
}

export default function EventMap({ events = [], selectedId, onSelect }) {
  const containerRef  = useRef(null)
  const mapRef        = useRef(null)
  const tileRef       = useRef(null)
  const markersRef    = useRef({})   // id -> { marker, event }
  const bubblesRef    = useRef([])
  const radiusRef     = useRef(null)
  const eventsRef     = useRef(events)

  const [locating,   setLocating]   = useState(false)
  const [nearbyCity, setNearbyCity] = useState(null)
  const [mapStyle,   setMapStyle]   = useState('voyager')
  const [zoom,       setZoom]       = useState(6)

  // Keep events ref current
  useEffect(() => { eventsRef.current = events }, [events])

  // ── Init map once ────────────────────────────────────
  useEffect(() => {
    if (mapRef.current || !containerRef.current) return

    const map = L.map(containerRef.current, {
      center: [31.7917, -7.0926],
      zoom: 6,
      zoomControl: false,
      attributionControl: false,
    })

    tileRef.current = L.tileLayer(TILE_URLS.voyager, {
      subdomains: 'abcd', maxZoom: 19,
      className: TILE_CLASS.voyager,
      attribution: '© <a href="https://carto.com">CARTO</a> © <a href="https://osm.org">OSM</a>',
    }).addTo(map)

    L.control.zoom({ position: 'bottomright' }).addTo(map)
    L.control.attribution({ position: 'bottomleft', prefix: false })
      .addAttribution('© <a href="https://carto.com">CARTO</a> · © <a href="https://openstreetmap.org">OSM</a>')
      .addTo(map)

    map.on('zoomend', () => setZoom(map.getZoom()))
    mapRef.current = map
    return () => { if (mapRef.current) { mapRef.current.remove(); mapRef.current = null } }
  }, [])

  // ── Tile style ────────────────────────────────────────
  useEffect(() => {
    if (!tileRef.current) return
    tileRef.current.setUrl(TILE_URLS[mapStyle])
    // Swap CSS class pour le filtre visuel
    const el = tileRef.current.getContainer?.()
    if (el) {
      el.classList.remove('map-tiles-dark', 'map-tiles-voyager', 'map-tiles-light')
      el.classList.add(TILE_CLASS[mapStyle])
    }
  }, [mapStyle])

  // ── City aggregation bubbles ──────────────────────────
  const rebuildBubbles = useCallback((z) => {
    if (!mapRef.current) return
    bubblesRef.current.forEach(m => m.remove())
    bubblesRef.current = []
    if (z >= 9) return

    const cnt = {}
    eventsRef.current.forEach(ev => { if (ev.city) cnt[ev.city] = (cnt[ev.city] || 0) + 1 })

    bubblesRef.current = Object.entries(cnt)
      .filter(([city]) => CITY_COORDS[city])
      .map(([city, count]) => {
        const sz = Math.max(48, Math.min(76, 38 + count * 5))
        const m = L.marker(CITY_COORDS[city], {
          icon: L.divIcon({
            className: '',
            html: `<div class="mcity-bubble" style="width:${sz}px;height:${sz}px">
                     <span class="mcity-count">${count}</span>
                     <span class="mcity-lbl">${city.split(' ')[0]}</span>
                   </div>`,
            iconSize:   [sz, sz],
            iconAnchor: [sz / 2, sz / 2],
          }),
          zIndexOffset: -100,
        }).addTo(mapRef.current)
        m.on('click', () => mapRef.current?.flyTo(CITY_COORDS[city], 10, { duration: 1.2 }))
        return m
      })
  }, [])

  // ── Update event markers when events change ───────────
  useEffect(() => {
    if (!mapRef.current) return

    Object.values(markersRef.current).forEach(({ marker }) => marker.remove())
    markersRef.current = {}

    events.forEach(ev => {
      if (!ev.lat || !ev.lng) return
      const marker = L.marker([ev.lat, ev.lng], { icon: makeIcon(ev.type, ev.id === selectedId) })
        .bindPopup(buildPopup(ev), {
          className: 'mpop-wrapper', maxWidth: 300, minWidth: 280,
          autoPanPaddingTopLeft:     L.point(20, 80),
          autoPanPaddingBottomRight: L.point(20, 20),
        })
        .addTo(mapRef.current)
      marker.on('click', () => onSelect?.(ev))
      markersRef.current[ev.id] = { marker, event: ev }
    })

    rebuildBubbles(mapRef.current.getZoom())
  }, [events, rebuildBubbles])

  // ── Rebuild bubbles on zoom change ────────────────────
  useEffect(() => { rebuildBubbles(zoom) }, [zoom, rebuildBubbles])

  // ── Fly to selected marker ────────────────────────────
  useEffect(() => {
    if (!mapRef.current) return
    // Update all icon states
    Object.entries(markersRef.current).forEach(([id, { marker, event }]) => {
      marker.setIcon(makeIcon(event.type, id === selectedId))
    })
    if (!selectedId) return
    const entry = markersRef.current[selectedId]
    if (entry) {
      mapRef.current.flyTo(entry.marker.getLatLng(), 13, { duration: 1 })
      setTimeout(() => entry.marker.openPopup(), 1100)
    }
  }, [selectedId])

  // ── Geolocation ───────────────────────────────────────
  const locateMe = () => {
    if (!navigator.geolocation || !mapRef.current) return
    setLocating(true)
    navigator.geolocation.getCurrentPosition(pos => {
      const { latitude: lat, longitude: lng } = pos.coords
      setLocating(false)

      let nearest = null, minD = Infinity
      for (const [city, [cLat, cLng]] of Object.entries(CITY_COORDS)) {
        const d = Math.hypot(lat - cLat, lng - cLng)
        if (d < minD) { minD = d; nearest = city }
      }
      setNearbyCity(nearest)

      if (mapRef.current._userMarker) mapRef.current._userMarker.remove()
      if (radiusRef.current) { radiusRef.current.remove(); radiusRef.current = null }

      mapRef.current._userMarker = L.marker([lat, lng], {
        icon: L.divIcon({
          className: '',
          html: '<div class="mmarker-user"><div class="mmarker-user-ring"></div></div>',
          iconSize: [20, 20], iconAnchor: [10, 10],
        }),
      }).bindTooltip('Votre position', { direction: 'top' }).addTo(mapRef.current)

      radiusRef.current = L.circle([lat, lng], {
        radius: 50000,
        color: '#7c3aed', fillColor: '#7c3aed', fillOpacity: 0.05,
        weight: 2, dashArray: '8 5',
      }).addTo(mapRef.current)

      mapRef.current.flyTo(CITY_COORDS[nearest] || [lat, lng], 11, { duration: 1.4 })
    }, () => setLocating(false), { timeout: 8000 })
  }

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full" />

      {/* ── Locate me ── */}
      <div className="absolute top-4 left-4 z-[900] flex flex-col gap-2">
        <button onClick={locateMe} disabled={locating}
          className="glass-panel-2026 flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-white text-sm font-semibold
                     hover:border-violet-500/40 transition-all disabled:opacity-60 shadow-lg shadow-black/30">
          {locating
            ? <span className="w-4 h-4 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
            : <Icon name="location" className="w-4 h-4 text-violet-400" />}
          {locating ? 'Localisation…' : nearbyCity ? nearbyCity : 'Près de moi'}
        </button>

        {nearbyCity && (
          <div className="glass-violet-2026 rounded-xl px-3.5 py-2 text-sm shadow-lg shadow-black/30">
            <span className="text-white/40 text-[10px] block mb-0.5 uppercase tracking-wider font-semibold">Rayon 50 km</span>
            <span className="font-bold text-white">{nearbyCity}</span>
          </div>
        )}
      </div>

      {/* ── Map style switcher ── */}
      <div className="absolute top-4 right-4 z-[900] glass-panel-2026 rounded-xl overflow-hidden flex shadow-lg shadow-black/30">
        {[['voyager','🗺️ Défaut'], ['dark','🌙 Sombre'], ['light','☀️ Clair']].map(([k, lbl]) => (
          <button key={k} onClick={() => setMapStyle(k)}
            className={`px-3 py-2 text-xs font-semibold transition-all whitespace-nowrap ${
              mapStyle === k ? 'bg-violet-600 text-white' : 'text-white/50 hover:text-white hover:bg-white/10'
            }`}>
            {lbl}
          </button>
        ))}
      </div>

      {/* ── Legend ── */}
      <div className="absolute bottom-10 right-4 z-[900] glass-panel-2026 rounded-xl px-3.5 py-3 shadow-lg shadow-black/30">
        <p className="text-[9px] text-white/30 uppercase tracking-widest font-bold mb-2.5">Types d'événements</p>
        {Object.entries(TYPE_CFG).map(([, cfg]) => (
          <div key={cfg.label} className="flex items-center gap-2 text-xs text-white/60 mb-1.5 last:mb-0">
            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0 shadow-sm" style={{ background: cfg.color, boxShadow: `0 0 6px ${cfg.color}80` }} />
            {cfg.label}
          </div>
        ))}
      </div>

      {/* ── Zoom hint ── */}
      {zoom < 9 && events.length > 0 && (
        <div className="absolute bottom-10 left-4 z-[900] glass-panel-2026 rounded-xl px-3 py-2 text-xs text-violet-300 shadow-lg shadow-black/30 flex items-center gap-1.5">
          <Icon name="search" className="w-3 h-3 opacity-70" />
          Zoomez pour voir les événements
        </div>
      )}
    </div>
  )
}