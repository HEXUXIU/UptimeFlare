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

      // Scene
      scene = new THREE.Scene()
      scene.background = new THREE.Color(0x050611)

      // Camera
      camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
      camera.position.z = 30

      // Renderer
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false })
      renderer.setSize(window.innerWidth, window.innerHeight)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      container.appendChild(renderer.domElement)

      // --- Particle System ---
      const particleCount = 2000
      const geometry = new THREE.BufferGeometry()
      const positions = new Float32Array(particleCount * 3)
      const colors = new Float32Array(particleCount * 3)

      const colorPalette = [
        new THREE.Color(0x4ade80), // green
        new THREE.Color(0x60a5fa), // blue
        new THREE.Color(0x818cf8), // indigo
        new THREE.Color(0x34d399), // emerald
      ]

      for (let i = 0; i < particleCount; i++) {
        // Position in a sphere
        const radius = 20 + Math.random() * 15
        const theta = Math.random() * Math.PI * 2
        const phi = Math.acos(2 * Math.random() - 1)

        positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
        positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
        positions[i * 3 + 2] = radius * Math.cos(phi)

        // Random color from palette
        const color = colorPalette[Math.floor(Math.random() * colorPalette.length)]
        colors[i * 3] = color.r
        colors[i * 3 + 1] = color.g
        colors[i * 3 + 2] = color.b
      }

      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

      const material = new THREE.PointsMaterial({
        size: 0.15,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true,
      })

      particles = new THREE.Points(geometry, material)
      scene.add(particles)

      // --- Floating Geometry for visual interest ---
      const shapes: any[] = []
      const shapeColors = [0x4ade80, 0x60a5fa, 0x818cf8, 0x34d399]
      const shapeGeometries = [
        new THREE.IcosahedronGeometry(0.4, 0),
        new THREE.OctahedronGeometry(0.4, 0),
        new THREE.TetrahedronGeometry(0.5, 0),
      ]

      for (let i = 0; i < 15; i++) {
        const geo = shapeGeometries[Math.floor(Math.random() * shapeGeometries.length)]
        const mat = new THREE.MeshBasicMaterial({
          color: shapeColors[Math.floor(Math.random() * shapeColors.length)],
          transparent: true,
          opacity: 0.3 + Math.random() * 0.3,
          wireframe: Math.random() > 0.5,
        })
        const mesh = new THREE.Mesh(geo, mat)

        const radius = 12 + Math.random() * 18
        const theta = Math.random() * Math.PI * 2
        const phi = Math.acos(2 * Math.random() - 1)
        mesh.position.set(
          radius * Math.sin(phi) * Math.cos(theta),
          radius * Math.sin(phi) * Math.sin(theta),
          radius * Math.cos(phi)
        )
        mesh.userData = {
          rotSpeed: { x: (Math.random() - 0.5) * 0.02, y: (Math.random() - 0.5) * 0.02 },
          floatSpeed: 0.2 + Math.random() * 0.3,
          floatAmp: 0.5 + Math.random() * 1,
          phase: Math.random() * Math.PI * 2,
        }
        scene.add(mesh)
        shapes.push(mesh)
      }

      // Mouse tracking
      const handleMouseMove = (e: MouseEvent) => {
        mouseX = (e.clientX / window.innerWidth) * 2 - 1
        mouseY = -(e.clientY / window.innerHeight) * 2 + 1
      }
      window.addEventListener('mousemove', handleMouseMove)

      // Resize
      const handleResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight
        camera.updateProjectionMatrix()
        renderer.setSize(window.innerWidth, window.innerHeight)
      }
      window.addEventListener('resize', handleResize)

      // Animation loop
      const clock = new THREE.Clock()
      function animate() {
        animationId = requestAnimationFrame(animate)
        const time = clock.getElapsedTime()

        // Rotate particle system slowly
        particles.rotation.x = time * 0.02 + mouseY * 0.1
        particles.rotation.y = time * 0.015 + mouseX * 0.1

        // Animate shapes
        shapes.forEach((mesh, i) => {
          mesh.rotation.x += mesh.userData.rotSpeed.x
          mesh.rotation.y += mesh.userData.rotSpeed.y
          const basePos = mesh.userData._basePos || mesh.position.clone()
          if (!mesh.userData._basePos) mesh.userData._basePos = basePos
          mesh.position.y = basePos.y + Math.sin(time * mesh.userData.floatSpeed + mesh.userData.phase) * mesh.userData.floatAmp
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