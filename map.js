// ============================================
// 🌍 GOOGLE-STYLE TERRAIN MAP - WITH ATTRIBUTION (FIXED)
// ============================================

const map = L.map('map', {
    center: [20, 0],
    zoom: 2.5,
    minZoom: 2,
    maxZoom: 12,
    maxBounds: [[-90, -180], [90, 180]],
    maxBoundsViscosity: 1.0,
    worldCopyJump: false,
    zoomControl: true
});

// Attach map to window for global access (FIXED)
window.map = map;

// ============================================
// 🏔️ LAYER 1: GOOGLE-STYLE TERRAIN (Forests, Mountains, Oceans)
// ============================================
L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: '© <a href="https://opentopomap.org" target="_blank">OpenTopoMap</a>',
    maxZoom: 17,
    minZoom: 2,
    opacity: 0.9
}).addTo(map);

// ============================================
// 🗺️ LAYER 2: CLEAN LABELS - ONLY CITY/COUNTRY NAMES
// ============================================
L.tileLayer('https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png', {
    attribution: '© <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>, © <a href="https://carto.com/attributions" target="_blank">CartoDB</a>',
    subdomains: 'abcd',
    maxZoom: 20,
    minZoom: 2,
    opacity: 0.8
}).addTo(map);

// ============================================
// 🔒 LOCK MAP BOUNDARIES
// ============================================
map.on('drag', function() {
    map.panInsideBounds(map.options.maxBounds, { animate: false });
});

map.on('zoomend', function() {
    if (map.getZoom() < 2) map.setZoom(2);
    if (map.getZoom() > 12) map.setZoom(12);
    map.panInsideBounds(map.options.maxBounds, { animate: true });
});

// ============================================
// 🔴 RED CITY MARKERS - LOW GLOW EFFECT
// ============================================
const cityIcon = L.divIcon({
    className: 'custom-marker',
    html: '<i class="fas fa-map-marker-alt" style="color: #FF4444; font-size: 28px; filter: drop-shadow(0 0 4px rgba(255,68,68,0.5));"></i>',
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28]
});

