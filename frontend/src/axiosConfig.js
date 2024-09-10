import axios from "axios";

const api = axios.create({
  baseURL:
    process.env.NODE_ENV === "development"
      ? "http://127.0.0.1:8000/api"
      : "http://172.168.11.176:8000/api",
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response &&
      error.response.status === 401 &&
      error.response.data.code === "token_not_valid"
    ) {
      const refreshToken = localStorage.getItem("refresh");

      if (refreshToken) {
        try {
          const response = await axios.post("/auth/token/refresh/", {
            refresh: refreshToken,
          });

          if (response.data && response.data.access) {
            localStorage.setItem("token", response.data.access);
            api.defaults.headers.common[
              "Authorization"
            ] = `Bearer ${response.data.access}`;
            originalRequest.headers[
              "Authorization"
            ] = `Bearer ${response.data.access}`;

            console.log("Token refreshed successfully");

            return await api(originalRequest);
          } else {
            console.error("Invalid response from token refresh endpoint");
            throw error;
          }
        } catch (refreshError) {
          console.error("Error refreshing token:", refreshError);
          localStorage.removeItem("token");
          localStorage.removeItem("refresh");
          window.location.href = "/login";
        }
      }
    }

    // Handle non-401 errors
    console.error("Error:", error);
    return Promise.reject(error);
  }
);

export default api;
