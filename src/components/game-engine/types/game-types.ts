import * as THREE from 'three';

// Core game types
export type GameMode = 'sandbox' | 'prop-hunt' | 'deathrun' | string;
export type GameType = 'singleplayer' | 'multiplayer' | string;

// Main props for the GameEngine component
export interface GameEngineProps {
  mapId: string;
  gameMode: GameMode;
  gameType: GameType;
  onExit: () => void;
}

// Player-related types
export interface PlayerInputs {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  jump: boolean;
  sprint: boolean;
  crouch: boolean;
  use: boolean;
}

export interface PlayerState {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  rotation: THREE.Euler;
  isGrounded: boolean;
  isCrouching: boolean;
  isRunning: boolean;
  health: number;
  maxHealth: number;
  activeWeapon: string | null;
}

export interface PlayerProps {
  initialPosition?: [number, number, number];
  initialRotation?: [number, number, number];
}

// Map-related types
export interface MapProps {
  mapId: string;
  onMapLoaded?: (success: boolean) => void;
}

// Scene-related types
export interface GameSceneProps {
  mapId: string;
  gameMode: GameMode;
  debug?: boolean;
}

// Tool-related types
export interface ToolProps {
  name: string;
  icon: string; 
  category: string;
  description: string;
}

export interface ToolCategoryProps {
  name: string;
  tools: ToolProps[];
}

// UI-related types
export interface ToolUIProps {
  activeCategory?: string;
  onCategoryChange?: (category: string) => void;
  onToolSelect?: (tool: ToolProps) => void;
}

// Physics-related types
export interface PhysicsObjectProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  mass?: number;
  modelUrl?: string;
  isStatic?: boolean;
} 