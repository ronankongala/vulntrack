export const API_BASE = 'http://localhost:8081/api';

export const SEVERITIES = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const;
export const STATUSES = ['OPEN', 'IN_PROGRESS', 'REMEDIATED', 'ACCEPTED_RISK'] as const;

export type Severity = (typeof SEVERITIES)[number];
export type Status = (typeof STATUSES)[number];

export const SEVERITY_LABELS: Record<Severity, string> = {
  CRITICAL: 'Critical',
  HIGH: 'High',
  MEDIUM: 'Medium',
  LOW: 'Low',
};

export const STATUS_LABELS: Record<Status, string> = {
  OPEN: 'Open',
  IN_PROGRESS: 'In Progress',
  REMEDIATED: 'Remediated',
  ACCEPTED_RISK: 'Accepted Risk',
};

export interface AssetSummary {
  id: number;
  hostname: string;
  owner: string | null;
  environment: string | null;
}

export interface Vulnerability {
  id: number;
  title: string;
  description: string | null;
  severity: Severity;
  cvssScore: number | null;
  status: Status;
  discoveredDate: string;
  remediationNotes: string | null;
  createdAt: string;
  updatedAt: string;
  assets: AssetSummary[];
}

export interface UpdateVulnerabilityRequest {
  status: Status;
  remediationNotes: string | null;
}

export interface LoginResponse {
  token: string;
  tokenType: string;
  expiresIn: number;
}

// Held in memory only (set by AuthProvider); a page reload requires logging in again
let authToken: string | null = null;
let onUnauthorized: (() => void) | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
}

export function setUnauthorizedHandler(handler: (() => void) | null) {
  onUnauthorized = handler;
}

async function request<T>(path: string, init?: RequestInit, { authenticated = true } = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(authenticated && authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...init?.headers,
    },
  });
  if (res.status === 401 && authenticated) {
    // Missing, invalid or expired token: send the user back to the login view
    onUnauthorized?.();
  }
  if (!res.ok) {
    // Backend returns ErrorResponse { message, fieldErrors } on failures
    let message = `${res.status} ${res.statusText}`;
    try {
      const body = await res.json();
      if (body?.message) message = body.message;
      if (body?.fieldErrors) {
        message += ': ' + Object.entries(body.fieldErrors).map(([f, m]) => `${f} ${m}`).join(', ');
      }
    } catch {
      // non-JSON error body; keep status text
    }
    throw new Error(message);
  }
  return res.json() as Promise<T>;
}

export function login(username: string, password: string) {
  return request<LoginResponse>(
    '/auth/login',
    { method: 'POST', body: JSON.stringify({ username, password }) },
    { authenticated: false },
  );
}

export function listVulnerabilities(filters: { severity?: Severity | ''; status?: Status | '' }) {
  const params = new URLSearchParams();
  if (filters.severity) params.set('severity', filters.severity);
  if (filters.status) params.set('status', filters.status);
  const qs = params.toString();
  return request<Vulnerability[]>(`/vulnerabilities${qs ? `?${qs}` : ''}`);
}

export function getVulnerability(id: string | number) {
  return request<Vulnerability>(`/vulnerabilities/${id}`);
}

export function updateVulnerability(id: string | number, body: UpdateVulnerabilityRequest) {
  return request<Vulnerability>(`/vulnerabilities/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}
