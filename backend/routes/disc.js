const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { parseCSV } = require('../utils/csvParser');
const { isLongs, determineWinner, updateHandicaps } = require('../utils/handicapCalc');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });
const DATA_FILE = path.join(__dirname, '../data/gameData.json');

function readData() {
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
}

router.get('/data', (req, res) => {
  try {
    res.json(readData());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/upload', upload.single('csv'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No CSV file uploaded' });

    const parsed = parseCSV(req.file.buffer);
    const data = readData();

    const knownPlayers = Object.keys(data.players);
    const csvPlayers = Object.keys(parsed.scores);
    const matched = csvPlayers.filter(n => knownPlayers.includes(n));
    if (!matched.length) {
      return res.status(400).json({ error: `No known players found in CSV. Found: ${csvPlayers.join(', ')}` });
    }

    const filteredScores = {};
    const filteredTotals = {};
    for (const name of matched) {
      filteredScores[name] = parsed.scores[name];
      if (parsed.totals[name] != null) filteredTotals[name] = parsed.totals[name];
    }

    const longs = isLongs(parsed.layout);
    const { winner, netScores } = determineWinner(filteredScores, data.players, longs);

    data.players[winner].wins = (data.players[winner].wins || 0) + 1;
    data.players = updateHandicaps(winner, data.players);

    const newRound = {
      date: parsed.date,
      course: parsed.course,
      layout: parsed.layout,
      winner,
      scores: filteredScores,
      totals: filteredTotals,
      netScores
    };

    data.rounds.unshift(newRound);
    writeData(data);

    res.json({ success: true, winner, netScores, players: data.players });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
