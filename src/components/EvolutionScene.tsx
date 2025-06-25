'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { Suspense, useState, useEffect, useRef } from 'react';
import { OrbitControls, useGLTF, Stage, Preload } from '@react-three/drei';
import * as THREE from 'three';

const modelPaths = [
  '/models/ape.glb',
  '/models/homo_erectus.glb',
  '/models/modern_human.glb',
  '/models/cyborg.glb'
];

// Preload all models to prevent loading flashes between transitions
modelPaths.forEach(useGLTF.preload);

/**
 * A component that loads a single GLB model and controls its visibility
 * with a smooth fade effect.
 */
function SingleModel({ path, isActive }: { path: string, isActive: boolean }) {
  const { scene } = useGLTF(path);
  const groupRef = useRef<THREE.Group>(null!);

  // This effect runs once when the model is loaded.
  // It traverses the model's meshes and sets their materials to be transparent,
  // which is required for the opacity animation to work.
  useEffect(() => {
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        child.material.transparent = true;
      }
    });
  }, [scene]);

  // This hook runs on every frame, animating the model's opacity.
  useFrame(() => {
    if (!groupRef.current) return;
    
    // The target opacity is 1 if the model is active, and 0 otherwise.
    const targetOpacity = isActive ? 1 : 0;

    // We loop through each mesh in the loaded model.
    groupRef.current.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        // We use linear interpolation (lerp) to smoothly animate the opacity
        // from its current value towards the target value.
        child.material.opacity += (targetOpacity - child.material.opacity) * 0.05;
      }
    });
  });

  // We render the model using the <primitive> element from react-three-fiber.
  return <primitive object={scene} ref={groupRef} scale={1.5} position={[0, -0.5, 0]} />;
}


export default function EvolutionScene() {
  const [activeIndex, setActiveIndex] = useState(0);

  // This effect sets up an interval to cycle through the models.
  useEffect(() => {
    const interval = setInterval(() => {
      // Move to the next model in the array, looping back to the start.
      setActiveIndex((current) => (current + 1) % modelPaths.length);
    }, 4000); // Change model every 4 seconds

    // Clean up the interval when the component unmounts.
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
            {/* We render a SingleModel component for each path. The isActive prop controls which one is visible. */}
            {modelPaths.map((path, index) => (
              <SingleModel key={path} path={path} isActive={index === activeIndex} />
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
