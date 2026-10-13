const BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

export class ApiError extends Error {
  constructor(message, code, status) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

// Every request to the server goes through one "command" endpoint.
export async function command(name, payload) {
  let res;
  try {
    res = await fetch(`${BASE}/api/command`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command: name, payload }),
    });
  } catch {
    throw new ApiError('Could not reach the server. Check your connection and try again.', 'network', 0);
  }
  let data = null;
  try { data = await res.json(); } catch { /* non-JSON response */ }
  if (!res.ok) {
    throw new ApiError(
      (data && data.error && data.error.message) || 'Something went wrong. Please try again.',
      (data && data.error && data.error.code) || 'error',
      res.status,
    );
  }
  return data;
}

export const createWebsite = (brief, images = []) =>
  command('create_website', { brief, images: images.map(({ src, name }) => ({ src, name })) });
export const renderWebsite = (content, theme) => command('render_website', { content, theme });
export const askAssistant = (messages) => command('ask_assistant', { messages });
export const submitEnquiry = (enquiry) => command('submit_enquiry', { enquiry });
