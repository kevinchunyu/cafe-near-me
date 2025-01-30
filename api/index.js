const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// set api key
const API_KEY = process.env.API_KEY;

// API route to get flight data
app.get('/flights', async (req, res) => {
    try {
        const { airline_name, airline_iata, airline_icao } = req.query;
        // error checking
        // if (!airline_name && !airline_iata && !airline_icao) {
        //     return res.status(400).json({ error: 'Please provide one of the following: airline_name, airline_iata, or airline_icao' });
        // }

        const params = {
            access_key: API_KEY,
            ...(airline_name && { airline_name }),
            ...(airline_iata && { airline_iata }),
            ...(airline_icao && { airline_icao }),
            flight_status: 'active'
        };

        const response = await axios.get('https://api.aviationstack.com/v1/flights', { params });
        const apiResponse = response.data;
        res.json({ apiResponse });

    } catch (error) {
        console.error('Error fetching flight data:', error);
        res.status(500).json({ error: 'Failed to fetch flight data' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
