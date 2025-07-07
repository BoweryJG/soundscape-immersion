import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  IconButton,
  Box,
  Skeleton,
  Badge,
  Chip,
  alpha,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  VolumeUp,
  Favorite,
  FavoriteBorder,
  MoreVert,
  Refresh,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useSwipeable } from 'react-swipeable';
import { useLongPress } from 'use-long-press';

const SoundscapeGrid = ({ soundscapes = [], onPlay, onSelect, loading = false }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  
  const [refreshing, setRefreshing] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [favorites, setFavorites] = useState(new Set());
  const [playingId, setPlayingId] = useState(null);
  const scrollContainerRef = useRef(null);
  const startY = useRef(0);
  const [pullDistance, setPullDistance] = useState(0);
  
  // Pull to refresh logic
  const handleTouchStart = useCallback((e) => {
    if (scrollContainerRef.current?.scrollTop === 0) {
      startY.current = e.touches[0].clientY;
    }
  }, []);
  
  const handleTouchMove = useCallback((e) => {
    if (scrollContainerRef.current?.scrollTop === 0 && startY.current) {
      const deltaY = e.touches[0].clientY - startY.current;
      if (deltaY > 0) {
        setPullDistance(Math.min(deltaY, 100));
        if (deltaY > 80) {
          navigator.vibrate?.(10);
        }
      }
    }
  }, []);
  
  const handleTouchEnd = useCallback(() => {
    if (pullDistance > 80) {
      setRefreshing(true);
      navigator.vibrate?.([20, 50, 20]);
      // Simulate refresh
      setTimeout(() => {
        setRefreshing(false);
        if (onPlay) onPlay('refresh');
      }, 1500);
    }
    setPullDistance(0);
    startY.current = 0;
  }, [pullDistance, onPlay]);
  
  const handleTogglePlay = useCallback((id) => {
    setPlayingId(prev => prev === id ? null : id);
    navigator.vibrate?.(20);
    if (onPlay) onPlay(id);
  }, [onPlay]);
  
  const handleToggleFavorite = useCallback((id) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(id)) {
        newFavorites.delete(id);
      } else {
        newFavorites.add(id);
        navigator.vibrate?.([10, 20, 10]);
      }
      return newFavorites;
    });
  }, []);
  
  const bind = useLongPress(
    (event, { context: id }) => {
      setSelectedIds(prev => {
        const newSelected = new Set(prev);
        if (newSelected.has(id)) {
          newSelected.delete(id);
        } else {
          newSelected.add(id);
          navigator.vibrate?.(50);
        }
        return newSelected;
      });
    },
    {
      threshold: 500,
      captureEvent: true,
      cancelOnMovement: 25,
    }
  );
  
  const SoundscapeCard = ({ soundscape, index }) => {
    const isPlaying = playingId === soundscape.id;
    const isFavorite = favorites.has(soundscape.id);
    const isSelected = selectedIds.has(soundscape.id);
    
    const swipeHandlers = useSwipeable({
      onSwipedLeft: () => {
        if (isMobile) {
          handleToggleFavorite(soundscape.id);
        }
      },
      onSwipedRight: () => {
        if (isMobile) {
          handleTogglePlay(soundscape.id);
        }
      },
      trackMouse: false,
      trackTouch: true,
      delta: 50,
    });
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ delay: index * 0.05 }}
        whileTap={{ scale: 0.98 }}
        {...swipeHandlers}
        {...bind(soundscape.id)}
      >
        <Card
          sx={{
            height: '100%',
            position: 'relative',
            overflow: 'hidden',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            transform: isSelected ? 'scale(0.95)' : 'scale(1)',
            boxShadow: isSelected ? theme.shadows[8] : theme.shadows[2],
            border: isSelected ? `2px solid ${theme.palette.primary.main}` : 'none',
            '&:active': {
              transform: 'scale(0.98)',
            },
          }}
          onClick={() => onSelect?.(soundscape.id)}
        >
          <Box position="relative">
            <CardMedia
              component="img"
              height={isMobile ? 140 : 180}
              image={soundscape.image || '/api/placeholder/400/300'}
              alt={soundscape.title}
              sx={{
                filter: isPlaying ? 'brightness(0.7)' : 'brightness(1)',
                transition: 'filter 0.3s',
              }}
            />
            
            {/* Overlay gradient */}
            <Box
              sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '50%',
                background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)',
              }}
            />
            
            {/* Play button overlay */}
            <IconButton
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                backgroundColor: alpha(theme.palette.background.paper, 0.9),
                '&:hover': {
                  backgroundColor: alpha(theme.palette.background.paper, 0.95),
                },
              }}
              onClick={(e) => {
                e.stopPropagation();
                handleTogglePlay(soundscape.id);
              }}
            >
              {isPlaying ? <Pause /> : <PlayArrow />}
            </IconButton>
            
            {/* Favorite button */}
            <IconButton
              size="small"
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                backgroundColor: alpha(theme.palette.background.paper, 0.7),
                '&:hover': {
                  backgroundColor: alpha(theme.palette.background.paper, 0.9),
                },
              }}
              onClick={(e) => {
                e.stopPropagation();
                handleToggleFavorite(soundscape.id);
              }}
            >
              {isFavorite ? (
                <Favorite color="error" fontSize="small" />
              ) : (
                <FavoriteBorder fontSize="small" />
              )}
            </IconButton>
            
            {/* Active indicator */}
            {isPlaying && (
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 8,
                  right: 8,
                  display: 'flex',
                  gap: 0.5,
                }}
              >
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{
                      height: [8, 20, 8],
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      delay: i * 0.2,
                    }}
                    style={{
                      width: 3,
                      backgroundColor: theme.palette.primary.main,
                      borderRadius: 2,
                    }}
                  />
                ))}
              </Box>
            )}
          </Box>
          
          <CardContent sx={{ pb: 1.5 }}>
            <Typography
              variant="subtitle1"
              component="h3"
              sx={{
                fontWeight: 600,
                lineHeight: 1.2,
                mb: 0.5,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {soundscape.title}
            </Typography>
            
            <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
              {soundscape.duration && (
                <Chip
                  label={soundscape.duration}
                  size="small"
                  sx={{ height: 20, fontSize: '0.75rem' }}
                />
              )}
              {soundscape.category && (
                <Chip
                  label={soundscape.category}
                  size="small"
                  variant="outlined"
                  sx={{ height: 20, fontSize: '0.75rem' }}
                />
              )}
            </Box>
          </CardContent>
        </Card>
      </motion.div>
    );
  };
  
  return (
    <Box
      ref={scrollContainerRef}
      sx={{
        height: '100%',
        overflow: 'auto',
        WebkitOverflowScrolling: 'touch',
        position: 'relative',
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull to refresh indicator */}
      <Box
        sx={{
          position: 'absolute',
          top: -60,
          left: '50%',
          transform: `translateX(-50%) translateY(${pullDistance}px)`,
          opacity: pullDistance / 100,
          transition: refreshing ? 'transform 0.3s' : 'none',
          zIndex: 10,
        }}
      >
        <motion.div
          animate={{ rotate: refreshing ? 360 : pullDistance * 3 }}
          transition={{ duration: refreshing ? 1 : 0, repeat: refreshing ? Infinity : 0 }}
        >
          <Refresh fontSize="large" color="primary" />
        </motion.div>
      </Box>
      
      <Box
        sx={{
          transform: `translateY(${refreshing ? 60 : pullDistance * 0.5}px)`,
          transition: refreshing ? 'transform 0.3s' : 'none',
          p: 2,
        }}
      >
        <Grid container spacing={isMobile ? 2 : 3}>
          <AnimatePresence>
            {loading
              ? [...Array(6)].map((_, index) => (
                  <Grid item xs={6} sm={4} md={3} key={`skeleton-${index}`}>
                    <Skeleton
                      variant="rectangular"
                      height={isMobile ? 200 : 260}
                      sx={{ borderRadius: 1 }}
                    />
                  </Grid>
                ))
              : soundscapes.map((soundscape, index) => (
                  <Grid item xs={6} sm={4} md={3} key={soundscape.id}>
                    <SoundscapeCard soundscape={soundscape} index={index} />
                  </Grid>
                ))}
          </AnimatePresence>
        </Grid>
      </Box>
    </Box>
  );
};

export default SoundscapeGrid;