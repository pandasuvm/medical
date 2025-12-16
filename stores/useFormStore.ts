import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { FormData, CalculatedValues } from '../schemas/formSchemas';
import { ClinicalAlert, ProtocolActivation, generateClinicalAlerts, getActivatedProtocols } from '../utils/clinicalAlerts';
import {
  calcBMI,
  calcShockIndex,
  calcModifiedShockIndex,
  calcMeanArterialPressure,
  calcPulsePressure,
  calcTotalGCS,
  calcLeonScore,
  calcComorbidityBurden,
  normalizeVitalSigns
} from '../utils/autoCalculations';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

export interface FormState {
  // Form data
  data: Partial<FormData>;

  // Calculated values
  calculatedValues: CalculatedValues;

  // Clinical alerts and protocols
  alerts: ClinicalAlert[];
  activeProtocols: ProtocolActivation[];

  // Form state
  currentPhase: string;
  isComplete: boolean;
  isDraft: boolean;
  draftId: number | null;
  currentHospitalNo: string | null;

  // Timer state for post-intubation monitoring
  timerActive: boolean;
  timerStartTime: number | null;
  elapsedTime: number;

  // Monitoring intervals
  nextMonitoringDue: string | null;
  completedIntervals: string[];
  completedPhases: string[];
  // Track last computed alert IDs to only surface newly introduced alerts per change
  lastComputedAlertIds?: string[];

  // Actions
  setData: (data: Partial<FormData>) => void;
  updateField: (path: string, value: any) => void;
  setCurrentPhase: (phase: string) => void;
  startTimer: () => void;
  stopTimer: () => void;
  updateElapsedTime: () => void;
  addAlert: (alert: ClinicalAlert) => void;
  dismissAlert: (alertId: string) => void;
  clearAllAlerts: () => void;
  clearStaleAlerts: () => void;
  activateProtocol: (protocol: ProtocolActivation) => void;
  completeMonitoringInterval: (interval: string) => void;
  markPhaseComplete: (phase: string) => void;
  calculateValues: () => void;
  createDraft: () => Promise<number | null>;
  saveDraft: () => Promise<void>;
  loadDraft: (draftId?: number, hospitalNo?: string) => Promise<void>;
  clearForm: () => void;
}

const initialState = {
  data: {},
  calculatedValues: {},
  alerts: [],
  activeProtocols: [],
  currentPhase: 'demographics',
  isComplete: false,
  isDraft: false,
  draftId: null,
  currentHospitalNo: null,
  timerActive: false,
  timerStartTime: null,
  elapsedTime: 0,
  nextMonitoringDue: null,
  completedIntervals: [],
  completedPhases: [],
  lastComputedAlertIds: []
};

