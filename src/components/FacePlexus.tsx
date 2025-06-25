
'use client';

import React, { useRef, useMemo } from 'react';
import { Canvas, useLoader, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Points, PointMaterial } from '@react-three/drei';
import { type PointLight } from 'three';

// This component has been re-engineered for performance.
// It uses a single <Points> object instead of hundreds of individual <mesh> components.
// All animation logic is handled in a single `useFrame` loop, which directly
// manipulates the geometry's data buffers for maximum speed, eliminating lag.
function PointCloudFace() {
  const texture = useLoader(THREE.TextureLoader, '/mine.png');
  const lightRef = useRef<PointLight>(null!);
  const mousePos = useRef(new THREE.Vector3(10000, 10000, 10000));
  const pointsRef = useRef<any>(null);

  // Memoize the initial particle data calculation
  const { initialPositions, lineGeometry } = useMemo(() => {
    const data = {
      initialPositions: new Float32Array(),
      lineGeometry: null as THREE.BufferGeometry | null,
    };
    
    // This is the fix: Add a more robust check to ensure the image is fully loaded.
    // This prevents a race condition where processing happens on an incomplete image.
    if (!texture || !texture.image?.complete || !texture.image?.naturalWidth) {
      return data;
    }

    const img = texture.image;
    const canvas = document.createElement('canvas');
    const samplingStep = 4; // Sample every 4th pixel
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return data;

    ctx.drawImage(img, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixelData = imageData.data;
    const connections: number[] = [];
    const pointGrid: (THREE.Vector3 | null)[][] = [];

    const particles: THREE.Vector3[] = [];
    const scale = 3.5; // Adjusted for a balanced size.

    for (let y = 0; y < canvas.height; y += samplingStep) {
      pointGrid[y] = [];
      for (let x = 0; x < canvas.width; x += samplingStep) {
        const i = (y * canvas.width + x) * 4;
        const alpha = pixelData[i + 3];
        const brightness = (pixelData[i] + pixelData[i + 1] + pixelData[i + 2]) / 3;

        if (alpha > 128 && brightness > 30) {
          const posX = (x / canvas.width - 0.5) * scale;
          const posY = -(y / canvas.height - 0.5) * scale;
          const posZ = (brightness / 255 - 0.5) * 0.5;
          const newPoint = new THREE.Vector3(posX, posY, posZ);
          particles.push(newPoint);
          pointGrid[y][x] = newPoint;

          // Optimized connection logic
          if (x > 0 && pointGrid[y][x - samplingStep]) {
            connections.push(...newPoint.toArray(), ...pointGrid[y][x - samplingStep]!.toArray());
          }
          if (y > 0 && pointGrid[y - samplingStep]?.[x]) {
            connections.push(...newPoint.toArray(), ...pointGrid[y - samplingStep][x]!.toArray());
          }

        } else {
          pointGrid[y][x] = null;
        }
      }
    }
    
    data.initialPositions = new Float32Array(particles.length * 3);
    for (let i = 0; i < particles.length; i++) {
        particles[i].toArray(data.initialPositions, i * 3);
    }
    
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(connections, 3));
    data.lineGeometry = geometry;

    return data;
  }, [texture]);
  
  const { originalPositions, colors } = useMemo(() => {
    const original = new Float32Array(initialPositions);
    const colorBuffer = new Float32Array(initialPositions.length);
    const primaryColor = new THREE.Color("hsl(var(--primary))");
    for (let i = 0; i < initialPositions.length / 3; i++) {
      primaryColor.toArray(colorBuffer, i * 3);
    }
    return { originalPositions: original, colors: colorBuffer };
  }, [initialPositions]);

  const primaryColor = useMemo(() => new THREE.Color("hsl(var(--primary))"), []);
  const hoverColor = useMemo(() => new THREE.Color("hsl(var(--accent))"), []);
  
  useFrame((state) => {
    const { pointer, viewport } = state;
    if (!pointsRef.current || !pointsRef.current.geometry.attributes.position) return;
    
    const targetMouseX = (pointer.x * viewport.width) / 2;
    const targetMouseY = (pointer.y * viewport.height) / 2;

    mousePos.current.lerp(new THREE.Vector3(targetMouseX, targetMouseY, 1), 0.1);
    
    if (lightRef.current) {
        lightRef.current.position.lerp(new THREE.Vector3(targetMouseX, targetMouseY, 2), 0.1);
    }
    
    const positions = pointsRef.current.geometry.attributes.position.array;
    const currentColors = pointsRef.current.geometry.attributes.color.array;
    
    for (let i = 0; i < originalPositions.length / 3; i++) {
      const i3 = i * 3;
      
      const pos = new THREE.Vector3(originalPositions[i3], originalPositions[i3+1], originalPositions[i3+2]);
      const distanceToMouse = pos.distanceTo(mousePos.current);
      const repulsionRadius = 1.2;
      const targetPos = pos.clone();

      if (distanceToMouse < repulsionRadius) {
        const repulsionStrength = (1 - distanceToMouse / repulsionRadius) * 1.5;
        const direction = targetPos.clone().sub(mousePos.current).normalize();
        targetPos.add(direction.multiplyScalar(repulsionStrength));
      }
      
      const currentPos = new THREE.Vector3(positions[i3], positions[i3+1], positions[i3+2]);
      currentPos.lerp(targetPos, 0.1);
      currentPos.toArray(positions, i3);

      const colorRadius = 0.8;
      const tempColor = new THREE.Color().fromArray(currentColors, i3);
      
      if (distanceToMouse < colorRadius) {
        tempColor.lerp(hoverColor, 0.2);
      } else {
        tempColor.lerp(primaryColor, 0.15);
      }
      tempColor.toArray(currentColors, i3);
    }
    
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
    pointsRef.current.geometry.attributes.color.needsUpdate = true;
  });

  if (!initialPositions.length) {
    return null; // Don't render anything if there are no points yet
  }

  return (
    <>
      <pointLight ref={lightRef} intensity={4} color="hsl(var(--accent))" distance={4} />
      <group>
        <Points ref={pointsRef} frustumCulled={false}>
          <bufferGeometry>
              <bufferAttribute
                  attach="attributes-position"
                  count={originalPositions.length / 3}
                  array={originalPositions}
                  itemSize={3}
              />
              <bufferAttribute
                  attach="attributes-color"
                  count={colors.length / 3}
                  array={colors}
                  itemSize={3}
              />
          </bufferGeometry>
          <PointMaterial
              transparent
              vertexColors
              size={0.04}
              sizeAttenuation={true}
              depthWrite={false}
          />
        </Points>
        {lineGeometry && (
          <lineSegments geometry={lineGeometry}>
            <lineBasicMaterial color="hsl(var(--accent))" transparent opacity={0.15} />
          </lineSegments>
        )}
      </group>
    </>
  );
}


export default function FacePlexus() {
    if (typeof window === 'undefined') {
        return null;
    }
    
    return (
        <div className="absolute inset-0 z-0 flex items-center justify-center overflow-hidden pointer-events-none">
            <Canvas camera={{ position: [0, 0, 4.5], fov: 75 }} performance={{ min: 0.5 }}>
                <ambientLight intensity={0.5} color="hsl(var(--primary))" />
                <React.Suspense fallback={null}>
                    <PointCloudFace />
                </React.Suspense>
            </Canvas>
        </div>
    );
}
