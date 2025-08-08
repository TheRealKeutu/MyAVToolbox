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

import React from 'react';

export default function Welcome({ darkMode }) {
  // Fonction pour ouvrir un lien externe via l’API exposée
  const openLink = (url) => (e) => {
    e.preventDefault();
    window.electronAPI.openExternal(url);
  };

  return (
    <div className={`welcome-container ${darkMode ? 'dark-mode' : ''}`}>
      <h1>Welcome to MyAvToolbox !</h1>
      <h3>Your all in one AV Toolbox</h3>
      <p>Tools for sound, video, lighting, network and many more to come.</p>
      <br />
      <p>Version 1.0.1</p>
      <p>Copyright (C) 2025 Thomas Gouazé</p>
      <p>
        License :{' '}
        <a
          href="#"
          onClick={openLink('https://www.gnu.org/licenses/gpl-3.0.fr.html#license-text')}
        >
          GPL v3.0
        </a>
      </p>
      <p>Distributed under pay what you want model</p>
      <p>
        <a href="#" onClick={openLink('https://ko-fi.com/myavtoolbox')}>
          Donate
        </a>
      </p>
    </div>
  );
}
