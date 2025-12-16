import React from 'react';
import { useFormContext } from 'react-hook-form';

export default function PostIntubationPhase() {
  const { register, watch, setValue } = useFormContext();
  const ventilatorSettings = watch('ventilatorSettings') || {};
  const postIntubationEvents = watch('postIntubationEvents') || {};

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-emerald-200 shadow-sm">
        <h2 className="text-lg font-semibold text-emerald-900 mb-1">
          Phase 6–7: ETT/CD, Ventilator Settings & Adverse Events
        </h2>
        <p className="text-xs text-emerald-700 mb-4">
          Document ETT/CD value, initial ventilator prescription, any changes, and serious post‑intubation events.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ETT/CD & Ventilator settings */}
          <div className="bg-emerald-50 rounded-lg border border-emerald-200 p-4">
            <h3 className="text-sm font-semibold text-emerald-900 mb-3">
              ETT/CD Value & Ventilator Settings
            </h3>
            <div className="space-y-4 text-sm">
              <div>
                <label className="block text-xs text-gray-600 mb-1">
                  ETT/CD value
                </label>
                <input
                  type="text"
                  {...register('ventilatorSettings.ettCdValue')}
                  value={ventilatorSettings.ettCdValue || ''}
                  onChange={(e) =>
                    setValue('ventilatorSettings.ettCdValue', e.target.value, {
                      shouldDirty: true,
                      shouldTouch: true
                    })
                  }
                  className="w-full h-9 px-3 py-2 border border-emerald-200 rounded-md text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                  placeholder="e.g. 20–22 cm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">
                  Ventilator settings
                </label>
                <textarea
                  {...register('ventilatorSettings.settingsDescription')}
                  value={ventilatorSettings.settingsDescription || ''}
                  onChange={(e) =>
                    setValue('ventilatorSettings.settingsDescription', e.target.value, {
                      shouldDirty: true,
                      shouldTouch: true
                    })
                  }
                  rows={2}
                  className="w-full px-3 py-2 border border-emerald-200 rounded-md text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                  placeholder="e.g. TV 6–8 mL/kg, FiO2 0.6, RR 16, I:E 1:2"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">
                  Mode
                </label>
                <select
                  {...register('ventilatorSettings.mode')}
                  value={ventilatorSettings.mode || ''}
                  onChange={(e) =>
                    setValue('ventilatorSettings.mode', e.target.value, {
                      shouldDirty: true,
                      shouldTouch: true
                    })
                  }
                  className="w-full h-9 px-3 py-2 border border-emerald-200 rounded-md text-sm bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="">Select mode</option>
                  <option value="VCV">VCV</option>
                  <option value="PCV">PCV</option>
                  <option value="SIMV">SIMV</option>
                  <option value="PSV">PSV</option>
                  <option value="Others">Others</option>
                </select>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">PEEP</label>
                  <input
                    type="number"
                    inputMode="decimal"
                    step="any"
                    {...register('ventilatorSettings.peep')}
                    value={ventilatorSettings.peep ?? ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      const numeric = value === '' ? undefined : Number(value);
                      setValue('ventilatorSettings.peep', numeric, {
                        shouldDirty: true,
                        shouldTouch: true
                      });
                    }}
                    className="w-full h-9 px-3 py-2 border border-emerald-200 rounded-md text-sm bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="cmH₂O"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Ppeak</label>
                  <input
                    type="number"
                    inputMode="decimal"
                    step="any"
                    {...register('ventilatorSettings.pPeak')}
                    value={ventilatorSettings.pPeak ?? ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      const numeric = value === '' ? undefined : Number(value);
                      setValue('ventilatorSettings.pPeak', numeric, {
                        shouldDirty: true,
                        shouldTouch: true
                      });
                    }}
                    className="w-full h-9 px-3 py-2 border border-emerald-200 rounded-md text-sm bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="cmH₂O"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">MV</label>
                  <input
                    type="number"
                    inputMode="decimal"
                    step="any"
                    {...register('ventilatorSettings.minuteVentilation')}
                    value={ventilatorSettings.minuteVentilation ?? ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      const numeric = value === '' ? undefined : Number(value);
                      setValue('ventilatorSettings.minuteVentilation', numeric, {
                        shouldDirty: true,
                        shouldTouch: true
                      });
                    }}
                    className="w-full h-9 px-3 py-2 border border-emerald-200 rounded-md text-sm bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="L/min"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">
                  Change in settings if any
                </label>
                <textarea
                  {...register('ventilatorSettings.changeInSettings')}
                  value={ventilatorSettings.changeInSettings || ''}
                  onChange={(e) =>
                    setValue('ventilatorSettings.changeInSettings', e.target.value, {
                      shouldDirty: true,
                      shouldTouch: true
                    })
                  }
                  rows={2}
                  className="w-full px-3 py-2 border border-emerald-200 rounded-md text-sm bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Describe any changes made after initial settings..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Adverse Events */}
        <div className="bg-white rounded-lg border border-emerald-200 p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">
            Adverse Events Post Intubation
          </h3>
          <div className="space-y-3 text-sm">
            <label className="flex items-start gap-2">
              <input
                type="checkbox"
                {...register('postIntubationEvents.postIntubationCardiacArrest')}
                className="mt-1 h-4 w-4 text-emerald-600 border-gray-300 rounded"
              />
              <div className="flex-1">
                <span>Post intubation cardiac arrest</span>
                <textarea
                  {...register('postIntubationEvents.cardiacArrestDetails')}
                  value={postIntubationEvents.cardiacArrestDetails || ''}
                  onChange={(e) =>
                    setValue('postIntubationEvents.cardiacArrestDetails', e.target.value, {
                      shouldDirty: true,
                      shouldTouch: true
                    })
                  }
                  rows={2}
                  className="mt-1 w-full px-2 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                  placeholder="Describe event..."
                />
              </div>
            </label>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Any other serious adverse events post intubation
              </label>
              <textarea
                {...register('postIntubationEvents.otherSeriousAdverseEvents')}
                value={postIntubationEvents.otherSeriousAdverseEvents || ''}
                onChange={(e) =>
                  setValue('postIntubationEvents.otherSeriousAdverseEvents', e.target.value, {
                    shouldDirty: true,
                    shouldTouch: true
                  })
                }
                rows={3}
                className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                placeholder="Describe events..."
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


