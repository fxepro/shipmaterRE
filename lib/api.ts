import axios from 'axios';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(async (config) => {
  // Fetch CSRF cookie before mutating requests (Sanctum requirement)
  if (['post', 'put', 'patch', 'delete'].includes(config.method ?? '')) {
    await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/sanctum/csrf-cookie`, {
      withCredentials: true,
    });
  }
  return config;
});

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
