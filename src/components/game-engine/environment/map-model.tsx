'use client';

import { useState, useEffect, useRef, memo } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { MapProps } from '../types/game-types';

// Preload common maps to avoid multiple loading attempts
useGLTF.preload('/maps/gm_flatgrass/model.glb');
useGLTF.preload('/maps/gm_construct/model.glb');

// Memoized MapModel component to prevent unnecessary re-renders
export const MapModel = memo(function MapModel({ mapId, onMapLoaded }: MapProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const mapUrl = `/maps/${mapId}/model.glb`;
  const sceneRef = useRef<THREE.Group>(null);
  const loadAttemptedRef = useRef(false);
  
  // Log when component mounts/remounts to track re-renders
  useEffect(() => {
    console.log(`MapModel mounted for ${mapId}`);
    
    // Return cleanup function
    return () => {
      console.log(`MapModel for ${mapId} unmounting, cleaning up resources`);
      
      // Clean up any resources if needed
      if (sceneRef.current) {
        // Dispose of geometries and materials to prevent memory leaks
        sceneRef.current.traverse((object) => {
          if ((object as THREE.Mesh).isMesh) {
            const mesh = object as THREE.Mesh;
            if (mesh.geometry) {
              mesh.geometry.dispose();
            }
            
            if (mesh.material) {
              const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
              materials.forEach(material => material.dispose());
            }
          }
        });
      }
    };
  }, [mapId]);
  
  // Only log the first attempt to load the map
  if (!loadAttemptedRef.current) {
    console.log(`Attempting to load map: ${mapUrl}`);
    loadAttemptedRef.current = true;
  }
  
  // Load the map model
  const { scene } = useGLTF(mapUrl);
  
  // Handle successful loading
  useEffect(() => {
    if (!scene || isLoaded) return;
    
    console.log('Map model loaded successfully, processing scene...');
    
    try {
      // Use the scene directly instead of cloning to reduce memory usage
      if (sceneRef.current) {
        // Clear previous children if any
        while (sceneRef.current.children.length > 0) {
          sceneRef.current.remove(sceneRef.current.children[0]);
        }
        
        // Add scene as a child instead of cloning
        sceneRef.current.add(scene);
      }
      
      // Process and optimize the map after adding to scene
      processScene();
      
      // Signal successful loading
      setIsLoaded(true);
      setHasError(false);
      if (onMapLoaded) onMapLoaded(true);
      
    } catch (error) {
      console.error('Error processing map model:', error);
      setHasError(true);
      setErrorMessage(error instanceof Error ? error.message : 'Unknown error');
      if (onMapLoaded) onMapLoaded(false);
    }
  }, [scene, onMapLoaded, isLoaded]);
  
  // Setup error handler separately to avoid type issues
  useEffect(() => {
    if (isLoaded) return; // Don't add listeners if already loaded
    
    // Add error event listener for WebGL errors
    const handleError = (event: ErrorEvent) => {
      // Only handle WebGL related errors
      if (event.message.includes('WebGL') || event.message.includes('GL_')) {
        console.error('WebGL error detected:', event);
        setHasError(true);
        setErrorMessage(event.message);
        if (onMapLoaded) onMapLoaded(false);
      }
    };
    
    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, [onMapLoaded, isLoaded]);
  
  // Listen for model adjustment messages
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'model-adjustments' && sceneRef.current) {
        const { adjustments } = event.data;
        
        // Apply adjustments to the map model
        if (adjustments.scale !== undefined) {
          sceneRef.current.scale.setScalar(adjustments.scale);
        }
        
        if (adjustments.heightOffset !== undefined) {
          sceneRef.current.position.y = adjustments.heightOffset;
        }
        
        if (adjustments.positionX !== undefined) {
          sceneRef.current.position.x = adjustments.positionX;
        }
        
        if (adjustments.positionZ !== undefined) {
          sceneRef.current.position.z = adjustments.positionZ;
        }
        
        console.log('Applied model adjustments:', adjustments);
      }
    };
    
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);
  
  // Process and optimize the scene
  const processScene = () => {
    if (!sceneRef.current) return;
    
    console.log('Processing and optimizing scene...');
    
    // Process and optimize the map
    sceneRef.current.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        
        // Log large meshes that might cause performance issues
        if (mesh.geometry && mesh.geometry.attributes.position) {
          const vertexCount = mesh.geometry.attributes.position.count;
          if (vertexCount > 10000) {
            console.log(`High-poly mesh found: ${mesh.name} with ${vertexCount} vertices`);
          }
        }
        
        // Setup shadows - limit shadow casting to smaller objects
        const isBigObject = mesh.geometry && 
                          mesh.geometry.boundingBox && 
                          mesh.geometry.boundingBox.getSize(new THREE.Vector3()).length() > 20;
        
        mesh.castShadow = !isBigObject; // Only small objects cast shadows
        mesh.receiveShadow = true;
        
        // Determine object type based on name conventions
        if (mesh.name.includes('collision')) {
          // Collision objects are invisible but still interact with physics
          mesh.visible = false;
          mesh.userData.isCollider = true;
        }
        
        if (mesh.name.includes('trigger')) {
          // Trigger volumes for events
          mesh.visible = false;
          mesh.userData.isTrigger = true;
          mesh.userData.triggerType = mesh.name.split('_')[1] || 'default';
        }
        
        // Performance optimizations for geometry
        if (mesh.geometry) {
          // Ensure geometry is optimized
          if (!mesh.geometry.boundingBox) {
            mesh.geometry.computeBoundingBox();
          }
          if (!mesh.geometry.boundingSphere) {
            mesh.geometry.computeBoundingSphere();
          }
        }
        
        // Process materials to reduce memory usage
        if (mesh.material) {
          // Handle both single materials and arrays
          const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          
          materials.forEach(material => {
            // Apply common material optimizations
            material.needsUpdate = true;
            
            // For MeshStandardMaterial, reduce quality settings if needed
            if (material instanceof THREE.MeshStandardMaterial) {
              // Reduce environment map intensity to save performance
              material.envMapIntensity = 0.5;
            }
          });
        }
      }
    });
    
    console.log('Scene processing complete');
  };

  // Show fallback if there was an error loading the map
  if (hasError) {
    return (
      <group>
        <mesh position={[0, 1, 0]}>
          <boxGeometry args={[2, 2, 2]} />
          <meshStandardMaterial color="red" />
        </mesh>
        <primitive object={new THREE.AxesHelper(10)} />
        {errorMessage && (
          <group position={[0, 5, 0]}>
            <mesh>
              <boxGeometry args={[1, 1, 1]} />
              <meshStandardMaterial color="yellow" />
            </mesh>
          </group>
        )}
      </group>
    );
  }

  return (
    <group ref={sceneRef} position={[0, 0, 0]} rotation={[0, 0, 0]} scale={1} name="map-model">
      {/* The scene will be added to this group in the useEffect */}
      {!isLoaded && (
        <mesh position={[0, 1, 0]}>
          <sphereGeometry args={[0.5, 8, 8]} />
          <meshStandardMaterial color="blue" wireframe />
        </mesh>
      )}
    </group>
  );
});

// Ensure proper display name for debugging
MapModel.displayName = 'MapModel'; 