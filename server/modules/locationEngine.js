const axios = require('axios');

/**
 * Production-Ready Location & Reverse Geocoding Engine
 * Supports:
 * 1. IP-based automatic location resolution
 * 2. High-precision GPS coordinate reverse geocoding (Nominatim + BigDataCloud fallback)
 */

async function getAutoLocationFromIP(req) {
  // Extract client IP if behind proxy, or let ip-api resolve caller's public IP
  const forwarded = req ? (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '') : '';
  const clientIp = forwarded.split(',')[0].trim();

  // If local loopback (localhost), call without IP to get public gateway IP
  const isLocal = !clientIp || clientIp === '::1' || clientIp === '127.0.0.1' || clientIp.startsWith('192.168.') || clientIp.startsWith('10.');
  const queryUrl = isLocal ? 'http://ip-api.com/json' : `http://ip-api.com/json/${clientIp}`;

  try {
    const resp = await axios.get(queryUrl, { timeout: 4000 });
    if (resp.data && resp.data.status === 'success') {
      const d = resp.data;
      return {
        status: 'success',
        city: d.city || 'Howrah',
        district: d.city || 'Howrah',
        state: d.regionName || 'West Bengal',
        country: d.country || 'India',
        pincode: d.zip || '',
        lat: d.lat || 22.574,
        lon: d.lon || 88.3191,
        source: 'IP Geolocation Engine (ip-api)',
        detected_via: 'IP'
      };
    }
  } catch (err) {
    console.warn('[LocationEngine] ip-api warning:', err.message);
  }

  // Backup fallback
  return {
    status: 'success',
    city: 'Howrah',
    district: 'Howrah',
    state: 'West Bengal',
    country: 'India',
    pincode: '711102',
    lat: 22.574,
    lon: 88.3191,
    source: 'Default Agritech Regional Baseline (Gangetic Delta)',
    detected_via: 'Default'
  };
}

async function reverseGeocodeCoordinates(lat, lon) {
  const latitude = parseFloat(lat);
  const longitude = parseFloat(lon);

  if (isNaN(latitude) || isNaN(longitude)) {
    throw new Error('Invalid latitude or longitude provided.');
  }

  // 1. Google Maps Geocoding API (if enabled with API key)
  const googleKey = process.env.GOOGLE_MAPS_API_KEY;
  if (googleKey) {
    try {
      const gUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${googleKey}`;
      const gResp = await axios.get(gUrl, { timeout: 4000 });
      if (gResp.data && gResp.data.status === 'OK' && gResp.data.results && gResp.data.results.length > 0) {
        const result = gResp.data.results[0];
        let city = '';
        let district = '';
        let state = '';
        let pincode = '';
        let country = 'India';

        for (const comp of result.address_components || []) {
          if (comp.types.includes('locality')) city = comp.long_name;
          if (comp.types.includes('administrative_area_level_2')) district = comp.long_name;
          if (comp.types.includes('administrative_area_level_1')) state = comp.long_name;
          if (comp.types.includes('postal_code')) pincode = comp.long_name;
          if (comp.types.includes('country')) country = comp.long_name;
        }

        return {
          status: 'success',
          city: city || district || 'Howrah',
          district: district || city || 'Howrah',
          state: state || 'West Bengal',
          country: country,
          pincode: pincode,
          displayName: result.formatted_address,
          lat: latitude,
          lon: longitude,
          source: 'Google Maps Geocoding API',
          detected_via: 'GPS'
        };
      }
    } catch (gErr) {
      console.warn('[LocationEngine] Google Geocode fallback notice:', gErr.message);
    }
  }

  // 2. Primary Web: OpenStreetMap Nominatim with custom User-Agent
  try {
    const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`;
    const resp = await axios.get(nominatimUrl, {
      timeout: 4500,
      headers: { 'User-Agent': 'MaatiKatha-Agritech-Production/2.0 (contact: support@maatikatha.org)' }
    });

    if (resp.data && resp.data.address) {
      const addr = resp.data.address;
      const district = addr.state_district || addr.county || addr.city || addr.town || 'Howrah';
      const city = addr.city || addr.town || addr.village || addr.suburb || addr.municipality || district;
      const state = addr.state || 'West Bengal';

      return {
        status: 'success',
        city: city.replace(/Maidan|Metropolitan Area/gi, '').trim() || district,
        district: district.replace(/District/gi, '').trim(),
        state: state,
        country: addr.country || 'India',
        pincode: addr.postcode || '',
        displayName: resp.data.display_name,
        lat: latitude,
        lon: longitude,
        source: 'OpenStreetMap Nominatim Reverse Geocoding',
        detected_via: 'GPS'
      };
    }
  } catch (nomErr) {
    console.warn('[LocationEngine] Nominatim reverse geocode warning:', nomErr.message);
  }

  // 2. Secondary: BigDataCloud Reverse Geocoding Client
  try {
    const bdcUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`;
    const resp = await axios.get(bdcUrl, { timeout: 4000 });
    if (resp.data) {
      const d = resp.data;
      const district = d.locality || d.city || 'Howrah';
      return {
        status: 'success',
        city: d.locality || d.city || 'Howrah',
        district: district,
        state: d.principalSubdivision || 'West Bengal',
        country: d.countryName || 'India',
        pincode: d.postcode || '',
        displayName: `${d.locality || d.city}, ${d.principalSubdivision}, ${d.countryName}`,
        lat: latitude,
        lon: longitude,
        source: 'BigDataCloud Client Reverse Geocode',
        detected_via: 'GPS'
      };
    }
  } catch (bdcErr) {
    console.warn('[LocationEngine] BigDataCloud warning:', bdcErr.message);
  }

  // 3. Fallback: Bengal Delta default with given lat/lon
  return {
    status: 'success',
    city: 'Howrah Basin',
    district: 'Howrah',
    state: 'West Bengal',
    country: 'India',
    pincode: '',
    displayName: `${latitude.toFixed(2)}°N, ${longitude.toFixed(2)}°E, West Bengal`,
    lat: latitude,
    lon: longitude,
    source: 'Coordinate Coordinate Mapping Fallback',
    detected_via: 'GPS'
  };
}

module.exports = {
  getAutoLocationFromIP,
  reverseGeocodeCoordinates
};
