'use strict';

const START_LEVEL_KEY = 'tetris.startLevel';
const MIN_START_LEVEL = 1;
const MAX_START_LEVEL = 15;

let pauseMenuOpen = false;

const pauseMenuEl = document.getElementById('pause-menu');
const startLevelInput = document.getElementById('start-level-input');
const pauseResumeBtn = document.getElementById('pause-resume-btn');
const pauseRestartBtn = document.getElementById('pause-restart-btn');
const pauseControlsBtn = document.getElementById('pause-controls-btn');
const pauseControlsList = document.getElementById('pause-controls-list');

function getStartLevel() {
  try {
    const stored = parseInt(localStorage.getItem(START_LEVEL_KEY), 10);
    if (!Number.isFinite(stored) || stored < MIN_START_LEVEL || stored > MAX_START_LEVEL) {
      return MIN_START_LEVEL;
    }
    return stored;
  } catch (err) {
    return MIN_START_LEVEL;
  }
}

function setStartLevel(value) {
  const parsed = Math.round(value);
  const safe = Number.isFinite(parsed) ? parsed : MIN_START_LEVEL;
  const clamped = Math.min(MAX_START_LEVEL, Math.max(MIN_START_LEVEL, safe));
  try {
    localStorage.setItem(START_LEVEL_KEY, String(clamped));
  } catch (err) {
    // localStorage no disponible (modo privado, iframe con almacenamiento bloqueado, etc.)
  }
  return clamped;
}

function openPauseMenu() {
  pauseMenuOpen = true;
  startLevelInput.value = getStartLevel();
  pauseControlsList.classList.add('hidden');
  pauseMenuEl.classList.remove('hidden');
}

function closePauseMenu() {
  pauseMenuOpen = false;
  pauseMenuEl.classList.add('hidden');
}

pauseResumeBtn.addEventListener('click', () => {
  togglePause();
});

pauseRestartBtn.addEventListener('click', () => {
  closePauseMenu();
  init();
});

pauseControlsBtn.addEventListener('click', () => {
  pauseControlsList.classList.toggle('hidden');
});

startLevelInput.addEventListener('change', () => {
  startLevelInput.value = setStartLevel(parseInt(startLevelInput.value, 10));
});
