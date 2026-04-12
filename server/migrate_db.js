import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const result = await mongoose.connection.db.collection('users').updateMany(
    { fullName: { $exists: true } },
    { $rename: { 'fullName': 'name' } }
  );
  console.log('Migrated DB Users:', result.modifiedCount);
  process.exit(0);
}
run();
