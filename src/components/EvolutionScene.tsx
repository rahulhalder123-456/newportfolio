'use client';

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, Box, Cylinder, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

// --- Reusable Materials ---
const skinMaterial = new THREE.MeshStandardMaterial({ color: 'hsl(var(--primary))', roughness: 0.8, transparent: true });
const metalMaterial = new THREE.MeshStandardMaterial({ color: '#888', roughness: 0.2, metalness: 0.9, transparent: true });
const eyeMaterial = new THREE.MeshStandardMaterial({ color: 'hsl(var(--accent))', emissive: 'hsl(var(--accent))', emissiveIntensity: 3, transparent: true });

// --- Stage 1: Ape ---
const Ape = React.forwardRef((props, ref: any) => (
  <group {...props} ref={ref}>
    <Box position={[0, -0.1, 0]} args={[1.2, 1, 1.2]} material={skinMaterial} castShadow />
    <Sphere position={[0, 1.1, 0.2]} args={[0.6, 16, 16]} material={skinMaterial} castShadow />
    <Cylinder position={[-0.9, 0.2, 0]} args={[0.15, 0.15, 1.4, 8]} rotation={[0, 0, 0.9]} material={skinMaterial} castShadow />
    <Cylinder position={[0.9, 0.2, 0]} args={[0.15, 0.15, 1.4, 8]} rotation={[0, 0, -0.9]} material={skinMaterial} castShadow />
    <Cylinder position={[-0.4, -1.3, 0]} args={[0.15, 0.15, 1.2, 8]} rotation={[0, 0, 0.2]} material={skinMaterial} castShadow />
    <Cylinder position={[0.4, -1.3, 0]} args={[0.15, 0.15, 1.2, 8]} rotation={[0, 0, -0.2]} material={skinMaterial} castShadow />
  </group>
));
Ape.displayName = "Ape";

// --- Stage 2: Homo Erectus (Caveman) ---
const HomoErectus = React.forwardRef((props, ref: any) => (
  <group {...props} ref={ref}>
    <Box position={[0, 0.25, 0]} args={[1.1, 1.1, 0.9]} material={skinMaterial} castShadow />
    <Sphere position={[0, 1.4, 0]} args={[0.5, 16, 16]} material={skinMaterial} castShadow />
    <Cylinder position={[-0.8, 0.6, 0]} args={[0.15, 0.15, 1.2, 8]} rotation={[0, 0, 0.4]} material={skinMaterial} castShadow />
    <Cylinder position={[0.8, 0.6, 0]} args={[0.15, 0.15, 1.2, 8]} rotation={[0, 0, -0.2]} material={skinMaterial} castShadow />
    <Cylinder position={[-0.3, -1.1, 0]} args={[0.15, 0.15, 1.2, 8]} material={skinMaterial} castShadow />
    <Cylinder position={[0.3, -1.1, 0]} args={[0.15, 0.15, 1.2, 8]} material={skinMaterial} castShadow />
    <Cylinder args={[0.2, 0.3, 2, 6]} position={[1.4, -0.5, 0.5]} rotation={[0, 0, -0.8]} material={skinMaterial} />
  </group>
));
HomoErectus.displayName = "HomoErectus";

// --- Stage 3: Modern Human ---
const Human = React.forwardRef((props, ref: any) => (
  <group {...props} ref={ref}>
    <Box position={[0, 0.5, 0]} args={[1, 1.5, 0.5]} material={skinMaterial} castShadow />
    <Sphere position={[0, 1.6, 0]} args={[0.6, 16, 16]} material={skinMaterial} castShadow />
    <Cylinder position={[-0.7, 0.8, 0]} args={[0.15, 0.15, 1.2, 8]} material={skinMaterial} castShadow />
    <Cylinder position={[0.7, 0.8, 0]} args={[0.15, 0.15, 1.2, 8]} material={skinMaterial} castShadow />
    <Cylinder position={[-0.3, -0.8, 0]} args={[0.15, 0.15, 1.2, 8]} material={skinMaterial} castShadow />
    <Cylinder position={[0.3, -0.8, 0]} args={[0.15, 0.15, 1.2, 8]} material={skinMaterial} castShadow />
  </group>
));
Human.displayName = "Human";

// --- Stage 4: Cyborg ---
const Cyborg = React.forwardRef((props, ref: any) => (
  <group {...props} ref={ref}>
    <Box position={[0, 0.5, 0]} args={[1, 1.5, 0.5]} material={skinMaterial} castShadow />
    <Sphere position={[0, 1.6, 0]} args={[0.6, 16, 16]} material={skinMaterial} castShadow />
    <Cylinder position={[-0.7, 0.8, 0]} args={[0.15, 0.15, 1.2, 8]} material={metalMaterial} castShadow />
    <Cylinder position={[0.7, 0.8, 0]} args={[0.15, 0.15, 1.2, 8]} material={skinMaterial} castShadow />
    <Cylinder position={[-0.3, -0.8, 0]} args={[0.15, 0.15, 1.2, 8]} material={metalMaterial} castShadow />
    <Cylinder position={[0.3, -0.8, 0]} args={[0.15, 0.15, 1.2, 8]} material={skinMaterial} castShadow />
    <Sphere position={[-0.2, 1.7, 0.55]} args={[0.1, 8, 8]} material={eyeMaterial} />
  </group>
));
Cyborg.displayName = "Cyborg";

// --- Component to manage the animation cycle ---
const AnimatedEvolution = () => {
    const apeRef = useRef<THREE.Group>(null!);
    const homoErectusRef = useRef<THREE.Group>(null!);
    const humanRef = useRef<THREE.Group>(null!);
    const cyborgRef = useRef<THREE.Group>(null!);

    const modelRefs = useMemo(() => [
        apeRef,
        homoErectusRef,
        humanRef,
        cyborgRef,
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
            const fadeInDuration = 0.25; // as a fraction of cycleDuration
            const fadeOutStartTime = 0.75; // as a fraction of cycleDuration
            
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
            <Ape ref={apeRef} />
            <HomoErectus ref={homoErectusRef} />
            <Human ref={humanRef} />
            <Cyborg ref={cyborgRef} />
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