// Seed data for Pulse incidents
export const SERVICES = [
  'api-gateway', 'user-service', 'payment-service', 'auth-service',
  'notification-service', 'search-service', 'cdn', 'database-primary',
  'database-replica', 'redis-cache', 'message-queue', 'load-balancer'
];

export const seedIncidents = [
  {
    title: "[Datadog] Production Database connections maxed out",
    description: "PostgreSQL connections maxed out causing cascading 500 errors across all services dependent on the primary database.",
    severity: "P1",
    affectedServices: ["api-gateway", "user-service"],
    rootCause: "A regression was introduced in the database connection module. The application was opening active PostgreSQL connections but failing to release them back into the connection pool after failed authentication attempts.",
    resolution: "Immediately ran pg_terminate_backend() to aggressively kill the stuck idle connections. Rolled the user-service deployment back to v2.3.0 which stabilized the connection leak.",
    lessonsLearned: "Implement try/finally blocks around all DB queries.",
    id: "INC-POSTGRES-99",
    status: "resolved",
    detectedAt: new Date(Date.now() - 86400000).toISOString(),
    resolvedAt: new Date(Date.now() - 80000000).toISOString(),
    timeline: []
  },
  {
    title: "[PagerDuty] Redis cluster node unresponsive",
    description: "Primary Redis cache node memory spiked to 100%, causing a sentinel failover loop and high latency.",
    severity: "P1",
    affectedServices: ["redis-cache", "api-gateway"],
    rootCause: "A massive thundering-herd effect occurred when the primary Redis cache node suffered a brief network partition. Because our API clients lacked exponential backoff, over 2,000 active services attempted to simultaneously reconnect to the cluster all at once, overwhelming the failover process.",
    resolution: "Temporarily diverted traffic to read-replicas while restarting the Redis primary node. Deployed a hotfix to our caching libraries that implements exponential backoff with random jitter (100ms - 5s) for all reconnect attempts.",
    lessonsLearned: "Never deploy caching clients without randomized jitter in their retry mechanisms.",
    id: "INC-REDIS-99",
    status: "resolved",
    detectedAt: new Date(Date.now() - 186400000).toISOString(),
    resolvedAt: new Date(Date.now() - 180000000).toISOString(),
    timeline: []
  },
  {
    title: "[Security] Volumetric DDoS Attack Detected",
    description: "AWS Shield reporting massive 400 Gbps UDP flood targeting the payment gateways. Firewalls are overwhelmed.",
    severity: "P1",
    affectedServices: ["payment-gateway"],
    rootCause: "A coordinated Layer 4 UDP reflection attack bypassed our edge firewalls by spoofing internal IP subnets. The traffic targeted the unmetered endpoints.",
    resolution: "Routed all edge traffic through the Cloudflare Under Attack mitigation network. Enabled geo-blocking to drop all traffic originating from outside our primary SLA regions. Updated AWS SG to drop spoofed traffic.",
    lessonsLearned: "Move all critical gateways behind robust edge protection.",
    id: "INC-DDOS-99",
    status: "resolved",
    detectedAt: new Date(Date.now() - 286400000).toISOString(),
    resolvedAt: new Date(Date.now() - 280000000).toISOString(),
    timeline: []
  },
  {
    title: "[AWS] Elasticsearch Cluster OOM Kill",
    description: "Search nodes experiencing continuous OOM (Out of Memory) kills. E-commerce product search is returning 503s.",
    severity: "P2",
    affectedServices: ["search-service", "cache-layer"],
    rootCause: "A misconfigured wildcard search query from a rogue internal analytics dashboard caused the Elasticsearch JVM heap to completely fill up, triggering the Linux OOM killer to terminate the elasticsearch process across all data nodes.",
    resolution: "Hard-restarted all data nodes and temporarily blocked the analytics dashboard IP. Deployed an Elastic mapping update to set 'fielddata: false' on highly cardinal text fields to prevent heap exhaustion.",
    lessonsLearned: "Always restrict wildcard text queries on un-indexed fields and monitor JVM heap usage aggressively.",
    id: "INC-ELASTIC-99",
    status: "resolved",
    detectedAt: new Date(Date.now() - 386400000).toISOString(),
    resolvedAt: new Date(Date.now() - 380000000).toISOString(),
    timeline: []
  },
  {
    title: "[Stripe] SSL Certificate Expiry on Payment Webhook",
    description: "Stripe inbound webhooks are failing with SSL validation errors. Payments are succeeding but not registering in our database.",
    severity: "P1",
    affectedServices: ["payment-service", "user-service"],
    rootCause: "The Let's Encrypt automated certbot cronjob failed silently 3 weeks ago due to an expired AWS IAM role for Route53 DNS validation. The certificate for 'payments.ourdomain.com' expired at midnight.",
    resolution: "Manually refreshed the IAM token and kicked off a forced certbot renewal using DNS-01 challenge. Updated the webhook endpoints locally and successfully re-ran the dropped Stripe events from the past 4 hours using their replay dashboard.",
    lessonsLearned: "Implement a dedicated Datadog monitor that alerts 14 days before any SSL certificate expires across the entire fleet.",
    id: "INC-STRIPE-99",
    status: "resolved",
    detectedAt: new Date(Date.now() - 486400000).toISOString(),
    resolvedAt: new Date(Date.now() - 480000000).toISOString(),
    timeline: []
  },
  {
    title: "[Kafka] Message Queue Consumer Deadlock",
    description: "Notification service consumer lag has spiked to 3,000,000 messages. No emails or push notifications are going out.",
    severity: "P2",
    affectedServices: ["notification-service", "message-queue"],
    rootCause: "A poisoned email payload containing a malformed Unicode string caused the Node.js consumer thread to enter an infinite regex parsing loop. Because it was single-threaded, it never committed the Kafka offset, stalling the entire partition.",
    resolution: "Identified the poisoned message on Partition 4. Manually advanced the consumer group offset past the bad message using the Kafka CLI tools. Restarted the notification pods.",
    lessonsLearned: "Wrap all regex match functions in defensive timeout patterns and configure a Dead Letter Queue (DLQ) for un-parseable JSON payloads.",
    id: "INC-KAFKA-99",
    status: "resolved",
    detectedAt: new Date(Date.now() - 586400000).toISOString(),
    resolvedAt: new Date(Date.now() - 580000000).toISOString(),
    timeline: []
  }
];

export const mttrTrend = [];

export const incidentsByService = [];

export const rootCauseDistribution = [];
