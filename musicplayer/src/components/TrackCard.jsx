import React from 'react';

const TrackCard = ({ track, isPlaying, setCurrentTrack, themeColor }) => {
  const handlePlay = () => {
    setCurrentTrack(track);
  };

  // Get styles for the playing track row
  const getPlayingStyles = () => {
    if (isPlaying) {
      return {
        backgroundColor: 'rgba(255, 255, 255, 0.05)'
      };
    }
    return {};
  };

  return (
    <div 
      className={`track-row `} 
      onClick={handlePlay}
      style={getPlayingStyles()}
    >
      <div className="track-avatar">
        <img src={track.thumbnail} alt={track.title} />
      </div>
      <div className="track-info">
        <h3 className="track-title">{track.title}</h3>
        <div className="track-artist">{track.albumName}</div>
      </div>
      <div className="track-duration">
        {track.duration}
      </div>
    </div>
  );
};

export default TrackCard; 