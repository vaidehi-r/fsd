import { useState, useEffect } from 'react';
import { HiCurrencyRupee, HiClipboardList, HiStar, HiTruck } from 'react-icons/hi';
import { BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import api from '../../lib/axios';
import StatsCard from '../../components/StatsCard';
import StatusBadge from '../../components/StatusBadge';
import PageHeader from '../../components/PageHeader';
import { DashboardSkeleton } from '../../components/Skeleton';
import { format } from 'date-fns';

const COLORS = ['#1D4ED8', '#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE'];

const OwnerDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchDashboard(); }, []);

  const fetchDashboard = async () => {
    try { const res = await api.get('/owner/dashboard'); setData(res.data); }
    catch (e) {}
    finally { setLoading(false); }
  };

  if (loading) return <div className="pt-20 page-container"><DashboardSkeleton/></div>;
  if (!data) return null;

  const { stats, monthlyRevenue, statusDistribution, topCars, recentBookings, dailyBookings } = data;
  const pieData = statusDistribution.map(s => ({ name: s._id, value: s.count }));
  const revenueData = monthlyRevenue.map(m => ({ month: m._id, revenue: m.revenue }));
  const dailyData = dailyBookings.map(d => ({ date: d._id.slice(5), bookings: d.count }));

  return (
    <div className="pt-20 page-container">
      <PageHeader title="Owner Dashboard" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <StatsCard icon={HiCurrencyRupee} label="Total Earnings" value={`₹${stats.totalEarnings}`} color="green" />
        <StatsCard icon={HiCurrencyRupee} label="This Month" value={`₹${stats.thisMonthEarnings}`} color="primary" />
        <StatsCard icon={HiClipboardList} label="Total Bookings" value={stats.totalBookings} color="blue" />
        <StatsCard icon={HiTruck} label="Active Cars" value={`${stats.activeCars}/${stats.totalCars}`} color="purple" />
        <StatsCard icon={HiStar} label="Avg Rating" value={stats.averageRating} color="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue Chart */}
        <div className="card p-6">
          <h3 className="font-semibold text-slate-800 mb-4">Monthly Revenue</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0"/>
              <XAxis dataKey="month" tick={{fontSize:12}} stroke="#64748B"/>
              <YAxis tick={{fontSize:12}} stroke="#64748B"/>
              <Tooltip contentStyle={{borderRadius:'8px',border:'none',boxShadow:'0 4px 12px rgba(0,0,0,0.1)'}}/>
              <Bar dataKey="revenue" fill="#1D4ED8" radius={[6,6,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Status Pie */}
        <div className="card p-6">
          <h3 className="font-semibold text-slate-800 mb-4">Booking Status</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" label={({name,percent})=>`${name} ${(percent*100).toFixed(0)}%`}>
                {pieData.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
              </Pie>
              <Tooltip/>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Daily Bookings */}
      {dailyData.length > 0 && (
        <div className="card p-6 mb-8">
          <h3 className="font-semibold text-slate-800 mb-4">Daily Bookings (This Month)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0"/>
              <XAxis dataKey="date" tick={{fontSize:11}} stroke="#64748B"/>
              <YAxis tick={{fontSize:11}} stroke="#64748B"/>
              <Tooltip/>
              <Area type="monotone" dataKey="bookings" stroke="#1D4ED8" fill="#DBEAFE" strokeWidth={2}/>
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Cars */}
        <div className="card p-6">
          <h3 className="font-semibold text-slate-800 mb-4">Top Performing Cars</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-left text-slate-500 border-b"><th className="pb-2">Car</th><th className="pb-2">Bookings</th><th className="pb-2">Earnings</th><th className="pb-2">Rating</th></tr></thead>
              <tbody>{topCars.map((c,i) => (
                <tr key={i} className="border-b border-gray-50"><td className="py-2.5 font-medium text-slate-700">{c.title}</td><td>{c.totalBookings}</td><td className="text-green-600 font-medium">₹{c.totalEarnings}</td><td><div className="flex items-center gap-1"><HiStar className="text-amber-400"/>{c.averageRating?.toFixed(1)}</div></td></tr>
              ))}</tbody>
            </table>
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="card p-6">
          <h3 className="font-semibold text-slate-800 mb-4">Recent Bookings</h3>
          <div className="space-y-3">
            {recentBookings.map(b => (
              <div key={b._id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div><p className="text-sm font-medium text-slate-700">{b.car?.title}</p><p className="text-xs text-slate-400">{b.user?.name} · {format(new Date(b.createdAt),'MMM d')}</p></div>
                <StatusBadge status={b.status}/>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
export default OwnerDashboard;
