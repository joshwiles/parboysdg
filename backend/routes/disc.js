const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { parseCSV } = require('../utils/csvParser');
const { isLongs, determineWinner, updateHandicaps } = require('../utils/handicapCalc');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Seed file lives in the repo. On Railway, a persistent Volume mount survives
// deploys (unlike the repo checkout, which resets to git on every push) — so
// once RAILWAY_VOLUME_MOUNT_PATH is set, live data lives there instead.
const SEED_FILE = path.join(__dirname, '../data/gameData.json');
const DATA_FILE = process.env.RAILWAY_VOLUME_MOUNT_PATH
  ? path.join(process.env.RAILWAY_VOLUME_MOUNT_PATH, 'gameData.json')
  : SEED_FILE;

if (DATA_FILE !== SEED_FILE && !fs.existsSync(DATA_FILE)) {
  fs.copyFileSync(SEED_FILE, DATA_FILE);
}

const uid = () => Math.random().toString(36).slice(2, 10);

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

    const data = readData();
    const knownPlayers = Object.keys(data.players);
    const parsed = parseCSV(req.file.buffer, knownPlayers);

    const matched = Object.keys(parsed.scores);
    if (!matched.length) {
      return res.status(400).json({ error: `No known players found in CSV. Check that player names match (or start with) the names in your roster.` });
    }

    const filteredScores = {};
    const filteredTotals = {};
    const filteredRatings = {};
    for (const name of matched) {
      filteredScores[name] = parsed.scores[name];
      if (parsed.totals[name] != null) filteredTotals[name] = parsed.totals[name];
      if (parsed.ratings[name] != null) filteredRatings[name] = parsed.ratings[name];
    }

    const longs = isLongs(parsed.layout);
    const { winner, netScores } = determineWinner(filteredScores, data.players, longs);

    for (const name of matched) {
      data.players[name].played = (data.players[name].played || 0) + 1;
    }
    data.players[winner].wins = (data.players[winner].wins || 0) + 1;
    data.players = updateHandicaps(winner, data.players);

    const newRound = {
      id: uid(),
      date: parsed.date,
      time: parsed.time,
      course: parsed.course,
      layout: parsed.layout,
      winner,
      scores: filteredScores,
      totals: filteredTotals,
      netScores,
      ratings: filteredRatings
    };

    data.rounds.unshift(newRound);
    writeData(data);

    res.json({ success: true, winner, netScores, players: data.players });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/preview', upload.single('csv'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No CSV file uploaded' });
    const data = readData();
    const knownPlayers = Object.keys(data.players);
    const parsed = parseCSV(req.file.buffer, knownPlayers);
    if (!Object.keys(parsed.scores).length) {
      return res.status(400).json({ error: 'No known players found in CSV. Check that names match your roster.' });
    }
    const longs = isLongs(parsed.layout);
    const { winner, netScores } = determineWinner(parsed.scores, data.players, longs);
    res.json({
      course: parsed.course,
      layout: parsed.layout,
      date: parsed.date,
      time: parsed.time,
      scores: parsed.scores,
      totals: parsed.totals,
      ratings: parsed.ratings,
      netScores,
      winner,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/confirm-round', (req, res) => {
  try {
    const { course, date, time, layout, winner, scores, totals, netScores, handicaps, ratings } = req.body;
    const data = readData();
    const matched = Object.keys(scores || {});
    if (!matched.length) return res.status(400).json({ error: 'No scores provided' });
    if (!data.players[winner]) return res.status(400).json({ error: 'Invalid winner' });
    // Snapshot handicaps at time of round (before updating them)
    const savedHandicaps = handicaps || {};
    if (!handicaps) {
      const longs = isLongs(layout);
      for (const name of matched) {
        if (data.players[name]) {
          savedHandicaps[name] = (name === 'Brandon' && longs)
            ? (data.players[name].handicapLongs || 0)
            : (data.players[name].handicap || 0);
        }
      }
    }
    for (const name of matched) {
      if (data.players[name]) data.players[name].played = (data.players[name].played || 0) + 1;
    }
    data.players[winner].wins = (data.players[winner].wins || 0) + 1;
    data.players = updateHandicaps(winner, data.players);
    data.rounds.unshift({ id: uid(), date, time: time || '', course, layout, winner, scores, totals: totals || {}, netScores: netScores || {}, handicaps: savedHandicaps, ratings: ratings || {} });
    writeData(data);
    res.json({ success: true, winner, players: data.players });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/rounds', (req, res) => {
  try {
    const { course, date, time, layout, winner, scores, totals, handicaps } = req.body;
    const data = readData();
    const newRound = {
      id: uid(),
      date: date || '',
      time: time || '',
      course: course || 'Unknown',
      layout: layout || 'Shorts',
      winner: winner || '',
      scores: scores || {},
      totals: totals || {},
      netScores: {},
      handicaps: handicaps || {},
    };
    data.rounds.unshift(newRound);
    writeData(data);
    res.json({ success: true, round: newRound });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/rounds/:id', (req, res) => {
  try {
    const { id } = req.params;
    const data = readData();
    const idx = data.rounds.findIndex(r => r.id === id);
    if (idx === -1) return res.status(404).json({ error: 'Round not found' });
    data.rounds.splice(idx, 1);
    writeData(data);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/rounds/:id', (req, res) => {
  try {
    const { id } = req.params;
    const data = readData();
    const idx = data.rounds.findIndex(r => r.id === id);
    if (idx === -1) return res.status(404).json({ error: 'Round not found' });
    const { course, date, time, layout, winner, scores, totals, handicaps } = req.body;
    if (course    !== undefined) data.rounds[idx].course    = course;
    if (date      !== undefined) data.rounds[idx].date      = date;
    if (time      !== undefined) data.rounds[idx].time      = time;
    if (layout    !== undefined) data.rounds[idx].layout    = layout;
    if (winner    !== undefined) data.rounds[idx].winner    = winner;
    if (scores    !== undefined) data.rounds[idx].scores    = scores;
    if (totals    !== undefined) data.rounds[idx].totals    = totals;
    if (handicaps !== undefined) data.rounds[idx].handicaps = handicaps;
    writeData(data);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/players/:name', (req, res) => {
  try {
    const { name } = req.params;
    const data = readData();
    if (!data.players[name]) return res.status(404).json({ error: 'Player not found' });
    const { handicap, handicapLongs, wins, played } = req.body;
    if (handicap !== undefined) data.players[name].handicap = Math.min(0, Number(handicap));
    if (handicapLongs !== undefined) data.players[name].handicapLongs = Number(handicapLongs) || 0;
    if (wins !== undefined) data.players[name].wins = Math.max(0, Number(wins));
    if (played !== undefined) data.players[name].played = Math.max(0, Number(played));
    writeData(data);
    res.json({ success: true, players: data.players });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
