'use client';

import { useState, useEffect, useRef, createContext, useContext, ReactNode } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { PointerLockControls } from '@react-three/drei';
import { PlayerProps } from '../types/game-types';

// Context to share player state between components
interface PlayerContextType {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  rotation: THREE.Euler;
  isGrounded: boolean;
  isCrouching: boolean;
  isRunning: boolean;
  moveForward: (value: boolean) => void;
  moveBackward: (value: boolean) => void;
  moveLeft: (value: boolean) => void;
  moveRight: (value: boolean) => void;
  jump: () => void;
  crouch: (value: boolean) => void;
  sprint: (value: boolean) => void;
  controlsRef: React.RefObject<any>; // Add controlsRef to the context
}

// Create context with default values
const PlayerContext = createContext<PlayerContextType | null>({
  position: new THREE.Vector3(),
  velocity: new THREE.Vector3(),
  rotation: new THREE.Euler(),
  isGrounded: false,
  isCrouching: false,
  isRunning: false,
  moveForward: () => {},
  moveBackward: () => {},
  moveLeft: () => {},
  moveRight: () => {},
  jump: () => {},
  crouch: () => {},
  sprint: () => {},
  controlsRef: { current: null }
} as any);

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
};

// Physics and movement constants
const GRAVITY = -30;
const JUMP_FORCE = 10;
const WALK_SPEED = 5;
const SPRINT_SPEED = 10;
const CROUCH_SPEED = 2;
const FRICTION = 10;
const EYE_HEIGHT = 1.7;
const CROUCH_HEIGHT = 0.8;

