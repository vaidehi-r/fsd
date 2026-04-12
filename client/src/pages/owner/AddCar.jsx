import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useDropzone } from 'react-dropzone';
import { HiUpload, HiX } from 'react-icons/hi';
import api from '../../lib/axios';
import PageHeader from '../../components/PageHeader';
import toast from 'react-hot-toast';

const AddCar = () => {
  const nav = useNavigate();
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {'image/*':['.jpg','.jpeg','.png','.webp']}, maxFiles:8, maxSize:5*1024*1024,
    onDrop: (files) => { if(images.length+files.length>8){toast.error('Max 8 images');return;} setImages(p=>[...p,...files]); },
  });

  const removeImage = (idx) => setImages(p=>p.filter((_,i)=>i!==idx));

  const onSubmit = async (data) => {
    if(images.length===0){toast.error('Add at least one image');return;}
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(data).forEach(([k,v])=>fd.append(k,v));
      images.forEach(img=>fd.append('images',img));
      await api.post('/cars', fd, {headers:{'Content-Type':'multipart/form-data'}});
      toast.success('Car listed!');
      nav('/owner/cars');
    } catch(e) {toast.error(e.response?.data?.message||'Failed');}
    finally {setLoading(false);}
  };

  const categories=['SUV','Sedan','Hatchback','Luxury','EV','Truck'];
  const fuelTypes=['Petrol','Diesel','Electric','Hybrid'];

  return (
    <div className="pt-20 page-container">
      <PageHeader title="Add New Car" breadcrumbs={[{label:'Dashboard',to:'/owner/dashboard'},{label:'Cars',to:'/owner/cars'},{label:'Add New'}]}/>
      <div className="card p-6 max-w-3xl">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="input-label">Title</label><input {...register('title',{required:'Required'})} className="input-field" placeholder="e.g. 2024 Tesla Model S"/>{errors.title&&<p className="input-error">{errors.title.message}</p>}</div>
            <div><label className="input-label">Brand</label><input {...register('brand',{required:'Required'})} className="input-field" placeholder="e.g. Tesla"/></div>
            <div><label className="input-label">Model</label><input {...register('model',{required:'Required'})} className="input-field" placeholder="e.g. Model S"/></div>
            <div><label className="input-label">Year</label><input type="number" {...register('year',{required:'Required'})} className="input-field" placeholder="2024"/></div>
            <div><label className="input-label">Category</label><select {...register('category',{required:'Required'})} className="input-field"><option value="">Select</option>{categories.map(c=><option key={c} value={c}>{c}</option>)}</select></div>
            <div><label className="input-label">Fuel Type</label><select {...register('fuelType',{required:'Required'})} className="input-field"><option value="">Select</option>{fuelTypes.map(f=><option key={f} value={f}>{f}</option>)}</select></div>
            <div><label className="input-label">Transmission</label><select {...register('transmission',{required:'Required'})} className="input-field"><option value="">Select</option><option value="Manual">Manual</option><option value="Automatic">Automatic</option></select></div>
            <div><label className="input-label">Seats</label><input type="number" {...register('seats',{required:'Required'})} className="input-field" placeholder="5"/></div>
            <div><label className="input-label">Price Per Day ($)</label><input type="number" step="0.01" {...register('pricePerDay',{required:'Required'})} className="input-field" placeholder="50"/></div>
            <div><label className="input-label">Weekend Price ($)</label><input type="number" step="0.01" {...register('weekendPricePerDay',{required:'Required'})} className="input-field" placeholder="65"/></div>
            <div><label className="input-label">Damage Deposit ($)</label><input type="number" step="0.01" {...register('damageDeposit')} className="input-field" placeholder="0 (optional)"/></div>
            <div><label className="input-label">Location</label><input {...register('location',{required:'Required'})} className="input-field" placeholder="San Francisco, CA"/></div>
          </div>
          <div><label className="input-label">Description</label><textarea {...register('description',{required:'Required'})} className="input-field" rows={4} placeholder="Describe your car..."/></div>

          {/* Image upload */}
          <div>
            <label className="input-label">Images (up to 8)</label>
            <div {...getRootProps()} className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${isDragActive?'border-primary-500 bg-primary-50':'border-gray-300 hover:border-primary-400'}`}>
              <input {...getInputProps()}/>
              <HiUpload className="text-3xl text-slate-300 mx-auto mb-2"/><p className="text-sm text-slate-500">Drag & drop or click to upload images</p>
            </div>
            {images.length>0 && (
              <div className="flex gap-2 mt-3 flex-wrap">
                {images.map((img,i)=>(
                  <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden group">
                    <img src={URL.createObjectURL(img)} alt="" className="w-full h-full object-cover"/>
                    <button type="button" onClick={()=>removeImage(i)} className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><HiX className="text-xs"/></button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <button type="submit" disabled={loading} className="btn-primary !py-3 w-full md:w-auto">{loading?'Listing...':'List Car'}</button>
        </form>
      </div>
    </div>
  );
};
export default AddCar;
