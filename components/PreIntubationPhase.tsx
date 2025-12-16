import React from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form';

export default function PreIntubationPhase() {
  const { register, setValue, control, watch } = useFormContext();
  const vasopressorAgent = watch('preIntubationManagement.vasopressorInfusion.agent');
  const sedationAgent = watch('preIntubationManagement.sedationInfusion.agent');
  const { fields: otherMedications, append, remove } = useFieldArray({
    control,
    name: 'preIntubationManagement.otherMedications'
  });

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900 mb-1">
          Phase 4: Pre‑intubation Status & Medication
        </h2>
        <p className="text-xs text-slate-600 mb-4">
          Record induction drugs, paralytics, fluids, pressors, and sedation exactly as on the PROFORMA.
        </p>

        {/* Induction / Sedation Medications */}
        <div className="bg-slate-50 rounded-lg border border-slate-200 p-4 mb-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-3">
            Induction / Sedation Medications
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            {[
              { key: 'etomidate', label: 'Etomidate', unit: 'mg' },
              { key: 'propofol', label: 'Propofol', unit: 'mg' },
              { key: 'ketamine', label: 'Ketamine', unit: 'mg' },
              { key: 'midazolam', label: 'Midazolam', unit: 'mg' },
              { key: 'fentanyl', label: 'Fentanyl', unit: 'mcg' },
              { key: 'succinylcholine', label: 'Succinylcholine', unit: 'mg' },
              { key: 'rocuronium', label: 'Rocuronium', unit: 'mg' },
              { key: 'vecuronium', label: 'Vecuronium', unit: 'mg' },
              { key: 'atracurium', label: 'Atracurium', unit: 'mg' },
              { key: 'cisatracurium', label: 'Cisatracurium', unit: 'mg' }
            ].map((drug) => (
              <div
                key={drug.key}
                className="flex items-center justify-between gap-3 px-3 py-2 rounded-md bg-white hover:bg-slate-50 border border-slate-200"
              >
                <label className="flex items-center gap-2 flex-1">
                  <input
                    type="checkbox"
                    {...register(`preIntubationManagement.${drug.key}.given` as const)}
                    className="h-4 w-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500"
                  />
                  <span className="font-medium text-slate-900">{drug.label}</span>
                </label>

                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    inputMode="decimal"
                    step="any"
                    {...register(`preIntubationManagement.${drug.key}.dose` as const)}
                    onChange={(e) => {
                      const value = e.target.value;
                      const numeric = value === '' ? undefined : Number(value);
                      setValue(`preIntubationManagement.${drug.key}.dose`, numeric, {
                        shouldDirty: true,
                        shouldTouch: true
                      });
                      if (value !== '') {
                        setValue(`preIntubationManagement.${drug.key}.given`, true, {
                          shouldDirty: true,
                          shouldTouch: true
                        });
                      }
                    }}
                    className="w-20 md:w-24 h-9 px-2 py-2 border border-slate-300 rounded-md text-sm text-right focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="0"
                  />
                  <span className="text-xs text-slate-500 min-w-[28px] text-right">
                    {drug.unit}
                  </span>
                </div>
              </div>
            ))}

            {/* Other medication rows */}
            <div className="md:col-span-2 flex flex-col gap-2">
              {otherMedications.map((field, index) => (
                <div
                  key={field.id}
                  className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 px-3 py-3 rounded-md bg-white border border-dashed border-amber-300"
                >
                  <div className="flex flex-col flex-1 gap-1">
                    <label className="text-xs font-medium text-amber-700">
                      Other drug {otherMedications.length > 1 ? `#${index + 1}` : ''} (specify)
                    </label>
                    <input
                      type="text"
                      {...register(`preIntubationManagement.otherMedications.${index}.name` as const)}
                      className="h-9 px-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="Name"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        inputMode="decimal"
                        step="any"
                        {...register(`preIntubationManagement.otherMedications.${index}.dose` as const)}
                        onChange={(e) => {
                          const value = e.target.value;
                          const numeric = value === '' ? undefined : Number(value);
                          setValue(
                            `preIntubationManagement.otherMedications.${index}.dose`,
                            numeric,
                            {
                              shouldDirty: true,
                              shouldTouch: true
                            }
                          );
                          // silently mark as given for consistency with PDF logic
                          if (value !== '') {
                            setValue(
                              `preIntubationManagement.otherMedications.${index}.given`,
                              true,
                              {
                                shouldDirty: true,
                                shouldTouch: true
                              }
                            );
                          }
                        }}
                        className="w-24 h-9 px-2 py-2 border border-slate-300 rounded-md text-sm text-right focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        placeholder="0"
                      />
                      <span className="text-xs text-slate-500 min-w-[40px] text-right">mg/mcg</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="text-xs text-red-500 hover:text-red-600"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={() =>
                  append({
                    name: '',
                    given: false,
                    dose: undefined
                  })
                }
                className="self-start mt-1 text-xs px-3 py-1.5 rounded-md border border-amber-300 text-amber-800 bg-amber-50 hover:bg-amber-100"
              >
                + Add other drug
              </button>
            </div>
          </div>
        </div>

        {/* Pre-Induction Fluids */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 mb-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-3">
            Pre‑induction Fluids
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex flex-wrap gap-4">
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  {...register('preIntubationManagement.preInductionFluids.normalSaline')}
                  className="h-4 w-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500"
                />
                <span>Normal Saline</span>
              </label>
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  {...register('preIntubationManagement.preInductionFluids.ringerLactate')}
                  className="h-4 w-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500"
                />
                <span>Ringer Lactate</span>
              </label>
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  {...register('preIntubationManagement.preInductionFluids.colloids')}
                  className="h-4 w-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500"
                />
                <span>Colloids</span>
              </label>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-slate-600">Total volume</span>
              <input
                type="number"
                inputMode="numeric"
                step="1"
                {...register('preIntubationManagement.preInductionFluids.volumeMl')}
                onChange={(e) => {
                  const value = e.target.value;
                  const numeric = value === '' ? undefined : Number(value);
                  setValue('preIntubationManagement.preInductionFluids.volumeMl', numeric, {
                    shouldDirty: true,
                    shouldTouch: true
                  });
                }}
                className="w-28 h-9 px-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="0"
              />
              <span className="text-xs text-slate-500">mL</span>
            </div>
          </div>
        </div>

        {/* Push-dose pressors & infusions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">
              Push‑dose Pressors
            </h3>
            <div className="space-y-2 text-sm">
              {[
                { key: 'adrenaline', label: 'Adrenaline' },
                { key: 'noradrenaline', label: 'Noradrenaline' },
                { key: 'phenylephrine', label: 'Phenylephrine' },
                { key: 'metaraminol', label: 'Metaraminol' }
              ].map((p) => (
                <label key={p.key} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    {...register(`preIntubationManagement.pushDosePressor.${p.key}` as const)}
                    className="h-4 w-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500"
                  />
                  <span>{p.label}</span>
                </label>
              ))}
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span className="text-xs text-slate-600">Total dose</span>
                <input
                  type="number"
                  inputMode="decimal"
                  step="any"
                  {...register('preIntubationManagement.pushDosePressor.dose')}
                  onChange={(e) => {
                    const value = e.target.value;
                    const numeric = value === '' ? undefined : Number(value);
                    setValue('preIntubationManagement.pushDosePressor.dose', numeric, {
                      shouldDirty: true,
                      shouldTouch: true
                    });
                  }}
                  className="w-28 h-9 px-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="0"
                />
                <span className="text-xs text-slate-500">mcg</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-4 space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-2">
                Vasopressor Infusion
              </h3>
              <div className="flex items-center gap-2 text-sm flex-wrap">
                <select
                  value={vasopressorAgent || 'none'}
                  onChange={(e) =>
                    setValue('preIntubationManagement.vasopressorInfusion.agent', e.target.value, {
                      shouldDirty: true,
                      shouldTouch: true
                    })
                  }
                  className="px-2 py-1 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 min-w-[140px]"
                >
                  <option value="none">None</option>
                  <option value="dopamine">Dopamine</option>
                  <option value="noradrenaline">Noradrenaline</option>
                  <option value="adrenaline">Adrenaline</option>
                </select>
                <input
                  type="number"
                  inputMode="decimal"
                  step="any"
                  {...register('preIntubationManagement.vasopressorInfusion.doseMcgPerKgMin')}
                  onChange={(e) => {
                    const value = e.target.value;
                    const numeric = value === '' ? undefined : Number(value);
                    setValue('preIntubationManagement.vasopressorInfusion.doseMcgPerKgMin', numeric, {
                      shouldDirty: true,
                      shouldTouch: true
                    });
                  }}
                  className="w-32 h-9 px-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="0"
                />
                <span className="text-xs text-slate-500">mcg/kg/min</span>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-2">
                Sedation Infusion
              </h3>
              <div className="flex items-center gap-2 text-sm flex-wrap">
                <select
                  value={sedationAgent || 'none'}
                  onChange={(e) =>
                    setValue('preIntubationManagement.sedationInfusion.agent', e.target.value, {
                      shouldDirty: true,
                      shouldTouch: true
                    })
                  }
                  className="px-2 py-1 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 min-w-[140px]"
                >
                  <option value="none">None</option>
                  <option value="midazolam">Midazolam</option>
                  <option value="fentanyl">Fentanyl</option>
                  <option value="propofol">Propofol</option>
                </select>
                <input
                  type="number"
                  inputMode="decimal"
                  step="any"
                  {...register('preIntubationManagement.sedationInfusion.dose')}
                  onChange={(e) => {
                    const value = e.target.value;
                    const numeric = value === '' ? undefined : Number(value);
                    setValue('preIntubationManagement.sedationInfusion.dose', numeric, {
                      shouldDirty: true,
                      shouldTouch: true
                    });
                  }}
                  className="w-32 h-9 px-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="0"
                />
                <span className="text-xs text-slate-500">mg/hr or mcg/hr</span>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-2">
                Sedation Done (tick one)
              </h3>
              <div className="space-y-1 text-sm">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="midazolamKetamine"
                    {...register('preIntubationManagement.sedationDone')}
                    className="h-4 w-4 text-emerald-600 border-slate-300 focus:ring-emerald-500"
                  />
                  <span>Midazolam / Ketamine</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="propofol"
                    {...register('preIntubationManagement.sedationDone')}
                    className="h-4 w-4 text-emerald-600 border-slate-300 focus:ring-emerald-500"
                  />
                  <span>Propofol</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

