const API_URL = 'https://hindsight-proxy.jamsapi.com/v1/default/banks/pulse-incidents-demo-2/memories';
const API_KEY = 'hsk_11dec262213123be799162b72fb93d3e_11b1e1fe608a73b5';

const incidents = [
  {
    title: "[Datadog] Production Database offline",
    description: "PostgreSQL connections maxed out causing cascading 500 errors across all services dependent on the primary database.",
    severity: "P1",
    affectedServices: "api-gateway, user-service",
    rootCause: "A regression was introduced in the database connection module. The application was opening active PostgreSQL connections but failing to release them back into the connection pool after failed authentication attempts.",
    resolution: "Immediately ran pg_terminate_backend() to aggressively kill the stuck idle connections. Rolled the user-service deployment back to v2.3.0 which stabilized the connection leak.",
    lessonsLearned: "Implement try/finally blocks around all DB queries.",
    id: "INC-POSTGRES",
    status: "resolved"
  },
  {
    title: "[PagerDuty] Redis cluster node unresponsive",
    description: "Primary Redis cache node memory spiked to 100%, causing a sentinel failover loop and high latency.",
    severity: "P1",
    affectedServices: "redis-cache, api-gateway",
    rootCause: "A massive thundering-herd effect occurred when the primary Redis cache node suffered a brief network partition. Because our API clients lacked exponential backoff, over 2,000 active services attempted to simultaneously reconnect to the cluster all at once, overwhelming the failover process.",
    resolution: "Temporarily diverted traffic to read-replicas while restarting the Redis primary node. Deployed a hotfix to our caching libraries that implements exponential backoff with random jitter (100ms - 5s) for all reconnect attempts.",
    lessonsLearned: "Never deploy caching clients without randomized jitter in their retry mechanisms.",
    id: "INC-REDIS",
    status: "resolved"
  },
  {
    title: "[Security] Volumetric DDoS Attack Detected",
    description: "AWS Shield reporting massive 400 Gbps UDP flood targeting the payment gateways. Firewalls are overwhelmed.",
    severity: "P1",
    affectedServices: "payment-gateway",
    rootCause: "A coordinated Layer 4 UDP reflection attack bypassed our edge firewalls by spoofing internal IP subnets. The traffic targeted the unmetered endpoints.",
    resolution: "Routed all edge traffic through the Cloudflare Under Attack mitigation network. Enabled geo-blocking to drop all traffic originating from outside our primary SLA regions. Updated AWS SG to drop spoofed traffic.",
    lessonsLearned: "Move all critical gateways behind robust edge protection.",
    id: "INC-DDOS",
    status: "resolved"
  }
];

async function feed() {
  console.log("Feeding rich AI memory vectors directly to the Hindsight Cloud...");
  for (const inc of incidents) {
    const textToEmbed = `
      INCIDENT TITLE: ${inc.title}
      DESCRIPTION: ${inc.description}
      SEVERITY: ${inc.severity}
      IMPACTED SERVICES: ${inc.affectedServices}
      ROOT CAUSE: ${inc.rootCause}
      RESOLUTION: ${inc.resolution}
      LESSONS LEARNED: ${inc.lessonsLearned}
    `.replace(/\n\s+/g, '\n').trim();

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
          text: textToEmbed,
          metadata: { id: inc.id, type: 'incident_resolution', status: inc.status }
        })
      });
      console.log(`Successfully embedded ${inc.id}:`, res.status === 200 ? 'OK' : res.status);
    } catch(err) {
      console.error(err);
    }
  }
  console.log("Done! The AI Brain is now fully trained.");
}

feed();
