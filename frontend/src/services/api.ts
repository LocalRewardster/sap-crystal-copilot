/**
 * API service for Crystal Copilot frontend
 * Handles all communication with the FastAPI backend
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ReportMetadata {
  id: string;
  name: string;
  size: number;
  upload_date: string;
  status: string;
  fields: ReportField[];
  tables: string[];
  parameters: ReportParameter[];
}

export interface ReportField {
  id: string;
  name: string;
  type: string;
  section: string;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  visible: boolean;
  formula?: string;
}

export interface ReportParameter {
  name: string;
  type: string;
  default_value?: any;
  required: boolean;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface QueryResponse {
  response: string;
  confidence: number;
  sources: string[];
  related_fields?: string[];
}

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}/api/v1${endpoint}`;
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error('API Request failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  // Upload endpoints
  async uploadReport(file: File): Promise<ApiResponse<{ report_id: string; message: string }>> {
    const formData = new FormData();
    formData.append('file', file);

    return this.request('/upload', {
      method: 'POST',
      body: formData,
      headers: {}, // Don't set Content-Type for FormData
    });
  }

  // Report metadata endpoints
  async getReportMetadata(reportId: string): Promise<ApiResponse<ReportMetadata>> {
    return this.request(`/reports/${reportId}/metadata`);
  }

  async listReports(): Promise<ApiResponse<ReportMetadata[]>> {
    return this.request('/reports');
  }

  // Query endpoints
  async queryReport(
    reportId: string,
    question: string,
    context?: string
  ): Promise<ApiResponse<QueryResponse>> {
    return this.request(`/reports/${reportId}/query`, {
      method: 'POST',
      body: JSON.stringify({
        question,
        context,
      }),
    });
  }

  // Chat endpoint for general AI assistance
  async chatWithAI(
    messages: ChatMessage[],
    reportId?: string
  ): Promise<ApiResponse<{ response: string; sources?: string[] }>> {
    return this.request('/chat', {
      method: 'POST',
      body: JSON.stringify({
        messages,
        report_id: reportId,
      }),
    });
  }

  // Edit endpoints
  async previewEdit(
    reportId: string,
    patches: any[]
  ): Promise<ApiResponse<{ preview_description: string; warnings: string[] }>> {
    return this.request(`/reports/${reportId}/edit/preview`, {
      method: 'POST',
      body: JSON.stringify({ patches }),
    });
  }

  async applyEdit(
    reportId: string,
    patches: any[],
    description?: string
  ): Promise<ApiResponse<{ change_id: string; message: string }>> {
    return this.request(`/reports/${reportId}/edit/apply`, {
      method: 'POST',
      body: JSON.stringify({
        patches,
        description,
      }),
    });
  }

  // Quick edit operations
  async hideField(
    reportId: string,
    fieldId: string,
    description?: string
  ): Promise<ApiResponse<{ change_id: string; message: string }>> {
    return this.request(`/reports/${reportId}/fields/${fieldId}/hide`, {
      method: 'POST',
      body: JSON.stringify({ description }),
    });
  }

  async renameField(
    reportId: string,
    fieldId: string,
    newName: string,
    description?: string
  ): Promise<ApiResponse<{ change_id: string; message: string }>> {
    return this.request(`/reports/${reportId}/fields/${fieldId}/rename`, {
      method: 'POST',
      body: JSON.stringify({
        new_name: newName,
        description,
      }),
    });
  }

  // Audit log endpoints
  async getChangeLog(reportId: string): Promise<ApiResponse<any[]>> {
    return this.request(`/reports/${reportId}/changelog`);
  }

  async downloadChangeLog(reportId: string): Promise<Blob | null> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/reports/${reportId}/changelog.csv`);
      if (response.ok) {
        return await response.blob();
      }
    } catch (error) {
      console.error('Failed to download changelog:', error);
    }
    return null;
  }

  // Health check
  async healthCheck(): Promise<ApiResponse<{ status: string; version: string }>> {
    return this.request('/health');
  }
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService;