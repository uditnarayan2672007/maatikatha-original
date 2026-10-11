Database Schema Overview
To keep the architecture simple and maintainable, we will use 4 core tables:
1.	regions: Stores the geographical areas to contextualize weather and climate data.
2.	historical_climate: Feeds the "What-If / Time Machine" slider with decadal data.
3.	remedies_catalog: Provides verified ancestral knowledge to inject into the Gemini AI prompts.
4.	community_alerts: Powers the "RituRakhok" dashboard's neighborhood pest/weather warnings.
1. Table: regions
Why it exists: To act as the central anchor for location-based data. Instead of typing "West Bengal" multiple times in different tables, we link to a single region record.
•	Columns & Data Types:
o	region_id (INT) - Primary Key
o	name (VARCHAR) - Required (e.g., 'Howrah')
o	state (VARCHAR) - Required (e.g., 'West Bengal')
o	language_code (VARCHAR) - Optional (e.g., 'bn' for Bengali)
•	Relationships: 1-to-Many with historical_climate and community_alerts.
2. Table: historical_climate
Why it exists: To power Screen 2 (The Time Machine). It holds the mocked historical data (1975–2026) showing how temperature has risen and soil carbon has depleted, proving the need for regenerative practices.
•	Columns & Data Types:
o	climate_id (INT) - Primary Key
o	region_id (INT) - Foreign Key (references regions.region_id) - Required
o	decade_year (INT) - Required (e.g., 1980, 1990)
o	avg_temp_c (DECIMAL) - Required (Average temperature in Celsius)
o	soil_carbon_pct (DECIMAL) - Required (Soil organic carbon percentage)
o	yield_impact_pct (INT) - Optional (Estimated crop yield change)
•	Indexes: Index on (region_id, decade_year) for fast slider queries.
3. Table: remedies_catalog
Why it exists: To act as the "ground truth" for your AI. When the farmer says "yellow leaves", the backend fetches natural remedies from this table and passes them to Gemini to ensure the AI gives cheap, ancestral advice rather than suggesting expensive chemicals.
•	Columns & Data Types:
o	remedy_id (INT) - Primary Key
o	problem_keyword (VARCHAR) - Required (e.g., 'yellow leaves', 'aphids')
o	solution_title (VARCHAR) - Required
o	instructions (TEXT) - Required
o	heritage_seed_rec (VARCHAR) - Optional (e.g., 'Desi Red Tomato')
•	Indexes: Index on problem_keyword for fast text matching.
4. Table: community_alerts
Why it exists: To power the "KhamarDrishti" (Pest Radar) and "RituRakhok" features, allowing you to mock sudden neighborhood alerts like approaching heatwaves or locusts.
•	Columns & Data Types:
o	alert_id (INT) - Primary Key
o	region_id (INT) - Foreign Key (references regions.region_id) - Required
o	alert_type (VARCHAR) - Required ('Weather', 'Pest', 'Market')
o	message (TEXT) - Required
o	broadcast_date (TIMESTAMP) - Required
o	is_active (BOOLEAN) - Optional (Defaults to TRUE)
Example Records (The Mock Data)
regions
•	1 | 'Howrah' | 'West Bengal' | 'bn'
historical_climate
•	1 | 1 (Howrah) | 1980 | 28.5 | 1.8 | +5
•	2 | 1 (Howrah) | 2026 | 32.1 | 0.4 | -20
remedies_catalog
•	1 | 'aphids' | 'Neem Oil Extract' | 'Boil 50g neem leaves in 1L water. Cool and spray on leaves at sunset.' | NULL
community_alerts
•	1 | 1 (Howrah) | 'Weather' | 'Heavy unseasonal rain expected in 48 hours. Delay sowing seeds.' | '2026-09-18 10:00:00' | TRUE
SQL Schema Code
Here is the exact SQL code you can run to create this database and insert the mock data for your hackathon demo.
SQL
-- ==========================================
-- 1. CREATE TABLES
-- ==========================================

CREATE TABLE regions (
    region_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    language_code VARCHAR(10)
);

CREATE TABLE historical_climate (
    climate_id INTEGER PRIMARY KEY AUTOINCREMENT,
    region_id INTEGER NOT NULL,
    decade_year INTEGER NOT NULL,
    avg_temp_c DECIMAL(5,2) NOT NULL,
    soil_carbon_pct DECIMAL(4,2) NOT NULL,
    yield_impact_pct INTEGER,
    FOREIGN KEY (region_id) REFERENCES regions(region_id)
);

CREATE TABLE remedies_catalog (
    remedy_id INTEGER PRIMARY KEY AUTOINCREMENT,
    problem_keyword VARCHAR(100) NOT NULL,
    solution_title VARCHAR(150) NOT NULL,
    instructions TEXT NOT NULL,
    heritage_seed_rec VARCHAR(150)
);

CREATE TABLE community_alerts (
    alert_id INTEGER PRIMARY KEY AUTOINCREMENT,
    region_id INTEGER NOT NULL,
    alert_type VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    broadcast_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (region_id) REFERENCES regions(region_id)
);

-- ==========================================
-- 2. CREATE INDEXES (For performance)
-- ==========================================

CREATE INDEX idx_climate_timeline ON historical_climate(region_id, decade_year);
CREATE INDEX idx_remedy_search ON remedies_catalog(problem_keyword);
CREATE INDEX idx_active_alerts ON community_alerts(region_id, is_active);

-- ==========================================
-- 3. INSERT HACKATHON MOCK DATA
-- ==========================================

-- Insert Region
INSERT INTO regions (name, state, language_code) 
VALUES ('Howrah', 'West Bengal', 'bn');

-- Insert Historical Climate Data for the Slider
INSERT INTO historical_climate (region_id, decade_year, avg_temp_c, soil_carbon_pct, yield_impact_pct) VALUES 
(1, 1980, 28.5, 1.80, 10),
(1, 1990, 29.2, 1.40, 5),
(1, 2000, 30.1, 1.00, 0),
(1, 2010, 31.0, 0.70, -10),
(1, 2026, 32.1, 0.40, -25);

-- Insert Ancestral Remedies for Gemini Context
INSERT INTO remedies_catalog (problem_keyword, solution_title, instructions, heritage_seed_rec) VALUES 
('yellow leaves', 'Cow Dung & Ash Manure', 'Mix dried cow dung with wood ash and apply to the base of the plant to restore nitrogen naturally.', 'Gobindobhog Rice'),
('pest', 'Neem Oil Spray', 'Crush neem seeds, mix with water and a drop of natural soap. Spray during early morning.', NULL);

-- Insert Real-time Alert
INSERT INTO community_alerts (region_id, alert_type, message, is_active) VALUES 
(1, 'Weather', 'Sudden heatwave detected! Mulch your soil with dry leaves today to lock in moisture.', TRUE);
