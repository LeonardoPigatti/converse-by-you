import { useEffect, useRef, useState, useCallback } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

const MIN_R = 1.2
const MAX_R = 6.0
const DEFAULT_R = 3.0

// Convert radius to zoom % (inverted: closer = more zoom)
const rToZoom = (r) => Math.round((1 - (r - MIN_R) / (MAX_R - MIN_R)) * 100)
const zoomToR = (z) => MIN_R + (1 - z / 100) * (MAX_R - MIN_R)

export default function Viewer({ colorMap, activePart, targetView, onLoaded, bgColor = '#ebebeb' }) {
  const canvasRef = useRef(null)
  const sliderTrackRef = useRef(null)
  const [zoom, setZoom] = useState(rToZoom(DEFAULT_R))
  const isDraggingSlider = useRef(false)
  const stateRef = useRef({
    renderer: null,
    scene: null,
    camera: null,
    meshes: [],
    sph: { theta: 0.5, phi: 1.25, r: DEFAULT_R },
    tgt: { theta: 0.5, phi: 1.25, r: DEFAULT_R },
    dragging: false,
    prev: { x: 0, y: 0 },
    animId: null,
  })

  // Sync zoom state from r value
  const syncZoom = useCallback((r) => {
    setZoom(rToZoom(r))
  }, [])

  // Init Three.js once
  useEffect(() => {
    const canvas = canvasRef.current
    const st = stateRef.current

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.outputEncoding = THREE.sRGBEncoding
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.1
    renderer.setClearColor(new THREE.Color(bgColor), 1)
    st.renderer = renderer

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(38, 1, 0.01, 100)
    st.scene = scene
    st.camera = camera

    scene.add(new THREE.AmbientLight(0xffffff, 1.4))
    const dir1 = new THREE.DirectionalLight(0xffffff, 1.6)
    dir1.position.set(2, 4, 5)
    scene.add(dir1)
    const dir2 = new THREE.DirectionalLight(0xffffff, 0.8)
    dir2.position.set(-4, 2, -2)
    scene.add(dir2)
    const dir3 = new THREE.DirectionalLight(0xffffff, 0.5)
    dir3.position.set(0, -3, 2)
    scene.add(dir3)

    const loader = new GLTFLoader()
    loader.load('/converse_all_star_gumshoes_lp.glb', (gltf) => {
      const model = gltf.scene
      scene.add(model)
      model.updateMatrixWorld(true)

      model.traverse(child => {
        if (!child.isMesh) return
        child.material.transparent = false
        child.material.alphaTest = 0
        child.material.depthWrite = true
        child.material.side = THREE.FrontSide
        child.material.roughness = 0.8
        child.material.metalness = 0.0
        child.material.needsUpdate = true
        st.meshes.push(child)
      })

      const box = new THREE.Box3().setFromObject(model)
      const size = box.getSize(new THREE.Vector3())
      const scale = 1.8 / Math.max(size.x, size.y, size.z)
      model.scale.setScalar(scale)
      const box2 = new THREE.Box3().setFromObject(model)
      model.position.sub(box2.getCenter(new THREE.Vector3()))

      onLoaded?.()
    })

    // Canvas orbit
    const onMouseDown = (e) => { st.dragging = true; st.prev = { x: e.clientX, y: e.clientY } }
    const onMouseUp = () => { st.dragging = false }
    const onMouseMove = (e) => {
      if (!st.dragging) return
      st.tgt.theta -= (e.clientX - st.prev.x) * 0.007
      st.tgt.phi = Math.max(0.15, Math.min(2.8, st.tgt.phi + (e.clientY - st.prev.y) * 0.007))
      st.prev = { x: e.clientX, y: e.clientY }
    }
    const onWheel = (e) => {
      st.tgt.r = Math.max(MIN_R, Math.min(MAX_R, st.tgt.r + e.deltaY * 0.003))
      syncZoom(st.tgt.r)
      e.preventDefault()
    }
    let prevTouch = null
    const onTouchStart = (e) => { prevTouch = e.touches[0] }
    const onTouchMove = (e) => {
      if (!prevTouch) return
      const t = e.touches[0]
      st.tgt.theta -= (t.clientX - prevTouch.clientX) * 0.007
      st.tgt.phi = Math.max(0.15, Math.min(2.8, st.tgt.phi + (t.clientY - prevTouch.clientY) * 0.007))
      prevTouch = t
      e.preventDefault()
    }
    const onTouchEnd = () => { prevTouch = null }

    canvas.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mouseup', onMouseUp)
    window.addEventListener('mousemove', onMouseMove)
    canvas.addEventListener('wheel', onWheel, { passive: false })
    canvas.addEventListener('touchstart', onTouchStart)
    canvas.addEventListener('touchmove', onTouchMove, { passive: false })
    canvas.addEventListener('touchend', onTouchEnd)

    const resize = () => {
      const wrap = canvas.parentElement
      const w = wrap.clientWidth
      const h = wrap.clientHeight
      renderer.setSize(w, h)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
    }
    window.addEventListener('resize', resize)
    resize()

    const lookAt = new THREE.Vector3(0, 0, 0)
    const animate = () => {
      st.animId = requestAnimationFrame(animate)
      st.sph.theta += (st.tgt.theta - st.sph.theta) * 0.09
      st.sph.phi += (st.tgt.phi - st.sph.phi) * 0.09
      st.sph.r += (st.tgt.r - st.sph.r) * 0.09
      camera.position.set(
        st.sph.r * Math.sin(st.sph.phi) * Math.sin(st.sph.theta),
        st.sph.r * Math.cos(st.sph.phi),
        st.sph.r * Math.sin(st.sph.phi) * Math.cos(st.sph.theta)
      )
      camera.lookAt(lookAt)
      renderer.render(scene, camera)
    }
    animate()

    return () => {
      cancelAnimationFrame(st.animId)
      canvas.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mouseup', onMouseUp)
      window.removeEventListener('mousemove', onMouseMove)
      canvas.removeEventListener('wheel', onWheel)
      canvas.removeEventListener('touchstart', onTouchStart)
      canvas.removeEventListener('touchmove', onTouchMove)
      canvas.removeEventListener('touchend', onTouchEnd)
      window.removeEventListener('resize', resize)
      renderer.dispose()
    }
  }, [])

  // Colors
  useEffect(() => {
    stateRef.current.meshes.forEach(mesh => {
      const pName = mesh.parent?.name || ''
      if (pName === 'a_lp') mesh.material.color.set(colorMap['outsideBody'])
      else if (pName === 'b_lp') mesh.material.color.set(colorMap['rubber'])
      mesh.material.needsUpdate = true
    })
  }, [colorMap])

  // External view change
  useEffect(() => {
    if (!targetView) return
    stateRef.current.tgt = { ...targetView }
    syncZoom(targetView.r)
  }, [targetView])

  // Slider drag handlers
  const getZoomFromMouseY = useCallback((clientY) => {
    const track = sliderTrackRef.current
    if (!track) return zoom
    const rect = track.getBoundingClientRect()
    const ratio = 1 - Math.max(0, Math.min(1, (clientY - rect.top) / rect.height))
    return Math.round(ratio * 100)
  }, [zoom])

  const handleSliderMouseDown = (e) => {
    isDraggingSlider.current = true
    const newZoom = getZoomFromMouseY(e.clientY)
    setZoom(newZoom)
    stateRef.current.tgt.r = zoomToR(newZoom)
    e.preventDefault()
  }

  useEffect(() => {
    const onMove = (e) => {
      if (!isDraggingSlider.current) return
      const newZoom = getZoomFromMouseY(e.clientY)
      setZoom(newZoom)
      stateRef.current.tgt.r = zoomToR(newZoom)
    }
    const onUp = () => { isDraggingSlider.current = false }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [getZoomFromMouseY])

  const handleZoomBtn = (delta) => {
    const newZoom = Math.max(0, Math.min(100, zoom + delta))
    setZoom(newZoom)
    stateRef.current.tgt.r = zoomToR(newZoom)
  }

  // thumb position: 0% zoom → bottom, 100% zoom → top
  const thumbPct = zoom // 0–100, 0 = bottom, 100 = top

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>

      {/* 3D Canvas */}
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: '100%', display: 'block', cursor: 'grab' }}
      />

      {/* Zoom sidebar — right side */}
      <div style={zs.sidebar}>

        {/* Zoom-in button */}
        <button style={zs.zoomBtn} onClick={() => handleZoomBtn(10)} title="Zoom in">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <line x1="7" y1="1" x2="7" y2="13" stroke="#000000" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="1" y1="7" x2="13" y2="7" stroke="#000000" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>

        {/* Slider track */}
        <div
          ref={sliderTrackRef}
          style={zs.track}
          onMouseDown={handleSliderMouseDown}
        >
          {/* Fill bar */}
          <div style={{ ...zs.fill, height: `${thumbPct}%` }} />

          {/* Thumb */}
          <div
            style={{
              ...zs.thumb,
              bottom: `calc(${thumbPct}% - 8px)`,
            }}
          />
        </div>

        {/* Zoom-out button */}
        <button style={zs.zoomBtn} onClick={() => handleZoomBtn(-10)} title="Zoom out">
          <svg width="14" height="2" viewBox="0 0 14 2" fill="none">
            <line x1="1" y1="1" x2="13" y2="1" stroke="#000000" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>

        {/* Zoom % label */}
        <div style={zs.label}>{zoom}%</div>
      </div>
    </div>
  )
}

