const express = require('express');
const fs = require('fs');
const cors = require('cors');
const app = express();
const PORT = 3001;
const DATA_FILE = './equipmentDB.json';

app.use(cors());
app.use(express.json());

// Lire la base de données
app.get('/equipment', (req, res) => {
  fs.readFile(DATA_FILE, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Erreur lecture fichier.' });
    res.json(JSON.parse(data));
  });
});

// Ajouter un équipement
app.post('/equipment', (req, res) => {
  const { category, name, power } = req.body;
  if (!category || !name || power == null) {
    return res.status(400).json({ error: 'Données manquantes.' });
  }

  fs.readFile(DATA_FILE, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Erreur lecture fichier.' });
    const db = JSON.parse(data);
    if (!db[category]) db[category] = [];
    db[category].push({ name, power });

    fs.writeFile(DATA_FILE, JSON.stringify(db, null, 2), (err) => {
      if (err) return res.status(500).json({ error: 'Erreur écriture fichier.' });
      res.json({ success: true });
    });
  });
});

// Lancer le serveur
app.listen(PORT, () => {
  console.log(`Backend démarré sur http://localhost:${PORT}`);
});
