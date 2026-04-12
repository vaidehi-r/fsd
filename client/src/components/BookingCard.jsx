import StatusBadge from './StatusBadge';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

const BookingCard = ({ booking, showActions, onCancel, role = 'user' }) => {
  const car = booking.car;
  const carImage = car?.images?.[0]?.url || 'https://via.placeholder.com/120x80?text=Car';

  return (
    <div className="card p-4 flex flex-col sm:flex-row gap-4 animate-fade-in">
      {/* Car image */}
      <div className="w-full sm:w-32 h-24 rounded-lg overflow-hidden flex-shrink-0">
        <img src={carImage} alt={car?.title} className="w-full h-full object-cover" />
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-semibold text-slate-800 truncate">{car?.title || 'Car'}</h3>
            <p className="text-sm text-slate-500 mt-0.5">
              {format(new Date(booking.startDate), 'MMM d, yyyy')} → {format(new Date(booking.endDate), 'MMM d, yyyy')}
            </p>
          </div>
          <StatusBadge status={booking.status} />
        </div>

        <div className="flex items-center gap-4 mt-2 text-sm">
          <span className="text-slate-500">{booking.totalDays} days</span>
          <span className="font-semibold text-primary-700">₹{booking.totalAmount}</span>
          <StatusBadge status={booking.paymentStatus} />
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex items-center gap-2 mt-3">
            <Link to={role === 'user' ? `/bookings/${booking._id}` : '#'}
              className="text-sm text-primary-600 hover:text-primary-800 font-medium">
              View Details
            </Link>
            {onCancel && ['pending', 'confirmed'].includes(booking.status) && (
              <button onClick={() => onCancel(booking._id)}
                className="text-sm text-red-600 hover:text-red-800 font-medium">
                Cancel
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingCard;
