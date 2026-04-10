import { useEffect, useState } from 'react';
import { usePulse } from '../context/PulseContext';
import hindsightMemory from '../services/hindsightMemory';

export function useWebhookIngestion() {
  const { dispatch, addIncident } = usePulse();
  const [webhookConnected, setWebhookConnected] = useState(false);

  useEffect(() => {
    const es = new EventSource('http://localhost:3001/events');

    es.onopen = () => {
      setWebhookConnected(true);
      console.log('[Pulse] Connected to automatic webhook ingestion stream');
    };

    es.onmessage = async (event) => {
      const incident = JSON.parse(event.data);

      try {
        // Trigger AI diagnosis immediately on ingestion
        const matchesQuery = `${incident.title} ${incident.affectedServices.join(' ')}`;
        const recallResults = await hindsightMemory.recallSimilar(matchesQuery);
        
        incident.aiDiagnosis = {
          matches: recallResults?.results || [],
          summary: `Auto-diagnosed via webhook ingestion. ${recallResults?.results?.length || 0} similar past incidents found.`
        };
      } catch (e) {
        console.warn('[Pulse] AI diagnosis skipped:', e.message);
      }

      // We use dispatch because addIncident completely overrides the ID and timeline,
      // and we want to preserve the webhook-generated ones.
      dispatch({ type: 'ADD_INCIDENT', payload: incident });
      console.log('[Pulse] Auto-ingested incident:', incident.title);
    };

    es.onerror = () => {
      setWebhookConnected(false);
      console.warn('[Pulse] Webhook server not reachable — manual mode active');
      es.close(); // Optional: stop trying to reconnect constantly if it's down, or let it retry. We'll let it retry.
      // Wait, let's close it here to avoid error spam if server isn't running
      // es.close(); 
    };

    return () => {
      es.close();
      setWebhookConnected(false);
    };
  }, [dispatch]);

  return { webhookConnected };
}
