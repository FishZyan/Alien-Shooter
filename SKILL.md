---
name: Neon Slingshot Defense Context
description: Core architecture and mechanics overview for the Alien Shooter game.
---

# Neon Slingshot Defense - Game Architecture & Context

This document provides context for AI assistants working on this repository to help understand the current state, mechanics, and design patterns used in the game.

## Tech Stack
- **Frontend**: Vanilla HTML5 Canvas, JavaScript (ES6+), CSS3.
- **Backend / Score Server**: Node.js, Express.js. Serves static files and provides a simple REST API (`/api/score`, `/api/scores`) to read/write a JSON leaderboard (`scores.json`).
- **Styling**: Retro neon arcade aesthetic. Neon glow effects, CSS drop-shadows, and "Press Start 2P" font (via Google Fonts). UI overlays use a frosted-glass panel effect (`backdrop-filter`) over the running canvas animation.

## Core Game Loop & Attract Mode
- **`animate()` loop**: The game utilizes a single continuous `requestAnimationFrame` loop. 
- **Attract Mode**: Even when the game is not active (`isPlaying = false` during Start/Game Over menus), the background stars move at 3x speed, and the player jet organically bobs up and down, creating an endless "flying through space" animation visible behind the semi-transparent CSS glass panels.

## Core Mechanics
- **Player Movement**: The player (a jet) is **stationary** at the bottom center.
- **Shooting**: The player clicks or taps anywhere on the screen. A projectile is fired from the jet towards the cursor/touch position. Shooting reduces the score by 1 point (minimum 0).
- **Game Over**: If any alien touches the vertical level of the player, the game ends immediately.

## Entities
All entities are handled via parallel arrays (`projectiles`, `aliens`, `particles`, `powerUps`) updated and drawn in the `animate` loop.
- **Aliens**: Spawn slightly above the top of the canvas and move downward with a Galaga-style sine-wave wobble. Red explosions (particles) occur on death, granting +15 points.
- **Projectiles**: Move straight toward their initial target vector. They support **penetration** (hitting multiple targets before decaying).
- **Power-Ups**: Spawn randomly between 5 to 15 seconds from just off either the left or right edges of the screen, floating horizontally across while bobbing and pulsing. **Players must shoot a power-up to collect it**.
- **Particles**: Simple physics-based square particles used for colorful explosion effects.

## Power-Up System
Power-ups are rendered as pulsing retro neon outlines with a dark core.
1. **F (Freeze)**: <span style="color:#00ffff;">Cyan Outline</span>. Slows alien movement and background star animation by 50% for 5 seconds.
2. **E (Extra Shot)**: <span style="color:#ffff00;">Yellow Outline</span>. Increases the player's bullet count up to a maximum of 5, causing the jet to shoot in a spread formation.
3. **P (Penetration)**: <span style="color:#00ff00;">Green Outline</span>. Allows a single projectile to slice through up to 3 enemies before disappearing.
4. **K (Kill All)**: <span style="color:#ff0055;">Red Outline</span>. Instantly acts as a screen wipe, destroying every alien on screen and immediately awarding points.

## Sound System (Web Audio API)
Audio is generated procedurally using the native browser **Web Audio API** (no external `.mp3`/`.wav` files needed!). 
- **`initAudio()`**: Initializes the `AudioContext` upon the first user interaction (clicking Start/Restart).
- **`playSound(type)`**: Triggers synthesized oscillators:
  - `shoot`: Square wave sweeping rapidly down.
  - `explode`: Sawtooth noise sweep.
  - `powerup`: Sine wave fast ascending arpeggio.
  - `gameover`: Square wave long slow descent.

## Development Rules
When extending the code:
- Maintain the single `animate()` loop architecture in `game.js`.
- Always respect the `isPlaying` flag to pause gameplay interactions while keeping the visual attract mode alive.
- All visual drawing should remain pure Canvas 2D without requiring new external image assets. Stick to procedural shapes or 2D matrix arrays (pixel art strings like `JET_SPRITE` and `ALIEN_SPRITE`).
- Continue building on the WebAudio synthesizer for any new sound effects.
