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
        <div
          v-if="data.rounds.length === 0"
          style="border: 1px dashed rgba(201,205,196,0.3); border-radius: 6px; padding: 40px 20px; text-align: center;"
        >
          <p style="margin: 0 0 6px; font-family: Oswald, sans-serif; font-size: 15px; color: #EFE9DA; font-weight: 600;">No rounds logged</p>
          <p style="margin: 0; font-family: Inter, sans-serif; font-size: 13px; color: rgba(239,233,218,0.5);">Upload a UDisc CSV to see rounds here.</p>
        </div>

        <!-- New round button -->
        <div style="display: flex; justify-content: flex-end; margin-bottom: 10px;">
          <button @click="startNewRound" :style="{ ...saveBtn, width: 'auto', padding: '7px 16px' }">+ New Round</button>
        </div>

        <!-- New round form -->
        <div v-if="editingRound === '__new__'" style="background: #1F3327; border: 1px solid rgba(201,205,196,0.13); border-radius: 6px; padding: 16px; margin-bottom: 8px;">
          <div style="font-family: Oswald, sans-serif; font-size: 11px; color: #D9A404; letter-spacing: 0.5px; margin-bottom: 12px;">NEW ROUND</div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 12px;">
            <div>
              <div style="font-family: Oswald, sans-serif; font-size: 10px; color: #D9A404; letter-spacing: 0.5px; margin-bottom: 5px;">COURSE</div>
              <input type="text" v-model="roundEditForm.course" :style="editInput" />
            </div>
            <div>
              <div style="font-family: Oswald, sans-serif; font-size: 10px; color: #D9A404; letter-spacing: 0.5px; margin-bottom: 5px;">DATE</div>
              <input type="date" v-model="roundEditForm.date" :style="editInput" />
            </div>
            <div>
              <div style="font-family: Oswald, sans-serif; font-size: 10px; color: #D9A404; letter-spacing: 0.5px; margin-bottom: 5px;">LAYOUT</div>
              <select v-model="roundEditForm.layout" :style="editInput">
                <option>Shorts</option>
                <option>Longs</option>
              </select>
            </div>
            <div>
              <div style="font-family: Oswald, sans-serif; font-size: 10px; color: #D9A404; letter-spacing: 0.5px; margin-bottom: 5px;">WINNER</div>
              <select v-model="roundEditForm.winner" :style="editInput">
                <option value="">— select —</option>
                <option v-for="name in Object.keys(data.players)" :key="name">{{ name }}</option>
              </select>
            </div>
          </div>
          <div style="font-family: Oswald, sans-serif; font-size: 10px; color: #D9A404; letter-spacing: 0.5px; margin-bottom: 8px;">SCORES (+/- to par · total strokes)</div>
          <div style="display: flex; flex-direction: column; gap: 7px; margin-bottom: 14px;">
            <div v-for="name in Object.keys(data.players)" :key="name" style="display: grid; grid-template-columns: 1fr 80px 80px; gap: 8px; align-items: center;">
              <span style="font-family: Inter, sans-serif; font-size: 13px; color: rgba(239,233,218,0.8);">{{ name }}</span>
              <input type="number" placeholder="+/-" v-model="roundEditForm.scores[name]" :style="{ ...editInput, textAlign: 'center', marginBottom: 0 }" />
              <input type="number" placeholder="total" v-model="roundEditForm.totals[name]" :style="{ ...editInput, textAlign: 'center', marginBottom: 0 }" />
            </div>
          </div>
          <div style="display: flex; gap: 8px;">
            <button @click="saveRound('__new__')" :style="saveBtn">Create Round</button>
            <button @click="editingRound = null" :style="cancelBtn">Cancel</button>
          </div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 8px;">
          <div
            v-for="round in data.rounds"
            :key="round.id"
            style="background: #1F3327; border: 1px solid rgba(201,205,196,0.13); border-radius: 6px; overflow: hidden;"
          >
            <!-- ── EDIT MODE ── -->
            <div v-if="editingRound === round.id" style="padding: 16px;">
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 12px;">
                <div>
                  <div style="font-family: Oswald, sans-serif; font-size: 10px; color: #D9A404; letter-spacing: 0.5px; margin-bottom: 5px;">COURSE</div>
                  <input type="text" v-model="roundEditForm.course" :style="editInput" />
                </div>
                <div>
                  <div style="font-family: Oswald, sans-serif; font-size: 10px; color: #D9A404; letter-spacing: 0.5px; margin-bottom: 5px;">DATE</div>
                  <input type="date" v-model="roundEditForm.date" :style="editInput" />
                </div>
                <div>
                  <div style="font-family: Oswald, sans-serif; font-size: 10px; color: #D9A404; letter-spacing: 0.5px; margin-bottom: 5px;">LAYOUT</div>
                  <select v-model="roundEditForm.layout" :style="editInput">
                    <option>Shorts</option>
                    <option>Longs</option>
                  </select>
                </div>
                <div>
                  <div style="font-family: Oswald, sans-serif; font-size: 10px; color: #D9A404; letter-spacing: 0.5px; margin-bottom: 5px;">WINNER</div>
                  <select v-model="roundEditForm.winner" :style="editInput">
                    <option v-for="name in Object.keys(data.players)" :key="name">{{ name }}</option>
                  </select>
                </div>
              </div>

              <div style="font-family: Oswald, sans-serif; font-size: 10px; color: #D9A404; letter-spacing: 0.5px; margin-bottom: 8px;">SCORES (+/- to par · total strokes)</div>
              <div style="display: flex; flex-direction: column; gap: 7px; margin-bottom: 14px;">
                <div
                  v-for="name in Object.keys(data.players)"
                  :key="name"
                  style="display: grid; grid-template-columns: 1fr 80px 80px; gap: 8px; align-items: center;"
                >
                  <span style="font-family: Inter, sans-serif; font-size: 13px; color: rgba(239,233,218,0.8);">{{ name }}</span>
                  <input type="number" :placeholder="'+/-'" v-model="roundEditForm.scores[name]" :style="{ ...editInput, textAlign: 'center', marginBottom: 0 }" />
                  <input type="number" :placeholder="'total'" v-model="roundEditForm.totals[name]" :style="{ ...editInput, textAlign: 'center', marginBottom: 0 }" />
                </div>
              </div>

              <div style="display: flex; gap: 8px; align-items: center;">
                <button @click="saveRound(round.id)" :style="saveBtn">Save</button>
                <button @click="editingRound = null" :style="cancelBtn">Cancel</button>
                <button @click="deleteRound(round.id)" :style="{ ...cancelBtn, marginLeft: 'auto', color: '#B0473E', borderColor: 'rgba(176,71,62,0.3)' }">Delete</button>
              </div>
            </div>

            <!-- ── VIEW MODE ── -->
            <template v-else>
              <!-- Header row (always visible, clickable to expand) -->
              <div
                style="display: flex; align-items: center; gap: 12px; padding: 13px 16px; cursor: pointer; user-select: none;"
                @click="toggleRound(round.id)"
              >
                <!-- Chevron -->
                <svg
                  :style="{ transform: expandedRounds[round.id] ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.15s', flexShrink: 0 }"
                  width="14" height="14" viewBox="0 0 24 24" fill="none"
                >
                  <path d="M9 18l6-6-6-6" stroke="rgba(201,205,196,0.5)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>

                <!-- Course -->
                <span style="font-family: Oswald, sans-serif; font-size: 15px; color: #EFE9DA; font-weight: 600; flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                  {{ round.course || 'Unknown' }}
                </span>

                <!-- Winner -->
                <span style="font-family: Inter, sans-serif; font-size: 13px; color: #D9A404; font-weight: 600; flex-shrink: 0;">
                  🏆 {{ round.winner || '—' }}
                </span>

                <!-- Date -->
                <span style="font-family: 'JetBrains Mono', monospace; font-size: 11px; color: rgba(239,233,218,0.45); flex-shrink: 0;">
                  {{ round.date ? formatDate(round.date) : '—' }}
                </span>

                <!-- Layout badge -->
                <span style="font-family: 'JetBrains Mono', monospace; font-size: 10px; padding: 2px 7px; border-radius: 3px; flex-shrink: 0;"
                  :style="{ background: round.layout === 'Longs' ? 'rgba(217,164,4,0.2)' : 'rgba(201,205,196,0.1)', color: round.layout === 'Longs' ? '#D9A404' : 'rgba(201,205,196,0.6)' }">
                  {{ round.layout || 'Shorts' }}
                </span>

                <!-- Edit button -->
                <button
                  @click.stop="startEditRound(round)"
                  :style="{ ...ghostEditBtn, flexShrink: 0 }"
                >Edit</button>
              </div>

              <!-- Expanded scores -->
              <div
                v-if="expandedRounds[round.id]"
                style="border-top: 1px solid rgba(201,205,196,0.08); padding: 12px 16px 14px 42px;"
              >
                <div
                  v-if="!round.scores || Object.keys(round.scores).length === 0"
                  style="font-family: Inter, sans-serif; font-size: 12px; color: rgba(239,233,218,0.35); font-style: italic;"
                >
                  No scores recorded — click Edit to add them.
                </div>
                <div v-else style="display: flex; flex-direction: column; gap: 5px;">
                  <div
                    v-for="[name, score] in sortedScores(round.scores)"
                    :key="name"
                    style="display: flex; align-items: baseline; justify-content: space-between;"
                  >
                    <span :style="{ fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: name === round.winner ? '600' : '400', color: name === round.winner ? '#D9A404' : 'rgba(239,233,218,0.75)' }">
                      {{ name }}
                    </span>
                    <div style="display: flex; align-items: baseline; gap: 8px;">
                      <span :style="{ fontFamily: '\'JetBrains Mono\', monospace', fontSize: '13px', color: name === round.winner ? '#D9A404' : 'rgba(239,233,218,0.75)' }">
                        {{ formatScore(score) }}
                      </span>
                      <span v-if="round.totals && round.totals[name] !== undefined" style="font-family: 'JetBrains Mono', monospace; font-size: 11px; color: rgba(239,233,218,0.3);">
                        ({{ round.totals[name] }})
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>

      <!-- ── PLAYERS ── -->
      <div v-if="activeTab === 'players'">
        <div style="background: #1F3327; border: 1px solid rgba(201,205,196,0.13); border-radius: 6px; overflow: hidden;">

          <!-- Column headers -->
          <div style="display: grid; grid-template-columns: 1.2fr 0.5fr 0.5fr 0.5fr 0.6fr 64px; padding: 10px 16px; border-bottom: 1px solid rgba(201,205,196,0.1); align-items: center;">
            <span style="font-family: Oswald, sans-serif; font-size: 11px; color: #D9A404; font-weight: 600; letter-spacing: 0.5px;">PLAYER</span>
            <span style="font-family: Oswald, sans-serif; font-size: 11px; color: #D9A404; font-weight: 600; letter-spacing: 0.5px;">PLAYED</span>
            <span style="font-family: Oswald, sans-serif; font-size: 11px; color: #D9A404; font-weight: 600; letter-spacing: 0.5px;">WINS</span>
            <span style="font-family: Oswald, sans-serif; font-size: 11px; color: #D9A404; font-weight: 600; letter-spacing: 0.5px;">HCP</span>
            <span style="font-family: Oswald, sans-serif; font-size: 11px; color: #D9A404; font-weight: 600; letter-spacing: 0.5px;">LONGS</span>
            <span></span>
          </div>

          <div v-for="(pdata, name) in data.players" :key="name">

            <!-- Static row -->
            <div
              v-if="editingPlayer !== name"
              style="display: grid; grid-template-columns: 1.2fr 0.5fr 0.5fr 0.5fr 0.6fr 64px; padding: 13px 16px; border-top: 1px solid rgba(201,205,196,0.08); align-items: center;"
            >
              <span style="font-family: Inter, sans-serif; font-weight: 600; font-size: 14px; color: #EFE9DA;">{{ name }}</span>
              <span style="font-family: 'JetBrains Mono', monospace; font-size: 13px; color: rgba(239,233,218,0.8);">{{ pdata.played ?? 0 }}</span>
              <span style="font-family: 'JetBrains Mono', monospace; font-size: 13px; color: rgba(239,233,218,0.8);">{{ pdata.wins ?? 0 }}</span>
              <span style="font-family: 'JetBrains Mono', monospace; font-size: 13px; font-weight: 700;"
                :style="{ color: pdata.handicap <= 0 ? '#3E6B49' : '#D9A404' }">
                {{ formatHcp(pdata.handicap) }}
              </span>
              <span style="font-family: 'JetBrains Mono', monospace; font-size: 13px; color: rgba(239,233,218,0.5);">
                {{ pdata.handicapLongs ? '+' + pdata.handicapLongs : '—' }}
              </span>
              <button @click="startEdit(name, pdata)" :style="ghostEditBtn">Edit</button>
            </div>

            <!-- Edit row -->
            <div
              v-else
              style="padding: 14px 16px; border-top: 1px solid rgba(201,205,196,0.08); background: rgba(21,32,24,0.5);"
            >
              <div style="font-family: Inter, sans-serif; font-weight: 600; font-size: 13px; color: #EFE9DA; margin-bottom: 12px;">{{ name }}</div>
              <div style="display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 10px; margin-bottom: 12px;">
                <div>
                  <div style="font-family: Oswald, sans-serif; font-size: 10px; color: #D9A404; letter-spacing: 0.5px; margin-bottom: 5px;">PLAYED</div>
                  <input type="number" v-model="editForm.played" min="0" :style="editInput" />
                </div>
                <div>
                  <div style="font-family: Oswald, sans-serif; font-size: 10px; color: #D9A404; letter-spacing: 0.5px; margin-bottom: 5px;">WINS</div>
                  <input type="number" v-model="editForm.wins" min="0" :style="editInput" />
                </div>
                <div>
                  <div style="font-family: Oswald, sans-serif; font-size: 10px; color: #D9A404; letter-spacing: 0.5px; margin-bottom: 5px;">HCP</div>
                  <input type="number" v-model="editForm.handicap" max="0" :style="editInput" />
                </div>
                <div>
                  <div style="font-family: Oswald, sans-serif; font-size: 10px; color: #D9A404; letter-spacing: 0.5px; margin-bottom: 5px;">LONGS</div>
                  <input type="number" v-model="editForm.handicapLongs" :style="editInput" />
                </div>
              </div>
              <div style="display: flex; gap: 8px;">
                <button @click="savePlayer(name)" :style="saveBtn">Save</button>
                <button @click="editingPlayer = null" :style="cancelBtn">Cancel</button>
              </div>
            </div>

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
      const scoredRounds = data.value.rounds.filter(r => r.scores && r.scores[name] !== undefined).length;
      const played = Math.max(p.played || 0, scoredRounds);
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

