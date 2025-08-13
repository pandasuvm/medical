import React from 'react';
import { useFormContext } from 'react-hook-form';
import { useFormStore } from '../stores/useFormStore';

export default function IndicationPhase() {
  const { register, watch, formState: { errors } } = useFormContext();
  const { alerts, activeProtocols } = useFormStore();

  const category = watch('indication.category');
  const traumaIndications = watch('indication.trauma');
  const medicalIndications = watch('indication.medical');

  // Filter indication-based alerts
  const indicationAlerts = alerts.filter(alert =>
    alert.category === 'procedural' || alert.category === 'airway' ||
    alert.triggers.some(trigger => trigger.includes('sepsis') || trigger.includes('head_injury'))
  );

  return (
    <div className="space-y-6">
      <div className="bg-red-50 p-4 rounded-lg border-2 border-red-200">
        <h2 className="text-xl font-semibold text-red-900 mb-4">Phase 4: Indication for Intubation - CRITICAL BRANCHING POINT</h2>
        <p className="text-red-700 mb-4 font-medium">
          This selection determines specific protocols, medications, and monitoring requirements.
          Each indication triggers automated clinical decision support.
        </p>

        {/* Category Selection */}
        <div className="mb-6">
          <h3 className="font-medium text-red-800 mb-3">Primary Category *</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex items-center space-x-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-red-25 border-red-200">
              <input
                type="radio"
                {...register('indication.category')}
                value="trauma"
                className="h-5 w-5 text-red-600 focus:ring-red-500"
              />
              <div>
                <div className="font-medium text-gray-900">Trauma</div>
                <div className="text-sm text-gray-600">Injury-related indications</div>
              </div>
            </label>

            <label className="flex items-center space-x-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-red-25 border-red-200">
              <input
                type="radio"
                {...register('indication.category')}
                value="medical"
                className="h-5 w-5 text-red-600 focus:ring-red-500"
              />
              <div>
                <div className="font-medium text-gray-900">Medical</div>
                <div className="text-sm text-gray-600">Medical condition indications</div>
              </div>
            </label>
          </div>
          {errors.indication && (
            <p className="text-red-500 text-sm mt-2">{(errors.indication as any).message || 'Invalid selection'}</p>
          )}
        </div>

        {/* Trauma Indications */}
        {category === 'trauma' && (
          <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
            <h3 className="font-medium text-orange-800 mb-4">Trauma Indications (Select all that apply)</h3>
            <div className="space-y-3">

              <label className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-orange-25 cursor-pointer">
                <input
                  type="checkbox"
                  {...register('indication.trauma.headInjuryReducedSensorium')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">Head injury - Reduced sensorium</div>
                  <div className="text-sm text-gray-600">Triggers: ICP monitoring, CT priority, neuroprotection protocol</div>
                  {traumaIndications?.headInjuryReducedSensorium && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Propofol preferred</span>
                      <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">ICP monitoring</span>
                    </div>
                  )}
                </div>
              </label>

              <label className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-orange-25 cursor-pointer">
                <input
                  type="checkbox"
                  {...register('indication.trauma.headInjuryAirwayThreatened')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">Head injury - Airway threatened</div>
                  <div className="text-sm text-gray-600">Triggers: C-spine precautions, video laryngoscopy, surgical airway backup</div>
                  {traumaIndications?.headInjuryAirwayThreatened && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">C-spine precautions</span>
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Video laryngoscopy</span>
                    </div>
                  )}
                </div>
              </label>

              <label className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-orange-25 cursor-pointer">
                <input
                  type="checkbox"
                  {...register('indication.trauma.neckFacialTrauma')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">Neck/Facial trauma</div>
                  <div className="text-sm text-gray-600">Triggers: Awake intubation, ENT consultation, emergency cricothyrotomy</div>
                  {traumaIndications?.neckFacialTrauma && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">Awake intubation</span>
                      <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">ENT consult</span>
                    </div>
                  )}
                </div>
              </label>

              <label className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-orange-25 cursor-pointer">
                <input
                  type="checkbox"
                  {...register('indication.trauma.burnInhalation')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">Burn/Inhalation injury</div>
                  <div className="text-sm text-gray-600">Triggers: Early intubation, airway edema monitoring, special ventilator settings</div>
                  {traumaIndications?.burnInhalation && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">Early intubation</span>
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Large ETT</span>
                    </div>
                  )}
                </div>
              </label>

              <label className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-orange-25 cursor-pointer">
                <input
                  type="checkbox"
                  {...register('indication.trauma.chestTrauma')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">Chest trauma</div>
                  <div className="text-sm text-gray-600">Triggers: Pneumothorax screening, chest tube consideration, PEEP limitations</div>
                  {traumaIndications?.chestTrauma && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Pneumothorax screen</span>
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">PEEP limits</span>
                    </div>
                  )}
                </div>
              </label>

              <label className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-orange-25 cursor-pointer">
                <input
                  type="checkbox"
                  {...register('indication.trauma.drowning')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">Drowning</div>
                  <div className="text-sm text-gray-600">Triggers: Hypothermia protocol, pulmonary edema management, neurological monitoring</div>
                  {traumaIndications?.drowning && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      <span className="text-xs bg-cyan-100 text-cyan-800 px-2 py-1 rounded">Hypothermia protocol</span>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Pulmonary edema</span>
                    </div>
                  )}
                </div>
              </label>
            </div>
          </div>
        )}

        {/* Medical Indications */}
        {category === 'medical' && (
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="font-medium text-blue-800 mb-4">Medical Indications (Select all that apply)</h3>
            <div className="space-y-3">

              <label className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-blue-25 cursor-pointer">
                <input
                  type="checkbox"
                  {...register('indication.medical.respiratoryFailure')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">Respiratory failure</div>
                  <div className="text-sm text-gray-600">Triggers: ARDS protocol, prone positioning, ECMO criteria assessment</div>
                  {medicalIndications?.respiratoryFailure && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Ketamine preferred</span>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">ARDS protocol</span>
                    </div>
                  )}
                </div>
              </label>

              <label className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-blue-25 cursor-pointer">
                <input
                  type="checkbox"
                  {...register('indication.medical.sepsis')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">Sepsis</div>
                  <div className="text-sm text-gray-600">Triggers: Sepsis bundle, fluid resuscitation, vasopressor preparation</div>
                  {medicalIndications?.sepsis && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">Etomidate preferred</span>
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Sepsis bundle</span>
                      <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">Vasopressors ready</span>
                    </div>
                  )}
                </div>
              </label>

              <label className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-blue-25 cursor-pointer">
                <input
                  type="checkbox"
                  {...register('indication.medical.anaphylaxis')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">Anaphylaxis</div>
                  <div className="text-sm text-gray-600">Triggers: Epinephrine protocol, steroid administration, H1/H2 blockers</div>
                  {medicalIndications?.anaphylaxis && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">Epinephrine 1:1000</span>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">IV steroids</span>
                    </div>
                  )}
                </div>
              </label>

              <label className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-blue-25 cursor-pointer">
                <input
                  type="checkbox"
                  {...register('indication.medical.cardiacFailure')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">Cardiac failure</div>
                  <div className="text-sm text-gray-600">Triggers: Preload reduction, inotrope preparation, mechanical support consideration</div>
                  {medicalIndications?.cardiacFailure && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">Etomidate preferred</span>
                      <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">Inotropes ready</span>
                    </div>
                  )}
                </div>
              </label>

              <label className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-blue-25 cursor-pointer">
                <input
                  type="checkbox"
                  {...register('indication.medical.giBleed')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">GI Bleed</div>
                  <div className="text-sm text-gray-600">Triggers: Blood products, aspiration precautions, rapid sequence with cricoid</div>
                  {medicalIndications?.giBleed && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">Blood products</span>
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Cricoid pressure</span>
                    </div>
                  )}
                </div>
              </label>

              <label className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-blue-25 cursor-pointer">
                <input
                  type="checkbox"
                  {...register('indication.medical.ichStroke')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">ICH/Stroke</div>
                  <div className="text-sm text-gray-600">Triggers: ICP management, BP targets, anticoagulation reversal</div>
                  {medicalIndications?.ichStroke && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Propofol preferred</span>
                      <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">ICP management</span>
                    </div>
                  )}
                </div>
              </label>

              <label className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-blue-25 cursor-pointer">
                <input
                  type="checkbox"
                  {...register('indication.medical.seizure')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">Seizure</div>
                  <div className="text-sm text-gray-600">Triggers: Antiepileptic protocol, status epilepticus management, EEG monitoring</div>
                  {medicalIndications?.seizure && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Antiepileptics</span>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">EEG monitoring</span>
                    </div>
                  )}
                </div>
              </label>
            </div>
          </div>
        )}

        {/* Active Protocols */}
        {activeProtocols.length > 0 && (
          <div className="mt-6 bg-green-50 p-4 rounded-lg border border-green-200">
            <h4 className="font-medium text-green-800 mb-3">Activated Protocols</h4>
            <div className="space-y-3">
              {activeProtocols.map((protocol, index) => (
                <div key={index} className="bg-white p-3 rounded border border-green-200">
                  <h5 className="font-medium text-gray-900">{protocol.name}</h5>
                  <p className="text-sm text-gray-600 mb-2">{protocol.indication}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    {protocol.steps && (
                      <div>
                        <span className="font-medium text-gray-700">Steps:</span>
                        <ul className="list-disc list-inside text-gray-600 mt-1">
                          {protocol.steps.slice(0, 3).map((step, stepIndex) => (
                            <li key={stepIndex}>{step}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {protocol.consultations && (
                      <div>
                        <span className="font-medium text-gray-700">Consultations:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {protocol.consultations.map((consult, consultIndex) => (
                            <span key={consultIndex} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              {consult}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Critical Alerts */}
        {indicationAlerts.length > 0 && (
          <div className="mt-4 space-y-2">
            <h4 className="font-medium text-red-800">Critical Alerts & Actions Required</h4>
            {indicationAlerts.map((alert, index) => (
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
                        <p className="text-xs font-medium text-gray-600 mb-1">Immediate Actions:</p>
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
                        URGENT
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
