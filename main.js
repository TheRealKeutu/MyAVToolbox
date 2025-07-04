// main.js
import { app, BrowserWindow, ipcMain } from 'electron';
import os from 'os';
import { exec } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import dns from 'dns';
import fs from 'fs';
import osc from 'osc';

const { promises: dnsPromises } = dns;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow;

let currentOscConfig = {
  ip: '0.0.0.0',
  port: 57121,
};

let oscUDP = null;

// 🛑 Empêche le lancement multiple
if (!app.requestSingleInstanceLock()) {
  app.quit();
  process.exit(0);
}

// 🧠 Gestion d'une deuxième instance (ramène la fenêtre existante au premier plan)
app.on('second-instance', () => {
  const win = BrowserWindow.getAllWindows()[0];
  if (win) {
    if (win.isMinimized()) win.restore();
    win.focus();
  }
});

const iconPath = app.isPackaged 
  ? path.join(process.resourcesPath, 'assets', 'icon.png')
  : path.join(__dirname, 'assets', 'icon.png');

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: iconPath, 
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, 'dist', 'index.html'));
  }
}

function createOscUDP(ip, port) {
  if (oscUDP) {
    oscUDP.close();
    oscUDP = null;
  }

  oscUDP = new osc.UDPPort({
    localAddress: ip,
    localPort: port,
    metadata: true,
  });

  oscUDP.on('ready', () => {
    console.log(`✅ OSC listening on udp://${ip}:${port}`);
  });

  oscUDP.on('message', (oscMsg) => {
    console.log('🔁 OSC IN:', oscMsg);
    if (mainWindow) {
      mainWindow.webContents.send('osc-incoming', oscMsg);
    }
  });

  oscUDP.on('error', (err) => {
    console.error('❌ OSC UDP error:', err.message);
  });

  oscUDP.open();
}

function startOscServer() {
  createOscUDP(currentOscConfig.ip, currentOscConfig.port);
}

function stopOscServer() {
  if (oscUDP) {
    oscUDP.close();
    oscUDP = null;
  }
}

function deduceGateway(ip) {
  if (!ip || !ip.includes('.')) return '192.168.1.1';
  const parts = ip.split('.');
  parts[3] = '1';
  return parts.join('.');
}

let hardwarePortsCache = {};

function getHardwarePorts() {
  return new Promise((resolve, reject) => {
    exec('networksetup -listallhardwareports', (err, stdout) => {
      if (err) return reject(err);
      const lines = stdout.split('\n');
      const mapping = {};
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('Hardware Port')) {
          const name = lines[i].split(': ')[1];
          const device = lines[i + 1]?.split(': ')[1];
          if (device && name) mapping[device] = name;
        }
      }
      hardwarePortsCache = mapping;
      resolve(mapping);
    });
  });
}

ipcMain.handle('get-network-interfaces', async () => {
  const interfaces = os.networkInterfaces();
  const hardwarePorts = await getHardwarePorts();
  const result = [];

  Object.entries(interfaces).forEach(([name, details]) => {
    const ipv4 = details.find(d => d.family === 'IPv4' && !d.internal);
    if (ipv4) {
      result.push({
        name,
        label: hardwarePorts[name] || name,
        address: ipv4.address,
        netmask: ipv4.netmask,
        gateway: deduceGateway(ipv4.address),
      });
    }
  });

  return result;
});

ipcMain.handle('set-static-ip', async (event, { name, address, netmask, gateway }) => {
  return new Promise((resolve, reject) => {
    const label = Object.entries(hardwarePortsCache).find(([dev]) => dev === name)?.[1] || name;
    const safeLabel = label.replace(/"/g, '\\"');
    const cmd = `networksetup -setmanual "${safeLabel}" ${address} ${netmask} ${gateway}`;
    exec(cmd, (err, stdout, stderr) => {
      if (err) {
        console.error('Erreur IP statique :', err);
        reject(new Error(stderr || err.message || 'Erreur lors de la configuration IP'));
      } else {
        resolve('IP statique configurée avec succès.');
      }
    });
  });
});

ipcMain.handle('set-dhcp', async (event, { label }) => {
  return new Promise((resolve, reject) => {
    const safeLabel = label.replace(/"/g, '\\"');
    exec(`networksetup -setdhcp "${safeLabel}"`, (err, stdout, stderr) => {
      if (err) {
        console.error(`Erreur DHCP : ${err.message}`);
        reject(new Error(stderr || err.message || 'Erreur DHCP'));
      } else {
        resolve('DHCP activé avec succès.');
      }
    });
  });
});

ipcMain.handle('scan-subnet', async (event, { subnet }) => {
  const baseIP = subnet.split('.').slice(0, 3).join('.');
  const ips = [];
  for (let i = 1; i < 255; i++) {
    ips.push(`${baseIP}.${i}`);
  }

  const results = await Promise.allSettled(ips.map(ip => pingHost(ip)));

  const hostnames = await Promise.all(
    ips.map(async (ip, idx) => {
      if (results[idx].status === 'fulfilled') {
        try {
          const names = await dnsPromises.reverse(ip);
          return names[0] || null;
        } catch {
          return null;
        }
      }
      return null;
    })
  );

  return ips.map((ip, idx) => ({
    ip,
    active: results[idx].status === 'fulfilled',
    hostname: hostnames[idx],
  }));
});

function pingHost(ip) {
  return new Promise((resolve, reject) => {
    exec(`ping -c 1 -W 1 ${ip}`, (error) => {
      if (error) {
        reject(error);
      } else {
        resolve(true);
      }
    });
  });
}

ipcMain.handle('save-equipment-db', async (event, updatedEquipment) => {
  const dbPath = path.join(__dirname, 'assets', 'equipmentDB.json');
  try {
    fs.writeFileSync(dbPath, JSON.stringify(updatedEquipment, null, 2), 'utf8');
    return { success: true };
  } catch (error) {
    console.error('Erreur lors de la sauvegarde :', error);
    return { success: false, error: error.message };
  }
});

// Nouveau : gestion IPC OSC

ipcMain.handle('osc-send', (event, { address, args, targetIp, targetPort }) => {
  if (oscUDP) {
    oscUDP.send({ address, args }, targetIp, targetPort);
    console.log(`📤 OSC OUT → ${targetIp}:${targetPort} ${address}`);
    return { success: true };
  }
  return { success: false, error: 'OSC UDP port non ouvert' };
});

ipcMain.handle('osc-set-listen-config', (event, { ip, port }) => {
  if (
    port &&
    (port !== currentOscConfig.port || ip !== currentOscConfig.ip)
  ) {
    console.log(`🔁 Reconfiguration OSC : ${currentOscConfig.ip}:${currentOscConfig.port} → ${ip}:${port}`);
    currentOscConfig = { ip, port };
    createOscUDP(ip, port);
    return { success: true };
  }
  return { success: false, error: 'Pas de changement détecté' };
});

// 🚀 Lancement
app.whenReady().then(() => {
  startOscServer();
  createWindow();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

app.on('before-quit', () => {
  stopOscServer();
});

app.on('window-all-closed', () => {
  stopOscServer();
  if (process.platform !== 'darwin') app.quit();
});
