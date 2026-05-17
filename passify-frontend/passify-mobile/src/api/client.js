// =============================================================
// Passify API Client — React Native (Stateless Body-Passing)
// Android emulator → host: http://10.0.2.2:8123/api
// Physical device / iOS on same WiFi: http://192.168.x.x:8123/api
// =============================================================

export const API_BASE = 'http://10.0.2.2:8123/api';

const jsonHeader = { 'Content-Type': 'application/json' };

async function handleResponse(res) {
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
  return data;
}

// Utility mapper to inject state-free tracking info into request payloads
const withAuth = (payload, creds) => ({
  ...payload,
  mysql_user: creds.username,
  mysql_password: creds.password,
  master_password: creds.masterPassword,
});

export async function login(username, password, masterPassword) {
  const res = await fetch(`${API_BASE}/auth/connect`, {
    method: 'POST',
    headers: jsonHeader,
    body: JSON.stringify({
      mysql_user: username,
      mysql_password: password,
      master_password: masterPassword,
    }),
  });
  return handleResponse(res);
}

export async function register(username, password, masterPassword) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: jsonHeader,
    body: JSON.stringify({
      mysql_user: username,
      mysql_password: password,
      master_password: masterPassword,
    }),
  });
  return handleResponse(res);
}

export async function fetchPasswords(creds) {
  const res = await fetch(`${API_BASE}/passwords/`, {
    method: 'POST', // Switched to POST to enable passing credentials in body
    headers: jsonHeader,
    body: JSON.stringify(withAuth({}, creds)),
  });
  return handleResponse(res);
}

export async function fetchPasswordById(id, creds) {
  const res = await fetch(`${API_BASE}/passwords/${id}`, {
    method: 'POST', // Switched to POST to safely supply credentials
    headers: jsonHeader,
    body: JSON.stringify(withAuth({}, creds)),
  });
  return handleResponse(res);
}

export async function createPassword(payload, creds) {
  const res = await fetch(`${API_BASE}/passwords/`, {
    method: 'POST',
    headers: jsonHeader,
    body: JSON.stringify(withAuth(payload, creds)),
  });
  return handleResponse(res);
}

export async function deletePassword(id, creds) {
  const res = await fetch(`${API_BASE}/passwords/${id}`, {
    method: 'DELETE',
    headers: jsonHeader,
    body: JSON.stringify(withAuth({}, creds)),
  });
  return handleResponse(res);
}