// ============================================
// 🌍 150+ MAJOR WORLD CITIES (Same list as backend)
// ============================================
const majorCities = [
    // NORTH AMERICA
    { name: 'New York', lat: 40.7128, lon: -74.0060, country: 'USA' },
    { name: 'Los Angeles', lat: 34.0522, lon: -118.2437, country: 'USA' },
    { name: 'Chicago', lat: 41.8781, lon: -87.6298, country: 'USA' },
    { name: 'Toronto', lat: 43.6532, lon: -79.3832, country: 'Canada' },
    { name: 'Vancouver', lat: 49.2827, lon: -123.1207, country: 'Canada' },
    { name: 'Mexico City', lat: 19.4326, lon: -99.1332, country: 'Mexico' },
    { name: 'Miami', lat: 25.7617, lon: -80.1918, country: 'USA' },
    { name: 'San Francisco', lat: 37.7749, lon: -122.4194, country: 'USA' },
    { name: 'Montreal', lat: 45.5017, lon: -73.5673, country: 'Canada' },
    { name: 'Boston', lat: 42.3601, lon: -71.0589, country: 'USA' },
    { name: 'Washington D.C.', lat: 38.9072, lon: -77.0369, country: 'USA' },
    { name: 'Seattle', lat: 47.6062, lon: -122.3321, country: 'USA' },
    { name: 'Houston', lat: 29.7604, lon: -95.3698, country: 'USA' },
    { name: 'Denver', lat: 39.7392, lon: -104.9903, country: 'USA' },
    { name: 'Atlanta', lat: 33.7490, lon: -84.3880, country: 'USA' },
    { name: 'Philadelphia', lat: 39.9526, lon: -75.1652, country: 'USA' },
    { name: 'Phoenix', lat: 33.4484, lon: -112.0740, country: 'USA' },
    { name: 'Dallas', lat: 32.7767, lon: -96.7970, country: 'USA' },
    { name: 'San Diego', lat: 32.7157, lon: -117.1611, country: 'USA' },
    { name: 'Las Vegas', lat: 36.1699, lon: -115.1398, country: 'USA' },
    { name: 'Portland', lat: 45.5051, lon: -122.6750, country: 'USA' },
    { name: 'Detroit', lat: 42.3314, lon: -83.0458, country: 'USA' },
    { name: 'Calgary', lat: 51.0447, lon: -114.0719, country: 'Canada' },
    { name: 'Edmonton', lat: 53.5461, lon: -113.4938, country: 'Canada' },
    { name: 'Ottawa', lat: 45.4215, lon: -75.6972, country: 'Canada' },
    { name: 'Quebec City', lat: 46.8139, lon: -71.2080, country: 'Canada' },
    { name: 'Guadalajara', lat: 20.6597, lon: -103.3496, country: 'Mexico' },
    { name: 'Monterrey', lat: 25.6866, lon: -100.3161, country: 'Mexico' },
    
    // SOUTH AMERICA
    { name: 'Rio de Janeiro', lat: -22.9068, lon: -43.1729, country: 'Brazil' },
    { name: 'São Paulo', lat: -23.5505, lon: -46.6333, country: 'Brazil' },
    { name: 'Buenos Aires', lat: -34.6037, lon: -58.3816, country: 'Argentina' },
    { name: 'Lima', lat: -12.0464, lon: -77.0428, country: 'Peru' },
    { name: 'Bogotá', lat: 4.7110, lon: -74.0721, country: 'Colombia' },
    { name: 'Santiago', lat: -33.4489, lon: -70.6693, country: 'Chile' },
    { name: 'Caracas', lat: 10.4806, lon: -66.9036, country: 'Venezuela' },
    { name: 'Quito', lat: -0.1807, lon: -78.4678, country: 'Ecuador' },
    { name: 'Brasília', lat: -15.8267, lon: -47.9218, country: 'Brazil' },
    { name: 'Salvador', lat: -12.9714, lon: -38.5014, country: 'Brazil' },
    { name: 'Fortaleza', lat: -3.7319, lon: -38.5267, country: 'Brazil' },
    { name: 'Montevideo', lat: -34.9011, lon: -56.1645, country: 'Uruguay' },
    { name: 'La Paz', lat: -16.5000, lon: -68.1500, country: 'Bolivia' },
    { name: 'Asunción', lat: -25.2637, lon: -57.5759, country: 'Paraguay' },
    
    // EUROPE
    { name: 'London', lat: 51.5074, lon: -0.1278, country: 'UK' },
    { name: 'Paris', lat: 48.8566, lon: 2.3522, country: 'France' },
    { name: 'Berlin', lat: 52.5200, lon: 13.4050, country: 'Germany' },
    { name: 'Madrid', lat: 40.4168, lon: -3.7038, country: 'Spain' },
    { name: 'Rome', lat: 41.9028, lon: 12.4964, country: 'Italy' },
    { name: 'Moscow', lat: 55.7558, lon: 37.6173, country: 'Russia' },
    { name: 'Istanbul', lat: 41.0082, lon: 28.9784, country: 'Turkey' },
    { name: 'Amsterdam', lat: 52.3676, lon: 4.9041, country: 'Netherlands' },
    { name: 'Vienna', lat: 48.2082, lon: 16.3738, country: 'Austria' },
    { name: 'Stockholm', lat: 59.3293, lon: 18.0686, country: 'Sweden' },
    { name: 'Athens', lat: 37.9838, lon: 23.7275, country: 'Greece' },
    { name: 'Lisbon', lat: 38.7223, lon: -9.1393, country: 'Portugal' },
    { name: 'Warsaw', lat: 52.2297, lon: 21.0122, country: 'Poland' },
    { name: 'Prague', lat: 50.0755, lon: 14.4378, country: 'Czech Republic' },
    { name: 'Dublin', lat: 53.3498, lon: -6.2603, country: 'Ireland' },
    { name: 'Brussels', lat: 50.8503, lon: 4.3517, country: 'Belgium' },
    { name: 'Budapest', lat: 47.4979, lon: 19.0402, country: 'Hungary' },
    { name: 'Copenhagen', lat: 55.6761, lon: 12.5683, country: 'Denmark' },
    { name: 'Helsinki', lat: 60.1699, lon: 24.9384, country: 'Finland' },
    { name: 'Oslo', lat: 59.9139, lon: 10.7522, country: 'Norway' },
    { name: 'Zurich', lat: 47.3769, lon: 8.5417, country: 'Switzerland' },
    { name: 'Munich', lat: 48.1351, lon: 11.5820, country: 'Germany' },
    { name: 'Hamburg', lat: 53.5511, lon: 9.9937, country: 'Germany' },
    { name: 'Barcelona', lat: 41.3851, lon: 2.1734, country: 'Spain' },
    { name: 'Milan', lat: 45.4642, lon: 9.1900, country: 'Italy' },
    { name: 'Naples', lat: 40.8518, lon: 14.2681, country: 'Italy' },
    { name: 'Manchester', lat: 53.4808, lon: -2.2426, country: 'UK' },
    { name: 'Birmingham', lat: 52.4862, lon: -1.8904, country: 'UK' },
    { name: 'Krakow', lat: 50.0647, lon: 19.9450, country: 'Poland' },
    { name: 'Geneva', lat: 46.2044, lon: 6.1432, country: 'Switzerland' },
    
    // ASIA
    { name: 'Tokyo', lat: 35.6762, lon: 139.6503, country: 'Japan' },
    { name: 'Delhi', lat: 28.6139, lon: 77.2090, country: 'India' },
    { name: 'Mumbai', lat: 19.0760, lon: 72.8777, country: 'India' },
    { name: 'Beijing', lat: 39.9042, lon: 116.4074, country: 'China' },
    { name: 'Shanghai', lat: 31.2304, lon: 121.4737, country: 'China' },
    { name: 'Seoul', lat: 37.5665, lon: 126.9780, country: 'South Korea' },
    { name: 'Bangkok', lat: 13.7563, lon: 100.5018, country: 'Thailand' },
    { name: 'Singapore', lat: 1.3521, lon: 103.8198, country: 'Singapore' },
    { name: 'Jakarta', lat: -6.2088, lon: 106.8456, country: 'Indonesia' },
    { name: 'Dubai', lat: 25.2048, lon: 55.2708, country: 'UAE' },
    { name: 'Hong Kong', lat: 22.3193, lon: 114.1694, country: 'China' },
    { name: 'Taipei', lat: 25.0330, lon: 121.5654, country: 'Taiwan' },
    { name: 'Kuala Lumpur', lat: 3.1390, lon: 101.6869, country: 'Malaysia' },
    { name: 'Manila', lat: 14.5995, lon: 120.9842, country: 'Philippines' },
    { name: 'Ho Chi Minh City', lat: 10.8231, lon: 106.6297, country: 'Vietnam' },
    { name: 'Riyadh', lat: 24.7136, lon: 46.6753, country: 'Saudi Arabia' },
    { name: 'Tehran', lat: 35.6892, lon: 51.3890, country: 'Iran' },
    { name: 'Baghdad', lat: 33.3152, lon: 44.3661, country: 'Iraq' },
    { name: 'Jerusalem', lat: 31.7683, lon: 35.2137, country: 'Israel' },
    { name: 'Karachi', lat: 24.8607, lon: 67.0011, country: 'Pakistan' },
    { name: 'Dhaka', lat: 23.8103, lon: 90.4125, country: 'Bangladesh' },
    { name: 'Osaka', lat: 34.6937, lon: 135.5023, country: 'Japan' },
    { name: 'Kyoto', lat: 35.0116, lon: 135.7681, country: 'Japan' },
    { name: 'Busan', lat: 35.1796, lon: 129.0756, country: 'South Korea' },
    { name: 'Incheon', lat: 37.4563, lon: 126.7052, country: 'South Korea' },
    { name: 'Chennai', lat: 13.0827, lon: 80.2707, country: 'India' },
    { name: 'Kolkata', lat: 22.5726, lon: 88.3639, country: 'India' },
    { name: 'Bangalore', lat: 12.9716, lon: 77.5946, country: 'India' },
    { name: 'Hyderabad', lat: 17.3850, lon: 78.4867, country: 'India' },
    { name: 'Guangzhou', lat: 23.1291, lon: 113.2644, country: 'China' },
    { name: 'Shenzhen', lat: 22.5431, lon: 114.0579, country: 'China' },
    { name: 'Chongqing', lat: 29.4316, lon: 106.9123, country: 'China' },
    { name: 'Hanoi', lat: 21.0278, lon: 105.8342, country: 'Vietnam' },
    { name: 'Phnom Penh', lat: 11.5564, lon: 104.9282, country: 'Cambodia' },
    { name: 'Yangon', lat: 16.8409, lon: 96.1735, country: 'Myanmar' },
    { name: 'Colombo', lat: 6.9271, lon: 79.8612, country: 'Sri Lanka' },
    { name: 'Kuwait City', lat: 29.3759, lon: 47.9774, country: 'Kuwait' },
    { name: 'Doha', lat: 25.2854, lon: 51.5310, country: 'Qatar' },
    { name: 'Muscat', lat: 23.5880, lon: 58.3829, country: 'Oman' },
    
    // AFRICA
    { name: 'Cairo', lat: 30.0444, lon: 31.2357, country: 'Egypt' },
    { name: 'Cape Town', lat: -33.9249, lon: 18.4241, country: 'South Africa' },
    { name: 'Lagos', lat: 6.5244, lon: 3.3792, country: 'Nigeria' },
    { name: 'Nairobi', lat: -1.2921, lon: 36.8219, country: 'Kenya' },
    { name: 'Casablanca', lat: 33.5731, lon: -7.5898, country: 'Morocco' },
    { name: 'Johannesburg', lat: -26.2041, lon: 28.0473, country: 'South Africa' },
    { name: 'Addis Ababa', lat: 9.0320, lon: 38.7469, country: 'Ethiopia' },
    { name: 'Algiers', lat: 36.7538, lon: 3.0588, country: 'Algeria' },
    { name: 'Tunis', lat: 36.8065, lon: 10.1815, country: 'Tunisia' },
    { name: 'Accra', lat: 5.6037, lon: -0.1870, country: 'Ghana' },
    { name: 'Dakar', lat: 14.7167, lon: -17.4677, country: 'Senegal' },
    { name: 'Khartoum', lat: 15.5007, lon: 32.5599, country: 'Sudan' },
    { name: 'Dar es Salaam', lat: -6.7924, lon: 39.2083, country: 'Tanzania' },
    { name: 'Kampala', lat: 0.3476, lon: 32.5825, country: 'Uganda' },
    { name: 'Harare', lat: -17.8252, lon: 31.0335, country: 'Zimbabwe' },
    { name: 'Lusaka', lat: -15.3875, lon: 28.3228, country: 'Zambia' },
    { name: 'Luanda', lat: -8.8390, lon: 13.2894, country: 'Angola' },
    { name: 'Maputo', lat: -25.9692, lon: 32.5732, country: 'Mozambique' },
    
    // OCEANIA
    { name: 'Sydney', lat: -33.8688, lon: 151.2093, country: 'Australia' },
    { name: 'Melbourne', lat: -37.8136, lon: 144.9631, country: 'Australia' },
    { name: 'Auckland', lat: -36.8485, lon: 174.7633, country: 'New Zealand' },
    { name: 'Perth', lat: -31.9505, lon: 115.8605, country: 'Australia' },
    { name: 'Brisbane', lat: -27.4698, lon: 153.0251, country: 'Australia' },
    { name: 'Wellington', lat: -41.2865, lon: 174.7762, country: 'New Zealand' },
    { name: 'Adelaide', lat: -34.9285, lon: 138.6007, country: 'Australia' },
    { name: 'Canberra', lat: -35.2809, lon: 149.1300, country: 'Australia' },
    { name: 'Hobart', lat: -42.8821, lon: 147.3272, country: 'Australia' },
    { name: 'Christchurch', lat: -43.5320, lon: 172.6306, country: 'New Zealand' }
];

