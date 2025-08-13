import React from 'react';
import { useFormContext } from 'react-hook-form';
import { useFormStore } from '../stores/useFormStore';

export default function GCSPhase() {
  const { register, watch, setValue, formState: { errors } } = useFormContext();
  const { calculatedValues, alerts } = useFormStore();

  const isAlreadyIntubated = watch('gcs.isAlreadyIntubated');
  const eyeResponse = watch('gcs.eyeResponse');
  const verbalResponse = watch('gcs.verbalResponse');
  const motorResponse = watch('gcs.motorResponse');

  // Clear verbal response when patient is already intubated
  React.useEffect(() => {
    if (isAlreadyIntubated) {
      setValue('gcs.verbalResponse', null);
    }
  }, [isAlreadyIntubated, setValue]);

  // GCS component descriptions
  const gcsDescriptions = {
    eye: {
      4: 'Spontaneous',
      3: 'To voice',
      2: 'To pain',
      1: 'None'
    },
    verbal: {
      5: 'Oriented',
      4: 'Confused',
      3: 'Inappropriate words',
      2: 'Incomprehensible sounds',
      1: 'None'
    },
    motor: {
      6: 'Obeys commands',
      5: 'Localizes pain',
      4: 'Withdraws from pain',
      3: 'Flexion to pain',
      2: 'Extension to pain',
      1: 'None'
    }
  };

  // Filter GCS-related alerts
  const gcsAlerts = alerts.filter(alert => alert.category === 'neurological');

  return (
    <div className="space-y-6">
      <div className="bg-purple-50 p-4 rounded-lg">
        <h2 className="text-xl font-semibold text-purple-900 mb-4">Phase 3: Glasgow Coma Scale Assessment</h2>
        <p className="text-purple-700 mb-4">Assess neurological status. GCS ≤8 will trigger neuroprotection protocols.</p>

        {/* Already Intubated Checkbox */}
        <div className="mb-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              {...register('gcs.isAlreadyIntubated')}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="text-sm font-medium text-yellow-800">
              Patient is already intubated
            </label>
          </div>
          {isAlreadyIntubated && (
            <p className="text-xs text-yellow-700 mt-2">
              Verbal response will be recorded as "T" (intubated) and excluded from total calculation
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Eye Response */}
          <div className="space-y-3">
            <h3 className="font-medium text-gray-900">Eye Response (E)</h3>
            <div className="space-y-2">
              {[4, 3, 2, 1].map((score) => (
                <label key={score} className="flex items-center space-x-3 p-2 border rounded hover:bg-purple-25 cursor-pointer">
                  <input
                    type="radio"
                    {...register('gcs.eyeResponse', { valueAsNumber: true })}
                    value={score}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm">
                    <span className="font-medium">{score}:</span> {gcsDescriptions.eye[score as keyof typeof gcsDescriptions.eye]}
                  </span>
                </label>
              ))}
            </div>
            {errors.gcs?.eyeResponse && (
              <p className="text-red-500 text-sm">{errors.gcs.eyeResponse.message as string}</p>
            )}
          </div>

          {/* Verbal Response */}
          <div className="space-y-3">
            <h3 className="font-medium text-gray-900">
              Verbal Response (V)
              {isAlreadyIntubated && <span className="text-yellow-600 ml-2">(T - Intubated)</span>}
            </h3>
            {!isAlreadyIntubated ? (
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((score) => (
                  <label key={score} className="flex items-center space-x-3 p-2 border rounded hover:bg-purple-25 cursor-pointer">
                    <input
                      type="radio"
                      {...register('gcs.verbalResponse', { valueAsNumber: true })}
                      value={score}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm">
                      <span className="font-medium">{score}:</span> {gcsDescriptions.verbal[score as keyof typeof gcsDescriptions.verbal]}
                    </span>
                  </label>
                ))}
              </div>
            ) : (
              <div className="p-3 bg-yellow-100 rounded border">
                <p className="text-sm text-yellow-800">
                  Verbal response cannot be assessed - patient is intubated
                </p>
              </div>
            )}
            {errors.gcs?.verbalResponse && (
              <p className="text-red-500 text-sm">{errors.gcs.verbalResponse.message as string}</p>
            )}
          </div>

          {/* Motor Response */}
          <div className="space-y-3">
            <h3 className="font-medium text-gray-900">Motor Response (M)</h3>
            <div className="space-y-2">
              {[6, 5, 4, 3, 2, 1].map((score) => (
                <label key={score} className="flex items-center space-x-3 p-2 border rounded hover:bg-purple-25 cursor-pointer">
                  <input
                    type="radio"
                    {...register('gcs.motorResponse', { valueAsNumber: true })}
                    value={score}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm">
                    <span className="font-medium">{score}:</span> {gcsDescriptions.motor[score as keyof typeof gcsDescriptions.motor]}
                  </span>
                </label>
              ))}
            </div>
            {errors.gcs?.motorResponse && (
              <p className="text-red-500 text-sm">{errors.gcs.motorResponse.message as string}</p>
            )}
          </div>
        </div>

        {/* GCS Calculation Display */}
        {calculatedValues.totalGCS && (
          <div className="mt-6 p-4 bg-purple-100 rounded-lg">
            <h4 className="font-medium text-purple-800 mb-3">GCS Calculation</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm space-y-1">
                  <div>Eye (E): {eyeResponse || 0}</div>
                  <div>
                    Verbal (V): {isAlreadyIntubated ? 'T' : (verbalResponse || 0)}
                  </div>
                  <div>Motor (M): {motorResponse || 0}</div>
                </div>
              </div>
              <div>
                <div className="text-lg font-bold">
                  Total GCS:
                  <span className={`ml-2 px-3 py-1 rounded-full ${
                    calculatedValues.totalGCS <= 8 ? 'bg-red-100 text-red-800' :
                    calculatedValues.totalGCS <= 12 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {isAlreadyIntubated ?
                      `${eyeResponse || 0} + T + ${motorResponse || 0}` :
                      calculatedValues.totalGCS
                    }
                  </span>
                </div>
                <div className="text-sm mt-2">
                  <span className="font-medium">Interpretation: </span>
                  {calculatedValues.totalGCS <= 8 ? 'Severe brain injury' :
                   calculatedValues.totalGCS <= 12 ? 'Moderate brain injury' :
                   'Mild brain injury'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Critical GCS Alerts */}
        {gcsAlerts.length > 0 && (
          <div className="mt-4 space-y-2">
            <h4 className="font-medium text-purple-800">Neurological Alerts</h4>
            {gcsAlerts.map((alert, index) => (
              <div key={index} className={`p-3 rounded-lg border-l-4 ${
                alert.level === 'critical' ? 'bg-red-50 border-red-400' :
                alert.level === 'warning' ? 'bg-yellow-50 border-yellow-400' :
                'bg-blue-50 border-blue-400'
              }`}>
                <div className="flex items-start">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{alert.title}</p>
                    <p className="text-sm text-gray-700">{alert.message}</p>
                    {alert.actions && alert.actions.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs font-medium text-gray-600 mb-1">Required Actions:</p>
                        <ul className="text-xs text-gray-600 list-disc list-inside space-y-1">
                          {alert.actions.map((action, actionIndex) => (
                            <li key={actionIndex}>{action}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  {alert.level === 'critical' && (
                    <div className="ml-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        CRITICAL
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
