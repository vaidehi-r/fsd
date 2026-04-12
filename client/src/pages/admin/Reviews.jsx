import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import api from '../../lib/axios';
import PageHeader from '../../components/PageHeader';
import StarRating from '../../components/StarRating';
import toast from 'react-hot-toast';

const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  useEffect(()=>{fetch();},[page]);
  const fetch = async()=>{setLoading(true);try{const r=await api.get(`/admin/reviews?page=${page}`);setReviews(r.data.reviews);setPages(r.data.pages);}catch(e){}finally{setLoading(false);}};
  const del = async(id)=>{if(!confirm('Delete this review?'))return;try{await api.delete(`/reviews/${id}`);toast.success('Deleted');fetch();}catch(e){toast.error('Failed');}};

  return (
    <div className="pt-20 page-container">
      <PageHeader title="Review Management" breadcrumbs={[{label:'Admin',to:'/admin/dashboard'},{label:'Reviews'}]}/>
      <div className="space-y-3">{reviews.map(r=>(
        <div key={r._id} className="card p-4 flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1"><span className="font-medium text-sm">{r.user?.name}</span><span className="text-xs text-slate-400">on {r.car?.title}</span></div>
            <StarRating rating={r.rating} size={14}/><p className="text-sm text-slate-600 mt-1">{r.comment}</p>
            {r.ownerReply&&<p className="text-xs text-primary-600 mt-1 italic">Owner reply: {r.ownerReply}</p>}
            <p className="text-xs text-slate-400 mt-1">{format(new Date(r.createdAt),'MMM d, yyyy')}</p>
          </div>
          <button onClick={()=>del(r._id)} className="text-xs px-2 py-1 rounded font-medium bg-red-50 text-red-700">Delete</button>
        </div>
      ))}</div>
      {pages>1&&<div className="flex justify-center gap-2 mt-4">{[...Array(pages)].map((_,i)=><button key={i} onClick={()=>setPage(i+1)} className={`w-8 h-8 rounded-lg text-sm ${page===i+1?'bg-primary-700 text-white':'bg-white border'}`}>{i+1}</button>)}</div>}
    </div>
  );
};
export default AdminReviews;
