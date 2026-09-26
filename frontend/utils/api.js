// utils/api.js

const API_URL = typeof window !== 'undefined'
  ? (process.env.NEXT_PUBLIC_API_URL || '')
  : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000');

function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('deao_token');
}

async function request(method, path, body, opts = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (opts.headers) Object.assign(headers, opts.headers);

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  // Only redirect on 401 if not logging in or registering
  if (res.status === 401 && path !== '/api/auth/login' && path !== '/api/auth/register') {
    if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
      localStorage.removeItem('deao_token');
      localStorage.removeItem('deao_user');
      window.location.href = '/login';
    }
  }

  let data;
  const contentType = res.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    data = await res.json();
  } else {
    const text = await res.text();
    console.error('Server returned non-JSON response:', text);
    throw new Error(`Server returned HTTP ${res.status}`);
  }

  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}


const api = {
  // Auth
  login: (email, password) => request('POST', '/api/auth/login', { email, password }),
  register: (name, email, password) => request('POST', '/api/auth/register', { name, email, password }),
  me: () => request('GET', '/api/auth/me'),

  updatePassword: (currentPassword, newPassword) => request('POST', '/api/auth/password', { currentPassword, newPassword }),
  createUser: (data) => request('POST', '/api/auth/users', data),
  listUsers: () => request('GET', '/api/auth/users'),

  // Decks
  createDeck: (data) => request('POST', '/api/decks', data),
  listDecks: () => request('GET', '/api/decks'),
  getDeck: (id) => request('GET', `/api/decks/${id}`),
  retryDeck: (id) => request('POST', `/api/decks/${id}/retry`),
  deleteDeck: (id) => request('DELETE', `/api/decks/${id}`),

  // Ready-Made Templates
  listTemplates: () => request('GET', '/api/templates'),
  getTemplate: (id) => request('GET', `/api/templates/${id}`),
  useTemplate: (id, data = {}) => request('POST', `/api/templates/${id}/use`, data),

  // Slides & Theme
  addSlide: (deckId, data = {}) => request('POST', `/api/decks/${deckId}/slides`, data),
  duplicateSlide: (deckId, slideId) => request('POST', `/api/decks/${deckId}/slides/${slideId}/duplicate`),
  reorderSlides: (deckId, orderedSlideIds) => request('PUT', `/api/decks/${deckId}/slides/reorder`, { orderedSlideIds }),
  updateSlide: (deckId, slideId, data) => request('PUT', `/api/decks/${deckId}/slides/${slideId}`, data),
  deleteSlide: (deckId, slideId) => request('DELETE', `/api/decks/${deckId}/slides/${slideId}`),
  updateDeckTheme: (deckId, globalTheme) => request('PUT', `/api/decks/${deckId}/theme`, globalTheme),

  // Versions
  getVersions: (deckId) => request('GET', `/api/decks/${deckId}/versions`),
  restoreVersion: (deckId, versionId) => request('POST', `/api/decks/${deckId}/versions/${versionId}/restore`),

  // Export — downloads export file securely via Bearer token
  exportDeck: async (deckId, format, name) => {
    const token = getToken();
    if (!token) throw new Error('Not authenticated');
    const params = new URLSearchParams({ format });
    if (name) params.set('name', name);
    const res = await fetch(`${API_URL}/api/decks/${deckId}/export?${params}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      let errMessage = 'Export failed';
      try {
        const errJson = await res.json();
        errMessage = errJson.error || errMessage;
      } catch {}
      throw new Error(errMessage);
    }
    return await res.blob();
  },

  // AI
  aiStatus: () => request('GET', '/api/ai/status'),
  updateKeys: (data) => request('POST', '/api/ai/keys', data),
  testAI: () => request('GET', '/api/ai/test'),

  // Logs
  getLogs: (deckId) => request('GET', `/api/decks/${deckId}/logs`),
  getMetrics: (deckId) => request('GET', `/api/decks/${deckId}/metrics`),

  // Queue
  queueStatus: () => request('GET', '/api/queue'),

  // Upload
  uploadFile: async (file) => {
    const token = getToken();
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_URL}/api/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    return data;
  },
};

export default api;
export { API_URL };
