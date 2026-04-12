import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FaCar } from 'react-icons/fa';
import api from '../../lib/axios';
import toast from 'react-hot-toast';

const ResetPassword = () => {
  const { token } = useParams();
  const nav = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) { toast.error('Passwords do not match'); return; }
    setLoading(true);
    try {
      await api.post(`/auth/reset-password/${token}`, { password });
      toast.success('Password reset successful!');
      nav('/login');
    } catch (err) { toast.error(err.response?.data?.message || 'Reset failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-16 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2"><div className="w-10 h-10 bg-gradient-to-br from-primary-700 to-primary-500 rounded-xl flex items-center justify-center"><FaCar className="text-white text-lg"/></div><span className="text-2xl font-bold gradient-text">MotoLease</span></Link>
          <h2 className="mt-6 text-2xl font-bold text-slate-800">Reset Password</h2>
        </div>
        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div><label className="input-label">New Password</label><input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} className="input-field" placeholder="••••••" required minLength={6}/></div>
            <div><label className="input-label">Confirm Password</label><input type="password" value={confirm} onChange={(e)=>setConfirm(e.target.value)} className="input-field" placeholder="••••••" required/></div>
            <button type="submit" disabled={loading} className="btn-primary w-full !py-3">{loading?'Resetting...':'Reset Password'}</button>
          </form>
        </div>
      </div>
    </div>
  );
};
export default ResetPassword;
