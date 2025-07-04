// server/osc-server.js
import express from 'express';
import { WebSocketServer } from 'ws';
import osc from 'osc';

const app = express();
const HTTP_PORT = 3001;

// Config OSC par défaut
let currentOscConfig = {
  ip: '0.0.0.0',
  port: 57121,
};

let oscUDP = null;
const wss = new WebSocketServer({ noServer: true });

// Crée ou recrée le port UDP OSC
function createOscUDP(ip, port) {
  const udpPort = new osc.UDPPort({
    localAddress: ip,
    localPort: port,
    metadata: true,
  });

  udpPort.on('ready', () => {
    console.log(`✅ OSC en écoute sur udp://${ip}:${port}`);
  });

  udpPort.on('message', (oscMsg) => {
    console.log('🔁 OSC IN:', oscMsg);
    const msg = JSON.stringify(oscMsg);
    wss.clients.forEach((client) => {
      if (client.readyState === 1) client.send(msg);
    });
  });

  udpPort.on('error', (err) => {
    console.error('❌ Erreur OSC UDP:', err.message);
  });

  udpPort.open();
  return udpPort;
}

// ➕ Initialisation
oscUDP = createOscUDP(currentOscConfig.ip, currentOscConfig.port);

// 🌐 Serveur HTTP pour WebSocket
const server = app.listen(HTTP_PORT, () => {
  console.log(`🌐 Serveur WebSocket actif sur ws://localhost:${HTTP_PORT}`);
});

server.on('upgrade', (req, socket, head) => {
  wss.handleUpgrade(req, socket, head, (ws) => {
    wss.emit('connection', ws, req);

    ws.on('message', (data) => {
      try {
        const msg = JSON.parse(data);

        // 🔁 Reconfigurer l’écoute OSC
        if (msg.type === 'set-listen-config') {
          const newPort = Number(msg.port);
          const newIp = msg.ip || '0.0.0.0';

          if (
            !isNaN(newPort) &&
            (newPort !== currentOscConfig.port || newIp !== currentOscConfig.ip)
          ) {
            console.log(`🔁 Changement port OSC : ${currentOscConfig.ip}:${currentOscConfig.port} → ${newIp}:${newPort}`);
            oscUDP.close();

            // Petite pause pour libérer le port proprement
            setTimeout(() => {
              oscUDP = createOscUDP(newIp, newPort);
              currentOscConfig = { ip: newIp, port: newPort };
            }, 300); // Réduction du délai à 300ms pour meilleure réactivité
          }
          return;
        }

        // 📤 Envoi OSC sortant
        const { address, args, targetIp = '127.0.0.1', targetPort = 53000 } = msg;
        oscUDP.send({ address, args }, targetIp, targetPort);
        console.log('📤 OSC OUT →', targetIp, targetPort, address);
      } catch (e) {
        console.error('❌ Erreur message WebSocket OSC:', e);
      }
    });
  });
});

// ✅ Gestion d'arrêt propre du serveur (utile dans les builds)
process.on('SIGINT', () => {
  console.log('🛑 Arrêt serveur OSC');
  if (oscUDP) oscUDP.close();
  server.close(() => process.exit(0));
});

process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM reçu — fermeture');
  if (oscUDP) oscUDP.close();
  server.close(() => process.exit(0));
});
