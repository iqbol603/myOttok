import React, { useState, FormEvent, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';


interface LoginResponse {
  token: string;
  user: {
    id: number;
    login: string;
  };
}


const Login: React.FC = () => {
  const [login, setUsername] = useState<string>('dashboard_api');
  const [password, setPassword] = useState<string>('8DhTrMaMxf');
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();  // Хук для перенаправления

  const handleSubmit = async () => {
    // e.preventDefault();
    setError('');
    try {
      const response = await axios.post<LoginResponse>('https://api.dashboard.btt.tj/api/auth/login?', {
        login,
        password
      });
      console.log(response.data);
      // Здесь вы можете обработать успешный вход, например, сохранить токен
      localStorage.setItem('token', response.data.access_token);
      navigate('/auth');
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data.message || 'Ошибка входа. Пожалуйста, проверьте ваши данные.');
      } else {
        setError('Произошла неизвестная ошибка.');
      }
    }
    console.log("token", localStorage.getItem('token'));
  };
   // Выполнение функции авторизации сразу при загрузке компонента
  useEffect(() => {
    handleSubmit();  // Вызываем функцию авторизации при монтировании компонента
  }, []);  // Пустой массив зависимостей гарантирует, что useEffect сработает один раз


  return (
    <div className="login-form">
      <h2>Вход</h2>
      {error && <p className="error">{error}</p>}
      {/* <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="username">Имя пользователя:</label>
          <input
            type="text"
            id="username"
            value={login}
            onChange={(e) => setUsername('dashboard_api')}
            required
          />
        </div>
        <div>
          <label htmlFor="password">Пароль:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword('8DhTrMaMxf')}
            required
          />
        </div>
        <button type="submit">Войти</button>
      </form> */}
    </div>
  );
};

export default Login;