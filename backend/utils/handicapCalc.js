function isLongs(layoutName) {
  return /long/i.test(layoutName || '');
}

function getHandicapForRound(playerName, playerData, longs) {
  if (playerName === 'Brandon' && longs) return playerData.handicapLongs;
  return playerData.handicap;
}

function determineWinner(scores, players, longs) {
  const netScores = {};
  for (const [name, plusMinus] of Object.entries(scores)) {
    if (!players[name]) continue;
    netScores[name] = plusMinus + getHandicapForRound(name, players[name], longs);
  }

  let winner = null;
  let best = Infinity;
  for (const [name, net] of Object.entries(netScores)) {
    if (net < best) {
      best = net;
      winner = name;
    }
  }

  return { winner, netScores };
}

function updateHandicaps(winner, players) {
  const updated = JSON.parse(JSON.stringify(players));
  const anchors = Object.keys(updated).filter(n => updated[n].handicap === 0);
  const winnerIsAnchor = anchors.includes(winner);

  if (winnerIsAnchor) {
    for (const name of Object.keys(updated)) {
      if (!anchors.includes(name)) {
        updated[name].handicap -= 1;
      }
    }
  } else {
    updated[winner].handicap = Math.min(0, updated[winner].handicap + 1);
  }

  return updated;
}

module.exports = { isLongs, getHandicapForRound, determineWinner, updateHandicaps };
