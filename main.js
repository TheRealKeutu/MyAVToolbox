const { app, BrowserWindow, ipcMain } = require('electron');
const os = require('os');
const { exec } = require('child_process');
const path = require('path');
const dns = require('dns').promises;
const fs = require('fs');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    // Mode développement : charger Vite
    win.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    // Mode production : charger le fichier HTML buildé
    win.loadFile(path.join(__dirname, 'dist', 'index.html'));
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
    const safeLabel = label.replace(/"/g, '\"');
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
    const safeLabel = label.replace(/"/g, '\"');
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

// Scanner le sous-réseau
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
        const hostnames = await dns.reverse(ip);
        return hostnames[0] || null;
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
    exec(`ping -c 1 -W 1 ${ip}`, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        resolve(true);
      }
    });
  });
}

//Sauvegarde dans la base de donnée d'équipements
ipcMain.handle('save-equipment-db', async (event, updatedEquipment) => {
  const dbPath = path.join(__dirname, 'assets/equipmentDB.json');
  try {
    fs.writeFileSync(dbPath, JSON.stringify(updatedEquipment, null, 2), 'utf8');
    return { success: true };
  } catch (error) {
    console.error("Erreur lors de la sauvegarde :", error);
    return { success: false, error: error.message };
  }
});

app.whenReady().then(createWindow);
