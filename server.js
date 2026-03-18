const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const SCORES_FILE = path.join(__dirname, 'scores.json');

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Initialize scores file if it doesn't exist
if (!fs.existsSync(SCORES_FILE)) {
    fs.writeFileSync(SCORES_FILE, JSON.stringify([]));
}

// Endpoint to fetch top scores
app.get('/api/scores', (req, res) => {
    try {
        const data = fs.readFileSync(SCORES_FILE, 'utf8');
        let scores = JSON.parse(data);
        // Sort descending by score
        scores.sort((a, b) => b.score - a.score);
        res.json(scores.slice(0, 10)); // return top 10
    } catch (err) {
        console.error('Error reading scores:', err);
        res.status(500).json({ error: 'Failed to read scores' });
    }
});

// Endpoint to save a new score
app.post('/api/score', (req, res) => {
    const { username, score } = req.body;
    
    if (!username || typeof score !== 'number') {
        return res.status(400).json({ error: 'Invalid data. Requires username and score.' });
    }

    try {
        const data = fs.readFileSync(SCORES_FILE, 'utf8');
        const scores = JSON.parse(data);
        
        scores.push({
            username,
            score,
            date: new Date().toISOString()
        });

        fs.writeFileSync(SCORES_FILE, JSON.stringify(scores, null, 2));
        res.json({ success: true, message: 'Score saved!' });
    } catch (err) {
        console.error('Error saving score:', err);
        res.status(500).json({ error: 'Failed to save score' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
