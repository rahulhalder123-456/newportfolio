'use client';

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, Line } from '@react-three/drei';
import * as THREE from 'three';

const Atom = ({ position, color = "hsl(var(--primary))", size = 0.3 }: { position: [number, number, number], color?: string, size?: number }) => (
  <Sphere position={position} args={[size, 32, 32]}>
    <meshStandardMaterial color={color} roughness={0.5} metalness={0.1} />
  </Sphere>
);

const Bond = ({ start, end }: { start: [number, number, number], end: [number, number, number] }) => (
    <Line points={[start, end]} color="hsl(var(--foreground))" lineWidth={3} transparent opacity={0.5} />
);

const NetworkStructure = () => {
    const groupRef = useRef<THREE.Group>(null!);
    
    const { atoms, bonds } = useMemo(() => {
        const numAtoms = 30;
        const volumeSize = 12;
        const bondThreshold = 2.8;
        const atomPoints = [];

        // Generate random atom positions
        for (let i = 0; i < numAtoms; i++) {
            atomPoints.push({
                pos: new THREE.Vector3(
                    (Math.random() - 0.5) * volumeSize,
                    (Math.random() - 0.5) * (volumeSize / 2),
                    (Math.random() - 0.5) * (volumeSize / 4)
                ),
                color: Math.random() > 0.3 ? "hsl(var(--accent))" : "hsl(var(--primary))",
                size: Math.random() * 0.2 + 0.15
            });
        }

        const generatedBonds = [];
        // Generate bonds based on proximity
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
            groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.05;
            groupRef.current.rotation.x = state.clock.getElapsedTime() * 0.03;
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


export default function AtomicModel() {
  return (
    <Canvas camera={{ position: [0, 0, 10], fov: 75 }}>
      <ambientLight intensity={1.5} />
      <pointLight position={[10, 10, 10]} intensity={2} />
      <pointLight position={[-10, -10, -10]} intensity={1} color="hsl(var(--accent))" />
      <NetworkStructure />
    </Canvas>
  );
}
