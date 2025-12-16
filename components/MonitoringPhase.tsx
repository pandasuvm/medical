import React from 'react';
import { useFormContext } from 'react-hook-form';
import { useFormStore } from '../stores/useFormStore';

export default function MonitoringPhase() {
  const { watch, setValue } = useFormContext();
  const { timerActive, elapsedTime } = useFormStore();

  const preVitals = watch('preInductionVitals') || {};
  const monitoring = watch('monitoringTable') || {};
  const calculated = watch('calculatedValues') || {};

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const timepoints = [
    { id: 'pre', label: 'Pre Induction' },
    { id: 'post5', label: 'Post 5 min' },
    { id: 'post10', label: 'Post 10 min' },
    { id: 'post15', label: 'Post 15 min' },
    { id: 'post30', label: 'Post 30 min' }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-cyan-200 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
          <div>
            <h2 className="text-lg font-semibold text-cyan-900">
              Phase 9: Pre‑induction Hemodynamics & Lab Values
            </h2>
            <p className="text-xs text-cyan-700">
              Record pre‑induction values and serial hemodynamics at 5, 10, 15 and 30 minutes post‑induction.
            </p>
          </div>
          <div className="text-xs text-gray-600 bg-cyan-50 border border-cyan-100 rounded-lg px-3 py-2 flex items-center gap-2">
            <span className="font-semibold text-cyan-900">Session timer:</span>
            <span className="font-mono text-cyan-800">
              {timerActive ? formatTime(elapsedTime) : 'Not started'}
            </span>
          </div>
        </div>

        {/* Hemodynamic Parameters - Desktop Table */}
        <div className="mb-4 hidden md:block">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">
            Hemodynamic Parameters
          </h3>
          <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
            <div className="min-w-[720px]">
              {/* Header row */}
              <div className="grid grid-cols-6 bg-cyan-50 border-b border-gray-200 text-[11px] font-semibold text-gray-700">
                <div className="px-3 py-2 border-r border-gray-200">Parameter</div>
                {timepoints.map(tp => (
                  <div key={tp.id} className="px-3 py-2 border-r border-gray-200 text-center">
                    {tp.label}
                  </div>
                ))}
              </div>

              {/* Heart Rate */}
              <div className="grid grid-cols-6 text-xs border-b border-gray-100">
                <div className="px-3 py-2 border-r border-gray-200 font-medium bg-gray-50">
                  Heart Rate (bpm)
                </div>
                {/* Pre-induction (read-only from preInductionVitals) */}
                <div className="px-3 py-2 border-r border-gray-100 flex items-center justify-center text-sm">
                  <span className="text-gray-800">
                    {preVitals.heartRate || '-'}
                  </span>
                </div>
                {/* Post timepoints */}
                {['post5','post10','post15','post30'].map(tp => (
                  <div key={tp} className="px-3 py-2 border-r border-gray-100 flex items-center justify-center">
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={(monitoring as any)[tp]?.heartRate || ''}
                      onChange={(e) =>
                        setValue(`monitoringTable.${tp}.heartRate`, e.target.value, {
                          shouldDirty: true,
                          shouldTouch: true
                        })
                      }
                      className="w-20 h-8 px-2 py-1 border border-gray-300 rounded text-xs text-center"
                    />
                  </div>
                ))}
              </div>

              {/* Blood Pressure */}
              <div className="grid grid-cols-6 text-xs border-b border-gray-100">
                <div className="px-3 py-2 border-r border-gray-200 font-medium bg-gray-50">
                  Blood Pressure (mmHg)
                </div>
                {/* Pre-induction BP */}
                <div className="px-3 py-2 border-r border-gray-100 flex flex-col items-center justify-center text-xs">
                  <span className="text-gray-800">
                    {preVitals.systolicBP || '-'} / {preVitals.diastolicBP || '-'}
                  </span>
                </div>
                {/* Post BP cells */}
                {['post5','post10','post15','post30'].map(tp => (
                  <div key={tp} className="px-3 py-2 border-r border-gray-100 flex flex-col items-center justify-center gap-1">
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={(monitoring as any)[tp]?.systolicBP || ''}
                      onChange={(e) =>
                        setValue(`monitoringTable.${tp}.systolicBP`, e.target.value, {
                          shouldDirty: true,
                          shouldTouch: true
                        })
                      }
                      className="w-20 h-7 px-2 py-1 border border-gray-300 rounded text-xs text-center"
                      placeholder="SBP"
                    />
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={(monitoring as any)[tp]?.diastolicBP || ''}
                      onChange={(e) =>
                        setValue(`monitoringTable.${tp}.diastolicBP`, e.target.value, {
                          shouldDirty: true,
                          shouldTouch: true
                        })
                      }
                      className="w-20 h-7 px-2 py-1 border border-gray-300 rounded text-xs text-center"
                      placeholder="DBP"
                    />
                  </div>
                ))}
              </div>

              {/* SpO2 */}
              <div className="grid grid-cols-6 text-xs border-b border-gray-100">
                <div className="px-3 py-2 border-r border-gray-200 font-medium bg-gray-50">
                  SpO₂ (%)
                </div>
                <div className="px-3 py-2 border-r border-gray-100 flex items-center justify-center text-sm">
                  <span className="text-gray-800">
                    {preVitals.spo2 || '-'}
                  </span>
                </div>
                {['post5','post10','post15','post30'].map(tp => (
                  <div key={tp} className="px-3 py-2 border-r border-gray-100 flex items-center justify-center">
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={(monitoring as any)[tp]?.spo2 || ''}
                      onChange={(e) =>
                        setValue(`monitoringTable.${tp}.spo2`, e.target.value, {
                          shouldDirty: true,
                          shouldTouch: true
                        })
                      }
                      className="w-20 h-8 px-2 py-1 border border-gray-300 rounded text-xs text-center"
                    />
                  </div>
                ))}
              </div>

              {/* Modified Shock Index */}
              <div className="grid grid-cols-6 text-xs">
                <div className="px-3 py-2 border-r border-gray-200 font-medium bg-gray-50">
                  Modified shock index
                </div>
                <div className="px-3 py-2 border-r border-gray-100 flex items-center justify-center text-sm">
                  <span className="text-gray-800">
                    {calculated?.modifiedShockIndex !== undefined
                      ? calculated.modifiedShockIndex.toFixed(2)
                      : '-'}
                  </span>
                </div>
                {['post5','post10','post15','post30'].map(tp => (
                  <div key={tp} className="px-3 py-2 border-r border-gray-100 flex items-center justify-center">
                    <input
                      type="text"
                      inputMode="decimal"
                      value={(monitoring as any).modifiedShockIndex?.[tp] || ''}
                      onChange={(e) =>
                        setValue(`monitoringTable.modifiedShockIndex.${tp}`, e.target.value, {
                          shouldDirty: true,
                          shouldTouch: true
                        })
                      }
                      className="w-20 h-8 px-2 py-1 border border-gray-300 rounded text-xs text-center"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Hemodynamic Parameters - Mobile Cards */}
        <div className="mb-2 space-y-3 md:hidden">
          <h3 className="text-sm font-semibold text-gray-900 mb-1">
            Hemodynamic Parameters
          </h3>

          {/* Pre-induction card (read-only) */}
          <div className="border border-gray-200 rounded-lg bg-gray-50 p-3 text-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-gray-800">Pre Induction</span>
              <span className="text-gray-500 text-[11px]">Baseline</span>
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <span className="text-gray-600">Heart Rate (bpm)</span>
                <span className="font-medium text-gray-900">{preVitals.heartRate || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">BP (mmHg)</span>
                <span className="font-medium text-gray-900">
                  {preVitals.systolicBP || '-'} / {preVitals.diastolicBP || '-'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">SpO₂ (%)</span>
                <span className="font-medium text-gray-900">{preVitals.spo2 || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Modified shock index</span>
                <span className="font-medium text-gray-900">
                  {calculated?.modifiedShockIndex !== undefined
                    ? calculated.modifiedShockIndex.toFixed(2)
                    : '-'}
                </span>
              </div>
            </div>
          </div>

          {/* Post-induction timepoint cards */}
          {['post5','post10','post15','post30'].map(tp => {
            const label =
              tp === 'post5' ? 'Post 5 minutes' :
              tp === 'post10' ? 'Post 10 minutes' :
              tp === 'post15' ? 'Post 15 minutes' :
              'Post 30 minutes';

            return (
              <div
                key={tp}
                className="border border-cyan-100 rounded-lg bg-white p-3 text-xs shadow-sm"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-cyan-900">{label}</span>
                </div>
                <div className="space-y-2">
                  <div>
                    <label className="block text-[11px] text-gray-600 mb-0.5">
                      Heart Rate (bpm)
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={(monitoring as any)[tp]?.heartRate || ''}
                      onChange={(e) =>
                        setValue(`monitoringTable.${tp}.heartRate`, e.target.value, {
                          shouldDirty: true,
                          shouldTouch: true
                        })
                      }
                      className="w-full h-8 px-2 py-1 border border-gray-300 rounded text-xs"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] text-gray-600 mb-0.5">
                        SBP (mmHg)
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={(monitoring as any)[tp]?.systolicBP || ''}
                        onChange={(e) =>
                          setValue(`monitoringTable.${tp}.systolicBP`, e.target.value, {
                            shouldDirty: true,
                            shouldTouch: true
                          })
                        }
                        className="w-full h-8 px-2 py-1 border border-gray-300 rounded text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-gray-600 mb-0.5">
                        DBP (mmHg)
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={(monitoring as any)[tp]?.diastolicBP || ''}
                        onChange={(e) =>
                          setValue(`monitoringTable.${tp}.diastolicBP`, e.target.value, {
                            shouldDirty: true,
                            shouldTouch: true
                          })
                        }
                        className="w-full h-8 px-2 py-1 border border-gray-300 rounded text-xs"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] text-gray-600 mb-0.5">
                      SpO₂ (%)
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={(monitoring as any)[tp]?.spo2 || ''}
                      onChange={(e) =>
                        setValue(`monitoringTable.${tp}.spo2`, e.target.value, {
                          shouldDirty: true,
                          shouldTouch: true
                        })
                      }
                      className="w-full h-8 px-2 py-1 border border-gray-300 rounded text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-gray-600 mb-0.5">
                      Modified shock index
                    </label>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={(monitoring as any).modifiedShockIndex?.[tp] || ''}
                      onChange={(e) =>
                        setValue(`monitoringTable.modifiedShockIndex.${tp}`, e.target.value, {
                          shouldDirty: true,
                          shouldTouch: true
                        })
                      }
                      className="w-full h-8 px-2 py-1 border border-gray-300 rounded text-xs"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
