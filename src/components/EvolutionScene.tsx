
'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, Box, Cylinder, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

// --- Base Materials ---
const skinMaterial = new THREE.MeshStandardMaterial({ color: 'hsl(var(--primary))', roughness: 0.8 });
const metalMaterial = new THREE.MeshStandardMaterial({ color: '#777', roughness: 0.2, metalness: 0.8 });
const eyeMaterial = new THREE.MeshStandardMaterial({ color: 'hsl(var(--accent))', emissive: 'hsl(var(--accent))', emissiveIntensity: 2 });


// --- Reusable Primitives ---
const Body = (props: any) => <Box {...props} args={[1, 1.5, 0.5]} material={skinMaterial} castShadow />;
const Head = (props: any) => <Sphere {...props} args={[0.6, 16, 16]} material={skinMaterial} castShadow />;
const Limb = (props: any) => <Cylinder {...props} args={[0.15, 0.15, 1.2, 8]} material={skinMaterial} castShadow />;
const MetalLimb = (props: any) => <Cylinder {...props} args={[0.15, 0.15, 1.2, 8]} material={metalMaterial} castShadow />;
const CyborgEye = (props: any) => <Sphere {...props} args={[0.1, 8, 8]} material={eyeMaterial} />;

// --- Model Components ---
const Ape = () => (
  <group>
    <Body position={[0, 0, 0]} scale={[1.2, 1, 1.2]} />
    <Head position={[0, 1, 0]} />
    {/* Longer, bent arms */}
    <Limb position={[-0.9, -0.2, 0]} rotation={[0, 0, 0.7]} scale={[1, 1.3, 1]} />
    <Limb position={[0.9, -0.2, 0]} rotation={[0, 0, -0.7]} scale={[1, 1.3, 1]} />
    {/* Shorter, bent legs */}
    <Limb position={[-0.4, -1.2, 0]} rotation={[0, 0, 0.2]} />
    <Limb position={[0.4, -1.2, 0]} rotation={[0, 0, -0.2]} />
  </group>
);

const HomoErectus = () => (
  <group>
    <Body position={[0, 0.25, 0]} scale={[1, 1.1, 0.8]} />
    <Head position={[0, 1.3, 0]} scale={[0.9, 0.9, 0.9]} />
    {/* Arms more at the side */}
    <Limb position={[-0.7, 0.5, 0]} rotation={[0, 0, 0.2]} />
    <Limb position={[0.7, 0.5, 0]} rotation={[0, 0, -0.2]} />
    {/* Straighter legs */}
    <Limb position={[-0.3, -1.1, 0]} />
    <Limb position={[0.3, -1.1, 0]} />
  </group>
);

const Human = () => (
    <group>
      <Body position={[0, 0.5, 0]} />
      <Head position={[0, 1.6, 0]} />
      {/* Straight arms and legs */}
      <Limb position={[-0.7, 0.8, 0]} />
      <Limb position={[0.7, 0.8, 0]} />
      <Limb position={[-0.3, -0.8, 0]} />
      <Limb position={[0.3, -0.8, 0]} />
    </group>
  );

const Cyborg = () => (
  <group>
    <Body position={[0, 0.5, 0]} />
    <Head position={[0, 1.6, 0]} />
    {/* One metal arm, one regular */}
    <MetalLimb position={[-0.7, 0.8, 0]} />
    <Limb position={[0.7, 0.8, 0]} />
    {/* One metal leg, one regular */}
    <MetalLimb position={[-0.3, -0.8, 0]} />
    <Limb position={[0.3, -0.8, 0]} />
    {/* Glowing eye */}
    <CyborgEye position={[-0.2, 1.7, 0.55]} />
  </group>
);

const AnimatedEvolution = () => {
    const apeRef = useRef<THREE.Group>(null!);
    const homoErectusRef = useRef<THREE.Group>(null!);
    const humanRef = useRef<THREE.Group>(null!);
    const cyborgRef = useRef<THREE.Group>(null!);

    const models = useMemo(() => [
        { ref: apeRef },
        { ref: homoErectusRef },
        { ref: humanRef },
        { ref: cyborgRef },
    ], []);

    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        const cycleDuration = 4; // 4 seconds per model
        const totalDuration = cycleDuration * models.length;
        const timeInCycle = t % totalDuration;
        const currentIndex = Math.floor(timeInCycle / cycleDuration);

        models.forEach((model, index) => {
            if (!model.ref.current) return;

            let opacity = 0;
            const progress = (timeInCycle / cycleDuration) - index;

            if (index === currentIndex) {
                 if (progress < 0.25) { // Fade in for first 25%
                    opacity = progress / 0.25;
                } else if (progress > 0.75) { // Fade out for last 25%
                    opacity = 1.0 - (progress - 0.75) / 0.25;
                } else { // Fully visible
                    opacity = 1.0;
                }
            }

            model.ref.current.traverse((child) => {
                if (child instanceof THREE.Mesh) {
                    const material = child.material as THREE.MeshStandardMaterial;
                    if (!material.transparent) {
                        material.transparent = true;
                    }
                    material.opacity = THREE.MathUtils.clamp(opacity, 0, 1);
                }
            });
        });
    });

    return (
        <>
            <group ref={apeRef}><Ape /></group>
            <group ref={homoErectusRef}><HomoErectus /></group>
            <group ref={humanRef}><Human /></group>
            <group ref={cyborgRef}><Cyborg /></group>
        </>
    );
};


export default function EvolutionScene() {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas camera={{ position: [0, 1, 8], fov: 50 }} shadows>
        <ambientLight intensity={1.2} />
        <directionalLight 
          position={[10, 10, 5]} 
          intensity={1.5} 
          color="hsl(var(--accent))"
          castShadow 
        />
        <pointLight 
          position={[-10, -5, -10]} 
          intensity={1} 
          color="hsl(var(--primary))" 
        />
        <group position={[0, -1, 0]}>
          <AnimatedEvolution />
        </group>
        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} target={[0, 1, 0]} />
      </Canvas>
    </div>
  );
}
