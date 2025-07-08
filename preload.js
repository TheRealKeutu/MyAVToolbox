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

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Réseau
  configureStaticIP: (config) => ipcRenderer.send('configure-static-ip', config),
  configureDHCP: (adapter) => ipcRenderer.send('configure-dhcp', adapter),
  configureResult: (callback) => ipcRenderer.on('network-config-result', callback),

  // API générique
  invoke: (channel, data) => ipcRenderer.invoke(channel, data),

  // Sauvegarde DB équipements
  saveEquipmentDB: (data) => ipcRenderer.invoke('save-equipment-db', data),

  // Exemple : appel des interfaces réseau, scan, etc.
  getNetworkInterfaces: () => ipcRenderer.invoke('get-network-interfaces'),
  setStaticIP: (data) => ipcRenderer.invoke('set-static-ip', data),
  setDHCP: (data) => ipcRenderer.invoke('set-dhcp', data),
  scanSubnet: (data) => ipcRenderer.invoke('scan-subnet', data),

   // OSC : envoyer un message OSC
  oscSend: (oscMessage) => ipcRenderer.invoke('osc-send', oscMessage),

  // OSC : changer la config d'écoute (ip + port)
  oscSetListenConfig: (config) => ipcRenderer.invoke('osc-set-listen-config', config),

  // OSC : écouter les messages entrants
  onOscIncoming: (callback) => ipcRenderer.on('osc-incoming', (event, message) => callback(message)),

  // DMX 
  onDMXData: (callback) => ipcRenderer.on('dmx-data', (_, data) => callback(data))
});