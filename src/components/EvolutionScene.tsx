'use client';

import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import { OrbitControls, useGLTF, Stage, Preload } from '@react-three/drei';

function Model({ path, position }: { path: string; position: [number, number, number] }) {
  const { scene } = useGLTF(path);
  return <primitive object={scene} position={position} scale={[1.5, 1.5, 1.5]} />;
}

export default function EvolutionScene() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none">
      <Canvas camera={{ position: [0, 2, 10], fov: 50 }}>
        <ambientLight intensity={0.8} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} />
        <Suspense fallback={null}>
          <Stage environment="city" intensity={0.6}>
            <Model path="/models/ape.glb" position={[-6, 0, 0]} />
            <Model path="/models/homo_erectus.glb" position={[-2, 0, 0]} />
            <Model path="/models/modern_human.glb" position={[2, 0, 0]} />
            <Model path="/models/cyborg.glb" position={[6, 0, 0]} />
          </Stage>
          <Preload all />
        </Suspense>
        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.4} />
      </Canvas>
    </div>
  );
}
