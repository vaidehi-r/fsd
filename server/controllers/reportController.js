import Report from '../models/Report.js';

/**
 * @desc    Submit a car report
 * @route   POST /api/reports
 * @access  User
 */
export const createReport = async (req, res, next) => {
  try {
    const { carId, reason, description } = req.body;

    const report = await Report.create({
      reporter: req.user._id,
      car: carId,
      reason,
      description,
    });

    res.status(201).json({ message: 'Report submitted.', report });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all reports (admin)
 * @route   GET /api/reports
 * @access  Admin
 */
export const getReports = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const total = await Report.countDocuments(filter);
    const reports = await Report.find(filter)
      .populate('reporter', 'name email')
      .populate('car', 'title images owner')
      .populate('resolvedBy', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean();

    res.json({
      reports,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Resolve a report
 * @route   PUT /api/reports/:id/resolve
 * @access  Admin
 */
export const resolveReport = async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ message: 'Report not found.' });
    }

    report.status = 'resolved';
    report.resolvedBy = req.user._id;
    await report.save();

    res.json({ message: 'Report resolved.', report });
  } catch (error) {
    next(error);
  }
};
