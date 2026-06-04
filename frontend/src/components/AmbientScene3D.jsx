import { useEffect, useRef } from 'react'
import * as THREE from 'three'

/*
  Ambient 3D background — formes géométriques wireframe flottantes.
  Usage : <AmbientScene3D colors={['#7c3aed','#ec4899']} count={14} />
  S'adapte automatiquement à la taille du conteneur parent.
*/

const GEOS = [
  () => new THREE.IcosahedronGeometry(1, 0),
  () => new THREE.OctahedronGeometry(1, 0),
  () => new THREE.TetrahedronGeometry(1, 0),
  () => new THREE.TorusGeometry(0.7, 0.28, 6, 10),
  () => new THREE.BoxGeometry(1, 1, 1),
  () => new THREE.DodecahedronGeometry(0.9, 0),
]

function seededRng(seed) {
  let s = seed ^ 0xdeadbeef
  return () => {
    s = (Math.imul(s ^ (s >>> 16), 0x45d9f3b) ^ 0x12345678) >>> 0
    return s / 0xffffffff
  }
}

export default function AmbientScene3D({
  colors   = ['#7c3aed', '#ec4899', '#22d3ee'],
  count    = 14,
  seed     = 42,
  mouseParallax = true,
  style    = {},
}) {
  const mountRef = useRef(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return
    const rng = seededRng(seed)

    /* ── Renderer ── */
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'default' })
    renderer.setClearColor(0x000000, 0)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5))
    mount.appendChild(renderer.domElement)

    /* ── Scene / Camera ── */
    const scene  = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(58, 1, 0.1, 120)
    camera.position.set(0, 0, 9)

    /* ── Shapes ── */
    const meshes = []
    for (let i = 0; i < count; i++) {
      const geoFn  = GEOS[Math.floor(rng() * GEOS.length)]
      const geo    = geoFn()
      const color  = colors[Math.floor(rng() * colors.length)]
      const alpha  = 0.10 + rng() * 0.22

      /* wireframe — lignes très fines */
      const edges = new THREE.EdgesGeometry(geo)
      const mat   = new THREE.LineBasicMaterial({
        color: new THREE.Color(color),
        transparent: true,
        opacity: alpha,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
      const mesh = new THREE.LineSegments(edges, mat)

      const scale = 0.5 + rng() * 1.1
      mesh.scale.setScalar(scale)
      mesh.position.set(
        (rng() - 0.5) * 18,
        (rng() - 0.5) * 10,
        -(rng() * 7 + 1),
      )
      mesh.rotation.set(
        rng() * Math.PI * 2,
        rng() * Math.PI * 2,
        rng() * Math.PI * 2,
      )
      mesh.userData = {
        rx: (rng() - 0.5) * 0.010,
        ry: (rng() - 0.5) * 0.012,
        rz: (rng() - 0.5) * 0.008,
        vy: 0,
        initY: mesh.position.y,
        phase: rng() * Math.PI * 2,
        spd:   0.25 + rng() * 0.35,
      }
      scene.add(mesh)
      meshes.push(mesh)
    }

    /* ── Particules flottantes ── */
    const N = 80
    const pPos = new Float32Array(N * 3)
    const pCol = new Float32Array(N * 3)
    for (let i = 0; i < N; i++) {
      pPos[i * 3]     = (rng() - 0.5) * 22
      pPos[i * 3 + 1] = (rng() - 0.5) * 12
      pPos[i * 3 + 2] = -(rng() * 8)
      const c = new THREE.Color(colors[Math.floor(rng() * colors.length)])
      pCol[i * 3] = c.r; pCol[i * 3 + 1] = c.g; pCol[i * 3 + 2] = c.b
    }
    const pGeo = new THREE.BufferGeometry()
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3))
    pGeo.setAttribute('color',    new THREE.BufferAttribute(pCol, 3))
    const pMat = new THREE.PointsMaterial({
      size: 0.045, vertexColors: true,
      transparent: true, opacity: 0.55,
      blending: THREE.AdditiveBlending, depthWrite: false,
    })
    const particles = new THREE.Points(pGeo, pMat)
    scene.add(particles)

    /* ── Mouse parallax ── */
    let mx = 0, my = 0
    const onMouse = (e) => {
      mx = (e.clientX / window.innerWidth  - 0.5) * 2
      my = (e.clientY / window.innerHeight - 0.5) * 2
    }
    if (mouseParallax) window.addEventListener('pointermove', onMouse)

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

    /* ── Loop (30fps cap for perf) ── */
    const clock = new THREE.Clock()
    let frameId, last = 0

    const animate = (now) => {
      frameId = requestAnimationFrame(animate)
      if (now - last < 1000 / 30) return
      last = now

      const t = clock.getElapsedTime()

      meshes.forEach(m => {
        const { rx, ry, rz, phase, spd, initY } = m.userData
        m.rotation.x += rx
        m.rotation.y += ry
        m.rotation.z += rz
        m.position.y = initY + Math.sin(t * spd + phase) * 0.28
      })

      particles.rotation.y = t * 0.008
      particles.position.y = Math.sin(t * 0.22) * 0.12

      if (mouseParallax) {
        camera.position.x += (mx * 0.55 - camera.position.x) * 0.025
        camera.position.y += (-my * 0.30 - camera.position.y) * 0.025
      }
      camera.lookAt(0, 0, 0)

      renderer.render(scene, camera)
    }
    frameId = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(frameId)
      ro.disconnect()
      if (mouseParallax) window.removeEventListener('pointermove', onMouse)
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement)
      scene.traverse(obj => {
        if (obj.geometry) obj.geometry.dispose()
        if (obj.material) obj.material.dispose()
      })
      renderer.dispose()
    }
  }, [])   // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      ref={mountRef}
      aria-hidden="true"
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', ...style }}
    />
  )
}
