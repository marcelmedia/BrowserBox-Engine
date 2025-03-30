'use client';

import { useEffect, useState, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { 
  OrbitControls, 
  Environment, 
  Sky,
  useGLTF
} from '@react-three/drei';
import { Suspense } from 'react';
import * as THREE from 'three';

// Define a simple BackgroundCube component if it doesn't exist
const BackgroundCube = () => {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="blue" />
    </mesh>
  );
};

// Model component that loads and displays the gm_flatgrass model
function GMFlatgrass() {
  const { scene } = useGLTF('/models/gm_flatgrass.glb');
  
  return (
    <primitive 
      object={scene} 
      position={[0, 652, 0]}
      rotation={[0, 0, 0]} 
      scale={5.05} 
    />
  );
}

// Static camera setup at a good viewing angle
function StaticCamera() {
  const { camera } = useThree();
  
  useEffect(() => {
    // Set camera to a nice fixed position and orientation
    camera.position.set(15, 10, 25);
    camera.lookAt(0, 0, 0);
  }, [camera]);
  
  return null;
}

// SkyBox component with dynamic time
function SkyBox() {
  const [sunPosition, setSunPosition] = useState<[number, number, number]>([10, 20, 10]);
  
  useFrame(({ clock }) => {
    // Slowly move the sun position over time
    const time = clock.getElapsedTime() * 0.05;
    const x = Math.sin(time) * 20;
    const z = Math.cos(time) * 20;
    setSunPosition([x, 20, z]);
  });
  
  return (
    <Sky 
      distance={45000}
      sunPosition={sunPosition}
      inclination={0.5}
      azimuth={0.25} 
      rayleigh={2}
      turbidity={10}
      mieCoefficient={0.005}
      mieDirectionalG={0.8}
    />
  );
}

export function BackgroundScene() {
  return (
    <div className="fixed inset-0 z-0">
      <Canvas shadows dpr={[1, 2]} camera={{ fov: 70 }}>
        {/* Sky */}
        <SkyBox />
        
        {/* Placeholder for Volumetric Clouds
          Add the following when ready to implement:
          
          <VolumetricClouds
            position={[0, 30, 0]}
            cloudRadius={30}
            cloudHeight={10}
            // Other volumetric cloud parameters
          />
        */}
        
        {/* Lighting */}
        <ambientLight intensity={0.7} />
        <directionalLight 
          castShadow
          position={[5, 10, 5]} 
          intensity={1.5} 
          shadow-mapSize-width={1024} 
          shadow-mapSize-height={1024}
          shadow-camera-far={50}
          shadow-camera-left={-20}
          shadow-camera-right={20}
          shadow-camera-top={20}
          shadow-camera-bottom={-20}
        />
        
        {/* Scene content */}
        <StaticCamera />
        <GMFlatgrass />
        
        {/* Ground plane to catch shadows */}
        <mesh 
          rotation={[-Math.PI / 2, 0, 0]} 
          position={[0, -2.01, 0]} 
          receiveShadow
        >
          <planeGeometry args={[1000, 1000]} />
          <shadowMaterial opacity={0.2} />
        </mesh>
      </Canvas>
    </div>
  );
}

// Also export as default for dynamic import
export default BackgroundScene; 