import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Box,
  IconButton,
  Typography,
  Fade,
  Slide,
  Zoom,
  Stack,
  Chip,
  LinearProgress,
  useTheme,
  useMediaQuery,
  alpha,
} from '@mui/material';
import {
  Close,
  PlayArrow,
  Pause,
  VolumeUp,
  VolumeDown,
  Fullscreen,
  FullscreenExit,
  ScreenRotation,
  BatteryAlert,
  Brightness4,
  Brightness7,
  Settings,
  ZoomIn,
  ZoomOut,
} from '@mui/icons-material';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { useSwipeable } from 'react-swipeable';
import { useLongPress } from 'use-long-press';

const FullscreenViewer = ({
  open = false,
  onClose,
  soundscape,
  isPlaying = false,
  onTogglePlay,
  volume = 50,
  onVolumeChange,
  children,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  
  const [controlsVisible, setControlsVisible] = useState(true);
  const [orientation, setOrientation] = useState('portrait');
  const [batteryLevel, setBatteryLevel] = useState(100);
  const [isLowPowerMode, setIsLowPowerMode] = useState(false);
  const [brightness, setBrightness] = useState(100);
  const [lastInteraction, setLastInteraction] = useState(Date.now());
  const [isImmersive, setIsImmersive] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  
  const controlsTimeoutRef = useRef(null);
  const batteryRef = useRef(null);
  const animationRef = useRef(null);
  const touchStartRef = useRef(null);
  const lastTouchRef = useRef(null);
  const containerRef = useRef(null);
  
  // Battery monitoring
  useEffect(() => {
    if ('getBattery' in navigator) {
      navigator.getBattery().then(battery => {
        batteryRef.current = battery;
        setBatteryLevel(Math.round(battery.level * 100));
        setIsLowPowerMode(battery.level < 0.2);
        
        const updateBattery = () => {
          setBatteryLevel(Math.round(battery.level * 100));
          setIsLowPowerMode(battery.level < 0.2);
        };
        
        battery.addEventListener('levelchange', updateBattery);
        battery.addEventListener('chargingchange', updateBattery);
        
        return () => {
          battery.removeEventListener('levelchange', updateBattery);
          battery.removeEventListener('chargingchange', updateBattery);
        };
      });
    }
  }, []);
  
  // Orientation handling
  useEffect(() => {
    const handleOrientationChange = () => {
      setOrientation(window.screen?.orientation?.type || 'portrait');
      navigator.vibrate?.(10);
    };
    
    window.addEventListener('orientationchange', handleOrientationChange);
    return () => window.removeEventListener('orientationchange', handleOrientationChange);
  }, []);
  
  // Auto-hide controls
  useEffect(() => {
    if (open) {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      
      controlsTimeoutRef.current = setTimeout(() => {
        if (Date.now() - lastInteraction > 3000) {
          setControlsVisible(false);
        }
      }, 3000);
    }
    
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [open, lastInteraction]);
  
  // Wake lock for screen
  useEffect(() => {
    let wakeLock = null;
    
    if (open && 'wakeLock' in navigator) {
      navigator.wakeLock.request('screen').then(lock => {
        wakeLock = lock;
      }).catch(() => {
        // Wake lock not supported or failed
      });
    }
    
    return () => {
      if (wakeLock) {
        wakeLock.release();
      }
    };
  }, [open]);
  
  // Battery optimization
  useEffect(() => {
    if (isLowPowerMode) {
      // Reduce animation frame rate
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }
  }, [isLowPowerMode]);
  
  const handleInteraction = useCallback(() => {
    setLastInteraction(Date.now());
    setControlsVisible(true);
    navigator.vibrate?.(5);
  }, []);
  
  const handleToggleImmersive = useCallback(() => {
    setIsImmersive(!isImmersive);
    if (document.documentElement.requestFullscreen && !isImmersive) {
      document.documentElement.requestFullscreen();
    } else if (document.exitFullscreen && isImmersive) {
      document.exitFullscreen();
    }
    navigator.vibrate?.(20);
  }, [isImmersive]);
  
  // Gesture handlers
  const swipeHandlers = useSwipeable({
    onSwipedUp: () => {
      handleInteraction();
      if (controlsVisible) {
        setBrightness(prev => Math.min(100, prev + 10));
      }
    },
    onSwipedDown: () => {
      handleInteraction();
      if (controlsVisible) {
        setBrightness(prev => Math.max(10, prev - 10));
      } else {
        onClose();
      }
    },
    onSwipedLeft: () => {
      handleInteraction();
      if (volume > 0) {
        onVolumeChange?.(Math.max(0, volume - 10));
      }
    },
    onSwipedRight: () => {
      handleInteraction();
      if (volume < 100) {
        onVolumeChange?.(Math.min(100, volume + 10));
      }
    },
    trackMouse: false,
    trackTouch: true,
    delta: 50,
  });
  
  // Pinch to zoom
  const handleTouchStart = useCallback((e) => {
    if (e.touches.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) +
        Math.pow(touch2.clientY - touch1.clientY, 2)
      );
      touchStartRef.current = { distance, zoom };
    } else if (e.touches.length === 1) {
      const touch = e.touches[0];
      lastTouchRef.current = { x: touch.clientX, y: touch.clientY, panOffset };
    }
    handleInteraction();
  }, [zoom, panOffset]);
  
  const handleTouchMove = useCallback((e) => {
    e.preventDefault();
    
    if (e.touches.length === 2 && touchStartRef.current) {
      // Pinch to zoom
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) +
        Math.pow(touch2.clientY - touch1.clientY, 2)
      );
      
      const scale = distance / touchStartRef.current.distance;
      const newZoom = Math.min(3, Math.max(0.5, touchStartRef.current.zoom * scale));
      setZoom(newZoom);
      
    } else if (e.touches.length === 1 && lastTouchRef.current && zoom > 1) {
      // Pan when zoomed
      const touch = e.touches[0];
      const deltaX = touch.clientX - lastTouchRef.current.x;
      const deltaY = touch.clientY - lastTouchRef.current.y;
      
      setPanOffset({
        x: lastTouchRef.current.panOffset.x + deltaX,
        y: lastTouchRef.current.panOffset.y + deltaY,
      });
    }
  }, [zoom]);
  
  const handleTouchEnd = useCallback(() => {
    touchStartRef.current = null;
    lastTouchRef.current = null;
  }, []);
  
  // Double tap to zoom
  const handleDoubleTap = useCallback(() => {
    if (zoom === 1) {
      setZoom(2);
      setPanOffset({ x: 0, y: 0 });
    } else {
      setZoom(1);
      setPanOffset({ x: 0, y: 0 });
    }
    navigator.vibrate?.(30);
  }, [zoom]);
  
  // Long press for settings
  const bind = useLongPress(
    () => {
      setControlsVisible(true);
      navigator.vibrate?.(50);
    },
    {
      threshold: 1000,
      captureEvent: true,
      cancelOnMovement: 25,
    }
  );
  
  const contentStyle = useMemo(() => ({
    transform: `scale(${zoom}) translate(${panOffset.x / zoom}px, ${panOffset.y / zoom}px)`,
    transformOrigin: 'center',
    transition: touchStartRef.current ? 'none' : 'transform 0.3s ease-out',
    filter: `brightness(${brightness}%)`,
  }), [zoom, panOffset, brightness]);
  
  if (!open) return null;
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: '#000',
          zIndex: 9999,
          overflow: 'hidden',
        }}
      >
        <Box
          ref={containerRef}
          sx={{
            height: '100vh',
            width: '100vw',
            position: 'relative',
            cursor: controlsVisible ? 'default' : 'none',
            userSelect: 'none',
            touchAction: 'none',
          }}
          {...swipeHandlers}
          {...bind()}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onDoubleClick={handleDoubleTap}
          onClick={handleInteraction}
        >
          {/* Content */}
          <Box
            sx={{
              height: '100%',
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              ...contentStyle,
            }}
          >
            {children}
          </Box>
          
          {/* Top Controls */}
          <Fade in={controlsVisible}>
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                background: `linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, transparent 100%)`,
                p: 2,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                zIndex: 10,
              }}
            >
              <Stack direction="row" spacing={1} alignItems="center">
                <IconButton
                  onClick={onClose}
                  sx={{
                    color: 'white',
                    backgroundColor: alpha('#000', 0.5),
                    '&:hover': {
                      backgroundColor: alpha('#000', 0.7),
                    },
                  }}
                >
                  <Close />
                </IconButton>
                
                {soundscape && (
                  <Box>
                    <Typography variant="h6" color="white" sx={{ fontWeight: 600 }}>
                      {soundscape.title}
                    </Typography>
                    {soundscape.description && (
                      <Typography variant="body2" color="rgba(255,255,255,0.7)">
                        {soundscape.description}
                      </Typography>
                    )}
                  </Box>
                )}
              </Stack>
              
              <Stack direction="row" spacing={1} alignItems="center">
                {/* Battery indicator */}
                {batteryLevel < 30 && (
                  <Chip
                    icon={<BatteryAlert />}
                    label={`${batteryLevel}%`}
                    size="small"
                    color={batteryLevel < 15 ? 'error' : 'warning'}
                    sx={{ color: 'white' }}
                  />
                )}
                
                {/* Orientation indicator */}
                {isMobile && (
                  <IconButton
                    onClick={() => screen.orientation?.lock?.('landscape')}
                    sx={{
                      color: 'white',
                      backgroundColor: alpha('#000', 0.5),
                    }}
                    size="small"
                  >
                    <ScreenRotation />
                  </IconButton>
                )}
              </Stack>
            </Box>
          </Fade>
          
          {/* Center Play Button */}
          <Fade in={controlsVisible}>
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 10,
              }}
            >
              <motion.div
                whileTap={{ scale: 0.9 }}
                whileHover={{ scale: 1.1 }}
              >
                <IconButton
                  onClick={onTogglePlay}
                  sx={{
                    width: 80,
                    height: 80,
                    backgroundColor: alpha(theme.palette.primary.main, 0.9),
                    color: 'white',
                    '&:hover': {
                      backgroundColor: theme.palette.primary.main,
                      transform: 'scale(1.05)',
                    },
                    '&:active': {
                      transform: 'scale(0.95)',
                    },
                  }}
                >
                  {isPlaying ? (
                    <Pause sx={{ fontSize: 40 }} />
                  ) : (
                    <PlayArrow sx={{ fontSize: 40 }} />
                  )}
                </IconButton>
              </motion.div>
            </Box>
          </Fade>
          
          {/* Bottom Controls */}
          <Slide direction="up" in={controlsVisible}>
            <Box
              sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                background: `linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)`,
                p: 2,
                zIndex: 10,
              }}
            >
              <Stack spacing={2}>
                {/* Volume Control */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <VolumeDown sx={{ color: 'white' }} />
                  <Box sx={{ flex: 1 }}>
                    <LinearProgress
                      variant="determinate"
                      value={volume}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: alpha('#fff', 0.3),
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: theme.palette.primary.main,
                          borderRadius: 4,
                        },
                      }}
                    />
                  </Box>
                  <VolumeUp sx={{ color: 'white' }} />
                </Box>
                
                {/* Control Buttons */}
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                  <IconButton
                    onClick={() => setZoom(zoom === 1 ? 2 : 1)}
                    sx={{ color: 'white', backgroundColor: alpha('#000', 0.5) }}
                  >
                    {zoom === 1 ? <ZoomIn /> : <ZoomOut />}
                  </IconButton>
                  
                  <IconButton
                    onClick={() => setBrightness(brightness === 100 ? 50 : 100)}
                    sx={{ color: 'white', backgroundColor: alpha('#000', 0.5) }}
                  >
                    {brightness === 100 ? <Brightness7 /> : <Brightness4 />}
                  </IconButton>
                  
                  <IconButton
                    onClick={handleToggleImmersive}
                    sx={{ color: 'white', backgroundColor: alpha('#000', 0.5) }}
                  >
                    {isImmersive ? <FullscreenExit /> : <Fullscreen />}
                  </IconButton>
                </Box>
              </Stack>
            </Box>
          </Slide>
          
          {/* Gesture Hints */}
          {isMobile && (
            <Fade in={controlsVisible} timeout={2000}>
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 100,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  textAlign: 'center',
                  zIndex: 5,
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.7)',
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    padding: '8px 16px',
                    borderRadius: 2,
                    fontSize: '0.75rem',
                    lineHeight: 1.4,
                  }}
                >
                  Swipe up/down: Brightness • Left/right: Volume
                  <br />
                  Pinch: Zoom • Double tap: Reset zoom
                </Typography>
              </Box>
            </Fade>
          )}
          
          {/* Low Power Mode Indicator */}
          {isLowPowerMode && (
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: 16,
                transform: 'translateY(-50%)',
                zIndex: 5,
              }}
            >
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Chip
                  icon={<BatteryAlert />}
                  label="Low Power Mode"
                  size="small"
                  color="warning"
                  sx={{ color: 'white' }}
                />
              </motion.div>
            </Box>
          )}
        </Box>
      </motion.div>
    </AnimatePresence>
  );
};

export default FullscreenViewer;