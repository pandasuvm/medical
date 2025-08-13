import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useFormStore } from '../stores/useFormStore';
import {
  HeartIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { getMedicalSuggestions, clinicalKnowledge } from '../utils/clinicalKnowledge';

export default function VitalSignsPhase() {
  const { register, watch, formState: { errors }, setValue } = useFormContext();
  const { calculatedValues, alerts, startTimer, markPhaseComplete, completedPhases } = useFormStore();
  const [clinicalContext, setClinicalContext] = useState<string>('');
  const [lastToastTime, setLastToastTime] = useState<{[key: string]: number}>({});

  const vitals = watch('preInductionVitals') || {};
  const isPhaseCompleted = completedPhases?.includes('vitals') || false;

  // Enhanced vital signs with clinical context
  const vitalSigns = [
    {
      key: 'heartRate',
      label: 'Heart Rate',
      unit: 'bpm',
      normalRange: '60-100',
      quickValues: [
        { label: '60', value: 60 },
        { label: '80', value: 80 },
        { label: '100', value: 100 },
        { label: '120', value: 120 },
        { label: '140', value: 140 }
      ],
      clinicalHints: [
        'Bradycardia (<60): Consider causes - medications, heart block, hypothermia',
        'Tachycardia (>100): Assess for shock, pain, anxiety, fever',
        'Extreme tachycardia (>150): Consider SVT, VT, or severe shock',
        'Normal resting HR varies with age, fitness, and medical conditions'
      ]
    },
    {
      key: 'systolicBP',
      label: 'Systolic Blood Pressure',
      unit: 'mmHg',
      normalRange: '90-140',
      quickValues: [
        { label: '90', value: 90 },
        { label: '120', value: 120 },
        { label: '140', value: 140 },
        { label: '160', value: 160 },
        { label: '180', value: 180 }
      ],
      clinicalHints: [
        'SBP <90: Hypotension - assess perfusion, consider vasopressors',
        'SBP >180: Hypertensive emergency if end-organ damage present',
        'Pulse pressure >60: Consider aortic regurgitation, hyperthyroidism',
        'Wide pulse pressure: May indicate increased stroke volume'
      ]
    },
    {
      key: 'diastolicBP',
      label: 'Diastolic Blood Pressure',
      unit: 'mmHg',
      normalRange: '60-90',
      quickValues: [
        { label: '60', value: 60 },
        { label: '80', value: 80 },
        { label: '90', value: 90 },
        { label: '100', value: 100 }
      ],
      clinicalHints: [
        'DBP >110: Hypertensive emergency consideration',
        'DBP <60: May indicate volume depletion or vasodilation',
        'Narrow pulse pressure: Consider cardiac tamponade, severe AS',
        'Always measure in context with systolic pressure'
      ]
    },
    {
      key: 'respiratoryRate',
      label: 'Respiratory Rate',
      unit: '/min',
      normalRange: '12-20',
      quickValues: [
        { label: '12', value: 12 },
        { label: '16', value: 16 },
        { label: '20', value: 20 },
        { label: '24', value: 24 },
        { label: '28', value: 28 }
      ],
      clinicalHints: [
        'RR >20: Assess for respiratory distress, metabolic acidosis',
        'RR <12: Consider CNS depression, muscle fatigue',
        'RR >30: Often indicates impending respiratory failure',
        'Quality and effort are as important as rate'
      ]
    },
    {
      key: 'temperature',
      label: 'Temperature',
      unit: '°C',
      normalRange: '36.1-37.2',
      quickValues: [
        { label: '36.5', value: 36.5 },
        { label: '37.0', value: 37.0 },
        { label: '38.0', value: 38.0 },
        { label: '39.0', value: 39.0 }
      ],
      clinicalHints: [
        'Fever >38.3°C: Consider infectious vs non-infectious causes',
        'Hypothermia <35°C: Associated with poor outcomes',
        'Hyperthermia >40°C: Medical emergency, consider heat stroke',
        'Temperature trends more important than single values'
      ]
    },
    {
      key: 'spo2',
      label: 'Oxygen Saturation',
      unit: '%',
      normalRange: '>95',
      quickValues: [
        { label: '88%', value: 88 },
        { label: '92%', value: 92 },
        { label: '95%', value: 95 },
        { label: '98%', value: 98 },
        { label: '100%', value: 100 }
      ],
      clinicalHints: [
        'SpO2 <90%: Severe hypoxemia, immediate intervention required',
        'SpO2 88-92%: Target range for COPD patients',
        'SpO2 >95%: Normal for healthy individuals',
        'Consider arterial blood gas if accuracy questioned'
      ]
    }
  ];

  // Enhanced clinical assessment
  const getClinicalAssessment = () => {
    if (!vitals.heartRate || !vitals.systolicBP) return null;

    const assessments: Array<{ type: 'critical' | 'warning'; title: string; message: string; recommendations: string[] }> = [];

    const hr = parseFloat((vitals.heartRate as any)?.toString?.() ?? '');
    const sbp = parseFloat((vitals.systolicBP as any)?.toString?.() ?? '');
    const spo2 = vitals.spo2 !== undefined && vitals.spo2 !== '' ? parseFloat((vitals.spo2 as any)?.toString?.() ?? '') : NaN;

    // Shock Index Assessment
    if (!isNaN(hr) && !isNaN(sbp) && sbp > 0) {
      const shockIndex = hr / sbp;
      if (shockIndex > 0.9) {
        assessments.push({
          type: 'critical',
          title: 'Elevated Shock Index',
          message: `SI: ${shockIndex.toFixed(2)} suggests hemodynamic compromise`,
          recommendations: ['Urgent fluid resuscitation', 'Blood product preparation', 'Vasopressor readiness']
        });
      }
    }

    // Blood Pressure Assessment
    if (!isNaN(sbp) && sbp < 90) {
      assessments.push({
        type: 'critical',
        title: 'Hypotension',
        message: 'Systolic BP <90 mmHg indicates shock',
        recommendations: ['Large bore IV access', 'Fluid challenge', 'Vasopressor preparation']
      });
    }

    // Respiratory Assessment
    if (!isNaN(spo2) && spo2 < 90) {
      assessments.push({
        type: 'critical',
        title: 'Severe Hypoxemia',
        message: 'SpO2 <90% requires immediate intervention',
        recommendations: ['High-flow oxygen', 'Consider BiPAP/CPAP', 'Prepare for intubation']
      });
    }

    return assessments;
  };

  const handleVitalChange = (field: string, value: string | number) => {
    // Always store as string to satisfy schema (and avoid RHF/Zod type errors)
    const stringValue = value != null ? value.toString() : '';
    setValue(`preInductionVitals.${field}`, stringValue, { shouldValidate: true, shouldDirty: true, shouldTouch: true });

    // Provide immediate clinical feedback with debouncing
  const numValue = parseFloat(stringValue);
    if (!isNaN(numValue)) {
      const vitalSign = vitalSigns.find(v => v.key === field);
      if (vitalSign) {
        const now = Date.now();
        const lastToast = lastToastTime[field] || 0;
        
        // Only show toast if it's been more than 2 seconds since last toast for this field
        if (now - lastToast > 2000) {
          const range = vitalSign.normalRange;
          let status = '';

          if (range.includes('-')) {
            const [min, max] = range.split('-').map(v => parseFloat(v));
            if (numValue < min) status = 'below normal';
            else if (numValue > max) status = 'above normal';
            else status = 'normal';
          } else if (range.startsWith('>')) {
            const threshold = parseFloat(range.slice(1));
            status = numValue > threshold ? 'normal' : 'below normal';
          }

          if (status === 'normal') {
            toast.success(`${vitalSign.label}: ${value} ${vitalSign.unit} - Normal`, {
              id: `vital-${field}`, // Use ID to prevent duplicates
              duration: 3000
            });
          } else if (status !== '') {
            toast.error(`${vitalSign.label}: ${value} ${vitalSign.unit} - ${status}`, {
              id: `vital-${field}`, // Use ID to prevent duplicates
              duration: 3000
            });
          }
          
          setLastToastTime(prev => ({ ...prev, [field]: now }));
        }
      }
    }
  };

  const completePhase = () => {
    const requiredFields = ['heartRate', 'systolicBP', 'diastolicBP', 'respiratoryRate', 'spo2'];
    const isComplete = requiredFields.every(field => vitals[field] !== undefined && vitals[field] !== '');

    if (isComplete) {
      markPhaseComplete('vitals');
      toast.success('Vital signs assessment completed', {
        duration: 3000,
        id: 'vitals-completed'
      });
    } else {
      toast.error('Please complete all required vital signs', {
        duration: 3000,
        id: 'vitals-incomplete'
      });
    }
  };

  const clinicalAssessments = getClinicalAssessment();

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <HeartIcon className="h-6 w-6 text-red-600" />
          <h2 className="text-xl font-semibold text-red-900">Vital Signs Assessment</h2>
          {isPhaseCompleted && (
            <CheckCircleIcon className="h-5 w-5 text-green-600" />
          )}
        </div>
        <p className="text-red-700 text-sm leading-relaxed">
          Pre-induction vital signs are critical for airway management planning.
          Abnormal values trigger automated protocols and equipment preparation.
        </p>
      </div>

      {/* Clinical Context Input */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <label className="block text-sm font-medium text-blue-900 mb-2">
          Clinical Context (Optional)
        </label>
        <input
          type="text"
          value={clinicalContext}
          onChange={(e) => setClinicalContext(e.target.value)}
          placeholder="e.g., presenting complaint, relevant history..."
          className="w-full px-3 py-2 border border-blue-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {clinicalContext && (
          <div className="mt-2 text-xs text-blue-700">
            Suggested terms: {getMedicalSuggestions('indication', clinicalContext).slice(0, 3).join(', ')}
          </div>
        )}
      </div>

      {/* Vital Signs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {vitalSigns.map((vital) => (
          <div key={vital.key} className="bg-white border border-gray-200 rounded-lg p-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {vital.label} {vital.unit && `(${vital.unit})`}
              </label>
              {vital.normalRange && (
                <p className="text-xs text-gray-500 mb-2">Normal: {vital.normalRange}</p>
              )}
              <input
                type="text"
                inputMode="numeric"
                pattern={vital.key === 'temperature' ? "[0-9]*\\.?[0-9]*" : "[0-9]*"}
                {...register(`preInductionVitals.${vital.key}`)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={`Enter ${vital.label.toLowerCase()}`}
                onChange={(e) => handleVitalChange(vital.key, e.target.value)}
              />
              {errors.preInductionVitals?.[vital.key as keyof typeof errors.preInductionVitals] && (
                <p className="text-red-500 text-sm mt-1">
                  {(errors.preInductionVitals as any)[vital.key]?.message}
                </p>
              )}
              
              {/* Quick Values */}
              {vital.quickValues && vital.quickValues.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {vital.quickValues.map((quick, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleVitalChange(vital.key, quick.value.toString())}
                      className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                    >
                      {quick.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Calculated Values Display */}
      {isPhaseCompleted && calculatedValues && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <InformationCircleIcon className="h-5 w-5 text-blue-600" />
            <span>Automated Clinical Calculations</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {calculatedValues.meanArterialPressure && (
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className={`text-2xl font-bold ${
                  calculatedValues.meanArterialPressure < 65 ? 'text-red-600' : 
                  calculatedValues.meanArterialPressure > 100 ? 'text-yellow-600' : 'text-green-600'
                }`}>
                  {calculatedValues.meanArterialPressure.toFixed(0)}
                </div>
                <div className="text-sm text-gray-600">MAP (mmHg)</div>
                <div className="text-xs text-gray-500">Target: 65-100</div>
              </div>
            )}

            {calculatedValues.shockIndex && (
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className={`text-2xl font-bold ${
                  calculatedValues.shockIndex > 0.9 ? 'text-red-600' : 
                  calculatedValues.shockIndex > 0.7 ? 'text-yellow-600' : 'text-green-600'
                }`}>
                  {calculatedValues.shockIndex.toFixed(2)}
                </div>
                <div className="text-sm text-gray-600">Shock Index</div>
                <div className="text-xs text-gray-500">Normal: 0.5-0.7</div>
              </div>
            )}

            {vitals.systolicBP && vitals.diastolicBP && (
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {(() => {
                    const sbp = parseFloat(vitals.systolicBP as any);
                    const dbp = parseFloat(vitals.diastolicBP as any);
                    return isNaN(sbp) || isNaN(dbp) ? '-' : (sbp - dbp);
                  })()}
                </div>
                <div className="text-sm text-gray-600">Pulse Pressure</div>
                <div className="text-xs text-gray-500">Normal: 30-50</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Clinical Assessments */}
      {clinicalAssessments && clinicalAssessments.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
            <span>Clinical Assessment</span>
          </h3>

          {clinicalAssessments.map((assessment, index) => (
            <div key={index} className={`
              border-l-4 p-4 rounded-r-lg
              ${assessment.type === 'critical' ? 'bg-red-50 border-red-400' : 'bg-yellow-50 border-yellow-400'}
            `}>
              <h4 className="font-semibold text-sm mb-2">{assessment.title}</h4>
              <p className="text-sm mb-3">{assessment.message}</p>
              <div>
                <p className="text-xs font-medium mb-1">Immediate Actions:</p>
                <ul className="text-xs space-y-1">
                  {assessment.recommendations.map((rec, recIndex) => (
                    <li key={recIndex} className="flex items-center space-x-2">
                      <span className="w-1 h-1 bg-current rounded-full"></span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Phase Completion */}
      {!isPhaseCompleted && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={completePhase}
            className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <CheckCircleIcon className="h-5 w-5" />
            <span>Complete Vital Signs Assessment</span>
          </button>
        </div>
      )}
    </div>
  );
}
