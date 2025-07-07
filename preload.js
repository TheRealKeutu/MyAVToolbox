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