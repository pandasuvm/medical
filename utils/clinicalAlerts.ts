import { FormData, VitalSigns, Indication, GCS, LeonScore, Comorbidities } from '../schemas/formSchemas';
import {
  calcTotalGCS,
  interpretGCS,
  calcLeonScore,
  interpretLeonScore,
  assessHemodynamicRisk,
  getComorbidityAlerts,
  calcShockIndex
} from './autoCalculations';

export interface ClinicalAlert {
  id: string;
  level: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  triggers: string[];
  actions?: string[];
  timestamp: string;
  category: 'hemodynamic' | 'neurological' | 'airway' | 'medication' | 'procedural';
}

export interface ProtocolActivation {
  id: string;
  name: string;
  indication: string;
  steps: string[];
  medications?: string[];
  monitoring?: string[];
  consultations?: string[];
}

// Main alert generation function
export function generateClinicalAlerts(formData: FormData): ClinicalAlert[] {
  const alerts: ClinicalAlert[] = [];
  const timestamp = new Date().toISOString();

  // GCS-based alerts
  if (formData.gcs) {
    const totalGCS = calcTotalGCS(formData.gcs);
    if (totalGCS !== null) {
      const gcsInterpretation = interpretGCS(totalGCS);

      if (totalGCS <= 8) {
        alerts.push({
          id: 'gcs-severe',
          level: 'critical',
          title: 'Severe Brain Injury Detected',
          message: `GCS ${totalGCS} - Critical neurological status`,
          triggers: ['gcs_8_or_less'],
          actions: [
            'ICU consultation',
            'Neuroprotection protocol',
            'ICP monitoring setup',
            'CT scan priority'
          ],
          timestamp,
          category: 'neurological'
        });
      }
    }
  }

  // LEON Score alerts
  if (formData.leonScore) {
    const leonTotal = calcLeonScore(formData.leonScore);
    const leonInterpretation = interpretLeonScore(leonTotal);

    if (leonTotal >= 2) {
      alerts.push({
        id: 'difficult-airway',
        level: leonTotal >= 4 ? 'critical' : 'warning',
        title: 'Difficult Airway Predicted',
        message: `LEON Score ${leonTotal} - ${leonInterpretation.riskLevel} difficulty`,
        triggers: ['leon_score_2_plus'],
        actions: leonInterpretation.recommendations,
        timestamp,
        category: 'airway'
      });
    }
  }

  // Vital signs alerts
  if (formData.preInductionVitals) {
    const hemodynamicRisk = assessHemodynamicRisk(formData.preInductionVitals);

    if (hemodynamicRisk.riskLevel !== 'Low') {
      alerts.push({
        id: 'hemodynamic-instability',
        level: hemodynamicRisk.riskLevel === 'High' ? 'critical' : 'warning',
        title: 'Hemodynamic Instability',
        message: `${hemodynamicRisk.riskLevel} risk patient`,
        triggers: hemodynamicRisk.alerts,
        actions: hemodynamicRisk.recommendations,
        timestamp,
        category: 'hemodynamic'
      });
    }

    // Specific vital sign alerts
    const vitals = formData.preInductionVitals;

    if (vitals.spo2 < 90) {
      alerts.push({
        id: 'severe-hypoxemia',
        level: 'critical',
        title: 'Severe Hypoxemia',
        message: `SpO2 ${vitals.spo2}% - Urgent intervention required`,
        triggers: ['spo2_below_90'],
        actions: [
          'Immediate preoxygenation',
          'PEEP optimization',
          'Consider BiPAP',
          'Prepare for difficult oxygenation'
        ],
        timestamp,
        category: 'hemodynamic'
      });
    }

    if (vitals.systolicBP < 90) {
      alerts.push({
        id: 'severe-hypotension',
        level: 'critical',
        title: 'Severe Hypotension',
        message: `SBP ${vitals.systolicBP} mmHg - Shock protocol`,
        triggers: ['sbp_below_90'],
        actions: [
          'Prepare push-dose pressors',
          'Fluid resuscitation',
          'Vasopressor infusion ready',
          'Consider etomidate for induction'
        ],
        timestamp,
        category: 'hemodynamic'
      });
    }
  }

  // Comorbidity-based alerts
  if (formData.comorbidities) {
    const comorbidityAlerts = getComorbidityAlerts(formData.comorbidities);

    comorbidityAlerts.forEach((alert, index) => {
      alerts.push({
        id: `comorbidity-${index}`,
        level: 'info',
        title: 'Comorbidity Alert',
        message: alert,
        triggers: ['comorbidity_present'],
        timestamp,
        category: 'medication'
      });
    });
  }

  // Indication-based protocol alerts
  if (formData.indication) {
    const protocolAlerts = getIndicationBasedAlerts(formData.indication, timestamp);
    alerts.push(...protocolAlerts);
  }

  return alerts;
}

