// ============================================
// 🌍 AIR·WEATHER MAP - COMPLETE SCRIPT
// ============================================

const API_BASE = 'air-weather-backend-production.up.railway.app/api';  // Relative URL for deployment

// ============================================
// 📱 MOBILE DETECTION & UI CONTROLS
// ============================================
const isMobile = window.matchMedia('(max-width: 768px)').matches;
const mobileLoadingOverlay = document.getElementById('mobileLoadingOverlay');
const infoPanel = document.getElementById('infoPanel');
const panelCloseBtn = document.getElementById('panelCloseBtn');

// Initialize mobile state: map full screen, panel hidden
if (isMobile) {
    infoPanel.classList.remove('active');
    // Ensure placeholders/content are not visible
    document.querySelector('.panel-placeholder')?.classList.remove('active');
    document.querySelector('.panel-content')?.classList.remove('active');
} else {
    // Desktop: panel always visible in split view
    infoPanel.classList.add('active');
}

// ============================================
// 🧭 PANEL CLOSE BUTTON HANDLER
// ============================================
if (panelCloseBtn) {
    panelCloseBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        if (isMobile) {
            infoPanel.classList.remove('active');
            // Also hide any active content placeholders
            document.querySelector('.panel-placeholder')?.classList.remove('active');
            document.querySelector('.panel-content')?.classList.remove('active');
        }
    });
}

// ============================================
// 📊 AQI LEVEL HELPER
// ============================================
function getAQILevel(aqi) {
    if (aqi <= 50) return { label: 'Good', color: '#00E400', level: 1 };
    if (aqi <= 100) return { label: 'Moderate', color: '#FFFF00', level: 2 };
    if (aqi <= 150) return { label: 'Unhealthy for Sensitive Groups', color: '#FF7E00', level: 3 };
    if (aqi <= 200) return { label: 'Unhealthy', color: '#FF0000', level: 4 };
    if (aqi <= 300) return { label: 'Very Unhealthy', color: '#8B4C39', level: 5 };
    return { label: 'Hazardous', color: '#8B0000', level: 6 };
}

const pollutantNames = {
    pm2_5: 'PM2.5', pm10: 'PM10', co: 'CO',
    no2: 'NO₂', so2: 'SO₂', o3: 'O₃'
};

// ============================================
// ⏱️ DEBOUNCE UTILITY
// ============================================
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ============================================
// 📏 DISTANCE CALCULATION (Haversine)
// ============================================
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

function deg2rad(deg) {
    return deg * (Math.PI/180);
}

// ============================================
// 📈 AQI HISTORY CHART
// ============================================
let aqiChart = null;

function updateAQIHistoryChart(history) {
    const canvas = document.getElementById('aqiHistoryChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    if (aqiChart) {
        aqiChart.destroy();
    }
    
    const times = history.map(item => {
        const date = new Date(item.time);
        return date.getHours() + ':00';
    });
    
    const values = history.map(item => item.value);
    
    aqiChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: times,
            datasets: [{
                label: 'AQI',
                data: values,
                borderColor: '#66BB6A',
                backgroundColor: 'rgba(102, 187, 106, 0.1)',
                borderWidth: 2,
                pointRadius: 3,
                pointHoverRadius: 5,
                pointBackgroundColor: '#66BB6A',
                tension: 0.3,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: '#1e2f3a',
                    titleColor: '#fff',
                    bodyColor: '#ddd',
                    borderColor: '#66BB6A',
                    borderWidth: 1
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(255, 255, 255, 0.1)' },
                    ticks: { color: '#999' }
                },
                x: {
                    grid: { display: false },
                    ticks: { color: '#999', maxRotation: 45, minRotation: 45 }
                }
            }
        }
    });
}

// ============================================
// ☁️ WEATHER ICON
// ============================================
function updateWeatherIcon(code) {
    const iconContainer = document.getElementById('weatherIcon');
    if (!iconContainer) return;
    
    iconContainer.innerHTML = '';
    
    const icon = document.createElement('i');
    icon.style.fontSize = '50px';
    icon.style.color = '#66BB6A';
    
    if (code === 0) icon.className = 'fas fa-sun';
    else if (code === 1 || code === 2) icon.className = 'fas fa-cloud-sun';
    else if (code === 3) icon.className = 'fas fa-cloud';
    else if (code >= 45 && code <= 48) icon.className = 'fas fa-smog';
    else if (code >= 51 && code <= 55) icon.className = 'fas fa-cloud-rain';
    else if (code >= 61 && code <= 65) icon.className = 'fas fa-cloud-showers-heavy';
    else if (code >= 71 && code <= 77) icon.className = 'fas fa-snowflake';
    else if (code >= 80 && code <= 82) icon.className = 'fas fa-cloud-rain';
    else if (code >= 85 && code <= 86) icon.className = 'fas fa-snowflake';
    else if (code >= 95) icon.className = 'fas fa-cloud-bolt';
    else icon.className = 'fas fa-cloud';
    
    iconContainer.appendChild(icon);
}

