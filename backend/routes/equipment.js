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

const express = require('express');
const fs = require('fs');
const router = express.Router();
const DB_PATH = './equipmentDB.json';

// GET all equipment
router.get('/', (req, res) => {
  fs.readFile(DB_PATH, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Erreur lecture JSON' });
    res.json(JSON.parse(data));
  });
});

// POST new equipment (expects: category, name, power)
router.post('/', (req, res) => {
  const { category, name, power } = req.body;
  if (!category || !name || !power) return res.status(400).json({ error: 'Données incomplètes' });

  fs.readFile(DB_PATH, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Erreur lecture JSON' });
    const db = JSON.parse(data);

    if (!db[category]) db[category] = [];
    db[category].push({ name, power });

    fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), 'utf8', (err) => {
      if (err) return res.status(500).json({ error: 'Erreur écriture JSON' });
      res.json({ success: true });
    });
  });
});

// PUT to update equipment
router.put('/', (req, res) => {
  const { category, index, name, power } = req.body;
  if (category == null || index == null || name == null || power == null)
    return res.status(400).json({ error: 'Données incomplètes' });

  fs.readFile(DB_PATH, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Erreur lecture JSON' });
    const db = JSON.parse(data);

    if (!db[category] || !db[category][index])
      return res.status(404).json({ error: 'Équipement non trouvé' });

    db[category][index] = { name, power };

    fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), 'utf8', (err) => {
      if (err) return res.status(500).json({ error: 'Erreur écriture JSON' });
      res.json({ success: true });
    });
  });
});

// DELETE equipment
router.delete('/', (req, res) => {
  const { category, index } = req.body;
  if (category == null || index == null)
    return res.status(400).json({ error: 'Données incomplètes' });

  fs.readFile(DB_PATH, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Erreur lecture JSON' });
    const db = JSON.parse(data);

    if (!db[category] || !db[category][index])
      return res.status(404).json({ error: 'Équipement non trouvé' });

    db[category].splice(index, 1);

    fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), 'utf8', (err) => {
      if (err) return res.status(500).json({ error: 'Erreur écriture JSON' });
      res.json({ success: true });
    });
  });
});

module.exports = router;
