'use client';

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import type { Points as PointsType } from 'three';

function Starfield() {
  const ref = useRef<PointsType>(null!);
  
  const positions = useMemo(() => {
    const count = 5000;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        // Generate in a wide, flat area to create a "band" effect
        pos[i3] = (Math.random() - 0.5) * 50; // Wider spread
        pos[i3 + 1] = (Math.random() - 0.5) * 4;  // Flatter than before
        pos[i3 + 2] = (Math.random() - 0.5) * 30;
    }
    return pos;
  }, []);

  useFrame((state, delta) => {
    if (ref.current) {
        const currentPositions = ref.current.geometry.attributes.position.array as Float32Array;
        const speed = delta * 0.4;

        for (let i = 0; i < currentPositions.length; i += 3) {
            currentPositions[i + 2] += speed;
            
            if (currentPositions[i + 2] > 15) {
                currentPositions[i + 2] = -15;
            }
        }
        ref.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        // Using a muted foreground color for a classier, more subtle effect
        color="hsl(var(--muted-foreground))" 
        size={0.02}
        sizeAttenuation={true}
        depthWrite={false}
      />
    </Points>
  );
}

export default function HyperloopDivider() {
  return (
    <div className="h-40 w-full relative pointer-events-none">
      <Canvas camera={{ position: [0, 0, 10], fov: 75 }}>
        {/* Adjusting fog to be more subtle and start closer */}
        <fog attach="fog" args={['hsl(var(--background))', 10, 20]} />
        <Starfield />
      </Canvas>
    </div>
  );
}
