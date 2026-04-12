import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { format } from 'date-fns';
import api from '../../lib/axios';
import StatusBadge from '../../components/StatusBadge';
import PageHeader from '../../components/PageHeader';
import StarRating from '../../components/StarRating';
import useAuthStore from '../../stores/authStore';
import toast from 'react-hot-toast';

const BookingDetail = () => {
  const { id } = useParams();
  const location = useLocation();
  const { user } = useAuthStore();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [orderData] = useState(location.state?.orderData || null);
  const [paying, setPaying] = useState(false);
  const [review, setReview] = useState({ rating: 0, comment: '' });
  const [submitting, setSubmitting] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);

  useEffect(() => { fetchBooking(); }, [id]);

  const fetchBooking = async () => {
    try {
      const res = await api.get(`/bookings/my`);
      const b = res.data.bookings.find(b => b._id === id);
      setBooking(b);
    } catch (e) {}
    finally { setLoading(false); }
  };

  /**
   * Launch Razorpay checkout popup
   */
  const handlePayNow = async () => {
    setPaying(true);
    try {
      // If we don't have orderData from navigation, create a new order
      let paymentData = orderData;
      if (!paymentData) {
        const res = await api.post('/payments/create-order', { bookingId: id });
        paymentData = res.data;
      }

      const options = {
        key: paymentData.keyId || import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: paymentData.amount,
        currency: paymentData.currency,
        name: 'MotoLease',
        description: `Booking #${id.slice(-6)}`,
        order_id: paymentData.orderId,
        prefill: paymentData.prefill || {
          name: user?.name,
          email: user?.email,
          contact: user?.phone,
        },
        theme: {
          color: '#1D4ED8',
        },
        handler: async function (response) {
          // Verify payment on server
          try {
            await api.post('/payments/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            toast.success('Payment successful! Booking confirmed.');
            fetchBooking();
          } catch (err) {
            toast.error('Payment verification failed. Please contact support.');
          }
        },
        modal: {
          ondismiss: function () {
            setPaying(false);
            toast.error('Payment cancelled');
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        toast.error(`Payment failed: ₹{response.error.description}`);
        setPaying(false);
      });
      rzp.open();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to initiate payment');
    } finally {
      setPaying(false);
    }
  };

  const submitReview = async () => {
    if (review.rating === 0) { toast.error('Please select a rating'); return; }
    setSubmitting(true);
    try {
      await api.post('/reviews', { bookingId: id, rating: review.rating, comment: review.comment });
      toast.success('Review submitted!');
      setHasReviewed(true);
    } catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
    finally { setSubmitting(false); }
  };

  if (loading) return <div className="pt-20 page-container flex justify-center py-20"><div className="w-10 h-10 border-4 border-primary-200 border-t-primary-700 rounded-full animate-spin"/></div>;
  if (!booking) return <div className="pt-20 page-container text-center text-slate-400">Booking not found.</div>;

  return (
    <div className="pt-20 page-container">
      <PageHeader title="Booking Details" breadcrumbs={[{ label: 'Bookings', to: '/bookings' }, { label: `#${booking._id.slice(-6)}` }]} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Booking #{booking._id.slice(-6)}</h2>
              <StatusBadge status={booking.status} />
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-slate-500">Car</p><p className="font-medium">{booking.car?.title}</p></div>
              <div><p className="text-slate-500">Dates</p><p className="font-medium">{format(new Date(booking.startDate), 'MMM d, h:mm a')} - {format(new Date(booking.endDate), 'MMM d, yyyy, h:mm a')}</p></div>
              <div><p className="text-slate-500">Duration</p><p className="font-medium">{booking.totalDays} days</p></div>
              <div><p className="text-slate-500">Payment</p><StatusBadge status={booking.paymentStatus} /></div>
              <div className="col-span-2 pt-4 border-t border-slate-100 flex items-center justify-between">
                <div><p className="text-slate-500 mb-1">Owner Contact</p><p className="font-bold text-slate-800">{booking.owner?.name}</p><p className="text-primary-600 font-medium">{booking.owner?.phone}</p></div>
                {booking.owner?.phone && <a href={`tel:${booking.owner.phone}`} className="btn-secondary !py-2 !px-4 text-xs">Call Owner</a>}
              </div>
            </div>
          </div>

          {/* Payment */}
          {booking.paymentStatus === 'unpaid' && (
            <div className="card p-6">
              <h2 className="text-lg font-semibold mb-4">Complete Payment</h2>
              <div className="bg-primary-50 rounded-xl p-4 mb-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-primary-700 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">₹</span>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Amount to Pay</p>
                    <p className="text-2xl font-bold text-primary-700">₹{booking.totalAmount}</p>
                  </div>
                </div>
                <p className="text-xs text-slate-500">Secure payment powered by Razorpay. Supports UPI, Credit/Debit Cards, Net Banking, and Wallets.</p>
              </div>
              <button onClick={handlePayNow} disabled={paying}
                className="btn-primary w-full !py-3.5 text-base flex items-center justify-center gap-2">
                {paying ? (
                  <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Processing...</>
                ) : (
                  <><span>💳</span> Pay Now with Razorpay</>
                )}
              </button>
            </div>
          )}

          {/* Review */}
          {(booking.status === 'completed' || new Date() > new Date(booking.endDate)) && !hasReviewed && (
            <div className="card p-6">
              <h2 className="text-lg font-semibold mb-4">Leave a Review</h2>
              <StarRating rating={review.rating} onChange={(r) => setReview(p => ({...p, rating: r}))} size={28} />
              <textarea value={review.comment} onChange={(e) => setReview(p => ({...p, comment: e.target.value}))}
                className="input-field mt-3" rows={3} placeholder="Share your experience..." />
              <button onClick={submitReview} disabled={submitting} className="btn-primary mt-3">{submitting ? 'Submitting...' : 'Submit Review'}</button>
            </div>
          )}
        </div>

        <div className="card p-6 h-fit">
          <h3 className="font-semibold mb-4">Price Breakdown</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-slate-500">Subtotal</span><span>₹{booking.subtotal}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Commission</span><span>₹{booking.commission}</span></div>
            {booking.damageDeposit > 0 && <div className="flex justify-between"><span className="text-slate-500">Deposit</span><span>₹{booking.damageDeposit}</span></div>}
            <div className="border-t pt-2 flex justify-between font-bold"><span>Total</span><span className="text-primary-700">₹{booking.totalAmount}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default BookingDetail;
