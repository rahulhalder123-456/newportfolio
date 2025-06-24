'use client';

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Plane } from '@react-three/drei';
import * as THREE from 'three';

const GlitchBar = () => {
  const materialRef = useRef<THREE.ShaderMaterial>(null!);
  const meshRef = useRef<THREE.Mesh>(null!);

  const shader = useMemo(() => ({
    uniforms: {
      u_time: { value: 0.0 },
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec2 vUv;
      uniform float u_time;

      // 2D Random function
      float random (vec2 st) {
          return fract(sin(dot(st.xy,
                              vec2(12.9898,78.233)))
                      * 43758.5453123);
      }

      void main() {
          float rnd = random(vUv * u_time);
          vec3 color = vec3(rnd);
          // Use a step function to create a harsh, digital noise for the alpha
          float alpha = step(0.5, rnd);
          gl_FragColor = vec4(color, alpha);
      }
    `
  }), []);

  useFrame((state, delta) => {
    if (materialRef.current) {
      // Animate the noise pattern
      materialRef.current.uniforms.u_time.value += delta * 30;
    }
    if (meshRef.current) {
      const t = state.clock.getElapsedTime();
      const cycleTime = 4; // 4-second animation cycle
      const timeInCycle = t % cycleTime;
      
      let scaleX = 0.0;
      
      // Expand from center (0.15s)
      if (timeInCycle < 0.15) {
        scaleX = timeInCycle / 0.15;
      } 
      // Hold full width (1.5s)
      else if (timeInCycle >= 0.15 && timeInCycle < 1.65) {
        scaleX = 1.0;
      }
      // Collapse to center (0.15s)
      else if (timeInCycle >= 1.65 && timeInCycle < 1.8) {
        scaleX = 1.0 - ((timeInCycle - 1.65) / 0.15);
      }
      // Stay invisible for the rest of the cycle
      else {
        scaleX = 0.0;
      }
      
      // Apply the scale to the mesh
      meshRef.current.scale.x = scaleX;
    }
  });

  return (
    <Plane ref={meshRef} args={[12, 0.3]}>
      <shaderMaterial 
        ref={materialRef} 
        args={[shader]} 
        transparent={true}
      />
    </Plane>
  )
}

export default function HyperloopDivider() {
  return (
    <div className="h-40 w-full relative pointer-events-none">
      <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
        <GlitchBar />
      </Canvas>
    </div>
  );
}
