import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface FormData {
  demographics: any;
  vitals: any;
  gcs: any;
  indication: any;
  comorbidities: any;
  leonScore: any;
  monitoring: any;
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

    // Patient Demographics
    this.addSection('Patient Demographics', [
      `Name: ${data.demographics?.firstName || ''} ${data.demographics?.lastName || ''}`,
      `Age: ${data.demographics?.age || 'N/A'} years`,
      `Weight: ${data.demographics?.weight || 'N/A'} kg`,
      `Height: ${data.demographics?.height || 'N/A'} cm`,
      `Gender: ${data.demographics?.gender || 'N/A'}`,
      `MRN: ${data.demographics?.mrn || 'N/A'}`
    ]);

    // Vital Signs
    this.addSection('Vital Signs', [
      `Heart Rate: ${data.vitals?.heartRate || 'N/A'} bpm`,
      `Blood Pressure: ${data.vitals?.systolicBP || 'N/A'}/${data.vitals?.diastolicBP || 'N/A'} mmHg`,
      `Respiratory Rate: ${data.vitals?.respiratoryRate || 'N/A'} /min`,
      `Temperature: ${data.vitals?.temperature || 'N/A'} °C`,
      `SpO2: ${data.vitals?.spO2 || 'N/A'}%`
    ]);

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
        `Primary Indication: ${data.indication.primary || 'N/A'}`,
        `Secondary Indications: ${data.indication.secondary?.join(', ') || 'None'}`,
        `Urgency Level: ${data.indication.urgency || 'N/A'}`
      ]);
    }

    // Comorbidities
    if (data.comorbidities && Object.keys(data.comorbidities).length > 0) {
      const comorbidityList = Object.entries(data.comorbidities)
        .filter(([_, value]) => value === true)
        .map(([key, _]) => key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()));

      this.addSection('Comorbidities', comorbidityList.length > 0 ? comorbidityList : ['None reported']);
    }

    // Calculated Values
    if (includeCalculations && data.calculatedValues) {
      this.addSection('Calculated Clinical Values', [
        `BMI: ${data.calculatedValues.bmi ? data.calculatedValues.bmi.toFixed(1) : 'N/A'} kg/m²`,
        `Shock Index: ${data.calculatedValues.shockIndex ? data.calculatedValues.shockIndex.toFixed(2) : 'N/A'}`,
        `MAP: ${data.calculatedValues.map ? data.calculatedValues.map.toFixed(0) : 'N/A'} mmHg`,
        `BSA: ${data.calculatedValues.bsa ? data.calculatedValues.bsa.toFixed(2) : 'N/A'} m²`
      ]);
    }

    // Clinical Alerts
    if (includeAlerts && data.alerts && data.alerts.length > 0) {
      this.addSection('Clinical Alerts',
        data.alerts.map(alert => `⚠️ ${alert.title}: ${alert.message}`)
      );
    }

    // Monitoring Plan
    if (data.monitoring) {
      this.addSection('Post-Intubation Monitoring', [
        `Capnography: ${data.monitoring.capnography ? 'Yes' : 'No'}`,
        `Arterial Line: ${data.monitoring.arterialLine ? 'Yes' : 'No'}`,
        `Central Venous Access: ${data.monitoring.centralVenousAccess ? 'Yes' : 'No'}`,
        `Foley Catheter: ${data.monitoring.foleyCatheter ? 'Yes' : 'No'}`
      ]);
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
