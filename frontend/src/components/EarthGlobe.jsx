import React, { useRef, useEffect } from 'react';
import { useLoader, useFrame, useThree } from '@react-three/fiber';
import { TextureLoader } from 'three';
import { Environment, Stars } from '@react-three/drei';
import * as THREE from 'three';
// here we can change the earth texture and the atmosphere color and the roughness and the metalness
const EarthGlobe = ({ earthTextureUrl }) => {
  const meshRef = useRef();
  const atmosphereRef = useRef();
  const targetPositionRef = useRef(new THREE.Vector3(2, 0, 0));
  const { viewport } = useThree();

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

  // Rotate the globe continuously
  useFrame(() => {
    if (meshRef.current) {
      // Ease the globe into position from above
      meshRef.current.position.lerp(targetPositionRef.current, 0.02);
      // Rotate continuously
      meshRef.current.rotation.y += 0.01;
    }
    if (atmosphereRef.current) {
      atmosphereRef.current.position.lerp(targetPositionRef.current, 0.02);
      atmosphereRef.current.rotation.y += 0.09;
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

