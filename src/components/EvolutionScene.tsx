
'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { Suspense, useState, useEffect, useRef } from 'react';
import { OrbitControls, useGLTF, Preload, Environment } from '@react-three/drei';
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
        // Enable shadows and transparency for fade effect
        child.castShadow = true;
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
        // Smoothly interpolate opacity to fade in/out
        material.opacity += (targetOpacity - material.opacity) * 0.05;
      }
    });
  });

  // Use the scale prop passed from modelData and adjust position
  return <primitive object={scene} ref={groupRef} scale={scale} position={[0, -1.5, 0]} />;
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
      <Canvas camera={{ position: [0, 1, 8], fov: 50 }} shadows>
        <Suspense fallback={null}>
          <Environment preset="city" />
          {modelData.map((data, index) => (
            <SingleModel 
              key={data.path} 
              path={data.path} 
              scale={data.scale}
              isActive={index === activeIndex} 
            />
          ))}
          {/* Add a ground plane to receive shadows */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, 0]} receiveShadow>
              <planeGeometry args={[100, 100]} />
              <shadowMaterial opacity={0.4} />
          </mesh>
        </Suspense>

        <ambientLight intensity={0.5} />
        <directionalLight 
          position={[5, 5, 5]} 
          intensity={1.5} 
          castShadow 
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
          shadow-camera-far={50}
          shadow-camera-left={-10}
          shadow-camera-right={10}
          shadow-camera-top={10}
          shadow-camera-bottom={-10}
        />
        
        <OrbitControls
          enableZoom={false}
          autoRotate
          autoRotateSpeed={0.5}
          target={[0, 0.5, 0]} // Adjust target to focus on the model's center
          minPolarAngle={Math.PI / 2.5}
          maxPolarAngle={Math.PI / 1.9}
        />
        <Preload all />
      </Canvas>
    </div>
  );
}