// ============================================
// 🧪 POLLUTANTS GRID
// ============================================
function updatePollutants(components) {
    if (!components) return;
    const grid = document.getElementById('pollutantsGrid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    let hasData = false;
    Object.entries(components).forEach(([key, value]) => {
        if (pollutantNames[key] && value > 0) {
            hasData = true;
            const item = document.createElement('div');
            item.className = 'pollutant-item';
            item.innerHTML = `
                <span class="symbol">${pollutantNames[key]}</span>
                <span class="value">${value.toFixed(1)}</span>
                <span style="font-size: 0.7rem; color: #999;">μg/m³</span>
            `;
            grid.appendChild(item);
        }
    });
    
    if (!hasData) {
        grid.innerHTML = '<div style="grid-column: span 3; text-align: center; color: #999; padding: 1.5rem;">No data available</div>';
    }
}

// ============================================
// ⏳ LOADING SKELETONS
// ============================================
function showLoadingSkeletons() {
    const skeletons = [
        'aqiValue', 'tempValue', 'humidity', 'windSpeed',
        'pressureValue', 'cloudCoverValue', 'dewPointValue',
        'visibilityValue', 'precipValue', 'precipProbValue'
    ];
    
    skeletons.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.classList.add('skeleton');
        }
    });
}

function hideLoadingSkeletons() {
    const skeletons = document.querySelectorAll('.skeleton');
    skeletons.forEach(element => {
        element.classList.remove('skeleton');
    });
}

