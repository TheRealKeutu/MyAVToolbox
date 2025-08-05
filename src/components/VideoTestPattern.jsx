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

import React, { useState, useRef, useEffect } from 'react';

const patterns = [
  'Grid',
  'SMPTE bars',
  'Gradient',
  'White',
  'Black',
  'Checkerboard',
  '1px lines',
  'Overscan'
];

export default function VideoTestPattern() {
  const [pattern, setPattern] = useState('Grid');
  const popupRef = useRef(null);

  const getPatternStyle = (p = pattern) => {
    switch (p) {
      case 'Grid':
        return {
          backgroundColor: '#000',
          backgroundImage: `
            linear-gradient(to right, white 1px, transparent 1px),
            linear-gradient(to bottom, white 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        };
      case 'SMPTE bars':
        return {
          background: 'linear-gradient(to right, #c0c0c0 14.28%, #ffffff 14.28%, #ffffff 28.56%, #00ff00 28.56%, #00ff00 42.84%, #ff0000 42.84%, #ff0000 57.12%, #0000ff 57.12%, #0000ff 71.4%, #ffff00 71.4%, #ffff00 85.68%, #00ffff 85.68%, #ff00ff 100%)',
        };
      case 'Gradient':
        return {
          background: 'linear-gradient(to right, black, white)',
        };
      case 'White':
        return { backgroundColor: 'white' };
      case 'Black':
        return { backgroundColor: 'black' };
      case 'Checkerboard':
        return {
          backgroundImage: `
            linear-gradient(45deg, white 25%, black 25%, black 50%, white 50%, white 75%, black 75%, black 100%)`,
          backgroundSize: '40px 40px',
        };
      case '1px lines':
        return {
          backgroundImage: `repeating-linear-gradient(to bottom, black, black 1px, white 1px, white 2px)`,
        };
      case 'Overscan':
        return {
          backgroundColor: 'black',
          border: '20px solid red',
          boxSizing: 'border-box',
        };
      default:
        return {};
    }
  };

  const openInNewWindow = () => {
    const popup = window.open('', '', 'width=1280,height=720');
    if (!popup) return;

    popup.document.write(`
      <html>
        <head>
          <title>Test vidéo</title>
          <style>
            html, body {
              margin: 0;
              padding: 0;
              height: 100%;
              width: 100%;
              overflow: hidden;
            }
            #pattern {
              width: 100vw;
              height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
            }
          </style>
        </head>
        <body>
          <div id="pattern"></div>
          <script>
            window.addEventListener('message', (event) => {
              const el = document.getElementById('pattern');
              if (el && event.data && event.data.type === 'updateStyle') {
                Object.assign(el.style, event.data.style);
              }
            });
          </script>
        </body>
      </html>
    `);

    popup.document.close();
    popupRef.current = popup;

    // Send initial pattern
    setTimeout(() => {
      popup.postMessage({ type: 'updateStyle', style: getPatternStyle() }, '*');
    }, 300);
  };

  useEffect(() => {
    if (popupRef.current && !popupRef.current.closed) {
      popupRef.current.postMessage({
        type: 'updateStyle',
        style: getPatternStyle(),
      }, '*');
    }
  }, [pattern]);

  const enterFullscreen = () => {
    const elem = document.getElementById('test-pattern');
    if (elem.requestFullscreen) elem.requestFullscreen();
  };

  return (
    <div>
      <h1>🖥️ Video test patterns</h1>

      <div style={{ marginBottom: '1rem' }}>
        <label>
          Pattern :
          <select
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            style={{ marginLeft: '1rem' }}
          >
            {patterns.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </label>

        <button onClick={enterFullscreen} style={{ marginLeft: '1rem' }}>
          ⛶ Fullscreen
        </button>

        <button onClick={openInNewWindow} style={{ marginLeft: '1rem' }}>
          🖥️ open in floating windows
        </button>
      </div>

      <div
        id="test-pattern"
        style={{
          width: '100%',
          height: '500px',
          border: '1px solid #ccc',
          borderRadius: '8px',
          ...getPatternStyle()
        }}
      />
    </div>
  );
}
