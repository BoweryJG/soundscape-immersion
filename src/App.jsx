import React, { useState, useEffect, useCallback } from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { 
  Box, 
  Container, 
  AppBar, 
  Toolbar, 
  Typography, 
  IconButton,
  BottomNavigation,
  BottomNavigationAction,
  Fab,
  useMediaQuery,
  Drawer
} from '@mui/material';
import {
  GridView,
  SettingsRounded,
  FullscreenRounded,
  VolumeUpRounded,
  HomeRounded,
  ExploreRounded,
  FavoriteRounded
} from '@mui/icons-material';

import theme from './theme/muiTheme';
import { soundscapes } from './data/soundscapes';
import { SoundPlayer } from './components/AudioEngine/SoundPlayer';
import SoundscapeGrid from './components/SoundscapeGrid';
import ControlPanel from './components/ControlPanel';
import Visualizer3D from './components/Visualizer3D';
import FullscreenViewer from './components/FullscreenViewer';

function App() {
  // Mobile-first state management
  const [currentSoundscape, setCurrentSoundscape] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [masterVolume, setMasterVolume] = useState(0.7);
  const [audioAnalysisData, setAudioAnalysisData] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [bottomNavValue, setBottomNavValue] = useState(0);
  const [settingsOpen, setSettingsOpen] = useState(false);
  
  // Mobile detection
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isPortrait = useMediaQuery('(orientation: portrait)');

  // Mobile audio handling
  const handleSoundscapeSelect = useCallback((soundscape) => {
    setCurrentSoundscape(soundscape);
    if (isMobile) {
      // Auto-hide controls on mobile after selection
      setTimeout(() => setControlsVisible(false), 3000);
    }
  }, [isMobile]);

  // Mobile fullscreen handling
  const toggleFullscreen = useCallback(async () => {
    if (!isFullscreen) {
      try {
        await document.documentElement.requestFullscreen();
        if (screen.orientation?.lock) {
          await screen.orientation.lock('landscape-primary');
        }
        setIsFullscreen(true);
        setControlsVisible(false);
      } catch (err) {
        console.log('Fullscreen not supported');
        setIsFullscreen(true);
        setControlsVisible(false);
      }
    } else {
      try {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        }
        if (screen.orientation?.unlock) {
          screen.orientation.unlock();
        }
        setIsFullscreen(false);
        setControlsVisible(true);
      } catch (err) {
        setIsFullscreen(false);
        setControlsVisible(true);
      }
    }
  }, [isFullscreen]);

  // Mobile gesture handling
  useEffect(() => {
    let hideControlsTimeout;
    
    const handleUserInteraction = () => {
      setControlsVisible(true);
      if (hideControlsTimeout) clearTimeout(hideControlsTimeout);
      
      if (isFullscreen) {
        hideControlsTimeout = setTimeout(() => {
          setControlsVisible(false);
        }, 3000);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isFullscreen) {
        toggleFullscreen();
      }
      if (e.key === ' ') {
        e.preventDefault();
        // Space bar for play/pause
      }
    };

    document.addEventListener('touchstart', handleUserInteraction);
    document.addEventListener('mousemove', handleUserInteraction);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('touchstart', handleUserInteraction);
      document.removeEventListener('mousemove', handleUserInteraction);
      document.removeEventListener('keydown', handleKeyDown);
      if (hideControlsTimeout) clearTimeout(hideControlsTimeout);
    };
  }, [isFullscreen, toggleFullscreen]);

  // Mobile lifecycle optimization
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // App went to background - optimize performance
        setControlsVisible(false);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Favorite management
  const toggleFavorite = useCallback((soundscapeId) => {
    setFavorites(prev => 
      prev.includes(soundscapeId) 
        ? prev.filter(id => id !== soundscapeId)
        : [...prev, soundscapeId]
    );
  }, []);

  // Mobile bottom navigation
  const renderBottomNavigation = () => (
    <BottomNavigation
      value={bottomNavValue}
      onChange={(event, newValue) => setBottomNavValue(newValue)}
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        display: { xs: 'flex', md: 'none' }
      }}
    >
      <BottomNavigationAction
        label="Home"
        icon={<HomeRounded />}
        onClick={() => setIsFullscreen(false)}
      />
      <BottomNavigationAction
        label="Explore"
        icon={<ExploreRounded />}
      />
      <BottomNavigationAction
        label="Favorites"
        icon={<FavoriteRounded />}
      />
      <BottomNavigationAction
        label="Settings"
        icon={<SettingsRounded />}
        onClick={() => setSettingsOpen(true)}
      />
    </BottomNavigation>
  );

  // Mobile floating action button
  const renderFloatingControls = () => (
    <>
      {currentSoundscape && !isFullscreen && (
        <Fab
          color="primary"
          sx={{
            position: 'fixed',
            bottom: isMobile ? 80 : 24,
            right: 24,
            zIndex: 999
          }}
          onClick={toggleFullscreen}
        >
          <FullscreenRounded />
        </Fab>
      )}
      
      {controlsVisible && currentSoundscape && (
        <Fab
          color="secondary"
          size={isMobile ? "medium" : "large"}
          sx={{
            position: 'fixed',
            bottom: isMobile ? 80 : 84,
            left: 24,
            zIndex: 999
          }}
          onClick={() => setControlsVisible(!controlsVisible)}
        >
          <VolumeUpRounded />
        </Fab>
      )}
    </>
  );

  if (isFullscreen) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <FullscreenViewer
          soundscape={currentSoundscape}
          onExit={toggleFullscreen}
          controlsVisible={controlsVisible}
          onControlsToggle={setControlsVisible}
          audioAnalysisData={audioAnalysisData}
          volume={masterVolume}
          onVolumeChange={setMasterVolume}
        />
        {currentSoundscape && (
          <SoundPlayer
            soundscape={currentSoundscape}
            volume={masterVolume}
            onAnalysisData={setAudioAnalysisData}
          />
        )}
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      
      {/* Mobile-optimized App Bar */}
      <AppBar 
        position="fixed" 
        elevation={0}
        sx={{ 
          display: { xs: 'flex', md: controlsVisible ? 'flex' : 'none' },
          transition: 'opacity 0.3s ease'
        }}
      >
        <Toolbar>
          <Typography 
            variant="h6" 
            component="h1" 
            sx={{ 
              flexGrow: 1,
              fontSize: { xs: '1.1rem', sm: '1.25rem' }
            }}
          >
            🌊 Soundscape Immersion
          </Typography>
          
          <IconButton
            color="inherit"
            onClick={() => setSettingsOpen(true)}
            sx={{ display: { xs: 'none', md: 'flex' } }}
          >
            <SettingsRounded />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          pt: { xs: 7, md: 8 },
          pb: { xs: 8, md: 2 },
          minHeight: '100vh',
          background: currentSoundscape 
            ? `linear-gradient(45deg, ${currentSoundscape.color}20, transparent)`
            : 'transparent',
          transition: 'background 0.5s ease'
        }}
      >
        <Container 
          maxWidth="xl" 
          sx={{ 
            px: { xs: 1, sm: 2, md: 3 },
            height: '100%'
          }}
        >
          {/* 3D Visualizer */}
          {currentSoundscape && (
            <Box
              sx={{
                height: { xs: '30vh', sm: '40vh', md: '50vh' },
                mb: 2,
                borderRadius: 2,
                overflow: 'hidden',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
            >
              <Visualizer3D
                soundscape={currentSoundscape}
                audioAnalysisData={audioAnalysisData}
                isActive={!!currentSoundscape}
              />
            </Box>
          )}

          {/* Soundscape Grid */}
          <SoundscapeGrid
            soundscapes={soundscapes}
            onSoundscapeSelect={handleSoundscapeSelect}
            currentSoundscape={currentSoundscape}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
          />

          {/* Control Panel */}
          {currentSoundscape && controlsVisible && (
            <ControlPanel
              currentSoundscape={currentSoundscape}
              volume={masterVolume}
              onVolumeChange={setMasterVolume}
              audioAnalysisData={audioAnalysisData}
            />
          )}
        </Container>
      </Box>

      {/* Floating Controls */}
      {renderFloatingControls()}

      {/* Mobile Bottom Navigation */}
      {renderBottomNavigation()}

      {/* Settings Drawer */}
      <Drawer
        anchor="right"
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        sx={{
          '& .MuiDrawer-paper': {
            width: { xs: '100%', sm: 400 },
            maxWidth: '100vw'
          }
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Settings
          </Typography>
          {/* Settings content will be added here */}
        </Box>
      </Drawer>

      {/* Audio Engine */}
      {currentSoundscape && (
        <SoundPlayer
          soundscape={currentSoundscape}
          volume={masterVolume}
          onAnalysisData={setAudioAnalysisData}
        />
      )}
    </ThemeProvider>
  );
}

export default App;
