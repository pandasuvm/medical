// Clinical knowledge base for predictive assistance and medical guidance
export interface ClinicalKnowledge {
  medicalTerms: string[];
  commonDiagnoses: string[];
  medications: string[];
  procedures: string[];
  contraindications: Record<string, string[]>;
  guidelines: Record<string, string[]>;
  normalRanges: Record<string, { min?: number; max?: number; unit: string; pediatric?: any }>;
  clinicalDecisionRules: Record<string, any>;
}

export const clinicalKnowledge: ClinicalKnowledge = {
  medicalTerms: [
    'Acute respiratory failure',
    'Cardiovascular collapse',
    'Altered mental status',
    'Combative patient',
    'Airway obstruction',
    'Hemodynamic instability',
    'Increased intracranial pressure',
    'Status epilepticus',
    'Severe pneumonia',
    'Pulmonary edema',
    'Anaphylaxis',
    'Septic shock',
    'Multi-organ failure',
    'Traumatic brain injury',
    'Cervical spine injury',
    'Facial trauma',
    'Upper GI bleeding',
    'Aspiration risk'
  ],

  commonDiagnoses: [
    'COPD exacerbation',
    'Congestive heart failure',
    'Pneumonia',
    'Asthma exacerbation',
    'Myocardial infarction',
    'Stroke',
    'Drug overdose',
    'Alcohol intoxication',
    'Diabetic ketoacidosis',
    'Hyperosmolar hyperglycemic state',
    'Thyroid storm',
    'Adrenal crisis',
    'Anaphylactic shock',
    'Cardiogenic shock',
    'Hypovolemic shock',
    'Distributive shock'
  ],

  medications: [
    'Etomidate',
    'Ketamine',
    'Propofol',
    'Midazolam',
    'Succinylcholine',
    'Rocuronium',
    'Vecuronium',
    'Atracurium',
    'Fentanyl',
    'Morphine',
    'Lidocaine',
    'Epinephrine',
    'Norepinephrine',
    'Dopamine',
    'Dobutamine',
    'Vasopressin',
    'Phenylephrine'
  ],

  procedures: [
    'Rapid sequence intubation',
    'Awake intubation',
    'Fiber-optic intubation',
    'Video laryngoscopy',
    'Direct laryngoscopy',
    'Cricothyrotomy',
    'Tracheostomy',
    'Laryngeal mask airway',
    'Bag-mask ventilation',
    'Non-invasive ventilation',
    'Chest tube insertion',
    'Central venous access',
    'Arterial line placement',
    'Foley catheter insertion'
  ],

  contraindications: {
    succinylcholine: [
      'Hyperkalemia',
      'Neuromuscular disorders',
      'Recent burns >24-48 hours',
      'Crush injuries',
      'Prolonged immobilization',
      'Malignant hyperthermia history',
      'Pseudocholinesterase deficiency'
    ],
    etomidate: [
      'Adrenal insufficiency',
      'Septic shock',
      'Prolonged critical illness'
    ],
    ketamine: [
      'Increased intracranial pressure',
      'Severe coronary artery disease',
      'Uncontrolled hypertension',
      'Psychosis'
    ],
    propofol: [
      'Hemodynamic instability',
      'Egg or soy allergy',
      'Propofol infusion syndrome risk'
    ]
  },

  guidelines: {
    difficultAirway: [
      'LEON score ≥2: Enhanced preparation required',
      'LEON score ≥4: Consider awake intubation',
      'Multiple predictors: ENT consultation',
      'Previous difficult intubation: Prepare backup plan',
      'Cervical spine concerns: Manual inline stabilization'
    ],
    hemodynamics: [
      'SBP <90: Prepare vasopressors',
      'Shock index >0.9: Volume resuscitation priority',
      'HR >120: Investigate underlying cause',
      'MAP <65: Target for organ perfusion'
    ],
    neurological: [
      'GCS ≤8: Intubation indicated',
      'GCS 9-12: Close monitoring required',
      'Rapid decline: Urgent intervention',
      'ICP concerns: Avoid hypotension and hypoxia'
    ],
    pediatric: [
      'Age <8 years: Uncuffed ETT traditionally',
      'ETT size: (Age + 16)/4 for cuffed tubes',
      'Straight blade preferred in infants',
      'Higher oxygen consumption rate'
    ]
  },

  normalRanges: {
    heartRate: {
      min: 60,
      max: 100,
      unit: 'bpm',
      pediatric: {
        '0-3mo': { min: 100, max: 150 },
        '3-6mo': { min: 90, max: 120 },
        '6-12mo': { min: 80, max: 120 },
        '1-3yr': { min: 70, max: 110 },
        '3-6yr': { min: 65, max: 110 },
        '6-12yr': { min: 60, max: 95 },
        '12-15yr': { min: 60, max: 85 }
      }
    },
    systolicBP: {
      min: 90,
      max: 140,
      unit: 'mmHg',
      pediatric: {
        '1-12mo': { min: 70, max: 100 },
        '1-2yr': { min: 75, max: 105 },
        '2-6yr': { min: 80, max: 110 },
        '6-12yr': { min: 90, max: 120 },
        '12-15yr': { min: 100, max: 130 }
      }
    },
    respiratoryRate: {
      min: 12,
      max: 20,
      unit: '/min',
      pediatric: {
        '0-6mo': { min: 30, max: 60 },
        '6-12mo': { min: 24, max: 40 },
        '1-3yr': { min: 20, max: 30 },
        '3-6yr': { min: 16, max: 25 },
        '6-12yr': { min: 14, max: 22 },
        '12-15yr': { min: 12, max: 20 }
      }
    },
    temperature: { min: 36.1, max: 37.2, unit: '°C' },
    spo2: { min: 95, max: 100, unit: '%' },
    gcs: { min: 15, max: 15, unit: 'points' }
  },

  clinicalDecisionRules: {
    leonScore: {
      0: { risk: 'Low', preparation: 'Standard', recommendations: ['Direct laryngoscopy acceptable'] },
      1: { risk: 'Low-Moderate', preparation: 'Standard+', recommendations: ['Consider video laryngoscopy'] },
      2: { risk: 'Moderate', preparation: 'Enhanced', recommendations: ['Video laryngoscopy preferred', 'Experienced operator'] },
      3: { risk: 'High', preparation: 'Advanced', recommendations: ['Video laryngoscopy mandatory', 'Backup airway plan', 'ENT consultation'] },
      4: { risk: 'Very High', preparation: 'Expert', recommendations: ['Awake intubation consideration', 'Double setup', 'Surgical airway ready'] }
    },
    shockIndex: {
      'normal': { range: '0.5-0.7', status: 'Normal', action: 'Continue monitoring' },
      'mild': { range: '0.7-0.9', status: 'Mild shock', action: 'Investigate cause, fluid resuscitation' },
      'moderate': { range: '0.9-1.2', status: 'Moderate shock', action: 'Urgent resuscitation, blood products' },
      'severe': { range: '>1.2', status: 'Severe shock', action: 'Massive transfusion protocol, urgent intervention' }
    },
    map: {
      'hypotensive': { range: '<65', status: 'Hypotensive', action: 'Vasopressor support indicated' },
      'normal': { range: '65-100', status: 'Normal', action: 'Continue monitoring' },
      'hypertensive': { range: '>100', status: 'Hypertensive', action: 'Investigate cause, consider treatment' }
    }
  }
};

