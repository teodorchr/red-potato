import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { LanguageSelector } from '../components/common/LanguageSelector';

export const Login = () => {
  const { t } = useTranslation();
  const { login, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (isAuthenticated()) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(formData.username, formData.password);
      if (!result.success) {
        setError(result.message);
      }
    } catch {
      setError(t('login.authError'));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="absolute top-4 right-4">
        <LanguageSelector />
      </div>
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-16 w-16 bg-primary-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-2xl font-bold">RP</span>
          </div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
            {t('login.title')}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {t('login.subtitle')}
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <Input
              label={t('login.usernameLabel')}
              name="username"
              type="text"
              required
              value={formData.username}
              onChange={handleChange}
              placeholder={t('login.usernamePlaceholder')}
            />

            <Input
              label={t('login.passwordLabel')}
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleChange}
              placeholder={t('login.passwordPlaceholder')}
            />
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? t('common.loggingIn') : t('common.login')}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Login;
