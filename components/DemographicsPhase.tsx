import React from 'react';
import { useFormContext } from 'react-hook-form';
import { useFormStore } from '../stores/useFormStore';

export default function DemographicsPhase() {
  const { register, watch, formState: { errors } } = useFormContext();
  const { updateField, calculatedValues } = useFormStore();

  const occupation = watch('demographics.occupation');
  const weight = watch('demographics.weight');
  const height = watch('demographics.height');

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
              type="number"
              {...register('demographics.age', {
                valueAsNumber: true,
                min: { value: 18, message: 'Must be adult for ED' },
                max: { value: 120, message: 'Age exceeds maximum' }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="18-120"
            />
            {errors.demographics?.age && (
              <p className="text-red-500 text-sm mt-1">{errors.demographics.age.message as string}</p>
            )}
          </div>

          {/* Sex */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sex *
            </label>
            <select
              {...register('demographics.sex')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select sex</option>
              <option value="M">Male</option>
              <option value="F">Female</option>
            </select>
            {errors.demographics?.sex && (
              <p className="text-red-500 text-sm mt-1">{errors.demographics.sex.message as string}</p>
            )}
          </div>

          {/* Hospital Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hospital Number *
            </label>
            <input
              type="text"
              {...register('demographics.hospitalNo')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter hospital number"
            />
            {errors.demographics?.hospitalNo && (
              <p className="text-red-500 text-sm mt-1">{errors.demographics.hospitalNo.message as string}</p>
            )}
          </div>

          {/* Weight */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Weight (kg) *
            </label>
            <input
              type="number"
              {...register('demographics.weight', {
                valueAsNumber: true,
                min: { value: 20, message: 'Weight too low' },
                max: { value: 300, message: 'Weight exceeds maximum' }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="20-300"
            />
            {errors.demographics?.weight && (
              <p className="text-red-500 text-sm mt-1">{errors.demographics.weight.message as string}</p>
            )}
          </div>

          {/* Height */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Height (cm)
            </label>
            <input
              type="number"
              {...register('demographics.height', {
                valueAsNumber: true,
                min: { value: 100, message: 'Height too low' },
                max: { value: 250, message: 'Height too high' }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="100-250"
            />
            {errors.demographics?.height && (
              <p className="text-red-500 text-sm mt-1">{errors.demographics.height.message as string}</p>
            )}
          </div>

          {/* Mid Arm Circumference */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mid Arm Circumference (cm)
            </label>
            <input
              type="number"
              {...register('demographics.midArmCircumference', {
                valueAsNumber: true,
                min: { value: 10, message: 'Value too low' },
                max: { value: 50, message: 'Value too high' }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="10-50"
            />
            {errors.demographics?.midArmCircumference && (
              <p className="text-red-500 text-sm mt-1">{errors.demographics.midArmCircumference.message as string}</p>
            )}
          </div>

          {/* Occupation */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Occupation *
            </label>
            <select
              {...register('demographics.occupation')}
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
            {errors.demographics?.occupation && (
              <p className="text-red-500 text-sm mt-1">{errors.demographics.occupation.message as string}</p>
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Please specify"
              />
              {errors.demographics?.occupationOther && (
                <p className="text-red-500 text-sm mt-1">{errors.demographics.occupationOther.message as string}</p>
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
