'use client';

import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { usePlayer } from './player-controller';

interface PlayerCameraProps {
  fov?: number;
  near?: number;
  far?: number;
  headBobbing?: boolean;
  bobIntensity?: number;
  bobSpeed?: number;
}

export function PlayerCamera({
  fov = 75,
  near = 0.1,
  far = 1000,
  headBobbing = true,
  bobIntensity = 0.15,
  bobSpeed = 8
}: PlayerCameraProps) {
  // Get the camera from Three.js
  const { camera } = useThree();
  
  // Get player state from context
  const { 
    position,
    velocity,
    isGrounded,
    isCrouching,
    isRunning
  } = usePlayer();
  
  // References for camera effects
  const bobRef = useRef({
    time: 0,
    prevY: 0,
    intensity: bobIntensity
  });
  
  // Constants
  const EYE_HEIGHT = 1.7;
  const CROUCH_HEIGHT = 0.8;
  
  // Set up camera parameters on mount
  useEffect(() => {
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.fov = fov;
      camera.near = near;
      camera.far = far;
      camera.updateProjectionMatrix();
    }
  }, [camera, fov, near, far]);
  
  // Handle camera positioning and effects
  useFrame((_, delta) => {
    // Get the control's direction for the camera
    if (camera && position) {
      // Position camera based on player position
      camera.position.copy(position);
      
      // Adjust eye height based on crouch state
      const eyeHeight = isCrouching ? CROUCH_HEIGHT : EYE_HEIGHT;
      camera.position.y = position.y + eyeHeight - EYE_HEIGHT / 2;
      
      // Apply head bobbing effect
      if (!headBobbing || !isGrounded) return;
      
      // Calculate head bobbing effect
      // Only apply when moving on the ground
      const isMoving = Math.abs(velocity.x) > 0.1 || Math.abs(velocity.z) > 0.1;
      
      if (isMoving && isGrounded) {
        // Increase bob time
        const speedMultiplier = isRunning ? 1.5 : isCrouching ? 0.5 : 1.0;
        const speed = Math.sqrt(velocity.x * velocity.x + velocity.z * velocity.z);
        
        // Update bob time based on movement speed
        bobRef.current.time += delta * bobSpeed * speedMultiplier * (speed / 5);
        
        // Calculate vertical offset using sine wave
        const verticalBob = Math.sin(bobRef.current.time * 2) * bobRef.current.intensity * speedMultiplier;
        
        // Calculate horizontal offset using cosine wave (half frequency)
        const horizontalBob = Math.cos(bobRef.current.time) * bobRef.current.intensity * 0.5 * speedMultiplier;
        
        // Apply bobbing effect to camera
        camera.position.y += verticalBob - bobRef.current.prevY;
        camera.position.x += horizontalBob * 0.2;
        
        // Store previous vertical offset for smooth transitions
        bobRef.current.prevY = verticalBob;
      } else {
        // Gradually reset bobbing when not moving
        if (Math.abs(bobRef.current.prevY) > 0.001) {
          const resetSpeed = 5 * delta;
          bobRef.current.prevY *= (1 - resetSpeed);
          camera.position.y -= bobRef.current.prevY * resetSpeed;
        } else {
          bobRef.current.time = 0;
          bobRef.current.prevY = 0;
        }
      }
    }
  });
  
  return null; // This is a logic-only component, no rendering needed
} 