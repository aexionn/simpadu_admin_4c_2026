/**
 * apiClient.ts
 * Wrapper fetch yang menangani:
 * - Penambahan Authorization header dari localStorage
 * - Auto-refresh token saat mendapat 401
 * - Redirect ke /login jika refresh gagal
 */

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'https://api-admin-4c.rifkiaja.my.id:9002/api';

// Kunci localStorage
const TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

// ─── Token helpers ────────────────────────────────────────────────────────────

export function getAccessToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setTokens(accessToken: string, refreshToken: string): void {
  localStorage.setItem(TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

export function clearTokens(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export async function readJson<T = unknown>(res: Response): Promise<T | null> {
  if (res.status === 204 || res.status === 205) {
    return null;
  }

  const text = await res.text();
  if (!text.trim()) {
    return null;
  }

  return JSON.parse(text) as T;
}

// ─── Refresh token ─────────────────────────────────────────────────────────

let isRefreshing = false;
let refreshQueue: Array<(token: string | null) => void> = [];

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  const res = await fetch(`${BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  if (!res.ok) {
    clearTokens();
    return null;
  }

  const data = await readJson<Record<string, any>>(res);
  const newAccess: string | undefined =
    data?.access_token ?? data?.token ?? data?.data?.access_token;
  const newRefresh: string = data?.refresh_token ?? data?.data?.refresh_token ?? refreshToken;

  if (!newAccess) {
    clearTokens();
    return null;
  }

  setTokens(newAccess, newRefresh);
  return newAccess;
}

// ─── Core fetch wrapper ──────────────────────────────────────────────────────

type FetchOptions = RequestInit & {
  _retry?: boolean;
  skipAuth?: boolean;
  skipRefresh?: boolean;
};

export async function apiFetch(
  path: string,
  options: FetchOptions = {}
): Promise<Response> {
  const token = getAccessToken();
  const headers = new Headers(options.headers ?? {});

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  if (token && !options.skipAuth) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  headers.set('Accept', 'application/json');

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  // Jika 401 dan belum pernah retry, coba refresh token
  if (res.status === 401 && !options._retry && !options.skipRefresh) {
    if (isRefreshing) {
      // Antri sampai refresh selesai
      const newToken = await new Promise<string | null>((resolve) => {
        refreshQueue.push(resolve);
      });
      if (!newToken) {
        redirectToLogin();
        return res;
      }
      headers.set('Authorization', `Bearer ${newToken}`);
      return fetch(`${BASE_URL}${path}`, { ...options, headers });
    }

    isRefreshing = true;
    const newToken = await refreshAccessToken();
    isRefreshing = false;

    // Selesaikan semua yang antri
    refreshQueue.forEach((cb) => cb(newToken));
    refreshQueue = [];

    if (!newToken) {
      redirectToLogin();
      return res;
    }

    headers.set('Authorization', `Bearer ${newToken}`);
    return fetch(`${BASE_URL}${path}`, { ...options, _retry: true, headers } as FetchOptions);
  }

  return res;
}

function redirectToLogin() {
  clearTokens();
  window.location.href = '/login';
}

// ─── Convenience methods ─────────────────────────────────────────────────────

export const api = {
  get: (path: string, options?: FetchOptions) =>
    apiFetch(path, { method: 'GET', ...options }),

  post: (path: string, body?: unknown, options?: FetchOptions) =>
    apiFetch(path, {
      method: 'POST',
      body: body !== undefined ? JSON.stringify(body) : undefined,
      ...options,
    }),

  put: (path: string, body?: unknown, options?: FetchOptions) =>
    apiFetch(path, {
      method: 'PUT',
      body: body !== undefined ? JSON.stringify(body) : undefined,
      ...options,
    }),

  patch: (path: string, body?: unknown, options?: FetchOptions) =>
    apiFetch(path, {
      method: 'PATCH',
      body: body !== undefined ? JSON.stringify(body) : undefined,
      ...options,
    }),

  delete: (path: string, options?: FetchOptions) =>
    apiFetch(path, { method: 'DELETE', ...options }),
};
