'use client';

import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Box, Octahedron } from '@react-three/drei';
import * as THREE from 'three';

const WireframeShape = ({ position, rotationSpeed, shapeType }: { position: [number, number, number], rotationSpeed: { x: number, y: number }, shapeType: 'box' | 'octahedron' }) => {
    const ref = useRef<THREE.Mesh>(null!);
    const [primaryColor, setPrimaryColor] = useState('hsl(288 83% 54%)'); // Default fallback

    useEffect(() => {
        // This effect runs on the client after mount, ensuring document is available.
        const computedColor = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim();
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

    const material = <meshStandardMaterial color={primaryColor} wireframe emissive={primaryColor} emissiveIntensity={0.5} />;

    if (shapeType === 'box') {
        return (
            <Box ref={ref} position={position} args={[0.3, 0.3, 0.3]}>
                {material}
            </Box>
        );
    }
    
    return (
        <Octahedron ref={ref} position={position} args={[0.3]}>
            {material}
        </Octahedron>
    );
};

const Scene = () => {
    const shapes = useMemo(() => {
        const numShapes = 25;
        const volumeSize = 25;
        const shapeData = [];

        for (let i = 0; i < numShapes; i++) {
            shapeData.push({
                position: [
                    (Math.random() - 0.5) * volumeSize,
                    (Math.random() - 0.5) * (volumeSize / 4),
                    (Math.random() - 0.5) * 5 - 3, // Keep them in a relatively narrow z-band
                ] as [number, number, number],
                rotationSpeed: {
                    x: (Math.random() - 0.5) * 0.005,
                    y: (Math.random() - 0.5) * 0.005,
                },
                shapeType: Math.random() > 0.5 ? 'box' : 'octahedron' as 'box' | 'octahedron',
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
    <Canvas camera={{ position: [0, 0, 10], fov: 50 }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[0, 5, 5]} intensity={1} />
      <Scene />
    </Canvas>
  );
}
