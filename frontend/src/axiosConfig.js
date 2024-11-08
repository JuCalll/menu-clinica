import axios from "axios";
import { jwtDecode } from 'jwt-decode';

const api = axios.create({
  baseURL:
      process.env.NODE_ENV === "development"
          ? "http://127.0.0.1:8000/api"                                                          
          : "https://172.168.11.176/api",
});


const isTokenExpired = (token) => {
  if (!token) return true;
  try {
    const decodedToken = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    return decodedToken.exp < currentTime;
  } catch (error) {
    return true;
  }
};

api.interceptors.request.use(
  async (config) => {
    let token = localStorage.getItem("token");

    if (token && isTokenExpired(token)) {
      const refreshToken = localStorage.getItem("refresh");
      if (refreshToken && !isTokenExpired(refreshToken)) {
        try {
          const response = await axios.post(
            `${api.defaults.baseURL}/auth/token/refresh/`,
            { refresh: refreshToken }
          );
          if (response.data && response.data.access) {
            token = response.data.access;
            localStorage.setItem("token", token);
            api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

            if (response.data.refresh) {
              localStorage.setItem("refresh", response.data.refresh);
            }
          } else {
            throw new Error("No se pudo refrescar el token.");
          }
        } catch (error) {
          localStorage.removeItem("token");
          localStorage.removeItem("refresh");
          window.location.href = "/login";
          return Promise.reject(error);
        }
      } else {
        localStorage.removeItem("token");
        localStorage.removeItem("refresh");
        window.location.href = "/login";
        return Promise.reject(new Error("Token expirado"));
      }
    }

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
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("refresh");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
