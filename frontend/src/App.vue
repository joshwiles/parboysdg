<template>
  <div id="app" class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="text-white px-6 py-5 shadow-lg" style="background-color: #1a4731;">
      <div class="max-w-5xl mx-auto flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-extrabold tracking-tight">Par Boys</h1>
          <p class="text-green-300 text-sm mt-0.5">Disc Golf Tracker</p>
        </div>
        <div class="flex items-center gap-3">
          <span v-if="toast" class="text-sm font-medium px-3 py-1 rounded-full bg-yellow-400 text-yellow-900">
            {{ toast }}
          </span>
          <span v-if="uploadError" class="text-sm font-medium px-3 py-1 rounded-full bg-red-400 text-red-900">
            {{ uploadError }}
          </span>
          <button
            @click="triggerUpload"
            :disabled="uploading"
            class="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all"
            style="background-color: #2d7a4f; color: white;"
            :class="uploading ? 'opacity-60 cursor-not-allowed' : 'hover:brightness-110'"
          >
            <svg v-if="uploading" class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M12 12V4m0 0L8 8m4-4l4 4" />
            </svg>
            {{ uploading ? 'Uploading...' : 'Upload CSV' }}
          </button>
          <input ref="fileInput" type="file" accept=".csv" class="hidden" @change="handleFileChange" />
        </div>
      </div>
    </header>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center py-32">
      <svg class="animate-spin h-10 w-10 text-green-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
      </svg>
    </div>

    <main v-else class="max-w-5xl mx-auto px-6 py-8 space-y-10">

      <!-- Handicaps -->
      <section>
        <h2 class="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span class="inline-block w-1 h-5 rounded" style="background-color: #1a4731;"></span>
          Handicaps
        </h2>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div
            v-for="(pdata, name) in data.players"
            :key="name"
            class="rounded-xl p-4 shadow-sm border-2 transition-all"
            :class="pdata.handicap === 0 ? 'border-yellow-400 bg-yellow-50' : 'border-gray-100 bg-white'"
          >
            <div class="flex items-start justify-between">
              <p class="font-bold text-gray-800 text-lg">{{ name }}</p>
              <span v-if="pdata.handicap === 0" class="text-yellow-500 text-lg" title="Anchor">⚓</span>
            </div>
            <p class="text-3xl font-extrabold mt-1" :class="pdata.handicap === 0 ? 'text-yellow-600' : 'text-green-700'">
              {{ pdata.handicap > 0 ? '+' + pdata.handicap : pdata.handicap }}
            </p>
            <p v-if="pdata.handicapLongs !== undefined" class="text-xs text-gray-500 mt-1">
              Longs: <span class="font-semibold text-gray-700">+{{ pdata.handicapLongs }}</span>
            </p>
          </div>
        </div>
      </section>

      <!-- Wins -->
      <section>
        <h2 class="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span class="inline-block w-1 h-5 rounded" style="background-color: #1a4731;"></span>
          Wins
        </h2>
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div class="flex divide-x divide-gray-100">
            <div
              v-for="(player, i) in sortedByWins"
              :key="player.name"
              class="flex-1 flex flex-col items-center py-5 px-2"
              :class="i === 0 ? 'bg-yellow-50' : ''"
            >
              <span v-if="i === 0" class="text-2xl mb-1">🏆</span>
              <p class="font-semibold text-gray-700 text-sm">{{ player.name }}</p>
              <p class="text-3xl font-extrabold mt-1" :class="i === 0 ? 'text-yellow-600' : 'text-gray-800'">
                {{ player.wins }}
              </p>
              <p class="text-xs text-gray-400 mt-0.5">{{ player.wins === 1 ? 'win' : 'wins' }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Rounds -->
      <section>
        <h2 class="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span class="inline-block w-1 h-5 rounded" style="background-color: #1a4731;"></span>
          Rounds
        </h2>
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr style="background-color: #1a4731;" class="text-white">
                  <th class="text-left px-4 py-3 font-semibold">Date</th>
                  <th class="text-left px-4 py-3 font-semibold">Course</th>
                  <th class="text-left px-4 py-3 font-semibold">Layout</th>
                  <th class="text-left px-4 py-3 font-semibold">Winner</th>
                  <th class="text-left px-4 py-3 font-semibold">Scores</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(round, i) in data.rounds"
                  :key="i"
                  :class="i % 2 === 0 ? 'bg-white' : 'bg-gray-50'"
                  class="border-t border-gray-100 hover:bg-green-50 transition-colors"
                >
                  <td class="px-4 py-3 text-gray-600 whitespace-nowrap">{{ formatDate(round.date) }}</td>
                  <td class="px-4 py-3 font-medium text-gray-800">{{ round.course }}</td>
                  <td class="px-4 py-3 text-gray-600">{{ round.layout }}</td>
                  <td class="px-4 py-3">
                    <span class="font-semibold text-green-800">{{ round.winner }}</span>
                  </td>
                  <td class="px-4 py-3 text-gray-500">{{ formatScores(round.scores) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || '';

const data = ref({ players: {}, rounds: [] });
const loading = ref(true);
const uploading = ref(false);
const toast = ref('');
const uploadError = ref('');
const fileInput = ref(null);

async function fetchData() {
  const res = await axios.get(`${API}/api/data`);
  if (res.data?.players) {
    data.value = res.data;
  }
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
  try {
    const form = new FormData();
    form.append('csv', file);
    const res = await axios.post(`${API}/api/upload`, form, { headers: { 'Content-Type': 'multipart/form-data' } });
    await fetchData();
    toast.value = `Round uploaded! ${res.data.winner} wins!`;
    setTimeout(() => { toast.value = ''; }, 5000);
  } catch (err) {
    uploadError.value = err.response?.data?.error || 'Upload failed';
    setTimeout(() => { uploadError.value = ''; }, 6000);
  } finally {
    uploading.value = false;
    fileInput.value.value = '';
  }
}

const sortedByWins = computed(() => {
  return Object.entries(data.value.players)
    .map(([name, p]) => ({ name, wins: p.wins || 0 }))
    .sort((a, b) => b.wins - a.wins);
});

function formatDate(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${parseInt(m)}/${parseInt(d)}/${y.slice(2)}`;
}

function formatScores(scores) {
  if (!scores || !Object.keys(scores).length) return '—';
  return Object.entries(scores)
    .map(([name, val]) => {
      const display = val === 0 ? 'E' : val > 0 ? `+${val}` : `${val}`;
      return `${name}: ${display}`;
    })
    .join(', ');
}
</script>

<style>
body {
  margin: 0;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
}
</style>
