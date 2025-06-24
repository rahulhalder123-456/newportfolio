'use client';

import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Torus } from '@react-three/drei';
import { type Mesh } from 'three';

const AnimatedTorus = () => {
  const ref1 = useRef<Mesh>(null!);
  const ref2 = useRef<Mesh>(null!);

  useFrame(() => {
    if (ref1.current) {
      ref1.current.rotation.x += 0.01;
      ref1.current.rotation.y += 0.02;
    }
    if (ref2.current) {
      ref2.current.rotation.x -= 0.02;
      ref2.current.rotation.y -= 0.01;
    }
  });

  return (
    <>
      <Torus ref={ref1} args={[1, 0.1, 16, 100]} >
        <meshStandardMaterial color="hsl(var(--primary))" emissive="hsl(var(--primary))" emissiveIntensity={0.5} roughness={0.4} />
      </Torus>
      <Torus ref={ref2} args={[0.8, 0.1, 16, 100]} rotation={[Math.PI / 2, 0, 0]}>
         <meshStandardMaterial color="hsl(var(--accent))" emissive="hsl(var(--accent))" emissiveIntensity={0.5} roughness={0.4} />
      </Torus>
    </>
  );
};

export default function LoadingSpinner() {
  return (
    <div className="w-full h-64 flex items-center justify-center">
        <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} />
            <AnimatedTorus />
        </Canvas>
    </div>
  );
}
