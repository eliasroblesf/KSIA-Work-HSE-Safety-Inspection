/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { 
  ClipboardCheck, 
  History, 
  Plus, 
  Save, 
  FileText, 
  Camera, 
  Trash2, 
  ArrowLeft,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Menu,
  Download,
  Share2,
  WifiOff
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';
import { InspectionReport, ChecklistItem, InspectionStatus, SeverityLevel, CorrectiveAction } from './types';
import { CHECKLIST_TEMPLATE } from './data/checklist';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { generatePDF } from './utils/pdf';
import { PWAInstallButton } from './components/PWAInstallButton';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Hooks ---

function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

// --- Components ---

const OfflineIndicator = () => {
  const isOnline = useOnlineStatus();
  if (isOnline) return null;
  return (
    <div className="fixed bottom-20 md:bottom-8 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2 rounded-full bg-amber-500 px-4 py-2 text-xs font-black text-white shadow-2xl border-2 border-white animate-bounce">
      <WifiOff className="w-4 h-4" />
      OFFLINE MODE · WORKING LOCALLY
    </div>
  );
};

const Button = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'danger' | 'ghost', size?: 'sm' | 'md' | 'lg' }>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    const variants = {
      primary: 'bg-blue-700 text-white hover:bg-blue-800 shadow-sm',
      secondary: 'bg-white text-zinc-900 border border-zinc-200 hover:bg-zinc-50 shadow-sm',
      danger: 'bg-red-600 text-white hover:bg-red-700 shadow-sm',
      ghost: 'bg-transparent text-zinc-600 hover:bg-zinc-100'
    };
    const sizes = {
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base'
    };
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'flex h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    />
  )
);

const Label = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <label className={cn('text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1 block', className)}>
    {children}
  </label>
);

// --- Main App ---

