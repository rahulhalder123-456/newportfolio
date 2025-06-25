
'use client';

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Box, Cylinder } from '@react-three/drei';
import * as THREE from 'three';

const Robot = () => {
    const robotRef = useRef<THREE.Group>(null!);
    
    // Part references
    const headRef = useRef<THREE.Mesh>(null!);
    const torsoRef = useRef<THREE.Mesh>(null!);
    const leftShoulderRef = useRef<THREE.Group>(null!);
    const rightShoulderRef = useRef<THREE.Group>(null!);
    const leftElbowRef = useRef<THREE.Group>(null!);
    const rightElbowRef = useRef<THREE.Group>(null!);
    const leftHipRef = useRef<THREE.Group>(null!);
    const rightHipRef = useRef<THREE.Group>(null!);
    const leftKneeRef = useRef<THREE.Group>(null!);
    const rightKneeRef = useRef<THREE.Group>(null!);

    const parts = useMemo(() => ({
        head: headRef,
        torso: torsoRef,
        leftShoulder: leftShoulderRef,
        rightShoulder: rightShoulderRef,
        leftElbow: leftElbowRef,
        rightElbow: rightElbowRef,
        leftHip: leftHipRef,
        rightHip: rightHipRef,
        leftKnee: leftKneeRef,
        rightKnee: rightKneeRef,
    }), []);

    const resetPose = () => {
        if (!robotRef.current) return;
        robotRef.current.position.set(0, 0, 0);
        robotRef.current.rotation.set(0, 0, 0);

        Object.values(parts).forEach(partRef => {
            if (partRef.current) {
                partRef.current.position.set(0,0,0);
                partRef.current.rotation.set(0,0,0);
            }
        });

        // Re-apply initial positions after reset
        if (headRef.current) headRef.current.position.y = 1.6;
        if (torsoRef.current) torsoRef.current.position.y = 0.5;
        if (leftShoulderRef.current) leftShoulderRef.current.position.set(-0.85, 1.2, 0);
        if (rightShoulderRef.current) rightShoulderRef.current.position.set(0.85, 1.2, 0);
        if (leftHipRef.current) leftHipRef.current.position.set(-0.4, -0.5, 0);
        if (rightHipRef.current) rightHipRef.current.position.set(0.4, -0.5, 0);
    };

    useFrame(({ clock }) => {
        if (!robotRef.current) return;
        
        const t = clock.getElapsedTime();
        const moveDuration = 4; // seconds per move
        const moveIndex = Math.floor(t / moveDuration) % 2; // Two moves for now
        const localTime = (t % moveDuration) / moveDuration * Math.PI * 2;

        resetPose();

        // Toprock Animation
        if (moveIndex === 0) {
            robotRef.current.position.y = Math.sin(localTime * 2) * 0.1 - 0.2; // Bobbing
            if (parts.torso.current) parts.torso.current.rotation.y = Math.sin(localTime * 0.75) * 0.2;
            if (parts.head.current) parts.head.current.rotation.y = Math.sin(localTime * 0.75) * -0.4;
            
            if (parts.leftShoulder.current) parts.leftShoulder.current.rotation.x = Math.sin(localTime * 1.5) * 0.8;
            if (parts.rightShoulder.current) parts.rightShoulder.current.rotation.x = -Math.sin(localTime * 1.5) * 0.8;
            
            if (parts.leftHip.current) parts.leftHip.current.rotation.x = -Math.sin(localTime * 1.5) * 0.6;
            if (parts.rightHip.current) parts.rightHip.current.rotation.x = Math.sin(localTime * 1.5) * 0.6;
        }

        // Windmill Animation
        if (moveIndex === 1) {
            robotRef.current.rotation.z = localTime * 2;
            robotRef.current.position.y = 0.5;

            if (parts.leftShoulder.current) parts.leftShoulder.current.rotation.z = Math.PI / 2;
            if (parts.rightShoulder.current) parts.rightShoulder.current.rotation.z = -Math.PI / 2;
            if (parts.leftHip.current) parts.leftHip.current.rotation.x = Math.PI / 4;
            if (parts.rightHip.current) parts.rightHip.current.rotation.x = -Math.PI / 4;
        }
    });

    const bodyMaterial = <meshPhongMaterial color="hsl(var(--primary))" emissive="hsl(var(--primary))" emissiveIntensity={0.2} roughness={0.6} shininess={80} />;
    const eyeMaterial = <meshPhongMaterial color="hsl(var(--accent))" emissive="hsl(var(--accent))" emissiveIntensity={0.5} />;

    return (
        <group ref={robotRef} scale={0.6} position={[0, -0.5, 0]} rotation={[0.3, 0.5, 0]}>
            {/* Head */}
            <Box ref={headRef} args={[1, 0.8, 0.8]} position={[0, 1.6, 0]}>
                {bodyMaterial}
                <Box args={[0.1, 0.1, 0.1]} position={[-0.2, 0.1, 0.4]}>
                    {eyeMaterial}
                </Box>
                <Box args={[0.1, 0.1, 0.1]} position={[0.2, 0.1, 0.4]}>
                    {eyeMaterial}
                </Box>
            </Box>
            {/* Torso */}
            <Box ref={torsoRef} args={[1.5, 1.8, 0.6]} position={[0, 0.5, 0]}>
                {bodyMaterial}
            </Box>
            {/* Left Arm */}
            <group ref={leftShoulderRef} position={[-0.85, 1.2, 0]}>
                <Cylinder args={[0.15, 0.15, 1]} position={[0, -0.5, 0]}>
                   {bodyMaterial}
                </Cylinder>
            </group>
            {/* Right Arm */}
            <group ref={rightShoulderRef} position={[0.85, 1.2, 0]}>
                <Cylinder args={[0.15, 0.15, 1]} position={[0, -0.5, 0]}>
                   {bodyMaterial}
                </Cylinder>
            </group>
            {/* Left Leg */}
            <group ref={leftHipRef} position={[-0.4, -0.5, 0]}>
                <Cylinder args={[0.2, 0.2, 1.2]} position={[0, -0.6, 0]}>
                   {bodyMaterial}
                </Cylinder>
            </group>
            {/* Right Leg */}
            <group ref={rightHipRef} position={[0.4, -0.5, 0]}>
                <Cylinder args={[0.2, 0.2, 1.2]} position={[0, -0.6, 0]}>
                   {bodyMaterial}
                </Cylinder>
            </group>
        </group>
    );
};


export default function DancingRobot() {
  return (
    <div className="absolute inset-0 z-0 opacity-15 pointer-events-none">
        <Canvas camera={{ position: [0, 1, 8], fov: 50 }}>
            <ambientLight intensity={0.7} />
            <spotLight position={[10, 10, 10]} angle={0.3} penumbra={1} intensity={2} castShadow />
            <pointLight position={[-8, 3, 5]} intensity={1} color="hsl(var(--accent))" />
            <pointLight position={[8, 3, -5]} intensity={1} color="hsl(var(--primary))" />
            <Robot />
        </Canvas>
    </div>
  );
}
