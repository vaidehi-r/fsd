import { useState, useEffect } from 'react';
import api from '../../lib/axios';
import BookingCard from '../../components/BookingCard';
import PageHeader from '../../components/PageHeader';
import toast from 'react-hot-toast';

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  useEffect(() => { fetchBookings(); }, [status, page]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/bookings/my?page=${page}&limit=10${status?`&status=${status}`:''}`);
      setBookings(res.data.bookings);
      setPages(res.data.pages);
    } catch (e) { toast.error('Failed to load bookings'); }
    finally { setLoading(false); }
  };

  const handleCancel = async (id) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await api.put(`/bookings/${id}/cancel`);
      toast.success('Booking cancelled');
      fetchBookings();
    } catch (e) { toast.error(e.response?.data?.message || 'Cancel failed'); }
  };

  const statuses = ['', 'pending', 'confirmed', 'ongoing', 'completed', 'cancelled'];

  return (
    <div className="pt-20 page-container">
      <PageHeader title="My Bookings" breadcrumbs={[{ label: 'Dashboard', to: '/dashboard' }, { label: 'Bookings' }]} />

      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {statuses.map(s => (
          <button key={s} onClick={() => { setStatus(s); setPage(1); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${status===s?'bg-primary-700 text-white':'bg-white text-slate-600 border border-gray-200 hover:bg-gray-50'}`}>
            {s || 'All'}
          </button>
        ))}
      </div>

      {loading ? <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-primary-200 border-t-primary-700 rounded-full animate-spin"/></div> :
        bookings.length === 0 ? <div className="card p-12 text-center text-slate-400">No bookings found.</div> :
        <div className="space-y-3">{bookings.map(b => <BookingCard key={b._id} booking={b} />)}</div>
      }

      {pages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {[...Array(pages)].map((_,i) => (
            <button key={i} onClick={() => setPage(i+1)}
              className={`w-10 h-10 rounded-lg text-sm font-medium ${page===i+1?'bg-primary-700 text-white':'bg-white border border-gray-200'}`}>{i+1}</button>
          ))}
        </div>
      )}
    </div>
  );
};
export default Bookings;
