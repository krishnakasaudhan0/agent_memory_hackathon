// Pulse — Hindsight Memory Service
// Integrates with Hindsight Cloud for persistent incident memory

const HINDSIGHT_BASE_URL = '/api/hindsight';
const API_KEY = 'hsk_11dec262213123be799162b72fb93d3e_11b1e1fe608a73b5';
const BANK_ID = 'pulse-incidents';

class HindsightMemory {
  constructor() {
    this.baseUrl = HINDSIGHT_BASE_URL;
    this.headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`
    };
    this.initialized = false;
    this.cloudAvailable = false;
    this.localMemories = [];
  }

  async initialize() {
    if (this.initialized) return;

    // Test cloud connectivity
    try {
      const res = await fetch(`${this.baseUrl}/version`, {
        headers: this.headers,
        signal: AbortSignal.timeout(8000)
      });
      if (res.ok) {
        this.cloudAvailable = true;
        console.log('[Pulse AI] ✅ Hindsight Cloud connected!');
      }
    } catch (err) {
      console.warn('[Pulse AI] Cloud unreachable, using local fallback');
      this.cloudAvailable = false;
    }

    this.initialized = true;
    console.log(`[Pulse AI] Memory engine: ${this.cloudAvailable ? '☁️ Hindsight Cloud' : '💾 Local'}`);
  }

  // ──────────────── RETAIN ────────────────
  async retainIncident(incident) {
    const content = this._formatIncidentForMemory(incident);

    // Store locally always
    this.localMemories.push({
      id: incident.id, content, incident,
      tags: incident.tags, services: incident.affectedServices,
      timestamp: new Date().toISOString()
    });

    // Cloud retain
    if (this.cloudAvailable) {
      try {
        const res = await fetch(`${this.baseUrl}/v1/default/banks/${BANK_ID}/memories`, {
          method: 'POST',
          headers: this.headers,
          body: JSON.stringify({
            items: [{ content }]
          })
        });
        if (res.ok) {
          const data = await res.json();
          console.log(`[Pulse AI] ☁️ Retained ${incident.id} (${data.usage?.total_tokens || 0} tokens)`);
          return data;
        }
      } catch (err) {
        console.warn(`[Pulse AI] Cloud retain failed for ${incident.id}:`, err.message);
      }
    }

    console.log(`[Pulse AI] 💾 Retained ${incident.id} locally (${this.localMemories.length} total)`);
    return null;
  }

  // ──────────────── RECALL ────────────────
  async recallSimilar(query) {
    if (this.cloudAvailable) {
      try {
        const res = await fetch(`${this.baseUrl}/v1/default/banks/${BANK_ID}/memories/recall`, {
          method: 'POST',
          headers: this.headers,
          body: JSON.stringify({ query })
        });
        if (res.ok) {
          const data = await res.json();
          console.log(`[Pulse AI] ☁️ Recalled ${data.results?.length || 0} memories`);
          return data;
        }
      } catch (err) {
        console.warn('[Pulse AI] Cloud recall failed:', err.message);
      }
    }
    return this._localRecall(query);
  }

  // ──────────────── REFLECT ────────────────
  async reflect(query) {
    if (this.cloudAvailable) {
      try {
        const res = await fetch(`${this.baseUrl}/v1/default/banks/${BANK_ID}/reflect`, {
          method: 'POST',
          headers: this.headers,
          body: JSON.stringify({ query })
        });
        if (res.ok) {
          const data = await res.json();
          console.log('[Pulse AI] ☁️ Reflection complete');
          return data;
        }
      } catch (err) {
        console.warn('[Pulse AI] Cloud reflect failed:', err.message);
      }
    }
    return this._localReflect(query);
  }

  // ──────────────── DIAGNOSE ────────────────
  async diagnoseIncident(incident) {
    const query = `New production incident: "${incident.title}". ${incident.description}. Affected services: ${incident.affectedServices.join(', ')}. Tags: ${incident.tags.join(', ')}. What similar incidents have we seen? What was the root cause? What fix worked?`;

    const [recallResults, reflection] = await Promise.all([
      this.recallSimilar(query),
      this.reflect(query)
    ]);

    return {
      similarIncidents: recallResults.results || [],
      aiAnalysis: reflection.text || '',
      evidence: reflection.based_on?.memories || recallResults.results || [],
      confidence: this._calculateConfidence(recallResults.results || []),
      source: this.cloudAvailable ? 'hindsight-cloud' : 'local'
    };
  }

  // ──────────────── BATCH RETAIN ────────────────
  async retainAllIncidents(incidents) {
    const resolved = incidents.filter(i => i.status === 'resolved');
    console.log(`[Pulse AI] Retaining ${resolved.length} resolved incidents...`);

    for (const incident of resolved) {
      await this.retainIncident(incident);
      // Small delay to respect rate limits
      if (this.cloudAvailable) {
        await new Promise(r => setTimeout(r, 500));
      }
    }

    console.log(`[Pulse AI] ✅ All ${resolved.length} incidents retained`);
    return resolved.length;
  }

  // ──────────────── LOCAL FALLBACK ────────────────
  _localRecall(query) {
    const queryTokens = this._tokenize(query);
    const scored = this.localMemories.map(mem => {
      const memTokens = this._tokenize(mem.content);
      const score = this._cosineSimilarity(queryTokens, memTokens);
      const tagBonus = mem.tags.some(t => query.toLowerCase().includes(t)) ? 0.15 : 0;
      const serviceBonus = mem.services.some(s => query.toLowerCase().includes(s)) ? 0.1 : 0;
      return { ...mem, score: score + tagBonus + serviceBonus };
    });
    scored.sort((a, b) => b.score - a.score);
    return {
      results: scored.filter(s => s.score > 0.05).slice(0, 5).map(r => ({
        id: r.id, text: r.content.substring(0, 500),
        type: 'world', score: r.score, incident: r.incident
      }))
    };
  }

  _localReflect(query) {
    const recall = this._localRecall(query);
    const results = recall.results || [];
    if (results.length === 0) {
      return { text: 'No similar incidents found in memory yet. As more incidents are resolved, the analysis will improve.', based_on: { memories: [] } };
    }

    const topIncidents = results.slice(0, 3).map(r => r.incident).filter(Boolean);
    let analysis = `Based on **${this.localMemories.length} incidents** in memory:\n\n`;
    topIncidents.forEach((inc, i) => {
      analysis += `**${i + 1}. ${inc.title}** (${Math.round(results[i].score * 100)}% match)\n`;
      if (inc.rootCause) analysis += `→ Root Cause: ${inc.rootCause}\n`;
      if (inc.resolution) analysis += `→ Fix: ${inc.resolution}\n`;
      if (inc.lessonsLearned) analysis += `→ Lesson: ${inc.lessonsLearned}\n\n`;
    });

    return { text: analysis, based_on: { memories: results } };
  }

  // ──────────────── UTILS ────────────────
  _formatIncidentForMemory(incident) {
    const duration = incident.resolvedAt && incident.detectedAt
      ? Math.round((new Date(incident.resolvedAt) - new Date(incident.detectedAt)) / 60000)
      : 'unknown';
    return `INCIDENT ${incident.id}: ${incident.title}
Severity: ${incident.severity} | Status: ${incident.status}
Services: ${incident.affectedServices.join(', ')}
Tags: ${incident.tags.join(', ')}
Duration: ${duration} minutes
Description: ${incident.description}
Timeline: ${incident.timeline.map(t => `[${t.time}] ${t.event}`).join(' | ')}
Root Cause: ${incident.rootCause || 'Not identified'}
Resolution: ${incident.resolution || 'Not resolved'}
Lessons: ${incident.lessonsLearned || 'Pending'}`;
  }

  _tokenize(text) {
    const stops = new Set(['the', 'a', 'an', 'is', 'are', 'was', 'were', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'and', 'or', 'not', 'that', 'this', 'it', 'as', 'be', 'has', 'had']);
    const words = text.toLowerCase().replace(/[^a-z0-9\s-]/g, '').split(/\s+/).filter(w => w.length > 2 && !stops.has(w));
    const freq = {};
    words.forEach(w => { freq[w] = (freq[w] || 0) + 1; });
    return freq;
  }

  _cosineSimilarity(a, b) {
    const allKeys = new Set([...Object.keys(a), ...Object.keys(b)]);
    let dot = 0, magA = 0, magB = 0;
    for (const key of allKeys) {
      const va = a[key] || 0, vb = b[key] || 0;
      dot += va * vb; magA += va * va; magB += vb * vb;
    }
    const mag = Math.sqrt(magA) * Math.sqrt(magB);
    return mag === 0 ? 0 : dot / mag;
  }

  _calculateConfidence(results) {
    if (!results || results.length === 0) return 12;
    const base = Math.min(results.length * 12, 60);
    return Math.min(base + 28, 94);
  }
}

export const hindsightMemory = new HindsightMemory();
export default hindsightMemory;
