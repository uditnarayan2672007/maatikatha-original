const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const dns = require('dns');
const bcrypt = require('bcryptjs');


// -- DNS Fix for MongoDB Atlas SRV on Windows -----------------
// Force Google/Cloudflare DNS for SRV lookups.
// Windows default DNS often cannot resolve _mongodb._tcp.* records.
const DNS_SERVERS = ['8.8.8.8', '1.1.1.1', '8.8.4.4'];
try {
  dns.setServers(DNS_SERVERS);
  console.log('[DNS] Using custom DNS servers:', DNS_SERVERS.join(', '));
} catch (e) {
  console.warn('[DNS] Could not override DNS servers:', e.message);
}

/**
 * Pre-resolve MongoDB Atlas SRV record using Node's dns module
 * (which respects setServers), then build a direct connection
 * string that bypasses the driver's own SRV resolution.
 *
 * Falls back to the original +srv URI if resolution succeeds
 * through the driver anyway.
 */
async function resolveSrvToDirectUri(srvUri) {
  // Only applies to mongodb+srv:// URIs
  if (!srvUri.startsWith('mongodb+srv://')) return srvUri;

  try {
    // Extract host from: mongodb+srv://user:pass@cluster.xxx.mongodb.net/db?params
    const urlBody = srvUri.slice('mongodb+srv://'.length);
    const atIdx = urlBody.indexOf('@');
    const credentials = urlBody.slice(0, atIdx);          // user:pass
    const hostAndRest = urlBody.slice(atIdx + 1);         // cluster.xxx.mongodb.net/db?params
    const slashIdx = hostAndRest.indexOf('/');
    const srvHost = slashIdx > 0 ? hostAndRest.slice(0, slashIdx) : hostAndRest;
    const dbAndParams = slashIdx > 0 ? hostAndRest.slice(slashIdx) : '';

    // SRV lookup using our custom DNS servers
    const srvRecords = await new Promise((resolve, reject) => {
      dns.resolveSrv(`_mongodb._tcp.${srvHost}`, (err, records) => {
        if (err) reject(err); else resolve(records);
      });
    });

    // Also fetch TXT records for connection options (authSource, etc.)
    let txtParams = '';
    try {
      const txtRecords = await new Promise((resolve, reject) => {
        dns.resolveTxt(srvHost, (err, records) => {
          if (err) reject(err); else resolve(records);
        });
      });
      if (txtRecords.length > 0) {
        txtParams = txtRecords[0].join('');
      }
    } catch (_) { /* TXT records are optional */ }

    if (!srvRecords || srvRecords.length === 0) {
      console.warn('[DNS] No SRV records found, falling back to original URI');
      return srvUri;
    }

    // Build direct mongodb:// URI with all resolved hosts
    const hostList = srvRecords.map(r => `${r.name}:${r.port}`).join(',');
    const separator = dbAndParams.includes('?') ? '&' : '?';
    const sslParam = 'tls=true';
    const txtParam = txtParams ? `&${txtParams}` : '';

    const directUri = `mongodb://${credentials}@${hostList}${dbAndParams}${separator}${sslParam}${txtParam}`;
    console.log(`[DNS] Resolved ${srvRecords.length} SRV hosts for Atlas cluster`);
    return directUri;
  } catch (err) {
    console.warn(`[DNS] SRV pre-resolution failed (${err.message}), using original URI`);
    return srvUri;
  }
}

const mockDataPath = path.join(__dirname, 'data', 'mockData.json');
let rawMockData = { regions: [], historical_climate: [], remedies_catalog: [], community_alerts: [] };
try {
  rawMockData = JSON.parse(fs.readFileSync(mockDataPath, 'utf8'));
} catch (err) {
  console.error('[DB] Warning: Could not read mockData.json:', err.message);
}

// ==========================================
// 1. MONGOOSE SCHEMAS
// ==========================================
const RegionSchema = new mongoose.Schema({
  region_id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  state: { type: String, required: true },
  language_code: { type: String, default: 'bn' }
}, { timestamps: true });

