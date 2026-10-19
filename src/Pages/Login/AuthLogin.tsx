import React, { useEffect, useState, FormEvent } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { isUserSessionValid, refreshDashboardToken, saveUserSession } from '../../utils/auth';

interface LoginResponse {
  ok: boolean;
  token: string;
  expires_at: string;
  refresh_token?: string;
}

const AuthLogin: React.FC = () => {
  const [login, setLogin] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [checkingSession, setCheckingSession] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    const continueSession = async () => {
      if (!isUserSessionValid()) {
        if (!cancelled) setCheckingSession(false);
        return;
      }

      try {
        await refreshDashboardToken();
        if (!cancelled) navigate('/stats', { replace: true });
      } catch (err) {
        if (!cancelled) {
          setError('Сессия есть, но не удалось обновить доступ. Войдите ещё раз.');
          setCheckingSession(false);
        }
      }
    };

    continueSession();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post<LoginResponse>(
        'https://wifi.babilon-t.tj/pages/loginOttok.php',
        { login, password },
        { headers: { 'Content-Type': 'application/json' } }
      );

      if (response.data.ok && response.data.token) {
        saveUserSession(response.data.token, response.data.expires_at);
        if (response.data.refresh_token) {
          localStorage.setItem('refresh_token', response.data.refresh_token);
        }
        await refreshDashboardToken();
        navigate('/stats', { replace: true });
      } else {
        setError('Ошибка авторизации. Неверные данные.');
      }
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data?.message || 'Ошибка входа. Пожалуйста, проверьте ваши данные.');
      } else {
        setError('Произошла неизвестная ошибка.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="login-form">
        <h2>Проверяем сессию…</h2>
      </div>
    );
  }

  return (
    <div className="login-form">
      <h2>Авторизация</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="login">Логин:</label>
          <input
            type="text"
            id="login"
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            required
            disabled={loading}
          />
        </div>
        <div>
          <label htmlFor="password">Пароль:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Вход...' : 'Войти'}
        </button>
      </form>
    </div>
  );
};

export default AuthLogin;
