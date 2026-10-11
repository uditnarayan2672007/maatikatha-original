import React, { useState, useEffect } from 'react';
import { History, TrendingDown, Thermometer, Sprout, ShieldAlert, DollarSign, ArrowRight, Play } from 'lucide-react';

export default function TimeMachine({ language }) {
  const [selectedYear, setSelectedYear] = useState(2026);
  const [historyData, setHistoryData] = useState([]);
  const [currentMetrics, setCurrentMetrics] = useState({
    avg_temp_c: 32.1,
    soil_carbon_pct: 0.40,
    yield_impact_pct: -25
  });

  // Simulator state
  const [selectedScenario, setSelectedScenario] = useState('add_cowdung');
  const [dayOffset, setDayOffset] = useState(2);
  const [simLoading, setSimLoading] = useState(false);
  const [simulationResult, setSimulationResult] = useState(null);

  // Localization
  const t = {
    bn: {
      title: "টাইম মেশিন ও ভবিষ্যৎ সিমুলেটর",
      desc: "১৯৮০ থেকে ২০২৬ সালের মাটির পরিবর্তন দেখুন এবং ভবিষ্যৎ চাষের ঝুঁকি পরীক্ষা করুন",
      pastTitle: "🕰️ ঐতিহাসিক মাটির ক্ষয়ক্ষতি (১৯৮০ - ২০২৬)",
      yearLabel: "বছর:",
      tempLabel: "গড় তাপমাত্রা",
      carbonLabel: "মাটির জৈব কার্বন",
      yieldLabel: "ফলনের প্রভাব",
      futureTitle: "🔮 'যদি এমন করি?' ভবিষ্যৎ সিমুলেটর",
      futureDesc: "মাঠে ভুল করার আগেই ডিজিটালভাবে সিদ্ধান্তের ফলাফল দেখে নিন:",
      scenarioWater: "২ দিন সেচ বন্ধ",
      scenarioCowdung: "গোবর ও ছাই সার",
      scenarioChemical: "রাসায়নিক ইউরিয়া",
      scenarioMulch: "খড়ের জৈব মালচিং",
      dayLabel: "কবে প্রয়োগ করবেন:",
      runSimBtn: "ফলাফল পূর্বাভাস করুন",
      stressResult: "ফসলের মানসিক চাপ (Stress)",
      yieldResult: "প্রত্যাশিত ফলন পরিবর্তন",
      costResult: "আর্থিক সঞ্চয় / খরচ",
      ancestralWisdom: "পূর্বপুরুষের নির্দেশিকা:"
    },
    hi: {
      title: "टाइम मशीन व भविष्य सिम्युलेटर",
      desc: "1980 से 2026 तक मिट्टी का बदलाव देखें और अपने फैसलों का असर परखें",
      pastTitle: "🕰️ ऐतिहासिक मिट्टी क्षरण (1980 - 2026)",
      yearLabel: "वर्ष:",
      tempLabel: "औसत तापमान",
      carbonLabel: "मिट्टी का जैविक कार्बन",
      yieldLabel: "उपज पर असर",
      futureTitle: "🔮 'क्या होगा अगर?' सिम्युलेटर",
      futureDesc: "खेत में गलती करने से पहले ही मोबाइल पर नतीजे देखें:",
      scenarioWater: "2 दिन पानी न दें",
      scenarioCowdung: "गोबर व राख की खाद",
      scenarioChemical: "रासायनिक यूरिया",
      scenarioMulch: "पुआल की मल्चिंग",
      dayLabel: "कितने दिन बाद करेंगे:",
      runSimBtn: "पूर्वानुमान लगाएं",
      stressResult: "फसल पर तनाव (Stress)",
      yieldResult: "उपज में बदलाव",
      costResult: "लागत बचत / खर्च",
      ancestralWisdom: "बुजुर्गों का सुझाव:"
    },
    en: {
      title: "Time Machine & Decision Simulator",
      desc: "Witness decadal soil degradation (1980-2026) and simulate farm decisions before acting.",
      pastTitle: "🕰️ Soil History Timeline (1980 - 2026)",
      yearLabel: "Year:",
      tempLabel: "Avg Temperature",
      carbonLabel: "Soil Organic Carbon",
      yieldLabel: "Yield Impact",
      futureTitle: "🔮 'What-If' Decision Simulator",
      futureDesc: "Simulate risky farm choices to see financial impact before making mistakes in the field:",
      scenarioWater: "Skip 2 Watering Cycles",
      scenarioCowdung: "Add Cow Dung Compost",
      scenarioChemical: "Apply Chemical Urea",
      scenarioMulch: "Apply Straw Mulch",
      dayLabel: "Execution Timing:",
      runSimBtn: "Run Predictive Simulation",
      stressResult: "Crop Stress Level",
      yieldResult: "Yield Variation",
      costResult: "Financial Savings",
      ancestralWisdom: "Ancestral Protocol:"
    }
  }[language] || {};

  // Fetch decadal history on load
  useEffect(() => {
    fetch('/api/history?region_id=1')
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success' && data.data?.length) {
          setHistoryData(data.data);
          updateMetricsForYear(selectedYear, data.data);
        }
      })
      .catch(err => console.warn("History fetch fallback:", err));
  }, []);

  const updateMetricsForYear = (year, data = historyData) => {
    setSelectedYear(year);
    if (!data.length) return;

    // Find closest decade record
    let closest = data[0];
    let minDiff = Math.abs(data[0].decade_year - year);
    for (const item of data) {
      const diff = Math.abs(item.decade_year - year);
      if (diff < minDiff) {
        minDiff = diff;
        closest = item;
      }
    }
    setCurrentMetrics(closest);
  };

  const handleSliderChange = (e) => {
    const val = Number(e.target.value);
    updateMetricsForYear(val);
  };

  // Run simulation via POST /api/simulate (Grok / Groq Engine)
  const runSimulation = async () => {
    setSimLoading(true);
    try {
      const scenarioMap = {
        skip_water: t.scenarioWater,
        add_cowdung: t.scenarioCowdung,
        chemical_urea: t.scenarioChemical,
        bio_mulch: t.scenarioMulch
      };

      const res = await fetch('/api/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenarioId: selectedScenario,
          scenarioName: scenarioMap[selectedScenario],
          dayOffset: dayOffset,
          regionId: 1
        })
      });
      const data = await res.json();
      if (data.status === 'success') {
        setSimulationResult(data.projection);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSimLoading(false);
    }
  };

  return (
    <div className="responsive-two-col">
      {/* SECTION 1: Decadal Historical Slider */}
      <div className="mk-card mk-card-amber">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <History size={20} color="#b45309" />
          <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#78350f' }}>{t.pastTitle}</h3>
        </div>
        <p style={{ fontSize: '0.78rem', color: '#92400e', marginBottom: '14px', lineHeight: '1.4' }}>
          {language === 'bn' 
            ? "স্লাইডার ডানে বা বামে টেনে দেখুন কিভাবে অপরিকল্পিত রাসায়নিক ব্যবহারে মাটির প্রাণশক্তি শেষ হয়েছে।"
            : language === 'hi'
            ? "स्लाइडर को आगे-पीछे करके देखें कि कैसे रसायनों से हमारे खेतों की उर्वरा शक्ति घटती गई।"
            : "Drag the slider to see how chemical dependency depleted soil organic carbon over 50 years."}
        </p>

        <div className="timeline-slider-container">
          <div className="slider-year-badge">
            {t.yearLabel} {selectedYear}
          </div>

          <input
            type="range"
            min="1980"
            max="2026"
            step="5"
            value={selectedYear}
            onChange={handleSliderChange}
            className="custom-range-slider"
          />

          <div className="slider-labels">
            <span>1980 (উর্বর মাটি)</span>
            <span>2000</span>
            <span>2026 (ক্ষয়িষ্ণু বর্তমান)</span>
          </div>
        </div>

        {/* Historic Metrics Grid */}
        <div className="metric-grid" style={{ marginTop: '16px' }}>
          <div className="metric-box">
            <span className="metric-label">{t.tempLabel}</span>
            <span className="metric-val" style={{ color: currentMetrics.avg_temp_c > 30 ? '#dc2626' : '#15803d' }}>
              {currentMetrics.avg_temp_c}°C
            </span>
            <span style={{ fontSize: '0.68rem', color: '#6b7280' }}>
              {currentMetrics.avg_temp_c > 30 ? '↑ +3.6°C বৃদ্ধি' : 'স্বাভাবিক আবহাওয়া'}
            </span>
          </div>

          <div className="metric-box">
            <span className="metric-label">{t.carbonLabel}</span>
            <span className="metric-val" style={{ color: currentMetrics.soil_carbon_pct < 0.8 ? '#b45309' : '#059669' }}>
              {currentMetrics.soil_carbon_pct}%
            </span>
            <span style={{ fontSize: '0.68rem', color: '#6b7280' }}>
              {currentMetrics.soil_carbon_pct < 0.6 ? 'বিপজ্জনক মাত্রায় কম' : 'উচ্চ জৈব শক্তি'}
            </span>
          </div>
        </div>

        <div style={{ marginTop: '10px', background: 'white', padding: '10px', borderRadius: '12px', border: '1px solid #fde68a', fontSize: '0.8rem', color: '#78350f' }}>
          📉 <b>{t.yieldLabel}:</b> {currentMetrics.yield_impact_pct >= 0 ? `+${currentMetrics.yield_impact_pct}% (উন্নত)` : `${currentMetrics.yield_impact_pct}% (রাসায়নিকের ক্ষতি)`}
        </div>
      </div>

      {/* SECTION 2: "What-If" Decision Simulator */}
      <div className="mk-card mk-card-emerald">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <Sprout size={20} color="#15803d" />
          <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f5132' }}>{t.futureTitle}</h3>
        </div>
        <p style={{ fontSize: '0.78rem', color: '#166534', marginBottom: '14px' }}>{t.futureDesc}</p>

        {/* Scenario Selection Grid */}
        <div className="scenario-button-grid">
          <button
            className={`scenario-btn ${selectedScenario === 'add_cowdung' ? 'active' : ''}`}
            onClick={() => setSelectedScenario('add_cowdung')}
          >
            <span className="scenario-btn-title">🐄 {t.scenarioCowdung}</span>
            <span className="scenario-btn-sub">ঐতিহ্যবাহী জৈব পুষ্টি</span>
          </button>

          <button
            className={`scenario-btn ${selectedScenario === 'skip_water' ? 'active' : ''}`}
            onClick={() => setSelectedScenario('skip_water')}
          >
            <span className="scenario-btn-title">💧 {t.scenarioWater}</span>
            <span className="scenario-btn-sub">জলের অভাব পরীক্ষা</span>
          </button>

          <button
            className={`scenario-btn ${selectedScenario === 'bio_mulch' ? 'active' : ''}`}
            onClick={() => setSelectedScenario('bio_mulch')}
          >
            <span className="scenario-btn-title">🌾 {t.scenarioMulch}</span>
            <span className="scenario-btn-sub">আর্দ্রতা লক প্রযুক্তি</span>
          </button>

          <button
            className={`scenario-btn ${selectedScenario === 'chemical_urea' ? 'active' : ''}`}
            onClick={() => setSelectedScenario('chemical_urea')}
          >
            <span className="scenario-btn-title">⚠️ {t.scenarioChemical}</span>
            <span className="scenario-btn-sub">রাসায়নিক লবণ পরীক্ষা</span>
          </button>
        </div>

        {/* Day Offset Slider */}
        <div style={{ marginTop: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: '700', color: '#14532d', marginBottom: '6px' }}>
            <span>{t.dayLabel}</span>
            <span>{dayOffset} {language === 'bn' ? 'দিন পর' : language === 'hi' ? 'दिन बाद' : 'days later'}</span>
          </div>
          <input
            type="range"
            min="1"
            max="10"
            value={dayOffset}
            onChange={(e) => setDayOffset(Number(e.target.value))}
            className="custom-range-slider"
          />
        </div>

        {/* Run Simulation Action Button */}
        <button
          onClick={runSimulation}
          disabled={simLoading}
          style={{
            marginTop: '16px',
            width: '100%',
            background: 'linear-gradient(135deg, #15803d 0%, #0f5132 100%)',
            color: 'white',
            border: 'none',
            padding: '12px',
            borderRadius: '14px',
            fontWeight: '800',
            fontSize: '0.9rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: '0 4px 15px rgba(21, 128, 61, 0.3)'
          }}
        >
          {simLoading ? (
            <div className="pulse-spinner" />
          ) : (
            <>
              <Play size={18} fill="white" />
              <span>{t.runSimBtn}</span>
            </>
          )}
        </button>

        {/* Simulation Output Card */}
        {simulationResult && (
          <div style={{ marginTop: '16px', background: 'white', padding: '16px', borderRadius: '16px', border: '1px solid #86efac', animation: 'fadeIn 0.25s ease' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: '800', color: '#166534', marginBottom: '8px' }}>
              📊 {simulationResult.warning_message}
            </h4>

            <div className="metric-grid" style={{ marginBottom: '10px' }}>
              <div className="metric-box">
                <span className="metric-label">{t.stressResult}</span>
                <span className="metric-val" style={{ color: simulationResult.stress_increase_pct > 20 ? '#dc2626' : '#15803d' }}>
                  {simulationResult.stress_increase_pct > 0 ? `+${simulationResult.stress_increase_pct}%` : `${simulationResult.stress_increase_pct}%`}
                </span>
              </div>

              <div className="metric-box">
                <span className="metric-label">{t.yieldResult}</span>
                <span className="metric-val" style={{ color: simulationResult.yield_variation_pct >= 0 ? '#15803d' : '#dc2626' }}>
                  {simulationResult.yield_variation_pct >= 0 ? `+${simulationResult.yield_variation_pct}%` : `${simulationResult.yield_variation_pct}%`}
                </span>
              </div>
            </div>

            <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', fontWeight: '700', color: simulationResult.cost_savings_inr >= 0 ? '#15803d' : '#dc2626' }}>
              <DollarSign size={16} />
              <span>
                {t.costResult}: {simulationResult.cost_savings_inr >= 0 ? `₹${simulationResult.cost_savings_inr} সাশ্রয়` : `₹${Math.abs(simulationResult.cost_savings_inr)} আর্থিক ক্ষতি`}
              </span>
            </div>

            <div style={{ marginTop: '10px', fontSize: '0.8rem', color: '#374151', background: '#ecfdf5', padding: '10px', borderRadius: '10px', borderLeft: '4px solid #10b981' }}>
              🌱 <b>{t.ancestralWisdom}</b> {simulationResult.ancestral_tip}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
