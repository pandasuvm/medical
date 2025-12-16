import { z } from 'zod';

// Helper functions for type coercion
const coerceBoolean = (defaultVal = false) => z.preprocess((val) => {
  if (val === undefined || val === null) return defaultVal;
  if (Array.isArray(val)) return val.length > 0;
  if (typeof val === 'boolean') return val;
  if (typeof val === 'string') return val === 'true' || val === 'on';
  return Boolean(val) || defaultVal;
}, z.boolean().default(defaultVal));

const coerceNumber = z.preprocess((val) => {
  if (val === undefined || val === null) return undefined;
  if (typeof val === 'number') return val;
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (trimmed === '') return undefined;
    const parsed = parseFloat(trimmed);
    return isNaN(parsed) ? undefined : parsed;
  }
  return undefined;
}, z.number().optional());

// Phase 1: Demographics with auto-calculations
export const demographicsSchema = z.object({
  age: z.string().optional(),
  sex: z.enum(['M','F','Other']).optional(),
  hospitalNo: z.string().optional(),
  midArmCircumference: z.string().optional(),
  weight: z.string().optional(),
  height: z.string().optional(),
  occupation: z.enum(['Student','Healthcare','Manual','Office','Business','Agriculture','Unemployed','Retired', 'Other']).optional(),
  occupationOther: z.string().optional(),
  financialStatus: z.enum([
    'BPL',
    'APL',
    'GovtInsurance',
    'PrivateInsurance',
    'SelfPay',
    'Other'
  ]).optional(),
  financialStatusOther: z.string().optional()
});

// Phase 2: Comorbidities with risk calculations (trimmed to PROFORMA list)
export const comorbiditySchema = z.object({
  diabetes: coerceBoolean(false),
  hypertension: coerceBoolean(false),
  chronicRenalDisease: coerceBoolean(false),
  chronicLiverDisease: coerceBoolean(false),
  reactiveAirwayDisease: coerceBoolean(false),
  others: coerceBoolean(false),
  othersText: z.string().optional()
});

// Phase 3: GCS with intubation logic
export const gcsSchema = z.object({
  eyeResponse: z.string().optional(),
  verbalResponse: z.string().optional().nullable(),
  motorResponse: z.string().optional(),
  isAlreadyIntubated: coerceBoolean(false)
});

// Phase 4: Critical Branching - Indication for Intubation
export const traumaIndicationSchema = z.object({
  headInjuryReducedSensorium: coerceBoolean(false),
  headInjuryAirwayThreatened: coerceBoolean(false),
  neckFacialTrauma: coerceBoolean(false),
  burnInhalation: coerceBoolean(false),
  drowning: coerceBoolean(false),
  chestTrauma: coerceBoolean(false),
  spinalCordInjury: coerceBoolean(false),
  majorTrauma: coerceBoolean(false),
  shock: coerceBoolean(false),
  other: coerceBoolean(false),
  otherText: z.string().optional()
});

export const medicalIndicationSchema = z.object({
  respiratoryFailure: coerceBoolean(false),
  anaphylaxis: coerceBoolean(false),
  cardiacFailure: coerceBoolean(false),
  sepsis: coerceBoolean(false),
  ichStroke: coerceBoolean(false),
  seizure: coerceBoolean(false),
  alteredMentalStatus: coerceBoolean(false),
  overdosePoison: coerceBoolean(false),
  giBleed: coerceBoolean(false),
  airwayObstruction: coerceBoolean(false),
  sepsisWithHypotension: coerceBoolean(false),
  other: coerceBoolean(false),
  otherText: z.string().optional()
});

export const indicationSchema = z.object({
  category: z.enum(['trauma', 'medical']).optional(),
  trauma: traumaIndicationSchema.optional(),
  medical: medicalIndicationSchema.optional()
});

