import axios from 'axios';

// In production REACT_APP_API_URL points at the Render backend; in dev the CRA proxy handles /api
const client = axios.create({
  baseURL: `${process.env.REACT_APP_API_URL || ''}/api`,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token from localStorage to every request
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// On 401, clear token and redirect to login
client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default client;
