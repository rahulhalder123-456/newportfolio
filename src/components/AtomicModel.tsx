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

const Molecule = () => {
    const groupRef = useRef<THREE.Group>(null!);
    
    const atoms = useMemo(() => {
        const points = [];
        points.push({ pos: [0, 0, 0], color: "hsl(var(--primary))", size: 0.4 }); // Central atom
        const numOuter = 6;
        const radius = 1.5;
        for (let i = 0; i < numOuter; i++) {
            const phi = Math.acos(-1 + (2 * i) / (numOuter -1));
            const theta = Math.sqrt(numOuter * Math.PI) * phi;
            points.push({
                pos: [
                    Math.cos(theta) * Math.sin(phi) * radius, 
                    Math.sin(theta) * Math.sin(phi) * radius, 
                    Math.cos(phi) * radius
                ],
                color: "hsl(var(--accent))",
                size: 0.25
            });
        }
        return points;
    }, []);

    const bonds = useMemo(() => {
        const centralAtomPos = atoms[0].pos;
        return atoms.slice(1).map(atom => ({ start: centralAtomPos, end: atom.pos }));
    }, [atoms]);

    useFrame((state) => {
        if (groupRef.current) {
            groupRef.current.rotation.x = state.clock.getElapsedTime() * 0.1;
            groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.2;
        }
    });

    return (
        <group ref={groupRef}>
            {atoms.map((atom, i) => (
                <Atom key={i} position={atom.pos as [number, number, number]} color={atom.color} size={atom.size} />
            ))}
            {bonds.map((bond, i) => (
                <Bond key={i} start={bond.start as [number, number, number]} end={bond.end as [number, number, number]} />
            ))}
        </group>
    );
};


export default function AtomicModel() {
  return (
    <Canvas camera={{ position: [0, 1, 8], fov: 50 }}>
      <ambientLight intensity={1.5} />
      <pointLight position={[10, 10, 10]} intensity={2} />
      <pointLight position={[-10, -10, -10]} intensity={1} color="hsl(var(--accent))" />
      <Molecule />
    </Canvas>
  );
}
