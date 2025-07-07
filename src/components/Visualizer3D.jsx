import React, { Suspense, useRef, useState, useCallback, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
  OrbitControls,
  PerspectiveCamera,
  Environment,
  Float,
  Text,
  Sphere,
  Box,
  Cylinder,
  useTexture,
  Stars,
} from '@react-three/drei';
import {
  EffectComposer,
  Bloom,
  Noise,
  Vignette,
} from '@react-three/postprocessing';
import { motion } from 'framer-motion';
import {
  Box as MuiBox,
  CircularProgress,
  Typography,
  IconButton,
  Slider,
  Stack,
  useTheme,
  useMediaQuery,
  alpha,
} from '@mui/material';
import {
  Fullscreen,
  FullscreenExit,
  Tune,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import * as THREE from 'three';

// Performance-optimized audio visualizer sphere
const AudioSphere = ({ audioData, color, position, scale = 1 }) => {
  const meshRef = useRef();
  const materialRef = useRef();
  const [hovered, setHovered] = useState(false);
  
  // Use instanced geometry for better performance
  const geometry = useMemo(() => new THREE.SphereGeometry(1, 16, 16), []);
  
  useFrame((state) => {
    if (meshRef.current && audioData) {
      const time = state.clock.getElapsedTime();
      const avgFreq = audioData.reduce((sum, val) => sum + val, 0) / audioData.length;
      
      // Animate based on audio data
      meshRef.current.scale.setScalar(scale * (1 + avgFreq * 0.3));
      meshRef.current.rotation.x = time * 0.5;
      meshRef.current.rotation.y = time * 0.3;
      
      // Update material opacity based on audio intensity
      if (materialRef.current) {
        materialRef.current.opacity = 0.7 + avgFreq * 0.3;
      }
    }
  });
  
  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      position={position}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <meshStandardMaterial
        ref={materialRef}
        color={color}
        transparent
        opacity={0.7}
        roughness={0.1}
        metalness={0.8}
        emissive={hovered ? color : '#000000'}
        emissiveIntensity={hovered ? 0.3 : 0}
      />
    </mesh>
  );
};

// Floating frequency bars
const FrequencyBars = ({ audioData, count = 32 }) => {
  const groupRef = useRef();
  const isMobile = window.innerWidth < 768;
  
  // Reduce bar count on mobile for performance
  const barCount = isMobile ? Math.min(count, 16) : count;
  
  useFrame((state) => {
    if (groupRef.current && audioData) {
      const time = state.clock.getElapsedTime();
      groupRef.current.rotation.y = time * 0.2;
      
      // Update each bar based on frequency data
      groupRef.current.children.forEach((bar, index) => {
        const dataIndex = Math.floor((index / barCount) * audioData.length);
        const intensity = audioData[dataIndex] || 0;
        bar.scale.y = 0.5 + intensity * 2;
        bar.material.color.setHSL((index / barCount) * 0.8, 0.8, 0.5 + intensity * 0.3);
      });
    }
  });
  
  return (
    <group ref={groupRef}>
      {Array.from({ length: barCount }).map((_, index) => {
        const angle = (index / barCount) * Math.PI * 2;
        const radius = 5;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        
        return (
          <Box
            key={index}
            position={[x, 0, z]}
            args={[0.2, 1, 0.2]}
            rotation={[0, angle, 0]}
          >
            <meshStandardMaterial
              color={`hsl(${(index / barCount) * 360}, 70%, 50%)`}
              transparent
              opacity={0.8}
            />
          </Box>
        );
      })}
    </group>
  );
};

// Particle system for ambient effects
const ParticleField = ({ count = 100, audioData }) => {
  const meshRef = useRef();
  const isMobile = window.innerWidth < 768;
  
  // Reduce particle count on mobile
  const particleCount = isMobile ? Math.min(count, 50) : count;
  
  const particlesPosition = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    return positions;
  }, [particleCount]);
  
  useFrame((state) => {
    if (meshRef.current && audioData) {
      const time = state.clock.getElapsedTime();
      const avgIntensity = audioData.reduce((sum, val) => sum + val, 0) / audioData.length;
      
      // Animate particles based on audio
      meshRef.current.rotation.x = time * 0.1;
      meshRef.current.rotation.y = time * 0.05;
      
      // Update particle opacity based on audio intensity
      meshRef.current.material.opacity = 0.3 + avgIntensity * 0.4;
    }
  });
  
  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={particlesPosition}
          itemSize={3}
          count={particleCount}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.1}
        color="#ffffff"
        transparent
        opacity={0.3}
        sizeAttenuation={false}
      />
    </points>
  );
};

