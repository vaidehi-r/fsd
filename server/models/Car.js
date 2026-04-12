import mongoose from 'mongoose';

const carSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Car title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    brand: {
      type: String,
      required: [true, 'Brand is required'],
      trim: true,
    },
    model: {
      type: String,
      required: [true, 'Model is required'],
      trim: true,
    },
    year: {
      type: Number,
      required: [true, 'Year is required'],
      min: [1990, 'Year must be 1990 or later'],
      max: [new Date().getFullYear() + 1, 'Invalid year'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['SUV', 'Sedan', 'Hatchback', 'Luxury', 'EV', 'Truck'],
    },
    fuelType: {
      type: String,
      required: [true, 'Fuel type is required'],
      enum: ['Petrol', 'Diesel', 'Electric', 'Hybrid'],
    },
    transmission: {
      type: String,
      required: [true, 'Transmission is required'],
      enum: ['Manual', 'Automatic'],
    },
    seats: {
      type: Number,
      required: [true, 'Number of seats is required'],
      min: [2, 'Minimum 2 seats'],
      max: [12, 'Maximum 12 seats'],
    },
    pricePerDay: {
      type: Number,
      required: [true, 'Price per day is required'],
      min: [0, 'Price cannot be negative'],
    },
    weekendPricePerDay: {
      type: Number,
      required: [true, 'Weekend price per day is required'],
      min: [0, 'Price cannot be negative'],
    },
    damageDeposit: {
      type: Number,
      default: 0,
      min: [0, 'Deposit cannot be negative'],
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    images: [
      {
        url: { type: String, required: true },
        public_id: { type: String, required: true },
      },
    ],
    isAvailable: {
      type: Boolean,
      default: true,
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Indexes for search and filtering
carSchema.index({ location: 'text', title: 'text', brand: 'text', model: 'text' });
carSchema.index({ category: 1, fuelType: 1, transmission: 1 });
carSchema.index({ pricePerDay: 1 });
carSchema.index({ owner: 1 });
carSchema.index({ isAvailable: 1 });

const Car = mongoose.model('Car', carSchema);
export default Car;
