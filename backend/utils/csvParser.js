const { parse } = require('csv-parse/sync');

function normalizeKey(key) {
  return key.toLowerCase().replace(/\s+/g, '');
}

function parseDate(raw) {
  if (!raw) return '';
  const trimmed = raw.trim();
  // "2026-07-26 1807-0400" or "2026-07-26T..." — grab the date portion
  const isoMatch = trimmed.match(/^(\d{4}-\d{2}-\d{2})/);
  if (isoMatch) return isoMatch[1];
  // M/D/YYYY
  const parts = trimmed.split('/');
  if (parts.length === 3) {
    const [m, d, y] = parts;
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }
  return trimmed;
}

function parsePlusMinus(val) {
  if (!val || val.trim() === '' || val.trim().toUpperCase() === 'E') return 0;
  return parseInt(val, 10);
}

// RoundRating is blank for courses UDisc has no official rating for — unlike +/-,
// a blank here means "no data", not zero.
function parseRating(val) {
  if (val === undefined || val === null) return null;
  const trimmed = String(val).trim();
  if (trimmed === '') return null;
  const n = Number(trimmed);
  return Number.isFinite(n) ? n : null;
}

// Match a CSV player name against known player names.
// Handles cases like "Josh W" matching "Josh".
function matchName(csvName, knownPlayers) {
  if (!csvName) return null;
  const csv = csvName.trim();
  // 1. Exact match
  if (knownPlayers.includes(csv)) return csv;
  // 2. Known player name is the start of the CSV name ("Josh" matches "Josh W")
  const byKnownPrefix = knownPlayers.find(p => csv.toLowerCase().startsWith(p.toLowerCase() + ' ') || csv.toLowerCase() === p.toLowerCase());
  if (byKnownPrefix) return byKnownPrefix;
  // 3. CSV name is the start of the known player name
  const byCsvPrefix = knownPlayers.find(p => p.toLowerCase().startsWith(csv.toLowerCase() + ' '));
  if (byCsvPrefix) return byCsvPrefix;
  return null;
}

function parseCSV(buffer, knownPlayers = []) {
  const records = parse(buffer, { columns: true, skip_empty_lines: true, trim: true });

  if (!records.length) throw new Error('CSV is empty');

  const normalized = records.map(row => {
    const out = {};
    for (const [k, v] of Object.entries(row)) {
      out[normalizeKey(k)] = v;
    }
    return out;
  });

  // Use first non-Par row for metadata
  const metaRow = normalized[0];
  const course = metaRow['coursename'] || metaRow['course'] || '';
  const layout = metaRow['layoutname'] || metaRow['layout'] || '';
  // UDisc uses StartDate; fall back to Date
  const date = parseDate(metaRow['startdate'] || metaRow['date'] || '');

  const scores = {};
  const totals = {};
  const ratings = {};

  for (const row of normalized) {
    const csvName = row['playername'] || row['player'] || '';
    if (!csvName) continue;
    // Skip the Par row
    if (csvName.toLowerCase() === 'par') continue;

    const resolvedName = knownPlayers.length ? matchName(csvName, knownPlayers) : csvName;
    if (!resolvedName) continue;

    scores[resolvedName] = parsePlusMinus(row['+/-']);
    const total = row['total'];
    totals[resolvedName] = total ? parseInt(total, 10) : null;
    const rating = parseRating(row['roundrating']);
    if (rating !== null) ratings[resolvedName] = rating;
  }

  return { course, layout, date, scores, totals, ratings };
}

module.exports = { parseCSV, matchName };
