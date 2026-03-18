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

// Entity Arrays
let projectiles = [];
let aliens = [];
let particles = [];
let stars = [];

// Retro Sprites
// 1 = solid, 2 = engine flame
const JET_SPRITE = [
    [0,0,0,0,1,0,0,0,0],
    [0,0,0,1,1,1,0,0,0],
    [0,0,0,1,1,1,0,0,0],
    [0,1,1,1,1,1,1,1,0],
    [1,1,1,1,1,1,1,1,1],
    [1,1,0,1,1,1,0,1,1],
    [1,0,0,1,0,1,0,0,1],
    [0,0,0,2,0,2,0,0,0]
];

// Classic Alien
const ALIEN_SPRITE = [
    [0,0,1,0,0,0,0,0,1,0,0],
    [0,0,0,1,0,0,0,1,0,0,0],
    [0,0,1,1,1,1,1,1,1,0,0],
    [0,1,1,0,1,1,1,0,1,1,0],
    [1,1,1,1,1,1,1,1,1,1,1],
    [1,0,1,1,1,1,1,1,1,0,1],
    [1,0,1,0,0,0,0,0,1,0,1],
    [0,0,0,1,1,0,1,1,0,0,0]
];

function drawSprite(sprite, startX, startY, scale, color1, color2) {
    for (let r = 0; r < sprite.length; r++) {
        for (let c = 0; c < sprite[r].length; c++) {
            if (sprite[r][c] === 1) {
                ctx.fillStyle = color1;
                ctx.fillRect(startX + c * scale, startY + r * scale, scale, scale);
            } else if (sprite[r][c] === 2 && color2) {
                ctx.fillStyle = color2;
                ctx.fillRect(startX + c * scale, startY + r * scale, scale, scale);
            }
        }
    }
}

// Player Configuration
const player = {
    x: 0,
    y: 0,
    width: 36, // 9 cols * 4 scale
    height: 32, // 8 rows * 4 scale
    scale: 4,
    color: '#00ffff'
};

// Set canvas dimensions
function resizeCanvas() {
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    player.x = canvas.width / 2;
    player.y = canvas.height - 60;
    
    // Reinit starfield
    stars = [];
    for(let i=0; i<80; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            speed: Math.random() * 3 + 1,
            size: Math.random() * 3 + 1
        });
    }
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
        this.width = 4;
        this.height = 15;
        this.color = '#ffff00';
    }

    draw() {
        ctx.fillStyle = this.color;
        // Draw laser relative to center
        ctx.fillRect(this.x - this.width/2, this.y - this.height/2, this.width, this.height);
    }

    update() {
        this.draw();
        this.x += this.velocity.x;
        this.y += this.velocity.y;
    }
}

class Alien {
    constructor(x, y, scale, color, velocity) {
        this.x = x;
        this.y = y;
        this.scale = scale;
        this.width = 11 * scale; // 11 cols
        this.height = 8 * scale; // 8 rows
        this.color = color;
        this.velocity = velocity;
        
        // Wobble effect
        this.startX = x;
        this.wobblePhase = Math.random() * Math.PI * 2;
    }

    draw() {
        // Draw centered
        const sX = this.x - this.width/2;
        const sY = this.y - this.height/2;
        drawSprite(ALIEN_SPRITE, sX, sY, this.scale, this.color);
    }

    update() {
        this.draw();
        // Add Galaga style wobble
        this.wobblePhase += 0.05;
        this.x = this.startX + Math.sin(this.wobblePhase) * 30;
        this.y += this.velocity.y;
    }
}

class Particle {
    constructor(x, y, velocity, size, color) {
        this.x = x;
        this.y = y;
        this.velocity = velocity;
        this.size = size;
        this.color = color;
        this.life = 1.0;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.size, this.size);
    }

    update() {
        this.draw();
        this.velocity.x *= 0.95; 
        this.velocity.y *= 0.95;
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        this.life -= 0.04;
    }
}

// --- Spawning Logic ---