// Clinical alert generator
export const generateClinicalAlerts = (formData: any) => {
  const alerts = [];
  
  // Vital signs alerts
  if (formData.vitals) {
    const { heartRate, systolicBP, diastolicBP, spo2, respiratoryRate } = formData.vitals;
    
    if (systolicBP && systolicBP < 90) {
      alerts.push({
        level: 'critical',
        category: 'hemodynamic',
        title: 'Severe Hypotension',
        message: `Systolic BP ${systolicBP} mmHg is critically low`,
        actions: ['Prepare vasopressors', 'Large bore IV access', 'Consider fluid resuscitation']
      });
    }
    
    if (spo2 && spo2 < 90) {
      alerts.push({
        level: 'critical',
        category: 'respiratory',
        title: 'Severe Hypoxemia',
        message: `SpO2 ${spo2}% indicates severe hypoxemia`,
        actions: ['Increase FiO2', 'Consider CPAP/BiPAP', 'Prepare for emergent intubation']
      });
    }
  }
  
  // LEON score alerts
  if (formData.leonScore) {
    const total = Object.values(formData.leonScore).reduce((sum: number, val: any) => sum + (val || 0), 0);
    
    if (total >= 2) {
      const riskLevel = total >= 4 ? 'Very High' : total >= 3 ? 'High' : 'Moderate';
      alerts.push({
        level: total >= 3 ? 'critical' : 'warning',
        category: 'airway',
        title: `Difficult Airway - ${riskLevel} Risk`,
        message: `LEON Score ${total}/4 indicates ${riskLevel.toLowerCase()} difficulty`,
        actions: clinicalKnowledge.clinicalDecisionRules.leonScore[total as keyof typeof clinicalKnowledge.clinicalDecisionRules.leonScore]?.recommendations || []
      });
    }
  }
  
  return alerts;
};

// Medical term suggestions based on context
export const getMedicalSuggestions = (context: string, input: string) => {
  const contextMap: Record<string, string[]> = {
    indication: [...clinicalKnowledge.medicalTerms, ...clinicalKnowledge.commonDiagnoses],
    medication: clinicalKnowledge.medications,
    procedure: clinicalKnowledge.procedures,
    diagnosis: clinicalKnowledge.commonDiagnoses
  };
  
  const suggestions = contextMap[context] || clinicalKnowledge.medicalTerms;
  return suggestions.filter(term => 
    term.toLowerCase().includes(input.toLowerCase())
  ).slice(0, 8);
};

// Clinical guidelines for specific conditions
export const getClinicalGuidelines = (condition: string) => {
  return clinicalKnowledge.guidelines[condition] || [];
};

// Drug interaction and contraindication checker
export const checkContraindications = (medication: string, patientData: any) => {
  const contraindications = clinicalKnowledge.contraindications[medication.toLowerCase()];
  if (!contraindications) return [];
  
  const warnings: string[] = [];
  // Add logic to check patient data against contraindications
  // This would be expanded based on actual patient conditions
  
  return warnings;
};
