import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BackgroundAnimation from '../components/BackgroundAnimation';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    inviteCode: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (!formData.inviteCode.trim()) {
      setError('Invite code is required. Ask an admin for one.');
      return;
    }

    setLoading(true);

    try {
      await register(formData.email, formData.password, formData.name, formData.inviteCode.trim());
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
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
          <p className="text-neutral-500 mt-2 font-accent">Create your account</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 animate-scale-in">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="stagger-item">
            <label className="label">Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="input"
              required
            />
          </div>

          <div className="stagger-item">
            <label className="label">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="input"
              required
            />
          </div>

          <div className="stagger-item">
            <label className="label">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="input"
              required
              minLength={8}
            />
            <p className="text-xs text-neutral-400 mt-1">
              Min 8 characters, with uppercase, lowercase, and a number
            </p>
          </div>

          <div className="stagger-item">
            <label className="label">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="input"
              required
            />
          </div>

          <div className="stagger-item">
            <label className="label">Invite Code</label>
            <input
              type="text"
              name="inviteCode"
              value={formData.inviteCode}
              onChange={handleChange}
              className="input font-mono uppercase tracking-wider"
              placeholder="Enter your invite code"
              required
            />
            <p className="text-xs text-neutral-400 mt-1">
              Ask the competition admin for an invite code
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn btn-primary btn-luxury stagger-item"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="loading-spinner" style={{ width: 20, height: 20, borderWidth: 2 }}></span>
                Creating account...
              </span>
            ) : 'Register'}
          </button>
        </form>

        <p className="text-center text-neutral-500 mt-6 stagger-item">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-600 hover:text-primary-700 font-semibold transition-colors">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
