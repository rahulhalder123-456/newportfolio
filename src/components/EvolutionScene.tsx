
'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { Suspense, useState, useEffect, useRef, useMemo } from 'react';
import { OrbitControls, useGLTF, Preload, Environment } from '@react-three/drei';
import * as THREE from 'three';

const modelData = [
  { path: '/models/ape.glb', scale: 1.0 },
  { path: '/models/homo_erectus.glb', scale: 1.5 },
  { path: '/models/modern_human.glb', scale: 1.5 },
  { path: '/models/cyborg.glb', scale: 2.0 },
];

modelData.forEach(data => useGLTF.preload(data.path));

// The vertex shader simply passes the UV coordinates to the fragment shader.
const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// The fragment shader creates the disintegration effect.
const fragmentShader = `
  uniform float uProgress; // 0 = visible, 1 = disintegrated
  uniform vec3 uColor;
  varying vec2 vUv;

  // A simple random function based on UV coordinates
  float rand(vec2 n) { 
    return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
  }

  void main() {
    float random = rand(vUv);
    
    // Discard fragments if their random value is greater than the current visibility
    // As uProgress increases, (1.0 - uProgress) decreases, so more fragments are discarded.
    if (random > (1.0 - uProgress)) {
      discard;
    }

    // The overall opacity also fades out as the model disintegrates.
    gl_FragColor = vec4(uColor, 1.0 - uProgress);
  }
`;

function SingleModel({ path, scale, isActive }: { path: string, scale: number, isActive: boolean }) {
  const { scene } = useGLTF(path);

  // Memoize the shader uniforms so they persist for the lifetime of the component
  const uniforms = useMemo(() => ({
    uProgress: { value: 1.0 }, // Start fully disintegrated (invisible)
    uColor: { value: new THREE.Color('white') },
  }), []);

  // When the scene is loaded, traverse it and apply our custom shader material to each mesh
  useEffect(() => {
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        child.castShadow = true;
        child.material = new THREE.ShaderMaterial({
          uniforms,
          vertexShader,
          fragmentShader,
          transparent: true, // Enable transparency for the fade-out effect
        });
      }
    });
  }, [scene, uniforms]);

  // Use the main render loop to animate the disintegration effect
  useFrame((state, delta) => {
    // Determine the target progress based on whether the model should be active
    const targetProgress = isActive ? 0.0 : 1.0;
    const currentProgress = uniforms.uProgress.value;
    
    // Smoothly interpolate the progress value towards the target, creating the animation
    // The multiplication factor (delta * 5.0) controls the speed of the transition.
    uniforms.uProgress.value += (targetProgress - currentProgress) * (delta * 5.0);
  });

  return <primitive object={scene} scale={scale} position={[0, -1.5, 0]} />;
}


export default function EvolutionScene() {
  const [activeIndex, setActiveIndex] = useState(0);

  // This timer updates the active model index every 4 seconds, driving the animation cycle
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % modelData.length);
    }, 4000); 

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 z-0">
      <Canvas camera={{ position: [0, 1, 8], fov: 50 }} shadows>
        <Suspense fallback={null}>
          <Environment preset="city" />
          {modelData.map((data, index) => (
            <SingleModel 
              key={data.path} 
              path={data.path} 
              scale={data.scale}
              isActive={index === activeIndex} 
            />
          ))}
          {/* A ground plane to receive shadows, adding depth to the scene */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, 0]} receiveShadow>
              <planeGeometry args={[100, 100]} />
              <shadowMaterial opacity={0.4} />
          </mesh>
        </Suspense>

        <ambientLight intensity={0.5} />
        <directionalLight 
          position={[5, 5, 5]} 
          intensity={1.5} 
          castShadow 
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        
        <OrbitControls
          enableZoom={false}
          autoRotate
          autoRotateSpeed={0.5}
          target={[0, 0.5, 0]}
          minPolarAngle={Math.PI / 2.5}
          maxPolarAngle={Math.PI / 1.9}
        />
        <Preload all />
      </Canvas>
    </div>
  );
}
