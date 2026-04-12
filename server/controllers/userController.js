import User from '../models/User.js';
import cloudinary from '../config/cloudinary.js';

/**
 * @desc    Get user profile
 * @route   GET /api/user/profile
 * @access  Auth
 */
export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ user });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user profile (name, phone)
 * @route   PUT /api/user/profile
 * @access  Auth
 */
export const updateProfile = async (req, res, next) => {
  try {
    const { name, phone } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone },
      { new: true, runValidators: true }
    );

    res.json({ message: 'Profile updated.', user });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update avatar
 * @route   PUT /api/user/avatar
 * @access  Auth
 */
export const updateAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image uploaded.' });
    }

    const user = await User.findById(req.user._id);

    // Delete old avatar from Cloudinary if exists
    if (user.avatar?.public_id) {
      await cloudinary.uploader.destroy(user.avatar.public_id);
    }

    user.avatar = {
      url: req.file.path,
      public_id: req.file.filename,
    };
    await user.save();

    res.json({ message: 'Avatar updated.', user });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Change password
 * @route   PUT /api/user/change-password
 * @access  Auth
 */
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select('+password');

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect.' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully.' });
  } catch (error) {
    next(error);
  }
};
