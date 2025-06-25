'use client';

import React, { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, Preload } from '@react-three/drei';
import * as THREE from 'three';

// A component to load and prepare a model for animation.
// It forwards the ref to the underlying group so we can manipulate it.
const Model = React.forwardRef(({ path, ...props }, ref) => {
  const { scene } = useGLTF(path);
  // Clone the scene to create a unique instance for this component
  const clonedScene = useMemo(() => scene.clone(), [scene]);

  // Set initial properties on the model's materials
  useMemo(() => {
    clonedScene.traverse(child => {
      if (child.isMesh) {
        // Must clone material to avoid affecting other instances
        child.material = child.material.clone();
        child.material.transparent = true;
        child.material.opacity = 0; // Start invisible
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }, [clonedScene]);

  return <primitive ref={ref} object={clonedScene} {...props} />;
});
Model.displayName = "Model";


// An easing function for smooth transitions
const easeInOutCubic = (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

// The main scene component that orchestrates the evolution animation
function EvolutionStage() {
  const groupRef = useRef();
  
  // Create a ref for each model we want to animate
  const modelRefs = [useRef(), useRef(), useRef(), useRef()];

  // Define the paths to your models in the public/models/ directory
  const modelPaths = useMemo(() => [
    "/models/ape.glb",
    "/models/homo_erectus.glb",
    "/models/modern_human.glb",
    "/models/cyborg.glb",
  ], []);

  // Animation timing configuration
  const cycleDuration = 16; // 4 seconds per model
  const transitionTime = 1.5; // How long it takes to fade in/out
  const stageDuration = cycleDuration / modelPaths.length;

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    
    // Slowly rotate the entire group
    groupRef.current.rotation.y = clock.getElapsedTime() * 0.1;
    
    const time = clock.getElapsedTime() % cycleDuration;

    // Loop through each model and update its opacity based on the current time
    modelRefs.forEach((modelRef, index) => {
      if (modelRef.current) {
        const stageStartTime = index * stageDuration;
        let opacity = 0;

        // Check if the current model should be visible
        if (time >= stageStartTime && time < stageStartTime + stageDuration) {
          const localTime = time - stageStartTime;
          // Calculate fade in and fade out progress
          const fadeIn = easeInOutCubic(Math.min(1, localTime / transitionTime));
          const fadeOut = 1 - easeInOutCubic(Math.max(0, (localTime - (stageDuration - transitionTime)) / transitionTime));
          opacity = Math.min(fadeIn, fadeOut);
        }

        // Apply the calculated opacity to all materials in the model
        modelRef.current.traverse((child) => {
          if (child.isMesh) {
            child.material.opacity = opacity;
          }
        });
      }
    });
  });

  return (
    <group ref={groupRef} scale={1.8} position={[0, -1.8, 0]}>
      {modelPaths.map((path, index) => (
        <Model key={path} path={path} ref={modelRefs[index]} />
      ))}
    </group>
  );
}

// The main export that wraps the scene in a Canvas
export default function EvolutionAnimation() {
  return (
    <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
      <Canvas camera={{ position: [0, 1.5, 8], fov: 50 }} shadows>
        <ambientLight intensity={0.8} />
        <pointLight position={[5, 5, 5]} intensity={1.5} color="hsl(var(--primary))" castShadow />
        <pointLight position={[-5, 5, -5]} intensity={1} color="hsl(var(--accent))" />
        {/* Suspense is required for useGLTF */}
        <Suspense fallback={null}>
          <EvolutionStage />
          {/* Preload all assets for a smoother experience */}
          <Preload all />
        </Suspense>
      </Canvas>
    </div>
  );
}
