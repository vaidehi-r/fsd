import crypto from 'crypto';
import razorpay from '../config/razorpay.js';
import Booking from '../models/Booking.js';
import Payment from '../models/Payment.js';
import Notification from '../models/Notification.js';
import { getIO } from '../socket/index.js';
import sendEmail from '../utils/sendEmail.js';
import {
  bookingConfirmedUserEmail,
  bookingConfirmedOwnerEmail,
  paymentReceiptEmail,
} from '../emails/templates.js';

/**
 * @desc    Create Razorpay order for a booking
 * @route   POST /api/payments/create-order
 * @access  User
 */
export const createOrder = async (req, res, next) => {
  try {
    const { bookingId } = req.body;

    const booking = await Booking.findById(bookingId)
      .populate('car', 'title')
      .populate('owner', 'name email');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found.' });
    }

    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized.' });
    }

    if (booking.paymentStatus === 'paid') {
      return res.status(400).json({ message: 'Booking is already paid.' });
    }

    // Create Razorpay order (amount in paise = INR * 100)
    const options = {
      amount: Math.round(booking.totalAmount * 100),
      currency: 'INR',
      receipt: `booking_${booking._id.toString().slice(-8)}`,
      notes: {
        bookingId: booking._id.toString(),
        userId: req.user._id.toString(),
        carTitle: booking.car.title,
      },
    };

    const order = await razorpay.orders.create(options);

    // Save Razorpay order ID to booking
    booking.razorpayOrderId = order.id;
    await booking.save();

    // Create payment record
    await Payment.create({
      booking: booking._id,
      user: req.user._id,
      amount: booking.totalAmount,
      currency: 'INR',
      razorpayOrderId: order.id,
      status: 'pending',
    });

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      bookingId: booking._id,
      prefill: {
        name: req.user.name,
        email: req.user.email,
        contact: req.user.phone,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Verify Razorpay payment signature and confirm booking
 * @route   POST /api/payments/verify
 * @access  User
 */
export const verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    // Verify signature using HMAC SHA256
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      // Update payment status to failed
      await Payment.findOneAndUpdate(
        { razorpayOrderId: razorpay_order_id },
        { status: 'failed' }
      );
      return res.status(400).json({ message: 'Payment verification failed.' });
    }

    // Payment verified — update records
    const booking = await Booking.findOne({ razorpayOrderId: razorpay_order_id })
      .populate('car', 'title pricePerDay weekendPricePerDay')
      .populate('user', 'name email')
      .populate('owner', 'name email');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found.' });
    }

    // Update booking
    booking.paymentStatus = 'paid';
    booking.status = 'confirmed';
    await booking.save();

    // Update payment record
    await Payment.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      {
        status: 'succeeded',
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
      }
    );

    const io = getIO();

    // Notify user
    const userNotification = await Notification.create({
      recipient: booking.user._id,
      type: 'booking_confirmed',
      message: `Your booking for "${booking.car.title}" has been confirmed!`,
      relatedId: booking._id,
      relatedModel: 'Booking',
    });
    io.to(`user:${booking.user._id}`).emit('notification:new', userNotification);

    // Notify owner
    const ownerNotification = await Notification.create({
      recipient: booking.owner._id,
      type: 'new_booking',
      message: `New booking received for "${booking.car.title}" from ${booking.user.name}.`,
      relatedId: booking._id,
      relatedModel: 'Booking',
    });
    io.to(`user:${booking.owner._id}`).emit('notification:new', ownerNotification);

    // Send emails
    sendEmail({
      to: booking.user.email,
      subject: 'MotoLease - Booking Confirmed! ✅',
      html: bookingConfirmedUserEmail(
        booking.user.name,
        booking.car.title,
        booking.startDate,
        booking.endDate,
        booking.totalAmount
      ),
    });

    sendEmail({
      to: booking.owner.email,
      subject: 'MotoLease - New Booking Received! 📦',
      html: bookingConfirmedOwnerEmail(
        booking.owner.name,
        booking.car.title,
        booking.user.name,
        booking.startDate,
        booking.endDate,
        booking.totalAmount
      ),
    });

    // Payment receipt
    sendEmail({
      to: booking.user.email,
      subject: 'MotoLease - Payment Receipt 💳',
      html: paymentReceiptEmail(booking.user.name, booking.car.title, {
        totalDays: booking.totalDays,
        subtotal: booking.subtotal,
        commission: booking.commission,
        commissionPercent: Math.round((booking.commission / booking.subtotal) * 100),
        damageDeposit: booking.damageDeposit,
        totalAmount: booking.totalAmount,
      }),
    });

    res.json({
      message: 'Payment verified successfully!',
      booking: {
        _id: booking._id,
        status: booking.status,
        paymentStatus: booking.paymentStatus,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user's payments
 * @route   GET /api/payments/my
 * @access  User
 */
export const getMyPayments = async (req, res, next) => {
  try {
    const payments = await Payment.find({ user: req.user._id })
      .populate('booking', 'car startDate endDate totalAmount status')
      .sort({ createdAt: -1 })
      .lean();

    res.json({ payments });
  } catch (error) {
    next(error);
  }
};
