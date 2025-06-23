'use client';

import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, Stars, MeshDistortMaterial } from '@react-three/drei';
import { type Mesh } from 'three';

const AnimatedSphere = () => {
  const ref = useRef<Mesh>(null!);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.x = state.clock.getElapsedTime() * 0.2;
      ref.current.rotation.y = state.clock.getElapsedTime() * 0.2;
    }
  });

  return (
    <Sphere ref={ref} args={[1.2, 64, 64]}>
      <MeshDistortMaterial
        color="hsl(var(--primary))"
        attach="material"
        distort={0.5}
        speed={1.5}
        roughness={0.2}
      />
    </Sphere>
  );
};

export default function HackerSphere() {
  return (
    <div className="absolute inset-0 z-0 opacity-30">
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={2} color="hsl(var(--accent))" />
        <pointLight position={[-10, -10, -5]} intensity={1} color="hsl(var(--primary))" />
        <AnimatedSphere />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      </Canvas>
    </div>
  );
}
