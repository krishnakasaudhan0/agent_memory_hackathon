import { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { seedIncidents } from '../data/seedData';
import hindsightMemory from '../services/hindsightMemory';
import { db } from '../services/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useAuth } from './AuthContext';

const PulseContext = createContext();

// Load seed data or from localStorage
const loadInitialState = () => {
  const savedState = localStorage.getItem('pulse_state_final');
  if (savedState) {
    try {
      const parsed = JSON.parse(savedState);
      const allIncidents = [...(parsed.incidents || []), ...seedIncidents];
      const uniqueIncidents = Array.from(new Map(allIncidents.map(item => [item.id, item])).values());
      return {
        ...initialStateDefault,
        incidents: uniqueIncidents
      };
    } catch (e) {
      console.warn('Failed to parse local storage', e);
    }
  }
  return initialStateDefault;
};

const initialStateDefault = {
  incidents: seedIncidents,
  memoryInitialized: false,
  memoryLoading: false,
  cloudConnected: false,
  aiDiagnosis: {},
  notifications: [],
  memoryScore: 0,
  totalMemories: 0,
};

function pulseReducer(state, action) {
  switch (action.type) {
    case 'SET_INCIDENTS':
      return { ...state, incidents: action.payload };
    case 'ADD_INCIDENT':
      return { ...state, incidents: [action.payload, ...state.incidents] };
    case 'UPDATE_INCIDENT':
      return {
        ...state,
        incidents: state.incidents.map(i =>
          i.id === action.payload.id ? { ...i, ...action.payload } : i
        )
      };
    case 'SET_MEMORY_INITIALIZED':
      return { ...state, memoryInitialized: action.payload };
    case 'SET_CLOUD_CONNECTED':
      return { ...state, cloudConnected: action.payload };
    case 'SET_MEMORY_LOADING':
      return { ...state, memoryLoading: action.payload };
    case 'SET_AI_DIAGNOSIS':
      return {
        ...state,
        aiDiagnosis: { ...state.aiDiagnosis, [action.payload.incidentId]: action.payload.data }
      };
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [action.payload, ...state.notifications].slice(0, 20)
      };
    case 'SET_MEMORY_SCORE':
      return { ...state, memoryScore: action.payload };
    case 'SET_TOTAL_MEMORIES':
      return { ...state, totalMemories: action.payload };
    default:
      return state;
  }
}

