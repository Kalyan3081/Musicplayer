import React, { useState, useEffect } from 'react';
import TrackCard from './TrackCard';
import { categories } from '../data/tracks';

const TracksContainer = ({ 
  activeCategory, 
  tracks, 
  setCurrentTrack, 
  currentTrack, 
  toggleFavorite, 
  favorites,
  searchTerm,
  onSearch,
  themeColor,
  isVisible,     // New prop for mobile visibility
  setActiveCategory, // To change categories on mobile
  onClose        // New prop for closing the tracks view on mobile
}) => {
  const [filteredTracks, setFilteredTracks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    let filtered = [];
    
    // Simulate loading with setTimeout
    setIsLoading(true);
    
    setTimeout(() => {
      if (activeCategory === 1) { // For You
        filtered = tracks;
      } else if (activeCategory === 2) { // Top Tracks
        filtered = [...tracks].sort(() => Math.random() - 0.5).slice(0, 5); // Random top 5 for demo
      } else if (activeCategory === 3) { // Favorites
        filtered = tracks.filter(track => favorites.includes(track.id));
      } else if (activeCategory === 4) { // Recently Played
        const recentlyPlayed = JSON.parse(sessionStorage.getItem('recentlyPlayed')) || [];
        filtered = recentlyPlayed.map(id => tracks.find(track => track.id === id)).filter(Boolean);
      }
      
      // Apply search filtering if there's a search term
      if (searchTerm) {
        filtered = filtered.filter(track => 
          track.title.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      setFilteredTracks(filtered);
      setIsLoading(false);
    }, 500); // Simulated loading time
  }, [activeCategory, tracks, favorites, searchTerm]);

  // Get styles for active category
  const getActiveCategoryStyle = () => {
    return {
      textShadow: themeColor ? `0 0 10px ${themeColor}80` : 'none'
    };
  };
  
  return (
    <div className={`main-content ${isVisible ? 'active' : ''}`}>
      {/* Mobile header with close button */}
      <div className="tracks-header visible-mobile">
        <h1 className="section-title" style={getActiveCategoryStyle()}>
          {categories.find(cat => cat.id === activeCategory)?.name}
        </h1>
        <button className="close-btn" onClick={onClose}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      
      {/* Category tabs for mobile */}
      <div className="categories-tabs visible-mobile">
        {categories.map(category => (
          <div 
            key={category.id} 
            className={`category-tab ${activeCategory === category.id ? 'active' : ''}`}
            onClick={() => setActiveCategory(category.id)}
            style={activeCategory === category.id ? { background: themeColor } : {}}
          >
            {category.name}
          </div>
        ))}
      </div>
      
      {/* Desktop version title */}
      <h1 className="section-title visible-desktop" style={getActiveCategoryStyle()}>
        {categories.find(cat => cat.id === activeCategory)?.name}
      </h1>
      
      <div className="search-container">
        <input 
          type="text" 
          placeholder="Search Song, Artist" 
          className="search-input" 
          value={searchTerm}
          onChange={(e) => onSearch(e.target.value)}
        />
        <div className="search-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
          </svg>
        </div>
      </div>
      
      {isLoading ? (
        <div className="loading-container">
          <div className="spinner" style={{ borderTopColor: themeColor }}></div>
          <p>Loading tracks...</p>
        </div>
      ) : filteredTracks.length > 0 ? (
        <div className="tracks-container">
          {filteredTracks.map((track) => (
            <TrackCard
              key={track.id}
              track={track}
              isPlaying={currentTrack?.id === track.id}
              setCurrentTrack={(track) => {
                // When a track is clicked, set it as current track
                // The App component will handle starting playback
                setCurrentTrack(track);
                
                // On mobile, close the tracks view when a track is selected
                if (window.innerWidth <= 768) {
                  onClose();
                }
              }}
              toggleFavorite={toggleFavorite}
              isFavorite={favorites.includes(track.id)}
              themeColor={themeColor}
            />
          ))}
        </div>
      ) : (
        <div className="no-tracks-message">
          <p>No tracks found. {activeCategory === 3 ? 'Mark some as favorites!' : 'Try a different search term.'}</p>
        </div>
      )}
    </div>
  );
};

export default TracksContainer; 