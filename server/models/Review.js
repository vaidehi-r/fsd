import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
      unique: true, // One review per booking
    },
    car: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Car',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: [true, 'Review comment is required'],
      maxlength: [1000, 'Comment cannot exceed 1000 characters'],
    },
    ownerReply: {
      type: String,
      default: '',
      maxlength: [1000, 'Reply cannot exceed 1000 characters'],
    },
    ownerRepliedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

reviewSchema.index({ car: 1 });
reviewSchema.index({ user: 1 });

// Static method to calculate average rating for a car
reviewSchema.statics.calculateAverageRating = async function (carId) {
  const result = await this.aggregate([
    { $match: { car: carId } },
    {
      $group: {
        _id: '$car',
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
      },
    },
  ]);

  const Car = mongoose.model('Car');
  if (result.length > 0) {
    await Car.findByIdAndUpdate(carId, {
      averageRating: Math.round(result[0].averageRating * 10) / 10,
      totalReviews: result[0].totalReviews,
    });
  } else {
    await Car.findByIdAndUpdate(carId, {
      averageRating: 0,
      totalReviews: 0,
    });
  }
};

// Update car rating after saving a review
reviewSchema.post('save', function () {
  this.constructor.calculateAverageRating(this.car);
});

// Update car rating after removing a review
reviewSchema.post('findOneAndDelete', function (doc) {
  if (doc) {
    doc.constructor.calculateAverageRating(doc.car);
  }
});

const Review = mongoose.model('Review', reviewSchema);
export default Review;
