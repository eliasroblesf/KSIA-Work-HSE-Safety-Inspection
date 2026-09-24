/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { InspectionReport } from '../types';
import { format } from 'date-fns';

export const generatePDF = async (report: InspectionReport) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;

  // --- Header ---
  doc.setFillColor(0, 86, 179); // Riyadh Airport Blue
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('KING SALMAN INTERNATIONAL AIRPORT', 15, 20);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('HEALTH, SAFETY & ENVIRONMENT (HSE) SYSTEMATIC INSPECTION', 15, 30);
  doc.text('ISO 45001:2018 & ISO 14001:2015 CERTIFIED MANAGEMENT SYSTEMS', 15, 35);

  let y = 50;

  // --- Admin Section ---
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('1. AUDIT HEADER & ADMINISTRATIVE CONTROL', 15, y);
  y += 10;

  autoTable(doc, {
    startY: y,
    head: [['Field', 'Record Details']],
    body: [
      ['Facility / Terminal / Sector', report.facility || 'N/A'],
      ['Zone ID / Area Identification', report.zoneId || 'N/A'],
      ['Floor / Level', report.floor || 'N/A'],
      ['Concourse / Gate', report.concourse || 'N/A'],
      ['Lead Inspector (HSE)', `${report.leadInspector} (Staff ID: ${report.staffId}, Badge: ${report.badgeId})`],
      ['Inspection Date & Shift', `${report.inspectionDate} (${report.shift} Shift)`],
      ['Audit Type', report.auditType],
      ['HSE Officer on Duty', report.safetyOfficer || 'N/A'],
      ['Worker Consultation (Cl. 5.4)', report.workersConsulted ? `Yes - ${report.consultationDetails}` : 'No'],
      ['Risk Assessment Ref (Cl. 6.1.2)', report.hazardAssessmentRef || 'N/A']
    ],
    theme: 'grid',
    headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold' },
    styles: { fontSize: 9, cellPadding: 3 }
  });

  y = (doc as any).lastAutoTable.finalY + 15;

  // --- Systematic Modules ---
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('2. SYSTEMATIC INSPECTION MODULES', 15, y);
  y += 10;

  for (const module of report.modules) {
    // Check if module has any items with data
    const hasData = module.items.some(i => i.status !== null);
    if (!hasData) continue;

    if (y > 250) {
      doc.addPage();
      y = 20;
    }

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(`Module ${module.id}: ${module.title}`, 15, y);
    y += 5;

    autoTable(doc, {
      startY: y,
      head: [['Ref', 'Item', 'Status', 'L', 'C', 'RI', 'Category', 'Finding']],
      body: module.items.map(i => {
        const ri = (i.likelihood && i.consequence) ? i.likelihood * i.consequence : null;
        const category = !ri ? '-' : 
          ri <= 4 ? 'Low' : 
          ri <= 9 ? 'Med' : 
          ri <= 15 ? 'High' : 'Crit';
        
        return [
          i.ref,
          i.item,
          i.status || '-',
          i.likelihood || '-',
          i.consequence || '-',
          ri || '-',
          category,
          `${i.location}${i.finding ? ' / ' + i.finding : ''}`
        ];
      }),
      theme: 'grid',
      headStyles: { fillColor: [0, 86, 179], textColor: [255, 255, 255] },
      styles: { fontSize: 7, cellPadding: 1.5 },
      columnStyles: {
        0: { cellWidth: 8 },
        1: { cellWidth: 50 },
        2: { cellWidth: 12, halign: 'center' },
        3: { cellWidth: 8, halign: 'center' },
        4: { cellWidth: 8, halign: 'center' },
        5: { cellWidth: 8, halign: 'center' },
        6: { cellWidth: 12, halign: 'center' },
        7: { cellWidth: 'auto' }
      }
    });

    y = (doc as any).lastAutoTable.finalY + 10;
  }

  // --- Risk Matrix Legend ---
  if (y > 230) {
    doc.addPage();
    y = 20;
  }
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('3. RISK ASSESSMENT MATRIX LEGEND (5x5)', 15, y);
  y += 10;

  autoTable(doc, {
    startY: y,
    head: [['Score Range', 'Risk Category', 'Action Required']],
    body: [
      ['1 - 4', 'LOW RISK', 'Routine maintenance / Monitoring'],
      ['5 - 9', 'MEDIUM RISK', 'Planned corrective action required'],
      ['10 - 15', 'HIGH RISK', 'Urgent action / Control measures needed'],
      ['16 - 25', 'CRITICAL RISK', 'Immediate life threat / Stop work / AOC escalation']
    ],
    theme: 'grid',
    headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0] },
    styles: { fontSize: 8 },
    columnStyles: {
      1: { fontStyle: 'bold' }
    }
  });

  y = (doc as any).lastAutoTable.finalY + 15;

  // --- CAP Section ---
  if (report.correctiveActions.length > 0) {
    if (y > 230) {
      doc.addPage();
      y = 20;
    }

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('4. CORRECTIVE ACTION PLAN & DEFECT ESCALATION', 15, y);
    y += 10;

    autoTable(doc, {
      startY: y,
      head: [['Item', 'Defect', 'Sev', 'Immediate Action', 'Owner', 'SLA']],
      body: report.correctiveActions.map(ca => [
        ca.id,
        ca.defect,
        ca.severity,
        ca.containment,
        ca.owner,
        ca.targetSla
      ]),
      theme: 'grid',
      headStyles: { fillColor: [180, 0, 0], textColor: [255, 255, 255] },
      styles: { fontSize: 8, cellPadding: 2 }
    });

    y = (doc as any).lastAutoTable.finalY + 15;
  }

  // --- Final Sign-off ---
  if (y > 230) {
    doc.addPage();
    y = 20;
  }

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('5. FINAL AUDIT SUMMARY & FORMAL CLOSE-OUT', 15, y);
  y += 10;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  const declaration = "I hereby certify that the physical inspections recorded above were systematically conducted in accordance with ISO 45001:2018 (Occupational Health & Safety), KSIA HSE Manual, and Airport operational safety procedures. All identified Level 3 (High Risk) hazards have been escalated in real time to the HSE Department and Airport Operations Center (AOC). This report supports Clause 9.1 (Monitoring, Measurement, Analysis, and Performance Evaluation) of the ISO 45001 framework.";
  const splitText = doc.splitTextToSize(declaration, pageWidth - 30);
  doc.text(splitText, 15, y);
  y += (splitText.length * 5) + 10;

  const signoffBody = [
    ['Lead HSE Inspector', report.leadSignatory || '_______________________', format(new Date(), 'dd/MM/yyyy HH:mm')],
    ['Area Facility / Terminal Manager', report.areaManagerSignatory || '_______________________', '____/____/2026'],
    ['HSE Officer / Safety Manager', report.chiefSignatory || '_______________________', '____/____/2026']
  ];

  autoTable(doc, {
    startY: y,
    head: [['Role', 'Printed Name / Signature', 'Date & Time']],
    body: signoffBody,
    theme: 'grid',
    styles: { fontSize: 9, cellPadding: 5 }
  });

  // --- Photo Appendix ---
  const allPhotos: { ref: string, photo: string }[] = [];
  report.modules.forEach(m => {
    m.items.forEach(i => {
      i.photos.forEach(p => {
        allPhotos.push({ ref: i.ref, photo: p });
      });
    });
  });

  if (allPhotos.length > 0) {
    doc.addPage();
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('APPENDIX: PHOTO EVIDENCE', 15, 20);
    
    let photoY = 30;
    let photoX = 15;
    const photoWidth = 85;
    const photoHeight = 60;

    allPhotos.forEach((item, index) => {
      if (photoY > 230) {
        doc.addPage();
        photoY = 20;
      }

      try {
        doc.addImage(item.photo, 'JPEG', photoX, photoY, photoWidth, photoHeight);
        doc.setFontSize(8);
        doc.text(`Ref: ${item.ref}`, photoX, photoY + photoHeight + 5);
      } catch (e) {
        console.error('Failed to add image to PDF', e);
      }

      if (index % 2 === 0) {
        photoX = 110;
      } else {
        photoX = 15;
        photoY += 80;
      }
    });
  }

  // --- Footer ---
  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `KSIA HSE SAFETY INSPECTION REPORT | ID: ${report.id.substring(0, 8)} | Page ${i} of ${totalPages}`,
      pageWidth / 2,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );
  }

  doc.save(`KSIA_HSE_REPORT_${report.zoneId || 'EXPORT'}_${format(new Date(), 'yyyyMMdd_HHmm')}.pdf`);
};
