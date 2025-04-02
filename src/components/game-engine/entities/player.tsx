'use client';

import { useState, useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { PlayerProps, PlayerInputs, PlayerState } from '../types/game-types';

export function Player({ initialPosition = [0, 2, 0], initialRotation = [0, 0, 0] }: PlayerProps) {
  const { camera } = useThree();
  const playerRef = useRef<THREE.Group>(null);
  
  // Enhanced player state
  const [playerState, setPlayerState] = useState<PlayerState>({
    position: new THREE.Vector3(...initialPosition),
    velocity: new THREE.Vector3(0, 0, 0),
    rotation: new THREE.Euler(...initialRotation),
    isGrounded: false,
    isCrouching: false,
    isRunning: false,
    health: 100,
    maxHealth: 100,
    activeWeapon: null
  });
  
  // Input state
  const [inputs, setInputs] = useState<PlayerInputs>({
    forward: false,
    backward: false,
    left: false,
    right: false,
    jump: false,
    sprint: false,
    crouch: false,
    use: false
  });

  // Physics constants
  const WALK_SPEED = 5.0;
  const RUN_SPEED = 8.0;
  const CROUCH_SPEED = 2.5;
  const JUMP_FORCE = 8.0;
  const GRAVITY = -20.0;
  const GROUND_FRICTION = 0.9;
  const AIR_FRICTION = 0.98;
  const EYE_HEIGHT = 1.7;
  const CROUCH_HEIGHT = 1.0;

  useEffect(() => {
    // Setup key listeners with improved responsiveness
    const keyMap: Record<string, keyof PlayerInputs> = {
      'KeyW': 'forward',
      'KeyS': 'backward',
      'KeyA': 'left', 
      'KeyD': 'right',
      'Space': 'jump',
      'ShiftLeft': 'sprint',
      'ControlLeft': 'crouch',
      'KeyE': 'use'
    };
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (keyMap[e.code]) {
        setInputs(prev => ({ ...prev, [keyMap[e.code]]: true }));
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      if (keyMap[e.code]) {
        setInputs(prev => ({ ...prev, [keyMap[e.code]]: false }));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Physics and movement
  useFrame((_, delta) => {
    if (!playerRef.current) return;
    
    // Get current state values
    const { position, velocity, isGrounded } = playerState;
    const { forward, backward, left, right, jump, sprint, crouch } = inputs;
    
    // Calculate movement speed based on state
    let speed = WALK_SPEED;
    if (sprint && isGrounded && !crouch) speed = RUN_SPEED;
    if (crouch && isGrounded) speed = CROUCH_SPEED;
    
    // Get camera direction for movement relative to camera
    const cameraDirection = new THREE.Vector3();
    camera.getWorldDirection(cameraDirection);
    cameraDirection.y = 0;
    cameraDirection.normalize();
    
    // Calculate move direction vector
    const moveDirection = new THREE.Vector3(0, 0, 0);
    
    if (forward) moveDirection.add(cameraDirection);
    if (backward) moveDirection.sub(cameraDirection);
    
    // Calculate right vector for strafing
    const rightVector = new THREE.Vector3().crossVectors(
      cameraDirection, 
      new THREE.Vector3(0, 1, 0)
    );
    
    if (right) moveDirection.add(rightVector);
    if (left) moveDirection.sub(rightVector);
    
    // Normalize direction if moving
    if (moveDirection.length() > 0) {
      moveDirection.normalize();
    }
    
    // Create a new velocity vector
    const newVelocity = new THREE.Vector3(
      moveDirection.x * speed,
      velocity.y,
      moveDirection.z * speed
    );
    
    // Apply friction
    const friction = isGrounded ? GROUND_FRICTION : AIR_FRICTION;
    newVelocity.x *= friction;
    newVelocity.z *= friction;
    
    // Apply gravity
    newVelocity.y += GRAVITY * delta;
    
    // Handle jumping
    if (jump && isGrounded) {
      newVelocity.y = JUMP_FORCE;
    }
    
    // Update position
    const newPosition = position.clone();
    newPosition.x += newVelocity.x * delta;
    newPosition.y += newVelocity.y * delta;
    newPosition.z += newVelocity.z * delta;
    
    // Simple ground collision
    let groundedStatus = false;
    if (newPosition.y < 0) {
      newPosition.y = 0;
      newVelocity.y = 0;
      groundedStatus = true;
    }
    
    // Update player state
    setPlayerState(prev => ({
      ...prev,
      position: newPosition,
      velocity: newVelocity,
      isGrounded: groundedStatus,
      isRunning: sprint && forward && isGrounded,
      isCrouching: crouch && isGrounded
    }));
    
    // Update player mesh and camera
    if (playerRef.current) {
      playerRef.current.name = 'player';
      playerRef.current.position.copy(newPosition);
      camera.position.copy(newPosition);
      camera.position.y += 1.7;
    }
  });

  return (
    <group ref={playerRef} position={[initialPosition[0], initialPosition[1], initialPosition[2]]}>
      {/* Player hitbox - invisible in game but used for physics */}
      <mesh visible={false}>
        <capsuleGeometry args={[0.5, 1, 4, 8]} />
        <meshStandardMaterial color="red" />
      </mesh>
      
      {/* First-person arms/weapon model would go here (visible when looking down) */}
    </group>
  );
} 