export function PulseProvider({ children }) {
  const { user } = useAuth();
  const [state, dispatch] = useReducer(pulseReducer, loadInitialState()); // Restored localStorage loader

  // Sync to local storage to prevent data loss on refresh during testing/demo
  useEffect(() => {
    localStorage.setItem('pulse_state_final', JSON.stringify({ incidents: state.incidents }));
  }, [state.incidents]);

  // Load from Firebase when user logs in
  useEffect(() => {
    // Disabled for Demo to allow "Zero Data" state!
    // async function loadUserIncidents() {
    //   if (user) {
    //     try {
    //       const docRef = doc(db, 'users', user.uid);
    //       const docSnap = await getDoc(docRef);
    //       if (docSnap.exists() && docSnap.data().incidents) {
    //         dispatch({ type: 'SET_INCIDENTS', payload: docSnap.data().incidents });
    //       } else {
    //         await setDoc(docRef, { incidents: seedIncidents });
    //         dispatch({ type: 'SET_INCIDENTS', payload: seedIncidents });
    //       }
    //     } catch (error) { console.error("Error loading incidents from Firebase", error); }
    //   }
    // }
    // loadUserIncidents();
  }, [user]);

  // Sync incidents to Firebase whenever they change
  useEffect(() => {
    // Disabled for Demo to allow "Zero Data" state
    // if (user && state.incidents.length > 0) {
    //   setDoc(doc(db, 'users', user.uid), { incidents: state.incidents }, { merge: true })
    // }
  }, [state.incidents, user]);

  // Initialize Hindsight memory on mount
  useEffect(() => {
    async function init() {
      dispatch({ type: 'SET_MEMORY_LOADING', payload: true });
      try {
        await hindsightMemory.initialize();
        // Retain only resolved incidents that haven't been retained yet
        const resolved = state.incidents.filter(i => i.status === 'resolved');
        
        // Run retention in the background so it doesn't block UI loading for 5+ seconds!
        hindsightMemory.retainAllIncidents(resolved).catch(console.error);
        
        dispatch({ type: 'SET_MEMORY_INITIALIZED', payload: true });
        dispatch({ type: 'SET_CLOUD_CONNECTED', payload: hindsightMemory.cloudAvailable });
        dispatch({ type: 'SET_MEMORY_SCORE', payload: Math.min(resolved.length * 12, 87) });
        dispatch({ type: 'SET_TOTAL_MEMORIES', payload: resolved.length });
        dispatch({
          type: 'ADD_NOTIFICATION',
          payload: {
            id: Date.now(),
            type: 'success',
            message: `AI memory loaded: ${resolved.length} incidents retained`,
            time: new Date().toISOString()
          }
        });
      } catch (err) {
        console.error('Memory init error:', err);
      }
      dispatch({ type: 'SET_MEMORY_LOADING', payload: false });
    }
    init();
  }, []);

  const diagnoseIncident = useCallback(async (incident) => {
    dispatch({ type: 'SET_MEMORY_LOADING', payload: true });
    try {
      const diagnosis = await hindsightMemory.diagnoseIncident(incident);
      dispatch({
        type: 'SET_AI_DIAGNOSIS',
        payload: { incidentId: incident.id, data: diagnosis }
      });
      return diagnosis;
    } catch (err) {
      console.error('Diagnosis error:', err);
      return null;
    } finally {
      dispatch({ type: 'SET_MEMORY_LOADING', payload: false });
    }
  }, []);

  const retainIncident = useCallback(async (incident) => {
    try {
      await hindsightMemory.retainIncident(incident);
      dispatch({
        type: 'SET_MEMORY_SCORE',
        payload: Math.min(state.memoryScore + 8, 95)
      });
      dispatch({
        type: 'SET_TOTAL_MEMORIES',
        payload: state.totalMemories + 1
      });
    } catch (err) {
      console.error('Retain error:', err);
    }
  }, [state.memoryScore, state.totalMemories]);

  const addIncident = useCallback((incident) => {
    const newIncident = {
      ...incident,
      id: `INC-${String(state.incidents.length + 1).padStart(3, '0')}`,
      status: 'detected',
      detectedAt: new Date().toISOString(),
      resolvedAt: null,
      timeline: [
        {
          time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
          event: 'Incident detected and reported',
          type: 'alert'
        }
      ]
    };
    dispatch({ type: 'ADD_INCIDENT', payload: newIncident });
    // Auto-diagnose
    diagnoseIncident(newIncident);
    return newIncident;
  }, [state.incidents.length, diagnoseIncident]);

  const updateIncident = useCallback((updates) => {
    dispatch({ type: 'UPDATE_INCIDENT', payload: updates });
    // If resolved, retain in memory
    if (updates.status === 'resolved') {
      const incident = state.incidents.find(i => i.id === updates.id);
      if (incident) {
        retainIncident({ ...incident, ...updates });
      }
    }
  }, [state.incidents, retainIncident]);

  const reflectOnQuery = useCallback(async (query) => {
    try {
      return await hindsightMemory.reflect(query);
    } catch (err) {
      console.error('Reflect error:', err);
      return { text: 'Unable to reflect at this time.' };
    }
  }, []);

  const value = {
    ...state,
    dispatch,
    addIncident,
    updateIncident,
    diagnoseIncident,
    retainIncident,
    reflectOnQuery
  };

  return <PulseContext.Provider value={value}>{children}</PulseContext.Provider>;
}

export function usePulse() {
  const context = useContext(PulseContext);
  if (!context) throw new Error('usePulse must be used within PulseProvider');
  return context;
}
