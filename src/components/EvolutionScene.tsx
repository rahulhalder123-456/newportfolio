'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { Suspense, useState, useEffect, useMemo } from 'react';
import { useGLTF, Preload, Environment, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

const modelData = [
  { path: '/models/ape.glb', scale: 1.0 },
  { path: '/models/homo_erectus.glb', scale: 1.5 },
  { path: '/models/modern_human.glb', scale: 1.5 },
  { path: '/models/cyborg.glb', scale: 2.0 },
];

modelData.forEach(data => useGLTF.preload(data.path));

function SingleModel({ path, scale, isActive }: { path: string, scale: number, isActive: boolean }) {
  const { scene } = useGLTF(path);

  const uniforms = useMemo(() => ({
    uProgress: { value: 1.0 }, // Start fully disintegrated (invisible)
  }), []);

  useEffect(() => {
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        child.castShadow = true;
        const originalMaterial = child.material as THREE.MeshStandardMaterial;

        // Make the material transparent to allow for fading
        originalMaterial.transparent = true;
        
        // Use onBeforeCompile to inject custom shader logic into the existing material
        originalMaterial.onBeforeCompile = (shader) => {
          // 1. Add our custom uniform to the shader
          shader.uniforms.uProgress = uniforms.uProgress;

          // 2. Modify the vertex shader to pass the UV coordinates to the fragment shader
          shader.vertexShader = 'varying vec2 vUv;\n' + shader.vertexShader;
          shader.vertexShader = shader.vertexShader.replace(
            '#include <common>',
            '#include <common>\nvUv = uv;'
          );

          // 3. Modify the fragment shader to implement the disintegration effect
          shader.fragmentShader = `
            varying vec2 vUv;
            uniform float uProgress;
            float rand(vec2 n) { 
                return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
            }
          ` + shader.fragmentShader;
          
          shader.fragmentShader = shader.fragmentShader.replace(
            '#include <dithering_fragment>',
            `
            #include <dithering_fragment>

            float random = rand(vUv);
            
            // Discard fragments based on progress and a random value
            if (random > (1.0 - uProgress)) {
              discard;
            }

            // Also fade out the alpha of the remaining fragments
            gl_FragColor.a *= (1.0 - uProgress);
            `
          );
        };
        // We need to tell Three.js that the material has been updated
        originalMaterial.needsUpdate = true;
      }
    });
  }, [scene, uniforms]);

  useFrame((state, delta) => {
    const targetProgress = isActive ? 0.0 : 1.0;
    const currentProgress = uniforms.uProgress.value;
    
    // Smoothly animate the progress value towards the target
    uniforms.uProgress.value += (targetProgress - currentProgress) * (delta * 5.0);
  });

  return <primitive object={scene} scale={scale} position={[0, -1.5, 0]} />;
}


export default function EvolutionScene() {
  const [activeIndex, setActiveIndex] = useState(0);

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
