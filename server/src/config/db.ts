import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const url = process.env.MONGO_URL;

    if (!url) {
      throw new Error('MONGO_URL is not defined in .env');
    }

    await mongoose.connect(url);

    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};
