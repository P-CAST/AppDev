// =============================================================
// Passify API Client — configure BASE_URL to match your Flask server
// =============================================================

export const API_BASE = import.meta.env.WEB_API_BASE;

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

// POST /api/auth/login
export async function login(username, password, masterPassword) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password, master_password: masterPassword }),
  });
  return handleResponse(res);
}

// POST /api/auth/register
// Backend should: CREATE DATABASE IF NOT EXISTS db_password_{username}
//                 CREATE TABLE IF NOT EXISTS tb_{username} (...)
//                 then return { token, username }
export async function register(username, password, masterPassword) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password, master_password: masterPassword }),
  });
  return handleResponse(res);
}

// GET /api/passwords
export async function fetchPasswords(token) {
  const res = await fetch(`${API_BASE}/passwords`, { headers: authHeaders(token) });
  return handleResponse(res);
}

// GET /api/passwords/:id
export async function fetchPasswordById(id, token, masterPassword) {
  const res = await fetch(`${API_BASE}/passwords/${id}`, {
    headers: authHeaders(token, { 'X-Master-Password': masterPassword }),
  });
  return handleResponse(res);
}

// POST /api/passwords
export async function createPassword(payload, token) {
  const res = await fetch(`${API_BASE}/passwords`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

// DELETE /api/passwords/:id
export async function deletePassword(id, token) {
  const res = await fetch(`${API_BASE}/passwords/${id}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });
  return handleResponse(res);
}
