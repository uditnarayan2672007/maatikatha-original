import React, { useState } from 'react';
import { Sprout, Droplets, Shield, Award, CheckCircle, Search, Filter } from 'lucide-react';

export default function AncestralSeeds({ language }) {
  const [activeFilter, setActiveFilter] = useState('all');

  const seeds = [
    {
      id: 1,
      name: 'Gobindobhog Rice (গোবিন্দভোগ দেশী ধান)',
      category: 'flood',
      categoryLabel: 'বন্যা ও অতিরিক্ত বৃষ্টি সহনশীল',
      resilienceRating: '9.4/10',
      waterSavingPct: '30%',
      traits: ['১০ দিন পর্যন্ত জলমগ্ন অবস্থায় পচে না', 'প্রাকৃতিক সুবাসে পোকার উপদ্রব কম', 'রাসায়নিক সারহীন জমিতে সর্বাধিক মিষ্টি স্বাদ'],
      idealSoil: 'পলি ও এঁটেল মাটি (Alluvial Clay)',
      sowingMonth: 'আষাঢ় - শ্রাবণ (June - July)'
    },
    {
      id: 2,
      name: 'Desi Boro Paddy (খরা সহনশীল দেশী বোরো ধান)',
      category: 'drought',
      categoryLabel: 'অনাবৃষ্টি ও তাপপ্রবাহ প্রতিরোধী',
      resilienceRating: '9.1/10',
      waterSavingPct: '42%',
      traits: ['গভীর মূল বিস্তার করে নিচের আর্দ্রতা টানে', '৩৮°C তাপমাত্রাতেও শীষ নষ্ট হয় না', 'ইউরিয়া সারের প্রয়োজন হয় না বললেই চলে'],
      idealSoil: 'বেলে-দোআঁশ মাটি (Sandy Loam)',
      sowingMonth: 'পৌষ - মাঘ (Dec - Jan)'
    },
    {
      id: 3,
      name: 'Kasundi Indigenous Mustard (সরিষা দেশী জাত)',
      category: 'pest',
      categoryLabel: 'প্রাকৃতিক কীট প্রতিরোধী',
      resilienceRating: '8.9/10',
      waterSavingPct: '35%',
      traits: ['পাতায় উচ্চমাত্রার গ্লুকোসিনোলেট জাব পোকা দূরে রাখে', 'কম উর্বর মাটিতেও গভীর শিকড় তৈরি করে', 'মৌমাছি আকর্ষণ করে পরাগায়ন বাড়ায়'],
      idealSoil: 'দোআঁশ মাটি',
      sowingMonth: 'কার্তিক (Oct - Nov)'
    },
    {
      id: 4,
      name: 'Radhuni Heritage Spice (রাধুনী দেশীয় বীজ)',
      category: 'disease',
      categoryLabel: 'ছত্রাক ও শিকড় পচা প্রতিরোধী',
      resilienceRating: '9.3/10',
      waterSavingPct: '25%',
      traits: ['শিকড়ের নিঃসৃত অ্যান্টিফাঙ্গাল তেল অন্যান্য গাছকেও রক্ষা করে', 'অত্যন্ত কম জলে দ্রুত বৃদ্ধি', 'মিশ্র চাষে পোকা তাড়াতে আদর্শ'],
      idealSoil: 'উর্বর পলি দোআঁশ',
      sowingMonth: 'অগ্রহায়ণ (Nov - Dec)'
    }
  ];

  const t = {
    bn: {
      badge: "বিলুপ্তপ্রায় ঐতিহ্যবাহী বীজ",
      title: "পূর্বপুরুষের বীজ ও জলবায়ু সহনশীলতা নির্দেশিকা",
      subtitle: "যেসব দেশীয় বীজ আধুনিক জলবায়ু বিপর্যয়, বন্যা ও খরা প্রতিরোধে শত শত বছর ধরে পরীক্ষিত",
      all: "সব দেশীয় বীজ",
      flood: "🌊 বন্যা সহনশীল",
      drought: "☀️ খরা সহনশীল",
      pest: "🛡️ পোকা প্রতিরোধী",
      disease: "🌿 ছত্রাক প্রতিরোধী",
      waterSaved: "জল সাশ্রয়:",
      resilience: "সহনশীলতা স্কোর:",
      traitsLabel: "মূল জলবায়ু প্রতিরোধী বৈশিষ্ট্যসমূহ:"
    },
    hi: {
      badge: "पारम्परिक धरोहर बीज",
      title: "पारम्परिक बीज व जलवायु अनुकूलता संकलन",
      subtitle: "मौसम के बदलाव, बाढ़ व सूखे से लड़ने वाले देशी बीजों की प्रामाणिक सूची",
      all: "सभी पारम्परिक बीज",
      flood: "🌊 बाढ़ सहिष्णु",
      drought: "☀️ सूखा सहिष्णु",
      pest: "🛡️ कीट प्रतिरोधी",
      disease: "🌿 फंगस प्रतिरोधी",
      waterSaved: "पानी बचत:",
      resilience: "अनुकूलता स्कोर:",
      traitsLabel: "जलवायु सुरक्षा गुण:"
    },
    en: {
      badge: "Heritage Seed Genebank",
      title: "Ancestral Seeds & Climate Resilience Recommender",
      subtitle: "Centuries-tested indigenous seeds adapted to unseasonal heat, floods, and zero-chemical soil",
      all: "All Heritage Seeds",
      flood: "🌊 Flood Resistant",
      drought: "☀️ Drought Tolerant",
      pest: "🛡️ Pest Resistant",
      disease: "🌿 Antifungal Shield",
      waterSaved: "Water Saved:",
      resilience: "Resilience Score:",
      traitsLabel: "Climate Resilience Superpowers:"
    }
  }[language] || {};

  const filteredSeeds = activeFilter === 'all' 
    ? seeds 
    : seeds.filter(s => s.category === activeFilter);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Title Header */}
      <div className="mk-card mk-card-emerald" style={{ padding: '28px 24px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#15803d', color: 'white', padding: '4px 12px', borderRadius: '12px', fontSize: '0.78rem', fontWeight: '800', marginBottom: '10px' }}>
          <Sprout size={15} />
          <span>{t.badge}</span>
        </div>
        <h2 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#0f5132', marginBottom: '6px' }}>{t.title}</h2>
        <p style={{ fontSize: '0.92rem', color: '#166534', maxWidth: '640px' }}>{t.subtitle}</p>

        {/* Filter Pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '18px' }}>
          {['all', 'flood', 'drought', 'pest', 'disease'].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              style={{
                background: activeFilter === cat ? '#15803d' : '#ffffff',
                color: activeFilter === cat ? '#ffffff' : '#166534',
                border: activeFilter === cat ? '1px solid #15803d' : '1px solid #bbf7d0',
                padding: '8px 16px',
                borderRadius: '20px',
                fontSize: '0.85rem',
                fontWeight: '700',
                cursor: 'pointer',
                fontFamily: 'inherit',
                transition: 'all 0.15s ease'
              }}
            >
              {t[cat]}
            </button>
          ))}
        </div>
      </div>

      {/* Seed Cards Grid */}
      <div className="responsive-two-col">
        {filteredSeeds.map((seed) => (
          <div key={seed.id} className="mk-card" style={{ borderTop: '5px solid #10b981', padding: '22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#059669', background: '#ecfdf5', padding: '4px 8px', borderRadius: '8px' }}>
                  {seed.categoryLabel}
                </span>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#1e293b', marginTop: '6px' }}>
                  🌾 {seed.name}
                </h3>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '700' }}>{t.resilience}</div>
                <div style={{ fontSize: '1.3rem', fontWeight: '800', color: '#15803d' }}>{seed.resilienceRating}</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', background: '#f8fafc', padding: '10px 14px', borderRadius: '12px', margin: '12px 0', fontSize: '0.82rem' }}>
              <div>
                <span style={{ color: '#64748b' }}>💧 {t.waterSaved} </span>
                <b style={{ color: '#0369a1' }}>{seed.waterSavingPct}</b>
              </div>
              <div style={{ borderLeft: '1px solid #cbd5e1', paddingLeft: '12px' }}>
                <span style={{ color: '#64748b' }}>বপনের সময়: </span>
                <b style={{ color: '#334155' }}>{seed.sowingMonth}</b>
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: '800', color: '#334155', marginBottom: '6px' }}>
                {t.traitsLabel}
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {seed.traits.map((tr, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.85rem', color: '#475569' }}>
                    <CheckCircle size={15} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span>{tr}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
