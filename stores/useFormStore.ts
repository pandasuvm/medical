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
  calcComorbidityBurden
} from '../utils/autoCalculations';

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

  // Timer state for post-intubation monitoring
  timerActive: boolean;
  timerStartTime: number | null;
  elapsedTime: number;

  // Monitoring intervals
  nextMonitoringDue: string | null;
  completedIntervals: string[];

  // Actions
  setData: (data: Partial<FormData>) => void;
  updateField: (path: string, value: any) => void;
  setCurrentPhase: (phase: string) => void;
  startTimer: () => void;
  stopTimer: () => void;
  updateElapsedTime: () => void;
  addAlert: (alert: ClinicalAlert) => void;
  dismissAlert: (alertId: string) => void;
  activateProtocol: (protocol: ProtocolActivation) => void;
  completeMonitoringInterval: (interval: string) => void;
  calculateValues: () => void;
  saveDraft: () => void;
  loadDraft: () => void;
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
  timerActive: false,
  timerStartTime: null,
  elapsedTime: 0,
  nextMonitoringDue: null,
  completedIntervals: []
};

export const useFormStore = create<FormState>()(
  subscribeWithSelector((set, get) => ({
    ...initialState,

    setData: (newData) => {
      set((state) => {
        const updatedData = { ...state.data, ...newData };
        const calculatedValues = calculateAllValues(updatedData);
        const alerts = generateClinicalAlerts(updatedData as FormData);
        const activeProtocols = getActivatedProtocols(updatedData as FormData);

        return {
          data: updatedData,
          calculatedValues,
          alerts,
          activeProtocols,
          isDraft: true
        };
      });
    },

    updateField: (path, value) => {
      set((state) => {
        const newData = { ...state.data };
        setNestedValue(newData, path, value);

        const calculatedValues = calculateAllValues(newData);
        const alerts = generateClinicalAlerts(newData as FormData);
        const activeProtocols = getActivatedProtocols(newData as FormData);

        return {
          data: newData,
          calculatedValues,
          alerts,
          activeProtocols,
          isDraft: true
        };
      });
    },

    setCurrentPhase: (phase) => {
      set({ currentPhase: phase });

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
      set((state) => ({
        alerts: [...state.alerts, alert]
      }));
    },

    dismissAlert: (alertId) => {
      set((state) => ({
        alerts: state.alerts.filter(alert => alert.id !== alertId)
      }));
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

    calculateValues: () => {
      set((state) => ({
        calculatedValues: calculateAllValues(state.data)
      }));
    },

    saveDraft: () => {
      const state = get();
      localStorage.setItem('mear-form-draft', JSON.stringify({
        data: state.data,
        currentPhase: state.currentPhase,
        timestamp: Date.now()
      }));
      set({ isDraft: false });
    },

    loadDraft: () => {
      const saved = localStorage.getItem('mear-form-draft');
      if (saved) {
        const draft = JSON.parse(saved);
        set({
          data: draft.data,
          currentPhase: draft.currentPhase,
          calculatedValues: calculateAllValues(draft.data),
          isDraft: false
        });
      }
    },

    clearForm: () => {
      localStorage.removeItem('mear-form-draft');
      set(initialState);
    }
  }))
);

// Helper function to calculate all derived values
function calculateAllValues(data: Partial<FormData>): CalculatedValues {
  const calculated: CalculatedValues = {};

  // BMI calculation
  if (data.demographics?.weight && data.demographics?.height) {
    calculated.bmi = calcBMI(data.demographics.weight, data.demographics.height);
  }

  // Vital signs calculations
  if (data.preInductionVitals) {
    const vitals = data.preInductionVitals;

    if (vitals.heartRate && vitals.systolicBP) {
      calculated.shockIndex = calcShockIndex(vitals.heartRate, vitals.systolicBP);
    }

    if (vitals.systolicBP && vitals.diastolicBP) {
      calculated.meanArterialPressure = calcMeanArterialPressure(vitals.systolicBP, vitals.diastolicBP);
      calculated.pulsePressure = calcPulsePressure(vitals.systolicBP, vitals.diastolicBP);
    }

    if (calculated.meanArterialPressure && vitals.heartRate) {
      calculated.modifiedShockIndex = calcModifiedShockIndex(vitals.heartRate, calculated.meanArterialPressure);
    }
  }

  // GCS calculation
  if (data.gcs) {
    calculated.totalGCS = calcTotalGCS(data.gcs);
  }

  // LEON score calculation
  if (data.leonScore) {
    calculated.leonTotalScore = calcLeonScore(data.leonScore);
  }

  // Comorbidity burden
  if (data.comorbidities) {
    calculated.comorbidityBurden = calcComorbidityBurden(data.comorbidities);
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

// Auto-save functionality
if (typeof window !== 'undefined') {
  setInterval(() => {
    const state = useFormStore.getState();
    if (state.isDraft) {
      state.saveDraft();
    }
  }, 30000); // Auto-save every 30 seconds
}
