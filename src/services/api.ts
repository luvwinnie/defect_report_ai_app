// API service for communicating with backend

import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';
import {
  TokenResponse,
  User,
  DashboardStats,
  DefectReport,
  ChatMessage,
  DefectInputData,
  MachineStatus,
  DefectTrend,
  KPIData,
  ExecutiveSummary,
} from '../types';

// Extend axios config to include _retry property
interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// API Base URL configuration
// Use ngrok URL for both simulator and physical devices
// This ensures consistent behavior and allows HTTPS access
const NGROK_URL = 'https://unrationable-unperpetuable-halley.ngrok-free.app';

// Always use ngrok URL for API calls
const API_BASE_URL = NGROK_URL;

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

class ApiService {
  private client: AxiosInstance;
  private accessToken: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      async (config) => {
        const token = await this.getAccessToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as CustomAxiosRequestConfig | undefined;

        if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const newToken = await this.refreshAccessToken();
            if (newToken) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              return this.client(originalRequest);
            }
          } catch (refreshError) {
            await this.clearTokens();
            throw refreshError;
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // Token management
  async getAccessToken(): Promise<string | null> {
    if (this.accessToken) return this.accessToken;

    try {
      this.accessToken = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
      return this.accessToken;
    } catch {
      return null;
    }
  }

  async setTokens(accessToken: string, refreshToken?: string): Promise<void> {
    this.accessToken = accessToken;
    await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
    if (refreshToken) {
      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
    }
  }

  async clearTokens(): Promise<void> {
    this.accessToken = null;
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
  }

  async refreshAccessToken(): Promise<string | null> {
    try {
      const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
      if (!refreshToken) {
        console.log('No refresh token found');
        return null;
      }

      console.log('Attempting token refresh...');

      // Use mobile-friendly refresh endpoint that accepts token in body
      const response = await axios.post<{
        access_token: string;
        refresh_token: string;
        token_type: string;
        expires_in: number;
      }>(
        `${API_BASE_URL}/api/auth/mobile/refresh`,
        { refresh_token: refreshToken },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const { access_token, refresh_token: newRefreshToken } = response.data;
      // Store both new access and refresh tokens (token rotation)
      await this.setTokens(access_token, newRefreshToken);
      console.log('Token refresh successful');
      return access_token;
    } catch (error: any) {
      console.log('Token refresh failed:', error.response?.status, error.message);
      return null;
    }
  }

  // Auth endpoints
  async login(username: string, password: string): Promise<TokenResponse> {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);

    console.log('=== LOGIN DEBUG ===');
    console.log('API_BASE_URL:', API_BASE_URL);
    console.log('Username:', username);
    console.log('Using mobile login endpoint for token persistence');

    try {
      // Use mobile-friendly endpoint that returns refresh token in body
      const response = await this.client.post<{
        access_token: string;
        refresh_token: string;
        token_type: string;
        expires_in: number;
      }>(
        '/api/auth/mobile/login',
        formData.toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      console.log('Login SUCCESS:', response.status);
      // Store both access and refresh tokens for session persistence
      await this.setTokens(response.data.access_token, response.data.refresh_token);
      console.log('Tokens stored successfully (access + refresh)');

      return {
        access_token: response.data.access_token,
        token_type: response.data.token_type,
        expires_in: response.data.expires_in,
      };
    } catch (error: any) {
      console.log('Login FAILED:', error.response?.status);
      console.log('Error detail:', error.response?.data);
      console.log('Full error:', error.message);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      await this.client.post('/api/auth/logout');
    } catch {
      // Ignore logout errors
    } finally {
      await this.clearTokens();
    }
  }

  async getCurrentUser(): Promise<User> {
    const response = await this.client.get<User>('/api/auth/me');
    return response.data;
  }

  // Dashboard endpoints
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await this.client.get<DashboardStats>('/stats');
    return response.data;
  }

  async getRecentDefects(limit: number = 10): Promise<DefectReport[]> {
    const response = await this.client.get<{ results: DefectReport[] }>(
      `/api/defect-reports?limit=${limit}&sort=-created_at`
    );
    return response.data.results || [];
  }

  // Chat endpoints
  async sendChatMessage(message: string, conversationHistory: ChatMessage[] = []): Promise<{
    response: string;
    sources: string[];
  }> {
    const response = await this.client.post('/query', {
      question: message,
      conversation_history: conversationHistory.map(msg => ({
        role: msg.role,
        content: msg.content,
      })),
    });
    return {
      response: response.data.response || response.data.answer || '',
      sources: response.data.sources || [],
    };
  }

  // Defect report endpoints
  async createDefectReport(data: DefectInputData): Promise<DefectReport> {
    const response = await this.client.post<DefectReport>('/api/defect-reports', data);
    return response.data;
  }

  async getMachines(): Promise<Array<{ id: string; name: string }>> {
    try {
      const response = await this.client.get('/api/machines');
      return response.data || [];
    } catch {
      // Return mock data if endpoint doesn't exist
      return [
        { id: 'CMX800', name: 'CMX800' },
        { id: 'DMG-1', name: 'DMG MORI NLX 2500' },
        { id: 'MAZ-001', name: 'Mazak Quick Turn 250' },
      ];
    }
  }

  // Set base URL (for development)
  setBaseUrl(url: string): void {
    this.client.defaults.baseURL = url;
  }

  // Manufacturing data endpoints (matching Web dashboard)
  async getManufacturingKPIs(): Promise<KPIData> {
    try {
      const response = await this.client.get<KPIData>('/api/manufacturing/kpis');
      return response.data;
    } catch {
      // Return mock data if endpoint doesn't exist
      return {
        totalDefects: 156,
        totalMachines: 12,
        totalOperators: 8,
        totalCustomers: 5,
        avgDefectRate: 0.023,
        criticalMachines: 3,
        criticalDefects: 12,
      };
    }
  }

  async getExecutiveSummary(): Promise<ExecutiveSummary> {
    try {
      const response = await this.client.get<ExecutiveSummary>('/api/manufacturing/executive-summary');
      return response.data;
    } catch {
      // Return mock data
      return {
        topRootCauses: [
          { cause: '工具摩耗', count: 45 },
          { cause: '材料不良', count: 32 },
          { cause: '設定ミス', count: 28 },
          { cause: '機械故障', count: 21 },
          { cause: 'オペレーターミス', count: 18 },
        ],
        defectTypes: [
          { type: '寸法不良', count: 52 },
          { type: '表面傷', count: 38 },
          { type: '形状不良', count: 29 },
          { type: 'バリ', count: 25 },
          { type: '変色', count: 12 },
        ],
        severityDistribution: [
          { severity: 'High', count: 24 },
          { severity: 'Medium', count: 67 },
          { severity: 'Low', count: 65 },
        ],
        lastUpdated: new Date().toISOString(),
      };
    }
  }

  async getDefectTrends(days: number = 7): Promise<DefectTrend[]> {
    try {
      const response = await this.client.get<DefectTrend[]>('/api/manufacturing/defects/trends', {
        params: { days },
      });
      return response.data;
    } catch {
      // Return mock data
      const trends: DefectTrend[] = [];
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = `${date.getMonth() + 1}/${date.getDate()}`;
        trends.push({
          date: dateStr,
          defects: Math.floor(Math.random() * 15) + 5,
          target: 10,
        });
      }
      return trends;
    }
  }

  async getMachineStatus(): Promise<MachineStatus[]> {
    try {
      const response = await this.client.get<MachineStatus[]>('/api/manufacturing/machines');
      return response.data;
    } catch {
      // Return mock data
      return [
        { name: 'CMX800', defectRate: 1.2, incidents: 8, status: 'good' },
        { name: 'DMG NLX', defectRate: 3.5, incidents: 15, status: 'warning' },
        { name: 'Mazak QT', defectRate: 5.8, incidents: 22, status: 'critical' },
        { name: 'Okuma LB', defectRate: 2.1, incidents: 12, status: 'good' },
        { name: 'Haas VF2', defectRate: 4.2, incidents: 18, status: 'warning' },
      ];
    }
  }
}

export const api = new ApiService();
export default api;
