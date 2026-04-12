import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import api from '../../lib/axios';
import PageHeader from '../../components/PageHeader';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/Modal';
import toast from 'react-hot-toast';

const OwnerBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [rejectModal, setRejectModal] = useState({ open: false, id: null });
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => { fetch(); }, [status, page]);

  const fetch = async () => {
    setLoading(true);
    try { const res = await api.get(`/owner/bookings?page=${page}&limit=10${status?`&status=${status}`:''}`); setBookings(res.data.bookings); setPages(res.data.pages); }
    catch(e){} finally{setLoading(false);}
  };

  const confirm = async (id) => {
    try { await api.put(`/owner/bookings/${id}/confirm`); toast.success('Confirmed'); fetch(); }
    catch(e) { toast.error(e.response?.data?.message||'Failed'); }
  };

  const reject = async () => {
    try { await api.put(`/owner/bookings/${rejectModal.id}/reject`,{reason:rejectReason}); toast.success('Rejected'); setRejectModal({open:false,id:null}); setRejectReason(''); fetch(); }
    catch(e) { toast.error('Failed'); }
  };

  const exportCSV = async () => {
    try {
      const res = await api.get('/owner/export-bookings', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a'); a.href = url; a.download = 'bookings.csv'; a.click();
      toast.success('Exported');
    } catch(e) { toast.error('Export failed'); }
  };

  return (
    <div className="pt-20 page-container">
      <PageHeader title="Bookings" breadcrumbs={[{label:'Dashboard',to:'/owner/dashboard'},{label:'Bookings'}]}
        actions={<button onClick={exportCSV} className="btn-secondary text-sm">Export CSV</button>}/>

      <div className="flex gap-2 mb-6 overflow-x-auto">
        {['','pending','confirmed','ongoing','completed','cancelled'].map(s=>(
          <button key={s} onClick={()=>{setStatus(s);setPage(1);}}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${status===s?'bg-primary-700 text-white':'bg-white text-slate-600 border border-gray-200'}`}>{s||'All'}</button>
        ))}
      </div>

      {loading ? <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-primary-200 border-t-primary-700 rounded-full animate-spin"/></div> :
       <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50 border-b text-left text-xs font-semibold text-slate-500 uppercase">
              <th className="px-4 py-3">Car</th><th className="px-4 py-3">Customer</th><th className="px-4 py-3">Dates</th><th className="px-4 py-3">Amount</th><th className="px-4 py-3">Status</th>
            </tr></thead>
            <tbody>
              {bookings.length===0 ? <tr><td colSpan={6} className="text-center py-8 text-slate-400">No bookings found.</td></tr> :
              bookings.map(b=>(
                <tr key={b._id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="px-4 py-3 font-medium text-slate-700">{b.car?.title}</td>
                  <td className="px-4 py-3"><p>{b.user?.name}</p><p className="text-xs text-slate-400">{b.user?.email}</p><p className="text-xs font-semibold text-primary-600 mt-0.5">{b.user?.phone}</p></td>
                  <td className="px-4 py-3 text-xs">{format(new Date(b.startDate),'MMM d')} - {format(new Date(b.endDate),'MMM d')}</td>
                  <td className="px-4 py-3 font-semibold text-primary-700">₹{b.totalAmount}</td>
                  <td className="px-4 py-3"><StatusBadge status={b.status}/></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
       </div>
      }

      <Modal isOpen={rejectModal.open} onClose={()=>setRejectModal({open:false,id:null})} title="Reject Booking"
        footer={<><button onClick={()=>setRejectModal({open:false,id:null})} className="btn-secondary">Cancel</button><button onClick={reject} className="btn-danger">Reject</button></>}>
        <label className="input-label">Reason for rejection</label>
        <textarea value={rejectReason} onChange={(e)=>setRejectReason(e.target.value)} className="input-field" rows={3} placeholder="Enter reason..."/>
      </Modal>
    </div>
  );
};
export default OwnerBookings;