// Main 3D scene component
const Scene = ({ audioData, soundscapes, settings }) => {
  const { camera, gl } = useThree();
  const isMobile = window.innerWidth < 768;
  
  // Enable performance monitoring
  useEffect(() => {
    if (gl) {
      gl.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
      gl.shadowMap.enabled = !isMobile; // Disable shadows on mobile
      gl.shadowMap.type = THREE.PCFSoftShadowMap;
    }
  }, [gl, isMobile]);
  
  return (
    <>
      {/* Ambient lighting */}
      <ambientLight intensity={0.3} />
      <directionalLight
        position={[5, 5, 5]}
        intensity={0.8}
        castShadow={!isMobile}
        shadow-mapSize-width={isMobile ? 512 : 1024}
        shadow-mapSize-height={isMobile ? 512 : 1024}
      />
      
      {/* Background */}
      <Stars
        radius={100}
        depth={50}
        count={isMobile ? 2000 : 5000}
        factor={4}
        saturation={0}
        fade
      />
      
      {/* Audio visualizers */}
      {soundscapes.map((soundscape, index) => (
        <Float
          key={soundscape.id}
          speed={1 + index * 0.2}
          rotationIntensity={0.5}
          floatIntensity={0.5}
        >
          <AudioSphere
            audioData={audioData}
            color={soundscape.color || `hsl(${index * 60}, 70%, 50%)`}
            position={[
              Math.cos((index / soundscapes.length) * Math.PI * 2) * 3,
              Math.sin(index * 0.5) * 2,
              Math.sin((index / soundscapes.length) * Math.PI * 2) * 3,
            ]}
            scale={0.5 + (soundscape.volume || 50) / 100}
          />
        </Float>
      ))}
      
      {/* Frequency visualization */}
      {settings.showFrequencyBars && (
        <FrequencyBars audioData={audioData} count={isMobile ? 16 : 32} />
      )}
      
      {/* Particle effects */}
      {settings.showParticles && (
        <ParticleField count={isMobile ? 50 : 100} audioData={audioData} />
      )}
      
      {/* Post-processing effects */}
      {!isMobile && (
        <EffectComposer>
          <Bloom
            intensity={0.5}
            luminanceThreshold={0.9}
            luminanceSmoothing={0.025}
          />
          <Noise opacity={0.02} />
          <Vignette eskil={false} offset={0.1} darkness={0.5} />
        </EffectComposer>
      )}
    </>
  );
};

