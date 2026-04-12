import { useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '../../lib/axios';
import useAuthStore from '../../stores/authStore';
import PageHeader from '../../components/PageHeader';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, updateUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const { register, handleSubmit } = useForm({ defaultValues: { name: user?.name, phone: user?.phone } });

  const onUpdateProfile = async (data) => {
    setLoading(true);
    try {
      const res = await api.put('/user/profile', data);
      updateUser(res.data.user);
      toast.success('Profile updated');
    } catch (e) { toast.error('Update failed'); }
    finally { setLoading(false); }
  };

  const onAvatarChange = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    setAvatarLoading(true);
    try {
      const fd = new FormData(); fd.append('avatar', file);
      const res = await api.put('/user/avatar', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      updateUser(res.data.user);
      toast.success('Avatar updated');
    } catch (e) { toast.error('Upload failed'); }
    finally { setAvatarLoading(false); }
  };

  const onChangePassword = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const cur = fd.get('currentPassword'), nw = fd.get('newPassword'), conf = fd.get('confirmPassword');
    if (nw !== conf) { toast.error('Passwords do not match'); return; }
    setPwLoading(true);
    try {
      await api.put('/user/change-password', { currentPassword: cur, newPassword: nw });
      toast.success('Password changed');
      e.target.reset();
    } catch (e2) { toast.error(e2.response?.data?.message || 'Failed'); }
    finally { setPwLoading(false); }
  };

  return (
    <div className="pt-20 page-container">
      <PageHeader title="My Profile" breadcrumbs={[{ label: 'Dashboard', to: '/dashboard' }, { label: 'Profile' }]} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Avatar */}
        <div className="card p-6 text-center">
          <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center overflow-hidden mb-4">
            {user?.avatar?.url ? <img src={user.avatar.url} alt="" className="w-full h-full object-cover" /> :
            <span className="text-white text-3xl font-bold">{user?.name?.[0]}</span>}
          </div>
          <h3 className="font-semibold text-slate-800">{user?.name}</h3>
          <p className="text-sm text-slate-500">{user?.email}</p>
          <span className="inline-block mt-2 px-3 py-1 bg-primary-50 text-primary-700 text-xs font-medium rounded-full capitalize">{user?.role}</span>
          <label className="block mt-4">
            <span className="btn-secondary text-sm cursor-pointer inline-block">{avatarLoading ? 'Uploading...' : 'Change Avatar'}</span>
            <input type="file" accept="image/*" onChange={onAvatarChange} className="hidden" />
          </label>
        </div>

        <div className="lg:col-span-2 space-y-6">
          {/* Profile info */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold mb-4">Personal Information</h2>
            <form onSubmit={handleSubmit(onUpdateProfile)} className="space-y-4">
              <div><label className="input-label">Name</label><input {...register('name')} className="input-field" /></div>
              <div><label className="input-label">Phone</label><input {...register('phone')} className="input-field" /></div>
              <div><label className="input-label">Email</label><input value={user?.email} disabled className="input-field !bg-gray-50 !text-slate-400" /></div>
              <button type="submit" disabled={loading} className="btn-primary">{loading ? 'Saving...' : 'Save Changes'}</button>
            </form>
          </div>

          {/* Change password */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold mb-4">Change Password</h2>
            <form onSubmit={onChangePassword} className="space-y-4">
              <div><label className="input-label">Current Password</label><input type="password" name="currentPassword" className="input-field" required /></div>
              <div><label className="input-label">New Password</label><input type="password" name="newPassword" className="input-field" required minLength={6} /></div>
              <div><label className="input-label">Confirm New Password</label><input type="password" name="confirmPassword" className="input-field" required /></div>
              <button type="submit" disabled={pwLoading} className="btn-primary">{pwLoading ? 'Changing...' : 'Change Password'}</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Profile;
