'use client';

import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Box } from '@react-three/drei';
import * as THREE from 'three';

const Robot = () => {
    const groupRef = useRef<THREE.Group>(null!);
    const headRef = useRef<THREE.Mesh>(null!);
    const leftArmRef = useRef<THREE.Mesh>(null!);
    const rightArmRef = useRef<THREE.Mesh>(null!);
    const leftLegRef = useRef<THREE.Mesh>(null!);
    const rightLegRef = useRef<THREE.Mesh>(null!);

    useFrame(({ clock }) => {
        const t = clock.getElapsedTime();
        // Bobbing body
        if (groupRef.current) {
            groupRef.current.position.y = Math.sin(t * 4) * 0.1 - 0.2;
        }
        // Waving arms
        if (leftArmRef.current) {
            leftArmRef.current.rotation.x = Math.sin(t * 5) * 0.8;
        }
        if (rightArmRef.current) {
            rightArmRef.current.rotation.x = -Math.sin(t * 5) * 0.8;
        }
        // "Dancing" legs
        if (leftLegRef.current) {
            leftLegRef.current.rotation.x = Math.cos(t * 5) * 0.6;
        }
        if (rightLegRef.current) {
            rightLegRef.current.rotation.x = -Math.cos(t * 5) * 0.6;
        }
        // Nodding head
        if (headRef.current) {
            headRef.current.rotation.y = Math.sin(t * 2) * 0.5;
        }
    });

    const material = <meshStandardMaterial color="hsl(var(--primary))" emissive="hsl(var(--primary))" emissiveIntensity={0.3} roughness={0.4} />;

    return (
        <group ref={groupRef} scale={0.5} rotation={[0.3, 0.5, 0]}>
            {/* Head */}
            <Box ref={headRef} args={[0.8, 0.8, 0.8]} position={[0, 1.6, 0]}>
                {material}
            </Box>
            {/* Body */}
            <Box args={[1, 1.5, 0.5]} position={[0, 0.5, 0]}>
                {material}
            </Box>
            {/* Left Arm */}
            <Box ref={leftArmRef} args={[0.25, 1.2, 0.25]} position={[-0.7, 0.8, 0]}>
                {material}
            </Box>
            {/* Right Arm */}
            <Box ref={rightArmRef} args={[0.25, 1.2, 0.25]} position={[0.7, 0.8, 0]}>
                {material}
            </Box>
            {/* Left Leg */}
            <Box ref={leftLegRef} args={[0.3, 1.2, 0.3]} position={[-0.3, -0.9, 0]}>
                {material}
            </Box>
            {/* Right Leg */}
            <Box ref={rightLegRef} args={[0.3, 1.2, 0.3]} position={[0.3, -0.9, 0]}>
                {material}
            </Box>
        </group>
    );
};


export default function DancingRobot() {
  return (
    <div className="absolute inset-0 z-0 opacity-15 pointer-events-none">
        <Canvas camera={{ position: [0, 1, 5], fov: 50 }}>
            <ambientLight intensity={0.5} />
            <pointLight position={[5, 5, 5]} intensity={1} />
            <pointLight position={[-5, -5, -5]} intensity={0.5} color="hsl(var(--accent))" />
            <Robot />
        </Canvas>
    </div>
  );
}
