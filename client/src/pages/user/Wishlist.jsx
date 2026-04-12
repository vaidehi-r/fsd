import { useState, useEffect } from 'react';
import api from '../../lib/axios';
import CarCard from '../../components/CarCard';
import PageHeader from '../../components/PageHeader';
import { CardSkeleton } from '../../components/Skeleton';
import { HiHeart } from 'react-icons/hi';
import toast from 'react-hot-toast';

const Wishlist = () => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchWishlist(); }, []);

  const fetchWishlist = async () => {
    try {
      const res = await api.get('/wishlist');
      setCars(res.data.wishlist);
    } catch (e) { toast.error('Failed to load wishlist'); }
    finally { setLoading(false); }
  };

  const removeFromWishlist = async (carId) => {
    try {
      await api.delete(`/wishlist/${carId}`);
      setCars(prev => prev.filter(c => c._id !== carId));
      toast.success('Removed from wishlist');
    } catch (e) { toast.error('Failed to remove'); }
  };

  return (
    <div className="pt-20 page-container">
      <PageHeader title="My Wishlist" breadcrumbs={[{ label: 'Dashboard', to: '/dashboard' }, { label: 'Wishlist' }]} />
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">{[...Array(3)].map((_,i) => <CardSkeleton key={i} />)}</div>
      ) : cars.length === 0 ? (
        <div className="card p-16 text-center"><HiHeart className="text-5xl text-gray-200 mx-auto mb-3" /><p className="text-slate-400">Your wishlist is empty</p></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {cars.map(car => <CarCard key={car._id} car={car} isWishlisted onWishlistToggle={removeFromWishlist} />)}
        </div>
      )}
    </div>
  );
};
export default Wishlist;
