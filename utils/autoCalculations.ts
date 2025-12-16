import { Demographics, Comorbidities, GCS, LeonScore, VitalSigns, Indication } from '../schemas/formSchemas';

// Helper function to safely convert string vitals to numbers
export function normalizeVitalSigns(vitals: VitalSigns) {
  return {
    heartRate: vitals.heartRate ? parseFloat(vitals.heartRate.toString()) : undefined,
    systolicBP: vitals.systolicBP ? parseFloat(vitals.systolicBP.toString()) : undefined,
    diastolicBP: vitals.diastolicBP ? parseFloat(vitals.diastolicBP.toString()) : undefined,
    respiratoryRate: vitals.respiratoryRate ? parseFloat(vitals.respiratoryRate.toString()) : undefined,
    spo2: vitals.spo2 ? parseFloat(vitals.spo2.toString()) : undefined,
    temperature: vitals.temperature ? parseFloat(vitals.temperature.toString()) : undefined,
  };
}

// Basic physiological calculations
export function calcBMI(weightKg: number, heightCm?: number) {
  if (!weightKg || !heightCm) return null;
  const h = heightCm / 100;
  return +(weightKg / (h * h)).toFixed(1);
}

export function calcShockIndex(hr: number, sbp: number) {
  if (!hr || !sbp) return null;
  return +(hr / sbp).toFixed(2);
}

export function calcModifiedShockIndex(hr: number, map: number) {
  if (!hr || !map) return null;
  return +(hr / map).toFixed(2);
}

export function calcMeanArterialPressure(sbp: number, dbp: number) {
  if (!sbp || !dbp) return null;
  return +((dbp + (sbp - dbp) / 3)).toFixed(1);
}

export function calcPulsePressure(sbp: number, dbp: number) {
  if (!sbp || !dbp) return null;
  return sbp - dbp;
}

// Glasgow Coma Scale calculations
export function calcTotalGCS(gcs: Partial<GCS>): number | null {
  if (!gcs.eyeResponse || !gcs.motorResponse) return null;

  const eye = typeof gcs.eyeResponse === 'string' ? parseInt(gcs.eyeResponse) : gcs.eyeResponse;
  const motor = typeof gcs.motorResponse === 'string' ? parseInt(gcs.motorResponse) : gcs.motorResponse;
  const verbal = gcs.isAlreadyIntubated ? 1 : 
    (gcs.verbalResponse ? 
      (typeof gcs.verbalResponse === 'string' ? parseInt(gcs.verbalResponse) : gcs.verbalResponse) : 1);

  if (isNaN(eye) || isNaN(motor) || isNaN(verbal)) return null;

  return eye + verbal + motor;
}

export function interpretGCS(totalGCS: number): {
  severity: string;
  interpretation: string;
  alerts: string[];
} {
  const alerts: string[] = [];

  if (totalGCS <= 8) {
    alerts.push('ICU consultation required');
    alerts.push('Neuroprotection protocol');
    alerts.push('ICP monitoring consideration');
    return {
      severity: 'Severe',
      interpretation: 'Severe brain injury - Critical care needed',
      alerts
    };
  } else if (totalGCS <= 12) {
    alerts.push('Close neurological monitoring');
    return {
      severity: 'Moderate',
      interpretation: 'Moderate brain injury',
      alerts
    };
  } else {
    return {
      severity: 'Mild',
      interpretation: 'Mild brain injury',
      alerts: []
    };
  }
}

// LEON Score calculations
export function calcLeonScore(leon: LeonScore): number {
  return leon.largeTongue + leon.thyroMentalDistance + leon.obstruction + leon.neckMobility;
}