// ============================================
// 🔔 TOAST NOTIFICATION
// ============================================
function showToast(message, type = 'info') {
    // Remove existing toast if any
    const existingToast = document.querySelector('.toast-notification');
    if (existingToast) existingToast.remove();
    
    const toast = document.createElement('div');
    toast.className = `toast-notification ${type}`;
    toast.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ============================================
// 🟢 LOADING / ERROR UI STATES
// ============================================
function showLoading() {
    const status = document.getElementById('apiStatus');
    if (!status) return;
    
    status.innerHTML = '<i class="fas fa-circle"></i> Loading...';
    status.style.background = 'rgba(255, 165, 0, 0.15)';
    status.style.color = '#FFD700';
}

function hideLoading() {
    const status = document.getElementById('apiStatus');
    if (!status) return;
    
    status.innerHTML = '<i class="fas fa-circle"></i> Connected';
    status.style.background = 'rgba(0, 200, 100, 0.15)';
    status.style.color = '#A0FFC0';
}

function showError(message) {
    const status = document.getElementById('apiStatus');
    if (status) {
        status.innerHTML = '<i class="fas fa-circle"></i> Error';
        status.style.background = 'rgba(255, 0, 0, 0.15)';
        status.style.color = '#FFA0A0';
    }
    showToast(message, 'error');
}

// ============================================
// 🎯 FETCH CITY DATA (OVERRIDDEN FOR MOBILE)
// ============================================
async function fetchCityData(lat, lon, cityName = null) {
    try {
        // Mobile: show loading overlay
        if (isMobile && mobileLoadingOverlay) {
            mobileLoadingOverlay.classList.add('active');
        }
        
        showLoading();
        showLoadingSkeletons();
        
        lat = parseFloat(lat);
        lon = parseFloat(lon);
        
        if (isNaN(lat) || isNaN(lon)) {
            throw new Error('Invalid coordinates');
        }
        
        const response = await fetch(`${API_BASE}/weather-aqi/${lat}/${lon}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error);
        }
        
        // Update UI with data
        updateUI(data, lat, lon);
        
        // Mobile: hide loading overlay and show panel
        if (isMobile) {
            if (mobileLoadingOverlay) {
                mobileLoadingOverlay.classList.remove('active');
            }
            infoPanel.classList.add('active');
        }
        
        hideLoading();
        hideLoadingSkeletons();
        showToast('Data updated successfully', 'success');
        
    } catch (error) {
        console.error('Fetch error:', error);
        hideLoading();
        hideLoadingSkeletons();
        showToast(error.message || 'Failed to fetch data', 'error');
        
        // Mobile: hide loading overlay on error
        if (isMobile && mobileLoadingOverlay) {
            mobileLoadingOverlay.classList.remove('active');
        }
    }
}

// Debounced version for map clicks
const debouncedFetchCityData = debounce(fetchCityData, 300);

// Override global fetchCityData (used by map markers)
window.fetchCityData = function(lat, lon, cityName) {
    debouncedFetchCityData(lat, lon, cityName);
};

// ============================================
// 🖼️ UPDATE UI - FULL VERSION (UNCHANGED)
// ============================================
function updateUI(data, lat, lon) {
    // Hide skeletons
    hideLoadingSkeletons();
    
    // Activate content panel, deactivate placeholder
    document.querySelector('.panel-placeholder')?.classList.remove('active');
    document.querySelector('.panel-content')?.classList.add('active');
    
    // ========== LOCATION INFO ==========
    document.getElementById('cityName').textContent = data.city || 'Unknown';
    document.getElementById('countryBadge').textContent = data.country || '--';
    document.getElementById('cityState').textContent = data.state || '';
    document.getElementById('coordText').textContent = `${parseFloat(lat).toFixed(4)}°, ${parseFloat(lon).toFixed(4)}°`;
    
    // ========== FEATURE 13: LOCAL TIME ==========
    if (document.getElementById('localTimeValue')) {
        const localTime = new Date(data.localTime || Date.now());
        document.getElementById('localTimeValue').textContent = localTime.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
        });
        document.getElementById('localDateValue').textContent = localTime.toLocaleDateString([], {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });
        document.getElementById('timezoneValue').textContent = data.timezone || 'UTC';
    }
    
    // ========== FEATURE 1: SUNRISE & SUNSET ==========
    if (document.getElementById('sunriseValue')) {
        document.getElementById('sunriseValue').textContent = data.sunrise || '--:--';
        document.getElementById('sunsetValue').textContent = data.sunset || '--:--';
    }
    
    // ========== FEATURE 14: DISTANCE CALCULATOR ==========
    if (document.getElementById('distanceValue') && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const userLat = position.coords.latitude;
                const userLon = position.coords.longitude;
                const distance = getDistanceFromLatLonInKm(userLat, userLon, lat, lon);
                
                document.getElementById('distanceValue').textContent = `${distance.toFixed(1)} km`;
                document.getElementById('distanceFromYou').innerHTML = `
                    <i class="fas fa-location-arrow"></i> ${distance.toFixed(1)} km from you
                `;
            },
            (error) => {
                document.getElementById('distanceValue').textContent = '-- km';
                document.getElementById('distanceFromYou').innerHTML = `
                    <i class="fas fa-location-dot"></i> Enable location
                `;
            }
        );
    }
    
    // ========== AQI ==========
    const aqiValue = data.aqi?.value || 0;
    const aqiLevel = getAQILevel(aqiValue);
    document.getElementById('aqiValue').textContent = aqiValue;
    document.getElementById('aqiLabel').textContent = aqiLevel.label;
    document.getElementById('aqiLabel').style.color = aqiLevel.color;
    
    const gaugeIndicator = document.querySelector('.aqi-gauge-indicator');
    if (gaugeIndicator) {
        let percentage = Math.min((aqiValue / 300) * 100, 100);
        gaugeIndicator.style.left = `${percentage}%`;
    }
    
    // ========== POLLUTANTS ==========
    updatePollutants(data.aqi?.components);
    
    // ========== FEATURE 11: AQI HISTORY CHART ==========
    if (data.aqi?.history && data.aqi.history.length > 0) {
        updateAQIHistoryChart(data.aqi.history);
    }
    
    // ========== WEATHER BASICS ==========
    document.getElementById('tempValue').textContent = data.weather?.temperature?.toFixed(1) || '--';
    document.getElementById('weatherDesc').textContent = data.weather?.description || '--';
    document.getElementById('feelsLike').textContent = data.weather?.feels_like ? `${data.weather.feels_like.toFixed(1)}°C` : '--°C';
    document.getElementById('humidity').textContent = data.weather?.humidity ? `${data.weather.humidity}%` : '--%';
    document.getElementById('windSpeed').textContent = data.weather?.wind_speed ? `${(data.weather.wind_speed * 3.6).toFixed(1)} km/h` : '-- km/h';
    
    // ========== FEATURE 5: CLOUD COVER ==========
    if (document.getElementById('cloudCoverValue')) {
        document.getElementById('cloudCoverValue').textContent = data.weather?.cloud_cover !== undefined ? `${data.weather.cloud_cover}%` : '--%';
    }
    
    // ========== FEATURE 4: DEW POINT ==========
    if (document.getElementById('dewPointValue')) {
        document.getElementById('dewPointValue').textContent = data.weather?.dew_point !== undefined ? `${data.weather.dew_point.toFixed(1)}°C` : '--°C';
    }
    
    // ========== FEATURE 3: VISIBILITY ==========
    if (document.getElementById('visibilityValue')) {
        document.getElementById('visibilityValue').textContent = data.weather?.visibility !== undefined ? `${data.weather.visibility.toFixed(1)} km` : '-- km';
    }
    
    // ========== FEATURE 6: PRECIPITATION ==========
    if (document.getElementById('precipValue')) {
        document.getElementById('precipValue').textContent = data.weather?.precipitation !== undefined ? `${data.weather.precipitation.toFixed(1)} mm` : '-- mm';
    }
    
    if (document.getElementById('precipProbValue')) {
        document.getElementById('precipProbValue').textContent = data.weather?.precipitation_probability !== undefined ? `${data.weather.precipitation_probability}%` : '--%';
    }
    
    // ========== FEATURE 7: PRESSURE TREND ==========
    if (document.getElementById('pressureValue') && document.getElementById('pressureTrendIcon')) {
        document.getElementById('pressureValue').textContent = data.weather?.pressure ? `${data.weather.pressure.toFixed(0)} hPa` : '-- hPa';
        
        const trend = data.weather?.pressure_trend || 'stable';
        const trendIcon = document.getElementById('pressureTrendIcon');
        const trendText = document.getElementById('pressureTrendText');
        
        if (trendIcon) {
            trendIcon.className = 'fas';
            if (trend === 'rising') {
                trendIcon.classList.add('fa-arrow-up');
                trendIcon.style.color = '#4CAF50';
                if (trendText) trendText.textContent = 'Rising';
            } else if (trend === 'falling') {
                trendIcon.classList.add('fa-arrow-down');
                trendIcon.style.color = '#FF4444';
                if (trendText) trendText.textContent = 'Falling';
            } else {
                trendIcon.classList.add('fa-minus');
                trendIcon.style.color = '#FFC107';
                if (trendText) trendText.textContent = 'Stable';
            }
        }
    }
    
    // ========== FEATURES 8-9-10: RECOMMENDATIONS ==========
    if (document.getElementById('healthRecommendation')) {
        document.getElementById('healthRecommendation').textContent = data.recommendations?.health || 'Data not available';
    }
    
    if (document.getElementById('activitySuggestion')) {
        document.getElementById('activitySuggestion').textContent = data.recommendations?.activity || 'Data not available';
    }
    
    if (document.getElementById('clothingAdvice')) {
        document.getElementById('clothingAdvice').textContent = data.recommendations?.clothing || 'Data not available';
    }
    
    const safetyBadge = document.getElementById('safetyBadge');
    if (safetyBadge) {
        if (data.recommendations?.is_safe_outside) {
            safetyBadge.innerHTML = '<i class="fas fa-check-circle"></i> Safe to go outside';
            safetyBadge.className = 'safety-badge safe';
        } else {
            safetyBadge.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Caution advised';
            safetyBadge.className = 'safety-badge unsafe';
        }
    }
    
    // ========== FEATURE 15: NEARBY CITIES ==========
    if (document.getElementById('nearbyCitiesList')) {
        const nearbyList = document.getElementById('nearbyCitiesList');
        nearbyList.innerHTML = '';
        
        if (data.nearby && data.nearby.length > 0) {
            data.nearby.slice(0, 5).forEach(city => {
                const item = document.createElement('div');
                item.className = 'nearby-city-item';
                item.innerHTML = `
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <strong>${city.name}</strong>
                            <span style="color: #999; margin-left: 8px; font-size: 0.8rem;">${city.country}</span>
                        </div>
                        <span style="color: #66BB6A; font-weight: 600;">${city.distance} km</span>
                    </div>
                `;
                item.addEventListener('click', () => {
                    fetchCityData(city.lat, city.lon, city.name);
                    if (window.map) {
                        window.map.setView([city.lat, city.lon], 8);
                    }
                });
                nearbyList.appendChild(item);
            });
        } else {
            nearbyList.innerHTML = '<div style="text-align: center; color: #999; padding: 1rem;">No nearby cities found</div>';
        }
    }
    
    // ========== WEATHER ICON ==========
    updateWeatherIcon(data.weather?.code);
    
    // ========== LAST UPDATED ==========
    const now = new Date();
    const updatedEl = document.querySelector('.last-updated span');
    if (updatedEl) {
        updatedEl.innerHTML = `<i class="fas fa-clock"></i> Updated: ${now.toLocaleTimeString()}`;
    }
}

// ============================================
// 🚀 INITIALIZATION
// ============================================
window.addEventListener('load', async () => {
    // Ensure Chart.js is loaded
    if (typeof Chart === 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js';
        script.async = true;
        document.head.appendChild(script);
    }
    
    // Check server health
    try {
        const response = await fetch(`${API_BASE}/health`);
        if (response.ok) {
            console.log('✅ Server connected');
            hideLoading();
        } else {
            throw new Error('Server not responding');
        }
    } catch (error) {
        console.error('Server connection failed:', error);
        showError('Cannot connect to server. Make sure server is running.');
    }
    
    // Request location permission (silent)
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            () => console.log('📍 Location access granted'),
            () => console.log('📍 Location access denied')
        );
    }

});
