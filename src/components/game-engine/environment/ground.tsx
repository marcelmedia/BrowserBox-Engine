'use client';

import { useRef } from 'react';
import * as THREE from 'three';

interface GroundProps {
  size?: [number, number];
  color?: string;
  texture?: string;
  receiveShadow?: boolean;
}

export function Ground({
  size = [100, 100],
  color = '#303030',
  texture,
  receiveShadow = true
}: GroundProps) {
  const groundRef = useRef<THREE.Mesh>(null);
  
  return (
    <mesh 
      ref={groundRef} 
      receiveShadow={receiveShadow} 
      rotation={[-Math.PI / 2, 0, 0]} 
      position={[0, 0, 0]}
    >
      <planeGeometry args={size} />
      {texture ? (
        <meshStandardMaterial map={new THREE.TextureLoader().load(texture)} />
      ) : (
        <meshStandardMaterial color={color} />
      )}
    </mesh>
  );
} 