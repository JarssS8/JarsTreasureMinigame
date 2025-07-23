// Global game state variables
let gridSize, totalAttempts, hintMode, visualMode, maxTime;
let winningCell = null;
let attemptsLeft = 0;
let timer = null;
let timeLeft = 0;
let gameEnded = false; // Track if game has ended to prevent multiple results
let gameEndTime = null;
let resultSent = false; // Track if result has been sent to prevent duplicates
let monitoringInterval = null;
let debugMode = false; // No debug mode in production, but keep variable for compatibility
let resourceName = 'jars-minigames';

const grid = document.getElementById('grid');
const attemptsDisplay = document.getElementById('attemptsLeft');
const info = document.getElementById('info');
const timeDisplay = document.getElementById('timeLeft');

/**
 * Stops all game activity - timer, interactions, and updates
 */
function stopGame() {
    gameEnded = true;
    gameEndTime = Date.now();
    clearInterval(timer);
    disableAllCells();
}

/**
 * Sends the final game result back to the FiveM client script.
 * @param {boolean} didWin - True if the player won, false otherwise.
 */
async function sendGameResult(didWin) {
    debugLog(`sendGameResult called with didWin=${didWin}, gameEnded=${gameEnded}, resultSent=${resultSent}`);
    
    // Prevent duplicate calls if result was already sent
    if (resultSent) {
        debugLog('Preventing duplicate sendGameResult call (result already sent)');
        return;
    }
    
    resultSent = true;
    
    debugLog(`Sending game result: ${didWin ? 'WON' : 'LOST'}`);
    
    try {
        const response = await fetch(`https://${resourceName}/gameResult`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json; charset=UTF-8' },
            body: JSON.stringify({ win: didWin })
        });

        debugLog(`Response status: ${response.status}`);
        
        debugLog(`Successfully sent gameResult to client with win=${didWin}`);
        
    } catch (error) {
        debugLog('Error sending gameResult:', error);
        console.error('[JARS-MINIGAMES] Error sending gameResult:', error);
    }
}

/**
 * Closes the minigame UI and resets focus
 */
function closeMinigame() {
    debugLog('closeMinigame called');
    
    const minigameFrame = document.getElementById('minigame-frame');
    if (minigameFrame) {
        minigameFrame.style.display = 'none';
    }
    
    // Use the closeUI callback to properly close NUI focus
    fetch(`https://${resourceName}/closeUI`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=UTF-8' },
        body: JSON.stringify({})
    }).catch(error => {
        console.error('[JARS-MINIGAMES] Error closing UI:', error);
    });
    
    // Fallback for native calls
    if (window.invokeNative) {
        try {
            window.invokeNative('SET_NUI_FOCUS', false, false);
        } catch (e) {
            console.log('[JARS-MINIGAMES] Native call failed in closeMinigame:', e);
        }
    }
}

/**
 * Listens for messages from the client.lua script.
 */
window.addEventListener('message', (event) => {
    const data = event.data;
    if (data.type === 'startGame') {
        debugMode = data.debugMode || false;
        resourceName = data.resourceName || 'jars-minigames';
        const minigameFrame = document.getElementById('minigame-frame');
        minigameFrame.style.display = 'flex';
        grid.style.display = 'none';
        timeLeft = data.maxTime || 10; // Default to 10 seconds if not provided
        setupGame(
            data.hintMode,
            data.visualMode,
            data.gridSize,
            data.totalAttempts,
            data.maxTime
        );
    } else if (data.type === 'hideUI') {
        const minigameFrame = document.getElementById('minigame-frame');
        minigameFrame.style.display = 'none';
    } else if (data.type === 'forceClose') {
        debugLog('Force close message received');
        const minigameFrame = document.getElementById('minigame-frame');
        if (minigameFrame) {
            minigameFrame.style.display = 'none';
        }
        if (!gameEnded) {
            stopGame();
        }
    }
});

window.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeMinigame();
        sendGameResult(false); 
    }
});

function disableAllCells() {
    document.querySelectorAll('.cell').forEach(cell => cell.removeEventListener('click', handleCellClick));
}

/**
 * Sets up and starts a new game.
 */
