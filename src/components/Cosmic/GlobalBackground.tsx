"use client";

import { Suspense, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { ParticleSphere } from "@/components/ui/cosmos-3d-orbit-gallery";
import { usePathname } from "next/navigation";

export default function GlobalBackground() {
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  const [crashed, setCrashed] = useState(false);

  if (crashed) {
    // WebGL yoksa sade siyah arka plan — sayfa çalışmaya devam eder
    return <div className="fixed inset-0 z-0 bg-black" />;
  }

  return (
    <div className="fixed inset-0 z-0 bg-black pointer-events-none lg:pointer-events-auto">
      <Canvas
        camera={{ position: [-12, 1.5, 12], fov: 42 }}
        onCreated={({ gl }) => {
          // WebGL context kaybedilirse sayfayı çökertme
          gl.domElement.addEventListener('webglcontextlost', () => setCrashed(true));
        }}
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
