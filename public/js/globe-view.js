// ================================
// GLOBE VIEW - 3D Interactive Visualization
// ================================

let globeInstance = null;
let globeData = [];
let currentGeoView = 'details';

// Geocoding cache for city coordinates
const cityCoordinates = {};

// Function to get coordinates from city name using a free geocoding API
async function getCoordinates(city, region, country) {
    const cacheKey = `${city}, ${region}, ${country}`;
    
    // Check cache first
    if (cityCoordinates[cacheKey]) {
        return cityCoordinates[cacheKey];
    }
    
    try {
        // Use Nominatim (OpenStreetMap) for free geocoding
        const query = encodeURIComponent(`${city}, ${region}, ${country}`);
        const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`);
        
        if (response.ok) {
            const data = await response.json();
            if (data && data.length > 0) {
                const coords = {
                    lat: parseFloat(data[0].lat),
                    lng: parseFloat(data[0].lon)
                };
                
                // Cache the result
                cityCoordinates[cacheKey] = coords;
                return coords;
            }
        }
    } catch (error) {
        console.log('Geocoding error:', error);
    }
    
    // Fallback to approximate coordinates based on country
    return getCountryApproximateCoords(country);
}

// Approximate coordinates for major countries (fallback)
function getCountryApproximateCoords(country) {
    const countryCoords = {
        'India': { lat: 20.5937, lng: 78.9629 },
        'United States': { lat: 37.0902, lng: -95.7129 },
        'United Kingdom': { lat: 55.3781, lng: -3.4360 },
        'Canada': { lat: 56.1304, lng: -106.3468 },
        'Australia': { lat: -25.2744, lng: 133.7751 },
        'Germany': { lat: 51.1657, lng: 10.4515 },
        'France': { lat: 46.2276, lng: 2.2137 },
        'Netherlands': { lat: 52.1326, lng: 5.2913 },
        'Russia': { lat: 61.5240, lng: 105.3188 },
        'China': { lat: 35.8617, lng: 104.1954 },
        'Japan': { lat: 36.2048, lng: 138.2529 },
        'Brazil': { lat: -14.2350, lng: -51.9253 },
        'Unknown': { lat: 0, lng: 0 }
    };
    
    return countryCoords[country] || { lat: 0, lng: 0 };
}

// Switch between globe and table view
function switchGeoView(view) {
    currentGeoView = view;
    
    const globeContainer = document.getElementById('globeViewContainer');
    const detailsContainer = document.getElementById('clickDetailsContainer');
    const globeViewBtn = document.getElementById('globeViewBtn');
    const clickDetailsViewBtn = document.getElementById('clickDetailsViewBtn');
    
    if (view === 'globe') {
        globeContainer.style.display = 'block';
        detailsContainer.style.display = 'none';
        globeViewBtn.classList.add('active');
        clickDetailsViewBtn.classList.remove('active');
        
        // Initialize or update globe
        if (!globeInstance) {
            initializeGlobe();
        } else {
            updateGlobeData();
        }
    } else {
        globeContainer.style.display = 'none';
        detailsContainer.style.display = 'block';
        globeViewBtn.classList.remove('active');
        clickDetailsViewBtn.classList.add('active');
    }
}

// Initialize the 3D globe
async function initializeGlobe() {
    const container = document.getElementById('globeViz');
    if (!container) {
        console.error('Globe container not found');
        return;
    }
    
    // Clear container
    container.innerHTML = '';
    
    try {
        // Load countries GeoJSON for hexagon patterns
        console.log('Loading countries.geojson...');
        const response = await fetch('/countries.geojson');
        if (!response.ok) {
            throw new Error(`Failed to load countries.geojson: ${response.status}`);
        }
        const countriesData = await response.json();
        console.log('Countries data loaded successfully');
        
        // Create globe instance with hexagonal land patterns
        console.log('Initializing Globe.gl...');
        globeInstance = Globe()
            (container)
            .width(container.clientWidth)
            .height(650)
            .globeMaterial(new THREE.MeshPhongMaterial({
                color: '#dadada',
                transparent: false,
                opacity: 1
            }))
            .backgroundColor('rgba(0,0,0,0)')
            .showAtmosphere(true)
            .atmosphereColor('rgba(100, 180, 255, 0.5)')
            .atmosphereAltitude(0.15)
            .hexPolygonsData(countriesData.features)
            .hexPolygonResolution(3)
            .hexPolygonMargin(0.3)
            .hexPolygonUseDots(false)
            .hexPolygonColor(() => `rgba(16, 185, 129, ${Math.random() * 0.2 + 0.75})`)
            .hexPolygonAltitude(0.001)
            .pointsData([])
            .pointAltitude(0.01)
            .pointColor(() => '#eab308')
            .pointRadius(0.5)
            .pointsMerge(true)
            .pointLabel(d => `
                <div style="background: white; padding: 12px 16px; border-radius: 10px; color: #1a1a1a; font-family: 'Inter', sans-serif; box-shadow: 0 4px 20px rgba(0,0,0,0.15); border: 1px solid #e5e7eb;">
                    <div style="font-size: 14px; font-weight: 600; margin-bottom: 4px; color: #111;">${d.city}, ${d.region}</div>
                    <div style="font-size: 12px; color: #6b7280; margin-bottom: 6px;">${d.country}</div>
                    <div style="font-size: 15px; font-weight: 700; color: #f59e0b;">${d.clicks} visit${d.clicks > 1 ? 's' : ''}</div>
                </div>
            `);
        
        // Configure controls for smooth interaction
        const controls = globeInstance.controls();
        controls.autoRotate = false;
        controls.autoRotateSpeed = 0.3;
        controls.enableDamping = true;
        controls.dampingFactor = 0.1;
        controls.rotateSpeed = 0.5;
        controls.minDistance = 180;
        controls.maxDistance = 500;
        
        // Set initial view - centered
        globeInstance.pointOfView({ 
            lat: 20, 
            lng: 0, 
            altitude: 2.2 
        }, 0);
        
        console.log('Globe initialized successfully');

        // Pause rendering when out of viewport for performance
        if ('IntersectionObserver' in window && globeInstance) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        if (globeInstance.resumeAnimation) globeInstance.resumeAnimation();
                    } else {
                        if (globeInstance.pauseAnimation) globeInstance.pauseAnimation();
                    }
                });
            }, { threshold: 0.1 });
            observer.observe(container);
        }
        
        // Update with actual data
        await updateGlobeData();
    } catch (error) {
        console.error('Error initializing globe:', error);
        container.innerHTML = `<div style="display: flex; align-items: center; justify-content: center; height: 650px; color: #666;">
            <div style="text-align: center;">
                <i class="fas fa-exclamation-triangle" style="font-size: 48px; margin-bottom: 16px;"></i>
                <p>Failed to load globe visualization</p>
                <p style="font-size: 14px; color: #999;">${error.message}</p>
            </div>
        </div>`;
    }
}

// Update globe with click data
async function updateGlobeData() {
    if (!globeInstance || !allGeoClicks) return;
    
    // Aggregate clicks by location
    const locationMap = {};
    
    for (const click of allGeoClicks) {
        if (!click.location) continue;
        
        const key = `${click.location.city}, ${click.location.region}, ${click.location.country}`;
        
        if (!locationMap[key]) {
            locationMap[key] = {
                city: click.location.city,
                region: click.location.region,
                country: click.location.country,
                clicks: 0,
                coords: null
            };
        }
        
        locationMap[key].clicks++;
    }
    
    // Get coordinates for each location
    const locations = Object.values(locationMap);
    const pointsData = [];
    
    for (const loc of locations) {
        const coords = await getCoordinates(loc.city, loc.region, loc.country);
        
        if (coords && coords.lat !== 0 && coords.lng !== 0) {
            pointsData.push({
                lat: coords.lat,
                lng: coords.lng,
                city: loc.city,
                region: loc.region,
                country: loc.country,
                clicks: loc.clicks,
                size: Math.min(loc.clicks * 0.3, 2)
            });
        }
    }
    
    // Update globe with points
    globeInstance
        .pointsData(pointsData)
        .pointRadius(0.5)
        .pointAltitude(0.01)
        .pointColor(() => '#eab308');
    
    // Update locations list
    updateGlobeLocationsList(pointsData);
}

// Update the locations list below the globe
function updateGlobeLocationsList(points) {
    const container = document.getElementById('globeLocationsList');
    const countBadge = document.getElementById('globeLocationsCount');
    
    if (!container) return;
    
    // Update count badge
    if (countBadge) {
        countBadge.textContent = `${points.length} location${points.length !== 1 ? 's' : ''}`;
    }
    
    // Sort by clicks (descending)
    points.sort((a, b) => b.clicks - a.clicks);
    
    if (points.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-secondary);">
                <i class="fas fa-map-marked-alt" style="font-size: 48px; opacity: 0.3; margin-bottom: 12px;"></i>
                <p>No location data available</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = points.map((point, index) => `
        <div class="globe-location-item" onclick="focusOnLocation(${point.lat}, ${point.lng})" title="Click to focus on ${point.city}">
            <div class="location-marker"></div>
            <div class="location-info">
                <div class="location-name">${point.city}, ${point.region}</div>
                <div class="location-country">${point.country}</div>
            </div>
            <div class="location-clicks">${point.clicks}</div>
        </div>
    `).join('');
}

// Focus globe on specific location
function focusOnLocation(lat, lng) {
    if (!globeInstance) return;
    
    // Smooth transition to location
    globeInstance.pointOfView({
        lat: lat,
        lng: lng,
        altitude: 1.8
    }, 1200);
}

// Reset globe view
function resetGlobeView() {
    if (!globeInstance) return;
    
    globeInstance.pointOfView({
        lat: 0,
        lng: 0,
        altitude: 2.2
    }, 1200);
}

// Initialize when window loads
window.addEventListener('load', () => {
    console.log('Globe.gl library loaded');
});
