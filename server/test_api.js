const axios = require('axios');

async function testBackend() {
  const baseURL = 'http://localhost:5000';
  console.log('🧪 Starting MaatiKatha Backend Endpoint Checks...\n');

  try {
    // 1. Health check
    console.log('1️⃣ Checking GET /api/health...');
    const health = await axios.get(`${baseURL}/api/health`);
    console.log('   ✓ Health status:', health.data);

    // 2. History check
    console.log('\n2️⃣ Checking GET /api/history...');
    const history = await axios.get(`${baseURL}/api/history?region_id=1`);
    console.log(`   ✓ Region: ${history.data.region}, Decadal records: ${history.data.data.length}`);

    // 3. Weather check
    console.log('\n3️⃣ Checking GET /api/weather...');
    const weather = await axios.get(`${baseURL}/api/weather?city=Howrah`);
    console.log(`   ✓ City: ${weather.data.weather.city}, Temp: ${weather.data.weather.current_temp}°C, Active Alerts: ${weather.data.active_alerts.length}, Action Steps: ${weather.data.action_plan.length}`);

    // 4. Simulate check
    console.log('\n4️⃣ Checking POST /api/simulate...');
    const sim = await axios.post(`${baseURL}/api/simulate`, {
      scenarioId: 'add_cowdung',
      scenarioName: 'Cow Dung & Ash Manure',
      dayOffset: 3,
      regionId: 1
    });
    console.log(`   ✓ Engine: ${sim.data.engine}`);
    console.log('   ✓ Projection:', sim.data.projection);

    // 5. Voice Doctor text consultation check
    console.log('\n5️⃣ Checking POST /api/voice...');
    const voice = await axios.post(`${baseURL}/api/voice`, {
      textQuery: 'গাছের পাতা হলুদ হয়ে গেছে (yellow leaves)',
      language: 'bn'
    });
    console.log(`   ✓ Matched Remedy: ${voice.data.remedy_matched}`);
    console.log(`   ✓ Response: ${voice.data.textResponse.substring(0, 100)}...`);

    // 6. Community Alerts check
    console.log('\n6️⃣ Checking GET /api/alerts...');
    const alerts = await axios.get(`${baseURL}/api/alerts?region_id=1`);
    console.log(`   ✓ Alerts retrieved: ${alerts.data.alerts.length}`);

    // 7. V1 Atmospheric & Disease Prediction Engine check
    console.log('\n7️⃣ Checking GET /api/v1/atmospheric/prediction...');
    const atmos = await axios.get(`${baseURL}/api/v1/atmospheric/prediction?lat=23.08&lon=88.28`);
    console.log(`   ✓ Temp: ${atmos.data.weather.temperature_c}°C, Humidity: ${atmos.data.weather.relative_humidity_pct}%`);
    console.log(`   ✓ Wind: ${atmos.data.weather.wind_speed_kmh} km/h (u: ${atmos.data.weather.u_component}, v: ${atmos.data.weather.v_component})`);
    console.log(`   ✓ Spore Bearing: ${atmos.data.weather.downwind_spore_bearing_deg}° (${atmos.data.weather.downwind_spore_cardinal})`);
    console.log(`   ✓ Disease Alert: [${atmos.data.disease_alert.alert_level}] ${atmos.data.disease_alert.disease}`);

    // 8. V1 Top Mandi Benchmarks check
    console.log('\n8️⃣ Checking GET /api/v1/mandi/benchmarks...');
    const mandi = await axios.get(`${baseURL}/api/v1/mandi/benchmarks?district=Hooghly`);
    console.log(`   ✓ District: ${mandi.data.district_filter}, Mandis: ${mandi.data.mandis_tracked.map(m => m.mandi_name).join(', ')}`);
    console.log(`   ✓ Summary Benchmarks: Potato ₹${mandi.data.summary_benchmarks.potato_jyoti_avg_modal}, Mustard ₹${mandi.data.summary_benchmarks.mustard_avg_modal}, Paddy ₹${mandi.data.summary_benchmarks.gobindobhog_paddy_avg_modal}`);

    // 9. V1 Combined Dashboard Insights check
    console.log('\n9️⃣ Checking GET /api/v1/dashboard/insights...');
    const insights = await axios.get(`${baseURL}/api/v1/dashboard/insights?lat=23.08&lon=88.28&district=Hooghly`);
    console.log(`   ✓ Combined Insights status: ${insights.data.status}`);
    console.log(`   ✓ Atmospheric Disease Level: ${insights.data.atmospheric_and_disease_engine.disease_alert.alert_level}`);
    console.log(`   ✓ Top Mandi Tracked: ${insights.data.top_mandi_benchmark_engine.mandis_tracked[0].mandi_name}`);

    console.log('\n🎉 ALL CHECKS PASSED SUCCESSFULLY!');
  } catch (err) {
    console.error('❌ Check failed:', err.response ? err.response.data : err.message);
    process.exit(1);
  }
}

testBackend();
