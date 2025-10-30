const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

async function request(path: string, init?: RequestInit) {
  const res = await fetch(`${BASE_URL}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    ...init,
  });
  const contentType = res.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await res.json()
    : await res.text();
  if (!res.ok) {
    const errorMsg =
      typeof data === "string" ? data : (data as any)?.error || res.statusText;
    console.error(`API Error (${res.status}):`, errorMsg, "Path:", path);
    throw new Error(errorMsg);
  }
  return data;
}

export const api = {
  get: (p: string) => request(p),
  post: (p: string, body?: any) =>
    request(p, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    }),
  delete: (p: string) =>
    request(p, {
      method: "DELETE",
    }),
};
