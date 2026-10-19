import axios from 'axios';

const DASHBOARD_LOGIN_URL = 'https://api.dashboard.btt.tj/api/auth/login?';
const REFRESH_URL = 'https://api.dashboard.btt.tj/api/auth/refresh';
const SERVICE_LOGIN = 'dashboard_api';
const SERVICE_PASSWORD = '8DhTrMaMxf';
export const TOKEN_REFRESH_MS = 5 * 60 * 1000;
const SESSION_MS = 30 * 24 * 60 * 60 * 1000;

let refreshTimer = null;
let refreshing = null;

export function parseExpiry(expiresAt) {
  if (expiresAt == null || expiresAt === '') return 0;
  const asNumber = Number(expiresAt);
  if (!Number.isNaN(asNumber) && String(expiresAt).trim() !== '') {
    if (asNumber > 31536000000) return asNumber;
    return asNumber * 1000;
  }
  const parsed = new Date(expiresAt).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
}

export function isUserSessionValid() {
  const until = Number(localStorage.getItem('session_until') || 0);
  if (until > Date.now()) return true;

  // Уже есть рабочий токен, но сессия ещё не записана — не спрашиваем вход заново.
  if (!localStorage.getItem('session_until') && localStorage.getItem('token')) {
    localStorage.setItem('session_until', String(Date.now() + SESSION_MS));
    localStorage.setItem('user_session', '1');
    return true;
  }

  const expiresAt = localStorage.getItem('user_expires_at') || localStorage.getItem('token_expires_at');
  const token = localStorage.getItem('user_token') || localStorage.getItem('token');
  if (token && expiresAt && parseExpiry(expiresAt) > Date.now()) return true;
  return false;
}

export function saveUserSession(token, expiresAt) {
  if (token) localStorage.setItem('user_token', token);
  if (expiresAt) localStorage.setItem('user_expires_at', expiresAt);
  const serverExp = parseExpiry(expiresAt);
  const until = Math.max(serverExp || 0, Date.now() + SESSION_MS);
  localStorage.setItem('session_until', String(until));
  localStorage.setItem('user_session', '1');
}

function isAuthRequest(url = '') {
  return url.includes('auth/login') || url.includes('auth/refresh') || url.includes('loginOttok');
}

function persistDashboardAuth(data) {
  const token = data?.access_token || data?.token;
  if (!token) {
    throw new Error('Сервер не вернул токен');
  }
  localStorage.setItem('token', token);
  if (data.refresh_token) {
    localStorage.setItem('refresh_token', data.refresh_token);
  }
  const expiresAt = data.expires_at
    || (data.expires_in ? Date.now() + Number(data.expires_in) * 1000 : Date.now() + 30 * 60 * 1000);
  localStorage.setItem('dashboard_expires_at', String(parseExpiry(expiresAt) || expiresAt));
  return token;
}

async function loginDashboard() {
  const response = await axios.post(DASHBOARD_LOGIN_URL, {
    login: SERVICE_LOGIN,
    password: SERVICE_PASSWORD,
  });
  return persistDashboardAuth(response.data);
}

async function refreshWithToken(refreshToken) {
  const response = await axios.post(REFRESH_URL, { refresh_token: refreshToken });
  return persistDashboardAuth(response.data);
}

export function refreshDashboardToken() {
  if (refreshing) return refreshing;

  refreshing = (async () => {
    const storedRefresh = localStorage.getItem('refresh_token');
    if (storedRefresh) {
      try {
        return await refreshWithToken(storedRefresh);
      } catch (error) {
        localStorage.removeItem('refresh_token');
      }
    }
    return loginDashboard();
  })().finally(() => {
    refreshing = null;
  });

  return refreshing;
}

export function startTokenRefreshLoop() {
  if (refreshTimer) return;

  const tick = () => {
    if (!localStorage.getItem('token') && !isUserSessionValid()) return;
    refreshDashboardToken().catch(() => {});
  };

  if (!localStorage.getItem('token') && isUserSessionValid()) {
    tick();
  }

  refreshTimer = setInterval(tick, TOKEN_REFRESH_MS);
}

axios.interceptors.request.use((config) => {
  const url = config.url || '';
  const token = localStorage.getItem('token');
  if (token && !isAuthRequest(url)) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const status = error.response?.status;
    const url = original?.url || '';

    if (status === 401 && original && !original._retry && !isAuthRequest(url)) {
      original._retry = true;
      try {
        const token = await refreshDashboardToken();
        original.headers = original.headers || {};
        original.headers.Authorization = `Bearer ${token}`;
        return axios(original);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
