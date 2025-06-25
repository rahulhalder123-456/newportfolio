
'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { Suspense, useState, useEffect, useRef } from 'react';
import { OrbitControls, useGLTF, Stage, Preload } from '@react-three/drei';
import * as THREE from 'three';

// Define model data with custom scales for each
const modelData = [
  { path: '/models/ape.glb', scale: 1.0 },
  { path: '/models/homo_erectus.glb', scale: 1.5 },
  { path: '/models/modern_human.glb', scale: 1.5 },
  { path: '/models/cyborg.glb', scale: 2.0 },
];

// Preload all models
modelData.forEach(data => useGLTF.preload(data.path));

function SingleModel({ path, scale, isActive }: { path: string, scale: number, isActive: boolean }) {
  const { scene } = useGLTF(path);
  const groupRef = useRef<THREE.Group>(null!);

  useEffect(() => {
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        // Ensure material is transparent for fade effect
        child.material.transparent = true;
        child.material.needsUpdate = true;
      }
    });
  }, [scene]);

  useFrame(() => {
    if (!groupRef.current) return;
    
    const targetOpacity = isActive ? 1 : 0;

    groupRef.current.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const material = child.material as THREE.MeshStandardMaterial;
        // Smoothly interpolate opacity
        material.opacity += (targetOpacity - material.opacity) * 0.05;
      }
    });
  });

  // Use the scale prop passed from modelData
  return <primitive object={scene} ref={groupRef} scale={scale} position={[0, -0.5, 0]} />;
}


export default function EvolutionScene() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      // Cycle through the models
      setActiveIndex((current) => (current + 1) % modelData.length);
    }, 4000); // Change model every 4 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 z-0">
      <Canvas camera={{ position: [0, 1.5, 8], fov: 50 }} shadows>
        <Suspense fallback={null}>
          <Stage 
            environment="city" 
            intensity={0.6} 
            adjustCamera={false} 
            shadows={{ type: 'contact', opacity: 0.3, blur: 2 }}
          >
            {/* Map over modelData and pass the scale to each SingleModel */}
            {modelData.map((data, index) => (
              <SingleModel 
                key={data.path} 
                path={data.path} 
                scale={data.scale}
                isActive={index === activeIndex} 
              />
            ))}
          </Stage>
        </Suspense>
        <OrbitControls
          enableZoom={false}
          autoRotate
          autoRotateSpeed={0.5}
          minPolarAngle={Math.PI / 2.8}
          maxPolarAngle={Math.PI / 1.8}
        />
        <Preload all />
      </Canvas>
    </div>
  );
}
