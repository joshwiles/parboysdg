<template>
  <div style="min-height: 100vh; background: #152018; font-family: Inter, sans-serif;">

    <!-- Header -->
    <div style="max-width: 640px; margin: 0 auto; padding: 28px 20px 0;">
      <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 12px;">
        <div style="flex: 1;">
          <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
            <h1 style="margin: 0; font-family: Oswald, sans-serif; font-weight: 700; font-size: 30px; color: #EFE9DA; letter-spacing: 1px;">PAR BOYS</h1>
            <!-- Toast / Error badges -->
            <span
              v-if="toast"
              style="display: inline-block; padding: 3px 10px; border-radius: 999px; background: #D9A404; color: #152018; font-family: Inter, sans-serif; font-size: 12px; font-weight: 600;"
            >{{ toast }}</span>
            <span
              v-if="uploadError"
              style="font-family: Inter, sans-serif; font-size: 12px; color: #B0473E;"
            >{{ uploadError }}</span>
          </div>
          <p style="margin: 4px 0 0; font-family: Inter, sans-serif; font-size: 13px; color: rgba(239,233,218,0.6);">
            Handicaps, wins, and round history for the crew.
          </p>
        </div>
        <div style="text-align: right; flex-shrink: 0;">
          <span style="font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #D9A404; font-weight: 500;">
            {{ data.rounds.length }} rounds logged
          </span>
        </div>
      </div>
    </div>

    <!-- Chain Divider -->
    <div style="max-width: 640px; margin: 18px auto 0; padding: 0 20px; overflow: hidden;">
      <ChainDivider />
    </div>

    <!-- Tabs -->
    <div style="max-width: 640px; margin: 0 auto; padding: 0 20px;">
      <div style="display: flex; border-bottom: 1px solid rgba(201,205,196,0.13); margin-top: 4px;">
        <button
          v-for="[id, label] in tabs"
          :key="id"
          @click="activeTab = id"
          :style="{
            padding: '10px 16px',
            fontFamily: 'Oswald, sans-serif',
            fontSize: '13px',
            fontWeight: '600',
            letterSpacing: '0.5px',
            background: activeTab === id ? '#1F3327' : 'transparent',
            color: activeTab === id ? '#EFE9DA' : 'rgba(239,233,218,0.5)',
            border: 'none',
            borderBottom: activeTab === id ? '2px solid #D9A404' : '2px solid transparent',
            cursor: 'pointer',
            transition: 'all 0.15s',
          }"
        >{{ label }}</button>
      </div>
    </div>

    <!-- Loading -->
    <div
      v-if="loading"
      style="display: flex; justify-content: center; align-items: center; padding: 80px 20px;"
    >
      <span style="font-family: Inter, sans-serif; font-size: 13px; color: #EFE9DA;">Loading scorecard…</span>
    </div>

    <!-- Main Content -->
    <div v-else style="max-width: 640px; margin: 0 auto; padding: 20px 20px 48px;">

      <!-- ── LEADERBOARD ── -->
      <div v-if="activeTab === 'board'">
        <!-- Empty state -->
        <div
          v-if="playerStats.length === 0"
          style="border: 1px dashed rgba(201,205,196,0.3); border-radius: 6px; padding: 40px 20px; text-align: center;"
        >
          <div style="font-size: 28px; margin-bottom: 10px;">⛳</div>
          <p style="margin: 0 0 6px; font-family: Oswald, sans-serif; font-size: 15px; color: #EFE9DA; font-weight: 600;">No players yet</p>
          <p style="margin: 0; font-family: Inter, sans-serif; font-size: 13px; color: rgba(239,233,218,0.5);">Upload a UDisc CSV to get started.</p>
        </div>

        <!-- Leaderboard card -->
        <div
          v-else
          style="background: #1F3327; border: 1px solid rgba(201,205,196,0.13); border-radius: 6px; overflow: hidden;"
        >
          <!-- Column header -->
          <div style="
            display: grid;
            grid-template-columns: 28px 1.5fr 0.7fr 0.7fr 0.8fr;
            gap: 0;
            padding: 10px 16px;
            border-bottom: 1px solid rgba(201,205,196,0.1);
          ">
            <span style="font-family: Oswald, sans-serif; font-size: 11px; color: #D9A404; font-weight: 600;">#</span>
            <span style="font-family: Oswald, sans-serif; font-size: 11px; color: #D9A404; font-weight: 600;">PLAYER</span>
            <span style="font-family: Oswald, sans-serif; font-size: 11px; color: #D9A404; font-weight: 600;">W / PLAYED</span>
            <span style="font-family: Oswald, sans-serif; font-size: 11px; color: #D9A404; font-weight: 600;">WIN%</span>
            <span style="font-family: Oswald, sans-serif; font-size: 11px; color: #D9A404; font-weight: 600;">HCP</span>
          </div>

          <!-- Player rows -->
          <div
            v-for="(player, idx) in playerStats"
            :key="player.name"
            :style="{
              display: 'grid',
              gridTemplateColumns: '28px 1.5fr 0.7fr 0.7fr 0.8fr',
              gap: '0',
              padding: '12px 16px',
              alignItems: 'center',
              background: player.isAnchor ? 'rgba(217,164,4,0.14)' : 'transparent',
              borderTop: idx > 0 ? '1px solid rgba(201,205,196,0.08)' : 'none',
            }"
          >
            <!-- Rank -->
            <span style="font-family: 'JetBrains Mono', monospace; font-size: 12px; color: rgba(239,233,218,0.5);">
              {{ idx + 1 }}
            </span>

            <!-- Name -->
            <span style="font-family: Inter, sans-serif; font-weight: 600; font-size: 14px; color: #EFE9DA;">
              {{ player.name }}
            </span>

            <!-- W / Played -->
            <span style="font-family: 'JetBrains Mono', monospace; font-size: 13px; color: rgba(239,233,218,0.8);">
              {{ player.wins }}/{{ player.played }}
            </span>

            <!-- Win % -->
            <span style="font-family: 'JetBrains Mono', monospace; font-size: 13px; color: rgba(239,233,218,0.8);">
              {{ player.winPct }}%
            </span>

            <!-- Handicap -->
            <div>
              <span
                :style="{
                  fontFamily: '\'JetBrains Mono\', monospace',
                  fontWeight: '700',
                  fontSize: '13px',
                  color: player.handicap === null || player.handicap === undefined
                    ? 'rgba(239,233,218,0.3)'
                    : player.handicap <= 0
                      ? '#3E6B49'
                      : '#D9A404',
                }"
              >
                {{ formatHcp(player.handicap) }}
              </span>
              <div
                v-if="player.handicapLongs"
                style="font-family: 'JetBrains Mono', monospace; font-size: 10px; color: rgba(239,233,218,0.5); margin-top: 2px;"
              >
                longs +{{ player.handicapLongs }}
              </div>
            </div>
          </div>

          <!-- Footer note -->
          <div style="padding: 10px 16px; border-top: 1px solid rgba(201,205,196,0.08);">
            <p style="margin: 0; font-family: Inter, sans-serif; font-size: 11px; color: rgba(239,233,218,0.7); line-height: 1.5;">
              Handicap adjusts after each round — anchor player wins → everyone else drops 1. Non-anchor wins → winner gains 1 toward 0.
            </p>
          </div>
        </div>
      </div>

      <!-- ── ROUNDS ── -->
      <div v-if="activeTab === 'rounds'">
        <!-- Empty state (no rounds at all OR none with scores) -->
        <div
          v-if="data.rounds.length === 0"
          style="border: 1px dashed rgba(201,205,196,0.3); border-radius: 6px; padding: 40px 20px; text-align: center;"
        >
          <div style="font-size: 28px; margin-bottom: 10px;">📋</div>
          <p style="margin: 0 0 6px; font-family: Oswald, sans-serif; font-size: 15px; color: #EFE9DA; font-weight: 600;">No rounds logged</p>
          <p style="margin: 0; font-family: Inter, sans-serif; font-size: 13px; color: rgba(239,233,218,0.5);">Upload a UDisc CSV to see rounds here.</p>
        </div>

        <div v-else style="display: flex; flex-direction: column; gap: 10px;">
          <div
            v-for="(round, i) in data.rounds"
            :key="i"
            style="background: #1F3327; border: 1px solid rgba(201,205,196,0.13); border-radius: 6px; padding: 16px;"
          >
            <!-- Top row: course + date/layout -->
            <div style="display: flex; align-items: baseline; justify-content: space-between; gap: 8px; flex-wrap: wrap;">
              <span style="font-family: Oswald, sans-serif; font-size: 16px; color: #EFE9DA; font-weight: 600;">
                {{ round.course }}
              </span>
              <div style="display: flex; gap: 8px; align-items: baseline; flex-shrink: 0;">
                <span style="font-family: 'JetBrains Mono', monospace; font-size: 11.5px; color: rgba(239,233,218,0.5);">
                  {{ formatDate(round.date) }}
                </span>
                <span
                  v-if="round.layout"
                  style="font-family: 'JetBrains Mono', monospace; font-size: 11.5px; color: rgba(239,233,218,0.5);"
                >
                  · {{ round.layout }}
                </span>
              </div>
            </div>

            <!-- Winner -->
            <div style="margin-top: 8px;">
              <span style="font-family: Oswald, sans-serif; font-size: 13px; color: #D9A404;">
                🏆 {{ round.winner }}
              </span>
            </div>

            <!-- Scores (only if round has scores) -->
            <div
              v-if="round.scores && Object.keys(round.scores).length > 0"
              style="margin-top: 10px; display: flex; flex-direction: column; gap: 4px;"
            >
              <div
                v-for="[name, score] in sortedScores(round.scores)"
                :key="name"
                style="display: flex; align-items: baseline; justify-content: space-between;"
              >
                <span
                  :style="{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '13px',
                    color: name === round.winner ? '#D9A404' : 'rgba(239,233,218,0.75)',
                    fontWeight: name === round.winner ? '600' : '400',
                  }"
                >{{ name }}</span>
                <div style="display: flex; align-items: baseline; gap: 8px;">
                  <span
                    :style="{
                      fontFamily: '\'JetBrains Mono\', monospace',
                      fontSize: '13px',
                      color: name === round.winner ? '#D9A404' : 'rgba(239,233,218,0.75)',
                    }"
                  >{{ formatScore(score) }}</span>
                  <span
                    v-if="round.totals && round.totals[name] !== undefined"
                    style="font-family: 'JetBrains Mono', monospace; font-size: 11px; color: rgba(239,233,218,0.35);"
                  >({{ round.totals[name] }})</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ── PLAYERS ── -->
      <div v-if="activeTab === 'players'">
        <div style="background: #1F3327; border: 1px solid rgba(201,205,196,0.13); border-radius: 6px; overflow: hidden;">
          <div style="padding: 10px 16px; border-bottom: 1px solid rgba(201,205,196,0.1);">
            <span style="font-family: Oswald, sans-serif; font-size: 11px; color: #D9A404; font-weight: 600; letter-spacing: 0.6px;">LONGS HANDICAP</span>
          </div>
          <div
            v-for="(pdata, name) in data.players"
            :key="name"
            style="display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; border-top: 1px solid rgba(201,205,196,0.08);"
          >
            <span style="font-family: Inter, sans-serif; font-weight: 600; font-size: 14px; color: #EFE9DA;">{{ name }}</span>
            <input
              type="number"
              step="1"
              :placeholder="'0'"
              :defaultValue="pdata.handicapLongs ?? 0"
              :value="pdata.handicapLongs ?? 0"
              @change="e => saveLongs(name, e.target.value)"
              @keydown.enter="e => e.target.blur()"
              style="
                width: 72px;
                padding: 6px 10px;
                font-family: 'JetBrains Mono', monospace;
                font-size: 13px;
                font-weight: 700;
                background: #152018;
                border: 1px solid rgba(201,205,196,0.2);
                border-radius: 4px;
                color: #EFE9DA;
                text-align: center;
              "
            />
          </div>
          <div style="padding: 10px 16px; border-top: 1px solid rgba(201,205,196,0.08);">
            <p style="margin: 0; font-family: Inter, sans-serif; font-size: 11px; color: rgba(239,233,218,0.5); line-height: 1.5;">
              Longs handicap is used for net score calculation on long course layouts. Set to 0 to disable.
            </p>
          </div>
        </div>
      </div>

      <!-- ── UPLOAD ── -->
      <div v-if="activeTab === 'upload'">
        <div style="background: #1F3327; border: 1px solid rgba(201,205,196,0.13); border-radius: 6px; padding: 20px;">
          <p style="margin: 0 0 4px; font-family: Oswald, sans-serif; font-size: 11px; color: #D9A404; letter-spacing: 0.6px; font-weight: 600;">
            UPLOAD ROUND
          </p>
          <p style="margin: 0 0 18px; font-family: Inter, sans-serif; font-size: 13px; color: rgba(239,233,218,0.7); line-height: 1.5;">
            Export your scorecard from UDisc (CSV) and upload it here. Handicaps and wins update automatically.
          </p>

          <button
            @click="triggerUpload"
            :disabled="uploading"
            :style="{
              width: '100%',
              padding: '10px 14px',
              fontFamily: 'Oswald, sans-serif',
              fontSize: '13px',
              letterSpacing: '0.4px',
              background: uploading ? 'rgba(217,164,4,0.6)' : '#D9A404',
              border: 'none',
              borderRadius: '4px',
              color: '#152018',
              cursor: uploading ? 'not-allowed' : 'pointer',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }"
          >
            <svg
              v-if="uploading"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              style="animation: spin 0.8s linear infinite;"
            >
              <circle cx="12" cy="12" r="10" stroke="#152018" stroke-width="3" stroke-opacity="0.25" />
              <path d="M4 12a8 8 0 018-8" stroke="#152018" stroke-width="3" stroke-linecap="round" />
            </svg>
            {{ uploading ? 'UPLOADING…' : 'CHOOSE CSV FILE' }}
          </button>

          <input
            ref="fileInput"
            type="file"
            accept=".csv"
            style="display: none;"
            @change="handleFileChange"
          />

          <!-- Upload result -->
          <div
            v-if="uploadResult"
            style="margin-top: 16px; background: #152018; border: 1px solid rgba(201,205,196,0.13); border-radius: 6px; padding: 14px;"
          >
            <p style="margin: 0 0 8px; font-family: Oswald, sans-serif; font-size: 13px; color: #D9A404; font-weight: 600;">
              🏆 {{ uploadResult.winner }}
            </p>
            <div
              v-if="uploadResult.netScores"
              style="display: flex; flex-direction: column; gap: 3px;"
            >
              <div
                v-for="[name, score] in Object.entries(uploadResult.netScores)"
                :key="name"
                style="display: flex; justify-content: space-between;"
              >
                <span style="font-family: Inter, sans-serif; font-size: 12px; color: rgba(239,233,218,0.7);">{{ name }}</span>
                <span style="font-family: 'JetBrains Mono', monospace; font-size: 12px; color: rgba(239,233,218,0.7);">{{ formatScore(score) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
import ChainDivider from './components/ChainDivider.vue';

const API = import.meta.env.VITE_API_URL || '';

const data = ref({ players: {}, rounds: [] });
const loading = ref(true);
const uploading = ref(false);
const toast = ref('');
const uploadError = ref('');
const uploadResult = ref(null);
const fileInput = ref(null);
const activeTab = ref('board');

const tabs = [
  ['board', 'Leaderboard'],
  ['rounds', 'Rounds'],
  ['upload', 'Upload CSV'],
  ['players', 'Players'],
];

async function fetchData() {
  const res = await axios.get(`${API}/api/data`);
  if (res.data?.players) data.value = res.data;
}

onMounted(async () => {
  try {
    await fetchData();
  } finally {
    loading.value = false;
  }
});

function triggerUpload() {
  uploadError.value = '';
  toast.value = '';
  fileInput.value.click();
}

async function handleFileChange(e) {
  const file = e.target.files[0];
  if (!file) return;
  uploading.value = true;
  uploadError.value = '';
  toast.value = '';
  uploadResult.value = null;
  try {
    const form = new FormData();
    form.append('csv', file);
    const res = await axios.post(`${API}/api/upload`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    await fetchData();
    uploadResult.value = res.data;
    toast.value = `Round uploaded! ${res.data.winner} wins!`;
    setTimeout(() => { toast.value = ''; }, 5000);
  } catch (err) {
    uploadError.value = err.response?.data?.error || 'Upload failed';
    setTimeout(() => { uploadError.value = ''; }, 5000);
  } finally {
    uploading.value = false;
    fileInput.value.value = '';
  }
}

const playerStats = computed(() => {
  return Object.entries(data.value.players)
    .map(([name, p]) => {
      const played = data.value.rounds.filter(r => r.scores && r.scores[name] !== undefined).length;
      const wins = p.wins || 0;
      const winPct = played ? Math.round((wins / played) * 100) : 0;
      return {
        name,
        handicap: p.handicap,
        handicapLongs: p.handicapLongs,
        wins,
        played,
        winPct,
        isAnchor: p.handicap === 0,
      };
    })
    .sort((a, b) => b.wins - a.wins || b.handicap - a.handicap);
});

function formatDate(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${parseInt(m)}/${parseInt(d)}/${y.slice(2)}`;
}

function formatScore(val) {
  if (val === null || val === undefined) return '—';
  if (val === 0) return 'E';
  return val > 0 ? `+${val}` : `${val}`;
}

function formatHcp(val) {
  if (val === null || val === undefined) return '—';
  if (val === 0) return '0';
  return val > 0 ? `+${val}` : `${val}`;
}

async function saveLongs(name, value) {
  try {
    await axios.patch(`${API}/api/players/${encodeURIComponent(name)}/longs`, { handicapLongs: value });
    await fetchData();
  } catch (err) {
    uploadError.value = err.response?.data?.error || 'Failed to save';
    setTimeout(() => { uploadError.value = ''; }, 4000);
  }
}

function sortedScores(scores) {
  return Object.entries(scores).sort((a, b) => a[1] - b[1]);
}
</script>

<style>
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>

