import React, { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { useFormStore } from '../stores/useFormStore';
import toast from 'react-hot-toast';

export default function DemographicsPhase() {
  const { register, watch, setValue, formState: { errors } } = useFormContext();
  const { calculatedValues, markPhaseComplete } = useFormStore();

  const occupation = watch('demographics.occupation');
  const weight = watch('demographics.weight');
  const height = watch('demographics.height');
  const age = watch('demographics.age');
  const sex = watch('demographics.sex');
  const hospitalNo = watch('demographics.hospitalNo');
  const financialStatus = watch('demographics.financialStatus');

  // Check if phase is complete and show notification
  useEffect(() => {
    const isComplete = age && sex && hospitalNo && weight && occupation && 
                      (occupation !== 'Other' || watch('demographics.occupationOther')) &&
                      (financialStatus ? (financialStatus !== 'Other' || watch('demographics.financialStatusOther')) : true);
    
    if (isComplete) {
      // Debounced completion notification
      const timer = setTimeout(() => {
        toast.success('Demographics section completed', {
          duration: 3000,
          id: 'demographics-completed'
        });
        markPhaseComplete('demographics');
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [age, sex, hospitalNo, weight, occupation, financialStatus, markPhaseComplete, watch]);

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 p-4 rounded-lg">
        <h2 className="text-xl font-semibold text-blue-900 mb-4">Phase 1: Patient Demographics</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Age */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Age (years) *
            </label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              {...register('demographics.age')}
              value={age || ''}
              onChange={(e) => setValue('demographics.age', e.target.value, { shouldDirty: true, shouldTouch: true })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="18-120"
            />
            {(errors.demographics as any)?.age && (
              <p className="text-red-500 text-sm mt-1">{(errors.demographics as any).age?.message}</p>
            )}
          </div>

          {/* Sex */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sex *
            </label>
            <select
              {...register('demographics.sex')}
              value={sex || ''}
              onChange={(e) => setValue('demographics.sex', e.target.value as any, { shouldDirty: true, shouldTouch: true })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select sex</option>
              <option value="M">Male</option>
              <option value="F">Female</option>
              <option value="Other">Other</option>
            </select>
            {(errors.demographics as any)?.sex && (
              <p className="text-red-500 text-sm mt-1">{(errors.demographics as any).sex?.message}</p>
            )}
          </div>

          {/* Hospital Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hospital Number *
            </label>
            <input
              type="text"
              autoComplete="off"
              {...register('demographics.hospitalNo')}
              value={hospitalNo || ''}
              onChange={(e) => setValue('demographics.hospitalNo', e.target.value, { shouldDirty: true, shouldTouch: true })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter hospital number"
            />
            {(errors.demographics as any)?.hospitalNo && (
              <p className="text-red-500 text-sm mt-1">{(errors.demographics as any).hospitalNo?.message}</p>
            )}
          </div>

          {/* Weight */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Weight (kg) *
            </label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*\\.?[0-9]*"
              {...register('demographics.weight')}
              value={weight || ''}
              onChange={(e) => setValue('demographics.weight', e.target.value, { shouldDirty: true, shouldTouch: true })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="20-300"
            />
            {(errors.demographics as any)?.weight && (
              <p className="text-red-500 text-sm mt-1">{(errors.demographics as any).weight?.message}</p>
            )}
          </div>

          {/* Height */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Height (cm)
            </label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              {...register('demographics.height')}
              value={height || ''}
              onChange={(e) => setValue('demographics.height', e.target.value, { shouldDirty: true, shouldTouch: true })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="100-250"
            />
            {(errors.demographics as any)?.height && (
              <p className="text-red-500 text-sm mt-1">{(errors.demographics as any).height?.message}</p>
            )}
          </div>

          {/* Occupation */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Occupation *
            </label>
            <select
              {...register('demographics.occupation')}
              value={occupation || ''}
              onChange={(e) => setValue('demographics.occupation', e.target.value as any, { shouldDirty: true, shouldTouch: true })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select occupation</option>
              <option value="Student">Student</option>
              <option value="Healthcare">Healthcare</option>
              <option value="Manual">Manual Labor</option>
              <option value="Office">Office Work</option>
              <option value="Business">Business</option>
              <option value="Agriculture">Agriculture</option>
              <option value="Unemployed">Unemployed</option>
              <option value="Retired">Retired</option>
              <option value="Other">Other</option>
            </select>
            {(errors.demographics as any)?.occupation && (
              <p className="text-red-500 text-sm mt-1">{(errors.demographics as any).occupation?.message}</p>
            )}
          </div>

          {/* Other Occupation Text */}
          {occupation === 'Other' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Specify Occupation *
              </label>
              <input
                type="text"
                {...register('demographics.occupationOther')}
                value={watch('demographics.occupationOther') || ''}
                onChange={(e) => setValue('demographics.occupationOther', e.target.value, { shouldDirty: true, shouldTouch: true })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Please specify"
              />
              {(errors.demographics as any)?.occupationOther && (
                <p className="text-red-500 text-sm mt-1">{(errors.demographics as any).occupationOther?.message}</p>
              )}
            </div>
          )}

          {/* Financial Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Financial Status
            </label>
            <select
              {...register('demographics.financialStatus')}
              value={financialStatus || ''}
              onChange={(e) => setValue('demographics.financialStatus', e.target.value as any, { shouldDirty: true, shouldTouch: true })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select financial status</option>
              <option value="BPL">BPL</option>
              <option value="APL">APL</option>
              <option value="GovtInsurance">Government insurance</option>
              <option value="PrivateInsurance">Private insurance</option>
              <option value="SelfPay">Self pay</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Other Financial Status */}
          {financialStatus === 'Other' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Specify Financial Status *
              </label>
              <input
                type="text"
                {...register('demographics.financialStatusOther')}
                value={watch('demographics.financialStatusOther') || ''}
                onChange={(e) => setValue('demographics.financialStatusOther', e.target.value, { shouldDirty: true, shouldTouch: true })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Please specify"
              />
              {(errors.demographics as any)?.financialStatusOther && (
                <p className="text-red-500 text-sm mt-1">{(errors.demographics as any).financialStatusOther?.message}</p>
              )}
            </div>
          )}
        </div>

        {/* Auto-calculated values display */}
        {(weight && height) && (
          <div className="mt-4 p-3 bg-green-50 rounded-lg">
            <h4 className="font-medium text-green-800 mb-2">Auto-calculated Values</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {calculatedValues.bmi && (
                <div>
                  <span className="font-medium">BMI:</span> {calculatedValues.bmi} kg/m²
                  <span className={`ml-2 px-2 py-1 rounded text-xs ${
                    calculatedValues.bmi < 18.5 ? 'bg-yellow-100 text-yellow-800' :
                    calculatedValues.bmi > 30 ? 'bg-red-100 text-red-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {calculatedValues.bmi < 18.5 ? 'Underweight' :
                     calculatedValues.bmi > 30 ? 'Obese' : 'Normal'}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
