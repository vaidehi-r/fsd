import cron from 'node-cron';
import Booking from '../models/Booking.js';

/**
 * Hourly cron job to update booking statuses:
 * - confirmed → ongoing (if startDate <= now)
 * - ongoing → completed (if endDate < now)
 */
const updateBookingStatuses = async () => {
  console.log('Running automatic booking status check...');
  const now = new Date();

  try {
    // Move confirmed bookings to ongoing
    const toOngoing = await Booking.updateMany(
      {
        status: 'confirmed',
        startDate: { $lte: now },
      },
      { status: 'ongoing' }
    );
    if (toOngoing.modifiedCount > 0) {
      console.log(`  -> ${toOngoing.modifiedCount} bookings set to ongoing`);
    }

    // Move ongoing bookings to completed (with deposit)
    const toCompletedWithDeposit = await Booking.updateMany(
      { status: 'ongoing', endDate: { $lt: now }, damageDeposit: { $gt: 0 } },
      { status: 'completed', depositRefundStatus: 'pending' }
    );
    
    // Move ongoing bookings to completed (no deposit)
    const toCompletedWithoutDeposit = await Booking.updateMany(
      { status: 'ongoing', endDate: { $lt: now }, damageDeposit: { $lte: 0 } },
      { status: 'completed', depositRefundStatus: 'none' }
    );

    const totalCompleted = toCompletedWithDeposit.modifiedCount + toCompletedWithoutDeposit.modifiedCount;
    if (totalCompleted > 0) {
      console.log(`  -> ${totalCompleted} bookings set to completed (${toCompletedWithDeposit.modifiedCount} pending deposit refunds)`);
    }
  } catch (error) {
    console.error('Booking status update error:', error.message);
  }
};

// 1. Schedule to run every hour
cron.schedule('0 * * * *', updateBookingStatuses);

// 2. ALSO run it immediately every time the backend server turns on!
// This guarantees that if the server was offline exactly at midnight, 
// it will still update old bookings the exact second you boot it up.
updateBookingStatuses();

console.log('Booking status checking mechanism initialized');
