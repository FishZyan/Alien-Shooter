const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// UI Elements
const startScreen = document.getElementById('startScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const scoreDisplay = document.getElementById('scoreDisplay');
const finalScoreDisplay = document.getElementById('finalScoreDisplay');
const usernameInput = document.getElementById('usernameInput');
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');
const leaderboardList = document.getElementById('leaderboardList');
const endUsernameInput = document.getElementById('endUsernameInput');
const leaderboardContainer = document.getElementById('leaderboardContainer');

// Game State
let isPlaying = false;
let score = 0;
let animationId;
let username = '';

// Arrays to hold entities
let projectiles = [];
let aliens = [];
let particles = [];

// Player Configuration
const player = {
    x: 0,
    y: 0,
    radius: 30,
    color: '#00f2fe'
};

// Set canvas dimensions
function resizeCanvas() {
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    player.x = canvas.width / 2;
    player.y = canvas.height - 50;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function getMousePos(evt) {
    const rect = canvas.getBoundingClientRect();
    const clientX = evt.clientX !== undefined ? evt.clientX : evt.touches[0].clientX;
    const clientY = evt.clientY !== undefined ? evt.clientY : evt.touches[0].clientY;
    return {
        x: clientX - rect.left,
        y: clientY - rect.top
    };
}

// --- Classes ---

class Projectile {
    constructor(x, y, velocity) {
        this.x = x;
        this.y = y;
        this.velocity = velocity;
        this.radius = 5;
        this.color = '#fff';
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
    }

    update() {
        this.draw();
        this.x += this.velocity.x;
        this.y += this.velocity.y;
    }
}

class Alien {
    constructor(x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
        this.hp = 1;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.shadowBlur = 15;
        ctx.shadowColor = this.color;
        ctx.closePath();
        ctx.shadowBlur = 0; // Reset shadow
    }

    update() {
        this.draw();
        this.x += this.velocity.x;
        this.y += this.velocity.y;
    }
}

class Particle {
    constructor(x, y, velocity, radius, color) {
        this.x = x;
        this.y = y;
        this.velocity = velocity;
        this.radius = radius;
        this.color = color;
        this.alpha = 1;
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
        ctx.restore();
    }

    update() {
        this.draw();
        this.velocity.x *= 0.99; // friction
        this.velocity.y *= 0.99;
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        this.alpha -= 0.02;
    }
}

// --- Spawning Logic ---

let spawnInterval;
function spawnAliens() {
    spawnInterval = setInterval(() => {
        if (!isPlaying) return;
        
        const radius = Math.random() * 15 + 15;
        const x = Math.random() * (canvas.width - radius * 2) + radius;
        const y = -radius;
        
        // Speed increases slightly over time
        const speedMultiplier = 1 + score * 0.02;
        const velocity = {
            x: 0,
            y: (Math.random() * 1 + 1) * speedMultiplier
        };
        
        const hue = Math.random() * 60 + 280; // purple to pink range
        const color = `hsl(${hue}, 100%, 60%)`;

        aliens.push(new Alien(x, y, radius, color, velocity));
    }, 1500); 
}

// --- Controls ---

function shootProjectile(targetPos) {
    // Calculate aim vector from player TO the target click
    const dx = targetPos.x - player.x;
    const dy = targetPos.y - player.y;
    const angle = Math.atan2(dy, dx);
    
    // Fixed projectile speed
    const power = 15;
    
    const velocity = {
        x: Math.cos(angle) * power,
        y: Math.sin(angle) * power
    };

    projectiles.push(new Projectile(player.x, player.y, velocity));
}

canvas.addEventListener('mousedown', (e) => {
    if (!isPlaying) return;
    shootProjectile(getMousePos(e));
});

canvas.addEventListener('touchstart', (e) => {
    if (!isPlaying) return;
    e.preventDefault(); // Stop scrolling
    shootProjectile(getMousePos(e));
});

// Since we are changing to point-and-click, we don't need continuous mouse tracking.
let mouseAngle = 0;
canvas.addEventListener('mousemove', (e) => {
    if (!isPlaying) return;
    const pos = getMousePos(e);
    mouseAngle = Math.atan2(pos.y - player.y, pos.x - player.x);
});


// --- Explosions ---

function createParticles(x, y, color) {
    for (let i = 0; i < 15; i++) {
        const velocity = {
            x: (Math.random() - 0.5) * (Math.random() * 6),
            y: (Math.random() - 0.5) * (Math.random() * 6)
        };
        particles.push(new Particle(x, y, velocity, Math.random() * 3, color));
    }
}

// --- Main Game Loop ---

function animate() {
    if (!isPlaying) return;
    animationId = requestAnimationFrame(animate);

    // Clear canvas with trail effect
    ctx.fillStyle = 'rgba(5, 5, 16, 0.3)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Player Body and "Turret"
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2, false);
    ctx.fillStyle = player.color;
    ctx.fill();
    ctx.shadowBlur = 20;
    ctx.shadowColor = player.color;
    ctx.closePath();
    ctx.shadowBlur = 0;

    // Draw little cannon indicating aim
    ctx.beginPath();
    ctx.moveTo(player.x, player.y);
    ctx.lineTo(player.x + Math.cos(mouseAngle) * 40, player.y + Math.sin(mouseAngle) * 40);
    ctx.strokeStyle = player.color;
    ctx.lineWidth = 5;
    ctx.stroke();
    ctx.closePath();

    // Update Particles
    for (let i = particles.length - 1; i >= 0; i--) {
        const particle = particles[i];
        if (particle.alpha <= 0) {
            particles.splice(i, 1);
        } else {
            particle.update();
        }
    }

    // Update Projectiles
    for (let i = projectiles.length - 1; i >= 0; i--) {
        const projectile = projectiles[i];
        projectile.update();
        
        // Remove if off screen
        if (projectile.x + projectile.radius < 0 || 
            projectile.x - projectile.radius > canvas.width || 
            projectile.y + projectile.radius < 0 || 
            projectile.y - projectile.radius > canvas.height) {
            projectiles.splice(i, 1);
        }
    }

    // Update Aliens
    for (let alienIndex = aliens.length - 1; alienIndex >= 0; alienIndex--) {
        const alien = aliens[alienIndex];
        alien.update();

        // Game Over condition: Alien hits bottom/player level
        const distToPlayer = Math.hypot(player.x - alien.x, player.y - alien.y);
        if (distToPlayer - alien.radius - player.radius < 1 || alien.y + alien.radius >= canvas.height) {
            endGame();
            return;
        }

        // Projectile hit detection
        for (let projectileIndex = projectiles.length - 1; projectileIndex >= 0; projectileIndex--) {
            const projectile = projectiles[projectileIndex];
            const dist = Math.hypot(projectile.x - alien.x, projectile.y - alien.y);
            
            // Collision
            if (dist - alien.radius - projectile.radius < 1) {
                // Remove projectile
                projectiles.splice(projectileIndex, 1);
                createParticles(alien.x, alien.y, alien.color);
                
                // Shrink or remove alien
                if (alien.radius - 10 > 10) {
                    alien.radius -= 10;
                    score += 5;
                } else {
                    aliens.splice(alienIndex, 1);
                    score += 10;
                }
                
                scoreDisplay.innerText = score;
                break; // Alien handled for this frame
            }
        }
    }
}

// --- Start and End Game Logic ---

function startGame() {
    username = usernameInput.value.trim() || 'Anonymous';
    
    startScreen.classList.remove('visible');
    startScreen.classList.add('hidden');
    
    score = 0;
    scoreDisplay.innerText = score;
    projectiles = [];
    aliens = [];
    particles = [];
    
    isPlaying = true;
    spawnAliens();
    animate();
}

async function endGame() {
    isPlaying = false;
    cancelAnimationFrame(animationId);
    clearInterval(spawnInterval);
    
    finalScoreDisplay.innerText = score;
    gameOverScreen.classList.remove('hidden');
    gameOverScreen.classList.add('visible');

    leaderboardContainer.classList.remove('hidden');
    endUsernameInput.value = username; // default to their current name
    
    // Auto save score to server with the current username
    try {
        await fetch('/api/score', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, score })
        });
        
        // Immediately load the new leaderboard
        fetchLeaderboard();
    } catch (err) {
        console.error('Failed to save score:', err);
    }
}

async function fetchLeaderboard() {
    try {
        const response = await fetch('/api/scores');
        const scores = await response.json();
        
        leaderboardList.innerHTML = '';
        scores.forEach((s) => {
            const li = document.createElement('li');
            li.innerHTML = `<span>${s.username}</span> <span>${s.score}</span>`;
            leaderboardList.appendChild(li);
        });
    } catch (err) {
        leaderboardList.innerHTML = '<li>Error loading scores</li>';
    }
}

// Draw initial frame for background
ctx.fillStyle = 'rgba(5, 5, 16, 1)';
ctx.fillRect(0, 0, canvas.width, canvas.height);

// Listeners
startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', () => {
    // Check if the user wants a new name for the next round
    const newName = endUsernameInput.value.trim();
    if (newName && newName !== username) {
        username = newName;
        usernameInput.value = username; // Update the start screen mirror
    }
    
    gameOverScreen.classList.remove('visible');
    gameOverScreen.classList.add('hidden');
    startGame();
});