// ============================================
// ADD ALL CITY MARKERS - RED WITH LOW GLOW
// ============================================
majorCities.forEach(city => {
    const marker = L.marker([city.lat, city.lon], { 
        icon: cityIcon,
        riseOnHover: true,
        riseOffset: 500
    })
    .bindPopup(`
        <div style="text-align: center; padding: 12px; min-width: 200px;">
            <strong style="font-size: 20px; color: #FF4444; display: block; margin-bottom: 5px;">${city.name}</strong>
            <span style="color: #666; font-size: 14px; display: block; margin-bottom: 12px;">${city.country}</span>
            <span style="display: inline-block; background: #FF4444; color: white; padding: 8px 20px; border-radius: 30px; font-size: 13px; cursor: pointer;">
                <i class="fas fa-search" style="margin-right: 6px;"></i> View Data
            </span>
        </div>
    `)
    .addTo(map);
    
    marker.on('click', () => {
        fetchCityData(city.lat, city.lon, city.name);
    });
});

// ============================================
// 👆 CLICK ANYWHERE ON MAP
// ============================================
map.on('click', function(e) {
    fetchCityData(e.latlng.lat, e.latlng.lng);
    
    const pulseIcon = L.divIcon({
        html: '<div style="width: 30px; height: 30px; background: rgba(255,68,68,0.4); border-radius: 50%; border: 2px solid white; animation: pulseClick 0.8s;"></div>',
        iconSize: [30, 30],
        iconAnchor: [15, 15]
    });
    
    const pulseMarker = L.marker([e.latlng.lat, e.latlng.lng], { icon: pulseIcon }).addTo(map);
    setTimeout(() => map.removeLayer(pulseMarker), 800);
});

// ============================================
// 🎮 CONTROLS
// ============================================
map.zoomControl.setPosition('bottomright');
L.control.scale({ 
    imperial: false, 
    metric: true, 
    position: 'bottomleft',
    maxWidth: 200
}).addTo(map);

console.log('✅ GOOGLE-STYLE TERRAIN MAP READY');
console.log('🔴', majorCities.length, 'RED city markers added');
console.log('🌍 Map attached to window for global access');