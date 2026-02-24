import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BackgroundAnimation from '../components/BackgroundAnimation';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-neutral-50 to-primary-100 flex items-center justify-center p-4 auth-bg relative">
      <BackgroundAnimation />
      <div className="card max-w-md w-full animate-slide-up relative z-10">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3 float-gentle inline-block">🎂</div>
          <h2 className="text-2xl font-bold text-gradient-gold">Great Rudgwick Bake Off</h2>
          <p className="text-neutral-500 mt-2 font-accent">Login to your account</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 animate-scale-in">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="stagger-item">
            <label className="label">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              required
            />
          </div>

          <div className="stagger-item">
            <label className="label">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn btn-primary btn-luxury stagger-item"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="loading-spinner" style={{ width: 20, height: 20, borderWidth: 2 }}></span>
                Logging in...
              </span>
            ) : 'Login'}
          </button>
        </form>

        <p className="text-center text-neutral-500 mt-6 stagger-item">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary-600 hover:text-primary-700 font-semibold transition-colors">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
