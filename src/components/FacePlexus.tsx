
'use client';

import React, { useRef, useMemo } from 'react';
import { Canvas, useLoader, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { type Mesh, type PointLight } from 'three';

function Particle({ originalPosition, mousePos }: { originalPosition: THREE.Vector3, mousePos: React.MutableRefObject<THREE.Vector3> }) {
  const ref = useRef<Mesh>(null!);
  const position = useMemo(() => originalPosition.clone(), [originalPosition]);

  const originalColor = useMemo(() => new THREE.Color("hsl(var(--primary))"), []);
  const hoverColor = useMemo(() => new THREE.Color("hsl(var(--accent))"), []);

  useFrame(() => {
    if (!ref.current) return;

    const target = originalPosition.clone();
    const distanceToMouse = target.distanceTo(mousePos.current);
    const repulsionRadius = 1.2;

    if (distanceToMouse < repulsionRadius) {
      const repulsionStrength = (1 - distanceToMouse / repulsionRadius) * 2.5;
      const direction = target.clone().sub(mousePos.current).normalize();
      target.add(direction.multiplyScalar(repulsionStrength));
    }

    position.lerp(target, 0.1);
    ref.current.position.copy(position);

    const material = ref.current.material as THREE.MeshStandardMaterial;
    const colorRadius = 0.8;

    if (distanceToMouse < colorRadius) {
      material.emissive.lerp(hoverColor, 0.2);
      material.emissiveIntensity = THREE.MathUtils.lerp(material.emissiveIntensity, 2.0, 0.2);
    } else {
      material.emissive.lerp(originalColor, 0.15);
      material.emissiveIntensity = THREE.MathUtils.lerp(material.emissiveIntensity, 0.5, 0.15);
    }
  });

  return (
    <mesh ref={ref} position={originalPosition}>
      <sphereGeometry args={[0.02, 8, 8]} />
      <meshStandardMaterial
        color={originalColor}
        emissive={originalColor}
        emissiveIntensity={0.5}
        roughness={0.5}
        metalness={0.1}
      />
    </mesh>
  );
}

function PointCloudFace() {
  const texture = useLoader(THREE.TextureLoader, '/mine.png');
  const lightRef = useRef<PointLight>(null!);
  const mousePos = useRef(new THREE.Vector3(10000, 10000, 10000));

  const { particles, lineGeometry } = useMemo(() => {
    const data = {
        particles: [] as THREE.Vector3[],
        lineGeometry: null as THREE.BufferGeometry | null,
    };
    if (!texture) return data;

    const img = texture.image;
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return data;

    ctx.drawImage(img, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixelData = imageData.data;
    const connections: number[] = [];
    const pointGrid: (THREE.Vector3 | null)[][] = [];

    const samplingStep = 4;
    const scale = 5;

    for (let y = 0; y < canvas.height; y += samplingStep) {
        if (!pointGrid[y]) pointGrid[y] = [];
        for (let x = 0; x < canvas.width; x += samplingStep) {
            const i = (y * canvas.width + x) * 4;
            const alpha = pixelData[i + 3];
            const brightness = (pixelData[i] + pixelData[i + 1] + pixelData[i + 2]) / 3;

            if (alpha > 128 && brightness > 60) {
                const posX = (x / canvas.width - 0.5) * scale;
                const posY = -(y / canvas.height - 0.5) * scale;
                const posZ = (brightness / 255 - 0.5) * 0.5;
                const newPoint = new THREE.Vector3(posX, posY, posZ);
                data.particles.push(newPoint);
                pointGrid[y][x] = newPoint;

                // Connect to the point to the left
                if (x >= samplingStep && pointGrid[y]?.[x - samplingStep]) {
                    connections.push(...newPoint.toArray(), ...pointGrid[y][x - samplingStep]!.toArray());
                }
                // Connect to the point above
                if (y >= samplingStep && pointGrid[y - samplingStep]?.[x]) {
                    connections.push(...newPoint.toArray(), ...pointGrid[y - samplingStep][x]!.toArray());
                }
            }
        }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(connections, 3));
    data.lineGeometry = geometry;

    return data;
  }, [texture]);


  useFrame((state) => {
    const { pointer, viewport } = state;
    const targetMouseX = (pointer.x * viewport.width) / 2;
    const targetMouseY = (pointer.y * viewport.height) / 2;

    mousePos.current.lerp(new THREE.Vector3(targetMouseX, targetMouseY, 1), 0.1);
    
    if (lightRef.current) {
        lightRef.current.position.lerp(new THREE.Vector3(targetMouseX, targetMouseY, 2), 0.1);
    }
  });

  return (
    <>
      <pointLight ref={lightRef} intensity={4} color="hsl(var(--accent))" distance={4} />
      <group>
        {particles.map((pos, i) => (
          <Particle key={i} originalPosition={pos} mousePos={mousePos} />
        ))}
        {lineGeometry && (
          <lineSegments geometry={lineGeometry}>
            <lineBasicMaterial color="hsl(var(--accent))" transparent opacity={0.1} />
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
        <div className="absolute inset-0 z-0 flex items-center justify-center overflow-hidden pointer-events-auto opacity-50">
            <Canvas camera={{ position: [0, 0, 4.5], fov: 75 }}>
                <ambientLight intensity={0.5} color="hsl(var(--primary))" />
                <React.Suspense fallback={null}>
                    <PointCloudFace />
                </React.Suspense>
            </Canvas>
        </div>
    );
}
