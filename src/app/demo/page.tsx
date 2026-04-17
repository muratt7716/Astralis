"use client"

import { Canvas } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import { ParticleSphere } from "@/components/ui/cosmos-3d-orbit-gallery"

export default function DemoPage() {
  const pexelsImages = [
    "https://images.pexels.com/photos/1169754/pexels-photo-1169754.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/1252890/pexels-photo-1252890.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/1624496/pexels-photo-1624496.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/1366919/pexels-photo-1366919.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/1205301/pexels-photo-1205301.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/1229042/pexels-photo-1229042.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/1274260/pexels-photo-1274260.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/1287145/pexels-photo-1287145.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/1323550/pexels-photo-1323550.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/1366630/pexels-photo-1366630.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/1421903/pexels-photo-1421903.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/1434819/pexels-photo-1434819.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/1486974/pexels-photo-1486974.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/1563356/pexels-photo-1563356.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/1624438/pexels-photo-1624438.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/1933239/pexels-photo-1933239.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/2098427/pexels-photo-2098427.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/2166711/pexels-photo-2166711.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/2387418/pexels-photo-2387418.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/2559941/pexels-photo-2559941.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/2662116/pexels-photo-2662116.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/3244513/pexels-photo-3244513.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/3408744/pexels-photo-3408744.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/3404744/pexels-photo-3404744.jpeg?auto=compress&cs=tinysrgb&w=800",
  ]

  return (
    <div className="w-full h-screen bg-black relative">
      <div className="fixed top-20 left-0 right-0 z-10 p-6">
        <h1 className="max-w-[750px] mx-auto text-white text-center font-instrument-serif px-6 md:text-6xl text-4xl text-balance tracking-tight font-normal">
          The cosmos is within us. We are made of star-stuff. We are a way for the universe to know itself.
        </h1>
      </div>

      <Canvas camera={{ position: [-10, 1.5, 10], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <ParticleSphere images={pexelsImages} />
        <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
      </Canvas>
    </div>
  )
}
