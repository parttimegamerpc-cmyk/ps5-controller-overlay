// Weather Dashboard Script
// Uses OpenWeatherMap API (free tier)

const API_KEY = 'YOUR_API_KEY_HERE'; // Get free key from openweathermap.org
const WEATHER_API_URL = 'https://api.openweathermap.org/data/2.5/weather';
const FORECAST_API_URL = 'https://api.openweathermap.org/data/2.5/forecast';
const AQI_API_URL = 'https://api.openweathermap.org/data/2.5/air_pollution';
const GEO_API_URL = 'https://api.openweathermap.org/geo/1.0/direct';

// DOM Elements
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const locationBtn = document.getElementById('locationBtn');
const suggestionsDiv = document.getElementById('suggestions');
const weatherContent = document.getElementById('weatherContent');
const initialState = document.getElementById('initialState');
const loading = document.getElementById('loading');
const errorMessage = document.getElementById('errorMessage');

// Event Listeners
searchBtn.addEventListener('click', handleSearch);
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSearch();
});
searchInput.addEventListener('input', handleSearchInput);
locationBtn.addEventListener('click', handleGeolocation);

// Weather Icon Mapping
const weatherIcons = {
    '01d': '☀️', '01n': '🌙',
    '02d': '⛅', '02n': '🌙',
    '03d': '☁️', '03n': '☁️',
    '04d': '☁️', '04n': '☁️',
    '09d': '🌧️', '09n': '🌧️',
    '10d': '🌦️', '10n': '🌧️',
    '11d': '⛈️', '11n': '⛈️',
    '13d': '❄️', '13n': '❄️',
    '50d': '🌫️', '50n': '🌫️'
};

// Handle Search
async function handleSearch() {
    const city = searchInput.value.trim();
    if (!city) return;

    await fetchWeatherData(city);
    suggestionsDiv.classList.remove('show');
}

// Handle Search Input for Suggestions
async function handleSearchInput() {
    const query = searchInput.value.trim();
    if (query.length < 2) {
        suggestionsDiv.classList.remove('show');
        return;
    }

    try {
        const response = await fetch(
            `${GEO_API_URL}?q=${query}&limit=5&appid=${API_KEY}`
        );
        
        if (!response.ok) {
            showError('Could not fetch suggestions');
            return;
        }

        const suggestions = await response.json();
        displaySuggestions(suggestions);
    } catch (error) {
        console.error('Suggestion error:', error);
    }
}

// Display Suggestions
function displaySuggestions(suggestions) {
    if (suggestions.length === 0) {
        suggestionsDiv.classList.remove('show');
        return;
    }

    suggestionsDiv.innerHTML = suggestions.map(city => `
        <div class="suggestion-item" onclick="selectCity('${city.name}', ${city.lat}, ${city.lon})">
            <strong>${city.name}</strong>, ${city.state || ''} ${city.country}
        </div>
    `).join('');

    suggestionsDiv.classList.add('show');
}

// Select City from Suggestions
function selectCity(name, lat, lon) {
    searchInput.value = name;
    suggestionsDiv.classList.remove('show');
    fetchWeatherDataByCoords(lat, lon);
}

// Handle Geolocation
function handleGeolocation() {
    if (!navigator.geolocation) {
        showError('Geolocation is not supported by your browser');
        return;
    }

    showLoading(true);
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            fetchWeatherDataByCoords(latitude, longitude);
        },
        (error) => {
            showLoading(false);
            showError('Unable to access your location. Please check permissions.');
            console.error(error);
        }
    );
}

// Fetch Weather Data by City Name
async function fetchWeatherData(city) {
    showLoading(true);
    try {
        // Get coordinates for the city
        const geoResponse = await fetch(
            `${GEO_API_URL}?q=${city}&limit=1&appid=${API_KEY}`
        );

        if (!geoResponse.ok) {
            showError('City not found. Please try another search.');
            showLoading(false);
            return;
        }

        const geoData = await geoResponse.json();
        if (geoData.length === 0) {
            showError('City not found. Please try another search.');
            showLoading(false);
            return;
        }

        const { lat, lon } = geoData[0];
        await fetchWeatherDataByCoords(lat, lon);
    } catch (error) {
        showError('Failed to fetch weather data');
        console.error(error);
        showLoading(false);
    }
}

// Fetch Weather Data by Coordinates
async function fetchWeatherDataByCoords(lat, lon) {
    showLoading(true);
    try {
        // Fetch current weather
        const weatherResponse = await fetch(
            `${WEATHER_API_URL}?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
        );

        if (!weatherResponse.ok) {
            showError('Failed to fetch weather data');
            showLoading(false);
            return;
        }

        const weatherData = await weatherResponse.json();

        // Fetch forecast
        const forecastResponse = await fetch(
            `${FORECAST_API_URL}?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
        );

        const forecastData = forecastResponse.ok 
            ? await forecastResponse.json() 
            : null;

        // Fetch air quality
        const aqiResponse = await fetch(
            `${AQI_API_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}`
        );

        const aqiData = aqiResponse.ok 
            ? await aqiResponse.json() 
            : null;

        // Display all data
        displayCurrentWeather(weatherData);
        if (forecastData) displayForecast(forecastData);
        if (aqiData) displayAirQuality(aqiData);

        showLoading(false);
        showContent();
        hideInitialState();
        hideError();
    } catch (error) {
        showError('Failed to fetch weather data');
        console.error(error);
        showLoading(false);
    }
}

