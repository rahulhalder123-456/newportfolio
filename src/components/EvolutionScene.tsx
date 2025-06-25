
'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { Suspense, useState, useEffect, useMemo } from 'react';
import { useGLTF, Preload, Environment } from '@react-three/drei';
import * as THREE from 'three';

const modelData = [
  { path: '/models/ape.glb', scale: 0.8 },
  { path: '/models/homo_erectus.glb', scale: 1.5 },
  { path: '/models/modern_human.glb', scale: 1.5 },
  { path: '/models/cyborg.glb', scale: 2.5 },
];

// Preload models to prevent delays during the animation cycle
modelData.forEach(data => useGLTF.preload(data.path));

function SingleModel({ path, scale, isActive }: { path: string, scale: number, isActive: boolean }) {
  const { scene } = useGLTF(path);

  // We clone the scene so each model is a unique instance.
  // We also modify the materials to start transparent and invisible.
  const clonedScene = useMemo(() => {
    const newScene = scene.clone();
    newScene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const newMaterial = (child.material as THREE.Material).clone() as THREE.MeshStandardMaterial;
        newMaterial.transparent = true;
        newMaterial.opacity = 0; // Start completely invisible
        child.material = newMaterial;
      }
    });
    return newScene;
  }, [scene]);

  // This hook animates the opacity of the model for a smooth fade-in/fade-out effect.
  useFrame((state, delta) => {
    const targetOpacity = isActive ? 1.0 : 0.0;
    
    clonedScene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh && child.material instanceof THREE.MeshStandardMaterial) {
          // Animate the opacity value towards the target for a smooth transition
          child.material.opacity = THREE.MathUtils.lerp(child.material.opacity, targetOpacity, delta * 2.0);
      }
    });
  });

  // Always render the primitive. Its opacity will handle its visibility.
  return <primitive object={clonedScene} scale={scale} position={[0, -1.5, 0]} />;
}


export default function EvolutionScene() {
  const [activeIndex, setActiveIndex] = useState(0);

  // This effect sets up an interval to cycle through the models
  useEffect(() => {
    const interval = setInterval(() => {
      // Cycle to the next model, looping back to the start if at the end
      setActiveIndex((current) => (current + 1) % modelData.length);
    }, 4000); // Change model every 4 seconds

    return () => clearInterval(interval); // Cleanup on component unmount
  }, []);

  return (
    <div className="absolute inset-0 z-0">
      <Canvas camera={{ position: [0, 0.5, 7], fov: 50 }} shadows>
        {/* Suspense is required by React to handle components that load data asynchronously, like our models */}
        <Suspense fallback={null}>
          {/* Environment provides excellent, realistic ambient lighting and reflections. */}
          <Environment preset="apartment" />
          
          {/* Map through the model data and render a component for each one */}
          {modelData.map((data, index) => (
            <SingleModel 
              key={data.path} 
              path={data.path} 
              scale={data.scale}
              isActive={index === activeIndex} 
            />
          ))}

          {/* This mesh acts as a ground plane to receive shadows from the models */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, 0]} receiveShadow>
              <planeGeometry args={[100, 100]} />
              {/* shadowMaterial is invisible but will show shadows cast upon it */}
              <shadowMaterial opacity={0.4} />
          </mesh>
        </Suspense>

        {/* --- Lighting Setup --- */}
        {/* Ambient light provides a base level of illumination to the whole scene */}
        <ambientLight intensity={1} />
        {/* Directional light acts like the sun, casting shadows. This is our main "key" light. */}
        <directionalLight 
          position={[5, 5, 5]} 
          intensity={2.0} 
          castShadow 
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        {/* This second directional light is a "fill" light, softening shadows on the other side. */}
        <directionalLight 
          position={[-5, 5, 2]} 
          intensity={0.5} 
        />
        
        {/* Preload all assets for a smoother experience */}
        <Preload all />
      </Canvas>
    </div>
  );
}
