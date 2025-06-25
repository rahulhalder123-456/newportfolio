'use client';

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, Box, Cylinder, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

const skinMaterial = new THREE.MeshStandardMaterial({ color: '#f0c5a1', roughness: 0.8, transparent: true });
const darkFurMaterial = new THREE.MeshStandardMaterial({ color: '#3a302d', roughness: 0.9, transparent: true });
const metalMaterial = new THREE.MeshStandardMaterial({ color: '#888', roughness: 0.2, metalness: 0.9, transparent: true });
const eyeMaterial = new THREE.MeshStandardMaterial({ color: 'hsl(var(--accent))', emissive: 'hsl(var(--accent))', emissiveIntensity: 3, transparent: true });
const clothMaterial = new THREE.MeshStandardMaterial({ color: '#6d5d4b', roughness: 1, transparent: true });

// --- Stage 1: Ape ---
const Ape = React.forwardRef((props, ref: any) => (
  <group {...props} ref={ref}>
    <group position={[0, -0.2, 0]}>
        {/* Torso */}
        <Sphere position={[0, 0.5, 0]} args={[0.9, 16, 12]} material={darkFurMaterial} castShadow />
        {/* Head */}
        <Sphere position={[0, 1.5, 0.1]} args={[0.6, 16, 16]} material={darkFurMaterial} castShadow />
        <Sphere position={[0, 1.4, 0.6]} args={[0.2, 16, 16]} material={skinMaterial} castShadow /> 
        {/* Arms */}
        <Cylinder position={[-1.2, 0.4, -0.1]} args={[0.2, 0.2, 1.8, 8]} rotation={[0.4, 0, 0.9]} material={darkFurMaterial} castShadow />
        <Cylinder position={[1.2, 0.4, -0.1]} args={[0.2, 0.2, 1.8, 8]} rotation={[0.4, 0, -0.9]} material={darkFurMaterial} castShadow />
        {/* Legs */}
        <Cylinder position={[-0.5, -0.8, 0]} args={[0.25, 0.2, 1.4, 8]} rotation={[0, 0, -0.5]} material={darkFurMaterial} castShadow />
        <Cylinder position={[0.5, -0.8, 0]} args={[0.25, 0.2, 1.4, 8]} rotation={[0, 0, 0.5]} material={darkFurMaterial} castShadow />
    </group>
  </group>
));
Ape.displayName = "Ape";

// --- Stage 2: Homo Erectus (Caveman) ---
const HomoErectus = React.forwardRef((props, ref: any) => (
  <group {...props} ref={ref}>
    <group position={[0, 0.5, 0]}>
        {/* Torso */}
        <Box position={[0, 0, 0]} args={[1.2, 1.6, 0.8]} material={skinMaterial} castShadow />
        <Box position={[0, -0.1, 0]} args={[1.3, 0.6, 0.9]} material={clothMaterial} />
        {/* Head */}
        <Sphere position={[0, 1.3, 0]} args={[0.5, 16, 16]} material={skinMaterial} castShadow />
        {/* Arms */}
        <Cylinder position={[-1, 0.4, 0]} args={[0.18, 0.15, 1.5, 8]} rotation={[0, 0, 0.3]} material={skinMaterial} castShadow />
        <Cylinder position={[1, 0.4, 0]} args={[0.18, 0.15, 1.5, 8]} rotation={[0, 0, -0.3]} material={skinMaterial} castShadow />
        {/* Legs */}
        <Cylinder position={[-0.4, -1.4, 0]} args={[0.2, 0.18, 1.2, 8]} material={skinMaterial} castShadow />
        <Cylinder position={[0.4, -1.4, 0]} args={[0.2, 0.18, 1.2, 8]} material={skinMaterial} castShadow />
        {/* Spear */}
        <Cylinder args={[0.05, 0.05, 3, 6]} position={[1.2, 0, 0.5]} rotation={[1, 0, -0.5]} material={clothMaterial} />
        <Cylinder args={[0.1, 0, 0.3, 4]} position={[1.8, 1.1, -0.1]} rotation={[1, 0, -0.5]} material={metalMaterial} />
    </group>
  </group>
));
HomoErectus.displayName = "HomoErectus";

