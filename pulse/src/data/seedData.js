// Seed data for Pulse incidents
export const SERVICES = [
  'api-gateway', 'user-service', 'payment-service', 'auth-service',
  'notification-service', 'search-service', 'cdn', 'database-primary',
  'database-replica', 'redis-cache', 'message-queue', 'load-balancer'
];

export const seedIncidents = [
  {
    id: 'INC-001',
    title: 'Database connection pool exhausted',
    description: 'PostgreSQL connections maxed out causing cascading 500 errors across all services dependent on the primary database.',
    severity: 'P1',
    status: 'resolved',
    affectedServices: ['api-gateway', 'user-service', 'payment-service'],
    tags: ['database', 'postgres', 'connection-pool'],
    detectedAt: '2026-04-08T03:22:00Z',
    resolvedAt: '2026-04-08T03:48:00Z',
    timeline: [
      { time: '03:22', event: 'Alert triggered: DB connection count > 95%', type: 'alert' },
      { time: '03:24', event: 'PagerDuty escalation to on-call engineer', type: 'action' },
      { time: '03:28', event: 'Confirmed connection leak in user-service v2.3.1', type: 'diagnosis' },
      { time: '03:40', event: 'Rolled back user-service to v2.3.0', type: 'fix' },
      { time: '03:48', event: 'All systems nominal. MTTR: 26 minutes', type: 'resolved' }
    ],
    rootCause: 'Connection leak in user-service v2.3.1 — connections not returned to pool after failed auth attempts.',
    resolution: 'Rolled back to v2.3.0. Patched with proper try/finally blocks in v2.3.2.',
    lessonsLearned: 'Add connection pool utilization alerts at 80% threshold.'
  },
  {
    id: 'INC-002',
    title: 'Redis cache cluster failover cascade',
    description: 'Primary Redis node became unresponsive triggering sentinel failover with thundering herd effect.',
    severity: 'P1',
    status: 'resolved',
    affectedServices: ['redis-cache', 'api-gateway', 'search-service', 'auth-service'],
    tags: ['redis', 'connection-pool', 'scaling'],
    detectedAt: '2026-04-06T14:15:00Z',
    resolvedAt: '2026-04-06T14:52:00Z',
    timeline: [
      { time: '14:15', event: 'Redis primary node unresponsive', type: 'alert' },
      { time: '14:18', event: 'Thundering herd: 2000+ simultaneous reconnections', type: 'alert' },
      { time: '14:22', event: 'Missing exponential backoff in connection retry', type: 'diagnosis' },
      { time: '14:45', event: 'Deployed connection retry with jittered backoff', type: 'fix' },
      { time: '14:52', event: 'All services reconnected. Cluster stable.', type: 'resolved' }
    ],
    rootCause: 'Redis clients lacked exponential backoff with jitter for reconnection.',
    resolution: 'Implemented exponential backoff with random jitter (100ms-5s). Added circuit breaker.',
    lessonsLearned: 'All cache clients must implement retry with jitter.'
  },
  {
    id: 'INC-003',
    title: 'Payment processing timeout spike',
    description: 'Stripe webhook processing latency increased from 200ms to 12s causing payment confirmation delays.',
    severity: 'P2',
    status: 'resolved',
    affectedServices: ['payment-service', 'notification-service'],
    tags: ['timeout', 'third-party', 'deployment'],
    detectedAt: '2026-04-05T09:30:00Z',
    resolvedAt: '2026-04-05T10:15:00Z',
    timeline: [
      { time: '09:30', event: 'Alert: Payment webhook p99 latency > 5s', type: 'alert' },
      { time: '09:42', event: 'Found: New fraud check middleware in last deploy', type: 'diagnosis' },
      { time: '10:00', event: 'Moved fraud check to async background job', type: 'fix' },
      { time: '10:15', event: 'Latency back to normal levels', type: 'resolved' }
    ],
    rootCause: 'New fraud detection middleware making synchronous HTTP calls to third-party API.',
    resolution: 'Moved fraud check to async background job via message queue. Added 3s timeout.',
    lessonsLearned: 'Never add synchronous external API calls in critical payment paths.'
  },
  {
    id: 'INC-004',
    title: 'SSL certificate expiry on CDN edge nodes',
    description: 'TLS certificates expired on 3 CDN edge nodes causing failed HTTPS connections for ~15% of users.',
    severity: 'P2',
    status: 'resolved',
    affectedServices: ['cdn', 'load-balancer'],
    tags: ['ssl', 'certificate', 'config-change'],
    detectedAt: '2026-04-03T06:00:00Z',
    resolvedAt: '2026-04-03T06:35:00Z',
    timeline: [
      { time: '06:00', event: 'Customer reports: SSL warnings in browser', type: 'alert' },
      { time: '06:05', event: 'Confirmed: 3 edge nodes serving expired cert', type: 'diagnosis' },
      { time: '06:20', event: "Manual certificate renewal via Let's Encrypt", type: 'fix' },
      { time: '06:35', event: 'All nodes serving valid certificates', type: 'resolved' }
    ],
    rootCause: 'Automated certificate renewal failed silently due to DNS provider API rate limiting.',
    resolution: 'Manually renewed. Fixed DNS validation fallback. Added 30-day expiry alerts.',
    lessonsLearned: 'Monitor certificate expiry. Set up alerts at 30, 14, and 7 days before expiry.'
  },
  {
    id: 'INC-005',
    title: 'Memory leak in search service causing OOM kills',
    description: 'Search service pods being repeatedly OOM-killed. Elasticsearch scroll contexts not garbage collected.',
    severity: 'P2',
    status: 'resolved',
    affectedServices: ['search-service', 'api-gateway'],
    tags: ['memory-leak', 'kubernetes', 'scaling'],
    detectedAt: '2026-04-02T11:45:00Z',
    resolvedAt: '2026-04-02T13:20:00Z',
    timeline: [
      { time: '11:45', event: 'K8s alert: search-service pod restarts > 5 in 10min', type: 'alert' },
      { time: '11:50', event: 'Memory usage climbing linearly: leak confirmed', type: 'diagnosis' },
      { time: '12:20', event: 'Found: ES scroll contexts not being closed', type: 'diagnosis' },
      { time: '12:45', event: 'Fix deployed: Added scroll context cleanup', type: 'fix' },
      { time: '13:20', event: 'No more OOM kills. Stable for 30 min.', type: 'resolved' }
    ],
    rootCause: 'Elasticsearch scroll API contexts not explicitly closed. Each held ~50MB heap.',
    resolution: 'Added explicit scroll context cleanup in finally blocks. 5 min timeout.',
    lessonsLearned: 'Always close ES scroll contexts. Monitor per-pod memory trends.'
  },
  {
    id: 'INC-006',
    title: 'DNS resolution failure for internal services',
    description: 'CoreDNS pods experiencing intermittent failures causing service-to-service timeouts across cluster.',
    severity: 'P1',
    status: 'resolved',
    affectedServices: ['api-gateway', 'user-service', 'payment-service', 'auth-service'],
    tags: ['dns', 'kubernetes', 'network'],
    detectedAt: '2026-03-30T22:10:00Z',
    resolvedAt: '2026-03-30T22:55:00Z',
    timeline: [
      { time: '22:10', event: 'Multiple services reporting connection timeouts', type: 'alert' },
      { time: '22:15', event: 'Pattern: All failures involve DNS resolution', type: 'diagnosis' },
      { time: '22:25', event: 'Root cause: Ndots:5 causing excessive DNS queries', type: 'diagnosis' },
      { time: '22:40', event: 'Updated ndots to 2 with proper search domains', type: 'fix' },
      { time: '22:55', event: 'DNS resolution stable. Query latency < 5ms.', type: 'resolved' }
    ],
    rootCause: 'Default Kubernetes ndots:5 combined with increased service count caused 5x DNS amplification.',
    resolution: 'Reduced ndots to 2, added explicit search domain list. Scaled CoreDNS.',
    lessonsLearned: 'Monitor DNS query rates. Set ndots:2 as default for all pods.'
  },
  {
    id: 'INC-007',
    title: 'API rate limit misconfiguration after deploy',
    description: 'Rate limiter config overwritten during deployment, setting global limit to 10 req/s instead of 10,000.',
    severity: 'P1',
    status: 'resolved',
    affectedServices: ['api-gateway', 'load-balancer'],
    tags: ['rate-limit', 'config-change', 'deployment'],
    detectedAt: '2026-03-25T10:05:00Z',
    resolvedAt: '2026-03-25T10:22:00Z',
    timeline: [
      { time: '10:02', event: 'Deploy: api-gateway v3.1.0 rolled out', type: 'action' },
      { time: '10:05', event: 'Alert: 429 response rate > 80%', type: 'alert' },
      { time: '10:12', event: 'Found: rate_limit: 10 (missing 3 zeros)', type: 'diagnosis' },
      { time: '10:15', event: 'Hotfix: Corrected rate limit to 10000', type: 'fix' },
      { time: '10:22', event: '429 rate back to normal < 0.1%', type: 'resolved' }
    ],
    rootCause: "Config merge conflict set rate_limit from 10000 to 10. Validation didn't catch it.",
    resolution: 'Fixed config. Added validation to reject rate limits below 100.',
    lessonsLearned: 'Add sanity-check validation for all config values. Config diff review before deploy.'
  },
  {
    id: 'INC-008',
    title: 'Message queue consumer deadlock',
    description: 'RabbitMQ consumers stuck in deadlock. Messages piling up causing delayed notifications.',
    severity: 'P2',
    status: 'resolved',
    affectedServices: ['message-queue', 'notification-service', 'payment-service'],
    tags: ['deadlock', 'connection-pool', 'memory-leak'],
    detectedAt: '2026-03-20T15:20:00Z',
    resolvedAt: '2026-03-20T16:40:00Z',
    timeline: [
      { time: '15:20', event: 'Alert: RabbitMQ queue depth > 50,000 messages', type: 'alert' },
      { time: '15:40', event: 'Thread dump: Consumer threads deadlocked on shared mutex', type: 'diagnosis' },
      { time: '16:10', event: 'Restarted consumers with fixed lock ordering', type: 'fix' },
      { time: '16:40', event: 'All queues drained. No message loss.', type: 'resolved' }
    ],
    rootCause: 'Consumer acquired DB lock then tried to publish (needing channel lock). Reverse order in another thread caused deadlock.',
    resolution: 'Fixed lock ordering. Separated DB transactions from message publishing.',
    lessonsLearned: 'Establish lock ordering conventions. Add deadlock detection health checks.'
  },
  {
    id: 'INC-009',
    title: 'Authentication service token validation failure',
    description: 'JWT token validation failing intermittently due to JWKS key rotation. ~30% of requests returning 401.',
    severity: 'P1',
    status: 'investigating',
    affectedServices: ['auth-service', 'api-gateway'],
    tags: ['ssl', 'api-key', 'config-change'],
    detectedAt: '2026-04-10T05:15:00Z',
    resolvedAt: null,
    timeline: [
      { time: '05:15', event: 'Alert: 401 error rate > 25%', type: 'alert' },
      { time: '05:20', event: 'Users reporting "session expired" on active sessions', type: 'alert' },
      { time: '05:28', event: 'JWKS endpoint returning new key ID', type: 'diagnosis' },
      { time: '05:35', event: 'Auth service caching old JWKS keys, TTL too long', type: 'diagnosis' },
      { time: '05:40', event: 'Investigating: Force refresh of JWKS cache', type: 'action' }
    ],
    rootCause: '',
    resolution: '',
    lessonsLearned: ''
  },
  {
    id: 'INC-010',
    title: 'CDN cache purge causing origin overload',
    description: 'Full CDN cache purge triggered accidentally causing 100% of traffic to hit origin servers.',
    severity: 'P2',
    status: 'detected',
    affectedServices: ['cdn', 'api-gateway', 'load-balancer'],
    tags: ['cdn', 'scaling', 'cpu-spike'],
    detectedAt: '2026-04-10T05:45:00Z',
    resolvedAt: null,
    timeline: [
      { time: '05:45', event: 'Alert: Origin server CPU > 95%', type: 'alert' },
      { time: '05:48', event: 'CDN cache hit ratio dropped from 94% to 0%', type: 'alert' },
      { time: '05:50', event: 'Investigating: Recent CDN configuration changes', type: 'action' }
    ],
    rootCause: '',
    resolution: '',
    lessonsLearned: ''
  }
];

