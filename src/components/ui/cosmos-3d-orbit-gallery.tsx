"use client"

import { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import { useTexture } from "@react-three/drei"
import * as THREE from "three"

import { useRouter } from "next/navigation"

interface ParticleSphereProps {
  images?: string[] // Optional now as we have defaults
  showSigns?: boolean
}

const ZODIAC_DATA = [
  { id: "koc", name: "Aries", path: "/zodiac/aries.png" },
  { id: "boga", name: "Taurus", path: "/zodiac/taurus.png" },
  { id: "ikizler", name: "Gemini", path: "/zodiac/gemini.png" },
  { id: "yengec", name: "Cancer", path: "/zodiac/cancer.png" },
  { id: "aslan", name: "Leo", path: "/zodiac/leo.png" },
  { id: "basak", name: "Virgo", path: "/zodiac/virgo.png" },
  { id: "terazi", name: "Libra", path: "/zodiac/libra.png" },
  { id: "akrep", name: "Scorpio", path: "/zodiac/scorpio.png" },
  { id: "yay", name: "Sagittarius", path: "/zodiac/sagittarius.png" },
  { id: "oglak", name: "Capricorn", path: "/zodiac/capricorn.png" },
  { id: "kova", name: "Aquarius", path: "/zodiac/aquarius.png" },
  { id: "balik", name: "Pisces", path: "/zodiac/pisces.png" },
]

import { useLayoutEffect, useState } from "react"
import { useThree } from "@react-three/fiber"

function ZodiacItem({ 
  image, 
  texture, 
  IMAGE_SIZE, 
  router 
}: { 
  image: any, 
  texture: THREE.Texture, 
  IMAGE_SIZE: number,
  router: any
}) {
  const [hovered, setHovered] = useState(false)
  const itemRef = useRef<THREE.Group>(null)

  useFrame(() => {
    if (itemRef.current) {
      const targetScale = hovered ? 1.15 : 1.0
      itemRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1)
    }
  })

  return (
    <group 
      ref={itemRef} 
      position={image.position} 
      rotation={image.rotation}
      onPointerOver={() => {
        setHovered(true)
        document.body.style.cursor = 'pointer'
      }}
      onPointerOut={() => {
        setHovered(false)
        document.body.style.cursor = 'default'
      }}
    >
      <mesh onClick={() => router.push(`/burclar/${image.id}`)}>
        <planeGeometry args={[IMAGE_SIZE, IMAGE_SIZE]} />
        <meshBasicMaterial 
          map={texture} 
          transparent 
          opacity={hovered ? 1 : 0.85} 
          side={THREE.DoubleSide} 
        />
      </mesh>
    </group>
  )
}

export function ParticleSphere({ images, showSigns = true }: ParticleSphereProps) {
  const { size } = useThree()
  const isMobile = size.width < 768

  const IMAGE_SIZE = isMobile ? 1.4 : 2.2
  const PARTICLE_COUNT = 1500
  const POSITION_RANDOMNESS = 4
  const ROTATION_SPEED_Y = 0.0005
  const PARTICLE_OPACITY = 0.8

  const router = useRouter()
  const groupRef = useRef<THREE.Group>(null)
  const orbitingGroupRef = useRef<THREE.Group>(null)
  const meshRef = useRef<THREE.InstancedMesh>(null)
  
  const zodiacPaths = useMemo(() => ZODIAC_DATA.map(z => z.path), [])
  const textures = useTexture(zodiacPaths)

  const particles = useMemo(() => {
    const list = []
    const tempColor = new THREE.Color()
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const phi = Math.acos(-1 + (2 * i) / PARTICLE_COUNT)
      const theta = Math.sqrt(PARTICLE_COUNT * Math.PI) * phi
      const radiusVariation = (isMobile ? 6 : 9) + (Math.random() - 0.5) * POSITION_RANDOMNESS
      const x = radiusVariation * Math.cos(theta) * Math.sin(phi)
      const y = radiusVariation * Math.cos(phi)
      const z = radiusVariation * Math.sin(theta) * Math.sin(phi)

      list.push({
        position: new THREE.Vector3(x, y, z),
        scale: Math.random() * (0.01 - 0.005) + 0.005,
        color: tempColor.setHSL(Math.random() * 0.1 + 0.05, 0.8, 0.6 + Math.random() * 0.3).clone(),
      })
    }
    return list
  }, [isMobile])

  useLayoutEffect(() => {
    if (!meshRef.current) return
    const tempObject = new THREE.Object3D()
    particles.forEach((p, i) => {
      tempObject.position.copy(p.position)
      tempObject.scale.setScalar(p.scale)
      tempObject.updateMatrix()
      meshRef.current!.setMatrixAt(i, tempObject.matrix)
      meshRef.current!.setColorAt(i, p.color)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true
  }, [particles])

  const orbitingImages = useMemo(() => {
    const list = []
    const count = ZODIAC_DATA.length
    const radius = isMobile ? 6 : 9
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2
      const x = radius * Math.cos(angle)
      const y = 0
      const z = radius * Math.sin(angle)

      const position = new THREE.Vector3(x, y, z)
      const center = new THREE.Vector3(0, 0, 0)
      const outwardDirection = position.clone().sub(center).normalize()

      const euler = new THREE.Euler()
      const matrix = new THREE.Matrix4()
      matrix.lookAt(position, position.clone().add(outwardDirection), new THREE.Vector3(0, 1, 0))
      euler.setFromRotationMatrix(matrix)

      list.push({
        position: [x, y, z] as [number, number, number],
        rotation: [euler.x, euler.y, euler.z] as [number, number, number],
        textureIndex: i,
        id: ZODIAC_DATA[i].id
      })
    }
    return list
  }, [isMobile])

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += ROTATION_SPEED_Y
    }
    
    const scroll = typeof window !== 'undefined' ? window.scrollY : 0
    const newOpacity = Math.max(0, 1 - scroll / 600)
    
    if (orbitingGroupRef.current) {
      orbitingGroupRef.current.children.forEach((group) => {
        if (group instanceof THREE.Group) {
          group.children.forEach((mesh) => {
            if (mesh instanceof THREE.Mesh && mesh.material) {
              const baseOp = 0.95
              mesh.material.opacity = baseOp * newOpacity
              mesh.material.transparent = true
            }
          })
        }
      })
    }
  })

  return (
    <group ref={groupRef}>
      <instancedMesh ref={meshRef} args={[null as any, null as any, PARTICLE_COUNT]}>
        <sphereGeometry args={[1, 8, 6]} />
        <meshBasicMaterial transparent opacity={PARTICLE_OPACITY} />
      </instancedMesh>

      {showSigns && (
        <group ref={orbitingGroupRef}>
          {orbitingImages.map((image) => (
            <ZodiacItem 
              key={image.id} 
              image={image} 
              texture={textures[image.textureIndex]} 
              IMAGE_SIZE={IMAGE_SIZE}
              router={router}
            />
          ))}
        </group>
      )}
    </group>
  )
}
