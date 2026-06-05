import { useEffect, useRef, useMemo } from 'react'
import * as THREE from 'three'

/* ─── Fallback events si l'API n'a pas encore répondu ─── */
const FALLBACK = [
  { title: 'CHROME — Electronic Night', type: 'soiree',    city: 'Rabat',      date: '2026-07-04', venue: 'Sofitel Jardin des Roses' },
  { title: 'MOGA ESSAOUIRA 2026',        type: 'festival',  city: 'Essaouira',  date: '2026-09-30', venue: "Golf d'Essaouira & Spa" },
  { title: 'ATLAS SOUND × FAYAS',        type: 'concert',   city: 'Marrakech',  date: '2026-06-06', venue: 'Nikki Beach Marrakech' },
  { title: 'GALA DE LUXE CASABLANCA',    type: 'gala',      city: 'Casablanca', date: '2026-06-15', venue: 'Four Seasons Hotel' },
  { title: 'XTRAVAGANZA — Taghazout',    type: 'festival',  city: 'Agadir',     date: '2026-06-05', venue: 'Radisson Blu Taghazout' },
  { title: 'SOLSTICE MIDSUMMER',         type: 'soiree',    city: 'Casablanca', date: '2026-06-21', venue: 'La Sqala Casablanca' },
  { title: 'VELOCITY FEST',              type: 'festival',  city: 'Tanger',     date: '2026-07-25', venue: 'Bord de mer — Tanger' },
  { title: 'PARADISE POOL',              type: 'soiree',    city: 'Marrakech',  date: '2026-08-01', venue: 'Fellah Hotel Marrakech' },
]

/* ─── Palette par type d'événement ─── */
const PAL = {
  soiree:    { a: [124,58,237],  b: [236,72,153],  c: [167,139,250] },
  concert:   { a: [190,18,60],   b: [124,58,237],  c: [251,113,133] },
  gala:      { a: [180,83,9],    b: [245,158,11],  c: [251,191,36]  },
  festival:  { a: [5,150,105],   b: [16,185,129],  c: [52,211,153]  },
  universite:{ a: [30,64,175],   b: [59,130,246],  c: [96,165,250]  },
}
const getPal = (type) => PAL[type] || PAL.soiree

/* ─── Seeded pseudo-random (pour résultats déterministes) ─── */
function seeded(seed) {
  let s = seed ^ 0xdeadbeef
  return () => {
    s = (Math.imul(s ^ (s >>> 16), 0x45d9f3b) ^ 0x12345678) >>> 0
    return s / 0xffffffff
  }
}

