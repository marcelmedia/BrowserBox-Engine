'use client';

import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { usePlayer } from './player-controller';

interface PlayerModelProps {
  visible?: boolean;
  color?: string;
  wireframe?: boolean;
}

export function PlayerModel({
  visible = false, // Usually false in first-person mode
  color = '#2080ff',
  wireframe = false
}: PlayerModelProps) {
  // Get player state from context
  const { 
    velocity,
    isGrounded,
    isCrouching
  } = usePlayer();
  
  // References for animation
  const bodyRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Mesh>(null);
  const leftArmRef = useRef<THREE.Mesh>(null);
  const rightArmRef = useRef<THREE.Mesh>(null);
  const leftLegRef = useRef<THREE.Mesh>(null);
  const rightLegRef = useRef<THREE.Mesh>(null);
  
  // Animation state
  const [animTime, setAnimTime] = useState(0);
  
  // Update model based on player state
  useFrame((_, delta) => {
    if (!bodyRef.current) return;
    
    // Check if player is moving
    const speed = Math.sqrt(velocity.x * velocity.x + velocity.z * velocity.z);
    const isMoving = speed > 0.1;
    
    // Update animation time
    if (isMoving && isGrounded) {
      setAnimTime(prev => prev + delta * speed * 2);
    }
    
    // Apply crouch animation
    if (isCrouching) {
      bodyRef.current.scale.y = 0.7;
      bodyRef.current.position.y = -0.3;
      
      // Position head properly when crouched
      if (headRef.current) {
        headRef.current.position.y = 0.3;
      }
    } else {
      bodyRef.current.scale.y = 1;
      bodyRef.current.position.y = 0;
      
      // Reset head position
      if (headRef.current) {
        headRef.current.position.y = 0.5;
      }
    }
    
    // Apply walking animation if moving
    if (isMoving && isGrounded) {
      // Leg swing animation
      if (leftLegRef.current && rightLegRef.current) {
        leftLegRef.current.rotation.x = Math.sin(animTime) * 0.5;
        rightLegRef.current.rotation.x = Math.sin(animTime + Math.PI) * 0.5;
      }
      
      // Arm swing animation (opposite to legs)
      if (leftArmRef.current && rightArmRef.current) {
        leftArmRef.current.rotation.x = Math.sin(animTime + Math.PI) * 0.5;
        rightArmRef.current.rotation.x = Math.sin(animTime) * 0.5;
      }
      
      // Slight body sway
      if (bodyRef.current) {
        bodyRef.current.rotation.z = Math.sin(animTime) * 0.05;
      }
    } else {
      // Reset to idle pose when not moving
      if (leftLegRef.current && rightLegRef.current) {
        leftLegRef.current.rotation.x = 0;
        rightLegRef.current.rotation.x = 0;
      }
      
      if (leftArmRef.current && rightArmRef.current) {
        leftArmRef.current.rotation.x = 0;
        rightArmRef.current.rotation.x = 0;
      }
      
      if (bodyRef.current) {
        bodyRef.current.rotation.z = 0;
      }
    }
  });
  
  if (!visible) return null;
  
  return (
    <group ref={bodyRef}>
      {/* Body */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.6, 1, 0.3]} />
        <meshStandardMaterial color={color} wireframe={wireframe} />
      </mesh>
      
      {/* Head */}
      <mesh ref={headRef} position={[0, 0.5, 0]}>
        <boxGeometry args={[0.4, 0.4, 0.4]} />
        <meshStandardMaterial color={color} wireframe={wireframe} />
      </mesh>
      
      {/* Arms */}
      <mesh 
        ref={leftArmRef} 
        position={[0.4, 0.2, 0]} 
        rotation={[0, 0, 0]}
      >
        <boxGeometry args={[0.2, 0.6, 0.2]} />
        <meshStandardMaterial color={color} wireframe={wireframe} />
      </mesh>
      
      <mesh 
        ref={rightArmRef} 
        position={[-0.4, 0.2, 0]} 
        rotation={[0, 0, 0]}
      >
        <boxGeometry args={[0.2, 0.6, 0.2]} />
        <meshStandardMaterial color={color} wireframe={wireframe} />
      </mesh>
      
      {/* Legs */}
      <mesh 
        ref={leftLegRef} 
        position={[0.2, -0.6, 0]} 
        rotation={[0, 0, 0]}
      >
        <boxGeometry args={[0.2, 0.6, 0.2]} />
        <meshStandardMaterial color={color} wireframe={wireframe} />
      </mesh>
      
      <mesh 
        ref={rightLegRef} 
        position={[-0.2, -0.6, 0]} 
        rotation={[0, 0, 0]}
      >
        <boxGeometry args={[0.2, 0.6, 0.2]} />
        <meshStandardMaterial color={color} wireframe={wireframe} />
      </mesh>
    </group>
  );
} 