// Display Current Weather
function displayCurrentWeather(data) {
    const { name, sys, main, weather, wind, clouds, visibility } = data;

    document.getElementById('cityName').textContent = `${name}, ${sys.country}`;
    document.getElementById('coordinates').textContent = 
        `Latitude: ${data.coord.lat.toFixed(2)}°, Longitude: ${data.coord.lon.toFixed(2)}°`;
    document.getElementById('lastUpdate').textContent = 
        `Last updated: ${new Date().toLocaleTimeString()}`;

    const icon = weatherIcons[weather[0].icon] || '🌤️';
    document.getElementById('weatherIcon').textContent = icon;
    document.getElementById('temperature').textContent = `${Math.round(main.temp)}°C`;
    document.getElementById('description').textContent = weather[0].description;
    document.getElementById('feelsLike').textContent = 
        `Feels like ${Math.round(main.feels_like)}°C`;

    document.getElementById('humidity').textContent = `${main.humidity}%`;
    document.getElementById('windSpeed').textContent = `${(wind.speed * 3.6).toFixed(1)} km/h`;
    document.getElementById('pressure').textContent = `${main.pressure} hPa`;
    document.getElementById('visibility').textContent = `${(visibility / 1000).toFixed(1)} km`;

    // Additional details
    document.getElementById('uvIndex').textContent = 'API Limited';
    document.getElementById('dewPoint').textContent = calculateDewPoint(main.temp, main.humidity) + '°C';
    document.getElementById('precipitation').textContent = `${(data.rain?.['1h'] || 0)} mm`;
    document.getElementById('windGust').textContent = `${((wind.gust || 0) * 3.6).toFixed(1)} km/h`;
}

// Display Hourly Forecast
function displayForecast(data) {
    const hourlyItems = data.list.slice(0, 8); // First 24 hours
    const hourlyHtml = hourlyItems.map((item, index) => {
        const date = new Date(item.dt * 1000);
        const icon = weatherIcons[item.weather[0].icon] || '🌤️';
        return `
            <div class="hourly-item">
                <div class="hourly-time">${date.getHours()}:00</div>
                <div class="hourly-icon">${icon}</div>
                <div class="hourly-temp">${Math.round(item.main.temp)}°C</div>
            </div>
        `;
    }).join('');

    document.getElementById('hourlyForecast').innerHTML = hourlyHtml;

    // Display 5-Day Forecast
    const dailyData = {};
    data.list.forEach(item => {
        const date = new Date(item.dt * 1000);
        const day = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
        
        if (!dailyData[day]) {
            dailyData[day] = {
                temps: [],
                weather: item.weather[0],
                rain: 0
            };
        }
        dailyData[day].temps.push(item.main.temp);
        dailyData[day].rain += item.rain?.['3h'] || 0;
    });

    const dailyHtml = Object.entries(dailyData).slice(0, 5).map(([day, data]) => {
        const icon = weatherIcons[data.weather.icon] || '🌤️';
        const maxTemp = Math.round(Math.max(...data.temps));
        const minTemp = Math.round(Math.min(...data.temps));
        return `
            <div class="daily-item">
                <div class="daily-day">${day}</div>
                <div class="daily-icon">${icon}</div>
                <div class="daily-temps">
                    <span class="daily-high">${maxTemp}°</span>
                    <span class="daily-low">${minTemp}°</span>
                </div>
                <div class="daily-rain">💧 ${data.rain.toFixed(1)}mm</div>
            </div>
        `;
    }).join('');

    document.getElementById('dailyForecast').innerHTML = dailyHtml;
}

// Display Air Quality
function displayAirQuality(data) {
    const current = data.list[0].components;
    const aqi = data.list[0].main.aqi;

    const aqiLabels = ['Good', 'Fair', 'Moderate', 'Poor', 'Very Poor'];
    const aqiClasses = ['aqi-good', 'aqi-fair', 'aqi-moderate', 'aqi-poor', 'aqi-very-poor'];
    const aqiClass = aqiClasses[aqi - 1] || 'aqi-good';
    const aqiLabel = aqiLabels[aqi - 1] || 'Good';

    const aqiHtml = `
        <div class="aqi-card ${aqiClass}">
            <div class="aqi-label">Air Quality Index</div>
            <div class="aqi-value">${aqi}/5</div>
            <div class="aqi-label">${aqiLabel}</div>
            <div class="aqi-pollutant">PM2.5: ${(current.pm2_5 || 0).toFixed(1)} μg/m³</div>
            <div class="aqi-pollutant">PM10: ${(current.pm10 || 0).toFixed(1)} μg/m³</div>
            <div class="aqi-pollutant">NO₂: ${(current.no2 || 0).toFixed(1)} μg/m³</div>
            <div class="aqi-pollutant">O₃: ${(current.o3 || 0).toFixed(1)} μg/m³</div>
        </div>
    `;

    document.getElementById('aqiSection').innerHTML = aqiHtml;
}

// Calculate Dew Point (simplified formula)
function calculateDewPoint(temp, humidity) {
    const a = 17.27;
    const b = 237.7;
    const alpha = ((a * temp) / (b + temp)) + Math.log(humidity / 100);
    const dewPoint = (b * alpha) / (a - alpha);
    return Math.round(dewPoint);
}

// UI Helper Functions
function showLoading(show) {
    loading.classList.toggle('hidden', !show);
}

function showContent() {
    weatherContent.classList.remove('hidden');
}

function hideInitialState() {
    initialState.classList.add('hidden');
}

function showError(message) {
    errorMessage.textContent = `⚠️ ${message}`;
    errorMessage.classList.add('show');
}

function hideError() {
    errorMessage.classList.remove('show');
}

// Initialize
window.addEventListener('DOMContentLoaded', () => {
    if (!API_KEY || API_KEY === 'YOUR_API_KEY_HERE') {
        showError('⚠️ Weather API key not configured. Get a free key at openweathermap.org');
    }
});