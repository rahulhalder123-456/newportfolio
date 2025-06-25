
'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { Suspense, useState, useEffect, useMemo } from 'react';
import { useGLTF, Preload, Environment } from '@react-three/drei';
import * as THREE from 'three';

// Data for each model: path and a scale factor to normalize their sizes.
const modelData = [
  { path: '/models/ape.glb', scale: 0.8 },
  { path: '/models/homo_erectus.glb', scale: 1.5 },
  { path: '/models/modern_human.glb', scale: 1.5 },
  { path: '/models/cyborg.glb', scale: 2.5 },
];

// Preload all models to avoid delays. This is a performance optimization.
modelData.forEach(data => useGLTF.preload(data.path));

// A component to render a single model. It handles loading and its own fade animation.
function SingleModel({ path, scale, isActive }: { path: string, scale: number, isActive: boolean }) {
  // useGLTF is a hook from 'drei' that simplifies loading GLTF models.
  const { scene } = useGLTF(path);

  // We use useMemo to clone the scene only once. This is crucial for performance
  // and to ensure each model instance has its own unique materials.
  const clonedScene = useMemo(() => {
    const newScene = scene.clone();
    // We must traverse the entire model hierarchy.
    newScene.traverse((child) => {
      // We only care about meshes, as they are the visible parts with materials.
      if ((child as THREE.Mesh).isMesh) {
        // IMPORTANT: We clone the material. If we don't, all models will share
        // the same material, and animating one will animate all of them.
        const meshChild = child as THREE.Mesh;
        meshChild.material = (meshChild.material as THREE.Material).clone();
        // We enable transparency to be able to fade the model in and out.
        meshChild.material.transparent = true;
        // Start the model as completely invisible.
        meshChild.material.opacity = 0;
        // Cast shadows for realism.
        meshChild.castShadow = true;
      }
    });
    return newScene;
  }, [scene]);

  // useFrame is a hook that runs on every single rendered frame.
  // This is where we update the model's opacity for the animation.
  useFrame((state, delta) => {
    // Determine the target opacity: 1 if active (visible), 0 if not.
    const targetOpacity = isActive ? 1.0 : 0.0;
    
    // Traverse the model again to update every mesh's material.
    clonedScene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
          const meshChild = child as THREE.Mesh;
          // THREE.MathUtils.lerp provides a smooth transition from the current
          // opacity to the target opacity. 'delta * 2.0' controls the speed.
          meshChild.material.opacity = THREE.MathUtils.lerp(meshChild.material.opacity, targetOpacity, delta * 2.0);
      }
    });
  });

  // A primitive is a way to directly inject a Three.js object into the scene.
  // We always render it; its visibility is controlled by its opacity.
  return <primitive object={clonedScene} scale={scale} position={[0, -1.5, 0]} />;
}


// This is the main component that orchestrates the scene.
export default function EvolutionScene() {
  // State to track which model is currently active (visible).
  const [activeIndex, setActiveIndex] = useState(0);

  // This effect sets up an interval to cycle through the models.
  useEffect(() => {
    const interval = setInterval(() => {
      // Cycle to the next model index, looping back to 0 at the end.
      setActiveIndex((current) => (current + 1) % modelData.length);
    }, 4000); // Change model every 4 seconds.

    // Cleanup the interval when the component is unmounted to prevent memory leaks.
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 z-0">
      <Canvas camera={{ position: [0, 0.5, 7], fov: 50 }} shadows>
        {/* Suspense is a React feature for handling async operations like loading models. */}
        <Suspense fallback={null}>
          {/* Environment provides realistic, image-based lighting and reflections. */}
          <Environment preset="apartment" />
          
          {/* We map over our model data and render a SingleModel component for each one.
              The `isActive` prop controls which one is currently fading in. */}
          {modelData.map((data, index) => (
            <SingleModel 
              key={data.path} 
              path={data.path} 
              scale={data.scale}
              isActive={index === activeIndex} 
            />
          ))}

          {/* This mesh acts as an invisible ground plane to receive shadows. */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, 0]} receiveShadow>
              <planeGeometry args={[100, 100]} />
              <shadowMaterial opacity={0.4} />
          </mesh>
        </Suspense>

        {/* --- Lighting Setup --- */}
        <ambientLight intensity={0.5} />
        {/* A directional light acts like the sun and is the primary source for shadows. */}
        <directionalLight 
          position={[5, 5, 5]} 
          intensity={1.5} 
          castShadow 
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        
        {/* Preload all assets for a smoother experience. */}
        <Preload all />
      </Canvas>
    </div>
  );
}
