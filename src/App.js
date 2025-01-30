import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import airportsData from './airports.json';
import * as turf from '@turf/turf';


function App() {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const [airline, setAirline] = useState('');
  const [flights, setFlights] = useState([]);

  // initialize map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: 'https://tiles.stadiamaps.com/styles/alidade_smooth.json',
      center: [0, 0],
      zoom: 2,
    });

    mapRef.current = map;
    return () => map.remove();
  }, []);

  // get map from backend api
  const fetchFlights = async () => {
    if (!airline) return alert("Please enter an airline_name, airline_iata, or airline_icao");

    try {
      const response = await fetch(`http://localhost:3000/flights?airline_icao=${airline}`);
      const data = await response.json();
      if (response.ok) {
        if (!data.apiResponse || !Array.isArray(data.apiResponse.data)) {
            return alert("No valid flight data found.");
        }

        const filteredFlights = data.apiResponse.data.filter(flight => flight.codeshared == null);
        setFlights(filteredFlights || []);
        addFlightRoutes(filteredFlights || []);
      } else {
        alert(data.error || "Error fetching flight data");
      }
    } catch (err) {
      console.error("Error:", err);
      alert("Failed to fetch flight data");
    }
  };

  // find airport coordinates by ICAO using airports.json
  const getAirportCoordinates = (icao) => {
    const airport = airportsData[icao];
    return airport ? { latitude: airport.lat, longitude: airport.lon } : null;
  };

  // add all routes
  const addFlightRoutes = (flights) => {
    if (!mapRef.current) {
        console.error("Map is not initialized yet!");
        return;
    }

    const routeFeatures = [];

    flights.forEach(flight => {
        const departureCoords = getAirportCoordinates(flight.departure.icao, flight.departure.iata) || {
            latitude: flight?.departure?.latitude,
            longitude: flight?.departure?.longitude
        };

        const arrivalCoords = getAirportCoordinates(flight.arrival.icao, flight.arrival.iata) || {
            latitude: flight?.arrival?.latitude,
            longitude: flight?.arrival?.longitude
        };

        // draw curved flight route if both locations exist
        if (departureCoords.latitude && departureCoords.longitude && arrivalCoords.latitude && arrivalCoords.longitude) {
            const start = turf.point([departureCoords.longitude, departureCoords.latitude]);
            const end = turf.point([arrivalCoords.longitude, arrivalCoords.latitude]);

            // get shortest path
            const curvedRoute = turf.greatCircle(start, end, {
                npoints: 100,
                properties: { arc: true }
            });

            routeFeatures.push({
                type: "Feature",
                geometry: curvedRoute.geometry,
                properties: {
                    flightNumber: flight.flight.iata,
                    airline: flight.airline.name
                }
            });
        }
    });

    if (mapRef.current.getSource("flightRoutes")) {
        mapRef.current.getSource("flightRoutes").setData({
            type: "FeatureCollection",
            features: routeFeatures
        });
    } else {
        mapRef.current.addSource("flightRoutes", {
            type: "geojson",
            data: {
                type: "FeatureCollection",
                features: routeFeatures
            }
        });

        mapRef.current.addLayer({
            id: "flightRoutesLayer",
            type: "line",
            source: "flightRoutes",
            layout: {
                "line-join": "round",
                "line-cap": "round"
            },
            paint: {
                "line-color": "#1E90FF",
                "line-width": 1.0,
                "line-opacity": 0.8
            }
        });
    }
  };
  return (
    <div style={{ width: '100vw', height: '100vh', position: 'fixed', top: 0, left: 0 }}>
      {}
      <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 1000, background: 'white', padding: '10px', borderRadius: '5px' }}>
        <input
          type="text"
          placeholder="Enter Airline ICAO (e.g., ASA)"
          value={airline}
          onChange={(e) => setAirline(e.target.value)}
          style={{ padding: '5px', marginRight: '5px' }}
        />
        <button onClick={fetchFlights}>Search Flights</button>
      </div>

      {}
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
}

export default App;
