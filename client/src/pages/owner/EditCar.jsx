import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import api from '../../lib/axios';
import PageHeader from '../../components/PageHeader';
import toast from 'react-hot-toast';

const EditCar = () => {
  const { id } = useParams();
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    const fetch = async () => { try { const res = await api.get(`/cars/${id}`); reset(res.data.car); } catch(e){nav('/owner/cars');} finally{setFetching(false);} };
    fetch();
  }, [id]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const update = { title:data.title, brand:data.brand, model:data.model, year:data.year, category:data.category,
        fuelType:data.fuelType, transmission:data.transmission, seats:data.seats, pricePerDay:data.pricePerDay,
        weekendPricePerDay:data.weekendPricePerDay, damageDeposit:data.damageDeposit, location:data.location, description:data.description };
      await api.put(`/cars/${id}`, update);
      toast.success('Car updated');
      nav('/owner/cars');
    } catch(e) {toast.error('Failed');}
    finally {setLoading(false);}
  };

  if (fetching) return <div className="pt-20 page-container flex justify-center py-20"><div className="w-8 h-8 border-4 border-primary-200 border-t-primary-700 rounded-full animate-spin"/></div>;

  const categories=['SUV','Sedan','Hatchback','Luxury','EV','Truck'];
  const fuelTypes=['Petrol','Diesel','Electric','Hybrid'];

  return (
    <div className="pt-20 page-container">
      <PageHeader title="Edit Car" breadcrumbs={[{label:'Dashboard',to:'/owner/dashboard'},{label:'Cars',to:'/owner/cars'},{label:'Edit'}]}/>
      <div className="card p-6 max-w-3xl">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="input-label">Title</label><input {...register('title')} className="input-field"/></div>
            <div><label className="input-label">Brand</label><input {...register('brand')} className="input-field"/></div>
            <div><label className="input-label">Model</label><input {...register('model')} className="input-field"/></div>
            <div><label className="input-label">Year</label><input type="number" {...register('year')} className="input-field"/></div>
            <div><label className="input-label">Category</label><select {...register('category')} className="input-field">{categories.map(c=><option key={c} value={c}>{c}</option>)}</select></div>
            <div><label className="input-label">Fuel Type</label><select {...register('fuelType')} className="input-field">{fuelTypes.map(f=><option key={f} value={f}>{f}</option>)}</select></div>
            <div><label className="input-label">Transmission</label><select {...register('transmission')} className="input-field"><option value="Manual">Manual</option><option value="Automatic">Automatic</option></select></div>
            <div><label className="input-label">Seats</label><input type="number" {...register('seats')} className="input-field"/></div>
            <div><label className="input-label">Price/Day ($)</label><input type="number" step="0.01" {...register('pricePerDay')} className="input-field"/></div>
            <div><label className="input-label">Weekend Price ($)</label><input type="number" step="0.01" {...register('weekendPricePerDay')} className="input-field"/></div>
            <div><label className="input-label">Deposit ($)</label><input type="number" step="0.01" {...register('damageDeposit')} className="input-field"/></div>
            <div><label className="input-label">Location</label><input {...register('location')} className="input-field"/></div>
          </div>
          <div><label className="input-label">Description</label><textarea {...register('description')} className="input-field" rows={4}/></div>
          <button type="submit" disabled={loading} className="btn-primary">{loading?'Saving...':'Save Changes'}</button>
        </form>
      </div>
    </div>
  );
};
export default EditCar;
