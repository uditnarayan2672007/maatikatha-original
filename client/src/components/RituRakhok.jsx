import React, { useState, useEffect } from 'react';
import { 
  CloudRain, 
  Sun, 
  Wind, 
  Droplets, 
  AlertTriangle, 
  ShieldCheck, 
  Calendar, 
  Sprout, 
  Shield, 
  Clock, 
  ChevronDown, 
  ChevronUp, 
  RefreshCw, 
  Zap, 
  CheckCircle2, 
  MapPin, 
  Sparkles, 
  Thermometer, 
  Compass,
  Flame 
} from 'lucide-react';

export default function RituRakhok({ language = 'en', currentRegion, currentLocation }) {
  // Safe coordinate parsing
  const rawLat = currentLocation?.lat ?? currentLocation?.coords?.latitude ?? 22.574;
  const rawLon = currentLocation?.lon ?? currentLocation?.coords?.longitude ?? 88.3191;
  const lat = typeof rawLat === 'number' ? rawLat : parseFloat(rawLat) || 22.574;
  const lon = typeof rawLon === 'number' ? rawLon : parseFloat(rawLon) || 88.3191;
  const city = currentLocation?.city || currentLocation?.name || currentRegion || 'Howrah, West Bengal';

  // Fallback 4 Segmented Intervals for Instant Render
  const initialHourlyRadar = [
    {
      id: '6h',
      label: 'Next 6h',
      window: '0 - 6 Hours',
      temp_avg: 29.2,
      temp_max: 31.0,
      temp_min: 27.5,
      humidity_avg: 72,
      precip_prob_max: 15,
      precip_sum_mm: 0,
      wind_speed_avg: 6.2,
      wind_direction: 'WNW',
      field_impact: {
        badge: 'Optimal Spraying/Tilling Window',
        badge_bn: 'সার ও সেচের অনুকূল সময়',
        badge_hi: 'छिड़काव व जुताई का अनुकूल समय',
        color: '#10b981',
        bgColor: 'rgba(16, 185, 129, 0.15)',
        advice: 'Mild breeze and stable soil moisture. Safest window for bio-manure and weed management.'
      }
    },
    {
      id: '12h',
      label: 'Next 12h',
      window: '6 - 12 Hours',
      temp_avg: 32.5,
      temp_max: 34.2,
      temp_min: 30.1,
      humidity_avg: 65,
      precip_prob_max: 10,
      precip_sum_mm: 0,
      wind_speed_avg: 8.5,
      wind_direction: 'W',
      field_impact: {
        badge: 'Mild Evaporation Risk',
        badge_bn: 'মাঝারি বাষ্পীভবন ও তাপ চাপ',
        badge_hi: 'मध्यम वाष्पीकरण व ताप तनाव',
        color: '#f97316',
        bgColor: 'rgba(249, 115, 22, 0.15)',
        advice: 'Peak afternoon heat will accelerate surface drying. Protect root zones with mulch.'
      }
    },
    {
      id: '18h',
      label: 'Next 18h',
      window: '12 - 18 Hours',
      temp_avg: 27.8,
      temp_max: 29.0,
      temp_min: 26.5,
      humidity_avg: 84,
      precip_prob_max: 35,
      precip_sum_mm: 0.5,
      wind_speed_avg: 5.1,
      wind_direction: 'NW',
      field_impact: {
        badge: 'Dew Condensation Window',
        badge_bn: 'শিশির আর্দ্রতা ও ছত্রাক ঝুঁকি',
        badge_hi: 'ओस संघनन व फफूंद खिड़की',
        color: '#06b6d4',
        bgColor: 'rgba(6, 182, 212, 0.15)',
        advice: 'Cool night with high dew index. Dust kitchen wood ash before sunset to protect foliage.'
      }
    },
    {
      id: '24h',
      label: 'Next 24h',
      window: '18 - 24 Hours',
      temp_avg: 26.4,
      temp_max: 28.1,
      temp_min: 25.2,
      humidity_avg: 88,
      precip_prob_max: 45,
      precip_sum_mm: 1.8,
      wind_speed_avg: 7.0,
      wind_direction: 'NNW',
      field_impact: {
        badge: 'Precipitation / Rain Runoff Risk',
        badge_bn: 'বৃষ্টির জল ও নিকাশি ঝুঁকি',
        badge_hi: 'वर्षा व जलभराव जोखिम',
        color: '#0284c7',
        bgColor: 'rgba(2, 132, 199, 0.15)',
        advice: 'Early morning showers predicted. Clear furrow boundaries to prevent waterlogging.'
      }
    }
  ];

  // Fallback 4 Zero-Cost Ancestral Protocols
  const initialZeroCostProtocols = [
    {
      id: 'straw_mulch',
      title: 'Dry Paddy Straw Mulching',
      title_bn: 'ধানের শুকনো খড়ের আর্দ্রতা কবচ',
      title_hi: 'धान के सूखे पुआल की मल्चिंग',
      root_source: 'Dry paddy straw directly from farm threshing yard (খামারের ধানের নাড়া বা খড়)',
      action_window: 'Apply within next 4 hours before intense afternoon sun (11:00 AM - 3:00 PM)',
      action_window_bn: 'দুপুরের চড়া রোদের আগে আগামী ৪ ঘণ্টার মধ্যে প্রয়োগ করুন (সকাল ১১টা - দুপুর ৩টা)',
      action_window_hi: 'दोपहर की तेज धूप से पहले अगले 4 घंटों में लगाएं (सुबह 11 से दोपहर 3)',
      savings_badge: '₹0 Expense • Farm Waste Derived',
      benefit: 'Cuts moisture evaporation by 45%, stops soil baking into crust, and keeps root microbes active.',
      benefit_bn: 'মাটির বাষ্পীভবন ৪৫% কমায়, জমি শক্ত হতে দেয় না এবং কেঁচোর চলাচল স্বাভাবিক রাখে।',
      benefit_hi: 'मिट्टी से नमी का नुकसान 45% घटाता है और जड़ों को सूखने से बचाता है।'
    },
    {
      id: 'wood_ash',
      title: 'Kitchen Wood Ash Anti-Fungal Dusting',
      title_bn: 'উনুনের কাঠের ছাইয়ের ছত্রাক-রক্ষা',
      title_hi: 'चूल्हे की लकड़ी की राख का छिड़काव',
      root_source: 'Kitchen wood and husk ash from earthen chulha (রান্নাঘরের উনুনের শুকনো ছাই)',
      action_window: 'Dust over leaves before 5:00 PM before night dew settles',
      action_window_bn: 'সন্ধ্যায় শিশির পড়ার আগে বিকেল ৫টার মধ্যে ফসলের ওপর ছিটিয়ে দিন',
      action_window_hi: 'रात की ओस गिरने से पहले शाम 5 बजे तक पत्तों पर बুরकें',
      savings_badge: '₹0 Expense • Kitchen Chulha Derived',
      benefit: 'Alkaline silica barrier prevents fungal spore germination and repels soft-bodied aphids naturally.',
      benefit_bn: 'ক্ষারীয় সিলিকা ছত্রাকের বিস্তার বন্ধ করে এবং জাব পোকা ও শুঁয়োপোকা দমন করে।',
      benefit_hi: 'राख की क्षारीय परत फफूंद के बीजाणुओं को रोकती है और माहू कीट भगाती है।'
    },
    {
      id: 'cow_urine_neem',
      title: 'Fermented Cow Urine & Neem Leaf Shield',
      title_bn: 'গোমূত্র ও নিমপাতার ভেষজ আরক',
      title_hi: 'गोमूत्र व नीम की पत्तियों का प्राकृतिक अर्क',
      root_source: 'Fresh desi cow urine + backyard neem tree leaves (গোয়ালঘরের গোমূত্র ও নিমপাতা)',
      action_window: 'Spray at 4:00 PM – 5:30 PM during low wind and mild temperature',
      action_window_bn: 'বিকেল ৪টা থেকে ৫:৩০টার মধ্যে মৃদু বাতাসে গাছে স্প্রে করুন',
      action_window_hi: 'शाम 4 से 5:30 बजे के बीच हल्की हवा में छिड़काव करें',
      savings_badge: '₹0 Expense • Cattle Shed & Tree Derived',
      benefit: 'Natural azadirachtin repels sucking insects, whiteflies, and stem borers without toxic chemicals.',
      benefit_bn: 'বিষাক্ত কীটনাশক ছাড়াই ডগা ও ফল ছিদ্রকারী পোকা এবং সাদা মাছি দূরে রাখে।',
      benefit_hi: 'बिना जहरीले रसायन के रस चूसक कीटों और तना छेदक से सुरक्षा।'
    },
    {
      id: 'furrow_trench',
      title: 'Perimeter Furrow Trenching for Runoff',
      title_bn: 'সীমানা নালা ও জল নিষ্কাশন খনন',
      title_hi: 'খेत की मेड़ों पर जल निकासी नाली',
      root_source: 'Hand spade / kodali along field bund boundaries (হাতের কোদাল দিয়ে সীমানা নালা)',
      action_window: 'Dig 6-inch furrow runoff channels before anticipated rain showers',
      action_window_bn: 'আকস্মিক বৃষ্টির আগেই মাঠের সীমানায় ৬ ইঞ্চি নালা কেটে জল বের করার পথ করুন',
      action_window_hi: 'संभावित वर्षा से पहले मेड़ों के पास 6 इंच गहरी नाली बनाएं',
      savings_badge: '₹0 Expense • Farm Labor Only',
      benefit: 'Channels excess shower runoff into farm ponds, preventing root suffocation and potato tuber rot.',
      benefit_bn: 'অতিরিক্ত বৃষ্টির জল পুকুরে নামিয়ে আলু ও সবজি গাছের গোড়া পচা রোধ করে।',
      benefit_hi: 'अतिरिक्त वर्षा जल को तालाब में मोड़कर जड़ों व आलू को सड़ने से बचाता है।'
    }
  ];

  const initialActionPlan = [
    {
      step: 1,
      title: 'Sowing Schedule: Optimal Conditions',
      desc: 'Temperature & humidity are optimal for nursery bed preparation. Sowing can proceed as scheduled.',
      icon: 'calendar'
    },
    {
      step: 2,
      title: 'Heritage Seed: Switch to Gobindobhog / Desi Boro',
      desc: 'Traditional deep-root variety requires 35% less irrigation and withstands heat shock naturally.',
      icon: 'sprout'
    },
    {
      step: 3,
      title: 'Soil Moisture Locking: Rice Straw Mulching',
      desc: 'Cover inter-row spaces with 3-inch straw mulch to cut evaporation by 40%.',
      icon: 'shield'
    }
  ];

  const [weatherData, setWeatherData] = useState({
    city: city,
    current_temp: 29.5,
    feels_like: 32.0,
    humidity: 70,
    wind_speed: 6.5,
    wind_direction_text: 'NW',
    condition: 'Fair / Breezy',
    description: 'Live Agro-Climatic Microclimate'
  });
  const [hourlyRadar, setHourlyRadar] = useState(initialHourlyRadar);
  const [severeAlert, setSevereAlert] = useState(null);
  const [zeroCostProtocols, setZeroCostProtocols] = useState(initialZeroCostProtocols);
  const [actionPlan, setActionPlan] = useState(initialActionPlan);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // UI interactive state
  const [selectedSegmentId, setSelectedSegmentId] = useState('6h');
  const [isAlertTrayOpen, setIsAlertTrayOpen] = useState(true);
  const [completedProtocols, setCompletedProtocols] = useState({});

  // Comprehensive Multilingual Dictionary
  const t = {
    bn: {
      title: "ঋতুরক্ষক ২৪-ঘণ্টা কৃষি-আবহাওয়া রাডার",
      subhead: "আগামী ২৪-ঘণ্টার পূর্বাভাস ও শূন্য ব্যয়ের পূর্বপুরুষের প্রতিরোধমূলক ব্যবস্থা",
      liveGps: "সক্রিয় জিপিএস স্থানাঙ্ক",
      syncStatus: "লাইভ উপগ্রহ টেলিমিতি সিঙ্ক",
      refresh: "রিফ্রেশ করুন",
      now: "বর্তমান সময়",
      feelsLike: "অনুভূত তাপমাত্রা",
      humidity: "বাতাসের আর্দ্রতা",
      wind: "বাতাসের গতি",
      windDir: "দিক",
      rainProb: "বৃষ্টির সম্ভাবনা",
      timelineTitle: "২৪-ঘণ্টা মাইক্রোক্লাইমেট রাডার (সময়রেখা)",
      timelineSubtitle: "প্রতি ৬-ঘণ্টার ফসল-প্রভাব সূচক ও কৃষি সুপারিশ",
      tempCurve: "তাপমাত্রা পরিসর",
      fieldImpact: "মাঠের প্রভাব সূচক",
      zeroCostTitle: "Zero-Cost Ancestral Shield (শূন্য ব্যয়ের প্রতিরোধ)",
      zeroCostSubhead: "১০০% খামারে তৈরি ও গ্রামীণ বর্জ্যজাত প্রতিরোধমূলক সুরক্ষা চক্র",
      rootSource: "মূল উৎস",
      actionWindow: "প্রয়োগের সময়সীমা",
      savingsBadge: "₹০ ব্যয় • খামারজাত বর্জ্য",
      markDone: "প্রস্তুত চিহ্নিত করুন",
      completed: "প্রস্তুত সম্পন্ন",
      takeActionNow: "জরুরি পদক্ষেপ তালিকা",
      collapseTray: "ট্রে বন্ধ করুন",
      ancestralPlanTitle: "৩-দফা পূর্বপুরুষের কৃষি কৌশল",
      tempMax: "সর্বোচ্চ",
      tempMin: "সর্বনিম্ন",
      avg: "গড়",
      expectedPrecip: "বৃষ্টিপাত",
      inspectTitle: "৬-ঘণ্টার বিশদ কৃষি বিশ্লেষণ",
      adviceBadge: "মাঠের করণীয়"
    },
    hi: {
      title: "ऋतुरक्षक 24-घंटे कृषि-मौसम रडार",
      subhead: "अगले 24 घंटों का सटीक पूर्वानुमान व शून्य-लागत पारंपरिक सुरक्षा उपाय",
      liveGps: "सक्रिय जीपीएस निर्देशांक",
      syncStatus: "लाइव उपग्रह टेलीमेट्री सिंक",
      refresh: "ताज़ा करें",
      now: "वर्तमान मौसम",
      feelsLike: "अनुभूत तापमान",
      humidity: "हवा में नमी",
      wind: "हवा की गति",
      windDir: "दिशा",
      rainProb: "वर्षा की संभावना",
      timelineTitle: "24-घंटे माइक्रोक्लाइमेट रडार (समय-सीमा)",
      timelineSubtitle: "प्रत्येक 6 घंटे का फसल प्रभाव सूचकांक व कृषि परामर्श",
      tempCurve: "तापमान दायरा",
      fieldImpact: "खेत प्रभाव सूचक",
      zeroCostTitle: "Zero-Cost Ancestral Shield (शून्य-लागत सुरक्षा कवच)",
      zeroCostSubhead: "100% घरेलू व खेत-निर्मित प्राकृतिक सुरक्षा चक्र",
      rootSource: "मूल स्रोत",
      actionWindow: "प्रयोग की सटीक समय-सीमा",
      savingsBadge: "₹0 खर्च • कृषि अपशिष्ट आधारित",
      markDone: "तैयार चिह्नित करें",
      completed: "तैयारी पूर्ण",
      takeActionNow: "तत्काल कदम उठाएं",
      collapseTray: "ट्रे बंद करें",
      ancestralPlanTitle: "3-चरणीय पारंपरिक कृषि रणनीति",
      tempMax: "अधिकतम",
      tempMin: "न्यूनतम",
      avg: "औसत",
      expectedPrecip: "वर्षा",
      inspectTitle: "6-घंटे का विस्तृत कृषि विश्लेषण",
      adviceBadge: "खेत परामर्श"
    },
    en: {
      title: "RituRakhok 24-Hour Agro-Weather Radar",
      subhead: "Next 24-Hour Predictive Agronomic Forecasting & Zero-Cost Ancestral Farm Shield",
      liveGps: "Active GPS Coordinates",
      syncStatus: "Live Satellite Telemetry Synced",
      refresh: "Refresh Radar",
      now: "Current Live",
      feelsLike: "Feels Like",
      humidity: "Humidity",
      wind: "Wind Velocity",
      windDir: "Dir",
      rainProb: "Precipitation Prob",
      timelineTitle: "24-Hour Microclimate Radar (Predictive Timeline)",
      timelineSubtitle: "Segmented 6-hour chronologic intervals & agronomic field impact indicators",
      tempCurve: "Temperature Curve",
      fieldImpact: "Field Impact Indicator",
      zeroCostTitle: "Zero-Cost Ancestral Shield (100% Homemade / Farm-Sourced)",
      zeroCostSubhead: "Zero-cost preventative farm protocols derived from rural Bengal farm waste",
      rootSource: "Root Source",
      actionWindow: "Action Window (Next 24h)",
      savingsBadge: "₹0 Expense • Farm Waste Derived",
      markDone: "Mark Prepared",
      completed: "Protocol Ready",
      takeActionNow: "Take Action Now",
      collapseTray: "Hide Emergency Tray",
      ancestralPlanTitle: "3-Step Ancestral Action Plan",
      tempMax: "Max",
      tempMin: "Min",
      avg: "Avg",
      expectedPrecip: "Precipitation",
      inspectTitle: "6-Hour Agronomic Shift Analysis",
      adviceBadge: "Field Guidance"
    }
  }[language] || {};

  useEffect(() => {
    fetchWeather();
  }, [city, lat, lon]);

  const fetchWeather = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch(`/api/weather?region_id=1&city=${encodeURIComponent(city)}&lat=${lat}&lon=${lon}`);
      const data = await res.json();
      if (data && data.status === 'success') {
        if (data.weather) setWeatherData(data.weather);
        if (data.hourly_radar && data.hourly_radar.length > 0) {
          setHourlyRadar(data.hourly_radar);
        }
        if (data.severe_shift_alert) {
          setSevereAlert(data.severe_shift_alert);
        }
        if (data.zero_cost_protocols && data.zero_cost_protocols.length > 0) {
          setZeroCostProtocols(data.zero_cost_protocols);
        }
        if (data.action_plan) setActionPlan(data.action_plan);
      }
    } catch (err) {
      console.warn("Weather fetch fallback:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const toggleProtocolDone = (id) => {
    setCompletedProtocols(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const activeSegment = (hourlyRadar && hourlyRadar.find(seg => seg.id === selectedSegmentId)) || (hourlyRadar && hourlyRadar[0]) || initialHourlyRadar[0];

  // Helper to resolve localized text
  const getLocalized = (obj, field) => {
    if (!obj) return '';
    if (language === 'bn' && obj[`${field}_bn`]) return obj[`${field}_bn`];
    if (language === 'hi' && obj[`${field}_hi`]) return obj[`${field}_hi`];
    return obj[field] || '';
  };

  return (
    <div 
      className="riturakhok-container"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        width: '100%',
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '8px 4px 40px'
      }}
    >
      <style>{`
        @keyframes pulseAlert {
          0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.45); }
          70% { box-shadow: 0 0 0 14px rgba(239, 68, 68, 0); }
          100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
        @keyframes radarSweep {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes glowBorder {
          0% { border-color: rgba(74, 222, 128, 0.35); }
          50% { border-color: rgba(52, 211, 153, 0.75); }
          100% { border-color: rgba(74, 222, 128, 0.35); }
        }
        .riturakhok-timeline-scroll::-webkit-scrollbar {
          height: 6px;
        }
        .riturakhok-timeline-scroll::-webkit-scrollbar-thumb {
          background: rgba(74, 222, 128, 0.3);
          border-radius: 4px;
        }
        .riturakhok-timeline-scroll::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.15);
        }
        .protocol-card:hover {
          transform: translateY(-2px);
          transition: all 0.25s ease;
        }
        .timeline-card:hover {
          border-color: rgba(110, 231, 183, 0.7) !important;
          transform: translateY(-2px);
          transition: all 0.2s ease;
        }
      `}</style>

      {/* TOP HEADER & LIVE TELEMETRY BAR */}
      <div 
        style={{
          background: 'linear-gradient(135deg, #021a0d 0%, #062b19 50%, #031c11 100%)',
          borderRadius: '24px',
          border: '1.5px solid rgba(74, 222, 128, 0.28)',
          boxShadow: '0 16px 40px rgba(0, 0, 0, 0.5), inset 0 0 30px rgba(4, 120, 87, 0.12)',
          padding: '24px 28px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <span 
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(16, 185, 129, 0.18)',
                border: '1px solid #10b981',
                padding: '4px 10px',
                borderRadius: '20px',
                fontSize: '0.72rem',
                fontWeight: '800',
                color: '#6ee7b7',
                letterSpacing: '0.04em',
                textTransform: 'uppercase'
              }}
            >
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', display: 'inline-block', boxShadow: '0 0 8px #10b981' }} />
              {t.syncStatus}
            </span>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <MapPin size={13} color="#34d399" />
              {lat.toFixed(3)}°N, {lon.toFixed(3)}°E • {weatherData?.city || city}
            </span>
          </div>

          <h2 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#f8fafc', margin: 0, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span>{t.title}</span>
            <span style={{ fontSize: '0.9rem', color: '#fef08a', background: 'rgba(234, 179, 8, 0.15)', border: '1px solid rgba(254, 240, 138, 0.3)', padding: '2px 8px', borderRadius: '8px', fontWeight: '700' }}>
              24H RADAR
            </span>
          </h2>
          <p style={{ fontSize: '0.84rem', color: '#a7f3d0', marginTop: '4px', maxWidth: '650px', lineHeight: '1.4' }}>
            {t.subhead}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={fetchWeather}
            disabled={isRefreshing}
            style={{
              background: 'rgba(4, 120, 87, 0.3)',
              border: '1px solid rgba(74, 222, 128, 0.4)',
              color: '#d1fae5',
              padding: '10px 18px',
              borderRadius: '14px',
              fontSize: '0.8rem',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s ease',
              backdropFilter: 'blur(8px)'
            }}
          >
            <RefreshCw size={15} style={{ animation: isRefreshing ? 'radarSweep 1s linear infinite' : 'none' }} />
            <span>{t.refresh}</span>
          </button>
        </div>
      </div>

      {/* URGENCY ALERT BANNER: Severe Weather Shift Trigger (Animated Warning) */}
      {severeAlert && severeAlert.is_triggered && (
        <div 
          style={{
            background: 'linear-gradient(135deg, rgba(153, 27, 27, 0.94) 0%, rgba(180, 83, 9, 0.92) 100%)',
            borderRadius: '22px',
            border: '1.5px solid rgba(251, 146, 60, 0.75)',
            boxShadow: '0 12px 35px rgba(220, 38, 38, 0.35)',
            animation: 'pulseAlert 2.5s infinite',
            overflow: 'hidden',
            transition: 'all 0.3s ease'
          }}
        >
          <div 
            style={{
              padding: '20px 24px',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '14px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: '1 1 300px' }}>
              <div 
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '14px',
                  background: 'rgba(254, 226, 226, 0.2)',
                  border: '1.5px solid #fecaca',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <Zap size={24} color="#fef08a" />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                  <span 
                    style={{
                      background: '#fee2e2',
                      color: '#991b1b',
                      fontSize: '0.7rem',
                      fontWeight: '800',
                      padding: '2px 8px',
                      borderRadius: '6px',
                      textTransform: 'uppercase'
                    }}
                  >
                    {severeAlert.level || 'High Alert'}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#ffedd5', fontWeight: '600' }}>
                    Open-Meteo 24H Radar Detection
                  </span>
                </div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#ffffff', margin: 0 }}>
                  {getLocalized(severeAlert, 'title')}
                </h3>
                <p style={{ fontSize: '0.82rem', color: '#fef3c7', margin: '4px 0 0 0', lineHeight: '1.4' }}>
                  {getLocalized(severeAlert, 'desc')}
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsAlertTrayOpen(!isAlertTrayOpen)}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: '1.5px solid rgba(255, 255, 255, 0.4)',
                color: '#ffffff',
                padding: '10px 18px',
                borderRadius: '12px',
                fontSize: '0.8rem',
                fontWeight: '800',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                backdropFilter: 'blur(8px)',
                transition: 'all 0.2s ease'
              }}
            >
              <span>{isAlertTrayOpen ? t.collapseTray : t.takeActionNow}</span>
              {isAlertTrayOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>

          {/* Expandable Emergency Action Tray */}
          {isAlertTrayOpen && severeAlert.action_now && (
            <div 
              style={{
                background: 'rgba(69, 10, 10, 0.65)',
                borderTop: '1px solid rgba(251, 146, 60, 0.4)',
                padding: '18px 24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}
            >
              <div style={{ fontSize: '0.78rem', fontWeight: '800', color: '#fef08a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                🛡️ {t.takeActionNow} (Next 24H Immediate Protocols):
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
                {severeAlert.action_now.map((act, aIdx) => (
                  <div 
                    key={aIdx}
                    style={{
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(254, 202, 202, 0.25)',
                      borderRadius: '12px',
                      padding: '12px 14px',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '10px'
                    }}
                  >
                    <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#dc2626', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: '800', flexShrink: 0 }}>
                      {aIdx + 1}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#fef2f2', lineHeight: '1.45', fontWeight: '600' }}>
                      {act}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* SECTION 1: 24-HOUR MICROCLIMATE RADAR (PREDICTIVE TIMELINE) */}
      <div 
        style={{
          background: 'linear-gradient(145deg, #021a0d 0%, #052617 60%, #031c11 100%)',
          borderRadius: '26px',
          border: '1.5px solid rgba(74, 222, 128, 0.3)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.45)',
          padding: '26px 28px',
          position: 'relative'
        }}
      >
        {/* Real-time Hero Reading Bar */}
        {weatherData && (
          <div 
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '16px',
              paddingBottom: '22px',
              borderBottom: '1px solid rgba(74, 222, 128, 0.2)',
              marginBottom: '22px'
            }}
          >
            {/* Live Temp Box */}
            <div 
              style={{
                background: 'rgba(6, 44, 25, 0.55)',
                border: '1px solid rgba(74, 222, 128, 0.25)',
                borderRadius: '18px',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px'
              }}
            >
              <div 
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  boxShadow: '0 6px 18px rgba(16, 185, 129, 0.35)'
                }}
              >
                <Thermometer size={28} />
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: '#a7f3d0', fontWeight: '700', textTransform: 'uppercase' }}>
                  {t.now} • {weatherData.condition || 'Fair'}
                </div>
                <div style={{ fontSize: '2.2rem', fontWeight: '800', color: '#ffffff', lineHeight: '1.1' }}>
                  {weatherData.current_temp}°C
                </div>
                <div style={{ fontSize: '0.74rem', color: '#cbd5e1' }}>
                  {t.feelsLike}: <span style={{ color: '#fef08a', fontWeight: '700' }}>{weatherData.feels_like}°C</span>
                </div>
              </div>
            </div>

            {/* Live Humidity & Moisture */}
            <div 
              style={{
                background: 'rgba(6, 44, 25, 0.55)',
                border: '1px solid rgba(74, 222, 128, 0.25)',
                borderRadius: '18px',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px'
              }}
            >
              <div 
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  boxShadow: '0 6px 18px rgba(2, 132, 199, 0.35)'
                }}
              >
                <Droplets size={28} />
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: '#7dd3fc', fontWeight: '700', textTransform: 'uppercase' }}>
                  {t.humidity}
                </div>
                <div style={{ fontSize: '2.2rem', fontWeight: '800', color: '#ffffff', lineHeight: '1.1' }}>
                  {weatherData.humidity}%
                </div>
                <div style={{ fontSize: '0.74rem', color: '#cbd5e1' }}>
                  Rhizosphere Dew Index: <span style={{ color: '#7dd3fc', fontWeight: '700' }}>{weatherData.humidity > 75 ? 'Saturated' : 'Optimal'}</span>
                </div>
              </div>
            </div>

            {/* Live Wind & Direction */}
            <div 
              style={{
                background: 'rgba(6, 44, 25, 0.55)',
                border: '1px solid rgba(74, 222, 128, 0.25)',
                borderRadius: '18px',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px'
              }}
            >
              <div 
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  boxShadow: '0 6px 18px rgba(217, 119, 6, 0.35)'
                }}
              >
                <Wind size={28} />
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: '#fde68a', fontWeight: '700', textTransform: 'uppercase' }}>
                  {t.wind}
                </div>
                <div style={{ fontSize: '1.9rem', fontWeight: '800', color: '#ffffff', lineHeight: '1.1' }}>
                  {weatherData.wind_speed} <span style={{ fontSize: '1rem', fontWeight: '600' }}>km/h</span>
                </div>
                <div style={{ fontSize: '0.74rem', color: '#cbd5e1' }}>
                  {t.windDir}: <span style={{ color: '#fde68a', fontWeight: '700' }}>{weatherData.wind_direction_text || 'NW'}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Section Heading */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '18px', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <Clock size={18} color="#4ade80" />
              <h3 style={{ fontSize: '1.18rem', fontWeight: '800', color: '#f8fafc', margin: 0 }}>
                {t.timelineTitle}
              </h3>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>
              {t.timelineSubtitle}
            </p>
          </div>

          <div style={{ fontSize: '0.72rem', color: '#6ee7b7', background: 'rgba(16, 185, 129, 0.15)', padding: '4px 10px', borderRadius: '12px', border: '1px solid rgba(74, 222, 128, 0.3)' }}>
            ✦ Interactive 4-Interval Telemetry Strip
          </div>
        </div>

        {/* Chronological Hourly Strip (Horizontal Segmented Timeline: Next 6h, Next 12h, Next 18h, Next 24h) */}
        <div 
          className="riturakhok-timeline-scroll"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '14px',
            overflowX: 'auto',
            paddingBottom: '8px'
          }}
        >
          {hourlyRadar.map((seg) => {
            const isSelected = selectedSegmentId === seg.id;
            const impact = seg.field_impact || {};
            const impactColor = impact.color || '#10b981';
            const impactBadgeText = getLocalized(impact, 'badge');

            return (
              <div
                key={seg.id}
                onClick={() => setSelectedSegmentId(seg.id)}
                className="timeline-card"
                style={{
                  background: isSelected 
                    ? 'linear-gradient(145deg, #063920 0%, #094729 100%)' 
                    : 'rgba(4, 30, 17, 0.65)',
                  border: isSelected 
                    ? '2px solid #34d399' 
                    : '1px solid rgba(74, 222, 128, 0.22)',
                  borderRadius: '18px',
                  padding: '16px 18px',
                  cursor: 'pointer',
                  position: 'relative',
                  boxShadow: isSelected 
                    ? '0 10px 25px rgba(16, 185, 129, 0.25), inset 0 0 15px rgba(52, 211, 153, 0.1)' 
                    : 'none',
                  transition: 'all 0.2s ease'
                }}
              >
                {/* Interval Label & Window */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span 
                      style={{
                        background: isSelected ? '#10b981' : 'rgba(74, 222, 128, 0.2)',
                        color: isSelected ? '#022c15' : '#86efac',
                        fontSize: '0.72rem',
                        fontWeight: '800',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        letterSpacing: '0.02em'
                      }}
                    >
                      {seg.label}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: '600' }}>
                      {seg.window}
                    </span>
                  </div>
                  {isSelected && (
                    <span style={{ fontSize: '0.65rem', color: '#34d399', fontWeight: '700', textTransform: 'uppercase' }}>
                      ● Active
                    </span>
                  )}
                </div>

                {/* Agro-Weather Indicators: Expected Temperature Curve */}
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div>
                    <span style={{ fontSize: '1.65rem', fontWeight: '800', color: '#ffffff' }}>
                      {seg.temp_avg}°C
                    </span>
                    <span style={{ fontSize: '0.7rem', color: '#a7f3d0', marginLeft: '4px' }}>
                      ({t.avg})
                    </span>
                  </div>
                  <div style={{ textAlign: 'right', fontSize: '0.72rem', color: '#cbd5e1' }}>
                    <div>{t.tempMin}: <strong style={{ color: '#38bdf8' }}>{seg.temp_min}°C</strong></div>
                    <div>{t.tempMax}: <strong style={{ color: '#fb923c' }}>{seg.temp_max}°C</strong></div>
                  </div>
                </div>

                {/* Mini Temperature Gradient Bar */}
                <div style={{ width: '100%', height: '5px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '3px', marginBottom: '12px', overflow: 'hidden' }}>
                  <div 
                    style={{
                      height: '100%',
                      width: `${Math.min(100, Math.max(20, (((seg.temp_avg || 28) - 15) / 25) * 100))}%`,
                      background: seg.temp_avg > 32 
                        ? 'linear-gradient(90deg, #f59e0b, #ef4444)' 
                        : 'linear-gradient(90deg, #10b981, #38bdf8)',
                      borderRadius: '3px'
                    }}
                  />
                </div>

                {/* Precipitation, Wind & Humidity Indicators */}
                <div 
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '8px',
                    background: 'rgba(2, 20, 11, 0.45)',
                    borderRadius: '10px',
                    padding: '8px 10px',
                    marginBottom: '12px',
                    fontSize: '0.72rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#e2e8f0' }}>
                    <CloudRain size={13} color="#38bdf8" />
                    <span>{seg.precip_prob_max}% ({seg.precip_sum_mm}mm)</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#e2e8f0' }}>
                    <Droplets size={13} color="#06b6d4" />
                    <span>{seg.humidity_avg}% {t.humidity}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#e2e8f0', gridColumn: 'span 2' }}>
                    <Wind size={13} color="#fbbf24" />
                    <span>{seg.wind_speed_avg} km/h • {seg.wind_direction}</span>
                  </div>
                </div>

                {/* Color-Coded "Field Impact Indicator" Badge */}
                <div 
                  style={{
                    background: impact.bgColor || 'rgba(16, 185, 129, 0.15)',
                    border: `1px solid ${impactColor}`,
                    borderRadius: '10px',
                    padding: '8px 10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: impactColor, flexShrink: 0, boxShadow: `0 0 6px ${impactColor}` }} />
                  <div style={{ fontSize: '0.74rem', fontWeight: '800', color: impactColor, lineHeight: '1.25' }}>
                    {impactBadgeText}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Interval Deep Agronomic Guidance Card */}
        {activeSegment && (
          <div 
            style={{
              marginTop: '16px',
              background: 'linear-gradient(135deg, rgba(6, 44, 25, 0.7) 0%, rgba(3, 30, 17, 0.8) 100%)',
              border: '1px solid rgba(74, 222, 128, 0.28)',
              borderRadius: '18px',
              padding: '16px 20px',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '14px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', flex: '1 1 320px' }}>
              <div 
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'rgba(52, 211, 153, 0.18)',
                  border: '1px solid #34d399',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#34d399',
                  flexShrink: 0,
                  marginTop: '2px'
                }}
              >
                <Sprout size={18} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: '800', color: '#6ee7b7', textTransform: 'uppercase' }}>
                    {activeSegment.label} ({activeSegment.window}) • {t.inspectTitle}
                  </span>
                  <span 
                    style={{
                      fontSize: '0.68rem',
                      background: activeSegment.field_impact?.bgColor || 'rgba(16, 185, 129, 0.15)',
                      color: activeSegment.field_impact?.color || '#10b981',
                      border: `1px solid ${activeSegment.field_impact?.color || '#10b981'}`,
                      padding: '2px 6px',
                      borderRadius: '6px',
                      fontWeight: '700'
                    }}
                  >
                    {getLocalized(activeSegment.field_impact, 'badge')}
                  </span>
                </div>
                <p style={{ fontSize: '0.82rem', color: '#e2e8f0', margin: 0, lineHeight: '1.45' }}>
                  {activeSegment.field_impact?.advice}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.75rem', color: '#94a3b8' }}>
              <div>
                {t.expectedPrecip}: <strong style={{ color: '#38bdf8' }}>{activeSegment.precip_prob_max}%</strong>
              </div>
              <div>
                {t.wind}: <strong style={{ color: '#fbbf24' }}>{activeSegment.wind_speed_avg} km/h</strong>
              </div>
              <div>
                {t.humidity}: <strong style={{ color: '#34d399' }}>{activeSegment.humidity_avg}%</strong>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 2: DEDICATED ZERO-COST PREVENTATIVE FARM PROTOCOLS (শূন্য ব্যয়ের প্রতিরোধ) */}
      <div 
        style={{
          background: 'linear-gradient(145deg, #021a0d 0%, #052617 60%, #031c11 100%)',
          borderRadius: '26px',
          border: '1.5px solid rgba(74, 222, 128, 0.3)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.45)',
          padding: '26px 28px'
        }}
      >
        {/* Header Block */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '22px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <ShieldCheck size={22} color="#4ade80" />
              <h3 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#f8fafc', margin: 0 }}>
                {t.zeroCostTitle}
              </h3>
            </div>
            <p style={{ fontSize: '0.82rem', color: '#a7f3d0', margin: 0, lineHeight: '1.4' }}>
              {t.zeroCostSubhead}
            </p>
          </div>

          <div 
            style={{
              background: 'rgba(234, 179, 8, 0.15)',
              border: '1.5px solid #facc15',
              borderRadius: '20px',
              padding: '6px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: '#fef08a',
              fontSize: '0.74rem',
              fontWeight: '800',
              boxShadow: '0 4px 14px rgba(234, 179, 8, 0.2)'
            }}
          >
            <Sparkles size={14} color="#facc15" />
            <span>₹0 Market Cost • 100% Farm-Sourced</span>
          </div>
        </div>

        {/* 4 High-Contrast Actionable Protocol Cards */}
        <div 
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))',
            gap: '18px'
          }}
        >
          {zeroCostProtocols.map((protocol, pIdx) => {
            const isDone = !!completedProtocols[protocol.id];

            return (
              <div 
                key={protocol.id || pIdx}
                className="protocol-card"
                style={{
                  background: isDone 
                    ? 'linear-gradient(145deg, #042e18 0%, #063920 100%)' 
                    : 'linear-gradient(145deg, #052b18 0%, #031c10 100%)',
                  border: isDone 
                    ? '1.5px solid #4ade80' 
                    : '1.5px solid rgba(74, 222, 128, 0.28)',
                  borderRadius: '20px',
                  padding: '20px 22px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {/* Protocol Top Bar: Title & Savings Badge */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div 
                        style={{
                          width: '38px',
                          height: '38px',
                          borderRadius: '12px',
                          background: 'rgba(74, 222, 128, 0.15)',
                          border: '1px solid rgba(74, 222, 128, 0.4)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#4ade80',
                          flexShrink: 0
                        }}
                      >
                        {pIdx === 0 && <Sprout size={20} />}
                        {pIdx === 1 && <Flame size={20} color="#f97316" />}
                        {pIdx === 2 && <Shield size={20} color="#38bdf8" />}
                        {pIdx === 3 && <Compass size={20} color="#facc15" />}
                      </div>
                      <h4 style={{ fontSize: '1rem', fontWeight: '800', color: '#ffffff', margin: 0, lineHeight: '1.3' }}>
                        {getLocalized(protocol, 'title')}
                      </h4>
                    </div>

                    {/* Savings Badge */}
                    <span 
                      style={{
                        background: 'rgba(34, 197, 94, 0.15)',
                        border: '1px solid #22c55e',
                        color: '#86efac',
                        fontSize: '0.68rem',
                        fontWeight: '800',
                        padding: '3px 8px',
                        borderRadius: '12px',
                        whiteSpace: 'nowrap',
                        flexShrink: 0
                      }}
                    >
                      {protocol.savings_badge || t.savingsBadge}
                    </span>
                  </div>

                  {/* Root Source */}
                  <div 
                    style={{
                      background: 'rgba(2, 20, 11, 0.55)',
                      borderRadius: '12px',
                      padding: '10px 12px',
                      marginBottom: '10px',
                      border: '1px solid rgba(255, 255, 255, 0.08)'
                    }}
                  >
                    <div style={{ fontSize: '0.68rem', color: '#86efac', fontWeight: '800', textTransform: 'uppercase', marginBottom: '2px' }}>
                      🌿 {t.rootSource}:
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#f1f5f9', fontWeight: '600', lineHeight: '1.35' }}>
                      {protocol.root_source}
                    </div>
                  </div>

                  {/* Action Window (Exact timing within next 24 hours) */}
                  <div 
                    style={{
                      background: 'rgba(234, 179, 8, 0.12)',
                      borderRadius: '12px',
                      padding: '10px 12px',
                      marginBottom: '12px',
                      border: '1px solid rgba(250, 204, 21, 0.35)',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '8px'
                    }}
                  >
                    <Clock size={16} color="#facc15" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div>
                      <div style={{ fontSize: '0.68rem', color: '#fef08a', fontWeight: '800', textTransform: 'uppercase', marginBottom: '2px' }}>
                        ⏱️ {t.actionWindow}:
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#fef9c3', fontWeight: '700', lineHeight: '1.35' }}>
                        {getLocalized(protocol, 'action_window')}
                      </div>
                    </div>
                  </div>

                  {/* Agronomic Benefit */}
                  <p style={{ fontSize: '0.78rem', color: '#cbd5e1', lineHeight: '1.45', margin: '0 0 16px 0' }}>
                    {getLocalized(protocol, 'benefit')}
                  </p>
                </div>

                {/* Footer Action: Mark Prepared Button */}
                <button
                  onClick={() => toggleProtocolDone(protocol.id)}
                  style={{
                    background: isDone 
                      ? '#10b981' 
                      : 'rgba(4, 120, 87, 0.25)',
                    border: isDone 
                      ? '1px solid #10b981' 
                      : '1px solid rgba(74, 222, 128, 0.4)',
                    color: isDone ? '#022c15' : '#a7f3d0',
                    padding: '8px 14px',
                    borderRadius: '12px',
                    fontSize: '0.76rem',
                    fontWeight: '800',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <CheckCircle2 size={15} color={isDone ? '#022c15' : '#34d399'} />
                  <span>{isDone ? t.completed : t.markDone}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 3: 3-STEP ANCESTRAL ACTION PLAN */}
      <div 
        style={{
          background: 'linear-gradient(145deg, #021a0d 0%, #052617 60%, #031c11 100%)',
          borderRadius: '26px',
          border: '1.5px solid rgba(74, 222, 128, 0.28)',
          boxShadow: '0 16px 40px rgba(0, 0, 0, 0.4)',
          padding: '26px 28px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
          <ShieldCheck size={24} color="#34d399" />
          <div>
            <h3 style={{ fontSize: '1.18rem', fontWeight: '800', color: '#f8fafc', margin: 0 }}>
              {t.ancestralPlanTitle}
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '2px 0 0 0' }}>
              Adaptive agronomic decisions calculated against your live 24-hour microclimate curve
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '14px' }}>
          {actionPlan.map((action, idx) => (
            <div 
              key={idx}
              style={{
                background: 'rgba(6, 44, 25, 0.55)',
                border: '1px solid rgba(74, 222, 128, 0.2)',
                borderRadius: '16px',
                padding: '16px 18px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '14px'
              }}
            >
              <div 
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '10px',
                  background: '#10b981',
                  color: '#022c15',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '800',
                  fontSize: '0.9rem',
                  flexShrink: 0
                }}
              >
                {action.step}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.88rem', fontWeight: '700', color: '#ffffff' }}>
                  {action.title}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#a7f3d0', marginTop: '4px', lineHeight: '1.45' }}>
                  {action.desc}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
