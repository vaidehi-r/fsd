import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { HiSearch, HiFilter, HiX } from 'react-icons/hi';
import api from '../../lib/axios';
import CarCard from '../../components/CarCard';
import { CardSkeleton } from '../../components/Skeleton';
import useAuthStore from '../../stores/authStore';
import toast from 'react-hot-toast';

const CarListing = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated } = useAuthStore();
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [wishlist, setWishlist] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    keyword: searchParams.get('keyword') || '',
    category: searchParams.get('category') || '',
    fuelType: searchParams.get('fuelType') || '',
    transmission: searchParams.get('transmission') || '',
    seats: searchParams.get('seats') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    location: searchParams.get('location') || '',
    sort: searchParams.get('sort') || 'newest',
    page: parseInt(searchParams.get('page')) || 1,
  });

  useEffect(() => {
    fetchCars();
    if (isAuthenticated) fetchWishlist();
  }, [filters.page, filters.sort]);

  const fetchCars = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, val]) => {
        if (val) params.set(key, val);
      });
      const res = await api.get(`/cars?${params.toString()}`);
      setCars(res.data.cars);
      setTotal(res.data.total);
      setPages(res.data.pages);
    } catch (error) {
      toast.error('Failed to load cars');
    } finally {
      setLoading(false);
    }
  };

  const fetchWishlist = async () => {
    try {
      const res = await api.get('/wishlist');
      setWishlist(res.data.wishlist.map((c) => c._id));
    } catch (error) {
      // Not logged in or error
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setFilters((prev) => ({ ...prev, page: 1 }));
    fetchCars();
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({
      keyword: '', category: '', fuelType: '', transmission: '',
      seats: '', minPrice: '', maxPrice: '', location: '',
      sort: 'newest', page: 1,
    });
    setTimeout(fetchCars, 0);
  };

  const toggleWishlist = async (carId) => {
    if (!isAuthenticated) {
      toast.error('Please login to save cars');
      return;
    }
    try {
      if (wishlist.includes(carId)) {
        await api.delete(`/wishlist/${carId}`);
        setWishlist((prev) => prev.filter((id) => id !== carId));
        toast.success('Removed from wishlist');
      } else {
        await api.post(`/wishlist/${carId}`);
        setWishlist((prev) => [...prev, carId]);
        toast.success('Added to wishlist');
      }
    } catch (error) {
      toast.error('Failed to update wishlist');
    }
  };

  const categories = ['SUV', 'Sedan', 'Hatchback', 'Luxury', 'EV', 'Truck'];
  const fuelTypes = ['Petrol', 'Diesel', 'Electric', 'Hybrid'];
  const transmissions = ['Manual', 'Automatic'];
  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
    { value: 'rating', label: 'Highest Rated' },
  ];

  const FilterSelect = ({ label, value, options, onChange }) => (
    <div>
      <label className="input-label">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="input-field">
        <option value="">All</option>
        {options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    </div>
  );

  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Browse Cars</h1>
            <p className="text-slate-500 mt-1">{total} cars available</p>
          </div>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1 md:w-72">
              <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" placeholder="Search cars, brands, locations..."
                value={filters.keyword}
                onChange={(e) => handleFilterChange('keyword', e.target.value)}
                className="input-field !pl-10"
              />
            </div>
            <button type="submit" className="btn-primary">Search</button>
            <button type="button" onClick={() => setShowFilters(!showFilters)}
              className="md:hidden p-2.5 rounded-lg border border-gray-300 hover:bg-gray-50">
              <HiFilter className="text-xl text-slate-600" />
            </button>
          </form>
        </div>

        <div className="flex gap-6">
          {/* Sidebar Filters */}
          <aside className={`${showFilters ? 'block' : 'hidden'} md:block w-full md:w-64 flex-shrink-0`}>
            <div className="card p-5 space-y-5 sticky top-24">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-800">Filters</h3>
                <button onClick={clearFilters} className="text-xs text-primary-600 hover:text-primary-800 font-medium">
                  Clear All
                </button>
              </div>

              <FilterSelect label="Category" value={filters.category} options={categories}
                onChange={(val) => handleFilterChange('category', val)} />
              <FilterSelect label="Fuel Type" value={filters.fuelType} options={fuelTypes}
                onChange={(val) => handleFilterChange('fuelType', val)} />
              <FilterSelect label="Transmission" value={filters.transmission} options={transmissions}
                onChange={(val) => handleFilterChange('transmission', val)} />

              <div>
                <label className="input-label">Seats</label>
                <select value={filters.seats} onChange={(e) => handleFilterChange('seats', e.target.value)} className="input-field">
                  <option value="">Any</option>
                  {[2, 4, 5, 6, 7, 8].map((s) => <option key={s} value={s}>{s}+ seats</option>)}
                </select>
              </div>

              <div>
                <label className="input-label">Price Range</label>
                <div className="flex gap-2">
                  <input type="number" placeholder="Min" value={filters.minPrice}
                    onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                    className="input-field" />
                  <input type="number" placeholder="Max" value={filters.maxPrice}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                    className="input-field" />
                </div>
              </div>

              <div>
                <label className="input-label">Location</label>
                <input type="text" placeholder="City or area..." value={filters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                  className="input-field" />
              </div>

              <button onClick={fetchCars} className="btn-primary w-full">Apply Filters</button>
            </div>
          </aside>

          {/* Results */}
          <div className="flex-1">
            {/* Sort bar */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-slate-500">
                Showing {cars.length} of {total} results
              </p>
              <select value={filters.sort}
                onChange={(e) => setFilters((prev) => ({ ...prev, sort: e.target.value }))}
                className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-primary-500 outline-none">
                {sortOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Car grid */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => <CardSkeleton key={i} />)}
              </div>
            ) : cars.length === 0 ? (
              <div className="text-center py-20">
                <FaCar className="text-6xl text-gray-200 mx-auto mb-4" />
                <p className="text-lg text-slate-500">No cars found matching your filters.</p>
                <button onClick={clearFilters} className="mt-4 text-primary-600 font-medium">Clear all filters</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {cars.map((car) => (
                  <CarCard key={car._id} car={car}
                    isWishlisted={wishlist.includes(car._id)}
                    onWishlistToggle={toggleWishlist} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {pages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                {[...Array(pages)].map((_, i) => (
                  <button key={i} onClick={() => setFilters((prev) => ({ ...prev, page: i + 1 }))}
                    className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                      filters.page === i + 1 ? 'bg-primary-700 text-white' : 'bg-white text-slate-600 hover:bg-gray-50 border border-gray-200'
                    }`}>{i + 1}</button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Import for empty state
import { FaCar } from 'react-icons/fa';

export default CarListing;
