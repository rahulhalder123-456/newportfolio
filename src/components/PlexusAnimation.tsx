'use client';

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

// A single point in the plexus
function Node({ position, originalPosition, repulsor, time }: { position: THREE.Vector3, originalPosition: THREE.Vector3, repulsor: THREE.Vector3, time: number }) {
  const ref = useRef<THREE.Mesh>(null!);
  
  // Dynamic movement and repulsor effect
  useFrame(() => {
    const pos = position.clone();
    
    // Oscillation
    const oscillation = Math.sin(time + originalPosition.x) * 0.1;
    pos.add(new THREE.Vector3(oscillation, Math.cos(time + originalPosition.y) * 0.1, 0));

    // Repulsor effect from mouse
    const distanceToRepulsor = pos.distanceTo(repulsor);
    if (distanceToRepulsor < 2) {
      const repulseFactor = (2 - distanceToRepulsor) / 2;
      const direction = pos.clone().sub(repulsor).normalize();
      pos.add(direction.multiplyScalar(repulseFactor * 0.5));
    }

    ref.current.position.lerp(pos, 0.1);
  });

  return (
    <mesh ref={ref} position={position}>
      <sphereGeometry args={[0.04, 16, 16]} />
      <meshStandardMaterial color="hsl(var(--primary))" emissive="hsl(var(--primary))" emissiveIntensity={0.8} />
    </mesh>
  );
}

// The main plexus structure
const PlexusStructure = () => {
  const groupRef = useRef<THREE.Group>(null!);
  const lineRef = useRef<THREE.LineSegments>(null!);
  const mouseLightRef = useRef<THREE.PointLight>(null!);
  const repulsor = useMemo(() => new THREE.Vector3(1000, 1000, 1000), []);
  let time = 0;

  // Memoize nodes so they don't get re-created on every render
  const nodes = useMemo(() => {
    const numNodes = 150;
    const tempNodes: THREE.Vector3[] = [];
    for (let i = 0; i < numNodes; i++) {
        const theta = Math.random() * 2 * Math.PI;
        const phi = Math.acos(2 * Math.random() - 1);
        const r = Math.pow(Math.random(), 0.75) * 4.5;
        tempNodes.push(new THREE.Vector3(
            r * Math.sin(phi) * Math.cos(theta),
            r * Math.sin(phi) * Math.sin(theta),
            r * Math.cos(phi)
        ));
    }
    return tempNodes;
  }, []);

  const originalPositions = useMemo(() => nodes.map(n => n.clone()), [nodes]);

  useFrame((state, delta) => {
    time += delta;
    if (groupRef.current) {
        groupRef.current.rotation.y += delta * 0.02;
    }

    // Update mouse repulsor and light position
    const { pointer, viewport } = state;
    const targetX = pointer.x * viewport.width / 2;
    const targetY = pointer.y * viewport.height / 2;
    repulsor.lerp(new THREE.Vector3(targetX, targetY, 0), 0.1);
    if (mouseLightRef.current) {
        mouseLightRef.current.position.lerp(new THREE.Vector3(targetX, targetY, 4), 0.1);
    }
    
    if (lineRef.current && groupRef.current) {
        // Animate Edges (lines)
        const positions = lineRef.current.geometry.attributes.position.array as Float32Array;
        let vertexpos = 0;
        let numConnected = 0;
        const connectionDistance = 1.6;

        for (let i = 0; i < nodes.length; i++) {
          for (let j = i + 1; j < nodes.length; j++) {
            const nodeA = (groupRef.current.children[i] as THREE.Mesh)?.position;
            const nodeB = (groupRef.current.children[j] as THREE.Mesh)?.position;

            if (nodeA && nodeB) {
                const dist = nodeA.distanceTo(nodeB);

                if (dist < connectionDistance) {
                  positions[vertexpos++] = nodeA.x;
                  positions[vertexpos++] = nodeA.y;
                  positions[vertexpos++] = nodeA.z;
                  positions[vertexpos++] = nodeB.x;
                  positions[vertexpos++] = nodeB.y;
                  positions[vertexpos++] = nodeB.z;
                  
                  numConnected++;
                }
            }
          }
        }

        lineRef.current.geometry.setDrawRange(0, numConnected * 2);
        lineRef.current.geometry.attributes.position.needsUpdate = true;
        (lineRef.current.material as THREE.Material).opacity = 0.2 + Math.sin(time * 0.5) * 0.2;
    }
  });

  return (
    <>
      <pointLight ref={mouseLightRef} intensity={15} color="hsl(var(--accent))" distance={10} />
      <group ref={groupRef}>
        {nodes.map((pos, i) => (
          <Node key={i} position={pos} originalPosition={originalPositions[i]} repulsor={repulsor} time={time} />
        ))}
      </group>
      <lineSegments ref={lineRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={nodes.length * nodes.length}
            array={new Float32Array(nodes.length * nodes.length * 3)}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color="hsl(var(--accent))" transparent opacity={0.3} />
      </lineSegments>
    </>
  );
};

// Background starfield for added depth
function Starfield() {
    const ref = useRef<any>();
    const positions = useMemo(() => {
        const count = 5000;
        const pos = new Float32Array(count * 3);
        for(let i = 0; i < count; i++) {
            pos[i * 3 + 0] = (Math.random() - 0.5) * 20;
            pos[i * 3 + 1] = (Math.random() - 0.5) * 20;
            pos[i * 3 + 2] = (Math.random() - 0.5) * 20;
        }
        return pos;
    }, []);

    useFrame((_, delta) => {
        if (ref.current) {
            ref.current.rotation.x += delta * 0.01;
            ref.current.rotation.y += delta * 0.02;
        }
    });

    return (
        <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
            <PointMaterial transparent color="hsl(var(--foreground))" size={0.01} sizeAttenuation={true} depthWrite={false} opacity={0.5} />
        </Points>
    );
}

export default function PlexusAnimation() {
  return (
    <div className="absolute inset-0 z-0 flex items-center justify-center overflow-hidden pointer-events-none opacity-50">
      <Canvas camera={{ position: [0, 0, 8], fov: 75 }}>
        <ambientLight intensity={0.2} />
        <PlexusStructure />
        <Starfield />
      </Canvas>
    </div>
  );
}
