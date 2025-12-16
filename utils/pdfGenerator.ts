import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface FormData {
  demographics: any;
  vitals: any;
  gcs: any;
  indication: any;
  comorbidities: any;
  leonScore: any;
  preInductionLabs?: any;
  airwayStatus?: any;
  preIntubationManagement?: any;
  postIntubationGcs?: any;
  ventilatorSettings?: any;
  postIntubationEvents?: any;
  intubationAttempts?: any[];
  monitoring?: any;
  calculatedValues: any;
  alerts: any[];
  timestamp: Date;
}

interface PDFOptions {
  includeAlerts?: boolean;
  includeCalculations?: boolean;
  includeTimestamp?: boolean;
  watermark?: string;
}

export class MEARPDFGenerator {
  private pdf: jsPDF;
  private currentY: number = 20;
  private pageHeight: number = 280;
  private margin: number = 20;

  constructor() {
    this.pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
  }

  async generatePDF(data: FormData, options: PDFOptions = {}): Promise<void> {
    const {
      includeAlerts = true,
      includeCalculations = true,
      includeTimestamp = true,
      watermark
    } = options;

    // Header
    this.addHeader(data.timestamp);

    // Patient Demographics & Financial Status
    this.addSection('Patient Demographics', [
      `Age: ${data.demographics?.age || 'N/A'} years`,
      `Sex: ${data.demographics?.sex || 'N/A'}`,
      `Weight: ${data.demographics?.weight || 'N/A'} kg`,
      `Height: ${data.demographics?.height || 'N/A'} cm`,
      `Hospital Number: ${data.demographics?.hospitalNo || 'N/A'}`,
      `Occupation: ${data.demographics?.occupationOther || data.demographics?.occupation || 'N/A'}`,
      `Financial Status: ${data.demographics?.financialStatusOther || data.demographics?.financialStatus || 'N/A'}`
    ]);

    // Pre-induction Hemodynamics
    this.addSection('Pre-induction Hemodynamics', [
      `Heart Rate: ${data.vitals?.heartRate || 'N/A'} bpm`,
      `Blood Pressure: ${data.vitals?.systolicBP || 'N/A'}/${data.vitals?.diastolicBP || 'N/A'} mmHg`,
      `Respiratory Rate: ${data.vitals?.respiratoryRate || 'N/A'} /min`,
      `Temperature: ${data.vitals?.temperature || 'N/A'} °C`,
      `SpO2: ${data.vitals?.spO2 || 'N/A'}%`
    ]);

    // Pre-induction Lab Values
    if (data.preInductionLabs) {
      this.addSection('Pre-induction Lab Values', [
        `pH: ${data.preInductionLabs.ph || 'N/A'}`,
        `pCO2: ${data.preInductionLabs.paco2 || 'N/A'}`,
        `HCO3: ${data.preInductionLabs.hco3 || 'N/A'}`,
        `Lactate: ${data.preInductionLabs.lactate || 'N/A'}`,
        `Creatinine: ${data.preInductionLabs.creatinine || 'N/A'}`,
        `Urea: ${data.preInductionLabs.urea || 'N/A'}`,
        `Na: ${data.preInductionLabs.na || 'N/A'}`,
        `K: ${data.preInductionLabs.k || 'N/A'}`
      ]);
    }

    // Glasgow Coma Scale
    if (data.gcs) {
      this.addSection('Glasgow Coma Scale', [
        `Eye Opening: ${data.gcs.eyeOpening || 'N/A'} points`,
        `Verbal Response: ${data.gcs.verbalResponse || 'N/A'} points`,
        `Motor Response: ${data.gcs.motorResponse || 'N/A'} points`,
        `Total GCS: ${data.calculatedValues?.gcsTotal || 'N/A'}/15`
      ]);
    }

    // LEON Score
    if (data.leonScore) {
      this.addSection('LEON Score (Difficult Airway Assessment)', [
        `Large Tongue: ${data.leonScore.largeTongue || 0} points`,
        `Thyromental Distance: ${data.leonScore.thyroMentalDistance || 0} points`,
        `Obstruction: ${data.leonScore.obstruction || 0} points`,
        `Neck Mobility: ${data.leonScore.neckMobility || 0} points`,
        `Total LEON Score: ${data.calculatedValues?.leonTotalScore || 0}/4`
      ]);
    }

    // Indication for Intubation
    if (data.indication) {
      this.addSection('Indication for Intubation', [
        `Category: ${data.indication.category || 'N/A'}`
      ]);
    }

    // Pre-intubation status & airway
    if (data.airwayStatus) {
      this.addSection('Pre-intubation Airway Status', [
        `Failure to maintain/protect airway: ${data.airwayStatus.failureToMaintainProtectAirway ? 'Yes' : 'No'}`,
        `Failure of ventilation/oxygenation: ${data.airwayStatus.failureOfVentilationOxygenation ? 'Yes' : 'No'}`,
        `Deterioration anticipated: ${data.airwayStatus.deteriorationAnticipated ? 'Yes' : 'No'}`,
        `Predictor for difficult airway: ${data.airwayStatus.predictorForDifficultAirway ? 'Yes' : 'No'}`,
        `Safe apnea time: ${data.airwayStatus.safeApneaTime ?? 'N/A'} minutes`
      ]);
    }

    // Comorbidities
    if (data.comorbidities && Object.keys(data.comorbidities).length > 0) {
      const comorbidityList = Object.entries(data.comorbidities)
        .filter(([_, value]) => value === true)
        .map(([key, _]) => key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()));

      this.addSection('Comorbidities', comorbidityList.length > 0 ? comorbidityList : ['None reported']);
    }

