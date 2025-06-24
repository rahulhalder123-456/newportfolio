
'use client';

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import type { Points as PointsType } from 'three';
import * as THREE from 'three';

function Starfield({ count = 5000, speedFactor = 0.1 }: { count: number, speedFactor: number }) {
  const ref = useRef<PointsType>(null!);
  
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const radius = 4; // The radius of the tunnel
    const length = 30; // The length of the tunnel

    for (let i = 0; i < count; i++) {
        let i3 = i * 3;
        
        const angle = Math.random() * Math.PI * 2;
        const r = radius + Math.random() * 2; // Add some variation to the radius

        pos[i3] = Math.cos(angle) * r;
        pos[i3 + 1] = Math.sin(angle) * r;
        pos[i3 + 2] = (Math.random() - 0.5) * length;
    }
    return pos;
  }, [count]);

  useFrame((state, delta) => {
    if (ref.current) {
        ref.current.rotation.z += delta * 0.05; // Gently rotate the tunnel
        const currentPositions = ref.current.geometry.attributes.position.array as Float32Array;
        const speed = delta * speedFactor * 80;
        const halfLength = 15;

        for (let i = 0; i < count; i++) {
            const i3 = i * 3;
            currentPositions[i3 + 2] += speed;
            
            if (currentPositions[i3 + 2] > halfLength) {
                currentPositions[i3 + 2] = -halfLength;
            }
        }
        ref.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="hsl(var(--primary))"
        size={0.03}
        sizeAttenuation={true}
        depthWrite={false}
      />
    </Points>
  );
}

export default function HyperloopAnimation() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 0.1], fov: 75 }}>
        <Starfield count={5000} speedFactor={0.1} />
      </Canvas>
    </div>
  );
}
