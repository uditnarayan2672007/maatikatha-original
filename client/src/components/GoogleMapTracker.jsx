import React, { useState, useEffect, useRef } from 'react';
import { 
  MapPin, 
  Crosshair, 
  Navigation, 
  Layers, 
  Search, 
  Check, 
  X, 
  Compass, 
  Sparkles, 
  Radio, 
  Eye, 
  ShieldCheck,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { INDIAN_DISTRICTS } from '../data/locations.js';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

// Helper to dynamically load the Google Maps JavaScript API
let googleMapsPromise = null;
function loadGoogleMapsScript(apiKey) {
  if (window.google && window.google.maps) {
    return Promise.resolve(window.google.maps);
  }
  if (!googleMapsPromise) {
    googleMapsPromise = new Promise((resolve, reject) => {
      const existing = document.getElementById('google-maps-js-sdk');
      if (existing) {
        existing.addEventListener('load', () => resolve(window.google.maps));
        existing.addEventListener('error', (err) => reject(err));
        return;
      }
      const script = document.createElement('script');
      script.id = 'google-maps-js-sdk';
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry`;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve(window.google.maps);
      script.onerror = (err) => reject(err);
      document.head.appendChild(script);
    });
  }
  return googleMapsPromise;
}

export default function GoogleMapTracker({ isOpen, onClose, currentLocation, onLocationSelected, language = 'en' }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerInstanceRef = useRef(null);
  const circleInstanceRef = useRef(null);
  const geocoderRef = useRef(null);

  const [mapLoaded, setMapLoaded] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [activeMapType, setActiveMapType] = useState('hybrid'); // 'hybrid' | 'roadmap' | 'terrain'
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchFeedback, setSearchFeedback] = useState('');

  // Selected Pin Coordinates & Geocoded Meta
  const [selectedPin, setSelectedPin] = useState({
    lat: currentLocation?.lat || 22.574,
    lon: currentLocation?.lon || 88.3191,
    city: currentLocation?.city || 'Howrah',
    district: currentLocation?.district || 'Howrah',
    state: currentLocation?.state || 'West Bengal',
    displayName: currentLocation?.displayName || 'Howrah, West Bengal',
    source: 'Google Maps Selected Plot'
  });

  // Preset popular agritech farming clusters for 1-click navigation
  const quickFarmlands = [
    { name: 'Singur', label: 'Singur (Potato Hub)', lat: 22.8126, lon: 88.2727 },
    { name: 'Hooghly', label: 'Hooghly Basin', lat: 22.9038, lon: 88.3968 },
    { name: 'Kalna', label: 'Kalna (Rice Bowl)', lat: 23.2200, lon: 88.3700 },
    { name: 'Memari', label: 'Memari (Alluvial Belt)', lat: 23.1777, lon: 88.0966 },
    { name: 'Burdwan', label: 'Purba Bardhaman', lat: 23.2324, lon: 87.8615 },
    { name: 'Nadia', label: 'Nadia (Krishnanagar)', lat: 23.4013, lon: 88.5015 },
    { name: 'Howrah', label: 'Howrah Delta', lat: 22.5958, lon: 88.2636 },
    { name: 'Bankura', label: 'Bankura Red Soil', lat: 23.2324, lon: 87.0715 }
  ];

  // Initialize Google Maps when modal is opened
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    loadGoogleMapsScript(GOOGLE_MAPS_API_KEY)
      .then((maps) => {
        if (!isMounted || !mapContainerRef.current) return;
        geocoderRef.current = new maps.Geocoder();

        const initialLat = selectedPin.lat || 22.574;
        const initialLng = selectedPin.lon || 88.3191;

        // Initialize Map
        const map = new maps.Map(mapContainerRef.current, {
          center: { lat: initialLat, lng: initialLng },
          zoom: 15,
          mapTypeId: activeMapType,
          disableDefaultUI: false,
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          styles: [
            {
              featureType: 'poi.business',
              stylers: [{ visibility: 'off' }]
            }
          ]
        });
        mapInstanceRef.current = map;

        // Marker (Farmer Field Pin)
        const marker = new maps.Marker({
          position: { lat: initialLat, lng: initialLng },
          map: map,
          draggable: true,
          animation: maps.Animation.DROP,
          title: 'Selected Field / Plot'
        });
        markerInstanceRef.current = marker;

        // Spore Drift / Soil Buffer Circle (600m radius)
        const circle = new maps.Circle({
          strokeColor: '#22c55e',
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: '#15803d',
          fillOpacity: 0.15,
          map: map,
          center: { lat: initialLat, lng: initialLng },
          radius: 600
        });
        circleInstanceRef.current = circle;

        // Click on Map to Drop Pin
        map.addListener('click', (e) => {
          const lat = e.latLng.lat();
          const lng = e.latLng.lng();
          updateMarkerPosition(lat, lng);
        });

        // Drag Marker
        marker.addListener('dragend', (e) => {
          const lat = e.latLng.lat();
          const lng = e.latLng.lng();
          updateMarkerPosition(lat, lng);
        });

        setMapLoaded(true);
      })
      .catch((err) => {
        console.error('[GoogleMapTracker] Script load error:', err);
        setLoadError('Failed to load Google Maps SDK. Please check your network connection.');
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  // Update marker and circle position + reverse geocode (Google + backend fallback)
  const updateMarkerPosition = async (lat, lng) => {
    if (markerInstanceRef.current) {
      markerInstanceRef.current.setPosition({ lat, lng });
    }
    if (circleInstanceRef.current) {
      circleInstanceRef.current.setCenter({ lat, lng });
    }
    if (mapInstanceRef.current) {
      mapInstanceRef.current.panTo({ lat, lng });
    }

    // Try Google Geocoder
    let resolved = false;
    if (geocoderRef.current) {
      try {
        const gPromise = new Promise((resolve) => {
          geocoderRef.current.geocode({ location: { lat, lng } }, (results, status) => {
            if (status === 'OK' && results && results[0]) {
              resolve(results[0]);
            } else {
              resolve(null);
            }
          });
        });

        const gResult = await Promise.race([
          gPromise,
          new Promise(r => setTimeout(() => r(null), 1200))
        ]);

        if (gResult) {
          let city = '';
          let district = '';
          let state = '';
          for (const comp of gResult.address_components || []) {
            if (comp.types.includes('locality') || comp.types.includes('sublocality')) city = comp.long_name;
            if (comp.types.includes('administrative_area_level_2')) district = comp.long_name;
            if (comp.types.includes('administrative_area_level_1')) state = comp.long_name;
          }

          setSelectedPin({
            lat,
            lon: lng,
            city: city || district || 'Field Plot',
            district: district || city || 'Bengal Basin',
            state: state || 'West Bengal',
            displayName: gResult.formatted_address,
            source: 'Google Maps Geocoder'
          });
          resolved = true;
        }
      } catch (e) {
        console.warn('[GoogleMapTracker] Geocoder notice:', e);
      }
    }

    // High-precision backend reverse geocode fallback (Nominatim / BigDataCloud)
    if (!resolved) {
      try {
        const res = await fetch(`/api/location/reverse?lat=${lat}&lon=${lng}`);
        const data = await res.json();
        if (data.status === 'success' && (data.city || data.district)) {
          setSelectedPin({
            lat,
            lon: lng,
            city: data.city || data.district,
            district: data.district || data.city,
            state: data.state || 'West Bengal',
            displayName: data.displayName || `${data.city}, ${data.state}`,
            source: 'Agro Precision Geocoder'
          });
          resolved = true;
        }
      } catch (err) {
        console.warn('[GoogleMapTracker] Backend reverse geocode fallback notice:', err);
      }
    }

    if (!resolved) {
      setSelectedPin(prev => ({
        ...prev,
        lat,
        lon: lng,
        displayName: `${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E`
      }));
    }
  };

  // Switch Map Type (Satellite Hybrid / Roadmap / Terrain)
  const handleChangeMapType = (type) => {
    setActiveMapType(type);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setMapTypeId(type);
    }
  };

  // Live GPS Lock Button
  const handleLockLiveGPS = () => {
    if (!('geolocation' in navigator)) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setIsLocating(true);
    setSearchFeedback('Acquiring live GPS satellite lock...');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        await updateMarkerPosition(latitude, longitude);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setZoom(16);
        }
        setIsLocating(false);
        setSearchFeedback('✓ Live GPS locked to current position');
        setTimeout(() => setSearchFeedback(''), 3500);
      },
      (err) => {
        console.warn('[GoogleMapTracker] GPS error:', err.message);
        setIsLocating(false);
        setSearchFeedback('');
        alert('Could not acquire GPS position. Please ensure location permissions are allowed.');
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Robust Multi-Tier Search Execution Engine
  const executeSearch = async (targetQuery) => {
    const query = (targetQuery || searchQuery).trim();
    if (!query) return;

    setSearchLoading(true);
    setSearchFeedback(`Locating "${query}"...`);

    // Tier 1: Check if query is direct coordinates (e.g. "23.08, 88.28" or "22.8126 88.2727")
    const coordMatch = query.match(/^([-+]?[0-9]*\.?[0-9]+)[\s,]+([-+]?[0-9]*\.?[0-9]+)$/);
    if (coordMatch) {
      const lat = parseFloat(coordMatch[1]);
      const lng = parseFloat(coordMatch[2]);
      if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        await updateMarkerPosition(lat, lng);
        if (mapInstanceRef.current) mapInstanceRef.current.setZoom(16);
        setSearchLoading(false);
        setSearchFeedback(`✓ Coordinates pinned: ${lat.toFixed(4)}°, ${lng.toFixed(4)}°`);
        setTimeout(() => setSearchFeedback(''), 3500);
        return;
      }
    }

    // Tier 2: Check local INDIAN_DISTRICTS database (instant match)
    const normalized = query.toLowerCase();
    for (const group of INDIAN_DISTRICTS) {
      const found = group.districts.find(d => 
        d.name.toLowerCase() === normalized ||
        d.label.toLowerCase().includes(normalized) ||
        normalized.includes(d.name.toLowerCase())
      );
      if (found) {
        await updateMarkerPosition(found.lat, found.lon);
        if (mapInstanceRef.current) mapInstanceRef.current.setZoom(15);
        setSearchLoading(false);
        setSearchFeedback(`✓ Found district: ${found.name}`);
        setTimeout(() => setSearchFeedback(''), 3500);
        return;
      }
    }

    // Tier 3: Try Google Geocoder
    if (geocoderRef.current) {
      try {
        const gPromise = new Promise((resolve) => {
          geocoderRef.current.geocode({ address: query + ', India' }, (results, status) => {
            if (status === 'OK' && results && results[0]) {
              resolve(results[0]);
            } else {
              resolve(null);
            }
          });
        });

        const gResult = await Promise.race([
          gPromise,
          new Promise(r => setTimeout(() => r(null), 2000))
        ]);

        if (gResult) {
          const loc = gResult.geometry.location;
          await updateMarkerPosition(loc.lat(), loc.lng());
          if (mapInstanceRef.current) mapInstanceRef.current.setZoom(15);
          setSearchLoading(false);
          setSearchFeedback(`✓ Located: ${query}`);
          setTimeout(() => setSearchFeedback(''), 3500);
          return;
        }
      } catch (err) {
        console.warn('[GoogleMapTracker] Google Geocode search error:', err);
      }
    }

    // Tier 4: OpenStreetMap Nominatim High-Precision Forward Geocoding
    try {
      const nomUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query + ', India')}&limit=1`;
      const res = await fetch(nomUrl, {
        headers: { 'User-Agent': 'MaatiKatha-Agritech-Portal/2.0' }
      });
      const data = await res.json();
      if (data && data.length > 0) {
        const item = data[0];
        const lat = parseFloat(item.lat);
        const lng = parseFloat(item.lon);
        await updateMarkerPosition(lat, lng);
        if (mapInstanceRef.current) mapInstanceRef.current.setZoom(15);
        setSearchLoading(false);
        setSearchFeedback(`✓ Located: ${item.display_name.split(',')[0]}`);
        setTimeout(() => setSearchFeedback(''), 3500);
        return;
      }
    } catch (nomErr) {
      console.warn('[GoogleMapTracker] Nominatim search warning:', nomErr);
    }

    // Tier 5: Fallback search via backend weather & city API
    try {
      const backendRes = await fetch(`/api/weather?city=${encodeURIComponent(query)}`);
      const backendData = await backendRes.json();
      if (backendData.status === 'success' && backendData.weather?.lat && backendData.weather?.lon) {
        await updateMarkerPosition(backendData.weather.lat, backendData.weather.lon);
        if (mapInstanceRef.current) mapInstanceRef.current.setZoom(14);
        setSearchLoading(false);
        setSearchFeedback(`✓ Located: ${query}`);
        setTimeout(() => setSearchFeedback(''), 3500);
        return;
      }
    } catch (beErr) {
      console.warn('[GoogleMapTracker] Backend fallback search warning:', beErr);
    }

    setSearchLoading(false);
    setSearchFeedback('');
    alert(`Could not find "${query}". Try searching by district name (e.g. Hooghly, Burdwan, Nadia) or click on the map.`);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    executeSearch();
  };

  const handleSelectQuickFarmland = (farmland) => {
    setSearchQuery(farmland.name);
    updateMarkerPosition(farmland.lat, farmland.lon);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setZoom(15);
    }
    setSearchFeedback(`✓ Moved to: ${farmland.label}`);
    setTimeout(() => setSearchFeedback(''), 3000);
  };

  // Confirm and Apply Location to App
  const handleConfirmLocation = () => {
    const finalLocation = {
      name: selectedPin.city || selectedPin.district,
      city: selectedPin.city || selectedPin.district,
      district: selectedPin.district || selectedPin.city,
      state: selectedPin.state || 'West Bengal',
      lat: selectedPin.lat,
      lon: selectedPin.lon,
      displayName: selectedPin.displayName,
      detectedVia: 'Google Map Pin'
    };
    onLocationSelected(finalLocation);
    onClose();
  };

  const t = {
    bn: {
      title: "গুগল ম্যাপস নিখুঁত ফসলের মাঠ ট্র্যাকার",
      sub: "লাইভ জিপিএস পিনিং • স্যাটেলাইট জমির সীমানা পর্যবেক্ষণ • কৃষি বাফার পরিধি",
      searchPlaceholder: "যেকোনো গ্রাম, শহর বা জেলা খুঁজুন (যেমন: সিঙ্গুর, হুগলি, কালনা)...",
      pinnedLabel: "পিন করা জমির অবস্থান",
      cancelBtn: "বাতিল",
      confirmBtn: "অবস্থান নিশ্চিত ও প্রয়োগ করুন"
    },
    hi: {
      title: "गूगल मैप्स सटीक खेत ट्रैकर",
      sub: "लाइव जीपीएस पिन • सैटेलाइट फसल सीमा निरीक्षण • कृषि बफर परिधि",
      searchPlaceholder: "कोई भी गांव, कस्बा या जिला खोजें (जैसे: सिंगूर, हुगली, कालना)...",
      pinnedLabel: "पिन किए गए खेत का स्थान",
      cancelBtn: "रद्द करें",
      confirmBtn: "स्थान की पुष्टि करें व लागू करें"
    },
    en: {
      title: "Google Maps Precision Field Tracker",
      sub: "Live GPS Pinning • Satellite Crop Boundary Inspection • Agro-Buffer Radius",
      searchPlaceholder: "Search any village, town, mandal, district or coordinates (e.g. Singur, Hooghly)...",
      pinnedLabel: "Pinned Plot Location",
      cancelBtn: "Cancel",
      confirmBtn: "Confirm & Apply Location"
    }
  }[language] || {
    title: "Google Maps Precision Field Tracker",
    sub: "Live GPS Pinning • Satellite Crop Boundary Inspection • Agro-Buffer Radius",
    searchPlaceholder: "Search any village, town, mandal, district or coordinates (e.g. Singur, Hooghly)...",
    pinnedLabel: "Pinned Plot Location",
    cancelBtn: "Cancel",
    confirmBtn: "Confirm & Apply Location"
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" style={{ zIndex: 9999, padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div 
        className="modal-content" 
        style={{ 
          maxWidth: '980px', 
          width: '100%', 
          maxHeight: '94vh', 
          display: 'flex', 
          flexDirection: 'column', 
          padding: 0, 
          overflow: 'hidden',
          borderRadius: '24px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.45)'
        }}
      >
        {/* Top Header Bar */}
        <div style={{ background: '#0e3d23', color: 'white', padding: '16px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(34, 197, 94, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MapPin size={20} color="#4ade80" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', margin: 0, letterSpacing: '-0.01em' }}>
                {t.title}
              </h3>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>
                {t.sub}
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            aria-label="Close Google Maps"
            style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#cbd5e1', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Toolbar: Search + Controls */}
        <div style={{ background: '#f8fafc', padding: '12px 20px', display: 'flex', flexDirection: 'column', gap: '10px', borderBottom: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
            {/* Search Place Form */}
            <form onSubmit={handleSearchSubmit} style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1, minWidth: '260px' }}>
              <div style={{ position: 'relative', width: '100%' }}>
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t.searchPlaceholder}
                  style={{
                    width: '100%',
                    padding: '9px 12px 9px 34px',
                    borderRadius: '10px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '0.85rem',
                    outline: 'none',
                    fontFamily: 'inherit'
                  }}
                />
                <Search size={15} color="#64748b" style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
              <button 
                type="submit" 
                disabled={searchLoading}
                style={{
                  background: '#15803d',
                  color: 'white',
                  border: 'none',
                  padding: '9px 18px',
                  borderRadius: '10px',
                  fontSize: '0.82rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                {searchLoading ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
                <span>{searchLoading ? 'Searching...' : 'Locate'}</span>
              </button>
            </form>

            {/* Action Buttons: Live GPS & Map Type Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {/* Live GPS Lock Button */}
              <button
                onClick={handleLockLiveGPS}
                disabled={isLocating}
                title="Lock onto my real-time GPS coordinates"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: isLocating ? '#94a3b8' : '#22c55e',
                  color: 'white',
                  border: 'none',
                  padding: '9px 14px',
                  borderRadius: '10px',
                  fontSize: '0.82rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(34, 197, 94, 0.3)'
                }}
              >
                <Navigation size={15} />
                <span>{isLocating ? 'Locking GPS...' : 'My Live GPS'}</span>
              </button>

              {/* Satellite / Terrain Toggle */}
              <div style={{ display: 'inline-flex', background: '#e2e8f0', borderRadius: '10px', padding: '3px' }}>
                <button
                  onClick={() => handleChangeMapType('hybrid')}
                  style={{
                    border: 'none',
                    padding: '6px 10px',
                    borderRadius: '8px',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    background: activeMapType === 'hybrid' ? '#0f172a' : 'transparent',
                    color: activeMapType === 'hybrid' ? '#fff' : '#475569'
                  }}
                >
                  🛰️ Satellite
                </button>
                <button
                  onClick={() => handleChangeMapType('roadmap')}
                  style={{
                    border: 'none',
                    padding: '6px 10px',
                    borderRadius: '8px',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    background: activeMapType === 'roadmap' ? '#0f172a' : 'transparent',
                    color: activeMapType === 'roadmap' ? '#fff' : '#475569'
                  }}
                >
                  🗺️ Roads
                </button>
                <button
                  onClick={() => handleChangeMapType('terrain')}
                  style={{
                    border: 'none',
                    padding: '6px 10px',
                    borderRadius: '8px',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    background: activeMapType === 'terrain' ? '#0f172a' : 'transparent',
                    color: activeMapType === 'terrain' ? '#fff' : '#475569'
                  }}
                >
                  ⛰️ Terrain
                </button>
              </div>
            </div>
          </div>

          {/* Quick Farmland Pills & Feedback Status */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', fontSize: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              <span style={{ color: '#64748b', fontWeight: '700' }}>🌾 Quick Basins:</span>
              {quickFarmlands.map((f, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSelectQuickFarmland(f)}
                  style={{
                    background: '#e0f2fe',
                    color: '#0369a1',
                    border: '1px solid #bae6fd',
                    padding: '3px 9px',
                    borderRadius: '12px',
                    fontSize: '0.72rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {f.name}
                </button>
              ))}
            </div>

            {searchFeedback && (
              <span style={{ color: '#15803d', fontWeight: '800', background: '#dcfce7', padding: '2px 8px', borderRadius: '8px' }}>
                {searchFeedback}
              </span>
            )}
          </div>
        </div>

        {/* Map Container View */}
        <div style={{ position: 'relative', height: '430px', background: '#e2e8f0', width: '100%' }}>
          <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />

          {/* Loading Indicator */}
          {!mapLoaded && !loadError && (
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.85)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
              <div className="pulse-spinner" style={{ width: '32px', height: '32px', borderWidth: '3px' }} />
              <div style={{ fontSize: '0.88rem', fontWeight: '700', color: '#0f5132' }}>Loading Google Maps Satellite Engine...</div>
            </div>
          )}

          {/* Error Message */}
          {loadError && (
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.95)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '20px', textAlign: 'center' }}>
              <AlertCircle size={36} color="#ef4444" />
              <div style={{ fontSize: '0.92rem', fontWeight: '700', color: '#991b1b' }}>{loadError}</div>
            </div>
          )}

          {/* Tip Overlay Pill */}
          <div style={{ position: 'absolute', bottom: '12px', left: '12px', background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(6px)', color: 'white', padding: '6px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '600', pointerEvents: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>💡 Click anywhere on your farmland to pin plot coordinates</span>
          </div>
        </div>

        {/* Selected Location Details Card & Confirm Bar */}
        <div style={{ background: '#ffffff', padding: '18px 22px', borderTop: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
          <div style={{ flex: 1, minWidth: '280px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#22c55e', display: 'inline-block' }}></span>
              <span style={{ fontSize: '0.78rem', fontWeight: '800', color: '#15803d', textTransform: 'uppercase' }}>
                {t.pinnedLabel}
              </span>
              <span style={{ fontSize: '0.72rem', color: '#64748b', background: '#f1f5f9', padding: '2px 8px', borderRadius: '6px' }}>
                {Number(selectedPin.lat).toFixed(4)}°N, {Number(selectedPin.lon).toFixed(4)}°E
              </span>
            </div>
            <div style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0f172a', lineHeight: '1.3' }}>
              {selectedPin.displayName || `${selectedPin.city}, ${selectedPin.state}`}
            </div>
            <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '3px' }}>
              District: <b>{selectedPin.district}</b> • State: <b>{selectedPin.state}</b> • Spore buffer: 600m active
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: '#f1f5f9',
                color: '#475569',
                border: 'none',
                padding: '11px 18px',
                borderRadius: '12px',
                fontSize: '0.85rem',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              {t.cancelBtn}
            </button>

            <button
              type="button"
              onClick={handleConfirmLocation}
              style={{
                background: '#15803d',
                color: 'white',
                border: 'none',
                padding: '11px 24px',
                borderRadius: '12px',
                fontSize: '0.85rem',
                fontWeight: '800',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(21, 128, 61, 0.3)'
              }}
            >
              <Check size={16} />
              <span>{t.confirmBtn}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
