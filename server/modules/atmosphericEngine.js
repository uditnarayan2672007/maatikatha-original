const axios = require('axios');

/**
 * Converts degrees into 16-point compass cardinal
 */
function degreesToCompass(deg) {
  if (deg === undefined || deg === null || isNaN(deg)) return 'N';
  const val = Math.floor((deg / 22.5) + 0.5);
  const arr = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  return arr[val % 16];
}

/**
 * Calculates (u, v) wind components and downwind spore drift bearing
 * 
 * In meteorology:
 * - Wind direction theta is the direction FROM which the wind blows.
 * - u is the eastward wind component (positive = blowing towards east)
 *   u = -wind_speed * sin(theta_rad)
 * - v is the northward wind component (positive = blowing towards north)
 *   v = -wind_speed * cos(theta_rad)
 * - Downwind spore drift bearing = (direction + 180) % 360
 */
function calculateWindPhysics(windSpeedKmH, windDirectionDeg) {
  const speed = parseFloat(windSpeedKmH) || 0;
  const dir = parseFloat(windDirectionDeg) || 0;

  const rad = (dir * Math.PI) / 180;
  // Meteorological wind vector components (towards direction)
  const u = -speed * Math.sin(rad);
  const v = -speed * Math.cos(rad);

  // Downwind spore drift bearing
  const downwindBearing = (dir + 180) % 360;

  return {
    wind_speed_kmh: Math.round(speed * 10) / 10,
    wind_speed_ms: Math.round((speed / 3.6) * 100) / 100,
    wind_direction_deg: Math.round(dir),
    wind_direction_cardinal: degreesToCompass(dir),
    u_component: Math.round(u * 100) / 100,
    v_component: Math.round(v * 100) / 100,
    downwind_spore_bearing_deg: Math.round(downwindBearing),
    downwind_spore_cardinal: degreesToCompass(downwindBearing)
  };
}

/**
 * Disease Rule Engine:
 * - If humidity >= 85% and temp is between 12°C and 22°C:
 *   -> Alert: "HIGH" for Potato Late Blight (High risk of spore drift in bearing direction)
 * - If humidity >= 75% and temp is between 15°C and 25°C:
 *   -> Alert: "MODERATE" for Mustard White Rust/Alternaria
 * - If humidity >= 80% and temp is between 25°C and 32°C:
 *   -> Alert: "ELEVATED" for Paddy Sheath/Bacterial Blight
 * - Else -> Alert: "LOW" (Safe growing conditions)
 */
