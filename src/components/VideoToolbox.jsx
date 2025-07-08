import React from 'react';

export default function VideoToolbox({ onSelect }) {
  return (
    <div className="buttonGroup">
      <button className="button" onClick={() => onSelect('video-test')}>📺 Testeur vidéo</button>
      <button className="button" onClick={() => onSelect('video')}>🎬 Calculateur de débit vidéo</button>
      <button className="button" onClick={() => onSelect('AudioVideoSyncTester')}>🗣️ Audio Video Sync</button>
      <button className="button" onClick={() => onSelect('ProjectorDistanceTool')}>📽️ Projection</button>
    </div>
  );
}
