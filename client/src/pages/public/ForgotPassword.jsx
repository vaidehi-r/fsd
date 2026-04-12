import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaCar } from 'react-icons/fa';
import api from '../../lib/axios';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
      toast.success('Reset link sent if email exists');
    } catch (err) { toast.error('Something went wrong'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-16 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2"><div className="w-10 h-10 bg-gradient-to-br from-primary-700 to-primary-500 rounded-xl flex items-center justify-center"><FaCar className="text-white text-lg"/></div><span className="text-2xl font-bold gradient-text">MotoLease</span></Link>
          <h2 className="mt-6 text-2xl font-bold text-slate-800">Forgot Password?</h2>
          <p className="mt-1 text-slate-500">We'll send you a reset link</p>
        </div>
        <div className="card p-8">
          {sent ? (
            <div className="text-center"><p className="text-green-600 font-medium mb-4">✅ If that email is registered, a reset link has been sent.</p><Link to="/login" className="text-primary-600 font-semibold">Back to login</Link></div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div><label className="input-label">Email</label><input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} className="input-field" placeholder="you@example.com" required/></div>
              <button type="submit" disabled={loading} className="btn-primary w-full !py-3">{loading?'Sending...':'Send Reset Link'}</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
export default ForgotPassword;
