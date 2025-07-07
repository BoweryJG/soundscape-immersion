import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Stack,
  Card,
  CardContent,
  Chip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { PlayArrow, Stop, Fullscreen } from '@mui/icons-material';
import SoundscapeGrid from './SoundscapeGrid';
import ControlPanel from './ControlPanel';
import Visualizer3D from './Visualizer3D';
import FullscreenViewer from './FullscreenViewer';

const MobileDemo = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedSoundscape, setSelectedSoundscape] = useState(null);
  const [volume, setVolume] = useState(50);
  const [activeSoundscapes, setActiveSoundscapes] = useState([]);
  const [fullscreenOpen, setFullscreenOpen] = useState(false);
  const [visualizerFullscreen, setVisualizerFullscreen] = useState(false);
  const [audioData, setAudioData] = useState([]);
  
  // Mock soundscape data
  const mockSoundscapes = [
    {
      id: 1,
      title: 'Forest Rain',
      description: 'Gentle rainfall in a peaceful forest',
      image: '/api/placeholder/400/300',
      duration: '30m',
      category: 'Nature',
      color: '#4CAF50',
      volume: 60,
      isPlaying: false,
    },
    {
      id: 2,
      title: 'Ocean Waves',
      description: 'Rhythmic waves on a sandy beach',
      image: '/api/placeholder/400/300',
      duration: '45m',
      category: 'Water',
      color: '#2196F3',
      volume: 70,
      isPlaying: false,
    },
    {
      id: 3,
      title: 'Mountain Wind',
      description: 'Cool breeze through pine trees',
      image: '/api/placeholder/400/300',
      duration: '60m',
      category: 'Nature',
      color: '#795548',
      volume: 40,
      isPlaying: false,
    },
    {
      id: 4,
      title: 'City Ambience',
      description: 'Gentle urban soundscape',
      image: '/api/placeholder/400/300',
      duration: '25m',
      category: 'Urban',
      color: '#9E9E9E',
      volume: 55,
      isPlaying: false,
    },
    {
      id: 5,
      title: 'Thunderstorm',
      description: 'Dramatic storm with distant thunder',
      image: '/api/placeholder/400/300',
      duration: '35m',
      category: 'Weather',
      color: '#673AB7',
      volume: 80,
      isPlaying: false,
    },
    {
      id: 6,
      title: 'Fireplace',
      description: 'Crackling fire with warm ambience',
      image: '/api/placeholder/400/300',
      duration: '120m',
      category: 'Indoor',
      color: '#FF5722',
      volume: 45,
      isPlaying: false,
    },
  ];
  
  // Generate mock audio data for visualizer
  useEffect(() => {
    const interval = setInterval(() => {
      if (isPlaying) {
        const newAudioData = Array.from({ length: 64 }, (_, i) => {
          const time = Date.now() * 0.001;
          const frequency = i / 64;
          return (
            Math.sin(time * 2 + frequency * 10) * 0.3 +
            Math.sin(time * 4 + frequency * 20) * 0.2 +
            Math.random() * 0.1
          ) * 0.5 + 0.5;
        });
        setAudioData(newAudioData);
      }
    }, 50);
    
    return () => clearInterval(interval);
  }, [isPlaying]);
  
  const handlePlay = useCallback((soundscapeId) => {
    if (soundscapeId === 'refresh') {
      // Handle refresh action
      console.log('Refreshing soundscapes...');
      return;
    }
    
    const soundscape = mockSoundscapes.find(s => s.id === soundscapeId);
    if (soundscape) {
      setActiveSoundscapes(prev => {
        const exists = prev.find(s => s.id === soundscapeId);
        if (exists) {
          return prev.filter(s => s.id !== soundscapeId);
        } else {
          return [...prev, { ...soundscape, isPlaying: true }];
        }
      });
      setIsPlaying(true);
    }
  }, []);
  
  const handleSelect = useCallback((soundscapeId) => {
    const soundscape = mockSoundscapes.find(s => s.id === soundscapeId);
    setSelectedSoundscape(soundscape);
    setFullscreenOpen(true);
  }, []);
  
  const handleTogglePlay = useCallback(() => {
    setIsPlaying(!isPlaying);
  }, [isPlaying]);
  
  const handleStop = useCallback(() => {
    setIsPlaying(false);
    setActiveSoundscapes([]);
  }, []);
  
  const handleVolumeChange = useCallback((newVolume) => {
    setVolume(newVolume);
  }, []);
  
  const handleSoundscapeVolumeChange = useCallback((soundscapeId, newVolume) => {
    setActiveSoundscapes(prev =>
      prev.map(s => s.id === soundscapeId ? { ...s, volume: newVolume } : s)
    );
  }, []);
  
  const handleVisualizerFullscreen = useCallback(() => {
    setVisualizerFullscreen(!visualizerFullscreen);
  }, [visualizerFullscreen]);
  
  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: theme.palette.background.default }}>
      <Container maxWidth="lg" sx={{ py: 3, pb: 15 }}>
        {/* Header */}
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Soundscape Immersion
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Mobile-optimized audio experience with 3D visualization
          </Typography>
          
          {/* Status indicators */}
          <Stack direction="row" spacing={1} justifyContent="center" sx={{ mt: 2 }}>
            <Chip
              label={`${activeSoundscapes.length} Active`}
              color={activeSoundscapes.length > 0 ? 'primary' : 'default'}
              size="small"
            />
            <Chip
              label={isPlaying ? 'Playing' : 'Paused'}
              color={isPlaying ? 'success' : 'default'}
              icon={isPlaying ? <PlayArrow /> : <Stop />}
              size="small"
            />
            <Chip
              label={`Volume: ${volume}%`}
              variant="outlined"
              size="small"
            />
          </Stack>
        </Box>
        
        {/* 3D Visualizer */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">3D Audio Visualizer</Typography>
              <Button
                startIcon={<Fullscreen />}
                onClick={handleVisualizerFullscreen}
                size="small"
              >
                Fullscreen
              </Button>
            </Box>
            <Visualizer3D
              audioData={audioData}
              soundscapes={activeSoundscapes}
              isPlaying={isPlaying}
              onFullscreenToggle={handleVisualizerFullscreen}
              isFullscreen={visualizerFullscreen}
            />
          </CardContent>
        </Card>
        
        {/* Soundscape Grid */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Available Soundscapes
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Tap to preview in fullscreen, swipe right to play, swipe left to favorite
            </Typography>
            <SoundscapeGrid
              soundscapes={mockSoundscapes}
              onPlay={handlePlay}
              onSelect={handleSelect}
              loading={false}
            />
          </CardContent>
        </Card>
        
        {/* Demo Instructions */}
        {isMobile && (
          <Card sx={{ mt: 3, backgroundColor: theme.palette.info.main + '10' }}>
            <CardContent>
              <Typography variant="h6" color="info.main" gutterBottom>
                Mobile Gestures
              </Typography>
              <Stack spacing={1}>
                <Typography variant="body2">
                  • <strong>Pull down</strong> on grid to refresh
                </Typography>
                <Typography variant="body2">
                  • <strong>Long press</strong> play button for advanced controls
                </Typography>
                <Typography variant="body2">
                  • <strong>Pinch to zoom</strong> in 3D visualizer
                </Typography>
                <Typography variant="body2">
                  • <strong>Swipe gestures</strong> in fullscreen mode
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        )}
      </Container>
      
      {/* Control Panel */}
      <ControlPanel
        isPlaying={isPlaying}
        onPlay={handleTogglePlay}
        onPause={handleTogglePlay}
        onStop={handleStop}
        volume={volume}
        onVolumeChange={handleVolumeChange}
        crossfadeTime={3000}
        onCrossfadeChange={(time) => console.log('Crossfade time:', time)}
        soundscapes={mockSoundscapes}
        activeSoundscapes={activeSoundscapes}
        onSoundscapeVolumeChange={handleSoundscapeVolumeChange}
      />
      
      {/* Fullscreen Viewer */}
      <FullscreenViewer
        open={fullscreenOpen}
        onClose={() => setFullscreenOpen(false)}
        soundscape={selectedSoundscape}
        isPlaying={isPlaying}
        onTogglePlay={handleTogglePlay}
        volume={volume}
        onVolumeChange={handleVolumeChange}
      >
        {selectedSoundscape && (
          <Box
            sx={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundImage: `url(${selectedSoundscape.image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              position: 'relative',
            }}
          >
            {/* Optional: Add visualizer or custom content here */}
            <Visualizer3D
              audioData={audioData}
              soundscapes={[selectedSoundscape]}
              isPlaying={isPlaying}
              isFullscreen={true}
            />
          </Box>
        )}
      </FullscreenViewer>
      
      {/* Visualizer Fullscreen */}
      <FullscreenViewer
        open={visualizerFullscreen}
        onClose={() => setVisualizerFullscreen(false)}
        soundscape={{ title: '3D Audio Visualizer', description: 'Immersive audio visualization' }}
        isPlaying={isPlaying}
        onTogglePlay={handleTogglePlay}
        volume={volume}
        onVolumeChange={handleVolumeChange}
      >
        <Visualizer3D
          audioData={audioData}
          soundscapes={activeSoundscapes}
          isPlaying={isPlaying}
          isFullscreen={true}
        />
      </FullscreenViewer>
    </Box>
  );
};

export default MobileDemo;