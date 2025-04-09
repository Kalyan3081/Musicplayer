import React, { useState, useEffect, useRef } from 'react';

const MusicPlayer = ({ 
  currentTrack, 
  onNext, 
  onPrev, 
  themeColor, 
  toggleFavorite, 
  isFavorite: propIsFavorite, 
  toggleTracksView,
  isPlaying,
  setIsPlaying
}) => {
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  
  const audioRef = useRef(null);
  const progressBarRef = useRef(null);
  const animationRef = useRef(null);
  const menuRef = useRef(null);
  
  useEffect(() => {
    if (currentTrack) {
      // Only load new track if it's different from what's already loaded
      if (audioRef.current && (!audioRef.current.src.includes(currentTrack.musicUrl.split('/').pop()))) {
        // Save current position if the audio was playing
        const wasPlaying = isPlaying;
        
        // Load the new track
        audioRef.current.src = currentTrack.musicUrl;
        audioRef.current.load();
        
        // If it was playing before or we want to auto-play, start playing the new track
        if (wasPlaying || isPlaying) {
          audioRef.current.play().catch(error => {
            console.error("Error playing audio:", error);
            setIsPlaying(false);
          });
          animationRef.current = requestAnimationFrame(whilePlaying);
        }
      }
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [currentTrack]);
  
  // This separate effect handles play/pause state changes
  useEffect(() => {
    if (audioRef.current && currentTrack) {
      if (isPlaying) {
        audioRef.current.play().catch(error => {
          console.error("Error playing audio:", error);
          setIsPlaying(false);
        });
        animationRef.current = requestAnimationFrame(whilePlaying);
      } else {
        audioRef.current.pause();
        cancelAnimationFrame(animationRef.current);
      }
    }
  }, [isPlaying]);
  
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Close volume slider when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const volumeContainer = document.querySelector('.volume-container');
      if (volumeContainer && !volumeContainer.contains(event.target)) {
        setShowVolumeSlider(false);
      }
    };

    if (showVolumeSlider) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showVolumeSlider]);
  
  const whilePlaying = () => {
    if (audioRef.current) {
      // Only update the currentTime if the audio is playing to avoid resetting it
      if (!audioRef.current.paused) {
        setCurrentTime(audioRef.current.currentTime);
        
        // Update the progress bar if it exists
        if (progressBarRef.current) {
          progressBarRef.current.value = audioRef.current.currentTime;
        }
      }
      
      // Continue the animation frame only if we're still playing
      if (isPlaying) {
        animationRef.current = requestAnimationFrame(whilePlaying);
      }
    }
  };
  
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      setCurrentTime(current);
    }
  };
  
  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
      progressBarRef.current.max = audioRef.current.duration;
    }
  };
  
  const handleProgressChange = (e) => {
    const value = e.target.value;
    setCurrentTime(value);
    audioRef.current.currentTime = value;
  };
  
  const handleVolumeChange = (e) => {
    const value = e.target.value;
    setVolume(value);
  };
  
  const toggleMute = () => {
    setIsMuted(!isMuted);
  };
  
  const handleEnded = () => {
    onNext();
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleToggleFavorite = () => {
    if (currentTrack) {
      toggleFavorite(currentTrack.id);
      setIsMenuOpen(false);
    }
  };

  const toggleVolumeSlider = () => {
    setShowVolumeSlider(!showVolumeSlider);
  };
  
  const formatTime = (time) => {
    if (time && !isNaN(time)) {
      const minutes = Math.floor(time / 60);
      const seconds = Math.floor(time % 60);
      return `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
    }
    return '0:00';
  };
  
  // Get dynamic styles based on theme color
  const getThemeStyles = () => {
    return {
      '--player-primary-color': themeColor || '#8e44ad'
    };
  };
  
  if (!currentTrack) {
    return (
      <div className="music-player-container">
      <div className="music-player">
        <div className="player-header">
          <h2 className="player-title">MusicFX Player</h2>
          <p className="player-subtitle">Select a track to play</p>
        </div>
        
        {/* Mobile menu button */}
        <button className="mobile-menu-btn visible-mobile" onClick={toggleTracksView}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
      </div>
    </div>
    );
  }
  
  return (
    <div className="music-player-container">
    <div className="music-player" style={getThemeStyles()}>
      {/* Mobile menu button */}
      <button className="mobile-menu-btn visible-mobile" onClick={toggleTracksView}>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </button>

      <div className="player-header">
        <h2 className="player-title">{currentTrack.title}</h2>
        <p className="player-subtitle">{currentTrack.albumName}</p>
      </div>
      
      <img 
        src={currentTrack.thumbnail} 
        alt={currentTrack.title} 
        className="player-artwork" 
      />
      
      <div className="player-progress">
        <div className="progress-container" onClick={(e) => {
          const width = e.currentTarget.clientWidth;
          const rect = e.currentTarget.getBoundingClientRect();
          const clickX = e.clientX - rect.left;
          const percentage = clickX / width;
          const newTime = percentage * duration;
          
          setCurrentTime(newTime);
          audioRef.current.currentTime = newTime;
        }}>
          <div 
            className="progress-bar" 
            style={{ width: `${(currentTime / duration) * 100}%`, backgroundColor: themeColor }}
          ></div>
        </div>
        <div className="time-info">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>
      
      <div className="player-controls">
        {/* Three dots menu button */}
        <div className="control-group">
          <button className="control-button menu-button" onClick={toggleMenu}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="6" cy="12" r="2" fill="currentColor"/>
              <circle cx="12" cy="12" r="2" fill="currentColor"/>
              <circle cx="18" cy="12" r="2" fill="currentColor"/>
            </svg>
          </button>
          
          {isMenuOpen && (
            <div className="menu-dropdown" ref={menuRef}>
              <div 
                className="favorite-option" 
                onClick={handleToggleFavorite}
                style={{ 
                  background: propIsFavorite ? `${themeColor}20` : 'transparent',
                  borderLeft: `3px solid ${propIsFavorite ? themeColor : 'transparent'}`
                }}
              >
                {propIsFavorite ? (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill={themeColor} stroke="none"/>
                  </svg>
                ) : (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke={themeColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
                <span style={{ color: propIsFavorite ? themeColor : 'inherit', fontWeight: propIsFavorite ? '600' : '400' }}>
                  {propIsFavorite ? 'Added to Favorites' : 'Add to Favorites'}
                </span>
              </div>
            </div>
          )}
        </div>
        
        {/* Center controls - Previous, Play/Pause, Next */}
        <div className="center-controls">
          <button className="control-button track-button " onClick={onPrev}>
          <svg xmlns="http://www.w3.org/2000/svg" width="25" height="17" viewBox="0 0 25 17" fill="none">
<path d="M21.712 0.389371C21.9529 0.228605 22.233 0.136269 22.5223 0.122215C22.8117 0.108162 23.0994 0.172916 23.3548 0.309572C23.6102 0.446227 23.8237 0.649657 23.9726 0.898156C24.1214 1.14665 24.2 1.4309 24.2 1.72057V14.5206C24.2 14.8102 24.1214 15.0945 23.9726 15.343C23.8237 15.5915 23.6102 15.7949 23.3548 15.9316C23.0994 16.0682 22.8117 16.133 22.5223 16.1189C22.233 16.1049 21.9529 16.0125 21.712 15.8518L13 10.0438V14.5206C13 14.8102 12.9214 15.0945 12.7726 15.343C12.6237 15.5915 12.4102 15.7949 12.1548 15.9316C11.8994 16.0682 11.6117 16.133 11.3223 16.1189C11.033 16.1049 10.7529 16.0125 10.512 15.8518L0.911953 9.45177C0.692822 9.30565 0.513149 9.1077 0.388882 8.87548C0.264616 8.64326 0.199594 8.38395 0.199594 8.12057C0.199594 7.85719 0.264616 7.59788 0.388882 7.36566C0.513149 7.13344 0.692822 6.93549 0.911953 6.78937L10.512 0.389371C10.7529 0.228605 11.033 0.136269 11.3223 0.122215C11.6117 0.108162 11.8994 0.172916 12.1548 0.309572C12.4102 0.446227 12.6237 0.649657 12.7726 0.898156C12.9214 1.14665 13 1.4309 13 1.72057V6.19737L21.712 0.389371Z" fill="white"/>
</svg>
          </button>
          
          <button className="control-button play-pause" onClick={() => {
            setIsPlaying(!isPlaying);
          }}>
            {isPlaying ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 4H10V20H6V4Z" fill="currentColor"/>
                <path d="M14 4H18V20H14V4Z" fill="currentColor"/>
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 3L19 12L5 21V3Z" fill="currentColor"/>
              </svg>
            )}
          </button>
          
          <button className="control-button track-button" onClick={onNext}>
          <svg xmlns="http://www.w3.org/2000/svg" width="25" height="17" viewBox="0 0 25 17" fill="none">
<path d="M3.28805 0.389371C3.04709 0.228605 2.767 0.136269 2.47768 0.122215C2.18835 0.108162 1.90063 0.172916 1.64522 0.309572C1.38982 0.446227 1.1763 0.649657 1.02745 0.898156C0.878601 1.14665 0.800005 1.4309 0.800049 1.72057V14.5206C0.800005 14.8102 0.878601 15.0945 1.02745 15.343C1.1763 15.5915 1.38982 15.7949 1.64522 15.9316C1.90063 16.0682 2.18835 16.133 2.47768 16.1189C2.767 16.1049 3.04709 16.0125 3.28805 15.8518L12 10.0438V14.5206C12 14.8102 12.0786 15.0945 12.2274 15.343C12.3763 15.5915 12.5898 15.7949 12.8452 15.9316C13.1006 16.0682 13.3883 16.133 13.6777 16.1189C13.967 16.1049 14.2471 16.0125 14.488 15.8518L24.088 9.45177C24.3072 9.30565 24.4869 9.1077 24.6111 8.87548C24.7354 8.64326 24.8004 8.38395 24.8004 8.12057C24.8004 7.85719 24.7354 7.59788 24.6111 7.36566C24.4869 7.13344 24.3072 6.93549 24.088 6.78937L14.488 0.389371C14.2471 0.228605 13.967 0.136269 13.6777 0.122215C13.3883 0.108162 13.1006 0.172916 12.8452 0.309572C12.5898 0.446227 12.3763 0.649657 12.2274 0.898156C12.0786 1.14665 12 1.4309 12 1.72057V6.19737L3.28805 0.389371Z" fill="white"/>
</svg>
          </button>
        </div>
        
        {/* Volume control */}
        <div className="volume-container">
          <button className="control-button volume-button" onClick={toggleVolumeSlider}>
            {isMuted ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11 5L6 9H2V15H6L11 19V5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M23 9L17 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M17 9L23 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="16" viewBox="0 0 20 16" fill="none">
              <path fill-rule="evenodd" clip-rule="evenodd" d="M9.31444 0.478175C9.51743 0.560531 9.6909 0.699934 9.81292 0.87876C9.93495 1.05758 10.0001 1.2678 10 1.48283V14.5303C9.99995 14.7453 9.93476 14.9555 9.81267 15.1342C9.69057 15.313 9.51706 15.4523 9.31406 15.5346C9.11106 15.6169 8.88769 15.6384 8.67218 15.5965C8.45668 15.5545 8.25872 15.451 8.10333 15.299L3.98444 11.2684H1.11111C0.816426 11.2684 0.53381 11.1539 0.325437 10.95C0.117063 10.7461 0 10.4695 0 10.1811V5.83199C0 5.54362 0.117063 5.26706 0.325437 5.06316C0.53381 4.85925 0.816426 4.7447 1.11111 4.7447H3.98444L8.10333 0.714117C8.25871 0.561969 8.45672 0.458341 8.67231 0.416342C8.88789 0.374343 9.11136 0.395862 9.31444 0.478175ZM15.1744 0.318343C15.3828 0.114508 15.6654 0 15.96 0C16.2546 0 16.5372 0.114508 16.7456 0.318343C17.7787 1.32697 18.598 2.52538 19.1565 3.84476C19.715 5.16413 20.0017 6.57848 20 8.00657C20.0017 9.43465 19.715 10.849 19.1565 12.1684C18.598 13.4877 17.7787 14.6862 16.7456 15.6948C16.536 15.8928 16.2553 16.0024 15.964 16C15.6727 15.9975 15.394 15.8831 15.188 15.6815C14.982 15.4799 14.8651 15.2072 14.8626 14.9222C14.86 14.6371 14.972 14.3624 15.1744 14.1574C16.0013 13.3507 16.6569 12.3919 17.1037 11.3363C17.5505 10.2807 17.7796 9.14911 17.7778 8.00657C17.7778 5.60366 16.7844 3.43125 15.1744 1.85577C14.9661 1.65187 14.8491 1.37537 14.8491 1.08706C14.8491 0.798747 14.9661 0.52224 15.1744 0.318343ZM12.0311 3.3932C12.1343 3.2921 12.2568 3.21191 12.3917 3.15719C12.5266 3.10247 12.6712 3.07431 12.8172 3.07431C12.9632 3.07431 13.1078 3.10247 13.2427 3.15719C13.3776 3.21191 13.5001 3.2921 13.6033 3.3932C14.2232 3.99845 14.7148 4.71759 15.0498 5.50929C15.3848 6.30099 15.5567 7.14967 15.5556 8.00657C15.5566 8.86345 15.3847 9.71211 15.0497 10.5038C14.7147 11.2955 14.2232 12.0146 13.6033 12.6199C13.3948 12.824 13.1121 12.9386 12.8172 12.9386C12.5224 12.9386 12.2396 12.824 12.0311 12.6199C11.8226 12.4159 11.7055 12.1392 11.7055 11.8507C11.7055 11.5621 11.8226 11.2854 12.0311 11.0814C12.4446 10.6782 12.7726 10.199 12.9961 9.67127C13.2196 9.14356 13.3342 8.5778 13.3333 8.00657C13.3342 7.43532 13.2196 6.86955 12.9962 6.34183C12.7727 5.8141 12.4447 5.33487 12.0311 4.93171C11.9278 4.83073 11.8458 4.71082 11.7899 4.57882C11.734 4.44683 11.7052 4.30534 11.7052 4.16245C11.7052 4.01957 11.734 3.87808 11.7899 3.74609C11.8458 3.61409 11.9278 3.49418 12.0311 3.3932Z" fill="white"/>
              </svg>
            )}
          </button>
          
          {showVolumeSlider && (
            <div className="volume-slider-popup">
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={handleVolumeChange}
                className="volume-range"
              />
              <button className="volume-mute-button" onClick={toggleMute}>
                {isMuted ? "Unmute" : "Mute"}
              </button>
            </div>
          )}
        </div>
      </div>
      
      <input 
        type="range" 
        ref={progressBarRef} 
        className="progress-range" 
        min="0" 
        max="100" 
        defaultValue="0" 
        onChange={handleProgressChange}
        style={{ display: 'none' }}
      />
      
      <audio 
        ref={audioRef} 
        onTimeUpdate={handleTimeUpdate} 
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        onError={(e) => {
          console.error("Audio error:", e);
          // Reset isPlaying state when there's an error
          setIsPlaying(false);
          cancelAnimationFrame(animationRef.current);
        }}
      />

      <style jsx>{`
        .player-controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin: 20px 0;
        }
        
        .control-group {
          position: relative;
        }
        
        .center-controls {
          display: flex;
          align-items: center;
          gap: 30px;
        }
        
        .menu-dropdown {
          position: absolute;
          top: 40px;
          left: 0;
          background: rgba(20, 20, 30, 0.85);
          backdrop-filter: blur(12px);
          border-radius: 12px;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
          width: 220px;
          z-index: 10;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.1);
          animation: fadeIn 0.2s ease-out;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .favorite-option {
          padding: 14px 16px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 12px;
          transition: all 0.2s;
          color: #fff;
        }
        
        .favorite-option:hover {
          background-color: rgba(255, 255, 255, 0.05);
        }
        
        .favorite-option span {
          font-size: 14px;
          letter-spacing: 0.3px;
        }
        
        .volume-container {
          position: relative;
        }
        
        .volume-button {
          background-color: rgba(255, 255, 255, 0.1);
          border-radius: 50%;
          padding: 8px;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .volume-slider-popup {
          position: absolute;
          bottom: 40px;
          right: 0;
          background: #fff;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          padding: 16px;
          width: 150px;
          z-index: 10;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        
        .volume-range {
          width: 100%;
          -webkit-appearance: none;
          height: 4px;
          border-radius: 2px;
          background: #e0e0e0;
          outline: none;
        }
        
        .volume-range::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: var(--player-primary-color);
          cursor: pointer;
        }
        
        .volume-mute-button {
          background-color: var(--player-primary-color);
          border: none;
          border-radius: 4px;
          color: white;
          padding: 6px 12px;
          font-size: 12px;
          cursor: pointer;
        }
      `}</style>
    </div>
    </div>
  );
};

export default MusicPlayer; 