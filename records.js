'use strict';

const SCORES_KEY = 'tetris.scores';
const BEST_COMBO_KEY = 'tetris.bestCombo';
const MAX_LINES_KEY = 'tetris.maxLines';
const MAX_RECORDS = 5;

const startScreen = document.getElementById('start-screen');
const gameContainer = document.querySelector('.game-container');
const playBtn = document.getElementById('play-btn');
const resetRecordsBtn = document.getElementById('reset-records-btn');
const startScoresTable = document.getElementById('start-scores-table');
const startBestComboEl = document.getElementById('start-best-combo');
const startMaxLinesEl = document.getElementById('start-max-lines');
const overlayScoresEl = document.getElementById('overlay-scores');
const overlayNewRecordEl = document.getElementById('overlay-new-record');
const playerNameInput = document.getElementById('player-name-input');
const saveRecordBtn = document.getElementById('save-record-btn');

// ---- Persistencia ----

function loadScores() {
  try {
    const raw = localStorage.getItem(SCORES_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

function saveScores(scores) {
  localStorage.setItem(SCORES_KEY, JSON.stringify(scores));
}

function getNumericStat(key) {
  return Number(localStorage.getItem(key)) || 0;
}

function getBestCombo() {
  return getNumericStat(BEST_COMBO_KEY);
}

function getMaxLines() {
  return getNumericStat(MAX_LINES_KEY);
}

function updateAggregates(stats) {
  const bestCombo = Math.max(getBestCombo(), stats.maxCombo || 0);
  const maxLines = Math.max(getMaxLines(), stats.lines || 0);
  localStorage.setItem(BEST_COMBO_KEY, String(bestCombo));
  localStorage.setItem(MAX_LINES_KEY, String(maxLines));
}

function qualifiesForTop(score, scores) {
  const list = scores || loadScores();
  if (list.length < MAX_RECORDS) return true;
  const minScore = Math.min(...list.map(s => s.score));
  return score > minScore;
}

function insertScore(entry) {
  const scores = loadScores();
  scores.push(entry);
  scores.sort((a, b) => b.score - a.score);
  const truncated = scores.slice(0, MAX_RECORDS);
  saveScores(truncated);
  return truncated;
}

function resetScores() {
  localStorage.removeItem(SCORES_KEY);
  localStorage.removeItem(BEST_COMBO_KEY);
  localStorage.removeItem(MAX_LINES_KEY);
}

// ---- Render ----

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function renderScoresTable(container, scores, highlightEntry) {
  if (!container) return;
  container.innerHTML = '';
  if (!scores.length) {
    const empty = document.createElement('p');
    empty.className = 'records-empty';
    empty.textContent = 'Sin records todavía';
    container.appendChild(empty);
    return;
  }
  const table = document.createElement('table');
  table.className = 'records-table';
  const thead = document.createElement('thead');
  thead.innerHTML = '<tr><th>#</th><th>Nombre</th><th>Puntos</th><th>Líneas</th><th>Nivel</th><th>Combo</th></tr>';
  table.appendChild(thead);
  const tbody = document.createElement('tbody');
  scores.forEach((entry, i) => {
    const tr = document.createElement('tr');
    if (entry === highlightEntry) tr.classList.add('new-record');
    tr.innerHTML =
      `<td>${i + 1}</td>` +
      `<td>${escapeHtml(entry.name)}</td>` +
      `<td>${entry.score.toLocaleString()}</td>` +
      `<td>${entry.lines}</td>` +
      `<td>${entry.level}</td>` +
      `<td>${entry.maxCombo}</td>`;
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
  container.appendChild(table);
}

function renderStartAggregates() {
  if (startBestComboEl) startBestComboEl.textContent = getBestCombo();
  if (startMaxLinesEl) startMaxLinesEl.textContent = getMaxLines();
}

function renderStartScreen() {
  renderScoresTable(startScoresTable, loadScores(), null);
  renderStartAggregates();
}

// ---- Combo en el panel lateral ----

function initComboPanel() {
  const panel = document.querySelector('.panel');
  if (!panel || document.getElementById('combo-value')) return;
  const levelValueEl = document.getElementById('level');
  const levelSection = levelValueEl ? levelValueEl.closest('.panel-section') : null;
  const section = document.createElement('div');
  section.className = 'panel-section';
  section.innerHTML = '<span class="label">COMBO</span><span class="value" id="combo-value">0</span>';
  if (levelSection && levelSection.nextSibling) {
    panel.insertBefore(section, levelSection.nextSibling);
  } else {
    panel.appendChild(section);
  }
}

function updateComboDisplay() {
  const el = document.getElementById('combo-value');
  if (el) el.textContent = typeof combo !== 'undefined' ? combo : 0;
}

// ---- Integración con el fin de partida (llamada desde game.js) ----

let pendingStats = null;

function resetOverlayRecordsUI() {
  if (overlayNewRecordEl) overlayNewRecordEl.classList.add('hidden');
  if (overlayScoresEl) overlayScoresEl.innerHTML = '';
  pendingStats = null;
}

function handleGameOver(stats) {
  updateAggregates(stats);
  renderStartAggregates();

  const scores = loadScores();
  renderScoresTable(startScoresTable, scores, null);
  renderScoresTable(overlayScoresEl, scores, null);

  if (qualifiesForTop(stats.score, scores)) {
    pendingStats = stats;
    overlayNewRecordEl.classList.remove('hidden');
    playerNameInput.value = '';
  } else {
    pendingStats = null;
    overlayNewRecordEl.classList.add('hidden');
  }
}

saveRecordBtn.addEventListener('click', () => {
  if (!pendingStats) return;
  const rawName = (playerNameInput.value || '').trim().slice(0, 12);
  const entry = {
    name: rawName || 'Jugador',
    score: pendingStats.score,
    lines: pendingStats.lines,
    level: pendingStats.level,
    maxCombo: pendingStats.maxCombo,
  };
  const updated = insertScore(entry);
  renderScoresTable(overlayScoresEl, updated, entry);
  renderStartScreen();
  overlayNewRecordEl.classList.add('hidden');
  pendingStats = null;
});

// ---- Pantalla de inicio ----

function showGame() {
  startScreen.classList.add('hidden');
  gameContainer.classList.remove('hidden');
  init();
}

gameContainer.classList.add('hidden');
playBtn.addEventListener('click', showGame);

resetRecordsBtn.addEventListener('click', () => {
  if (confirm('¿Seguro que quieres borrar todos los records?')) {
    resetScores();
    renderStartScreen();
    if (overlayScoresEl) renderScoresTable(overlayScoresEl, [], null);
  }
});

initComboPanel();
renderStartScreen();
