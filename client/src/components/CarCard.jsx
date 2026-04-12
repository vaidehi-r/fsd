import { Link } from 'react-router-dom';
import { HiLocationMarker, HiStar, HiHeart, HiOutlineHeart } from 'react-icons/hi';
import { BsFuelPump, BsGearFill } from 'react-icons/bs';
import { MdAirlineSeatReclineNormal } from 'react-icons/md';

const CarCard = ({ car, isWishlisted = false, onWishlistToggle, showWishlist = true }) => {
  const mainImage = car.images?.[0]?.url || 'https://via.placeholder.com/400x250?text=No+Image';

  return (
    <div className="card group overflow-hidden animate-fade-in">
      {/* Image container */}
      <div className="relative overflow-hidden h-48">
        <img
          src={mainImage}
          alt={car.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        {/* Category badge */}
        <span className="absolute top-3 left-3 px-2.5 py-1 bg-primary-700/90 text-white text-xs font-semibold rounded-lg backdrop-blur-sm">
          {car.category}
        </span>
        {/* Wishlist button */}
        {showWishlist && onWishlistToggle && (
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onWishlistToggle(car._id); }}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:scale-110 transition-all shadow-md"
          >
            {isWishlisted ? (
              <HiHeart className="text-red-500 text-lg" />
            ) : (
              <HiOutlineHeart className="text-slate-500 text-lg" />
            )}
          </button>
        )}
        {/* Price tag */}
        <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-md">
          <span className="text-primary-700 font-bold text-lg">₹{car.pricePerDay}</span>
          <span className="text-slate-500 text-xs">/day</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <Link to={`/cars/${car._id}`}>
          <h3 className="font-semibold text-slate-800 text-lg group-hover:text-primary-700 transition-colors line-clamp-1">
            {car.title}
          </h3>
        </Link>

        {/* Location & Rating */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-1 text-slate-500 text-sm">
            <HiLocationMarker className="text-primary-500" />
            <span className="truncate max-w-[150px]">{car.location}</span>
          </div>
          <div className="flex items-center gap-1">
            <HiStar className="text-amber-400" />
            <span className="text-sm font-medium text-slate-700">{car.averageRating?.toFixed(1) || '0.0'}</span>
            <span className="text-xs text-slate-400">({car.totalReviews || 0})</span>
          </div>
        </div>

        {/* Specs */}
        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <BsFuelPump className="text-primary-400" />
            <span>{car.fuelType}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <BsGearFill className="text-primary-400" />
            <span>{car.transmission}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <MdAirlineSeatReclineNormal className="text-primary-400" />
            <span>{car.seats} seats</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarCard;