const editingPlayer = ref(null);
const editForm = ref({ wins: 0, handicap: 0, handicapLongs: 0 });

const expandedRounds = ref({});
const editingRound = ref(null);
const roundEditForm = ref({ course: '', date: '', layout: 'Shorts', winner: '', scores: {}, totals: {} });

function toggleRound(id) {
  expandedRounds.value = { ...expandedRounds.value, [id]: !expandedRounds.value[id] };
}

function startEditRound(round) {
  const scores = {};
  const totals = {};
  for (const name of Object.keys(data.value.players)) {
    scores[name] = round.scores?.[name] ?? '';
    totals[name] = round.totals?.[name] ?? '';
  }
  roundEditForm.value = {
    course: round.course || '',
    date: round.date || '',
    layout: round.layout || 'Shorts',
    winner: round.winner || '',
    scores,
    totals,
  };
  editingRound.value = round.id;
}

function startNewRound() {
  const scores = {};
  const totals = {};
  for (const name of Object.keys(data.value.players)) {
    scores[name] = '';
    totals[name] = '';
  }
  roundEditForm.value = { course: '', date: '', layout: 'Shorts', winner: '', scores, totals };
  editingRound.value = '__new__';
}

async function saveRound(id) {
  try {
    const cleanScores = {};
    const cleanTotals = {};
    for (const [name, val] of Object.entries(roundEditForm.value.scores)) {
      if (val !== '' && val !== null && val !== undefined) cleanScores[name] = Number(val);
    }
    for (const [name, val] of Object.entries(roundEditForm.value.totals)) {
      if (val !== '' && val !== null && val !== undefined) cleanTotals[name] = Number(val);
    }
    const payload = {
      course: roundEditForm.value.course,
      date: roundEditForm.value.date,
      layout: roundEditForm.value.layout,
      winner: roundEditForm.value.winner,
      scores: cleanScores,
      totals: cleanTotals,
    };
    if (id === '__new__') {
      await axios.post(`${API}/api/rounds`, payload);
    } else {
      await axios.patch(`${API}/api/rounds/${id}`, payload);
    }
    editingRound.value = null;
    await fetchData();
  } catch (err) {
    uploadError.value = err.response?.data?.error || 'Failed to save round';
    setTimeout(() => { uploadError.value = ''; }, 4000);
  }
}