/* ─── Texture canvas premium ─── */
function makeTexture(ev, idx) {
  const W = 900, H = 1260
  const cvs = document.createElement('canvas')
  cvs.width = W; cvs.height = H
  const c = cvs.getContext('2d')
  const p = getPal(ev.type)
  const rng = seeded(idx * 7919 + 31337)
  const rgb = (arr, a = 1) => `rgba(${arr[0]},${arr[1]},${arr[2]},${a})`

  /* — fond sombre dégradé — */
  const bg = c.createLinearGradient(0, 0, W * 0.7, H)
  bg.addColorStop(0,   'rgb(4,4,12)')
  bg.addColorStop(0.35, rgb(p.a, 0.55))
  bg.addColorStop(0.65, rgb(p.b, 0.30))
  bg.addColorStop(1,   'rgb(2,2,8)')
  c.fillStyle = bg
  c.fillRect(0, 0, W, H)

  /* — lignes diagonales fines — */
  c.save()
  c.globalAlpha = 0.07
  c.strokeStyle = '#ffffff'
  c.lineWidth = 1
  for (let i = -H; i < W + H; i += 38) {
    c.beginPath()
    c.moveTo(i, 0)
    c.lineTo(i + H, H)
    c.stroke()
  }
  c.restore()

  /* — spotlight central — */
  const cx = W * 0.5, cy = H * 0.42
  const sp = c.createRadialGradient(cx, cy, 0, cx, cy, W * 0.62)
  sp.addColorStop(0,   rgb(p.a, 0.38))
  sp.addColorStop(0.4, rgb(p.b, 0.18))
  sp.addColorStop(1,   'transparent')
  c.fillStyle = sp
  c.fillRect(0, 0, W, H)

  /* — points lumineux noise — */
  c.save()
  for (let i = 0; i < 260; i++) {
    const px = rng() * W, py = rng() * H
    const pr = rng() * 1.8
    const pal = [p.a, p.b, p.c][Math.floor(rng() * 3)]
    c.globalAlpha = 0.08 + rng() * 0.18
    c.fillStyle = rgb(pal, 1)
    c.beginPath(); c.arc(px, py, pr, 0, Math.PI * 2); c.fill()
  }
  c.restore()

  /* — grand cercle géométrique central — */
  c.save()
  c.globalAlpha = 0.10
  c.strokeStyle = rgb(p.c, 1)
  c.lineWidth = 2
  c.beginPath(); c.arc(cx, cy, 260, 0, Math.PI * 2); c.stroke()
  c.globalAlpha = 0.06
  c.beginPath(); c.arc(cx, cy, 310, 0, Math.PI * 2); c.stroke()
  c.restore()

  /* — badge type (top-left) — */
  const typeLabel = (ev.type || 'SOIREE').toUpperCase()
  c.save()
  c.font = '700 26px Arial, sans-serif'
  const bw = c.measureText(typeLabel).width + 32
  const grad2 = c.createLinearGradient(36, 0, 36 + bw, 0)
  grad2.addColorStop(0, rgb(p.a, 0.90))
  grad2.addColorStop(1, rgb(p.b, 0.90))
  c.fillStyle = grad2
  c.beginPath(); c.roundRect(36, 36, bw, 42, 12); c.fill()
  c.fillStyle = '#fff'
  c.textAlign = 'left'
  c.textBaseline = 'middle'
  c.fillText(typeLabel, 52, 57)
  c.restore()

  /* — numéro (top-right) — */
  c.save()
  c.font = '900 30px Arial'
  c.fillStyle = rgb(p.c, 0.70)
  c.textAlign = 'right'
  c.textBaseline = 'top'
  c.fillText(`${String((idx % 9) + 1).padStart(2, '0')}`, W - 36, 40)
  c.restore()

  /* — titre de l'événement — */
  const rawTitle = (ev.title || 'FAYAS EVENT').replace(/[—–]/g, ' ')
  const words = rawTitle.split(/\s+/)
  c.font = '900 78px Arial, sans-serif'
  const lines = []
  let line = ''
  words.forEach(w => {
    const test = line ? `${line} ${w}` : w
    if (c.measureText(test).width > W - 80 && line) { lines.push(line); line = w }
    else line = test
  })
  if (line) lines.push(line)

  const titleTop = H * 0.30
  c.save()
  c.shadowColor = 'rgba(0,0,0,0.9)'
  c.shadowBlur = 24
  lines.slice(0, 3).forEach((l, li) => {
    /* gradient text */
    const tg = c.createLinearGradient(36, 0, W - 36, 0)
    tg.addColorStop(0, '#ffffff')
    tg.addColorStop(1, rgb(p.c, 0.85))
    c.fillStyle = tg
    c.font = '900 78px Arial, sans-serif'
    c.textAlign = 'left'
    c.textBaseline = 'top'
    c.fillText(l, 40, titleTop + li * 90)
  })
  c.restore()

  /* — panneau inférieur glass — */
  const panY = H - 260
  c.save()
  c.fillStyle = 'rgba(0,0,0,0.76)'
  c.beginPath(); c.roundRect(20, panY, W - 40, 238, 22); c.fill()
  /* barre colorée en haut du panneau */
  const bar = c.createLinearGradient(20, panY, W - 20, panY)
  bar.addColorStop(0, rgb(p.a, 1)); bar.addColorStop(1, rgb(p.b, 1))
  c.fillStyle = bar
  c.beginPath(); c.roundRect(20, panY - 4, W - 40, 7, 4); c.fill()
  c.restore()

  /* — ville — */
  c.save()
  const cityGrad = c.createLinearGradient(44, 0, 44 + 400, 0)
  cityGrad.addColorStop(0, rgb(p.c, 1)); cityGrad.addColorStop(1, '#fff')
  c.fillStyle = cityGrad
  c.font = '900 52px Arial, sans-serif'
  c.textAlign = 'left'
  c.textBaseline = 'top'
  c.fillText((ev.city || 'MAROC').toUpperCase(), 44, panY + 22)
  c.restore()

  /* — venue — */
  c.save()
  c.fillStyle = 'rgba(255,255,255,0.45)'
  c.font = '400 28px Arial'
  c.textAlign = 'left'
  c.textBaseline = 'top'
  const venueTxt = (ev.venue || '').substring(0, 32)
  c.fillText(venueTxt, 44, panY + 86)
  c.restore()

  /* — date — */
  let dateStr = 'À VENIR'
  try {
    dateStr = new Intl.DateTimeFormat('fr-MA', { day:'2-digit', month:'short' })
      .format(new Date(ev.date)).replace(/\./g,'').toUpperCase()
  } catch {}
  c.save()
  c.font = '900 58px Arial'
  c.fillStyle = rgb(p.c, 1)
  c.textAlign = 'right'
  c.textBaseline = 'bottom'
  c.shadowColor = rgb(p.a, 0.6); c.shadowBlur = 18
  c.fillText(dateStr, W - 44, panY + 238 - 24)
  c.restore()

  /* — marque Fayas — */
  c.save()
  c.font = '700 22px Arial'
  c.fillStyle = 'rgba(255,255,255,0.25)'
  c.textAlign = 'right'
  c.textBaseline = 'bottom'
  c.fillText('FAYAS', W - 44, panY + 238 - 58)
  c.restore()

  /* — bordure lumineuse — */
  c.save()
  const bd = c.createLinearGradient(0, 0, W, H)
  bd.addColorStop(0,   rgb(p.a, 0.65))
  bd.addColorStop(0.5, rgb(p.c, 1.00))
  bd.addColorStop(1,   rgb(p.b, 0.65))
  c.strokeStyle = bd
  c.lineWidth = 3
  c.beginPath(); c.roundRect(3, 3, W - 6, H - 6, 30); c.stroke()
  c.restore()

  const tex = new THREE.CanvasTexture(cvs)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 16
  return tex
}

