import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useDropzone } from 'react-dropzone';
import { FaCar } from 'react-icons/fa';
import { HiUpload, HiX } from 'react-icons/hi';
import api from '../../lib/axios';
import toast from 'react-hot-toast';

const OwnerApply = () => {
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);
  const [licenseFile, setLicenseFile] = useState(null);
  const [govtFile, setGovtFile] = useState(null);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    if (!licenseFile || !govtFile) { toast.error('Please upload both documents'); return; }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('name', data.name);
      fd.append('email', data.email);
      fd.append('phone', data.phone);
      fd.append('password', data.password);
      fd.append('licenseImage', licenseFile);
      fd.append('govtIdImage', govtFile);
      await api.post('/owner/request', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Application submitted! We will review it shortly.');
      nav('/');
    } catch (e) { toast.error(e.response?.data?.message || 'Submission failed'); }
    finally { setLoading(false); }
  };

  const DropArea = ({ label, file, setFile }) => {
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
      accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] }, maxFiles: 1, maxSize: 5*1024*1024,
      onDrop: (f) => { if (f[0]) setFile(f[0]); },
    });
    return (
      <div>
        <label className="input-label">{label}</label>
        <div {...getRootProps()} className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${isDragActive?'border-primary-500 bg-primary-50':'border-gray-300 hover:border-primary-400'}`}>
          <input {...getInputProps()} />
          {file ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img src={URL.createObjectURL(file)} alt="" className="w-16 h-16 object-cover rounded-lg" />
                <span className="text-sm text-slate-700">{file.name}</span>
              </div>
              <button type="button" onClick={(e)=>{e.stopPropagation();setFile(null);}} className="p-1 hover:bg-red-50 rounded"><HiX className="text-red-500"/></button>
            </div>
          ) : (
            <div><HiUpload className="text-3xl text-slate-300 mx-auto mb-2"/><p className="text-sm text-slate-500">Drag & drop or click to upload</p><p className="text-xs text-slate-400 mt-1">JPG, PNG, WebP (max 5MB)</p></div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-10 px-4">
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto bg-gradient-to-br from-primary-700 to-primary-500 rounded-2xl flex items-center justify-center mb-4"><FaCar className="text-white text-2xl"/></div>
          <h1 className="text-2xl font-bold text-slate-800">Become a Car Owner</h1>
          <p className="text-slate-500 mt-1">Submit your application and start earning</p>
        </div>
        <div className="card p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div><label className="input-label">Full Name</label><input {...register('name',{required:'Required'})} className="input-field"/>{errors.name&&<p className="input-error">{errors.name.message}</p>}</div>
            <div><label className="input-label">Email</label><input type="email" {...register('email',{required:'Required'})} className="input-field"/>{errors.email&&<p className="input-error">{errors.email.message}</p>}</div>
            <div><label className="input-label">Phone</label><input type="tel" {...register('phone',{required:'Required'})} className="input-field"/>{errors.phone&&<p className="input-error">{errors.phone.message}</p>}</div>
            <div><label className="input-label">Password</label><input type="password" {...register('password',{required:'Required',minLength:{value:6,message:'Min 6 chars'}})} className="input-field"/>{errors.password&&<p className="input-error">{errors.password.message}</p>}</div>
            <DropArea label="Driving License Image" file={licenseFile} setFile={setLicenseFile}/>
            <DropArea label="Government ID Image" file={govtFile} setFile={setGovtFile}/>
            <button type="submit" disabled={loading} className="btn-primary w-full !py-3">{loading?'Submitting...':'Submit Application'}</button>
          </form>
        </div>
      </div>
    </div>
  );
};
export default OwnerApply;
