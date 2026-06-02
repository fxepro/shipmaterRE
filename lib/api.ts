import axios from 'axios';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: false,          // Bearer token auth — no cookies needed
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

// ── Bearer-token helpers ──────────────────────────────────────────────
const TOKEN_KEY = 'sm_token';

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

export function clearStoredToken(): void {
  if (typeof window !== 'undefined') localStorage.removeItem(TOKEN_KEY);
  delete api.defaults.headers.common['Authorization'];
}

// Restore token on module init (handles page refresh in the browser)
if (typeof window !== 'undefined') {
  const t = localStorage.getItem(TOKEN_KEY);
  if (t) api.defaults.headers.common['Authorization'] = `Bearer ${t}`;
}

// ── Auth ──────────────────────────────────────────────────────────────
export const authApi = {
  login:    (data: { email: string; password: string }) => api.post('/api/v1/auth/login', data),
  logout:   () => api.post('/api/v1/auth/logout'),
  register: (data: Record<string, unknown>) => api.post('/api/v1/auth/register', data),
  me:       () => api.get('/api/v1/user'),
};

// ── Shipments ─────────────────────────────────────────────────────────
export const shipmentApi = {
  list:          (params?: Record<string, unknown>) => api.get('/api/v1/shipments', { params }),
  get:           (id: number) => api.get(`/api/v1/shipments/${id}`),
  create:        (data: Record<string, unknown>) => api.post('/api/v1/shipments', data),
  getBids:       (id: number) => api.get(`/api/v1/shipments/${id}/bids`),
  ping:          (id: number, data: { lat: number; lng: number }) => api.post(`/api/v1/shipments/${id}/ping`, data),
  acceptOffer:   (id: number) => api.put(`/api/v1/shipments/${id}/accept-offer`),
  declineOffer:  (id: number) => api.put(`/api/v1/shipments/${id}/decline-offer`),
  start:         (id: number) => api.put(`/api/v1/shipments/${id}/start`),
};

// ── Bids ──────────────────────────────────────────────────────────────
export const bidApi = {
  place:         (shipmentId: number, data: Record<string, unknown>) => api.post(`/api/v1/shipments/${shipmentId}/bids`, data),
  accept:        (bidId: number) => api.put(`/api/v1/bids/${bidId}/accept`),
  withdraw:      (bidId: number) => api.put(`/api/v1/bids/${bidId}/withdraw`),
  carrierOffers: (params?: Record<string, unknown>) => api.get('/api/v1/carrier/offers', { params }),
};

// ── Jobs (carrier) ────────────────────────────────────────────────────
export const jobApi = {
  list:      (params?: Record<string, unknown>) => api.get('/api/v1/jobs', { params }),
  available: (type: 'open' | 'contracted' = 'open') => api.get('/api/v1/jobs', { params: { type } }),
};

// ── Carrier ───────────────────────────────────────────────────────────
export const carrierApi = {
  earnings: () => api.get('/api/v1/carrier/earnings'),
  list:     (params?: Record<string, unknown>) => api.get('/api/v1/carriers', { params }),
  lookup:   (dot: string) => api.get('/api/v1/carriers', { params: { dot } }),
};

// ── Tracking (public) ─────────────────────────────────────────────────
export const trackApi = {
  get:     (token: string) => api.get(`/api/v1/track/${token}`),
  confirm: (token: string) => api.post(`/api/v1/track/${token}`),
};

// ── Payment methods ───────────────────────────────────────────────────
export const paymentApi = {
  list:       () => api.get('/api/v1/payment-methods'),
  create:     (data: Record<string, unknown>) => api.post('/api/v1/payment-methods', data),
  destroy:    (id: number) => api.delete(`/api/v1/payment-methods/${id}`),
  setDefault: (id: number) => api.post(`/api/v1/payment-methods/${id}/default`),
};

// ── Transactions (shipper payment history) ────────────────────────────
export const transactionApi = {
  list: (params?: Record<string, unknown>) => api.get('/api/v1/transactions', { params }),
};

// ── Preferred carriers ────────────────────────────────────────────────
export const preferredCarrierApi = {
  list:   () => api.get('/api/v1/preferred-carriers'),
  add:    (data: Record<string, unknown>) => api.post('/api/v1/preferred-carriers', data),
  remove: (id: number) => api.delete(`/api/v1/preferred-carriers/${id}`),
};

// ── Contracts ─────────────────────────────────────────────────────────
export const contractApi = {
  list:    (params?: Record<string, unknown>) => api.get('/api/v1/contracts', { params }),
  create:  (data: Record<string, unknown>) => api.post('/api/v1/contracts', data),
  update:  (id: number, data: Record<string, unknown>) => api.put(`/api/v1/contracts/${id}`, data),
  destroy: (id: number) => api.delete(`/api/v1/contracts/${id}`),
};

// ── Profile (shipper + carrier) ────────────────────────────────────────
export const profileApi = {
  getShipper:    () => api.get('/api/v1/shipper/profile'),
  updateShipper: (data: Record<string, unknown>) => api.put('/api/v1/shipper/profile', data),
  getCarrier:    () => api.get('/api/v1/carrier/profile'),
  updateCarrier: (data: Record<string, unknown>) => api.put('/api/v1/carrier/profile', data),
};
