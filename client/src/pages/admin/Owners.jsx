import { useState, useEffect } from 'react';
import api from '../../lib/axios';
import PageHeader from '../../components/PageHeader';
import StatusBadge from '../../components/StatusBadge';
import toast from 'react-hot-toast';

const AdminOwners = () => {
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  useEffect(()=>{fetch();},[page]);
  const fetch = async()=>{setLoading(true);try{const r=await api.get(`/admin/owners?page=${page}${search?`&search=${search}`:''}`);setOwners(r.data.owners);setPages(r.data.pages);}catch(e){}finally{setLoading(false);}};
  const toggleSuspend = async(id)=>{try{await api.put(`/admin/owners/${id}/suspend`);toast.success('Updated');fetch();}catch(e){toast.error('Failed');}};
  const del = async(id)=>{if(!confirm('Delete owner?'))return;try{await api.delete(`/admin/owners/${id}`);toast.success('Deleted');fetch();}catch(e){toast.error('Failed');}};

  return (
    <div className="pt-20 page-container">
      <PageHeader title="Owner Management" breadcrumbs={[{label:'Admin',to:'/admin/dashboard'},{label:'Owners'}]}/>
      <div className="flex gap-2 mb-6"><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search owners..." className="input-field max-w-xs"/><button onClick={fetch} className="btn-primary">Search</button></div>
      <div className="card overflow-hidden"><div className="overflow-x-auto"><table className="w-full text-sm">
        <thead><tr className="bg-gray-50 border-b text-left text-xs font-semibold text-slate-500 uppercase"><th className="px-4 py-3">Name</th><th className="px-4 py-3">Email</th><th className="px-4 py-3">Cars</th><th className="px-4 py-3">Earnings</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Actions</th></tr></thead>
        <tbody>{owners.map(o=>(
          <tr key={o._id} className="border-b border-gray-50 hover:bg-gray-50/50">
            <td className="px-4 py-3 font-medium">{o.name}</td><td className="px-4 py-3 text-slate-500">{o.email}</td>
            <td className="px-4 py-3">{o.totalCars||0}</td><td className="px-4 py-3 text-green-600 font-medium">₹{o.totalEarnings||0}</td>
            <td className="px-4 py-3"><StatusBadge status={o.isSuspended?'suspended':'active'}/></td>
            <td className="px-4 py-3"><div className="flex gap-1"><button onClick={()=>toggleSuspend(o._id)} className={`text-xs px-2 py-1 rounded font-medium ${o.isSuspended?'bg-green-50 text-green-700':'bg-amber-50 text-amber-700'}`}>{o.isSuspended?'Unsuspend':'Suspend'}</button><button onClick={()=>del(o._id)} className="text-xs px-2 py-1 rounded font-medium bg-red-50 text-red-700">Delete</button></div></td>
          </tr>
        ))}</tbody>
      </table></div></div>
    </div>
  );
};
export default AdminOwners;
