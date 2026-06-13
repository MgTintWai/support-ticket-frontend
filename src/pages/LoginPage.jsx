import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { login } from '../api/auth';
import { btnPrimary, cardClass, inputClass, labelClass, mutedTextClass, pageTitleClass } from '../utils/ui';

export default function LoginPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState('client@acme.local');
  const [password, setPassword] = useState('password');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      await queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-8">
      <form className={`${cardClass} w-full max-w-md`} onSubmit={handleSubmit}>
        <h1 className={pageTitleClass}>Support Ticket Portal</h1>
        <p className={`mt-2 ${mutedTextClass}`}>
          Sign in with your client or support agent account.
        </p>

        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </div>
        )}

        <div className="mt-6 space-y-4">
          <label className={labelClass}>
            Email
            <input
              type="email"
              className={inputClass}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          <label className={labelClass}>
            Password
            <input
              type="password"
              className={inputClass}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
        </div>

        <button type="submit" className={`${btnPrimary} mt-6 w-full`} disabled={loading}>
          {loading ? 'Signing in...' : 'Sign In'}
        </button>

        <div className="mt-6 border-t border-slate-200 pt-4 text-sm text-slate-600">
          <p className="font-semibold text-slate-800">Demo accounts</p>
          <p className="mt-1">Agent: agent@support.local / password</p>
          <p>Client: client@acme.local / password</p>
        </div>
      </form>
    </div>
  );
}
