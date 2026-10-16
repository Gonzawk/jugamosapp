const rawApiUrl = import.meta.env.VITE_API_URL?.trim();

if (!rawApiUrl) {
  throw new Error(
    'VITE_API_URL no está configurada. Revisá las variables del entorno antes de iniciar Jugamos?.',
  );
}

export const API = rawApiUrl.replace(/\/$/, '');
const DEFAULT_TIMEOUT_MS = 12_000;

export type Service = { id: string; name: string };
export type LocationOption = { id: string; name: string };
export type CourtInput = {
  name: string;
  sportName: string;
  surfaceType: string;
  lengthMeters: number | null;
  widthMeters: number | null;
  slotDurationMinutes: number;
  isCovered: boolean;
  allowsOtherSports: boolean;
};
export type ApplicationInput = {
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string | null;
  complexName: string;
  province: string;
  city: string;
  address: string;
  complexPhone: string;
  serviceIds: string[];
  courts: CourtInput[];
};

export class ApiError extends Error {
  status: number;
  body: unknown;

  constructor(message: string, status = 0, body: unknown = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

async function json<T>(path: string, init: RequestInit = {}): Promise<T> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);
  const headers = new Headers(init.headers);

  headers.set('Accept', 'application/json');
  if (init.body != null && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  try {
    const response = await fetch(`${API}${path}`, {
      ...init,
      headers,
      signal: controller.signal,
    });

    const raw = await response.text();
    let body: unknown = null;

    if (raw) {
      try {
        body = JSON.parse(raw);
      } catch {
        body = raw;
      }
    }

    if (!response.ok) {
      const message =
        typeof body === 'object' && body !== null && 'message' in body
          ? String((body as { message?: unknown }).message || `Error HTTP ${response.status}`)
          : `Error HTTP ${response.status}`;

      throw new ApiError(message, response.status, body);
    }

    return body as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;

    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new ApiError('La solicitud tardó demasiado. Intentá nuevamente.');
    }

    if (error instanceof TypeError) {
      throw new ApiError('No pudimos conectarnos con Jugamos?. Intentá nuevamente.');
    }

    throw error;
  } finally {
    window.clearTimeout(timeout);
  }
}

export const onboardingApi = {
  services: () => json<Service[]>('/api/solicitudes-complejos/servicios'),
  provinces: () => json<LocationOption[]>('/api/ubicaciones/provincias'),
  cities: (provinceId: string) =>
    json<LocationOption[]>(
      `/api/ubicaciones/localidades?provinciaId=${encodeURIComponent(provinceId)}`,
    ),
  create: (data: ApplicationInput) =>
    json<{ id: string; status: string; message: string }>('/api/solicitudes-complejos', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  status: (id: string) => json<unknown>(`/api/solicitudes-complejos/${encodeURIComponent(id)}/estado`),
};

// Documentos legales públicos: siempre se leen desde la API del entorno activo.
export type LegalDocument = {
  id: string;
  type: 'TERMS' | 'PRIVACY';
  version: number;
  title: string;
  content: string;
  publishedAtUtc: string | null;
};

export const legalApi = {
  current: () => json<LegalDocument[]>('/api/legal/vigentes'),
};