// Generate indication-based protocol alerts
function getIndicationBasedAlerts(indication: Indication, timestamp: string): ClinicalAlert[] {
  const alerts: ClinicalAlert[] = [];

  if (indication.category === 'trauma') {
    const trauma = indication.trauma;

    if (trauma?.headInjuryReducedSensorium) {
      alerts.push({
        id: 'head-injury-protocol',
        level: 'warning',
        title: 'Head Injury Protocol',
        message: 'Neuroprotection measures required',
        triggers: ['head_injury_reduced_sensorium'],
        actions: [
          'ICP monitoring setup',
          'CT scan priority',
          'Propofol for induction',
          'Avoid succinylcholine',
          'Target PCO2 35-40 mmHg'
        ],
        timestamp,
        category: 'neurological'
      });
    }

    if (trauma?.headInjuryAirwayThreatened) {
      alerts.push({
        id: 'c-spine-precautions',
        level: 'critical',
        title: 'C-Spine Precautions Required',
        message: 'Cervical spine injury possible',
        triggers: ['head_injury_airway_threatened'],
        actions: [
          'Manual in-line stabilization',
          'Video laryngoscopy preferred',
          'Minimize neck movement',
          'Surgical airway backup'
        ],
        timestamp,
        category: 'procedural'
      });
    }

    if (trauma?.neckFacialTrauma) {
      alerts.push({
        id: 'difficult-airway-trauma',
        level: 'critical',
        title: 'Airway Trauma - High Risk',
        message: 'Consider awake intubation',
        triggers: ['neck_facial_trauma'],
        actions: [
          'ENT consultation',
          'Awake intubation consideration',
          'Flexible bronchoscopy',
          'Emergency cricothyrotomy setup'
        ],
        timestamp,
        category: 'airway'
      });
    }

    if (trauma?.burnInhalation) {
      alerts.push({
        id: 'burn-inhalation',
        level: 'critical',
        title: 'Burn/Inhalation Injury',
        message: 'Early intubation recommended',
        triggers: ['burn_inhalation'],
        actions: [
          'Early intubation before edema',
          'Large ETT size',
          'Airway edema monitoring',
          'Special ventilator settings'
        ],
        timestamp,
        category: 'airway'
      });
    }
  }

  if (indication.category === 'medical') {
    const medical = indication.medical;

    if (medical?.sepsis) {
      alerts.push({
        id: 'sepsis-bundle',
        level: 'critical',
        title: 'Sepsis Bundle Activation',
        message: 'Sepsis protocol initiated',
        triggers: ['sepsis_indication'],
        actions: [
          'Fluid resuscitation',
          'Early antibiotic administration',
          'Vasopressor preparation',
          'Lactate monitoring',
          'Etomidate for induction'
        ],
        timestamp,
        category: 'hemodynamic'
      });
    }

    if (medical?.anaphylaxis) {
      alerts.push({
        id: 'anaphylaxis-protocol',
        level: 'critical',
        title: 'Anaphylaxis Protocol',
        message: 'Immediate epinephrine required',
        triggers: ['anaphylaxis'],
        actions: [
          'Epinephrine 1:1000 IM',
          'IV steroids',
          'H1/H2 blockers',
          'Fluid resuscitation',
          'Avoid succinylcholine'
        ],
        timestamp,
        category: 'medication'
      });
    }

    if (medical?.cardiacFailure) {
      alerts.push({
        id: 'cardiac-failure',
        level: 'warning',
        title: 'Cardiac Failure Management',
        message: 'Preload reduction strategies',
        triggers: ['cardiac_failure'],
        actions: [
          'Preload reduction',
          'Inotrope preparation',
          'Etomidate preferred',
          'LVAD/mechanical support consideration'
        ],
        timestamp,
        category: 'hemodynamic'
      });
    }

    if (medical?.respiratoryFailure) {
      alerts.push({
        id: 'ards-protocol',
        level: 'warning',
        title: 'ARDS Protocol Consideration',
        message: 'Lung protective ventilation',
        triggers: ['respiratory_failure'],
        actions: [
          'Lung protective ventilation',
          'PEEP optimization',
          'Prone positioning evaluation',
          'ECMO criteria assessment'
        ],
        timestamp,
        category: 'hemodynamic'
      });
    }
  }

  return alerts;
}

