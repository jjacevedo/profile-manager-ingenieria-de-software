const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
const REQUEST_TIMEOUT_MS = 12000;

async function request(path, options = {}) {
  const isFormData = options.body instanceof FormData;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      headers: isFormData
        ? { ...(options.headers || {}) }
        : { "Content-Type": "application/json", ...(options.headers || {}) },
      signal: controller.signal,
      ...options
    });
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error("La solicitud tardó demasiado. Verifica el backend.");
    }
    throw new Error("No fue posible conectar con el backend.");
  } finally {
    clearTimeout(timeout);
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || "Error inesperado");
  }
  return data;
}

export const api = {
  createUser: (payload) =>
    request("/api/users", { method: "POST", body: JSON.stringify(payload) }),

  loginUser: (payload) =>
    request("/api/users/login", { method: "POST", body: JSON.stringify(payload) }),

  extractProfile: (payload) =>
    request("/api/profile/extract", { method: "POST", body: JSON.stringify(payload) }),

  extractProfileFile: (userId, file) => {
    const formData = new FormData();
    formData.append("user_id", String(userId));
    formData.append("file", file);
    return request("/api/profile/extract-file", { method: "POST", body: formData });
  },

  getProfile: (userId) => request(`/api/profile/${userId}`),

  updateProfile: (userId, payload) =>
    request(`/api/profile/${userId}`, { method: "PUT", body: JSON.stringify(payload) }),

  getRecommendations: (userId) => request(`/api/jobs/recommendations/${userId}`),

  getHome: (userId) => request(`/api/home/${userId}`),

  manualApply: (payload) =>
    request("/api/applications/manual", { method: "POST", body: JSON.stringify(payload) }),

  assistedApply: (payload) =>
    request("/api/applications/assisted", { method: "POST", body: JSON.stringify(payload) }),

  getApplications: (userId) => request(`/api/applications/${userId}`),

  updateApplicationStatus: (applicationId, payload) =>
    request(`/api/applications/${applicationId}/status`, {
      method: "PATCH",
      body: JSON.stringify(payload)
    }),

  getAutomationConfig: (userId) => request(`/api/applications/automation/${userId}`),

  updateAutomationConfig: (userId, payload) =>
    request(`/api/applications/automation/${userId}`, {
      method: "PUT",
      body: JSON.stringify(payload)
    }),

  runAutomation: (userId) =>
    request(`/api/applications/automation/${userId}/run`, { method: "POST" })
};
