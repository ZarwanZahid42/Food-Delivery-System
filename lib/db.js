import mongoose from 'mongoose';

// Use your actual URI from .env.local
const uri = process.env.MONGODB_URI;

export default async function connectDB() {
  if (mongoose.connection.readyState === 1) {
    return mongoose;
  }
  
  try {
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB');
    return mongoose;
  } catch (error) {
    console.error('❌ MongoDB Error:', error.message);
    throw error;
  }
}