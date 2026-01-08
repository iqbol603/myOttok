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

// Функция для проверки валидности токена
const isTokenValid = (): boolean => {
  const token = localStorage.getItem('token');
  const expiresAt = localStorage.getItem('token_expires_at');
  
  console.log('Проверка токена:', { token: token ? 'есть' : 'нет', expiresAt });
  
  if (!token || !expiresAt) {
    console.log('Токен или expires_at отсутствует');
    return false;
  }
  
  try {
    // Пробуем разные форматы даты
    let expirationTime: number;
    
    // Если это timestamp (число)
    if (!isNaN(Number(expiresAt))) {
      expirationTime = Number(expiresAt) * 1000; // Если в секундах, переводим в миллисекунды
      // Если уже в миллисекундах (больше чем год в миллисекундах)
      if (Number(expiresAt) > 31536000000) {
        expirationTime = Number(expiresAt);
      }
    } else {
      // Если это строка даты
      expirationTime = new Date(expiresAt).getTime();
    }
    
    const currentTime = new Date().getTime();
    const isValid = expirationTime > currentTime;
    
    console.log('Результат проверки токена:', {
      expirationTime: new Date(expirationTime).toISOString(),
      currentTime: new Date(currentTime).toISOString(),
      isValid,
      timeLeft: isValid ? Math.floor((expirationTime - currentTime) / 1000 / 60) + ' минут' : 'истек'
    });
    
    return isValid;
  } catch (error) {
    console.error('Ошибка при проверке токена:', error);
    return false;
  }
};

const Login: React.FC = () => {
  // const [login, setUsername] = useState<string>('');
  // const [password, setPassword] = useState<string>('');
  const [login, setUsername] = useState<string>('dashboard_api');
  const [password, setPassword] = useState<string>('8DhTrMaMxf');
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();  // Хук для перенаправления

  // Проверка токена при загрузке компонента
  useEffect(() => {
    if (!isTokenValid()) {
      // Если токена нет или он истек, перенаправляем на страницу авторизации
      navigate('/');
    }
  }, [navigate]);

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
       <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="username">Имя пользователя:</label>
          <input
            type="text"
            id="username"
            value={login}
            // onChange={(e) => setUsername('dashboard_api')}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="password">Пароль:</label>
          <input
            type="password"
            id="password"
            value={password}
            // onChange={(e) => setPassword('8DhTrMaMxf')}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Войти</button>
      </form> 
    </div>
  );
};

export default Login;