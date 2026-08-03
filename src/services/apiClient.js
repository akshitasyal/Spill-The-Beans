export function getAuthHeaders(customHeaders = {}) {
  const token = localStorage.getItem('stb_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...customHeaders,
  };
}

export async function fetchWithAuth(url, options = {}) {
  const headers = getAuthHeaders(options.headers || {});
  return fetch(url, {
    ...options,
    headers,
  });
}
