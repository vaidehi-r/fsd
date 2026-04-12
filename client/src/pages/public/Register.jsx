import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FaCar } from 'react-icons/fa';
import { HiEye, HiEyeOff } from 'react-icons/hi';
import useAuthStore from '../../stores/authStore';
import toast from 'react-hot-toast';

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(10),
  password: z.string().min(6),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Passwords do not match', path: ['confirmPassword'],
});

const Register = () => {
  const nav = useNavigate();
  const { register: reg } = useAuthStore();
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await reg({ name: data.name, email: data.email, phone: data.phone, password: data.password });
      toast.success('Welcome to MotoLease!');
      nav('/dashboard');
    } catch (e) { toast.error(e.response?.data?.message || 'Registration failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-16 pb-10 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-700 to-primary-500 rounded-xl flex items-center justify-center">
              <FaCar className="text-white text-lg" />
            </div>
            <span className="text-2xl font-bold gradient-text">MotoLease</span>
          </Link>
          <h2 className="mt-6 text-2xl font-bold text-slate-800">Create your account</h2>
          <p className="mt-1 text-slate-500">Start renting cars today</p>
        </div>
        <div className="card p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div><label className="input-label">Full Name</label><input {...register('name')} className="input-field" placeholder="John Doe" />{errors.name && <p className="input-error">{errors.name.message}</p>}</div>
            <div><label className="input-label">Email</label><input type="email" {...register('email')} className="input-field" placeholder="you@example.com" />{errors.email && <p className="input-error">{errors.email.message}</p>}</div>
            <div><label className="input-label">Phone</label><input type="tel" {...register('phone')} className="input-field" placeholder="+1 (555) 123-4567" />{errors.phone && <p className="input-error">{errors.phone.message}</p>}</div>
            <div><label className="input-label">Password</label><div className="relative"><input type={show?'text':'password'} {...register('password')} className="input-field !pr-10" placeholder="••••••" /><button type="button" onClick={()=>setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">{show?<HiEyeOff/>:<HiEye/>}</button></div>{errors.password && <p className="input-error">{errors.password.message}</p>}</div>
            <div><label className="input-label">Confirm Password</label><input type="password" {...register('confirmPassword')} className="input-field" placeholder="••••••" />{errors.confirmPassword && <p className="input-error">{errors.confirmPassword.message}</p>}</div>
            <button type="submit" disabled={loading} className="btn-primary w-full !py-3">{loading?'Creating...':'Create Account'}</button>
          </form>
          <p className="mt-6 text-center text-sm text-slate-500">Already have an account? <Link to="/login" className="text-primary-600 font-semibold">Sign in</Link></p>
        </div>
      </div>
    </div>
  );
};
export default Register;