export function interpretLeonScore(score: number): {
  riskLevel: string;
  recommendations: string[];
  alerts: string[];
} {
  const recommendations: string[] = [];
  const alerts: string[] = [];

  if (score <= 1) {
    recommendations.push('Standard intubation approach');
    return { riskLevel: 'Low', recommendations, alerts };
  } else if (score <= 3) {
    recommendations.push('Video laryngoscopy recommended');
    recommendations.push('Experienced intubator preferred');
    recommendations.push('Backup airway devices ready');
    alerts.push('Moderate difficulty predicted');
    return { riskLevel: 'Moderate', recommendations, alerts };
  } else {
    recommendations.push('Awake intubation consideration');
    recommendations.push('ENT consultation');
    recommendations.push('Emergency cricothyrotomy setup');
    alerts.push('High difficulty predicted - prepare for surgical airway');
    return { riskLevel: 'High', recommendations, alerts };
  }
}

// Comorbidity risk calculations
export function calcComorbidityBurden(comorbidities: Comorbidities): number {
  let score = 0;

  if (comorbidities.diabetes) score += 1;
  if (comorbidities.hypertension) score += 1;
  if (comorbidities.chronicRenalDisease) score += 2;
  if (comorbidities.chronicLiverDisease) score += 2;
  if (comorbidities.reactiveAirwayDisease) score += 1;
  if (comorbidities.others) score += 1;

  return score;
}

export function getComorbidityAlerts(comorbidities: Comorbidities): string[] {
  const alerts: string[] = [];

  if (comorbidities.diabetes) {
    alerts.push('Monitor glucose levels closely');
    alerts.push('Consider perioperative insulin protocol');
  }

  if (comorbidities.hypertension) {
    alerts.push('Monitor BP targets post-intubation');
    alerts.push('Consider antihypertensive adjustment');
  }

  if (comorbidities.chronicRenalDisease) {
    alerts.push('Fluid management caution');
    alerts.push('Monitor electrolytes closely');
  }

  if (comorbidities.chronicLiverDisease) {
    alerts.push('Drug metabolism warnings');
    alerts.push('Coagulation monitoring needed');
  }

  if (comorbidities.reactiveAirwayDisease) {
    alerts.push('Ventilator settings optimization');
    alerts.push('PEEP limitations');
  }

  return alerts;
}

// Risk stratification based on vital signs
export function assessHemodynamicRisk(vitals: VitalSigns): {
  riskLevel: string;
  alerts: string[];
  recommendations: string[];
} {
  const alerts: string[] = [];
  const recommendations: string[] = [];

  // Normalize vital signs to numbers
  const normalVitals = normalizeVitalSigns(vitals);

  const shockIndex = normalVitals.heartRate && normalVitals.systolicBP ? 
    calcShockIndex(normalVitals.heartRate, normalVitals.systolicBP) : null;
  const map = normalVitals.systolicBP && normalVitals.diastolicBP ? 
    calcMeanArterialPressure(normalVitals.systolicBP, normalVitals.diastolicBP) : null;

  // Shock index assessment
  if (shockIndex && shockIndex > 0.9) {
    alerts.push('High shock index - hemodynamic instability');
    recommendations.push('Prepare push-dose pressors');
    recommendations.push('Consider fluid resuscitation');
  }

  // Blood pressure assessment
  if (normalVitals.systolicBP && normalVitals.systolicBP < 90) {
    alerts.push('Hypotension - critical');
    recommendations.push('Immediate vasopressor support');
  }

  if (map && map < 65) {
    alerts.push('MAP below target - organ perfusion at risk');
    recommendations.push('Vasopressor infusion consideration');
  }

  // Heart rate assessment
  if (normalVitals.heartRate && normalVitals.heartRate > 100) {
    alerts.push('Tachycardia - investigate cause');
  }

  if (normalVitals.heartRate && normalVitals.heartRate < 60) {
    alerts.push('Bradycardia - monitor closely');
  }

  // Oxygenation assessment
  if (normalVitals.spo2 && normalVitals.spo2 < 90) {
    alerts.push('Severe hypoxemia - urgent intervention');
    recommendations.push('Preoxygenation protocol');
    recommendations.push('PEEP optimization');
  }

  // Determine overall risk
  let riskLevel = 'Low';
  if (alerts.length > 2) riskLevel = 'High';
  else if (alerts.length > 0) riskLevel = 'Moderate';

  return { riskLevel, alerts, recommendations };
}

