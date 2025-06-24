
'use client';

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import type { Points as PointsType } from 'three';

function Starfield({ count, speedFactor }: { count: number, speedFactor: number }) {
  const ref = useRef<PointsType>(null!);
  
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
        let i3 = i * 3;
        pos[i3] = (Math.random() - 0.5) * 30;
        pos[i3 + 1] = (Math.random() - 0.5) * 30;
        pos[i3 + 2] = (Math.random() - 0.5) * 30;
    }
    return pos;
  }, [count]);

  useFrame((state, delta) => {
    if (ref.current) {
        const currentPositions = ref.current.geometry.attributes.position.array as Float32Array;
        const speed = delta * speedFactor * 50;

        for (let i = 0; i < count; i++) {
            const i3 = i * 3;
            currentPositions[i3 + 2] += speed;
            
            if (currentPositions[i3 + 2] > 15) {
                currentPositions[i3 + 2] = -15;
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
