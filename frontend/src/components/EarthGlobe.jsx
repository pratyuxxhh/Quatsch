import React, { useRef, useEffect, useState } from 'react';
import { useLoader, useFrame, useThree } from '@react-three/fiber';
import { TextureLoader } from 'three';
import { Environment, Stars } from '@react-three/drei';
import * as THREE from 'three';
// here we can change the earth texture and the atmosphere color and the roughness and the metalness
const EarthGlobe = ({ earthTextureUrl, chaosMode = false }) => {
  const meshRef = useRef();
  const atmosphereRef = useRef();
  const targetPositionRef = useRef(new THREE.Vector3(2, 0, 0));
  const chaosVelocityRef = useRef(new THREE.Vector3(0, 0, 0));
  const chaosRotationRef = useRef(new THREE.Vector3(0, 0, 0));
  const { viewport } = useThree();
  const [chaosTarget, setChaosTarget] = useState(new THREE.Vector3(0, 0, 0));

  // Load the Earth texture with error handling
  const earthTexture = useLoader(TextureLoader, earthTextureUrl, undefined, (error) => {
    console.error('Error loading Earth texture:', error);
  });

  // Set initial position (starts above, moves down into place on the right)
  useEffect(() => {
    const targetX = Math.min(Math.max(viewport.width * 0.25, 1.5), 4);
    const startY = Math.max(viewport.height * 0.3, 2.5);
    targetPositionRef.current.set(targetX, 0, 0);

    if (meshRef.current) {
      meshRef.current.position.set(targetX, startY, 0);
    }
    if (atmosphereRef.current) {
      atmosphereRef.current.position.set(targetX, startY, 0);
    }
  }, [viewport.width, viewport.height]);

  // Update chaos target periodically
  useEffect(() => {
    if (!chaosMode) return;
    
    const interval = setInterval(() => {
      setChaosTarget(new THREE.Vector3(
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 8 - 2, // Tend to fall down
        (Math.random() - 0.5) * 8
      ));
    }, 2000 + Math.random() * 2000); // Random interval between 2-4 seconds
    
    return () => clearInterval(interval);
  }, [chaosMode]);

  // Rotate the globe continuously
  useFrame((state, delta) => {
    if (meshRef.current) {
      if (chaosMode) {
        // Chaos mode: intense random movements, falling, spinning
        // Add stronger gravity effect (faster falling)
        chaosVelocityRef.current.y -= 0.15 * delta;
        
        // Add more intense random forces
        chaosVelocityRef.current.x += (Math.random() - 0.5) * 2.0 * delta;
        chaosVelocityRef.current.z += (Math.random() - 0.5) * 2.0 * delta;
        
        // Apply velocity with less damping for more intense movement
        meshRef.current.position.add(chaosVelocityRef.current.clone().multiplyScalar(delta * 2));
        chaosVelocityRef.current.multiplyScalar(0.92); // Less damping
        
        // Much faster random rotation on all axes
        chaosRotationRef.current.x += (Math.random() - 0.5) * 0.5;
        chaosRotationRef.current.y += (Math.random() - 0.5) * 0.5;
        chaosRotationRef.current.z += (Math.random() - 0.5) * 0.5;
        
        meshRef.current.rotation.x += chaosRotationRef.current.x * delta * 3;
        meshRef.current.rotation.y += chaosRotationRef.current.y * delta * 3;
        meshRef.current.rotation.z += chaosRotationRef.current.z * delta * 3;
        
        // Less dampening for more intense rotation
        chaosRotationRef.current.multiplyScalar(0.95);
        
        // Bounce back if too far
        if (meshRef.current.position.y < -10) {
          chaosVelocityRef.current.y = Math.abs(chaosVelocityRef.current.y) * 0.8;
        }
        if (Math.abs(meshRef.current.position.x) > 8 || Math.abs(meshRef.current.position.z) > 8) {
          chaosVelocityRef.current.x *= -0.7;
          chaosVelocityRef.current.z *= -0.7;
        }
      } else {
        // Normal mode: smooth movement
        meshRef.current.position.lerp(targetPositionRef.current, 0.02);
        meshRef.current.rotation.y += 0.01;
        
        // Reset chaos state
        chaosVelocityRef.current.set(0, 0, 0);
        chaosRotationRef.current.set(0, 0, 0);
      }
    }
    
      if (atmosphereRef.current) {
        if (chaosMode) {
          // Atmosphere follows with slight delay and intense chaos
          atmosphereRef.current.position.lerp(meshRef.current.position, 0.15);
          atmosphereRef.current.rotation.x += (Math.random() - 0.5) * 0.8;
          atmosphereRef.current.rotation.y += 0.3 + (Math.random() - 0.5) * 0.5;
          atmosphereRef.current.rotation.z += (Math.random() - 0.5) * 0.8;
      } else {
        atmosphereRef.current.position.lerp(targetPositionRef.current, 0.02);
        atmosphereRef.current.rotation.y += 0.09;
      }
    }
  });

  return (
    <>
      {/* Stars background */}
      <Stars
        radius={300}
        depth={60}
        count={5000}
        factor={4}
        saturation={0}
        fade
        speed={0.5}
      />

      {/* Environment lighting for realistic reflections */}
      <Environment preset="night" />

      {/* Main Earth sphere */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[2, 64, 64]} />
        <meshStandardMaterial
          map={earthTexture}
          roughness={0.7}
          metalness={0.00001}
          emissive={0x000000}
          emissiveIntensity={0.001}
          toneMapped
        />
      </mesh>

      {/* Atmosphere effect - slightly larger, translucent blue sphere */}
      <mesh ref={atmosphereRef}>
        <sphereGeometry args={[2.05, 64, 64]} />
        <meshStandardMaterial
          color={0x4a90e2}
          transparent
          opacity={0.25}
          side={THREE.BackSide}
          roughness={0.5}
        />
      </mesh>
    </>
  );
};

export default EarthGlobe;

