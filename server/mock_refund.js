import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const Booking = (await import('./models/Booking.js')).default;
  
  // Find a booking to update
  const booking = await Booking.findOne({ status: 'completed' });
  if (booking) {
    if (!booking.damageDeposit) {
      booking.damageDeposit = 5000;
    }
    booking.depositRefundStatus = 'pending';
    await booking.save();
    console.log('Successfully mocked pending refund on booking:', booking._id);
  } else {
    console.log('No completed booking found to mock.');
  }
  process.exit(0);
}
run();
