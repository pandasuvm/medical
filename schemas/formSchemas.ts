import { z } from 'zod';

// Phase 1: Demographics with auto-calculations
export const demographicsSchema = z.object({
  age: z.number().min(18, 'Must be adult for ED').max(120, 'Age exceeds maximum'),
  sex: z.enum(['M','F']),
  hospitalNo: z.string().min(1, 'Hospital number required'),
  midArmCircumference: z.number().min(10).max(50).optional(),
  weight: z.number().min(20, 'Weight too low').max(300, 'Weight exceeds maximum'),
  height: z.number().min(100).max(250).optional(),
  occupation: z.enum(['Student','Healthcare','Manual','Office','Business','Agriculture','Unemployed','Retired', 'Other']),
  occupationOther: z.string().optional()
}).refine((data: any) => {
  return !(data.occupation === 'Other') || !!data.occupationOther;
}, {
  message: 'Please specify occupation',
  path: ['occupationOther']
});

// Phase 2: Comorbidities with risk calculations
export const comorbiditySchema = z.object({
  diabetes: z.boolean().default(false),
  hypertension: z.boolean().default(false),
  ischemicHeartDisease: z.boolean().default(false),
  chronicRenalDisease: z.boolean().default(false),
  chronicLiverDisease: z.boolean().default(false),
  obstructiveLungDisease: z.boolean().default(false),
  cerebrovascularDisease: z.boolean().default(false),
  hypothyroidism: z.boolean().default(false),
  others: z.boolean().default(false),
  othersText: z.string().optional()
}).refine((data: any) => {
  return !data.others || !!data.othersText;
}, {
  message: 'Please specify other comorbidities',
  path: ['othersText']
});

// Phase 3: GCS with intubation logic
export const gcsSchema = z.object({
  eyeResponse: z.number().min(1).max(4),
  verbalResponse: z.number().min(1).max(5).nullable(),
  motorResponse: z.number().min(1).max(6),
  isAlreadyIntubated: z.boolean().default(false)
}).superRefine((data: any, ctx: any) => {
  if (data.isAlreadyIntubated && data.verbalResponse !== null) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Verbal response must be null when already intubated',
      path: ['verbalResponse']
    });
  }
  if (!data.isAlreadyIntubated && data.verbalResponse === null) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Verbal response required when not intubated',
      path: ['verbalResponse']
    });
  }
});

// Phase 4: Critical Branching - Indication for Intubation
export const traumaIndicationSchema = z.object({
  headInjuryReducedSensorium: z.boolean().default(false),
  headInjuryAirwayThreatened: z.boolean().default(false),
  neckFacialTrauma: z.boolean().default(false),
  burnInhalation: z.boolean().default(false),
  drowning: z.boolean().default(false),
  chestTrauma: z.boolean().default(false),
  other: z.boolean().default(false),
  otherText: z.string().optional()
});

export const medicalIndicationSchema = z.object({
  respiratoryFailure: z.boolean().default(false),
  airwayObstruction: z.boolean().default(false),
  anaphylaxis: z.boolean().default(false),
  cardiacFailure: z.boolean().default(false),
  sepsis: z.boolean().default(false),
  giBleed: z.boolean().default(false),
  ichStroke: z.boolean().default(false),
  seizure: z.boolean().default(false),
  other: z.boolean().default(false),
  otherText: z.string().optional()
});

export const indicationSchema = z.object({
  category: z.enum(['trauma', 'medical']),
  trauma: traumaIndicationSchema.optional(),
  medical: medicalIndicationSchema.optional()
}).superRefine((data: any, ctx: any) => {
  if (data.category === 'trauma' && !data.trauma) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Trauma indications required when category is trauma',
      path: ['trauma']
    });
  }
  if (data.category === 'medical' && !data.medical) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Medical indications required when category is medical',
      path: ['medical']
    });
  }
});

