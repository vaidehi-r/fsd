import Booking from '../models/Booking.js';
import Car from '../models/Car.js';
import Settings from '../models/Settings.js';
import Notification from '../models/Notification.js';
import { calculateBookingPrice } from '../utils/calculatePrice.js';
import { getIO } from '../socket/index.js';
import sendEmail from '../utils/sendEmail.js';
import { bookingCancelledEmail } from '../emails/templates.js';
import razorpay from '../config/razorpay.js';
import Payment from '../models/Payment.js';

/**
 * @desc    Create a new booking
 * @route   POST /api/bookings
 * @access  User
 */
export const createBooking = async (req, res, next) => {
  try {
    const { carId, startDate, endDate } = req.body;

    // Get car
    const car = await Car.findById(carId).populate('owner', 'name email');
    if (!car) {
      return res.status(404).json({ message: 'Car not found.' });
    }

    if (!car.isAvailable) {
      return res.status(400).json({ message: 'Car is not available.' });
    }

    // Users can't book their own cars
    if (car.owner._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot book your own car.' });
    }

    // Check dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start >= end) {
      return res.status(400).json({ message: 'End date must be after start date.' });
    }
    if (start < new Date()) {
      return res.status(400).json({ message: 'Start date cannot be in the past.' });
    }

    // Check for overlapping bookings
    const overlapping = await Booking.findOne({
      car: carId,
      status: { $in: ['pending', 'confirmed', 'ongoing'] },
      $or: [
        { startDate: { $lt: end }, endDate: { $gt: start } },
      ],
    });

    if (overlapping) {
      return res.status(400).json({ message: 'Car is already booked for these dates.' });
    }

    // Get commission from settings
    const settings = await Settings.findOne();
    const commissionPercent = settings?.commissionPercent || 10;

    // Calculate price
    const priceBreakdown = calculateBookingPrice(
      start, end,
      car.pricePerDay,
      car.weekendPricePerDay,
      commissionPercent,
      car.damageDeposit
    );

    // Create booking (payment will be handled separately)
    const booking = await Booking.create({
      user: req.user._id,
      car: carId,
      owner: car.owner._id,
      startDate: start,
      endDate: end,
      totalDays: priceBreakdown.totalDays,
      pricePerDay: car.pricePerDay,
      subtotal: priceBreakdown.subtotal,
      commission: priceBreakdown.commission,
      damageDeposit: priceBreakdown.damageDeposit,
      totalAmount: priceBreakdown.totalAmount,
      status: 'pending',
      paymentStatus: 'unpaid',
    });

    res.status(201).json({
      message: 'Booking created. Proceed to payment.',
      booking,
      priceBreakdown,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user's bookings
 * @route   GET /api/bookings/my
 * @access  User
 */
export const getMyBookings = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const filter = { user: req.user._id };
    if (status) filter.status = status;

    const total = await Booking.countDocuments(filter);
    const bookings = await Booking.find(filter)
      .populate('car', 'title images brand model location pricePerDay')
      .populate('owner', 'name email phone')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean();

    res.json({
      bookings,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Cancel a booking (allowed before owner confirms)
 * @route   PUT /api/bookings/:id/cancel
 * @access  User
 */
export const cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('car', 'title')
      .populate('owner', 'name email');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found.' });
    }

    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized.' });
    }

    if (!['pending', 'confirmed'].includes(booking.status)) {
      return res.status(400).json({ message: 'Only pending or confirmed bookings can be cancelled.' });
    }

    booking.status = 'cancelled';
    booking.cancelledBy = 'user';
    booking.cancelReason = req.body.reason || 'Cancelled by user';

    // Process refund if payment was made
    if (booking.paymentStatus === 'paid' && booking.razorpayOrderId) {
      try {
        const payment = await Payment.findOne({ razorpayOrderId: booking.razorpayOrderId });
        if (payment?.razorpayPaymentId) {
          const refund = await razorpay.payments.refund(payment.razorpayPaymentId, {
            amount: Math.round(booking.totalAmount * 100),
            notes: { reason: booking.cancelReason || 'Cancelled by user' },
          });
          payment.status = 'refunded';
          payment.refundId = refund.id;
          await payment.save();
        }
        booking.paymentStatus = 'refunded';
      } catch (razorpayError) {
        console.error('Razorpay refund error:', razorpayError.message);
      }
    }

    await booking.save();

    // Notify owner
    const notification = await Notification.create({
      recipient: booking.owner._id,
      type: 'booking_cancelled',
      message: `Booking for "${booking.car.title}" has been cancelled by the customer.`,
      relatedId: booking._id,
      relatedModel: 'Booking',
    });

    // Socket notification
    const io = getIO();
    io.to(`user:${booking.owner._id}`).emit('notification:new', notification);

    // Email to owner
    sendEmail({
      to: booking.owner.email,
      subject: 'MotoLease - Booking Cancelled',
      html: bookingCancelledEmail(booking.owner.name, booking.car.title, booking.cancelReason),
    });

    res.json({ message: 'Booking cancelled successfully.', booking });
  } catch (error) {
    next(error);
  }
};
