import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { HiLocationMarker, HiStar, HiCalendar, HiCurrencyRupee } from 'react-icons/hi';
import { BsFuelPump, BsGearFill, BsSpeedometer } from 'react-icons/bs';
import { MdAirlineSeatReclineNormal } from 'react-icons/md';
import { format } from 'date-fns';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import api from '../../lib/axios';
import ImageGallery from '../../components/ImageGallery';
import AvailabilityCalendar from '../../components/AvailabilityCalendar';
import ReviewCard from '../../components/ReviewCard';
import StarRating from '../../components/StarRating';
import useAuthStore from '../../stores/authStore';
import useSocketStore from '../../stores/socketStore';
import toast from 'react-hot-toast';

const CarDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const { socket } = useSocketStore();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookedDates, setBookedDates] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [priceBreakdown, setPriceBreakdown] = useState(null);
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    fetchCar();
    fetchBookedDates();
    fetchReviews();
  }, [id]);

  // Join car room for real-time reviews
  useEffect(() => {
    if (socket && id) {
      socket.emit('car:join', id);

      socket.on('review:new', (review) => {
        setReviews((prev) => [review, ...prev]);
      });

      socket.on('review:reply', (updatedReview) => {
        setReviews((prev) => prev.map((r) => r._id === updatedReview._id ? updatedReview : r));
      });

      return () => {
        socket.emit('car:leave', id);
        socket.off('review:new');
        socket.off('review:reply');
      };
    }
  }, [socket, id]);

  const fetchCar = async () => {
    try {
      const res = await api.get(`/cars/${id}`);
      setCar(res.data.car);
    } catch (error) {
      toast.error('Car not found');
      navigate('/cars');
    } finally {
      setLoading(false);
    }
  };

  const fetchBookedDates = async () => {
    try {
      const res = await api.get(`/cars/${id}/booked-dates`);
      setBookedDates(res.data.bookedDates);
    } catch (error) {}
  };

  const fetchReviews = async () => {
    try {
      const res = await api.get(`/reviews/car/${id}`);
      setReviews(res.data.reviews);
    } catch (error) {}
  };

  const hasOverlap = (start, end) => {
    if (!start || !end) return false;
    return bookedDates.some(booking => {
      const bStart = new Date(booking.start);
      const bEnd = new Date(booking.end);
      return start < bEnd && end > bStart;
    });
  };

  // Calculate price when dates change
  useEffect(() => {
    if (startDate && endDate && car) {
      if (endDate <= startDate) {
        setPriceBreakdown(null);
        return;
      }
      
      if (hasOverlap(startDate, endDate)) {
        toast.error('Selected time overlaps with an existing booking.', { id: 'booking-overlap' });
        setPriceBreakdown(null);
        return;
      }

      const diffInMs = endDate - startDate;
      const days = Math.max(1, Math.ceil(diffInMs / (1000 * 60 * 60 * 24)));

      let subtotal = 0;
      for (let i = 0; i < days; i++) {
        const current = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
        const day = current.getDay();
        const isWeekend = day === 0 || day === 6;
        subtotal += isWeekend ? car.weekendPricePerDay : car.pricePerDay;
      }

      const commission = Math.round(subtotal * 0.1 * 100) / 100;
      const total = subtotal + commission + (car.damageDeposit || 0);

      setPriceBreakdown({
        days,
        subtotal: Math.round(subtotal * 100) / 100,
        commission,
        deposit: car.damageDeposit || 0,
        total: Math.round(total * 100) / 100,
      });
    } else {
      setPriceBreakdown(null);
    }
  }, [startDate, endDate, car, bookedDates]);

  const handleBook = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to book');
      navigate('/login');
      return;
    }
    if (!startDate || !endDate) {
      toast.error('Please select dates');
      return;
    }

    setBooking(true);
    try {
      const res = await api.post('/bookings', {
        carId: car._id,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      });

      // Create Razorpay order
      const paymentRes = await api.post('/payments/create-order', {
        bookingId: res.data.booking._id,
      });

      // Navigate to booking detail with Razorpay order data
      navigate(`/bookings/${res.data.booking._id}`, {
        state: { orderData: paymentRes.data },
      });

      toast.success('Booking created! Proceed to payment.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Booking failed');
    } finally {
      setBooking(false);
    }
  };

  const isBookedTime = (time, isStart) => {
    // Basic date blocking for UI
    return false; // Time filtering for UI could be added, but handled by overlap toast validation mostly.
  };

  if (loading) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-700 rounded-full animate-spin" />
      </div>
    );
  }

  if (!car) return null;

  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left — Images + Details */}
          <div className="lg:col-span-2 space-y-6">
            <ImageGallery images={car.images} />

            {/* Car info */}
            <div className="card p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-slate-800">{car.title}</h1>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex items-center gap-1 text-slate-500">
                      <HiLocationMarker className="text-primary-500" />
                      <span className="text-sm">{car.location}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <HiStar className="text-amber-400" />
                      <span className="text-sm font-medium">{car.averageRating?.toFixed(1)}</span>
                      <span className="text-sm text-slate-400">({car.totalReviews} reviews)</span>
                    </div>
                  </div>
                </div>
                <span className="px-3 py-1 bg-primary-50 text-primary-700 font-semibold rounded-lg text-sm">
                  {car.category}
                </span>
              </div>

              <p className="mt-4 text-slate-600 leading-relaxed">{car.description}</p>

              {/* Specs grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                {[
                  { icon: BsFuelPump, label: 'Fuel', value: car.fuelType },
                  { icon: BsGearFill, label: 'Transmission', value: car.transmission },
                  { icon: MdAirlineSeatReclineNormal, label: 'Seats', value: car.seats },
                  { icon: BsSpeedometer, label: 'Year', value: car.year },
                ].map((spec) => (
                  <div key={spec.label} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <spec.icon className="text-primary-500 text-xl flex-shrink-0" />
                    <div>
                      <p className="text-xs text-slate-400">{spec.label}</p>
                      <p className="text-sm font-semibold text-slate-700">{spec.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Brand & Model */}
              <div className="flex gap-4 mt-4">
                <span className="px-3 py-1.5 bg-gray-100 rounded-lg text-sm text-slate-600 font-medium">
                  Brand: {car.brand}
                </span>
                <span className="px-3 py-1.5 bg-gray-100 rounded-lg text-sm text-slate-600 font-medium">
                  Model: {car.model}
                </span>
              </div>
            </div>

            {/* Availability Calendar */}
            <div>
              <h2 className="text-lg font-semibold text-slate-800 mb-3">Availability</h2>
              <AvailabilityCalendar
                bookedDates={bookedDates}
                selectedStart={startDate}
                selectedEnd={endDate}
              />
            </div>

            {/* Reviews */}
            <div>
              <h2 className="text-lg font-semibold text-slate-800 mb-4">
                Reviews ({reviews.length})
              </h2>
              {reviews.length === 0 ? (
                <p className="text-slate-400 text-sm">No reviews yet.</p>
              ) : (
                <div className="space-y-3">
                  {reviews.map((review) => (
                    <ReviewCard key={review._id} review={review} />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right — Booking Widget */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-24 space-y-5">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-primary-700">₹{car.pricePerDay}</span>
                <span className="text-slate-500">/day</span>
              </div>
              {car.weekendPricePerDay !== car.pricePerDay && (
                <p className="text-sm text-slate-500">
                  Weekend: <span className="font-semibold text-slate-700">₹{car.weekendPricePerDay}/day</span>
                </p>
              )}

              <div className="space-y-3">
                <div>
                  <label className="input-label">Start Date & Time</label>
                  <DatePicker
                    selected={startDate}
                    onChange={setStartDate}
                    selectsStart
                    startDate={startDate}
                    endDate={endDate}
                    minDate={new Date()}
                    showTimeSelect
                    timeFormat="HH:mm"
                    timeIntervals={30}
                    dateFormat="MMMM d, yyyy h:mm aa"
                    placeholderText="Pick start date & time"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="input-label">End Date & Time</label>
                  <DatePicker
                    selected={endDate}
                    onChange={setEndDate}
                    selectsEnd
                    startDate={startDate}
                    endDate={endDate}
                    minDate={startDate || new Date()}
                    showTimeSelect
                    timeFormat="HH:mm"
                    timeIntervals={30}
                    dateFormat="MMMM d, yyyy h:mm aa"
                    placeholderText="Pick end date & time"
                    className="input-field"
                  />
                </div>
              </div>

              {/* Price breakdown */}
              {priceBreakdown && (
                <div className="bg-primary-50 rounded-xl p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Rental ({priceBreakdown.days} days)</span>
                    <span className="font-medium">₹{priceBreakdown.subtotal}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Service Fee (10%)</span>
                    <span className="font-medium">₹{priceBreakdown.commission}</span>
                  </div>
                  {priceBreakdown.deposit > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Damage Deposit</span>
                      <span className="font-medium">₹{priceBreakdown.deposit}</span>
                    </div>
                  )}
                  <div className="border-t border-primary-200 pt-2 flex justify-between">
                    <span className="font-semibold text-slate-800">Total</span>
                    <span className="font-bold text-primary-700 text-lg">₹{priceBreakdown.total}</span>
                  </div>
                </div>
              )}

              <button onClick={handleBook} disabled={!startDate || !endDate || booking}
                className="btn-primary w-full !py-3.5 text-base disabled:opacity-50">
                {booking ? 'Processing...' : 'Book & Pay'}
              </button>

              {/* Owner info */}
              <div className="pt-4 border-t border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                    {car.owner?.avatar?.url ? (
                      <img src={car.owner.avatar.url} alt="" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <span className="text-white text-sm font-bold">{car.owner?.name?.[0]}</span>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{car.owner?.name}</p>
                    <p className="text-xs text-slate-500">Car Owner</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarDetail;
