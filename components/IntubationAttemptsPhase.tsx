import React from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form';

export default function IntubationAttemptsPhase() {
  const { register, control, watch } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'intubationAttempts'
  });

  const attempts = watch('intubationAttempts') || [];
  const totalAttempts = attempts?.length
    ? attempts.filter((a: any) => a && (a.yearsExperience || a.laryngoscopeType)).length
    : 0;

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-sky-200 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-3">
          <div>
            <h2 className="text-lg font-semibold text-sky-900">
              Phase 8: Intubation Attempts
            </h2>
            <p className="text-xs text-sky-700">
              Document each attempt (up to 3) including operator experience, device, and any adjuncts or changes.
            </p>
          </div>
          <div className="text-xs text-gray-600 bg-sky-50 border border-sky-100 rounded-lg px-3 py-2 flex items-center gap-2">
            <span className="font-semibold text-sky-900">T (Total attempts):</span>
            <span className="font-mono text-sky-800">{totalAttempts}</span>
          </div>
        </div>

        <div className="space-y-4">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="bg-sky-50 border border-sky-200 rounded-lg p-4 space-y-3"
            >
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-sm font-semibold text-sky-900">
                  Attempt {index + 1}
                </h3>
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="text-xs text-red-500 hover:text-red-600"
                >
                  Remove
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    Operator experience
                  </label>
                  <select
                    {...register(`intubationAttempts.${index}.yearsExperience` as const)}
                    className="w-full h-9 px-2 py-1 border border-sky-200 rounded-md text-sm bg-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  >
                    <option value="">Select</option>
                    <option value="<1">&lt;1 year</option>
                    <option value="1-3">1–3 years</option>
                    <option value=">3">&gt;3 years</option>
                    <option value="consultant">Consultant</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    Laryngoscope type
                  </label>
                  <select
                    {...register(`intubationAttempts.${index}.laryngoscopeType` as const)}
                    className="w-full h-9 px-2 py-1 border border-sky-200 rounded-md text-sm bg-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  >
                    <option value="">Select</option>
                    <option value="direct">Direct</option>
                    <option value="video">Video</option>
                    <option value="flexible">Flexible</option>
                    <option value="fiberoptic">Fiberoptic</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    Blade size
                  </label>
                  <input
                    type="text"
                    {...register(`intubationAttempts.${index}.bladeSize` as const)}
                    className="w-full h-9 px-2 py-1 border border-sky-200 rounded-md text-sm bg-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                    placeholder="e.g. Mac 3"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm mt-1">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    {...register(`intubationAttempts.${index}.bougieOrStyletUsed` as const)}
                    className="h-4 w-4 text-sky-600 border-sky-300 rounded focus:ring-sky-500"
                  />
                  <span>Bougie / Stylet used</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    {...register(`intubationAttempts.${index}.ettChanged` as const)}
                    className="h-4 w-4 text-sky-600 border-sky-300 rounded focus:ring-sky-500"
                  />
                  <span>ETT changed</span>
                </label>
              </div>

              <div>
                <label className="block text-xs text-gray-600 mb-1">
                  Remarks (difficulty, C&L grade, complications)
                </label>
                <textarea
                  {...register(`intubationAttempts.${index}.remarks` as const)}
                  rows={2}
                  className="w-full px-2 py-1 border border-sky-200 rounded-md text-sm bg-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  placeholder="e.g. C&L 2b, required bougie, transient desaturation..."
                />
              </div>
            </div>
          ))}

          {fields.length < 3 && (
            <button
              type="button"
              onClick={() =>
                append({
                  attemptNumber: fields.length + 1,
                  yearsExperience: '',
                  laryngoscopeType: '',
                  bladeSize: '',
                  bougieOrStyletUsed: false,
                  ettChanged: false,
                  remarks: ''
                } as any)
              }
              className="text-xs px-3 py-1.5 rounded-md border border-sky-300 text-sky-800 bg-sky-50 hover:bg-sky-100"
            >
              + Add attempt
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