const HistoricalClimateSchema = new mongoose.Schema({
  region_id: { type: Number, required: true },
  decade_year: { type: Number, required: true },
  avg_temp_c: { type: Number, required: true },
  soil_carbon_pct: { type: Number, required: true },
  yield_impact_pct: { type: Number, default: 0 }
}, { timestamps: true });

HistoricalClimateSchema.index({ region_id: 1, decade_year: 1 });

const RemedySchema = new mongoose.Schema({
  remedy_id: { type: Number, required: true, unique: true },
  problem_keyword: { type: String, required: true },
  condition: { type: String },
  pathogen_type: { type: String },
  severity: { type: String, default: 'Moderate' },
  urgency_hours: { type: Number, default: 24 },
  solution_title: { type: String, required: true },
  instructions: { type: String, required: true },
  preparation_steps: { type: [String], default: [] },
  dosage_schedule: { type: String },
  best_timing: { type: String },
  economic_impact: { type: Object, default: {} },
  cultural_prevention: { type: String },
  heritage_seed_rec: { type: String, default: null },
  seed_traits: { type: String },
  language_translations: { type: Object, default: {} }
}, { timestamps: true, strict: false });

RemedySchema.index({ problem_keyword: 1 });

const CommunityAlertSchema = new mongoose.Schema({
  alert_id: { type: Number, required: true, unique: true },
  region_id: { type: Number, required: true },
  alert_type: { type: String, required: true },
  message: { type: String, required: true },
  broadcast_date: { type: Date, default: Date.now },
  is_active: { type: Boolean, default: true }
}, { timestamps: true });

CommunityAlertSchema.index({ region_id: 1, is_active: 1 });

const Region = mongoose.models.Region || mongoose.model('Region', RegionSchema);
const HistoricalClimate = mongoose.models.HistoricalClimate || mongoose.model('HistoricalClimate', HistoricalClimateSchema);
const Remedy = mongoose.models.Remedy || mongoose.model('Remedy', RemedySchema);
const CommunityAlert = mongoose.models.CommunityAlert || mongoose.model('CommunityAlert', CommunityAlertSchema);

// ==========================================
// USER SCHEMA (Auth)
// ==========================================
const UserSchema = new mongoose.Schema({
  name:      { type: String, required: true, trim: true },
  email:     { type: String, required: true, unique: true, lowercase: true, trim: true },
  password:  { type: String, required: true },          // bcrypt hash
  phone:     { type: String, default: '' },
  state:     { type: String, default: '' },
  role:      { type: String, enum: ['farmer', 'admin'], default: 'farmer' },
  isActive:  { type: Boolean, default: true },
  lastLogin: { type: Date, default: null },
}, { timestamps: true });


const User = mongoose.models.User || mongoose.model('User', UserSchema);


let isMongoConnected = false;

// ==========================================
// 2. CONNECTION & AUTO-SEED
// ==========================================
async function connectDB(retries = 3) {
  const originalUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/maatikatha';

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      // Pre-resolve SRV on each attempt (DNS may recover between retries)
      const uri = await resolveSrvToDirectUri(originalUri);
      const displayUri = uri.replace(/:([^@]+)@/, ':***@');
      console.log(`[DB] Attempt ${attempt}/${retries} � connecting to: ${displayUri.slice(0, 80)}...`);

      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 12000,   // bumped from 8s for flaky networks
      });

      isMongoConnected = true;
      console.log('[DB] ? MongoDB Connected successfully.');
      await seedInitialData();
      return; // success � exit retry loop
    } catch (err) {
      console.warn(`[DB] Attempt ${attempt} failed: ${err.message}`);
      if (attempt < retries) {
        const delay = 2000 * attempt;    // 2s, 4s, 6s
        console.log(`[DB] Retrying in ${delay / 1000}s...`);
        await new Promise(r => setTimeout(r, delay));
        // Disconnect stale handle before retry
        try { await mongoose.disconnect(); } catch (_) {}
      }
    }
  }

  isMongoConnected = false;
  console.warn('[DB] MongoDB is not reachable after all retries. Falling back to in-memory/mock data layer.');
}