    // Pre-intubation medications & fluids
    if (data.preIntubationManagement) {
      const meds: string[] = [];
      const m = data.preIntubationManagement;
      [
        'etomidate',
        'propofol',
        'ketamine',
        'midazolam',
        'fentanyl',
        'succinylcholine',
        'rocuronium',
        'vecuronium',
        'atracurium',
        'cisatracurium'
      ].forEach((key) => {
        const entry = m[key];
        if (entry?.given) {
          meds.push(`${key} (${entry.dose ?? 'dose N/A'})`);
        }
      });

      if (Array.isArray(m.otherMedications)) {
        m.otherMedications.forEach((om: any) => {
          if (om?.given || om?.dose || om?.name) {
            meds.push(`${om.name || 'Other'} (${om.dose ?? 'dose N/A'})`);
          }
        });
      } else if (m.otherMedication) {
        const om = m.otherMedication;
        if (om?.given || om?.dose || om?.name) {
          meds.push(`${om.name || 'Other'} (${om.dose ?? 'dose N/A'})`);
        }
      }

      this.addSection('Pre-intubation Medications & Fluids', [
        meds.length ? `Medications: ${meds.join(', ')}` : 'Medications: None recorded',
        `Fluids: ${
          m.preInductionFluids
            ? [
                m.preInductionFluids.normalSaline ? 'Normal Saline' : null,
                m.preInductionFluids.ringerLactate ? 'Ringer Lactate' : null,
                m.preInductionFluids.colloids ? 'Colloids' : null
              ].filter(Boolean).join(', ') || 'None'
            : 'None'
        } (Volume: ${m.preInductionFluids?.volumeMl ?? 'N/A'} mL)`,
        m.pushDosePressor
          ? `Push-dose pressor: ${['adrenaline','noradrenaline','phenylephrine','metaraminol']
              .filter(k => m.pushDosePressor[k])
              .join(', ') || 'None'} (Dose: ${m.pushDosePressor.dose ?? 'N/A'})`
          : 'Push-dose pressor: None',
        m.vasopressorInfusion
          ? `Vasopressor infusion: ${m.vasopressorInfusion.agent} (${m.vasopressorInfusion.doseMcgPerKgMin ?? 'N/A'} mcg/kg/min)`
          : 'Vasopressor infusion: None',
        m.sedationInfusion
          ? `Sedation infusion: ${m.sedationInfusion.agent} (${m.sedationInfusion.dose ?? 'N/A'})`
          : 'Sedation infusion: None',
        `Sedation done: ${m.sedationDone || 'N/A'}`
      ]);
    }

    // Calculated Values
    if (includeCalculations && data.calculatedValues) {
      this.addSection('Calculated Clinical Values', [
        `BMI: ${data.calculatedValues.bmi ? data.calculatedValues.bmi.toFixed(1) : 'N/A'} kg/m²`,
        `Shock Index: ${data.calculatedValues.shockIndex ? data.calculatedValues.shockIndex.toFixed(2) : 'N/A'}`,
      `MAP: ${data.calculatedValues.meanArterialPressure ? data.calculatedValues.meanArterialPressure.toFixed(0) : 'N/A'} mmHg`,
      `Modified Shock Index: ${data.calculatedValues.modifiedShockIndex ? data.calculatedValues.modifiedShockIndex.toFixed(2) : 'N/A'}`
      ]);
    }

    // Clinical Alerts
    if (includeAlerts && data.alerts && data.alerts.length > 0) {
      this.addSection('Clinical Alerts',
        data.alerts.map(alert => `⚠️ ${alert.title}: ${alert.message}`)
      );
    }

    // Post-intubation GCS & ventilator (summary)
    if (data.postIntubationGcs || data.ventilatorSettings) {
      this.addSection('Post-intubation Neurology & Ventilation', [
        data.postIntubationGcs
          ? `GCS Post-intubation: E${data.postIntubationGcs.eye || '-'} M${data.postIntubationGcs.motor || '-'} V${data.postIntubationGcs.verbal || '-'}`
          : 'GCS Post-intubation: N/A',
        data.ventilatorSettings
          ? `Ventilator: Mode ${data.ventilatorSettings.mode || 'N/A'}, PEEP ${data.ventilatorSettings.peep ?? 'N/A'}, Ppeak ${data.ventilatorSettings.pPeak ?? 'N/A'}, MV ${data.ventilatorSettings.minuteVentilation ?? 'N/A'}`
          : 'Ventilator: N/A',
        data.ventilatorSettings?.settingsDescription
          ? `Ventilator settings: ${data.ventilatorSettings.settingsDescription}`
          : 'Ventilator settings: N/A',
        data.ventilatorSettings?.ettCdValue
          ? `ETT/CD value: ${data.ventilatorSettings.ettCdValue}`
          : 'ETT/CD value: N/A'
      ]);
    }

