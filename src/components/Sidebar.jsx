/*
 * Copyright (C) 2025 Thomas Gouazé
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

import React, { useState } from 'react';
import logo from '/logo.png';

export default function Sidebar({ currentPage, onSelect, darkMode, onToggleDarkMode }) {
  const [activeMenu, setActiveMenu] = useState(null);

  const handleBack = () => setActiveMenu(null);

  const renderMainMenu = () => (
    <div className="buttonGroup vertical">
      <button className="button" onClick={() => onSelect('welcome')}> 🏠 Accueil</button>
      <button className="button" onClick={() => onSelect('AudioToolbox')}> 🔊 Son</button>
      <button className="button" onClick={() => onSelect('toolbox')}> 🎬 Vidéo</button>
      <button className="button" onClick={() => onSelect('LightingToolbox')}> 🎚️ Éclairage</button>
      <button className="button" onClick={() => onSelect('ipconfig')}> 🛜 Réseau</button>
      <button className="button" onClick={() => onSelect('OscViewer')}> 🎹 Monitoring OSC</button>
      <button className="button" onClick={() => onSelect('PowerToolbox')}> ⚡️ Electricité</button>
      <button className="button" onClick={() => onSelect('CableRunEstimator')}> 🧶 Longueur de câble</button>
    </div>
  );

  return (
    <aside className="sidebar">
      <img src={logo} alt="Logo RackTools" className="logo" />
      <h1 className="title">RackTools</h1>

      <div className="fade-in">
        {activeMenu === 'son'
          ? renderSonMenu?.()
          : activeMenu === 'lacoustics'
          ? renderLAcousticsMenu?.()
          : renderMainMenu()}
      </div>
    </aside>
  );
}
