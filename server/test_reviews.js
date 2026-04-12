import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
import Review from './models/Review.js';
import User from './models/User.js'; // Ensure User is loaded

async function test() {
  await mongoose.connect(process.env.MONGO_URI);
  const reviews = await Review.find().populate('user', 'name avatar').lean();
  console.log(JSON.stringify(reviews, null, 2));
  process.exit(0);
}
test();