export const useFormStore = create<FormState>()(
  subscribeWithSelector((set, get) => ({
    ...initialState,

    setData: (newData) => {
      set((state) => {
        const updatedData = { ...state.data, ...newData };
        const calculatedValues = calculateAllValues(updatedData);

        // Update currentHospitalNo if hospital number is in the data
        const formData = updatedData as any;
        const hospitalNo = formData?.demographics?.hospitalNo || state.currentHospitalNo;

        // Compute alerts from current data only
        const computedAlerts = generateClinicalAlerts(updatedData as FormData);
        const prevIds = state.lastComputedAlertIds ?? [];
        const persistentAlerts = state.alerts.filter(a => a.id.startsWith('monitoring-'));
        // Only surface newly introduced alerts (delta)
        const deltaAlerts = computedAlerts.filter(a => !prevIds.includes(a.id)).map(a => ({ ...a, timestamp: new Date().toISOString() }));
        const alerts = [...persistentAlerts, ...deltaAlerts];
        const activeProtocols = getActivatedProtocols(updatedData as FormData);

        return {
          data: updatedData,
          calculatedValues,
          alerts,
          activeProtocols,
          lastComputedAlertIds: computedAlerts.map(a => a.id),
          isDraft: true,
          currentHospitalNo: hospitalNo || state.currentHospitalNo
        };
      });
    },

    updateField: (path, value) => {
      set((state) => {
        const newData = { ...state.data };
        setNestedValue(newData, path, value);

        // Update currentHospitalNo if hospital number field is updated
        const formData = newData as any;
        const hospitalNo = formData?.demographics?.hospitalNo || state.currentHospitalNo;

        const calculatedValues = calculateAllValues(newData);
        const computedAlerts = generateClinicalAlerts(newData as FormData);
        const prevIds = state.lastComputedAlertIds ?? [];
        const persistentAlerts = state.alerts.filter(a => a.id.startsWith('monitoring-'));
        const deltaAlerts = computedAlerts.filter(a => !prevIds.includes(a.id)).map(a => ({ ...a, timestamp: new Date().toISOString() }));
        const alerts = [...persistentAlerts, ...deltaAlerts];
        const activeProtocols = getActivatedProtocols(newData as FormData);

        return {
          data: newData,
          calculatedValues,
          alerts,
          activeProtocols,
          lastComputedAlertIds: computedAlerts.map(a => a.id),
          isDraft: true,
          currentHospitalNo: hospitalNo || state.currentHospitalNo
        };
      });
    },

    setCurrentPhase: (phase) => {
      set((state) => {
        // Clear phase-specific alerts when changing phases
        const filteredAlerts = state.alerts.filter(alert => 
          alert.level === 'critical' || // Keep critical alerts
          !alert.category || // Keep alerts without category
          alert.category === 'hemodynamic' // Keep hemodynamic alerts as they're always relevant
        );
        
        return {
          currentPhase: phase,
          alerts: filteredAlerts
        };
      });

      // Auto-activate monitoring reminders when entering monitoring phase
      if (phase === 'monitoring' && !get().timerActive) {
        get().startTimer();
      }
    },

    startTimer: () => {
      const startTime = Date.now();
      set({
        timerActive: true,
        timerStartTime: startTime,
        nextMonitoringDue: 'post_5min'
      });

      // Set up monitoring interval reminders
      setTimeout(() => {
        const state = get();
        if (state.timerActive && !state.completedIntervals.includes('post_5min')) {
          get().addAlert({
            id: 'monitoring-5min-due',
            level: 'warning',
            title: '5-Minute Assessment Due',
            message: 'Post-intubation 5-minute monitoring required',
            triggers: ['timer_5min'],
            category: 'procedural',
            timestamp: new Date().toISOString()
          });
        }
      }, 5 * 60 * 1000); // 5 minutes

      setTimeout(() => {
        const state = get();
        if (state.timerActive && !state.completedIntervals.includes('post_10min')) {
          set({ nextMonitoringDue: 'post_10min' });
          get().addAlert({
            id: 'monitoring-10min-due',
            level: 'warning',
            title: '10-Minute Assessment Due',
            message: 'Post-intubation 10-minute monitoring required',
            triggers: ['timer_10min'],
            category: 'procedural',
            timestamp: new Date().toISOString()
          });
        }
      }, 10 * 60 * 1000); // 10 minutes

      setTimeout(() => {
        const state = get();
        if (state.timerActive && !state.completedIntervals.includes('post_15min')) {
          set({ nextMonitoringDue: 'post_15min' });
          get().addAlert({
            id: 'monitoring-15min-due',
            level: 'warning',
            title: '15-Minute Assessment Due',
            message: 'Post-intubation 15-minute monitoring required',
            triggers: ['timer_15min'],
            category: 'procedural',
            timestamp: new Date().toISOString()
          });
        }
      }, 15 * 60 * 1000); // 15 minutes

      setTimeout(() => {
        const state = get();
        if (state.timerActive && !state.completedIntervals.includes('post_30min')) {
          set({ nextMonitoringDue: 'post_30min' });
          get().addAlert({
            id: 'monitoring-30min-due',
            level: 'info',
            title: '30-Minute Assessment Due',
            message: 'Final post-intubation monitoring interval',
            triggers: ['timer_30min'],
            category: 'procedural',
            timestamp: new Date().toISOString()
          });
        }
      }, 30 * 60 * 1000); // 30 minutes
    },

    stopTimer: () => {
      set({
        timerActive: false,
        timerStartTime: null,
        nextMonitoringDue: null
      });
    },

    updateElapsedTime: () => {
      const state = get();
      if (state.timerActive && state.timerStartTime) {
        const elapsed = Math.floor((Date.now() - state.timerStartTime) / 1000);
        set({ elapsedTime: elapsed });
      }
    },

    addAlert: (alert) => {
      set((state) => {
        // Check if alert with same ID already exists
        const existingIndex = state.alerts.findIndex(existing => existing.id === alert.id);
        
        if (existingIndex !== -1) {
          // Update existing alert
          const updatedAlerts = [...state.alerts];
          updatedAlerts[existingIndex] = { ...alert, timestamp: new Date().toISOString() };
          return { alerts: updatedAlerts };
        } else {
          // Add new alert with timestamp
          return {
            alerts: [...state.alerts, { ...alert, timestamp: new Date().toISOString() }]
          };
        }
      });

      // Auto-dismiss after 4 seconds for non-critical alerts
      if (alert.level !== 'critical') {
        setTimeout(() => {
          get().dismissAlert(alert.id);
        }, 3000); // Auto-dismiss after 4 seconds
      }
    },

    dismissAlert: (alertId) => {
      set((state) => ({
        alerts: state.alerts.filter(alert => alert.id !== alertId)
      }));
    },

    clearAllAlerts: () => {
      set({ alerts: [] });
    },

    clearStaleAlerts: () => {
      set((state) => {
        const now = Date.now();
        const fiveMinutesAgo = now - 5 * 60 * 1000; // 5 minutes
        
        const freshAlerts = state.alerts.filter(alert => {
          const alertTime = new Date(alert.timestamp || 0).getTime();
          return alertTime > fiveMinutesAgo || alert.level === 'critical';
        });
        
        return { alerts: freshAlerts };
      });
    },

    activateProtocol: (protocol) => {
      set((state) => ({
        activeProtocols: [...state.activeProtocols, protocol]
      }));
    },

    completeMonitoringInterval: (interval) => {
      set((state) => {
        const updatedIntervals = [...state.completedIntervals, interval];
        let nextDue = null;

        // Determine next monitoring interval
        if (interval === 'post_5min') nextDue = 'post_10min';
        else if (interval === 'post_10min') nextDue = 'post_15min';
        else if (interval === 'post_15min') nextDue = 'post_30min';

        return {
          completedIntervals: updatedIntervals,
          nextMonitoringDue: nextDue
        };
      });
    },

    markPhaseComplete: (phase) => {
      set((state) => {
        if (!state.completedPhases.includes(phase)) {
          return {
            completedPhases: [...state.completedPhases, phase]
          };
        }
        return state;
      });
    },

    calculateValues: () => {
      set((state) => ({
        calculatedValues: calculateAllValues(state.data)
      }));
    },

    createDraft: async () => {
      const state = get();
      try {
        const authRaw = typeof window !== 'undefined' ? localStorage.getItem('medical_auth') : null;
        const auth = authRaw ? JSON.parse(authRaw) : null;
        const token = auth?.token as string | undefined;

        if (!token) return null;

        const res = await fetch(`${API_BASE_URL}/api/draft`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            form: state.data || {},
            currentPhase: state.currentPhase || 'demographics'
          })
        });

        if (res.ok) {
          const result = await res.json();
          const newDraftId = result.id;
          set({ draftId: newDraftId, isDraft: false });
          
          // Update URL with draft ID
          if (typeof window !== 'undefined') {
            const url = new URL(window.location.href);
            url.searchParams.set('draftId', newDraftId.toString());
            window.history.replaceState({}, '', url.toString());
          }
          
          return newDraftId;
        }
        return null;
      } catch (e) {
        console.error('Failed to create draft', e);
        return null;
      }
    },

    saveDraft: async () => {
      // Get fresh state to ensure we have the latest data
      const state = get();
      try {
        const authRaw = typeof window !== 'undefined' ? localStorage.getItem('medical_auth') : null;
        const auth = authRaw ? JSON.parse(authRaw) : null;
        const token = auth?.token as string | undefined;

        if (!token) return;

        // Extract hospital number from form data (can be null initially)
        const formData = state.data as any;
        const hospitalNo = state.currentHospitalNo || formData?.demographics?.hospitalNo || null;

        // If no draft ID exists, create one first
        let draftId = state.draftId;
        if (!draftId) {
          draftId = await get().createDraft();
          if (!draftId) {
            console.warn('Failed to create draft');
            return;
          }
        }

        // Always save, even if formData appears empty (it might have default values)
        // The backend will handle empty forms correctly
        const dataToSave = formData || {};

        const res = await fetch(`${API_BASE_URL}/api/draft`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            form: dataToSave,
            currentPhase: state.currentPhase,
            hospitalNo: hospitalNo,
            draftId: draftId || null
          })
        });

        if (res.ok) {
          const result = await res.json();
          set({ 
            draftId: result.id || draftId,
            currentHospitalNo: result.hospitalNo || hospitalNo,
            isDraft: false 
          });
          
          // Update URL with draft ID if not already there
          if (typeof window !== 'undefined' && draftId) {
            const url = new URL(window.location.href);
            if (!url.searchParams.has('draftId')) {
              url.searchParams.set('draftId', draftId.toString());
              window.history.replaceState({}, '', url.toString());
            }
          }
        }

        // Also keep a local copy as a fallback (keyed by draft ID)
        if (typeof window !== 'undefined' && draftId) {
          localStorage.setItem(`mear-form-draft-${draftId}`, JSON.stringify({
            data: state.data,
            currentPhase: state.currentPhase,
            timestamp: Date.now(),
            draftId: draftId,
            hospitalNo: hospitalNo
          }));
        }
      } catch (e) {
        console.error('Failed to save draft to backend', e);
      } finally {
        set({ isDraft: false });
      }
    },

    loadDraft: async (draftId?: number, hospitalNo?: string) => {
      let loadedFromBackend = false;
      const state = get();
      
      // Try to determine draft ID from multiple sources
      let targetDraftId = draftId || state.draftId;
      
      // If no draft ID, try to get from URL
      if (!targetDraftId && typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        const urlDraftId = urlParams.get('draftId');
        if (urlDraftId) {
          const parsedId = Number(urlDraftId);
          if (!isNaN(parsedId)) {
            targetDraftId = parsedId;
          }
        }
      }
      
      // If still no draft ID, try localStorage
      if (!targetDraftId && typeof window !== 'undefined') {
        // Check all localStorage keys for drafts
        const draftKeys = Object.keys(localStorage).filter(key => key.startsWith('mear-form-draft-'));
        if (draftKeys.length > 0) {
          // Try to get the most recent draft
          let latestDraft = null;
          let latestTime = 0;
          for (const key of draftKeys) {
            try {
              const draft = JSON.parse(localStorage.getItem(key) || '{}');
              if (draft.timestamp && draft.timestamp > latestTime) {
                latestTime = draft.timestamp;
                latestDraft = draft;
                targetDraftId = draft.draftId || (key.match(/\d+/) ? Number(key.match(/\d+/)![0]) : null);
              }
            } catch (e) {
              // Skip invalid entries
            }
          }
        }
      }
      
      try {
        const authRaw = typeof window !== 'undefined' ? localStorage.getItem('medical_auth') : null;
        const auth = authRaw ? JSON.parse(authRaw) : null;
        const token = auth?.token as string | undefined;

        if (token && targetDraftId) {
          const res = await fetch(`${API_BASE_URL}/api/draft?draftId=${targetDraftId}`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });

          if (res.status === 200) {
            const draft = await res.json();
            set({
              data: draft.form || {},
              currentPhase: draft.currentPhase || 'demographics',
              calculatedValues: calculateAllValues(draft.form || {}),
              alerts: [],
              isDraft: false,
              draftId: draft.id || targetDraftId,
              currentHospitalNo: draft.hospitalNo || null
            });
            loadedFromBackend = true;
            return; // Successfully loaded, exit early
          }
        } else if (token && hospitalNo) {
          // Fallback to hospital number if draft ID not available
          const res = await fetch(`${API_BASE_URL}/api/draft?hospitalNo=${encodeURIComponent(hospitalNo)}`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });

          if (res.status === 200) {
            const draft = await res.json();
            set({
              data: draft.form || {},
              currentPhase: draft.currentPhase || 'demographics',
              calculatedValues: calculateAllValues(draft.form || {}),
              alerts: [],
              isDraft: false,
              draftId: draft.id || null,
              currentHospitalNo: draft.hospitalNo || hospitalNo
            });
            loadedFromBackend = true;
            return;
          }
        }
      } catch (e) {
        console.error('Failed to load draft from backend', e);
      }

      if (!loadedFromBackend && typeof window !== 'undefined') {
        // Try to load from localStorage
        const storageKey = targetDraftId ? `mear-form-draft-${targetDraftId}` : 'mear-form-draft';
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          try {
            const draft = JSON.parse(saved);
            set({
              data: draft.data || {},
              currentPhase: draft.currentPhase || 'demographics',
              calculatedValues: calculateAllValues(draft.data || {}),
              alerts: [],
              isDraft: false,
              draftId: draft.draftId || targetDraftId || null,
              currentHospitalNo: draft.hospitalNo || null
            });
          } catch (e) {
            console.error('Failed to parse localStorage draft', e);
            get().clearStaleAlerts();
          }
        } else {
          get().clearStaleAlerts();
        }
      }
    },

    clearForm: () => {
      const state = get();
      // Clear localStorage for current hospital number if exists
      if (state.currentHospitalNo) {
        localStorage.removeItem(`mear-form-draft-${state.currentHospitalNo}`);
      }
      localStorage.removeItem('mear-form-draft'); // Fallback
      set({
        ...initialState,
        alerts: [] // Explicitly clear alerts
      });
    }
  }))
);

