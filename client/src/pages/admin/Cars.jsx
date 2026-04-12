import { useState, useEffect } from 'react';
import api from '../../lib/axios';
import PageHeader from '../../components/PageHeader';
import toast from 'react-hot-toast';

const AdminCars = () => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{fetch();},[]);
  const fetch = async()=>{try{const r=await api.get('/cars?limit=50');setCars(r.data.cars);}catch(e){}finally{setLoading(false);}};
  const del = async(id)=>{if(!confirm('Delete this car?'))return;try{await api.delete(`/cars/${id}`);toast.success('Deleted');setCars(p=>p.filter(c=>c._id!==id));}catch(e){toast.error(e.response?.data?.message||'Failed');}};

  return (
    <div className="pt-20 page-container">
      <PageHeader title="Car Listings" breadcrumbs={[{label:'Admin',to:'/admin/dashboard'},{label:'Cars'}]}/>
      <div className="card overflow-hidden"><div className="overflow-x-auto"><table className="w-full text-sm">
        <thead><tr className="bg-gray-50 border-b text-left text-xs font-semibold text-slate-500 uppercase"><th className="px-4 py-3">Car</th><th className="px-4 py-3">Owner</th><th className="px-4 py-3">Category</th><th className="px-4 py-3">Price</th><th className="px-4 py-3">Rating</th><th className="px-4 py-3">Actions</th></tr></thead>
        <tbody>{cars.map(c=>(
          <tr key={c._id} className="border-b border-gray-50 hover:bg-gray-50/50">
            <td className="px-4 py-3"><div className="flex items-center gap-2">{c.images?.[0]?.url&&<img src={c.images[0].url} alt="" className="w-10 h-10 rounded object-cover"/>}<span className="font-medium">{c.title}</span></div></td>
            <td className="px-4 py-3">{c.owner?.name}</td><td className="px-4 py-3">{c.category}</td>
            <td className="px-4 py-3 font-medium">₹{c.pricePerDay}/day</td><td className="px-4 py-3">{c.averageRating?.toFixed(1)}</td>
            <td className="px-4 py-3"><button onClick={()=>del(c._id)} className="text-xs px-2 py-1 rounded font-medium bg-red-50 text-red-700">Delete</button></td>
          </tr>
        ))}</tbody>
      </table></div></div>
    </div>
  );
};
export default AdminCars;
