import Wishlist from '../models/Wishlist.js';

/**
 * @desc    Get user's wishlist
 * @route   GET /api/wishlist
 * @access  User
 */
export const getWishlist = async (req, res, next) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user._id }).populate({
      path: 'cars',
      select: 'title brand model images pricePerDay location averageRating totalReviews isAvailable',
      populate: { path: 'owner', select: 'name' },
    });

    if (!wishlist) {
      wishlist = { cars: [] };
    }

    res.json({ wishlist: wishlist.cars });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add car to wishlist
 * @route   POST /api/wishlist/:carId
 * @access  User
 */
export const addToWishlist = async (req, res, next) => {
  try {
    const { carId } = req.params;

    let wishlist = await Wishlist.findOne({ user: req.user._id });

    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user._id, cars: [carId] });
    } else {
      if (wishlist.cars.includes(carId)) {
        return res.status(400).json({ message: 'Car already in wishlist.' });
      }
      wishlist.cars.push(carId);
      await wishlist.save();
    }

    res.json({ message: 'Added to wishlist.' });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Remove car from wishlist
 * @route   DELETE /api/wishlist/:carId
 * @access  User
 */
export const removeFromWishlist = async (req, res, next) => {
  try {
    const { carId } = req.params;

    const wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found.' });
    }

    wishlist.cars = wishlist.cars.filter((id) => id.toString() !== carId);
    await wishlist.save();

    res.json({ message: 'Removed from wishlist.' });
  } catch (error) {
    next(error);
  }
};
