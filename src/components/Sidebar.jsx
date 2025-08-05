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
      <button className="button" onClick={() => onSelect('welcome')}> 🏠 Home</button>
      <button className="button" onClick={() => onSelect('AudioToolbox')}> 🔊 Audio</button>
      <button className="button" onClick={() => onSelect('toolbox')}> 🎬 Video</button>
      <button className="button" onClick={() => onSelect('LightingToolbox')}> 💡 Lighting</button>
      <button className="button" onClick={() => onSelect('ipconfig')}> 🛜 Network</button>
      <button className="button" onClick={() => onSelect('OscViewer')}> 🎹 OSC monitoring</button>
      <button className="button" onClick={() => onSelect('PowerToolbox')}> ⚡️ Power</button>
      <button className="button" onClick={() => onSelect('CableRunEstimator')}> 🧶 Cable length</button>
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
