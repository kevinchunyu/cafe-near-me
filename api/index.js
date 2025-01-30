require('dotenv').config();

const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
// api key
const API_KEY = process.env.API_KEY;

app.use(cors());
app.use(express.json());

// API route to get flight data
app.get('/flights', async (req, res) => {
    try {
        const { airline_name, airline_iata, airline_icao } = req.query;
        if (!airline_name && !airline_iata && !airline_icao) {
            return res.status(400).json({ error: 'Provide airline_name, airline_iata, or airline_icao' });
        }

        const params = {
            access_key: API_KEY,
            ...(airline_name && { airline_name }),
            ...(airline_iata && { airline_iata }),
            ...(airline_icao && { airline_icao }),
        };

        const response = await axios.get('https://api.aviationstack.com/v1/flights', { params });
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching flight data:', error);
        res.status(500).json({ error: 'Failed to fetch flight data' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`server running on http://localhost:${PORT}`);
});
