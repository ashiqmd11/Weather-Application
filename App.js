import "./App.css";
import React, { useState } from "react";

function App() {
  // Here we are declaring State Variables
  const [city, setCity] = useState(""); // stores the city entered by user
  const [weather, setWeather] = useState(null); // to store weather info after fetching
  const [error, setError] = useState(""); // to store error messages
  const [loading, setLoading] = useState(false); // keeps track of loading State

  // here is the logic for temperature unit toggle button (C / F)
  const [unit, setUnit] = useState("C");
  const convertTemp = (tempC) => (unit === "C" ? tempC : (tempC * 9) / 5 + 32);

  // Here we are fetching weather data based on the user input
  const getWeather = async () => {
    if (city.trim() === "") {
      setError("⚠️ OOPPS You forgot to enter city name!");
      setWeather(null);
      return;
    }
    // Reset states before we start fetching
    setLoading(true);
    setError("");
    setWeather(null);

    try {
      // Step 1: In step1 we are getting latitude and longitude from geocoding API
      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${city}`
      );
      const geoData = await geoRes.json();
      // Handle case if entered city not found
      if (!geoData.results || geoData.results.length === 0) {
        setError("❌ Sorry City Not found! ");
        return;
      }

      const { latitude, longitude, name, country } = geoData.results[0];

      // Step 2: Fetch Current Weather data using coordinates
      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
      );
      const data = await weatherRes.json();

      const { temperature, windspeed, weathercode } = data.current_weather;

      // Step 3: Here this transalates weather code into a readable emoji + text
      const weatherMap = {
        0: "☀️ Clear Sky",
        1: "🌤️ Mainly Clear",
        2: "⛅ Partly Cloudy",
        3: "☁️ Overcast",
        61: "🌧️ Slight Rain",
        63: "🌧️ Moderate Rain",
        65: "🌧️ Heavy Rain",
        71: "❄️ Slight Snow",
        73: "❄️ Moderate Snow",
        75: "❄️ Heavy Snow",
        80: "🌧️ Rain Showers Light",
        81: "🌧️ Rain Showers Moderate",
        82: "🌧️ Rain Showers Violent",
        95: "⛈️ Thunderstorm",
      };

      const condition =
        weatherMap[weathercode] || "🌍 Weather Info Unavailable";

      // Step 4: Here we save the weather information to state
      setWeather({ name, country, temperature, windspeed, condition });
    } catch (err) {
      //Error Handling
      if (err instanceof TypeError) {
        // This  indicates a network error in fetch
        setError("⚡ Network Error! Please check your internet connection.");
      } else {
        setError("⚡ OOps! Something went wrong while fetching data.");
      }
    } finally {
      setLoading(false);
    }
  };
  // UI Rendering
  return (
    <div className="box">
      <h1>🌦️ Weather App </h1>
      <div className="layout">
        {/* Input field for city*/}
        <input
          type="text"
          placeholder="Enter city"
          value={city}
          onChange={(e) => {
            setCity(e.target.value);
            setError("");
          }}
          onKeyDown={(e) => e.key === "Enter" && getWeather()} // press enter button to search
        />
        <button onClick={getWeather}>Search</button>

        {/* shows Loading / Error */}
        {loading && <p>⏳ Loading... </p>}
        {error && <p className="error">{error}</p>}

        {/* Displays weather Condition  */}
        {weather && (
          <div className="result">
            <h2>
              {weather.name}, {weather.country}
            </h2>
            <p>{weather.condition}</p>
            <p>
              🌡️ Temp: {convertTemp(weather.temperature).toFixed(1)}°{unit}
            </p>
            <p>💨 Wind: {weather.windspeed} km/h</p>
            <button onClick={() => setUnit(unit === "C" ? "F" : "C")}>
              Switch to °{unit === "C" ? "F" : "C"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
