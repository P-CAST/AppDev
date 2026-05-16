// client.js
export const API_BASE = 'http://localhost:8123/api'; // Port from your terminal output

const jsonHeader = { 'Content-Type': 'application/json' };

async function handleResponse(res) {
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
  return data;
}

// Helper to bundle credentials for write requests (POST/DELETE)
const withAuth = (payload, creds) => JSON.stringify({
  ...payload,
  mysql_user: creds.username,
  mysql_password: creds.password,
  master_password: creds.masterPassword
});

export async function login(username, password, masterPassword) {
  const res = await fetch(`${API_BASE}/auth/connect`, {
    method: 'POST',
    headers: jsonHeader,
    body: JSON.stringify({ mysql_user: username, mysql_password: password, master_password: masterPassword }),
  });
  return handleResponse(res);
}

export async function register(username, password, masterPassword) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: jsonHeader,
    body: JSON.stringify({ mysql_user: username, mysql_password: password, master_password: masterPassword }),
  });
  return handleResponse(res);
}

// FIX: Restored to GET. Credentials are sent via HTTP headers because GET requests cannot have a body.
export async function fetchPasswords(creds) {
  const res = await fetch(`${API_BASE}/passwords/`, { 
    method: 'GET', 
    headers: {
      ...jsonHeader,
      // Match the exact header names your Flask backend reads via request.headers.get()
      'mysql-user': creds.username,
      'mysql-password': creds.password || '',
      'master-password': creds.masterPassword
    }
  });
  return handleResponse(res);
}

// FIX: Restored to GET. Credentials sent via HTTP headers.
export async function fetchPasswordById(id, creds) {
  const res = await fetch(`${API_BASE}/passwords/${id}`, {
    method: 'GET', 
    headers: {
      ...jsonHeader,
      'mysql-user': creds.username,
      'mysql-password': creds.password || '',
      'master-password': creds.masterPassword
    }
  });
  return handleResponse(res);
}

export async function createPassword(payload, creds) {
  const res = await fetch(`${API_BASE}/passwords/`, {
    method: 'POST',
    headers: jsonHeader,
    body: withAuth(payload, creds),
  });
  return handleResponse(res);
}

export async function deletePassword(id, creds) {
  const res = await fetch(`${API_BASE}/passwords/${id}`, {
    method: 'DELETE',
    headers: jsonHeader,
    body: withAuth({}, creds),
  });
  return handleResponse(res);
}