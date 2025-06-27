const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const startBtn = document.getElementById('start-btn');
const scoreDiv = document.getElementById('score');
const scoreList = document.getElementById('score-list');

let player, bullets, enemies, score, level, running;

const PLAYER_WIDTH = 40;
const PLAYER_HEIGHT = 10;
const BULLET_WIDTH = 2;
const BULLET_HEIGHT = 6;
const ENEMY_SIZE = 20;

function resetGame() {
    player = { x: canvas.width / 2 - PLAYER_WIDTH / 2, y: canvas.height - 30 };
    bullets = [];
    enemies = createEnemies();
    score = 0;
    level = 1;
    running = true;
    updateScore();
}

function createEnemies() {
    const rows = 3 + level;
    const cols = 8;
    const enemies = [];
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            enemies.push({
                x: 50 + c * 50,
                y: 30 + r * 30,
                alive: true,
                color: `hsl(${(level * 40 + r * 20) % 360}, 70%, 50%)`
            });
        }
    }
    return enemies;
}

function updateScore() {
    scoreDiv.textContent = `Punkte: ${score}`;
}

function drawPlayer() {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(player.x, player.y, PLAYER_WIDTH, PLAYER_HEIGHT);
}

function drawBullets() {
    ctx.fillStyle = '#FF0000';
    bullets.forEach(b => ctx.fillRect(b.x, b.y, BULLET_WIDTH, BULLET_HEIGHT));
}

function drawEnemies() {
    enemies.forEach(e => {
        if (e.alive) {
            ctx.fillStyle = e.color;
            ctx.fillRect(e.x, e.y, ENEMY_SIZE, ENEMY_SIZE);
        }
    });
}

function updateBullets() {
    bullets.forEach(b => b.y -= 4);
    bullets = bullets.filter(b => b.y > 0);
}

function collide(rect1, rect2) {
    return rect1.x < rect2.x + ENEMY_SIZE &&
           rect1.x + BULLET_WIDTH > rect2.x &&
           rect1.y < rect2.y + ENEMY_SIZE &&
           rect1.y + BULLET_HEIGHT > rect2.y;
}

function checkCollisions() {
    bullets.forEach(b => {
        enemies.forEach(e => {
            if (e.alive && collide(b, e)) {
                e.alive = false;
                b.y = -10;
                score += 10;
            }
        });
    });
    if (enemies.every(e => !e.alive)) {
        level++;
        enemies = createEnemies();
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawPlayer();
    drawBullets();
    drawEnemies();
}

function update() {
    if (!running) return;
    updateBullets();
    checkCollisions();
    updateScore();
}

function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

function shoot() {
    bullets.push({ x: player.x + PLAYER_WIDTH / 2 - BULLET_WIDTH / 2, y: player.y });
}

function saveHighscore() {
    const scores = JSON.parse(localStorage.getItem('scores') || '[]');
    scores.push({ score, date: new Date().toLocaleString() });
    scores.sort((a, b) => b.score - a.score);
    localStorage.setItem('scores', JSON.stringify(scores.slice(0, 5)));
}

function loadHighscores() {
    const scores = JSON.parse(localStorage.getItem('scores') || '[]');
    scoreList.innerHTML = '';
    scores.forEach(s => {
        const li = document.createElement('li');
        li.textContent = `${s.score} Punkte (${s.date})`;
        scoreList.appendChild(li);
    });
}

startBtn.addEventListener('click', () => {
    resetGame();
    loadHighscores();
    loop();
});

window.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') player.x -= 10;
    if (e.key === 'ArrowRight') player.x += 10;
    if (e.key === ' ') shoot();
});

canvas.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    player.x = e.clientX - rect.left - PLAYER_WIDTH / 2;
});

function endGame() {
    running = false;
    saveHighscore();
    loadHighscores();
}

// simple check if enemies reached bottom
setInterval(() => {
    if (!running) return;
    enemies.forEach(e => {
        if (e.alive) e.y += 0.2 + level * 0.05;
        if (e.y + ENEMY_SIZE > player.y) endGame();
    });
}, 20);