let spawnInterval;
function spawnAliens() {
    spawnInterval = setInterval(() => {
        if (!isPlaying) return;
        
        const scale = 3 + Math.floor(Math.random()*2);
        const width = 11 * scale;
        const x = Math.random() * (canvas.width - width * 2) + width;
        const y = -width;
        
        const speedMultiplier = 1 + score * 0.02;
        const velocity = {
            x: 0,
            y: (Math.random() * 1 + 0.5) * speedMultiplier
        };
        
        const colors = ['#ff0055', '#00ff00', '#ff00ff', '#ffff00'];
        const color = colors[Math.floor(Math.random() * colors.length)];

        aliens.push(new Alien(x, y, scale, color, velocity));
    }, 1500); 
}

// --- Controls ---

function shootProjectile(targetPos) {
    const dx = targetPos.x - player.x;
    const dy = targetPos.y - player.y;
    const angle = Math.atan2(dy, dx);
    const power = 15; // Laser speed
    
    const velocity = {
        x: Math.cos(angle) * power,
        y: Math.sin(angle) * power
    };

    projectiles.push(new Projectile(player.x, player.y - player.height/2, velocity));
}

canvas.addEventListener('mousedown', (e) => {
    if (!isPlaying) return;
    shootProjectile(getMousePos(e));
});

canvas.addEventListener('touchstart', (e) => {
    if (!isPlaying) return;
    e.preventDefault();
    shootProjectile(getMousePos(e));
});

// --- Explosions ---

function createParticles(x, y, color) {
    for (let i = 0; i < 20; i++) {
        const velocity = {
            x: (Math.random() - 0.5) * 8,
            y: (Math.random() - 0.5) * 8
        };
        particles.push(new Particle(x, y, velocity, Math.random() * 4 + 2, color));
    }
}

// --- Main Game Loop ---

function animate() {
    if (!isPlaying) return;
    animationId = requestAnimationFrame(animate);

    // Draw solid black background
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Animate Starfield
    ctx.fillStyle = '#ffffff';
    stars.forEach(star => {
        star.y += star.speed;
        if(star.y > canvas.height) star.y = 0;
        ctx.fillRect(star.x, star.y, star.size, star.size);
    });

    // Draw Player Jet (Engine flame toggles)
    const flameColor = Math.random() > 0.5 ? '#ff9900' : '#ff0000';
    drawSprite(JET_SPRITE, player.x - player.width/2, player.y - player.height/2, player.scale, player.color, flameColor);

    // Update Particles
    for (let i = particles.length - 1; i >= 0; i--) {
        const particle = particles[i];
        if (particle.life <= 0) {
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
        if (projectile.x + projectile.width < 0 || 
            projectile.x - projectile.width > canvas.width || 
            projectile.y + projectile.height < 0 || 
            projectile.y - projectile.height > canvas.height) {
            projectiles.splice(i, 1);
        }
    }

    // Update Aliens
    for (let alienIndex = aliens.length - 1; alienIndex >= 0; alienIndex--) {
        const alien = aliens[alienIndex];
        alien.update();

        // Game Over condition: hits bottom level
        if (alien.y + alien.height/2 >= player.y - player.height/2) {
            endGame();
            return;
        }

        // Projectile hit detection (AABB bounding box simple approx using radius distances)
        for (let projectileIndex = projectiles.length - 1; projectileIndex >= 0; projectileIndex--) {
            const projectile = projectiles[projectileIndex];
            const dist = Math.hypot(projectile.x - alien.x, projectile.y - alien.y);
            
            // Simple circular collision check using generalized dimension mapped to radius
            const approxAlienRad = alien.width/2.5; 
            const approxProjRad = projectile.height/2;

            if (dist - approxAlienRad - approxProjRad < 1) {
                // Remove projectile
                projectiles.splice(projectileIndex, 1);
                createParticles(alien.x, alien.y, alien.color);
                
                // Explode alien 
                aliens.splice(alienIndex, 1);
                score += 15;
                scoreDisplay.innerText = score;
                break; // Alien destroyed
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
    endUsernameInput.value = username; 
    
    try {
        await fetch('/api/score', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, score })
        });
        
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

// Initial Drawing
ctx.fillStyle = '#000000';
ctx.fillRect(0, 0, canvas.width, canvas.height);

// Listeners
startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', () => {
    const newName = endUsernameInput.value.trim();
    if (newName && newName !== username) {
        username = newName;
        usernameInput.value = username; 
    }
    
    gameOverScreen.classList.remove('visible');
    gameOverScreen.classList.add('hidden');
    startGame();
});
