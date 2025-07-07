import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as Tone from 'tone';

export const SoundPlayer = ({ soundscape, volume = 0.7, onAnalysisData }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [loadProgress, setLoadProgress] = useState(0);
  
  const playerRef = useRef(null);
  const analyzerRef = useRef(null);
  const animationFrameRef = useRef(null);

  // Mobile-optimized audio setup
  const setupAudio = useCallback(async () => {
    try {
      // Start audio context on user interaction (required for mobile)
      if (Tone.context.state !== 'running') {
        await Tone.start();
      }

      if (playerRef.current) {
        playerRef.current.dispose();
      }

      setIsLoading(true);
      setError(null);
      setLoadProgress(0);

      // Create mobile-optimized player
      const player = new Tone.Player({
        url: soundscape.file,
        loop: true,
        volume: Tone.gainToDb(volume),
        onload: () => {
          setIsLoading(false);
          setLoadProgress(100);
        },
        onerror: (err) => {
          setError(`Failed to load: ${err.message}`);
          setIsLoading(false);
        }
      });

      // Mobile-optimized analyzer for visualizations
      const analyzer = new Tone.Analyser('fft', 128);
      
      // Connect with mobile-friendly chain
      player.chain(analyzer, Tone.Destination);
      
      playerRef.current = player;
      analyzerRef.current = analyzer;

      // Progress tracking for mobile loading indicators
      let progress = 0;
      const progressInterval = setInterval(() => {
        if (progress < 90) {
          progress += 10;
          setLoadProgress(progress);
        } else {
          clearInterval(progressInterval);
        }
      }, 100);

    } catch (err) {
      setError(`Audio setup failed: ${err.message}`);
      setIsLoading(false);
    }
  }, [soundscape.file, volume]);

  // Mobile-optimized analysis loop
  const startAnalysis = useCallback(() => {
    if (!analyzerRef.current || !onAnalysisData) return;

    const analyze = () => {
      if (analyzerRef.current && isPlaying) {
        const frequencyData = analyzerRef.current.getValue();
        
        // Mobile-optimized data processing (reduce CPU load)
        const simplified = Array.from(frequencyData).filter((_, i) => i % 2 === 0);
        
        onAnalysisData({
          frequencies: simplified,
          average: simplified.reduce((a, b) => a + b, 0) / simplified.length,
          peak: Math.max(...simplified),
          timestamp: Date.now()
        });
      }
      
      // Use requestAnimationFrame for smooth mobile performance
      animationFrameRef.current = requestAnimationFrame(analyze);
    };
    
    analyze();
  }, [isPlaying, onAnalysisData]);

  // Touch-friendly play/pause
  const togglePlayback = useCallback(async () => {
    try {
      if (!playerRef.current) {
        await setupAudio();
        return;
      }

      if (isPlaying) {
        playerRef.current.stop();
        setIsPlaying(false);
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      } else {
        // Mobile audio context unlock
        if (Tone.context.state !== 'running') {
          await Tone.start();
        }
        
        playerRef.current.start();
        setIsPlaying(true);
        startAnalysis();
      }
    } catch (err) {
      setError(`Playback error: ${err.message}`);
    }
  }, [isPlaying, setupAudio, startAnalysis]);

  // Mobile-optimized volume control
  const updateVolume = useCallback((newVolume) => {
    if (playerRef.current) {
      playerRef.current.volume.value = Tone.gainToDb(newVolume);
    }
  }, []);

  // Fade in/out for mobile battery optimization
  const fadeIn = useCallback((duration = 2) => {
    if (playerRef.current) {
      playerRef.current.volume.rampTo(Tone.gainToDb(volume), duration);
    }
  }, [volume]);

  const fadeOut = useCallback((duration = 1) => {
    if (playerRef.current) {
      playerRef.current.volume.rampTo(Tone.gainToDb(0), duration);
    }
  }, []);

  // Setup on soundscape change
  useEffect(() => {
    if (soundscape) {
      setupAudio();
    }
    
    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [soundscape, setupAudio]);

  // Update volume when prop changes
  useEffect(() => {
    updateVolume(volume);
  }, [volume, updateVolume]);

  // Mobile app lifecycle handling
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isPlaying) {
        // Pause when app goes to background (mobile battery optimization)
        fadeOut(0.5);
      } else if (!document.hidden && isPlaying) {
        // Resume when app comes to foreground
        fadeIn(0.5);
      }
    };

    const handleAudioInterruption = () => {
      // Handle phone calls, notifications, etc.
      if (isPlaying) {
        togglePlayback();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('audiointerruption', handleAudioInterruption);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('audiointerruption', handleAudioInterruption);
    };
  }, [isPlaying, fadeIn, fadeOut, togglePlayback]);

  return {
    isPlaying,
    isLoading,
    error,
    loadProgress,
    togglePlayback,
    updateVolume,
    fadeIn,
    fadeOut,
    // Mobile-specific utilities
    currentSoundscape: soundscape,
    audioContext: Tone.context,
    isReady: !!playerRef.current && !isLoading && !error
  };
};