// Zoom sidebar styles
const zs = {
  sidebar: {
    position: 'absolute',
    right: 20,
    top: '50%',
    transform: 'translateY(-50%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 10,
    userSelect: 'none',
  },
  zoomBtn: {
    width: 30,
    height: 30,
    borderRadius: '50%',
    border: '1.5px solid #ccc',
    background: 'rgba(255,255,255,0.85)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    flexShrink: 0,
    backdropFilter: 'blur(4px)',
    transition: 'border-color 0.15s',
  },
  track: {
    width: 4,
    height: 140,
    background: '#ddd',
    borderRadius: 4,
    position: 'relative',
    cursor: 'pointer',
    flexShrink: 0,
  },
  fill: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '100%',
    background: '#000000',
    borderRadius: 4,
    transition: 'height 0.05s',
    pointerEvents: 'none',
  },
  thumb: {
    position: 'absolute',
    left: '50%',
    transform: 'translateX(-50%)',
    width: 16,
    height: 16,
    borderRadius: '50%',
    background: '#fff',
    border: '2px solid #000000',
    boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
    cursor: 'grab',
    transition: 'bottom 0.05s',
    pointerEvents: 'none',
  },
  label: {
    fontSize: 10,
    color: '#000000',
    letterSpacing: '0.05em',
    fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif',
    marginTop: 2,
  },
}