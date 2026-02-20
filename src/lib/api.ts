import { buildQueryString } from "./utils";

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(
      body.error || body.message || `Request failed with status ${res.status}`,
      res.status
    );
  }
  return res.json();
}

export const api = {
  async get<T>(path: string, params?: Record<string, unknown>): Promise<T> {
    const qs = params ? buildQueryString(params) : "";
    const url = qs ? `${path}?${qs}` : path;
    const res = await fetch(url);
    return handleResponse<T>(res);
  },

  async post<T>(path: string, body?: unknown): Promise<T> {
    const res = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    });
    return handleResponse<T>(res);
  },

  async patch<T>(path: string, body?: unknown): Promise<T> {
    const res = await fetch(path, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    });
    return handleResponse<T>(res);
  },

  async delete<T>(path: string): Promise<T> {
    const res = await fetch(path, { method: "DELETE" });
    return handleResponse<T>(res);
  },

  async upload<T>(path: string, formData: FormData): Promise<T> {
    const res = await fetch(path, {
      method: "POST",
      body: formData,
    });
    return handleResponse<T>(res);
  },
};

export { ApiError };
