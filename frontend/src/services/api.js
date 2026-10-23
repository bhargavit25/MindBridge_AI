const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('mindbridge_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    // Handle 204 No Content
    if (response.status === 204) {
      return null;
    }

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMsg = data?.detail || response.statusText || 'Request failed';
      throw new Error(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
    }

    return data;
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error.message);
    throw error;
  }
}

export const api = {
  // Auth
  register: (body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  getMe: () => request('/auth/me'),
  updateProfile: (body) => request('/auth/profile', { method: 'PUT', body: JSON.stringify(body) }),

  // Dashboard
  getDashboardSummary: () => request('/dashboard/summary'),

  // Assessments
  getQuestions: () => request('/assessments/questions'),
  submitPHQ9: (answers) => request('/assessments/phq9', { method: 'POST', body: JSON.stringify({ answers }) }),
  submitGAD7: (answers) => request('/assessments/gad7', { method: 'POST', body: JSON.stringify({ answers }) }),
  getAssessmentHistory: () => request('/assessments/history'),
  getLatestAssessments: () => request('/assessments/latest'),

  // Mood
  recordMood: (mood, note) => request('/moods', { method: 'POST', body: JSON.stringify({ mood, note }) }),
  getMoodHistory: () => request('/moods'),
  getTodayMood: () => request('/moods/today'),
  updateMood: (id, body) => request(`/moods/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteMood: (id) => request(`/moods/${id}`, { method: 'DELETE' }),

  // Journal
  getJournals: () => request('/journal'),
  getJournal: (id) => request(`/journal/${id}`),
  createJournal: (body) => request('/journal', { method: 'POST', body: JSON.stringify(body) }),
  updateJournal: (id, body) => request(`/journal/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteJournal: (id) => request(`/journal/${id}`, { method: 'DELETE' }),

  // Chat
  getStarters: () => request('/chat/starters'),
  sendMessage: (message, sessionId) => request('/chat', {
    method: 'POST',
    body: JSON.stringify({ message, session_id: sessionId })
  }),
  getChatSessions: () => request('/chat/sessions'),
  getChatSession: (id) => request(`/chat/sessions/${id}`),
  deleteChatSession: (id) => request(`/chat/sessions/${id}`, { method: 'DELETE' }),

  // Counsellors
  getCounsellors: () => request('/counsellors'),
  getCounsellor: (id) => request(`/counsellors/${id}`),
  createSlot: (body) => request('/counsellors/slots', { method: 'POST', body: JSON.stringify(body) }),
  deleteSlot: (id) => request(`/counsellors/slots/${id}`, { method: 'DELETE' }),

  // Appointments
  bookAppointment: (counsellorId, slotId, notes) => request('/appointments', {
    method: 'POST',
    body: JSON.stringify({
      counsellor_id: counsellorId,
      availability_slot_id: slotId,
      notes
    })
  }),
  getAppointments: () => request('/appointments'),
  cancelAppointment: (id) => request(`/appointments/${id}/cancel`, { method: 'PATCH' }),
  updateAppointmentStatus: (id, status, notes) => request(`/appointments/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status, counsellor_notes: notes })
  }),

  // Resources
  getResources: (category, search) => {
    const params = new URLSearchParams();
    if (category && category !== 'All') params.append('category', category);
    if (search) params.append('search', search);
    const qs = params.toString() ? `?${params.toString()}` : '';
    return request(`/resources${qs}`);
  },
  getResource: (id) => request(`/resources/${id}`),
  getCategories: () => request('/resources/categories'),

  // Admin
  getAdminAnalytics: () => request('/admin/analytics'),
};
