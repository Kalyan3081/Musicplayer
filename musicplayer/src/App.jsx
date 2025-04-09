import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import TracksContainer from './components/TracksContainer';
import MusicPlayer from './components/MusicPlayer';
import { tracks } from './data/tracks';
import { extractDominantColor } from './utils/colorExtractor';
import './styles/main.scss'; // Import our new modular styles

function App() {
  const [activeCategory, setActiveCategory] = useState(1); // Default to "For You"
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false); // New state to control playback
  const [searchTerm, setSearchTerm] = useState('');
  const [favorites, setFavorites] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tracksViewOpen, setTracksViewOpen] = useState(false); // New state for mobile tracks view
  const [backgroundStyle, setBackgroundStyle] = useState({});
  const [themeColor, setThemeColor] = useState('#8e44ad');
  const [isMobile, setIsMobile] = useState(false); // To track if we're on mobile
  
  // Check if we're on mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    // Initial check
    checkMobile();
    
    // Add listener for window resize
    window.addEventListener('resize', checkMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Load favorites from localStorage
  useEffect(() => {
    const storedFavorites = localStorage.getItem('favorites');
    if (storedFavorites) {
      setFavorites(JSON.parse(storedFavorites));
    }
  }, []);
  
  // Extract color from thumbnail when current track changes
  useEffect(() => {
    if (currentTrack) {
      // Extract dominant color from thumbnail
      extractDominantColor(currentTrack.thumbnail)
        .then(color => {
          setThemeColor(color);
        })
        .catch(() => {
          // Fallback to the predefined color if extraction fails
          setThemeColor(currentTrack.primaryColor || '#8e44ad');
        });
    }
  }, [currentTrack]);
  
  // Update background style when theme color changes
  useEffect(() => {
    setBackgroundStyle({
      background: `linear-gradient(135deg, ${themeColor} 0%, rgba(0, 0, 0, 0.95) 100%)`,
      backgroundAttachment: 'fixed',
      transition: 'background 0.5s ease-in-out'
    });
  }, [themeColor]);
  
  // Update recently played in sessionStorage when track changes
  useEffect(() => {
    if (currentTrack) {
      const recentlyPlayed = JSON.parse(sessionStorage.getItem('recentlyPlayed')) || [];
      
      // Remove the current track if it already exists in the recently played
      const filtered = recentlyPlayed.filter(id => id !== currentTrack.id);
      
      // Add current track to the beginning
      const updated = [currentTrack.id, ...filtered].slice(0, 10); // Keep only last 10
      
      sessionStorage.setItem('recentlyPlayed', JSON.stringify(updated));
    }
  }, [currentTrack]);
  
  // Function to set the current track and start playing
  const handleTrackSelect = (track) => {
    setCurrentTrack(track);
    setIsPlaying(true); // Auto-play when a track is selected
  };
  
  const toggleFavorite = (trackId) => {
    let updatedFavorites;
    
    if (favorites.includes(trackId)) {
      updatedFavorites = favorites.filter(id => id !== trackId);
    } else {
      updatedFavorites = [...favorites, trackId];
    }
    
    setFavorites(updatedFavorites);
    localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
  };
  
  const handleSearch = (term) => {
    setSearchTerm(term);
  };
  
  const handleNextTrack = () => {
    const currentIndex = tracks.findIndex(track => track.id === currentTrack?.id);
    const nextIndex = (currentIndex + 1) % tracks.length;
    setCurrentTrack(tracks[nextIndex]);
    // Keep playing when moving to the next track
    setIsPlaying(true);
  };
  
  const handlePrevTrack = () => {
    const currentIndex = tracks.findIndex(track => track.id === currentTrack?.id);
    const prevIndex = (currentIndex - 1 + tracks.length) % tracks.length;
    setCurrentTrack(tracks[prevIndex]);
    // Keep playing when moving to the previous track
    setIsPlaying(true);
  };
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  // Toggle the tracks view on mobile
  const toggleTracksView = () => {
    setTracksViewOpen(!tracksViewOpen);
  };

  // Toggle play/pause state
  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };
  
  return (
    <div style={{height: '100vh', width: '100vw', ...backgroundStyle}}>
      <div className="app-container">
        <div className={`sidebar ${sidebarOpen ? 'active' : ''}`}>
          <Sidebar 
            activeCategory={activeCategory} 
            setActiveCategory={setActiveCategory}
            themeColor={themeColor}
          />
        </div>
        
        <TracksContainer 
          activeCategory={activeCategory}
          tracks={tracks}
          setCurrentTrack={handleTrackSelect} // Use the new handler that also starts playback
          currentTrack={currentTrack}
          toggleFavorite={toggleFavorite}
          favorites={favorites}
          searchTerm={searchTerm}
          onSearch={handleSearch}
          themeColor={themeColor}
          isVisible={tracksViewOpen || !isMobile} // Show always on desktop, conditionally on mobile
          setActiveCategory={setActiveCategory}
          onClose={() => setTracksViewOpen(false)}
        />
        
        <MusicPlayer 
          currentTrack={currentTrack} 
          onNext={handleNextTrack} 
          onPrev={handlePrevTrack}
          themeColor={themeColor} 
          toggleFavorite={toggleFavorite}
          isFavorite={currentTrack ? favorites.includes(currentTrack.id) : false}
          toggleTracksView={toggleTracksView} // Pass the toggle function
          isPlaying={isPlaying} // Pass down playing state
          setIsPlaying={setIsPlaying} // Allow player to update playing state
          togglePlayPause={togglePlayPause} // Pass toggle function
        />
      </div>
    </div>
  );
}

export default App;
