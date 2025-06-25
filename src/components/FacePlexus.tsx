
'use client';

import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import { type Mesh } from 'three';

// A single particle (dot) in the face point cloud
function Particle({ originalPosition, mousePos }: { originalPosition: THREE.Vector3, mousePos: React.MutableRefObject<THREE.Vector3> }) {
  const ref = useRef<Mesh>(null!);
  const position = useMemo(() => originalPosition.clone(), [originalPosition]);

  // Pre-calculate colors for performance
  const originalColor = useMemo(() => new THREE.Color("hsl(var(--primary))"), []);
  const hoverColor = useMemo(() => new THREE.Color("hsl(var(--accent))"), []);


  useFrame((state, delta) => {
    if (!ref.current) return;

    // This is the target position
    const target = originalPosition.clone();
    
    // Repulsion logic
    const distanceToMouse = target.distanceTo(mousePos.current);
    const repulsionRadius = 1.5;
    if (distanceToMouse < repulsionRadius) {
      const repulsionStrength = (1 - distanceToMouse / repulsionRadius) * 3.5;
      const direction = target.clone().sub(mousePos.current).normalize();
      target.add(direction.multiplyScalar(repulsionStrength));
    }

    // Smoothly move the particle to its target position (original + repulsion)
    position.lerp(target, 0.08);
    ref.current.position.copy(position);

    // Color change on hover
    const colorRadius = 1.0;
    const materialColor = (ref.current.material as THREE.MeshStandardMaterial).color;
    
    if (distanceToMouse < colorRadius) {
        materialColor.lerp(hoverColor, 0.1);
    } else {
        materialColor.lerp(originalColor, 0.1);
    }
  });

  return (
    <mesh ref={ref} position={originalPosition}>
      <sphereGeometry args={[0.018, 8, 8]} />
      <meshStandardMaterial color={originalColor} emissive="hsl(var(--primary))" emissiveIntensity={0.8} roughness={0.2} />
    </mesh>
  );
}

// The main component that orchestrates the scene
function PointCloudFace() {
  const [particles, setParticles] = useState<THREE.Vector3[]>([]);
  const texture = useLoader(THREE.TextureLoader, '/mine.png');
  const groupRef = useRef<THREE.Group>(null!);
  const mousePos = useRef(new THREE.Vector3(10000, 10000, 10000)); // Start mouse way off screen

  // This effect runs once to sample the image and create particle positions
  useEffect(() => {
    if (!texture) return;

    const img = texture.image;
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;
    
    ctx.drawImage(img, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    const sampledPoints: THREE.Vector3[] = [];
    const samplingStep = 3; // Increase particle density for clarity
    const scale = 5; // How large the face appears

    for (let y = 0; y < canvas.height; y += samplingStep) {
      for (let x = 0; x < canvas.width; x += samplingStep) {
        const i = (y * canvas.width + x) * 4;
        const alpha = data[i + 3];
        const brightness = (data[i] + data[i+1] + data[i+2]) / 3;

        // Only create points for non-transparent and non-dark pixels to focus on face
        if (alpha > 128 && brightness > 40) {
          const posX = (x / canvas.width - 0.5) * scale;
          const posY = -(y / canvas.height - 0.5) * scale;
          const posZ = (brightness / 255 - 0.5) * 0.7; // Use brightness for depth
          
          sampledPoints.push(new THREE.Vector3(posX, posY, posZ));
        }
      }
    }
    setParticles(sampledPoints);
  }, [texture]);

  // Create the connecting lines geometry, runs only when particles change
  const lineGeometry = useMemo(() => {
    if (particles.length === 0) return null;

    const connections: number[] = [];
    const connectionDistance = 0.12; // Adjusted for density

    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dist = particles[i].distanceTo(particles[j]);
        if (dist < connectionDistance) {
          connections.push(...particles[i].toArray(), ...particles[j].toArray());
        }
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(connections, 3));
    return geometry;
  }, [particles]);

  // Update mouse position and remove auto-rotation
  useFrame((state) => {
    // Map mouse screen coords to 3D world coords
    const { pointer, viewport } = state;
    mousePos.current.x = (pointer.x * viewport.width) / 2;
    mousePos.current.y = (pointer.y * viewport.height) / 2;
  });

  return (
    <group ref={groupRef}>
      {particles.map((pos, i) => (
        <Particle key={i} originalPosition={pos} mousePos={mousePos} />
      ))}
      {lineGeometry && (
        <lineSegments geometry={lineGeometry}>
          <lineBasicMaterial color="hsl(var(--accent))" transparent opacity={0.15} />
        </lineSegments>
      )}
    </group>
  );
}

export default function FacePlexus() {
    if (typeof window === 'undefined') {
        return null;
    }
    
    return (
        <div className="absolute inset-0 z-0 flex items-center justify-center overflow-hidden pointer-events-auto opacity-50">
            <Canvas camera={{ position: [0, 0, 4], fov: 75 }}>
                <ambientLight intensity={1} />
                <pointLight position={[0, 0, 5]} intensity={5} color="hsl(var(--primary))" />
                <React.Suspense fallback={null}>
                    <PointCloudFace />
                </React.Suspense>
            </Canvas>
        </div>
    );
}
