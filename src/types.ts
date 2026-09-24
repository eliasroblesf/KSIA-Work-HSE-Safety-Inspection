/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type InspectionStatus = 'P' | 'F' | 'N/A' | null;
export type SeverityLevel = 'L1' | 'L2' | 'L3' | null;

export interface ChecklistItem {
  id: string;
  ref: string;
  item: string;
  criteria: string;
  status: InspectionStatus;
  severity: SeverityLevel;
  likelihood: number | null; // 1-5 scale
  consequence: number | null; // 1-5 scale
  location: string;
  finding: string;
  photos: string[]; // Base64 strings for offline storage
}

export interface InspectionModule {
  id: string;
  title: string;
  statutoryRefs: string;
  items: ChecklistItem[];
}

export interface CorrectiveAction {
  id: string;
  location: string;
  defect: string;
  severity: SeverityLevel;
  containment: string;
  owner: string;
  targetSla: string;
  signOff: string;
}

export interface InspectionReport {
  id: string;
  createdAt: string;
  updatedAt: string;
  isDraft: boolean;
  
  // Header
  facility: string;
  zoneId: string;
  floor: string;
  concourse: string;
  leadInspector: string;
  staffId: string;
  badgeId: string;
  deputyWarden: string;
  department: string;
  inspectionDate: string;
  shift: 'Morning' | 'Afternoon' | 'Night';
  auditType: 'Scheduled HSE Audit' | 'Daily Safety Walk' | 'Work Permit Inspection' | 'Incident Investigation' | 'PPE Compliance Check';
  safetyOfficer: string;
  radioChannel: string;
  phoneExt: string;

  // ISO 45001 Compliance
  workersConsulted: boolean;
  consultationDetails: string;
  hazardAssessmentRef: string;

  // Modules
  modules: InspectionModule[];

  // Corrective Actions
  correctiveActions: CorrectiveAction[];

  // Sign-off
  leadSignatory: string;
  areaManagerSignatory: string;
  chiefSignatory: string;
}
