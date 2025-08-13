import React from 'react';
import { useFormContext } from 'react-hook-form';
import { useFormStore } from '../stores/useFormStore';

export default function ComorbiditiesPhase() {
  const { register, watch, formState: { errors } } = useFormContext();
  const { calculatedValues, alerts } = useFormStore();

  const others = watch('comorbidities.others');
  const comorbidities = watch('comorbidities');

  // Filter comorbidity-related alerts
  const comorbidityAlerts = alerts.filter(alert => alert.category === 'medication' || alert.triggers.includes('comorbidity_present'));

  return (
    <div className="space-y-6">
      <div className="bg-orange-50 p-4 rounded-lg">
        <h2 className="text-xl font-semibold text-orange-900 mb-4">Phase 2: Medical History & Comorbidities</h2>
        <p className="text-orange-700 mb-4">Select all conditions that apply. Each selection will trigger specific risk calculations and management protocols.</p>

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

          {/* Ischemic Heart Disease */}
          <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-orange-25">
            <input
              type="checkbox"
              {...register('comorbidities.ischemicHeartDisease')}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="text-sm font-medium text-gray-700">
              Ischemic Heart Disease
            </label>
            {comorbidities?.ischemicHeartDisease && (
              <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                Cardiac risk stratification
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

          {/* Obstructive Lung Disease */}
          <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-orange-25">
            <input
              type="checkbox"
              {...register('comorbidities.obstructiveLungDisease')}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="text-sm font-medium text-gray-700">
              Obstructive Lung Disease (COPD/Asthma)
            </label>
            {comorbidities?.obstructiveLungDisease && (
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                Ventilator optimization
              </span>
            )}
          </div>

          {/* Cerebrovascular Disease */}
          <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-orange-25">
            <input
              type="checkbox"
              {...register('comorbidities.cerebrovascularDisease')}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="text-sm font-medium text-gray-700">
              Cerebrovascular Disease
            </label>
            {comorbidities?.cerebrovascularDisease && (
              <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded">
                ICP monitoring
              </span>
            )}
          </div>

          {/* Hypothyroidism */}
          <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-orange-25">
            <input
              type="checkbox"
              {...register('comorbidities.hypothyroidism')}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="text-sm font-medium text-gray-700">
              Hypothyroidism
            </label>
            {comorbidities?.hypothyroidism && (
              <span className="text-xs bg-cyan-100 text-cyan-800 px-2 py-1 rounded">
                Drug interactions
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
            {errors.comorbidities?.othersText && (
              <p className="text-red-500 text-sm mt-1">{errors.comorbidities.othersText.message as string}</p>
            )}
          </div>
        )}

        {/* Comorbidity Burden Score */}
        {calculatedValues.comorbidityBurden !== undefined && calculatedValues.comorbidityBurden > 0 && (
          <div className="mt-4 p-3 bg-orange-100 rounded-lg">
            <h4 className="font-medium text-orange-800 mb-2">Risk Assessment</h4>
            <div className="flex items-center space-x-4">
              <div>
                <span className="text-sm font-medium">Comorbidity Burden Score:</span>
                <span className={`ml-2 px-3 py-1 rounded-full text-sm font-medium ${
                  calculatedValues.comorbidityBurden <= 2 ? 'bg-green-100 text-green-800' :
                  calculatedValues.comorbidityBurden <= 4 ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {calculatedValues.comorbidityBurden}
                  {calculatedValues.comorbidityBurden <= 2 ? ' (Low Risk)' :
                   calculatedValues.comorbidityBurden <= 4 ? ' (Moderate Risk)' :
                   ' (High Risk)'}
                </span>
              </div>
            </div>
          </div>
        )}

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