function setupGame(hint, visual, size, attempts, time) {
    debugLog('setupGame called with:', { hint, visual, size, attempts, time });
    gameEnded = false;
    gameEndTime = null;
    resultSent = false; 
    
    hintMode = hint;
    visualMode = visual;
    gridSize = parseInt(size);
    totalAttempts = parseInt(attempts);
    maxTime = parseInt(time);

    attemptsLeft = totalAttempts;
    winningCell = {
        x: Math.floor(Math.random() * gridSize),
        y: Math.floor(Math.random() * gridSize)
    };    attemptsDisplay.textContent = attemptsLeft;
    info.textContent = `Intentos restantes: ${attemptsLeft} | Tiempo restante: ${timeLeft}s`;
    info.style.display = 'block';

    createGrid();
    grid.style.display = 'grid';

    clearInterval(timer);
    timeLeft = maxTime;
    updateTimerDisplay();
    updateTimeBar();    timer = setInterval(() => {
        if (gameEnded) {
            clearInterval(timer);
            return;
        }
        
        timeLeft--;
        updateTimerDisplay();
        updateTimeBar();
        
        // Update info with current attempts and time only if game is still active
        if (attemptsLeft > 0 && timeLeft > 0 && !gameEnded) {
            info.textContent = `Intentos restantes: ${attemptsLeft} | Tiempo restante: ${timeLeft}s`;
        }
        if (timeLeft <= 0) {
            stopGame();
            disableAllCells();
            
            revealWinningCell();
            info.textContent = "¡Tiempo agotado! Perdiste.";

            setTimeout(() => {
                closeMinigame();
                sendGameResult(false);
            }, 3000);
        }
    }, 1000);
}

function handleCellClick(e) {
    const cell = e.target;
    
    if (gameEnded || cell.classList.contains('clicked') || attemptsLeft <= 0 || timeLeft <= 0) {
        return;
    }

    const x = parseInt(cell.dataset.x);
    const y = parseInt(cell.dataset.y);
    const distance = Math.abs(x - winningCell.x) + Math.abs(y - winningCell.y);

    cell.classList.add('clicked');    if (distance === 0) {
        stopGame();
        disableAllCells();
        
        cell.innerHTML = '<i class="fas fa-trophy"></i>';
        cell.style.backgroundColor = getHeatColor(0);
        info.textContent = "¡Tesoro encontrado! ¡Ganaste!";

        setTimeout(() => {
            closeMinigame();
            sendGameResult(true);
        }, 3000);
        return;
    }

    if (hintMode === 'icons') {
        cell.innerHTML = `<i class="fas ${getChessIconClass(distance)}"></i>`;
    } else if (hintMode === 'number') {
        cell.textContent = distance;
    }

    if (visualMode === 'color' || hintMode === 'coloronly') {
        cell.style.backgroundColor = getHeatColor(distance);
    }    attemptsLeft--;
    attemptsDisplay.textContent = attemptsLeft;
    
    info.textContent = `Intentos restantes: ${attemptsLeft} | Tiempo restante: ${timeLeft}s`;    if (attemptsLeft === 0) {
        stopGame();
        disableAllCells();
        
        revealWinningCell();
        info.textContent = "¡Sin intentos! Perdiste.";

        setTimeout(() => {
            closeMinigame();
            sendGameResult(false);
        }, 3000);
    }
}



function getHeatColor(distance) {
    if (distance === 0) return '#0eb05a';
    if (distance === 1) return '#a8f5b0';
    if (distance === 2) return '#fff9b0';
    if (distance === 3) return '#ffd966';
    if (distance === 4) return '#ff944d';
    if (distance === 5) return '#ff4d4d';
    return '#b30000'
}

function getChessIconClass(distance) {
    if (distance === 1)
        return 'fa-chess-king';
    if (distance === 2)
        return 'fa-chess-queen';
    if (distance === 3)
        return 'fa-chess-bishop';
    if (distance === 4)
        return 'fa-chess-knight';
    if (distance === 5)
        return 'fa-chess-rook';
    return 'fa-chess-pawn'
}

function createGrid() {
    grid.innerHTML = '';
    grid.style.gridTemplateColumns = `repeat(${gridSize},60px)`;
    grid.style.gridTemplateRows = `repeat(${gridSize},60px)`;
    for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.x = x;
            cell.dataset.y = y;
            cell.addEventListener('click', handleCellClick);
            grid.appendChild(cell)
        }
    }
}

function revealWinningCell() {
    document.querySelectorAll('.cell').forEach(cell => {
        const x = parseInt(cell.dataset.x);
        const y = parseInt(cell.dataset.y);
        if (x === winningCell.x && y === winningCell.y) {
            cell.classList.add('clicked');
            cell.style.backgroundColor = getHeatColor(0);
            cell.innerHTML = '<i class="fas fa-trophy"></i>'
        }
    })
}

function updateTimerDisplay() {
    if (timeDisplay)
        timeDisplay.textContent = timeLeft
}

function updateTimeBar() {
    const bar = document.getElementById('timeBar');
    if (bar) {
        const percent = Math.max(0, (timeLeft / maxTime) * 100);
        bar.style.width = percent + "%"
    }
}

function debugLog(...args) {
    if (debugMode) {
        console.log('[JARS-MINIGAMES][DEBUG]', ...args);
    }
}