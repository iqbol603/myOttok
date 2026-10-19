import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isUserSessionValid, refreshDashboardToken } from '../../utils/auth';

const Login: React.FC = () => {
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    const openApp = async () => {
      if (!isUserSessionValid()) {
        navigate('/', { replace: true });
        return;
      }

      try {
        await refreshDashboardToken();
        if (!cancelled) navigate('/stats', { replace: true });
      } catch (err) {
        if (!cancelled) {
          setError('Не удалось обновить токен.');
          navigate('/', { replace: true });
        }
      }
    };

    openApp();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  return (
    <div className="login-form">
      <h2>Вход</h2>
      {error && <p className="error">{error}</p>}
    </div>
  );
};

export default Login;