// Main component
const Visualizer3D = ({
  audioData = [],
  soundscapes = [],
  isPlaying = false,
  onFullscreenToggle,
  isFullscreen = false,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [settings, setSettings] = useState({
    showFrequencyBars: true,
    showParticles: !isMobile, // Disable particles on mobile by default
    bloomIntensity: 0.5,
    cameraDistance: 10,
  });
  const [controlsEnabled, setControlsEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  
  // Generate mock audio data if not provided
  const mockAudioData = useMemo(() => {
    return Array.from({ length: 64 }, (_, i) => {
      const time = Date.now() * 0.001;
      return Math.sin(time + i * 0.1) * 0.5 + 0.5;
    });
  }, []);
  
  const currentAudioData = audioData.length > 0 ? audioData : mockAudioData;
  
  // Handle canvas ready
  const handleCanvasReady = useCallback(() => {
    setLoading(false);
  }, []);
  
  // Touch gesture handling
  const handleTouchStart = useCallback((e) => {
    if (e.touches.length === 2) {
      // Two-finger gesture - disable controls for zoom
      setControlsEnabled(false);
    }
  }, []);
  
  const handleTouchEnd = useCallback(() => {
    setControlsEnabled(true);
  }, []);
  
  return (
    <MuiBox
      sx={{
        position: 'relative',
        width: '100%',
        height: isFullscreen ? '100vh' : '400px',
        overflow: 'hidden',
        borderRadius: isFullscreen ? 0 : 2,
        backgroundColor: '#000',
        '& canvas': {
          display: 'block',
        },
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Loading overlay */}
      {loading && (
        <MuiBox
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            zIndex: 10,
          }}
        >
          <Stack alignItems="center" spacing={2}>
            <CircularProgress color="primary" />
            <Typography variant="body2" color="white">
              Initializing 3D Visualizer...
            </Typography>
          </Stack>
        </MuiBox>
      )}
      
      {/* Controls overlay */}
      <MuiBox
        sx={{
          position: 'absolute',
          top: 16,
          right: 16,
          zIndex: 20,
          display: 'flex',
          gap: 1,
        }}
      >
        <IconButton
          onClick={() => setSettings(prev => ({ ...prev, showFrequencyBars: !prev.showFrequencyBars }))}
          sx={{
            backgroundColor: alpha(theme.palette.background.paper, 0.8),
            color: settings.showFrequencyBars ? theme.palette.primary.main : theme.palette.text.primary,
            '&:hover': {
              backgroundColor: alpha(theme.palette.background.paper, 0.9),
            },
          }}
          size={isMobile ? 'small' : 'medium'}
        >
          <Tune />
        </IconButton>
        
        <IconButton
          onClick={() => setSettings(prev => ({ ...prev, showParticles: !prev.showParticles }))}
          sx={{
            backgroundColor: alpha(theme.palette.background.paper, 0.8),
            color: settings.showParticles ? theme.palette.primary.main : theme.palette.text.primary,
            '&:hover': {
              backgroundColor: alpha(theme.palette.background.paper, 0.9),
            },
          }}
          size={isMobile ? 'small' : 'medium'}
        >
          {settings.showParticles ? <Visibility /> : <VisibilityOff />}
        </IconButton>
        
        <IconButton
          onClick={onFullscreenToggle}
          sx={{
            backgroundColor: alpha(theme.palette.background.paper, 0.8),
            '&:hover': {
              backgroundColor: alpha(theme.palette.background.paper, 0.9),
            },
          }}
          size={isMobile ? 'small' : 'medium'}
        >
          {isFullscreen ? <FullscreenExit /> : <Fullscreen />}
        </IconButton>
      </MuiBox>
      
      {/* 3D Canvas */}
      <Canvas
        onCreated={handleCanvasReady}
        gl={{
          antialias: !isMobile,
          alpha: true,
          powerPreference: 'high-performance',
          stencil: false,
          depth: true,
        }}
        camera={{
          position: [0, 0, settings.cameraDistance],
          fov: isMobile ? 70 : 60,
        }}
        dpr={Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2)}
      >
        <Suspense fallback={null}>
          <Scene
            audioData={currentAudioData}
            soundscapes={soundscapes}
            settings={settings}
          />
          
          <OrbitControls
            enabled={controlsEnabled}
            enableZoom={!isMobile}
            enablePan={!isMobile}
            enableRotate={true}
            autoRotate={isPlaying}
            autoRotateSpeed={0.5}
            minDistance={isMobile ? 5 : 3}
            maxDistance={isMobile ? 15 : 20}
            maxPolarAngle={Math.PI / 1.5}
            minPolarAngle={Math.PI / 6}
            touches={{
              ONE: THREE.TOUCH.ROTATE,
              TWO: THREE.TOUCH.DOLLY_PAN,
            }}
          />
        </Suspense>
      </Canvas>
      
      {/* Mobile performance hint */}
      {isMobile && (
        <MuiBox
          sx={{
            position: 'absolute',
            bottom: 16,
            left: 16,
            right: 16,
            textAlign: 'center',
            zIndex: 10,
          }}
        >
          <Typography
            variant="caption"
            sx={{
              color: 'rgba(255, 255, 255, 0.7)',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              padding: '4px 8px',
              borderRadius: 1,
              fontSize: '0.75rem',
            }}
          >
            Pinch to zoom • Single finger to rotate
          </Typography>
        </MuiBox>
      )}
    </MuiBox>
  );
};

export default Visualizer3D;