export function PlayerController({ 
  initialPosition = [0, 2, 0],
  children 
}: PlayerProps & { children: ReactNode }) {
  // Position and movement state
  const [position, setPosition] = useState(new THREE.Vector3(...initialPosition));
  const [velocity, setVelocity] = useState(new THREE.Vector3(0, 0, 0));
  const [rotation, setRotation] = useState(new THREE.Euler(0, 0, 0));
  
  // Player state
  const [isGrounded, setIsGrounded] = useState(false);
  const [isCrouching, setIsCrouching] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  
  // Movement inputs
  const [moveState, setMoveState] = useState({
    forward: false,
    backward: false,
    left: false,
    right: false
  });

  // References
  const playerRef = useRef<THREE.Group>(null);
  const playerColliderRef = useRef<THREE.Mesh>(null);
  const controlsRef = useRef<any>(null); // Pointer lock controls ref
  
  // Get Three.js camera
  const { camera } = useThree();
  
  // Movement controls
  const moveForward = (value: boolean) => {
    setMoveState(prev => ({ ...prev, forward: value }));
  };
  
  const moveBackward = (value: boolean) => {
    setMoveState(prev => ({ ...prev, backward: value }));
  };
  
  const moveLeft = (value: boolean) => {
    setMoveState(prev => ({ ...prev, left: value }));
  };
  
  const moveRight = (value: boolean) => {
    setMoveState(prev => ({ ...prev, right: value }));
  };
  
  const jump = () => {
    if (isGrounded) {
      setVelocity(prev => new THREE.Vector3(prev.x, JUMP_FORCE, prev.z));
      setIsGrounded(false);
    }
  };
  
  const crouch = (value: boolean) => {
    setIsCrouching(value);
  };
  
  const sprint = (value: boolean) => {
    setIsRunning(value);
  };
  
  // Set up keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.pointerLockElement) {
        switch (e.code) {
          case 'KeyW':
            moveForward(true);
            break;
          case 'KeyS':
            moveBackward(true);
            break;
          case 'KeyA':
            moveLeft(true);
            break;
          case 'KeyD':
            moveRight(true);
            break;
          case 'Space':
            jump();
            break;
          case 'ShiftLeft':
            sprint(true);
            break;
          case 'ControlLeft':
            crouch(true);
            break;
        }
      }
    };
    
    // Handle pointer lock setup when clicking on canvas
    const handleCanvasClick = () => {
      if (controlsRef.current && !document.pointerLockElement) {
        controlsRef.current.lock();
      }
    };
    
    // Add listener for canvas click to lock pointer
    const canvas = document.querySelector('canvas');
    if (canvas) {
      canvas.addEventListener('click', handleCanvasClick);
    }
    
    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyW':
          moveForward(false);
          break;
        case 'KeyS':
          moveBackward(false);
          break;
        case 'KeyA':
          moveLeft(false);
          break;
        case 'KeyD':
          moveRight(false);
          break;
        case 'ShiftLeft':
          sprint(false);
          break;
        case 'ControlLeft':
          crouch(false);
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (canvas) {
        canvas.removeEventListener('click', handleCanvasClick);
      }
    };
  }, [isGrounded, controlsRef]);
  
  // Set up pointer lock controls event listeners
  useEffect(() => {
    if (!controlsRef.current) return;
    
    const handleLock = () => {
      console.log('Pointer locked - first person controls active');
    };
    
    const handleUnlock = () => {
      console.log('Pointer unlocked - first person controls disabled');
    };
    
    // Add event listeners
    controlsRef.current.addEventListener('lock', handleLock);
    controlsRef.current.addEventListener('unlock', handleUnlock);
    
    return () => {
      if (controlsRef.current) {
        controlsRef.current.removeEventListener('lock', handleLock);
        controlsRef.current.removeEventListener('unlock', handleUnlock);
      }
    };
  }, [controlsRef.current]);
  
  // Handle physics and movement
  useFrame((state, delta) => {
    if (!playerRef.current) return;
    
    // Calculate movement direction based on camera orientation
    const moveDirection = new THREE.Vector3(0, 0, 0);
    
    // Forward/backward direction
    if (moveState.forward) {
      moveDirection.z -= 1; // This is in local space, will be transformed by camera direction later
    }
    if (moveState.backward) {
      moveDirection.z += 1;
    }
    
    // Left/right direction
    if (moveState.left) {
      moveDirection.x -= 1;
    }
    if (moveState.right) {
      moveDirection.x += 1;
    }
    
    // Normalize and rotate direction based on camera
    if (moveDirection.length() > 0) {
      moveDirection.normalize();
      
      // When using PointerLockControls, we can get the camera direction directly
      const cameraDirection = new THREE.Vector3();
      camera.getWorldDirection(cameraDirection);
      cameraDirection.y = 0; // Keep movement in horizontal plane
      cameraDirection.normalize();
      
      // The camera looks in the negative Z direction by default in Three.js
      // To make W move forward in camera direction, we need to invert the direction vector
      cameraDirection.multiplyScalar(-1);
      
      // Calculate right vector from camera direction
      const rightVector = new THREE.Vector3().crossVectors(
        new THREE.Vector3(0, 1, 0),
        cameraDirection
      ).normalize();
      
      // Apply movement relative to camera direction
      const moveX = moveDirection.x * rightVector.x + moveDirection.z * cameraDirection.x;
      const moveZ = moveDirection.x * rightVector.z + moveDirection.z * cameraDirection.z;
      
      moveDirection.set(moveX, 0, moveZ).normalize();
    }
    
    // Determine movement speed based on player state
    let currentSpeed = WALK_SPEED;
    
    if (isCrouching) {
      currentSpeed = CROUCH_SPEED;
    } else if (isRunning && moveState.forward && !moveState.backward) {
      currentSpeed = SPRINT_SPEED;
    }
    
    // Apply movement to velocity
    const newVelocity = new THREE.Vector3(
      moveDirection.x * currentSpeed,
      velocity.y,
      moveDirection.z * currentSpeed
    );
    
    // Apply gravity
    newVelocity.y += GRAVITY * delta;
    
    // Apply friction to horizontal movement
    if (isGrounded) {
      newVelocity.x *= (1 - Math.min(FRICTION * delta, 0.95));
      newVelocity.z *= (1 - Math.min(FRICTION * delta, 0.95));
    }
    
    // Update position based on velocity
    const newPosition = position.clone();
    newPosition.x += newVelocity.x * delta;
    newPosition.z += newVelocity.z * delta;
    newPosition.y += newVelocity.y * delta;
    
    // Ground collision check
    if (newPosition.y < EYE_HEIGHT / 2) {
      newPosition.y = EYE_HEIGHT / 2;
      newVelocity.y = 0;
      setIsGrounded(true);
    } else {
      setIsGrounded(false);
    }
    
    // Update position and velocity state
    setPosition(newPosition);
    setVelocity(newVelocity);
    
    // Update player mesh
    if (playerRef.current) {
      playerRef.current.position.copy(newPosition);
      
      // Update player collider size based on crouch state
      if (playerColliderRef.current) {
        const currentHeight = isCrouching ? CROUCH_HEIGHT : EYE_HEIGHT;
        playerColliderRef.current.scale.y = currentHeight;
        playerColliderRef.current.position.y = currentHeight / 2;
      }
    }
    
    // Camera positioning is now handled by the PlayerCamera component
  });
  
  // Create the player context value
  const playerContextValue: PlayerContextType = {
    position,
    velocity,
    rotation,
    isGrounded,
    isCrouching,
    isRunning,
    moveForward,
    moveBackward,
    moveLeft,
    moveRight,
    jump,
    crouch,
    sprint,
    controlsRef
  };
  
  return (
    <PlayerContext.Provider value={playerContextValue}>
      <group ref={playerRef} name="player" position={[initialPosition[0], initialPosition[1], initialPosition[2]]}>
        {/* Player collider - invisible mesh for physics */}
        <mesh ref={playerColliderRef} visible={false} position={[0, EYE_HEIGHT / 2, 0]}>
          <capsuleGeometry args={[0.3, EYE_HEIGHT - 0.6, 8, 8]} />
          <meshBasicMaterial color="red" wireframe />
        </mesh>
        
        {/* Pointer lock camera controls */}
        <PointerLockControls ref={controlsRef} />
        
        {/* Pass through any child components */}
        {children}
      </group>
    </PlayerContext.Provider>
  );
} 