// Phase 5: LEON Score with automated recommendations
export const leonSchema = z.object({
  largeTongue: z.union([z.literal(0), z.literal(1), z.number()]).optional(),
  thyroMentalDistance: z.union([z.literal(0), z.literal(1), z.number()]).optional(),
  obstruction: z.union([z.literal(0), z.literal(1), z.number()]).optional(),
  neckMobility: z.union([z.literal(0), z.literal(1), z.number()]).optional()
});

// Enhanced Vital Signs with medical ranges
export const vitalSignsSchema = z.object({
  heartRate: z.string().optional(),
  systolicBP: z.string().optional(),
  diastolicBP: z.string().optional(),
  respiratoryRate: z.string().optional(),
  spo2: z.string().optional(),
  temperature: z.string().optional(),
  timestamp: z.string().optional()
});

// Airway status / pre-intubation airway assessment
export const airwayStatusSchema = z.object({
  failureToMaintainProtectAirway: coerceBoolean(false),
  failureOfVentilationOxygenation: coerceBoolean(false),
  deteriorationAnticipated: coerceBoolean(false),
  predictorForDifficultAirway: coerceBoolean(false),
  safeApneaTime: z.string().optional()
}).optional();

// Point-of-Care Ultrasound
export const pocusSchema = z.object({
  epss: z.number().min(0).max(30).optional(), // E-point septal separation
  tapse: z.number().min(0).max(50).optional(), // Tricuspid annular plane systolic excursion
  ivcCollapsibility: z.number().min(0).max(100).optional(), // IVC collapsibility index
  airwayUltrasound: z.enum(['normal', 'difficult', 'not_done']).optional()
});

