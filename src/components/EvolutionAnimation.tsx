
'use client';

import React, { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Box, Sphere, Cylinder } from '@react-three/drei';
import * as THREE from 'three';

const easeInOutCubic = (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

// --- Model Components ---

const ApeModel = ({ material }: { material: THREE.MeshStandardMaterial }) => (
  <group>
    <Box args={[1, 1.2, 1]} material={material} position={[0, 0.6, 0]} castShadow />
    <Box args={[0.4, 0.8, 0.4]} material={material} position={[-0.7, 0.4, 0]} castShadow />
    <Box args={[0.4, 0.8, 0.4]} material={material} position={[0.7, 0.4, 0]} castShadow />
    <Box args={[0.5, 0.6, 0.5]} material={material} position={[-0.3, -0.6, 0]} castShadow />
    <Box args={[0.5, 0.6, 0.5]} material={material} position={[0.3, -0.6, 0]} castShadow />
  </group>
);

const HumanModel = ({ material }: { material: THREE.MeshStandardMaterial }) => (
  <group>
    <Box args={[0.5, 0.5, 0.5]} material={material} position={[0, 1.95, 0]} castShadow />
    <Box args={[1, 1.2, 0.6]} material={material} position={[0, 1.1, 0]} castShadow />
    <Cylinder args={[0.15, 0.15, 1.2]} material={material} position={[-0.7, 1.1, 0]} castShadow />
    <Cylinder args={[0.15, 0.15, 1.2]} material={material} position={[0.7, 1.1, 0]} castShadow />
    <Cylinder args={[0.2, 0.2, 1.4]} material={material} position={[-0.3, -0.2, 0]} castShadow />
    <Cylinder args={[0.2, 0.2, 1.4]} material={material} position={[0.3, -0.2, 0]} castShadow />
  </group>
);

const CyborgModel = ({ material }: { material: THREE.MeshStandardMaterial }) => (
    <group>
        {/* Head */}
        <Sphere args={[0.3, 32, 32]} material={material} position={[0, 2.0, 0]} castShadow />
        {/* Torso */}
        <Box args={[1, 1.2, 0.6]} material={material} position={[0, 1.1, 0]} castShadow />
        {/* Left Arm */}
        <group position={[-0.7, 1.1, 0]}>
            <Cylinder args={[0.1, 0.1, 0.8]} material={material} position={[0, 0, 0]} castShadow />
            <Sphere args={[0.15, 16, 16]} material={material} position={[0, -0.4, 0]} castShadow />
        </group>
        {/* Right Arm */}
        <group position={[0.7, 1.1, 0]}>
            <Cylinder args={[0.1, 0.1, 0.8]} material={material} position={[0, 0, 0]} castShadow />
            <Sphere args={[0.15, 16, 16]} material={material} position={[0, -0.4, 0]} castShadow />
        </group>
        {/* Legs */}
        <Cylinder args={[0.15, 0.1, 1.4]} material={material} position={[-0.3, -0.2, 0]} castShadow />
        <Cylinder args={[0.15, 0.1, 1.4]} material={material} position={[0.3, -0.2, 0]} castShadow />
    </group>
);

function EvolutionStage() {
    const groupRef = useRef<THREE.Group>(null!);
    const materials = useMemo(() => ({
        ape: new THREE.MeshStandardMaterial({ color: '#5C3D2E', transparent: true, opacity: 0 }),
        human: new THREE.MeshStandardMaterial({ color: '#C0A080', transparent: true, opacity: 0 }),
        cyborg: new THREE.MeshStandardMaterial({ color: 'hsl(var(--primary))', transparent: true, opacity: 0 }),
    }), []);
    
    const cycleDuration = 12; // Total time for one full A-H-C cycle
    const transitionTime = 1.5; // Fade duration
    const stageDuration = cycleDuration / 3;

    useFrame(({ clock }) => {
        if (!groupRef.current) return;

        groupRef.current.rotation.y = clock.getElapsedTime() * 0.15;
        const time = clock.getElapsedTime() % cycleDuration;

        const calculateOpacity = (stageStartTime: number) => {
            if (time < stageStartTime || time > stageStartTime + stageDuration) return 0;
            const localTime = time - stageStartTime;
            const fadeIn = easeInOutCubic(Math.min(1, localTime / transitionTime));
            const fadeOut = 1 - easeInOutCubic(Math.max(0, (localTime - (stageDuration - transitionTime)) / transitionTime));
            return Math.min(fadeIn, fadeOut);
        }

        materials.ape.opacity = calculateOpacity(0);
        materials.human.opacity = calculateOpacity(stageDuration);
        materials.cyborg.opacity = calculateOpacity(stageDuration * 2);
    });

    return (
        <group ref={groupRef} scale={1.2} position={[0, -1, 0]}>
            <ApeModel material={materials.ape} />
            <HumanModel material={materials.human} />
            <CyborgModel material={materials.cyborg} />
        </group>
    );
}

export default function EvolutionAnimation() {
  return (
    <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
      <Canvas camera={{ position: [0, 1.5, 8], fov: 50 }} shadows>
        <ambientLight intensity={1.2} />
        <pointLight position={[5, 5, 5]} intensity={1.5} color="hsl(var(--primary))" castShadow />
        <pointLight position={[-5, 5, -5]} intensity={1} color="hsl(var(--accent))" />
        <Suspense fallback={null}>
            <EvolutionStage />
        </Suspense>
      </Canvas>
    </div>
  );
}
