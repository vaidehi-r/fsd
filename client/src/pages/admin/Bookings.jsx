import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import api from '../../lib/axios';
import PageHeader from '../../components/PageHeader';
import StatusBadge from '../../components/StatusBadge';

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [refundStatus, setRefundStatus] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, [status, refundStatus, page]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      let url = `/admin/bookings?page=${page}`;
      if (status) url += `&status=${status}`;
      // In this app, we sort or filter refund on the client side since the API doesn't accept depositRefundStatus query yet
      const res = await api.get(url);
      
      let fetchedBookings = res.data.bookings;
      
      if (refundStatus) {
        fetchedBookings = fetchedBookings.filter(b => b.depositRefundStatus === refundStatus);
      }
      
      setBookings(fetchedBookings);
      setPages(res.data.pages);
    } catch (error) {
      toast.error('Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleRefundAction = async (id, action) => {
    if (!window.confirm(`Are you sure you want to ${action} this damage deposit refund?`)) return;
    
    setActionLoading(id);
    try {
      if (action === 'approve') {
        await api.put(`/admin/bookings/${id}/refund`);
        toast.success('Deposit refund processed successfully via Razorpay');
      } else {
        await api.put(`/admin/bookings/${id}/deny-refund`);
        toast.success('Deposit refund denied and notification sent');
      }
      fetchBookings();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Action failed');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="pt-20 page-container">
      <PageHeader title="All Bookings" breadcrumbs={[{label:'Admin',to:'/admin/dashboard'},{label:'Bookings'}]}/>
      
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex gap-2 overflow-x-auto pb-2 flex-grow">
          {['', 'pending', 'confirmed', 'ongoing', 'completed', 'cancelled'].map(s => (
            <button 
              key={s} 
              onClick={() => { setStatus(s); setPage(1); }} 
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap capitalize ${status === s ? 'bg-primary-700 text-white' : 'bg-white border border-gray-200 hover:bg-gray-50'}`}
            >
              {s || 'All Statuses'}
            </button>
          ))}
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={() => { setRefundStatus(''); setPage(1); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${refundStatus === '' ? 'bg-slate-800 text-white' : 'bg-white border border-slate-200'}`}
          >
            All Deposits
          </button>
          <button 
            onClick={() => { setRefundStatus('pending'); setPage(1); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${refundStatus === 'pending' ? 'bg-amber-500 text-white' : 'bg-white border border-slate-200'}`}
          >
            Pending Refunds
          </button>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b text-left text-xs font-semibold text-slate-500 uppercase">
                <th className="px-4 py-3">Car</th>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Owner</th>
                <th className="px-4 py-3">Dates</th>
                <th className="px-4 py-3">Deposit</th>
                <th className="px-4 py-3">Refund Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                    {loading ? 'Loading...' : 'No bookings found'}
                  </td>
                </tr>
              ) : bookings.map(b => (
                <tr key={b._id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="px-4 py-3 font-medium text-slate-800">{b.car?.title}</td>
                  <td className="px-4 py-3 text-slate-600">{b.user?.name}</td>
                  <td className="px-4 py-3 text-slate-600">{b.owner?.name}</td>
                  <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                    {format(new Date(b.startDate), 'MMM d, yyyy')} <br/> 
                    {format(new Date(b.endDate), 'MMM d, yyyy')}
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-semibold text-slate-800">₹{b.damageDeposit || 0}</span>
                  </td>
                  <td className="px-4 py-3">
                     {b.depositRefundStatus === 'pending' ? (
                       <span className="px-2 py-1 bg-amber-100 text-amber-800 text-xs font-medium rounded-full">Pending</span>
                     ) : b.depositRefundStatus === 'approved' ? (
                       <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">Refunded</span>
                     ) : b.depositRefundStatus === 'rejected' ? (
                       <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">Denied</span>
                     ) : (
                       <span className="text-gray-400 text-xs">—</span>
                     )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {b.depositRefundStatus === 'pending' && (
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleRefundAction(b._id, 'approve')}
                          disabled={actionLoading === b._id}
                          className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded-md transition-colors disabled:opacity-50"
                        >
                          Approve
                        </button>
                        <button 
                          onClick={() => handleRefundAction(b._id, 'deny')}
                          disabled={actionLoading === b._id}
                          className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 text-xs font-medium rounded-md transition-colors disabled:opacity-50"
                        >
                          Deny
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {pages > 1 && !refundStatus && (
        <div className="flex justify-center gap-2 mt-4">
          {[...Array(pages)].map((_, i) => (
            <button 
              key={i} 
              onClick={() => setPage(i + 1)} 
              className={`w-8 h-8 rounded-lg text-sm ${page === i + 1 ? 'bg-primary-700 text-white' : 'bg-white border text-slate-600 hover:bg-gray-50'}`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
export default AdminBookings;
