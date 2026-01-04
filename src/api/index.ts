// utils/axiosInstance.ts
import axios from 'axios';

// Khởi tạo một instance của Axios
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000, // 10 giây
  headers: {},
});

// Interceptor request (nếu cần thêm token)
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor response (xử lý lỗi chung)
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Xử lý khi token hết hạn hoặc không hợp lệ
      console.warn('Unauthorized - hãy đăng nhập lại'); 
      localStorage.clear();
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;