// --- Stage 3: Modern Human ---
const Human = React.forwardRef((props, ref: any) => (
  <group {...props} ref={ref}>
    <group position={[0, 0.8, 0]}>
        {/* Torso */}
        <Box position={[0, 0, 0]} args={[1, 1.8, 0.6]} material={clothMaterial} castShadow />
        {/* Head */}
        <Sphere position={[0, 1.5, 0]} args={[0.5, 24, 24]} material={skinMaterial} castShadow />
        {/* Arms */}
        <Cylinder position={[-0.8, 0.5, 0]} args={[0.15, 0.12, 1.8, 8]} rotation={[0, 0, 0.1]} material={skinMaterial} castShadow />
        <Cylinder position={[0.8, 0.5, 0]} args={[0.15, 0.12, 1.8, 8]} rotation={[0, 0, -0.1]} material={skinMaterial} castShadow />
        {/* Legs */}
        <Cylinder position={[-0.3, -1.5, 0]} args={[0.18, 0.15, 1.5, 8]} material={clothMaterial} castShadow />
        <Cylinder position={[0.3, -1.5, 0]} args={[0.18, 0.15, 1.5, 8]} material={clothMaterial} castShadow />
    </group>
  </group>
));
Human.displayName = "Human";

// --- Stage 4: Cyborg ---
const Cyborg = React.forwardRef((props, ref: any) => (
  <group {...props} ref={ref}>
     <group position={[0, 0.8, 0]}>
        {/* Torso */}
        <Box position={[0, 0, 0]} args={[1, 1.8, 0.6]} material={clothMaterial} castShadow />
        {/* Head */}
        <Sphere position={[0, 1.5, 0]} args={[0.5, 24, 24]} material={skinMaterial} castShadow />
        {/* Cybernetic Eye */}
        <Sphere position={[0.2, 1.6, 0.45]} args={[0.1, 16, 16]} material={eyeMaterial} />
        {/* Arms (one robotic) */}
        <Cylinder position={[-0.8, 0.5, 0]} args={[0.15, 0.12, 1.8, 8]} rotation={[0, 0, 0.1]} material={metalMaterial} castShadow />
        <Cylinder position={[0.8, 0.5, 0]} args={[0.15, 0.12, 1.8, 8]} rotation={[0, 0, -0.1]} material={skinMaterial} castShadow />
        {/* Legs (one robotic) */}
        <Cylinder position={[-0.3, -1.5, 0]} args={[0.18, 0.15, 1.5, 8]} material={clothMaterial} castShadow />
        <Cylinder position={[0.3, -1.5, 0]} args={[0.18, 0.15, 1.5, 8]} material={metalMaterial} castShadow />
     </group>
  </group>
));
Cyborg.displayName = "Cyborg";

// --- Component to manage the animation cycle ---
const AnimatedEvolution = () => {
    const modelRefs = useMemo(() => [
        React.createRef<THREE.Group>(),
        React.createRef<THREE.Group>(),
        React.createRef<THREE.Group>(),
        React.createRef<THREE.Group>(),
    ], []);

    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        const cycleDuration = 4; // Seconds per model
        const totalDuration = cycleDuration * modelRefs.length;
        const timeInCycle = t % totalDuration;
        
        modelRefs.forEach((modelRef, index) => {
            const model = modelRef.current;
            if (!model) return;

            const modelStartTime = index * cycleDuration;
            const modelEndTime = modelStartTime + cycleDuration;
            
            let opacity = 0;
            const fadeInDuration = 0.25; 
            const fadeOutStartTime = 0.75;
            
            if (timeInCycle >= modelStartTime && timeInCycle < modelEndTime) {
              const progress = (timeInCycle - modelStartTime) / cycleDuration;
              if (progress < fadeInDuration) {
                opacity = progress / fadeInDuration;
              } else if (progress > fadeOutStartTime) {
                opacity = 1.0 - ((progress - fadeOutStartTime) / (1.0 - fadeOutStartTime));
              } else {
                opacity = 1.0;
              }
            }
            
            model.visible = opacity > 0;
            model.traverse((child) => {
                if (child instanceof THREE.Mesh) {
                    const material = child.material as THREE.MeshStandardMaterial;
                    material.opacity = THREE.MathUtils.clamp(opacity, 0, 1);
                }
            });
        });
    });

    return (
        <>
            <Ape ref={modelRefs[0]} />
            <HomoErectus ref={modelRefs[1]} />
            <Human ref={modelRefs[2]} />
            <Cyborg ref={modelRefs[3]} />
        </>
    );
};

export default function EvolutionScene() {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas camera={{ position: [0, 1, 8], fov: 50 }} shadows>
        <ambientLight intensity={1.0} />
        <directionalLight 
          position={[10, 10, 5]} 
          intensity={1.5} 
          color="hsl(var(--accent))"
          castShadow 
        />
        <pointLight 
          position={[-10, -5, -10]} 
          intensity={1} 
          color="hsl(var(--primary))" 
        />
        <group position={[0, -1.2, 0]}>
          <AnimatedEvolution />
        </group>
        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} target={[0, 0.5, 0]} />
      </Canvas>
    </div>
  );
}
