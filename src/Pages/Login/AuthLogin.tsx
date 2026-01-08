import React, { useState, FormEvent } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface LoginResponse {
  ok: boolean;
  token: string;
  expires_at: string;
}

const AuthLogin: React.FC = () => {
  const [login, setLogin] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const response = await axios.post<LoginResponse>(
        'https://wifi.babilon-t.tj/pages/loginOttok.php',
        {
          login,
          password
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data.ok && response.data.token) {
        // Сохраняем токен и время истечения
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('token_expires_at', response.data.expires_at);
        
        console.log('Авторизация успешна', response.data);
        // Перенаправляем на LOgin.tsx после успешной авторизации
        navigate('/');
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

