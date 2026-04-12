import { useState, useEffect } from 'react';
import api from '../../lib/axios';
import PageHeader from '../../components/PageHeader';
import toast from 'react-hot-toast';

const AdminSettings = () => {
  const [settings, setSettings] = useState({ commissionPercent: 10, maintenanceMode: false });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(()=>{const f=async()=>{try{const r=await api.get('/admin/settings');setSettings(r.data.settings);}catch(e){}finally{setLoading(false);}};f();},[]);

  const save = async()=>{setSaving(true);try{await api.put('/admin/settings',settings);toast.success('Settings saved');}catch(e){toast.error('Failed');}finally{setSaving(false);}};

  if(loading) return <div className="pt-20 page-container flex justify-center py-20"><div className="w-8 h-8 border-4 border-primary-200 border-t-primary-700 rounded-full animate-spin"/></div>;

  return (
    <div className="pt-20 page-container">
      <PageHeader title="Platform Settings" breadcrumbs={[{label:'Admin',to:'/admin/dashboard'},{label:'Settings'}]}/>
      <div className="card p-6 max-w-lg space-y-6">
        <div>
          <label className="input-label">Commission Percentage (%)</label>
          <input type="number" min="0" max="50" step="0.5" value={settings.commissionPercent}
            onChange={e=>setSettings(p=>({...p,commissionPercent:parseFloat(e.target.value)}))} className="input-field"/>
          <p className="text-xs text-slate-400 mt-1">Applied to every booking subtotal</p>
        </div>
        <div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={settings.maintenanceMode}
              onChange={e=>setSettings(p=>({...p,maintenanceMode:e.target.checked}))}
              className="w-5 h-5 rounded border-gray-300 text-primary-700 focus:ring-primary-500"/>
            <div><p className="font-medium text-slate-800">Maintenance Mode</p><p className="text-xs text-slate-400">When enabled, the platform will show a maintenance page</p></div>
          </label>
        </div>
        <button onClick={save} disabled={saving} className="btn-primary">{saving?'Saving...':'Save Settings'}</button>
      </div>
    </div>
  );
};
export default AdminSettings;
