'use client';

import React, { useRef, useMemo, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Box, Octahedron } from '@react-three/drei';
import * as THREE from 'three';

// Type definition for shape props
type ShapeType = 'box' | 'octahedron';

interface ShapeProps {
  position: [number, number, number];
  rotationSpeed: { x: number; y: number };
  shapeType: ShapeType;
}

const WireframeShape = ({ position, rotationSpeed, shapeType }: ShapeProps) => {
  const ref = useRef<THREE.Mesh>(null!);
  const [primaryColor, setPrimaryColor] = useState<string>('hsl(288 83% 54%)');

  useEffect(() => {
    const computedColor = getComputedStyle(document.documentElement)
      .getPropertyValue('--primary')
      .trim();
    if (computedColor) {
      setPrimaryColor(`hsl(${computedColor})`);
    }
  }, []);

  useFrame(() => {
    if (ref.current) {
      ref.current.rotation.x += rotationSpeed.x;
      ref.current.rotation.y += rotationSpeed.y;
    }
  });

  const material = <meshBasicMaterial color={primaryColor} wireframe />;

  return shapeType === 'box' ? (
    <Box ref={ref} position={position} args={[0.3, 0.3, 0.3]}>
      {material}
    </Box>
  ) : (
    <Octahedron ref={ref} position={position} args={[0.3]}>
      {material}
    </Octahedron>
  );
};

const Scene = () => {
  const shapes = useMemo<ShapeProps[]>(() => {
    const numShapes = 25;
    const volumeSize = 25;

    const shapeData: ShapeProps[] = [];
    for (let i = 0; i < numShapes; i++) {
      shapeData.push({
        position: [
          (Math.random() - 0.5) * volumeSize,
          (Math.random() - 0.5) * (volumeSize / 4),
          (Math.random() - 0.5) * 5 - 3,
        ],
        rotationSpeed: {
          x: (Math.random() - 0.5) * 0.005,
          y: (Math.random() - 0.5) * 0.005,
        },
        shapeType: (Math.random() > 0.5 ? 'box' : 'octahedron') as ShapeType,
      });
    }
    return shapeData;
  }, []);

  const groupRef = useRef<THREE.Group>(null!);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.x = Math.sin(state.clock.getElapsedTime() * 0.1) * 2;
    }
  });

  return (
    <group ref={groupRef}>
      {shapes.map((shape, i) => (
        <WireframeShape key={i} {...shape} />
      ))}
    </group>
  );
};

export default function Footer3DArt() {
  return (
    <Canvas camera={{ position: [0, 0, 10], fov: 50 }} gl={{ antialias: true }} dpr={[1, 2]}>
      <fog attach="fog" args={['#000000', 8, 20]} />
      <Suspense fallback={null}>
        <Scene />
      </Suspense>
    </Canvas>
  );
}
