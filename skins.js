'use strict';

const SKIN_STORAGE_KEY = 'tetris.skin';

function renderNeonBlock(context, x, y, color, size) {
  context.save();
  context.shadowColor = color;
  context.shadowBlur = size * 0.6;
  context.fillStyle = color;
  context.fillRect(x * size + 3, y * size + 3, size - 6, size - 6);
  context.shadowBlur = 0;
  context.fillStyle = 'rgba(255,255,255,0.3)';
  context.fillRect(x * size + 3, y * size + 3, size - 6, 3);
  context.restore();
}

function renderPastelBlock(context, x, y, color, size) {
  const px = x * size + 1;
  const py = y * size + 1;
  const s = size - 2;
  const r = s * 0.28;
  context.fillStyle = color;
  context.beginPath();
  if (context.roundRect) {
    context.roundRect(px, py, s, s, r);
  } else {
    context.moveTo(px + r, py);
    context.lineTo(px + s - r, py);
    context.quadraticCurveTo(px + s, py, px + s, py + r);
    context.lineTo(px + s, py + s - r);
    context.quadraticCurveTo(px + s, py + s, px + s - r, py + s);
    context.lineTo(px + r, py + s);
    context.quadraticCurveTo(px, py + s, px, py + s - r);
    context.lineTo(px, py + r);
    context.quadraticCurveTo(px, py, px + r, py);
    context.closePath();
  }
  context.fill();
  context.fillStyle = 'rgba(255,255,255,0.4)';
  context.beginPath();
  if (context.roundRect) {
    context.roundRect(px + 2, py + 2, s - 4, 3, 2);
  } else {
    context.rect(px + 3, py + 2, s - 6, 3);
  }
  context.fill();
}

function renderPixelBlock(context, x, y, color, size) {
  defaultBlockRender(context, x, y, color, size);
  context.fillStyle = 'rgba(0,0,0,0.2)';
  const px = x * size + 1;
  const py = y * size + 1;
  const s = size - 2;
  const cell = Math.max(2, Math.floor(s / 6));
  for (let gy = 0; gy < s; gy += cell * 2) {
    for (let gx = 0; gx < s; gx += cell * 2) {
      context.fillRect(px + gx, py + gy, cell, cell);
    }
  }
}

const RETRO_COLORS = [null, '#4dd0e1', '#ffd54f', '#ba68c8', '#81c784', '#e57373', '#7986cb', '#ffb74d'];

const SKINS = {
  retro: {
    label: 'Retro',
    colors: RETRO_COLORS,
    gridColor: '#22222e',
    bgColor: '#1a1a25',
    renderBlock: defaultBlockRender,
  },
  neon: {
    label: 'Neon',
    colors: [null, '#00e5ff', '#ffea00', '#e040fb', '#00ff87', '#ff1744', '#448aff', '#ff9100'],
    gridColor: '#12121c',
    bgColor: '#000000',
    renderBlock: renderNeonBlock,
  },
  pastel: {
    label: 'Pastel',
    colors: [null, '#a8d8ea', '#fff5ba', '#d7bde2', '#b6f2c0', '#ffb3ba', '#c3c9f5', '#ffd8a8'],
    gridColor: '#2e2e40',
    bgColor: '#1a1a25',
    renderBlock: renderPastelBlock,
  },
  pixel: {
    label: 'Pixel Art',
    colors: RETRO_COLORS,
    gridColor: '#22222e',
    bgColor: '#1a1a25',
    renderBlock: renderPixelBlock,
  },
};

let currentSkinName = 'retro';

function updateSkinButtons(name) {
  document.querySelectorAll('.skin-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.skin === name);
  });
}

function applySkin(name) {
  const skin = SKINS[name] || SKINS.retro;
  currentSkinName = SKINS[name] ? name : 'retro';
  COLORS = skin.colors;
  GRID_COLOR = skin.gridColor;
  BG_COLOR = skin.bgColor;
  blockRenderer = skin.renderBlock;
  updateSkinButtons(currentSkinName);
  if (typeof draw === 'function' && typeof board !== 'undefined' && board) draw();
  if (typeof drawNext === 'function' && typeof next !== 'undefined' && next) drawNext();
}

function selectSkin(name) {
  applySkin(name);
  try {
    localStorage.setItem(SKIN_STORAGE_KEY, name);
  } catch (err) {
    // almacenamiento no disponible: la skin sigue aplicada en esta sesión
  }
}

document.querySelectorAll('.skin-btn').forEach(btn => {
  btn.addEventListener('click', () => selectSkin(btn.dataset.skin));
});

let savedSkin = 'retro';
try {
  savedSkin = localStorage.getItem(SKIN_STORAGE_KEY) || 'retro';
} catch (err) {
  // almacenamiento no disponible: usar skin por defecto
}
applySkin(savedSkin);
