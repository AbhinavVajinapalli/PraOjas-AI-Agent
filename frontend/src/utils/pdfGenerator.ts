import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Patient, PredictionResult, ExplainabilityResult } from '../types';

export const generatePatientReport = async (
  patient: Patient, 
  prediction?: PredictionResult | null, 
  explainability?: ExplainabilityResult | null
) => {
  // Create a container for the visual report
  const reportContainer = document.createElement('div');
  reportContainer.style.position = 'absolute';
  reportContainer.style.left = '-9999px';
  reportContainer.style.top = '-9999px';
  reportContainer.style.width = '800px';
  reportContainer.style.backgroundColor = '#0f172a'; // slate-950
  reportContainer.style.color = '#f8fafc'; // slate-50
  reportContainer.style.padding = '40px';
  reportContainer.style.fontFamily = 'system-ui, sans-serif';
  
  // HTML content for the report
  let html = `
    <div style="border-bottom: 2px solid #1e293b; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: flex-start;">
      <div>
        <h1 style="margin: 0 0 10px 0; font-size: 32px; color: #f1f5f9;">${patient.name}</h1>
        <div style="display: flex; gap: 15px; color: #94a3b8; font-size: 14px;">
          <span style="background: #1e293b; padding: 4px 8px; border-radius: 4px;">ID: ${patient.id}</span>
          <span style="background: #1e293b; padding: 4px 8px; border-radius: 4px;">${patient.age}y ${patient.gender}</span>
          <span style="background: #1e293b; padding: 4px 8px; border-radius: 4px;">${patient.department}</span>
        </div>
      </div>
      <div style="text-align: right;">
        <div style="font-size: 12px; color: #64748b; margin-bottom: 4px; text-transform: uppercase;">Status</div>
        <div style="font-size: 20px; font-weight: bold; color: ${patient.status === 'Critical' ? '#ef4444' : patient.status === 'Warning' ? '#f59e0b' : '#10b981'};">
          ${patient.status}
        </div>
      </div>
    </div>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px;">
      <!-- Vitals Box -->
      <div style="background: #1e293b; padding: 20px; border-radius: 12px;">
        <h2 style="margin: 0 0 15px 0; font-size: 18px; color: #cbd5e1; display: flex; align-items: center; gap: 8px;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: #6366f1;"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
          Current Vitals
        </h2>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
          <div style="background: #0f172a; padding: 12px; border-radius: 8px; border: 1px solid #334155;">
            <div style="font-size: 11px; color: #64748b; text-transform: uppercase; margin-bottom: 4px;">Heart Rate</div>
            <div style="font-size: 24px; font-weight: bold; font-family: monospace;">${patient.vitals.hr} <span style="font-size: 12px; color: #64748b;">bpm</span></div>
          </div>
          <div style="background: #0f172a; padding: 12px; border-radius: 8px; border: 1px solid #334155;">
            <div style="font-size: 11px; color: #64748b; text-transform: uppercase; margin-bottom: 4px;">Blood Pressure</div>
            <div style="font-size: 24px; font-weight: bold; font-family: monospace;">${patient.vitals.bp} <span style="font-size: 12px; color: #64748b;">mmHg</span></div>
          </div>
          <div style="background: #0f172a; padding: 12px; border-radius: 8px; border: 1px solid #334155;">
            <div style="font-size: 11px; color: #64748b; text-transform: uppercase; margin-bottom: 4px;">SpO2</div>
            <div style="font-size: 24px; font-weight: bold; font-family: monospace;">${patient.vitals.spo2} <span style="font-size: 12px; color: #64748b;">%</span></div>
          </div>
          <div style="background: #0f172a; padding: 12px; border-radius: 8px; border: 1px solid #334155;">
            <div style="font-size: 11px; color: #64748b; text-transform: uppercase; margin-bottom: 4px;">Temperature</div>
            <div style="font-size: 24px; font-weight: bold; font-family: monospace;">${patient.vitals.temp} <span style="font-size: 12px; color: #64748b;">°C</span></div>
          </div>
        </div>
      </div>

      <!-- AI Risk Box -->
      ${prediction ? `
      <div style="background: #1e293b; padding: 20px; border-radius: 12px;">
        <h2 style="margin: 0 0 15px 0; font-size: 18px; color: #cbd5e1; display: flex; align-items: center; gap: 8px;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: #6366f1;"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          Active AI Risk Flags
        </h2>
        
        <div style="display: flex; flex-direction: column; gap: 15px;">
          <div style="background: #0f172a; padding: 15px; border-radius: 8px; border: 1px solid ${prediction.sepsisProbability > 0.5 ? '#7f1d1d' : prediction.sepsisProbability > 0.3 ? '#78350f' : '#064e3b'}; display: flex; align-items: center; justify-content: space-between;">
            <div>
              <div style="font-size: 14px; font-weight: bold; color: #f1f5f9; margin-bottom: 4px;">Sepsis Risk Level</div>
              <div style="font-size: 12px; color: #94a3b8;">Based on 24h trend analysis</div>
            </div>
            <div style="font-size: 24px; font-weight: bold; color: ${prediction.sepsisProbability > 0.5 ? '#ef4444' : prediction.sepsisProbability > 0.3 ? '#f59e0b' : '#10b981'};">
              ${Math.round(prediction.sepsisProbability * 100)}%
            </div>
          </div>
          
          <div style="background: #0f172a; padding: 15px; border-radius: 8px; border: 1px solid #334155; display: flex; align-items: center; justify-content: space-between;">
            <div>
              <div style="font-size: 14px; font-weight: bold; color: #f1f5f9; margin-bottom: 4px;">Mortality Risk (30-day)</div>
            </div>
            <div style="font-size: 20px; font-weight: bold; color: #cbd5e1;">
              ${Math.round(prediction.mortalityProbability * 100)}%
            </div>
          </div>
        </div>
      </div>
      ` : `
      <div style="background: #1e293b; padding: 20px; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: #64748b;">
        No active AI predictions run for this patient.
      </div>
      `}
    </div>

    <!-- Explainability -->
    ${explainability ? `
    <div style="background: #1e293b; padding: 20px; border-radius: 12px; margin-bottom: 30px;">
      <h2 style="margin: 0 0 15px 0; font-size: 18px; color: #cbd5e1;">AI Clinical Summary</h2>
      <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #94a3b8;">
        ${explainability.explanation}
      </p>
    </div>
    ` : ''}
    
    <div style="border-top: 1px solid #1e293b; padding-top: 20px; text-align: center; color: #64748b; font-size: 12px;">
      Generated on ${new Date().toLocaleString()} • AI Studio Handoff Report
    </div>
  `;
  
  reportContainer.innerHTML = html;
  document.body.appendChild(reportContainer);

  try {
    const canvas = await html2canvas(reportContainer, {
      scale: 2, // High quality
      backgroundColor: '#0f172a',
      logging: false
    });
    
    const imgData = canvas.toDataURL('image/png');
    
    // A4 size: 210 x 297 mm
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`Patient_Handoff_${patient.id}_${new Date().toISOString().split('T')[0]}.pdf`);
  } catch (error) {
    console.error('Failed to generate PDF', error);
  } finally {
    document.body.removeChild(reportContainer);
  }
};