    // Post-intubation adverse events
    if (data.postIntubationEvents) {
      this.addSection('Post-intubation Adverse Events', [
        `Post-intubation cardiac arrest: ${data.postIntubationEvents.postIntubationCardiacArrest ? 'Yes' : 'No'}`,
        data.postIntubationEvents.cardiacArrestDetails
          ? `Cardiac arrest details: ${data.postIntubationEvents.cardiacArrestDetails}`
          : '',
        data.postIntubationEvents.otherSeriousAdverseEvents
          ? `Other serious events: ${data.postIntubationEvents.otherSeriousAdverseEvents}`
          : 'Other serious events: None reported'
      ].filter(Boolean) as string[]);
    }

    // Intubation attempts summary
    if (data.intubationAttempts && data.intubationAttempts.length > 0) {
      const lines = data.intubationAttempts.slice(0, 3).map((a, idx) =>
        `Attempt ${idx + 1}: ${a.yearsExperience || 'Experience N/A'}, ${a.laryngoscopeType || 'Scope N/A'}, Blade ${a.bladeSize || 'N/A'}, Bougie/Stylet: ${a.bougieOrStyletUsed ? 'Yes' : 'No'}, ETT change: ${a.ettChanged ? 'Yes' : 'No'}`
      );
      this.addSection('Intubation Attempts', lines);
    }

    // Footer
    this.addFooter(data.timestamp);

    // Watermark
    if (watermark) {
      this.addWatermark(watermark);
    }
  }

  private addHeader(timestamp: Date): void {
    this.pdf.setFontSize(20);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('MEAR - Manipal Emergency Airway Registry', this.margin, this.currentY);

    this.currentY += 10;
    this.pdf.setFontSize(12);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.text(`Generated: ${timestamp.toLocaleString()}`, this.margin, this.currentY);

    this.currentY += 15;
    this.addHorizontalLine();
  }

  private addSection(title: string, items: string[]): void {
    this.checkPageBreak(items.length * 5 + 15);

    this.pdf.setFontSize(14);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text(title, this.margin, this.currentY);
    this.currentY += 8;

    this.pdf.setFontSize(10);
    this.pdf.setFont('helvetica', 'normal');

    items.forEach(item => {
      this.checkPageBreak(5);
      this.pdf.text(`• ${item}`, this.margin + 5, this.currentY);
      this.currentY += 5;
    });

    this.currentY += 5;
  }

  private addFooter(timestamp: Date): void {
    const pageCount = this.pdf.getNumberOfPages();

    for (let i = 1; i <= pageCount; i++) {
      this.pdf.setPage(i);
      this.pdf.setFontSize(8);
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.text(
        `MEAR Report - Page ${i} of ${pageCount} - Generated: ${timestamp.toLocaleDateString()}`,
        this.margin,
        this.pageHeight + 10
      );
    }
  }

  private addWatermark(text: string): void {
    const pageCount = this.pdf.getNumberOfPages();

    for (let i = 1; i <= pageCount; i++) {
      this.pdf.setPage(i);
      this.pdf.setFontSize(50);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.setTextColor(200, 200, 200);

      // Rotate and center the watermark
      this.pdf.text(text, 105, 150, {
        align: 'center',
        angle: 45
      });

      // Reset color
      this.pdf.setTextColor(0, 0, 0);
    }
  }

  private addHorizontalLine(): void {
    this.pdf.setLineWidth(0.5);
    this.pdf.line(this.margin, this.currentY, 210 - this.margin, this.currentY);
    this.currentY += 5;
  }

  private checkPageBreak(spaceNeeded: number): void {
    if (this.currentY + spaceNeeded > this.pageHeight) {
      this.pdf.addPage();
      this.currentY = 20;
    }
  }

  async downloadPDF(filename: string = 'mear-report.pdf'): Promise<void> {
    this.pdf.save(filename);
  }

  getPDFBlob(): Blob {
    return this.pdf.output('blob');
  }

  getPDFDataURL(): string {
    return this.pdf.output('dataurlstring');
  }
}

// Utility function to generate PDF from form element
export async function generatePDFFromElement(
  elementId: string,
  filename: string = 'mear-form.pdf'
): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with ID '${elementId}' not found`);
  }

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#ffffff'
  });

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const imgWidth = 210;
  const pageHeight = 295;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  let heightLeft = imgHeight;
  let position = 0;

  pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
  heightLeft -= pageHeight;

  while (heightLeft >= 0) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
  }

  pdf.save(filename);
}

export default MEARPDFGenerator;
