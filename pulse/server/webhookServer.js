import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
dotenv.config();

// WARNING: In production, the Hindsight API key should be moved from vite.config.js 
// to this server's .env for maximum security.

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(bodyParser.json());

// SSE Clients List
const clients = new Set();

// ----------------------------------------------------
// SSE Endpoint
// ----------------------------------------------------
app.get('/events', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  });

  clients.add(res);
  req.on('close', () => {
    clients.delete(res);
  });
});

const broadcast = (incident) => {
  for (let client of clients) {
    client.write(`data: ${JSON.stringify(incident)}\n\n`);
  }
};

// ----------------------------------------------------
// Normalizers
// ----------------------------------------------------
const normalizePagerDuty = (payload) => {
  const msg = payload.messages?.[0] || {};
  const incident = msg.incident || {};
  
  let status = "investigating";
  if (msg.event === "acknowledge") status = "identified";
  if (msg.event === "resolve") status = "resolved";

  let severity = "P2";
  if (incident.urgency === "high") severity = "P1";
  else if (incident.urgency === "low") severity = "P3";

  return {
    title: incident.title || "PagerDuty Incident",
    description: incident.description || incident.title || "No description provided",
    severity,
    status,
    affectedServices: incident.impacted_services?.map(s => s.name) || [],
    createdAt: incident.created_at || new Date().toISOString()
  };
};

const normalizeDatadog = (payload) => {
  let status = "investigating";
  if (payload.alert_status === "Recovered") status = "resolved";

  let severity = "P2";
  if (["P1", "P2", "P3", "P4"].includes(payload.priority)) {
    severity = payload.priority;
  }

  const affectedServices = [];
  if (payload.tags) {
    payload.tags.split(',').forEach(tag => {
      const trimmed = tag.trim();
      if (trimmed.startsWith("service:")) {
        affectedServices.push(trimmed.replace("service:", ""));
      }
    });
  }

  return {
    title: payload.alert_title || "Datadog Alert",
    description: payload.alert_message || "No description provided",
    severity,
    status,
    affectedServices,
    createdAt: payload.date_happened ? new Date(payload.date_happened * 1000).toISOString() : new Date().toISOString()
  };
};

const normalizeSentry = (payload) => {
  let status = "investigating";
  if (payload.action === "resolved") status = "resolved";

  const issue = payload.data?.issue || {};
  let severity = issue.level === "fatal" ? "P1" : "P3";

  return {
    title: issue.title || "Sentry Issue",
    description: issue.culprit || "No description provided",
    severity,
    status,
    affectedServices: issue.project?.slug ? [issue.project.slug] : [],
    createdAt: issue.firstSeen || new Date().toISOString()
  };
};

const buildIncident = (normalized) => {
  return {
    ...normalized,
    id: `webhook-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    resolvedAt: normalized.status === 'resolved' ? new Date().toISOString() : null,
    timeline: [{
      time: normalized.createdAt,
      event: "Incident auto-ingested via webhook",
      author: "Pulse Webhook Agent"
    }],
    aiDiagnosis: null
  };
};

// ----------------------------------------------------
// Webhook Routes
// ----------------------------------------------------
app.post('/webhook/pagerduty', (req, res) => {
  const normalized = normalizePagerDuty(req.body);
  const incident = buildIncident(normalized);
  broadcast(incident);
  res.status(200).json({ success: true, id: incident.id });
});

app.post('/webhook/datadog', (req, res) => {
  const normalized = normalizeDatadog(req.body);
  const incident = buildIncident(normalized);
  broadcast(incident);
  res.status(200).json({ success: true, id: incident.id });
});

app.post('/webhook/sentry', (req, res) => {
  const normalized = normalizeSentry(req.body);
  const incident = buildIncident(normalized);
  broadcast(incident);
  res.status(200).json({ success: true, id: incident.id });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`[Webhook Server] Listening for external alerts on port ${PORT}`);
});
