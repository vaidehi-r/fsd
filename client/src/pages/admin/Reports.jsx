import { useState, useEffect } from 'react';
import api from '../../lib/axios';
import PageHeader from '../../components/PageHeader';
import StatusBadge from '../../components/StatusBadge';
import toast from 'react-hot-toast';

const AdminReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{fetch();},[]);
  const fetch = async()=>{try{const r=await api.get('/reports');setReports(r.data.reports);}catch(e){}finally{setLoading(false);}};
  const resolve = async(id)=>{try{await api.put(`/reports/${id}/resolve`);toast.success('Resolved');fetch();}catch(e){toast.error('Failed');}};

  return (
    <div className="pt-20 page-container">
      <PageHeader title="Reports" breadcrumbs={[{label:'Admin',to:'/admin/dashboard'},{label:'Reports'}]}/>
      <div className="card overflow-hidden"><div className="overflow-x-auto"><table className="w-full text-sm">
        <thead><tr className="bg-gray-50 border-b text-left text-xs font-semibold text-slate-500 uppercase"><th className="px-4 py-3">Reporter</th><th className="px-4 py-3">Car</th><th className="px-4 py-3">Reason</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Actions</th></tr></thead>
        <tbody>{reports.map(r=>(
          <tr key={r._id} className="border-b border-gray-50">
            <td className="px-4 py-3">{r.reporter?.name}</td><td className="px-4 py-3 font-medium">{r.car?.title}</td>
            <td className="px-4 py-3"><p className="font-medium text-sm">{r.reason}</p><p className="text-xs text-slate-400 truncate max-w-[200px]">{r.description}</p></td>
            <td className="px-4 py-3"><StatusBadge status={r.status}/></td>
            <td className="px-4 py-3">{r.status==='pending'&&<button onClick={()=>resolve(r._id)} className="text-xs btn-success !py-1 !px-2">Resolve</button>}</td>
          </tr>
        ))}</tbody>
      </table></div></div>
    </div>
  );
};
export default AdminReports;
