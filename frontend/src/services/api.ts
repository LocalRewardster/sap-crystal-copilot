import axios from 'axios';

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Response Error:', error.response?.data || error.message);
    
    // Handle specific error cases
    if (error.response?.status === 401) {
      // Handle unauthorized access
      console.warn('Unauthorized access - consider implementing authentication');
    } else if (error.response?.status >= 500) {
      // Handle server errors
      console.error('Server error occurred');
    }
    
    return Promise.reject(error);
  }
);

// Type definitions
export interface UploadResponse {
  report_id: string;
  filename: string;
  file_size: number;
  status: 'uploading' | 'parsing' | 'ready' | 'error';
  message: string;
}

export interface ReportInfo {
  report_id: string;
  filename: string;
  file_size: number;
  status: string;
  error_message?: string;
  created_at: string;
  updated_at: string;
}

export interface ReportField {
  id: string;
  name: string;
  display_name?: string;
  field_type: string;
  section: string;
  x: number;
  y: number;
  width: number;
  height: number;
  visible: boolean;
  formula?: string;
  database_field?: {
    table_name: string;
    field_name: string;
    data_type: string;
  };
}

export interface ReportSection {
  id: string;
  section_type: string;
  name: string;
  height: number;
  visible: boolean;
  fields: ReportField[];
}

export interface ReportMetadata {
  id: string;
  filename: string;
  title?: string;
  description?: string;
  author?: string;
  created_date?: string;
  modified_date?: string;
  sections: ReportSection[];
  parameters: ReportField[];
  formulas: ReportField[];
  database_connections: Array<{
    driver: string;
    server?: string;
    database?: string;
    username?: string;
  }>;
  tables: string[];
  status: string;
  file_size: number;
  parsed_at?: string;
}

export interface QueryRequest {
  query: string;
  context?: Record<string, any>;
}

export interface QueryResponse {
  query: string;
  answer: string;
  field_references: Array<{
    field_id?: string;
    field_name?: string;
    section?: string;
    database_source?: string;
    relevance?: string;
  }>;
  confidence: number;
  sources: string[];
  model_used: string;
  tokens_used: number;
  processing_time_ms: number;
}

export interface EditPatch {
  id?: string;
  operation: 'hide' | 'show' | 'move' | 'rename' | 'resize' | 'format' | 'delete';
  target_field_id: string;
  target_section_id?: string;
  new_name?: string;
  new_position?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  new_format?: Record<string, any>;
  visible?: boolean;
  description?: string;
}

export interface EditPreviewResponse {
  patches: EditPatch[];
  affected_fields: ReportField[];
  html_diff: string;
  warnings: string[];
  estimated_impact: string;
}

export interface ApplyEditsRequest {
  patches: EditPatch[];
  dry_run?: boolean;
  create_backup?: boolean;
}

export interface ApplyEditsResponse {
  success: boolean;
  applied_patches: string[];
  failed_patches: Array<{
    patch_id: string;
    error: string;
  }>;
  backup_path?: string;
  change_log_entries: any[];
}

// API Functions

// Upload
export const uploadReport = async (file: File): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await api.post('/upload/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data;
};

export const getUploadStatus = async (reportId: string): Promise<ReportInfo> => {
  const response = await api.get(`/upload/status/${reportId}`);
  return response.data;
};

// Reports
export const getReports = async (params?: {
  status?: string;
  limit?: number;
  offset?: number;
}): Promise<ReportInfo[]> => {
  const response = await api.get('/reports/', { params });
  return response.data;
};

export const getReportInfo = async (reportId: string): Promise<ReportInfo> => {
  const response = await api.get(`/reports/${reportId}`);
  return response.data;
};

export const getReportMetadata = async (reportId: string): Promise<ReportMetadata> => {
  const response = await api.get(`/reports/${reportId}/metadata`);
  return response.data;
};

export const getReportSections = async (reportId: string): Promise<{
  report_id: string;
  sections: ReportSection[];
}> => {
  const response = await api.get(`/reports/${reportId}/sections`);
  return response.data;
};

export const getReportFields = async (reportId: string, params?: {
  section_type?: string;
  field_type?: string;
}): Promise<{
  report_id: string;
  total_fields: number;
  fields: (ReportField & { section_name: string; section_type: string })[];
}> => {
  const response = await api.get(`/reports/${reportId}/fields`, { params });
  return response.data;
};

export const getDatabaseInfo = async (reportId: string): Promise<{
  report_id: string;
  database_connections: any[];
  tables: string[];
}> => {
  const response = await api.get(`/reports/${reportId}/database-info`);
  return response.data;
};

export const deleteReport = async (reportId: string): Promise<{
  message: string;
  report_id: string;
}> => {
  const response = await api.delete(`/reports/${reportId}`);
  return response.data;
};

// Query
export const queryReport = async (
  reportId: string,
  queryRequest: QueryRequest
): Promise<QueryResponse> => {
  const response = await api.post(`/query/${reportId}`, queryRequest);
  return response.data;
};

export const getQuerySuggestions = async (reportId: string): Promise<{
  report_id: string;
  suggestions: string[];
}> => {
  const response = await api.get(`/query/${reportId}/suggestions`);
  return response.data;
};

export const explainField = async (
  reportId: string,
  fieldId: string
): Promise<{
  field_id: string;
  field_name: string;
  explanation: QueryResponse;
}> => {
  const response = await api.post(`/query/${reportId}/explain-field`, null, {
    params: { field_id: fieldId },
  });
  return response.data;
};

// Edit
export const previewEdits = async (
  reportId: string,
  patches: EditPatch[]
): Promise<EditPreviewResponse> => {
  const response = await api.post(`/edit/${reportId}/preview`, patches);
  return response.data;
};

export const applyEdits = async (
  reportId: string,
  request: ApplyEditsRequest
): Promise<ApplyEditsResponse> => {
  const response = await api.post(`/edit/${reportId}/apply`, request);
  return response.data;
};

export const hideField = async (
  reportId: string,
  fieldId: string,
  description?: string
): Promise<{
  message: string;
  patch_id: string;
  success: boolean;
}> => {
  const response = await api.post(`/edit/${reportId}/hide-field`, null, {
    params: { field_id: fieldId, description },
  });
  return response.data;
};

export const renameField = async (
  reportId: string,
  fieldId: string,
  newName: string,
  description?: string
): Promise<{
  message: string;
  patch_id: string;
  success: boolean;
}> => {
  const response = await api.post(`/edit/${reportId}/rename-field`, null, {
    params: { field_id: fieldId, new_name: newName, description },
  });
  return response.data;
};

export const moveField = async (
  reportId: string,
  fieldId: string,
  position: { x: number; y: number; width?: number; height?: number },
  description?: string
): Promise<{
  message: string;
  patch_id: string;
  success: boolean;
}> => {
  const response = await api.post(`/edit/${reportId}/move-field`, null, {
    params: { 
      field_id: fieldId, 
      x: position.x, 
      y: position.y,
      width: position.width,
      height: position.height,
      description 
    },
  });
  return response.data;
};

export const getChangeLog = async (
  reportId: string,
  params?: { limit?: number; offset?: number }
): Promise<{
  report_id: string;
  total_entries: number;
  entries: any[];
}> => {
  const response = await api.get(`/edit/${reportId}/changelog`, { params });
  return response.data;
};

export const downloadChangeLog = async (reportId: string): Promise<Blob> => {
  const response = await api.get(`/reports/${reportId}/changelog.csv`, {
    responseType: 'blob',
  });
  return response.data;
};

export default api;