// Type definitions for mobile app

export interface User {
  id: number;
  username: string;
  email?: string;
  full_name?: string;
  role: 'admin' | 'manager' | 'operator' | 'viewer';
  is_active: boolean;
  created_at: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface DefectReport {
  id: string;
  report_id: string;
  status: string;
  machine_id?: string;
  machine_name?: string;
  defect_description: string;
  root_cause?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  created_at: string;
  operator_name?: string;
  customer_name?: string;
}

export interface DashboardStats {
  total_defects: number;
  critical_defects: number;
  defects_this_month: number;
  trend_percentage: number;
  machines_affected: number;
  avg_resolution_time?: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sources?: string[];
}

// Image upload structure for defect reports
export interface ImageUpload {
  uri: string;
  base64?: string;
  filename?: string;
  type?: string;
}

// Enhanced defect input matching Web app functionality
export interface DefectInputData {
  // Basic info
  occurrence_date: string;
  part_name: string;
  part_number: string;
  process_name: string;
  machine_name: string;
  discoverer_name: string;

  // Defect details
  phenomenon: string;
  defect_type: string;
  severity: 'critical' | 'major' | 'minor';

  // 4M Analysis
  category_4m: 'Man' | 'Machine' | 'Material' | 'Method' | '';
  factor: string;
  root_cause: string;

  // Countermeasures
  countermeasure: string;
  notes: string;

  // Images
  defect_image?: ImageUpload | null;
  good_image?: ImageUpload | null;
  workflow_image?: ImageUpload | null;

  // Legacy fields for backward compatibility
  machine_id?: string;
  defect_description?: string;
  operator_name?: string;
  customer_name?: string;
}

export interface ApiError {
  detail: string;
  status_code?: number;
}

// Manufacturing Dashboard Types (matching Web dashboard)
export interface MachineStatus {
  name: string;
  defectRate: number;
  incidents: number;
  status: 'good' | 'warning' | 'critical';
}

export interface DefectTrend {
  date: string;
  defects: number;
  target: number;
}

export interface KPIData {
  totalDefects: number;
  totalMachines: number;
  totalOperators: number;
  totalCustomers: number;
  avgDefectRate: number;
  criticalMachines: number;
  criticalDefects?: number;
}

export interface ExecutiveSummary {
  topRootCauses: Array<{ cause: string; count: number }>;
  defectTypes: Array<{ type: string; count: number }>;
  severityDistribution: Array<{ severity: string; count: number }>;
  lastUpdated: string;
}

export interface ManufacturingData {
  machines: MachineStatus[];
  trends: DefectTrend[];
  kpis: KPIData;
  executiveSummary: ExecutiveSummary;
}
