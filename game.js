const game = document.getElementById('game');
const scoreDisplay = document.getElementById('score');
const pauseMessage = document.getElementById('pauseMessage');
const gameOverMessage = document.getElementById('gameOverMessage');
const finalScoreDisplay = document.getElementById('finalScore');
const restartButton = document.getElementById('restartGame');
const rows = 20;
const cols = 10;
const grid = [];
let score = 0;
let isPaused = false; // Estado de pausa
let isGameOver = false; // Estado del juego

// CUADRÍCULA VISUAL
for (let r = 0; r < rows; r++) {
  const row = [];
  for (let c = 0; c < cols; c++) {
    const cell = document.createElement('div');
    cell.classList.add('cell');
    game.appendChild(cell);
    row.push(cell);
  }
  grid.push(row);
}

// BLOQUES CONGELADOS
const frozenGrid = Array.from({ length: rows }, () =>
  Array(cols).fill(null)
);

// FORMAS DE TETRIS
const shapes = {
  O: { color: 'yellow', blocks: [ [0,0], [1,0], [0,1], [1,1] ], score: 2 },
  I: { color: 'cyan', blocks: [ [0,0], [0,1], [0,2], [0,3] ], score: 4 },
  T: { color: 'purple', blocks: [ [1,0], [0,1], [1,1], [2,1] ], score: 2 },
  L: { color: 'orange', blocks: [ [0,0], [0,1], [0,2], [1,2] ], score: 4 },
  J: { color: 'blue', blocks: [ [1,0], [1,1], [1,2], [0,2] ], score: 2 },
  S: { color: 'green', blocks: [ [1,0], [2,0], [0,1], [1,1] ], score: 4 },
  Z: { color: 'red', blocks: [ [0,0], [1,0], [1,1], [2,1] ], score: 2 }
};

let block = null; // BLOQUES ACTIVOS
let blockColor = '';
let blockScore = 0;

// CREACIÓN DE BLOQUE N ALEATORIO
function generateNewBlock() {
  const shapeKeys = Object.keys(shapes);
  const random = shapeKeys[Math.floor(Math.random() * shapeKeys.length)];
  const shape = shapes[random];

  blockColor = shape.color;
  blockScore = shape.score;
  block = shape.blocks.map(([x, y]) => ({ x: x + 4, y }));

  const blocked = block.some(p => frozenGrid[p.y]?.[p.x] !== null);
  if (blocked) {
    gameOver();
    return; // No genera el siguiente bloque, ya que el juego terminó
  }

  drawBlock();
}

// DIBUJAR BLOQUES
function drawBlock() {
  clearGrid();

  // DIBUJAR BLOQUES CONGELADOS
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (frozenGrid[y][x]) {
        grid[y][x].style.backgroundColor = frozenGrid[y][x];
      }
    }
  }

  // DIBUJAR BLOQUE ACTUAL
  block.forEach(p => {
    if (p.y < rows) {
      grid[p.y][p.x].style.backgroundColor = blockColor;
    }
  });
}

// LIMPIAR CELDAS VISUALMENTE
function clearGrid() {
  grid.flat().forEach(cell => cell.style.backgroundColor = '');
}

// MOVER BLOQUE
function moveBlock(dx, dy) {
  if (isGameOver) return; // Si el juego terminó, no más movimientos

  const moved = block.map(p => ({ x: p.x + dx, y: p.y + dy }));

  const canMove = moved.every(p =>
    p.x >= 0 &&
    p.x < cols &&
    p.y < rows &&
    frozenGrid[p.y]?.[p.x] === null
  );

  if (canMove) {
    block = moved;
    drawBlock();
  } else if (dy === 1) {
    // Fijar bloque
    block.forEach(p => {
      if (p.y < rows && p.x >= 0 && p.x < cols) {
        frozenGrid[p.y][p.x] = blockColor;
      }
    });
    checkLines();
    generateNewBlock();
  }
}

// VERIFICAR LINEAS COMPLETAS
function checkLines() {
  for (let y = rows - 1; y >= 0; y--) {
    if (frozenGrid[y].every(cell => cell !== null)) {
      // Eliminar línea
      frozenGrid.splice(y, 1);
      frozenGrid.unshift(Array(cols).fill(null));
      score += 100;
      scoreDisplay.textContent = score;
      y++; // Volver a revisar esta fila
    }
  }
  // Sumar puntaje del bloque colocado
  score += blockScore;
  scoreDisplay.textContent = score;
}

// FUNCIÓN DE GAME OVER
function gameOver() {
  isGameOver = true; //juego terminó
  clearInterval(gameInterval); // Detener el intervalo de movimiento de bloques
  gameOverMessage.style.display = 'block'; // Mostrar pantalla de Game Over
  finalScoreDisplay.textContent = score; // Mostrar el puntaje final
}

// FUNCIÓN PARA REINICIAR EL JUEGO
function restartGame() {
  // Limpiar la cuadrícula y la puntuación
  frozenGrid.forEach((row, rIdx) => row.fill(null));
  score = 0;
  scoreDisplay.textContent = score;

  // Limpiar la pantalla de Game Over
  gameOverMessage.style.display = 'none';

  // Reiniciar el juego
  isGameOver = false; // Restablecer el estado del juego
  generateNewBlock();
  startGame();
  isPaused = false;
  pauseMessage.style.display = 'none'; 
}

// CONTROLES
document.addEventListener('keydown', (e) => {
  if (isGameOver) return; 

  if (e.key === 'ArrowLeft') moveBlock(-1, 0);
  if (e.key === 'ArrowRight') moveBlock(1, 0);
  if (e.key === 'ArrowDown') moveBlock(0, 1);

  // PAUSAR O REANUDAR EL JUEGO CON TECLA P
  if (e.key === 'p' || e.key === 'P') {
    if (isPaused) {
      isPaused = false;
      startGame();
      pauseMessage.style.display = 'none';  
    } else {
      isPaused = true;
      clearInterval(gameInterval);
      pauseMessage.style.display = 'block';  
    }
  }
});

// CAÍDA DEL BLOQUE AUTOMÁTICA
let gameInterval; // Para controlar el intervalo

function startGame() {
  gameInterval = setInterval(() => {
    if (!isPaused && !isGameOver) {
      moveBlock(0, 1);
    }
  }, 500);
}

// INICIALIZAR
generateNewBlock();
startGame();

// BOTÓN DE REINICIO
restartButton.addEventListener('click', restartGame);

