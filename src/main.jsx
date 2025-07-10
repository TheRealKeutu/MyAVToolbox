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
import VideoToolbox from './components/VideoToolbox.jsx';
import VideoTestPattern from './components/VideoTestPattern.jsx';
import AudioVideoSyncTester from './components/AudioVideoSyncTester.jsx';
import AudioToolbox from './components/AudioToolbox.jsx';
import PinkNoiseGenerator from './components/PinkNoiseGenerator.jsx';
import LightingToolbox from './components/LightingToolbox.jsx';
import OscViewer from './components/OscViewer.jsx';
import RFLinkCalculator from './components/RFLinkCalculator.jsx';
import CableRunEstimator from './components/CableRunEstimator.jsx';
import ProjectorDistanceTool from './components/ProjectorDistanceTool.jsx';
import CableSectionCalculator from './components/CableSectionCalculator.jsx';
import PowerToolbox from './components/PowerToolbox.jsx';

import Test from './components/Test.jsx';

import './styles.css';

function App() {
  const [view, setView] = useState('welcome');
  const [darkMode, setDarkMode] = useState(() => {
    const stored = localStorage.getItem('darkMode');
    return stored ? stored === 'true' : false;
  });

  useEffect(() => {
    localStorage.setItem('darkMode', darkMode);
    document.documentElement.classList.toggle('dark-mode', darkMode);
  }, [darkMode]);

  const renderContent = () => {
    const sharedProps = { darkMode };

    switch (view) {
      case 'welcome': return <Welcome {...sharedProps} />;
      case 'power': return <PowerCalculator {...sharedProps} />;
      case 'bandwidth': return <BandwidthCalculator {...sharedProps} />;
      case 'video': return <VideoCalculator {...sharedProps} />;
      case 'ipconfig': return <IPConfig {...sharedProps} />;
      case 'LAcousticsLoadCalc': return <LAcousticsLoadCalculator {...sharedProps} />;
      case 'PreAlignmentCalculator': return <PreAlignmentCalculator {...sharedProps} />;
      case 'SynopticBuilder': return <SynopticBuilder {...sharedProps} />;
      case 'DmxDipswitch': return <DMXDipswitch {...sharedProps} />;
      case 'AudioToolbox': return <AudioToolbox onSelect={setView} {...sharedProps} />;
      case 'LightingToolbox': return <LightingToolbox onSelect={setView} {...sharedProps} />;
      case 'toolbox': return <VideoToolbox onSelect={setView} {...sharedProps} />;
      case 'PowerToolbox': return <PowerToolbox onSelect={setView} {...sharedProps} />;
      case 'rose-noise': return <PinkNoiseGenerator {...sharedProps} />;
      case 'video-test': return <VideoTestPattern {...sharedProps} />;
      case 'dmx-viewer': return <DMXFrameViewer {...sharedProps} />;
      case 'crc-calculator': return <CRCCalculator {...sharedProps} />;
      case 'AudioVideoSyncTester': return <AudioVideoSyncTester {...sharedProps} />;
      case 'OscViewer': return <OscViewer {...sharedProps} />;
      case 'RFLinkCalculator': return <RFLinkCalculator {...sharedProps} />;
      case 'CableRunEstimator': return <CableRunEstimator {...sharedProps} />;
      case 'ProjectorDistanceTool': return <ProjectorDistanceTool {...sharedProps} />;
      case 'CableSectionCalculator': return <CableSectionCalculator {...sharedProps} />;
      case 'test': return <Test {...sharedProps} />;
      default: return <div>Page not found</div>;
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
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
              backgroundColor: 'var(--color-muted)',
              color: 'var(--color-text)',
              fontWeight: '500',
            }}
          >
            {darkMode ? '🌞 Light mode' : '🌙 Dark mode'}
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
