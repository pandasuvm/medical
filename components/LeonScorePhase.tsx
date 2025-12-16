import React from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { useFormStore } from '../stores/useFormStore';

export default function LeonScorePhase() {
  const { register, watch, control, formState: { errors } } = useFormContext();
  const { calculatedValues, alerts } = useFormStore();

  const leonValues = watch('leonScore');
  const airwayStatus = watch('airwayStatus');

  // Filter LEON/airway-related alerts
  const airwayAlerts = alerts.filter(alert => alert.category === 'airway');

  // LEON score interpretation
  const getLeonInterpretation = (score: number) => {
    if (score <= 1) {
      return {
        risk: 'Low',
        color: 'green',
        approach: 'Standard intubation approach',
        recommendations: ['Direct laryngoscopy acceptable', 'Standard preparation sufficient']
      };
    } else if (score <= 3) {
      return {
        risk: 'Moderate',
        color: 'yellow',
        approach: 'Enhanced preparation recommended',
        recommendations: [
          'Video laryngoscopy preferred',
          'Experienced intubator',
          'Backup airway devices ready',
          'Consider smaller ETT size'
        ]
      };
    } else {
      return {
        risk: 'High',
        color: 'red',
        approach: 'High-risk airway protocol',
        recommendations: [
          'Awake intubation consideration',
          'ENT consultation',
          'Emergency cricothyrotomy setup',
          'Anesthesia backup',
          'Operating room consideration'
        ]
      };
    }
  };

  const currentInterpretation = calculatedValues.leonTotalScore !== undefined ?
    getLeonInterpretation(calculatedValues.leonTotalScore) : null;

  return (
    <div className="space-y-6">
      <div className="bg-indigo-50 p-4 rounded-lg">
        <h2 className="text-xl font-semibold text-indigo-900 mb-4">Phase 5: Airway Assessment & LEON Score</h2>
        <p className="text-indigo-700 mb-4">
          Pre-intubation airway status and LEON score to predict difficult airway. Score ≥2 triggers enhanced preparation protocols.
        </p>

        {/* Pre-intubation Airway Status */}
        <div className="mb-6 bg-white p-4 rounded-lg border border-indigo-200">
          <h3 className="font-medium text-gray-900 mb-3">Pre-intubation Airway Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <label className="flex items-start space-x-2">
              <input
                type="checkbox"
                {...register('airwayStatus.failureToMaintainProtectAirway')}
                className="mt-1 h-4 w-4 text-indigo-600 border-gray-300 rounded"
              />
              <span>Failure to maintain or protect airway</span>
            </label>
            <label className="flex items-start space-x-2">
              <input
                type="checkbox"
                {...register('airwayStatus.failureOfVentilationOxygenation')}
                className="mt-1 h-4 w-4 text-indigo-600 border-gray-300 rounded"
              />
              <span>Failure of ventilation / oxygenation</span>
            </label>
            <label className="flex items-start space-x-2">
              <input
                type="checkbox"
                {...register('airwayStatus.deteriorationAnticipated')}
                className="mt-1 h-4 w-4 text-indigo-600 border-gray-300 rounded"
              />
              <span>Deterioration anticipated</span>
            </label>
            <label className="flex items-start space-x-2">
              <input
                type="checkbox"
                {...register('airwayStatus.predictorForDifficultAirway')}
                className="mt-1 h-4 w-4 text-indigo-600 border-gray-300 rounded"
              />
              <span>Predictor for difficult airway (Y/N)</span>
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Large Tongue */}
          <div className="bg-white p-4 rounded-lg border border-indigo-200">
            <h3 className="font-medium text-gray-900 mb-3">L - Large Tongue</h3>
            <p className="text-sm text-gray-600 mb-3">
              Assess relative tongue size compared to oral cavity
            </p>
            <Controller
              name="leonScore.largeTongue"
              control={control}
              render={({ field }) => (
                <div className="space-y-2">
                  <label className="flex items-center space-x-3 p-2 border rounded hover:bg-indigo-25 cursor-pointer">
                    <input
                      type="radio"
                      name={field.name}
                      value="0"
                      checked={Number(field.value) === 0}
                      onChange={() => field.onChange(0)}
                      onBlur={field.onBlur}
                      ref={field.ref}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm">
                      <span className="font-medium">0:</span> Normal tongue size
                    </span>
                  </label>
                  <label className="flex items-center space-x-3 p-2 border rounded hover:bg-indigo-25 cursor-pointer">
                    <input
                      type="radio"
                      name={field.name}
                      value="1"
                      checked={Number(field.value) === 1}
                      onChange={() => field.onChange(1)}
                      onBlur={field.onBlur}
                      ref={field.ref}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm">
                      <span className="font-medium">1:</span> Large tongue (fills oral cavity)
                    </span>
                  </label>
                </div>
              )}
            />
            {(errors.leonScore as any)?.largeTongue && (
              <p className="text-red-500 text-sm mt-1">{(errors.leonScore as any).largeTongue.message}</p>
            )}
          </div>

          {/* Thyromental Distance */}
          <div className="bg-white p-4 rounded-lg border border-indigo-200">
            <h3 className="font-medium text-gray-900 mb-3">E - Thyromental Distance</h3>
            <p className="text-sm text-gray-600 mb-3">
              Distance from thyroid cartilage to mental symphysis
            </p>
            <Controller
              name="leonScore.thyroMentalDistance"
              control={control}
              render={({ field }) => (
                <div className="space-y-2">
                  <label className="flex items-center space-x-3 p-2 border rounded hover:bg-indigo-25 cursor-pointer">
                    <input
                      type="radio"
                      name={field.name}
                      value="0"
                      checked={Number(field.value) === 0}
                      onChange={() => field.onChange(0)}
                      onBlur={field.onBlur}
                      ref={field.ref}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm">
                      <span className="font-medium">0:</span> ≥3 finger breadths (&gt;6.5 cm)
                    </span>
                  </label>
                  <label className="flex items-center space-x-3 p-2 border rounded hover:bg-indigo-25 cursor-pointer">
                    <input
                      type="radio"
                      name={field.name}
                      value="1"
                      checked={Number(field.value) === 1}
                      onChange={() => field.onChange(1)}
                      onBlur={field.onBlur}
                      ref={field.ref}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm">
                      <span className="font-medium">1:</span> &lt;3 finger breadths (&lt;6.5 cm)
                    </span>
                  </label>
                </div>
              )}
            />
            {(errors.leonScore as any)?.thyroMentalDistance && (
              <p className="text-red-500 text-sm mt-1">{(errors.leonScore as any).thyroMentalDistance.message}</p>
            )}
          </div>

          {/* Obstruction */}
          <div className="bg-white p-4 rounded-lg border border-indigo-200">
            <h3 className="font-medium text-gray-900 mb-3">O - Obstruction</h3>
            <p className="text-sm text-gray-600 mb-3">
              Upper airway obstruction or abnormal anatomy
            </p>
            <Controller
              name="leonScore.obstruction"
              control={control}
              render={({ field }) => (
                <div className="space-y-2">
                  <label className="flex items-center space-x-3 p-2 border rounded hover:bg-indigo-25 cursor-pointer">
                    <input
                      type="radio"
                      name={field.name}
                      value="0"
                      checked={Number(field.value) === 0}
                      onChange={() => field.onChange(0)}
                      onBlur={field.onBlur}
                      ref={field.ref}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm">
                      <span className="font-medium">0:</span> No obstruction/normal anatomy
                    </span>
                  </label>
                  <label className="flex items-center space-x-3 p-2 border rounded hover:bg-indigo-25 cursor-pointer">
                    <input
                      type="radio"
                      name={field.name}
                      value="1"
                      checked={Number(field.value) === 1}
                      onChange={() => field.onChange(1)}
                      onBlur={field.onBlur}
                      ref={field.ref}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm">
                      <span className="font-medium">1:</span> Obstruction present (swelling, mass, blood)
                    </span>
                  </label>
                </div>
              )}
            />
            {(errors.leonScore as any)?.obstruction && (
              <p className="text-red-500 text-sm mt-1">{(errors.leonScore as any).obstruction.message}</p>
            )}
          </div>

          {/* Neck Mobility */}
          <div className="bg-white p-4 rounded-lg border border-indigo-200">
            <h3 className="font-medium text-gray-900 mb-3">N - Neck Mobility</h3>
            <p className="text-sm text-gray-600 mb-3">
              Cervical spine extension ability
            </p>
            <Controller
              name="leonScore.neckMobility"
              control={control}
              render={({ field }) => (
                <div className="space-y-2">
                  <label className="flex items-center space-x-3 p-2 border rounded hover:bg-indigo-25 cursor-pointer">
                    <input
                      type="radio"
                      name={field.name}
                      value="0"
                      checked={Number(field.value) === 0}
                      onChange={() => field.onChange(0)}
                      onBlur={field.onBlur}
                      ref={field.ref}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm">
                      <span className="font-medium">0:</span> Normal neck extension
                    </span>
                  </label>
                  <label className="flex items-center space-x-3 p-2 border rounded hover:bg-indigo-25 cursor-pointer">
                    <input
                      type="radio"
                      name={field.name}
                      value="1"
                      checked={Number(field.value) === 1}
                      onChange={() => field.onChange(1)}
                      onBlur={field.onBlur}
                      ref={field.ref}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm">
                      <span className="font-medium">1:</span> Limited neck extension
                    </span>
                  </label>
                </div>
              )}
            />
            {(errors.leonScore as any)?.neckMobility && (
              <p className="text-red-500 text-sm mt-1">{(errors.leonScore as any).neckMobility.message}</p>
            )}
          </div>
        </div>

        {/* LEON Score Result */}
        {calculatedValues.leonTotalScore !== undefined && currentInterpretation && (
          <div className="mt-6 p-4 bg-white rounded-lg border-2 border-indigo-200">
            <h4 className="font-medium text-indigo-800 mb-3">LEON Score Assessment</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-lg font-bold">
                  Total LEON Score:
                  <span className={`ml-2 px-3 py-1 rounded-full bg-${currentInterpretation.color}-100 text-${currentInterpretation.color}-800`}>
                    {calculatedValues.leonTotalScore}
                  </span>
                </div>
                <div className="text-sm mt-2">
                  <span className="font-medium">Risk Level: </span>
                  <span className={`text-${currentInterpretation.color}-700 font-medium`}>
                    {currentInterpretation.risk}
                  </span>
                </div>
                <div className="text-sm mt-1">
                  <span className="font-medium">Approach: </span>
                  {currentInterpretation.approach}
                </div>
              </div>
              <div>
                <h5 className="font-medium text-gray-800 mb-2">Recommendations:</h5>
                <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                  {currentInterpretation.recommendations.map((rec, index) => (
                    <li key={index}>{rec}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Component breakdown */}
            <div className="mt-4 pt-3 border-t border-gray-200">
              <h5 className="font-medium text-gray-800 mb-2">Score Breakdown:</h5>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                <div>L: {leonValues?.largeTongue || 0}</div>
                <div>E: {leonValues?.thyroMentalDistance || 0}</div>
                <div>O: {leonValues?.obstruction || 0}</div>
                <div>N: {leonValues?.neckMobility || 0}</div>
              </div>
            </div>
          </div>
        )}

        {/* Airway Management Alerts */}
        {airwayAlerts.length > 0 && (
          <div className="mt-4 space-y-2">
            <h4 className="font-medium text-indigo-800">Airway Management Alerts</h4>
            {airwayAlerts.map((alert, index) => (
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
                        <p className="text-xs font-medium text-gray-600 mb-1">Preparation Required:</p>
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
                        HIGH RISK
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Equipment Preparation Checklist */}
        {calculatedValues.leonTotalScore !== undefined && calculatedValues.leonTotalScore >= 2 && (
          <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <h4 className="font-medium text-yellow-800 mb-3">Equipment Preparation Checklist</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h5 className="font-medium text-gray-800 mb-2">Required Equipment:</h5>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>✓ Video laryngoscope (C-MAC/GlideScope)</li>
                  <li>✓ Multiple ETT sizes (6.0, 6.5, 7.0)</li>
                  <li>✓ Bougie/stylet</li>
                  <li>✓ LMA as backup</li>
                  {calculatedValues.leonTotalScore >= 4 && (
                    <>
                      <li>✓ Flexible bronchoscope</li>
                      <li>✓ Cricothyrotomy kit</li>
                      <li>✓ Jet ventilation setup</li>
                    </>
                  )}
                </ul>
              </div>
              <div>
                <h5 className="font-medium text-gray-800 mb-2">Personnel:</h5>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>✓ Experienced intubator</li>
                  <li>✓ Airway assistant</li>
                  {calculatedValues.leonTotalScore >= 4 && (
                    <>
                      <li>✓ ENT on standby</li>
                      <li>✓ Anesthesia backup</li>
                      <li>✓ OR team notification</li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
