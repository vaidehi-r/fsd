import { useState, useEffect } from 'react';
import { HiClipboardList, HiClock, HiCheckCircle, HiXCircle } from 'react-icons/hi';
import api from '../../lib/axios';
import StatsCard from '../../components/StatsCard';
import BookingCard from '../../components/BookingCard';
import PageHeader from '../../components/PageHeader';
import { DashboardSkeleton } from '../../components/Skeleton';
import useAuthStore from '../../stores/authStore';

const UserDashboard = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, completed: 0, cancelled: 0 });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await api.get('/bookings/my?limit=5');
      const all = res.data.bookings;
      setBookings(all);
      setStats({
        total: res.data.total,
        pending: all.filter(b => ['pending','confirmed'].includes(b.status)).length,
        completed: all.filter(b => b.status === 'completed').length,
        cancelled: all.filter(b => b.status === 'cancelled').length,
      });
    } catch (e) {}
    finally { setLoading(false); }
  };

  if (loading) return <div className="pt-20 page-container"><DashboardSkeleton /></div>;

  return (
    <div className="pt-20 page-container">
      <PageHeader title={`Welcome back, ${user?.name?.split(' ')[0]}!`} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard icon={HiClipboardList} label="Total Bookings" value={stats.total} color="primary" />
        <StatsCard icon={HiClock} label="Active" value={stats.pending} color="amber" />
        <StatsCard icon={HiCheckCircle} label="Completed" value={stats.completed} color="green" />
        <StatsCard icon={HiXCircle} label="Cancelled" value={stats.cancelled} color="red" />
      </div>

      <h2 className="text-lg font-semibold text-slate-800 mb-4">Recent Bookings</h2>
      {bookings.length === 0 ? (
        <div className="card p-12 text-center"><p className="text-slate-400">No bookings yet. Start by browsing cars!</p></div>
      ) : (
        <div className="space-y-3">
          {bookings.slice(0, 5).map(b => <BookingCard key={b._id} booking={b} showActions />)}
        </div>
      )}
    </div>
  );
};
export default UserDashboard;
