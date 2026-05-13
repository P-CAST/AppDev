// =============================================================
// Passify API Client — React Native
// Android emulator → host: http://10.0.2.2:5000/api
// Physical device / iOS on same WiFi: http://192.168.x.x:5000/api
// =============================================================

export const API_BASE = 'http://10.0.2.2:5000/api';

const authHeaders = (token, extra = {}) => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`,
  ...extra,
});

async function handleResponse(res) {
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
  return data;
}

export async function login(username, password, masterPassword) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password, master_password: masterPassword }),
  });
  return handleResponse(res);
}

// POST /api/auth/register
// Backend: CREATE DATABASE IF NOT EXISTS db_password_{username}
//          CREATE TABLE IF NOT EXISTS tb_{username} (...)
//          return { token, username }
export async function register(username, password, masterPassword) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password, master_password: masterPassword }),
  });
  return handleResponse(res);
}

export async function fetchPasswords(token) {
  const res = await fetch(`${API_BASE}/passwords`, { headers: authHeaders(token) });
  return handleResponse(res);
}

export async function fetchPasswordById(id, token, masterPassword) {
  const res = await fetch(`${API_BASE}/passwords/${id}`, {
    headers: authHeaders(token, { 'X-Master-Password': masterPassword }),
  });
  return handleResponse(res);
}

export async function createPassword(payload, token) {
  const res = await fetch(`${API_BASE}/passwords`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function deletePassword(id, token) {
  const res = await fetch(`${API_BASE}/passwords/${id}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });
  return handleResponse(res);
}
