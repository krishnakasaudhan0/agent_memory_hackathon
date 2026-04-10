# Pulse: AI-Powered Incident Response Agent

## Demo

<video src="./assets/demo.mp4" controls="controls" muted="muted" width="100%">
  Your browser does not support the video tag. <a href="./assets/demo.mp4">Download the video here</a>.
</video>

Pulse is an intelligent, real-time incident command center designed to drastically reduce Mean Time To Resolution (MTTR). By acting as a persistent AI memory layer for your infrastructure, Pulse intercepts incoming alerts from monitoring tools (PagerDuty, Datadog, Sentry), cross-references them against prior resolved incidents, and automatically diagnoses the root cause and suggests proven fixes.

## Key Features

1. **Automated Webhook Ingestion (SSE)**
   Seamlessly captures live alerts from third-party tools via a dedicated Express server using Server-Sent Events to pipe incidents directly into the dashboard in real-time.
   
2. **Hindsight Cloud AI Memory**
   Powered by the Vectorize Hindsight semantic memory engine. As incidents are resolved, their root cause, duration, and fixes are structurally embedded into the AI's permanent memory bank.
   
3. **Proactive Auto-Diagnosis**
   When a new incident is ingested, Pulse instantly runs a semantic Vector query (`recallSimilar`) against past outages, surfacing matching anomalies and offering a confidence-scored recommended playbook.

4. **Resilient Data Store**
   Features a hybrid data architecture combining Firebase Authentication & Firestore for multi-device sync, alongside local storage fallbacks to ensure uncompromised availability during active firefighting.

5. **Real-Time Analytics Dashboard**
   Dynamic MTTR tracking charts, AI memory scoring, and impact distribution widgets keep engineering leadership connected to the heartbeat of the system.

## Setup & Testing

### 1. Configure the Environment
Ensure your `.env` variables are configured (though safe defaults are integrated for immediate hackathon execution). 
```env
VITE_HINDSIGHT_API_KEY=your_key_here
VITE_FIREBASE_API_KEY=your_key_here
# ... other firebase config
```

### 2. Run the Webhook Server
The backend server handles incoming external alerts.
```bash
npm run server
```

### 3. Run the Frontend App
```bash
npm run dev
```

### 4. Trigger a Mock Webhook
Open a terminal and fire an alert:
```bash
curl -X POST http://localhost:3001/webhook/sentry \
-H "Content-Type: application/json" \
-d '{
  "action": "created",
  "data": {
    "issue": {
      "title": "Search service pods being repeatedly OOM-killed.",
      "culprit": "src/search/index.js",
      "level": "fatal",
      "project": { "slug": "search-service" }
    }
  }
}'
```
Watch the incident dynamically render on the Pulse Dashboard, complete with an AI reflection!
