# Neon Alien Shooter

An authentic 8-bit retro arcade defense game built with HTML5 Canvas and Node.js. Pilot a pixel-art Fighter Jet to defend against a descending horde of classic aliens in a gorgeous parallax starfield!

## Features
- **Point-and-Click Action**: Simply click anywhere on the game canvas, and your jet instantly fires a high-speed laser beam towards your target.
- **Retro Aesthetics**: Everything from the UI, color palettes, fonts (`Press Start 2P`), and sprites are designed to emulate nostalgic arcade cabinets.
- **Power-Ups**: 
  - **Time Slow (Cyan 'T')**: Shoot this power-up to reduce alien falling speed and the starfield speed by 50% for 5 seconds.
  - **Multi-Shot (Yellow 'M')**: Shoot this power-up to permanently widen your blaster with additional laser beams. You can collect up to 5 of these for a massive 6-laser fan spray!
- **Active Leaderboard**: A built-in backend server automatically tracks and saves your high scores in real-time, showing the Top 10 players on the Game Over screen.
- **Score Mechanics**: Alien takedowns grant +15 points, but be careful—every shot fired deducts 1 point from your active score!

## Prerequisites
To run the local server, you will need to have [Node.js](https://nodejs.org/) installed.

## How to Run

1. Open a terminal or command prompt inside this project folder.
2. Install the lightweight dependencies (Express / CORS) by running:
   ```bash
   npm install
   ```
3. Start the game server using:
   ```bash
   node server.js
   ```
4. Open your favorite web browser and navigate to:
   [http://localhost:3000](http://localhost:3000)

## Running with Docker
If you're deploying this to a remote server or want to isolate the application using Docker, a `Dockerfile` is provided.

1. Build the Docker image:
   ```bash
   docker build -t neon-alien-shooter .
   ```
2. Run the container:
   ```bash
   docker run -p 3000:3000 -d neon-alien-shooter
   ```
*(Optional)*: If you want to ensure your `scores.json` leaderboard data survives container restarts, you can mount it to a local volume:
   ```bash
   # Create a blank scores.json first locally if it doesn't exist:
   touch scores.json
   
   # Run with volume mount:
   docker run -p 3000:3000 -v $(pwd)/scores.json:/app/scores.json -d neon-alien-shooter
   ```

## Gameplay Instructions
- Upon opening the page, enter your name and hit **START GAME**.
- Move your mouse around; a built-in crosshair line on the Fighter Jet will follow your cursor to help you aim.
- Left-click freely to fire lasers at the descending aliens and passing power-ups.
- Avoid letting any alien safely reach the bottom of the screen (the height of your jet). If even one alien slips past your defenses, it's **Game Over**.
- If you want to log your next attempt under a different player name, simply change the name in the text box before clicking **PLAY AGAIN**.
