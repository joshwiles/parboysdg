const { parse } = require('csv-parse/sync');

function normalizeKey(key) {
  return key.toLowerCase().replace(/\s+/g, '');
}

function parseDate(raw) {
  if (!raw) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw.trim())) return raw.trim();
  const parts = raw.trim().split('/');
  if (parts.length === 3) {
    const [m, d, y] = parts;
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }
  return raw.trim();
}

function parsePlusMinus(val) {
  if (!val || val.trim() === '' || val.trim().toUpperCase() === 'E') return 0;
  return parseInt(val, 10);
}

function parseCSV(buffer) {
  const records = parse(buffer, { columns: true, skip_empty_lines: true, trim: true });

  if (!records.length) throw new Error('CSV is empty');

  const normalized = records.map(row => {
    const out = {};
    for (const [k, v] of Object.entries(row)) {
      out[normalizeKey(k)] = v;
    }
    return out;
  });

  const first = normalized[0];
  const course = first['coursename'] || first['course'] || '';
  const layout = first['layoutname'] || first['layout'] || '';
  const date = parseDate(first['date'] || '');

  const scores = {};
  const totals = {};

  for (const row of normalized) {
    const name = row['playername'] || row['player'] || '';
    if (!name) continue;
    scores[name] = parsePlusMinus(row['+/-']);
    const total = row['total'];
    totals[name] = total ? parseInt(total, 10) : null;
  }

  return { course, layout, date, scores, totals };
}

module.exports = { parseCSV };
