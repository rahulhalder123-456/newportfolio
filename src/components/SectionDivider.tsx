
'use client';

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, Line } from '@react-three/drei';
import * as THREE from 'three';

const Atom = ({ position, color = "hsl(var(--primary))", size = 0.1 }: { position: [number, number, number], color?: string, size?: number }) => (
  <Sphere position={position} args={[size, 16, 16]}>
    <meshStandardMaterial color={color} roughness={0.5} metalness={0.1} emissive={color} emissiveIntensity={0.2} />
  </Sphere>
);

const Bond = ({ start, end }: { start: [number, number, number], end: [number, number, number] }) => (
    <Line points={[start, end]} color="hsl(var(--foreground))" lineWidth={1.5} transparent opacity={0.3} />
);

const Network = () => {
    const groupRef = useRef<THREE.Group>(null!);
    
    const { atoms, bonds } = useMemo(() => {
        const numAtoms = 50;
        const volumeSizeX = 30;
        const volumeSizeY = 4;
        const volumeSizeZ = 4;
        const bondThreshold = 2.5;
        const atomPoints = [];

        for (let i = 0; i < numAtoms; i++) {
            atomPoints.push({
                pos: new THREE.Vector3(
                    (Math.random() - 0.5) * volumeSizeX,
                    (Math.random() - 0.5) * volumeSizeY,
                    (Math.random() - 0.5) * volumeSizeZ
                ),
                color: Math.random() > 0.5 ? "hsl(var(--accent))" : "hsl(var(--primary))",
                size: Math.random() * 0.1 + 0.05
            });
        }

        const generatedBonds = [];
        for (let i = 0; i < numAtoms; i++) {
            for (let j = i + 1; j < numAtoms; j++) {
                const dist = atomPoints[i].pos.distanceTo(atomPoints[j].pos);
                if (dist < bondThreshold) {
                    generatedBonds.push({
                        start: atomPoints[i].pos.toArray(),
                        end: atomPoints[j].pos.toArray()
                    });
                }
            }
        }

        return { atoms: atomPoints, bonds: generatedBonds };
    }, []);

    useFrame((state) => {
        if (groupRef.current) {
            groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.03;
            groupRef.current.rotation.x = state.clock.getElapsedTime() * 0.02;
        }
    });

    return (
        <group ref={groupRef}>
            {atoms.map((atom, i) => (
                <Atom key={i} position={atom.pos.toArray() as [number, number, number]} color={atom.color} size={atom.size} />
            ))}
            {bonds.map((bond, i) => (
                <Bond key={i} start={bond.start as [number, number, number]} end={bond.end as [number, number, number]} />
            ))}
        </group>
    );
};


export default function SectionDivider() {
  return (
    <div className="h-40 w-full relative pointer-events-none">
      <Canvas camera={{ position: [0, 0, 8], fov: 75 }}>
        <fog attach="fog" args={['hsl(var(--background))', 10, 25]} />
        <ambientLight intensity={1.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="hsl(var(--accent))" />
        <Network />
      </Canvas>
    </div>
  );
}