function evaluateDiseaseRisk(temp, humidity, downwindBearing, downwindCardinal) {
  const t = parseFloat(temp);
  const h = parseFloat(humidity);

  if (h >= 85 && t >= 12 && t <= 22) {
    return {
      alert_level: 'HIGH',
      disease: 'Potato Late Blight',
      pathogen: 'Phytophthora infestans',
      risk_severity: 'Critical Fungal Sporulation',
      message: `HIGH risk for Potato Late Blight. Cool temperatures (${t}°C) and saturated humidity (${h}%) trigger rapid zoospore germination. High risk of spore drift towards ${downwindBearing}° (${downwindCardinal}).`,
      actionable_advice: 'Immediately apply protective bio-shield: spray fermented sour buttermilk (sour curd) with raw turmeric solution, or certified copper hydroxide bio-drench. Avoid overhead sprinkler irrigation.',
      criteria_matched: 'humidity >= 85% && temp 12°C - 22°C'
    };
  }

  if (h >= 75 && t >= 15 && t <= 25) {
    return {
      alert_level: 'MODERATE',
      disease: 'Mustard White Rust / Alternaria Blight',
      pathogen: 'Albugo candida / Alternaria brassicae',
      risk_severity: 'Moderate Spore Dispersion',
      message: `MODERATE risk for Mustard White Rust/Alternaria. Current temp (${t}°C) and humidity (${h}%) favor pustule rupture with downwind dispersion heading ${downwindBearing}° (${downwindCardinal}).`,
      actionable_advice: 'Thin canopy to enhance inter-row ventilation. Spray 5% Neem Seed Kernel Extract (NSKE) or garlic-mustard oil emulsion.',
      criteria_matched: 'humidity >= 75% && temp 15°C - 25°C'
    };
  }

  if (h >= 80 && t >= 25 && t <= 32) {
    return {
      alert_level: 'ELEVATED',
      disease: 'Paddy Sheath / Bacterial Blight',
      pathogen: 'Rhizoctonia solani / Xanthomonas oryzae',
      risk_severity: 'Elevated Bacterial & Sclerotial Proliferation',
      message: `ELEVATED risk for Paddy Sheath/Bacterial Blight. Warm humid conditions (${t}°C, ${h}% RH) accelerate microclimatic canopy lesions.`,
      actionable_advice: 'Temporarily drain stagnant water from paddy basins for 48 hours; dust seasoned wood ash combined with cow dung slurry at border rows.',
      criteria_matched: 'humidity >= 80% && temp 25°C - 32°C'
    };
  }

  return {
    alert_level: 'LOW',
    disease: 'Safe Growing Conditions',
    pathogen: 'None',
    risk_severity: 'Low Risk',
    message: `LOW disease risk. Current ambient temperature (${t}°C) and humidity (${h}%) fall outside acute epidemic incubation thresholds.`,
    actionable_advice: 'Maintain standard regenerative irrigation and weed control protocols.',
    criteria_matched: 'Default / Baseline'
  };
}

/**
 * Main Atmospheric Engine Function:
 * Queries Open-Meteo and applies wind physics & disease rules
 */
async function getAtmosphericAndDiseasePrediction(lat = 23.08, lon = 88.28) {
  const latitude = parseFloat(lat) || 23.08;
  const longitude = parseFloat(lon) || 88.28;

  let current = null;
  let dataSource = 'Open-Meteo High-Resolution Live Forecast API';

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m`;
    const resp = await axios.get(url, { timeout: 6000 });
    if (resp.data && resp.data.current) {
      current = resp.data.current;
    }
  } catch (err) {
    console.warn('[AtmosphericEngine] Open-Meteo live query warning:', err.message);
  }

  // Resilient fallback if Open-Meteo is temporarily unreachable
  if (!current) {
    current = {
      time: new Date().toISOString(),
      temperature_2m: 28.5,
      relative_humidity_2m: 74,
      wind_speed_10m: 4.5,
      wind_direction_10m: 285
    };
    dataSource = 'Atmospheric Fallback Baseline (Bengal Basin)';
  }

  const windPhysics = calculateWindPhysics(current.wind_speed_10m, current.wind_direction_10m);
  const diseaseRisk = evaluateDiseaseRisk(
    current.temperature_2m,
    current.relative_humidity_2m,
    windPhysics.downwind_spore_bearing_deg,
    windPhysics.downwind_spore_cardinal
  );

  return {
    status: 'success',
    timestamp: current.time || new Date().toISOString(),
    location: {
      latitude,
      longitude
    },
    weather: {
      temperature_c: current.temperature_2m,
      relative_humidity_pct: current.relative_humidity_2m,
      wind_speed_kmh: windPhysics.wind_speed_kmh,
      wind_speed_ms: windPhysics.wind_speed_ms,
      wind_direction_deg: windPhysics.wind_direction_deg,
      wind_direction_cardinal: windPhysics.wind_direction_cardinal,
      u_component: windPhysics.u_component,
      v_component: windPhysics.v_component,
      downwind_spore_bearing_deg: windPhysics.downwind_spore_bearing_deg,
      downwind_spore_cardinal: windPhysics.downwind_spore_cardinal
    },
    disease_alert: diseaseRisk,
    data_source: dataSource
  };
}

module.exports = {
  getAtmosphericAndDiseasePrediction,
  calculateWindPhysics,
  evaluateDiseaseRisk,
  degreesToCompass
};
