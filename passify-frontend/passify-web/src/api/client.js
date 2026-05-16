// client.js
export const API_BASE = 'http://localhost:8123/api'; // Port from your terminal output

const jsonHeader = { 'Content-Type': 'application/json' };

async function handleResponse(res) {
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
  return data;
}

// Helper to bundle credentials for every request
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

export async function fetchPasswords(creds) {
  const res = await fetch(`${API_BASE}/passwords/`, { // Backend uses @passwords_bp.route("/")
    method: 'POST', // Use POST because we are sending a body
    headers: jsonHeader,
    body: withAuth({}, creds)
  });
  return handleResponse(res);
}

export async function fetchPasswordById(id, creds) {
  const res = await fetch(`${API_BASE}/passwords/${id}`, {
    method: 'POST', // Changed from GET to POST to allow body
    headers: jsonHeader,
    body: withAuth({}, creds)
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