async function deleteRound(id) {
  try {
    await axios.delete(`${API}/api/rounds/${id}`);
    editingRound.value = null;
    await fetchData();
  } catch (err) {
    uploadError.value = err.response?.data?.error || 'Failed to delete round';
    setTimeout(() => { uploadError.value = ''; }, 4000);
  }
}

function startEdit(name, pdata) {
  editingPlayer.value = name;
  editForm.value = {
    played: pdata.played ?? 0,
    wins: pdata.wins ?? 0,
    handicap: pdata.handicap ?? 0,
    handicapLongs: pdata.handicapLongs ?? 0,
  };
}

async function savePlayer(name) {
  try {
    await axios.patch(`${API}/api/players/${encodeURIComponent(name)}`, {
      played: editForm.value.played,
      wins: editForm.value.wins,
      handicap: editForm.value.handicap,
      handicapLongs: editForm.value.handicapLongs,
    });
    editingPlayer.value = null;
    await fetchData();
  } catch (err) {
    uploadError.value = err.response?.data?.error || 'Failed to save';
    setTimeout(() => { uploadError.value = ''; }, 4000);
  }
}

const editInput = {
  width: '100%',
  padding: '7px 10px',
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: '13px',
  fontWeight: '700',
  background: '#152018',
  border: '1px solid rgba(201,205,196,0.25)',
  borderRadius: '4px',
  color: '#EFE9DA',
  boxSizing: 'border-box',
};

const ghostEditBtn = {
  padding: '4px 10px',
  fontFamily: 'Oswald, sans-serif',
  fontSize: '11px',
  letterSpacing: '0.4px',
  background: 'transparent',
  border: '1px solid rgba(201,205,196,0.25)',
  borderRadius: '4px',
  color: 'rgba(239,233,218,0.6)',
  cursor: 'pointer',
};

const saveBtn = {
  padding: '7px 16px',
  fontFamily: 'Oswald, sans-serif',
  fontSize: '12px',
  letterSpacing: '0.4px',
  background: '#D9A404',
  border: 'none',
  borderRadius: '4px',
  color: '#152018',
  cursor: 'pointer',
  fontWeight: '600',
};

const cancelBtn = {
  padding: '7px 14px',
  fontFamily: 'Oswald, sans-serif',
  fontSize: '12px',
  letterSpacing: '0.4px',
  background: 'transparent',
  border: '1px solid rgba(201,205,196,0.2)',
  borderRadius: '4px',
  color: 'rgba(239,233,218,0.6)',
  cursor: 'pointer',
};

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