// Laboratory Values
export const labValuesSchema = z.object({
  ph: z.string().optional(),
  pao2: z.string().optional(),
  paco2: z.string().optional(),
  lactate: z.string().optional(),
  hemoglobin: z.string().optional(),
  platelets: z.string().optional(),
  glucose: z.string().optional(),
  hco3: z.string().optional(),
  creatinine: z.string().optional(),
  urea: z.string().optional(),
  na: z.string().optional(),
  k: z.string().optional()
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

// Pre-intubation medication & hemodynamic management (PROFORMA-aligned)
const medicationDoseSchema = z.object({
  given: coerceBoolean(false),
  dose: coerceNumber
});

export const preIntubationManagementSchema = z.object({
  // Induction / sedation medications
  etomidate: medicationDoseSchema.optional(),
  propofol: medicationDoseSchema.optional(),
  ketamine: medicationDoseSchema.optional(),
  midazolam: medicationDoseSchema.optional(),
  fentanyl: medicationDoseSchema.optional(),
  succinylcholine: medicationDoseSchema.optional(),
  rocuronium: medicationDoseSchema.optional(),
  vecuronium: medicationDoseSchema.optional(),
  atracurium: medicationDoseSchema.optional(),
  cisatracurium: medicationDoseSchema.optional(),
  otherMedications: z.array(z.object({
    name: z.string().optional(),
    given: coerceBoolean(false),
    dose: coerceNumber
  })).optional(),

  // Pre-induction fluids
  preInductionFluids: z.object({
    normalSaline: coerceBoolean(false),
    ringerLactate: coerceBoolean(false),
    colloids: coerceBoolean(false),
    volumeMl: coerceNumber
  }).optional(),

  // Push-dose pressors
  pushDosePressor: z.object({
    adrenaline: coerceBoolean(false),
    noradrenaline: coerceBoolean(false),
    phenylephrine: coerceBoolean(false),
    metaraminol: coerceBoolean(false),
    dose: coerceNumber
  }).optional(),

  // Vasopressor infusion
  vasopressorInfusion: z.object({
    agent: z.enum(['dopamine', 'noradrenaline', 'adrenaline', 'none']).default('none').optional(),
    doseMcgPerKgMin: coerceNumber
  }).optional(),

  // Sedation infusion and choice
  sedationInfusion: z.object({
    agent: z.enum(['midazolam', 'fentanyl', 'propofol', 'none']).default('none').optional(),
    dose: coerceNumber
  }).optional(),

  sedationDone: z.enum(['midazolamKetamine', 'propofol']).optional()
}).optional();

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

// Post-intubation GCS (E/M/V)
export const postIntubationGcsSchema = z.object({
  eye: z.string().optional(),
  motor: z.string().optional(),
  verbal: z.string().optional()
});

// Ventilator settings & ETT/CD
export const ventilatorSettingsSchema = z.object({
  ettCdValue: z.string().optional(),
  mode: z.string().optional(),
  peep: coerceNumber.nullable(),
  pPeak: coerceNumber.nullable(),
  minuteVentilation: coerceNumber.nullable(),
  settingsDescription: z.string().optional(),
  changeInSettings: z.string().optional()
}).optional();

// Post-intubation adverse events
export const postIntubationEventsSchema = z.object({
  postIntubationCardiacArrest: coerceBoolean(false),
  cardiacArrestDetails: z.string().optional(),
  otherSeriousAdverseEvents: z.string().optional()
}).optional();

// Intubation attempts
export const intubationAttemptSchema = z.object({
  attemptNumber: z.number().min(1).max(10),
  yearsExperience: z.enum(['<1', '1-3', '>3', 'consultant']),
  laryngoscopeType: z.enum(['direct', 'video', 'flexible', 'fiberoptic', 'other']),
  bladeSize: z.string(),
  bougieOrStyletUsed: z.boolean().default(false),
  ettChanged: z.boolean().default(false),
  remarks: z.string().optional()
});

// Time-based monitoring intervals (not yet wired to UI table)
export const monitoringIntervalSchema = z.object({
  timePoint: z.enum(['pre_induction', 'post_5min', 'post_10min', 'post_15min', 'post_30min']),
  vitalSigns: vitalSignsSchema,
  medications: medicationSchema.optional(),
  complications: z.array(z.enum(['hypotension', 'hypertension', 'bradycardia', 'tachycardia', 'desaturation', 'arrhythmia', 'none'])).default(['none']),
  interventions: z.array(z.string()).optional(),
  timestamp: z.string()
});

// Simple table-style monitoring for hemodynamics at fixed timepoints
export const monitoringTableSchema = z.object({
  post5: vitalSignsSchema.optional(),
  post10: vitalSignsSchema.optional(),
  post15: vitalSignsSchema.optional(),
  post30: vitalSignsSchema.optional(),
  modifiedShockIndex: z.object({
    post5: z.string().optional(),
    post10: z.string().optional(),
    post15: z.string().optional(),
    post30: z.string().optional()
  }).optional()
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
  preInductionLabs: labValuesSchema.optional(),
  airwayStatus: airwayStatusSchema.optional(),
  preIntubationManagement: preIntubationManagementSchema.optional(),

  // Post-intubation assessment
  postIntubationGcs: postIntubationGcsSchema.optional(),
  ventilatorSettings: ventilatorSettingsSchema.optional(),
  postIntubationEvents: postIntubationEventsSchema.optional(),
  intubationAttempts: z.array(intubationAttemptSchema).optional(),
  totalAttempts: z.number().min(0).max(10).optional(),
  monitoringTable: monitoringTableSchema.optional(),

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
  currentPhase: z.enum([
    'demographics',
    'vitals',
    'indication',
    'leon',
    'preIntubation',
    'comorbidities',
    'postIntubation',
    'attempts',
    'monitoring'
  ]).default('demographics'),
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
export type AirwayStatus = z.infer<typeof airwayStatusSchema>;
export type LabValues = z.infer<typeof labValuesSchema>;
export type PreIntubationManagement = z.infer<typeof preIntubationManagementSchema>;
export type PostIntubationGcs = z.infer<typeof postIntubationGcsSchema>;
export type VentilatorSettings = z.infer<typeof ventilatorSettingsSchema>;
export type PostIntubationEvents = z.infer<typeof postIntubationEventsSchema>;
export type IntubationAttempt = z.infer<typeof intubationAttemptSchema>;

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

