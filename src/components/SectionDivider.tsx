'use client';

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import type { Points as PointsType } from 'three';

function ParticleSystem({ count, color, speedFactor }: { count: number, color: string, speedFactor: number }) {
  const ref = useRef<PointsType>(null!);
  
  const { positions, randomFactors } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const rand = new Float32Array(count);
    for (let i = 0; i < count; i++) {
        let i3 = i * 3;
        pos[i3] = (Math.random() - 0.5) * 40; // x spread
        pos[i3 + 1] = (Math.random() - 0.5) * 5;  // initial y spread
        pos[i3 + 2] = (Math.random() - 0.5) * 5;  // initial z spread
        rand[i] = Math.random();
    }
    return { positions: pos, randomFactors: rand };
  }, [count]);

  useFrame((state) => {
    if (ref.current) {
        const currentPositions = ref.current.geometry.attributes.position.array as Float32Array;
        const time = state.clock.getElapsedTime() * speedFactor;

        for (let i = 0; i < count; i++) {
            const i3 = i * 3;
            const initialX = positions[i3];
            const randomFactor = randomFactors[i];

            // Gentle wave motion
            currentPositions[i3 + 1] = Math.sin(time + initialX * 0.1 + randomFactor * Math.PI) * 1.0;
        }

        ref.current.geometry.attributes.position.needsUpdate = true;
        ref.current.rotation.y = time * 0.02; // Slower rotation
    }
  });

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color={color}
        size={0.02} // Smaller particles
        sizeAttenuation={true}
        depthWrite={false}
      />
    </Points>
  );
}

export default function SectionDivider() {
  return (
    <div className="h-40 w-full relative pointer-events-none opacity-40 -my-16">
      <Canvas camera={{ position: [0, 0, 10] }}>
        <ParticleSystem count={1500} color="hsl(var(--primary))" speedFactor={0.2} />
        <ParticleSystem count={1500} color="hsl(var(--accent))" speedFactor={0.25} />
      </Canvas>
    </div>
  );
}
