import { useState, useEffect } from 'react';
import api from '../../lib/axios';
import PageHeader from '../../components/PageHeader';
import StatusBadge from '../../components/StatusBadge';
import toast from 'react-hot-toast';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  useEffect(() => { fetch(); }, [page]);
  const fetch = async () => { setLoading(true); try { const r = await api.get(`/admin/users?page=${page}&limit=10${search?`&search=${search}`:''}`); setUsers(r.data.users); setPages(r.data.pages); } catch(e){} finally{setLoading(false);} };

  const toggleSuspend = async (id) => { try { await api.put(`/admin/users/${id}/suspend`); toast.success('Updated'); fetch(); } catch(e){toast.error('Failed');} };
  const deleteUser = async (id) => { if(!confirm('Delete this user?'))return; try{await api.delete(`/admin/users/${id}`);toast.success('Deleted');fetch();}catch(e){toast.error('Failed');} };

  return (
    <div className="pt-20 page-container">
      <PageHeader title="User Management" breadcrumbs={[{label:'Admin',to:'/admin/dashboard'},{label:'Users'}]}/>
      <div className="flex gap-2 mb-6"><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search users..." className="input-field max-w-xs"/><button onClick={fetch} className="btn-primary">Search</button></div>
      <div className="card overflow-hidden"><div className="overflow-x-auto"><table className="w-full text-sm">
        <thead><tr className="bg-gray-50 border-b text-left text-xs font-semibold text-slate-500 uppercase"><th className="px-4 py-3">Name</th><th className="px-4 py-3">Email</th><th className="px-4 py-3">Phone</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Actions</th></tr></thead>
        <tbody>{users.map(u=>(
          <tr key={u._id} className="border-b border-gray-50 hover:bg-gray-50/50">
            <td className="px-4 py-3 font-medium">{u.name}</td><td className="px-4 py-3 text-slate-500">{u.email}</td><td className="px-4 py-3">{u.phone}</td>
            <td className="px-4 py-3"><StatusBadge status={u.isSuspended?'suspended':'active'}/></td>
            <td className="px-4 py-3"><div className="flex gap-1"><button onClick={()=>toggleSuspend(u._id)} className={`text-xs px-2 py-1 rounded font-medium ${u.isSuspended?'bg-green-50 text-green-700':'bg-amber-50 text-amber-700'}`}>{u.isSuspended?'Unsuspend':'Suspend'}</button><button onClick={()=>deleteUser(u._id)} className="text-xs px-2 py-1 rounded font-medium bg-red-50 text-red-700">Delete</button></div></td>
          </tr>
        ))}</tbody>
      </table></div></div>
      {pages>1&&<div className="flex justify-center gap-2 mt-4">{[...Array(pages)].map((_,i)=><button key={i} onClick={()=>setPage(i+1)} className={`w-8 h-8 rounded-lg text-sm ${page===i+1?'bg-primary-700 text-white':'bg-white border'}`}>{i+1}</button>)}</div>}
    </div>
  );
};
export default AdminUsers;
