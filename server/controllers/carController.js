import Car from '../models/Car.js';
import Booking from '../models/Booking.js';
import cloudinary from '../config/cloudinary.js';
import ApiFeatures from '../utils/apiFeatures.js';

/**
 * @desc    Get all cars with filters, search, sort, pagination
 * @route   GET /api/cars
 * @access  Public
 */
export const getCars = async (req, res, next) => {
  try {
    // Build filter object
    const filterObj = { isAvailable: true };

    if (req.query.category) filterObj.category = req.query.category;
    if (req.query.fuelType) filterObj.fuelType = req.query.fuelType;
    if (req.query.transmission) filterObj.transmission = req.query.transmission;
    if (req.query.seats) filterObj.seats = parseInt(req.query.seats, 10);
    if (req.query.minPrice || req.query.maxPrice) {
      filterObj.pricePerDay = {};
      if (req.query.minPrice) filterObj.pricePerDay.$gte = parseFloat(req.query.minPrice);
      if (req.query.maxPrice) filterObj.pricePerDay.$lte = parseFloat(req.query.maxPrice);
    }
    if (req.query.location) {
      filterObj.location = { $regex: req.query.location, $options: 'i' };
    }

    // Count total documents matching filter
    let countQuery = Car.find(filterObj);
    if (req.query.keyword) {
      countQuery = countQuery.find({
        $or: [
          { title: { $regex: req.query.keyword, $options: 'i' } },
          { brand: { $regex: req.query.keyword, $options: 'i' } },
          { model: { $regex: req.query.keyword, $options: 'i' } },
          { location: { $regex: req.query.keyword, $options: 'i' } },
        ],
      });
    }
    const total = await countQuery.countDocuments();

    // Build query with features
    const features = new ApiFeatures(Car.find(filterObj).populate('owner', 'name avatar'), req.query)
      .search()
      .sort()
      .paginate();

    const cars = await features.query.lean();

    res.json({
      cars,
      total,
      page: features.pagination.page,
      pages: Math.ceil(total / features.pagination.limit),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single car by ID
 * @route   GET /api/cars/:id
 * @access  Public
 */
export const getCarById = async (req, res, next) => {
  try {
    const car = await Car.findById(req.params.id).populate('owner', 'name avatar phone');
    if (!car) {
      return res.status(404).json({ message: 'Car not found.' });
    }
    res.json({ car });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get booked dates for a car
 * @route   GET /api/cars/:id/booked-dates
 * @access  Public
 */
export const getBookedDates = async (req, res, next) => {
  try {
    const bookings = await Booking.find({
      car: req.params.id,
      status: { $in: ['pending', 'confirmed', 'ongoing'] },
    }).select('startDate endDate').lean();

    // Return exact date ranges
    const bookedDates = bookings.map(b => ({
      start: b.startDate,
      end: b.endDate
    }));

    res.json({ bookedDates });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new car listing
 * @route   POST /api/cars
 * @access  Owner
 */
export const createCar = async (req, res, next) => {
  try {
    const carData = {
      ...req.body,
      owner: req.user._id,
    };

    // Handle uploaded images
    if (req.files && req.files.length > 0) {
      carData.images = req.files.map((file) => ({
        url: file.path,
        public_id: file.filename,
      }));
    }

    const car = await Car.create(carData);
    res.status(201).json({ message: 'Car listed successfully.', car });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a car listing
 * @route   PUT /api/cars/:id
 * @access  Owner (own car only)
 */
export const updateCar = async (req, res, next) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) {
      return res.status(404).json({ message: 'Car not found.' });
    }

    // Only the owner can update
    if (car.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this car.' });
    }

    const updatedCar = await Car.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({ message: 'Car updated successfully.', car: updatedCar });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a car listing
 * @route   DELETE /api/cars/:id
 * @access  Owner (own car) or Admin
 */
export const deleteCar = async (req, res, next) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) {
      return res.status(404).json({ message: 'Car not found.' });
    }

    // Check authorization
    if (req.user.role !== 'admin' && car.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this car.' });
    }

    // Check for active bookings
    const activeBookings = await Booking.countDocuments({
      car: car._id,
      status: { $in: ['confirmed', 'ongoing'] },
    });

    if (activeBookings > 0) {
      return res.status(400).json({ message: 'Cannot delete car with active or ongoing bookings.' });
    }

    // Delete images from Cloudinary
    for (const image of car.images) {
      if (image.public_id) {
        await cloudinary.uploader.destroy(image.public_id);
      }
    }

    await Car.findByIdAndDelete(req.params.id);
    res.json({ message: 'Car deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add images to a car
 * @route   POST /api/cars/:id/images
 * @access  Owner
 */
export const addCarImages = async (req, res, next) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) {
      return res.status(404).json({ message: 'Car not found.' });
    }

    if (car.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized.' });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No images uploaded.' });
    }

    if (car.images.length + req.files.length > 8) {
      return res.status(400).json({ message: 'Maximum 8 images allowed.' });
    }

    const newImages = req.files.map((file) => ({
      url: file.path,
      public_id: file.filename,
    }));

    car.images.push(...newImages);
    await car.save();

    res.json({ message: 'Images added successfully.', images: car.images });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete an image from a car
 * @route   DELETE /api/cars/:id/images/:publicId
 * @access  Owner
 */
export const deleteCarImage = async (req, res, next) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) {
      return res.status(404).json({ message: 'Car not found.' });
    }

    if (car.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized.' });
    }

    const publicId = req.params.publicId;
    const imageIndex = car.images.findIndex((img) => img.public_id === publicId);

    if (imageIndex === -1) {
      return res.status(404).json({ message: 'Image not found.' });
    }

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(publicId);

    // Remove from car
    car.images.splice(imageIndex, 1);
    await car.save();

    res.json({ message: 'Image deleted successfully.', images: car.images });
  } catch (error) {
    next(error);
  }
};
