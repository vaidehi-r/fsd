import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

async function test() {
  await mongoose.connect(process.env.MONGO_URI);
  const User = (await import('./models/User.js')).default;
  const user = await User.findById('69c881e027913a544fd27414').lean();
  console.log(JSON.stringify(user, null, 2));
  process.exit(0);
}
test();
