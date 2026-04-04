const API_BASE_URL = import.meta.env.VITE_API_URL;

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    ...options
  });

  const isJson = response.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await response.json() : null;

  if (!response.ok) {
    const error = new Error(data?.error || 'request_failed');
    error.status = response.status;
    throw error;
  }

  return data;
}

export function fetchCells() {
  return request('/api/cells');
}

export function createCell({ nullifierHash, imageData }) {
  return request('/api/cells', {
    method: 'POST',
    body: JSON.stringify({ nullifierHash, imageData })
  });
}

