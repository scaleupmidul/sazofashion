import mongoose from 'mongoose';
import 'dotenv/config';

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This is essential for serverless environments.
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  if (cached.conn) {
    // Use existing database connection
    return cached.conn;
  }

  if (!cached.promise) {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!mongoUri) {
      console.warn('CRITICAL: MONGO_URI or MONGODB_URI is not defined in environment variables. Backend will run in MOCK MODE.');
      return null;
    }

    // OPTIMIZATION for Serverless (Vercel):
    // 1. maxPoolSize: 1 -> CRITICAL. Prevents creating too many connections on cold starts.
    // 2. bufferCommands: true -> Allows Mongoose to queue commands while connecting (prevents startup crashes).
    const opts = {
      bufferCommands: true, 
      maxPoolSize: 1, 
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };
    
    cached.promise = mongoose.connect(mongoUri, opts).then((mongoose) => {
      console.log(`MongoDB Connected: ${mongoose.connection.host}`);
      return mongoose;
    }).catch(err => {
        console.error(`Error connecting to MongoDB: ${err.message}`);
        // Reset promise on error to allow retry
        cached.promise = null; 
        throw err;
    });
  }
  
  try {
    const connection = await cached.promise;
    cached.conn = connection;
    return connection;
  } catch (e) {
    console.error(`MongoDB persistent connection error: ${e.message}`);
    cached.promise = null;
    return null; // Return null instead of throwing to allow middleware to handle it
  }
};

export default connectDB;