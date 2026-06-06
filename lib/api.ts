import axios from 'axios';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: false,
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
  if (typeof window !== 'undefined' && token && token !== 'undefined' && token !== 'null') {
    localStorage.setItem(TOKEN_KEY, token);
  }
}

export function clearStoredToken(): void {
  if (typeof window !== 'undefined') localStorage.removeItem(TOKEN_KEY);
}


// ── Request interceptor: attach token on every request ────────────────
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token && token !== 'undefined' && token !== 'null') {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
  }
  return config;
});

// ── Response interceptor: pass errors through ────────────────────────
// Do NOT auto-redirect on 401 here — getUser() already handles that.
// A global redirect would break demo mode and cause redirect loops.
api.interceptors.response.use(
  (res) => res,
  (err) => Promise.reject(err)
);

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

// ── Service Types ──────────────────────────────────────────────────────
export const serviceTypeApi = {
  list:  () => api.get('/api/v1/service-types'),
  rules: (keys: string[]) => api.get('/api/v1/service-types/rules', { params: { types: keys } }),
};

// ── Certifications ─────────────────────────────────────────────────────
export const certificationApi = {
  list: () => api.get('/api/v1/certifications'),
  sync: (keys: string[]) => api.put('/api/v1/carrier/certifications', { certification_keys: keys }),
};

// ── Org / Team ──────────────────────────────────────────────────────────
export const orgApi = {
  get:              ()                                          => api.get('/api/v1/org'),
  update:           (data: Record<string, unknown>)            => api.put('/api/v1/org', data),
  members:          ()                                         => api.get('/api/v1/org/members'),
  updateMember:     (id: number, role: string)                 => api.put(`/api/v1/org/members/${id}`, { role }),
  removeMember:     (id: number)                               => api.delete(`/api/v1/org/members/${id}`),
  invitations:      ()                                         => api.get('/api/v1/org/invitations'),
  invite:           (email: string, role: string)              => api.post('/api/v1/org/invitations', { email, role }),
  cancelInvitation: (id: number)                               => api.delete(`/api/v1/org/invitations/${id}`),
};

// ── Profile (shipper + carrier) ────────────────────────────────────────
export const profileApi = {
  getShipper:    () => api.get('/api/v1/shipper/profile'),
  updateShipper: (data: Record<string, unknown>) => api.put('/api/v1/shipper/profile', data),
  getCarrier:    () => api.get('/api/v1/carrier/profile'),
  updateCarrier: (data: Record<string, unknown>) => api.put('/api/v1/carrier/profile', data),
};