export default function App() {
  const [view, setView] = useState<'dashboard' | 'form'>('dashboard');
  const [reports, setReports] = useState<InspectionReport[]>([]);
  const [currentReport, setCurrentReport] = useState<InspectionReport | null>(null);
  const [activeModuleIndex, setActiveModuleIndex] = useState<number>(-1); // -1 for Header, 0-7 for Modules, 8 for CAP, 9 for Summary

  useEffect(() => {
    const savedReports = localStorage.getItem('ksia_reports');
    if (savedReports) {
      try {
        setReports(JSON.parse(savedReports));
      } catch (e) {
        console.error('Failed to load reports', e);
      }
    }
  }, []);

  const saveReports = useCallback((updatedReports: InspectionReport[]) => {
    setReports(updatedReports);
    localStorage.setItem('ksia_reports', JSON.stringify(updatedReports));
  }, []);

  const createNewReport = () => {
    const newReport: InspectionReport = {
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isDraft: true,
      facility: '',
      zoneId: '',
      floor: '',
      concourse: '',
      leadInspector: '',
      staffId: '',
      badgeId: '',
      deputyWarden: '',
      department: '',
      inspectionDate: format(new Date(), 'yyyy-MM-dd'),
      shift: 'Morning',
      auditType: 'Scheduled HSE Audit',
      safetyOfficer: '',
      radioChannel: '',
      phoneExt: '',
      workersConsulted: false,
      consultationDetails: '',
      hazardAssessmentRef: '',
      modules: JSON.parse(JSON.stringify(CHECKLIST_TEMPLATE)),
      correctiveActions: [],
      leadSignatory: '',
      areaManagerSignatory: '',
      chiefSignatory: ''
    };
    setCurrentReport(newReport);
    setActiveModuleIndex(-1);
    setView('form');
  };

  const handleSave = () => {
    if (!currentReport) return;
    const updatedReport = { ...currentReport, updatedAt: new Date().toISOString() };
    const existingIndex = reports.findIndex(r => r.id === updatedReport.id);
    let newReports: InspectionReport[];
    if (existingIndex > -1) {
      newReports = [...reports];
      newReports[existingIndex] = updatedReport;
    } else {
      newReports = [updatedReport, ...reports];
    }
    saveReports(newReports);
    setCurrentReport(updatedReport);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this report? This cannot be undone.')) {
      const updatedReports = reports.filter(r => r.id !== id);
      saveReports(updatedReports);
    }
  };

  const openReport = (report: InspectionReport) => {
    setCurrentReport(JSON.parse(JSON.stringify(report)));
    setActiveModuleIndex(-1);
    setView('form');
  };

  const updateReportField = (field: keyof InspectionReport, value: any) => {
    if (!currentReport) return;
    setCurrentReport({ ...currentReport, [field]: value });
  };

  const updateModuleItem = (moduleIndex: number, itemIndex: number, updates: Partial<ChecklistItem>) => {
    if (!currentReport) return;
    const newModules = [...currentReport.modules];
    newModules[moduleIndex].items[itemIndex] = {
      ...newModules[moduleIndex].items[itemIndex],
      ...updates
    };
    
    // Automatically manage corrective actions if failed
    let newCAP = [...currentReport.correctiveActions];
    const item = newModules[moduleIndex].items[itemIndex];
    
    if (item.status === 'F' && updates.status === 'F') {
      // Add to CAP if not exists
      const exists = newCAP.find(ca => ca.id === item.id);
      if (!exists) {
        newCAP.push({
          id: item.id,
          location: item.location || '',
          defect: item.finding || '',
          severity: item.severity,
          containment: '',
          owner: '',
          targetSla: '',
          signOff: ''
        });
      }
    } else if (updates.status && updates.status !== 'F') {
      // Remove from CAP if exists
      newCAP = newCAP.filter(ca => ca.id !== item.id);
    }

    setCurrentReport({ ...currentReport, modules: newModules, correctiveActions: newCAP });
  };

  const updateCAP = (index: number, updates: Partial<CorrectiveAction>) => {
    if (!currentReport) return;
    const newCAP = [...currentReport.correctiveActions];
    newCAP[index] = { ...newCAP[index], ...updates };
    setCurrentReport({ ...currentReport, correctiveActions: newCAP });
  };

  const handlePhotoCapture = (moduleIndex: number, itemIndex: number, file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      const currentPhotos = currentReport?.modules[moduleIndex].items[itemIndex].photos || [];
      updateModuleItem(moduleIndex, itemIndex, { photos: [...currentPhotos, base64] });
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = (moduleIndex: number, itemIndex: number, photoIndex: number) => {
    const currentPhotos = currentReport?.modules[moduleIndex].items[itemIndex].photos || [];
    const newPhotos = [...currentPhotos];
    newPhotos.splice(photoIndex, 1);
    updateModuleItem(moduleIndex, itemIndex, { photos: newPhotos });
  };

  const handleExportPDF = async () => {
    if (!currentReport) return;
    await generatePDF(currentReport);
  };

  // --- Rendering Functions ---

  const renderDashboard = () => (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900">KSIA HSE Safety</h1>
            <p className="text-zinc-500 font-medium">Work Safety & Environmental Inspection Management</p>
          </div>
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <PWAInstallButton />
          <Button onClick={createNewReport} className="w-full md:w-auto h-12 text-base">
            <Plus className="w-5 h-5" />
            New HSE Audit
          </Button>
        </div>
      </header>

      <section className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-zinc-100 flex items-center gap-2">
          <History className="w-4 h-4 text-zinc-400" />
          <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-400">Inspection History</h2>
        </div>
        {reports.length === 0 ? (
          <div className="p-12 text-center">
            <ClipboardCheck className="w-12 h-12 text-zinc-200 mx-auto mb-4" />
            <p className="text-zinc-500">No inspections found. Start your first audit above.</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-100">
            {reports.map(report => (
              <div 
                key={report.id} 
                className="p-4 hover:bg-zinc-50 transition-colors flex items-center justify-between gap-4 cursor-pointer"
                onClick={() => openReport(report)}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-zinc-900 truncate">
                      {report.zoneId || 'Unidentified Zone'} {report.concourse && `— ${report.concourse}`}
                    </span>
                    {report.isDraft && (
                      <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded uppercase tracking-tighter">Draft</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-zinc-500">
                    <span className="flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      {report.inspectionDate}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>By {report.leadInspector || 'Unknown'}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    onClick={(e) => { e.stopPropagation(); handleDelete(report.id); }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                  <ChevronRight className="w-5 h-5 text-zinc-300" />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
      
      <footer className="mt-12 pt-8 border-t border-zinc-100 text-center">
        <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 font-bold">
          King Salman International Airport · HSE Operations · ISO 45001 & 14001 Compliant
        </p>
      </footer>
    </div>
  );

  const renderFormHeader = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label>Facility / Terminal / Sector</Label>
          <div className="flex flex-wrap gap-2">
            {['Terminal Concourse', 'Airside Hub', 'Landside Admin', 'Cargo/Support'].map(f => (
              <button
                key={f}
                onClick={() => updateReportField('facility', f)}
                className={cn(
                  'px-3 py-1.5 text-xs font-medium rounded-md border transition-all',
                  currentReport?.facility === f 
                    ? 'bg-blue-50 border-blue-200 text-blue-700' 
                    : 'bg-white border-zinc-200 text-zinc-600 hover:border-zinc-300'
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
        <div>
          <Label>Zone ID</Label>
          <Input 
            value={currentReport?.zoneId} 
            onChange={e => updateReportField('zoneId', e.target.value)}
            placeholder="e.g. ZN-402"
          />
        </div>
        <div>
          <Label>Floor / Level</Label>
          <Input 
            value={currentReport?.floor} 
            onChange={e => updateReportField('floor', e.target.value)}
            placeholder="e.g. L2"
          />
        </div>
        <div>
          <Label>Concourse / Gate</Label>
          <Input 
            value={currentReport?.concourse} 
            onChange={e => updateReportField('concourse', e.target.value)}
            placeholder="e.g. Gate B14"
          />
        </div>
      </div>

      <div className="h-px bg-zinc-100" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label>Lead Inspector</Label>
          <Input 
            value={currentReport?.leadInspector} 
            onChange={e => updateReportField('leadInspector', e.target.value)}
          />
        </div>
        <div>
          <Label>Staff ID</Label>
          <Input 
            value={currentReport?.staffId} 
            onChange={e => updateReportField('staffId', e.target.value)}
          />
        </div>
        <div>
          <Label>Badge ID</Label>
          <Input 
            value={currentReport?.badgeId} 
            onChange={e => updateReportField('badgeId', e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Inspection Date</Label>
          <Input 
            type="date"
            value={currentReport?.inspectionDate} 
            onChange={e => updateReportField('inspectionDate', e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label>Shift Time</Label>
          <div className="flex gap-1 p-1 bg-zinc-100 rounded-lg">
            {['Morning', 'Afternoon', 'Night'].map((s: any) => (
              <button
                key={s}
                onClick={() => updateReportField('shift', s)}
                className={cn(
                  'flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors',
                  currentReport?.shift === s ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="h-px bg-zinc-100" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-1">
          <Label>Audit Type</Label>
          <select 
            value={currentReport?.auditType} 
            onChange={e => updateReportField('auditType', e.target.value)}
            className="flex h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            {['Scheduled HSE Audit', 'Daily Safety Walk', 'Work Permit Inspection', 'Incident Investigation', 'PPE Compliance Check'].map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <div>
          <Label>HSE Officer on Duty</Label>
          <Input 
            value={currentReport?.safetyOfficer} 
            onChange={e => updateReportField('safetyOfficer', e.target.value)}
            placeholder="Enter name"
          />
        </div>
        <div>
          <Label>Radio Channel / Ext.</Label>
          <Input 
            value={currentReport?.radioChannel} 
            onChange={e => updateReportField('radioChannel', e.target.value)}
            placeholder="e.g. Ch 04 / 8822"
          />
        </div>
      </div>

      <div className="h-px bg-zinc-100" />

      <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <ClipboardCheck className="w-4 h-4 text-blue-600" />
          <h3 className="text-xs font-black uppercase tracking-widest text-blue-700">ISO 45001:2018 Operational Control</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="mb-0">Worker Consultation (Cl. 5.4)</Label>
              <button
                onClick={() => updateReportField('workersConsulted', !currentReport?.workersConsulted)}
                className={cn(
                  'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none',
                  currentReport?.workersConsulted ? 'bg-blue-600' : 'bg-zinc-200'
                )}
              >
                <span
                  className={cn(
                    'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                    currentReport?.workersConsulted ? 'translate-x-5' : 'translate-x-0'
                  )}
                />
              </button>
            </div>
            <Input 
              value={currentReport?.consultationDetails} 
              onChange={e => updateReportField('consultationDetails', e.target.value)}
              placeholder="e.g. Discussed with shift supervisor and 3 technicians"
              disabled={!currentReport?.workersConsulted}
            />
          </div>
          <div>
            <Label>Risk Assessment Ref (Cl. 6.1.2)</Label>
            <Input 
              value={currentReport?.hazardAssessmentRef} 
              onChange={e => updateReportField('hazardAssessmentRef', e.target.value)}
              placeholder="e.g. RA-2024-ME-01"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderModule = (index: number) => {
    if (!currentReport) return null;
    const module = currentReport.modules[index];
    return (
      <div className="space-y-8">
        <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl">
          <h3 className="text-xs font-bold uppercase tracking-widest text-blue-500 mb-1">Statutory References</h3>
          <p className="text-sm text-blue-700 leading-relaxed font-medium">{module.statutoryRefs}</p>
        </div>

        <div className="space-y-12">
          {module.items.map((item, itemIdx) => (
            <div key={item.id} className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h4 className="font-bold text-zinc-900 text-lg leading-tight mb-1">
                    <span className="text-blue-600 mr-2">{item.ref}</span>
                    {item.item}
                  </h4>
                  <p className="text-zinc-500 text-sm leading-relaxed">{item.criteria}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-4 space-y-4">
                  <div>
                    <Label>Inspection Status</Label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => updateModuleItem(index, itemIdx, { status: 'P' })}
                        className={cn(
                          'flex-1 py-3 text-sm font-black rounded-xl border-2 transition-all active:scale-95',
                          item.status === 'P' 
                            ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-200' 
                            : 'bg-white border-zinc-200 text-emerald-600 hover:border-emerald-200 hover:bg-emerald-50'
                        )}
                      >
                        PASS
                      </button>
                      <button
                        onClick={() => updateModuleItem(index, itemIdx, { status: 'F' })}
                        className={cn(
                          'flex-1 py-3 text-sm font-black rounded-xl border-2 transition-all active:scale-95',
                          item.status === 'F' 
                            ? 'bg-red-600 border-red-600 text-white shadow-lg shadow-red-200' 
                            : 'bg-white border-zinc-200 text-red-600 hover:border-red-200 hover:bg-red-50'
                        )}
                      >
                        FAIL
                      </button>
                      <button
                        onClick={() => updateModuleItem(index, itemIdx, { status: 'N/A' })}
                        className={cn(
                          'flex-1 py-3 text-sm font-black rounded-xl border-2 transition-all active:scale-95',
                          item.status === 'N/A' 
                            ? 'bg-amber-500 border-amber-500 text-white shadow-lg shadow-amber-200' 
                            : 'bg-white border-zinc-200 text-amber-600 hover:border-amber-200 hover:bg-amber-50'
                        )}
                      >
                        N/A
                      </button>
                    </div>
                  </div>

                  {item.status === 'F' && (
                    <div className="animate-in fade-in slide-in-from-top-2 space-y-4">
                      <div className="bg-red-50/50 p-4 rounded-xl border border-red-100">
                        <Label className="text-red-700">Risk Assessment Matrix (5x5)</Label>
                        <div className="grid grid-cols-2 gap-4 mt-2">
                          <div>
                            <Label className="text-[10px]">Likelihood (1-5)</Label>
                            <select 
                              value={item.likelihood || ''} 
                              onChange={e => updateModuleItem(index, itemIdx, { likelihood: Number(e.target.value) })}
                              className="w-full h-8 text-xs rounded border-zinc-200"
                            >
                              <option value="">Select...</option>
                              {[1, 2, 3, 4, 5].map(v => <option key={v} value={v}>{v}</option>)}
                            </select>
                          </div>
                          <div>
                            <Label className="text-[10px]">Consequence (1-5)</Label>
                            <select 
                              value={item.consequence || ''} 
                              onChange={e => updateModuleItem(index, itemIdx, { consequence: Number(e.target.value) })}
                              className="w-full h-8 text-xs rounded border-zinc-200"
                            >
                              <option value="">Select...</option>
                              {[1, 2, 3, 4, 5].map(v => <option key={v} value={v}>{v}</option>)}
                            </select>
                          </div>
                        </div>
                        {item.likelihood && item.consequence && (
                          <div className="mt-3 flex items-center justify-between bg-white p-2 rounded border border-red-100">
                            <span className="text-[10px] font-bold text-zinc-500 uppercase">Risk Index: <span className="text-zinc-900">{item.likelihood * item.consequence}</span></span>
                            <span className={cn(
                              "text-[10px] font-black px-2 py-0.5 rounded uppercase",
                              item.likelihood * item.consequence <= 4 ? "bg-emerald-100 text-emerald-700" :
                              item.likelihood * item.consequence <= 9 ? "bg-amber-100 text-amber-700" :
                              item.likelihood * item.consequence <= 15 ? "bg-orange-100 text-orange-700" :
                              "bg-red-600 text-white"
                            )}>
                              {item.likelihood * item.consequence <= 4 ? "Low" :
                               item.likelihood * item.consequence <= 9 ? "Medium" :
                               item.likelihood * item.consequence <= 15 ? "High" : "Critical"}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <Label>Severity Level (Legacy)</Label>
                        <div className="flex gap-1 p-1 bg-red-50 rounded-lg border border-red-100">
                          {['L1', 'L2', 'L3'].map((s: any) => (
                            <button
                              key={s}
                              onClick={() => updateModuleItem(index, itemIdx, { severity: s })}
                              className={cn(
                                'flex-1 py-2 text-xs font-bold rounded-md transition-all',
                                item.severity === s 
                                  ? s === 'L1' ? 'bg-amber-400 text-white' 
                                    : s === 'L2' ? 'bg-orange-500 text-white'
                                    : 'bg-red-700 text-white'
                                  : 'text-red-300 hover:text-red-500'
                              )}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="lg:col-span-8 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Exact Location / Asset ID</Label>
                      <Input 
                        value={item.location} 
                        onChange={e => updateModuleItem(index, itemIdx, { location: e.target.value })}
                        placeholder="e.g. PBB Door #4"
                      />
                    </div>
                    <div>
                      <Label>Specific Finding</Label>
                      <Input 
                        value={item.finding} 
                        onChange={e => updateModuleItem(index, itemIdx, { finding: e.target.value })}
                        placeholder="e.g. Obstructed by baggage cart"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Photo Evidence</Label>
                    <div className="flex flex-wrap gap-3">
                      {item.photos.map((photo, pIdx) => (
                        <div key={pIdx} className="relative group w-20 h-20">
                          <img src={photo} className="w-full h-full object-cover rounded-lg border-2 border-zinc-200" />
                          <button 
                            onClick={() => removePhoto(index, itemIdx, pIdx)}
                            className="absolute -top-2 -right-2 bg-red-600 text-white p-1 rounded-full shadow-lg transition-transform active:scale-110"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                      
                      {/* Take Photo (Camera) */}
                      <label className="w-20 h-20 flex flex-col items-center justify-center border-2 border-dashed border-blue-200 bg-blue-50/30 rounded-lg cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-all active:scale-95">
                        <Camera className="w-6 h-6 text-blue-600" />
                        <span className="text-[9px] text-blue-700 mt-1 font-black uppercase">Camera</span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          capture="environment" 
                          className="hidden" 
                          onChange={e => e.target.files?.[0] && handlePhotoCapture(index, itemIdx, e.target.files[0])}
                        />
                      </label>

                      {/* Upload (Gallery) */}
                      <label className="w-20 h-20 flex flex-col items-center justify-center border-2 border-dashed border-zinc-200 rounded-lg cursor-pointer hover:bg-zinc-50 hover:border-zinc-300 transition-all active:scale-95">
                        <Plus className="w-6 h-6 text-zinc-400" />
                        <span className="text-[9px] text-zinc-500 mt-1 font-black uppercase">Gallery</span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={e => e.target.files?.[0] && handlePhotoCapture(index, itemIdx, e.target.files[0])}
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              <div className="h-px bg-zinc-100 mt-8" />
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderCAP = () => {
    if (!currentReport) return null;
    return (
      <div className="space-y-6">
        <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl mb-6">
          <p className="text-sm text-amber-800 leading-relaxed font-medium">
            Every non-conformance identified during the inspection must be documented below with an immediate control and assigned responsibility.
          </p>
        </div>

        {currentReport.correctiveActions.length === 0 ? (
          <div className="p-12 text-center border-2 border-dashed border-zinc-200 rounded-2xl">
            <CheckCircle2 className="w-12 h-12 text-emerald-100 mx-auto mb-4" />
            <p className="text-zinc-500 font-medium">No deficiencies recorded. All systems within compliance.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {currentReport.correctiveActions.map((ca, idx) => (
              <div key={ca.id} className="p-6 rounded-2xl border border-zinc-200 space-y-4 bg-white shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-black text-blue-600 bg-blue-50 px-2 py-1 rounded">ITEM {ca.id}</span>
                  <div className={cn(
                    'text-[10px] font-black px-2 py-1 rounded uppercase tracking-widest',
                    ca.severity === 'L1' ? 'bg-amber-100 text-amber-700' :
                    ca.severity === 'L2' ? 'bg-orange-100 text-orange-700' :
                    'bg-red-100 text-red-700'
                  )}>
                    LEVEL {ca.severity?.substring(1)} DEFECT
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Defect & Root Cause</Label>
                    <p className="text-sm font-bold text-zinc-900">{ca.defect || 'N/A'}</p>
                  </div>
                  <div>
                    <Label>Location</Label>
                    <p className="text-sm font-bold text-zinc-900">{ca.location || 'N/A'}</p>
                  </div>
                </div>

                <div className="h-px bg-zinc-100" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Immediate Containment Action</Label>
                    <Input 
                      value={ca.containment} 
                      onChange={e => updateCAP(idx, { containment: e.target.value })}
                      placeholder="Actions taken on-site"
                    />
                  </div>
                  <div>
                    <Label>Corrective Owner / Dept</Label>
                    <Input 
                      value={ca.owner} 
                      onChange={e => updateCAP(idx, { owner: e.target.value })}
                      placeholder="e.g. Facilities Maintenance"
                    />
                  </div>
                  <div>
                    <Label>Target SLA Resolution</Label>
                    <Input 
                      value={ca.targetSla} 
                      onChange={e => updateCAP(idx, { targetSla: e.target.value })}
                      placeholder="e.g. 4 Hours"
                    />
                  </div>
                  <div>
                    <Label>Re-Inspection Sign-Off</Label>
                    <Input 
                      value={ca.signOff} 
                      onChange={e => updateCAP(idx, { signOff: e.target.value })}
                      placeholder="Warden Name"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderSummary = () => {
    if (!currentReport) return null;
    
    let totalItems = 0;
    let compliant = 0;
    let lowRisk = 0;
    let medRisk = 0;
    let highRisk = 0;
    let critRisk = 0;

    currentReport.modules.forEach(m => {
      m.items.forEach(i => {
        if (i.status) {
          totalItems++;
          if (i.status === 'P') compliant++;
          if (i.status === 'F') {
            const ri = (i.likelihood && i.consequence) ? i.likelihood * i.consequence : 0;
            if (ri <= 4) lowRisk++;
            else if (ri <= 9) medRisk++;
            else if (ri <= 15) highRisk++;
            else critRisk++;
          }
        }
      });
    });

    return (
      <div className="space-y-12">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-100">
            <Label className="text-zinc-400">Total</Label>
            <div className="text-2xl font-black text-zinc-900">{totalItems}</div>
          </div>
          <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
            <Label className="text-emerald-500">Pass</Label>
            <div className="text-2xl font-black text-emerald-600">{compliant}</div>
          </div>
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
            <Label className="text-blue-500">Low</Label>
            <div className="text-2xl font-black text-blue-600">{lowRisk}</div>
          </div>
          <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
            <Label className="text-amber-500">Med</Label>
            <div className="text-2xl font-black text-amber-600">{medRisk}</div>
          </div>
          <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
            <Label className="text-orange-500">High</Label>
            <div className="text-2xl font-black text-orange-600">{highRisk}</div>
          </div>
          <div className="bg-red-50 p-4 rounded-xl border border-red-100">
            <Label className="text-red-500">Crit</Label>
            <div className="text-2xl font-black text-red-600">{critRisk}</div>
          </div>
        </div>

        <div className="bg-zinc-50 p-6 rounded-2xl border border-zinc-200">
          <h3 className="text-sm font-black text-zinc-900 mb-4 uppercase tracking-widest">Risk Assessment Matrix Key</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-3 rounded-lg border border-zinc-100">
              <div className="text-[10px] font-black text-emerald-600 uppercase mb-1">Low (1-4)</div>
              <p className="text-[10px] text-zinc-500">Routine maintenance & monitoring required.</p>
            </div>
            <div className="bg-white p-3 rounded-lg border border-zinc-100">
              <div className="text-[10px] font-black text-amber-600 uppercase mb-1">Medium (5-9)</div>
              <p className="text-[10px] text-zinc-500">Planned corrective action within SLA.</p>
            </div>
            <div className="bg-white p-3 rounded-lg border border-zinc-100">
              <div className="text-[10px] font-black text-orange-600 uppercase mb-1">High (10-15)</div>
              <p className="text-[10px] text-zinc-500">Urgent action & additional controls needed.</p>
            </div>
            <div className="bg-white p-3 rounded-lg border border-zinc-100">
              <div className="text-[10px] font-black text-red-600 uppercase mb-1">Critical (16-25)</div>
              <p className="text-[10px] text-zinc-500">Immediate threat. Stop work & escalate to AOC.</p>
            </div>
          </div>
        </div>

        <div className="space-y-8 max-w-2xl mx-auto">
          <div className="p-6 bg-zinc-900 text-white rounded-2xl shadow-xl">
            <p className="text-xs font-bold text-blue-400 uppercase tracking-[0.2em] mb-4">Statutory Governance</p>
            <p className="text-sm leading-relaxed italic text-zinc-300">
              "I hereby certify that the physical inspections recorded above were systematically conducted in accordance with ISO 45001:2018 (Occupational Health & Safety), KSIA HSE Manual, and Airport operational safety procedures. All identified Level 3 (High Risk) hazards have been escalated in real time to the HSE Department and Airport Operations Center (AOC). This report supports Clause 9.1 (Monitoring, Measurement, Analysis, and Performance Evaluation) of the ISO 45001 framework."
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <Label>Lead HSE Inspector Signature</Label>
              <Input 
                value={currentReport.leadSignatory} 
                onChange={e => updateReportField('leadSignatory', e.target.value)}
                placeholder="Full Name"
              />
            </div>
            <div>
              <Label>Area Facility / Terminal Manager</Label>
              <Input 
                value={currentReport.areaManagerSignatory} 
                onChange={e => updateReportField('areaManagerSignatory', e.target.value)}
                placeholder="Full Name"
              />
            </div>
            <div>
              <Label>HSE Officer / Safety Manager</Label>
              <Input 
                value={currentReport.chiefSignatory} 
                onChange={e => updateReportField('chiefSignatory', e.target.value)}
                placeholder="Full Name"
              />
            </div>
          </div>
          
          <Button onClick={handleExportPDF} className="w-full h-14 text-lg">
            <Download className="w-5 h-5" />
            Export Final Report (PDF)
          </Button>
        </div>
      </div>
    );
  };

  const renderForm = () => {
    if (!currentReport) return null;

    const sections = [
      { id: -1, title: 'Admin' },
      ...currentReport.modules.map((m, i) => ({ id: i, title: `Module ${m.id}` })),
      { id: 8, title: 'CAP' },
      { id: 9, title: 'Final' }
    ];

    const currentSectionTitle = sections.find(s => s.id === activeModuleIndex)?.title;

    return (
      <div className="min-h-screen bg-zinc-50 flex flex-col">
        {/* Sticky Header */}
        <header className="sticky top-0 z-50 bg-white border-b border-zinc-200 px-4 py-3 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => setView('dashboard')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h2 className="text-sm font-black text-zinc-900 leading-tight">INSPECTION REPORT</h2>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter truncate max-w-[120px]">
                {currentReport.zoneId || 'NEW AUDIT'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={handleSave}>
              <Save className="w-4 h-4" />
              <span className="hidden md:inline">Save Draft</span>
            </Button>
            <Button size="sm" onClick={handleExportPDF}>
              <Share2 className="w-4 h-4" />
              <span className="hidden md:inline">Export</span>
            </Button>
          </div>
        </header>

        {/* Section Navigation (Horizontal Scroll on Mobile) */}
        <nav className="bg-white border-b border-zinc-200 overflow-x-auto no-scrollbar scroll-smooth whitespace-nowrap px-4">
          <div className="flex items-center">
            {sections.map(s => (
              <button
                key={s.id}
                onClick={() => setActiveModuleIndex(s.id)}
                className={cn(
                  'px-4 py-4 text-xs font-black uppercase tracking-widest transition-all border-b-2 relative -mb-[2px]',
                  activeModuleIndex === s.id 
                    ? 'border-blue-600 text-blue-600' 
                    : 'border-transparent text-zinc-400 hover:text-zinc-600'
                )}
              >
                {s.title}
              </button>
            ))}
          </div>
        </nav>

        {/* Main Form Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 max-w-5xl mx-auto w-full">
          <div className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-zinc-200">
            <div className="mb-10">
              <h2 className="text-2xl font-black text-zinc-900 mb-2">
                {activeModuleIndex === -1 ? 'Audit Header & Admin' : 
                 activeModuleIndex === 8 ? 'Corrective Action Plan' :
                 activeModuleIndex === 9 ? 'Final Summary & Sign-Off' :
                 currentReport.modules[activeModuleIndex].title}
              </h2>
              {activeModuleIndex >= 0 && activeModuleIndex <= 7 && (
                <p className="text-zinc-500 text-sm font-medium">Systematic Inspection Module</p>
              )}
            </div>

            {activeModuleIndex === -1 && renderFormHeader()}
            {activeModuleIndex >= 0 && activeModuleIndex <= 7 && renderModule(activeModuleIndex)}
            {activeModuleIndex === 8 && renderCAP()}
            {activeModuleIndex === 9 && renderSummary()}
          </div>
        </main>

        {/* Footer Navigation (Mobile Sticky) */}
        <div className="sticky bottom-0 bg-white border-t border-zinc-200 p-4 flex items-center justify-between gap-4 md:static md:bg-transparent md:border-none md:max-w-5xl md:mx-auto md:w-full">
          <Button 
            variant="secondary" 
            className="flex-1 md:flex-none"
            disabled={activeModuleIndex === -1}
            onClick={() => setActiveModuleIndex(prev => prev - 1)}
          >
            <ChevronLeft className="w-5 h-5" />
            Previous
          </Button>
          <Button 
            className="flex-1 md:flex-none"
            disabled={activeModuleIndex === 9}
            onClick={() => setActiveModuleIndex(prev => prev + 1)}
          >
            Next Section
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-zinc-50 font-sans selection:bg-blue-100">
      {view === 'dashboard' ? renderDashboard() : renderForm()}
      <OfflineIndicator />
    </div>
  );
}
