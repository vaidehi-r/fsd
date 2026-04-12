import User from '../models/User.js';
import Car from '../models/Car.js';
import Booking from '../models/Booking.js';
import Payment from '../models/Payment.js';
import Review from '../models/Review.js';
import Report from '../models/Report.js';
import OwnerRequest from '../models/OwnerRequest.js';
import Settings from '../models/Settings.js';
import Notification from '../models/Notification.js';
import cloudinary from '../config/cloudinary.js';
import razorpay from '../config/razorpay.js';
import sendEmail from '../utils/sendEmail.js';
import {
  ownerApprovedEmail,
  ownerRejectedEmail,
  carDeletedByAdminEmail,
  accountSuspendedEmail,
  depositRefundApprovedEmail,
  depositRefundDeniedEmail,
} from '../emails/templates.js';
import { getIO } from '../socket/index.js';

/**
 * @desc    Get admin dashboard stats
 * @route   GET /api/admin/dashboard
 * @access  Admin
 */
export const getDashboard = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalOwners,
      totalCars,
      totalBookings,
      pendingRequests,
      pendingReports,
    ] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      User.countDocuments({ role: 'owner' }),
      Car.countDocuments(),
      Booking.countDocuments(),
      OwnerRequest.countDocuments({ status: 'pending' }),
      Report.countDocuments({ status: 'pending' }),
    ]);

    // Total revenue
    const revenueResult = await Payment.aggregate([
      { $match: { status: 'succeeded' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const totalRevenue = revenueResult[0]?.total || 0;

    // Monthly revenue (last 12 months)
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
    const monthlyRevenue = await Payment.aggregate([
      { $match: { status: 'succeeded', createdAt: { $gte: twelveMonthsAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          revenue: { $sum: '$amount' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // New registrations per month (users + owners)
    const registrations = await User.aggregate([
      { $match: { createdAt: { $gte: twelveMonthsAgo } } },
      {
        $group: {
          _id: {
            month: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
            role: '$role',
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.month': 1 } },
    ]);

    // Booking status platform-wide
    const bookingStatus = await Booking.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    // Daily active bookings (current month)
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const dailyBookings = await Booking.aggregate([
      { $match: { createdAt: { $gte: startOfMonth } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Recent bookings
    const recentBookings = await Booking.find()
      .populate('car', 'title')
      .populate('user', 'name email')
      .populate('owner', 'name')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    // Recent owner requests
    const recentRequests = await OwnerRequest.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    res.json({
      stats: {
        totalUsers,
        totalOwners,
        totalCars,
        totalBookings,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        pendingRequests,
        pendingReports,
      },
      monthlyRevenue,
      registrations,
      bookingStatus,
      dailyBookings,
      recentBookings,
      recentRequests,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all users
 * @route   GET /api/admin/users
 * @access  Admin
 */
export const getUsers = async (req, res, next) => {
  try {
    const { search, status, page = 1, limit = 10 } = req.query;
    const filter = { role: 'user' };

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    if (status === 'active') filter.isSuspended = false;
    if (status === 'suspended') filter.isSuspended = true;

    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean();

    res.json({ users, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Suspend a user
 * @route   PUT /api/admin/users/:id/suspend
 * @access  Admin
 */
export const suspendUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    user.isSuspended = !user.isSuspended;
    await user.save();

    if (user.isSuspended) {
      sendEmail({
        to: user.email,
        subject: 'MotoLease - Account Suspended',
        html: accountSuspendedEmail(user.name),
      });
    }

    res.json({ message: `User ${user.isSuspended ? 'suspended' : 'unsuspended'}.`, user });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a user
 * @route   DELETE /api/admin/users/:id
 * @access  Admin
 */
export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    res.json({ message: 'User deleted.' });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all owners with stats
 * @route   GET /api/admin/owners
 * @access  Admin
 */
export const getOwners = async (req, res, next) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    const filter = { role: 'owner' };

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await User.countDocuments(filter);
    const owners = await User.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean();

    // Enrich with stats
    const enriched = await Promise.all(
      owners.map(async (owner) => {
        const totalCars = await Car.countDocuments({ owner: owner._id });
        const earningsResult = await Booking.aggregate([
          { $match: { owner: owner._id, paymentStatus: 'paid' } },
          { $group: { _id: null, total: { $sum: '$subtotal' } } },
        ]);
        return {
          ...owner,
          totalCars,
          totalEarnings: earningsResult[0]?.total || 0,
        };
      })
    );

    res.json({ owners: enriched, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Suspend an owner (also deactivates listings)
 * @route   PUT /api/admin/owners/:id/suspend
 * @access  Admin
 */
export const suspendOwner = async (req, res, next) => {
  try {
    const owner = await User.findById(req.params.id);
    if (!owner || owner.role !== 'owner') {
      return res.status(404).json({ message: 'Owner not found.' });
    }

    owner.isSuspended = !owner.isSuspended;
    await owner.save();

    // Deactivate/reactivate listings
    await Car.updateMany(
      { owner: owner._id },
      { isAvailable: !owner.isSuspended }
    );

    if (owner.isSuspended) {
      sendEmail({
        to: owner.email,
        subject: 'MotoLease - Account Suspended',
        html: accountSuspendedEmail(owner.name),
      });
    }

    res.json({ message: `Owner ${owner.isSuspended ? 'suspended' : 'unsuspended'}.`, owner });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete an owner
 * @route   DELETE /api/admin/owners/:id
 * @access  Admin
 */
export const deleteOwner = async (req, res, next) => {
  try {
    const owner = await User.findById(req.params.id);
    if (!owner || owner.role !== 'owner') {
      return res.status(404).json({ message: 'Owner not found.' });
    }

    // Deactivate all listings
    await Car.updateMany({ owner: owner._id }, { isAvailable: false });
    await User.findByIdAndDelete(req.params.id);

    res.json({ message: 'Owner deleted and listings deactivated.' });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all owner requests
 * @route   GET /api/admin/owner-requests
 * @access  Admin
 */
export const getOwnerRequests = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const total = await OwnerRequest.countDocuments(filter);
    const requests = await OwnerRequest.find(filter)
      .populate('reviewedBy', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean();

    res.json({ requests, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Approve owner request
 * @route   PUT /api/admin/owner-requests/:id/approve
 * @access  Admin
 */
export const approveOwnerRequest = async (req, res, next) => {
  try {
    const ownerReq = await OwnerRequest.findById(req.params.id).select('+password');
    if (!ownerReq) return res.status(404).json({ message: 'Request not found.' });
    if (ownerReq.status !== 'pending') {
      return res.status(400).json({ message: 'Request already processed.' });
    }

    // Create user with owner role (password is already hashed in OwnerRequest)
    const user = new User({
      name: ownerReq.name,
      email: ownerReq.email,
      phone: ownerReq.phone,
      password: 'temp', // will be overwritten
      role: 'owner',
      isActive: true,
    });
    // Directly set the pre-hashed password
    user.password = ownerReq.password;
    await user.save({ validateBeforeSave: false });

    ownerReq.status = 'approved';
    ownerReq.reviewedBy = req.user._id;
    await ownerReq.save();

    // Notify
    const notification = await Notification.create({
      recipient: user._id,
      type: 'owner_approved',
      message: 'Your owner application has been approved! You can now list cars.',
      relatedId: ownerReq._id,
      relatedModel: 'OwnerRequest',
    });

    const io = getIO();
    io.to(`user:${user._id}`).emit('notification:new', notification);

    sendEmail({
      to: user.email,
      subject: 'MotoLease - Owner Application Approved! 🎉',
      html: ownerApprovedEmail(user.name, user.email),
    });

    res.json({ message: 'Owner request approved.', user });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Reject owner request
 * @route   PUT /api/admin/owner-requests/:id/reject
 * @access  Admin
 */
export const rejectOwnerRequest = async (req, res, next) => {
  try {
    const ownerReq = await OwnerRequest.findById(req.params.id);
    if (!ownerReq) return res.status(404).json({ message: 'Request not found.' });
    if (ownerReq.status !== 'pending') {
      return res.status(400).json({ message: 'Request already processed.' });
    }

    ownerReq.status = 'rejected';
    ownerReq.rejectionReason = req.body.reason || 'Your application did not meet our requirements.';
    ownerReq.reviewedBy = req.user._id;
    await ownerReq.save();

    sendEmail({
      to: ownerReq.email,
      subject: 'MotoLease - Owner Application Update',
      html: ownerRejectedEmail(ownerReq.name, ownerReq.rejectionReason),
    });

    res.json({ message: 'Owner request rejected.' });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Approve damage deposit refund
 * @route   PUT /api/admin/bookings/:id/refund
 * @access  Admin
 */
export const approveDepositRefund = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('user', 'name email')
      .populate('car', 'title');

    if (!booking) return res.status(404).json({ message: 'Booking not found.' });
    if (booking.depositRefundStatus !== 'pending') {
      return res.status(400).json({ message: 'Refund request is not pending.' });
    }
    if (booking.damageDeposit <= 0) {
      return res.status(400).json({ message: 'No damage deposit associated with this booking.' });
    }

    const payment = await Payment.findOne({ booking: booking._id, status: 'succeeded' });
    if (!payment || !payment.razorpayPaymentId) {
      return res.status(400).json({ message: 'Original payment record not found or lacks Razorpay ID.' });
    }

    // Initiate partial refund via Razorpay
    await razorpay.payments.refund(payment.razorpayPaymentId, {
      amount: Math.round(booking.damageDeposit * 100), // Razorpay operates in paise
      notes: { reason: "Damage deposit automated refund via Admin Approval" }
    });

    booking.depositRefundStatus = 'approved';
    await booking.save();

    // Trigger success email
    sendEmail({
      to: booking.user.email,
      subject: 'MotoLease - Deposit Refund Processed',
      html: depositRefundApprovedEmail(booking.user.name, booking.car.title, booking.damageDeposit),
    });

    res.json({ message: 'Damage deposit refund approved and processed successfully.', booking });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Deny damage deposit refund
 * @route   PUT /api/admin/bookings/:id/deny-refund
 * @access  Admin
 */
export const denyDepositRefund = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('user', 'name email')
      .populate('car', 'title');

    if (!booking) return res.status(404).json({ message: 'Booking not found.' });
    if (booking.depositRefundStatus !== 'pending') {
      return res.status(400).json({ message: 'Refund request is not pending.' });
    }

    booking.depositRefundStatus = 'rejected';
    await booking.save();

    // Trigger rejected email
    sendEmail({
      to: booking.user.email,
      subject: 'MotoLease - Deposit Refund Update',
      html: depositRefundDeniedEmail(booking.user.name, booking.car.title),
    });

    res.json({ message: 'Damage deposit refund denied.', booking });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all bookings (admin)
 * @route   GET /api/admin/bookings
 * @access  Admin
 */
export const getAllBookings = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const total = await Booking.countDocuments(filter);
    const bookings = await Booking.find(filter)
      .populate('car', 'title images')
      .populate('user', 'name email')
      .populate('owner', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean();

    res.json({ bookings, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all reviews (admin)
 * @route   GET /api/admin/reviews
 * @access  Admin
 */
export const getAllReviews = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const total = await Review.countDocuments();
    const reviews = await Review.find()
      .populate('user', 'name email avatar')
      .populate('car', 'title')
      .populate('owner', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean();

    res.json({ reviews, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get platform settings
 * @route   GET /api/admin/settings
 * @access  Admin
 */
export const getSettings = async (req, res, next) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({ commissionPercent: 10, maintenanceMode: false });
    }
    res.json({ settings });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update platform settings
 * @route   PUT /api/admin/settings
 * @access  Admin
 */
export const updateSettings = async (req, res, next) => {
  try {
    const { commissionPercent, maintenanceMode } = req.body;

    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
    }

    if (commissionPercent !== undefined) settings.commissionPercent = commissionPercent;
    if (maintenanceMode !== undefined) settings.maintenanceMode = maintenanceMode;
    settings.updatedBy = req.user._id;
    await settings.save();

    res.json({ message: 'Settings updated.', settings });
  } catch (error) {
    next(error);
  }
};
