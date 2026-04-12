import Review from '../models/Review.js';
import Booking from '../models/Booking.js';
import Car from '../models/Car.js';
import Notification from '../models/Notification.js';
import { getIO } from '../socket/index.js';

/**
 * @desc    Create a review (after completed booking)
 * @route   POST /api/reviews
 * @access  User
 */
export const createReview = async (req, res, next) => {
  try {
    const { bookingId, rating, comment } = req.body;

    // Verify booking exists and is completed
    const booking = await Booking.findById(bookingId).populate('car', 'title owner');
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found.' });
    }

    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized.' });
    }

    if (booking.status !== 'completed') {
      return res.status(400).json({ message: 'Can only review completed bookings.' });
    }

    // Check for existing review
    const existingReview = await Review.findOne({ booking: bookingId });
    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this booking.' });
    }

    const review = await Review.create({
      booking: bookingId,
      car: booking.car._id,
      user: req.user._id,
      owner: booking.car.owner,
      rating,
      comment,
    });

    // Populate for response
    const populatedReview = await Review.findById(review._id)
      .populate('user', 'name avatar');

    // Notify owner via socket
    const io = getIO();
    io.to(`car:${booking.car._id}`).emit('review:new', populatedReview);

    // Send notification to owner
    const notification = await Notification.create({
      recipient: booking.car.owner,
      type: 'review_received',
      message: `${req.user.name} left a ${rating}-star review on "${booking.car.title}".`,
      relatedId: review._id,
      relatedModel: 'Review',
    });
    io.to(`user:${booking.car.owner}`).emit('notification:new', notification);

    res.status(201).json({ message: 'Review posted.', review: populatedReview });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get reviews for a car
 * @route   GET /api/reviews/car/:carId
 * @access  Public
 */
export const getCarReviews = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const total = await Review.countDocuments({ car: req.params.carId });

    const reviews = await Review.find({ car: req.params.carId })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean();

    res.json({
      reviews,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Owner replies to a review
 * @route   POST /api/reviews/:id/reply
 * @access  Owner
 */
export const replyToReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found.' });
    }

    if (review.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to reply to this review.' });
    }

    if (review.ownerReply) {
      return res.status(400).json({ message: 'You have already replied to this review.' });
    }

    review.ownerReply = req.body.reply;
    review.ownerRepliedAt = new Date();
    await review.save();

    const populatedReview = await Review.findById(review._id)
      .populate('user', 'name avatar');

    // Emit to car room
    const io = getIO();
    io.to(`car:${review.car}`).emit('review:reply', populatedReview);

    res.json({ message: 'Reply posted.', review: populatedReview });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a review (admin only)
 * @route   DELETE /api/reviews/:id
 * @access  Admin
 */
export const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found.' });
    }
    res.json({ message: 'Review deleted.' });
  } catch (error) {
    next(error);
  }
};
