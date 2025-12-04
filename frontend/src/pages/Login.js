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
      toast.error(result.error || t('loginFailed'));
    }
    
    setLoading(false);
  };

  return (
    <div data-testid="login-page" className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 data-testid="login-title" className="text-4xl font-bold text-[#121212]">Welcome Back</h2>
          <p className="mt-2 text-gray-600">Sign in to your account to continue</p>
        </div>

        <form data-testid="login-form" onSubmit={handleSubmit} className="mt-8 space-y-6 bg-white p-8 rounded-2xl border border-gray-200">
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email Address</Label>
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
              <Label htmlFor="password">Password</Label>
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
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>

          <p className="text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <Link data-testid="register-link" to="/register" className="text-[#0071E3] hover:underline font-medium">
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;