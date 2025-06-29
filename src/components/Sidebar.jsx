import React, { useState } from 'react';

export default function Sidebar({ currentPage, onSelect }) {
  const [activeMenu, setActiveMenu] = useState(null);

  const handleBack = () => setActiveMenu(null);

  const renderMainMenu = () => (
    <div className="buttonGroup">
      <button className="button" onClick={() => onSelect('welcome')}>🏠 Accueil</button>
      <button className="button" onClick={() => onSelect('AudioToolbox')}>🔊 Son</button>
      <button className="button" onClick={() => onSelect('toolbox')}>🎬 Vidéo</button>
      <button className="button" onClick={() => onSelect('LightingToolbox')}>🎚️ éclairage</button>
      <button className="button" onClick={() => onSelect('power')}>⚡️ Électricité</button>
      <button className="button" onClick={() => onSelect('ipconfig')}>🛜 Réseau</button>
      <button className="button" onClick={() => onSelect('SynopticBuilder')}>🔀 Synoptique</button>
      <button className="button" onClick={() => onSelect('test')}>🧪 Test</button>
    </div>
  );

  return (
    <div className="sidebar">
      <h1 className="title">RackTools</h1>
      <img src="/logo.png" alt="Logo" className="logo" />
      {activeMenu === 'son'
        ? renderSonMenu()
        : activeMenu === 'lacoustics'
        ? renderLAcousticsMenu()
        : renderMainMenu()}
    </div>
  );
}