// Medication dosing calculations
export function calcMedicationDose(weight: number, medication: string): number | null {
  if (!weight) return null;

  switch (medication) {
    case 'fentanyl':
      return +(weight * 2).toFixed(0); // 2 mcg/kg
    case 'dexmedetomidine':
      return +(weight * 0.5).toFixed(0); // 0.5 mcg/kg
    case 'propofol':
      return +(weight * 1.5).toFixed(0); // 1.5 mg/kg
    case 'etomidate':
      return +(weight * 0.3).toFixed(1); // 0.3 mg/kg
    case 'ketamine':
      return +(weight * 1.5).toFixed(0); // 1.5 mg/kg
    case 'rocuronium':
      return +(weight * 1.2).toFixed(0); // 1.2 mg/kg
    case 'succinylcholine':
      return +(weight * 1.5).toFixed(0); // 1.5 mg/kg
    default:
      return null;
  }
}

// Medication selection based on indication
export function getRecommendedInductionAgent(indication: Indication, vitals?: VitalSigns): {
  agent: string;
  dose: string;
  rationale: string;
  contraindications?: string[];
} {
  const contraindications: string[] = [];

  // Check for shock/sepsis
  const normalVitals = vitals ? normalizeVitalSigns(vitals) : null;
  const shockIndex = normalVitals?.heartRate && normalVitals?.systolicBP ? 
    calcShockIndex(normalVitals.heartRate, normalVitals.systolicBP) : null;
  
  if (indication.medical?.sepsis || (shockIndex && shockIndex > 0.9)) {
    return {
      agent: 'etomidate',
      dose: '0.3 mg/kg',
      rationale: 'Hemodynamic stability in shock/sepsis'
    };
  }

  // Head injury
  if (indication.trauma?.headInjuryReducedSensorium) {
    return {
      agent: 'propofol',
      dose: '1-2 mg/kg',
      rationale: 'Neuroprotection and ICP reduction'
    };
  }

  // Asthma/COPD
  if (indication.medical?.respiratoryFailure) {
    return {
      agent: 'ketamine',
      dose: '1-2 mg/kg',
      rationale: 'Bronchodilator properties'
    };
  }

  // Cardiac disease
  if (indication.medical?.cardiacFailure) {
    return {
      agent: 'etomidate',
      dose: '0.3 mg/kg',
      rationale: 'Minimal cardiac depression'
    };
  }

  // Default for hemodynamically stable
  return {
    agent: 'propofol',
    dose: '1-2 mg/kg',
    rationale: 'Standard induction for stable patients'
  };
}

// Check paralytic contraindications
export function checkParalyticContraindications(agent: string, demographics: Demographics, comorbidities: Comorbidities): string[] {
  const contraindications: string[] = [];

  if (agent === 'succinylcholine') {
    // Hyperkalemia risk factors
    if (comorbidities.chronicRenalDisease) {
      contraindications.push('Chronic renal disease - hyperkalemia risk');
    }

    // Burns >24 hours
    // Neuromuscular disease
    // Malignant hyperthermia history
    contraindications.push('Verify no burns >24h, neuromuscular disease, or MH history');
  }

  return contraindications;
}

// Age-adjusted normal ranges
export function getAgeAdjustedNormalRanges(age: number) {
  return {
    heartRate: {
      min: age > 65 ? 50 : 60,
      max: age > 65 ? 100 : 120
    },
    systolicBP: {
      min: age > 65 ? 110 : 90,
      max: age > 65 ? 160 : 140
    }
  };
}

// Nutritional status from mid-arm circumference
export function assessNutritionalStatus(mac: number, age: number, sex: string): string {
  // Simplified assessment - would need proper percentile tables in production
  if (sex === 'M') {
    if (mac < 23) return 'Severe malnutrition';
    if (mac < 26) return 'Moderate malnutrition';
    return 'Normal nutrition';
  } else {
    if (mac < 22) return 'Severe malnutrition';
    if (mac < 25) return 'Moderate malnutrition';
    return 'Normal nutrition';
  }
}
