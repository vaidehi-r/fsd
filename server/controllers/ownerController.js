import OwnerRequest from '../models/OwnerRequest.js';
import User from '../models/User.js';
import Car from '../models/Car.js';
import Booking from '../models/Booking.js';
import Review from '../models/Review.js';
import Notification from '../models/Notification.js';
import { bookingsToCSV } from '../utils/csvExport.js';
import sendEmail from '../utils/sendEmail.js';
import { ownerRequestReceivedEmail } from '../emails/templates.js';

/**
 * @desc    Submit owner registration request
 * @route   POST /api/owner/request
 * @access  Public
 */
export const submitOwnerRequest = async (req, res, next) => {
  try {
    const { name, email, phone, password } = req.body;

    // Check if email already in use
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered.' });
    }

    const existingRequest = await OwnerRequest.findOne({ email, status: 'pending' });
    if (existingRequest) {
      return res.status(400).json({ message: 'A pending request with this email already exists.' });
    }

    // Get uploaded files
    const licenseImage = req.files?.licenseImage?.[0];
    const govtIdImage = req.files?.govtIdImage?.[0];

    if (!licenseImage || !govtIdImage) {
      return res.status(400).json({ message: 'Both license and government ID images are required.' });
    }

    const ownerRequest = await OwnerRequest.create({
      name,
      email,
      phone,
      password,
      licenseImage: { url: licenseImage.path, public_id: licenseImage.filename },
      govtIdImage: { url: govtIdImage.path, public_id: govtIdImage.filename },
    });

    // Send confirmation email
    sendEmail({
      to: email,
      subject: 'MotoLease - Owner Application Received 📋',
      html: ownerRequestReceivedEmail(name),
    });

    res.status(201).json({ message: 'Application submitted successfully. We will review it shortly.' });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get owner dashboard stats
 * @route   GET /api/owner/dashboard
 * @access  Owner
 */
export const getOwnerDashboard = async (req, res, next) => {
  try {
    const ownerId = req.user._id;

    // Total cars
    const totalCars = await Car.countDocuments({ owner: ownerId });
    const activeCars = await Car.countDocuments({ owner: ownerId, isAvailable: true });

    // Bookings stats
    const totalBookings = await Booking.countDocuments({ owner: ownerId });
    const bookings = await Booking.find({ owner: ownerId });

    // Calculate earnings
    const totalEarnings = bookings
      .filter((b) => b.paymentStatus === 'paid')
      .reduce((sum, b) => sum + b.subtotal, 0);

    // This month earnings
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const thisMonthEarnings = bookings
      .filter((b) => b.paymentStatus === 'paid' && new Date(b.createdAt) >= startOfMonth)
      .reduce((sum, b) => sum + b.subtotal, 0);

    // Average rating across all cars
    const cars = await Car.find({ owner: ownerId }).select('averageRating totalReviews title');
    const avgRating =
      cars.length > 0
        ? cars.reduce((sum, c) => sum + c.averageRating, 0) / cars.length
        : 0;

    // Monthly revenue (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const monthlyRevenue = await Booking.aggregate([
      {
        $match: {
          owner: ownerId,
          paymentStatus: 'paid',
          createdAt: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          revenue: { $sum: '$subtotal' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Booking status distribution
    const statusDistribution = await Booking.aggregate([
      { $match: { owner: ownerId } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    // Top performing cars
    const topCars = await Booking.aggregate([
      { $match: { owner: ownerId, paymentStatus: 'paid' } },
      {
        $group: {
          _id: '$car',
          totalBookings: { $sum: 1 },
          totalEarnings: { $sum: '$subtotal' },
        },
      },
      { $sort: { totalBookings: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'cars',
          localField: '_id',
          foreignField: '_id',
          as: 'car',
        },
      },
      { $unwind: '$car' },
      {
        $project: {
          title: '$car.title',
          averageRating: '$car.averageRating',
          totalBookings: 1,
          totalEarnings: 1,
        },
      },
    ]);

    // Recent bookings
    const recentBookings = await Booking.find({ owner: ownerId })
      .populate('car', 'title images')
      .populate('user', 'name email avatar')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    // Daily bookings trend (current month)
    const dailyBookings = await Booking.aggregate([
      {
        $match: {
          owner: ownerId,
          createdAt: { $gte: startOfMonth },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      stats: {
        totalEarnings: Math.round(totalEarnings * 100) / 100,
        thisMonthEarnings: Math.round(thisMonthEarnings * 100) / 100,
        totalBookings,
        activeCars,
        totalCars,
        averageRating: Math.round(avgRating * 10) / 10,
      },
      monthlyRevenue,
      statusDistribution,
      topCars,
      recentBookings,
      dailyBookings,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get bookings for owner's cars
 * @route   GET /api/owner/bookings
 * @access  Owner
 */
export const getOwnerBookings = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const filter = { owner: req.user._id };
    if (status) filter.status = status;

    const total = await Booking.countDocuments(filter);
    const bookings = await Booking.find(filter)
      .populate('car', 'title images brand model')
      .populate('user', 'name email phone avatar')
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
 * @desc    Confirm a pending booking
 * @route   PUT /api/owner/bookings/:id/confirm
 * @access  Owner
 */
export const confirmBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('car', 'title')
      .populate('user', 'name email');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found.' });
    }

    if (booking.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized.' });
    }

    if (booking.status !== 'pending' && booking.status !== 'confirmed') {
      return res.status(400).json({ message: 'Only pending bookings can be confirmed.' });
    }

    booking.status = 'confirmed';
    await booking.save();

    // Notify user
    const notification = await Notification.create({
      recipient: booking.user._id,
      type: 'booking_confirmed',
      message: `Your booking for "${booking.car.title}" has been confirmed by the owner!`,
      relatedId: booking._id,
      relatedModel: 'Booking',
    });

    const { getIO } = await import('../socket/index.js');
    const io = getIO();
    io.to(`user:${booking.user._id}`).emit('notification:new', notification);

    res.json({ message: 'Booking confirmed.', booking });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Reject a pending booking
 * @route   PUT /api/owner/bookings/:id/reject
 * @access  Owner
 */
export const rejectBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('car', 'title')
      .populate('user', 'name email');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found.' });
    }

    if (booking.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized.' });
    }

    if (booking.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending bookings can be rejected.' });
    }

    booking.status = 'cancelled';
    booking.cancelledBy = 'owner';
    booking.cancelReason = req.body.reason || 'Rejected by owner';
    await booking.save();

    // Notify user
    const notification = await Notification.create({
      recipient: booking.user._id,
      type: 'booking_cancelled',
      message: `Your booking for "${booking.car.title}" was rejected by the owner.`,
      relatedId: booking._id,
      relatedModel: 'Booking',
    });

    const { getIO } = await import('../socket/index.js');
    const io = getIO();
    io.to(`user:${booking.user._id}`).emit('notification:new', notification);

    res.json({ message: 'Booking rejected.', booking });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get owner's car listings
 * @route   GET /api/owner/cars
 * @access  Owner
 */
export const getOwnerCars = async (req, res, next) => {
  try {
    const cars = await Car.find({ owner: req.user._id })
      .sort({ createdAt: -1 })
      .lean();

    res.json({ cars });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Export bookings as CSV
 * @route   GET /api/owner/export-bookings
 * @access  Owner
 */
export const exportBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ owner: req.user._id })
      .populate('car', 'title')
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    const csv = bookingsToCSV(bookings);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=bookings.csv');
    res.send(csv);
  } catch (error) {
    next(error);
  }
};
