'use client';
import React, { useEffect, useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { formRootSchema } from '../schemas/formSchemas';
import { z } from 'zod';
import { useFormStore } from '../stores/useFormStore';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import {
  DocumentArrowDownIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  Bars3Icon,
  XMarkIcon,
  UserIcon,
  HeartIcon,
  CpuChipIcon,
  ClipboardDocumentListIcon,
  FlagIcon,
  ChartBarIcon,
  ComputerDesktopIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';

// Import components
import DemographicsPhase from './DemographicsPhase';
import ComorbiditiesPhase from './ComorbiditiesPhase';
import IndicationPhase from './IndicationPhase';
import LeonScorePhase from './LeonScorePhase';
import VitalSignsPhase from './VitalSignsPhase';
import MonitoringPhase from './MonitoringPhase';
import PreIntubationPhase from './PreIntubationPhase';
import PostIntubationPhase from './PostIntubationPhase';
import IntubationAttemptsPhase from './IntubationAttemptsPhase';
import MobileAlert from './MobileAlert';
import { MEARPDFGenerator } from '../utils/pdfGenerator';

type FormData = z.infer<typeof formRootSchema>;

interface FormShellProps {
  hospitalNo?: string;
  draftId?: number;
}

export default function FormShell({ hospitalNo, draftId: initialDraftId }: FormShellProps = {}) {
  const router = useRouter();
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [draftInitialized, setDraftInitialized] = useState(false);
  const isSyncingFromStore = React.useRef(false);

  const methods = useForm<FormData>({
    resolver: zodResolver(formRootSchema),
    defaultValues: {
      currentPhase: 'demographics',
      isComplete: false,
      demographics: {
        age: '',
        sex: undefined,
        hospitalNo: '',
        weight: '',
        height: '',
        occupation: undefined,
        occupationOther: '',
        financialStatus: undefined,
        financialStatusOther: ''
      },
      comorbidities: {
        diabetes: false,
        hypertension: false,
        chronicRenalDisease: false,
        chronicLiverDisease: false,
        reactiveAirwayDisease: false,
        others: false,
        othersText: ''
      },
      gcs: {
        eyeResponse: '',
        verbalResponse: '',
        motorResponse: '',
        isAlreadyIntubated: false
      },
      indication: { 
        category: 'trauma',
        trauma: {
          headInjuryReducedSensorium: false,
          headInjuryAirwayThreatened: false,
          neckFacialTrauma: false,
          burnInhalation: false,
          drowning: false,
          chestTrauma: false,
          other: false,
          otherText: ''
        }
      },
      leonScore: {
        largeTongue: 0,
        thyroMentalDistance: 0,
        obstruction: 0,
        neckMobility: 0
      },
      preInductionVitals: {
        heartRate: '',
        systolicBP: '',
        diastolicBP: '',
        respiratoryRate: '',
        spo2: '',
        temperature: ''
      },
      preInductionLabs: {
        ph: undefined,
        pao2: undefined,
        paco2: undefined,
        lactate: undefined,
        hemoglobin: undefined,
        platelets: undefined,
        glucose: undefined,
        hco3: undefined,
        creatinine: undefined,
        urea: undefined,
        na: undefined,
        k: undefined
      },
      airwayStatus: {
        failureToMaintainProtectAirway: false,
        failureOfVentilationOxygenation: false,
        deteriorationAnticipated: false,
        predictorForDifficultAirway: false,
        safeApneaTime: undefined
      },
      preIntubationManagement: {
        // Induction / sedation medications (initialize so fields are fully reactive)
        etomidate: { given: false, dose: undefined },
        propofol: { given: false, dose: undefined },
        ketamine: { given: false, dose: undefined },
        midazolam: { given: false, dose: undefined },
        fentanyl: { given: false, dose: undefined },
        succinylcholine: { given: false, dose: undefined },
        rocuronium: { given: false, dose: undefined },
        vecuronium: { given: false, dose: undefined },
        atracurium: { given: false, dose: undefined },
        cisatracurium: { given: false, dose: undefined },
        otherMedications: [],
        // Pre-induction fluids
        preInductionFluids: {
          normalSaline: false,
          ringerLactate: false,
          colloids: false,
          volumeMl: undefined
        },
        // Push-dose pressors
        pushDosePressor: {
          adrenaline: false,
          noradrenaline: false,
          phenylephrine: false,
          metaraminol: false,
          dose: undefined
        },
        // Vasopressor infusion
        vasopressorInfusion: {
          agent: 'none',
          doseMcgPerKgMin: undefined
        },
        // Sedation infusion & choice
        sedationInfusion: {
          agent: 'none',
          dose: undefined
        },
        sedationDone: undefined
      },
      postIntubationGcs: {
        eye: '',
        motor: '',
        verbal: ''
      },
      ventilatorSettings: {
        ettCdValue: '',
        mode: '',
        peep: undefined,
        pPeak: undefined,
        minuteVentilation: undefined,
        changeInSettings: ''
      },
      postIntubationEvents: {
        postIntubationCardiacArrest: false,
        cardiacArrestDetails: '',
        otherSeriousAdverseEvents: ''
      },
      intubationAttempts: [],
      totalAttempts: 0,
      monitoringTable: {
        post5: {
          heartRate: '',
          systolicBP: '',
          diastolicBP: '',
          respiratoryRate: '',
          spo2: '',
          temperature: ''
        },
        post10: {
          heartRate: '',
          systolicBP: '',
          diastolicBP: '',
          respiratoryRate: '',
          spo2: '',
          temperature: ''
        },
        post15: {
          heartRate: '',
          systolicBP: '',
          diastolicBP: '',
          respiratoryRate: '',
          spo2: '',
          temperature: ''
        },
        post30: {
          heartRate: '',
          systolicBP: '',
          diastolicBP: '',
          respiratoryRate: '',
          spo2: '',
          temperature: ''
        },
        modifiedShockIndex: {
          post5: '',
          post10: '',
          post15: '',
          post30: ''
        }
      }
    }
  });

  const {
    data,
    setData,
    currentPhase,
    setCurrentPhase,
    alerts,
    calculatedValues,
    timerActive,
    elapsedTime,
    updateElapsedTime,
    loadDraft,
    createDraft,
    saveDraft,
    dismissAlert,
    clearStaleAlerts,
    currentHospitalNo,
    draftId
  } = useFormStore();

  // Load draft on component mount and clear stale alerts
  useEffect(() => {
    (async () => {
      if (initialDraftId) {
        // Load draft by ID from URL
        await loadDraft(initialDraftId, hospitalNo);
      } else if (hospitalNo) {
        // If hospital number is provided, try loading by hospital number
        await loadDraft(undefined, hospitalNo);
      } else if (draftId) {
        // If draft ID exists in store, load it
        await loadDraft(draftId);
      } else {
        // Create a new draft if none exists
        await createDraft();
      }
      clearStaleAlerts();
      setDraftInitialized(true);
    })();
  }, [loadDraft, createDraft, clearStaleAlerts, hospitalNo, initialDraftId, draftId]);

  // Once draft has been loaded into the store, hydrate the React Hook Form values
  // This only runs once when draft is initialized
  const hasSyncedDataRef = React.useRef(false);
  useEffect(() => {
    if (!draftInitialized || hasSyncedDataRef.current) return;
    if (data && Object.keys(data).length > 0) {
      hasSyncedDataRef.current = true;
      isSyncingFromStore.current = true;
      methods.reset(data as any);
      // Reset flag after a brief delay to allow form to update
      setTimeout(() => {
        isSyncingFromStore.current = false;
      }, 200);
    }
    // Only run when draftInitialized changes, not when data changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftInitialized]);


  // Watch form changes and update store - this catches all changes including dropdowns via setValue
  // Also trigger a debounced save after form changes
  const saveTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    if (!draftInitialized) return;
    
    // Watch all form fields for changes
    // react-hook-form's watch() automatically catches changes from setValue, onChange, etc.
    const subscription = methods.watch((formData) => {
      // Skip updating store if we're currently syncing from store to form
      if (isSyncingFromStore.current || !formData) return;
      
      // Update store with form data - this will trigger on all form changes including dropdowns
      setData(formData as Partial<FormData>);
      
      // Debounced save - save 2 seconds after last change
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      saveTimeoutRef.current = setTimeout(() => {
        saveDraft();
      }, 2000); // Save 2 seconds after last change
    });
    
    return () => {
      subscription.unsubscribe();
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [methods, setData, draftInitialized, saveDraft]);
  
  // Auto-save draft separately with debouncing - get fresh form data
  useEffect(() => {
    if (!draftInitialized || isSyncingFromStore.current) return;
    
    const autoSaveTimer = setTimeout(() => {
      // Get current form values directly instead of relying on store data
      const currentFormData = methods.getValues();
      if (currentFormData && Object.keys(currentFormData).length > 0) {
        // Update store with current form data before saving
        setData(currentFormData as Partial<FormData>);
        // Then save (saveDraft will use the updated state)
        setTimeout(() => saveDraft(), 100);
      }
    }, 10000); // Auto-save every 10 seconds
    
    return () => clearTimeout(autoSaveTimer);
  }, [data, draftInitialized, saveDraft, methods, setData]);

  // Update timer every second
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerActive) {
      interval = setInterval(() => {
        updateElapsedTime();
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerActive, updateElapsedTime]);

  // Enhanced phase configuration with professional medical icons
  // Ordered to mirror the PROFORMA blocks
  const phases = [
    {
      id: 'demographics',
      title: 'Demographics',
      component: DemographicsPhase,
      color: 'blue',
      icon: UserIcon,
      description: 'Patient demographics & basic data'
    },
    {
      id: 'vitals',
      title: 'Pre-induction Hemodynamics & Labs',
      component: VitalSignsPhase,
      color: 'red',
      icon: HeartIcon,
      description: 'Pre-induction vitals, labs & modified shock index'
    },
    {
      id: 'indication',
      title: 'Indication for Intubation',
      component: IndicationPhase,
      color: 'green',
      icon: FlagIcon,
      description: 'Trauma / Non-trauma indication for intubation'
    },
    {
      id: 'leon',
      title: 'Airway & LEON Score',
      component: LeonScorePhase,
      color: 'indigo',
      icon: ChartBarIcon,
      description: 'Airway assessment & difficult airway prediction'
    },
    {
      id: 'preIntubation',
      title: 'Pre-intubation Status & Medication',
      component: PreIntubationPhase,
      color: 'amber',
      icon: ClipboardDocumentListIcon,
      description: 'Medications, fluids, pressors & sedation'
    },
    {
      id: 'comorbidities',
      title: 'Comorbidities & Post-intubation GCS',
      component: ComorbiditiesPhase,
      color: 'orange',
      icon: ClipboardDocumentListIcon,
      description: 'Comorbidities and post-intubation neurological status'
    },
    {
      id: 'postIntubation',
      title: 'ETT/CD & Ventilator Settings',
      component: PostIntubationPhase,
      color: 'emerald',
      icon: ChartBarIcon,
      description: 'Post-intubation ventilator settings & adverse events'
    },
    {
      id: 'attempts',
      title: 'Intubation Attempts',
      component: IntubationAttemptsPhase,
      color: 'sky',
      icon: FlagIcon,
      description: 'Intubation attempts and technique details'
    },
    {
      id: 'monitoring',
      title: 'Hemodynamics Over Time',
      component: MonitoringPhase,
      color: 'cyan',
      icon: CpuChipIcon,
      description: 'Pre-induction and serial post-induction vitals at fixed intervals'
    }
  ];

  const currentPhaseIndex = phases.findIndex(p => p.id === currentPhase);
  const CurrentPhaseComponent = phases.find(p => p.id === currentPhase)?.component || DemographicsPhase;
  const currentPhaseData = phases[currentPhaseIndex];

  const goToNext = () => {
    if (currentPhaseIndex < phases.length - 1) {
      setCurrentPhase(phases[currentPhaseIndex + 1].id);
      toast.success(`Moved to ${phases[currentPhaseIndex + 1].title}`, {
        id: 'phase-navigation',
        duration: 2000
      });
    }
  };

  const goToPrevious = () => {
    if (currentPhaseIndex > 0) {
      setCurrentPhase(phases[currentPhaseIndex - 1].id);
      toast.success(`Back to ${phases[currentPhaseIndex - 1].title}`, {
        id: 'phase-navigation',
        duration: 2000
      });
    }
  };

  const goToPhase = (phaseId: string) => {
    setCurrentPhase(phaseId);
    setShowMobileMenu(false);
    const phase = phases.find(p => p.id === phaseId);
    if (phase) {
      toast.success(`Navigated to ${phase.title}`, {
        id: 'phase-navigation',
        duration: 2000
      });
    }
  };

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

  const generatePDF = async () => {
    setIsGeneratingPDF(true);
    try {
      const formData = methods.getValues();
      const pdfGenerator = new MEARPDFGenerator();

      // Create a data structure for PDF generation aligned with PROFORMA
      const pdfData = {
        demographics: formData.demographics,
        vitals: formData.preInductionVitals,
        gcs: formData.gcs,
        indication: formData.indication,
        comorbidities: formData.comorbidities,
        leonScore: formData.leonScore,
        preInductionLabs: formData.preInductionLabs,
        airwayStatus: formData.airwayStatus,
        preIntubationManagement: formData.preIntubationManagement,
        postIntubationGcs: formData.postIntubationGcs,
        ventilatorSettings: formData.ventilatorSettings,
        postIntubationEvents: formData.postIntubationEvents,
        intubationAttempts: formData.intubationAttempts,
        calculatedValues,
        alerts,
        timestamp: new Date()
      };

      await pdfGenerator.generatePDF(pdfData, {
        includeAlerts: true,
        includeCalculations: true,
        includeTimestamp: true
      });

      const timestamp = new Date().toISOString().slice(0, 16).replace('T', '_');
      await pdfGenerator.downloadPDF(`MEAR_Report_${timestamp}.pdf`);

      toast.success('PDF report generated successfully!', {
        id: 'pdf-generation',
        duration: 3000
      });
    } catch (error) {
      console.error('PDF generation failed:', error);
      toast.error('Failed to generate PDF report', {
        id: 'pdf-generation',
        duration: 3000
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const submit = methods.handleSubmit(
    async (data) => {
      console.log('Form submission started', data);
      setIsGeneratingPDF(true);
      try {
        const authRaw = typeof window !== 'undefined' ? localStorage.getItem('medical_auth') : null;
        const auth = authRaw ? JSON.parse(authRaw) : null;
        const token: string | undefined = auth?.token;
        console.log('Auth token:', token ? 'present' : 'missing');

      // First persist the full form to the backend
      try {
        const headers: Record<string, string> = {
          'Content-Type': 'application/json'
        };
        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE_URL}/api/mear`, {
          method: 'POST',
          headers,
          body: JSON.stringify(data)
        });

        if (!response.ok) {
          console.error('Backend save failed', await response.text());
          toast.error('Failed to save to registry backend', { id: 'backend-save', duration: 3000 });
        } else {
          const json = await response.json().catch(() => ({}));
          console.log('Saved MEAR case with id:', json.id);

          // Clear server-side and local drafts so user doesn't reopen old data
          if (token) {
            try {
              const deleteUrl = new URL(`${API_BASE_URL}/api/draft`);
              let hasParam = false;
              
              // Prefer draftId if it exists and is not null
              if (draftId !== null && draftId !== undefined) {
                deleteUrl.searchParams.append('draftId', draftId.toString());
                hasParam = true;
              } else {
                // Try to get hospitalNo from store, form data, or props
                const hospitalNoToUse = currentHospitalNo || 
                                       (data as any)?.demographics?.hospitalNo || 
                                       hospitalNo;
                
                if (hospitalNoToUse) {
                  deleteUrl.searchParams.append('hospitalNo', hospitalNoToUse);
                  hasParam = true;
                }
              }
              
              // Only make the DELETE request if we have a parameter
              if (hasParam) {
                const deleteResponse = await fetch(deleteUrl.toString(), {
                  method: 'DELETE',
                  headers: { Authorization: `Bearer ${token}` }
                });
                
                if (!deleteResponse.ok) {
                  const errorText = await deleteResponse.text();
                  console.error('Failed to delete draft:', deleteResponse.status, errorText);
                } else {
                  console.log('Draft deleted successfully');
                }
              } else {
                console.warn('No draftId or hospitalNo available to delete draft');
              }
            } catch (e) {
              console.error('Failed to clear server draft', e);
            }
          }
          if (typeof window !== 'undefined') {
            localStorage.removeItem('mear-form-draft');
          }
        }
      } catch (err) {
        console.error('Error calling backend:', err);
        toast.error('Could not reach backend API', { id: 'backend-save', duration: 3000 });
      }

        // Generate PDF on submit (even if backend save failed)
        await generatePDF();

        toast.success('Form submitted successfully!', {
          id: 'form-submission',
          duration: 3000
        });
        
        // Redirect to dashboard after successful submission
        setTimeout(() => {
          router.push('/dashboard');
        }, 1500);
      } catch (error) {
        console.error('Submission error:', error);
        toast.error('Submission failed. Please try again.', {
          id: 'form-submission',
          duration: 3000
        });
      } finally {
        setIsGeneratingPDF(false);
      }
    },
    (errors) => {
      // Handle validation errors with detailed messages
      console.error('Form validation errors:', errors);
      
      // Extract detailed error messages
      const errorMessages: string[] = [];
      const extractErrors = (errorObj: any, path: string = '') => {
        if (errorObj._errors && errorObj._errors.length > 0) {
          errorMessages.push(`${path}: ${errorObj._errors.join(', ')}`);
        }
        Object.keys(errorObj).forEach(key => {
          if (key !== '_errors' && typeof errorObj[key] === 'object' && errorObj[key] !== null) {
            const newPath = path ? `${path}.${key}` : key;
            extractErrors(errorObj[key], newPath);
          }
        });
      };
      extractErrors(errors);
      
      if (errorMessages.length > 0) {
        const message = errorMessages.slice(0, 3).join('; '); // Show first 3 errors
        toast.error(`Validation errors: ${message}`, {
          id: 'form-validation-error',
          duration: 6000
        });
      } else {
        toast.error('Please check the form for errors', {
          id: 'form-validation-error',
          duration: 4000
        });
      }
    }
  );

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const criticalAlerts = alerts.filter(alert => alert.level === 'critical');

  // Show loader while draft is being loaded
  if (!draftInitialized) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <HeartIcon className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <p className="text-gray-600 text-lg font-medium mt-4">Loading form data...</p>
          <p className="text-gray-500 text-sm mt-2">Please wait</p>
        </div>
      </div>
    );
  }

  return (
    <FormProvider {...methods}>
      <div className="min-h-screen bg-slate-100" id="mear-form-container">
        {/* Mobile Alert System */}
        <MobileAlert
          alerts={alerts.map(alert => ({
            id: alert.id || Math.random().toString(),
            type: alert.level as any,
            title: alert.title,
            message: alert.message,
            actions: alert.actions,
            timestamp: new Date()
          }))}
          onDismiss={dismissAlert}
        />

        {/* Desktop Layout */}
        <div className="hidden lg:flex h-screen">
          {/* Desktop Sidebar */}
          <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-screen shadow-lg">
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                    <HeartIcon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">MEAR</h1>
                    <p className="text-xs text-gray-600">Emergency Airway Registry</p>
                  </div>
                </div>
                <button
                  onClick={() => router.push('/dashboard')}
                  className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Back to Dashboard"
                >
                  <ArrowLeftIcon className="h-4 w-4" />
                  <span className="hidden xl:inline">Dashboard</span>
                </button>
              </div>

              {/* Progress Overview */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Progress</span>
                <span className="font-semibold text-blue-600">
                  {Math.round(((currentPhaseIndex + 1) / phases.length) * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentPhaseIndex + 1) / phases.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto p-4">
              <nav className="space-y-2">
                {phases.map((phase, index) => {
                  const IconComponent = phase.icon;
                  const isActive = currentPhase === phase.id;
                  const isCompleted = index < currentPhaseIndex;

                  return (
                    <button
                      key={phase.id}
                      onClick={() => goToPhase(phase.id)}
                      className={`
                        w-full flex items-center space-x-3 p-4 rounded-lg text-left transition-all duration-200
                        hover:bg-gray-100 text-gray-700
                        ${isActive ? 'bg-blue-100 text-blue-900 shadow-sm border border-blue-200' : ''}
                        ${isCompleted ? 'border-l-4 border-green-500' : ''}
                      `}
                    >
                      <div className={`
                        p-2 rounded-lg flex-shrink-0
                        ${isActive ? 'bg-blue-200' : 'bg-gray-100'}
                      `}>
                        <IconComponent className={`h-5 w-5 ${isActive ? 'text-blue-700' : 'text-gray-600'}`} />
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <div className="font-medium text-sm">{phase.title}</div>
                        <div className="text-xs text-gray-500 truncate">{phase.description}</div>
                      </div>
                      {isCompleted && (
                        <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0" />
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Footer Actions */}
            <div className="p-4 border-t border-gray-200 space-y-3">
              {/* Timer Display */}
              {timerActive && (
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                  <ClockIcon className="h-4 w-4" />
                  <span>Session Time:</span>
                  <span className="font-mono font-semibold">{formatTime(elapsedTime)}</span>
                </div>
              )}

              {/* Critical Alerts Summary */}
              {criticalAlerts.length > 0 && (
                <div className="flex items-center space-x-2 text-red-600 text-sm bg-red-50 rounded-lg p-3">
                  <ExclamationTriangleIcon className="h-4 w-4" />
                  <span>{criticalAlerts.length} Critical Alert{criticalAlerts.length > 1 ? 's' : ''}</span>
                </div>
              )}

              {/* PDF Export Button */}
              <button
                onClick={generatePDF}
                disabled={isGeneratingPDF}
                className="
                  w-full flex items-center justify-center space-x-2 px-4 py-3
                  bg-blue-600 text-white rounded-lg hover:bg-blue-700
                  disabled:opacity-50 disabled:cursor-not-allowed transition-colors
                "
              >
                <DocumentArrowDownIcon className="h-5 w-5" />
                <span>{isGeneratingPDF ? 'Generating...' : 'Export PDF Report'}</span>
              </button>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Desktop Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-3">
                    <currentPhaseData.icon className="h-6 w-6 text-blue-600" />
                    <span>{currentPhaseData.title}</span>
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">{currentPhaseData.description}</p>
                </div>

                <div className="text-sm text-gray-500">
                  Phase {currentPhaseIndex + 1} of {phases.length}
                </div>
              </div>
            </div>

            {/* Form Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="max-w-5xl mx-auto">
                <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 md:p-8">
                  <form id="mear-form-desktop" onSubmit={submit} className="space-y-8">
                    <CurrentPhaseComponent />
                  </form>
                </div>
              </div>
            </div>

            {/* Desktop Navigation Footer */}
            <div className="bg-white border-t border-gray-200 px-6 py-4 flex-shrink-0">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={goToPrevious}
                  disabled={currentPhaseIndex === 0}
                  className="
                    flex items-center space-x-2 px-6 py-2 bg-gray-100 text-gray-700
                    rounded-lg disabled:opacity-50 disabled:cursor-not-allowed
                    hover:bg-gray-200 transition-colors
                  "
                >
                  <ChevronLeftIcon className="h-4 w-4" />
                  <span>Previous</span>
                </button>

                {currentPhaseIndex === phases.length - 1 ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      submit(e);
                    }}
                    disabled={isGeneratingPDF}
                    className="
                      flex items-center space-x-2 px-8 py-2 bg-green-600 text-white
                      rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors font-medium
                    "
                  >
                    <DocumentArrowDownIcon className="h-5 w-5" />
                    <span>{isGeneratingPDF ? 'Submitting...' : 'Submit & Generate Report'}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={goToNext}
                    className="
                      flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white
                      rounded-lg hover:bg-blue-700 transition-colors font-medium
                    "
                  >
                    <span>Next: {phases[currentPhaseIndex + 1]?.title}</span>
                    <ChevronRightIcon className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="lg:hidden">
          {/* Mobile Header */}
          <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => router.push('/dashboard')}
                  className="p-2 rounded-lg hover:bg-gray-100"
                  title="Back to Dashboard"
                >
                  <ArrowLeftIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setShowMobileMenu(!showMobileMenu)}
                  className="p-2 rounded-lg hover:bg-gray-100"
                >
                  <Bars3Icon className="h-5 w-5" />
                </button>
                <div>
                  <div className="text-xs text-gray-500">Phase {currentPhaseIndex + 1} of {phases.length}</div>
                  <h1 className="text-sm font-semibold text-gray-900 flex items-center space-x-2">
                    <currentPhaseData.icon className="h-4 w-4" />
                    <span>{currentPhaseData.title}</span>
                  </h1>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {criticalAlerts.length > 0 && (
                  <div className="flex items-center space-x-1 text-red-600">
                    <ExclamationTriangleIcon className="h-4 w-4" />
                    <span className="text-xs font-medium">{criticalAlerts.length}</span>
                  </div>
                )}

                {timerActive && (
                  <div className="flex items-center space-x-1 text-gray-600">
                    <ClockIcon className="h-4 w-4" />
                    <span className="text-xs font-mono">{formatTime(elapsedTime)}</span>
                  </div>
                )}

                <button
                  onClick={generatePDF}
                  disabled={isGeneratingPDF}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg disabled:opacity-50"
                >
                  <DocumentArrowDownIcon className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-gray-200 h-1">
              <div
                className="bg-blue-500 h-1 transition-all duration-300"
                style={{ width: `${((currentPhaseIndex + 1) / phases.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Mobile Phase Menu */}
          {showMobileMenu && (
            <div className="fixed inset-0 z-50">
              <div className="fixed inset-0 bg-black bg-opacity-25" onClick={() => setShowMobileMenu(false)} />
              <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-xl p-4 space-y-2 max-h-96 overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Navigate to Section</h3>
                  <button
                    onClick={() => setShowMobileMenu(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
                {phases.map((phase, index) => {
                  const IconComponent = phase.icon;
                  const isActive = currentPhase === phase.id;
                  const isCompleted = index < currentPhaseIndex;

                  return (
                    <button
                      key={phase.id}
                      onClick={() => goToPhase(phase.id)}
                      className={`
                        w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-colors
                        ${isActive 
                          ? 'bg-blue-100 text-blue-900 border border-blue-200' 
                          : 'hover:bg-gray-100'
                        }
                      `}
                    >
                      <IconComponent className={`h-5 w-5 ${isActive ? 'text-blue-600' : 'text-gray-600'}`} />
                      <div className="flex-1">
                        <div className="font-medium text-sm">{phase.title}</div>
                        <div className="text-xs text-gray-500">{phase.description}</div>
                      </div>
                      {isCompleted && (
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                      )}
                      {isActive && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Mobile Content */}
          <div className="max-w-4xl mx-auto p-4 pb-24">
            <form onSubmit={submit} className="space-y-6">
              <CurrentPhaseComponent />
            </form>
          </div>

          {/* Mobile Bottom Navigation */}
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={goToPrevious}
                disabled={currentPhaseIndex === 0}
                className="
                  flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700
                  rounded-lg disabled:opacity-50 disabled:cursor-not-allowed
                  hover:bg-gray-200 transition-colors
                "
              >
                <ChevronLeftIcon className="h-4 w-4" />
                <span>Previous</span>
              </button>

              {currentPhaseIndex === phases.length - 1 ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    submit(e);
                  }}
                  disabled={isGeneratingPDF}
                  className="
                    flex items-center space-x-2 px-6 py-2 bg-green-600 text-white
                    rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors
                  "
                >
                  <DocumentArrowDownIcon className="h-4 w-4" />
                  <span>{isGeneratingPDF ? 'Generating...' : 'Submit & Export'}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={goToNext}
                  className="
                    flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white
                    rounded-lg hover:bg-blue-700 transition-colors
                  "
                >
                  <span>Next</span>
                  <ChevronRightIcon className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </FormProvider>
  );
}