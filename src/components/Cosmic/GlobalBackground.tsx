"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { ParticleSphere } from "@/components/ui/cosmos-3d-orbit-gallery";
import { usePathname } from "next/navigation";

export default function GlobalBackground() {
  const pathname = usePathname();
  // We keep it on all pages now, and let ParticleSphere handle the zodiac orbit internally or via props
  const isHomePage = pathname === "/";

  return (
    <div className="fixed inset-0 z-0 bg-black pointer-events-none lg:pointer-events-auto">
      <Canvas
        camera={{ position: [-12, 1.5, 12], fov: 42 }}
        gl={{ powerPreference: 'low-power', antialias: false, precision: 'mediump' }}
        dpr={[1, 1.5]}
      >
        <ambientLight intensity={0.7} />
        <pointLight position={[10, 10, 10]} intensity={2} />
        <Suspense fallback={null}>
          <group position={[0, -1, 0]}>
            <ParticleSphere showSigns={isHomePage} />
          </group>
        </Suspense>
        <OrbitControls 
          enablePan={false} 
          enableZoom={false} 
          enableRotate={true} 
          rotateSpeed={0.4}
          dampingFactor={0.05}
          enableDamping={true}
        />
      </Canvas>
    </div>
  );
}
