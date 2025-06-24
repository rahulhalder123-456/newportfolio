
'use client';

import React, { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import * as THREE from 'three';

function Droplet() {
    const ref = useRef<any>(null!);
    const speed = useMemo(() => Math.random() * 0.2 + 0.1, []);
    const initialY = useMemo(() => (Math.random() - 0.5) * 20, []);

    const resetPosition = () => {
        if (ref.current) {
            ref.current.position.x = (Math.random() - 0.5) * 20;
            ref.current.position.y = 10 + Math.random() * 5;
            ref.current.position.z = (Math.random() - 0.5) * 10;
        }
    };

    useFrame(() => {
        if (ref.current) {
            ref.current.position.y -= speed;
            if (ref.current.position.y < -10) {
                resetPosition();
            }
        }
    });
    
    React.useEffect(() => {
        if(ref.current) {
            ref.current.position.x = (Math.random() - 0.5) * 20;
            ref.current.position.y = initialY;
            ref.current.position.z = (Math.random() - 0.5) * 10;
        }
    }, [initialY]);

    return (
        <group ref={ref}>
            <Line 
                points={[[0, 0, 0], [0, 0.5, 0]]} 
                color="hsl(var(--accent))" 
                lineWidth={2}
            />
        </group>
    );
}

function Rain({ count = 200 }) {
    const droplets = useMemo(() => {
        const temp = [];
        for (let i = 0; i < count; i++) {
            temp.push(<Droplet key={i} />);
        }
        return temp;
    }, [count]);

    return <>{droplets}</>;
}


export default function CodeRain() {
    return (
        <Canvas camera={{ position: [0, 0, 10], fov: 75 }}>
            <fog attach="fog" args={['hsl(var(--background))', 5, 15]} />
            <Rain />
        </Canvas>
    );
}
