import axios, { AxiosInstance, AxiosError } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

class APIClient {
  private client: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Load token from localStorage on initialization
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('accessToken');
    }

    // Add token to requests
    this.client.interceptors.request.use((config) => {
      if (this.token) {
        config.params = {
          ...config.params,
          token: this.token,
        };
      }
      return config;
    });

    // Handle responses
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Token expired, try to refresh
          const refreshToken = localStorage.getItem('refreshToken');
          if (refreshToken) {
            try {
              const response = await this.refreshToken(refreshToken);
              this.setToken(response.data.access_token);
              return this.client.request(error.config!);
            } catch (refreshError) {
              this.clearToken();
              if (typeof window !== 'undefined') {
                window.location.href = '/login';
              }
            }
          }
        }
        return Promise.reject(error);
      }
    );
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', token);
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  }

  async login(email: string, password: string) {
    const response = await this.client.post('/auth/login', {
      email,
      password,
    });
    this.setToken(response.data.access_token);
    if (typeof window !== 'undefined') {
      localStorage.setItem('refreshToken', response.data.refresh_token);
    }
    return response.data;
  }

  async register(data: any) {
    return this.client.post('/auth/register', data);
  }

  async getCurrentUser() {
    return this.client.get('/auth/me');
  }

  async refreshToken(refreshToken: string) {
    return this.client.post('/auth/refresh', {
      refresh_token: refreshToken,
    });
  }

  // Customers
  async getCustomers(skip = 0, limit = 50, status?: string) {
    return this.client.get('/customers', {
      params: { skip, limit, status },
    });
  }

  async getCustomer(customerId: string) {
    return this.client.get(`/customers/${customerId}`);
  }

  async createCustomer(data: any) {
    return this.client.post('/customers', data);
  }

  async updateCustomer(customerId: string, data: any) {
    return this.client.put(`/customers/${customerId}`, data);
  }

  async searchCustomers(query: string, skip = 0, limit = 50) {
    return this.client.get('/customers/search', {
      params: { q: query, skip, limit },
    });
  }

  async getLeadScore(customerId: string) {
    return this.client.get(`/customers/${customerId}/lead-score`);
  }

  // Appointments
  async getAppointments(skip = 0, limit = 50, status?: string, customerId?: string) {
    return this.client.get('/appointments', {
      params: { skip, limit, status, customer_id: customerId },
    });
  }

  async getAppointment(appointmentId: string) {
    return this.client.get(`/appointments/${appointmentId}`);
  }

  async createAppointment(data: any) {
    return this.client.post('/appointments', data);
  }

  async updateAppointment(appointmentId: string, data: any) {
    return this.client.put(`/appointments/${appointmentId}`, data);
  }

  async cancelAppointment(appointmentId: string, reason: string) {
    return this.client.post(`/appointments/${appointmentId}/cancel`, null, {
      params: { cancellation_reason: reason },
    });
  }

  async confirmAppointment(appointmentId: string) {
    return this.client.post(`/appointments/${appointmentId}/confirm`);
  }

  async getAvailableSlots(staffId: string, date: string, durationMinutes = 60) {
    return this.client.get(`/appointments/availability/${staffId}`, {
      params: { date, duration_minutes: durationMinutes },
    });
  }

  // Payments
  async createPayment(data: any) {
    return this.client.post('/payments', data);
  }

  async getPayments(skip = 0, limit = 50, status?: string) {
    return this.client.get('/payments', {
      params: { skip, limit, status },
    });
  }

  async getPayment(paymentId: string) {
    return this.client.get(`/payments/${paymentId}`);
  }

  async refundPayment(paymentId: string, reason: string, amount?: number) {
    return this.client.post(`/payments/${paymentId}/refund`, {
      reason,
      amount_cents: amount,
    });
  }

  // Analytics
  async getDashboardSummary() {
    return this.client.get('/analytics/dashboard/summary');
  }

  async getAppointmentsByStatus() {
    return this.client.get('/analytics/appointments/by-status');
  }

  async getRevenueDaily(days = 30) {
    return this.client.get('/analytics/revenue/daily', {
      params: { days },
    });
  }

  async getTopCustomers(limit = 10) {
    return this.client.get('/analytics/top-customers', {
      params: { limit },
    });
  }

  // AI
  async processMessage(customerId: string, message: string, history: any[] = []) {
    return this.client.post('/ai/message', null, {
      params: {
        customer_id: customerId,
        message,
      },
    });
  }

  async getAIAvailability(customerId: string) {
    return this.client.get('/ai/availability', {
      params: { customer_id: customerId },
    });
  }

  async getAIHealth() {
    return this.client.get('/ai/health');
  }

  // Automations
  async getAutomations(skip = 0, limit = 50) {
    return this.client.get('/automations', {
      params: { skip, limit },
    });
  }

  async createAutomation(data: any) {
    return this.client.post('/automations', data);
  }

  async updateAutomation(automationId: string, data: any) {
    return this.client.put(`/automations/${automationId}`, data);
  }

  async toggleAutomation(automationId: string) {
    return this.client.post(`/automations/${automationId}/toggle`);
  }

  async deleteAutomation(automationId: string) {
    return this.client.delete(`/automations/${automationId}`);
  }
}

export const apiClient = new APIClient();
