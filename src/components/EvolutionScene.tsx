'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { Suspense, useState, useEffect, useMemo } from 'react';
import { useGLTF, Preload, Environment } from '@react-three/drei';
import * as THREE from 'three';

const modelData = [
  { path: '/models/ape.glb', scale: 0.8 },
  { path: '/models/homo_erectus.glb', scale: 1.5 },
  { path: '/models/modern_human.glb', scale: 1.5 },
  { path: '/models/cyborg.glb', scale: 2.5 },
];

// Preload models to prevent delays during the animation cycle
modelData.forEach(data => useGLTF.preload(data.path));

function SingleModel({ path, scale, isActive }: { path: string, scale: number, isActive: boolean }) {
  const { scene } = useGLTF(path);

  // useMemo is used here to ensure the uniform object is stable across re-renders
  const uniforms = useMemo(() => ({
    // uProgress controls the disintegration effect. 1.0 is fully invisible, 0.0 is fully visible.
    uProgress: { value: 1.0 }, 
  }), []);

  useEffect(() => {
    // Traverse the scene graph of the loaded model
    scene.traverse((child) => {
      // We only care about meshes, as they are the visible parts of the model
      if ((child as THREE.Mesh).isMesh) {
        child.castShadow = true; // The model should cast shadows onto the ground plane
        const originalMaterial = child.material as THREE.MeshStandardMaterial;

        // The material must be transparent for the alpha fade-out to work
        originalMaterial.transparent = true;
        
        // onBeforeCompile is a powerful hook to inject custom GLSL code into existing materials
        originalMaterial.onBeforeCompile = (shader) => {
          // 1. Pass our custom uniform into the shader
          shader.uniforms.uProgress = uniforms.uProgress;

          // 2. We need the UV coordinates in the fragment shader to create a random pattern for the disintegration
          shader.vertexShader = 'varying vec2 vUv;\n' + shader.vertexShader;
          shader.vertexShader = shader.vertexShader.replace(
            '#include <common>',
            '#include <common>\nvUv = uv;'
          );

          // 3. Inject the logic into the fragment shader
          shader.fragmentShader = `
            varying vec2 vUv;
            uniform float uProgress;
            // A simple pseudo-random number generator function in GLSL
            float rand(vec2 n) { 
                return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
            }
          ` + shader.fragmentShader;
          
          // We inject our code right before the final color is set.
          // This ensures all lighting calculations are done before our effect is applied.
          shader.fragmentShader = shader.fragmentShader.replace(
            '#include <dithering_fragment>',
            `
            #include <dithering_fragment>

            float random = rand(vUv * 2.0); // Use vUv to get a random value per pixel
            
            // Discard (make invisible) pixels based on the progress and the random value
            if (random > (1.0 - uProgress)) {
              discard;
            }

            // Also fade out the alpha of the remaining fragments for a smoother effect
            gl_FragColor.a *= (1.0 - uProgress);
            `
          );
        };
        // This is crucial to tell Three.js that the material has been modified
        originalMaterial.needsUpdate = true;
      }
    });
  }, [scene, uniforms]);

  // This useFrame hook runs on every rendered frame
  useFrame((state, delta) => {
    // Determine the target progress based on whether the model should be active or not
    const targetProgress = isActive ? 0.0 : 1.0;
    const currentProgress = uniforms.uProgress.value;
    
    // Animate the progress value towards the target for a smooth transition
    // lerp(current, target, speed)
    uniforms.uProgress.value += (targetProgress - currentProgress) * (delta * 4.0);
  });

  return <primitive object={scene} scale={scale} position={[0, -1.5, 0]} />;
}


export default function EvolutionScene() {
  const [activeIndex, setActiveIndex] = useState(0);

  // This effect sets up an interval to cycle through the models
  useEffect(() => {
    const interval = setInterval(() => {
      // Cycle to the next model, looping back to the start if at the end
      setActiveIndex((current) => (current + 1) % modelData.length);
    }, 4000); // Change model every 4 seconds

    return () => clearInterval(interval); // Cleanup on component unmount
  }, []);

  return (
    <div className="absolute inset-0 z-0">
      <Canvas camera={{ position: [0, 0.5, 7], fov: 50 }} shadows>
        {/* Suspense is required by React to handle components that load data asynchronously, like our models */}
        <Suspense fallback={null}>
          {/* Environment provides ambient lighting and reflections. `apartment` is a good neutral preset. */}
          <Environment preset="apartment" />
          
          {/* Map through the model data and render a component for each one */}
          {modelData.map((data, index) => (
            <SingleModel 
              key={data.path} 
              path={data.path} 
              scale={data.scale}
              isActive={index === activeIndex} 
            />
          ))}

          {/* This mesh acts as a ground plane to receive shadows from the models */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, 0]} receiveShadow>
              <planeGeometry args={[100, 100]} />
              {/* shadowMaterial is invisible but will show shadows cast upon it */}
              <shadowMaterial opacity={0.4} />
          </mesh>
        </Suspense>

        {/* --- Lighting Setup --- */}
        {/* Ambient light provides a base level of illumination to the whole scene */}
        <ambientLight intensity={1} />
        {/* Directional light acts like the sun, casting shadows. This is our main "key" light. */}
        <directionalLight 
          position={[5, 5, 5]} 
          intensity={2.0} 
          castShadow 
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        {/* This second directional light is a "fill" light, softening shadows on the other side. */}
        <directionalLight 
          position={[-5, 5, 2]} 
          intensity={0.5} 
        />
        
        {/* Preload all assets for a smoother experience */}
        <Preload all />
      </Canvas>
    </div>
  );
}
