'use client';

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import type { Points as PointsType } from 'three';

function ParticleSystem({ count, color, speedFactor }: { count: number, color: string, speedFactor: number }) {
  const ref = useRef<PointsType>(null!);
  
  const { initialPositions, randomFactors } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const rand = new Float32Array(count);
    for (let i = 0; i < count; i++) {
        let i3 = i * 3;
        pos[i3] = (Math.random() - 0.5) * 40;
        pos[i3 + 1] = (Math.random() - 0.5) * 5;
        pos[i3 + 2] = (Math.random() - 0.5) * 5;
        rand[i] = Math.random();
    }
    return { initialPositions: pos, randomFactors: rand };
  }, [count]);

  useFrame((state) => {
    if (ref.current) {
        const positions = ref.current.geometry.attributes.position.array as Float32Array;
        const time = state.clock.getElapsedTime() * speedFactor;

        for (let i = 0; i < count; i++) {
            const i3 = i * 3;
            const initialX = initialPositions[i3];
            const randomFactor = randomFactors[i];

            positions[i3 + 1] = Math.sin(time + initialX * 0.3 + randomFactor * Math.PI) * 1.5;
        }

        ref.current.geometry.attributes.position.needsUpdate = true;
        ref.current.rotation.y = time * 0.05;
    }
  });

  return (
    <Points ref={ref} positions={initialPositions} stride={3} frustumCulled={false}>
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

export default function SectionDivider() {
  return (
    <div className="h-32 w-full relative pointer-events-none opacity-60">
      <Canvas camera={{ position: [0, 0, 10] }}>
        <ParticleSystem count={3000} color="hsl(var(--primary))" speedFactor={0.3} />
        <ParticleSystem count={3000} color="hsl(var(--accent))" speedFactor={0.4} />
      </Canvas>
    </div>
  );
}
