'use client';
import React, { useEffect, useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { formRootSchema } from '../schemas/formSchemas';
import { z } from 'zod';
import { useFormStore } from '../stores/useFormStore';
import toast from 'react-hot-toast';
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
  ComputerDesktopIcon
} from '@heroicons/react/24/outline';

// Import components
import DemographicsPhase from './DemographicsPhase';
import ComorbiditiesPhase from './ComorbiditiesPhase';
import GCSPhase from './GCSPhase';
import IndicationPhase from './IndicationPhase';
import LeonScorePhase from './LeonScorePhase';
import VitalSignsPhase from './VitalSignsPhase';
import MonitoringPhase from './MonitoringPhase';
import MobileAlert from './MobileAlert';
import { MEARPDFGenerator } from '../utils/pdfGenerator';

type FormData = z.infer<typeof formRootSchema>;

export default function FormShell() {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const methods = useForm<FormData>({
    resolver: zodResolver(formRootSchema),
    defaultValues: {
      currentPhase: 'demographics',
      isComplete: false,
      demographics: {},
      comorbidities: {},
      gcs: {},
      indication: { category: 'trauma' }
    }
  });

  const {
    setData,
    currentPhase,
    setCurrentPhase,
    alerts,
    calculatedValues,
    timerActive,
    elapsedTime,
    updateElapsedTime,
    loadDraft,
    saveDraft,
    dismissAlert
  } = useFormStore();

  // Load draft on component mount
  useEffect(() => {
    loadDraft();
  }, [loadDraft]);

  // Watch form changes and update store
  useEffect(() => {
    const subscription = methods.watch((data) => {
      if (data) {
        setData(data as Partial<FormData>);
        // Auto-save draft every 10 seconds
        const autoSaveTimer = setTimeout(() => {
          saveDraft();
        }, 10000);
        return () => clearTimeout(autoSaveTimer);
      }
    });
    return () => subscription.unsubscribe();
  }, [methods, setData, saveDraft]);

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
  const phases = [
    {
      id: 'demographics',
      title: 'Demographics',
      component: DemographicsPhase,
      color: 'blue',
      icon: UserIcon,
      description: 'Patient identification and basic information'
    },
    {
      id: 'vitals',
      title: 'Vital Signs',
      component: VitalSignsPhase,
      color: 'red',
      icon: HeartIcon,
      description: 'Pre-induction vital signs assessment'
    },
    {
      id: 'gcs',
      title: 'GCS Assessment',
      component: GCSPhase,
      color: 'purple',
      icon: CpuChipIcon,
      description: 'Glasgow Coma Scale evaluation'
    },
    {
      id: 'comorbidities',
      title: 'Comorbidities',
      component: ComorbiditiesPhase,
      color: 'orange',
      icon: ClipboardDocumentListIcon,
      description: 'Medical history and risk factors'
    },
    {
      id: 'indication',
      title: 'Indication',
      component: IndicationPhase,
      color: 'green',
      icon: FlagIcon,
      description: 'Intubation indication and urgency'
    },
    {
      id: 'leon',
      title: 'LEON Score',
      component: LeonScorePhase,
      color: 'indigo',
      icon: ChartBarIcon,
      description: 'Difficult airway prediction scoring'
    },
    {
      id: 'monitoring',
      title: 'Monitoring',
      component: MonitoringPhase,
      color: 'teal',
      icon: ComputerDesktopIcon,
      description: 'Post-intubation monitoring plan'
    }
  ];

  const currentPhaseIndex = phases.findIndex(p => p.id === currentPhase);
  const CurrentPhaseComponent = phases.find(p => p.id === currentPhase)?.component || DemographicsPhase;
  const currentPhaseData = phases[currentPhaseIndex];

  const goToNext = () => {
    if (currentPhaseIndex < phases.length - 1) {
      setCurrentPhase(phases[currentPhaseIndex + 1].id);
      toast.success(`Moved to ${phases[currentPhaseIndex + 1].title}`);
    }
  };

  const goToPrevious = () => {
    if (currentPhaseIndex > 0) {
      setCurrentPhase(phases[currentPhaseIndex - 1].id);
      toast.success(`Back to ${phases[currentPhaseIndex - 1].title}`);
    }
  };

  const goToPhase = (phaseId: string) => {
    setCurrentPhase(phaseId);
    setShowMobileMenu(false);
    const phase = phases.find(p => p.id === phaseId);
    if (phase) {
      toast.success(`Navigated to ${phase.title}`);
    }
  };

  const generatePDF = async () => {
    setIsGeneratingPDF(true);
    try {
      const formData = methods.getValues();
      const pdfGenerator = new MEARPDFGenerator();

      // Create a simplified data structure for PDF generation
      const pdfData = {
        demographics: formData.demographics,
        vitals: formData.preInductionVitals,
        gcs: formData.gcs,
        indication: formData.indication,
        leonScore: formData.leonScore,
        comorbidities: formData.comorbidities,
        monitoring: formData.monitoring,
        calculatedValues,
        alerts,
        timestamp: new Date()
      };

      await pdfGenerator.generatePDF(pdfData as any, {
        includeAlerts: true,
        includeCalculations: true,
        includeTimestamp: true,
        watermark: 'MEAR - CONFIDENTIAL'
      });

      const timestamp = new Date().toISOString().slice(0, 16).replace('T', '_');
      await pdfGenerator.downloadPDF(`MEAR_Report_${timestamp}.pdf`);

      toast.success('PDF report generated successfully!');
    } catch (error) {
      console.error('PDF generation failed:', error);
      toast.error('Failed to generate PDF report');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const submit = methods.handleSubmit(async (data) => {
    try {
      console.log('Form submitted:', data);
      console.log('Calculated values:', calculatedValues);

      // Generate PDF on submit
      await generatePDF();

      toast.success('Form submitted successfully!');
      // TODO: POST to /api/airway-registry
    } catch (error) {
      toast.error('Submission failed. Please try again.');
    }
  });

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const criticalAlerts = alerts.filter(alert => alert.level === 'critical');

  return (
    <FormProvider {...methods}>
      <div className="min-h-screen bg-gray-50" id="mear-form-container">
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
          <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-screen">
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <HeartIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">MEAR</h1>
                  <p className="text-xs text-gray-600">Emergency Airway Registry</p>
                </div>
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
                <form onSubmit={submit} className="space-y-8">
                  <CurrentPhaseComponent />
                </form>
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
                    type="submit"
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
                  type="submit"
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
