const BASE = import.meta.env.VITE_API_BASE_URL || '/api';
let csrfToken = '';
export function setCsrfToken(value) {
  csrfToken = value || '';
}
export async function api(path, { method = 'GET', body, signal } = {}) {
  let response;
  try {
    response = await fetch(`${BASE}${path}`, {
      method,
      credentials: 'include',
      signal,
      headers: {
        ...(body !== undefined
          ? { 'Content-Type': 'application/json', 'X-ClubPulse-Request': '1' }
          : {}),
        ...(csrfToken ? { 'X-CSRF-Token': csrfToken } : {}),
      },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    throw new Error('Unable to reach ClubPulse. Check your connection and try again.');
  }
  const data = response.status === 204 ? null : await response.json().catch(() => null);
  if (!response.ok) {
    const error = new Error(data?.error?.message || 'The request failed. Please try again.');
    error.status = response.status;
    if (response.status === 401 && !path.startsWith('/auth/'))
      window.dispatchEvent(new Event('clubpulse:unauthorized'));
    throw error;
  }
  if (response.status !== 204 && !data) throw new Error('The API returned an unexpected response.');
  return data;
}
