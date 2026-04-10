# Pulse: AI-Powered Incident Response Agent

## Demo :  https://pulse-nine-mu.vercel.app/login

https://github.com/krishnakasaudhan0/agent_memory_hackathon/raw/main/assets/demo.mp4

*(If the video player does not load, [click here to view or download the demo](https://github.com/krishnakasaudhan0/agent_memory_hackathon/raw/main/assets/demo.mp4))*

Pulse is an AI assistant for engineers that acts like a highly experienced team member who instantly remembers how to fix broken systems.

Whenever a company's app or website breaks, it creates an "incident." Normally, engineers have to scramble, dig through logs, and try to figure out what went wrong and how to fix it.

Here is what Pulse does to make this much easier:

Catches the Alarm: It connects to standard monitoring tools (like PagerDuty or Sentry). The second a system breaks, Pulse catches the alert automatically in real-time.
Uses AI "Memory": Every time an engineering team fixes a bug or an incident, Pulse saves the "root cause" and the "fix" into its permanent AI memory bank.
Diagnoses the Problem Instantly: When a new alert comes in, Pulse immediately scans its AI memory to see if a similar issue has ever happened before.
Suggests the Fix: Instead of engineers starting from scratch, Pulse instantly tells them: "I've seen this before. Last time this happened, it was caused by [Issue X], and here is the exact playbook you used to fix it."

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
