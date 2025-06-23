'use client';

import React, { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import type { Points as PointsType } from 'three';

function DataStream({ count, color }: { count: number, color: string }) {
  const ref = useRef<PointsType>(null!);

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
        let i3 = i * 3;
        pos[i3] = (Math.random() * 2 - 1) * 20; // x: -20 to 20
        pos[i3 + 1] = (Math.random() * 2 - 1) * 5; // y: -5 to 5
        pos[i3 + 2] = (Math.random() * 2 - 1) * 2; // z
    }
    return pos;
  }, [count]);

  useFrame((state, delta) => {
    if (ref.current) {
        const positions = ref.current.geometry.attributes.position.array as Float32Array;
        for (let i = 0; i < count; i++) {
            const i3 = i * 3;
            // Move particles to the right
            positions[i3] += delta * 1.5;
            
            // If particle goes off-screen, reset it to the left
            if (positions[i3] > 20) {
                positions[i3] = -20;
            }
        }
        ref.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color={color}
        size={0.03}
        sizeAttenuation={true}
        depthWrite={false}
      />
    </Points>
  );
}

export default function FooterArt() {
  return (
    <div className="absolute inset-0 -z-10 opacity-30">
      <Canvas camera={{ position: [0, 0, 10], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <DataStream count={1500} color="hsl(var(--primary))" />
        <DataStream count={1500} color="hsl(var(--accent))" />
      </Canvas>
    </div>
  );
}