async function seedInitialData() {
  try {
    const regionCount = await Region.countDocuments();
    if (regionCount === 0 && rawMockData.regions?.length) {
      await Region.insertMany(rawMockData.regions);
      console.log('[DB] Seeded regions collection.');
    }

    const climateCount = await HistoricalClimate.countDocuments();
    if (climateCount === 0 && rawMockData.historical_climate?.length) {
      await HistoricalClimate.insertMany(rawMockData.historical_climate);
      console.log('[DB] Seeded historical_climate collection.');
    }

    const remedyCount = await Remedy.countDocuments();
    if (remedyCount === 0 && rawMockData.remedies_catalog?.length) {
      await Remedy.insertMany(rawMockData.remedies_catalog);
      console.log('[DB] Seeded remedies_catalog collection.');
    }

    const alertCount = await CommunityAlert.countDocuments();
    if (alertCount === 0 && rawMockData.community_alerts?.length) {
      await CommunityAlert.insertMany(rawMockData.community_alerts);
      console.log('[DB] Seeded community_alerts collection.');
    }
  } catch (seedErr) {
    console.error('[DB] Seeding error:', seedErr.message);
  }
}

// ==========================================
// 3. DATA ACCESS LAYER (HYBRID MONGO / FALLBACK)
// ==========================================
const dbService = {
  isMongoConnected: () => isMongoConnected,

  async getRegions() {
    if (isMongoConnected) {
      try {
        return await Region.find().lean();
      } catch (e) {
        console.warn('[DB] Fallback on getRegions');
      }
    }
    return rawMockData.regions;
  },

  async getHistoricalClimate(regionId = 1) {
    const numId = Number(regionId) || 1;
    if (isMongoConnected) {
      try {
        const records = await HistoricalClimate.find({ region_id: numId }).sort({ decade_year: 1 }).lean();
        if (records.length) return records;
      } catch (e) {
        console.warn('[DB] Fallback on getHistoricalClimate');
      }
    }
    return rawMockData.historical_climate.filter(c => c.region_id === numId);
  },

  async getRemedies() {
    let baseList = rawMockData.remedies_catalog || [];
    if (isMongoConnected) {
      try {
        const records = await Remedy.find().lean();
        if (records.length) {
          // Merge with detailed mock template to ensure all clinical fields exist
          return records.map(rec => {
            const mockMatch = baseList.find(m => m.remedy_id === rec.remedy_id || m.problem_keyword === rec.problem_keyword) || {};
            return { ...mockMatch, ...rec, preparation_steps: rec.preparation_steps?.length ? rec.preparation_steps : mockMatch.preparation_steps };
          });
        }
      } catch (e) {
        console.warn('[DB] Fallback on getRemedies');
      }
    }
    return baseList;
  },

  async findRemedyByKeyword(keyword) {
    const remedies = await this.getRemedies();
    if (!keyword) return remedies[0];
    const lower = keyword.toLowerCase();
    
    // Fuzzy keyword matcher (English, Bengali, and Hindi)
    const match = remedies.find(r => 
      lower.includes(r.problem_keyword.toLowerCase()) || 
      (r.condition && lower.includes(r.condition.toLowerCase())) ||
      r.solution_title.toLowerCase().includes(lower) ||
      (lower.includes('yellow') || lower.includes('হলুদ') || lower.includes('হলদে') || lower.includes('पीला') || lower.includes('पीली') ? r.problem_keyword === 'yellow leaves' : false) ||
      (lower.includes('insect') || lower.includes('bug') || lower.includes('chew') || lower.includes('পোকা') || lower.includes('কীট') || lower.includes('কীড়া') || lower.includes('कीड़ा') || lower.includes('कीट') ? r.problem_keyword === 'pest' : false) ||
      (lower.includes('aphid') || lower.includes('whitefly') || lower.includes('জাব') || lower.includes('মাছি') || lower.includes('माहू') || lower.includes('सफेद मक्खी') ? r.problem_keyword === 'aphids' : false) ||
      (lower.includes('rot') || lower.includes('fung') || lower.includes('decay') || lower.includes('wilt') || lower.includes('পচন') || lower.includes('শিকড়') || lower.includes('শুকিয়ে') || lower.includes('सड़न') || lower.includes('जड़') || lower.includes('मुरझा') ? r.problem_keyword === 'root rot' : false) ||
      (lower.includes('stem') || lower.includes('borer') || lower.includes('majra') || lower.includes('larva') || lower.includes('মাজরা') || lower.includes('মাঝরা') || lower.includes('কাণ্ড') || lower.includes('तने') || lower.includes('माझरा') ? r.problem_keyword === 'stem borer' : false) ||
      (lower.includes('dry') || lower.includes('heat') || lower.includes('drought') || lower.includes('sun') || lower.includes('water') || lower.includes('শুকনো') || lower.includes('খরা') || lower.includes('জল') || lower.includes('सूखा') || lower.includes('पानी') ? r.problem_keyword === 'dry soil' : false)
    );
    return match || remedies[0];
  },

  async getCommunityAlerts(regionId = 1) {
    const numId = Number(regionId) || 1;
    if (isMongoConnected) {
      try {
        const records = await CommunityAlert.find({ region_id: numId, is_active: true }).lean();
        if (records.length) return records;
      } catch (e) {
        console.warn('[DB] Fallback on getCommunityAlerts');
      }
    }
    return rawMockData.community_alerts.filter(a => a.region_id === numId && a.is_active);
  },

  async addCommunityAlert(alertData) {
    if (isMongoConnected) {
      try {
        const count = await CommunityAlert.countDocuments();
        const newAlert = new CommunityAlert({
          alert_id: count + 1,
          region_id: alertData.region_id || 1,
          alert_type: alertData.alert_type || 'Weather',
          message: alertData.message,
          broadcast_date: new Date(),
          is_active: true
        });
        return await newAlert.save();
      } catch (e) {
        console.warn('[DB] Could not save alert to MongoDB:', e.message);
      }
    }
    const mockAlert = {
      alert_id: rawMockData.community_alerts.length + 1,
      region_id: alertData.region_id || 1,
      alert_type: alertData.alert_type || 'Weather',
      message: alertData.message,
      broadcast_date: new Date().toISOString(),
      is_active: true
    };
    rawMockData.community_alerts.unshift(mockAlert);
    return mockAlert;
  },

  // ─── USER AUTH ──────────────────────────────────────────────────────────

  async registerUser({ name, email, password, phone = '', state = '' }) {
    if (!isMongoConnected) throw new Error('Database not connected. Cannot register user.');

    // Check duplicate email
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) throw new Error('EMAIL_EXISTS');

    // Hash password (cost factor 12)
    const hashed = await bcrypt.hash(password, 12);

    const user = new User({
      name:     name.trim(),
      email:    email.toLowerCase().trim(),
      password: hashed,
      phone:    phone.trim(),
      state:    state.trim(),
    });

    const saved = await user.save();
    console.log(`[Auth] New user registered: ${saved.email} (ID: ${saved._id})`);

    // Return safe user object (no password)
    return {
      _id:       saved._id,
      name:      saved.name,
      email:     saved.email,
      phone:     saved.phone,
      state:     saved.state,
      role:      saved.role,
      createdAt: saved.createdAt,
    };
  },

  async loginUser({ email, password }) {
    if (!isMongoConnected) throw new Error('Database not connected. Cannot log in.');

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) throw new Error('USER_NOT_FOUND');
    if (!user.isActive) throw new Error('ACCOUNT_DISABLED');

    const match = await bcrypt.compare(password, user.password);
    if (!match) throw new Error('INVALID_PASSWORD');

    // Update lastLogin
    user.lastLogin = new Date();
    await user.save();

    console.log(`[Auth] User logged in: ${user.email}`);

    return {
      _id:       user._id,
      name:      user.name,
      email:     user.email,
      phone:     user.phone,
      state:     user.state,
      role:      user.role,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
    };
  },

  async getUserById(id) {
    if (!isMongoConnected) return null;
    return await User.findById(id).select('-password').lean();
  },

  async listUsers() {
    if (!isMongoConnected) return [];
    return await User.find().select('-password').sort({ createdAt: -1 }).lean();
  },
};

module.exports = {
  connectDB,
  dbService,
  Region,
  HistoricalClimate,
  Remedy,
  CommunityAlert,
  User,
};

