export class HttpError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
    this.name = 'HttpError';
  }
}

async function request<TResponse>(url: string, init?: RequestInit): Promise<TResponse> {
  const response = await fetch(url, init);
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new HttpError(body?.error || `Request failed: ${url}`, response.status);
  }
  return response.json() as Promise<TResponse>;
}

export const httpClient = {
  get: <TResponse>(url: string) => request<TResponse>(url),
  post: <TResponse, TBody>(url: string, body: TBody) => request<TResponse>(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }),
};
