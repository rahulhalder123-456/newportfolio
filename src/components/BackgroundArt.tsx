'use client';

import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial } from '@react-three/drei';
import { type Mesh } from 'three';

const AnimatedSphere = () => {
  const ref = useRef<Mesh>(null!);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.x = state.clock.getElapsedTime() * 0.1;
      ref.current.rotation.y = state.clock.getElapsedTime() * 0.1;
    }
  });

  return (
    <Sphere ref={ref} args={[1, 64, 64]}>
      <MeshDistortMaterial
        color="hsl(var(--accent))"
        attach="material"
        distort={0.4}
        speed={1}
        roughness={0.5}
      />
    </Sphere>
  );
};

export default function BackgroundArt() {
  return (
    <div className="pointer-events-none absolute -right-48 top-1/2 -z-10 h-[500px] w-[500px] -translate-y-1/2 opacity-15 hidden lg:block">
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
        <ambientLight intensity={0.8} />
        <pointLight position={[10, 10, 5]} intensity={1} color="hsl(var(--primary))" />
        <AnimatedSphere />
      </Canvas>
    </div>
  );
}