// Phase 5: LEON Score with automated recommendations
export const leonSchema = z.object({
  largeTongue: z.union([z.literal(0), z.literal(1)]),
  thyroMentalDistance: z.union([z.literal(0), z.literal(1)]),
  obstruction: z.union([z.literal(0), z.literal(1)]),
  neckMobility: z.union([z.literal(0), z.literal(1)])
});

// Enhanced Vital Signs with medical ranges
export const vitalSignsSchema = z.object({
  heartRate: z.number()
    .min(30, 'HR below 30 bpm - verify reading')
    .max(300, 'HR above 300 bpm - verify reading'),
  systolicBP: z.number()
    .min(50, 'SBP below 50 mmHg - critically low')
    .max(300, 'SBP above 300 mmHg - verify reading'),
  diastolicBP: z.number()
    .min(20, 'DBP below 20 mmHg - critically low')
    .max(200, 'DBP above 200 mmHg - verify reading'),
  respiratoryRate: z.number()
    .min(5, 'RR below 5 - verify reading')
    .max(60, 'RR above 60 - verify reading'),
  spo2: z.number()
    .min(30, 'SpO2 below 30% - verify reading')
    .max(100, 'SpO2 cannot exceed 100%'),
  temperature: z.number()
    .min(25, 'Temperature below 25°C - hypothermia alert')
    .max(45, 'Temperature above 45°C - hyperthermia alert'),
  timestamp: z.string().optional()
}).refine((data: any) => data.diastolicBP < data.systolicBP, {
  message: 'Diastolic BP must be less than Systolic BP',
  path: ['diastolicBP']
});

// Point-of-Care Ultrasound
export const pocusSchema = z.object({
  epss: z.number().min(0).max(30).optional(), // E-point septal separation
  tapse: z.number().min(0).max(50).optional(), // Tricuspid annular plane systolic excursion
  ivcCollapsibility: z.number().min(0).max(100).optional(), // IVC collapsibility index
  airwayUltrasound: z.enum(['normal', 'difficult', 'not_done']).optional()
});

// Laboratory Values
export const labValuesSchema = z.object({
  ph: z.number().min(6.5).max(8.0).optional(),
  pao2: z.number().min(20).max(600).optional(),
  paco2: z.number().min(10).max(150).optional(),
  lactate: z.number().min(0).max(30).optional(),
  hemoglobin: z.number().min(3).max(25).optional(),
  platelets: z.number().min(10).max(1000).optional(),
  glucose: z.number().min(20).max(800).optional()
});

// Medication Administration
export const medicationSchema = z.object({
  // Pre-induction
  fentanyl: z.object({
    given: z.boolean().default(false),
    dose: z.number().optional(),
    timestamp: z.string().optional()
  }).optional(),
  dexmedetomidine: z.object({
    given: z.boolean().default(false),
    dose: z.number().optional(),
    timestamp: z.string().optional()
  }).optional(),

  // Induction agents
  inductionAgent: z.enum(['propofol', 'etomidate', 'ketamine', 'other']).optional(),
  inductionDose: z.number().optional(),
  inductionTimestamp: z.string().optional(),

  // Paralytic agents
  paralyticAgent: z.enum(['rocuronium', 'succinylcholine', 'vecuronium', 'other']).optional(),
  paralyticDose: z.number().optional(),
  paralyticTimestamp: z.string().optional(),

  // Push-dose pressors
  pushDosePressors: z.array(z.object({
    agent: z.enum(['epinephrine', 'phenylephrine', 'norepinephrine']),
    dose: z.number(),
    timestamp: z.string()
  })).optional(),

  // Vasopressor infusions
  vasopressorInfusion: z.object({
    agent: z.enum(['norepinephrine', 'epinephrine', 'dopamine', 'vasopressin', 'none']).default('none'),
    rate: z.number().optional(),
    startTime: z.string().optional()
  }).optional()
});

