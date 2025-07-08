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

import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import Sidebar from './components/Sidebar.jsx';
import Welcome from './components/Welcome.jsx';
import PowerCalculator from './components/PowerCalculators.jsx';
import BandwidthCalculator from './components/AudioCalculators.jsx';
import VideoCalculator from './components/VideoCalculators.jsx';
import IPConfig from './components/IPConfig.jsx';
import LAcousticsLoadCalculator from './components/LAcousticsLoadCalculator.jsx';
import PreAlignmentCalculator from './components/PreAlignmentCalculator.jsx';
import SynopticBuilder from './components/SynopticBuilder.jsx';
import DMXDipswitch from './components/DMXDipswitch.jsx';
import DMXFrameViewer from './components/DMXFrameViewer.jsx';
import Toolbox from './components/VideoToolbox.jsx';
import VideoTestPattern from './components/VideoTestPattern.jsx';
import CRCCalculator from './components/CRCCalculator.jsx';
import AudioVideoSyncTester from './components/AudioVideoSyncTester.jsx';
import AudioToolbox from './components/AudioToolbox.jsx';
import PinkNoiseGenerator from './components/PinkNoiseGenerator.jsx';
import LightingToolbox from './components/LightingToolbox.jsx';
import OscViewer from './components/OscViewer.jsx';
import RFLinkCalculator from './components/RFLinkCalculator.jsx';
import CableRunEstimator from './components/CableRunEstimator.jsx';
import ProjectorDistanceTool from './components/ProjectorDistanceTool.jsx';

import Test from './components/Test.jsx';

import './styles.css';

function App() {
  const [view, setView] = useState('welcome');
  const [darkMode, setDarkMode] = useState(() => {
    // Restaurer le choix utilisateur dans localStorage au démarrage
    return localStorage.getItem('darkMode') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  const renderContent = () => {
    switch (view) {
      case 'welcome': return <Welcome />;
      case 'power': return <PowerCalculator />;
      case 'bandwidth': return <BandwidthCalculator />;
      case 'video': return <VideoCalculator />;
      case 'ipconfig': return <IPConfig />;
      case 'LAcousticsLoadCalc': return <LAcousticsLoadCalculator />;
      case 'PreAlignmentCalculator': return <PreAlignmentCalculator />;
      case 'SynopticBuilder': return <SynopticBuilder />;
      case 'DmxDipswitch': return <DMXDipswitch />;
      case 'AudioToolbox': return <AudioToolbox onSelect={setView} />;
      case 'LightingToolbox': return <LightingToolbox onSelect={setView} />;
      case 'toolbox': return <Toolbox onSelect={setView} />;
      case 'rose-noise': return <PinkNoiseGenerator />;
      case 'video-test': return <VideoTestPattern />;
      case 'dmx-viewer': return <DMXFrameViewer />;
      case 'crc-calculator': return <CRCCalculator />;
      case 'AudioVideoSyncTester': return <AudioVideoSyncTester />;
      case 'OscViewer': return <OscViewer />;
      case 'RFLinkCalculator': return <RFLinkCalculator />;
      case 'CableRunEstimator': return <CableRunEstimator />;
      case 'ProjectorDistanceTool': return <ProjectorDistanceTool />;

      case 'test': return <Test />;

      default: return <div>Page non trouvée</div>;
    }
  };

  return (
    <div className={darkMode ? 'dark-mode' : 'light-mode'} style={{ display: 'flex', height: '100vh' }}>
      <Sidebar currentPage={view} onSelect={setView} />
      <div style={{ flex: 1, padding: '1rem' }}>
        <div style={{ marginBottom: '1rem', textAlign: 'right' }}>
          <button
            onClick={() => setDarkMode(!darkMode)}
            style={{
              cursor: 'pointer',
              padding: '0.4rem 0.8rem',
              borderRadius: '4px',
              border: 'none',
              backgroundColor: darkMode ? '#444' : '#ddd',
              color: darkMode ? '#eee' : '#222',
            }}
          >
            {darkMode ? '🌞 Mode clair' : '🌙 Mode sombre'}
          </button>
        </div>
        {renderContent()}
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode><App /></React.StrictMode>
);
