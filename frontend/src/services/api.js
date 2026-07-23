import axios from 'axios';

const API = axios.create({
  baseURL: '/api'
});

API.interceptors.request.use((config) => {
  const user = localStorage.getItem('user');
  if (user) {
    const parsed = JSON.parse(user);
    if (parsed.token) {
      config.headers.Authorization = `Bearer ${parsed.token}`;
    }
  }
  return config;
});

export const authAPI = {
  login: (data) => API.post('/auth/login', data),
  register: (data) => API.post('/auth/register', data),
  getProfile: () => API.get('/auth/profile'),
  addMedicalHistory: (data) => API.post('/auth/medical-history', data)
};

export const doctorAPI = {
  getDoctors: (params) => API.get('/doctors', { params }),
  getSpecializations: () => API.get('/doctors/specializations'),
  getDoctorById: (id) => API.get(`/doctors/${id}`)
};

export const hospitalAPI = {
  getHospitals: () => API.get('/hospitals'),
  getHospitalById: (id) => API.get(`/hospitals/${id}`)
};

export const appointmentAPI = {
  create: (data) => API.post('/appointments', data),
  getMyAppointments: () => API.get('/appointments/my-appointments'),
  getDoctorAppointments: (doctorId) => API.get(`/appointments/doctor/${doctorId}`),
  updateStatus: (id, status) => API.patch(`/appointments/${id}/status`, { status }),
  getById: (id) => API.get(`/appointments/${id}`)
};

export const triageAPI = {
  checkSymptoms: (message) => API.post('/triage/check', { message })
};

export const webhookAPI = {
  triggerPaymentWebhook: (appointmentId, transactionId, amountPaid) =>
    API.post('/webhooks/payments', {
      event: 'payment_intent.succeeded',
      data: {
        appointmentId,
        transactionId: transactionId || `TXN_SIMULATED_${Date.now()}`,
        amountPaid
      }
    })
};

export default API;