// Intubation Procedure Details
export const intubationProcedureSchema = z.object({
  intubatorExperience: z.enum(['resident', 'fellow', 'attending', 'other']),
  laryngoscopeType: z.enum(['direct', 'video', 'flexible']),
  laryngoscopeBlade: z.enum(['mac3', 'mac4', 'miller2', 'miller3', 'cmac', 'glidescope', 'other']),
  numberOfAttempts: z.number().min(1).max(10),
  clGrading: z.enum(['1', '2a', '2b', '3', '4']),
  tubeSize: z.number().min(6).max(10),
  tubeType: z.enum(['ett', 'dlt', 'tracheostomy']),
  complications: z.array(z.enum(['none', 'dental_trauma', 'lip_trauma', 'airway_trauma', 'esophageal_intubation', 'right_main_bronchus', 'other'])).default(['none']),
  complicationDetails: z.string().optional(),
  procedureStartTime: z.string().optional(),
  procedureEndTime: z.string().optional()
});

// Time-based monitoring intervals
export const monitoringIntervalSchema = z.object({
  timePoint: z.enum(['pre_induction', 'post_5min', 'post_10min', 'post_15min', 'post_30min']),
  vitalSigns: vitalSignsSchema,
  medications: medicationSchema.optional(),
  complications: z.array(z.enum(['hypotension', 'hypertension', 'bradycardia', 'tachycardia', 'desaturation', 'arrhythmia', 'none'])).default(['none']),
  interventions: z.array(z.string()).optional(),
  timestamp: z.string()
});

// Adverse Events
export const adverseEventSchema = z.object({
  cardiacArrest: z.boolean().default(false),
  hypotension: z.boolean().default(false),
  failedIntubation: z.boolean().default(false),
  pneumothorax: z.boolean().default(false),
  aspiration: z.boolean().default(false),
  other: z.boolean().default(false),
  otherDescription: z.string().optional(),
  timestamp: z.string().optional(),
  interventions: z.array(z.string()).optional(),
  outcome: z.enum(['resolved', 'ongoing', 'worsened']).optional()
});

// Final form schema with all phases
export const formRootSchema = z.object({
  // Core phases
  demographics: demographicsSchema,
  comorbidities: comorbiditySchema,
  gcs: gcsSchema,
  indication: indicationSchema,
  leonScore: leonSchema.optional(),

  // Pre-induction assessment
  preInductionVitals: vitalSignsSchema.optional(),

  // Auto-calculated values
  calculatedValues: z.object({
    bmi: z.number().optional(),
    shockIndex: z.number().optional(),
    modifiedShockIndex: z.number().optional(),
    totalGCS: z.number().optional(),
    leonTotalScore: z.number().optional(),
    comorbidityBurden: z.number().optional(),
    meanArterialPressure: z.number().optional(),
    pulsePressure: z.number().optional()
  }).optional(),

  // Metadata
  timestamps: z.object({
    formStarted: z.string().optional(),
    paralysisGiven: z.string().optional(),
    intubationCompleted: z.string().optional(),
    formCompleted: z.string().optional()
  }).optional(),

  // Form state
  currentPhase: z.enum(['demographics', 'comorbidities', 'gcs', 'indication', 'leon', 'pre_induction', 'procedure', 'monitoring']).default('demographics'),
  isComplete: z.boolean().default(false)
});

// Export individual schemas for component-level validation
export type FormData = z.infer<typeof formRootSchema>;
export type Demographics = z.infer<typeof demographicsSchema>;
export type Comorbidities = z.infer<typeof comorbiditySchema>;
export type GCS = z.infer<typeof gcsSchema>;
export type Indication = z.infer<typeof indicationSchema>;
export type LeonScore = z.infer<typeof leonSchema>;
export type VitalSigns = z.infer<typeof vitalSignsSchema>;
export type CalculatedValues = z.infer<typeof calculatedValuesSchema>;

const calculatedValuesSchema = z.object({
  bmi: z.number().optional(),
  shockIndex: z.number().optional(),
  modifiedShockIndex: z.number().optional(),
  totalGCS: z.number().optional(),
  leonTotalScore: z.number().optional(),
  comorbidityBurden: z.number().optional(),
  meanArterialPressure: z.number().optional(),
  pulsePressure: z.number().optional()
});

