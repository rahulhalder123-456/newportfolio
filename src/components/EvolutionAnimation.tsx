
'use client';

import React, { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

// This component loads a GLB file that you need to provide.
// Place your `evolution.glb` file in the `public/` directory.
// The model is expected to have 3 objects named: "Ape", "Human", and "Cyborg".
useGLTF.preload('/evolution.glb');

const easeInOutCubic = (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

function EvolutionModel() {
    // Load the GLB model from the public folder
    const { scene } = useGLTF('/evolution.glb');

    // Prepare memoized references to the models and set their materials to be transparent
    const nodes = useMemo(() => {
        const ape = scene.getObjectByName('Ape');
        const human = scene.getObjectByName('Human');
        const cyborg = scene.getObjectByName('Cyborg');

        [ape, human, cyborg].forEach(node => {
            if (node) {
                node.traverse(child => {
                    if (child instanceof THREE.Mesh) {
                        child.material = child.material.clone();
                        child.material.transparent = true;
                        child.material.opacity = 0; // Start invisible
                    }
                });
            }
        });

        return { ape, human, cyborg };
    }, [scene]);

    const groupRef = useRef<THREE.Group>(null!);
    const cycleDuration = 12; // Total time for one full A-H-C cycle
    const transitionTime = 1.5; // Fade duration
    const stageDuration = cycleDuration / 3;

    useFrame(({ clock }) => {
        if (!groupRef.current || !nodes.ape || !nodes.human || !nodes.cyborg) return;

        // Gentle rotation of the whole scene
        groupRef.current.rotation.y = clock.getElapsedTime() * 0.15;
        const time = clock.getElapsedTime() % cycleDuration;

        // Function to set opacity on a model
        const setOpacity = (node: THREE.Object3D | undefined, opacity: number) => {
            if (!node) return;
            node.traverse(child => {
                if (child instanceof THREE.Mesh) {
                    child.material.opacity = opacity;
                }
            });
        };

        // Calculate opacity for each stage based on the animation cycle time
        const calculateOpacity = (stageStartTime: number) => {
            if (time < stageStartTime || time > stageStartTime + stageDuration) return 0;
            const localTime = time - stageStartTime;
            // Fade in at the start of the stage, fade out at the end
            const fadeIn = easeInOutCubic(Math.min(1, localTime / transitionTime));
            const fadeOut = 1 - easeInOutCubic(Math.max(0, (localTime - (stageDuration - transitionTime)) / transitionTime));
            return Math.min(fadeIn, fadeOut);
        }

        // Apply the calculated opacity to each model
        setOpacity(nodes.ape, calculateOpacity(0));
        setOpacity(nodes.human, calculateOpacity(stageDuration));
        setOpacity(nodes.cyborg, calculateOpacity(stageDuration * 2));
    });

    // Use <primitive> to render the entire loaded scene
    // The model is scaled down and positioned appropriately
    return <primitive ref={groupRef} object={scene} scale={0.9} position={[0, -1.2, 0]} />;
}


export default function EvolutionAnimation() {
  return (
    <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
      <Canvas camera={{ position: [0, 1.5, 8], fov: 50 }}>
        <ambientLight intensity={1.2} />
        <pointLight position={[5, 5, 5]} intensity={1.5} color="hsl(var(--primary))" />
        <pointLight position={[-5, 5, -5]} intensity={1} color="hsl(var(--accent))" />
        {/* Use Suspense to show a fallback while the model loads */}
        <Suspense fallback={null}>
            <EvolutionModel />
        </Suspense>
      </Canvas>
    </div>
  );
}
