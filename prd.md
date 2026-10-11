Product Requirements Document (PRD)
1. Product Name MaatiKatha
2. One-Line Product Description A zero-hardware, voice-first farming assistant that combines ancestral agricultural wisdom with AI predictive modeling to help small-scale farmers prevent crop loss.
3. Problem Statement Small-scale farmers are suffering devastating crop losses and falling into debt due to unpredictable climate change and a heavy reliance on soil-degrading chemicals. They have lost traditional, climate-resilient farming knowledge. Current agritech solutions are inaccessible because they rely on expensive physical hardware (like IoT soil sensors) and use English-first, text-heavy interfaces that alienate rural users.
4. Target User Small-scale, rural farmers who speak regional languages (like Bengali or Hindi). They possess limited digital literacy, struggle with text-heavy apps, own a basic smartphone, but cannot afford expensive farming hardware or sensors.
5. User Pain Points
•	Climate Confusion: Sowing seeds based on traditional calendar dates, only to have crops destroyed by sudden, unseasonal heatwaves or floods.
•	High Financial Costs: Falling into debt buying expensive chemical fertilizers and pesticides instead of using natural, ancestral remedies.
•	Surprise Outbreaks: Discovering pests or diseases only after the crops are visibly infected and damaged.
•	Language & Tech Barriers: Inability to read complex menus or type out farming questions in English on standard apps.
6. Proposed Solution A mobile-friendly web application built on the principle of "Zero-Hardware." It relies entirely on voice AI and climate data to act as a multilingual field doctor, a simulator for future decisions, and a historical timeline of soil health. By using simple buttons and voice commands in regional languages, farmers receive instant, traditional, and preventative farming advice from MaatiKatha.
7. Product Goal To build a functional, impressive, and realistic prototype (MVP) within 24–48 hours that proves to hackathon judges that expensive hardware is not required to provide predictive, life-saving agricultural advice to non-literate users.
8. User Stories
•	As a farmer, I want to ask questions by just speaking into my phone in Bengali, so that I do not have to type or read complex text.
•	As a farmer, I want to see how my soil and weather have changed over the last few decades, so that I understand why my current crops are failing.
•	As a farmer, I want to test farm decisions (like skipping a watering cycle) in a simulator, so that I know the financial risk before I actually make the mistake in the real world.
•	As a farmer, I want to receive alerts about upcoming extreme weather, so that I can adjust my sowing dates to protect my seeds.
9. Functional Requirements
•	Voice Input/Output System: The app must record user audio, transcribe it to text, process it via AI, and play the response out loud as audio.
•	API Integration: The app must connect to a real-time weather service (OpenWeatherMap API) to fetch a 7-day forecast.
•	Interactive UI Sliders: The app must include drag-and-drop sliders to simulate past and future timelines.
•	Language Translation: The system must accurately handle translation from a regional language to English (for AI processing) and back to the regional language (for user output).
10. Non-Functional Requirements
•	Beginner-Friendly UI: The interface must use oversized buttons (especially the microphone) and minimal text.
•	Responsiveness: Because farmers will use this on phones, the web app must scale cleanly to fit mobile screens.
•	Latency: The Voice Doctor should ideally process the audio and return an answer within 5–8 seconds to keep the user engaged.
11. Core Features (The Hackathon MVP)
•	Screen 1: MaatiKatha Voice Doctor: A giant microphone button. The farmer speaks their problem (e.g., "My leaves are yellow"). The app uses OpenAI to generate a low-cost, traditional remedy and plays the audio back in their native language.
•	Screen 2: "What-If" / Time Machine Slider: An interactive timeline. Dragging left shows mocked (fake) historical data (1980 vs. 2026) explaining soil degradation. Dragging right allows the user to simulate an action (e.g., "Add Cow Dung") and view a mocked projected outcome (e.g., "Yield +20%").
•	Screen 3: "RituRakhok" Dashboard: A simple weather screen. It reads the real weather forecast via an API and outputs three hardcoded, easy-to-understand ancestral action steps (e.g., "Heavy rain in 2 days. Delay sowing. Plant marigold borders").
12. Nice-to-Have Features (If Time Permits)
•	Offline Mode UI: A mocked button showing how the app would cache basic advice if internet is lost in the field.
•	SMS Fallback: A demonstration of how pest alerts could be sent via simple text message for farmers without smartphones.
13. User Journeys
•	Journey 1 (Getting immediate advice): The user opens MaatiKatha, lands on the Voice Doctor screen, taps the massive microphone icon, asks a question in Bengali about a pest, and listens to the audio reply advising the use of neem oil.
•	Journey 2 (Planning for the future): The user navigates to the What-If Simulator, selects "Skip watering for 2 days", drags the slider forward, and sees a visual warning that crop stress will increase by 40%, deciding against skipping the watering.
•	Journey 3 (Adapting to weather): The user taps the RituRakhok button. The app checks their city's live weather, detects an upcoming heatwave, and provides a 3-step action plan recommending a specific heat-tolerant heritage seed.
14. MVP Scope (What you are actually building)
•	Frontend: A 3-page web app built entirely in Python using Streamlit (no HTML/CSS required).
•	Backend Logic: Python scripts to handle button clicks and API routing.
•	AI & APIs: OpenAI Whisper (Speech-to-Text), OpenAI ChatGPT (Logic/Brain), Google TTS (Text-to-Speech), and OpenWeatherMap (Weather data).
•	Data Strategy: Use Mocked Data for all complex features (historical climate data, wind-tracking, market prices). Hardcode this data into your Python script to prove the logic to the judges without building massive databases.
15. Out-of-Scope Features (Do NOT build these)
•	User login, registration, or profile settings (adds zero value to a hackathon demo).
•	Live satellite imagery or solar radiation calculations.
•	A real 50-year historical climate database.
•	Live wind-direction tracking for neighboring farms.
•	E-commerce payment gateways to buy seeds.
16. Success Metrics (For the Hackathon Demo)
•	The microphone successfully captures and translates regional audio without crashing.
•	The AI successfully returns a relevant, non-chemical, ancestral farming solution.
•	The Streamlit UI displays properly on a mobile phone simulator during the presentation.
•	The judges clearly understand the "Zero-Hardware" cost-saving advantage.
17. Risks and Assumptions
•	Risk (API Latency): Free tiers of OpenAI or Weather APIs might be slow or timeout during the live demo. Mitigation: Have a screen recording of the app working perfectly just in case the live demo fails.
•	Risk (Audio in noisy rooms): Hackathon halls are loud; Whisper AI might struggle to hear the regional language prompt during the presentation. Mitigation: Keep the prompt short and clear, and speak directly into the mic.
•	Assumption: The target user has a basic smartphone and cellular data access in their village to communicate with the cloud APIs.

