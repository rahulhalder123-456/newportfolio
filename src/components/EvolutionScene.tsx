'use client';

import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import { OrbitControls, useGLTF, Stage, Preload } from '@react-three/drei';

// Helper component to load a single model
function Model({ path, position }: { path: string; position: [number, number, number] }) {
  const { scene } = useGLTF(path);
  // We can adjust the scale here if the models are too big or small
  return <primitive object={scene} position={position} scale={[1.2, 1.2, 1.2]} />;
}

// Preload the models so they are ready when the component mounts
useGLTF.preload('/models/ape.glb');
useGLTF.preload('/models/homo_erectus.glb');
useGLTF.preload('/models/modern_human.glb');
useGLTF.preload('/models/cyborg.glb');

export default function EvolutionScene() {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas camera={{ position: [0, 2, 14], fov: 50 }} shadows>
        <Suspense fallback={null}>
          <Stage environment="city" intensity={0.6} adjustCamera={false} shadows={{ type: 'contact', opacity: 0.3, blur: 2 }}>
            <Model path="/models/ape.glb" position={[-4.5, 0, 0]} />
            <Model path="/models/homo_erectus.glb" position={[-1.5, 0, 0]} />
            <Model path="/models/modern_human.glb" position={[1.5, 0, 0]} />
            <Model path="/models/cyborg.glb" position={[4.5, 0, 0]} />
          </Stage>
        </Suspense>
        <OrbitControls 
          enableZoom={false} 
          autoRotate 
          autoRotateSpeed={0.5} 
          minPolarAngle={Math.PI / 2.8} 
          maxPolarAngle={Math.PI / 2.8}
        />
        <Preload all />
      </Canvas>
    </div>
  );
}
