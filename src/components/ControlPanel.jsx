import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  IconButton,
  Typography,
  Slider,
  Stack,
  Button,
  ButtonGroup,
  Chip,
  Switch,
  FormControlLabel,
  Collapse,
  Divider,
  useTheme,
  useMediaQuery,
  alpha,
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  Stop,
  VolumeUp,
  VolumeDown,
  VolumeMute,
  Settings,
  Equalizer,
  Shuffle,
  Repeat,
  ExpandMore,
  ExpandLess,
  Loop,
  Replay,
  TuneRounded,
  Headphones,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useLongPress } from 'use-long-press';

const ControlPanel = ({
  isPlaying = false,
  onPlay,
  onPause,
  onStop,
  volume = 50,
  onVolumeChange,
  crossfadeTime = 3000,
  onCrossfadeChange,
  soundscapes = [],
  activeSoundscapes = [],
  onSoundscapeVolumeChange,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  
  const [expanded, setExpanded] = useState(false);
  const [localVolume, setLocalVolume] = useState(volume);
  const [localCrossfade, setLocalCrossfade] = useState(crossfadeTime);
  const [eqEnabled, setEqEnabled] = useState(false);
  const [shuffleEnabled, setShuffleEnabled] = useState(false);
  const [repeatMode, setRepeatMode] = useState('off'); // 'off', 'one', 'all'
  const [touchStartY, setTouchStartY] = useState(0);
  const [panelHeight, setPanelHeight] = useState(0);
  const volumeTimeoutRef = useRef(null);
  const crossfadeTimeoutRef = useRef(null);
  
  // Handle volume change with debouncing
  const handleVolumeChange = useCallback((newValue) => {
    setLocalVolume(newValue);
    navigator.vibrate?.(5);
    
    if (volumeTimeoutRef.current) {
      clearTimeout(volumeTimeoutRef.current);
    }
    
    volumeTimeoutRef.current = setTimeout(() => {
      onVolumeChange?.(newValue);
    }, 100);
  }, [onVolumeChange]);
  
  // Handle crossfade change with debouncing
  const handleCrossfadeChange = useCallback((newValue) => {
    setLocalCrossfade(newValue);
    navigator.vibrate?.(5);
    
    if (crossfadeTimeoutRef.current) {
      clearTimeout(crossfadeTimeoutRef.current);
    }
    
    crossfadeTimeoutRef.current = setTimeout(() => {
      onCrossfadeChange?.(newValue);
    }, 100);
  }, [onCrossfadeChange]);
  
  // Handle play/pause with haptic feedback
  const handlePlayPause = useCallback(() => {
    navigator.vibrate?.(20);
    if (isPlaying) {
      onPause?.();
    } else {
      onPlay?.();
    }
  }, [isPlaying, onPlay, onPause]);
  
  // Handle stop with haptic feedback
  const handleStop = useCallback(() => {
    navigator.vibrate?.([10, 20, 10]);
    onStop?.();
  }, [onStop]);
  
  // Long press for advanced controls
  const bind = useLongPress(
    () => {
      setExpanded(!expanded);
      navigator.vibrate?.(50);
    },
    {
      threshold: 500,
      captureEvent: true,
      cancelOnMovement: 25,
    }
  );
  
  // Touch handlers for panel swipe
  const handleTouchStart = useCallback((e) => {
    setTouchStartY(e.touches[0].clientY);
  }, []);
  
  const handleTouchMove = useCallback((e) => {
    const deltaY = e.touches[0].clientY - touchStartY;
    if (Math.abs(deltaY) > 10) {
      const newHeight = Math.max(0, Math.min(200, panelHeight - deltaY));
      setPanelHeight(newHeight);
    }
  }, [touchStartY, panelHeight]);
  
  const getVolumeIcon = (vol) => {
    if (vol === 0) return <VolumeMute />;
    if (vol < 30) return <VolumeDown />;
    return <VolumeUp />;
  };
  
  const formatTime = (ms) => {
    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };
  
  const RepeatIcon = () => {
    switch (repeatMode) {
      case 'one':
        return <Replay />;
      case 'all':
        return <Repeat />;
      default:
        return <Loop />;
    }
  };
  
  const cycleRepeatMode = useCallback(() => {
    setRepeatMode(prev => {
      const modes = ['off', 'one', 'all'];
      const currentIndex = modes.indexOf(prev);
      const nextIndex = (currentIndex + 1) % modes.length;
      navigator.vibrate?.(15);
      return modes[nextIndex];
    });
  }, []);
  
  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        background: `linear-gradient(to top, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.background.paper, 0.95)} 100%)`,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
        pb: isMobile ? 2 : 1,
        pt: 1,
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
    >
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <Box sx={{ px: 2 }}>
          {/* Main Controls */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              mb: expanded ? 2 : 0,
            }}
          >
            {/* Left side - Volume */}
            <Box sx={{ display: 'flex', alignItems: 'center', flex: 1, maxWidth: 120 }}>
              <IconButton
                size={isMobile ? 'small' : 'medium'}
                onClick={() => handleVolumeChange(localVolume === 0 ? 50 : 0)}
                sx={{
                  mr: 1,
                  '&:active': {
                    transform: 'scale(0.9)',
                  },
                }}
              >
                {getVolumeIcon(localVolume)}
              </IconButton>
              <Slider
                value={localVolume}
                onChange={(_, value) => handleVolumeChange(value)}
                min={0}
                max={100}
                size={isMobile ? 'small' : 'medium'}
                sx={{
                  '& .MuiSlider-thumb': {
                    width: isMobile ? 20 : 24,
                    height: isMobile ? 20 : 24,
                    '&:active': {
                      transform: 'scale(1.2)',
                    },
                  },
                  '& .MuiSlider-track': {
                    height: isMobile ? 4 : 6,
                  },
                  '& .MuiSlider-rail': {
                    height: isMobile ? 4 : 6,
                  },
                }}
              />
            </Box>
            
            {/* Center - Play Controls */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton
                onClick={handleStop}
                disabled={!isPlaying}
                sx={{
                  '&:active': {
                    transform: 'scale(0.9)',
                  },
                }}
              >
                <Stop />
              </IconButton>
              
              <motion.div
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: 1.05 }}
              >
                <IconButton
                  onClick={handlePlayPause}
                  size="large"
                  sx={{
                    backgroundColor: theme.palette.primary.main,
                    color: theme.palette.primary.contrastText,
                    '&:hover': {
                      backgroundColor: theme.palette.primary.dark,
                    },
                    '&:active': {
                      transform: 'scale(0.95)',
                    },
                  }}
                  {...bind()}
                >
                  {isPlaying ? <Pause /> : <PlayArrow />}
                </IconButton>
              </motion.div>
              
              <IconButton
                onClick={cycleRepeatMode}
                color={repeatMode !== 'off' ? 'primary' : 'default'}
                sx={{
                  '&:active': {
                    transform: 'scale(0.9)',
                  },
                }}
              >
                <RepeatIcon />
              </IconButton>
            </Box>
            
            {/* Right side - Advanced Controls */}
            <Box sx={{ display: 'flex', alignItems: 'center', flex: 1, justifyContent: 'flex-end' }}>
              <IconButton
                onClick={() => setShuffleEnabled(!shuffleEnabled)}
                color={shuffleEnabled ? 'primary' : 'default'}
                sx={{
                  '&:active': {
                    transform: 'scale(0.9)',
                  },
                }}
              >
                <Shuffle />
              </IconButton>
              
              <IconButton
                onClick={() => setExpanded(!expanded)}
                sx={{
                  '&:active': {
                    transform: 'scale(0.9)',
                  },
                }}
              >
                {expanded ? <ExpandLess /> : <ExpandMore />}
              </IconButton>
            </Box>
          </Box>
          
          {/* Active Soundscapes Indicator */}
          {activeSoundscapes.length > 0 && (
            <Box sx={{ mb: 1 }}>
              <Stack direction="row" spacing={1} sx={{ overflow: 'auto' }}>
                {activeSoundscapes.map((soundscape) => (
                  <Chip
                    key={soundscape.id}
                    label={soundscape.title}
                    size="small"
                    color={soundscape.isPlaying ? 'primary' : 'default'}
                    icon={soundscape.isPlaying ? <Headphones /> : null}
                    sx={{
                      minWidth: 'auto',
                      '& .MuiChip-label': {
                        fontSize: '0.75rem',
                      },
                    }}
                  />
                ))}
              </Stack>
            </Box>
          )}
          
          {/* Expanded Controls */}
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Box sx={{ mt: 2 }}>
                  <Divider sx={{ mb: 2 }} />
                  
                  {/* Crossfade Control */}
                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <TuneRounded sx={{ mr: 1 }} />
                      <Typography variant="body2" sx={{ flex: 1 }}>
                        Crossfade Time
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatTime(localCrossfade)}
                      </Typography>
                    </Box>
                    <Slider
                      value={localCrossfade}
                      onChange={(_, value) => handleCrossfadeChange(value)}
                      min={500}
                      max={10000}
                      step={500}
                      size={isMobile ? 'small' : 'medium'}
                      sx={{
                        '& .MuiSlider-thumb': {
                          '&:active': {
                            transform: 'scale(1.2)',
                          },
                        },
                      }}
                    />
                  </Box>
                  
                  {/* Individual Soundscape Controls */}
                  {activeSoundscapes.map((soundscape) => (
                    <Box key={soundscape.id} sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Typography variant="body2" sx={{ flex: 1 }}>
                          {soundscape.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {soundscape.volume}%
                        </Typography>
                      </Box>
                      <Slider
                        value={soundscape.volume || 50}
                        onChange={(_, value) => {
                          navigator.vibrate?.(5);
                          onSoundscapeVolumeChange?.(soundscape.id, value);
                        }}
                        min={0}
                        max={100}
                        size={isMobile ? 'small' : 'medium'}
                        sx={{
                          '& .MuiSlider-track': {
                            backgroundImage: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                          },
                        }}
                      />
                    </Box>
                  ))}
                  
                  {/* Advanced Settings */}
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={eqEnabled}
                          onChange={(e) => setEqEnabled(e.target.checked)}
                          size={isMobile ? 'small' : 'medium'}
                        />
                      }
                      label="EQ"
                      sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.875rem' } }}
                    />
                  </Box>
                </Box>
              </motion.div>
            )}
          </AnimatePresence>
        </Box>
      </motion.div>
    </Box>
  );
};

export default ControlPanel;