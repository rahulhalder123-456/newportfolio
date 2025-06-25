'use client';

import React, { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Preload } from '@react-three/drei';
import * as THREE from 'three';

// An easing function for smooth transitions
const easeInOutCubic = (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

// --- Model Creation Functions ---

const createFigure = (color: string, isCyborg: boolean = false) => {
  const group = new THREE.Group();
  const bodyMaterial = new THREE.MeshStandardMaterial({ color, roughness: 0.6, metalness: 0.2 });
  const cyborgMaterial = new THREE.MeshStandardMaterial({ color: '#777', roughness: 0.2, metalness: 0.8 });

  // Torso
  const torso = new THREE.Mesh(new THREE.BoxGeometry(1, 1.5, 0.5), bodyMaterial);
  torso.position.y = 0.75;
  group.add(torso);
  
  // Head
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.5, 32, 16), bodyMaterial);
  head.position.y = 2;
  group.add(head);

  // Limbs
  const limbGeo = new THREE.CylinderGeometry(0.15, 0.1, 1.2);
  const leftArm = new THREE.Mesh(limbGeo, bodyMaterial);
  leftArm.position.set(-0.7, 1, 0);
  group.add(leftArm);

  const rightArm = new THREE.Mesh(limbGeo, isCyborg ? cyborgMaterial : bodyMaterial);
  rightArm.position.set(0.7, 1, 0);
  group.add(rightArm);

  const leftLeg = new THREE.Mesh(limbGeo, bodyMaterial);
  leftLeg.position.set(-0.3, -0.4, 0);
  group.add(leftLeg);

  const rightLeg = new THREE.Mesh(limbGeo, bodyMaterial);
  rightLeg.position.set(0.3, -0.4, 0);
  group.add(rightLeg);
  
  if (isCyborg) {
      const eyeGeo = new THREE.SphereGeometry(0.08, 16, 8);
      const eyeMaterial = new THREE.MeshStandardMaterial({color: 'red', emissive: 'red', emissiveIntensity: 2});
      const eye = new THREE.Mesh(eyeGeo, eyeMaterial);
      eye.position.set(0.2, 2.1, 0.4);
      group.add(eye);
  }

  group.traverse(child => {
      if (child instanceof THREE.Mesh) {
          child.material.transparent = true;
          child.material.opacity = 0;
      }
  });

  return group;
}

const Ape = React.forwardRef((props, ref) => {
  const model = useMemo(() => {
      const figure = createFigure('#5c3e2a');
      figure.scale.set(0.8, 0.8, 0.8);
      figure.position.y = 0.2;
      const torso = figure.children[0] as THREE.Mesh;
      torso.scale.x = 1.2;
      const leftArm = figure.children[2] as THREE.Mesh;
      const rightArm = figure.children[3] as THREE.Mesh;
      leftArm.scale.y = 1.2;
      rightArm.scale.y = 1.2;
      leftArm.rotation.z = 0.3;
      rightArm.rotation.z = -0.3;
      return figure;
  }, []);
  return <primitive ref={ref} object={model} {...props} />;
});
Ape.displayName = "Ape";


const HomoErectus = React.forwardRef((props, ref) => {
    const model = useMemo(() => createFigure('#a1662f'), []);
    return <primitive ref={ref} object={model} {...props} />;
});
HomoErectus.displayName = "HomoErectus";


const ModernHuman = React.forwardRef((props, ref) => {
    const model = useMemo(() => createFigure('#d4a97f'), []);
    return <primitive ref={ref} object={model} {...props} />;
});
ModernHuman.displayName = "ModernHuman";


const Cyborg = React.forwardRef((props, ref) => {
    const model = useMemo(() => createFigure('#a0a0a0', true), []);
    return <primitive ref={ref} object={model} {...props} />;
});
Cyborg.displayName = "Cyborg";

// The main scene component that orchestrates the evolution animation
function EvolutionStage() {
  const groupRef = useRef<THREE.Group>(null!);
  const modelRefs = [useRef<THREE.Group>(), useRef<THREE.Group>(), useRef<THREE.Group>(), useRef<THREE.Group>()];

  const models = useMemo(() => [Ape, HomoErectus, ModernHuman, Cyborg], []);

  // Animation timing configuration
  const cycleDuration = 16; // 4 seconds per model
  const transitionTime = 1.5; // How long it takes to fade in/out
  const stageDuration = cycleDuration / models.length;

  useFrame(({ clock }) => {
    if (groupRef.current) {
        groupRef.current.rotation.y = clock.getElapsedTime() * 0.1;
    }
    
    const time = clock.getElapsedTime() % cycleDuration;

    modelRefs.forEach((modelRef, index) => {
      if (modelRef.current) {
        const stageStartTime = index * stageDuration;
        let opacity = 0;

        if (time >= stageStartTime && time < stageStartTime + stageDuration) {
          const localTime = time - stageStartTime;
          const fadeIn = easeInOutCubic(Math.min(1, localTime / transitionTime));
          const fadeOut = 1 - easeInOutCubic(Math.max(0, (localTime - (stageDuration - transitionTime)) / transitionTime));
          opacity = Math.min(fadeIn, fadeOut);
        }

        modelRef.current.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.material.opacity = opacity;
          }
        });
      }
    });
  });

  return (
    <group ref={groupRef} scale={1.8} position={[0, -1.8, 0]}>
      {models.map((ModelComponent, index) => (
        <ModelComponent key={index} ref={modelRefs[index] as React.Ref<THREE.Group>} />
      ))}
    </group>
  );
}

// The main export that wraps the scene in a Canvas
export default function EvolutionAnimation() {
  return (
    <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
      <Canvas camera={{ position: [0, 1.5, 8], fov: 50 }}>
        <ambientLight intensity={0.8} />
        <pointLight position={[5, 5, 5]} intensity={1.5} color="hsl(var(--primary))" />
        <pointLight position={[-5, 5, -5]} intensity={1} color="hsl(var(--accent))" />
        <Suspense fallback={null}>
          <EvolutionStage />
          <Preload all />
        </Suspense>
      </Canvas>
    </div>
  );
}