export const mttrTrend = [
  { month: 'Oct', mttr: 58, incidents: 8 },
  { month: 'Nov', mttr: 52, incidents: 7 },
  { month: 'Dec', mttr: 45, incidents: 9 },
  { month: 'Jan', mttr: 41, incidents: 6 },
  { month: 'Feb', mttr: 35, incidents: 5 },
  { month: 'Mar', mttr: 28, incidents: 7 },
  { month: 'Apr', mttr: 22, incidents: 4 }
];

export const incidentsByService = [
  { name: 'api-gateway', count: 8, color: '#6366f1' },
  { name: 'user-service', count: 5, color: '#8b5cf6' },
  { name: 'payment-service', count: 4, color: '#a78bfa' },
  { name: 'redis-cache', count: 3, color: '#c4b5fd' },
  { name: 'database-primary', count: 6, color: '#818cf8' },
  { name: 'search-service', count: 3, color: '#6d73f5' }
];

export const rootCauseDistribution = [
  { name: 'Config Error', value: 28, color: '#ef4444' },
  { name: 'Code Bug', value: 24, color: '#f59e0b' },
  { name: 'Infrastructure', value: 20, color: '#3b82f6' },
  { name: 'Third Party', value: 15, color: '#8b5cf6' },
  { name: 'Capacity', value: 13, color: '#10b981' }
];
