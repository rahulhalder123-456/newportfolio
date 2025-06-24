
'use client';

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';

function FlowingLine({ initialY }: { initialY: number }) {
  const ref = useRef<any>(null!);

  const { speed, length, opacity } = useMemo(() => {
    return {
      speed: Math.random() * 0.4 + 0.1,
      length: Math.random() * 4 + 1,
      opacity: Math.random() * 0.3 + 0.1,
    };
  }, []);
  
  const initialX = useMemo(() => -20 - Math.random() * 20, []);

  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.position.x += speed * (delta * 30);
      if (ref.current.position.x > 20) {
        ref.current.position.x = initialX;
      }
    }
  });

  React.useEffect(() => {
    if (ref.current) {
      ref.current.position.set(initialX, initialY, 0);
    }
  }, [initialX, initialY]);


  return (
    <group ref={ref}>
      <Line
        points={[[0, 0, 0], [length, 0, 0]]}
        color="hsl(var(--primary))"
        lineWidth={2}
        transparent
        opacity={opacity}
      />
    </group>
  );
}

function LineStream({ count = 30 }) {
  const lines = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const y = (Math.random() - 0.5) * 8;
      temp.push(<FlowingLine key={i} initialY={y} />);
    }
    return temp;
  }, [count]);

  return <>{lines}</>;
}


export default function HyperloopDivider() {
  return (
    <div className="h-40 w-full relative pointer-events-none">
      <Canvas camera={{ position: [0, 0, 10], fov: 75 }}>
        <ambientLight intensity={0.5} />
        <LineStream />
      </Canvas>
    </div>
  );
}
