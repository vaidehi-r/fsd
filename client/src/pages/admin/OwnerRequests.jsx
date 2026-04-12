import { useState, useEffect } from 'react';
import api from '../../lib/axios';
import PageHeader from '../../components/PageHeader';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/Modal';
import toast from 'react-hot-toast';

const OwnerRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewModal, setViewModal] = useState({open:false,req:null});
  const [rejectModal, setRejectModal] = useState({open:false,id:null});
  const [reason, setReason] = useState('');

  useEffect(()=>{fetch();},[]);
  const fetch = async()=>{try{const r=await api.get('/admin/owner-requests');setRequests(r.data.requests);}catch(e){}finally{setLoading(false);}};

  const approve = async(id)=>{try{await api.put(`/admin/owner-requests/${id}/approve`);toast.success('Approved');fetch();}catch(e){toast.error('Failed');}};
  const reject = async()=>{try{await api.put(`/admin/owner-requests/${rejectModal.id}/reject`,{reason});toast.success('Rejected');setRejectModal({open:false,id:null});setReason('');fetch();}catch(e){toast.error('Failed');}};

  return (
    <div className="pt-20 page-container">
      <PageHeader title="Owner Requests" breadcrumbs={[{label:'Admin',to:'/admin/dashboard'},{label:'Requests'}]}/>
      <div className="card overflow-hidden"><div className="overflow-x-auto"><table className="w-full text-sm">
        <thead><tr className="bg-gray-50 border-b text-left text-xs font-semibold text-slate-500 uppercase"><th className="px-4 py-3">Name</th><th className="px-4 py-3">Email</th><th className="px-4 py-3">Phone</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Docs</th><th className="px-4 py-3">Actions</th></tr></thead>
        <tbody>{requests.map(r=>(
          <tr key={r._id} className="border-b border-gray-50">
            <td className="px-4 py-3 font-medium">{r.name}</td><td className="px-4 py-3">{r.email}</td><td className="px-4 py-3">{r.phone}</td>
            <td className="px-4 py-3"><StatusBadge status={r.status}/></td>
            <td className="px-4 py-3"><button onClick={()=>setViewModal({open:true,req:r})} className="text-xs text-primary-600 font-medium">View Docs</button></td>
            <td className="px-4 py-3">{r.status==='pending'&&<div className="flex gap-1"><button onClick={()=>approve(r._id)} className="text-xs btn-success !py-1 !px-2">Approve</button><button onClick={()=>setRejectModal({open:true,id:r._id})} className="text-xs btn-danger !py-1 !px-2">Reject</button></div>}</td>
          </tr>
        ))}</tbody>
      </table></div></div>

      {/* Document Viewer Modal */}
      <Modal isOpen={viewModal.open} onClose={()=>setViewModal({open:false,req:null})} title="Documents" size="xl">
        {viewModal.req&&<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><p className="text-sm font-medium mb-2">Driving License</p><img src={viewModal.req.licenseImage?.url} alt="License" className="w-full rounded-lg border"/></div>
          <div><p className="text-sm font-medium mb-2">Government ID</p><img src={viewModal.req.govtIdImage?.url} alt="Govt ID" className="w-full rounded-lg border"/></div>
        </div>}
      </Modal>

      {/* Reject Modal */}
      <Modal isOpen={rejectModal.open} onClose={()=>setRejectModal({open:false,id:null})} title="Reject Request"
        footer={<><button onClick={()=>setRejectModal({open:false,id:null})} className="btn-secondary">Cancel</button><button onClick={reject} className="btn-danger">Reject</button></>}>
        <textarea value={reason} onChange={e=>setReason(e.target.value)} className="input-field" rows={3} placeholder="Reason for rejection..."/>
      </Modal>
    </div>
  );
};
export default OwnerRequests;
