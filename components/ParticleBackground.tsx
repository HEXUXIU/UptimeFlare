'use client'

import { useEffect, useRef } from 'react'

export default function ParticleBackground() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let animationId: number
    let scene: any, camera: any, renderer: any
    let particles: any
    let mouseX = 0
    let mouseY = 0

    async function init() {
      const THREE = await import('three')

      const container = containerRef.current
      if (!container) return

      // Scene — light background like Google Antigravity
      scene = new THREE.Scene()
      scene.background = new THREE.Color(0xf8f9fc)

      // Camera
      const aspect = window.innerWidth / window.innerHeight
      camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 1000)
      camera.position.set(0, 0, 28)

      // Renderer
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false })
      renderer.setSize(window.innerWidth, window.innerHeight)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      renderer.setClearColor(0xf8f9fc, 1)
      container.appendChild(renderer.domElement)

      // --- Subtle floating particles (sparse, like Google's) ---
      const particleCount = 400
      const geometry = new THREE.BufferGeometry()
      const positions = new Float32Array(particleCount * 3)
      const sizes = new Float32Array(particleCount)

      for (let i = 0; i < particleCount; i++) {
        const radius = 10 + Math.random() * 18
        const theta = Math.random() * Math.PI * 2
        const phi = Math.acos(2 * Math.random() - 1)

        positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
        positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
        positions[i * 3 + 2] = radius * Math.cos(phi)
        sizes[i] = 0.06 + Math.random() * 0.1
      }

      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
      geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1))

      const material = new THREE.PointsMaterial({
        size: 0.1,
        color: 0xaab1cc,
        transparent: true,
        opacity: 0.4,
        sizeAttenuation: true,
      })

      particles = new THREE.Points(geometry, material)
      scene.add(particles)

      // --- Floating geometric shapes (Google Antigravity style) ---
      const shapes: any[] = []
      const shapeColors = [0x3279f9, 0x34d399, 0x818cf8, 0xf59e0b, 0xec4899]
      const shapeGeometries = [
        new THREE.IcosahedronGeometry(0.35, 0),
        new THREE.OctahedronGeometry(0.35, 0),
        new THREE.TetrahedronGeometry(0.4, 0),
        new THREE.BoxGeometry(0.4, 0.4, 0.4),
      ]

      for (let i = 0; i < 20; i++) {
        const geo = shapeGeometries[Math.floor(Math.random() * shapeGeometries.length)]
        const color = shapeColors[Math.floor(Math.random() * shapeColors.length)]
        const mat = new THREE.MeshBasicMaterial({
          color: color,
          transparent: true,
          opacity: 0.15 + Math.random() * 0.15,
          wireframe: Math.random() > 0.6,
        })
        const mesh = new THREE.Mesh(geo, mat)

        const radius = 8 + Math.random() * 18
        const theta = Math.random() * Math.PI * 2
        const phi = Math.acos(2 * Math.random() - 1)
        mesh.position.set(
          radius * Math.sin(phi) * Math.cos(theta),
          radius * Math.sin(phi) * Math.sin(theta),
          radius * Math.cos(phi)
        )

        const scale = 0.5 + Math.random() * 1.5
        mesh.scale.set(scale, scale, scale)

        mesh.userData = {
          rotSpeed: {
            x: (Math.random() - 0.5) * 0.015,
            y: (Math.random() - 0.5) * 0.015,
            z: (Math.random() - 0.5) * 0.01,
          },
          floatSpeed: 0.15 + Math.random() * 0.25,
          floatAmp: 0.3 + Math.random() * 0.8,
          phase: Math.random() * Math.PI * 2,
          basePos: mesh.position.clone(),
        }
        scene.add(mesh)
        shapes.push(mesh)
      }

      // Mouse tracking (subtle parallax)
      const handleMouseMove = (e: MouseEvent) => {
        mouseX = (e.clientX / window.innerWidth) * 2 - 1
        mouseY = -(e.clientY / window.innerHeight) * 2 + 1
      }
      window.addEventListener('mousemove', handleMouseMove)

      // Resize
      const handleResize = () => {
        const w = window.innerWidth
        const h = window.innerHeight
        camera.aspect = w / h
        camera.updateProjectionMatrix()
        renderer.setSize(w, h)
      }
      window.addEventListener('resize', handleResize)

      // Animation loop
      const clock = new THREE.Clock()
      function animate() {
        animationId = requestAnimationFrame(animate)
        const time = clock.getElapsedTime()

        // Slow rotation of particle field
        particles.rotation.x = time * 0.015 + mouseY * 0.05
        particles.rotation.y = time * 0.01 + mouseX * 0.05

        // Animate floating shapes
        shapes.forEach((mesh) => {
          mesh.rotation.x += mesh.userData.rotSpeed.x
          mesh.rotation.y += mesh.userData.rotSpeed.y
          mesh.rotation.z += mesh.userData.rotSpeed.z

          const base = mesh.userData.basePos
          mesh.position.y =
            base.y +
            Math.sin(time * mesh.userData.floatSpeed + mesh.userData.phase) * mesh.userData.floatAmp
        })

        renderer.render(scene, camera)
      }
      animate()

      return () => {
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('resize', handleResize)
        cancelAnimationFrame(animationId)
        renderer.dispose()
        if (container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement)
        }
      }
    }

    const cleanupPromise = init()

    return () => {
      cleanupPromise.then((cleanup) => cleanup?.())
    }
  }, [])

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: -1,
        overflow: 'hidden',
      }}
    />
  )
}