// Generate protocol activations
export function getActivatedProtocols(formData: FormData): ProtocolActivation[] {
  const protocols: ProtocolActivation[] = [];

  // Sepsis protocol
  if (formData.indication?.medical?.sepsis) {
    protocols.push({
      id: 'sepsis-bundle',
      name: 'Sepsis Bundle Protocol',
      indication: 'Sepsis',
      steps: [
        'Obtain blood cultures before antibiotics',
        'Administer broad-spectrum antibiotics within 1 hour',
        'Measure lactate level',
        'Begin rapid administration of 30ml/kg crystalloid for hypotension or lactate ≥4 mmol/L',
        'Apply vasopressors if hypotension during or after fluid resuscitation to maintain MAP ≥65 mmHg'
      ],
      medications: ['Broad-spectrum antibiotics', 'Crystalloid fluids', 'Vasopressors'],
      monitoring: ['Blood pressure', 'Urine output', 'Lactate levels'],
      consultations: ['Infectious disease', 'ICU']
    });
  }

  // Neuroprotection protocol
  if (formData.gcs && calcTotalGCS(formData.gcs)! <= 8) {
    protocols.push({
      id: 'neuroprotection',
      name: 'Neuroprotection Protocol',
      indication: 'Severe brain injury (GCS ≤8)',
      steps: [
        'Maintain MAP >80 mmHg',
        'Target PCO2 35-40 mmHg',
        'Maintain normothermia',
        'Elevate head of bed 30 degrees',
        'Avoid hypotonic fluids'
      ],
      medications: ['Propofol', 'Mannitol if indicated', 'Hypertonic saline if indicated'],
      monitoring: ['ICP monitoring', 'Frequent neurological checks', 'ABG monitoring'],
      consultations: ['Neurosurgery', 'ICU']
    });
  }

  // Difficult airway protocol
  if (formData.leonScore && calcLeonScore(formData.leonScore) >= 3) {
    protocols.push({
      id: 'difficult-airway',
      name: 'Difficult Airway Protocol',
      indication: 'High LEON score (≥3)',
      steps: [
        'Prepare multiple airway devices',
        'Experienced intubator',
        'Video laryngoscopy first line',
        'Surgical airway backup ready',
        'Consider awake intubation if LEON ≥4'
      ],
      medications: ['Topical anesthetics for awake intubation'],
      monitoring: ['Continuous capnography', 'Pulse oximetry'],
      consultations: ['ENT', 'Anesthesia']
    });
  }

  return protocols;
}

// Real-time monitoring alerts
export function checkMonitoringAlerts(vitals: VitalSigns, timePoint: string): ClinicalAlert[] {
  const alerts: ClinicalAlert[] = [];
  const timestamp = new Date().toISOString();

  // Post-intubation hypotension
  if (timePoint.includes('post_') && vitals.systolicBP < 90) {
    alerts.push({
      id: 'post-intubation-hypotension',
      level: 'critical',
      title: 'Post-Intubation Hypotension',
      message: 'Immediate intervention required',
      triggers: ['post_intubation_hypotension'],
      actions: [
        'Push-dose epinephrine 10-20 mcg',
        'Fluid bolus 250-500 mL',
        'Start vasopressor infusion',
        'Check sedation depth'
      ],
      timestamp,
      category: 'hemodynamic'
    });
  }

  // Desaturation
  if (vitals.spo2 < 92) {
    alerts.push({
      id: 'desaturation',
      level: 'warning',
      title: 'Desaturation Alert',
      message: `SpO2 ${vitals.spo2}% - Check ventilator settings`,
      triggers: ['desaturation'],
      actions: [
        'Increase FiO2',
        'Check tube position',
        'Assess for pneumothorax',
        'Optimize PEEP'
      ],
      timestamp,
      category: 'hemodynamic'
    });
  }

  return alerts;
}

// Alert severity scoring
export function calculateAlertSeverity(alerts: ClinicalAlert[]): {
  totalScore: number;
  highestLevel: string;
  criticalCount: number;
} {
  let totalScore = 0;
  let criticalCount = 0;
  let highestLevel = 'info';

  alerts.forEach(alert => {
    switch (alert.level) {
      case 'critical':
        totalScore += 3;
        criticalCount++;
        highestLevel = 'critical';
        break;
      case 'warning':
        totalScore += 2;
        if (highestLevel !== 'critical') highestLevel = 'warning';
        break;
      case 'info':
        totalScore += 1;
        break;
    }
  });

  return { totalScore, highestLevel, criticalCount };
}