/* ─── Mesh d'une carte ─── */
function makeCard(ev, idx) {
  const geo = new THREE.PlaneGeometry(1.5, 2.1, 40, 4)
  /* légère courbure */
  const pos = geo.attributes.position
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i) / 1.5
    pos.setZ(i, Math.sin(x * Math.PI) * 0.055)
  }
  geo.computeVertexNormals()

  const mat = new THREE.MeshStandardMaterial({
    map: makeTexture(ev, idx),
    roughness: 0.25,
    metalness: 0.18,
    transparent: true,
    opacity: 0.94,
    side: THREE.DoubleSide,
    envMapIntensity: 1.2,
  })

  const mesh = new THREE.Mesh(geo, mat)

  /* contour brillant */
  const edgeMat = new THREE.LineBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.18,
    blending: THREE.AdditiveBlending,
  })
  mesh.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo), edgeMat))

  return mesh
}

/* ═══════════════════════════════════════════
   Composant principal
═══════════════════════════════════════════ */
export default function NightlifeIntro3D({ events = [], active = true }) {
  const mountRef = useRef(null)

  const evList = useMemo(() => {
    const src = events.length ? events : FALLBACK
    return [...src, ...src].slice(0, 10)
  }, [events])

  useEffect(() => {
    const mount = mountRef.current
    if (!mount || !active) return

    /* ── Renderer ── */
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    renderer.setClearColor(0x000000, 0)
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.35
    renderer.outputColorSpace = THREE.SRGBColorSpace
    mount.appendChild(renderer.domElement)

    /* ── Scene ── */
    const scene = new THREE.Scene()
    scene.fog = new THREE.FogExp2(0x04040a, 0.038)

    /* ── Camera ── */
    const camera = new THREE.PerspectiveCamera(44, 1, 0.1, 120)
    camera.position.set(0, 0.6, 9.8)

    /* ── Lights ── */
    scene.add(new THREE.AmbientLight(0x110720, 0.7))

    const pts = [
      { color: 0x7c3aed, int: 5,   dist: 14 },
      { color: 0xec4899, int: 4,   dist: 12 },
      { color: 0x22d3ee, int: 4.5, dist: 13 },
      { color: 0xf59e0b, int: 3,   dist: 10 },
    ]
    const lights = pts.map(({ color, int, dist }) => {
      const l = new THREE.PointLight(color, int, dist)
      scene.add(l)
      return l
    })

    /* ── Cards ── */
    const group = new THREE.Group()
    scene.add(group)

    const SPREAD = [
      [-3.2,  0.8, -1.0],  [ 3.4,  1.0, -0.8],
      [-1.0,  1.8, -2.0],  [ 1.2, -0.6, -1.5],
      [-2.8, -0.8, -2.5],  [ 2.6,  0.2, -2.8],
      [-0.2, -1.4, -0.8],  [ 0.8,  1.4, -3.2],
      [-3.8,  1.2, -3.5],  [ 3.0, -0.4, -3.8],
    ]
    const cards = evList.map((ev, i) => {
      const mesh = makeCard(ev, i)
      const [x, y, z] = SPREAD[i % SPREAD.length]
      mesh.position.set(x, y, z)
      mesh.rotation.y = -x * 0.10 + (i % 2 === 0 ? 0.15 : -0.15)
      mesh.rotation.x = (i % 3 - 1) * 0.06
      mesh.userData = { initY: y, phase: i * 0.65, spd: 0.35 + (i % 4) * 0.05 }
      group.add(mesh)
      return mesh
    })

    /* ── Particules colorées ── */
    const N = 400
    const pp = new Float32Array(N * 3)
    const pc = new Float32Array(N * 3)
    const pCols = [[0.49,0.23,0.93],[0.93,0.28,0.60],[0.13,0.83,0.94],[0.96,0.62,0.24],[0.38,0.82,0.60]]
    for (let i = 0; i < N; i++) {
      pp[i*3]   = (Math.random()-0.5) * 22
      pp[i*3+1] = (Math.random()-0.5) * 12
      pp[i*3+2] = -Math.random() * 14
      const col = pCols[Math.floor(Math.random() * pCols.length)]
      pc[i*3] = col[0]; pc[i*3+1] = col[1]; pc[i*3+2] = col[2]
    }
    const pGeo = new THREE.BufferGeometry()
    pGeo.setAttribute('position', new THREE.BufferAttribute(pp, 3))
    pGeo.setAttribute('color',    new THREE.BufferAttribute(pc, 3))
    const pMat = new THREE.PointsMaterial({
      size: 0.05, vertexColors: true,
      transparent: true, opacity: 0.70,
      blending: THREE.AdditiveBlending, depthWrite: false,
    })
    const particlesMesh = new THREE.Points(pGeo, pMat)
    scene.add(particlesMesh)

    /* ── Mouse parallax ── */
    let mx = 0, my = 0
    const onMouse = (e) => {
      mx = (e.clientX / window.innerWidth  - 0.5) * 2
      my = (e.clientY / window.innerHeight - 0.5) * 2
    }
    window.addEventListener('pointermove', onMouse)

    /* ── Resize ── */
    const resize = () => {
      const rect = mount.getBoundingClientRect()
      const w = Math.max(1, Math.floor(rect.width))
      const h = Math.max(1, Math.floor(rect.height))
      renderer.setSize(w, h, false)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
    }
    const ro = new ResizeObserver(resize)
    ro.observe(mount)
    resize()

    /* ── Animation loop (30fps cap, paused when tab hidden) ── */
    const clock = new THREE.Clock()
    let frameId = null, last = 0
    let tabVisible = !document.hidden

    const animate = (now) => {
      frameId = requestAnimationFrame(animate)
      if (now - last < 1000 / 30) return
      last = now
      const t = clock.getElapsedTime()

      /* rotation douce du groupe */
      group.rotation.y = t * 0.055

      /* flottement des cartes */
      cards.forEach(card => {
        const { initY, phase, spd } = card.userData
        card.position.y = initY + Math.sin(t * spd + phase) * 0.20
        card.rotation.z = Math.sin(t * 0.28 + phase) * 0.022
        card.rotation.x = Math.sin(t * 0.18 + phase) * 0.038 - 0.04
      })

      /* lumières en orbite */
      const R = 6
      lights[0].position.set(Math.cos(t*0.38)*R,  Math.sin(t*0.28)*2.5+1, Math.sin(t*0.38)*R)
      lights[1].position.set(Math.cos(t*0.28+2)*R, Math.sin(t*0.22)*2,     Math.sin(t*0.28+2)*R)
      lights[2].position.set(Math.cos(t*0.32+4)*R, Math.sin(t*0.25)*2-1,   Math.sin(t*0.32+4)*R)
      lights[3].position.set(Math.cos(t*0.25+1)*(R-1), 3.5,                Math.sin(t*0.25+1)*(R-1))

      /* rotation lente des particules */
      particlesMesh.rotation.y = t * 0.014
      particlesMesh.position.y = Math.sin(t * 0.3) * 0.08

      /* parallax caméra */
      camera.position.x += (mx * 0.7  - camera.position.x) * 0.035
      camera.position.y += (-my * 0.35 + 0.55 - camera.position.y) * 0.035
      camera.lookAt(0, 0.3, 0)

      renderer.render(scene, camera)
    }

    const start = () => {
      if (frameId == null && tabVisible) { last = 0; frameId = requestAnimationFrame(animate) }
    }
    const stop = () => {
      if (frameId != null) { cancelAnimationFrame(frameId); frameId = null }
    }
    const onVisibility = () => {
      tabVisible = !document.hidden
      tabVisible ? start() : stop()
    }
    document.addEventListener('visibilitychange', onVisibility)
    start()

    return () => {
      stop()
      document.removeEventListener('visibilitychange', onVisibility)
      ro.disconnect()
      window.removeEventListener('pointermove', onMouse)
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement)
      scene.traverse(obj => {
        if (obj.geometry) obj.geometry.dispose()
        if (obj.material) {
          const mats = Array.isArray(obj.material) ? obj.material : [obj.material]
          mats.forEach(m => { if (m.map) m.map.dispose(); m.dispose() })
        }
      })
      renderer.dispose()
    }
  }, [active, evList])

  return (
    <div className="nightlife-intro-3d" aria-hidden="true">
      <div ref={mountRef} style={{ position: 'absolute', inset: 0 }} />
      <div className="nightlife-intro-video-grain" />
    </div>
  )
}
