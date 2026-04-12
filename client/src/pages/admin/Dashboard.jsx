import { useState, useEffect } from 'react';
import { HiUsers, HiTruck, HiClipboardList, HiCurrencyRupee, HiFlag, HiUserAdd } from 'react-icons/hi';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../../lib/axios';
import StatsCard from '../../components/StatsCard';
import StatusBadge from '../../components/StatusBadge';
import PageHeader from '../../components/PageHeader';
import { DashboardSkeleton } from '../../components/Skeleton';
import { format } from 'date-fns';

const COLORS = ['#1D4ED8','#3B82F6','#60A5FA','#93C5FD','#BFDBFE'];

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { const f = async () => { try { const r = await api.get('/admin/dashboard'); setData(r.data); } catch(e){} finally{setLoading(false);} }; f(); }, []);

  if (loading) return <div className="pt-20 page-container"><DashboardSkeleton/></div>;
  if (!data) return null;

  const { stats, monthlyRevenue, bookingStatus, dailyBookings, recentBookings, recentRequests } = data;
  const revenueData = monthlyRevenue.map(m=>({month:m._id,revenue:m.revenue}));
  const pieData = bookingStatus.map(s=>({name:s._id,value:s.count}));
  const dailyData = dailyBookings.map(d=>({date:d._id.slice(5),count:d.count}));

  return (
    <div className="pt-20 page-container">
      <PageHeader title="Admin Dashboard"/>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3 mb-8">
        <StatsCard icon={HiUsers} label="Users" value={stats.totalUsers} color="primary"/>
        <StatsCard icon={HiUserAdd} label="Owners" value={stats.totalOwners} color="purple"/>
        <StatsCard icon={HiTruck} label="Cars" value={stats.totalCars} color="blue"/>
        <StatsCard icon={HiClipboardList} label="Bookings" value={stats.totalBookings} color="amber"/>
        <StatsCard icon={HiCurrencyRupee} label="Revenue" value={`₹${stats.totalRevenue}`} color="green"/>
        <StatsCard icon={HiUserAdd} label="Pending" value={stats.pendingRequests} color="amber"/>
        <StatsCard icon={HiFlag} label="Reports" value={stats.pendingReports} color="red"/>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="card p-6"><h3 className="font-semibold mb-4">Monthly Revenue</h3>
          <ResponsiveContainer width="100%" height={280}><LineChart data={revenueData}><CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0"/><XAxis dataKey="month" tick={{fontSize:11}}/><YAxis tick={{fontSize:11}}/><Tooltip/><Line type="monotone" dataKey="revenue" stroke="#1D4ED8" strokeWidth={2} dot={{r:4}}/></LineChart></ResponsiveContainer>
        </div>
        <div className="card p-6"><h3 className="font-semibold mb-4">Booking Status</h3>
          <ResponsiveContainer width="100%" height={280}><PieChart><Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" label={({name,percent})=>`${name} ${(percent*100).toFixed(0)}%`}>{pieData.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}</Pie><Tooltip/></PieChart></ResponsiveContainer>
        </div>
      </div>

      {dailyData.length > 0 && <div className="card p-6 mb-8"><h3 className="font-semibold mb-4">Daily Active Bookings</h3><ResponsiveContainer width="100%" height={200}><AreaChart data={dailyData}><CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="date" tick={{fontSize:11}}/><YAxis/><Tooltip/><Area type="monotone" dataKey="count" stroke="#1D4ED8" fill="#DBEAFE"/></AreaChart></ResponsiveContainer></div>}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6"><h3 className="font-semibold mb-4">Recent Bookings</h3>
          {recentBookings.map(b=><div key={b._id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"><div><p className="text-sm font-medium">{b.car?.title}</p><p className="text-xs text-slate-400">{b.user?.name}·{format(new Date(b.createdAt),'MMM d')}</p></div><StatusBadge status={b.status}/></div>)}
        </div>
        <div className="card p-6"><h3 className="font-semibold mb-4">Recent Owner Requests</h3>
          {recentRequests.map(r=><div key={r._id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"><div><p className="text-sm font-medium">{r.name}</p><p className="text-xs text-slate-400">{r.email}</p></div><StatusBadge status={r.status}/></div>)}
        </div>
      </div>
    </div>
  );
};
export default AdminDashboard;
