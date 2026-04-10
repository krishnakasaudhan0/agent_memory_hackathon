# About Pulse: Dashboard Metrics & Intelligence

The Pulse Command Center requires no manual refreshing. It is designed to act as a living, breathing snapshot of both your infrastructure's health and the AI Agent's learning velocity. 

Here is a breakdown of what each widget, tab, and metric represents in the ecosystem:

## Core Status Metrics

### 1. Active Incidents
* **What it is:** The live, real-time counter of unresolved anomalies (P1/P2 failures) currently plaguing your stack.
* **Significance:** This drives your current firefighting load. Webhooks from systems like PagerDuty or Sentry stream directly into this counter using low-latency Server-Sent Events (SSE). 

### 2. Avg. MTTR (Mean Time To Resolution)
* **What it is:** The average time (in minutes) it takes to close an incident from the exact moment it was detected.
* **Significance:** This is **Pulse's primary KPI**. The entire goal of our AI integration is to drastically lower this number. As the AI Agent learns your system and predicts root causes instantly, your engineers spend less time hunting for logs and more time deploying fixes.

### 3. Resolved This Month
* **What it is:** The total volume of completed anomalies within the trailing 30 days.
* **Significance:** Every resolved incident serves as critical training data. When an incident is moved to this category, its root cause and fix are formally "encoded" into the Hindsight Vector Cloud.

### 4. AI Memory Score
* **What it is:** A dynamic percentage rating of the internal AI's contextual knowledge base.
* **Significance:** This score physically goes up as the AI learns. High memory scores indicate that the agent has a high probability of successfully correlating any new inbound webhooks against past failures.

---

## Visual Analytics

### MTTR Trend Graph 
* **Role:** A month-over-month trajectory line chart tracking your MTTR progress. 
* **Value for Demo:** This visually proves the ROI of the tool—showing stakeholders that the longer Pulse runs on your system, the faster your team solves outages.

### The Pulse AI Brain Widget (Radial Progress)
* **Role:** A visual tracking system detailing precisely how many "Memories" (embedded context vectors) and "Root Causes" the engine has securely retained in the cloud. 
* **Value for Demo:** This represents the "Ghost in the Machine." When you resolve an incident in your demo, you will see this widget's memory count manually scale up, proving that the Agent successfully learned a new playbook.

---

## Incident Workflows

### Recent Incidents Table
* Contains your triage list queue. Red labels indicate active, burning fires `(Ongoing)` that require an engineer's attention. Green labels dictate secured nodes that have completed their AI pipeline. Clicking into any row brings up the detailed investigation terminal where the AI Agent provides its reflection.
