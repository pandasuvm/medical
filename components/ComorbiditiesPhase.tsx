import React from 'react';
import { useFormContext } from 'react-hook-form';
import { useFormStore } from '../stores/useFormStore';

export default function ComorbiditiesPhase() {
  const { register, watch, setValue, formState: { errors } } = useFormContext();
  const { calculatedValues, alerts } = useFormStore();

  const others = watch('comorbidities.others');
  const comorbidities = watch('comorbidities');
  const postIntubationGcs = watch('postIntubationGcs') || {};

  // Filter comorbidity-related alerts
  const comorbidityAlerts = alerts.filter(alert => alert.category === 'medication' || alert.triggers.includes('comorbidity_present'));

  return (
    <div className="space-y-6">
      <div className="bg-orange-50 p-4 rounded-lg">
        <h2 className="text-xl font-semibold text-orange-900 mb-4">Phase 5: Comorbidities & Post-Intubation GCS</h2>
        <p className="text-orange-700 mb-4">Select all comorbidities that apply, then document post-intubation GCS.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Diabetes */}
          <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-orange-25">
            <input
              type="checkbox"
              {...register('comorbidities.diabetes')}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="text-sm font-medium text-gray-700">
              Diabetes Mellitus
            </label>
            {comorbidities?.diabetes && (
              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                Glucose monitoring
              </span>
            )}
          </div>

          {/* Hypertension */}
          <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-orange-25">
            <input
              type="checkbox"
              {...register('comorbidities.hypertension')}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="text-sm font-medium text-gray-700">
              Hypertension
            </label>
            {comorbidities?.hypertension && (
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                BP target modification
              </span>
            )}
          </div>

          {/* Chronic Renal Disease */}
          <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-orange-25">
            <input
              type="checkbox"
              {...register('comorbidities.chronicRenalDisease')}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="text-sm font-medium text-gray-700">
              Chronic Renal Disease
            </label>
            {comorbidities?.chronicRenalDisease && (
              <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                Fluid management caution
              </span>
            )}
          </div>

          {/* Chronic Liver Disease */}
          <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-orange-25">
            <input
              type="checkbox"
              {...register('comorbidities.chronicLiverDisease')}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="text-sm font-medium text-gray-700">
              Chronic Liver Disease
            </label>
            {comorbidities?.chronicLiverDisease && (
              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                Drug metabolism warnings
              </span>
            )}
          </div>

          {/* Reactive Airway Disease */}
          <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-orange-25">
            <input
              type="checkbox"
              {...register('comorbidities.reactiveAirwayDisease')}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="text-sm font-medium text-gray-700">
              Reactive Airway Disease
            </label>
            {comorbidities?.reactiveAirwayDisease && (
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                Ventilator optimization
              </span>
            )}
          </div>

          {/* Others */}
          <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-orange-25">
            <input
              type="checkbox"
              {...register('comorbidities.others')}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="text-sm font-medium text-gray-700">
              Other Comorbidities
            </label>
          </div>
        </div>

        {/* Other Comorbidities Text */}
        {others && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Specify Other Comorbidities *
            </label>
            <textarea
              {...register('comorbidities.othersText')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Please specify other medical conditions..."
            />
            {typeof errors.comorbidities === 'object' && errors.comorbidities !== null && 'othersText' in errors.comorbidities && (errors.comorbidities as any).othersText && (
              <p className="text-red-500 text-sm mt-1">{(errors.comorbidities as any).othersText.message as string}</p>
            )}
          </div>
        )}

        {/* Post-intubation GCS */}
        <div className="mt-4 p-3 bg-white rounded-lg border border-orange-200">
          <h4 className="font-medium text-orange-800 mb-2">GCS Post-Intubation</h4>
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div>
              <label className="block text-xs text-gray-600 mb-1">E</label>
              <select
                {...register('postIntubationGcs.eye')}
                value={postIntubationGcs.eye || ''}
                onChange={(e) =>
                  setValue('postIntubationGcs.eye', e.target.value, {
                    shouldDirty: true,
                    shouldTouch: true
                  })
                }
                className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
              >
                <option value="">-</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">M</label>
              <select
                {...register('postIntubationGcs.motor')}
                value={postIntubationGcs.motor || ''}
                onChange={(e) =>
                  setValue('postIntubationGcs.motor', e.target.value, {
                    shouldDirty: true,
                    shouldTouch: true
                  })
                }
                className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
              >
                <option value="">-</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
                <option value="6">6</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">V</label>
              <select
                {...register('postIntubationGcs.verbal')}
                value={postIntubationGcs.verbal || ''}
                onChange={(e) =>
                  setValue('postIntubationGcs.verbal', e.target.value, {
                    shouldDirty: true,
                    shouldTouch: true
                  })
                }
                className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
              >
                <option value="">-</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
              </select>
            </div>
          </div>
        </div>

        {/* Active Alerts */}
        {comorbidityAlerts.length > 0 && (
          <div className="mt-4 space-y-2">
            <h4 className="font-medium text-orange-800">Clinical Alerts</h4>
            {comorbidityAlerts.map((alert, index) => (
              <div key={index} className={`p-3 rounded-lg border-l-4 ${
                alert.level === 'critical' ? 'bg-red-50 border-red-400' :
                alert.level === 'warning' ? 'bg-yellow-50 border-yellow-400' :
                'bg-blue-50 border-blue-400'
              }`}>
                <div className="flex items-start">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{alert.message}</p>
                    {alert.actions && alert.actions.length > 0 && (
                      <ul className="mt-1 text-xs text-gray-600 list-disc list-inside">
                        {alert.actions.map((action, actionIndex) => (
                          <li key={actionIndex}>{action}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
