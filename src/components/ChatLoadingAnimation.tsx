
'use client';

import React, { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

function AnimatedSpherePoints() {
    const pointsRef = useRef<THREE.Points>(null!);
  
    const positions = useMemo(() => {
      const pos = new Float32Array(300 * 3);
      const radius = 0.8;
      for (let i = 0; i < 300; i++) {
        // This creates points on the surface of a sphere
        const theta = Math.random() * 2 * Math.PI;
        const phi = Math.acos(2 * Math.random() - 1);
        pos[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
        pos[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
        pos[i * 3 + 2] = radius * Math.cos(phi);
      }
      return pos;
    }, []);
  
    useFrame((state) => {
      if (pointsRef.current) {
        const time = state.clock.getElapsedTime();
        pointsRef.current.rotation.y = time * 0.5;
        pointsRef.current.rotation.x = time * 0.2;
      }
    });
  
    return (
      <Points ref={pointsRef} positions={positions}>
        <PointMaterial
          transparent
          color="hsl(var(--primary))"
          size={0.05}
          sizeAttenuation
          depthWrite={false}
        />
      </Points>
    );
  }

export default function ChatLoadingAnimation() {
  return (
    <div className="w-16 h-12">
      <Canvas camera={{ position: [0, 0, 2], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[2, 2, 2]} intensity={2} />
        <AnimatedSpherePoints />
      </Canvas>
    </div>
  );
}
