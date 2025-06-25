
'use client';

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Sphere, Line } from '@react-three/drei';
import * as THREE from 'three';

const PlexusNode = ({ position }: { position: THREE.Vector3 }) => (
  <Sphere position={position} args={[0.03, 16, 16]}>
    <meshStandardMaterial color="hsl(var(--primary))" roughness={0.5} metalness={0.1} emissive="hsl(var(--primary))" emissiveIntensity={0.5} />
  </Sphere>
);

const PlexusEdge = ({ start, end, opacity }: { start: THREE.Vector3, end: THREE.Vector3, opacity: number }) => (
    <Line
        points={[start, end]}
        color="hsl(var(--accent))"
        lineWidth={1}
        transparent
        opacity={opacity}
    />
);

const PlexusStructure = () => {
    const groupRef = useRef<THREE.Group>(null!);
    const { viewport } = useThree();

    const { nodes, edges } = useMemo(() => {
        const numNodes = 100;
        const connectionDistance = 1.5;
        const nodePositions: THREE.Vector3[] = [];

        // Distribute nodes in a sphere for a more organic look
        for (let i = 0; i < numNodes; i++) {
            const theta = Math.random() * 2 * Math.PI;
            const phi = Math.acos(2 * Math.random() - 1);
            const r = Math.pow(Math.random(), 0.7) * 4;
            nodePositions.push(new THREE.Vector3(
                r * Math.sin(phi) * Math.cos(theta),
                r * Math.sin(phi) * Math.sin(theta),
                r * Math.cos(phi)
            ));
        }

        const edgeList: { start: THREE.Vector3, end: THREE.Vector3, opacity: number }[] = [];
        for (let i = 0; i < numNodes; i++) {
            for (let j = i + 1; j < numNodes; j++) {
                const dist = nodePositions[i].distanceTo(nodePositions[j]);
                if (dist < connectionDistance) {
                    edgeList.push({
                        start: nodePositions[i],
                        end: nodePositions[j],
                        opacity: 1.0 - (dist / connectionDistance) // Fade lines based on distance
                    });
                }
            }
        }

        return { nodes: nodePositions, edges: edgeList };
    }, []);

    useFrame((state) => {
        if (groupRef.current) {
            groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.05;
            groupRef.current.rotation.x = state.clock.getElapsedTime() * 0.03;

            // Follow mouse
            const { x, y } = state.mouse;
            groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, x * (viewport.width / 10), 0.05);
            groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, y * (viewport.height / 10), 0.05);
        }
    });

    return (
        <group ref={groupRef}>
            {nodes.map((pos, i) => <PlexusNode key={i} position={pos} />)}
            {edges.map((edge, i) => <PlexusEdge key={i} {...edge} />)}
        </group>
    );
};

export default function PlexusAnimation() {
  return (
    <div className="absolute inset-0 z-0 flex items-center justify-center overflow-hidden pointer-events-none opacity-40">
        <Canvas camera={{ position: [0, 0, 10], fov: 75 }}>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} color="hsl(var(--primary))" />
            <PlexusStructure />
        </Canvas>
    </div>
  );
}
