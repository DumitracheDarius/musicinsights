import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
app.use(express.json());

const allowedOrigin = "https://willowy-tapioca-e99011.netlify.app";

app.use(cors({
    origin: allowedOrigin,
    credentials: true
}));

// Redirecționare pentru scraping
app.post('/scrape', async (req, res) => {
    try {
        const response = await fetch('http://139.59.140.159:8000/scrape', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(req.body)
        });

        const data = await response.json();
        res.status(200).json(data);
    } catch (error) {
        console.error('Error forwarding request:', error);
        res.status(500).json({ error: 'Failed to forward request' });
    }
});

// Redirecționare pentru imagini
app.get('/images/:filename', async (req, res) => {
    const { filename } = req.params;
    try {
        const response = await fetch(`http://139.59.140.159:8000/images/${filename}`);
        const buffer = await response.buffer();
        res.set('Content-Type', 'image/png');
        res.send(buffer);
    } catch (error) {
        console.error('Error fetching image:', error);
        res.status(500).send('Failed to fetch image');
    }
});

// Redirecționare pentru download CSV
app.get('/download', async (req, res) => {
    const { song, artist } = req.query;
    try {
        const response = await fetch(`http://139.59.140.159:8000/download?song=${encodeURIComponent(song)}&artist=${encodeURIComponent(artist)}`);
        const buffer = await response.buffer();
        res.set('Content-Type', 'text/csv');
        res.set('Content-Disposition', `attachment; filename="${song}_${artist}_tiktok.csv"`);
        res.send(buffer);
    } catch (error) {
        console.error('Error fetching CSV:', error);
        res.status(500).send('Failed to fetch CSV');
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Proxy server running on port ${PORT}`);
});
