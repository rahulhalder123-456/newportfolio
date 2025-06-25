'use client';

import { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, Box, Cylinder, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

// --- Reusable Model Parts ---
const Body = (props: any) => <Box {...props} args={[1, 1.5, 0.5]} castShadow />;
const Head = (props: any) => <Sphere {...props} args={[0.6, 16, 16]} castShadow />;
const Limb = (props: any) => <Cylinder {...props} args={[0.15, 0.15, 1.2, 8]} castShadow />;
const CyborgEye = (props: any) => <Sphere {...props} args={[0.1, 8, 8]} />;

// --- Stage Models ---
const Ape = ({ material }: any) => (
  <group>
    <Body material={material} position={[0, 0, 0]} scale={[1.2, 1, 1.2]} />
    <Head material={material} position={[0, 1, 0]} />
    <Limb material={material} position={[-0.8, -0.2, 0]} rotation={[0, 0, 0.5]} />
    <Limb material={material} position={[0.8, -0.2, 0]} rotation={[0, 0, -0.5]} />
    <Limb material={material} position={[-0.4, -1.2, 0]} rotation={[0, 0, 0.2]} />
    <Limb material={material} position={[0.4, -1.2, 0]} rotation={[0, 0, -0.2]} />
  </group>
);

const HomoErectus = ({ material }: any) => (
  <group>
    <Body material={material} position={[0, 0.25, 0]} scale={[1, 1.1, 0.8]} />
    <Head material={material} position={[0, 1.3, 0]} scale={[0.9, 0.9, 0.9]} />
    <Limb material={material} position={[-0.7, 0.5, 0]} rotation={[0, 0, 0.2]} />
    <Limb material={material} position={[0.7, 0.5, 0]} rotation={[0, 0, -0.2]} />
    <Limb material={material} position={[-0.3, -1.1, 0]} />
    <Limb material={material} position={[0.3, -1.1, 0]} />
  </group>
);


const Human = ({ material }: any) => (
  <group>
    <Body material={material} position={[0, 0.5, 0]} />
    <Head material={material} position={[0, 1.6, 0]} />
    <Limb material={material} position={[-0.8, 0.8, 0]} />
    <Limb material={material} position={[0.8, 0.8, 0]} />
    <Limb material={material} position={[-0.3, -0.8, 0]} />
    <Limb material={material} position={[0.3, -0.8, 0]} />
  </group>
);

const Cyborg = ({ material }: any) => (
  <group>
    <Body material={material} position={[0, 0.5, 0]} />
    <Head material={material} position={[0, 1.6, 0]} />
    <Limb material={new THREE.MeshStandardMaterial({ color: '#555' })} position={[-0.8, 0.8, 0]} />
    <Limb material={material} position={[0.8, 0.8, 0]} />
    <Limb material={new THREE.MeshStandardMaterial({ color: '#555' })} position={[-0.3, -0.8, 0]} />
    <Limb material={material} position={[0.3, -0.8, 0]} />
    <CyborgEye position={[-0.2, 1.7, 0.5]}>
      <meshStandardMaterial color="red" emissive="red" />
    </CyborgEye>
  </group>
);

const AnimatedModels = () => {
    const models = useMemo(() => [Ape, HomoErectus, Human, Cyborg], []);
    const [index, setIndex] = useState(0);
    const materialRef = useRef<THREE.MeshStandardMaterial>(null!);

    useFrame((state, delta) => {
        const t = state.clock.getElapsedTime();
        const cycleDuration = 5; // 5 seconds per model
        const currentModelIndex = Math.floor(t / cycleDuration) % models.length;
        const transitionProgress = (t % cycleDuration) / cycleDuration;
        
        setIndex(currentModelIndex);
        
        if (materialRef.current) {
            // Fade in
            if (transitionProgress < 0.2) {
                materialRef.current.opacity = THREE.MathUtils.lerp(0, 1, transitionProgress / 0.2);
            } 
            // Fade out
            else if (transitionProgress > 0.8) {
                materialRef.current.opacity = THREE.MathUtils.lerp(1, 0, (transitionProgress - 0.8) / 0.2);
            } 
            // Fully visible
            else {
                materialRef.current.opacity = 1;
            }
        }
    });

    const CurrentModel = models[index];

    return (
        <CurrentModel
            material={<meshStandardMaterial ref={materialRef} color="hsl(var(--primary))" transparent />}
        />
    );
};

export default function EvolutionScene() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none">
      <Canvas camera={{ position: [0, 1, 8], fov: 50 }}>
        <ambientLight intensity={1.2} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} color="hsl(var(--accent))" />
        <pointLight position={[-10, -5, -10]} intensity={1} color="hsl(var(--primary))" />
        <group position={[0, -1, 0]}>
            <AnimatedModels />
        </group>
        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />
      </Canvas>
    </div>
  );
}
