'use client';

import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Capsule, Box, Sphere } from '@react-three/drei';
import * as THREE from 'three';

const easeInOutCubic = (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

const CustomMaterial = () => (
    <meshStandardMaterial
      color="hsl(var(--primary))"
      roughness={0.6}
      metalness={0.2}
      transparent
    />
);

const CyborgMaterial = () => (
    <meshStandardMaterial
      color="hsl(var(--foreground))"
      roughness={0.4}
      metalness={0.8}
      transparent
    />
);

const EyeMaterial = () => (
    <meshStandardMaterial 
        emissive="hsl(var(--accent))" 
        emissiveIntensity={2} 
        transparent 
    />
)

const ApeModel = () => {
  return (
    <group position={[0, -1, 0]} rotation={[0, 0, -0.2]}>
      <Capsule args={[0.6, 0.8]} position={[0, 1, 0]} rotation={[0, 0, 0.4]}>
        <CustomMaterial />
      </Capsule>
      <Capsule args={[0.4, 0.3]} position={[0.4, 1.8, 0]}>
         <CustomMaterial />
      </Capsule>
      <Capsule args={[0.2, 1.2]} position={[-0.8, 1, 0.5]} rotation={[0, -0.5, -1.2]}>
        <CustomMaterial />
      </Capsule>
       <Capsule args={[0.2, 1.2]} position={[0.8, 0.6, -0.5]} rotation={[0, 0.5, 0.8]}>
        <CustomMaterial />
      </Capsule>
      <Capsule args={[0.3, 0.8]} position={[-0.3, 0, 0]} rotation={[0, 0, 0.5]}>
        <CustomMaterial />
      </Capsule>
       <Capsule args={[0.3, 0.8]} position={[0.3, 0, 0]} rotation={[0, 0, -0.2]}>
        <CustomMaterial />
      </Capsule>
    </group>
  );
};

const HumanModel = () => {
  return (
    <group position={[0, -1.2, 0]}>
      <Capsule args={[0.5, 1.2]} position={[0, 1.6, 0]}>
        <CustomMaterial />
      </Capsule>
      <Sphere args={[0.45]} position={[0, 2.5, 0]}>
        <CustomMaterial />
      </Sphere>
      <Capsule args={[0.15, 1]} position={[-0.7, 1.8, 0]} rotation={[0, 0, 0.2]}>
         <CustomMaterial />
      </Capsule>
      <Capsule args={[0.15, 1]} position={[0.7, 1.8, 0]} rotation={[0, 0, -0.2]}>
        <CustomMaterial />
      </Capsule>
      <Capsule args={[0.2, 1.2]} position={[-0.25, 0.4, 0]}>
         <CustomMaterial />
      </Capsule>
      <Capsule args={[0.2, 1.2]} position={[0.25, 0.4, 0]}>
         <CustomMaterial />
      </Capsule>
    </group>
  );
};

const CyborgModel = () => {
  return (
    <group position={[0, -1.2, 0]}>
      <Box args={[1, 1.4, 0.8]} position={[0, 1.6, 0]}>
        <CyborgMaterial />
      </Box>
      <Sphere args={[0.45]} position={[0, 2.5, 0]}>
        <CyborgMaterial />
      </Sphere>
      <Box args={[0.7, 0.15, 0.1]} position={[0, 2.55, 0.4]}>
        <EyeMaterial />
      </Box>
      <Capsule args={[0.15, 1]} position={[-0.7, 1.8, 0]} rotation={[0, 0, 0.2]}>
         <CyborgMaterial />
      </Capsule>
      <Capsule args={[0.15, 1]} position={[0.7, 1.8, 0]} rotation={[0, 0, -0.2]}>
         <CyborgMaterial />
      </Capsule>
      <Capsule args={[0.2, 1.2]} position={[-0.25, 0.4, 0]}>
         <CyborgMaterial />
      </Capsule>
      <Capsule args={[0.2, 1.2]} position={[0.25, 0.4, 0]}>
         <CyborgMaterial />
      </Capsule>
    </group>
  );
};

const EvolutionStage = () => {
    const groupRef = useRef<THREE.Group>(null!);
    const apeRef = useRef<THREE.Group>(null!);
    const humanRef = useRef<THREE.Group>(null!);
    const cyborgRef = useRef<THREE.Group>(null!);

    const cycleDuration = 12;
    const transitionTime = 1.5;
    const stageDuration = cycleDuration / 3;

    useFrame(({ clock }) => {
        if (!groupRef.current || !apeRef.current || !humanRef.current || !cyborgRef.current) return;

        groupRef.current.rotation.y = clock.getElapsedTime() * 0.15;
        const time = clock.getElapsedTime() % cycleDuration;

        const setOpacity = (ref: React.RefObject<THREE.Group>, opacity: number) => {
            ref.current?.traverse(child => {
                if (child instanceof THREE.Mesh) {
                   (child.material as THREE.MeshStandardMaterial).opacity = opacity;
                }
            });
        };

        const calculateOpacity = (stageStartTime: number) => {
            if (time < stageStartTime || time > stageStartTime + stageDuration) return 0;
            const localTime = time - stageStartTime;
            const fadeIn = easeInOutCubic(Math.min(1, localTime / transitionTime));
            const fadeOut = 1 - easeInOutCubic(Math.max(0, (localTime - (stageDuration - transitionTime)) / transitionTime));
            return Math.min(fadeIn, fadeOut);
        }

        setOpacity(apeRef, calculateOpacity(0));
        setOpacity(humanRef, calculateOpacity(stageDuration));
        setOpacity(cyborgRef, calculateOpacity(stageDuration * 2));
    });

    return (
        <group ref={groupRef} scale={0.9} position={[0, -0.5, 0]}>
            <group ref={apeRef}><ApeModel /></group>
            <group ref={humanRef}><HumanModel /></group>
            <group ref={cyborgRef}><CyborgModel /></group>
        </group>
    );
};

export default function EvolutionAnimation() {
  return (
    <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
      <Canvas camera={{ position: [0, 1.5, 8], fov: 50 }}>
        <ambientLight intensity={1.2} />
        <pointLight position={[5, 5, 5]} intensity={1.5} color="hsl(var(--primary))" />
        <pointLight position={[-5, 5, -5]} intensity={1} color="hsl(var(--accent))" />
        <EvolutionStage />
      </Canvas>
    </div>
  );
}
