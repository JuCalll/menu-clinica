import axios from "axios";

const api = axios.create({
  baseURL:
      process.env.NODE_ENV === "development"
          ? "http://127.0.0.1:8000/api"                                                          
          : "https://172.168.11.176/api",
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use(
  async (config) => {
    let token = localStorage.getItem("token");
    
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && 
        !originalRequest._retry &&
        !window.isRefreshing &&
        !originalRequest.url.includes('/auth/token/refresh/') && 
        !originalRequest.url.includes('/auth/logout/')) {
      
      originalRequest._retry = true;
      window.isRefreshing = true;

      try {
        const refresh = localStorage.getItem("refresh");
        if (!refresh) throw new Error("No refresh token available");

        const response = await api.post("/auth/token/refresh/", { refresh });
        
        if (response.data && response.data.access) {
          localStorage.setItem("token", response.data.access);
          if (response.data.refresh) {
            localStorage.setItem("refresh", response.data.refresh);
          }
          
          originalRequest.headers["Authorization"] = `Bearer ${response.data.access}`;
          api.defaults.headers.common["Authorization"] = `Bearer ${response.data.access}`;
          
          window.isRefreshing = false;
          return api(originalRequest);
        }
      } catch (refreshError) {
        window.isRefreshing = false;
        localStorage.clear();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