// Helper function to calculate all derived values
function calculateAllValues(data: Partial<FormData>): CalculatedValues {
  const calculated: CalculatedValues = {};

  // BMI calculation
  if (data.demographics?.weight && data.demographics?.height) {
    const weightNum = parseFloat((data.demographics.weight as any).toString());
    const heightNum = parseFloat((data.demographics.height as any).toString());
    const bmiResult = !isNaN(weightNum) && !isNaN(heightNum) ? calcBMI(weightNum, heightNum) : null;
    if (bmiResult !== null) {
      calculated.bmi = bmiResult;
    }
  }

  // Vital signs calculations
  if (data.preInductionVitals) {
    const vitals = data.preInductionVitals;
    const norm = normalizeVitalSigns(vitals as any);

    if (norm.heartRate && norm.systolicBP) {
      const shockResult = calcShockIndex(norm.heartRate, norm.systolicBP);
      if (shockResult !== null) {
        calculated.shockIndex = shockResult;
      }
    }

    if (norm.systolicBP && norm.diastolicBP) {
      const mapResult = calcMeanArterialPressure(norm.systolicBP, norm.diastolicBP);
      const ppResult = calcPulsePressure(norm.systolicBP, norm.diastolicBP);
      if (mapResult !== null) {
        calculated.meanArterialPressure = mapResult;
      }
      if (ppResult !== null) {
        calculated.pulsePressure = ppResult;
      }
    }

    if (calculated.meanArterialPressure && norm.heartRate) {
      const modShockResult = calcModifiedShockIndex(norm.heartRate, calculated.meanArterialPressure);
      if (modShockResult !== null) {
        calculated.modifiedShockIndex = modShockResult;
      }
    }
  }

  // GCS calculation
  if (data.gcs) {
    const gcsResult = calcTotalGCS(data.gcs);
    if (gcsResult !== null) {
      calculated.totalGCS = gcsResult;
    }
  }

  // LEON score calculation
  if (data.leonScore) {
    const leonResult = calcLeonScore(data.leonScore);
    if (leonResult !== null) {
      calculated.leonTotalScore = leonResult;
    }
  }

  // Comorbidity burden
  if (data.comorbidities) {
    const comorbidityResult = calcComorbidityBurden(data.comorbidities);
    if (comorbidityResult !== null) {
      calculated.comorbidityBurden = comorbidityResult;
    }
  }

  return calculated;
}

// Helper function to set nested object values
function setNestedValue(obj: any, path: string, value: any) {
  const keys = path.split('.');
  let current = obj;

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (!(key in current) || typeof current[key] !== 'object') {
      current[key] = {};
    }
    current = current[key];
  }

  current[keys[keys.length - 1]] = value;
}

// Auto-save functionality and periodic cleanup
if (typeof window !== 'undefined') {
  setInterval(() => {
    const state = useFormStore.getState();
    if (state.isDraft) {
      state.saveDraft();
    }
  }, 30000); // Auto-save every 30 seconds

  // Periodic cleanup of stale alerts
  setInterval(() => {
    const state = useFormStore.getState();
    state.clearStaleAlerts();
  }, 60000); // Clean up every minute
}
