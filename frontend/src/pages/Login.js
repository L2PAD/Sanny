import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await login(email, password);
      
      if (result.success) {
        toast.success(t('loginSuccess'));
        
        // Redirect based on user role
        const user = JSON.parse(localStorage.getItem('user'));
        if (user.role === 'admin') {
          navigate('/admin');
        } else if (user.role === 'seller') {
          navigate('/seller/dashboard');
        } else {
          // Regular users go to their profile
          navigate('/profile');
        }
      } else {
        // Переводим сообщение об ошибке
        let errorMsg = result.error;
        if (errorMsg.includes('Invalid credentials')) {
          errorMsg = t('loginFailed') + ': ' + (t('language') === 'ua' ? 'Невірний email або пароль' : 'Неверный email или пароль');
        } else if (errorMsg.includes('User not found')) {
          errorMsg = t('language') === 'ua' ? 'Користувача не знайдено' : 'Пользователь не найден';
        } else if (!errorMsg.includes('Помилка') && !errorMsg.includes('Ошибка')) {
          errorMsg = t('loginFailed');
        }
        toast.error(errorMsg);
      }
    } catch (error) {
      console.error('Login error:', error);
      const errorMsg = t('language') === 'ua' ? 'Помилка підключення до серверу' : 'Ошибка подключения к серверу';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div data-testid="login-page" className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 data-testid="login-title" className="text-4xl font-bold text-[#121212]">{t('welcomeBack')}</h2>
          <p className="mt-2 text-gray-600">{t('signInToAccount')}</p>
        </div>

        <form data-testid="login-form" onSubmit={handleSubmit} className="mt-8 space-y-6 bg-white p-8 rounded-2xl border border-gray-200">
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">{t('emailAddress')}</Label>
              <Input
                data-testid="email-input"
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="password">{t('password')}</Label>
              <Input
                data-testid="password-input"
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="mt-1"
              />
            </div>
          </div>

          <Button data-testid="submit-button" type="submit" className="w-full" disabled={loading}>
            {loading ? t('signingIn') : t('signIn')}
          </Button>

          <p className="text-center text-sm text-gray-600">
            {t('dontHaveAccount')}{' '}
            <Link data-testid="register-link" to="/register" className="text-[#0071E3] hover:underline font-medium">
              {t('signUp')}
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;