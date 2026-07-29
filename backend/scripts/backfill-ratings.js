// One-time backfill: patch UDisc RoundRating into already-recorded rounds from
// their original CSV exports. Only ever touches round.ratings — never scores,
// totals, netScores, handicaps, winner, or any player counters.
//
// Usage:
//   node backfill-ratings.js <folder-of-csvs>            (dry run — prints a summary)
//   node backfill-ratings.js <folder-of-csvs> --apply     (writes gameData.json)

const fs = require('fs');
const path = require('path');
const { parseCSV, matchName } = require('../utils/csvParser');

const DATA_FILE = path.join(__dirname, '../data/gameData.json');

const args = process.argv.slice(2);
const apply = args.includes('--apply');
const folder = args.find(a => a !== '--apply');

if (!folder) {
  console.error('Usage: node backfill-ratings.js <folder-of-csvs> [--apply]');
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
const csvFiles = fs.readdirSync(folder).filter(f => f.toLowerCase().endsWith('.csv'));

if (!csvFiles.length) {
  console.error(`No CSV files found in ${folder}`);
  process.exit(1);
}

let totalRoundsMatched = 0;
let totalRoundsUnmatched = 0;
let totalRatingsAdded = 0;

for (const file of csvFiles) {
  const fullPath = path.join(folder, file);
  const buffer = fs.readFileSync(fullPath);
  let parsed;
  try {
    parsed = parseCSV(buffer, []); // no knownPlayers filter — keep raw CSV names
  } catch (err) {
    console.log(`\n${file}\n  SKIPPED — failed to parse: ${err.message}`);
    continue;
  }

  const candidates = data.rounds.filter(r =>
    r.date === parsed.date &&
    (r.course || '').trim().toLowerCase() === (parsed.course || '').trim().toLowerCase()
  );

  console.log(`\n${file}`);
  console.log(`  ${parsed.date}  ${parsed.course} (${parsed.layout})`);

  if (candidates.length === 0) {
    console.log('  UNMATCHED — no round in gameData.json for this date + course');
    totalRoundsUnmatched++;
    continue;
  }
  if (candidates.length > 1) {
    console.log(`  AMBIGUOUS — ${candidates.length} rounds match this date + course, skipping (resolve manually)`);
    totalRoundsUnmatched++;
    continue;
  }

  const round = candidates[0];
  totalRoundsMatched++;

  const ratedCsvNames = Object.keys(parsed.ratings);
  if (!ratedCsvNames.length) {
    console.log(`  matched round ${round.id} — no RoundRating data in this CSV (unrated course), nothing to add`);
    continue;
  }

  let unmatchedRoundPlayers = Object.keys(round.scores || {});
  let unmatchedCsvNames = [...ratedCsvNames];
  const resolved = {};
  const fuzzyMatches = [];

  // Pass 1: direct/prefix name matching (same heuristic as live CSV upload)
  for (const csvName of ratedCsvNames) {
    const match = matchName(csvName, unmatchedRoundPlayers);
    if (match) {
      resolved[match] = parsed.ratings[csvName];
      unmatchedRoundPlayers = unmatchedRoundPlayers.filter(p => p !== match);
      unmatchedCsvNames = unmatchedCsvNames.filter(n => n !== csvName);
    }
  }

  // Pass 2: elimination match for exactly one leftover on each side (e.g. nickname mismatches)
  if (unmatchedCsvNames.length === 1 && unmatchedRoundPlayers.length === 1) {
    const csvName = unmatchedCsvNames[0];
    const roundPlayer = unmatchedRoundPlayers[0];
    resolved[roundPlayer] = parsed.ratings[csvName];
    fuzzyMatches.push(`${csvName} -> ${roundPlayer}`);
    unmatchedCsvNames = [];
    unmatchedRoundPlayers = [];
  }

  for (const [name, rating] of Object.entries(resolved)) {
    console.log(`  matched round ${round.id} — ${name}: ${rating}`);
    totalRatingsAdded++;
  }
  if (fuzzyMatches.length) {
    console.log(`  ELIMINATION MATCH (verify): ${fuzzyMatches.join(', ')}`);
  }
  if (unmatchedCsvNames.length || unmatchedRoundPlayers.length) {
    console.log(`  UNRESOLVED — csv names left over: [${unmatchedCsvNames.join(', ')}], round players left over: [${unmatchedRoundPlayers.join(', ')}] (skipped, not guessed)`);
  }

  if (apply && Object.keys(resolved).length) {
    round.ratings = { ...(round.ratings || {}), ...resolved };
  }
}

console.log(`\n${'-'.repeat(50)}`);
console.log(`Rounds matched: ${totalRoundsMatched}   Unmatched: ${totalRoundsUnmatched}   Ratings added: ${totalRatingsAdded}`);

if (apply) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2) + '\n', 'utf8');
  console.log(`\nWrote changes to ${DATA_FILE}`);
} else {
  console.log('\nDRY RUN — no changes written. Re-run with --apply to write changes.');
}
