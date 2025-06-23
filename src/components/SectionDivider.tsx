'use client';

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';

function ParticleSystem({ count, color, speedFactor }: { count: number, color: string, speedFactor: number }) {
  const ref = useRef<any>();
  
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
        let i3 = i * 3;
        pos[i3] = (Math.random() - 0.5) * 30;     // Spread wide on x-axis
        pos[i3 + 1] = (Math.random() - 0.5) * 2; // Narrow on y-axis
        pos[i3 + 2] = (Math.random() - 0.5) * 3; // Narrow depth on z-axis
    }
    return pos;
  }, [count]);

  useFrame((state, delta) => {
    if(ref.current) {
        ref.current.rotation.y += (delta * speedFactor) / 15;
    }
  });

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color={color}
        size={0.02}
        sizeAttenuation={true}
        depthWrite={false}
      />
    </Points>
  );
}

export default function SectionDivider() {
  return (
    <div className="h-64 w-full relative -my-24 pointer-events-none opacity-20">
      <Canvas camera={{ position: [0, 0, 5] }}>
        <ParticleSystem count={2000} color="hsl(var(--primary))" speedFactor={0.5} />
        <ParticleSystem count={2000} color="hsl(var(--accent))" speedFactor={0.7} />
      </Canvas>
    </div>
  );
}
