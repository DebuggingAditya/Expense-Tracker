// src/services/AuthService.js
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://localhost:7202';

async function handleResponse(response) {
  const text = await response.text().catch(() => null);
  let data = null;
  try { data = text ? JSON.parse(text) : null } catch (e) {}
  return { ok: response.ok, status: response.status, data };
}

export const AuthService = {
  login: async (credentials) => {
    const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    return handleResponse(res);
  },

  register: async (payload) => {
    const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return handleResponse(res);
  }
};
