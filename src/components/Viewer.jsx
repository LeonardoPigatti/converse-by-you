import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import styles from './Viewer.module.css'

export default function Viewer({ colorMap, activePart, targetView, onLoaded }) {
  const canvasRef = useRef(null)
  const stateRef = useRef({
    renderer: null,
    scene: null,
    camera: null,
    meshes: [],
    sph: { theta: 0.5, phi: 1.25, r: 3.0 },
    tgt: { theta: 0.5, phi: 1.25, r: 3.0 },
    dragging: false,
    prev: { x: 0, y: 0 },
    animId: null,
  })

  // Init Three.js once
  useEffect(() => {
    const canvas = canvasRef.current
    const st = stateRef.current

    // Renderer
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.outputEncoding = THREE.sRGBEncoding
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.0
    st.renderer = renderer

    // Scene + Camera
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(40, 1, 0.01, 100)
    st.scene = scene
    st.camera = camera

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 1.2))
    const dir1 = new THREE.DirectionalLight(0xffffff, 1.5)
    dir1.position.set(3, 5, 4)
    scene.add(dir1)
    const dir2 = new THREE.DirectionalLight(0xffffff, 0.6)
    dir2.position.set(-3, 2, -2)
    scene.add(dir2)
    const dir3 = new THREE.DirectionalLight(0xffffff, 0.4)
    dir3.position.set(0, -2, 3)
    scene.add(dir3)

    // Load GLB
    const loader = new GLTFLoader()
    loader.load('/converse_all_star_gumshoes_lp.glb', (gltf) => {
      const model = gltf.scene
      scene.add(model)
      model.updateMatrixWorld(true)

      model.traverse(child => {
        if (!child.isMesh) return
        // Fix transparency bug from alphaMode: BLEND
        child.material.transparent = false
        child.material.alphaTest = 0
        child.material.depthWrite = true
        child.material.side = THREE.FrontSide
        child.material.roughness = 0.75
        child.material.metalness = 0.0
        child.material.needsUpdate = true
        child.castShadow = true
        child.receiveShadow = true
        st.meshes.push(child)
      })

      // Center + scale
      const box = new THREE.Box3().setFromObject(model)
      const size = box.getSize(new THREE.Vector3())
      const scale = 1.8 / Math.max(size.x, size.y, size.z)
      model.scale.setScalar(scale)
      const box2 = new THREE.Box3().setFromObject(model)
      const center2 = box2.getCenter(new THREE.Vector3())
      model.position.sub(center2)

      onLoaded?.()
    })

    // Orbit controls
    const onMouseDown = (e) => { st.dragging = true; st.prev = { x: e.clientX, y: e.clientY } }
    const onMouseUp = () => { st.dragging = false }
    const onMouseMove = (e) => {
      if (!st.dragging) return
      st.tgt.theta -= (e.clientX - st.prev.x) * 0.007
      st.tgt.phi = Math.max(0.15, Math.min(2.8, st.tgt.phi + (e.clientY - st.prev.y) * 0.007))
      st.prev = { x: e.clientX, y: e.clientY }
    }
    const onWheel = (e) => {
      st.tgt.r = Math.max(1.2, Math.min(6, st.tgt.r + e.deltaY * 0.003))
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

    // Resize
    const resize = () => {
      const w = canvas.parentElement.clientWidth
      const h = canvas.parentElement.clientHeight
      renderer.setSize(w, h)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
    }
    window.addEventListener('resize', resize)
    resize()

    // Animation loop
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

  // Apply colors whenever colorMap changes
  useEffect(() => {
    const { meshes } = stateRef.current
    meshes.forEach(mesh => {
      const pName = mesh.parent?.name || ''
      let hex = '#ffffff'
      if (pName === 'a_lp') hex = colorMap['outsideBody']
      else if (pName === 'b_lp') hex = colorMap['rubber']
      mesh.material.color.set(hex)
      mesh.material.needsUpdate = true
    })
  }, [colorMap])

  // Apply view changes
  useEffect(() => {
    if (!targetView) return
    const st = stateRef.current
    st.tgt.theta = targetView.theta
    st.tgt.phi = targetView.phi
    st.tgt.r = targetView.r
  }, [targetView])

  return (
    <div className={styles.wrap}>
      <canvas ref={canvasRef} className={styles.canvas} />
      <div className={styles.hint}>Arraste para girar · Scroll para zoom</div>
    </div>
  )
}
