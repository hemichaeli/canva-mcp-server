// Canva Connect API client

const CANVA_API_BASE = "https://api.canva.com/rest";

export interface CanvaClientConfig {
  accessToken: string;
}

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  status: number;
}

export async function canvaRequest<T = unknown>(
  method: HttpMethod,
  path: string,
  accessToken: string,
  body?: unknown,
  queryParams?: Record<string, string | number | boolean | undefined>
): Promise<ApiResponse<T>> {
  let url = `${CANVA_API_BASE}${path}`;

  if (queryParams) {
    const params = new URLSearchParams();
    for (const [key, val] of Object.entries(queryParams)) {
      if (val !== undefined && val !== null && val !== "") {
        params.append(key, String(val));
      }
    }
    const paramStr = params.toString();
    if (paramStr) url += `?${paramStr}`;
  }

  const headers: Record<string, string> = {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  };

  const options: RequestInit = {
    method,
    headers,
  };

  if (body !== undefined && method !== "GET" && method !== "DELETE") {
    options.body = JSON.stringify(body);
  }

  try {
    const res = await fetch(url, options);
    const status = res.status;

    if (status === 204) {
      return { status, data: undefined };
    }

    const text = await res.text();
    let data: unknown;
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }

    if (!res.ok) {
      const errMsg =
        typeof data === "object" && data !== null && "message" in data
          ? (data as Record<string, unknown>).message
          : text;
      return { status, error: String(errMsg) };
    }

    return { status, data: data as T };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { status: 0, error: `Network error: ${msg}` };
  }
}

export async function canvaFormRequest<T = unknown>(
  path: string,
  accessToken: string,
  formData: FormData
): Promise<ApiResponse<T>> {
  const url = `${CANVA_API_BASE}${path}`;

  const headers: Record<string, string> = {
    Authorization: `Bearer ${accessToken}`,
  };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers,
      body: formData,
    });

    const status = res.status;
    const text = await res.text();
    let data: unknown;
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }

    if (!res.ok) {
      const errMsg =
        typeof data === "object" && data !== null && "message" in data
          ? (data as Record<string, unknown>).message
          : text;
      return { status, error: String(errMsg) };
    }

    return { status, data: data as T };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { status: 0, error: `Network error: ${msg}` };
  }
}

export function formatResult(data: unknown, error?: string): string {
  if (error) return `Error: ${error}`;
  return JSON.stringify(data, null, 2);
}

export function getAccessToken(): string {
  const token = process.env.CANVA_ACCESS_TOKEN;
  if (!token) throw new Error("CANVA_ACCESS_TOKEN environment variable not set");
  return token;
}
