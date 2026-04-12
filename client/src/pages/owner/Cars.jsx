import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HiPlus, HiPencil, HiTrash, HiStar } from 'react-icons/hi';
import api from '../../lib/axios';
import PageHeader from '../../components/PageHeader';
import StatusBadge from '../../components/StatusBadge';
import toast from 'react-hot-toast';

const OwnerCars = () => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchCars(); }, []);
  const fetchCars = async () => { try { const res = await api.get('/owner/cars'); setCars(res.data.cars); } catch(e){} finally { setLoading(false); } };

  const handleDelete = async (id,title) => {
    if (!confirm(`Delete "${title}"?`)) return;
    try { await api.delete(`/cars/${id}`); setCars(p=>p.filter(c=>c._id!==id)); toast.success('Car deleted'); } catch(e) { toast.error(e.response?.data?.message||'Failed'); }
  };

  const toggleAvailability = async (id, current) => {
    try { await api.put(`/cars/${id}`, { isAvailable: !current }); setCars(p=>p.map(c=>c._id===id?{...c,isAvailable:!current}:c)); toast.success('Updated'); } catch(e) { toast.error('Failed'); }
  };

  return (
    <div className="pt-20 page-container">
      <PageHeader title="My Cars" breadcrumbs={[{label:'Dashboard',to:'/owner/dashboard'},{label:'Cars'}]}
        actions={<Link to="/owner/cars/new" className="btn-primary flex items-center gap-2"><HiPlus/>Add Car</Link>}/>
      {loading ? <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-primary-200 border-t-primary-700 rounded-full animate-spin"/></div> :
       cars.length===0 ? <div className="card p-16 text-center text-slate-400">No cars listed yet.</div> :
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {cars.map(car=>(
           <div key={car._id} className="card overflow-hidden">
             <div className="h-40 bg-gray-100">{car.images?.[0]?.url && <img src={car.images[0].url} alt="" className="w-full h-full object-cover"/>}</div>
             <div className="p-4">
               <div className="flex items-start justify-between"><h3 className="font-semibold text-slate-800 truncate">{car.title}</h3><StatusBadge status={car.isAvailable?'active':'suspended'}/></div>
               <p className="text-sm text-slate-500 mt-1">{car.brand} {car.model} · {car.year}</p>
               <div className="flex items-center gap-3 mt-2 text-sm"><span className="font-bold text-primary-700">₹{car.pricePerDay}/day</span><span className="flex items-center gap-1 text-slate-500"><HiStar className="text-amber-400"/>{car.averageRating?.toFixed(1)}</span></div>
               <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                 <Link to={`/owner/cars/${car._id}/edit`} className="flex-1 btn-secondary text-sm text-center !py-1.5"><HiPencil className="inline mr-1"/>Edit</Link>
                 <button onClick={()=>toggleAvailability(car._id,car.isAvailable)} className="flex-1 text-sm py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 font-medium">{car.isAvailable?'Deactivate':'Activate'}</button>
                 <button onClick={()=>handleDelete(car._id,car.title)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50"><HiTrash/></button>
               </div>
             </div>
           </div>
         ))}
       </div>
      }
    </div>
  );
};
export default OwnerCars;
